import assert from 'node:assert/strict';
import { normalizePrimeTowerSettings, estimatePrimeTower, minimumTowerDepth, primeTowerReservations } from '../public/prime-tower.js';
import { arrangeObjects, placePrimeTower } from '../public/plate-packing.js';
import { packColorGroups } from '../public/color-optimization.js';
import { plateIdAt } from '../public/plate-ids.js';
const profile=normalizePrimeTowerSettings({config:{prime_tower_rib_wall:false,prime_tower_brim_width:3,prime_tower_width:35,layer_height:.2},filament:{filament_prime_volume:[45]}});
const item=(index,colors=['R'],width=50,depth=30)=>({index,name:`Tag ${index}`,width,depth,height:4,towerChannels:colors,colorAnalysis:{status:'ready',channels:colors.map(id=>({id})),runs:[{from:1,to:10,colors}],materials:['PLA'],signature:colors.join(),layerHeight:.2,firstLayerHeight:.2}});
assert.equal(estimatePrimeTower([item(0)],profile),null);
for(const settings of [{timelapse_type:'smooth'},{timelapse_type:'1'},{enable_wrapping_detection:true}])
  assert.equal(estimatePrimeTower([item(0)],{...profile,...settings}),null,'Single-color plates never get an estimated tower');
assert.equal(estimatePrimeTower([item(0,['#ff0000|PLA','#FF0000|PETG'])],profile),null,'Count distinct colors');
assert.ok(estimatePrimeTower([item(0,['R']),item(1,['B'])],profile),'Separate objects in different colors still share a multicolor plate');
assert.equal(estimatePrimeTower([item(0,['R','B'])],{...profile,enable_prime_tower:false}),null);
const two=estimatePrimeTower([item(0,['R','B'])],profile),four=estimatePrimeTower([item(0,['R','B','G','W'])],profile);
assert.equal(two.width,35);assert.ok(Math.abs(two.depth-9.642857142857142)<1e-10);assert.ok(four.depth>two.depth);
assert.ok(estimatePrimeTower([{...item(0,['R','B']),colorAnalysis:{...item(0,['R','B']).colorAnalysis,layerHeight:.1}}],profile).depth>two.depth);
assert.equal(minimumTowerDepth(52.5),12.5);
assert.equal(estimatePrimeTower([{...item(0,['R','B']),height:50}],{...profile,prime_tower_brim_width:-1}).brim,.16,'Automatic brim follows the tower height, not the taller model');
assert.equal(normalizePrimeTowerSettings({config:{enable_prime_tower:['1']}}).enable_prime_tower,true);
assert.ok(estimatePrimeTower([item(0,['R','B'])],{...profile,hotendCount:2}).depth>two.depth);
const rib=estimatePrimeTower([item(0,['R','B'])],{...profile,prime_tower_rib_wall:true});assert.equal(rib.width,rib.depth);
assert.throws(()=>estimatePrimeTower([{...item(0),towerChannels:null,colorAnalysis:null}],profile),/colors are unavailable/);
const printer={width:180,depth:180,excludedAreas:[{x1:0,y1:0,x2:18,y2:28}]};
const objects=Array.from({length:11},(_,i)=>item(i,i%2?['R','B']:['R','G']));
assert.equal(arrangeObjects(objects,printer,{primeTower:profile,maxObjectsPerPlate:3}),4);
const overlap=(a,b)=>a.x<b.x+b.w+5-1e-7 && a.x+a.w+5>b.x+1e-7 && a.y<b.y+b.h+5-1e-7 && a.y+a.h+5>b.y+1e-7;
for(const [i,object] of objects.entries()) {
  const p=object.placement;assert.ok(p.x>=5&&p.y>=5&&p.x+p.w<=175&&p.y+p.h<=175);
  assert.equal(overlap(p,p.primeTower),false);
  assert.equal(overlap(p,{x:0,y:0,w:18,h:28}),false);
  for(const other of objects.slice(i+1))if(other.placement.plateIndex===p.plateIndex)assert.equal(overlap(p,other.placement),false);
}
assert.equal(primeTowerReservations(objects).length,4);
const repeat=objects.map(o=>({...o}));arrangeObjects(repeat,printer,{primeTower:profile,maxObjectsPerPlate:3});assert.deepEqual(repeat,objects);
const single=Array.from({length:28},(_,i)=>item(i,[i%2?'R':'B']));arrangeObjects(single,printer,{primeTower:profile,maxObjectsPerPlate:1});
assert.equal(plateIdAt(single.at(-1).placement.plateIndex),'B0');assert.equal(primeTowerReservations(single).length,0,'Each plate uses its own actual color union');
for(const budget of [undefined,1000]) {
 const copies=objects.map(o=>({...o}));
 const report=packColorGroups(copies,printer,{pack:arrangeObjects,primeTower:profile,maxObjectsPerPlate:2,...(budget===undefined?{}:{maxColorChanges:budget})});
 assert.ok(report.plateCount>=6);
 for(let p=0;p<report.plateCount;p++)assert.ok(copies.filter(o=>o.placement.plateIndex===p).length<=2);
}
const tight=[item(0,['R','B','G','W'],220,220)];assert.throws(()=>arrangeObjects(tight,{width:256,depth:256},{primeTower:profile}),/does not fit/);assert.equal(tight[0].placement,undefined);
const placed=objects.filter(o=>o.placement.plateIndex===0);assert.ok(placePrimeTower(placed,printer,profile,placed[0].placement.primeTower));
const crowded=[{...item(0,['R','B']),placement:{x:5,y:5,w:170,h:170}}];assert.ok(placePrimeTower(crowded,printer,profile),'A crowded workspace still gets a current, freely movable estimate');
console.log('Prime tower sizing, per-plate colors, growth, clearance, deterministic packing, caps in both color modes, extended plates, and edit reservations passed.');
