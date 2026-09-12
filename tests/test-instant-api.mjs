import './setup.mjs';
import { localWorkerTransport } from './fixtures/renderer-transport.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { unzipSync, strFromU8, zipSync, strToU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),'pmm-instant-api-'));
const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});
const rendererPort=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
const transport=process.env.PMM_INSTANT_TEST_REAL_DOCKER==='1'?null:await localWorkerTransport();
const renderer=spawn(process.execPath,['renderer-service.mjs'],{env:{PATH:process.env.PATH,HOST:'127.0.0.1',PORT:String(rendererPort),PMM_WORKER_SCOPE:`pmm-api-test-${randomBytes(6).toString('hex')}`,...(transport?{PMM_DOCKER_BIN:transport.command}:{PMM_DOCKER_HOST:process.env.PMM_DOCKER_HOST||''})},stdio:['ignore','ignore','pipe']});
let rendererErrors='';renderer.stderr.on('data',data=>rendererErrors+=data);
const rendererUrl=`http://127.0.0.1:${rendererPort}`;
const base=`http://127.0.0.1:${port}`;let output='',child;
function start(rendererEnabled=true){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PMM_INTERNAL_BIND:'1',HOST:'127.0.0.1',PORT:String(port),PMM_DATA_DIR:dataDir,PMM_RENDERER_URL:rendererEnabled?rendererUrl:'',PMM_RESEND_API_KEY:'',PMM_SMTP_HOST:'',PMM_TRUST_PROXY:'0',PMM_PUBLIC_ORIGIN:'',PMM_ALLOWED_HOSTS:'',OPENSCAD_BIN:process.env.OPENSCAD_BIN||path.resolve('tests/fixtures/modern-openscad-shim')},stdio:['ignore','ignore','pipe']});child.stderr.on('data',data=>output+=data.toString());}
async function ready(){for(let i=0;i<200;i++){try{if((await fetch(base+'/healthz')).ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,60));}throw new Error(output);}
async function stop(){if(child?.exitCode===null){const ended=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await ended;}}
let cookie;
async function request(url,body,method=body===undefined?'GET':'POST',other=false){const response=await fetch(base+url,{method,redirect:'manual',headers:{'Content-Type':'application/json',Cookie:other?'pmm_session=invalid':cookie},...(body!==undefined?{body:JSON.stringify(body)}:{})});const text=await response.text();let json;try{json=JSON.parse(text);}catch{}return {status:response.status,json,text,headers:response.headers};}
async function completed(id,timeout=120000){const deadline=Date.now()+timeout;while(Date.now()<deadline){const {json}=await request(`/api/instants/${id}`);if(!['queued','running'].includes(json.current?.status))return json;await new Promise(resolve=>setTimeout(resolve,300));}throw new Error('Instant timed out: '+output);}
async function generate(id,timeout){const result=await request(`/api/instants/${id}/runs`,{});assert.equal(result.status,202,result.text);return completed(id,timeout);}
const file=(path,text)=>({path,base64:Buffer.from(text).toString('base64')});
try{
 for(let i=0;i<200;i++){try{if((await fetch(rendererUrl+'/healthz')).ok)break;}catch{}if(i===199)throw new Error(rendererErrors);await new Promise(resolve=>setTimeout(resolve,60));}
 start();await ready();const db=new DatabaseSync(path.join(dataDir,'accounts.sqlite'));const now=Date.now(),token=randomBytes(32).toString('base64url');
 db.prepare('INSERT INTO users(id,email,display_name,password_salt,password_hash,password_version,email_verified_at,two_factor_enabled,settings_json,generation_defaults_version,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(1,'instant@example.com','Instant test','salt','hash',3,now,0,'{}',1,now);
 db.prepare('INSERT INTO sessions(token_hash,user_id,created_at,last_active_at,user_agent,ip_address,location,expires_at) VALUES(?,?,?,?,?,?,?,?)').run(createHash('sha256').update(token).digest('hex'),1,now,now,'test','127.0.0.1','Local',now+3600000);db.close();cookie=`pmm_session=${token}`;
 const emptyRender=await request('/api/export?format=3mf',{source:'if(false) cube(1);',sourceName:'empty-design.scad',values:{}});
 assert.equal(emptyRender.status,422,emptyRender.text);assert.match(emptyRender.json.error,/empty-design.scad: No printable geometry/);assert.doesNotMatch(emptyRender.json.error,/Unexpected server error/);
 const emptyPartSource='render_part="all"; export_single_design=1; pmm_objects=[[1,"Optional part"]]; if(render_part=="base") cube(1);';
 const emptyPart=await request('/api/render-object?id=1&part=tag_text&format=3mf',{source:emptyPartSource,sourceName:'optional.scad',values:{}});
 assert.equal(emptyPart.status,200,emptyPart.text);assert.equal(emptyPart.text,'');
 const emptyObject=await request('/api/render-object?id=1&format=3mf',{source:emptyPartSource,sourceName:'optional.scad',values:{}});
 assert.equal(emptyObject.status,422,emptyObject.text);assert.match(emptyObject.json.error,/optional.scad.*Optional part.*No printable geometry/);
 // Manifests describe possible designs; OpenSCAD decides which are active.
 const conditionalSource='columns=3; rows=2;\n/* [Hidden] */\nselected_box=0; pmm_object_selector_param="selected_box"; pmm_objects=['+Array.from({length:10},(_,i)=>`[${i+1},"Box ${i+1}","","box_${i+1}"]`).join(',')+']; active_count=min(10,columns*rows); for(i=[1:10]) if(i<=active_count && (selected_box==0 || selected_box==i)) translate([i*5,0,0]) cube(2);';
 const conditionalBody={source:conditionalSource,sourceName:'conditional.scad',values:{}};
 for(let id=1;id<=10;id++) {
  const preview=await request(`/api/render-object?id=${id}&format=3mf&preview=1`,conditionalBody);
  assert.equal(preview.status,200,preview.text);assert.equal(preview.text.length>0,id<=6,`Box ${id}`);
 }
 const cachedEmpty=await request('/api/render-object?id=7&format=3mf&preview=1',conditionalBody);
 assert.equal(cachedEmpty.status,200);assert.equal(cachedEmpty.text,'');assert.ok(cachedEmpty.headers.get('X-Render-Cache'));
 const requiredAfterEmpty=await request('/api/render-object?id=7&format=3mf',conditionalBody);
 assert.equal(requiredAfterEmpty.status,422,'An optional empty preview must not satisfy a required export from cache');
 const enabledObject=await request('/api/render-object?id=7&format=3mf&preview=1',{...conditionalBody,values:{rows:3}});
 assert.equal(enabledObject.status,200,enabledObject.text);assert.ok(enabledObject.text.length>0);
 const disabledAgain=await request('/api/render-object?id=7&format=3mf&preview=1',conditionalBody);
 assert.equal(disabledAgain.status,200);assert.equal(disabledAgain.text,'');
 const invalidPreview=await request('/api/render-object?id=1&format=3mf&preview=1',{...conditionalBody,source:conditionalSource+'\nassert(false,"Invalid dimensions");'});
 assert.equal(invalidPreview.status,422);assert.match(invalidPreview.json.error,/Invalid dimensions/);
 let result=await request('/api/workspaces',{name:'Instant batch',kind:'instant'});assert.equal(result.status,201,result.text);const id=result.json.id;
 result=await request(`/api/instants/${id}`);assert.equal(result.status,200,result.text);assert.equal(result.json.config.printProfile.printer,'p1s');
 const profile=result.json.config.printProfile;profile.settings.layer_height=0.28;
 await request(`/api/instants/${id}`,{ordersName:'test.csv',ordersText:'Size,Qty\n16,2\n22,1',printProfile:profile,colorOptimization:{enabled:true,maxFilamentSlots:4,maxColorChanges:0}},'PUT');
 result=await request(`/api/instants/${id}/files`,{files:[{path:'project.zip',base64:Buffer.from(zipSync({'model/main.scad':strToU8('size=10;\ninclude <../lib/part.scad>\ncolor("red") part(size);'),'lib/part.scad':strToU8('module part(size){cube([size,20,2]);}')})).toString('base64')}]});assert.equal(result.status,200,result.text);
 result=await request(`/api/instants/${id}`,{entry:'model/main.scad'},'PUT');assert.equal(result.status,200,result.text);assert.equal(result.json.validation.ready,true,JSON.stringify(result.json.validation));
 const waiting=(await request(`/api/instants/${id}`)).json;assert.equal(waiting.current,null,'Uploads must wait for Generate');assert.equal(waiting.validation.ready,true);assert.equal(waiting.needsGeneration,true);
 let state=await generate(id);assert.equal(state.current.status,'ready',state.current.error+' '+output);assert.equal(state.result.progress.objectCount,3);
 assert.equal(state.result.progress.colorOptimization.analyzedCount,3,'real OpenSCAD colour properties are analyzable');
 assert.equal(state.result.progress.colorOptimization.layerHeight,0.28);
 assert.equal(state.config.colorOptimization.maxColorChanges,0);assert.equal(state.result.progress.colorOptimization.estimatedSwaps,0);
 result=await request('/api/workspaces');assert.equal(result.json.workspaces[0].kind,'instant');assert.equal(result.json.workspaces[0].instant.status,'ready');
 const archiveResponse=await fetch(`${base}/api/instants/${id}/result`,{headers:{Cookie:cookie}});assert.equal(archiveResponse.status,200);const entries=unzipSync(new Uint8Array(await archiveResponse.arrayBuffer()));assert.equal(JSON.parse(strFromU8(entries['Metadata/project_settings.config'])).layer_height,'0.28');
 assert.equal((await request(`/api/instants/${id}`,undefined,'GET',true)).status,401);
 result=await request(`/api/instants/${id}/files`,{files:[file('../bad.scad','cube(1);')]});assert.equal(result.status,400,result.text);
 result=await request(`/api/instants/${id}/files`,{files:[{path:'unsafe.zip',base64:Buffer.from(zipSync({'../bad.scad':strToU8('cube(1);')})).toString('base64')}]});assert.equal(result.status,400,result.text);
 const originalInstant=(await request(`/api/instants/${id}`)).json;
 result=await request(`/api/instants/${id}/convert`,{});assert.equal(result.status,200,result.text);const workspaceId=result.json.id;assert.notEqual(workspaceId,id);const snapshot=result.json.data;assert.equal(snapshot.colorOptimization.maxColorChanges,0);assert.equal(snapshot.plates[0].batchInstances.length,2);assert.ok(snapshot.plates[0].packageId);
 result=await request(`/api/workspaces/${workspaceId}/bootstrap`);assert.equal(result.status,200,result.text);assert.equal(result.json.workspace.kind,'workspace');assert.equal(result.json.workspace.data.printProfile.settings.layer_height,0.28);
 assert.deepEqual((await request(`/api/instants/${id}`)).json,originalInstant,'copy preserves Instant setup, run and result');
 assert.equal((await request(`/api/workspaces/${id}`)).json.kind,'instant');
 assert.equal((await fetch(`${base}/api/instants/${id}/result`,{headers:{Cookie:cookie}})).status,200);
 snapshot.colorOptimization={enabled:true,maxFilamentSlots:8};
 result=await request(`/api/workspaces/${workspaceId}`,{name:'Edited workspace copy',data:snapshot},'PUT');assert.deepEqual(result.json.data.colorOptimization,snapshot.colorOptimization);assert.equal(result.status,200,result.text);
 assert.deepEqual((await request(`/api/instants/${id}`)).json,originalInstant);
 result=await request(`/api/workspaces/${id}`,undefined,'DELETE');assert.equal(result.status,200,result.text);
 const plate=snapshot.plates[0];result=await request('/api/render',{source:plate.source,sourceName:plate.sourceName,packageId:plate.packageId,packageEntry:plate.packageEntry,values:plate.values});assert.equal(result.status,200,result.text.slice(0,200));
 assert.equal((await request(`/api/instants/${id}`)).status,404);
 // Explicit generation follows automatically matched order identifiers.
 result=await request('/api/workspaces',{name:'Automatic model',kind:'instant'});const autoId=result.json.id;
 const autoSource='design1_name_text="One";\ndesign1_size=12;\ndesign2_name_text="Two";\ndesign2_size=18;\n/* [Hidden] */\nexport_single_design=0;\npmm_object_selector_param="export_single_design";\npmm_objects=[[1,"Design 1","design1_name_text","one"],[2,"Design 2","design2_name_text","two"]];\nif(export_single_design==2) color("blue") cube([design2_size,10,2]); else color("red") cube([design1_size,10,2]);';
 await request(`/api/instants/${autoId}`,{ordersText:'Name: Alex'},'PUT');
 result=await request(`/api/instants/${autoId}/files`,{files:[file('model.scad',autoSource)]});assert.equal(result.json.validation.ready,true);assert.equal(result.json.validation.model.key,'one');
 state=await generate(autoId);assert.equal(state.current.status,'ready',state.current.error);
 result=await request(`/api/instants/${autoId}`,{ordersText:'Design2 Name Text: Bea'},'PUT');assert.equal(result.json.validation.model.key,'two');
 state=await generate(autoId);assert.equal(state.current.status,'ready',state.current.error);
 result=await request(`/api/instants/${autoId}`,{ordersText:'Customer label: Cara'},'PUT');assert.equal(result.json.validation.ready,false);
 result=await request(`/api/instants/${autoId}`,{mappingPatch:{'Customer label':'design2_name_text'}},'PUT');assert.equal(result.json.validation.ready,true);assert.equal(result.json.validation.matches['Customer label'].method,'manual');
 state=await generate(autoId);assert.equal(state.current.status,'ready',state.current.error);const unchanged=state.current.id;
 assert.equal((await request(`/api/instants/${autoId}`)).json.current.id,unchanged);
 // Legacy string selectors must render one design, not the oversized full layout.
 result=await request('/api/workspaces',{name:'String model selector',kind:'instant'});const selectorId=result.json.id;
 const selectorSource='render_design="all"; // [all,design_1,design_2]\ndesign1_name_text="Default one";\ndesign2_name_text="Default two";\nif(render_design=="all") cube([500,40,2]);\nif(render_design=="design_1") { color("red") cube([30,20,1]); translate([0,0,1]) color("blue") cube([10,10,1]); }\nif(render_design=="design_2") color("green") cube([40,20,2]);';
 await request(`/api/instants/${selectorId}`,{ordersText:'Name\nMason\nAlex'},'PUT');
 result=await request(`/api/instants/${selectorId}/files`,{files:[file('model.scad',selectorSource)]});
 assert.equal(result.json.groups.length,2);assert.equal(result.json.validation.model.key,'object_1');
 state=await generate(selectorId);assert.equal(state.current.status,'ready',state.current.error);assert.equal(state.result.progress.objectCount,2);assert.equal(state.result.progress.skippedCount,0);
 result=await request(`/api/instants/${selectorId}`,{ordersText:'Design2 Name Text: Bea'},'PUT');assert.equal(result.json.validation.model.key,'object_2');
 state=await generate(selectorId);assert.equal(state.current.status,'ready',state.current.error);
 result=await request(`/api/instants/${selectorId}/convert`,{});assert.equal(result.status,200,result.text);assert.deepEqual(result.json.data.plates[0].objectBinding.memberIds,[2]);
 const selectorWorkspaceId=result.json.id,selectorRun=state.current.id;
 for(const pinId of [selectorId,selectorWorkspaceId]) {
  result=await request(`/api/workspaces/${pinId}/library`,{pinned:true},'PUT');assert.equal(result.status,200,result.text);assert.equal(result.json.pinned,true);
 }
 result=await request('/api/workspaces');assert.deepEqual(new Set(result.json.workspaces.slice(0,2).map(row=>row.id)),new Set([selectorId,selectorWorkspaceId]));
 const originalBeforeCopies=(await request(`/api/instants/${selectorId}`)).json;
 const nowTemporary=Date.now();
 result=await request(`/api/instants/${selectorId}/convert`,{retention:'temporary'});assert.equal(result.status,200,result.text);
 const temporaryId=result.json.id,expiry=result.json.expiresAt;
 assert.notEqual(temporaryId,selectorId);assert.ok(expiry>=nowTemporary+86400000 && expiry<=Date.now()+86400000);
 assert.equal((await request(`/api/workspaces/${temporaryId}`)).json.kind,'workspace');
 assert.deepEqual(result.json.data,(await request(`/api/workspaces/${selectorWorkspaceId}`)).json.data,'both copy types retain the same completed batch');
 assert.deepEqual((await request(`/api/instants/${selectorId}`)).json,originalBeforeCopies,'copies leave Instant intact');
 await request(`/api/workspaces/${temporaryId}/library`,{pinned:true},'PUT');
 result=await request(`/api/workspaces/${temporaryId}`,{name:'Edited temporary copy',data:result.json.data},'PUT');assert.equal(result.status,200,result.text);
 assert.equal((await request(`/api/workspaces/${temporaryId}`)).json.expiresAt,expiry,'editing and pinning do not extend the deadline');
 assert.equal((await request(`/api/workspaces/${selectorId}/library`,{retention:'temporary'},'PUT')).status,400);
 assert.equal((await request(`/api/workspaces/${selectorId}/library`,{pinned:'true'},'PUT')).status,400);
 assert.equal((await request(`/api/instants/${selectorId}/convert`,{retention:'temporary'},'POST',true)).status,401);
 const recordCount=(await request('/api/workspaces')).json.workspaces.length;
 assert.equal((await request(`/api/instants/${selectorId}/convert`,{retention:'invalid'})).status,400);
 assert.equal((await request('/api/workspaces',{kind:'instant',retention:'temporary'})).status,400);
 assert.equal((await request('/api/workspaces')).json.workspaces.length,recordCount);
 const expiryDb=new DatabaseSync(path.join(dataDir,'accounts.sqlite'));
 expiryDb.prepare('UPDATE workspaces SET expires_at=? WHERE id=?').run(Date.now()-1,temporaryId);
 assert.equal((await request(`/api/workspaces/${temporaryId}`)).status,404,'expired pinned workspace is deleted');
 assert.equal((await request(`/api/instants/${selectorId}`)).json.current.id,selectorRun);
 assert.equal((await request(`/api/workspaces/${selectorWorkspaceId}/bootstrap`)).status,200);
 result=await request(`/api/instants/${selectorId}/convert`,{retention:'temporary'});assert.equal(result.status,200,result.text);const startupId=result.json.id;
 expiryDb.prepare('UPDATE workspaces SET expires_at=? WHERE id=?').run(Date.now()-1,startupId);
 // Upgrade an incorrectly temporary Instant without deleting its files or runs.
 expiryDb.prepare('UPDATE workspaces SET expires_at=? WHERE id=?').run(Date.now()-1,selectorId);expiryDb.close();
 await stop();start();await ready();
 assert.equal((await request(`/api/workspaces/${startupId}`)).status,404);
 assert.deepEqual((await request(`/api/instants/${selectorId}`)).json,originalBeforeCopies);
 assert.equal((await request(`/api/workspaces/${selectorWorkspaceId}`)).json.pinned,true);
 assert.equal((await request(`/api/workspaces/${workspaceId}`)).status,200);
 await request(`/api/workspaces/${selectorWorkspaceId}/library`,{pinned:false},'PUT');
 assert.equal((await request(`/api/workspaces/${selectorWorkspaceId}`)).json.pinned,false);
 // Opposing colour layers must improve through the real OpenSCAD pipeline too.
 result=await request('/api/workspaces',{name:'Colour layer patterns',kind:'instant'});const colorId=result.json.id;
 await request(`/api/instants/${colorId}`,{ordersText:'Pattern\n1\n2\n3\n4',printProfile:profile,colorOptimization:{enabled:true,maxFilamentSlots:2}},'PUT');
 const colorSource='pattern=0;\ncolor(pattern%2==0?"red":"white") cube([110,80,1.4]);\ntranslate([0,0,1.4]) color(pattern%2==0?"white":"red") cube([110,80,1.4]);';
 await request(`/api/instants/${colorId}/files`,{files:[file('patterns.scad',colorSource)]});
 state=await generate(colorId);assert.equal(state.current.status,'ready',state.current.error);assert.equal(state.result.progress.objectCount,4);assert.equal(state.result.progress.colorOptimization.analyzedCount,4);
 const optimization=state.result.progress.colorOptimization;assert.ok(optimization.estimatedSwaps<optimization.baselineSwaps,JSON.stringify(optimization));
 const colorRun=state.current.id;assert.equal((await request(`/api/instants/${colorId}`,{colorOptimization:{enabled:true,maxFilamentSlots:2}},'PUT')).json.current.id,colorRun);
 assert.equal((await request(`/api/instants/${colorId}`,{colorOptimization:{maxFilamentSlots:0}},'PUT')).status,400);
 console.log(`Real colour patterns: ${optimization.baselineSwaps} → ${optimization.estimatedSwaps} estimated changes, ${state.result.progress.plateCount} plates.`);
 console.log('Instant API passed: real rendering, saved print profile, quantities, independent workspace copies, ownership and dependencies after Instant deletion.');
 if(process.env.PMM_INSTANT_FIXTURE_DIR){
  result=await request('/api/workspaces',{name:'Attached fridge tags',kind:'instant'});const fixtureId=result.json.id;const root=process.env.PMM_INSTANT_FIXTURE_DIR;
  await request(`/api/instants/${fixtureId}`,{ordersName:'Orders.txt',ordersText:await fs.readFile(path.join(root,'Orders.txt'),'utf8'),printProfile:profile},'PUT');
  const paths=['fridge_tag_template.scad','fonts/Baloo2[wght].ttf','fonts/PlaywriteAUVICGuides-Regular.ttf'];
  result=await request(`/api/instants/${fixtureId}/files`,{files:await Promise.all(paths.map(async p=>({path:p,base64:(await fs.readFile(path.join(root,'GENERATION',p))).toString('base64')})))});assert.equal(result.status,200,result.text);
  assert.equal(result.json.validation.model.key,result.json.groups[0].key);assert.equal(result.json.validation.model.selection,'auto');assert.equal(result.json.validation.objectCount,16,JSON.stringify(result.json.validation));
  console.log('Rendering the attached 16-order batch…');state=await generate(fixtureId,1200000);assert.equal(state.current.status,'ready',state.current.error);assert.equal(state.result.progress.objectCount,16);
  const response=await fetch(`${base}/api/instants/${fixtureId}/result`,{headers:{Cookie:cookie}});const archive=Buffer.from(await response.arrayBuffer());await fs.writeFile(path.join(dataDir,'fridge-tags.3mf'),archive);
  const files=unzipSync(archive);const settings=JSON.parse(strFromU8(files['Metadata/project_settings.config']));assert.equal(settings.layer_height,'0.28');assert.ok(settings.filament_colour.length>=3);console.log(`Attached batch passed: 16 objects, ${state.result.progress.plateCount} plates, ${settings.filament_colour.length} colors.`);
 }
 await stop();start(false);await ready();
 result=await request('/api/workspaces',{name:'Requires isolation',kind:'instant'});const blockedId=result.json.id;
 await request(`/api/instants/${blockedId}`,{ordersText:'size\n2'},'PUT');
 await request(`/api/instants/${blockedId}/files`,{files:[file('model.scad','size=1;cube(size);')]});
 state=await generate(blockedId);assert.equal(state.current.status,'failed');assert.match(state.current.error,/requires the isolated renderer/);
 console.log('Instant refuses local execution when the isolated renderer is unavailable.');
}finally{await stop();if(renderer.exitCode===null){const ended=new Promise(resolve=>renderer.once('exit',resolve));renderer.kill('SIGTERM');await ended;}await transport?.close();await fs.rm(dataDir,{recursive:true,force:true});}
