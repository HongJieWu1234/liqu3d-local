import './setup.mjs';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { unzipSync } from '../public/vendor/three/addons/libs/fflate.module.js';
const data = await fs.mkdtemp(path.join(os.tmpdir(),'liqu3d-local-test-'));
const token='temporary-desktop-test-token';
let child, base, logs='';
async function start() {
  child=fork('server.mjs',[],{env:{...process.env,NODE_ENV:'production',PORT:'0',PMM_DATA_DIR:data,LIQU3D_DESKTOP_TOKEN:token,PMM_RENDERER_URL:'http://must-not-be-used.invalid',OPENSCAD_BIN:process.env.OPENSCAD_BIN || (process.platform==='darwin'?'/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD':'openscad')},silent:true});
  child.stderr.on('data',c=>logs+=c);child.stdout.resume();
  base=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error(logs||'Startup timed out')),15000);child.once('message',m=>{clearTimeout(timeout);resolve(m.url);});child.once('exit',()=>{clearTimeout(timeout);reject(Error(logs));});});
}
async function stop(){if(child?.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}}
async function request(url,body,method=body?'POST':'GET') {
  const response=await fetch(base+url,{method,headers:{'x-liqu3d-desktop':token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual'});
  const buffer=Buffer.from(await response.arrayBuffer());
  return {status:response.status,headers:response.headers,buffer,text:buffer.toString(),json:()=>JSON.parse(buffer)};
}
try {
  await start();
  assert.equal((await fetch(base+'/api/workspaces')).status,403,'Desktop capability required');
  const home=await request('/');assert.equal(home.status,302);assert.match(home.headers.get('location'),/^\/app\?workspace=/);
  const url=home.headers.get('location'), id=new URL(base+url).searchParams.get('workspace');
  const page=(await request(url)).text;assert.doesNotMatch(page,/id="logoutBtn"|data-settings-section="security"|data-settings-section="account"/);
  assert.equal((await request('/api/auth/login',{email:'x',password:'x'})).status,404);
  const bootstrap=await request(`/api/workspaces/${id}/bootstrap`);assert.equal(bootstrap.status,200,bootstrap.text);
  const health=await request('/healthz');assert.equal(health.status,200,health.text);assert.equal(health.json().manifold,true);
  const source='size=12; color("red") cube([size,8,2]);';
  const preview=await request('/api/render',{source,sourceName:'native.scad',values:{size:18}});assert.equal(preview.status,200,preview.text);assert.ok(preview.buffer.length>84);
  const full=await request('/api/export?format=3mf',{source,sourceName:'native.scad',values:{size:18}});assert.equal(full.status,200,full.text);assert.ok(Object.keys(unzipSync(full.buffer)).some(k=>k.endsWith('.model')));
  const tag=await fs.readFile('models/model.scad','utf8');
  const textPreview=await request('/api/render-object?id=1&format=3mf&preview=1',{source:tag,sourceName:'tag.scad',values:{}});assert.equal(textPreview.status,200,textPreview.text);assert.ok(textPreview.buffer.length>100);
  const cachedText=await request('/api/render-object?id=1&format=3mf&preview=1',{source:tag,sourceName:'tag.scad',values:{}});
  assert.equal(cachedText.headers.get('x-render-cache'),'memory');assert.deepEqual(cachedText.buffer,textPreview.buffer);
  const batch=(await request('/api/workspaces',{name:'Native batch',kind:'instant'})).json();
  const batchId=batch.id;
  const files=await request(`/api/instants/${batchId}/files`,{files:[{path:'main.scad',base64:Buffer.from(source).toString('base64')}]});assert.equal(files.status,200,files.text);
  const configure=await request(`/api/instants/${batchId}`,{entry:'main.scad',ordersName:'orders.csv',ordersText:'Size,Qty\n12,2\n18,1'},'PUT');assert.equal(configure.status,200,configure.text);
  const run=await request(`/api/instants/${batchId}/runs`,{});assert.equal(run.status,202,run.text);
  let state;
  for(let i=0;i<180;i++){state=(await request(`/api/instants/${batchId}`)).json();if(['ready','failed'].includes(state.current?.status))break;await new Promise(r=>setTimeout(r,500));}
  assert.equal(state.current?.status,'ready',JSON.stringify(state.current));
  const result=await request(`/api/instants/${batchId}/result`);assert.equal(result.status,200,result.text);assert.ok(Object.keys(unzipSync(result.buffer)).some(k=>k.endsWith('.model')));
  const history=(await request('/api/export-history')).json();assert.ok(history.exports.length>0,'Native batch records export history');
  const replay=await request(`/api/export-history/${history.exports[0].id}/again`,{});assert.equal(replay.status,200,replay.text);
  const preferences=bootstrap.json().user.preferences;preferences.workspace.autoRegenerateDelaySeconds=2.75;
  assert.equal((await request('/api/account/preferences',preferences,'PATCH')).status,200);
  await stop();await start();
  assert.equal((await request(`/api/workspaces/${id}`)).status,200);
  const restartedText=await request('/api/render-object?id=1&format=3mf&preview=1',{source:tag,sourceName:'tag.scad',values:{}});
  assert.equal(restartedText.headers.get('x-render-cache'),'disk');assert.deepEqual(restartedText.buffer,textPreview.buffer);
  assert.equal((await request('/api/account/settings')).json().preferences.workspace.autoRegenerateDelaySeconds,2.75);
  console.log('Local desktop passed: no login, isolated local data, native preview/text/3MF, batch generation, export replay, restart persistence, and clean shutdown.');
} finally {await stop();await fs.rm(data,{recursive:true,force:true});}
