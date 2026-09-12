import './setup.mjs';
// Requires a real Docker daemon and the worker image built by Compose.
import assert from 'node:assert/strict';
import { DOMParser } from '@xmldom/xmldom';
import { readSolid3mf } from '../public/solid-3mf.js';
import { randomUUID } from 'node:crypto';
import { ContainerRenderer, containerArguments } from '../lib/renderer-containers.mjs';
import { workerCpuList } from '../lib/worker-cpu-affinity.mjs';

const manager = new ContainerRenderer({ scope: `test-${randomUUID()}`, fontVolume: '' });
await manager.initialize();
const name = `pmm-test-${randomUUID()}`;
try {
  const args = containerArguments(name, manager.config);
  args.splice(args.indexOf('--signal=KILL'), Infinity, '--signal=KILL', '10s', '/usr/local/bin/node', '--input-type=module', '-e', `
    import fs from 'node:fs/promises';
    import net from 'node:net';
    import { configureWorkerCpuAffinity } from '/runtime/lib/worker-cpu-affinity.mjs';
    const initialStatus = await fs.readFile('/proc/self/status','utf8');
    const affinity = await configureWorkerCpuAffinity(1,1);
    const writable = async file => { try { await fs.writeFile(file,'probe'); return true; } catch { return false; } };
    const exists = async file => { try { await fs.access(file); return true; } catch { return false; } };
    const reachable = await new Promise(resolve => {
      const socket = net.connect({host:'1.1.1.1',port:443});
      const finish = value => {socket.destroy();resolve(value);};
      socket.setTimeout(1000,()=>finish(false));socket.once('error',()=>finish(false));socket.once('connect',()=>finish(true));
    });
    console.log(JSON.stringify({uid:process.getuid(),initialStatus,affinity,status:await fs.readFile('/proc/self/status','utf8'),
      runtimeCapabilities:JSON.parse(await fs.readFile('/runtime/renderer-capabilities.json','utf8')).ready,
      job:await writable('/job/probe'),tmp:await writable('/tmp/probe'),runtime:await writable('/runtime/probe'),
      socket:await exists('/var/run/docker.sock'),app:await exists('/app/server.mjs'),reachable,
      secrets:Object.keys(process.env).filter(key=>/TOKEN|PASSWORD|SECRET|API_KEY|DATABASE/.test(key))}));
  `);
  await manager.execute(args);
  const inspection = JSON.parse((await manager.execute(['inspect', '--format', '{{json .HostConfig}}', name])).toString());
  assert.equal(inspection.NetworkMode, 'none');assert.equal(inspection.ReadonlyRootfs, true);
  assert.equal(inspection.PidsLimit, 128);assert.equal(inspection.Memory, 1024 ** 3);assert.equal(inspection.NanoCpus, 1_000_000_000);
  assert.deepEqual(inspection.CapDrop,['ALL']);assert.ok(inspection.SecurityOpt.includes('no-new-privileges:true'));
  const probe = JSON.parse((await manager.execute(['start','--attach',name])).toString());
  assert.equal(probe.affinity,true);
  const allowed=status=>status.match(/^Cpus_allowed_list:\s*(.+)$/m)[1].trim();
  assert.equal(allowed(probe.status),workerCpuList(allowed(probe.initialStatus),1,1));
  assert.equal(probe.runtimeCapabilities,true);assert.equal(probe.uid,10000);assert.equal(probe.job,true);assert.equal(probe.tmp,true);
  for (const field of ['runtime','socket','app','reachable']) assert.equal(probe[field],false,field);
  assert.match(probe.status,/CapEff:\s+0+\n/);assert.match(probe.status,/NoNewPrivs:\s+1/);assert.deepEqual(probe.secrets,[]);
  const health = await manager.run('health');assert.equal(health.ready,true,health.error);
  const rendered = await manager.run('render',{source:'cube(2);',format:'3mf',definitions:[]});assert.ok(rendered.length>100);
  const colored=await manager.run('render',{source:'color("red") cube([10,10,2]); color("blue") translate([2,2,2]) cube([6,6,2]);',format:'3mf',enableLazyUnion:true,definitions:[]});
  const solids=readSolid3mf(colored,text=>new DOMParser().parseFromString(text,'application/xml'));
  assert.deepEqual(new Set(solids.flatMap(s=>s.colors)),new Set(['#FF0000','#0000FF']),'The worker must preserve colors even for older clients requesting lazy-union');
  solids.forEach(s=>s.geometry.dispose());
  console.log('Real Docker isolation passed: UID, capabilities, filesystem, no network/secrets/socket, resource limits, Manifold rendering and cleanup.');
} finally {
  await manager.execute(['rm','--force',name]);
  await manager.shutdown();
}
