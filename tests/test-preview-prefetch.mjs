import './setup.mjs';
import assert from 'node:assert/strict';
import { PreviewPrefetch } from '../public/preview-prefetch.js';
import { objectRenderTargets } from '../public/object-render-state.js';

const source={source:'cube(size);',parameters:[{name:'size',type:'vector'}],values:{size:[10,20,30]}};
const saved=objectRenderTargets(source)[0],typed=objectRenderTargets(source,{size:'[10,20,30]'})[0];
assert.equal(saved.signature,typed.signature,'Opening saved vector controls preserves prefetched render identity');
assert.deepEqual(saved.values.size,[10,20,30],'Original values remain untouched');
assert.notEqual(saved.signature,objectRenderTargets(source,{size:'[10,20,31]'})[0].signature);
const untyped={...source,parameters:[]};
assert.notEqual(objectRenderTargets(untyped)[0].signature,objectRenderTargets(untyped,{size:'[10,20,30]'})[0].signature,'Only declared vectors receive equivalent identities');

const tick = async () => { for (let i=0;i<12;i++) await Promise.resolve(); };
function fixture(concurrency=3) {
  const started=[], pending=new Map();let active=0,peak=0;
  const batches=['A','B','C'].map(key=>({key,signature:key+'-original',jobs:[0,1].map(index=>({
    key:key+index,run:signal=>new Promise((resolve,reject)=>{
      const id=key+index;started.push(id);active++;peak=Math.max(peak,active);
      pending.set(id,{signal,finish(error){pending.delete(id);active--;if(error)reject(error);else resolve(id+'-geometry');}});
    })
  }))}));
  const prefetch=new PreviewPrefetch(batches,concurrency);
  return {prefetch,started,pending,get peak(){return peak;},get active(){return active;}};
}

const first=fixture();await tick();
assert.deepEqual(first.started,['A0','A1','B0'],'The next plate fills an unused render slot');
const a=await first.prefetch.read('A','A-original');
first.pending.get('A0').finish();await tick();
assert.equal(await a.get('A0'),'A0-geometry');
assert.deepEqual(first.started,['A0','A1','B0','B1'],'Next plate starts while the current plate still renders');
first.pending.get('B0').finish();first.pending.get('B1').finish();await tick();
assert.ok(!first.started.includes('C0'),'Do not buffer more than one future plate');
first.pending.get('A1').finish();await Promise.all(a.values());
await first.prefetch.release('A');await tick();
assert.equal(first.prefetch.batches[0].jobs.length,0,'Consumed response buffers are released');
assert.deepEqual(first.started,['A0','A1','B0','B1','C0','C1']);
const b=await first.prefetch.read('B','B-original');
assert.deepEqual(await Promise.all(b.values()),['B0-geometry','B1-geometry']);
await first.prefetch.release('B');
for(const job of [...first.pending.values()])job.finish();
const c=await first.prefetch.read('C','C-original');await Promise.all(c.values());await first.prefetch.release('C');
await first.prefetch.close();assert.equal(first.peak,3);assert.equal(first.active,0);

// Input changes cancel and drain every old request before falling back to fresh work.
const stale=fixture();await tick();let returned=false;
const read=stale.prefetch.read('A','A-edited').then(value=>{returned=true;return value;});
await tick();assert.equal(returned,false,'Cancellation is awaited');
assert.ok([...stale.pending.values()].every(job=>job.signal.aborted));
for(const job of [...stale.pending.values()])job.finish();
assert.equal(await read,null);assert.equal(stale.active,0);assert.equal(stale.started.length,3);
assert.equal(await stale.prefetch.read('B','B-original'),null,'Later plates use the normal path after cancellation');

// One invalid object must not strand the next plate or leave active work behind.
const failed=fixture();await tick();const bad=await failed.prefetch.read('A','A-original');
failed.pending.get('A0').finish(new Error('Invalid SCAD'));
await assert.rejects(bad.get('A0'),/Invalid SCAD/);
let released=false;const releasing=failed.prefetch.release('A').then(()=>{released=true;});await tick();
assert.equal(released,false);assert.equal(failed.pending.get('A1').signal.aborted,true);
assert.equal(failed.pending.get('B0').signal.aborted,false,'Other plates retain their work');
failed.pending.get('A1').finish();await releasing;await tick();
const closing=failed.prefetch.close();await tick();
for(const job of [...failed.pending.values()]){assert.equal(job.signal.aborted,true);job.finish();}
await closing;assert.equal(failed.active,0);assert.ok(failed.peak<=3);
assert.equal(failed.prefetch.batches.every(batch=>batch.jobs.length===0),true);
console.log('Preview pipeline passed: overlap, shared capacity, one-plate lookahead, independent results, buffer release, stale inputs, cancellation drain and failure cleanup.');
