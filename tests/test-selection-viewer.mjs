import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from '../public/vendor/three/three.core.js';
import { OrbitControls } from '../public/vendor/three/addons/controls/OrbitControls.js';

const source = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
for (const fps of [60, 144]) {
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
  camera.position.set(0,0,200);
  const frames = new Map();let nextFrame=0, now=0, renders=0;
  const context = vm.createContext({camera, scene: new THREE.Scene(),
    viewer: {clientWidth:1000, clientHeight:800}, renderWidth:0, renderHeight:0,
    selectionLabel:{hidden:false,style:{}}, selectionLabelWorld:new THREE.Vector3(20,20,0), selectionLabelProjected:new THREE.Vector3(),
    panelResizeSuspended:false, panelResizeFrame:null, renderFrame:null, renderingFrame:false,
    document:{hidden:false,body:{classList:{contains:()=>false}},documentElement:{dataset:{}}},
    window:{matchMedia:()=>({matches:false})}, performance:{now:()=>now},
    controls:{update(){camera.position.x+=0.1;}},
    renderer:{setSize(){},render(){renders++;camera.updateMatrixWorld();}},
    requestAnimationFrame(callback){frames.set(++nextFrame,callback);return nextFrame;},
    cancelAnimationFrame(id){frames.delete(id);}
  });
  for(const name of ['resize','updateSelectionLabelPosition','requestRender','animate','animatePanelResize']) {
    const start=source.indexOf(`function ${name}(`),end=source.indexOf('\n}',start)+2;
    vm.runInContext(source.slice(start,end),context);
  }
  const flush = time => {now=time;const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(now);};
  context.resize();context.animatePanelResize();
  let previousLeft=null, count=0;
  for(now=1000/fps;now<360;now+=1000/fps) {
    context.viewer.clientWidth=1000-300*Math.min(now/300,1);
    flush(now);count++;
    assert.equal(context.selectionLabel.hidden,false,'The tag stays visible throughout panel resizing');
    const projected=context.selectionLabelWorld.clone().project(camera);
    const expected=(projected.x*0.5+0.5)*context.viewer.clientWidth;
    assert.ok(Math.abs(parseFloat(context.selectionLabel.style.left)-expected)<0.001,'Tag and rendered object use the same current camera');
    if(now<300 && previousLeft!==null) assert.notEqual(context.selectionLabel.style.left,previousLeft,'Tag moves each display frame');
    previousLeft=context.selectionLabel.style.left;
    if(!context.panelResizeSuspended)break;
  }
  assert.equal(renders,count);assert.equal(context.panelResizeSuspended,false);
  flush(now+1);count++;assert.equal(frames.size,0,'Rendering stops once resizing finishes');

  context.viewer.clientWidth=600;context.resize();
  flush(now+1);assert.equal(renders,count+1);
  flush(now+2);assert.equal(renders,count+1,'An unchanged idle scene draws no frames');

  context.animatePanelResize();context.animatePanelResize();assert.equal(frames.size,1,'Rapid toggles replace the previous resize loop');
  const before=renders;context.requestRender();assert.equal(renders,before);assert.equal(frames.size,1,'Main loop does not duplicate the panel resize loop');
  frames.clear();context.document.documentElement.dataset.reduceMotion='true';
  context.animatePanelResize();flush(now+4);assert.equal(context.panelResizeSuspended,false);
  flush(now+5);assert.equal(frames.size,0);
  console.log(`Selection tag follows panel resizing at ${fps} fps; idle, rapid-toggle and reduced-motion checks passed.`);
}

// Exercise actual OrbitControls damping and compare its motion to continuous draws.
const camera=new THREE.PerspectiveCamera(35,1,.1,10000);camera.position.set(220,220,180);
const referenceCamera=camera.clone();
const controls=new OrbitControls(camera),referenceControls=new OrbitControls(referenceCamera);
for(const control of [controls,referenceControls]){control.enableDamping=true;control.dampingFactor=.08;}
const frames=new Map();let id=0,renders=0,settingsOpen=false;
const state=vm.createContext({camera,controls,scene:{},renderFrame:null,renderingFrame:false,panelResizeSuspended:false,
  document:{hidden:false,body:{classList:{contains:()=>settingsOpen}}},
  renderer:{render(){renders++;}},updateSelectionLabelPosition(){},
  requestAnimationFrame(callback){frames.set(++id,callback);return id;},cancelAnimationFrame(key){frames.delete(key);}});
for(const name of ['requestRender','animate']){
  const start=source.indexOf(`function ${name}(`);vm.runInContext(source.slice(start,source.indexOf('\n}',start)+2),state);
}
controls.addEventListener('change',state.requestRender);
const flush=()=>{const pending=[...frames.values()];frames.clear();for(const frame of pending)frame();};
for(let i=0;i<100;i++)state.requestRender();
assert.equal(frames.size,1,'Scene changes in one turn coalesce');
flush();assert.equal(renders,1);assert.equal(frames.size,0);
for(let i=0;i<3600;i++)flush();
assert.equal(renders,1,'A minute of idle time has zero extra draws or callbacks');
for(const control of [controls,referenceControls]){control._sphericalDelta.theta=.5;control.update();}
let settlingFrames=0;
while(frames.size && settlingFrames<300){flush();referenceControls.update();settlingFrames++;assert.ok(camera.position.distanceTo(referenceCamera.position)<1e-8);}
assert.ok(settlingFrames>10 && settlingFrames<300,'Inertia animates smoothly and reaches rest');
const settled=renders;flush();assert.equal(renders,settled);
controls.enableDamping=false;controls.update();while(frames.size)flush();
for(const block of ['hidden','settings','panel']){
  const before=renders;
  state.requestRender();assert.equal(frames.size,1);
  if(block==='hidden')state.document.hidden=true;
  if(block==='settings')settingsOpen=true;
  if(block==='panel')state.panelResizeSuspended=true;
  state.requestRender();assert.equal(frames.size,0,'Blocked viewers cancel pending work');
  flush();assert.equal(renders,before);
  state.document.hidden=false;settingsOpen=false;state.panelResizeSuspended=false;
  state.requestRender();flush();assert.equal(frames.size,0,'Visible viewer wakes once');
}
console.log(`Demand rendering passed: 0 idle draws in 3,600 display ticks; ${settlingFrames} damping frames match continuous rendering; visibility, settings and panel suspension recover.`);
