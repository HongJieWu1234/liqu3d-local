import './setup.mjs';
import {syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate} from '../public/object-plate-location.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { HeldHistoryShortcut, editorShortcutAction, isMacPlatform } from '../public/history-shortcuts.js';

const source = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
let savedRecords;
let openDialog = false;
let sequence = 0;
const plate = {
  key: 'source-a', sourceInstanceId: 'source-a', name: 'Example.scad', defaultPlateId: 'A',
  values: {}, objectDefs: [], objectRecords: {}, meshes: [],
  batchInstances: [{ id: 'copy-a', sourceKey: 'model', label: 'Copy', plateId: 'B', configuration: { parameters: {} } }]
};
const context = vm.createContext({requestRender(){},syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate,clearWorkspaceColorArrangement(){},refreshWorkspacePrimeTowers(){},
  structuredClone, editorShortcutAction, bulkPreviewGenerationPromise:null, selectedObjectId: 'model', exportInProgress: false, preparedExport: {},
  batchSelectedObjectIds: new Set(), objectIdentityStore: {}, activePresetIds: [], parametricPresets: [],
  objectEditHistory: [], objectRedoHistory: [], objectHistoryBusy: false, batchPlateMeta: {A: {}, B: {}}, loadedPlateIds: new Set(['A', 'B']), activeViewPlateId: 'A', updateSelectionVisuals() {}, pointerDown: null, generatePendingPreviews: async () => {},
  plates: [plate], PLATE_IDS: ['A', 'B'], currentMeshes: [],
  activePlate: () => plate, ensureBatchPlate: id => id, createPersistentId: () => `id-${++sequence}`,
  scene: { remove(mesh) { mesh.removed = true; } },
  selectionHelper: null, selectionLabelWorld: null, selectionLabel: {hidden:true},
  selectObject(id) { context.selectedObjectId = id; },
  syncActivePlateRuntime() {}, persistUploadedPlates() { savedRecords = structuredClone(plate.objectRecords); },
  applyBatchPlateVisibility() {}, renderPlateList() {}, renderBatchObjectList() {}, updatePlateFitStatus() {}, setStatus() {},
  document: { querySelectorAll: () => openDialog ? [{ getClientRects: () => [1] }] : [] }
});
for (const name of ['clearSelectionHelper', 'ensureObjectRecords', 'objectRecordForSelection', 'discardDeletedObjectMeshes', 'allObjectEntries', 'removeSelectedObject', 'rememberObjectEdit', 'replayObjectEdit', 'undoObjectEdit', 'redoObjectEdit', 'objectShortcutAllowed', 'handleObjectRemovalShortcut', 'usedExportPlateIds', 'exportGroupsForPlate']) {
  const start = source.indexOf(`${['undoObjectEdit', 'redoObjectEdit', 'replayObjectEdit'].includes(name) ? 'async ' : ''}function ${name}(`);
  const end = source.indexOf('\n}', start) + 2;
  assert.ok(start >= 0 && end > start);
  vm.runInContext(source.slice(start, end), context);
}
context.historyShortcuts = new HeldHistoryShortcut(action => action === 'undo' ? context.undoObjectEdit() : context.redoObjectEdit(), target => context.objectShortcutAllowed(target), { schedule: () => 0, cancel() {} });
const mesh = key => ({ userData: { selectionKey: key }, geometry: { dispose() { this.disposed = true; } }, material: { dispose() { this.disposed = true; } } });
const keyEvent = overrides => ({ key: 'Backspace', shiftKey: true, target: { tagName: 'CANVAS' }, preventDefault() { this.prevented = true; }, ...overrides });

context.ensureObjectRecords(plate);
const original = mesh('model');
const copy = mesh('instance:copy-a');
plate.meshes = [original, copy];
for (const overrides of [{ shiftKey: false }, { key: 'Delete' }, { repeat: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true }, { defaultPrevented: true }, ...['INPUT', 'TEXTAREA', 'SELECT'].map(tagName => ({ target: { tagName } })), { target: { isContentEditable: true } }]) {
  context.handleObjectRemovalShortcut(keyEvent(overrides));
  assert.equal(plate.objectRecords.model.deleted, false);
}
openDialog = true;
context.handleObjectRemovalShortcut(keyEvent());
assert.equal(plate.objectRecords.model.deleted, false);
openDialog = false;
const event = keyEvent();
const outline = mesh('model');
const helper = {traverse(visit) {visit(outline);}};
context.selectionHelper = helper;context.selectionLabelWorld = {};context.selectionLabel.hidden = false;
context.handleObjectRemovalShortcut(event);
assert.equal(context.selectionHelper,null);assert.equal(context.selectionLabelWorld,null);assert.equal(context.selectionLabel.hidden,true);
assert.ok(helper.removed && outline.geometry.disposed && outline.material.disposed,'Deleting an object also disposes its selection outline');
assert.equal(event.prevented, true);
assert.equal(savedRecords.model.deleted, true);
assert.equal(context.preparedExport, null);
assert.deepEqual(plate.meshes, [copy]);
assert.ok(original.removed && original.geometry.disposed && original.material.disposed);
assert.equal(copy.geometry.disposed, undefined);
assert.equal(context.objectRecordForSelection(plate, 'model'), null);
assert.equal(context.ensureObjectRecords(plate).length, 1);
assert.equal(context.usedExportPlateIds().join(','), 'B');
assert.equal(context.exportGroupsForPlate(plate).map(group => group.key).join(','), 'instance:copy-a');

// The saved deletion survives hydration and regeneration, while copies survive.
plate.objectRecords = JSON.parse(JSON.stringify(savedRecords));
context.ensureObjectRecords(plate);
const regeneratedOriginal = mesh('model');
const regeneratedCopy = mesh('instance:copy-a');
plate.meshes = context.discardDeletedObjectMeshes(plate, [regeneratedOriginal, regeneratedCopy]);
assert.equal(plate.meshes.length, 1);
assert.equal(plate.meshes[0], regeneratedCopy);
assert.ok(regeneratedOriginal.geometry.disposed);
context.selectedObjectId = 'instance:copy-a';
context.handleObjectRemovalShortcut(keyEvent());
assert.equal(plate.meshes.length, 0);
assert.equal(context.ensureObjectRecords(plate).length, 0);
assert.equal(context.usedExportPlateIds().length, 0);
assert.equal(context.removeSelectedObject(), false);

// A logical object containing several parts is removed as one object.
plate.objectDefs = [{ id: 1 }, { id: 2 }, { id: 3 }];
context.logicalObjectGroupsFor = () => [{ key: 'pair', memberIds: [1, 2], label: 'Pair' }, { key: 'other', memberIds: [3], label: 'Other' }];
plate.objectRecords = {};
plate.batchInstances = [];
context.ensureObjectRecords(plate);
plate.meshes = [mesh('group:pair'), mesh('group:pair'), mesh('group:other')];
context.selectedObjectId = 'group:pair';
context.handleObjectRemovalShortcut(keyEvent());
assert.equal(plate.meshes.length, 1);
assert.equal(plate.meshes[0].userData.selectionKey, 'group:other');
assert.equal(context.ensureObjectRecords(plate).length, 1);
console.log('Object removal passed: shortcut guards, multipart objects, copies, persistence, regenerated meshes, and export exclusion.');

// Undo restores removals in reverse order, preserves editing shortcuts, and persists.
const undoKeys = {key:'z',shiftKey:false,metaKey:isMacPlatform(),ctrlKey:!isMacPlatform()};
for (const overrides of [{metaKey:false,ctrlKey:false}, { target: { tagName: 'INPUT' } }, { target: { isContentEditable: true } }]) {
  context.handleObjectRemovalShortcut(keyEvent({ ...undoKeys, ...overrides }));
  assert.equal(plate.objectRecords['group:pair'].deleted, true);
}
const undoEvent = keyEvent(undoKeys);
context.handleObjectRemovalShortcut(undoEvent);
await new Promise(resolve => setImmediate(resolve));
context.historyShortcuts.stop();
assert.equal(undoEvent.prevented, true);
assert.equal(savedRecords['group:pair'].deleted, false);
assert.equal(context.selectedObjectId, 'group:pair');
assert.equal(plate.batchDirty, true);
context.selectedObjectId = 'group:pair';
context.removeSelectedObject();
context.selectedObjectId = 'group:other';
context.removeSelectedObject();
await context.undoObjectEdit();
assert.equal(plate.objectRecords['group:other'].deleted, false);
assert.equal(plate.objectRecords['group:pair'].deleted, true);
await context.undoObjectEdit();
assert.equal(plate.objectRecords['group:pair'].deleted, false);
assert.equal(await context.undoObjectEdit(), false);
console.log('Undo passed: Cmd/Ctrl+Z, editing guards, saved restoration, and reverse removal order.');

// Exercise actual nudge, drag completion, and plate-assignment handlers.
Object.assign(context, {
  updateSelectionVisuals() {}, renderWorkflowUi() {}, applyStoredTransform() {},
  controls: { enabled: true }, renderer: { domElement: { classList: { remove() {} }, releasePointerCapture() {} } },
  ensurePhysicalPlateId() {}, activeViewPlateId: 'A'
});
for (const name of ['storedObjectOffset', 'rememberObjectMove', 'setObjectOffset', 'moveSelectionBy', 'finishObjectDrag', 'allObjectEntries', 'assignObjectIdsToPlate']) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf('\n}', start) + 2;
  vm.runInContext(source.slice(start, end), context);
}
plate.objectTransforms = { 'group:pair': { x: 5, z: -2 } };
context.objectEditHistory.length = 0;
context.selectedObjectId = 'group:pair';
context.currentMeshes = plate.meshes;
context.moveSelectionBy(10, 0);
assert.equal(plate.objectTransforms['group:pair'].x, 15);
context.removeSelectedObject();
await context.undoObjectEdit();
assert.equal(plate.objectRecords['group:pair'].deleted, false);
assert.equal(plate.objectTransforms['group:pair'].x, 15);
await context.undoObjectEdit();
assert.equal(plate.objectTransforms['group:pair'].x, 5);
assert.equal(plate.objectTransforms['group:pair'].z, -2);

context.pointerDown = { id: 1, plateKey: plate.key, selectionKey: 'group:pair', dragging: true, startOffset: { x: 5, z: -2 } };
context.setObjectOffset('group:pair', 20, 5, { persist: false });
context.setObjectOffset('group:pair', 30, 10, { persist: false });
assert.equal(context.objectEditHistory.length, 0);
assert.equal(await context.undoObjectEdit(), false, 'Do not undo during an unfinished drag');
context.finishObjectDrag();
assert.equal(context.objectEditHistory.length, 1, 'A complete drag is one undo step');
await context.undoObjectEdit();
assert.equal(plate.objectTransforms['group:pair'].x, 5);
assert.equal(plate.objectTransforms['group:pair'].z, -2);
context.pointerDown = { id: 2, plateKey: plate.key, selectionKey: 'group:pair', dragging: true, startOffset: { x: 5, z: -2 } };
context.finishObjectDrag({ cancelled: true });
assert.equal(context.objectEditHistory.length, 0, 'Cancelled drags do not enter history');
context.setObjectOffset('group:pair', 5, -2);
assert.equal(context.objectEditHistory.length, 0, 'No-op moves do not enter history');

const ids = context.ensureObjectRecords(plate).map(record => record.id);
context.assignObjectIdsToPlate(ids, 'B');
assert.equal(context.ensureObjectRecords(plate).every(record => record.plateId === 'B'), true);
assert.equal(context.objectEditHistory.length, 1);
context.assignObjectIdsToPlate(ids, 'B');
assert.equal(context.objectEditHistory.length, 1);
await context.undoObjectEdit();
assert.equal(context.ensureObjectRecords(plate).every(record => record.plateId === 'A'), true);
assert.equal(context.activeViewPlateId, 'A');
assert.equal(await context.undoObjectEdit(), false);
console.log('Movement undo passed: nudges, whole drags, cancelled/no-op moves, plate transfers, and mixed deletion history.');

// Redo replays the exact inverse, and a new edit discards the abandoned branch.
await context.redoObjectEdit();
assert.ok(context.ensureObjectRecords(plate).every(record => record.plateId === 'B'));
await context.undoObjectEdit();
context.moveSelectionBy(3, 4);
assert.equal(await context.redoObjectEdit(), false);
const moved = structuredClone(plate.objectTransforms['group:pair']);
await context.undoObjectEdit();
await context.redoObjectEdit();
assert.deepEqual(structuredClone(plate.objectTransforms['group:pair']), moved);
context.removeSelectedObject();
await context.undoObjectEdit();
await context.redoObjectEdit();
assert.equal(plate.objectRecords['group:pair'].deleted, true);
await context.undoObjectEdit();
assert.equal(plate.objectRecords['group:pair'].deleted, false);

// Held deletion restoration cannot overlap another history step.
let complete;
context.generatePendingPreviews = () => new Promise(resolve => { complete = resolve; });
context.removeSelectedObject();
const restoring = context.undoObjectEdit();
assert.equal(context.objectHistoryBusy, true);
assert.equal(await context.redoObjectEdit(), false);
assert.equal(context.removeSelectedObject(), false);
complete(); await restoring;
assert.equal(context.objectHistoryBusy, false);
for (let index = 0; index < 120; index++) context.rememberObjectEdit({type: 'move', changes: []});
assert.equal(context.objectEditHistory.length, 100);
console.log('Redo passed: exact movement/plate/delete inverses, branch invalidation, bounded history and asynchronous serialization.');

// Deleted objects' transforms remain available for later undo.
context.generatePendingPreviews=async()=>{};
context.objectEditHistory.length=0;context.objectRedoHistory.length=0;
for(const key of ['group:pair','group:other'])plate.objectRecords[key].deleted=false;
plate.objectTransforms={'group:pair':{x:12,z:9,y:0,rotation:0},'group:other':{x:40,z:8,y:0,rotation:0}};
context.selectedObjectId='group:pair';context.removeSelectedObject();
assert.equal(plate.objectTransforms['group:pair'].x,12);
await context.undoObjectEdit();
assert.equal(plate.objectTransforms['group:pair'].x,12);
assert.equal(plate.objectTransforms['group:other'].x,40);
// Ordinary motion history must not snapshot/replay unrelated plate metadata.
context.moveSelectionBy(1,0);await context.undoObjectEdit();
assert.equal(context.objectRedoHistory.at(-1).batchPlateMeta,undefined);
context.batchPlateMeta.C={name:'Later plate'};context.loadedPlateIds.add('C');
await context.redoObjectEdit();
assert.equal(context.batchPlateMeta.C.name,'Later plate');assert.ok(context.loadedPlateIds.has('C'));
console.log('History preservation passed: deleted-object positions survive undo, and movement leaves unrelated plate metadata intact.');

// Exercise the requested keys through the actual handler, including a batch-only
// selection (no single active object) and the physical Mac Delete/Backspace keys.
const originalPlatform=navigator.platform;
try {
  for(const mac of [true,false])for(const [key,code] of [['Backspace','Backspace'],['Delete','Delete'],['Unidentified','Backspace']]) {
    Object.defineProperty(navigator,'platform',{value:mac?'MacIntel':'Linux',configurable:true});
    context.objectEditHistory.length=0;context.objectRedoHistory.length=0;
    const record=plate.objectRecords['group:pair'];record.deleted=false;
    plate.meshes=[mesh('group:pair')];context.currentMeshes=plate.meshes;
    context.selectedObjectId='all';context.batchSelectedObjectIds=new Set([record.id]);
    const mods={metaKey:mac,ctrlKey:!mac,shiftKey:false};
    const remove=keyEvent({key,code,...mods});context.handleObjectRemovalShortcut(remove);
    assert.equal(remove.prevented,true);assert.equal(record.deleted,true);assert.equal(plate.meshes.length,0);
    context.handleObjectRemovalShortcut(keyEvent({key:'z',code:'KeyZ',...mods}));await new Promise(resolve=>setImmediate(resolve));context.historyShortcuts.stop();
    assert.equal(record.deleted,false,'Cmd/Ctrl+Z restores the deleted object');
    const removedShortcut=keyEvent({key:'u',code:'KeyU',...mods});context.handleObjectRemovalShortcut(removedShortcut);
    assert.equal(record.deleted,false,'Cmd/Ctrl+U no longer changes objects');assert.equal(removedShortcut.prevented,undefined);
    context.handleObjectRemovalShortcut(keyEvent({key:'z',code:'KeyZ',...mods,shiftKey:true}));await new Promise(resolve=>setImmediate(resolve));context.historyShortcuts.stop();
    assert.equal(record.deleted,true,'Cmd/Ctrl+Shift+Z repeats the deletion after undo');
  }
} finally {Object.defineProperty(navigator,'platform',{value:originalPlatform,configurable:true});}
console.log('Deletion key flow passed: Mac and Windows, Backspace/Delete, physical-key fallback, batch-only selection, undo and redo.');
