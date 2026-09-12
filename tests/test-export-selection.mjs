import './setup.mjs';
import { effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot } from '../public/object-render-state.js';
import { recipeForExport } from '../public/export-recipe.js';
import { estimateSummary } from '../public/export-history-ui.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from '../public/vendor/three/three.module.js';
import { geometryForPrint, placeObjectsOnBed } from '../public/export-geometry.js';

const source = new THREE.BoxGeometry(20, 10, 2).translate(0, 0, 1);
const makePlate = (id, x) => {
  const mesh = new THREE.Mesh(source.clone());
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0, 0);
  mesh.userData.objectId = 1;
  mesh.userData.selectionKey = 'group:box';
  return {
    key: `source-${id}`, defaultPlateId: id, modelId: `model-${id}`, source: 'cube(10);', sourceName: `${id}.scad`,
    partSelectorParam: null, solidPartsExport: false, values: { size: 10 }, lastGeneratedValues: { size: 10 }, meshes: [mesh]
  };
};
const plates = [makePlate('A', 0), makePlate('B', 400)];
let previewSelection = null;
let requestCount = 0;
let packedPlateIds = [];
let downloaded = 0;
let statusError = '';
const appSource = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const context = vm.createContext({ effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot,
  workspacePrimeTowers:[], workspaceMaxObjectsPerPlate:null, refreshWorkspacePrimeTowers:()=>{}, console, Blob, AbortController, Uint32Array, structuredClone, setTimeout, recipeForExport, estimateSummary,
  reduceColorChanges:{disabled:false},workspaceColorOptimization:{enabled:false},workspaceName:{value:"Test"},grams:()=>"~1 g",
  currentObjectPlate:record=>record.plateId,
  storedObjectOffset:(key,plate)=>({rotation:plate.objectTransforms?.[key]?.rotation || 0}),
  downloadRecordedExport:async(url,recipe)=>{requestCount+=recipe.requests.length;packedPlateIds=[...new Set(recipe.objects.map(object=>object.plateId))];downloaded++;return {estimate:{totalGrams:1}};},
  exportInProgress: false, preparedExport: null, exportFontRevision: 0, productionDashboard: null, printProfile: {},
  mfBtn: { textContent: 'Export', disabled: false }, viewerMessage: {},
  usedExportPlateIds: () => ['A', 'B'], closeExportMenu() {},
  getPrintProfileFromUi: () => ({ printer: 'p1s', filamentColor: '#FF0000' }),
  workspaceSnapshot: () => ({ revision: 1 }),
  ensurePlatePreviews: async (ids) => { previewSelection = [...ids]; },
  PRINTERS: { p1s: { width: 256, depth: 256 } },
  fitMinorPlateOverflows() {}, buildPreflightReport: () => ({ issues: [] }),
  setStatus(message, error) { if (error) statusError = message; }, colorHexForName: (color, fallback) => color || fallback,
  layerHeightBounds: () => ({ min: 0.08, max: 0.28 }), layerHeightRangeError: () => 'Invalid layer height.',
  plates, PLATE_IDS: ['A', 'B'], batchPlateMeta: { A: { name: 'Plate A' }, B: { name: 'Plate B' } },
  exportGroupsForPlate: (plate) => [{ key: 'group:box', label: `Box ${plate.defaultPlateId}`, meshes: plate.meshes, defs: [{ id: 1, label: 'Box' }], record: { id: `obj-${plate.defaultPlateId}`, plateId: plate.defaultPlateId, configuration: { parameters: plate.values } } }],
  plateLayoutForId: (id) => ({ x: id === 'A' ? 0 : 400, z: 0 }),
  objectColorParts: () => [],
  allObjectEntries: () => plates.map((plate) => ({ plate, record: { id: `obj-${plate.defaultPlateId}`, label: `Box ${plate.defaultPlateId}`, plateId: plate.defaultPlateId, configuration: { parameters: plate.values } } })),
  runRenderJobs: (jobs) => Promise.all(jobs.map((job) => job())),
  fetchStl: async () => { requestCount += 1; return new Uint8Array([1, 2, 3]).buffer; },
  readSolid3mf: () => [{ geometry: source.clone(), colors: ['#FF0000'], name: 'Solid' }],
  geometryForPrint, placeObjectsOnBed,
  safeExportName: (value) => String(value).replaceAll(' ', '-'),
  serializeObjectPrintOverrides: () => ({}),
  fetchJson: async () => ({ template: { config: {}, filament: {}, filamentName: 'Generic PLA', filamentId: 'GFL99' } }),
  packExportInWorker: async (models) => { packedPlateIds = models.map((item) => item.plateId); return { archive: new Uint8Array([1, 2, 3]), count: models.length, nativeMultiPlate: false }; },
  downloadBlob: () => { downloaded += 1; }
});
vm.runInContext(appSource.slice(appSource.indexOf('function exportSnapshotKey('), appSource.indexOf('\nfunction packExportInWorker(')), context);
vm.runInContext(appSource.slice(appSource.indexOf('function clearExportError('), appSource.indexOf('\nfunction selectObject(')), context);
await context.downloadGeneric3mf(['B']);
assert.deepEqual(previewSelection, ['B'], 'Manual export should prepare only selected output plates');
assert.equal(requestCount, 1, 'Manual export should render only selected-plate solids');
assert.equal(Array.from(packedPlateIds).join(','), 'B', 'Manual export should pack only selected plates');
assert.equal(downloaded, 1);
assert.equal(statusError, '', 'A successful export must not report a coordinator error');
console.log('Selected-plate export test passed: only requested plates are prepared, rendered and packed.');

context.preparedExport = null;
previewSelection = null;
context.allObjectEntries = () => [{ record: { label: 'Box A', printOverrides: { layer_height: 0.4 } } }];
await context.downloadGeneric3mf(['A']);
assert.equal(previewSelection, null, 'An impossible object layer height must stop before rendering');
assert.match(statusError, /Box A: Invalid layer height/);
assert.equal(downloaded, 1);

// Distinct linked objects may share an uploaded source ID, but never a resolved configuration.
plates[0].modelId = plates[1].modelId = 'same-scad-source';
plates[0].values = plates[0].lastGeneratedValues = { size: 10 };
plates[1].values = plates[1].lastGeneratedValues = { size: 20 };
const resolvedRequests = [];
context.downloadRecordedExport=async(url,recipe)=>{resolvedRequests.push(...recipe.requests);packedPlateIds=[...new Set(recipe.objects.map(object=>object.plateId))];return {estimate:{totalGrams:1}};};
context.preparedExport = null;
context.allObjectEntries = () => plates.map((plate) => ({ plate, record: { id: `obj-${plate.defaultPlateId}`, label: `Box ${plate.defaultPlateId}`, plateId: plate.defaultPlateId, configuration: { parameters: plate.values } } }));
await context.downloadGeneric3mf(['A', 'B']);
assert.equal(resolvedRequests.length, 2, 'Export cache must distinguish objects with the same source and different values');
assert.deepEqual(resolvedRequests.map(request => request.values.size).sort((a,b)=>a-b), [10,20]);
assert.equal(Array.from(packedPlateIds).join(','), 'A,B');
console.log('Shared-source export isolation passed: independent effective configurations are rendered and packed.');

// Legacy SCAD uses base/shadow/text, not the generated adapter's tag_* selectors.
resolvedRequests.length=0;
plates[1].partSelectorParam='render_part';
context.objectColorParts=()=>[{part:'base',hex:'#B8ACD6'},{part:'tag_shadow',hex:'#FFFFFF'},{part:'tag_text',hex:'#F19CBB'}];
await context.downloadGeneric3mf(['B']);
assert.equal(resolvedRequests.length,1);
assert.equal(resolvedRequests[0].format,'3mf');
assert.equal(resolvedRequests[0].part,undefined);
assert.equal(resolvedRequests[0].solidParts,undefined);
console.log('Imported SCAD color regression passed: native geometry replaces unsupported part selectors.');

// Pending arrangement settings commit only after a complete, current operation.
context.printProfileSnapshotFromUi=context.getPrintProfileFromUi;
context.workspaceColorOptimization={enabled:true,maxFilamentSlots:4,maxColorChanges:36};
const saved=structuredClone(context.workspaceColorOptimization), pending={...saved,maxColorChanges:50};
const layout=plates.map(plate=>plate.meshes[0].matrixWorld.toArray());
let commits=0;
context.applyWorkspaceColorArrangement=(report,printer,settings)=>{commits++;context.workspaceColorOptimization=settings;};
for (const failure of ['failed','cancelled','stale','profile','added-plate']) {
  let revision=1;
  const controller=new AbortController();
  context.workspaceSnapshot=()=>({revision});
  context.printProfileSnapshotFromUi=context.getPrintProfileFromUi;
  context.usedExportPlateIds=()=>['A','B'];
  context.packExportInWorker=async(models,extras,progress,settings)=>{
    assert.equal(settings.maxColorChanges,50);
    assert.deepEqual(context.workspaceColorOptimization,saved,'pending settings remain unsaved');
    if(failure==='failed')throw new Error('No arrangement found.');
    if(failure==='cancelled')controller.abort();
    if(failure==='stale')revision++;
    if(failure==='profile')context.printProfileSnapshotFromUi=()=>({printer:'a1',filamentColor:'#FF0000'});
    if(failure==='added-plate')context.usedExportPlateIds=()=>['A','B','C'];
    return {colorOptimization:{objects:[],plateCount:1,estimatedSwaps:48}};
  };
  assert.equal(await context.downloadGeneric3mf(null,{arrangeOnly:true,arrangementSettings:pending,signal:controller.signal}),false,failure);
  assert.equal(commits,0,failure);assert.deepEqual(context.workspaceColorOptimization,saved);
  assert.deepEqual(plates.map(plate=>plate.meshes[0].matrixWorld.toArray()),layout);
  assert.equal(context.exportInProgress,false);assert.equal(context.reduceColorChanges.disabled,false);
}
context.printProfileSnapshotFromUi=context.getPrintProfileFromUi;
context.usedExportPlateIds=()=>['A','B'];
context.packExportInWorker=async()=>({colorOptimization:{objects:[],plateCount:1,estimatedSwaps:48}});
assert.equal(await context.downloadGeneric3mf(null,{arrangeOnly:true,arrangementSettings:pending}),true);
assert.equal(commits,1);assert.equal(context.workspaceColorOptimization.maxColorChanges,50);
console.log('Arrangement transaction passed: failure, cancellation, stale geometry/profile/plate scope preserve settings and positions; success commits once.');

// A native object's local override must reach the full-quality recipe too.
plates[1].objectRecords = { 'group:box': { parameterOverrides: { size: 31 } } };
resolvedRequests.length = 0;
await context.downloadGeneric3mf(['B']);
assert.equal(resolvedRequests[0].values.size, 31);
assert.equal(plates[1].values.size, 20, 'Export must not mutate shared source defaults');
console.log('Native object override export passed: the recipe uses the edited object configuration.');
