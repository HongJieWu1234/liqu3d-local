import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { DOMParser } from '@xmldom/xmldom';
import { readSolid3mf } from '../public/solid-3mf.js';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testOpenScad = process.env.OPENSCAD_BIN || path.join(projectDir, 'tests/fixtures', 'modern-openscad-shim');
const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-auth-test-'));
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const selected = probe.address().port;
    probe.close(() => resolve(selected));
  });
});
const base = `http://127.0.0.1:${port}`;
const smtpMessages = [];
const smtpServer = net.createServer((socket) => {
  socket.setEncoding('utf8');
  socket.write('220 localhost ESMTP\r\n');
  let buffer = '';
  let dataMode = false;
  let message = '';
  socket.on('data', (chunk) => {
    buffer += chunk;
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n');
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (dataMode) {
        if (line === '.') {
          smtpMessages.push(message);
          message = '';
          dataMode = false;
          socket.write('250 2.0.0 queued\r\n');
        } else {
          message += `${line}\n`;
        }
        continue;
      }
      const command = line.split(' ', 1)[0].toUpperCase();
      if (command === 'EHLO') socket.write('250-localhost\r\n250 PIPELINING\r\n');
      else if (command === 'HELO' || command === 'MAIL' || command === 'RCPT' || command === 'RSET' || command === 'NOOP') socket.write('250 2.0.0 ok\r\n');
      else if (command === 'DATA') { dataMode = true; socket.write('354 End data with <CR><LF>.<CR><LF>\r\n'); }
      else if (command === 'QUIT') { socket.write('221 2.0.0 bye\r\n'); socket.end(); }
      else socket.write('250 2.0.0 ok\r\n');
    }
  });
});
const smtpPort = await new Promise((resolve, reject) => {
  smtpServer.once('error', reject);
  smtpServer.listen(0, '127.0.0.1', () => resolve(smtpServer.address().port));
});
let smtpCursor = 0;

function nextEmailCode() {
  const message = smtpMessages[smtpCursor++];
  const match = message?.match(/\b(\d{6})\b/);
  assert.ok(match, 'Expected a six-digit code in the SMTP message');
  return match[1];
}

function startServer() {
const processChild = spawn(process.execPath, ['server.mjs'], {
  cwd: projectDir,
  env: {
    ...process.env,
    PMM_INTERNAL_BIND: '1',
    HOST: '127.0.0.1',
    PORT: String(port),
    PMM_DATA_DIR: dataDir,
    PMM_RESEND_API_KEY: '',
    PMM_SMTP_HOST: '127.0.0.1',
    PMM_SMTP_PORT: String(smtpPort),
    PMM_SMTP_REQUIRE_TLS: '0',
    PMM_EMAIL_FROM: 'Liqu3D <mailer@example.com>',
    OPENSCAD_BIN: testOpenScad
  },
  stdio: ['ignore', 'ignore', 'pipe']
});
processChild.stderr.on('data', (chunk) => { childError += chunk.toString(); });
return processChild;
}
let childError = '';
let child = startServer();

async function waitForServer() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/healthz`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Auth test server did not start. ${childError}`);
}

async function request(pathname, { method = 'GET', cookie = '', body, origin } = {}) {
  const headers = {};
  if (cookie) headers.Cookie = cookie;
  if (origin) headers.Origin = origin;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${base}${pathname}`, {
    method,
    headers,
    redirect: 'manual',
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  return {
    status: response.status,
    location: response.headers.get('location'),
    setCookie: response.headers.get('set-cookie') || '',
    clearSiteData: response.headers.get('clear-site-data') || '',
    cookie: (response.headers.get('set-cookie') || '').split(';')[0],
    json: () => JSON.parse(text)
  };
}

try {
  await waitForServer();
  assert.equal((await request('/')).status, 200);
  assert.equal((await request('/login')).status, 200);
  assert.equal((await request('/signup')).status, 200);
  assert.equal((await request('/welcome.js')).status, 200);
  for (const [asset,type] of [['scad-maker-mark.svg','image/svg+xml'],['favicon.svg','image/svg+xml'],['favicon.ico','image/x-icon'],['apple-touch-icon.png','image/png']]) {
    const icon=await fetch(`${base}/${asset}`);
    assert.equal(icon.status,200,`${asset} must load before sign-in`);
    assert.equal(icon.headers.get('content-type'),type);
    assert.ok((await icon.arrayBuffer()).byteLength>100);
  }
  const protectedPage = await request('/app');
  assert.equal(protectedPage.status, 302);
  assert.equal(protectedPage.location, '/login');
  assert.equal((await request('/projects')).location, '/login');

  const password = 'correct horse battery staple';
  const firstSignupStart = await request('/api/auth/signup', {
    method: 'POST',
    body: { email: "o'hara@example.com", password }
  });
  assert.equal(firstSignupStart.status, 202);
  assert.equal(firstSignupStart.setCookie, '');
  const firstChallenge = firstSignupStart.json();
  assert.equal(firstChallenge.twoFactorRequired, true);
  assert.match(firstChallenge.challenge, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(firstChallenge.devCode, undefined);
  const firstCode = nextEmailCode();
  assert.equal((await request('/api/auth/session')).json().authenticated, false);
  const wrongCode = firstCode === '000000' ? '000001' : '000000';
  assert.equal((await request('/api/auth/verify-email-code', {
    method: 'POST', body: { challenge: firstChallenge.challenge, code: wrongCode }
  })).status, 401);
  const firstSignup = await request('/api/auth/verify-email-code', {
    method: 'POST', body: { challenge: firstChallenge.challenge, code: firstCode }
  });
  assert.equal(firstSignup.status, 200);
  assert.match(firstSignup.setCookie, /HttpOnly/i);
  assert.match(firstSignup.setCookie, /SameSite=Strict/i);
  assert.doesNotMatch(firstSignup.setCookie, /Max-Age=/i);
  assert.ok(firstSignup.cookie.startsWith('pmm_session='));

  const firstSession = await request('/api/auth/session', { cookie: firstSignup.cookie });
  assert.equal(firstSession.json().authenticated, true);
  const accountSettings = (await request('/api/account/settings', { cookie: firstSignup.cookie })).json();
  assert.equal(accountSettings.email, "o'hara@example.com");
  assert.deepEqual(accountSettings.twoFactor, { method: 'email', enabled: true });
  assert.equal(accountSettings.preferences.appearance.theme, 'system');
  assert.equal(accountSettings.preferences.workspace.autoSave, true);
  assert.equal(accountSettings.preferences.workspace.autoRegenerate, false);
  assert.equal(accountSettings.preferences.workspace.autoRegenerateDelaySeconds, 2);
  assert.equal(accountSettings.preferences.workspace.autoPosition, true);
  assert.equal(accountSettings.preferences.workspace.instantExport, false);
  assert.equal(accountSettings.activeSessions, 1);
  const profileUpdate = await request('/api/account/profile', {
    method: 'PATCH', cookie: firstSignup.cookie, body: { displayName: 'O Hara', email: "o'hara@example.com" }
  });
  assert.equal(profileUpdate.status, 200);
  assert.equal(profileUpdate.json().displayName, 'O Hara');
  assert.equal((await request('/api/account/profile', {
    method: 'PATCH', cookie: firstSignup.cookie, body: { displayName: 'O Hara', email: 'ohara-new@example.com', password: 'wrong password' }
  })).status, 401, 'Changing email must require the current password');
  const pendingEmailChange = await request('/api/account/profile', {
    method: 'PATCH', cookie: firstSignup.cookie, body: { displayName: 'O Hara', email: 'ohara-new@example.com', password }
  });
  assert.equal(pendingEmailChange.status, 202);
  const emailChange = pendingEmailChange.json();
  assert.equal(emailChange.emailChangeRequired, true);
  assert.equal((await request('/api/auth/session', { cookie: firstSignup.cookie })).json().user.email, "o'hara@example.com", 'Email must not change before the new address is verified');
  const emailChangeCode = nextEmailCode();
  const changedEmail = await request('/api/account/verify-email-change', {
    method: 'POST', cookie: firstSignup.cookie, body: { challenge: emailChange.challenge, code: emailChangeCode }
  });
  assert.equal(changedEmail.status, 200);
  assert.equal(changedEmail.json().email, 'ohara-new@example.com');
  assert.equal((await request('/api/auth/session', { cookie: firstSignup.cookie })).json().user.email, 'ohara-new@example.com');
  const pendingEmailRestore = await request('/api/account/profile', {
    method: 'PATCH', cookie: firstSignup.cookie, body: { displayName: 'O Hara', email: "o'hara@example.com", password }
  });
  assert.equal(pendingEmailRestore.status, 202);
  const restoreChallenge = pendingEmailRestore.json();
  const restoreCode = nextEmailCode();
  assert.equal((await request('/api/account/verify-email-change', {
    method: 'POST', cookie: firstSignup.cookie, body: { challenge: restoreChallenge.challenge, code: restoreCode }
  })).status, 200);
  const preferenceUpdate = await request('/api/account/preferences', {
    method: 'PATCH', cookie: firstSignup.cookie,
    body: { appearance: { theme: 'dark', accent: '#12ab34', reduceAnimations: true, density: 'compact' }, workspace: { autoSave: false, autoRegenerate: true, autoRegenerateDelaySeconds: 2.75, autoPosition: false, instantExport: true } }
  });
  assert.equal(preferenceUpdate.status, 200);
  assert.equal(preferenceUpdate.json().preferences.appearance.accent, '#12ab34');
  assert.equal(preferenceUpdate.json().preferences.workspace.autoSave, false);
  assert.equal(preferenceUpdate.json().preferences.workspace.autoRegenerate, true);
  assert.equal(preferenceUpdate.json().preferences.workspace.autoRegenerateDelaySeconds, 2.75);
  assert.equal(preferenceUpdate.json().preferences.workspace.autoPosition, false);
  assert.equal(preferenceUpdate.json().preferences.workspace.instantExport, true);
  assert.equal((await request('/api/account/settings', {cookie:firstSignup.cookie})).json().preferences.workspace.instantExport, true);
  const instantExportOff=await request('/api/account/preferences',{method:'PATCH',cookie:firstSignup.cookie,
    body:{...preferenceUpdate.json().preferences,workspace:{...preferenceUpdate.json().preferences.workspace,instantExport:false}}});
  assert.equal(instantExportOff.json().preferences.workspace.instantExport,false);
  assert.equal((await request('/api/account/settings', {cookie:firstSignup.cookie})).json().preferences.workspace.autoPosition, false);
  const sessionListing = await request('/api/account/sessions', { cookie: firstSignup.cookie });
  assert.equal(sessionListing.status, 200);
  assert.equal(sessionListing.json().sessions.length, 1);
  assert.equal(sessionListing.json().sessions[0].current, true);
  assert.equal((await request('/api/account/2fa', { method: 'POST', cookie: firstSignup.cookie, body: { enabled: false, password } })).status, 200);
  assert.equal((await request('/api/account/2fa', { method: 'POST', cookie: firstSignup.cookie, body: { enabled: true, password } })).status, 200);
  assert.equal((await request('/projects', { cookie: firstSignup.cookie })).status, 200);
  assert.equal((await request('/app', { cookie: firstSignup.cookie })).location, '/projects');
  assert.equal((await request('/', { cookie: firstSignup.cookie })).location, '/projects');
  assert.equal((await request('/login', { cookie: firstSignup.cookie })).location, '/projects');

  const workspaceName = "Desk'); DROP TABLE workspaces;--";
  const createdWorkspace = await request('/api/workspaces', {
    method: 'POST', cookie: firstSignup.cookie, body: { name: workspaceName }
  });
  assert.equal(createdWorkspace.status, 201);
  const workspaceId = createdWorkspace.json().id;
  assert.match(workspaceId, /^[0-9a-f-]{36}$/);
  assert.equal((await request(`/app?workspace=${workspaceId}`, { cookie: firstSignup.cookie })).status, 200);
  const savedWorkspace = await request(`/api/workspaces/${workspaceId}`, {
    method: 'PUT', cookie: firstSignup.cookie, body: {
      name: workspaceName,
      data: {
        activeViewPlateId: 'A',
        colorOptimization: { enabled:true, maxFilamentSlots:4, maxColorChanges:50 },
        loadedPlateIds: ['A'],
        batchPlateMeta: { A: { name: 'Plate A', hidden: false } },
        printProfile: {
          name: 'Workspace profile', printer: 'p1s', nozzleDiameter: 0.4,
          bedType: 'Textured PEI', filamentColor: '#ffffff', settings: { layer_height: 0.28 }
        },
        plates: [{
          sourceInstanceId: 'source_test', sourceName: 'saved.scad', source: 'size = 10; cube(size);',
          defaultPlateId: 'A', values: { size: 14 }, objectTransforms: { model: { x: 2, z: 3 } }
        }]
      }
    }
  });
  assert.equal(savedWorkspace.status, 200);
  assert.equal(savedWorkspace.json().scadCount, 1);
  const reopenedWorkspace = (await request(`/api/workspaces/${workspaceId}`, { cookie: firstSignup.cookie })).json();
  assert.equal(reopenedWorkspace.name, workspaceName);
  assert.deepEqual(reopenedWorkspace.data.colorOptimization,{enabled:true,maxFilamentSlots:4,maxColorChanges:50});
  assert.equal(reopenedWorkspace.data.plates[0].source, 'size = 10; cube(size);');
  assert.deepEqual(reopenedWorkspace.data.plates[0].objectTransforms.model, { x: 2, z: 3 });
  assert.equal(reopenedWorkspace.data.printProfile.settings.layer_height, 0.28);
  const bootStarted = performance.now();
  const bootstrapResponse = await fetch(`${base}/api/workspaces/${workspaceId}/bootstrap`, { headers: { Cookie: firstSignup.cookie, 'Accept-Encoding': 'gzip' } });
  assert.equal(bootstrapResponse.status, 200);
  assert.equal(bootstrapResponse.headers.get('content-encoding'), 'gzip');
  const bootstrap = await bootstrapResponse.json();
  assert.deepEqual(bootstrap.workspace.data, reopenedWorkspace.data);
  assert.equal(bootstrap.user.preferences.appearance.accent, '#12ab34');
  assert.equal(bootstrap.models.length, 1);
  assert.equal(bootstrap.models[0].parameters[0].name, 'size');
  assert.equal(bootstrap.models[0].localFonts, undefined, 'Font discovery must not block workspace hydration');
  console.log(`Combined workspace bootstrap: ${Math.round(performance.now() - bootStarted)} ms.`);
  const script = await fetch(`${base}/app.js?v=1.0.0`, { headers: { Cookie: firstSignup.cookie, 'Accept-Encoding': 'gzip' } });
  assert.equal(script.headers.get('content-encoding'), 'gzip');
  const scriptText = await script.text();
  assert.ok(Number(script.headers.get('content-length')) < Buffer.byteLength(scriptText) / 2);
  const revalidated = await fetch(`${base}/app.js?v=1.0.0`, { headers: { Cookie: firstSignup.cookie, 'Accept-Encoding': 'gzip', 'If-None-Match': script.headers.get('etag') } });
  assert.equal(revalidated.status, 304);
  const workspaceHistory = (await request(`/api/workspaces/${workspaceId}/revisions`, { cookie: firstSignup.cookie })).json().revisions;
  assert.equal(workspaceHistory.length, 2);
  assert.equal(workspaceHistory[0].scadCount, 1);
  assert.equal(workspaceHistory[1].scadCount, 0);
  const restoredEmpty = await request(`/api/workspaces/${workspaceId}/revisions/${workspaceHistory[1].id}/restore`, {
    method: 'POST', cookie: firstSignup.cookie, body: {}
  });
  assert.equal(restoredEmpty.status, 200);
  assert.equal(restoredEmpty.json().data.plates.length, 0);
  const restoredSaved = await request(`/api/workspaces/${workspaceId}/revisions/${workspaceHistory[0].id}/restore`, {
    method: 'POST', cookie: firstSignup.cookie, body: {}
  });
  assert.equal(restoredSaved.status, 200);
  assert.equal(restoredSaved.json().data.plates[0].sourceName, 'saved.scad');

  const renderSource = 'radius = 3;\n$fn = 96;\nsphere(radius);';
  let lastCacheHit = null;
  const renderRequest = async (endpoint, radius) => {
    const response = await fetch(`${base}${endpoint}`, {
      method: 'POST',
      headers: { Cookie: firstSignup.cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: renderSource, sourceName: 'load-test.scad', values: { radius } })
    });
    assert.equal(response.status, 200, await response.clone().text());
    lastCacheHit = response.headers.get('x-render-cache');
    const data = Buffer.from(await response.arrayBuffer());
    assert.ok(data.length > 84);
    assert.equal(data.length, 84 + data.readUInt32LE(80) * 50, 'Expected a complete binary STL');
    return data;
  };
  const loadStarted = performance.now();
  const previews = await Promise.all(Array.from({ length: 40 }, (_, index) => renderRequest('/api/render', 3 + index / 10)));
  const cachedPreview = await renderRequest('/api/render', 3);
  assert.deepEqual(cachedPreview, previews[0]);
  assert.equal(lastCacheHit, 'memory');
  const exported = await renderRequest('/api/export?format=stl', 3);
  assert.ok(exported.readUInt32LE(80) > previews[0].readUInt32LE(80), 'Exports must retain full tessellation');
  console.log(`40 simultaneous small-model previews completed in ${Math.round(performance.now() - loadStarted)} ms; cache and full-quality exports verified.`);
  child.kill('SIGTERM');
  await new Promise((resolve) => child.once('exit', resolve));
  const migrationDb = new DatabaseSync(path.join(dataDir, 'accounts.sqlite'));
  const legacySettings = { appearance: { theme: 'dark' }, workspace: { autoSave: false, autoRegenerate: true, autoPosition: false, instantExport: true, retained: 'keep' } };
  const legacyUsers = [JSON.stringify(legacySettings), '{invalid', '{"workspace":null}', '[]'];
  const insertLegacy = migrationDb.prepare('INSERT INTO users(email,password_salt,password_hash,email_verified_at,settings_json,generation_defaults_version,created_at) VALUES(?,?,?, ?,?,1,?)');
  legacyUsers.forEach((settings,index)=>insertLegacy.run(`legacy-${index}@example.test`,'unused','unused',Date.now(),settings,Date.now()));
  migrationDb.close();
  child = startServer();
  await waitForServer();
  const migratedDb = new DatabaseSync(path.join(dataDir, 'accounts.sqlite'), { readOnly: true });
  for(const [index,row] of migratedDb.prepare("SELECT settings_json,generation_defaults_version FROM users WHERE email LIKE 'legacy-%@example.test' ORDER BY email").all().entries()) {
    const settings=JSON.parse(row.settings_json);
    assert.deepEqual(settings.workspace,{autoSave:true,autoRegenerate:false,autoPosition:true,instantExport:false,...(index===0?{retained:'keep'}:{})});
    assert.equal(row.generation_defaults_version,2);
    if(index===0)assert.deepEqual(settings.appearance,legacySettings.appearance,'Migration preserves unrelated preferences');
  }
  migratedDb.close();
  assert.deepEqual((await request('/api/account/settings', {cookie:firstSignup.cookie})).json().preferences,instantExportOff.json().preferences,'Saved choices after the defaults update survive a restart');
  // Probe the runtime before timing geometry restoration (normal bootstrap does this).
  assert.equal((await request(`/api/workspaces/${workspaceId}/bootstrap`, { cookie: firstSignup.cookie })).status, 200);
  const reopenStarted = performance.now();
  assert.deepEqual(await renderRequest('/api/render', 3), previews[0]);
  assert.equal(lastCacheHit, 'disk', 'A server restart must reuse saved geometry without starting OpenSCAD');
  console.log(`Geometry restored after server restart: ${Math.round(performance.now() - reopenStarted)} ms.`);
  const solidSource = `render_part="all";\nexport_single_design=1;\npmm_objects=[[1,"Box"]];\nmodule placed_design(i) { if (render_part=="base") color("red") cube([10,10,2]); else color("blue") translate([0,0,2]) cube([10,10,1]); }\n// GENERATED RENDER BLOCK START\nplaced_design(export_single_design);\n// GENERATED RENDER BLOCK END\n`;
  const solidResponse = await fetch(`${base}/api/render-object?id=1&format=3mf`, {
    method: 'POST', headers: { Cookie: firstSignup.cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: solidSource, sourceName: 'solids.scad', values: {}, solidParts: ['base', 'tag_text'] })
  });
  if (solidResponse.status === 422) {
    const unavailable = await solidResponse.json();
    assert.match(unavailable.error, /current OpenSCAD|lazy-union/i);
  } else {
    assert.equal(solidResponse.status, 200, await solidResponse.clone().text());
    const solids = readSolid3mf(await solidResponse.arrayBuffer(), (xml) => new DOMParser().parseFromString(xml, 'application/xml'));
    assert.equal(solids.length, 2, 'Batched export must retain distinct closed colour parts');
    assert.equal(new Set(solids.flatMap((solid) => solid.colors)).size, 2, 'Batched parts must retain their original colours');
  }
  const invalidBatch = await request('/api/render-object?id=1&format=3mf', { method: 'POST', cookie: firstSignup.cookie, body: { source: solidSource, values: {}, solidParts: ['not-a-part'] } });
  assert.equal(invalidBatch.status, 400);
  await renderRequest('/api/render', 33);
  assert.equal(lastCacheHit, null, 'Changed geometry parameters must generate a new result');

  const previewStart = await request(`/api/workspaces/${workspaceId}/preview`, {
    method: 'POST', cookie: firstSignup.cookie, body: {}
  });
  assert.equal(previewStart.status, 202);
  let previewWorkspace = null;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const listing = (await request('/api/workspaces', { cookie: firstSignup.cookie })).json().workspaces;
    previewWorkspace = listing.find((workspace) => workspace.id === workspaceId);
    if (['ready', 'failed'].includes(previewWorkspace?.previewStatus)) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(previewWorkspace?.previewStatus, 'ready', childError || 'Workspace preview did not become ready.');
  assert.equal(previewWorkspace?.hasPreview, true);
  assert.equal((await request(`/api/workspaces/${workspaceId}/preview.webp`, { cookie: firstSignup.cookie })).status, 200);
  assert.equal((await request(`/api/workspaces/${workspaceId}/preview.webp`)).status, 401);
  const previewHash = previewWorkspace.previewHash;
  const renamedWorkspace = await request(`/api/workspaces/${workspaceId}`, {
    method: 'PUT', cookie: firstSignup.cookie, body: { name: 'Renamed only', data: reopenedWorkspace.data }
  });
  assert.equal(renamedWorkspace.status, 200);
  const afterRename = (await request('/api/workspaces', { cookie: firstSignup.cookie })).json().workspaces
    .find((workspace) => workspace.id === workspaceId);
  assert.equal(afterRename.previewStatus, 'ready');
  assert.equal(afterRename.previewHash, previewHash);

  const oldPreviewBytes = Buffer.from(await (await fetch(`${base}/api/workspaces/${workspaceId}/preview.webp`, { headers: { Cookie: firstSignup.cookie } })).arrayBuffer());
  const accentedPreferences = {
    ...preferenceUpdate.json().preferences,
    appearance: { ...preferenceUpdate.json().preferences.appearance, accent: '#d34a19' }
  };
  assert.equal((await request('/api/account/preferences', {
    method: 'PATCH', cookie: firstSignup.cookie, body: accentedPreferences
  })).status, 200);
  const accentDirty = (await request('/api/workspaces', { cookie: firstSignup.cookie })).json().workspaces.find((workspace) => workspace.id === workspaceId);
  assert.equal(accentDirty.previewStatus, 'dirty');
  assert.equal(accentDirty.previewOutdated, true);
  await request(`/api/workspaces/${workspaceId}/preview`, { method: 'POST', cookie: firstSignup.cookie, body: {} });
  let accentPreview;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    accentPreview = (await request('/api/workspaces', { cookie: firstSignup.cookie })).json().workspaces.find((workspace) => workspace.id === workspaceId);
    if (['ready', 'failed'].includes(accentPreview.previewStatus)) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(accentPreview.previewStatus, 'ready');
  assert.notEqual(accentPreview.previewHash, previewHash, 'Accent changes must bypass the old image cache');
  const newPreviewBytes = Buffer.from(await (await fetch(`${base}/api/workspaces/${workspaceId}/preview.webp`, { headers: { Cookie: firstSignup.cookie } })).arrayBuffer());
  assert.notDeepEqual(newPreviewBytes, oldPreviewBytes, 'Rendered image must actually change color');
  assert.deepEqual((await request(`/api/workspaces/${workspaceId}`, { cookie: firstSignup.cookie })).json().data, reopenedWorkspace.data, 'Accent changes must preserve the saved design');
  await request('/api/account/preferences', { method: 'PATCH', cookie: firstSignup.cookie, body: accentedPreferences });
  const unchangedAccent = (await request('/api/workspaces', { cookie: firstSignup.cookie })).json().workspaces.find((workspace) => workspace.id === workspaceId);
  assert.equal(unchangedAccent.previewStatus, 'ready');
  assert.equal(unchangedAccent.previewHash, accentPreview.previewHash, 'Saving the same accent must reuse the existing render');

  const injectionName = "Desk'); DROP TABLE users;--";
  const saved = await request('/api/print-profiles', {
    method: 'POST',
    cookie: firstSignup.cookie,
    body: { profile: { name: injectionName } }
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.json().profile.name, injectionName);
  const exportProfile = await request('/api/export-profile', { method: 'POST', cookie: firstSignup.cookie, body: { profile: { printer: 'p1s' } } });
  assert.equal(exportProfile.status, 200);
  assert.ok(exportProfile.json().template?.machineName || exportProfile.json().warning);
  assert.equal((await request('/api/export-profile', { method: 'POST', body: { profile: {} } })).status, 401);

  const secondSignupStart = await request('/api/auth/signup', {
    method: 'POST',
    body: { email: 'second@example.com', password: 'a different secure passphrase' }
  });
  assert.equal(secondSignupStart.status, 202);
  const secondChallenge = secondSignupStart.json();
  const secondCode = nextEmailCode();
  const secondSignup = await request('/api/auth/verify-email-code', {
    method: 'POST', body: { challenge: secondChallenge.challenge, code: secondCode }
  });
  assert.equal(secondSignup.status, 200);

  const duplicateSignup = await request('/api/auth/signup', {
    method: 'POST', body: { email: "o'hara@example.com", password: 'another secure password value' }
  });
  assert.equal(duplicateSignup.status, 202);
  const duplicatePayload = duplicateSignup.json();
  assert.equal(duplicatePayload.twoFactorRequired, true);
  assert.equal(duplicatePayload.devCode, undefined);

  const existingSignupStart = await request('/api/auth/signup', {
    method: 'POST', body: { email: "o'hara@example.com", password }
  });
  assert.equal(existingSignupStart.status, 202);
  const existingSignupChallenge = existingSignupStart.json();
  const existingSignupCode = nextEmailCode();
  assert.equal((await request('/api/auth/verify-email-code', {
    method: 'POST', body: { challenge: existingSignupChallenge.challenge, code: existingSignupCode }
  })).status, 200);

  const pendingSignupOne = (await request('/api/auth/signup', {
    method: 'POST', body: { email: 'pending@example.com', password: 'first pending password' }
  })).json();
  const pendingCodeOne = nextEmailCode();
  const pendingSignupTwo = (await request('/api/auth/signup', {
    method: 'POST', body: { email: 'pending@example.com', password: 'replacement pending password' }
  })).json();
  const pendingCodeTwo = nextEmailCode();
  assert.equal((await request('/api/auth/verify-email-code', {
    method: 'POST', body: { challenge: pendingSignupOne.challenge, code: pendingCodeOne }
  })).status, 200);
  assert.equal((await request('/api/auth/verify-email-code', {
    method: 'POST', body: { challenge: pendingSignupTwo.challenge, code: pendingCodeTwo }
  })).status, 401);
  const firstProfiles = await request('/api/print-profiles', { cookie: firstSignup.cookie });
  const secondProfiles = await request('/api/print-profiles', { cookie: secondSignup.cookie });
  assert.equal(firstProfiles.json().profiles.length, 1);
  assert.equal(secondProfiles.json().profiles.length, 0);
  assert.equal((await request('/api/workspaces', { cookie: firstSignup.cookie })).json().workspaces.length, 1);
  assert.equal((await request('/api/workspaces', { cookie: secondSignup.cookie })).json().workspaces.length, 0);
  assert.equal((await request(`/api/workspaces/${workspaceId}`, { cookie: secondSignup.cookie })).status, 404);
  assert.equal((await request(`/api/workspaces/${workspaceId}/bootstrap`, { cookie: secondSignup.cookie })).status, 404);
  assert.equal((await request(`/api/workspaces/${workspaceId}/bootstrap`)).status, 401);
  assert.equal((await request(`/api/workspaces/${workspaceId}/revisions`, { cookie: secondSignup.cookie })).status, 404);
  assert.equal((await request(`/api/workspaces/${workspaceId}/revisions/${workspaceHistory[0].id}/restore`, {
    method: 'POST', cookie: secondSignup.cookie, body: {}
  })).status, 404);

  const storage = (await request('/api/account/storage', {cookie:firstSignup.cookie})).json();
  assert.equal(storage.usedBytes, storage.groups.reduce((sum,group)=>sum+group.bytes,0), 'Storage tree must account for the entire quota');
  assert.equal(storage.limitBytes, 2 * 1024 ** 3);
  const storageWorkspace=storage.groups.flatMap(group=>group.children).find(item=>item.kind==='workspaces'&&item.id===workspaceId);
  assert.ok(storageWorkspace.children.some(item=>item.kind==='workspace_revisions'), 'Revisions are nested beneath their workspace');
  assert.equal((await request('/api/account/storage', {cookie:secondSignup.cookie})).json().groups.length,0);
  assert.equal((await request('/api/account/storage', {method:'POST',cookie:secondSignup.cookie,body:{...storageWorkspace,confirm:true}})).status,404,'Storage deletion is account scoped');
  assert.equal((await request('/api/account/storage', {method:'POST',cookie:firstSignup.cookie,body:{...storageWorkspace,confirm:false}})).status,400,'Deletion requires confirmation');
  const storageScratch=(await request('/api/workspaces',{method:'POST',cookie:firstSignup.cookie,body:{name:'Storage deletion test'}})).json();
  const beforeStorageDelete=(await request('/api/account/storage',{cookie:firstSignup.cookie})).json();
  const scratchItem=beforeStorageDelete.groups.flatMap(group=>group.children).find(item=>item.kind==='workspaces'&&item.id===storageScratch.id);
  const storageDelete=await request('/api/account/storage',{method:'POST',cookie:firstSignup.cookie,body:{...scratchItem,confirm:true}});
  assert.equal(storageDelete.status,200);
  assert.ok(storageDelete.json().usedBytes<beforeStorageDelete.usedBytes);
  assert.equal((await request(`/api/workspaces/${storageScratch.id}`,{cookie:firstSignup.cookie})).status,404);

  const disposableWorkspace = await request('/api/workspaces', {
    method: 'POST', cookie: firstSignup.cookie, body: { name: 'Delete me' }
  });
  assert.equal(disposableWorkspace.status, 201);
  const disposableWorkspaceId = disposableWorkspace.json().id;
  assert.equal((await request(`/api/workspaces/${disposableWorkspaceId}`, {
    method: 'DELETE', cookie: secondSignup.cookie
  })).status, 404, 'Another account must not be able to delete a workspace');
  const deletedWorkspace = await request(`/api/workspaces/${disposableWorkspaceId}`, {
    method: 'DELETE', cookie: firstSignup.cookie
  });
  assert.equal(deletedWorkspace.status, 200);
  assert.equal(deletedWorkspace.json().deleted, true);
  assert.equal((await request(`/api/workspaces/${disposableWorkspaceId}`, { cookie: firstSignup.cookie })).status, 404);
  assert.equal((await request(`/api/workspaces/${disposableWorkspaceId}`, {
    method: 'DELETE', cookie: firstSignup.cookie
  })).status, 404);
  assert.equal((await request('/api/workspaces', { cookie: firstSignup.cookie })).json().workspaces.length, 1);

  const wrongOrigin = await request('/api/print-profiles', {
    method: 'POST',
    cookie: firstSignup.cookie,
    origin: 'https://evil.example.com',
    body: { profile: { name: 'Blocked' } }
  });
  assert.equal(wrongOrigin.status, 403);

  assert.equal((await request('/api/auth/login', {
    method: 'POST', body: { email: "o'hara@example.com", password: 'incorrect password' }
  })).status, 401);
  const loginStart = await request('/api/auth/login', {
    method: 'POST', body: { email: "o'hara@example.com", password }
  });
  assert.equal(loginStart.status, 202);
  assert.equal(loginStart.setCookie, '');
  const loginChallenge = loginStart.json();
  const loginCode = nextEmailCode();
  const verifiedLogin = await request('/api/auth/verify-email-code', {
    method: 'POST', body: { challenge: loginChallenge.challenge, code: loginCode, remember: true }
  });
  assert.equal(verifiedLogin.status, 200);
  assert.ok(verifiedLogin.cookie.startsWith('pmm_session='));
  assert.match(verifiedLogin.setCookie, /Max-Age=2592000/i);

  const revokedSessions = await request('/api/account/sessions/revoke-others', {
    method: 'POST', cookie: verifiedLogin.cookie, body: { password }
  });
  assert.equal(revokedSessions.status, 200);
  assert.ok(revokedSessions.json().revoked >= 1);
  assert.equal((await request('/api/auth/session', { cookie: firstSignup.cookie })).json().authenticated, false);

  const logout = await request('/api/auth/logout', {
    method: 'POST', cookie: verifiedLogin.cookie, body: {}
  });
  assert.equal(logout.status, 200);
  assert.match(logout.setCookie, /Max-Age=0/i);
  assert.match(logout.clearSiteData, /storage/i);
  assert.equal((await request(`/app?workspace=${workspaceId}`, { cookie: verifiedLogin.cookie })).status, 302);

  child.kill('SIGTERM');
  await new Promise((resolve) => child.once('exit', resolve));
  const db = new DatabaseSync(path.join(dataDir, 'accounts.sqlite'), { readOnly: true });
  const account = db.prepare('SELECT password_salt, password_hash, password_version, email_verified_at FROM users WHERE email = ?').get("o'hara@example.com");
  const storedSession = db.prepare('SELECT token_hash FROM sessions LIMIT 1').get();
  const remainingChallenges = db.prepare('SELECT COUNT(*) AS count FROM login_challenges').get();
  db.close();
  assert.notEqual(account.password_hash, password);
  assert.ok(Buffer.from(account.password_hash, 'base64').length === 64);
  assert.ok(Buffer.from(account.password_salt, 'base64').length === 16);
  assert.equal(Number(account.password_version), 3);
  assert.ok(Number(account.email_verified_at) > 0);
  assert.ok(!firstSignup.cookie.includes(storedSession?.token_hash || 'not-present'));
  assert.equal(Number(remainingChallenges.count), 0);
  console.log('Account, SMTP email 2FA, workspace, session, isolation, CSRF, and SQL-injection resistance tests passed.');
} finally {
  if (child.exitCode === null) child.kill('SIGTERM');
  smtpServer.close();
  await fs.rm(dataDir, { recursive: true, force: true });
}
