import './setup.mjs';
import assert from 'node:assert/strict';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { packCore3mf } from '../public/core-3mf.js';
import { workspacePreviewScene, workspacePreviewPng } from '../lib/workspace-preview.mjs';
import { renderWorkspacePreview } from '../lib/workspace-preview-worker.mjs';
const shape=new BoxGeometry(10,20,2);
const bytes=packCore3mf({objects:[{name:'Tag',parts:[{geometry:shape,materialIndex:0}]}],palette:['#FF0000']});shape.dispose();
const calls=[];
const options={metadata:()=>({objects:[]}),render:async(values,format,extra)=>{calls.push({values,format,extra});return bytes;}};
const data={activeViewPlateId:'B',printProfile:{printer:'a1'},plates:[{
  source:'cube(1);',sourceName:'one.scad',defaultPlateId:'A',values:{text:'Original'},
  objectRecords:{model:{plateId:'B'},'instance:gone':{deleted:true},'instance:away':{plateId:'A',moved_plate:'B'}},
  objectTransforms:{'instance:first':{x:30,z:-40,y:2,rotation:Math.PI/2},'instance:second':{x:-30}},
  batchInstances:['first','second','gone','away'].map(id=>({id,configuration:{parameters:{text:'Copy'}}}))
},{source:'cube(2);',sourceName:'two.scad',defaultPlateId:'A',values:{},objectRecords:{}}]};
const scene=await workspacePreviewScene(data,options);
try {
  assert.equal(scene.plates.length,1);assert.equal(scene.plates[0].id,'A');
  assert.equal(scene.plates[0].objects.length,3,'Only live objects on first plate across all sources');
  assert.equal(calls.length,2,'Identical copies share geometry');assert.equal(calls[0].values.text,'Copy');
  assert.ok(calls.every(call=>call.format==='3mf'&&call.extra.previewQuality&&call.extra.background));
  const part=scene.plates[0].objects[0].parts[0];part.geometry.computeBoundingBox();const b=part.geometry.boundingBox;
  assert.ok(Math.abs(b.min.x-148)<1e-5&&Math.abs(b.max.x-168)<1e-5);
  assert.ok(Math.abs(b.min.y-163)<1e-5&&Math.abs(b.max.y-173)<1e-5);
  assert.equal(b.min.z,1);assert.equal(b.max.z,3);
  assert.equal(scene.plates[0].palette[part.materialIndices[0]].slice(0,7).toUpperCase(),'#FF0000');
} finally {scene.dispose();}
const empty=await workspacePreviewScene({loadedPlateIds:['A','B'],plates:[{source:'cube(1);',defaultPlateId:'B',values:{}}]},options);
assert.equal(empty.plates[0].id,'A');assert.equal(empty.plates[0].objects.length,0);empty.dispose();
const removed=await workspacePreviewScene({loadedPlateIds:['C','B'],activeViewPlateId:'C',plates:[{source:'cube(1);',defaultPlateId:'B',values:{}}]},options);
assert.equal(removed.plates[0].id,'B');removed.dispose();
const grouped=await workspacePreviewScene({plates:[{source:'cube(3);',values:{},objectBinding:{memberIds:[2]},objectRecords:{},defaultPlateId:'A'}]}, {...options,metadata:()=>({objects:[{id:1},{id:2}]})});
assert.equal(calls.at(-1).extra.objectId,2);grouped.dispose();
const png=await workspacePreviewPng(data,options);
assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),800);assert.equal(png.subarray(1,4).toString(),'PNG');
assert.deepEqual(await renderWorkspacePreview(data,options),png);
await assert.rejects(renderWorkspacePreview(data,{...options,render:async()=>{throw new Error('Renderer offline');}}),/Renderer offline/);
assert.deepEqual(await workspacePreviewPng({...data,activeViewPlateId:'C',camera:{position:[220,220,180],target:[0,0,0]}},options),png,'Top-down first-plate view ignores editor camera');
console.log('Workspace previews passed: first plate, copies, offsets, rotations, deletions, colors, bound objects, shared renders, image output and background worker cleanup.');
