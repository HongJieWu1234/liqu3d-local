import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Content identity for the exact font directories used by native Fontconfig.
// Recheck metadata on each request; only unchanged file contents reuse a digest.
export function createNativeFontIdentity() {
  const digests = new Map();
  let pending;
  async function digest(file) {
    const before = await fs.stat(file, { bigint: true });
    const version = `${before.dev}:${before.ino}:${before.size}:${before.mtimeNs}:${before.ctimeNs}`;
    const cached = digests.get(file);
    if (cached?.version === version) return cached.hash;
    const hash = createHash('sha256').update(await fs.readFile(file)).digest('hex');
    const after = await fs.stat(file, { bigint: true });
    if (`${after.dev}:${after.ino}:${after.size}:${after.mtimeNs}:${after.ctimeNs}` !== version) throw new Error('Font files changed during reading.');
    digests.set(file, { version, hash });
    return hash;
  }
  return function identity({ binary, config, directories }) {
    const key = JSON.stringify([binary, config, directories]);
    if (pending?.key === key) return pending.promise;
    const promise = (async () => {
      const files = [binary, config], visited = new Set();
      async function walk(directory) {
        const real = await fs.realpath(directory);
        if (visited.has(real)) return;
        visited.add(real);
        for (const entry of await fs.readdir(real, { withFileTypes: true })) {
          const file = path.join(real, entry.name);
          const stat = entry.isSymbolicLink() ? await fs.stat(file) : entry;
          if (stat.isDirectory()) await walk(file);
          else if (/\.(?:ttf|otf|ttc)$/i.test(entry.name)) files.push(file);
        }
      }
      for (const directory of directories) await walk(directory);
      const sorted = [...new Set(files)].sort();
      const manifest = await Promise.all(sorted.map(async file => [file, await digest(file)]));
      for (const file of digests.keys()) if (!sorted.includes(file)) digests.delete(file);
      return `sha256:${createHash('sha256').update(JSON.stringify(manifest)).digest('hex')}`;
    })().catch(() => null).finally(() => { if (pending?.promise === promise) pending = null; });
    pending = { key, promise };
    return promise;
  };
}
