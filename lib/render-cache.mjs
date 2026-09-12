import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

const digest = (value) => createHash('sha256').update(value).digest();
const FILE_PATTERN = /^[a-f0-9]{64}-[a-f0-9]{64}\.bin$/;

export function renderInputCacheKey({ dependencies, ...inputs }) {
  const files = dependencies ? dependencies.map(file => [file.path,
    digest(Buffer.from(file.base64, 'base64')).toString('hex')]).sort(([a], [b]) => a.localeCompare(b)) : null;
  return digest(JSON.stringify({ version: 4, ...inputs, dependencies: files })).toString('hex');
}

export function canCacheRender(source, { dependencies, frozenFonts = false, fontIdentity, noCache = false } = {}) {
  if (noCache) return false;
  // Only supplied dependency bundles are immutable. Live external references
  // and live font lookups must not outlive changes outside the saved inputs.
  // A pinned worker image with no font volume also supplies immutable fonts.
  if (!dependencies && /\b(?:include|use)\s*<|\b(?:import|surface)\s*\(/.test(source)) return false;
  const sources = [source, ...(dependencies || []).filter(file => /\.scad$/i.test(file.path)).map(file => Buffer.from(file.base64, 'base64').toString('utf8'))];
  return frozenFonts || /^sha256:[a-f0-9]{64}$/.test(fontIdentity || '') || !sources.some(text => /\btext\s*\(/.test(text));
}

// Private, disposable geometry only. Source and workspace state stay in SQLite.
export class DiskRenderCache {
  constructor(directory, { maxBytes = 2 * 1024 ** 3, maxEntries = 4096 } = {}) {
    this.directory = directory;
    this.maxBytes = maxBytes;
    this.maxEntries = maxEntries;
    this.entries = new Map();
    this.bytes = 0;
    this.versions = new Map();
    this.generation = 0;
    this.ready = this.initialize();
    this.queue = this.ready.catch(() => {});
  }

  async initialize() {
    await fs.mkdir(this.directory, { recursive: true, mode: 0o700 });
    const files = await fs.readdir(this.directory, { withFileTypes: true });
    const entries = await Promise.all(files.filter((file) => file.isFile() && FILE_PATTERN.test(file.name)).map(async (file) => {
      const stat = await fs.stat(path.join(this.directory, file.name)).catch(() => null);
      return stat ? [file.name, { size: stat.size, touched: stat.mtimeMs }] : null;
    }));
    for (const [name, entry] of entries.filter(Boolean).sort((a, b) => a[1].touched - b[1].touched)) {
      this.entries.set(name, entry);
      this.bytes += entry.size;
    }
    await this.prune();
  }

  filename(owner, key) {
    if (!owner || !/^[a-f0-9]{64}$/.test(key)) throw new Error('Invalid geometry cache key.');
    return `${digest(String(owner)).toString('hex')}-${key}.bin`;
  }

  token(owner) {
    return `${this.generation}:${this.versions.get(owner) || 0}`;
  }

  async get(owner, key) {
    await this.ready;
    await this.queue;
    const name = this.filename(owner, key);
    const entry = this.entries.get(name);
    if (!entry) return null;
    try {
      const packed = await fs.readFile(path.join(this.directory, name));
      const data = packed.subarray(32);
      if (packed.length < 32 || !packed.subarray(0, 32).equals(digest(data))) return null;
      this.entries.delete(name);
      this.entries.set(name, entry);
      if (Date.now() - entry.touched > 60_000) {
        entry.touched = Date.now();
        const now = new Date(entry.touched);
        void fs.utimes(path.join(this.directory, name), now, now).catch(() => {});
      }
      return data;
    } catch { return null; }
  }

  serialize(operation) {
    const result = this.queue.then(operation);
    this.queue = result.catch(() => {});
    return result;
  }

  put(owner, key, data, token = this.token(owner)) {
    const name = this.filename(owner, key);
    if (data.length + 32 > this.maxBytes) return Promise.resolve();
    return this.serialize(async () => {
      if (token !== this.token(owner)) return;
      const destination = path.join(this.directory, name);
      const temporary = `${destination}.${randomUUID()}.tmp`;
      try {
        const packed = Buffer.concat([digest(data), data]);
        await fs.writeFile(temporary, packed, { mode: 0o600 });
        await fs.rename(temporary, destination);
        this.bytes -= this.entries.get(name)?.size || 0;
        this.entries.delete(name);
        this.entries.set(name, { size: packed.length, touched: Date.now() });
        this.bytes += packed.length;
        await this.prune();
      } finally {
        await fs.unlink(temporary).catch(() => {});
      }
    });
  }

  async remove(name) {
    await fs.unlink(path.join(this.directory, name)).catch((error) => { if (error.code !== 'ENOENT') throw error; });
    this.bytes -= this.entries.get(name)?.size || 0;
    this.entries.delete(name);
  }

  async prune() {
    while (this.bytes > this.maxBytes || this.entries.size > this.maxEntries) {
      await this.remove(this.entries.keys().next().value);
    }
  }

  flush() {
    return this.queue;
  }

  clear(owner) {
    if (owner) this.versions.set(owner, (this.versions.get(owner) || 0) + 1);
    else this.generation += 1;
    const prefix = owner ? `${digest(String(owner)).toString('hex')}-` : '';
    return this.serialize(async () => {
      for (const name of this.entries.keys()) if (name.startsWith(prefix)) await this.remove(name);
    });
  }
}
