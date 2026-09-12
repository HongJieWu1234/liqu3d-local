import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { zipSync, strToU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { normalizeAssets, quarantineUpload, materializeAssets } from '../lib/instant-assets.mjs';
import { readBoundedZip, uploadLimits } from '../lib/instant-archive.mjs';
import { ContainerRenderer, containerArguments } from '../lib/renderer-containers.mjs';
import { validateRendererOutput } from '../lib/renderer-output.mjs';

const file = (path, text = 'cube(1);') => ({ path, base64: Buffer.from(text).toString('base64') });
const archive = entries => Buffer.from(zipSync(Object.fromEntries(Object.entries(entries).map(([name, value]) => [name, strToU8(value)]))));
const asUpload = bytes => ({ path: 'project.zip', base64: bytes.toString('base64') });
// Replays must resolve saved font bytes without consulting mutable host fonts.
const fontDir=await fs.mkdtemp(path.join(os.tmpdir(),'pmm-frozen-fonts-'));
try {
 const env=await materializeAssets(fontDir,[file('fonts/Baloo.ttf','test font')],{FONTCONFIG_FILE:'/mutable/fonts.conf',OPENSCAD_FONT_PATH:'/mutable/fonts'},{exclusiveFonts:true});
 assert.equal(env.OPENSCAD_FONT_PATH,path.join(fontDir,'fonts'));
 assert.ok(!(await fs.readFile(env.FONTCONFIG_FILE,'utf8')).includes('/mutable'));
} finally {await fs.rm(fontDir,{recursive:true,force:true});}
const good = archive({ 'project/model.scad': 'include <parts/body.scad>\nbody();', 'project/parts/body.scad': 'module body(){cube(1);}', 'project/options.json': '{}' });
assert.equal(normalizeAssets([asUpload(good)], { archives: true }).length, 3);
for (const name of ['../evil.scad', '/evil.scad', 'C:\\evil.scad', 'folder/../evil.scad', 'a\0.scad', 'dir./a.scad']) {
  assert.throws(() => normalizeAssets([file(name)]));
  assert.throws(() => readBoundedZip(archive({ [name]: 'cube(1);' })));
}
for (const files of [[file('model.scad'), file('MODEL.scad')], [file('a.scad'), file('a.scad/model.scad')], [file('é.scad'), file('e\u0301.scad')]]) assert.throws(() => normalizeAssets(files), /Duplicate|Conflicting/);
for (const ext of ['cs', 'csproj', 'exe', 'command', 'sh']) {
  assert.throws(() => normalizeAssets([file(`unsafe.${ext}`)]), /Unsupported/);
  assert.throws(() => normalizeAssets([asUpload(archive({ [`unsafe.${ext}`]: 'unsafe' }))], { archives: true }), /Unsupported/);
}
assert.throws(() => normalizeAssets([{path:'model.scad',base64:'YQ='}]), /Invalid/);
assert.throws(() => normalizeAssets(Array.from({length:201},(_,i)=>file(`${i}.scad`))), /200/);
assert.throws(() => normalizeAssets([file('large.scad','x'.repeat(uploadLimits.file+1))]), /oversized/);
assert.throws(() => readBoundedZip(good, {...uploadLimits, total:8}), /size limit/);
assert.throws(() => readBoundedZip(good.subarray(0,good.length-1)), /Malformed/);
const centralOffset = bytes => bytes.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));
const symlink = archive({'model.scad':'/etc/passwd'}), central = centralOffset(symlink);
symlink.writeUInt16LE(0x0314,central+4);symlink.writeUInt32LE((0xa1ff*65536)>>>0,central+38);
assert.throws(()=>readBoundedZip(symlink),/Malformed/);
const duplicate = archive({'one.scad':'cube(1);','two.scad':'cube(2);'});
for (let i=0;i<duplicate.length-8;i++) if(duplicate.toString('ascii',i,i+8)==='two.scad') duplicate.write('one.scad',i,'ascii');
assert.throws(()=>readBoundedZip(duplicate),/Duplicate/);
const bomb = archive({'model.scad':'a'.repeat(50000)}), bombCentral=centralOffset(bomb);
bomb.writeUInt32LE(1,22);bomb.writeUInt32LE(1,bombCentral+24);
assert.throws(()=>readBoundedZip(bomb),/Malformed/,'actual inflation cannot exceed declared bounds');
const corrupt=archive({'model.scad':'cube(1);'});corrupt[38]^=1;
assert.throws(()=>readBoundedZip(corrupt),/Malformed/);
const encrypted=Buffer.from(good);encrypted.writeUInt16LE(1,6);encrypted.writeUInt16LE(1,centralOffset(encrypted)+8);
assert.throws(()=>readBoundedZip(encrypted),/Malformed/);

const root=await fs.mkdtemp(path.join(os.tmpdir(),'pmm-quarantine-test-'));
try {
  let accepted=0;
  await quarantineUpload({files:[asUpload(good)]},body=>{accepted++;assert.equal(body.files.length,3);},root);
  await assert.rejects(quarantineUpload({files:[asUpload(symlink)]},()=>accepted++,root));
  await assert.rejects(quarantineUpload({files:[file('model.scad')]},()=>{throw new Error('quota');},root),/quota/);
  assert.equal(accepted,1);assert.deepEqual(await fs.readdir(root),[],'success, rejection and quota failures remove quarantine');
} finally {await fs.rm(root,{recursive:true,force:true});}

const image={Id:'sha256:'+'a'.repeat(64),Config:{Labels:{'io.pmm.disposable-worker':'1'}}};
const stl=Buffer.alloc(134);stl.writeUInt32LE(1,80);
const output=JSON.stringify({base64:stl.toString('base64')});
const calls=[];
let reply=output, startHook;
const execute=async(args,options={})=>{
  calls.push({args,options});
  if(args[0]==='image')return Buffer.from(JSON.stringify(image));
  if(args[0]==='ps')return Buffer.from('b'.repeat(12));
  if(args[0]==='start')return startHook?startHook(options):Buffer.from(reply);
  return Buffer.from('');
};
const manager=new ContainerRenderer({execute,maxJobs:1,maxQueued:1,timeout:1000,maxOutput:1024});
assert.equal(manager.cacheIdentity,null);
await manager.initialize();assert.ok(calls.some(({args})=>args[0]==='rm'&&args.at(-1)==='b'.repeat(12)));
assert.equal(manager.cacheIdentity,image.Id);
assert.equal(new ContainerRenderer({image:image.Id,fontVolume:'mutable-fonts'}).cacheIdentity,null);
assert.deepEqual(await manager.run('render',{format:'stl'}),stl);
const create=calls.find(({args})=>args[0]==='create').args;
for(const [key,value] of [['--network','none'],['--user','10000:10000'],['--cap-drop','ALL'],['--pids-limit','128'],['--memory','1g'],['--memory-swap','1g'],['--cpus','1'],['--security-opt','no-new-privileges:true']])assert.equal(create[create.indexOf(key)+1],value);
assert.ok(create.includes('--read-only'));assert.ok(create.includes('--init'));
for(const flag of ['--volume','--mount','--privileged','--env','--env-file','--device','--pid'])assert.ok(!create.includes(flag),flag);
assert.equal(calls.at(-1).args[0],'rm');
await manager.run('render',{format:'stl'});
assert.equal(new Set(calls.filter(({args})=>args[0]==='create').map(({args})=>args[args.indexOf('--name')+1])).size,2,'fresh container per operation');
reply='not json';await assert.rejects(manager.run('render',{format:'stl'}));assert.equal(calls.at(-1).args[0],'rm');
reply=JSON.stringify({base64:Buffer.alloc(1025).toString('base64')});await assert.rejects(manager.run('render',{format:'stl'}),/oversized/);
reply=JSON.stringify({error:'invalid project'});await assert.rejects(manager.run('render'),/invalid project/);
startHook=({signal})=>new Promise((resolve,reject)=>{if(signal.aborted)reject(signal.reason);else signal.addEventListener('abort',()=>reject(signal.reason),{once:true});});
const abort=new AbortController(),cancelled=manager.run('render',{format:'stl'},abort.signal);
const pendingAbort=new AbortController(),pending=manager.run('render',{format:'stl'},pendingAbort.signal);
await assert.rejects(manager.run('render'),/queue is full/);
pendingAbort.abort(new Error('Queued cancellation'));await assert.rejects(pending,/Queued cancellation/);
abort.abort(new Error('Cancelled by test'));
await assert.rejects(cancelled,/Cancelled/);assert.equal(calls.at(-1).args[0],'rm');
await assert.rejects(manager.run('render'),/timed out/);assert.equal(calls.at(-1).args[0],'rm');
const interrupted=manager.run('render');const interruptedCheck=assert.rejects(interrupted,/shutting down/);
await manager.shutdown();await interruptedCheck;assert.equal(manager.active.size,0);
assert.equal(manager.cpuSlots.size,0,'Cancelled, timed out and completed jobs release CPU assignments');
const badImage=new ContainerRenderer({execute:async()=>Buffer.from(JSON.stringify({...image,Config:{...image.Config,Volumes:{'/host':{}}}}))});
await assert.rejects(badImage.initialize(),/approved/);
const cleanupFailure=new ContainerRenderer({execute:async(args)=>{if(args[0]==='rm')throw new Error('daemon unavailable');if(args[0]==='start')return Buffer.from(output);return Buffer.from('');}});
await assert.rejects(cleanupFailure.run('render',{format:'stl'}),/cleanup failed/);assert.equal(cleanupFailure.closing,true);
const malicious=archive({'[Content_Types].xml':'<Types/>','3D/3dmodel.model':'<!DOCTYPE model><model/>'});
assert.throws(()=>validateRendererOutput(malicious,'3mf'),/declarations/);
assert.throws(()=>validateRendererOutput(Buffer.from('fake'),'stl'),/invalid/i);
assert.throws(()=>validateRendererOutput(Buffer.alloc(0),'3mf'),/Invalid/);
assert.equal(validateRendererOutput(Buffer.alloc(0),'3mf',{allowEmpty:true}).length,0);
console.log('Instant security passed: quarantine, ZIP limits/metadata, traversal, symlinks, duplicates, output validation, container constraints, recovery, cancellation, timeout and cleanup.');
