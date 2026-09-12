import './setup.mjs';
import assert from 'node:assert/strict';
import { packColorGroups, estimateSwaps, colorOptimizationSettings } from '../public/color-optimization.js';
import { arrangeObjects } from '../public/plate-packing.js';
import { PRINTERS } from '../public/print-settings-schema.js';

const a=[{from:1,to:18,colors:['R','W']}];
const b=[{from:1,to:6,colors:['G','R']},{from:7,to:18,colors:['B','G']}];
const item=(index,runs,layerHeight=.2)=>({index,name:`Pattern ${index}`,width:100,depth:80,
 colorAnalysis:{status:'ready',materials:['PLA'],layerHeight,firstLayerHeight:.2,runs,signature:JSON.stringify(runs),
 channels:[...new Set(runs.flatMap(run=>run.colors))].map(id=>({id})),estimatedSwaps:estimateSwaps(runs)}});
const originals=[item(0,a),item(1,b)];
const plan=(limit,items=originals,extra={})=>packColorGroups(structuredClone(items),PRINTERS.p1s,{pack:arrangeObjects,maxFilamentSlots:4,...(limit===undefined?{}:{maxColorChanges:limit}),...extra});
assert.equal(plan().estimatedSwaps,36);assert.equal(plan().plateCount,2);
for(const limit of [36,47]){assert.equal(plan(limit).plateCount,2);assert.equal(plan(limit).estimatedSwaps,36);}
for(const limit of [48,50]){assert.equal(plan(limit).plateCount,1);assert.equal(plan(limit).estimatedSwaps,48);}
assert.throws(()=>plan(35),/Lowest estimate found: ~36/);
assert.throws(()=>plan(0),/No arrangement/);
const mono=[item(0,[{from:1,to:18,colors:['R']}]),item(1,[{from:1,to:18,colors:['R']}])];
assert.equal(plan(0,mono).plateCount,1);
for(const value of [-1,.5,NaN,Infinity,'50',null,Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>colorOptimizationSettings({maxColorChanges:value}),/whole number/);
assert.deepEqual(colorOptimizationSettings({enabled:false}),{enabled:false,maxFilamentSlots:4});
const mixed=[...originals,item(2,a,.3),item(3,b,.3)];
assert.equal(plan(84,mixed).estimatedSwaps,84);assert.equal(plan(84,mixed).plateCount,3);
assert.throws(()=>plan(50,mixed),/No arrangement/,'Budgets must not reset per layer grid');
assert.throws(()=>plan(50,originals,{maxFilamentSlots:1}),/filament slots/);
const unknown=structuredClone(originals);unknown[1].colorAnalysis.status='unavailable';assert.throws(()=>plan(50,unknown),/unavailable/);
const material=structuredClone(originals);material[1].colorAnalysis.materials=['PETG'];assert.equal(plan(50,material).plateCount,2);
assert.throws(()=>plan(36,originals,{maxPlates:1}),/No arrangement/);
const oversized=structuredClone(originals);oversized[0].width=500;assert.throws(()=>plan(50,oversized),/does not fit/);
const unchanged=structuredClone(originals);assert.throws(()=>packColorGroups(unchanged,PRINTERS.p1s,{pack:arrangeObjects,maxColorChanges:1,maxFilamentSlots:4}),/No arrangement/);assert.deepEqual(unchanged,originals);
assert.deepEqual(plan(50),plan(50),'Planning is deterministic');
// A generous budget must also try a different packing orientation. The first
// fit strands space; all six rectangles can share one legal P1S plate.
const stranded=[[130,80],[80,80],[120,60],[150,30],[130,40],[30,100]].map(([width,depth],index)=>({...item(index,[{from:1,to:10,colors:['R']}]),width,depth}));
assert.equal(plan(undefined,stranded).plateCount,1,'Equal color cost should also compact minimum mode');
const compacted=structuredClone(stranded);
const compactReport=packColorGroups(compacted,PRINTERS.p1s,{pack:arrangeObjects,maxColorChanges:10000});
assert.equal(compactReport.plateCount,1);assert.equal(compactReport.baselinePlateCount,1,'MaxRects fills the gaps in its initial trial');assert.equal(compactReport.packingTrials,1);
const overlaps=(a,b,gap=5)=>a.x<b.x+b.w+gap && a.x+a.w+gap>b.x && a.y<b.y+b.h+gap && a.y+a.h+gap>b.y;
for(const [index,object] of compacted.entries()) {
  const r=object.placement;assert.equal(r.plateIndex,0);assert.ok(r.x>=5&&r.y>=5&&r.x+r.w<=251&&r.y+r.h<=251);
  assert.equal(r.w,r.rotation?object.depth:object.width);assert.equal(r.h,r.rotation?object.width:object.depth);
  for(const other of compacted.slice(index+1))assert.equal(overlaps(r,other.placement),false,'Chosen placements never overlap');
  for(const area of [...PRINTERS.p1s.excludedAreas,...(PRINTERS.p1s.nozzleLimitedAreas||[])])assert.equal(overlaps(r,{x:area.x1,y:area.y1,w:area.x2-area.x1,h:area.y2-area.y1}),false);
}
const tooLarge=stranded.slice(0,2).map(item=>({...item,width:200,depth:200}));assert.equal(plan(10000,tooLarge).plateCount,2,'A large color budget never overrides bed capacity');
const fiveColors=Array.from({length:5},(_,i)=>({...item(i,[{from:1,to:10,colors:[String(i)]}]),width:30,depth:30}));
assert.equal(plan(10000,fiveColors).plateCount,2,'A large color budget never overrides filament slots');
assert.equal(plan(10000,mixed).plateCount,2,'Different layer grids remain on separate plates');
const batch=Array.from({length:1000},(_,i)=>({...item(i,i%2?a:b),width:10,depth:10}));
let packs=0;const started=performance.now();
const report=plan(500,batch,{pack:(...args)=>{packs++;return arrangeObjects(...args);}});
console.log(`Color budget passed: 36 → 48 changes saves a plate; global limits, equality, failures and deterministic planning. 1,000-object planning: ${(performance.now()-started).toFixed(0)} ms, ${packs} packing calls, ${report.plateCount} plates; no renderer calls.`);
