import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-cloudflare-test-'));
const secretFile = path.join(testDir, 'resend-api-key');
await fs.writeFile(secretFile, 're_test_only_not_a_real_key\n', { mode: 0o600 });
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const selected = probe.address().port;
    probe.close(() => resolve(selected));
  });
});
const base = `http://127.0.0.1:${port}`;
const childEnv = {
  ...process.env,
  NODE_ENV: 'production',
  PMM_INTERNAL_BIND: '1',
  HOST: '127.0.0.1',
  PORT: String(port),
  PMM_DATA_DIR: testDir,
  PMM_PUBLIC_ORIGIN: 'https://liqu3d.com',
  PMM_ALLOWED_HOSTS: 'liqu3d.com',
  PMM_TRUST_PROXY: 'cloudflare',
  PMM_RESEND_API_KEY_FILE: secretFile,
  PMM_EMAIL_FROM: 'Liqu3D <mailer@liqu3d.com>'
};
const child = spawn(process.execPath, ['server.mjs'], {
  cwd: projectDir,
  env: childEnv,
  stdio: ['ignore', 'ignore', 'pipe']
});
let childError = '';
child.stderr.on('data', (chunk) => { childError += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/healthz`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Cloudflare-mode server did not start. ${childError}`);
}

function request(pathname, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path: pathname, headers }, (res) => {
      res.resume();
      res.once('end', () => resolve({ status: res.statusCode, headers: res.headers }));
    });
    req.once('error', reject);
  });
}

try {
  await waitForServer();
  const missingCloudflareHeader = await request('/', { Host: 'liqu3d.com' });
  assert.equal(missingCloudflareHeader.status, 403);

  const publicRequest = await request('/', { Host: 'liqu3d.com', 'CF-Connecting-IP': '203.0.113.25' });
  assert.equal(publicRequest.status, 200);
  assert.equal(publicRequest.headers['strict-transport-security'], 'max-age=31536000; includeSubDomains');

  const wrongHost = await request('/', { Host: 'attacker.example', 'CF-Connecting-IP': '203.0.113.25' });
  assert.equal(wrongHost.status, 421);

  const publicHealth = await request('/healthz', { Host: 'liqu3d.com', 'CF-Connecting-IP': '203.0.113.25' });
  assert.equal(publicHealth.status, 404);
  console.log('Cloudflare Tunnel boundary tests passed.');
} finally {
  child.kill('SIGTERM');
  await new Promise((resolve) => child.once('exit', resolve));
  await fs.rm(testDir, { recursive: true, force: true });
}
