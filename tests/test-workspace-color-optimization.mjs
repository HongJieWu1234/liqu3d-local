import './setup.mjs';
import { normalizeMaxObjectsPerPlate } from '../public/packing-settings.js';
import {syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate} from '../public/object-plate-location.js';
import assert from 'node:assert/strict';
import { colorOptimizationSettings } from '../public/color-optimization.js';
import { snapQuarterTurn } from '../public/quarter-turn.js';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { optimizeWorkspacePlates } from '../public/workspace-color-optimization.js';
import { PRINTERS, createDefaultProfile } from '../public/print-settings-schema.js';
import { bambuExportProfile } from '../lib/bambu-export-profile.mjs';
import { unzipSync, strFromU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
const template=await bambuExportProfile(createDefaultProfile());
const part=(z,color)=>{const g=new BoxGeometry(110,80,1.4).translate(70,70,z+.7);const result={name:'Layer',geometry:{positions:g.attributes.position.array.slice(),indices:g.index.array.slice()},materialIndex:color,colorKnown:true};g.dispose();return result;};
const objects=Array.from({length:4},(_,i)=>({name:`Pattern ${i}`,exportId:`object-${i}`,settings:{layer_height:'0.2',sparse_infill_density:'17%'},parts:[part(0,i%2),part(1.4,1-i%2)]}));
const plates=[{plateId:'A',filename:'a.3mf',model:{title:'Original',palette:['#FF0000','#FFFFFF'],bambuTemplate:template,bedSize:PRINTERS.p1s,objects}}];
const optimized=await optimizeWorkspacePlates(structuredClone(plates),PRINTERS.p1s,{maxFilamentSlots:4});
assert.ok(optimized.report.estimatedSwaps<optimized.report.baselineSwaps);
assert.equal(optimized.plates.length,2);assert.equal(optimized.plates.flatMap(p=>p.model.objects).length,4);
for(const item of optimized.report.objects){const r=item.placement;assert.ok(r.x>=5 && r.y>=5 && r.x+r.w<=251 && r.y+r.h<=251);assert.ok(!(r.x<23 && r.y<33),'P1S exclusion clearance');}
for(const object of optimized.plates.flatMap(p=>p.model.objects)){assert.equal(object.parts.length,2);assert.equal(object.settings.sparse_infill_density,'17%');}
await assert.rejects(()=>optimizeWorkspacePlates(structuredClone(plates),PRINTERS.p1s,{maxFilamentSlots:1}),/filament slots/);
const unknown=structuredClone(plates);unknown[0].model.objects[0].parts.forEach(p=>p.colorKnown=false);
assert.equal((await optimizeWorkspacePlates(unknown,PRINTERS.p1s,{maxFilamentSlots:4})).report.unavailable.length,1);
for (const [limit, count] of [[2,2],[14,1]]) {
  const result=await optimizeWorkspacePlates(structuredClone(plates),PRINTERS.p1s,{maxColorChanges:limit});
  assert.equal(result.plates.length,count);assert.ok(result.report.estimatedSwaps<=limit);
  assert.equal(result.report.maxColorChanges,limit);
}
for (const [input,limit,pattern] of [[plates,1,/No arrangement/],[unknown,50,/unavailable/]]) {
  const copy=structuredClone(input),before=structuredClone(copy);
  await assert.rejects(()=>optimizeWorkspacePlates(copy,PRINTERS.p1s,{maxColorChanges:limit}),pattern);
  assert.deepEqual(copy,before,'failed budget planning preserves input geometry');
}
const heights=structuredClone(plates);heights[0].model.objects[0].settings.layer_height='0.28';
const separated=await optimizeWorkspacePlates(heights,PRINTERS.p1s,{maxFilamentSlots:4});
assert.ok(separated.plates.every(p=>new Set(p.model.objects.map(o=>o.settings.layer_height)).size===1));
// Verify improved packing reaches the worker's geometry transform unchanged.
const compactObjects=[[130,80],[80,80],[120,60],[150,30],[130,40],[30,100]].map(([w,h],i)=>{
 const geometry=new BoxGeometry(w,h,2);const part={name:'Solid',geometry:{positions:geometry.attributes.position.array.slice(),indices:geometry.index.array.slice()},materialIndex:0,colorKnown:true};geometry.dispose();return {name:`Compact ${i}`,exportId:`compact-${i}`,parts:[part]};
});
const compactWorkspace=await optimizeWorkspacePlates([{...plates[0],model:{...plates[0].model,objects:compactObjects}}],PRINTERS.p1s,{maxColorChanges:10000});
assert.equal(compactWorkspace.plates.length,1);
for(const {parts} of compactWorkspace.plates[0].model.objects)for(const {geometry} of parts)for(let i=0;i<geometry.positions.length;i+=3){assert.ok(geometry.positions[i]>=5&&geometry.positions[i]<=251);assert.ok(geometry.positions[i+1]>=5&&geometry.positions[i+1]<=251);}
let messages=[];globalThis.self={postMessage:message=>messages.push(message)};
await import('../public/export-worker.js');
const extras={'workflow.json':JSON.stringify({objects:objects.map(o=>({id:o.exportId,plateId:'A'}))})};
await self.onmessage({data:{plates:structuredClone(plates),extras:structuredClone(extras),printer:PRINTERS.p1s,colorOptimization:{enabled:true,maxFilamentSlots:4}}});
let result=messages.at(-1);assert.ok(!result.error,result.error);assert.equal(result.count,2);assert.equal(result.nativeMultiPlate,true);
const entries=unzipSync(result.archive),report=JSON.parse(strFromU8(entries['Metadata/pmm/color-optimization.json']));
assert.equal(report.objects.length,4);assert.equal(JSON.parse(strFromU8(entries['Metadata/project_settings.config'])).layer_height,template.config.layer_height);
const workflow=JSON.parse(strFromU8(entries['Metadata/pmm/workflow.json']));assert.deepEqual(workflow.plateOrder,['A','B']);assert.deepEqual(new Set(workflow.objects.map(o=>o.plateId)),new Set(['A','B']));
messages=[];const off=structuredClone(plates),original=structuredClone(off);
await self.onmessage({data:{plates:off,extras:structuredClone(extras),colorOptimization:{enabled:false},printer:PRINTERS.p1s}});
result=messages.at(-1);assert.ok(!result.error,result.error);assert.equal(result.count,1);assert.deepEqual(off,original,'disabled optimization preserves exact geometry and placement');
console.log(`Workspace optimization passed: ${optimized.report.baselineSwaps} → ${optimized.report.estimatedSwaps} changes; multipart objects, overrides, printer exclusions, slots, layer heights, unknown colors, worker output and disabled behavior.`);

// Editor offsets must reproduce exactly the worker's transform, including 90°
// rotations, lifted objects, and an existing rotation/translation.
const {Mesh,MeshBasicMaterial,Quaternion,Vector3}=await import('../public/vendor/three/three.module.js');
const {geometryForPrint}=await import('../public/export-geometry.js');
const {optimizedEditorOffset}=await import('../public/workspace-color-optimization.js');
for(const rotation of [0,Math.PI/2,-.73,2.16]) {
  const offset={x:12,z:-17,y:3,rotation:.37}, t={dx:37,dy:29,dz:-3,rotation};
  const next=optimizedEditorOffset(offset,t,PRINTERS.p1s);
  const mesh=new Mesh(new BoxGeometry(15,29,2),new MeshBasicMaterial());
  const layout={x:400,z:-300};
  const geometryAt=o=>{
    mesh.rotation.set(-Math.PI/2,0,0);
    mesh.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),o.rotation));
    mesh.position.set(layout.x+o.x,o.y,layout.z+o.z);
    return geometryForPrint(mesh.geometry,mesh,layout,PRINTERS.p1s);
 };
 const before=geometryAt(offset), after=geometryAt(next);
 for(let i=0;i<before.attributes.position.count;i++) {
   const a=new Vector3().fromBufferAttribute(before.attributes.position,i).applyAxisAngle(new Vector3(0,0,1),rotation).add(new Vector3(t.dx,t.dy,t.dz));
   const b=new Vector3().fromBufferAttribute(after.attributes.position,i);
   assert.ok(a.distanceTo(b)<.00005,'editor and export placements agree');
 }
 before.dispose();after.dispose();mesh.geometry.dispose();mesh.material.dispose();
}
messages=[];
await self.onmessage({data:{plates:structuredClone(plates),extras:{},printer:PRINTERS.p1s,colorOptimization:{enabled:true,maxFilamentSlots:4},arrangeOnly:true}});
assert.ok(!messages.at(-1).error,messages.at(-1).error);
assert.equal(messages.at(-1).archive,undefined,'arranging does not download a file');
assert.equal(messages.at(-1).colorOptimization.objects.length,4);

// Exercise the actual editor handlers with a small workspace, without WebGL.
const {readFile}=await import('node:fs/promises');
const {runInNewContext}=await import('node:vm');
const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const handler=name=>{const start=app.indexOf(`function ${name}(`);assert.ok(start>=0);const end=app.indexOf('\n}',start)+2;return (app.slice(start-6,start)==='async '?'async ':'')+app.slice(start,end);};
const record={id:'object-0',selectionKey:'model',plateId:'C'};
const source={key:'source',defaultPlateId:'C',objectRecords:{model:record},objectTransforms:{model:{x:20,z:25,y:0,rotation:0}},batchInstances:[]};
const state={workspacePrimeTowers:[], workspaceMaxObjectsPerPlate:null, normalizeMaxObjectsPerPlate,bulkPreviewGenerationPromise:null,colorOptimizationSettings,syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate,plates:[source],objectEditHistory:[],objectRedoHistory:[],objectHistoryBusy:false,updateSelectionVisuals(){},workspaceColorOptimization:{enabled:false},reduceColorChanges:{checked:false},preparedExport:{},activeViewPlateId:'C',batchPlateMeta:{C:{name:'Custom'},D:{name:'Empty'}},loadedPlateIds:new Set(['C','D']),exportInProgress:false,pointerDown:null,structuredClone,optimizedEditorOffset,
 ensureObjectRecords:()=>[record],allObjectEntries:()=>[{plate:source,record}],activePlate:()=>source,objectRecordForSelection:(p,k)=>p?.objectRecords[k],ensureBatchPlate:id=>id,ensurePhysicalPlateId:()=>{},clearPlateRemovalConfirmation:()=>{},markWorkspaceDirty:()=>{},applyBatchPlateVisibility:()=>{},persistUploadedPlates:()=>{},renderWorkflowUi:()=>{},renderPlateList:()=>{},updatePlateFitStatus:()=>{},fitAllPlates:()=>{},setStatus:()=>{}};
runInNewContext(['storedObjectOffset','clearWorkspaceColorArrangement','applyWorkspaceColorArrangement','rememberObjectMove','rememberObjectEdit','replayObjectEdit','undoObjectEdit','redoObjectEdit','undoWorkspaceColorArrangement'].map(handler).join('\n'),state);
const editorReport={plateCount:1,estimatedSwaps:0,objects:[{id:record.id,plateId:'A',transform:{dx:5,dy:7,dz:0,rotation:0}}]};
state.applyWorkspaceColorArrangement(editorReport,PRINTERS.p1s,{enabled:true,maxColorChanges:50});
assert.equal(state.workspaceColorOptimization.maxColorChanges,50);
assert.equal(record.plateId,'A');assert.equal(state.reduceColorChanges.checked,true);
assert.equal(source.defaultPlateId,'A');
assert.deepEqual([...state.loadedPlateIds],['A'],'empty plates are removed');
assert.equal(state.batchPlateMeta.C,undefined);assert.equal(state.batchPlateMeta.D,undefined);
assert.equal(state.objectEditHistory.length,1,'whole arrangement is one undo step');
await state.undoObjectEdit();assert.equal(state.workspaceColorOptimization.maxColorChanges,undefined);
await state.redoObjectEdit();assert.equal(state.workspaceColorOptimization.maxColorChanges,50);assert.equal(state.workspaceColorOptimization.enabled,true);
let old=structuredClone(source.objectTransforms.model);
state.rememberObjectMove(source,'model',old);
assert.equal(state.reduceColorChanges.checked,true,'click without movement keeps arrangement enabled');
source.objectTransforms.model.x+=10;
state.rememberObjectMove(source,'model',old);
assert.equal(state.reduceColorChanges.checked,false,'manual movement clears checkbox');
assert.equal(state.workspaceColorOptimization.enabled,false,'manual movement clears saved flag');
await state.undoObjectEdit();assert.equal(source.objectTransforms.model.x,old.x);
await state.undoObjectEdit();assert.equal(record.plateId,'C');assert.equal(source.objectTransforms.model.x,20);assert.equal(source.objectTransforms.model.z,25);
assert.equal(state.workspaceColorOptimization.maxColorChanges,undefined);
assert.equal(state.workspaceColorOptimization.enabled,false);
assert.equal(source.defaultPlateId,'C');assert.deepEqual([...state.loadedPlateIds],['C','D']);assert.equal(state.batchPlateMeta.D.name,'Empty');
await state.redoObjectEdit();assert.equal(state.workspaceColorOptimization.maxColorChanges,50);assert.equal(record.plateId,'A');assert.deepEqual([...state.loadedPlateIds],['A']);
await state.undoObjectEdit();
// Ctrl+Enter restores the arrangement and disables it, even after reapplying.
state.applyWorkspaceColorArrangement(editorReport,PRINTERS.p1s,{enabled:true,maxColorChanges:36});
const priorOffset=structuredClone(source.objectTransforms.model);
state.applyWorkspaceColorArrangement(editorReport,PRINTERS.p1s,{enabled:true,maxColorChanges:50});
state.exportInProgress=true;assert.equal(await state.undoWorkspaceColorArrangement(),false);assert.equal(state.workspaceColorOptimization.maxColorChanges,50);state.exportInProgress=false;
assert.equal(await state.undoWorkspaceColorArrangement(),true);
assert.deepEqual(structuredClone(source.objectTransforms.model),priorOffset);
assert.equal(state.workspaceColorOptimization.maxColorChanges,36);assert.equal(state.workspaceColorOptimization.enabled,false);assert.equal(state.reduceColorChanges.checked,false);
await state.redoObjectEdit();assert.equal(state.workspaceColorOptimization.maxColorChanges,50);assert.equal(state.reduceColorChanges.checked,true);
const savedOffset=structuredClone(source.objectTransforms.model);
source.objectTransforms.model.x+=5;state.rememberObjectMove(source,'model',savedOffset);
assert.equal(await state.undoWorkspaceColorArrangement(),false,'Never overwrite newer manual edits');
assert.equal(source.objectTransforms.model.x,savedOffset.x+5);
await state.undoObjectEdit();await state.undoObjectEdit();await state.undoObjectEdit();
console.log('Editor arrangement passed: empty plate cleanup and restoration, exact rotated placements, no download, automatic unchecking and whole-arrangement undo.');

// Quarter-turn rotation uses the same editor transforms and one undo step per drag.
const THREE=await import('../public/vendor/three/three.module.js');
const makeMesh=(x,z,key='model')=>{const m=new THREE.Mesh(new THREE.BoxGeometry(30,10,2).translate(x,0,z),new THREE.MeshBasicMaterial());m.userData.selectionKey=key;return m;};
source.meshes=[makeMesh(40,0),makeMesh(40,3),makeMesh(90,0,'other')];
let planePoint;
Object.assign(state,{requestRender(){},THREE,snapQuarterTurn,updateSelectionVisuals:()=>{},selectedObjectId:'model',lastViewerPointer:{clientX:100,clientY:100},
 controls:{enabled:true},selectionHelper:null,selectionLabelDimensions:{},
 renderer:{domElement:{style:{},focus:()=>{},setPointerCapture:()=>{},releasePointerCapture:()=>{},classList:{remove:()=>{}}}},
 pointAtPointerOnPlane:()=>planePoint,raycaster:{intersectObject:()=>[{}]},
 plateLayoutForId:()=>({x:300,z:-200}),combinedBox:meshes=>meshes.length?meshes.reduce((box,m)=>{m.updateMatrixWorld(true);return box.union(new THREE.Box3().setFromObject(m));},new THREE.Box3()):null,document:{querySelectorAll:()=>[]}});
runInNewContext(['generatedPositionFor','applyStoredTransform','beginObjectRotation','dragObjectRotation','finishObjectDrag','handleObjectRotationShortcut','handleCursorRotationMove','handleCursorRotationClick'].map(handler).join('\n'),state);
for(const mesh of source.meshes)state.applyStoredTransform(mesh,source);
const originalBox=state.combinedBox(source.meshes.slice(0,2)), neighbour=source.meshes[2].matrixWorld.clone();
const startingOffset=structuredClone(source.objectTransforms.model);
state.workspaceColorOptimization.enabled=true;state.reduceColorChanges.checked=true;
let prevented=0;const event={key:'r',target:{closest:()=>null},preventDefault:()=>prevented++};
const center=originalBox.getCenter(new THREE.Vector3());center.y=originalBox.min.y+.5;
const pointAt=degrees=>center.clone().add(new THREE.Vector3(50*Math.cos(degrees*Math.PI/180),0,50*Math.sin(degrees*Math.PI/180)));
planePoint=pointAt(170);
state.handleObjectRotationShortcut(event);
assert.equal(prevented,1);assert.equal(state.pointerDown.rotating,true);
assert.deepEqual(structuredClone(source.objectTransforms.model),startingOffset,'R starts cursor rotation without an initial jump');
for(const blocked of [{ctrlKey:true},{metaKey:true},{repeat:true},{target:{closest:()=>({})}}])state.handleObjectRotationShortcut({...event,...blocked});
assert.equal(state.pointerDown.rotating,true,'typing and held keys do not finish rotation');
assert.equal(state.controls.enabled,false);
planePoint=pointAt(-153);state.handleCursorRotationMove({clientX:130,clientY:110});
assert.equal(source.objectTransforms.model.rotation,0,'Small motion does not introduce a diagonal angle across the 180° boundary');
planePoint=pointAt(-110);state.handleCursorRotationMove({clientX:130,clientY:110});
assert.equal(source.objectTransforms.model.rotation,3*Math.PI/2,'Clockwise rotation snaps to 270°');
planePoint=pointAt(-10);state.handleCursorRotationMove({clientX:130,clientY:110});
assert.equal(source.objectTransforms.model.rotation,Math.PI,'Half turns remain available');
planePoint=pointAt(70);state.handleCursorRotationMove({clientX:130,clientY:110});
assert.equal(source.objectTransforms.model.rotation,Math.PI/2,'Three clockwise turns reach 90°');
const rotatedBox=state.combinedBox(source.meshes.slice(0,2));
assert.ok(originalBox.getCenter(new THREE.Vector3()).distanceTo(rotatedBox.getCenter(new THREE.Vector3()))<.00001);
assert.deepEqual(source.meshes[2].matrixWorld,neighbour);
let clickConsumed=false;state.handleCursorRotationClick({button:0,preventDefault:()=>{},stopImmediatePropagation:()=>clickConsumed=true});assert.equal(clickConsumed,true);assert.equal(state.pointerDown,null);assert.equal(state.controls.enabled,true);assert.equal(state.reduceColorChanges.checked,false);
await state.undoObjectEdit();assert.deepEqual(structuredClone(source.objectTransforms.model),startingOffset);
for(const mesh of source.meshes)state.applyStoredTransform(mesh,source);
const historyCount=state.objectEditHistory.length;
state.workspaceColorOptimization.enabled=true;state.reduceColorChanges.checked=true;
planePoint=pointAt(0);state.beginObjectRotation();
planePoint=pointAt(25);state.dragObjectRotation({});state.handleObjectRotationShortcut({...event,key:'Escape'});
assert.deepEqual(structuredClone(source.objectTransforms.model),startingOffset,'Esc restores the whole original transform');
assert.equal(state.objectEditHistory.length,historyCount);assert.equal(state.reduceColorChanges.checked,true);assert.equal(state.pointerDown,null);assert.equal(state.renderer.domElement.style.cursor,'');
for(const mesh of source.meshes){mesh.geometry.dispose();mesh.material.dispose();}
console.log('Cursor rotation passed: 0/90/180/270°, wraparound, stable multipart centre, input guards, camera lock, cancellation and undo.');

// Clicking a tag follows its assigned plate, never its source's original plate.
const otherSource={key:'other-source',defaultPlateId:'D',objectRecords:{model:{id:'other-tag',selectionKey:'model',plateId:'B',originalPlateId:'D',moved_plate:'B'}}};
const focusedPlates=[];
const selectionState={centerPlateIdInView:id=>focusedPlates.push(id),syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate,plates:[source,otherSource],activePlateKey:source.key,activeViewPlateId:'A',bulkPreviewGenerationPromise:null,
 objectRecordForSelection:(p,k)=>p.objectRecords[k],buildPlateReference:()=>{},updatePlateFitStatus:()=>{},renderPlateList:()=>{},persistUploadedPlates:()=>{},selectObject:(key,fit)=>{assert.equal(fit,false);selectionState.selected=key;},
 switchPlate:(key,options)=>{assert.equal(options.focus,false,'source loading must not focus the original plate');assert.equal(options.preserveView,true);assert.equal(options.generateIfEmpty,false);selectionState.activePlateKey=key;}};
runInNewContext(handler('selectSceneObject'),selectionState);
assert.equal(selectionState.selectSceneObject({plateKey:'other-source',selectionKey:'model'}),'model');
assert.deepEqual(focusedPlates,['B'],'selection focuses the moved plate');
assert.equal(selectionState.activeViewPlateId,'B');assert.equal(otherSource.defaultPlateId,'D');assert.equal(otherSource.objectRecords.model.plateId,'B');
moveObjectToPlate(otherSource.objectRecords.model,'C');
selectionState.selectSceneObject({plateKey:'other-source',selectionKey:'model'});
assert.equal(selectionState.activeViewPlateId,'C','same-source objects also follow their assigned plate');
selectionState.activePlateKey=source.key;selectionState.bulkPreviewGenerationPromise=Promise.resolve();
assert.equal(selectionState.selectSceneObject({plateKey:'other-source',selectionKey:'model'}),null);
assert.equal(selectionState.activeViewPlateId,'C','background generation never sends selection to the original plate');
assert.equal(selectionState.activePlateKey,source.key,'background rendering retains its source context');
assert.deepEqual(focusedPlates,['B','C','C'],'camera follows current assignments, including same-source and background selection');
console.log('Optimized tag selection passed: current plate assignment, camera focus, same-source selection and background generation.');
