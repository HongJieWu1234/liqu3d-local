import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { captureObjectSnapshot } from './fixtures/sku-snapshot.mjs';
import { createDefaultProfile } from '../public/print-settings-schema.js';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-production-test-'));
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const selected = probe.address().port;
    probe.close(() => resolve(selected));
  });
});
const base = `http://127.0.0.1:${port}`;
let childError = '';
const child = spawn(process.execPath, ['server.mjs'], {
  cwd: projectDir,
  env: {
    ...process.env,
    PMM_INTERNAL_BIND: '1',
    HOST: '127.0.0.1',
    PORT: String(port),
    PMM_DATA_DIR: dataDir,
    PMM_RESEND_API_KEY: '',
    PMM_SMTP_HOST: '',
    PMM_ACCOUNT_STORAGE_MB: '64',
    OPENSCAD_BIN: path.join(projectDir, 'tests/fixtures', 'modern-openscad-shim')
  },
  stdio: ['ignore', 'ignore', 'pipe']
});
child.stderr.on('data', (chunk) => { childError += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/healthz`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 75));
  }
  throw new Error(`Production test server did not start. ${childError}`);
}

async function request(pathname, { method = 'GET', cookie = '', body, authorization = '' } = {}) {
  const headers = {};
  if (cookie) headers.Cookie = cookie;
  if (authorization) headers.Authorization = authorization;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${base}${pathname}`, {
    method,
    headers,
    redirect: 'manual',
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { status: response.status, json, text };
}

function sha256(value) { return createHash('sha256').update(value).digest('hex'); }

try {
  await waitForServer();

  const db = new DatabaseSync(path.join(dataDir, 'accounts.sqlite'));
  const now = Date.now();
  db.prepare(`INSERT INTO users (id,email,display_name,password_salt,password_hash,password_version,email_verified_at,two_factor_enabled,settings_json,generation_defaults_version,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(1, 'production@example.com', 'Production Test', 'salt', 'hash', 3, now, 1, '{}', 1, now);
  const sessionToken = randomBytes(32).toString('base64url');
  db.prepare(`INSERT INTO sessions (token_hash,user_id,created_at,last_active_at,user_agent,ip_address,location,expires_at) VALUES (?,?,?,?,?,?,?,?)`)
    .run(sha256(sessionToken), 1, now, now, 'test', '127.0.0.1', 'Local device', now + 60 * 60_000);
  db.close();
  const cookie = `pmm_session=${sessionToken}`;

  const profile = createDefaultProfile();
  const source = `size = 10;
export_single_design = 0;
pmm_objects = [[1,"Body","","pair"],[2,"Top","","pair"],[3,"Other","","other"]];
if (export_single_design == 0 || export_single_design == 1) cube(size);
if (export_single_design == 0 || export_single_design == 2) translate([0,0,20]) cube(5);
if (export_single_design == 0 || export_single_design == 3) translate([40,0,0]) cube(10);`;
  const record = { id: 'object-pair', selectionKey: 'group:pair', sourceKey: 'group:pair', plateId: 'B', label: 'Pair', printOverrides: {} };
  const snapshot = captureObjectSnapshot({ sourceInstanceId: 'source', sourceName: 'multipart.scad', source }, record, { size: 10 }, [1, 2]);
  assert.equal(snapshot.plates.length, 1);
  assert.deepEqual(snapshot.plates[0].objectBinding.memberIds, [1, 2]);
  assert.deepEqual(Object.keys(snapshot.plates[0].objectRecords), ['group:pair']);
  const post = (url, body) => request(url, { method: 'POST', cookie, body });
  let response = await post('/api/production/skus', { code: 'OBJECT-1', name: 'Pair', workspaceSnapshot: snapshot, printProfile: profile, objectOnly: true });
  assert.equal(response.status, 201, response.text);
  const sku = response.json;
  response = await post('/api/production/variants', { skuId: sku.id, skuRevision: 1, name: 'Large', design: { size: 20 }, print: { layer_height: 0.12 } });
  assert.equal(response.status, 201, response.text);
  const variant = response.json;
  assert.deepEqual(variant.design, { size: 20 });
  assert.deepEqual(variant.print, { layer_height: 0.12 });
  const other = await post('/api/production/skus', { code: 'OBJECT-2', name: 'Other', workspaceSnapshot: snapshot, printProfile: profile, objectOnly: true });
  response = await post('/api/production/jobs', { skuId: other.json.id, variantId: variant.id });
  assert.equal(response.status, 400, response.text);
  response = await post('/api/production/variants', { skuId: sku.id, name: 'Bad', design: { missing: 3 }, print: {} });
  assert.equal(response.status, 400);
  response = await post('/api/production/variants', { skuId: sku.id, name: 'Bad print', design: {}, print: { design1_layer_height: 0.2 } });
  assert.equal(response.status, 400);
  response = await post('/api/production/variants', { skuId: sku.id, name: 'Wrong scope', design: {}, print: { filament_type: 'PETG' } });
  assert.equal(response.status, 400);
  response = await post('/api/production/variants', { skuId: sku.id, name: 'Temporary', design: { size: 11 }, print: {} });
  assert.equal(response.status, 201);
  response = await request(`/api/production/variants/${response.json.id}`, { method: 'DELETE', cookie });
  assert.equal(response.status, 200);
  response = await post('/api/production/jobs', { skuId: sku.id, variantId: variant.id, parameters: { size: 25 }, quantity: 3 });
  assert.equal(response.status, 201, response.text);
  const job = response.json;
  assert.equal(job.workspaceSnapshot.plates[0].values.size, 25);
  assert.equal(job.workspaceSnapshot.plates[0].baseValues.size, 25);
  assert.equal(job.workspaceSnapshot.plates[0].objectRecords['group:pair'].printOverrides.layer_height, 0.12);
  assert.equal(job.variantRevision, 1);
  const revisedSnapshot = structuredClone(snapshot); revisedSnapshot.plates[0].values.size = 30;
  revisedSnapshot.plates[0].baseValues.size = 30;
  response = await post('/api/production/skus', { code: sku.code, name: 'Pair revised', workspaceSnapshot: revisedSnapshot, printProfile: profile, objectOnly: true });
  assert.equal(response.json.revision, 2);
  response = await post('/api/production/resolve', { skuId: sku.id, variantId: variant.id });
  assert.equal(response.json.revision, 1);
  assert.equal(response.json.workspaceSnapshot.plates[0].values.size, 20);
  response = await post('/api/production/variants', { ...variant, expectedRevision: 1, design: {}, print: {} });
  assert.equal(response.status, 201, response.text);
  assert.equal(response.json.revision, 2);
  assert.deepEqual(response.json.print, {});
  response = await post('/api/production/resolve', { skuId: sku.id, variantId: variant.id, variantRevision: 1 });
  assert.equal(response.json.workspaceSnapshot.plates[0].values.size, 20);
  assert.equal(response.json.workspaceSnapshot.plates[0].objectRecords['group:pair'].printOverrides.layer_height, 0.12);
  response = await post('/api/production/jobs/batch', { skuId: sku.id, rows: [{ variantId: variant.id, variantRevision: 1 }, { variantId: 'missing' }] });
  assert.equal(response.json.created.length, 1);
  assert.equal(response.json.failures.length, 1);
  const link = await post('/api/production/configurators', { skuId: sku.id, variantId: variant.id, variantRevision: 1, name: 'Pinned link', allowedParams: ['size'] });
  assert.equal(link.status, 201, link.text);
  response = await request(`/api/production/variants/${variant.id}`, { method: 'DELETE', cookie });
  assert.equal(response.status, 400, 'A live customer link must protect its pinned variant.');
  response = await request('/api/public/configurator', { method: 'POST', body: { token: link.json.token } });
  assert.equal(response.json.parameters.find(item => item.name === 'size').value, 20);
  response = await request('/api/public/configurator/jobs', { method: 'POST', body: { token: link.json.token, variantId: 'malicious', variantRevision: 77, print: { layer_height: 0.5 }, parameters: { size: 22, layer_height: 0.5 } } });
  assert.equal(response.status, 201, response.text);
  const publicJob = await request(`/api/production/jobs/${response.json.jobId}`, { cookie });
  assert.equal(publicJob.json.variantRevision, 1);
  assert.equal(publicJob.json.workspaceSnapshot.plates[0].objectRecords['group:pair'].printOverrides.layer_height, 0.12);
  const webhook = await post('/api/production/webhooks', { name: 'Variants webhook' });
  response = await request('/api/webhooks/order', { method: 'POST', authorization: `Bearer ${webhook.json.token}`, body: { skuCode: sku.code, variantId: variant.id, variantRevision: 1 } });
  assert.equal(response.status, 201, response.text);
  // Every job is immutable even after the variant and SKU have both changed.
  response = await request(`/api/production/jobs/${job.id}`, { cookie });
  assert.equal(response.json.workspaceSnapshot.plates[0].values.size, 25);
  assert.equal(response.json.skuRevision, 1);
  const exported = await request('/api/account/export', { cookie });
  assert.equal(exported.json.production.variantData.sku_revisions.length, 3);
  assert.equal(exported.json.production.variantData.variant_revisions.length, 2);
  response = await post('/api/production/variants', { ...variant, expectedRevision: 2, skuRevision: 2 });
  assert.equal(response.json.skuRevision, 2, response.text);
  // A foreign account cannot resolve or modify another owner's variants.
  const secondDb = new DatabaseSync(path.join(dataDir, 'accounts.sqlite'));
  secondDb.prepare('INSERT INTO users (id,email,display_name,password_salt,password_hash,password_version,email_verified_at,two_factor_enabled,settings_json,generation_defaults_version,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(2, 'other@example.com', 'Other', 'salt','hash',3,now,1,'{}',1,now);
  const secondToken = randomBytes(32).toString('base64url');
  secondDb.prepare('INSERT INTO sessions (token_hash,user_id,created_at,last_active_at,user_agent,ip_address,location,expires_at) VALUES (?,?,?,?,?,?,?,?)').run(sha256(secondToken),2,now,now,'test','127.0.0.1','Local',now+3600000); secondDb.close();
  response = await request('/api/production/resolve', { method: 'POST', cookie: `pmm_session=${secondToken}`, body: { skuId: sku.id, variantId: variant.id } });
  assert.equal(response.status, 400);
  response = await request(`/api/production/skus/${sku.id}`, { method: 'DELETE', cookie });
  assert.equal(response.status, 200);
  const afterDelete = await request('/api/account/export', { cookie });
  assert.equal(afterDelete.json.production.variantData.sku_revisions.some(row => row.sku_id === sku.id), false);
  assert.equal(afterDelete.json.production.variantData.production_variants.some(row => row.sku_id === sku.id), false);
  assert.equal(afterDelete.json.production.variantData.variant_revisions.some(row => row.variant_id === variant.id), false);
  assert.ok(afterDelete.json.production.jobs.length, 'Existing job snapshots survive SKU deletion.');
  console.log('SKU/variant integration passed: multipart capture, canonical overrides, immutable revisions, jobs, CSV, public links, webhooks, export and tenant isolation.');
} finally {
  child.kill('SIGTERM');
  await new Promise(resolve => { child.once('exit', resolve); setTimeout(resolve, 1000); });
  await fs.rm(dataDir, { recursive: true, force: true });
}
