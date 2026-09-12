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
  profile.printer = 'p1s';
  profile.nozzleDiameter = 0.4;
  profile.filamentColor = '#112233';
  profile.settings.filament_type = 'PLA';
  const snapshot = {
    version: 1,
    plates: [{
      sourceInstanceId: 'src-1',
      sourceName: 'tag.scad',
      source: 'size = 10;\nmagnet_count = 2;\nlabel_text = "TEST";\npart_color = "#112233";\ncube([size,size,2]);',
      defaultPlateId: 'A',
      baseValues: { size: 10, magnet_count: 2, label_text: 'TEST', part_color: '#112233' },
      values: { size: 10, magnet_count: 2, label_text: 'TEST', part_color: '#112233' },
      objectRecords: {},
      batchInstances: []
    }]
  };
  const rules = [
    { require: { param: 'size', gte: 5 }, message: 'Size must be at least 5 mm.' },
    { when: { all: [{ param: 'size', gt: 10 }, { param: 'magnet_count', gte: 2 }] }, require: { not: { param: 'label_text', eq: 'BLOCKED' } }, message: 'Blocked label is invalid for this configuration.' }
  ];
  const bom = [{ name: 'legacy ignored item', qty: 99, unitCost: 99 }];
  const quote = { currency: 'USD', base: 999 };

  const calibration = await request('/api/production/calibrations', {
    method: 'POST', cookie,
    body: { name: 'P1S PLA 0.4', printer: 'p1s', nozzle: 0.4, material: 'PLA', values: { xy_hole_compensation: 0.12, xy_contour_compensation: -0.03, elefant_foot_compensation: 0.1, unsafe_key: 99 } }
  });
  assert.equal(calibration.status, 201, calibration.text);
  assert.deepEqual(calibration.json.values.settings, { xy_hole_compensation: 0.12, xy_contour_compensation: -0.03, elefant_foot_compensation: 0.1 });

  const skuResponse = await request('/api/production/skus', {
    method: 'POST', cookie,
    body: {
      code: 'TAG-001', name: 'Test tag', workspaceId: 'workspace-test', workspaceSnapshot: snapshot,
      printProfile: profile, rules, bom, quote,
      calibration: { profileId: calibration.json.id, ...calibration.json.values }
    }
  });
  assert.equal(skuResponse.status, 201, skuResponse.text);
  const sku = skuResponse.json;
  assert.equal(sku.code, 'TAG-001');
  assert.equal(sku.revision, 1);
  assert.ok(sku.workspaceHash.length === 64);
  assert.ok(sku.parameters.some((p) => p.name === 'size'));

  const skuRevision = await request('/api/production/skus', {
    method: 'POST', cookie,
    body: { code: 'TAG-001', name: 'Test tag rev 2', workspaceSnapshot: snapshot, printProfile: profile, rules, bom, quote, calibration: { profileId: calibration.json.id, ...calibration.json.values } }
  });
  assert.equal(skuRevision.status, 200, skuRevision.text);
  assert.equal(skuRevision.json.revision, 2);

  const jobResponse = await request('/api/production/jobs', {
    method: 'POST', cookie,
    body: { skuId: sku.id, orderRef: 'ORDER-100', customerLabel: 'Alice', quantity: 2, parameters: { size: 20, label_text: 'ALICE', part_color: '#445566' } }
  });
  assert.equal(jobResponse.status, 201, jobResponse.text);
  const job = jobResponse.json;
  assert.equal(job.status, 'pending');
  assert.equal(job.skuRevision, 2);
  assert.equal(job.openscadVersion, skuRevision.json.openscadVersion);
  assert.equal(job.parameters.size, 20);
  assert.equal(job.workspaceSnapshot.plates[0].values.size, 20);
  assert.equal(job.printProfile.settings.xy_hole_compensation, 0.12);
  assert.equal(job.quantity, 2);
  assert.equal(Object.hasOwn(job, 'bom'), false, 'BOM is retired from the production API');
  assert.equal(Object.hasOwn(job, 'quote'), false, 'Automatic quoting is retired from the production API');
  assert.deepEqual(job.colors.sort(), ['#445566']);
  const lockedJob = await request(`/api/production/jobs/${job.id}`, { cookie });
  assert.equal(lockedJob.status, 200);
  assert.equal(lockedJob.json.versionMatch, true);
  assert.equal(lockedJob.json.skuRevision, 2);

  const invalid = await request('/api/production/jobs', { method: 'POST', cookie, body: { skuId: sku.id, parameters: { size: 2 } } });
  assert.equal(invalid.status, 400);
  assert.match(invalid.json.error, /at least 5/i);
  const compoundInvalid = await request('/api/production/jobs', { method: 'POST', cookie, body: { skuId: sku.id, parameters: { size: 15, magnet_count: 2, label_text: 'BLOCKED' } } });
  assert.equal(compoundInvalid.status, 400);
  assert.match(compoundInvalid.json.error, /blocked label/i);

  const batch = await request('/api/production/jobs/batch', {
    method: 'POST', cookie,
    body: { skuId: sku.id, rows: [
      { orderRef: 'CSV-1', parameters: { size: 12, label_text: 'ONE' } },
      { orderRef: 'CSV-2', parameters: { size: 3, label_text: 'BAD' } },
      { orderRef: 'CSV-3', parameters: { size: 18, label_text: 'THREE' } }
    ] }
  });
  assert.equal(batch.status, 200, batch.text);
  assert.equal(batch.json.created.length, 2);
  assert.equal(batch.json.failures.length, 1);
  assert.equal(batch.json.failures[0].row, 2);

  const configurator = await request('/api/production/configurators', {
    method: 'POST', cookie, body: { skuId: sku.id, name: 'Public tag', allowedParams: ['size', 'label_text'] }
  });
  assert.equal(configurator.status, 201, configurator.text);
  assert.match(configurator.json.token, /^[A-Za-z0-9_-]{43}$/);

  const publicConfig = await request('/api/public/configurator', { method: 'POST', body: { token: configurator.json.token } });
  assert.equal(publicConfig.status, 200, publicConfig.text);
  assert.deepEqual(publicConfig.json.parameters.map((p) => p.name).sort(), ['label_text', 'size']);
  assert.equal(Object.hasOwn(publicConfig.json, 'rules'), false);
  assert.equal(Object.hasOwn(publicConfig.json, 'quote'), false);
  assert.equal(Object.hasOwn(publicConfig.json, 'workspaceSnapshot'), false);

  const publicJob = await request('/api/public/configurator/jobs', {
    method: 'POST', body: { token: configurator.json.token, orderRef: 'PUBLIC-1', quantity: 1, parameters: { size: 16, label_text: 'PUBLIC', magnet_count: 99 } }
  });
  assert.equal(publicJob.status, 201, publicJob.text);
  assert.equal(publicJob.json.status, 'pending');
  const publicJobFull = await request(`/api/production/jobs/${publicJob.json.jobId}`, { cookie });
  assert.equal(publicJobFull.status, 200);
  assert.equal(publicJobFull.json.parameters.magnet_count, undefined, 'Public configurator must reject non-exposed parameters');

  const template = await request('/api/production/templates', {
    method: 'POST', cookie,
    body: { name: 'Tag production template', template: { version: 1, workspaceSnapshot: { ...snapshot, productionRules: rules }, printProfile: profile, rules } }
  });
  assert.equal(template.status, 201, template.text);
  assert.equal(template.json.template.workspaceSnapshot.plates[0].sourceName, 'tag.scad');

  const component = await request('/api/production/components', {
    method: 'POST', cookie,
    body: { name: '8x3 magnet pocket', description: 'Reusable press-fit pocket', source: 'module magnet_pocket(d=8,h=3) { cylinder(d=d,h=h); }' }
  });
  assert.equal(component.status, 201, component.text);
  assert.match(component.json.source, /module magnet_pocket/);

  const diffSnapshot = structuredClone(snapshot);
  diffSnapshot.plates[0].values.size = 25;
  diffSnapshot.plates[0].source += '\n// revision diff source change';
  const diffProfile = structuredClone(profile);
  diffProfile.settings.wall_loops = Number(diffProfile.settings.wall_loops || 2) + 1;
  const changedRules = [...rules, { require: { param: 'magnet_count', gte: 1 }, message: 'At least one magnet.' }];
  const diff = await request('/api/production/diff', { method: 'POST', cookie, body: { skuId: sku.id, workspaceSnapshot: diffSnapshot, printProfile: diffProfile, rules: changedRules } });
  assert.equal(diff.status, 200, diff.text);
  assert.ok(diff.json.changes.some((change) => change.parameter === 'size' && change.to === 25));
  assert.ok(diff.json.sourceChanges.some((change) => change.status === 'source-changed'));
  assert.ok(diff.json.printProfileChanges.some((change) => change.path.endsWith('wall_loops')));
  assert.ok(diff.json.productionChanges.some((change) => change.path === 'rules'));
  assert.equal(diff.json.productionChanges.some((change) => change.path === 'quote' || change.path === 'bom'), false);
  assert.equal(typeof diff.json.versionMatch, 'boolean');

  const webhook = await request('/api/production/webhooks', { method: 'POST', cookie, body: { name: 'Store orders' } });
  assert.equal(webhook.status, 201, webhook.text);
  const webhookJob = await request('/api/webhooks/order', {
    method: 'POST', authorization: `Bearer ${webhook.json.token}`,
    body: { skuCode: 'TAG-001', orderRef: 'SHOP-1', customerLabel: 'Shop customer', parameters: { size: 22 } }
  });
  assert.equal(webhookJob.status, 201, webhookJob.text);

  const markedGenerated = await request(`/api/production/jobs/${job.id}`, { method: 'PATCH', cookie, body: { status: 'generated', outputName: 'TAG-001.3mf' } });
  assert.equal(markedGenerated.status, 200);
  assert.equal(markedGenerated.json.status, 'generated');
  const markedDownloaded = await request(`/api/production/jobs/${job.id}`, { method: 'PATCH', cookie, body: { status: 'downloaded', outputName: 'TAG-001.3mf' } });
  assert.equal(markedDownloaded.status, 200);
  assert.ok(markedDownloaded.json.downloadedAt);

  const overview = await request('/api/production', { cookie });
  assert.equal(overview.status, 200, overview.text);
  assert.ok(overview.json.jobs.length >= 5);
  assert.ok(overview.json.skus.some((item) => item.code === 'TAG-001' && item.revision === 2));
  assert.ok(overview.json.configurators.length === 1);
  assert.ok(overview.json.templates.length === 1);
  assert.ok(overview.json.components.some((item) => item.name === '8x3 magnet pocket'));
  assert.ok(overview.json.calibrations.length === 1);
  assert.ok(overview.json.webhooks.length === 1);
  assert.ok(overview.json.groups.length >= 1);

  const account = await request('/api/account/settings', { cookie });
  assert.equal(account.status, 200, account.text);
  assert.ok(account.json.storage.usedBytes > 0, 'Production snapshots must count toward the account storage quota');
  const dataExport = await request('/api/account/export', { cookie });
  assert.equal(dataExport.status, 200, dataExport.text);
  assert.ok(dataExport.json.production.skus.some((item) => item.code === 'TAG-001'));
  assert.ok(dataExport.json.production.jobs.length >= 5);
  assert.ok(dataExport.json.production.components.some((item) => item.name === '8x3 magnet pocket'));
  assert.equal(JSON.stringify(dataExport.json.production).includes('token_hash'), false, 'Account export must not leak stored credential hashes');

  console.log('Production tests passed: SKUs/revisions, constraints, calibration, CSV-style batches, customer links, templates/components, diff, webhooks, generation states, data export and quota accounting.');
} finally {
  child.kill('SIGTERM');
  await new Promise((resolve) => { child.once('exit', resolve); setTimeout(resolve, 1000); });
  await fs.rm(dataDir, { recursive: true, force: true });
}
