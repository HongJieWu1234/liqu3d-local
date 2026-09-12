import './setup.mjs';
import { localWorkerTransport } from './fixtures/renderer-transport.mjs';
import assert from 'node:assert/strict';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => { const value = probe.address().port; probe.close(() => resolve(value)); });
});
const transport = await localWorkerTransport(path.join(projectDir, 'tests/fixtures', 'legacy-openscad-shim'));
const child = spawn(process.execPath, ['renderer-service.mjs'], {
  cwd: projectDir,
  env: { ...process.env, PMM_DOCKER_BIN: transport.command, HOST: '127.0.0.1', PORT: String(port), OPENSCAD_BIN: path.join(projectDir, 'tests/fixtures', 'legacy-openscad-shim') },
  stdio: ['ignore', 'ignore', 'pipe']
});
let stderr = '';
child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
try {
  const deadline = Date.now() + 5000;
  let response;
  while (Date.now() < deadline) {
    try { response = await fetch(`http://127.0.0.1:${port}/healthz`); if (response) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.ok(response, `Renderer did not answer. ${stderr}`);
  assert.equal(response.status, 503, 'Legacy/non-Manifold OpenSCAD must be rejected');
  const health = await response.json();
  assert.equal(health.ready, false);
  assert.match(String(health.error || ''), /Manifold backend support is required/i);
  console.log('Modern-runtime guard passed: legacy/non-Manifold OpenSCAD is rejected.');
} finally {
  if (child.exitCode === null) child.kill('SIGTERM');
  await new Promise((resolve) => {
    if (child.exitCode !== null) return resolve();
    child.once('exit', resolve);
    setTimeout(resolve, 1000).unref();
  });
  await transport.close();
}
