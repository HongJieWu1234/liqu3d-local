import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { movePrimeTower } from '../public/prime-tower-position.js';
import { placePrimeTower } from '../public/plate-packing.js';

const source = await fs.readFile('public/app.js', 'utf8');
const printer = {width:256,depth:256,excludedAreas:[{x1:0,y1:0,x2:20,y2:20}],nozzleLimitedAreas:[{x1:220,y1:0,x2:256,y2:40}]};
const items = [{height:20,towerChannels:['red','blue'],placement:{x:80,y:80,w:40,h:40}}];
const initial = {...placePrimeTower(items,printer,{}),plateId:'B'};
const tower = movePrimeTower(initial,printer,items.map(item=>item.placement),150,150);
assert.ok(tower.manual);
assert.equal(movePrimeTower(tower,printer,items.map(item=>item.placement),90,90).x,90);
assert.equal(movePrimeTower(tower,printer,[],5,5).x,5);
assert.equal(movePrimeTower(tower,printer,[],220,5).x,220);
assert.equal(movePrimeTower(tower,printer,[],1,150).x,1);
const outside=movePrimeTower(tower,printer,[],-100,400);
assert.equal(outside.x,-100);assert.equal(outside.y,400);
assert.equal(placePrimeTower(items,printer,{},outside).y,400,'Refresh preserves placement outside the bed');
assert.equal(placePrimeTower(items,printer,{},tower).x,150,'Refresh retains a manual position');

const history=[], redo=[]; let saved, builds=0;
const plate={defaultPlateId:'A',meshes:[{userData:{selectionKey:'model'}}]};
const state=vm.createContext({requestRender(){},structuredClone,movePrimeTower,
  workspacePrimeTowers:[tower,{...tower,plateId:'A'}],workspacePrimeTowerErrors:{},
  selectedPrimeTowerPlateId:'B',pointerDown:null,exportInProgress:false,objectHistoryBusy:false,bulkPreviewGenerationPromise:null,
  preparedExport:{stale:true},controls:{enabled:true},
  renderer:{domElement:{style:{},classList:{add(){},remove(){}},setPointerCapture(){},releasePointerCapture(){}}},
  activePrinter:()=>printer,plateLayoutForId:()=>({x:300,z:0}),
  allObjectEntries:()=>[{plate,record:{selectionKey:'model',plateId:'B'}}],currentObjectPlate:record=>record.plateId,
  combinedBox:()=>({min:{x:252,y:0,z:8},max:{x:292,y:20,z:48}}),
  rememberObjectEdit:entry=>history.push(structuredClone(entry)),
  persistUploadedPlates:()=>{saved=structuredClone(state.workspacePrimeTowers);},
  buildPlateReference:()=>builds++,setStatus:()=>{},refreshWorkspacePrimeTowers:()=>{},
  batchPlateReferences:{B:{position:{y:0},children:[{userData:{plateRole:'prime-tower-surface'},position:{x:0,z:0}}]}},
  pointAtPointerOnPlane:event=>({x:event.clientX,z:event.clientY})
});
for(const name of ['primeTowerMoveContext','nudgePrimeTower','beginPrimeTowerDrag','movePrimeTowerDrag','finishObjectDrag','replayObjectEdit']) {
  const start=source.indexOf(`${name==='replayObjectEdit'?'async ':''}function ${name}(`);
  vm.runInContext(source.slice(start,source.indexOf('\n}',start)+2),state);
}
assert.equal(state.primeTowerMoveContext('B').tower.plateId,'B','Use the selected physical plate');
assert.equal(state.nudgePrimeTower(10,-1),true);
assert.equal(saved[0].x,160);assert.equal(saved[0].y,151);
assert.equal(saved[1].x,150,'Other plates stay unchanged');
assert.equal(state.preparedExport,null);assert.equal(history.length,1);
assert.equal(saved[0].bodyX,160+tower.padding,'Export body coordinates follow movement');
assert.equal(await state.replayObjectEdit(history,redo,'undone'),true);
assert.equal(state.workspacePrimeTowers[0].x,150);
assert.equal(await state.replayObjectEdit(redo,history,'redone'),true);
assert.equal(state.workspacePrimeTowers[0].x,160);
assert.equal(state.nudgePrimeTower(-70,61),true,'Can nudge through an object');
assert.equal(state.workspacePrimeTowers[0].x,90);
state.nudgePrimeTower(70,-61);
for(const flag of ['exportInProgress','objectHistoryBusy','bulkPreviewGenerationPromise']) {
  state[flag]=true;assert.equal(state.nudgePrimeTower(1,0),false);state[flag]=false;
}

// Exercise the actual pointer handlers, including release, cancellation and the click threshold.
const event=(x,y)=>({pointerId:1,clientX:x,clientY:y});
state.beginPrimeTowerDrag(event(0,0),{batchPlateId:'B'});
assert.equal(state.controls.enabled,false);
state.movePrimeTowerDrag(event(1,1));assert.equal(state.pointerDown.dragging,false);
state.movePrimeTowerDrag(event(10,10));
assert.equal(state.workspacePrimeTowers[0].x,170);assert.equal(state.workspacePrimeTowers[0].y,141);
assert.equal(state.batchPlateReferences.B.children[0].position.x,10);
state.finishObjectDrag({cancelled:true});
assert.equal(state.workspacePrimeTowers[0].x,160);assert.equal(state.controls.enabled,true);
state.beginPrimeTowerDrag(event(0,0),{batchPlateId:'B'});
state.movePrimeTowerDrag(event(10,10));state.finishObjectDrag();
assert.equal(saved[0].x,170);assert.equal(state.pointerDown,null);
assert.ok(builds>0);

// Keyboard movement uses the same step sizes as objects and only targets the tower.
let keydown;
state.renderer.domElement.addEventListener=(_name,handler)=>{keydown=handler;};
state.selectedObjectId='model';state.moveSelectionBy=()=>assert.fail('Tower keys must not move the selected object');
const start=source.indexOf("renderer.domElement.addEventListener('keydown', (event) => {");
vm.runInContext(source.slice(start,source.indexOf('\n});',start)+4),state);
keydown({key:'ArrowRight',shiftKey:true,preventDefault(){}});
assert.equal(saved[0].x,180);
keydown({key:'ArrowDown',altKey:true,preventDefault(){}});
assert.ok(Math.abs(saved[0].y-140.9)<1e-7);
console.log('Prime tower free dragging, keyboard movement, overlap and off-bed placement, plate isolation, saving, export coordinates, undo/redo and cancellation passed.');
