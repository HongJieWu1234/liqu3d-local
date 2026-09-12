import './setup.mjs';
import { effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot } from '../public/object-render-state.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from '../public/vendor/three/three.core.js';
import { currentObjectPlate } from '../public/object-plate-location.js';
import { objectSettingsSection } from '../public/object-settings.js';

const source = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const scene = new THREE.Scene();
const mesh = (selectionKey, x) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 10), new THREE.MeshStandardMaterial());
  m.position.x = x; m.userData = { selectionKey, hexColor: '#FFFFFF' }; scene.add(m); return m;
};
const record = (id, selectionKey, plateId) => ({ id, selectionKey, sourceKey: selectionKey, label: id, plateId, configuration: { parameters: {} } });
const a = { key: 'a', defaultPlateId: 'A', objectDefs: [], values: {}, objectTransforms: {}, batchInstances: [],
  objectRecords: { first: record('one', 'first', 'A'), second: record('two', 'second', 'A') },
  meshes: [mesh('first', 0), mesh('first', 12), mesh('second', 30)] };
const b = { key: 'b', defaultPlateId: 'B', objectDefs: [], values: {}, objectTransforms: {}, batchInstances: [],
  objectRecords: { model: record('three', 'model', 'B') }, meshes: [mesh('model', 300)] };
// Use valid editor selection keys without needing parser definitions.
for (const [key, entry] of Object.entries(a.objectRecords)) {
  entry.selectionKey = entry.sourceKey = `group:${key}`;
  a.objectRecords[entry.selectionKey] = entry; delete a.objectRecords[key];
}
for (const m of a.meshes) m.userData.selectionKey = `group:${m.userData.selectionKey}`;
let hit = null, focused = 0, frames = 0;
const state = vm.createContext({requestRender(){}, effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot, THREE, scene, currentObjectPlate, structuredClone, plates: [a, b],
  objectSettingsSection, activeSection: '',
  activePlateKey: 'a', activeViewPlateId: 'A', selectedObjectId: 'all', currentMeshes: a.meshes,
  batchSelectedObjectIds: new Set(), bulkPreviewGenerationPromise: null, pointerDown: null,
  objectHistoryBusy: false, exportInProgress: false, preparedExport: null, printSettingsScope: 'global',
  selectionHelper: null, selectionLabelWorld: null, selectionLabel: {hidden:true},
  selectionLabelName: {}, selectionLabelDimensions: {}, renderAppearance: {accent:'#00CC44'},
  controls: {enabled:true}, objectClipboard: [], objectClipboardPastes: 0, isMacPlatform: () => true,
  renderer: {domElement: {focus(){}, setPointerCapture(){}, releasePointerCapture(){}, classList:{remove(){}}, style:{}}},
  activePlate: () => state.plates.find(p => p.key === state.activePlateKey),
  objectRecordForSelection: (p,k) => p?.objectRecords[k]?.deleted ? null : p?.objectRecords[k],
  allObjectEntries: () => state.plates.flatMap(plate => Object.values(plate.objectRecords).filter(r=>!r.deleted).map(record=>({plate,record}))),
  sceneHitAtPointer: () => hit, pointAtPointerOnPlane: () => new THREE.Vector3(),
  combinedBox: meshes => meshes.length ? meshes.reduce((box,m) => box.union(new THREE.Box3().setFromObject(m)), new THREE.Box3()) : null,
  logicalGroupForSelection: () => null, updateSelectionLabelPosition(){ state.selectionLabel.hidden = false; frames++; },
  updatePlateFitStatus(){}, renderPlateList(){}, persistUploadedPlates(){}, buildPlateReference(){},
  renderBatchObjectList(){}, syncActivePlateRuntime(){}, setStatus(){}, setFormValues(){},
  centerPlateIdInView(){focused++;}, switchToPlateId(){},
  switchPlate(key){state.activePlateKey=key;state.currentMeshes=state.activePlate().meshes;}
});
for (const name of ['clearSelectionHelper','selectedMeshes','storedObjectOffset','selectObject','updateSelectionVisuals',
  'selectSceneObject','toggleSceneSelection','finishObjectDrag','handleViewerPointerDown','handleViewerPointerUp','copySelectedObjects']) {
  const start=source.indexOf(`function ${name}(`), end=source.indexOf('\n}',start)+2;
  assert.ok(start>=0);vm.runInContext(source.slice(start,end),state);
}
const first={plateKey:'a',selectionKey:'group:first'}, second={plateKey:'a',selectionKey:'group:second'}, third={plateKey:'b',selectionKey:'model'};
const event = extra => ({button:0,pointerId:1,clientX:20,clientY:20,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra});
const click = (target, extra={}) => {hit=target;const down=event(extra);state.handleViewerPointerDown(down);state.handleViewerPointerUp(event(extra));return down;};
const ids = () => [...state.batchSelectedObjectIds].sort();
click(first);assert.deepEqual(ids(),['one']);assert.equal(state.selectionHelper.children.length,2,'All colored parts highlight together');
const before=focused;
const shift=click(second,{shiftKey:true});assert.ok(shift.prevented&&shift.stopped,'Selection consumes the camera-pan gesture');
assert.deepEqual(ids(),['one','two']);assert.equal(state.selectionHelper.children.length,3);
assert.equal(state.selectionLabelName.textContent,'2 objects selected');assert.equal(focused,before,'Shift-click does not move the camera under the pointer');
click(third,{shiftKey:true});assert.deepEqual(ids(),['one','three','two']);assert.equal(state.selectionHelper.children.length,4);
assert.equal(state.selectionLabelDimensions.textContent,'Plates A, B');assert.equal(state.activePlateKey,'b');
for(const m of [...a.meshes,...b.meshes])assert.equal(m.material.emissiveIntensity,.18,'Every selected object stays highlighted across sources');
assert.equal(state.copySelectedObjects(),true);assert.equal(state.objectClipboard.length,3,'Copy receives the full selection');
click(second,{shiftKey:true});assert.deepEqual(ids(),['one','three']);assert.equal(state.selectionHelper.children.length,3);
assert.equal(a.meshes[2].material.emissiveIntensity,0);assert.equal(a.meshes[2].material.color.r,.42);
click(null,{shiftKey:true});assert.deepEqual(ids(),['one','three'],'Shift-clicking empty space preserves the selection');
click(third,{button:2,shiftKey:true});assert.deepEqual(ids(),['one','three'],'Only left-click changes selection');
hit=second;state.handleViewerPointerDown(event({shiftKey:true}));state.handleViewerPointerUp(event({shiftKey:true,clientX:40}));
assert.deepEqual(ids(),['one','three'],'A drag is not a toggle');assert.equal(state.controls.enabled,true);
hit=second;state.handleViewerPointerDown(event({shiftKey:true}));state.finishObjectDrag({cancelled:true});
assert.deepEqual(ids(),['one','three']);assert.equal(state.controls.enabled,true);
click(second);assert.deepEqual(ids(),['two'],'An ordinary click replaces the selection');assert.equal(state.selectionHelper.children.length,1);
click(second,{shiftKey:true});assert.deepEqual(ids(),[]);assert.equal(state.selectionHelper,null);assert.equal(state.selectionLabel.hidden,true);
state.selectObject(first.selectionKey);assert.deepEqual(ids(),[]);
click(third,{shiftKey:true});assert.deepEqual(ids(),['one','three'],'The first Shift-click includes a prior editor selection');
click(null);assert.deepEqual(ids(),[]);assert.equal(state.selectionHelper,null);
assert.match(source,/addEventListener\('pointerdown', handleViewerPointerDown, true\)/,'Selection runs before camera controls');
assert.ok(frames>0);
console.log('Shift-left selection passed: toggle, multipart highlights, cross-source selection, copy, camera stability, clear, drag, cancel and right-click guards.');
