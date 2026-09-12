import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DiskRenderCache, renderInputCacheKey, canCacheRender } from '../lib/render-cache.mjs';

const asset = (path, content) => ({ path, base64: Buffer.from(content).toString('base64') });
const inputs = { owner: 'alice', source: 'source-hash', openscad: '2026', format: '3mf', previewQuality: false,
  definitions: ['size=10'], frozenFonts: true, dependencies: [asset('model.scad', 'include <part.scad>'), asset('part.scad', 'cube(size);'), asset('font.ttf', 'font-v1')] };
const identity = renderInputCacheKey(inputs);
const fontIdentity = 'sha256:' + 'a'.repeat(64);
assert.notEqual(renderInputCacheKey({...inputs, fontIdentity}), renderInputCacheKey({...inputs, fontIdentity:'sha256:'+'b'.repeat(64)}), 'Changing the worker image invalidates its geometry');
assert.equal(renderInputCacheKey({...inputs, dependencies: [...inputs.dependencies].reverse()}), identity, 'Dependency ordering does not force recompilation');
for (const patch of [{owner:'bob'}, {source:'edited-source'}, {openscad:'2027'}, {format:'stl'}, {previewQuality:true}, {definitions:['size=11']},
  {dependencies:[...inputs.dependencies.slice(0,2),asset('font.ttf','font-v2')]}, {dependencies:[inputs.dependencies[0],asset('part.scad','sphere(size);'),inputs.dependencies[2]]}]) {
  assert.notEqual(renderInputCacheKey({...inputs,...patch}), identity, 'Every geometry input and owner participates in the cache key');
}
assert.equal(canCacheRender('include <part.scad>', inputs), true);
assert.equal(canCacheRender('include <part.scad>'), false);
assert.equal(canCacheRender('text("hello");'), false, 'Mutable system font lookup is not cacheable');
assert.equal(canCacheRender('text("hello");', {fontIdentity}), true, 'Pinned image fonts allow identical text renders to be reused');
assert.equal(canCacheRender('text("hello");', {fontIdentity:'worker:latest'}), false);
assert.equal(canCacheRender('include <mutable.scad> text("hello");', {fontIdentity}), false);
assert.equal(canCacheRender('text("hello");', {fontIdentity,noCache:true}), false);
assert.equal(canCacheRender('text("hello");', inputs), true);
assert.equal(canCacheRender('cube(2);', {...inputs,noCache:true}), false);

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-geometry-test-'));
const key = (number) => number.toString(16).padStart(64, '0');
try {
  const cache = new DiskRenderCache(directory, { maxBytes: 256, maxEntries: 3 });
  const mesh = Buffer.from('saved geometry');
  await cache.put('alice', key(1), mesh);
  assert.deepEqual(await cache.get('alice', key(1)), mesh);
  assert.equal(await cache.get('bob', key(1)), null, 'Caches must remain account-scoped');
  const restarted = new DiskRenderCache(directory, { maxBytes: 256, maxEntries: 3 });
  assert.deepEqual(await restarted.get('alice', key(1)), mesh, 'Restart must not discard geometry');
  await restarted.put('alice', key(2), Buffer.alloc(0));
  assert.equal((await restarted.get('alice', key(2))).length, 0, 'Empty parts are valid cached results');
  await restarted.put('bob', key(1), mesh);
  await restarted.get('alice', key(1));
  await restarted.put('alice', key(3), mesh);
  assert.equal(await restarted.get('alice', key(2)), null, 'Least recently used entry is evicted');
  const oldToken = restarted.token('alice');
  const pendingWrite = restarted.put('alice', key(4), mesh, oldToken);
  await restarted.clear('alice');
  await pendingWrite;
  await restarted.put('alice', key(5), mesh, oldToken);
  assert.equal(await restarted.get('alice', key(1)), null);
  assert.equal(await restarted.get('alice', key(4)), null);
  assert.equal(await restarted.get('alice', key(5)), null, 'Deleted data cannot be restored by an old render');
  assert.deepEqual(await restarted.get('bob', key(1)), mesh);
  const bobFile = path.join(directory, restarted.filename('bob', key(1)));
  await fs.writeFile(bobFile, Buffer.from('corrupt'));
  assert.equal(await restarted.get('bob', key(1)), null, 'Corruption must cause a cache miss');
  await restarted.clear();
  assert.equal((await fs.readdir(directory)).length, 0);
  await restarted.put('alice', key(6), Buffer.alloc(300));
  assert.equal(await restarted.get('alice', key(6)), null, 'Oversized entries do not grow storage');
  await assert.rejects(restarted.get('alice', '../../escape'));
  console.log('Persistent geometry cache: restart, isolation, LRU, integrity, deletion races, and size bounds passed.');
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
