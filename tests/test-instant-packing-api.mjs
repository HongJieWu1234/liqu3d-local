import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { unzipSync, strFromU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { archiveFingerprint } from '../lib/export-history.mjs';

const directory=await fs.mkdtemp(path.join(os.tmpdir(),'pmm-packing-api-'));
const port=await new Promise(resolve=>{const probe=net.createServer();probe.listen(0,'127.0.0.1',()=>{const port=probe.address().port;probe.close(()=>resolve(port));});});
const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['server.mjs'],{env:{PATH:process.env.PATH,HOME:process.env.HOME,PMM_INTERNAL_BIND:'1',HOST:'127.0.0.1',PORT:String(port),PMM_DATA_DIR:directory,PMM_RENDERER_URL:process.env.PMM_RENDERER_URL||'http://127.0.0.1:4180'},stdio:['ignore','ignore','pipe']});
let errors='',db;child.stderr.on('data',data=>errors+=data);
const token=process.env.PMM_QA_SESSION_TOKEN?.padEnd(43,'_')||randomBytes(32).toString('base64url');
const request=(route,body,method=body===undefined?'GET':'POST')=>fetch(base+route,{method,headers:{Cookie:`pmm_session=${token}`,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
async function json(route,body,method){const response=await request(route,body,method);const data=await response.json();assert.ok(response.ok,JSON.stringify(data));return data;}
async function generate(id){await json(`/api/instants/${id}/runs`,{});for(let i=0;i<600;i++){const state=await json(`/api/instants/${id}`);if(!['queued','running'].includes(state.current.status)){assert.equal(state.current.status,'ready',state.current.error);return state;}await new Promise(resolve=>setTimeout(resolve,100));}throw new Error('Generation timed out');}
const file=(path,text)=>({path,base64:Buffer.from(text).toString('base64')});
try {
  for(let i=0;i<150;i++){try{if((await fetch(base+'/healthz')).ok)break;}catch{}if(i===149)throw new Error(errors);await new Promise(resolve=>setTimeout(resolve,100));}
  db=new DatabaseSync(path.join(directory,'accounts.sqlite'));const now=Date.now();
  db.prepare('INSERT INTO users(id,email,display_name,password_salt,password_hash,password_version,email_verified_at,two_factor_enabled,settings_json,generation_defaults_version,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(1,'packing-test@example.com','Packing review','salt','hash',3,now,0,JSON.stringify({appearance:{theme:'light',accent:'#00b341'}}),1,now);
  db.prepare('INSERT INTO sessions(token_hash,user_id,created_at,last_active_at,user_agent,ip_address,location,expires_at) VALUES(?,?,?,?,?,?,?,?)').run(createHash('sha256').update(token).digest('hex'),1,now,now,'test','127.0.0.1','Local',now+3600000);
  const instant=await json('/api/workspaces',{name:'Packing review',kind:'instant'}),id=instant.id;
  const source='size=30;\n/* [Hidden] */\nselected_box=0; pmm_object_selector_param="selected_box"; pmm_objects=[[1,"Tag","","tag"]];\ninclude <lib/body.scad>\nif(selected_box==0 || selected_box==1) tag(size);';
  const body='module tag(size){ color("red") cube([size,20,2]); translate([0,0,2]) color("blue") cube([size,20,1]); }';
  await json(`/api/instants/${id}`,{ordersText:'size,Qty\n30,37',maxObjectsPerPlate:1},'PUT');
  let state=await json(`/api/instants/${id}/files`,{files:[file('main.scad',source),file('lib/body.scad',body)]});
  assert.equal(state.current,null,'Uploading files must wait for Generate');
  await json(`/api/instants/${id}`,{entry:'main.scad'},'PUT');
  state=await generate(id);assert.equal(state.result.progress.plateCount,37);assert.equal(state.result.progress.primeTowers.length,37);assert.equal(state.result.progress.archiveExtension,'zip');
  const copy=await json(`/api/instants/${id}/convert`,{}),plate=copy.data.plates[0];
  assert.equal(copy.data.maxObjectsPerPlate,1);assert.ok(copy.data.loadedPlateIds.includes('K0'));assert.equal(copy.data.primeTowers.length,37);
  await json(`/api/workspaces/${copy.id}`,{name:copy.name,data:copy.data},'PUT');
  const restored=await json(`/api/workspaces/${copy.id}/bootstrap`);assert.deepEqual(restored.workspace.data.primeTowers,copy.data.primeTowers);assert.deepEqual(restored.workspace.data.loadedPlateIds,copy.data.loadedPlateIds);
  const renderBody={source:plate.source,sourceName:plate.packageEntry,packageId:plate.packageId,packageEntry:plate.packageEntry,values:plate.values};
  let response=await request('/api/render-object?id=1&format=3mf',renderBody);assert.equal(response.status,200,await response.clone().text());assert.ok(response.headers.get('X-Render-Cache'),'Instant full-quality frozen geometry is reused');await response.arrayBuffer();
  response=await request('/api/render-object?id=1&format=3mf&preview=1',renderBody);assert.equal(response.status,200);assert.equal(response.headers.get('X-Render-Cache'),null,'Preview has a separate quality key');await response.arrayBuffer();
  response=await request('/api/render-object?id=1&format=3mf&preview=1',renderBody);assert.ok(response.headers.get('X-Render-Cache'));await response.arrayBuffer();
  response=await request('/api/render-object?id=1&format=3mf',{...renderBody,values:{...plate.values,size:31}});assert.equal(response.status,200);assert.equal(response.headers.get('X-Render-Cache'),null,'Edited parameters miss the cache');await response.arrayBuffer();
  response=await request(`/api/instants/${id}/result`);assert.equal(response.status,200,await response.clone().text());assert.equal(response.headers.get('Content-Type'),'application/zip');assert.match(response.headers.get('Content-Disposition'),/\.zip/);
  const archive=new Uint8Array(await response.arrayBuffer()),entries=unzipSync(archive),projects=Object.keys(entries).filter(name=>name.endsWith('.3mf'));
  assert.equal(projects.length,2);let total=0;
  for(const name of projects){const project=unzipSync(entries[name]);const workflow=JSON.parse(strFromU8(project['Metadata/pmm/workflow.json']));assert.ok(workflow.objects.length<=36);total+=workflow.objects.length;}
  assert.equal(total,37);
  const historyId=response.headers.get('X-Export-History-Id');response=await request(`/api/export-history/${historyId}/again`,{});assert.equal(response.status,200,await response.clone().text());assert.equal(response.headers.get('Content-Type'),'application/zip');assert.equal(archiveFingerprint(new Uint8Array(await response.arrayBuffer())),archiveFingerprint(archive));
  await json(`/api/instants/${id}`,{ordersText:'size,Qty\n30,3',maxObjectsPerPlate:2},'PUT');state=await generate(id);assert.equal(state.result.progress.plateCount,2);
  const visual=await json(`/api/instants/${id}/convert`,{retention:'temporary'});assert.ok(visual.expiresAt>now+86390000);
  console.log('Instant packing API passed: manual generation, per-plate towers/caps, extended IDs, save/reload, frozen cache isolation, 37-plate ZIP and replay.');
  if(process.env.PMM_QA_HOLD_PATH){await fs.writeFile(process.env.PMM_QA_HOLD_PATH,JSON.stringify({base,instantId:id,workspaceId:visual.id,directory,serverPid:child.pid}));console.log('Visual fixture ready.');const keepAlive=setInterval(()=>{},1000);try{await new Promise(resolve=>{process.once('SIGTERM',resolve);process.once('SIGINT',resolve);});}finally{clearInterval(keepAlive);}}
} finally {
  db?.close();if(child.exitCode===null){const ended=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await ended;}
  await fs.rm(directory,{recursive:true,force:true});
}
