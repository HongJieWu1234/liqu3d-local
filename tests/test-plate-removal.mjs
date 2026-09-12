import './setup.mjs';
import { effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot } from '../public/object-render-state.js';
import {syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate} from '../public/object-plate-location.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from '../public/vendor/three/three.core.js';

const source = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const scene = new THREE.Scene();
const mesh = (key='model') => {const m=new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());m.userData.selectionKey=key;return m;};
const sourcePlates = Array.from({ length: 4 }, (_, index) => ({
  key: `source-${index + 1}`, sourceInstanceId: `source-${index + 1}`, modelId: `model-${index}`,
  name: `Example-${index}.scad`, source: 'cube(10);', defaultPlateId: 'A', parameters: [],
  values: {size:10}, objectDefs: [], objectRecords: {}, objectTransforms: {model:{x:5,z:8}},
  batchInstances: [], meshes: [mesh()], renderToken: 3, selectedObjectId: 'model'
}));
for (const plate of sourcePlates) scene.add(...plate.meshes);
let persisted = 0, rendered = 0, generated = [];
const context = vm.createContext({requestRender(){}, effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot,refreshViewerEmptyState(){},syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate,clearWorkspaceColorArrangement(){},
  structuredClone, scene, plates: sourcePlates, activePlateKey: sourcePlates[0].key,
  workspacePrimeTowers:[{plateId:'A',height:20,channels:['#FF0000','#FFFFFF'],manual:true,x:40,y:50}],workspacePrimeTowerErrors:{A:'old'},selectedPrimeTowerPlateId:'A',refreshWorkspacePrimeTowers(){},
  activeViewPlateId: 'A', loadedPlateIds: new Set(['A']), batchPlateMeta: { A: { name: 'My plate', hidden: false } },
  parameters: [], objectDefs: [], currentMeshes: sourcePlates[0].meshes, lastGeneratedValues: {},
  selectedObjectId: 'model', preparedExport: {}, batchSelectedObjectIds: new Set(['object-1']),
  objectEditHistory: [], objectRedoHistory: [], objectHistoryBusy: false, exportInProgress: false, pointerDown: null, bulkPreviewGenerationPromise:null,
  objectIdentityStore: {}, activePresetIds: [], parametricPresets: [], PLATE_IDS:['A','B','C'],
  form: { innerHTML: 'old' }, sectionTabs: { innerHTML: 'old' }, previewController: {abort(){}},
  viewerMessage: { hidden: true, textContent: '' }, selectionLabel:{hidden:false}, selectionLabelWorld:{},
  selectionHelper: new THREE.Group(), clearPlateRemovalConfirmation() {}, buildPlateReference() {},
  activePlate() {return context.plates.find(plate=>plate.key===context.activePlateKey);},
  syncActivePlateRuntime() {}, createPersistentId: (()=>{let i=0;return()=>`object-${++i}`;})(),
  switchPlate(key) {const plate=context.plates.find(p=>p.key===key);context.activePlateKey=key;context.currentMeshes=plate.meshes;context.selectedObjectId=plate.selectedObjectId;},
  persistUploadedPlates() { persisted += 1; }, renderPlateList() { rendered += 1; },
  visiblePlateIds() { return [...context.loadedPlateIds]; },
  applyBatchPlateVisibility() {}, updatePlateFitStatus() {}, centerPlateIdInView() {}, renderWorkflowUi() {}, renderBatchObjectList() {}, updateSelectionVisuals() {},
  generatePendingPreviews: async ({plateKeys}) => {generated.push(...plateKeys);},
  setStatus(message) { context.status = message; }
});
const helper = context.selectionHelper;
const outline = new THREE.LineSegments(new THREE.EdgesGeometry(sourcePlates[0].meshes[0].geometry),new THREE.LineBasicMaterial());
let outlineDisposed=false;outline.geometry.addEventListener('dispose',()=>{outlineDisposed=true;});
helper.add(outline);scene.add(helper);
for (const name of ['clearSelectionHelper','discardDeletedObjectMeshes','disposePlateMeshes','clearActivePlateRuntime','ensureBatchPlate','ensureObjectRecords','rememberObjectEdit',
  'sourceRemovalSnapshot','replaySourceRemoval','removeBuildPlate','replayObjectEdit','undoObjectEdit','redoObjectEdit']) {
  const start = source.indexOf(`function ${name}(`), end = source.indexOf('\n}', start) + 2;
  assert.ok(start >= 0 && end > start);
  vm.runInContext((['replaySourceRemoval','replayObjectEdit','undoObjectEdit','redoObjectEdit'].includes(name)?'async ':'')+source.slice(start, end), context);
}

context.removeBuildPlate('A');
assert.equal(context.plates.length, 0);
assert.ok(sourcePlates.every(plate=>plate.meshes.length===0));
assert.equal(scene.children.length,0,'No solid meshes or orphaned outline remain');
assert.ok(outlineDisposed);assert.equal(context.selectionHelper,null);
assert.equal(context.selectionLabelWorld,null);assert.equal(context.selectionLabel.hidden,true);
assert.equal(context.loadedPlateIds.size, 0);
assert.equal(context.activePlateKey, null);
assert.equal(context.selectedObjectId, 'all');assert.equal(context.batchSelectedObjectIds.size, 0);
assert.equal(persisted, 1);assert.equal(rendered, 1);
assert.equal(context.status, '');
assert.equal(context.workspacePrimeTowers.length,0);assert.equal(context.workspacePrimeTowerErrors.A,undefined);
assert.equal(context.selectedPrimeTowerPlateId,null);
assert.equal(context.objectEditHistory.length,1);
assert.ok(context.objectEditHistory[0].sources.every(({data})=>!('meshes' in data)&&!('referenceGroup' in data)));

let finishOldRender;
context.bulkPreviewGenerationPromise=new Promise(resolve=>{finishOldRender=resolve;});
const restoring=context.undoObjectEdit();
assert.equal(context.plates.length,0,'Wait for the cancelled old render before restoring sources with the same keys');
assert.equal(context.objectHistoryBusy,true);assert.equal(context.removeBuildPlate('A'),false);
finishOldRender();await restoring;context.bulkPreviewGenerationPromise=null;
assert.equal(context.plates.length,4);assert.equal(context.batchPlateMeta.A.name,'My plate');
assert.equal(context.loadedPlateIds.has('A'),true);assert.equal(context.activePlateKey,'source-1');
assert.equal(context.workspacePrimeTowers[0].x,40,'Undo restores the saved tower position with the source');
assert.deepEqual(generated,sourcePlates.map(p=>p.key));
for(const plate of context.plates){assert.equal(plate.source,'cube(10);');assert.equal(plate.objectTransforms.model.x,5);assert.equal(plate.objectTransforms.model.z,8);assert.equal(plate.rendering,false);}
await context.redoObjectEdit();assert.equal(context.plates.length,0);assert.equal(scene.children.length,0);
await context.undoObjectEdit();assert.equal(context.plates.length,4);

// Deleting the original physical plate must retain its SCAD source and copies elsewhere.
context.loadedPlateIds.add('B');context.batchPlateMeta.B={name:'Copies',hidden:false};
let plate=context.plates[0];
plate.batchInstances=[{id:'copy',sourceKey:'model',label:'Copy',plateId:'B',configuration:{parameters:{size:12}}}];
context.ensureObjectRecords(plate);
const originalMesh=mesh(), copyMesh=mesh('instance:copy');plate.meshes=[originalMesh,copyMesh];
context.currentMeshes=plate.meshes;scene.add(originalMesh,copyMesh);
context.activeViewPlateId='A';context.removeBuildPlate('A');
assert.equal(context.plates.length,1,'Keep the source required by the surviving copy');
assert.equal(plate.defaultPlateId,'B');assert.equal(plate.objectRecords.model.deleted,true);
assert.equal(plate.objectRecords['instance:copy'].deleted,false);assert.equal(plate.meshes[0],copyMesh);
assert.equal(scene.children.includes(originalMesh),false);assert.equal(scene.children.includes(copyMesh),true);
assert.equal(context.loadedPlateIds.has('A'),false);
context.ensureObjectRecords(plate);assert.equal(context.batchPlateMeta.A,undefined,'Deleted records cannot recreate the removed plate');
await context.undoObjectEdit();plate=context.plates[0];assert.equal(plate.defaultPlateId,'A');
assert.equal(plate.objectRecords.model.deleted,false);assert.equal(plate.objectRecords['instance:copy'].plateId,'B');
await context.redoObjectEdit();plate=context.plates[0];assert.equal(plate.objectRecords.model.deleted,true);
assert.equal(plate.objectRecords['instance:copy'].plateId,'B');
await context.undoObjectEdit();
// Deleting a secondary plate deletes its contents, preserving objects elsewhere.
context.removeBuildPlate('B');plate=context.plates[0];
assert.equal(plate.objectRecords['instance:copy'].deleted,true);assert.equal(plate.objectRecords.model.deleted,false);
assert.equal(plate.objectRecords.model.plateId,'A');assert.equal(context.loadedPlateIds.has('B'),false);
await context.undoObjectEdit();plate=context.plates[0];
assert.equal(plate.objectRecords['instance:copy'].deleted,false);assert.equal(context.batchPlateMeta.B.name,'Copies');
await context.redoObjectEdit();plate=context.plates[0];assert.equal(plate.objectRecords['instance:copy'].deleted,true);

// An empty plate is still undoable, with no objects to replay.
context.loadedPlateIds.add('C');context.batchPlateMeta.C={name:'Empty plate'};
context.removeBuildPlate('C');assert.equal(context.loadedPlateIds.has('C'),false);
await context.undoObjectEdit();assert.equal(context.loadedPlateIds.has('C'),true);
assert.equal(context.batchPlateMeta.C.name,'Empty plate');
await context.redoObjectEdit();assert.equal(context.loadedPlateIds.has('C'),false);
const count=context.objectEditHistory.length;context.objectHistoryBusy=true;
assert.equal(context.removeBuildPlate('A'),false);assert.equal(context.objectEditHistory.length,count);
console.log('Plate removal passed: outline cleanup, atomic deletion, source restoration, undo/redo, copies, deleted objects, empty plates and history guards.');

// Clipboard owns configuration independently and survives deleting its source.
context.objectHistoryBusy=false;
Object.assign(context,{objectClipboard:[],objectClipboardPastes:0,isMacPlatform:()=>true,
  selectObject(id){context.selectedObjectId=id;},
  generatePendingPreviews:async({plateKeys})=>{
    for(const plate of context.plates.filter(p=>plateKeys.includes(p.key))) {
      plate.meshes=context.ensureObjectRecords(plate).map(record=>mesh(record.selectionKey));
      if (plate.meshes.length) scene.add(...plate.meshes);
      if(plate===context.activePlate())context.currentMeshes=plate.meshes;
    }
  }
});
for(const name of ['storedObjectOffset','allObjectEntries','copySelectedObjects','pasteCopiedObjects','refreshViewerEmptyState']) {
  const start=source.indexOf(`function ${name}(`),end=source.indexOf('\n}',start)+2;
  vm.runInContext((name==='pasteCopiedObjects'?'async ':'')+source.slice(start,end),context);
}
context.plates=context.plates.slice(0,1);plate=context.plates[0];
context.activePlateKey=plate.key;context.activeViewPlateId='A';context.selectedObjectId='model';
context.batchSelectedObjectIds.clear();context.loadedPlateIds=new Set(['A']);
context.ensureObjectRecords(plate);context.objectEditHistory.length=0;context.objectRedoHistory.length=0;
assert.equal(context.copySelectedObjects(),true);
plate.values.size=99;
await context.pasteCopiedObjects();plate=context.plates[0];
let pasted=plate.batchInstances.at(-1), key=`instance:${pasted.id}`;
assert.equal(pasted.configuration.parameters.size,10,'Copy captures parameters when C is pressed');
assert.equal(plate.objectRecords[key].deleted,false);assert.equal(context.selectedObjectId,key);
assert.equal(plate.objectTransforms[key].x,15);assert.equal(plate.objectTransforms[key].z,18);
await context.undoObjectEdit();plate=context.plates[0];assert.equal(plate.objectRecords[key],undefined);
await context.redoObjectEdit();plate=context.plates[0];assert.equal(plate.objectRecords[key].deleted,false);
context.removeBuildPlate('A');assert.equal(context.plates.length,0);
await context.pasteCopiedObjects();plate=context.plates[0];
assert.ok(plate,'Clipboard can recreate its source after the last plate was removed');
assert.equal(context.ensureObjectRecords(plate).length,1,'Paste restores only the copied object');
assert.equal(context.ensureObjectRecords(plate)[0].configuration.parameters.size,10);
context.refreshViewerEmptyState();assert.equal(context.viewerMessage.hidden,true,'A visible restored copy cannot show the add-SCAD message');
await context.undoObjectEdit();assert.equal(context.plates.length,0);
await context.redoObjectEdit();assert.equal(context.ensureObjectRecords(context.plates[0]).length,1);
context.plates[0].meshes=[];context.refreshViewerEmptyState();assert.match(context.viewerMessage.textContent,/Generate/);
console.log('Clipboard passed: independent configuration, copied transforms, paste selection, undo/redo, deleted source and empty viewer text.');

// A multi-selection deletes in one transaction across sources and plates.
const start=source.indexOf('function removeSelectedObject('),end=source.indexOf('\n}',start)+2;
vm.runInContext(source.slice(start,end),context);
const left=context.plates[0], leftRecord=context.ensureObjectRecords(left)[0];
const right={...structuredClone({...left,meshes:[],referenceGroup:null}),key:'right',sourceInstanceId:'right',defaultPlateId:'B',batchInstances:[],objectRecords:{},objectTransforms:{model:{x:17,z:23}},meshes:[]};
context.plates.push(right);const rightRecord=context.ensureObjectRecords(right)[0];right.meshes=[mesh('model')];scene.add(...right.meshes);
context.activePlateKey=left.key;context.currentMeshes=left.meshes;context.selectedObjectId='all';
context.loadedPlateIds.add('B');context.batchPlateMeta.B={name:'Second'};
context.batchSelectedObjectIds=new Set([leftRecord.id,rightRecord.id]);context.objectEditHistory.length=0;context.objectRedoHistory.length=0;
assert.equal(context.removeSelectedObject(),true);assert.equal(context.objectEditHistory.length,1);
assert.equal(context.allObjectEntries().length,0);assert.ok(context.plates.every(p=>p.meshes.length===0));
await context.undoObjectEdit();assert.equal(context.allObjectEntries().length,2);assert.equal(context.batchSelectedObjectIds.size,2);
assert.equal(context.plates.find(p=>p.key==='right').objectTransforms.model.x,17);
assert.equal(context.plates.find(p=>p.key==='right').objectTransforms.model.z,23);
await context.redoObjectEdit();assert.equal(context.allObjectEntries().length,0);assert.ok(context.plates.every(p=>p.meshes.length===0));
console.log('Group deletion passed: whole-selection transaction across sources, preserved positions, complete undo and complete redo.');
