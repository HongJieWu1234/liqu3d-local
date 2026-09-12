import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execute = promisify(execFile);
import os from 'node:os';
import { assetPath, uniquePaths, decodeBase64, readBoundedZip, uploadLimits } from './instant-archive.mjs';
export { assetPath } from './instant-archive.mjs';
export const assetExtensions = new Set(['.scad', '.stl', '.3mf', '.off', '.amf', '.obj', '.svg', '.dxf', '.png', '.dat', '.txt', '.csv', '.json', '.ttf', '.otf']);
export function normalizeAssets(files, { archives = false } = {}) {
  if (!Array.isArray(files) || !files.length || files.length > uploadLimits.files) throw new Error('Choose up to 200 model and dependency files.');
  const output = []; let total = 0, uploaded = 0;
  for (const file of files) {
    const name = assetPath(file?.path), zip = archives && /\.zip$/i.test(name);
    const bytes = decodeBase64(file.base64, zip ? uploadLimits.archive : uploadLimits.file);
    uploaded += bytes.length;
    if (uploaded > uploadLimits.total) throw new Error('Uploads support 16 MB per folder.');
    const entries = zip ? readBoundedZip(bytes) : [{ path: name, bytes }];
    for (const entry of entries) {
      total += entry.bytes.length;
      if (total > uploadLimits.total || output.length >= uploadLimits.files) throw new Error('Dependencies support 200 files and 16 MB per folder.');
      if (!assetExtensions.has(path.extname(entry.path).toLowerCase())) throw new Error(`Unsupported dependency: ${entry.path}`);
      output.push({ path: entry.path, base64: entry.bytes.toString('base64') });
    }
  }
  if (!output.length) throw new Error('Add a SCAD file and its supported dependencies.');
  uniquePaths(output.map(file => file.path));
  return output;
}
// Quarantine stores opaque request bytes only. Validation finishes before the
// callback can persist a package or enqueue work, and failed uploads are removed.
export async function quarantineUpload(body, accept, root = os.tmpdir()) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid upload request.');
  const bytes = Buffer.from(JSON.stringify(body));
  if (bytes.length > 24 * 1024 ** 2) throw new Error('Upload exceeds the request limit.');
  const dir = await fs.mkdtemp(path.join(root, 'pmm-quarantine-'));
  try {
    await fs.writeFile(path.join(dir, 'upload.json'), bytes, { mode: 0o600, flag: 'wx' });
    const files = body.files?.length ? normalizeAssets(body.files, { archives: true }) : body.files;
    return await accept({ ...body, files });
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
}
export function packageSource(files, entry) {
  const file = files.find(file => file.path === entry);
  if (!file || !/\.scad$/i.test(entry)) throw new Error('Choose the entry SCAD file.');
  const source = Buffer.from(file.base64, 'base64').toString('utf8');
  if (!source.trim() || source.includes('\0')) throw new Error('The entry SCAD must be a text file.');
  return source;
}
export function validateDependencies(files) {
  const names = new Set(files.map(file => file.path));
  for (const file of files.filter(file => /\.scad$/i.test(file.path))) {
    const source = Buffer.from(file.base64, 'base64').toString('utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    const references = [...source.matchAll(/\b(?:include|use)\s*<([^>]+)>/g), ...source.matchAll(/\b(?:import|surface)\s*\(\s*(?:file\s*=\s*)?"([^"\n]+)"/g)];
    for (const match of references) {
      const ref = match[1].replaceAll('\\', '/');
      if (ref.startsWith('/') || /^[a-z]+:/i.test(ref)) throw new Error(`${file.path}: dependencies must use relative paths.`);
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file.path), ref));
      if (target.startsWith('../') || !names.has(target)) throw new Error(`${file.path}: missing dependency ${ref}. Add it with the same folder structure.`);
    }
  }
}
const xml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export async function materializeAssets(dir, files, baseEnv, { exclusiveFonts = false } = {}) {
  files = normalizeAssets(files); validateDependencies(files);
  for (const file of files) {
    const target = path.join(dir, file.path); await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(file.base64, 'base64'));
  }
  const fontDirs = [...new Set(files.filter(file => /\.(ttf|otf)$/i.test(file.path)).map(file => path.join(dir, path.posix.dirname(file.path))))];
  if (!fontDirs.length) return baseEnv;
  const config = path.join(dir, '.instant-fonts.conf');
  await fs.writeFile(config, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>${exclusiveFonts ? '' : baseEnv.FONTCONFIG_FILE ? `<include>${xml(baseEnv.FONTCONFIG_FILE)}</include>` : '<include ignore_missing="yes">/etc/fonts/fonts.conf</include>'}${fontDirs.map(dir => `<dir>${xml(dir)}</dir>`).join('')}<cachedir>${xml(path.join(dir, '.font-cache'))}</cachedir></fontconfig>`);
  return { ...baseEnv, FONTCONFIG_FILE: config, OPENSCAD_FONT_PATH: [...fontDirs, ...(exclusiveFonts ? [] : [baseEnv.OPENSCAD_FONT_PATH])].filter(Boolean).join(path.delimiter) };
}
export async function verifyFonts(source, values, env) {
  const fonts = new Set([...source.matchAll(/\bfont\s*=\s*"([^"\n]+)"/g)].map(match => match[1]));
  for (const [key, value] of Object.entries(values || {})) if (/^font$|_font$/.test(key) && typeof value === 'string') fonts.add(value);
  // Resolve common literal preset branches without requiring a template-specific font list.
  for (const match of source.matchAll(/([A-Za-z_$][\w$]*)\([^)]*\)\s*==\s*"([^"\n]+)"\s*\?\s*"([^"\n]+:style=[^"\n]+)"/g)) {
    if (Object.values(values || {}).includes(match[2])) fonts.add(match[3]);
  }
  for (const font of fonts) {
    let stdout;
    try { ({ stdout } = await execute('fc-match', ['-f', '%{family}', font], { env, timeout: 10_000, maxBuffer: 64 * 1024, killSignal: 'SIGKILL' })); }
    catch (error) { throw new Error(`Cannot verify font ${font}: fontconfig is unavailable.`); }
    const requested = font.split(':')[0].trim().toLowerCase();
    if (!['sans', 'sans-serif', 'serif', 'monospace'].includes(requested) && !stdout.split(',').some(value => value.trim().toLowerCase() === requested)) throw new Error(`Missing font: ${font}. Add its TTF or OTF file.`);
  }
}
