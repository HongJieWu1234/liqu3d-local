import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { packColorGroups, estimateSwaps } from '../public/color-optimization.js';
import { optimizeWorkspacePlates } from '../public/workspace-color-optimization.js';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { arrangeObjects } from '../public/plate-packing.js';
import { PRINTERS } from '../public/print-settings-schema.js';

const fixture=JSON.parse(await fs.readFile(new URL('./fixtures/sample-color-layout.json',import.meta.url)));
const items=fixture.objects.map((object,index)=>({...object,index,name:`Sample ${index+1}`,
  colorAnalysis:{status:'ready',materials:['PLA'],layerHeight:.2,firstLayerHeight:.2,runs:object.runs,
    signature:JSON.stringify(object.runs),channels:[...new Set(object.runs.flatMap(run=>run.colors))].map(id=>({id}))}}));
const colors=new Set(items.flatMap(item=>item.colorAnalysis.channels.map(c=>c.id)));
assert.equal(colors.size,7);
const pack=(slots,budget)=>{
  const objects=structuredClone(items);
  return {objects,report:packColorGroups(objects,PRINTERS.p1s,{pack:arrangeObjects,maxFilamentSlots:slots,maxColorChanges:budget})};
};
const together=pack(64,1000);
assert.equal(together.report.plateCount,1,'All 16 sample tags fit together when all seven colors are allowed');
assert.equal(together.report.estimatedSwaps,25,'The budget is a ceiling, not the desired number of changes');
assert.ok(together.objects.every(o=>o.placement.plateIndex===0));
const limited=pack(4,1000);
assert.equal(limited.report.plateCount,3,'An explicit four-color capacity still applies');
for(let p=0;p<limited.report.plateCount;p++)assert.ok(new Set(limited.objects.filter(o=>o.placement.plateIndex===p).flatMap(o=>o.colorAnalysis.channels.map(c=>c.id))).size<=4);
assert.ok(pack(64,24).report.plateCount>1,'A tight color budget can still require separate plates');

// Start with the sample's measured sizes/colors on many plates, at arbitrary
// user rotations. Exercise geometry analysis, fitting, and final transforms.
const palette=[...colors].map(id=>id.split('|')[0]);
const makeWorkspace=()=>fixture.objects.map((object,index)=>({plateId:String.fromCharCode(65+index),model:{palette,objects:[{
  name:`Rotated sample ${index+1}`,exportId:String(index),editorRotation:index*.347+Math.PI/4,parts:object.runs.flatMap(run=>run.colors.map(color=>{
    const height=(run.to-run.from+1)*.2, bottom=(run.from-1)*.2;
    const g=new BoxGeometry(object.width,object.depth,height).translate(0,0,bottom+height/2)
      .rotateZ((index*.347+Math.PI/4)).translate(index*20,10,0);
    const part={geometry:{positions:Float64Array.from(g.attributes.position.array),indices:g.index.array.slice()},materialIndex:palette.indexOf(color.split('|')[0]),colorKnown:true};g.dispose();return part;
  }))
}]}}));
for(const limit of [1000,1_000_000]) {
  const original=makeWorkspace(), result=await optimizeWorkspacePlates(structuredClone(original),PRINTERS.p1s,{maxFilamentSlots:64,maxColorChanges:limit});
  assert.equal(result.report.plateCount,1,'Free rotation must not strand the sample across plates');
  assert.equal(result.report.estimatedSwaps,25);assert.equal(result.plates[0].model.objects.length,16);
  for(const placed of result.report.objects) {
    const object=result.plates[0].model.objects.find(o=>o.exportId===placed.id), before=original[Number(placed.id)].model.objects[0];
    assert.ok([0,Math.PI/2,Math.PI,3*Math.PI/2].includes(object.editorRotation),'Legacy rotations snap to quarter turns');
    const {rotation,dx,dy,dz}=placed.transform,c=Math.cos(rotation),s=Math.sin(rotation);
    object.parts.forEach((part,partIndex)=>{
      const p=part.geometry.positions, q=before.parts[partIndex].geometry.positions;
      for(let i=0;i<p.length;i+=3){
        assert.ok(p[i]>=4.9999&&p[i]<=251.0001&&p[i+1]>=4.9999&&p[i+1]<=251.0001);
        assert.ok(Math.abs(p[i]-(c*q[i]-s*q[i+1]+dx))<.00001);
        assert.ok(Math.abs(p[i+1]-(s*q[i]+c*q[i+1]+dy))<.00001);
        assert.ok(Math.abs(p[i+2]-(q[i+2]+dz))<.00001);
      }
    });
  }
  const again=await optimizeWorkspacePlates(structuredClone(result.plates),PRINTERS.p1s,{maxFilamentSlots:64,maxColorChanges:limit});
  assert.equal(again.plates.length,1,'Reapplying arrangement remains compact');
}
console.log('Rotated sample geometry passed: 16 objects from 16 plates combine into one at both 1,000 and 1,000,000 changes.');

// Exhaustively compare compressed layer runs against explicit filament orders.
const permutations=list=>list.length?list.flatMap((value,i)=>permutations(list.filter((_,j)=>j!==i)).map(rest=>[value,...rest])):[[]];
const brute=layers=>{
  let ends=new Map([[null,0]]);
  for(const colors of layers){
    const next=new Map();
    for(const order of permutations(colors))for(const [last,cost] of ends){
      const changes=cost+order.length-1+Number(last!==null&&last!==order[0]),end=order.at(-1);
      next.set(end,Math.min(next.get(end)??Infinity,changes));
    }
    ends=next;
  }
  return Math.min(...ends.values());
};
const sets=[['R'],['W'],['R','W'],['R','G'],['R','W','G']];
for(const before of sets)for(const middle of sets)for(const after of sets)for(const count of [1,2,3,4,5,6]){
  const runs=[{from:1,to:1,colors:before},{from:2,to:count+1,colors:middle},{from:count+2,to:count+2,colors:after}];
  assert.equal(estimateSwaps(runs),brute([before,...Array(count).fill(middle),after]));
}
assert.equal(estimateSwaps([{from:1,to:1,colors:['R']},{from:2,to:2,colors:['R','W']},{from:3,to:3,colors:['R']}]),2);
console.log('Sample packing passed: all 16 tags on one plate, seven-color capacity, hard budget, and 750 exact filament-sequence comparisons.');
