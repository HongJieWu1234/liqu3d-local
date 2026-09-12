import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { DOMParser } from '@xmldom/xmldom';
import { readSolid3mf } from '../public/solid-3mf.js';

// Exercise the real API and configured renderer, using an isolated account database.
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-settings-api-'));
const port = await new Promise(resolve => {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1', () => { const value = probe.address().port; probe.close(() => resolve(value)); });
});
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.mjs'], {
  env: { PATH: process.env.PATH, HOME: process.env.HOME, PMM_INTERNAL_BIND: '1', HOST: '127.0.0.1',
    PORT: String(port), PMM_DATA_DIR: directory, PMM_RENDERER_URL: process.env.PMM_RENDERER_URL || 'http://127.0.0.1:4180' },
  stdio: ['ignore', 'ignore', 'pipe']
});
let errors = '', db;
child.stderr.on('data', chunk => { errors += chunk; });
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${base}/healthz`)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, errors);
  db = new DatabaseSync(path.join(directory, 'accounts.sqlite'));
  const now = Date.now(), token = randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO users(id,email,password_salt,password_hash,email_verified_at,two_factor_enabled,generation_defaults_version,created_at) VALUES(?,?,?,?,?,?,?,?)')
    .run(1, 'settings-test@example.com', 'test-only', 'test-only', now, 0, 1, now);
  db.prepare('INSERT INTO sessions(token_hash,user_id,created_at,last_active_at,expires_at) VALUES(?,?,?,?,?)')
    .run(createHash('sha256').update(token).digest('hex'), 1, now, now, now + 3600000);
  const source = 'enabled=true;\nwidth=40; // [1:1:240]\nif(enabled) cube([width,10,3]);';
  const request = (route, values, scad = source) => fetch(base + route, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: `pmm_session=${token}` },
    body: JSON.stringify({ source: scad, sourceName: 'settings.scad', values }), signal: AbortSignal.timeout(30000)
  });
  const preview = '/api/export?format=3mf&preview=1';
  const widthOf = async response => {
    assert.equal(response.status, 200, await response.clone().text());
    const solids = readSolid3mf(new Uint8Array(await response.arrayBuffer()), text => new DOMParser().parseFromString(text, 'application/xml'));
    const positions = solids.flatMap(solid => Array.from(solid.geometry.getAttribute('position').array).filter((_, i) => i % 3 === 0));
    solids.forEach(solid => solid.geometry.dispose());
    return Math.max(...positions) - Math.min(...positions);
  };
  assert.equal(await widthOf(await request(preview, { enabled: true, width: 40 })), 40);
  let response = await request(preview, { enabled: false, width: 40 });
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal((await response.arrayBuffer()).byteLength, 0, 'Disabling a model must clear its preview');
  assert.equal(await widthOf(await request(preview, { enabled: true, width: 79 })), 79, 'Re-enabling applies the latest dimensions');
  response = await request('/api/export?format=3mf', { enabled: false, width: 40 });
  assert.ok(response.status >= 400, 'A required export still rejects empty geometry');
  response = await request(preview, { enabled: true, width: 0 });
  assert.ok(response.status >= 400, 'Invalid dimensions must not masquerade as an empty preview');
  console.log('Real settings API passed: custom dimensions, disabled model, reactivation, strict exports and invalid-input rejection.');
} finally {
  db?.close();
  if (child.exitCode === null) child.kill('SIGTERM');
  if (child.exitCode === null) await new Promise(resolve => child.once('exit', resolve));
  await fs.rm(directory, { recursive: true, force: true });
}
