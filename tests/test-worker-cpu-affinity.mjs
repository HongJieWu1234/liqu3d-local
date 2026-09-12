import './setup.mjs';
import assert from 'node:assert/strict';
import { workerCpuList } from '../lib/worker-cpu-affinity.mjs';
import { ContainerRenderer } from '../lib/renderer-containers.mjs';

assert.deepEqual([0,1,2,3].map(slot => workerCpuList('0-7', 1, slot)), ['0','1','2','3']);
assert.equal(workerCpuList('4-5,8-11', 2, 1), '8,9', 'Use only CPUs permitted by the parent container');
assert.equal(workerCpuList('0,2', 1, 3), '2', 'Explicit oversubscription wraps within allowed CPUs');
assert.equal(workerCpuList('3-4', .5, 0), '3', 'Fractional quotas still use one CPU');
assert.equal(workerCpuList('3-4', 8, 1), '3,4');
for (const [allowed,count,slot] of [['',1,0],['8-4',1,0],['0-7',0,0],['0-7',1,-1],['0-7',1,8],['0-999999',1,0]]) assert.equal(workerCpuList(allowed,count,slot),null);

const stl = Buffer.alloc(134); stl.writeUInt32LE(1,80);
const output = Buffer.from(JSON.stringify({base64:stl.toString('base64')}));
const slots = [], pending = new Map();
const manager = new ContainerRenderer({maxJobs:2, execute:async (args) => {
  if (args[0] === 'create') slots.push(args.slice(-2));
  if (args[0] === 'start') return new Promise(resolve => pending.set(args.at(-1), resolve));
  return Buffer.alloc(0);
}});
const tick = () => new Promise(resolve => setImmediate(resolve));
try {
  const first = manager.run('render'), second = manager.run('render'), third = manager.run('render');
  await tick();
  assert.deepEqual(slots,[['0','1'],['1','1']]);
  const [firstName, secondName] = [...pending.keys()];
  pending.get(secondName)(output); await second; await tick();
  assert.deepEqual(slots[2],['1','1'],'Reuse the freed slot while the long first render retains its CPU');
  const thirdName = [...pending.keys()].at(-1);
  pending.get(firstName)(output); pending.get(thirdName)(output);
  await Promise.all([first, third]);
  assert.equal(manager.cpuSlots.size,0);
} finally { await manager.shutdown(); }
console.log('Worker CPU affinity passed: permitted CPU ranges, fractional limits, parallel assignment and slot reuse.');
