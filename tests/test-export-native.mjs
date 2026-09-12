import './setup.mjs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { parseScadParameters, valueToScad } from '../lib/parser.mjs';
import { renderSolidParts } from '../lib/solid-parts.mjs';
import { unzipSync, strFromU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import assert from 'node:assert/strict';
import { DOMParser } from '@xmldom/xmldom';
import { readSolid3mf } from '../public/solid-3mf.js';

const execute = promisify(execFile);
if (!process.env.PMM_EXPORT_WORKSPACE_ID) {
  console.log('Native workspace export benchmark skipped (set PMM_EXPORT_WORKSPACE_ID to run it).');
  process.exit(0);
}
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-export-native-'));
try {
  const db = new DatabaseSync(path.join(process.env.PMM_DATA_DIR || 'data', 'accounts.sqlite'), { readOnly: true });
  const saved = db.prepare('SELECT data_json FROM workspaces WHERE id=?').get(process.env.PMM_EXPORT_WORKSPACE_ID);
  db.close();
  if (!saved) throw new Error('Set PMM_EXPORT_WORKSPACE_ID to a workspace to benchmark without changing it.');
  const plate = JSON.parse(saved.data_json).plates[0];
  const parts = ['base', 'tag_shadow', 'tag_text'];
  const definitions = parseScadParameters(plate.source).filter((parameter) => Object.hasOwn(plate.values, parameter.name)).map((parameter) => `${parameter.name}=${valueToScad(plate.values[parameter.name], parameter)}`);
  definitions.push('export_single_design=1');
  await fs.writeFile(path.join(directory, 'original.scad'), plate.source);
  const run = async (source, output, additional = []) => {
    const started = performance.now();
    await execute(process.env.OPENSCAD_BIN || 'openscad', [
      '--enable', 'textmetrics', '--backend', 'Manifold', '-o', path.join(directory, output),
      ...[...definitions, ...additional].flatMap((definition) => ['-D', definition]), path.join(directory, source)
    ], { timeout: 120000, maxBuffer: 200000, env: { ...process.env, OPENSCAD_FONT_PATH: path.resolve('fonts/custom'), FONTCONFIG_FILE: path.resolve('cache/fontconfig/fonts.conf') } });
    console.log(`${output}: ${Math.round(performance.now() - started)} ms`);
  };
  const batchBytes = await renderSolidParts(parts, async part => {
    const output = `batched-${part}.3mf`;
    await run('original.scad', output, [`render_part=${JSON.stringify(part)}`]);
    return fs.readFile(path.join(directory, output));
  }, { concurrency: 3 });
  await fs.writeFile(path.join(directory, 'batch.3mf'), batchBytes);
  await Promise.all(parts.map((part) => run('original.scad', `${part}.3mf`, [`render_part=${JSON.stringify(part)}`])));
  for (const name of ['batch', ...parts]) {
    const files = unzipSync(new Uint8Array(await fs.readFile(path.join(directory, `${name}.3mf`))));
    const xml = strFromU8(files['3D/3dmodel.model']);
    console.log(`${name}: ${[...xml.matchAll(/<mesh>/g)].length} meshes, ${[...xml.matchAll(/<triangle\s/g)].length} triangles`);
  }
  const read = async (name) => readSolid3mf(await fs.readFile(path.join(directory, `${name}.3mf`)), (xml) => new DOMParser().parseFromString(xml, 'application/xml'));
  const batch = await read('batch');
  const signature = (solid) => {
    const position = solid.geometry.attributes.position;
    const indices = solid.geometry.index.array;
    const result = [];
    for (let index = 0; index < indices.length; index += 3) {
      const vertices = Array.from(indices.slice(index, index + 3), (vertex) => [position.getX(vertex), position.getY(vertex), position.getZ(vertex)].map((value) => Math.round(value * 1e6) / 1e6).join(','));
      result.push(`${vertices.sort().join(';')}:${solid.colors[index / 3]}`);
    }
    return result.sort();
  };
  for (const [index, part] of parts.entries()) assert.deepEqual(signature(batch[index]), signature((await read(part))[0]), `Batched ${part} must preserve every original triangle and colour`);
  console.log('Every batched triangle and colour matches the independent full-quality exports.');
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
