import './setup.mjs';
import { effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot } from '../public/object-render-state.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { syncObjectPlateLocation } from '../public/object-plate-location.js';
import { objectSettingsSection } from '../public/object-settings.js';

const source = await fs.readFile('public/app.js', 'utf8');
const definitions = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, label: `Box ${i + 1}`, mergeKey: `box_${i + 1}` }));
const plate = { key: 'p', sourceInstanceId: 'source', name: 'conditional.scad', defaultPlateId: 'A',
  objectDefs: definitions, objectRecords: {}, meshes: [], batchInstances: [], renderToken: 0 };
let sequence = 0, fail = false, supersede = false;
const noop = () => {};
const element = () => ({ classList: { add: noop, remove: noop }, setAttribute: noop });
const mesh = (selectionKey, objectId) => ({ userData: { selectionKey, objectId },
  geometry: { dispose() { this.disposed = true; } }, material: { dispose() { this.disposed = true; } } });
const context = vm.createContext({requestRender(){}, effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot, structuredClone, AbortController, syncObjectPlateLocation,
  values: { count: 6 }, objectDefs: definitions, activePlateKey: 'p', previewController: null,
  currentMeshes: [], lastGeneratedValues: null, selectedObjectId: 'all', firstPreview: true,
  objectIdentityStore: {}, activePresetIds: [], parametricPresets: [],
  generateBtn: element(), viewerMessage: element(), scene: { add: noop, remove: noop },
  activePlate: () => plate, getValues: () => context.values,
  ensureBatchPlate: id => id, createPersistentId: () => `obj-${++sequence}`,
  renderPlateList: noop, updateObjectMenu: noop, setStatus: noop, updatePlatePosition: noop,
  updateSelectionVisuals: noop, autoPositionOriginDesigns: noop, applyBatchPlateVisibility: noop,
  renderWorkflowUi: noop, persistUploadedPlates: noop,
  syncActivePlateRuntime() { plate.lastGeneratedValues = structuredClone(context.lastGeneratedValues); },
  disposeMeshes() { for (const item of context.currentMeshes) { item.geometry.dispose(); item.material.dispose(); } },
  runRenderJobs: jobs => Promise.all(jobs.map(job => job())),
  async fetchStl(url, values) {
    if (fail) throw new Error('Invalid dimensions');
    if (supersede) { supersede = false; context.values = { count: 9 }; }
    const id = Number(new URL(url, 'http://test').searchParams.get('id'));
    return new Uint8Array(id <= values.count ? [id] : []).buffer;
  },
  createMeshesFrom3mf(data, def) { return [mesh(`group:${def.mergeKey}`, def.id)]; }
});
for (const name of ['objectLabel', 'logicalObjectGroupsFor', 'logicalObjectGroups', 'logicalGroupForObjectId',
  'selectionKeyForGroup', 'ensureObjectRecords', 'objectRecordForSelection', 'discardDeletedObjectMeshes',
  'activeObjectDefs', 'changedValueKeys', 'generatePreview']) {
  const start = source.indexOf(`${name === 'generatePreview' ? 'async ' : ''}function ${name}(`);
  assert.ok(start >= 0, name);
  vm.runInContext(source.slice(start, source.indexOf('\n}', start) + 2), context);
}

await context.generatePreview();
assert.equal(plate.error, null);
assert.equal(plate.meshes.length, 6);
assert.equal(context.ensureObjectRecords(plate).length, 6, 'Inactive designs cannot inflate counts or block packing/export');
assert.equal(Object.keys(plate.objectRecords).length, 10, 'Definitions and settings remain available');
assert.equal(context.objectRecordForSelection(plate, 'group:box_7'), null);
const dormant = plate.objectRecords['group:box_7'];
dormant.plateId = 'B'; dormant.printOverrides = { layer_height: 0.28 };

context.values = { count: 9 };
await context.generatePreview();
assert.equal(plate.meshes.length, 9);
assert.equal(plate.objectRecords['group:box_1'].configuration.parameters.count, 9, 'Object metadata must match the committed preview');
assert.equal(context.ensureObjectRecords(plate).length, 9);
assert.equal(context.objectRecordForSelection(plate, 'group:box_7'), dormant);
assert.equal(dormant.plateId, 'B');
assert.equal(dormant.printOverrides.layer_height, 0.28);
context.values = { count: 6 };
await context.generatePreview();
assert.equal(context.ensureObjectRecords(plate).length, 6);

const previousMeshes = plate.meshes, previousEmpty = plate.emptySelectionKeys;
context.values = { count: 8 }; fail = true;
await context.generatePreview();
assert.match(plate.error, /Invalid dimensions/);
assert.equal(plate.meshes, previousMeshes);
assert.equal(plate.emptySelectionKeys, previousEmpty);
assert.equal(plate.objectRecords['group:box_1'].configuration.parameters.count, 6, 'A failed render retains the last successful configuration');
fail = false; supersede = true;
await context.generatePreview();
assert.equal(plate.meshes, previousMeshes, 'Stale results cannot replace visible geometry');
assert.equal(plate.emptySelectionKeys, previousEmpty);

context.values = { count: 0 };
await context.generatePreview();
assert.equal(plate.meshes.length, 0, 'Disabling everything clears obsolete geometry');
assert.equal(context.ensureObjectRecords(plate).length, 0);
assert.equal(context.viewerMessage.hidden, false);
assert.match(plate.error, /No active designs/);
context.values = { count: 6 };
await context.generatePreview();
assert.equal(plate.error, null);
assert.equal(plate.meshes.length, 6);

// An inactive constituent must not hide the rest of a multipart assembly.
plate.objectDefs = context.objectDefs = definitions.slice(0, 2).map(def => ({ ...def, mergeKey: 'assembly' }));
plate.objectRecords = {};
context.values = { count: 1 };
await context.generatePreview();
assert.equal(context.ensureObjectRecords(plate).length, 1);
assert.equal(plate.emptySelectionKeys.size, 0);
const beforeColorUpdate = plate.meshes;
let colorTowerRefreshes=0,colorTowerRedraws=0;
context.refreshWorkspacePrimeTowers=()=>{colorTowerRefreshes++;return '';};
context.applyBatchPlateVisibility=()=>{colorTowerRedraws++;};
context.applyColorOnlyPreview = () => true;
context.values = { count: 1, design1_color_preview: 'Red' };
await context.generatePreview();
assert.equal(plate.error, null);
assert.equal(plate.meshes, beforeColorUpdate, 'The color shortcut preserves geometry');
assert.equal(colorTowerRefreshes,1,'Instant color changes recompute tower requirements');
assert.equal(colorTowerRedraws,1,'Instant color changes redraw the tower');
assert.equal(plate.objectRecords['group:assembly'].configuration.parameters.design1_color_preview, 'Red', 'Instant color changes also update object metadata');
console.log('Conditional previews passed: inactive designs, reactivation, retained settings, empty layouts, failures, stale results and multipart groups.');

// Exercise real form reads, selection changes and runtime synchronization together.
// A disabled copy must never feed its settings into the native source.
const nativeValues = { count: 3, enabled: true, width: 40, preset: 1 };
const copyValues = { count: 3, enabled: false, width: 70, preset: 2 };
plate.parameters = context.parameters = [
  { name: 'count', type: 'number' }, { name: 'enabled', type: 'boolean' },
  { name: 'width', type: 'number' }, { name: 'preset', type: 'number' }
];
const inputs = new Map(plate.parameters.map(param => [param.name, {
  id: `param-${param.name}`, name: param.name,
  type: param.type === 'boolean' ? 'checkbox' : 'number',
  tagName: param.name === 'preset' ? 'SELECT' : 'INPUT', dispatchEvent() {}
}]));
Object.assign(context, {
  objectSettingsSection, activeSection: '',
  Event, CSS: { escape: value => value }, displayValue: String,
  form: { elements: { length: inputs.size, namedItem: name => inputs.get(name) }, querySelector: () => null, querySelectorAll: () => [] },
  batchSelectedObjectIds: new Set(), printSettingsScope: 'global', applyStoredTransform: noop,
  async fetchStl(url, values) {
    const id = Number(new URL(url, 'http://test').searchParams.get('id'));
    return new Uint8Array(values.enabled && id <= values.count ? [id] : []).buffer;
  },
  createMeshesFrom3mf(data, def) { return [{ ...mesh(`group:${def.mergeKey}`, def.id), visible: true }]; }
});
for (const name of ['valueFromParameterInput', 'getValues', 'setFormValues', 'syncActivePlateRuntime',
  'logicalGroupForSelection', 'selectedMeshes', 'selectObject', 'updateObjectMenu', 'switchPlate']) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  vm.runInContext(source.slice(start, source.indexOf('\n}', start) + 2), context);
}
plate.objectDefs = context.objectDefs = definitions.slice(0, 3);
plate.objectRecords = {};
plate.values = structuredClone(nativeValues);
plate.lastGeneratedValues = context.lastGeneratedValues = structuredClone(nativeValues);
plate.batchInstances = [{ id: 'copy', memberIds: [1], configuration: { parameters: structuredClone(copyValues) } }];
plate.batchDirty = true;
context.selectedObjectId = 'instance:copy';
context.setFormValues(copyValues);
await context.generatePreview();
assert.equal(plate.error, null);
assert.equal(plate.meshes.length, 3);
assert.equal(context.selectedObjectId, 'all');
assert.deepEqual(structuredClone(plate.values), nativeValues, 'Disabling a selected copy preserves every native setting');
assert.deepEqual(structuredClone(context.getValues()), nativeValues, 'After selection resets, the form displays native settings');
assert.deepEqual(plate.batchInstances[0].configuration.parameters, copyValues);
assert.deepEqual(plate.objectRecords['group:box_1'].configuration.parameters, nativeValues);

// An inactive copy can be selected again, edited and regenerated independently.
context.selectObject('instance:copy');
assert.equal(inputs.get('enabled').checked, false);
assert.equal(inputs.get('width').value, '70');
plate.batchInstances[0].configuration.parameters.enabled = true;
inputs.get('enabled').checked = true;
plate.batchDirty = true;
await context.generatePreview();
assert.equal(plate.error, null);
assert.equal(plate.meshes.length, 4);
assert.equal(context.selectedObjectId, 'instance:copy');
assert.deepEqual(structuredClone(plate.values), nativeValues);

// Switching away and back restores the selected copy's controls, not its source's.
const other = { key: 'other', defaultPlateId: 'B', parameters: plate.parameters, objectDefs: [],
  meshes: [], values: { count: 1, enabled: true, width: 20, preset: 0 }, batchInstances: [], renderToken: 0 };
Object.assign(context, {
  plates: [plate, other], activePlate: () => context.plates.find(item => item.key === context.activePlateKey),
  clearPlateRemovalConfirmation: noop, buildForm: noop, updatePlateFitStatus: noop,
  refreshViewerEmptyState: noop, plateList: { querySelector: () => null }
});
context.generateBtn.classList.toggle = noop;
context.switchPlate('other', { generateIfEmpty: false, focus: false });
assert.equal(inputs.get('width').value, '20');
context.switchPlate('p', { generateIfEmpty: false, focus: false });
assert.equal(context.selectedObjectId, 'instance:copy');
assert.equal(inputs.get('width').value, '70');
assert.equal(inputs.get('preset').value, '2');
assert.equal(inputs.get('enabled').checked, true);
context.syncActivePlateRuntime();
assert.deepEqual(structuredClone(plate.values), nativeValues, 'Saving after a switch must not overwrite the native source');
context.selectObject('group:box_1');
assert.equal(inputs.get('width').value, '40');
assert.equal(inputs.get('preset').value, '1');
console.log('Settings state passed: disabling and reactivating copies, independent native values, plate switching and current object metadata.');
