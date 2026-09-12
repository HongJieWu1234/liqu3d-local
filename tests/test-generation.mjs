import './setup.mjs';
import { effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot } from '../public/object-render-state.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { PreviewPrefetch } from '../public/preview-prefetch.js';
import { RenderScheduler, SharedRenders } from '../lib/render-scheduler.mjs';

const pause = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
const scheduler = new RenderScheduler({ concurrency: 12, maxQueued: 512 });
let peak = 0;
let completed = 0;
await Promise.all(Array.from({ length: 40 }, (_, owner) => Array.from({ length: 8 }, async () => {
  const release = await scheduler.acquire({ owner });
  peak = Math.max(peak, scheduler.active);
  await pause(2);
  completed += 1;
  release();
  release(); // Release must be idempotent.
})).flat());
assert.equal(completed, 320);
assert.equal(peak, 12);
assert.equal(scheduler.active, 0);
assert.equal(scheduler.queue.length, 0);

const fair = new RenderScheduler({ concurrency: 2, maxQueued: 10 });
const releaseA1 = await fair.acquire({ owner: 'A' });
const releaseA2 = await fair.acquire({ owner: 'A' });
const order = [];
const queuedA = fair.acquire({ owner: 'A' }).then((release) => { order.push('A'); release(); });
const queuedB = fair.acquire({ owner: 'B' }).then((release) => { order.push('B'); release(); });
releaseA1();
await Promise.all([queuedA, queuedB]);
assert.deepEqual(order, ['B', 'A']);
releaseA2();

// Weighted capacity: a full render can reserve two of three slots while one
// preview still runs; another full render must wait until capacity is released.
const weighted = new RenderScheduler({ concurrency: 3, maxQueued: 10 });
const releaseFull = await weighted.acquire({ owner: 'full', weight: 2, priority: -1 });
const releasePreview = await weighted.acquire({ owner: 'preview', weight: 1 });
assert.equal(weighted.active, 2);
assert.equal(weighted.activeWeight, 3);
let secondFullStarted = false;
const secondFull = weighted.acquire({ owner: 'full-2', weight: 2 }).then((release) => { secondFullStarted = true; release(); });
await pause();
assert.equal(secondFullStarted, false);
releasePreview();
await pause();
assert.equal(secondFullStarted, false, 'Two-slot render should still wait while only one slot is free');
releaseFull();
await secondFull;
assert.equal(weighted.activeWeight, 0);

const priorityDrain = new RenderScheduler({ concurrency: 3, maxQueued: 10 });
const releaseExistingPreview = await priorityDrain.acquire({ owner: 'preview-existing', weight: 1 });
let heavyStarted = false;
let laterPreviewStarted = false;
const heavy = priorityDrain.acquire({ owner: 'export', weight: 3, priority: -1 }).then((release) => { heavyStarted = true; release(); });
const laterPreview = priorityDrain.acquire({ owner: 'preview-later', weight: 1, priority: 0 }).then((release) => { laterPreviewStarted = true; release(); });
await pause();
assert.equal(heavyStarted, false);
assert.equal(laterPreviewStarted, false, 'Lower-priority previews must not starve a waiting full export');
releaseExistingPreview();
await heavy;
await laterPreview;
assert.equal(heavyStarted, true);
assert.equal(laterPreviewStarted, true);

const bounded = new RenderScheduler({ concurrency: 1, maxQueued: 1 });
const releaseHeld = await bounded.acquire();
const canceled = new AbortController();
const waiting = bounded.acquire({ signal: canceled.signal });
await assert.rejects(bounded.acquire(), { code: 'SERVER_BUSY' });
canceled.abort();
await assert.rejects(waiting, { name: 'AbortError' });
assert.equal(bounded.queue.length, 0);
releaseHeld();

const shared = new SharedRenders();
let executions = 0;
const results = await Promise.all(Array.from({ length: 40 }, () => shared.run('same-config', async () => {
  executions += 1;
  await pause(2);
  return 'geometry';
})));
assert.equal(executions, 1);
assert.equal(results.length, 40);
assert.equal(shared.jobs.size, 0);

let completeShared;
const leader = new AbortController();
let sharedSignal;
const first = shared.run('cancel-one', async (signal) => {
  sharedSignal = signal;
  return new Promise((resolve) => { completeShared = resolve; });
}, leader.signal);
const follower = shared.run('cancel-one', () => { throw new Error('Duplicate render'); });
await pause();
leader.abort();
await assert.rejects(first, { name: 'AbortError' });
assert.equal(sharedSignal.aborted, false);
completeShared('survived');
assert.equal(await follower, 'survived');

const allCanceled = new AbortController();
const abandoned = shared.run('retry', () => { throw new Error('Canceled work should never start'); }, allCanceled.signal);
allCanceled.abort();
await assert.rejects(abandoned, { name: 'AbortError' });
assert.equal(await shared.run('retry', async () => 'new render'), 'new render');

// Exercise the app's actual queue without a browser or GPU.
const app = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
let clock = 0, timerId = 0, automaticRuns = 0;
const timers = new Map();
const debounce = vm.createContext({
  performance:{now:()=>clock},
  accountPreferences: {workspace:{autoRegenerate:true,autoRegenerateDelaySeconds:2}}, workspaceHydrating:false, autoRegenerateTimer:null,
  clearTimeout:id=>timers.delete(id), setTimeout:(callback,delay)=>{const id=++timerId;timers.set(id,{callback,at:clock+delay});return id;},
  generatePendingPreviews:()=>{automaticRuns++;}
});
vm.runInContext(app.slice(app.indexOf('function scheduleAutoRegenerate('),app.indexOf('\nfunction flashWorkspaceSaved(')),debounce);
function advanceClock(milliseconds) {
  const end=clock+milliseconds;
  while(true){const next=[...timers].filter(([,timer])=>timer.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;
    clock=next[1].at;timers.delete(next[0]);next[1].callback();}
  clock=end;
}
debounce.scheduleAutoRegenerate();advanceClock(1500);debounce.scheduleAutoRegenerate();advanceClock(1999);
assert.equal(automaticRuns,0,'Every edit restarts the complete quiet period');
advanceClock(1);assert.equal(automaticRuns,1);assert.equal(debounce.autoRegenerateTimer,null);
debounce.accountPreferences.workspace.autoRegenerateDelaySeconds=2.75;
debounce.scheduleAutoRegenerate();advanceClock(2749);assert.equal(automaticRuns,1);
advanceClock(1);assert.equal(automaticRuns,2,'Use the selected delay');
debounce.scheduleAutoRegenerate();debounce.accountPreferences.workspace.autoRegenerate=false;debounce.scheduleAutoRegenerate();advanceClock(10000);
assert.equal(automaticRuns,2,'Disabling auto generation cancels the countdown');
debounce.accountPreferences.workspace.autoRegenerate=true;debounce.workspaceHydrating=true;debounce.scheduleAutoRegenerate();assert.equal(timers.size,0);
debounce.workspaceHydrating=false;debounce.accountPreferences.workspace.autoRegenerateDelaySeconds=NaN;debounce.scheduleAutoRegenerate();advanceClock(2000);
assert.equal(automaticRuns,3,'Missing or invalid delays use two seconds');
debounce.accountPreferences.workspace.autoRegenerateDelaySeconds=2500000;debounce.scheduleAutoRegenerate();
advanceClock(2147483647);assert.equal(automaticRuns,3,'Long delays cannot overflow into immediate generation');
advanceClock(2500000000-2147483647);assert.equal(automaticRuns,4);
const openingCalls = [];
const savedData = { plates: [{ sourceInstanceId: 'saved-source' }] };
const preparedModels = [{ id: 'model', parameters: [] }];
const opening = vm.createContext({
  workspaceId: '150d4a52-90a0-4814-bff7-8360bb6a314e', settingsOnlyMode: false,
  fetchJson: async (url) => {
    openingCalls.push(url);
    return { user: { displayName: 'Test', preferences: { workspace: { autoRegenerate: true } } },
      workspace: { name: 'Saved', data: savedData }, models: preparedModels,
      runtime: { openscadReady: true }, printProfile: {}, printProfiles: {} };
  },
  applyAppearancePreferences() {}, accountEmail: {}, accountAvatar: {},
  initializeWorkflowState() {}, populatePrinterSelectors() {}, buildPrintSettingsUi() {},
  profileFileName: {}, applyPrintProfile() {}, populateProfileMenu() {},
  generateBtn: {}, mfBtn: {}, workspaceName: {}, updateLastSavedUi() {},
  loadFontLibrary: () => { openingCalls.push('fonts-background'); return new Promise(() => {}); },
  restoreWorkspaceSession: async (data, ready, models) => {
    assert.equal(data, savedData); assert.equal(ready, true); assert.equal(models, preparedModels);
    openingCalls.push('restore');
  },
  plates: [{}], runtimeRenderSlots: 2, updateWorkspaceSaveUi() {}, viewerMessage: { classList: { remove() {} } },
  generatePendingPreviews: async () => { openingCalls.push('preview'); },
  setStatus: (message) => { throw new Error(message); },
  openAccountSettings: async () => { openingCalls.push('settings'); }
});
vm.runInContext(app.slice(app.indexOf('async function init()'), app.lastIndexOf("\ninit();")), opening);
await opening.init();
assert.deepEqual(openingCalls, [`/api/workspaces/${opening.workspaceId}/bootstrap`, 'fonts-background', 'restore', 'preview']);
assert.equal(opening.workspaceHydrating, false);
assert.equal(opening.workspaceDirty, false);
openingCalls.length = 0;
opening.settingsOnlyMode = true;
await opening.init();
assert.deepEqual(openingCalls, ['/api/auth/session', 'settings'], 'Settings must not load workspace models or start generation');

const generationOrder = [];
const orderedPlates = [{ key: 'first', defaultPlateId: 'A', meshes: [{userData:{}}] }, { key: 'visible', defaultPlateId: 'B', meshes: [{userData:{}}] }];
const ordering = vm.createContext({
  autoRegenerateTimer: null,
  PreviewPrefetch, runtimeRenderSlots: 4, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot,
  changedValueKeys: () => [], fetchStl: async () => new ArrayBuffer(0),
  plates: orderedPlates, activePlateKey: 'visible', syncActivePlateRuntime() {}, plateNeedsGeneration: () => true,
  generateBtn: {}, setStatus() {}, switchPlate: (key) => { ordering.activePlateKey = key; },
  refreshWorkspacePrimeTowers:()=>'',applyBatchPlateVisibility(){},
  generatePreview: async () => { generationOrder.push(ordering.activePlateKey); }
});
vm.runInContext(app.slice(app.indexOf('async function runPendingPreviewGeneration('), app.indexOf('\nasync function generatePendingPreviews(')), ordering);
await ordering.runPendingPreviewGeneration();
assert.deepEqual(generationOrder, ['visible', 'first']);
assert.equal(ordering.activePlateKey, 'visible');
const towerWarnings=[];let refreshed=0,redrawn=0;
ordering.plateNeedsGeneration=()=>false;
ordering.refreshWorkspacePrimeTowers=()=>{refreshed++;return 'Prime tower needs space';};
ordering.applyBatchPlateVisibility=()=>{redrawn++;};
ordering.setStatus=(message,error)=>towerWarnings.push({message,error});
await ordering.runPendingPreviewGeneration();
assert.equal(refreshed,1);assert.equal(redrawn,1);
assert.deepEqual(towerWarnings.at(-1),{message:'Prime tower needs space',error:true},'A current mesh still refreshes its tower and retains the placement warning');
ordering.plateNeedsGeneration=()=>true;
await ordering.runPendingPreviewGeneration();
assert.equal(refreshed,2);
assert.deepEqual(towerWarnings.at(-1),{message:'Prime tower needs space',error:true},'Batch success cannot replace a tower warning');
assert.ok(!app.includes('added and generated.'),'Import completion message stays removed');

const queueSource = app.slice(app.indexOf('async function generatePendingPreviews('), app.indexOf('\nfunction downloadBlob('));
const classes = { add() {}, remove() {} };
const plate = { key: 'A', values: { size: 1 }, renderingValues: null, rendering: false };
const passes = [];
let calls = 0;
const context = vm.createContext({
  clearTimeout, autoRegenerateTimer: null, plates: [plate],
  bulkPreviewGenerationPromise: null, bulkPreviewRerunRequested: false,
  bulkPreviewNextOptions: null, bulkPreviewPendingKeys: new Set(),
  viewerMessage: { classList: classes }, generateBtn: { classList: classes, removeAttribute() {} },
  parametricRuleFailures: () => [], renderParametricRulesState() {}, setStatus() {},
  activePlate: () => plate, previewController: new AbortController(),
  plateNeedsGeneration: () => false,
  runPendingPreviewGeneration: async () => {
    calls += 1;
    plate.rendering = true;
    plate.renderingValues = structuredClone(plate.values);
    await new Promise((resolve) => passes.push(resolve));
    plate.rendering = false;
    return { generated: 1, failures: [] };
  }
});
vm.runInContext(queueSource, context);
const start = context.generatePendingPreviews();
const repeatedClick = context.generatePendingPreviews();
passes.shift()();
await Promise.all([start, repeatedClick]);
assert.equal(calls, 1, 'Repeated Generate clicks must join, not replay, the same generation');

const original = context.generatePendingPreviews();
plate.values = { size: 2 };
const latest = context.generatePendingPreviews();
assert.equal(context.previewController.signal.aborted, true, 'Superseded work should be canceled');
passes.shift()();
await pause();
assert.equal(calls, 3, 'A changed configuration gets exactly one follow-up');
passes.shift()();
await Promise.all([original, latest]);
assert.equal(context.bulkPreviewGenerationPromise, null);
assert.equal(calls, 3);

// A stale render must not skip a new edit's pending quiet period.
const waitingForQuiet = context.generatePendingPreviews();
context.autoRegenerateTimer = 123;
context.bulkPreviewRerunRequested = true;
passes.shift()();
await waitingForQuiet;
assert.equal(calls,4,'A pending auto-generation timer owns the next render');
assert.equal(context.autoRegenerateTimer,123,'Finishing the old render preserves the pending countdown');
context.autoRegenerateTimer = null;

const previewSource = app.slice(app.indexOf('async function generatePreview('), app.indexOf('\nfunction plateNeedsGeneration('));
const livePlate = { key: 'A', renderToken: 0, rendering: false, batchInstances: [], objectRecords: {}, meshes: [] };
const sceneMeshes = new Set();
const noop = () => {};
let renderedJobs = 0;
const preview = vm.createContext({ effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot,
  AbortController, structuredClone,
  activePlate: () => livePlate, activePlateKey: 'A', previewController: null,
  currentMeshes: [], currentValues: { size: 1 }, lastGeneratedValues: null,
  objectDefs: [], selectedObjectId: 'all', firstPreview: false,
  generateBtn: { classList: classes, setAttribute() {} }, viewerMessage: { classList: classes },
  getValues: () => structuredClone(preview.currentValues),
  changedValueKeys: (before, after) => Object.keys(after).filter((key) => before?.[key] !== after[key]),
  activeObjectDefs: () => [], logicalGroupForObjectId: () => null,
  runRenderJobs: (jobs) => Promise.all(jobs.map((job) => job())),
  fetchStl: async () => { renderedJobs += 1; return new ArrayBuffer(100); },
  createMesh: () => {
    if (preview.failParse) throw new Error('Invalid mesh');
    return { geometry: { dispose: noop }, material: { dispose: noop }, userData: {} };
  },
  scene: { add: (mesh) => sceneMeshes.add(mesh), remove: mesh => sceneMeshes.delete(mesh) },
  disposeMeshes: () => {
    for (const mesh of preview.currentMeshes) sceneMeshes.delete(mesh);
    preview.currentMeshes = [];
    livePlate.meshes = preview.currentMeshes;
  },
  syncActivePlateRuntime: () => {
    livePlate.values = structuredClone(preview.currentValues);
    livePlate.lastGeneratedValues = preview.lastGeneratedValues;
  },
  setStatus: noop, renderPlateList: noop, updateObjectMenu: noop,
  updatePlatePosition: noop, updateSelectionVisuals: noop, ensureObjectRecords: noop,
  applyBatchPlateVisibility: noop, renderWorkflowUi: noop, persistUploadedPlates: noop,
  discardDeletedObjectMeshes: (plate, meshes) => meshes, selectedMeshes: () => [],
  bulkPreviewRerunRequested: false
});
preview.autoPositionOriginDesigns=()=>false;
preview.createMeshesFrom3mf=()=>[preview.createMesh()];
vm.runInContext(previewSource, preview);
await preview.generatePreview();
assert.equal(livePlate.error, null);
assert.equal(renderedJobs, 1);
assert.equal(sceneMeshes.size, 1);
const initialMesh = preview.currentMeshes[0];
await preview.generatePreview();
assert.equal(renderedJobs, 1, 'Unchanged inputs should not render again');
assert.equal(preview.currentMeshes[0], initialMesh);
preview.currentValues = { size: 2 };
await Promise.all([preview.generatePreview(), preview.generatePreview()]);
assert.equal(renderedJobs, 2, 'Concurrent requests must not append duplicate geometry');
assert.equal(sceneMeshes.size, 1);
const goodMesh = preview.currentMeshes[0];
assert.notEqual(goodMesh, initialMesh);
preview.failParse = true;
preview.currentValues = { size: 3 };
await preview.generatePreview();
assert.equal(preview.currentMeshes[0], goodMesh, 'A failed replacement must retain the previous model');
assert.equal(sceneMeshes.size, 1);
preview.failParse = false;
preview.currentValues = { size: 4 };
preview.fetchStl = async () => { preview.currentValues = { size: 5 }; return new ArrayBuffer(100); };
await preview.generatePreview();
assert.equal(preview.currentMeshes[0], goodMesh, 'Stale geometry must never be committed');
assert.equal(preview.bulkPreviewRerunRequested, true);
assert.equal(sceneMeshes.size, 1);

console.log('Generation tests passed: 40 owners / 320 jobs, fairness, cancellation, single-flight, repeated clicks, atomic mesh replacement, and stale-result protection.');
