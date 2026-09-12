import './setup.mjs';
import assert from 'node:assert/strict';
import { DOMParser } from '@xmldom/xmldom';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { optimizeWorkspacePlates } from '../public/workspace-color-optimization.js';
import { orientedFootprint } from '../public/oriented-footprint.js';
import { packColorGroups } from '../public/color-optimization.js';
import { arrangeObjects } from '../public/plate-packing.js';
import { packCore3mf } from '../public/core-3mf.js';
import { readSolid3mf } from '../public/solid-3mf.js';

const geometry=new BoxGeometry(20,12,2);
const part=()=>({geometry:{positions:geometry.attributes.position.array.slice(),indices:geometry.index.array.slice()},materialIndex:0,colorKnown:true});
const printer={width:180,depth:180};
const original=[
  {plateId:'A',model:{palette:['#ff0000'],objects:[{name:'Red',exportId:'red',parts:[part()]}]}},
  {plateId:'B',model:{palette:['#0000FF','#00FF00'],objects:[{name:'Blue and green',exportId:'painted',parts:[{...part(),materialIndices:Uint32Array.from({length:12},(_,i)=>i%2)}]}]}}
];
const result=await optimizeWorkspacePlates(structuredClone(original),printer,{maxFilamentSlots:3,maxColorChanges:100});
assert.equal(result.plates.length,1);
const model=result.plates[0].model;
for(const object of model.objects) {
  const source=original.find(plate=>plate.model.objects[0].exportId===object.exportId).model;
  const before=source.objects[0].parts[0],after=object.parts[0];
  for(let i=0;i<12;i++)assert.equal(model.palette[after.materialIndices?.[i] ?? after.materialIndex],source.palette[before.materialIndices?.[i] ?? before.materialIndex].toUpperCase(),'Combining plates preserves every face color');
}
const solids=readSolid3mf(packCore3mf(model),xml=>new DOMParser().parseFromString(xml,'application/xml'));
assert.deepEqual(new Set(solids.flatMap(solid=>solid.colors)),new Set(['#FF0000','#0000FF','#00FF00']),'Actual 3MF retains all colors');
for(const solid of solids)solid.geometry.dispose();

// Similar run signatures must not combine incompatible layer grids.
const item=(index,layerHeight=.2)=>({index,name:`Object ${index}`,width:20,depth:20,
  colorAnalysis:{status:'ready',materials:['PLA'],layerHeight,firstLayerHeight:.2,
    channels:[{id:'R'}],runs:[{from:1,to:10,colors:['R']}],signature:'same'}});
const mixed=[item(0),item(1,.3)];
const separated=packColorGroups(mixed,printer,{pack:arrangeObjects});
assert.equal(separated.plateCount,2);assert.equal(separated.baselineFeasible,false);
assert.throws(()=>packColorGroups([item(0),item(1,.3)],printer,{pack:arrangeObjects,maxPlates:1}),/more than 1 plates/);
// A failed first ordering must not prevent a successful alternate ordering.
const retry=packColorGroups([item(0)],printer,{pack:(items,bed,options)=>{
  if(!options.rotatedFirst)throw new Error('First ordering cannot fit');
  return arrangeObjects(items,bed,options);
}});
assert.equal(retry.plateCount,1);

// Diagonal source edges do not authorize diagonal packing rotations.
const diagonal=new BoxGeometry(30,10,2).rotateZ(.37);
const diagonalPart={geometry:{positions:diagonal.attributes.position.array.slice(),indices:diagonal.index.array.slice()},materialIndex:0,colorKnown:true};
assert.equal(orientedFootprint([diagonalPart]).rotation,0);
const diagonalResult=await optimizeWorkspacePlates([{plateId:'A',model:{palette:['#FF0000'],objects:[{name:'Diagonal source',parts:[diagonalPart]}]}}],printer,{});
assert.ok([0,Math.PI/2,Math.PI,3*Math.PI/2].includes(diagonalResult.report.objects[0].transform.rotation));
geometry.dispose();diagonal.dispose();
console.log('Color audit passed: cross-plate face colors and native 3MF, layer-grid separation, plate cap, packing retry and quarter-turn-only source placement.');
