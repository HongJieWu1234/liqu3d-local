import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { originLayout } from '../public/origin-layout.js';
import * as THREE from '../public/vendor/three/three.module.js';
import { PRINTERS } from '../public/print-settings-schema.js';
import { geometryForPrint } from '../public/export-geometry.js';
import { normalizePrimeTowerSettings } from '../public/prime-tower.js';

const printer = PRINTERS.p1s;
const source = (name, width = 70, depth = 30) => ({ name, offset: { x: 0, y: 0, z: 0, rotation: 0 },
  bounds: { minX: 128-width/2, maxX: 128+width/2, minY: 128-depth/2, maxY: 128+depth/2, minZ: 0 } });
const designs = Array.from({length: 16}, (_, i) => source(`Design ${i}`, 70 + i));
const original = structuredClone(designs);
const plan = originLayout(designs, printer);
assert.equal(plan.items.length, 16); assert.deepEqual(designs, original);
for (const item of plan.items) {
  const p = item.placement;
  assert.ok(p.x >= 5 && p.y >= 5 && p.x+p.w <= printer.width-5 && p.y+p.h <= printer.depth-5);
  for (const other of plan.items) if (other !== item && other.placement.plateIndex === p.plateIndex) {
    const q = other.placement;
    assert.ok(p.x+p.w <= q.x || q.x+q.w <= p.x || p.y+p.h <= q.y || q.y+q.h <= p.y);
  }
  // Verify exported coordinates, not just the packing report.
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(item.source.bounds.maxX-item.source.bounds.minX,
    item.source.bounds.maxY-item.source.bounds.minY, 3));
  mesh.geometry.translate(0, 0, 1.5); mesh.rotation.x = -Math.PI/2;
  mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), item.offset.rotation));
  mesh.position.set(item.offset.x,item.offset.y,item.offset.z);
  const printed = geometryForPrint(mesh.geometry,mesh,{x:0,z:0},printer); printed.computeBoundingBox();
  assert.ok(Math.abs(printed.boundingBox.min.x-p.x)<1e-4);
  assert.ok(Math.abs(printed.boundingBox.min.y-p.y)<1e-4);
  printed.dispose(); mesh.geometry.dispose(); mesh.material.dispose();
}
assert.equal(originLayout([source('one')], printer), null);
const positioned = structuredClone(designs); positioned[0].offset.x=1;
assert.equal(originLayout(positioned,printer), null);
const laidOut=structuredClone(designs); laidOut[0].bounds.minX=10; laidOut[0].bounds.maxX=80;
assert.equal(originLayout(laidOut,printer),null,'Baked source translations remain untouched');
assert.throws(()=>originLayout([source('oversized',500),source('other')],printer),/does not fit/);
const multicolor=designs.map(s=>({...s,height:3,layerHeight:.2,towerChannels:['#F19CBB','#B8ACD6','#FFFFFF']}));
const towerPlan=originLayout(multicolor,printer,{primeTower:{enable_prime_tower:true}});
assert.equal(towerPlan.primeTowers.length,towerPlan.plateCount,'Each multicolor import plate reserves a tower before packing');
for(const item of towerPlan.items) {
  const p=item.placement,t=p.primeTower;
  assert.ok(t.brim>0&&t.padding>=t.brim,'Reservation includes the tower brim');
  assert.ok(p.x+p.w<=t.x||t.x+t.w<=p.x||p.y+p.h<=t.y||t.y+t.h<=p.y,'Imported models cannot take the tower space');
}
assert.equal(originLayout(multicolor,printer,{primeTower:{enable_prime_tower:false}}).primeTowers.length,0);

// Exercise app integration: account preference, one-time application, saved transforms,
// separate logical assemblies, free-plate allocation and unchanged source/copies.
const app=await fs.readFile('public/app.js','utf8');
const plate={key:'new',defaultPlateId:'B',autoPositionPending:true,objectTransforms:{},objectRecords:{},batchInstances:[],meshes:[]};
for(let i=0;i<16;i++) {
  const key=`group:${i}`; plate.objectRecords[key]={id:key,selectionKey:key,plateId:'B',label:key};
  plate.meshes.push(...['#F19CBB','#B8ACD6'].map(hexColor=>({userData:{selectionKey:key,hexColor}})));
}
const history=[];
const context=vm.createContext({originLayout,normalizePrimeTowerSettings,structuredClone,workspacePrimeTowers:[],MAX_PLATES:26,
 analyzeWorkspaceTowerMeshes:()=>null,
 printProfileSnapshotFromUi:()=>({settings:{enable_prime_tower:true,layer_height:.2}}),
 PLATE_IDS:Array.from({length:26},(_,i)=>String.fromCharCode(65+i)),
 plates:[plate,{defaultPlateId:'A',objectRecords:{}}],currentObjectPlate:(record,fallback)=>record.plateId||fallback,
 accountPreferences:{workspace:{autoPosition:false}},activePrinter:()=>printer,ensureObjectRecords:()=>Object.values(plate.objectRecords),
 combinedBox:()=>({min:{x:-70,y:0,z:-30},max:{x:70,y:3,z:30}}),plateLayoutForId:()=>({x:0,z:0}),
 storedObjectOffset:key=>plate.objectTransforms[key]||{x:0,y:0,z:0,rotation:0},
 allObjectEntries:()=>[{plate:{key:'existing'},record:{plateId:'A'}}],activeViewPlateId:'B',batchPlateMeta:{A:{},B:{}},loadedPlateIds:new Set(['A','B']),
 rememberObjectEdit:entry=>history.push(entry),ensureBatchPlate(){},moveObjectToPlate:(record,id)=>{record.plateId=id;},
 applyBatchPlateVisibility(){},updateSelectionVisuals(){},updatePlateFitStatus(){},fitAllPlates(){}});
for(const name of ['reservedPlateIds','nextRealPlateId','autoPositionOriginDesigns']) {
 const start=app.indexOf(`function ${name}(`),end=app.indexOf('\n}',start)+2;
 vm.runInContext(app.slice(start,end),context);
}
assert.equal(context.autoPositionOriginDesigns(plate),false);assert.equal(history.length,0);
plate.autoPositionPending=true;context.accountPreferences.workspace.autoPosition=true;
assert.equal(context.autoPositionOriginDesigns(plate),true);assert.equal(history.length,1);
assert.ok(Object.values(plate.objectRecords).every(record=>record.plateId!=='A'));
assert.ok(new Set(Object.values(plate.objectRecords).map(record=>record.plateId)).size>1);
assert.ok(context.workspacePrimeTowers.length>0);
assert.ok(context.workspacePrimeTowers.every(t=>t.plateId!=='A'&&t.brim>0),'Tower IDs follow available physical plates');
assert.deepEqual(Array.from(history[0].primeTowers),[],'Undo retains the previous tower layout');
assert.equal(plate.batchInstances.length,0);assert.equal(Object.keys(plate.objectRecords).length,16);
assert.equal(context.autoPositionOriginDesigns(plate),false,'Regeneration cannot rearrange again');
console.log('Origin layout passed: overlap detection, preserved layouts, bounds, export transforms, preference, spill plates and one-time import.');

// Origin at a mesh corner is common in SCAD cube() models.
const corners=[source('a'),source('b')];
for(const item of corners){item.bounds.minX=128;item.bounds.maxX=180;item.bounds.minY=128;item.bounds.maxY=180;}
assert.ok(originLayout(corners,printer));
corners[1].bounds.minX=76;corners[1].bounds.maxX=128;
assert.equal(originLayout(corners,printer),null,'Adjacent designs touching at the origin stay put');
const used = context.reservedPlateIds();
assert.ok(!used.has(context.nextRealPlateId()),'New imports skip spill plates belonging to another source');
context.plates = [{defaultPlateId:'A',objectRecords:{moved:{plateId:'B'},removed:{plateId:'D',deleted:true}},batchInstances:[{id:'copy',plateId:'C'}]}];
assert.equal(context.nextRealPlateId(),'D','Moved objects and copies reserve their physical plates');
context.plates = context.PLATE_IDS.map(id=>({defaultPlateId:id}));
assert.throws(()=>context.nextRealPlateId(),/26 plates/,'No fallback that silently overlaps Plate Z');
console.log('Import allocation passed: occupied/spill plates, corner origins, adjacent layouts and full capacity.');
