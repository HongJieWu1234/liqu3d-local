import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE_NAME = 'liqu3d';
const skipTop = new Set(['.git', 'node_modules', 'cache']);
const skipExact = new Set(['.env', '.env.cloudflare', '.DS_Store', 'result.json']);

function normalizedRelative(value) {
  return value.split(path.sep).join('/');
}

function allowedPath(relative) {
  const rel = normalizedRelative(relative);
  const [top] = rel.split('/');
  if (skipTop.has(top) || skipExact.has(rel) || path.basename(rel) === '.DS_Store' || rel.endsWith('.zip')) return false;
  if (top === 'data') return rel === 'data' || rel === 'data/.gitkeep';
  if (top === 'secrets') return rel === 'secrets' || rel === 'secrets/README.txt';
  if (rel.startsWith('fonts/custom/')) return rel === 'fonts/custom/.gitkeep';
  if (rel.startsWith('bambu-profiles/BBL/')) return rel === 'bambu-profiles/BBL/.gitkeep';
  return true;
}

async function copyClean(source, destination, relative = '') {
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const rel = relative ? path.join(relative, entry.name) : entry.name;
    if (!allowedPath(rel)) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    const stat = await fs.lstat(sourcePath);
    if (stat.isSymbolicLink()) throw new Error(`Release blocked: symbolic link found at ${normalizedRelative(rel)}.`);
    if (stat.isDirectory()) {
      await fs.mkdir(destinationPath, { recursive: true, mode: 0o755 });
      await copyClean(sourcePath, destinationPath, rel);
    } else if (stat.isFile()) {
      if (/accounts\.sqlite(?:-|$)/i.test(entry.name)) throw new Error(`Release blocked: account database found at ${normalizedRelative(rel)}.`);
      await fs.copyFile(sourcePath, destinationPath);
      await fs.chmod(destinationPath, stat.mode & 0o111 ? 0o755 : 0o644);
    }
  }
}

async function assertCleanRelease(root) {
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = normalizedRelative(path.relative(root, full));
      const stat = await fs.lstat(full);
      if (stat.isSymbolicLink()) throw new Error(`Release blocked: symbolic link found at ${rel}.`);
      if (stat.isDirectory()) { stack.push(full); continue; }
      if (/accounts\.sqlite(?:-|$)/i.test(entry.name)) throw new Error(`Release blocked: account database found at ${rel}.`);
      if (rel.startsWith('secrets/') && rel !== 'secrets/README.txt') throw new Error(`Release blocked: secret file found at ${rel}.`);
      if (rel === '.env' || rel === '.env.cloudflare' || rel.startsWith('node_modules/')) throw new Error(`Release blocked: private/runtime file found at ${rel}.`);
    }
  }
}

export async function makeRelease(outputPath = path.resolve(projectDir, '..', `${RELEASE_NAME}.zip`)) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-release-'));
  const root = path.join(temp, RELEASE_NAME);
  try {
    await fs.mkdir(root, { recursive: true });
    await copyClean(projectDir, root);
    await assertCleanRelease(root);
    await fs.rm(outputPath, { force: true });
    const zip = spawnSync('zip', ['-qr', outputPath, RELEASE_NAME], { cwd: temp, stdio: 'inherit' });
    if (zip.error?.code === 'ENOENT') throw new Error('The zip command is required to create a release archive.');
    if (zip.status !== 0) throw new Error(`zip failed with status ${zip.status}.`);
    const size = (await fs.stat(outputPath)).size;
    if (size < 1024) throw new Error('Release archive is unexpectedly small.');
    return { outputPath, size };
  } finally {
    await fs.rm(temp, { recursive: true, force: true }).catch(() => {});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  const result = await makeRelease(output);
  console.log(`Created clean v1 release: ${result.outputPath} (${result.size} bytes)`);
}
