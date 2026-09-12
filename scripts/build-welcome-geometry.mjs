// Bake the landing demonstration from the actual tag model; no browser CAD work.
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { bakeHalfPrintedTag, halfPrintedFallback } from './welcome-infill.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = await mkdtemp(path.join(tmpdir(), 'liqu3d-geometry-'));
const run = promisify(execFile);
const names = ['Jordan', 'Taylor', 'Morgan'];
const colors = [
  ['#F19CBB', '#FFFFFF', '#0C2340'],
  ['#96DCB9', '#FFFFFF', '#0C2340'],
  ['#0C2340', '#A8C6EE', '#FFFFFF']
];
const samples = [
  ...names.map((name, index) => ({ name, id: name, font: 'Baloo 2:style=ExtraBold', colors: colors[index] })),
  { name: 'Taylor', id: 'TaylorSerif', font: 'Liberation Serif:style=Bold', colors: colors[1] },
  { name: 'Morgan', id: 'MorganMono', font: 'Liberation Mono:style=Bold', colors: colors[2] }
];
const parts = ['base', 'shadow', 'text'];
const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

function packMesh(data) {
  const positions = [], indices = [], vertices = new Map();
  const count = data.readUInt32LE(80);
  for (let triangle = 0; triangle < count; triangle++) {
    const offset = 84 + triangle * 50;
    // Split flat faces from sidewalls, retaining crisp layer edges and smooth curves.
    const normalZ = data.readFloatLE(offset + 8);
    const face = Math.abs(normalZ) > .5 ? Math.sign(normalZ) : 0;
    for (let corner = 0; corner < 3; corner++) {
      const point = Array.from({ length: 3 }, (_, axis) => data.readFloatLE(offset + 12 + corner * 12 + axis * 4));
      const key = point.map(value => value.toFixed(5)).join(',') + ':' + face;
      if (!vertices.has(key)) { vertices.set(key, positions.length / 3); positions.push(...point); }
      indices.push(vertices.get(key));
    }
  }
  if (vertices.size > 65535 || positions.some(value => Math.abs(value * 256) > 32767)) throw new Error('Geometry exceeds packed bounds');
  return {
    positions: Buffer.from(new Int16Array(positions.map(value => Math.round(value * 256))).buffer).toString('base64'),
    indices: Buffer.from(new Uint16Array(indices).buffer).toString('base64')
  };
}

try {
  await writeFile(path.join(scratch, 'fonts.conf'), `<fontconfig><dir>${xml(path.join(root, 'fonts/bundled'))}</dir><cachedir>${xml(scratch)}/cache</cachedir></fontconfig>`);
  const env = { ...process.env, FONTCONFIG_FILE: path.join(scratch, 'fonts.conf'), OPENSCAD_FONT_PATH: path.join(root, 'fonts/bundled') };
  const source = await readFile(path.join(root, 'models/model.scad'), 'utf8');
  await writeFile(path.join(scratch, 'outline.scad'), source.replace(/\/\/ GENERATED RENDER BLOCK START[\s\S]*?\/\/ GENERATED RENDER BLOCK END/, 'projection() selected_part(1);'));
  const designs = [];
  const definitions = [];
  const jordanOutlines = [];
  for (const [designIndex, sample] of samples.entries()) {
    const { name, id, font, colors: sampleColors } = sample;
    const layers = {};
    const paths = [];
    const overrides = ['-D', '$fn=48', '--enable', 'textmetrics', '--backend', 'Manifold', '-D', 'render_design="design_1"', '-D', `design1_name_text="${name}"`, '-D', `design1_font_preset="${font}"`];
    for (const [partIndex, part] of parts.entries()) {
      const target = path.join(scratch, `${id}-${part}`);
      const args = [...overrides, '-D', `render_part="${part}"`];
      await run(process.env.OPENSCAD_BIN || 'openscad', [...args, '--export-format', 'binstl', '-o', `${target}.stl`, path.join(root, 'models/model.scad')], { env, maxBuffer: 1024 * 1024 });
      layers[part] = packMesh(await readFile(`${target}.stl`));
      await run(process.env.OPENSCAD_BIN || 'openscad', [...args, '-o', `${target}.svg`, path.join(scratch, 'outline.scad')], { env, maxBuffer: 1024 * 1024 });
      const svg = await readFile(`${target}.svg`, 'utf8');
      const outline = [...svg.matchAll(/<path\s+d="([\s\S]*?)"/g)].map(match => match[1].replace(/\s+/g, ' ')).join(' ');
      if (!outline) throw new Error(`Missing ${name} ${part} outline`);
      if (designIndex === 0) jordanOutlines.push(outline);
      paths.push(`<path fill="${sampleColors[partIndex]}" fill-rule="evenodd" d="${outline}"/>`);
    }
    designs.push({ name, font, colors: sampleColors, layers });
    definitions.push(`<g id="fallback${id}">${paths.join('')}</g>`);
    console.log(`Baked ${name} in ${font}.`);
  }
  const halfPrintedTag = bakeHalfPrintedTag(jordanOutlines);
  await writeFile(path.join(root, 'public/welcome-tag-geometry.js'), '// Generated from models/model.scad with bundled Baloo 2 and Liberation fonts; millimeters.\n// Rebuild: node scripts/build-welcome-geometry.mjs (requires OpenSCAD with textmetrics).\nexport const tagDesigns = ' + JSON.stringify(designs.slice(0, names.length)) + ';\nexport const fontDesigns = ' + JSON.stringify(designs.slice(names.length)) + ';\nexport const halfPrintedTag = ' + JSON.stringify(halfPrintedTag) + ';\n');
  const htmlPath = path.join(root, 'public/welcome.html');
  const html = await readFile(htmlPath, 'utf8');
  await writeFile(htmlPath, html.replace(/<!-- TAG OUTLINES START -->[\s\S]*?<!-- TAG OUTLINES END -->/, `<!-- TAG OUTLINES START -->\n${definitions.join('\n')}\n${halfPrintedFallback(jordanOutlines)}\n<!-- TAG OUTLINES END -->`));
  console.log(`Baked ${designs.length} authentic three-layer tags and matching SVG outlines.`);
} finally {
  await rm(scratch, { recursive: true, force: true });
}
