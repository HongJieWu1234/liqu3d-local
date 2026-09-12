import './setup.mjs';
import assert from 'node:assert/strict';
import { setTimeout as pause } from 'node:timers/promises';
import { localVmResources, workerCapacity } from '../lib/render-resources.mjs';
import { parallelWork } from '../lib/parallel-work.mjs';
import { generateInstant } from '../lib/instant-generation.mjs';
import { renderExportRecipe } from '../lib/export-history.mjs';
import { createDefaultProfile } from '../public/print-settings-schema.js';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { packCore3mf } from '../public/core-3mf.js';

assert.deepEqual(localVmResources(12, 24 * 1024 ** 3), { cpus: 8, memory: 12 });
assert.deepEqual(localVmResources(4, 8 * 1024 ** 3), { cpus: 2, memory: 4 });
assert.equal(workerCapacity({ NCPU: 8, MemTotal: 12 * 1024 ** 3 }), 8);
assert.equal(workerCapacity({ NCPU: 16, MemTotal: 6 * 1024 ** 3 }), 5, 'RAM bounds concurrency independently of CPUs');
assert.equal(workerCapacity({ NCPU: 8, MemTotal: 12 * 1024 ** 3 }, { memory: '4096m' }), 2);
assert.equal(workerCapacity({ NCPU: 1, MemTotal: 2 * 1024 ** 3 }), 1);
let active = 0, peak = 0;
const results = await parallelWork([30, 5, 15, 1], 2, async (delay, index) => {
  active++; peak = Math.max(peak, active);
  await pause(delay); active--; return index;
});
assert.deepEqual(results, [0, 1, 2, 3]); assert.equal(peak, 2);
let settled = false;
await assert.rejects(parallelWork([0, 1, 2], 2, async (value, _index, signal) => {
  if (!value) { await pause(5); throw new Error('Render failed'); }
  try { await pause(50, null, { signal }); } finally { settled = true; }
}), /Render failed/);
assert.equal(settled, true, 'Sibling work drains before geometry can be disposed');
const aborted = new AbortController(); aborted.abort(new Error('User cancelled'));
await assert.rejects(parallelWork([1], 2, () => assert.fail('Cancelled job started'), aborted.signal), /User cancelled/);

const profile = createDefaultProfile();
const template = { config: { layer_height: '0.2', nozzle_diameter: ['0.4'], filament_density: ['1.24'], printer_settings_id: 'Bambu Lab P1S 0.4 nozzle' }, filament: { filament_type: ['PLA'] }, filamentName: 'Generic PLA', filamentId: 'GFL99', hotendCount: 1, nozzleDiameters: [.4] };
const snapshot = { name: 'Parallel designs', source: 'size=1; cube(size);', entry: 'model.scad', printProfile: profile,
  group: { key: 'model', memberIds: [] }, resolved: { orderCount: 3, objectCount: 4, objects: [1, 2, 1, 3].map((size, index) => ({ values: { size }, order: index + 1, copy: 1 })) } };
let calls = 0, failSize;
const render = async (values, _format, extra) => {
  calls++; active++; peak = Math.max(peak, active);
  try {
    await pause(values.size === 1 ? 25 : 5, null, { signal: extra.signal });
    if (values.size === failSize) throw new Error('Invalid model');
    const geometry = new BoxGeometry(values.size * 10, 10, 2);
    try { return packCore3mf({ palette: ['#FF0000'], objects: [{ parts: [{ geometry, materialIndex: 0 }] }] }); }
    finally { geometry.dispose(); }
  } finally { active--; }
};
const options = { render, profileTemplate: async () => template, signal: new AbortController().signal, progress: async () => {} };
const serial = await generateInstant(snapshot, { ...options, concurrency: 1 });
peak = calls = 0;
const progress = [];
const parallel = await generateInstant(snapshot, { ...options, concurrency: 2, progress: async (done, total, stage) => { if (stage === 'Rendering') progress.push(done); } });
assert.equal(calls, 3, 'Identical copies must share one render even during a batch');
assert.equal(peak, 2); assert.equal(parallel.objectCount, 4);
assert.deepEqual(progress, [...progress].sort((a,b) => a-b)); assert.equal(progress.at(-1), 4);
assert.deepEqual(parallel.recipe.requests, serial.recipe.requests);
assert.deepEqual(parallel.recipe.objects.map(({ id, ...rest }) => rest), serial.recipe.objects.map(({ id, ...rest }) => rest), 'Completion order must not change order, counts, placement or colours');
peak = calls = 0;
const recipe = { ...parallel.recipe, template, sources: [{ source: snapshot.source, sourceName: 'model.scad', dependencies: [] }] };
const serialExport = await renderExportRecipe(recipe, { render, concurrency: 1 });
peak = calls = 0;
const parallelExport = await renderExportRecipe(recipe, { render, concurrency: 2 });
assert.equal(calls, 3); assert.equal(peak, 2);
assert.equal(parallelExport.fingerprint, serialExport.fingerprint, 'Parallel exports must preserve all printable content');
assert.deepEqual(parallelExport.estimate, serialExport.estimate);
assert.deepEqual(parallelExport.preview, serialExport.preview);
failSize = 2;
const partial = await generateInstant(snapshot, { ...options, concurrency: 2 });
assert.equal(partial.objectCount, 3); assert.equal(partial.skippedCount, 1);
await assert.rejects(renderExportRecipe(recipe, { render, concurrency: 2 }), /Invalid model/);
assert.equal(active, 0);
console.log('Parallel generation passed: bounded work, duplicate reuse, ordered placement, identical exports/previews/estimates, cancellation and partial failures.');
