import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from '../public/vendor/three/three.module.js';
import { PreviewPrefetch } from '../public/preview-prefetch.js';
import { effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot } from '../public/object-render-state.js';
import { PlateShortcutBuffer } from '../public/plate-shortcut-buffer.js';
import { placePrimeTower } from '../public/plate-packing.js';
import { normalizePrimeTowerSettings } from '../public/prime-tower.js';

const app = await fs.readFile('public/app.js', 'utf8');
const defs = [1,2].map(id=>({id, mergeKey:'tag'}));
const base = {width:40,height:2};
const plate = {key:'source', source:'// multipart tag', objectDefs:defs, values:{...base},
  objectBinding:{selectionKey:'group:tag',memberIds:[1,2]}, meshes:[], renderToken:0,
  batchInstances:[{id:'one',memberIds:[1,2],configuration:{parameters:{...base}}}, {id:'two',memberIds:[1,2],configuration:{parameters:{...base,width:50}}}],
  objectRecords:{'group:tag':{id:'native'},'instance:one':{id:'one'},'instance:two':{id:'two'}}};
let requestCount=0, decodeCount=0, failMember=null, mutate=null;
const scene=new Set(), noop=()=>{};
const ui={classList:{add:noop,remove:noop},setAttribute:noop};
const state=vm.createContext({structuredClone,AbortController,effectiveObjectValues,objectRenderTargets,pendingObjectRenderTargets,objectRenderSnapshot,
  activePlate:()=>plate,activePlateKey:plate.key,objectDefs:defs,currentMeshes:[],selectedObjectId:'all',lastGeneratedValues:null,firstPreview:false,
  previewController:null,generateBtn:{...ui},viewerMessage:{...ui},getValues:()=>structuredClone(plate.values),
  setStatus:noop,renderPlateList:noop,updateObjectMenu:noop,updatePlatePosition:noop,updateSelectionVisuals:noop,
  applyBatchPlateVisibility:noop,renderWorkflowUi:noop,persistUploadedPlates:noop,autoPositionOriginDesigns:noop,
  changedValueKeys:(before,after)=>Object.keys(after).filter(key=>before?.[key]!==after[key]),
  scene:{add:mesh=>scene.add(mesh),remove:mesh=>scene.delete(mesh)},
  runRenderJobs:jobs=>Promise.all(jobs.map(job=>job())),
  async fetchStl(url,values){requestCount++;const id=Number(new URL(url,'http://local').searchParams.get('id'));if(mutate){const fn=mutate;mutate=null;fn();}if(id===failMember)throw new Error('Bad member');return Uint8Array.of(id,values.width,values.height).buffer;},
  createMeshesFrom3mf(data,def,values){
    decodeCount++;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(values.width,2,3),new THREE.MeshStandardMaterial());
    mesh.userData={objectId:def.id};mesh.position.set(12,0,15);
    mesh.geometry.addEventListener('dispose',()=>{mesh.geometry.disposed=true;});
    return [mesh];
  },
  ensureObjectRecords(_plate,{generatedKeys}={}){for(const key of generatedKeys || [])plate.objectRecords[key].configuration={parameters:structuredClone(plate.renderStates[key].values)};},
  syncActivePlateRuntime(){plate.meshes=state.currentMeshes;},bulkPreviewRerunRequested:false
});
const begin=app.indexOf('async function generatePreview(');
vm.runInContext(app.slice(begin,app.indexOf('\nfunction plateNeedsGeneration(',begin)),state);
const meshesFor=key=>plate.meshes.filter(mesh=>mesh.userData.selectionKey===key);
const initialTargets=objectRenderTargets(plate),initialJobs=new Map();
for(const target of initialTargets)for(const def of target.defs){
  const key=`${target.signature}:${def.id}`;
  initialJobs.set(key,{key,run:()=>state.fetchStl(`/api/render-object?id=${def.id}`,target.values)});
}
const prefetch=new PreviewPrefetch([{key:plate.key,signature:objectRenderSnapshot(initialTargets),jobs:[...initialJobs.values()]}],4);
await state.generatePreview({prefetch});
await prefetch.release(plate.key);await prefetch.close();
assert.equal(requestCount,4,'Identical multipart copies share their render requests');
assert.equal(plate.error,null,'Prefetched output commits through the normal preview path');
assert.equal(decodeCount,4,'Identical multipart copies decode once per response');
assert.equal(scene.size,6);
const native=meshesFor('group:tag'), other=meshesFor('instance:two');
const copy=meshesFor('instance:one');
assert.notEqual(copy[0].geometry,native[0].geometry,'Copies own their geometry disposal');
assert.notEqual(copy[0].material,native[0].material,'Copy colors remain independent');
assert.notEqual(copy[0].userData,native[0].userData,'Copy identity remains independent');
assert.deepEqual(copy[0].geometry.attributes.position.array,native[0].geometry.attributes.position.array,'Geometry is identical after reuse');
copy[0].material.color.set('#FF0000');assert.notEqual(copy[0].material.color.getHex(),native[0].material.color.getHex());
plate.batchInstances[0].configuration.parameters.width=25;plate.batchDirty=true;
await state.generatePreview();
assert.equal(requestCount,6,'Only the two changed members render');
assert.deepEqual(meshesFor('group:tag'),native);assert.deepEqual(meshesFor('instance:two'),other);
assert.ok(native.every(mesh=>!mesh.geometry.disposed));
assert.deepEqual(meshesFor('instance:one')[0].position.toArray(),[12,0,15]);
plate.objectRecords['group:tag'].parameterOverrides={width:18};plate.batchDirty=true;
await state.generatePreview();
assert.equal(requestCount,8);assert.equal(plate.values.width,40);
assert.equal(plate.batchInstances[0].configuration.parameters.width,25);
assert.equal(plate.renderStates['group:tag'].values.width,18);
plate.values.height=3;
await state.generatePreview();
assert.equal(requestCount,10,'Source defaults affect the native target; frozen copies stay independent');
assert.equal(plate.renderStates['group:tag'].values.width,18);
const successful=meshesFor('instance:one');
plate.batchInstances[0].configuration.parameters.width=30;failMember=2;
await state.generatePreview();
assert.match(plate.error,/Bad member/);assert.deepEqual(meshesFor('instance:one'),successful);
assert.equal(plate.renderStates['instance:one'].values.width,25,'Failed multipart render preserves its successful input');
failMember=null;mutate=()=>{plate.batchInstances[0].configuration.parameters.width=35;};
await state.generatePreview();
assert.deepEqual(meshesFor('instance:one'),successful,'Superseded object results cannot commit');
await state.generatePreview();assert.equal(plate.renderStates['instance:one'].values.width,35);
assert.deepEqual(meshesFor('instance:two'),other,'Unrelated copies stay untouched after retries');
const restored=structuredClone({values:plate.values,objectDefs:defs,objectRecords:plate.objectRecords,batchInstances:plate.batchInstances});
assert.equal(effectiveObjectValues(restored,'group:tag').width,18,'Overrides survive persistence');
assert.equal(effectiveObjectValues(restored,'instance:one').width,35);
const priorCount=requestCount;await state.generatePreview();assert.equal(requestCount,priorCount,'No-op generation makes no requests');
let towerRefreshes=0;
state.autoPositionOriginDesigns=()=>{throw new Error('No room');};
state.refreshWorkspacePrimeTowers=()=>{towerRefreshes++;return '';};
plate.values.height=4;await state.generatePreview();
assert.equal(towerRefreshes,1,'Auto-position warnings must not skip tower refresh');

const jobs=new Map(), commits=[];let timer=0;
const shortcut=new PlateShortcutBuffer((id,payload)=>commits.push([id,payload]),{schedule:fn=>{jobs.set(++timer,fn);return timer;},unschedule:id=>jobs.delete(id)});
shortcut.handle({key:'A',shiftKey:true},'selected');
assert.equal(commits.length,0,'Letter move waits for an optional digit');
shortcut.handle({key:'!',code:'Digit1',shiftKey:true});
assert.deepEqual(commits,[['A1','selected']],'Shift-held digit uses the physical digit key');
shortcut.handle({key:'Z',shiftKey:true},'other');[...jobs.values()].at(-1)();
assert.deepEqual(commits.at(-1),['Z','other']);
shortcut.handle({key:'A',shiftKey:true},'cancelled');shortcut.handle({key:'Escape'});
shortcut.handle({key:'B',shiftKey:true},'blurred');shortcut.cancel();
assert.equal(commits.length,2,'Escape and blur cancellation do not move objects');
console.log('Incremental objects and plate shortcuts passed: request isolation, multipart atomicity, retained meshes/transforms, overrides, persistence, failures, stale results, and buffered A1 input.');

// The viewer translates scene X/Z into the same bed coordinates as the packer.
const viewerMeshes=['#FF0000','#000000'].map(hex=>({userData:{selectionKey:'model',hexColor:hex},bounds:{min:{x:-50,y:0,z:20},max:{x:-20,y:2,z:40}}}));
const viewerSource={key:'viewer',values:{},objectDefs:[],objectRecords:{model:{id:'view',selectionKey:'model',plateId:'A1'}},meshes:viewerMeshes};
const viewerProfile={nozzleDiameter:.4,settings:{layer_height:.2,enable_prime_tower:true}};
const towerState=vm.createContext({structuredClone,placePrimeTower,normalizePrimeTowerSettings,
  analyzeWorkspaceTowerMeshes:()=>null,
  workspacePrimeTowers:[],workspacePrimeTowerErrors:{},exportFontRevision:0,
  activePrinter:()=>({width:256,depth:256}),printProfileSnapshotFromUi:()=>viewerProfile,
  allObjectEntries:()=>[{plate:viewerSource,record:viewerSource.objectRecords.model}],
  currentObjectPlate:record=>record.plateId,plateLayoutForId:()=>({x:0,z:0}),
  objectRenderTargets:()=>[],pendingObjectRenderTargets:()=>[],combinedBox:()=>viewerMeshes[0].bounds});
for(const name of ['primeTowerRect','refreshWorkspacePrimeTowers']){
  const start=app.indexOf(`function ${name}(`);vm.runInContext(app.slice(start,app.indexOf('\n}',start)+2),towerState);
}
assert.equal(towerState.refreshWorkspacePrimeTowers(),'');
assert.equal(towerState.workspacePrimeTowers[0].plateId,'A1');
const firstTower=towerState.workspacePrimeTowers[0];
const rect=towerState.primeTowerRect(firstTower,{width:256,depth:256});
assert.equal(rect.minX,firstTower.x-128);assert.equal(rect.minZ,128-firstTower.y-firstTower.h);
viewerMeshes.push({userData:{selectionKey:'model',hexColor:'#00FF00'}});
assert.equal(towerState.refreshWorkspacePrimeTowers(),'');
assert.ok(towerState.workspacePrimeTowers[0].w>firstTower.w,'An edited additional color enlarges the reservation');
assert.equal(viewerMeshes[0].bounds.min.x,-50,'Reservation refresh does not move objects');
viewerProfile.settings.enable_prime_tower=false;towerState.refreshWorkspacePrimeTowers();assert.equal(towerState.workspacePrimeTowers.length,0);
viewerProfile.settings.enable_prime_tower=true;towerState.refreshWorkspacePrimeTowers();
towerState.pendingObjectRenderTargets=()=>[{}];viewerProfile.settings.enable_prime_tower=false;
towerState.refreshWorkspacePrimeTowers();assert.equal(towerState.workspacePrimeTowers.length,0,'Off removes a stale tower even while models need regeneration');
towerState.pendingObjectRenderTargets=()=>[];
viewerProfile.settings.enable_prime_tower=true;viewerMeshes[0].bounds={min:{x:-123,y:0,z:-123},max:{x:123,y:2,z:123}};
assert.equal(towerState.refreshWorkspacePrimeTowers(),'');
assert.equal(towerState.workspacePrimeTowerErrors.A1,undefined,'Crowding does not freeze the tower or block export');
const oldTower=towerState.workspacePrimeTowers[0];
viewerMeshes.splice(0,viewerMeshes.length,...['#FFFFFF','#FFFF00'].map(hex=>({userData:{selectionKey:'model',hexColor:hex},bounds:{min:{x:-123,y:0,z:-123},max:{x:123,y:10,z:123}}})));
towerState.pendingObjectRenderTargets=()=>[{}];
assert.equal(towerState.refreshWorkspacePrimeTowers(),'');
const replacedTower=towerState.workspacePrimeTowers[0];
assert.deepEqual([...replacedTower.channels],['#FFFF00','#FFFFFF']);
assert.equal(replacedTower.height,10,'Replacement geometry updates height even while other rendering is pending');
assert.equal(replacedTower.x,oldTower.x,'Only position survives a geometry replacement');
viewerMeshes.splice(0);towerState.refreshWorkspacePrimeTowers();
assert.equal(towerState.workspacePrimeTowers.length,0,'Deleted geometry cannot leave a tower behind');
viewerMeshes.push({userData:{selectionKey:'model',hexColor:'#00FFFF'},bounds:{min:{x:0,y:0,z:0},max:{x:10,y:3,z:10}}});
towerState.refreshWorkspacePrimeTowers();assert.equal(towerState.workspacePrimeTowers.length,0,'Single-color replacement stays tower-free');
console.log('Viewer prime tower bridge passed: plate IDs, coordinates, color growth, free placement, disabled towers and replacement colors/heights.');
