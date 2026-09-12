import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { makeRelease } from '../scripts/make-release.mjs';

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-release-test-'));
try {
  const output = path.join(dir, 'v1.zip');
  await makeRelease(output);
  const { stdout } = await promisify(execFile)('unzip', ['-Z1', output], { maxBuffer: 8 * 1024 * 1024 });
  const entries = stdout.trim().split(/\r?\n/).filter(Boolean);
  assert.ok(entries.some((name) => /server\.mjs$/.test(name)));
  assert.ok(entries.some((name) => /renderer-service\.mjs$/.test(name)));
  assert.ok(entries.some((name) => /secrets\/README\.txt$/.test(name)));
  assert.ok(entries.some((name) => /data\/\.gitkeep$/.test(name)));
  assert.ok(entries.every((name) => !/accounts\.sqlite/i.test(name)));
  assert.ok(entries.every((name) => !/secrets\/(?!README\.txt$)[^/]+$/.test(name)));
  assert.ok(entries.every((name) => !/node_modules\//.test(name)));
  assert.ok(entries.every((name) => !/(^|\/)\.env(?:\.cloudflare)?$/.test(name)));
  const licenseText = await fs.readFile(new URL('../LICENSE', import.meta.url), 'utf8');
  const packageJson = JSON.parse(await fs.readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(licenseText, /PROPRIETARY HOSTED-SERVICE NOTICE/);
  assert.match(licenseText, /All rights reserved/i);
  assert.match(licenseText, /hosted online\s+service/i);
  assert.match(licenseText, /does not grant a general software\s+license/i);
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.license, 'UNLICENSED');
  console.log(`Release packaging test passed: ${entries.length} clean entries, no secrets/database/runtime dependencies.`);
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
