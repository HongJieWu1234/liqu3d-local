import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { zipSync, strToU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { localBambuRequest, findBambuStudio, bambuExportFiles, openExportInBambu, createBambuHandoffStore } from '../lib/bambu-launch.mjs';
import { bambuProtocolUrl, offerBambuHandoff } from '../public/bambu-handoff.js';
import { downloadRecordedExport } from '../public/export-history-ui.js';

const request={socket:{remoteAddress:'127.0.0.1'},headers:{host:'127.0.0.1:4174',origin:'http://127.0.0.1:4174','x-instant-export':'1','sec-fetch-site':'same-origin'}};
assert.equal(localBambuRequest(request),true);
for(const headers of [{host:'example.com'},{origin:'http://127.0.0.1:1234'},{'x-forwarded-for':'127.0.0.1'},{'sec-fetch-site':'cross-site'},{host:'['}])
  assert.equal(localBambuRequest({...request,headers:{...request.headers,...headers}}),false);
assert.equal(localBambuRequest({...request,socket:{remoteAddress:'192.168.1.2'}}),false);
const bytes=strToU8('test 3mf bytes'),single={extension:'3mf',filename:'One.3mf',archive:bytes};
const bundle=names=>({extension:'zip',archive:zipSync(Object.fromEntries([
  ['plates.json',strToU8(JSON.stringify({projects:names.map(filename=>({filename}))}))],...names.map(name=>[name,bytes])
]))});
assert.deepEqual(bambuExportFiles(single),[{name:'One.3mf',bytes}]);
assert.deepEqual(bambuExportFiles(bundle(['First.3mf','Second.3mf'])).map(file=>file.name),['First.3mf','Second.3mf']);
for(const names of [[],['../escape.3mf'],['..\\escape.3mf'],['duplicate.3mf','duplicate.3mf'],['other.txt']])
  assert.throws(()=>bambuExportFiles(bundle(names)));
const studio=await findBambuStudio({platform:'darwin',home:'/test-home',access:async file=>{
  if(file!=='/test-home/Applications/Bambu Studio.app/Contents/MacOS/BambuStudio')throw new Error('missing');
}});
assert.equal(studio.application,'/test-home/Applications/Bambu Studio.app');
assert.equal(await findBambuStudio({platform:'darwin',access:async()=>{throw new Error('missing');}}),null);
const root=await fs.mkdtemp(path.join(os.tmpdir(),'pmm-bambu-test-'));
let now=1000;
const handoffs=createBambuHandoffStore({ttl:1000,maxBytes:bytes.length*2,now:()=>now});
const links=handoffs.create(bundle(['First.3mf','Second.3mf']),1);
const token=links[0].path.split('/')[3];
assert.deepEqual(handoffs.get(token,'First.3mf').bytes,bytes);
assert.equal(handoffs.get(token,'Second.3mf'),null);
assert.throws(()=>handoffs.create(single,1),/busy/);
const origin='https://www.liqu3d.com';
assert.equal(bambuProtocolUrl(links[0].path,{origin,platform:'MacIntel'}),`bambustudioopen://${encodeURIComponent(origin+links[0].path)}`);
assert.equal(bambuProtocolUrl(links[0].path,{origin,platform:'Win32'}),`bambustudio://open?file=${encodeURIComponent(origin+links[0].path)}`);
assert.throws(()=>bambuProtocolUrl('https://other.test'+links[0].path,{origin,platform:'MacIntel'}));
now=2001;assert.equal(handoffs.get(token,'First.3mf'),null);
assert.equal(handoffs.create(single,2).length,1,'Expired exports release the memory budget');
const calls=[],options={enabled:true,allowLocal:true,request};
const dependencies={tempRoot:root,findStudio:async()=>studio,launch:async(_,file)=>{calls.push(file);assert.deepEqual(new Uint8Array(await fs.readFile(file)),bytes);}};
try {
  assert.equal(await openExportInBambu(single,{...options,enabled:false},dependencies),null);
  assert.equal(await openExportInBambu(single,{...options,request:{...request,headers:{...request.headers,'x-instant-export':undefined}}},dependencies),null);
  assert.equal((await openExportInBambu(single,{...options,allowLocal:false},dependencies)).opened,0);
  const hosted=await openExportInBambu(single,{...options,allowLocal:false,createHandoff:()=>links},dependencies);
  assert.deepEqual(hosted.files,links);assert.equal(hosted.count,2);assert.equal(calls.length,0,'Website visitors never launch the server desktop');
  assert.equal((await openExportInBambu(single,options,{...dependencies,findStudio:async()=>null})).opened,0);
  assert.deepEqual(await fs.readdir(root),[]);assert.equal(calls.length,0);
  assert.equal((await openExportInBambu(single,options,dependencies)).opened,1);
  const result=await openExportInBambu(bundle(['First.3mf','Second.3mf']),options,dependencies);
  assert.equal(result.opened,2);assert.equal(result.count,2);assert.equal(calls.length,3);
  assert.ok(calls[1].endsWith('01-First.3mf'));assert.ok(calls[2].endsWith('02-Second.3mf'));
  let attempts=0;
  const partial=await openExportInBambu(bundle(['First.3mf','Second.3mf']),options,{...dependencies,launch:async()=>{if(++attempts===2)throw new Error('launch failed');}});
  assert.equal(partial.opened,1);assert.equal(partial.count,2);assert.match(partial.message,/remaining files/);
}finally{await fs.rm(root,{recursive:true,force:true});}

const uiOriginal={fetch:globalThis.fetch,document:globalThis.document,location:globalThis.location,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
const elements=[],openedLinks=[],downloads=[],scheduled=[],requests=[];
globalThis.location={origin};
globalThis.setTimeout=callback=>{scheduled.push(callback);return scheduled.length-1;};
globalThis.clearTimeout=id=>{scheduled[id]=null;};
globalThis.document={body:{append(){}},createElement:tag=>{
  const events={},element={tag,children:[],append(...items){this.children.push(...items);},setAttribute(){},
    addEventListener(name,callback){events[name]=callback;},showModal(){this.open=true;},remove(){},
    close(){events.close?.();},click(){if(tag==='a'){if(this.download)downloads.push(this.download);else openedLinks.push(this.href);}events.click?.();}};
  elements.push(element);return element;
}};
try {
  offerBambuHandoff({files:links});
  assert.equal(openedLinks.length,1,'Instant Export requests the first file without another click');
  scheduled.filter(Boolean).forEach(callback=>callback());assert.equal(openedLinks.length,2,'Instant Export requests every bundled project');
  assert.ok(openedLinks.every(link=>link.startsWith('bambustudio')));
  elements.find(element=>element.textContent==='Retry all').click();
  assert.equal(openedLinks.length,3);
  elements.find(element=>element.textContent==='Done').click();
  assert.equal(scheduled.filter(Boolean).length,0,'Closing cancels remaining open requests');
  elements.length=0;openedLinks.length=0;
  let launch={opened:2,count:2,message:'Sent 2 3MFs to Bambu Studio.'};
  globalThis.fetch=async(url,options)=>{
    requests.push({url,...options});
    return new Response(bytes,{headers:{'Content-Disposition':'attachment; filename="export.zip"','X-Bambu-Launch':JSON.stringify(launch)}});
  };
  const exported=await downloadRecordedExport('/api/export-history',{version:1});
  assert.equal(exported.bambu.opened,2);assert.equal(requests[0].method,'POST');
  assert.equal(requests[0].headers['X-Instant-Export'],'1');assert.equal(requests[0].body,'{"version":1}');
  await downloadRecordedExport('/api/instants/id/result',null,()=>{},{method:'GET'});
  assert.equal(requests[1].method,'GET');assert.equal(requests[1].body,undefined);
  assert.deepEqual(downloads,[],'Successful native handoff does not save a browser download');
  assert.equal(elements.length,0,'Successful native handoff does not need a dialog');
  launch={opened:0,count:1,files:[links[0]]};
  await downloadRecordedExport('/api/export-history/1/again');
  assert.equal(openedLinks.length,1,'History re-export automatically requests Bambu Studio');
  assert.deepEqual(downloads,[],'Hosted handoff does not save a browser download');
  elements.find(element=>element.textContent==='Download instead').click();
  assert.deepEqual(downloads,['export.zip'],'A normal download remains available on request');
  elements.find(element=>element.textContent==='Done').click();elements.length=0;
  launch={opened:1,count:2,message:'Use Download instead for the remaining files.'};
  await downloadRecordedExport('/api/instants/id/result',null,()=>{},{method:'GET'});
  assert.equal(downloads.length,1,'Partial native launch does not force a duplicate download');
  elements.find(element=>element.textContent==='Download instead').click();
  assert.equal(downloads.length,2,'Partial native launch offers the bundle as a fallback');
  elements.find(element=>element.textContent==='Done').click();elements.length=0;
  launch=null;
  await downloadRecordedExport('/api/export-history');
  assert.equal(downloads.length,3,'Instant Export off preserves automatic downloads');
  globalThis.fetch=async()=>new Response('{"error":"Export failed"}',{status:422});
  await assert.rejects(downloadRecordedExport('/api/export-history'),/Export failed/);
  assert.equal(downloads.length,3);
  scheduled.filter(Boolean).forEach(callback=>callback());
}finally{Object.assign(globalThis,uiOriginal);}
console.log('Instant Export passed: automatic single/bundle handoff, no duplicate downloads, manual download fallback, opt-in/local-only launch, and normal/history/Quick batch exports.');
