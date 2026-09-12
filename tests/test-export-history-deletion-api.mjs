import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const directory=await fs.mkdtemp(path.join(os.tmpdir(),'pmm-history-delete-'));
const port=await new Promise(resolve=>{const socket=net.createServer();socket.listen(0,'127.0.0.1',()=>{const port=socket.address().port;socket.close(()=>resolve(port));});});
const child=spawn(process.execPath,['server.mjs'],{env:{PATH:process.env.PATH,HOME:process.env.HOME,PMM_INTERNAL_BIND:'1',HOST:'127.0.0.1',PORT:String(port),PMM_DATA_DIR:directory},stdio:['ignore','ignore','pipe']});
let output='',db;child.stderr.on('data',chunk=>output+=chunk);
const tokens=[randomBytes(32).toString('base64url'),randomBytes(32).toString('base64url')];
const request=(url,method='GET',user=1,body={})=>fetch(`http://127.0.0.1:${port}${url}`,{method,headers:{'Content-Type':'application/json',...(user?{Cookie:`pmm_session=${tokens[user-1]}`}:{})},...(method==='POST'?{body:JSON.stringify(body)}:{})});
try {
  for(let i=0;i<100;i++){
    try{if((await request('/healthz')).ok)break;}catch{}
    if(i===99)throw new Error(output);
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  db=new DatabaseSync(path.join(directory,'accounts.sqlite'));
  const now=Date.now(),snapshotIds=[randomUUID(),randomUUID()],ids=[randomUUID(),randomUUID(),randomUUID()];
  for(const user of [1,2]){
    db.prepare('INSERT INTO users(id,email,display_name,password_salt,password_hash,password_version,email_verified_at,two_factor_enabled,settings_json,generation_defaults_version,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(user,`history-delete-${user}@example.test`,'History test','salt','hash',3,now,0,'{}',1,now);
    db.prepare('INSERT INTO sessions(token_hash,user_id,created_at,last_active_at,user_agent,ip_address,location,expires_at) VALUES(?,?,?,?,?,?,?,?)').run(createHash('sha256').update(tokens[user-1]).digest('hex'),user,now,now,'test','127.0.0.1','Local',now+3600000);
    db.prepare('INSERT INTO export_snapshots VALUES(?,?,?,?,?,?,?,?)').run(snapshotIds[user-1],user,'{}',Buffer.from('preview'),JSON.stringify({title:`Export ${user}`}),`fingerprint-${user}`,`recipe-${user}`,now);
  }
  for(const [id,user] of [[ids[0],1],[ids[1],1],[ids[2],2]])db.prepare('INSERT INTO export_history VALUES(?,?,?,?)').run(id,user,snapshotIds[user-1],now);
  const endpoint=`/api/export-history/${ids[0]}`;
  assert.equal((await request(endpoint,'DELETE',0)).status,401);
  assert.equal((await request(endpoint,'DELETE',2)).status,404);
  let response=await request(endpoint,'DELETE');assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{id:ids[0],deleted:true});
  assert.equal((await request(endpoint,'DELETE')).status,404);
  assert.equal((await request(`${endpoint}/preview`)).status,404);
  assert.equal((await request(`${endpoint}/again`,'POST')).status,404);
  assert.deepEqual((await (await request('/api/export-history')).json()).exports.map(item=>item.id),[ids[1]]);
  assert.equal((await request(`/api/export-history/${ids[1]}/preview`)).status,200,'The shared snapshot remains accessible');
  assert.equal((await request(`/api/export-history/${ids[1]}`,'DELETE')).status,200);
  assert.equal(db.prepare('SELECT count(*) AS count FROM export_snapshots WHERE user_id=1').get().count,0);
  assert.equal((await (await request('/api/export-history')).json()).exports.length,0);
  assert.deepEqual((await (await request('/api/export-history','GET',2)).json()).exports.map(item=>item.id),[ids[2]]);
  assert.equal((await request(`/api/export-history/${ids[2]}/preview`,'GET',2)).status,200);
  const reportIds=Array.from({length:35},()=>randomUUID()),reportSnapshot=randomUUID();
  db.prepare('INSERT INTO export_snapshots VALUES(?,?,?,?,?,?,?,?)').run(reportSnapshot,1,'{}',Buffer.from('preview'),JSON.stringify({title:'Report example',plateIds:['A'],estimate:{version:2,totalGrams:3,wasteGrams:1}}),'report','report',now);
  for(const [index,id] of reportIds.entries())db.prepare('INSERT INTO export_history VALUES(?,?,?,?)').run(id,1,reportSnapshot,now+index);
  const filter={from:now,to:now+35};
  const listed=await (await request(`/api/export-history?from=${now}&to=${now+35}`)).json();
  assert.equal(listed.exports.length,30);assert.equal(listed.stats.count,35);
  assert.equal((await request('/api/export-history/report','POST',0,filter)).status,401);
  const csv=await request('/api/export-history/report','POST',1,filter);
  assert.equal(csv.status,200);assert.match(csv.headers.get('Content-Type'),/text\/csv/);assert.equal((await csv.text()).trim().split('\r\n').length,36);
  assert.equal((await request('/api/export-history/report','POST',1,{from:now+1,to:now})).status,400);
  assert.equal((await request('/api/export-history/delete','POST',1,{ids:[reportIds[0],ids[2]]})).status,404);
  assert.equal((await request('/api/export-history/delete','POST',1,{})).status,400);
  const deleted=await request('/api/export-history/delete','POST',1,{ids:reportIds.slice(0,2)});
  assert.equal(deleted.status,200);assert.deepEqual(await deleted.json(),{deleted:2});
  assert.equal((await (await request('/api/export-history')).json()).stats.count,33);
  assert.equal((await request(`/api/export-history/${reportIds[2]}/preview`)).status,200);
  console.log('History report/bulk API passed: authenticated date filters, complete CSV beyond one page, validation, atomic ownership checks and selected deletion.');
  console.log('Export deletion API passed: authentication, ownership, shared snapshots, repeat deletion, empty history and account isolation.');
} finally {
  db?.close();
  if(child.exitCode===null){const ended=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await ended;}
  await fs.rm(directory,{recursive:true,force:true});
}
