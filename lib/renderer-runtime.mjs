import { materializeAssets, verifyFonts, assetPath } from './instant-assets.mjs';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

process.umask(0o077);

const OPENSCAD_BIN = process.env.OPENSCAD_BIN || 'openscad';
const CUSTOM_FONT_DIR = process.env.CUSTOM_FONT_DIR || '/fonts';
const FONTCONFIG_DIR = path.join(os.tmpdir(), 'pmm-fontconfig');
const TIMEOUT_MS = 600_000;
const MAX_OUTPUT = 256 * 1024 ** 2;
function subprocessEnvironment(extra = {}) {
  return { PATH: process.env.PATH, HOME: '/tmp', TMPDIR: '/tmp', XDG_CACHE_HOME: '/tmp/cache', QT_QPA_PLATFORM: 'offscreen', ...extra };
}

function safeScadName(value) {
  const base = path.basename(String(value || 'model.scad')).replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return (/\.scad$/i.test(base) ? base : `${base || 'model'}.scad`).slice(0, 180);
}

function commandExists(command) {
  const paths = String(process.env.PATH || '').split(path.delimiter);
  return paths.some((dir) => dir && fsSync.existsSync(path.join(dir, command)));
}

async function ensureFontConfig() {
  const cacheDir = path.join(FONTCONFIG_DIR, 'cache');
  await fs.mkdir(cacheDir, { recursive: true });
  const config = path.join(FONTCONFIG_DIR, 'fonts.conf');
  const escape = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  await fs.writeFile(config, `<?xml version="1.0"?>\n<fontconfig>\n  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>\n  <dir>${escape(CUSTOM_FONT_DIR)}</dir>\n  <cachedir>${escape(cacheDir)}</cachedir>\n</fontconfig>\n`);
  return subprocessEnvironment({ OPENSCAD_FONT_PATH: CUSTOM_FONT_DIR, FONTCONFIG_FILE: config });
}

async function readOutput(file, limit) {
  const handle = await fs.open(file, fsSync.constants.O_RDONLY | fsSync.constants.O_NOFOLLOW | fsSync.constants.O_NONBLOCK);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > limit) throw new Error('Rendered output exceeds the size limit or is not a regular file.');
    const bytes = Buffer.alloc(stat.size);
    let offset = 0;
    while (offset < bytes.length) {
      const { bytesRead } = await handle.read(bytes, offset, bytes.length - offset, offset);
      if (!bytesRead) throw new Error('Incomplete rendered output.');
      offset += bytesRead;
    }
    if ((await handle.stat()).size !== bytes.length) throw new Error('Rendered output changed while being read.');
    return bytes;
  } finally { await handle.close(); }
}
async function capture(command, args) {
  try { return (await runProcess(command, args, { env: subprocessEnvironment(), timeout: 10_000, capture: true })).trim(); }
  catch { return null; }
}
async function runProcess(command, args, { cwd, env, timeout = TIMEOUT_MS, background = false, capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, detached: process.platform !== 'win32', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    if (background && Number.isInteger(child.pid)) { try { os.setPriority(child.pid, 5); } catch {} }
    let stderr = '', stdout = '', failure;
    const timer = setTimeout(() => {
      failure = new Error('OpenSCAD rendering timed out.');
      try { process.kill(process.platform === 'win32' ? child.pid : -child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
    }, timeout);
    child.stdout.on('data', chunk => { if (capture) stdout = (stdout + chunk).slice(-200_000); });
    child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-40_000); });
    child.once('error', error => { failure = error; });
    child.once('close', code => {
      clearTimeout(timer);
      if (failure) reject(failure);
      else if (code === 0 && !/\bERROR\b/i.test(stderr)) resolve(capture ? stdout + stderr : stderr);
      else reject(Object.assign(new Error(stderr.trim() || `Renderer exited with code ${code}.`), {status:422}));
    });
  });
}

let capabilityPromise;
export async function capabilities({ probe = false } = {}) {
  // Generated from this image's OpenSCAD at build time. The manager still runs
  // a fresh smoke test on startup; ordinary jobs need only their actual render.
  if (!probe && !capabilityPromise) {
    try {
      const saved = JSON.parse(await fs.readFile(new URL('../renderer-capabilities.json', import.meta.url), 'utf8'));
      if (saved.ready === true && saved.manifoldBackend === true && saved.backendFlag === true && typeof saved.version === 'string') return saved;
    } catch {} // Development/test runtimes probe their installed executable.
  }
  capabilityPromise ||= (async () => {
    const version = await capture(OPENSCAD_BIN, ['--version']);
    const help = await capture(OPENSCAD_BIN, ['--help']);
    if (version === null || help === null) return { ready: false, version: null, error: 'OpenSCAD executable is unavailable.' };
    const enableTextmetrics = /--enable\b/.test(help) && /textmetrics/i.test(help);
    const enableLazyUnion = /--enable\b/.test(help) && /lazy-union/i.test(help);
    const backendFlag = /--backend\b/i.test(help);
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-renderer-probe-'));
    try {
      const scad = path.join(dir, 'probe.scad');
      const out = path.join(dir, 'probe.stl');
      await fs.writeFile(scad, 'cube([1,1,1]);\n');
      const args = [];
      if (backendFlag) args.push('--backend', 'Manifold');
      args.push('--export-format', 'binstl', '-o', out, scad);
      if (!backendFlag) throw new Error('Unsupported OpenSCAD runtime: Manifold backend support is required. Install the current development build.');
      await runProcess(OPENSCAD_BIN, args, { cwd: dir, env: await ensureFontConfig(), timeout: 30_000 });
      const stat = await fs.stat(out);
      if (stat.size <= 84) throw new Error('OpenSCAD Manifold smoke render produced an empty STL.');
      return { ready: true, version, enableTextmetrics, enableLazyUnion, backendFlag: true, manifoldBackend: true, smokeError: '' };
    } catch (error) {
      return { ready: false, version, enableTextmetrics, enableLazyUnion, backendFlag, manifoldBackend: false, error: String(error.message || error) };
    } finally {
      await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  })();
  return capabilityPromise;
}

function validateDefinitions(value) {
  if (!Array.isArray(value) || value.length > 512 || value.some((item) => typeof item !== 'string' || item.length > 32_768 || item.includes('\u0000'))) {
    const error = new Error('Invalid OpenSCAD definitions.');
    error.status = 400;
    throw error;
  }
  return value;
}

export async function render(body) {
  const caps = await capabilities();
  if (!caps.ready) {
    const error = new Error(caps.error || 'OpenSCAD is unavailable.');
    error.status = 503;
    throw error;
  }
  const format = String(body.format || 'stl').toLowerCase();
  if (!['stl', '3mf'].includes(format)) {
    const error = new Error('Unsupported renderer format.'); error.status = 400; throw error;
  }
  const source = typeof body.source === 'string' ? body.source : '';
  if (!source.trim() || Buffer.byteLength(source) > 8 * 1024 * 1024 || source.includes('\u0000')) {
    const error = new Error('Invalid SCAD source.'); error.status = 400; throw error;
  }
  const definitions = validateDefinitions(body.definitions || []);
  if (body.enableLazyUnion && format !== '3mf' && !caps.enableLazyUnion) {
    const error = new Error('This render requires an OpenSCAD build with lazy-union support.'); error.status = 422; throw error;
  }
  const dir = await fs.mkdtemp(path.join(process.env.PMM_JOB_ROOT || '/job', 'pmm-render-'));
  try {
    let fontEnv = await ensureFontConfig();
    if (body.dependencies) fontEnv = await materializeAssets(dir, body.dependencies, fontEnv, { exclusiveFonts:body.frozenFonts===true });
    const scadPath = path.join(dir, body.dependencies ? assetPath(body.packageEntry || body.sourceName) : safeScadName(body.sourceName));
    await fs.mkdir(path.dirname(scadPath), { recursive: true });
    if (body.dependencies) await verifyFonts(source, body.values || {}, fontEnv);
    const outputDir = await fs.mkdtemp(path.join(dir, '.output-'));
    const outPath = path.join(outputDir, `model.${format}`);
    await fs.writeFile(scadPath, source, 'utf8');
    const args = [];
    if (caps.enableTextmetrics) args.push('--enable', 'textmetrics');
    // Lazy-union 3MF output can reuse the first mesh's colour indices across
    // later meshes. Standard Manifold export preserves every part's colours.
    if (body.enableLazyUnion && format !== '3mf') args.push('--enable', 'lazy-union');
    args.push('--backend', 'Manifold');
    if (format === 'stl') args.push('--export-format', 'binstl');
    args.push('-o', outPath);
    for (const definition of definitions) args.push('-D', definition);
    args.push(scadPath);
    try {
      const stderr = await runProcess(OPENSCAD_BIN, args, { cwd: path.dirname(scadPath), env: fontEnv, background: Boolean(body.background) });
      if (body.dependencies && /(?:can(?:not|'t)|could not) (?:open|find)|unable to (?:open|load)/i.test(stderr)) throw new Error(stderr);
      if (/top level object is empty|no top level geometry|nothing to render/i.test(stderr) && body.allowEmpty) return Buffer.alloc(0);
    } catch (error) {
      if (body.allowEmpty && /top level object is empty|no top level geometry|nothing to render/i.test(String(error.message))
        && !/\bERROR\b|(?:can(?:not|'t)|could not) (?:open|find)|unable to (?:open|load)/i.test(String(error.message))) return Buffer.alloc(0);
      throw error;
    }
    let output;
    try { output = await readOutput(outPath, MAX_OUTPUT); }
    catch (error) {
      if (body.allowEmpty && error?.code === 'ENOENT') return Buffer.alloc(0);
      throw error;
    }
    return output;
  } catch (error) {
    if (body.dependencies && !error.code) error.status ||= 422;
    throw error;
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function findImageMagick() {
  for (const bin of ['magick', 'convert']) if (commandExists(bin)) return bin;
  return null;
}

export async function thumbnail(body) {
  const caps = await capabilities();
  if (!caps.ready) { const error = new Error(caps.error || 'OpenSCAD is unavailable.'); error.status = 503; throw error; }
  const accent = /^#[0-9a-f]{6}$/i.test(String(body.accent || '')) ? String(body.accent) : '#00ae42';
  let stl;
  try { stl = Buffer.from(String(body.stlBase64 || ''), 'base64'); } catch { stl = Buffer.alloc(0); }
  if (stl.length < 84 || stl.length > 64 * 1024 * 1024) { const error = new Error('Invalid STL preview payload.'); error.status = 400; throw error; }
  const imageMagick = await findImageMagick();
  if (!imageMagick) { const error = new Error('ImageMagick is unavailable.'); error.status = 503; throw error; }
  const dir = await fs.mkdtemp(path.join(process.env.PMM_JOB_ROOT || '/job', 'pmm-thumb-'));
  try {
    const stlPath = path.join(dir, 'model.stl');
    const wrapperPath = path.join(dir, 'preview.scad');
    const pngPath = path.join(dir, 'preview.png');
    const webpPath = path.join(dir, 'preview.webp');
    await fs.writeFile(stlPath, stl);
    await fs.writeFile(wrapperPath, `color("${accent}") import("model.stl", convexity=10);\n`, 'utf8');
    const args = [];
    if (caps.enableTextmetrics) args.push('--enable', 'textmetrics');
    args.push('--imgsize=560,328', '--viewall', '--autocenter', '--projection=ortho', '-o', pngPath, wrapperPath);
    const env = await ensureFontConfig();
    if (process.platform !== 'win32' && commandExists('xvfb-run')) await runProcess('xvfb-run', ['-a', OPENSCAD_BIN, ...args], { cwd: dir, env });
    else await runProcess(OPENSCAD_BIN, args, { cwd: dir, env });
    await runProcess(imageMagick, [pngPath, '-fuzz', '6%', '-transparent', '#ffffe5', '-trim', '+repage', '-bordercolor', 'none', '-border', '30x24', '-resize', '480x296', '-gravity', 'center', '-background', 'none', '-extent', '640x374', '-quality', '72', webpPath], { cwd: dir, env, timeout: 30_000 });
    const output = await readOutput(webpPath, 8 * 1024 ** 2);
    if (!output.length) throw new Error('Workspace thumbnail output is invalid.');
    return output;
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
