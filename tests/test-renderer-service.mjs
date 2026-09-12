import './setup.mjs';
import { localWorkerTransport } from './fixtures/renderer-transport.mjs';
import assert from 'node:assert/strict';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testOpenScad = process.env.OPENSCAD_BIN || path.join(projectDir, 'tests/fixtures', 'modern-openscad-shim');
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => { const value = probe.address().port; probe.close(() => resolve(value)); });
});
const token = 'renderer-test-token-0123456789abcdef0123456789abcdef';
const base = `http://127.0.0.1:${port}`;
let stderr = '';
const transport = await localWorkerTransport(testOpenScad);
const child = spawn(process.execPath, ['renderer-service.mjs'], {
  cwd: projectDir,
  env: { ...process.env, PMM_DOCKER_BIN: transport.command, HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'production', PMM_RENDERER_TOKEN: token, OPENSCAD_BIN: testOpenScad },
  stdio: ['ignore', 'ignore', 'pipe']
});
child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

try {
  const deadline = Date.now() + 15_000;
  let health;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/healthz`);
      if (response.ok) { health = await response.json(); break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(health?.ready, true, `Renderer did not become ready. ${stderr}`);
  assert.equal(typeof health.version, 'string');
  assert.equal(health.isolation, 'disposable-container-v1');
  assert.equal(health.renderCacheIdentity, 'sha256:' + 'a'.repeat(64));

  const unauthorized = await fetch(`${base}/render`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'cube(1);', format: 'stl', definitions: [] }) });
  assert.equal(unauthorized.status, 401);

  const rendered = await fetch(`${base}/render`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-pmm-renderer-token': token },
    body: JSON.stringify({ source: 'size=1; cube([size,size,size]);', sourceName: 'fixture.scad', format: 'stl', definitions: ['size=4'] })
  });
  assert.equal(rendered.status, 200, await rendered.clone().text());
  assert.equal(rendered.headers.get('x-render-identity'), health.renderCacheIdentity);
  const stl = Buffer.from(await rendered.arrayBuffer());
  assert.ok(stl.length > 84);
  assert.equal(stl.length, 84 + stl.readUInt32LE(80) * 50);

  for (const allowEmpty of [false,true]) {
    const response=await fetch(`${base}/render`,{method:'POST',headers:{'Content-Type':'application/json','x-pmm-renderer-token':token},body:JSON.stringify({source:'if (false) cube(1);',sourceName:'empty.scad',format:'3mf',allowEmpty})});
    assert.equal(response.status,allowEmpty?200:422);
    if(allowEmpty)assert.equal((await response.arrayBuffer()).byteLength,0);else assert.match((await response.json()).error,/top level object is empty|no top level geometry|nothing to render/i);
  }
  const invalid=await fetch(`${base}/render`,{method:'POST',headers:{'Content-Type':'application/json','x-pmm-renderer-token':token},body:JSON.stringify({source:'cube(;',sourceName:'invalid.scad',format:'3mf',allowEmpty:true})});
  assert.equal(invalid.status,422);assert.match((await invalid.json()).error,/ERROR|Parser/i);
  const asset=(path,source)=>({path,base64:Buffer.from(source).toString('base64')});
  const dependencyRender=await fetch(`${base}/render`, {
    method:'POST',headers:{'Content-Type':'application/json','x-pmm-renderer-token':token},
    body:JSON.stringify({source:'include <../parts/body.scad>\nbody();',packageEntry:'model/main.scad',format:'3mf',definitions:[],dependencies:[asset('model/main.scad','include <../parts/body.scad>\nbody();'),asset('parts/body.scad','module body(){cube(3);}') ]})
  });
  assert.equal(dependencyRender.status,200,(await dependencyRender.clone().text())+' '+stderr);
  assert.ok((await dependencyRender.arrayBuffer()).byteLength>100);
  const missingFont=await fetch(`${base}/render`, {
    method:'POST',headers:{'Content-Type':'application/json','x-pmm-renderer-token':token},
    body:JSON.stringify({source:'text("A",font="Instant Missing Font 8293");',packageEntry:'main.scad',format:'3mf',definitions:[],dependencies:[asset('main.scad','text("A",font="Instant Missing Font 8293");')]})
  });
  assert.equal(missingFont.ok,false);assert.match(await missingFont.text(),/Missing font/);
  const thumb = await fetch(`${base}/thumbnail`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-pmm-renderer-token': token },
    body: JSON.stringify({ stlBase64: stl.toString('base64'), accent: '#12ab34' })
  });
  assert.equal(thumb.status, 200, await thumb.clone().text());
  const webp = Buffer.from(await thumb.arrayBuffer());
  assert.equal(webp.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(webp.subarray(8, 12).toString('ascii'), 'WEBP');
  console.log(`Renderer service tests passed: authenticated Manifold-only render and headless thumbnail (${health.version}).`);
} finally {
  if (child.exitCode === null) child.kill('SIGTERM');
  if (child.exitCode === null) await new Promise((resolve) => child.once('exit', resolve));
  await transport.close();
}
