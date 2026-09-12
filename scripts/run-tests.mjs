import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const runtimeTests = new Map([
  ['test-parser-runtime.mjs', 'OpenSCAD CLI (OPENSCAD_BIN or openscad)'],
  ['test-instant-container.mjs', 'Docker daemon and built worker image'],
  ['test-export-history-api.mjs', 'live renderer (PMM_RENDERER_URL or localhost:4180)'],
  ['test-settings-preview-api.mjs', 'live renderer (PMM_RENDERER_URL or localhost:4180)'],
  ['test-instant-packing-api.mjs', 'live renderer (PMM_RENDERER_URL or localhost:4180)'],
  ['test-export-native.mjs', 'PMM_EXPORT_WORKSPACE_ID, saved workspace database and OpenSCAD CLI']
]);
const args = process.argv.slice(2);
if (args.some(arg => !['all', 'runtime', '--list'].includes(arg)) || (args.includes('all') && args.includes('runtime'))) {
  console.error('Usage: node scripts/run-tests.mjs [all|runtime] [--list]');
  process.exit(2);
}
const runtime = args.includes('runtime');
const files = (await fs.readdir(new URL('../tests/', import.meta.url)))
  .filter(name => /^test-.*\.mjs$/.test(name)).sort();
const selected = [];
for (const file of files) {
  if (runtimeTests.has(file) !== runtime) {
    if (!runtime) console.log(`SKIP ${file}: ${runtimeTests.get(file)} (npm run test:runtime).`);
    continue;
  }
  if (file === 'test-export-native.mjs' && !process.env.PMM_EXPORT_WORKSPACE_ID) {
    console.log(`SKIP ${file}: ${runtimeTests.get(file)}.`);
    continue;
  }
  selected.push(file);
}
console.log(`${runtime ? 'Runtime' : 'Local regression'} suite: ${selected.length} test files.`);
if (!runtime) console.log('Native prerequisites: OpenSCAD, Fontconfig, ImageMagick, zip/unzip and local Bambu profiles. Tests start temporary services; environment flags can enable additional integrations.');
if (args.includes('--list')) {
  console.log(selected.join('\n'));
  process.exit(0);
}

// Each file gets its own process: fixtures change cwd, environment and SQLite state.
const failures = [];
for (const file of selected) {
  console.log(`\nRUN ${file}`);
  const result = spawnSync(process.execPath, [`tests/${file}`], { cwd: projectRoot, stdio: 'inherit' });
  if (result.signal) {
    console.error(`Stopped by ${result.signal} during ${file}.`);
    process.exit(1);
  }
  if (result.status !== 0) {
    failures.push(file);
    if (result.error) console.error(result.error.message);
  }
}
console.log(`\n${selected.length - failures.length} passed, ${failures.length} failed (${selected.length} test files).`);
if (failures.length) console.error(`Failed: ${failures.join(', ')}`);
process.exitCode = failures.length ? 1 : 0;
