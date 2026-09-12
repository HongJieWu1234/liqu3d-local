import './setup.mjs';
import assert from 'node:assert/strict';
import * as THREE from '../public/vendor/three/three.module.js';
import { createPrimeTowerPreview, primeTowerOutline } from '../public/prime-tower-preview.js';
import { estimatePrimeTower } from '../public/prime-tower.js';

for(const settings of [{},{prime_tower_rib_wall:false},{prime_tower_rib_width:0},{prime_tower_extra_rib_length:10},{prime_tower_fillet_wall:false}]) {
  const tower=estimatePrimeTower([{height:40,towerChannels:['#FF0000','#FFFFFF']}],settings);
  const preview=createPrimeTowerPreview(tower);
  const box=new THREE.Box3().setFromObject(preview);
  assert.ok(box.min.x>=-tower.w/2-.001 && box.max.x<=tower.w/2+.001);
  assert.ok(box.min.z>=-tower.h/2-.001 && box.max.z<=tower.h/2+.001);
  assert.ok(Math.abs(box.max.y-tower.height)<.002,'Brim and print detail do not add another layer to the tower height');
  assert.ok(primeTowerOutline(tower).length>4,'Rounded edges or corner ribs replace a block');
  const ray=new THREE.Raycaster(new THREE.Vector3(0,100,0),new THREE.Vector3(0,-1,0));
  assert.ok(ray.intersectObject(preview,true).some(hit=>hit.object.userData.plateRole==='prime-tower-body'),'The 3D body remains draggable');
  preview.traverse(child=>{child.geometry?.dispose();child.material?.dispose();});
}
const channels=['#FF0000','#00FF00','#0000FF'];
const runs=[{from:1,to:5,colors:[channels[0]]},{from:6,to:10,colors:[channels[1]]},{from:11,to:20,colors:[channels[2]]}];
for(const skip of [false,true]) {
  const tower=estimatePrimeTower([{height:4,towerChannels:channels,colorAnalysis:{status:'ready',layerHeight:.2,firstLayerHeight:.2,runs}}],{wipe_tower_no_sparse_layers:skip});
  const preview=createPrimeTowerPreview(tower),body=preview.children.find(child=>child.userData.plateRole==='prime-tower-body');
  assert.ok(Math.abs(new THREE.Box3().setFromObject(body).max.y-(skip?.6:2.2))<1e-6,'Rendered tower ends at the last change with sparse layers correctly compressed');
  const actual=new Set(),p=body.geometry.getAttribute('position'),c=body.geometry.getAttribute('color');
  for(let i=0;i<p.count;i++)actual.add('#'+new THREE.Color().fromBufferAttribute(c,i).getHexString().toUpperCase());
  assert.deepEqual(actual,new Set(channels),'Every used color survives short and skipped-layer previews');
  const middle=tower.previewRuns[1];
  assert.equal(middle.from,skip?2:6);assert.equal(middle.to,skip?2:10);
  preview.traverse(child=>{child.geometry?.dispose();child.material?.dispose();});
}
console.log('Prime tower preview passed: ribbed and plain profiles, brim bounds, exact print height, current colors, skipped layers, taper and draggable body.');
