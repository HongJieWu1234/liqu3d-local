import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from '../public/vendor/three/three.module.js';

const app=await fs.readFile('public/app.js','utf8');
let decodedRoot, slices=0, savedBytes=0;
const state=vm.createContext({THREE,ThreeMFLoader:class{parse(){return decodedRoot;}},
  objectColorParts:()=>[],activePlate:()=>({key:'source'}),logicalGroupForObjectId:()=>null,applyStoredTransform(){}});
for(const name of ['sliceGeometry','createMeshesFrom3mf']){
  const start=app.indexOf(`function ${name}(`);vm.runInContext(app.slice(start,app.indexOf('\n}',start)+2),state);
}
const slice=state.sliceGeometry;
state.sliceGeometry=(...args)=>{slices++;return slice(...args);};

for(const mode of ['indexed','non-indexed','missing-normals','multiple-materials','partial-group']){
  let geometry=new THREE.SphereGeometry(20,96,48);
  if(mode==='non-indexed'||mode==='missing-normals')geometry=geometry.toNonIndexed();
  if(mode==='missing-normals')geometry.deleteAttribute('normal');
  const count=geometry.index?.count||geometry.getAttribute('position').count;
  if(mode==='multiple-materials'){
    const half=Math.floor(count/6)*3;geometry.addGroup(0,half,0);geometry.addGroup(half,count-half,1);
  }else if(mode==='partial-group')geometry.addGroup(3,count-6,0);
  const materials=[new THREE.MeshStandardMaterial({color:'#F19CBB'}),new THREE.MeshStandardMaterial({color:'#2842AD'})];
  const source=new THREE.Mesh(geometry,materials);source.position.set(10,4,-3);source.rotation.set(.2,.4,-.3);
  decodedRoot=new THREE.Group();decodedRoot.scale.set(1.2,.8,1.4);decodedRoot.add(source);decodedRoot.updateMatrixWorld(true);
  const original=geometry.getAttribute('position').array.slice();
  const expected=geometry.index?geometry.toNonIndexed():geometry.clone();expected.applyMatrix4(source.matrixWorld);
  const groups=expected.groups.length?expected.groups:[{start:0,count:expected.getAttribute('position').count,materialIndex:0}];
  slices=0;
  const meshes=state.createMeshesFrom3mf(new ArrayBuffer(0),{id:7},{});
  assert.equal(meshes.length,groups.length);
  assert.equal(slices,['multiple-materials','partial-group'].includes(mode)?groups.length:0);
  for(let i=0;i<groups.length;i++){
    const group=groups[i],reference=slice(expected,group.start,group.count),actual=meshes[i].geometry;
    for(const [name,attribute] of Object.entries(reference.attributes))assert.deepEqual(actual.getAttribute(name).array,attribute.array,`${mode}: ${name} unchanged`);
    assert.deepEqual(actual.boundingBox,reference.boundingBox);
    assert.equal(meshes[i].material.color.getHex(),materials[group.materialIndex].color.getHex());
    assert.equal(meshes[i].rotation.x,-Math.PI/2);
    assert.notEqual(actual,geometry,'The loaded source is never mutated or adopted');
    if(!slices)savedBytes+=Object.values(actual.attributes).reduce((sum,attribute)=>sum+attribute.array.byteLength,0);
    actual.dispose();meshes[i].material.dispose();reference.dispose();
  }
  assert.deepEqual(geometry.getAttribute('position').array,original,'Source coordinates survive independent disposal');
  expected.dispose();geometry.dispose();materials.forEach(material=>material.dispose());
}
console.log(`Preview mesh quality passed: identical coordinates, normals, UVs, colors and bounds; ${(savedBytes/1024/1024).toFixed(2)} MiB of redundant geometry copies avoided across three sample solids.`);
