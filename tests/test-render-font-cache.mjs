import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-font-cache-test-'));
const identityA = 'sha256:'+'a'.repeat(64), identityB = 'sha256:'+'b'.repeat(64);
let identity = identityA, responseIdentity, calls = 0, errors = '', child, lastBody;
const renderer = http.createServer(async (req,res) => {
  if (req.url === '/healthz') return res.end(JSON.stringify({ready:true,manifoldBackend:true,version:'test',renderSlots:1,renderCacheIdentity:identity}));
  const chunks=[];for await (const chunk of req) chunks.push(chunk);
  lastBody=JSON.parse(Buffer.concat(chunks).toString());
  calls++;
  const bytes=Buffer.alloc(134);bytes.writeUInt32LE(1,80);bytes.writeFloatLE(calls,96);
  const actual = responseIdentity === undefined ? identity : responseIdentity;
  if (actual) res.setHeader('X-Render-Identity',actual);
  res.end(bytes);
});
await new Promise(resolve => renderer.listen(0,'127.0.0.1',resolve));
const probe=http.createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const base=`http://127.0.0.1:${port}`;
const start = async () => {
  child=spawn(process.execPath,['server.mjs'],{env:{PATH:process.env.PATH,HOME:process.env.HOME,PMM_INTERNAL_BIND:'1',HOST:'127.0.0.1',PORT:String(port),PMM_DATA_DIR:directory,PMM_RENDERER_URL:`http://127.0.0.1:${renderer.address().port}`},stdio:['ignore','ignore','pipe']});
  child.stderr.on('data',chunk=>{errors+=chunk;});
  for(let i=0;i<100;i++){try{if((await fetch(base+'/healthz')).ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,50));}
  throw new Error(errors);
};
const stop = async () => {if(child && child.exitCode===null){const ended=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await ended;}};
try {
  await start();
  const db=new DatabaseSync(path.join(directory,'accounts.sqlite')), now=Date.now(), cookies=[];
  for(let id=1;id<=2;id++){
    const token=randomBytes(32).toString('base64url');
    db.prepare('INSERT INTO users(id,email,password_salt,password_hash,email_verified_at,generation_defaults_version,created_at) VALUES(?,?,?,?,?,?,?)').run(id,`cache-${id}@example.test`,'unused','unused',now,2,now);
    db.prepare('INSERT INTO sessions(token_hash,user_id,created_at,last_active_at,user_agent,ip_address,location,expires_at) VALUES(?,?,?,?,?,?,?,?)').run(createHash('sha256').update(token).digest('hex'),id,now,now,'test','127.0.0.1','Local',now+3600000);
    cookies.push(`pmm_session=${token}`);
  }
  db.close();
  const render = async (patch={},owner=0,preview=true) => {
    const response=await fetch(base+`/api/export?format=stl${preview?'&preview=1':''}`,{method:'POST',headers:{Cookie:cookies[owner],'Content-Type':'application/json'},body:JSON.stringify({source:'label="Cache"; linear_extrude(2) text(label);',sourceName:'tag.scad',values:{label:'Cache'},...patch})});
    assert.equal(response.status,200,await response.clone().text());
    return Buffer.from(await response.arrayBuffer());
  };
  const first=await render();assert.equal(calls,1);
  assert.deepEqual(await render(),first);assert.equal(calls,1,'Identical text uses the memory cache');
  await render({},1);assert.equal(calls,2,'Accounts cannot reuse each other’s cache');
  await render({values:{label:'Changed'}});assert.equal(calls,3);
  await render({},0,false);assert.equal(calls,4,'Preview results cannot satisfy full exports');
  await stop();await start();
  assert.deepEqual(await render(),first);assert.equal(calls,4,'Immutable text geometry survives app restart');
  identity=identityB;
  const changedImage=await render();assert.equal(calls,5,'Detect a new renderer image without restarting the app');
  assert.deepEqual(await render(),changedImage);assert.equal(calls,5);
  identity=null;
  await render();await render();assert.equal(calls,7,'A live font volume or older manager disables text caching');
  identity=identityA;responseIdentity=identityB;
  await render({values:{label:'Restart race'}});await render({values:{label:'Restart race'}});
  assert.equal(calls,9,'Do not cache output when the image changes between health and rendering');
  responseIdentity=undefined;
  await render({source:'include <mutable.scad> linear_extrude(2) text("A");'});
  await render({source:'include <mutable.scad> linear_extrude(2) text("A");'});
  assert.equal(calls,11,'An immutable font set cannot make live external sources cacheable');
  for(const [fn,preview,expected] of [[96,true,'$fn=24'],[96,false,null],[12,true,null],[0,true,null]]){
    await render({source:`$fn=${fn}; sphere(10);`},0,preview);
    assert.equal(lastBody.definitions.find(value=>value.startsWith('$fn=')) || null,expected,'Only higher-detail previews receive the facet cap');
  }
  console.log('Font render cache passed: repeat reuse, restart, image changes, mutable fonts, ownership, changed values, full export separation and restart races.');
} finally {
  await stop();renderer.closeAllConnections();await new Promise(resolve=>renderer.close(resolve));
  await fs.rm(directory,{recursive:true,force:true});
}
