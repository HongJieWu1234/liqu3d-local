import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomBytes } from 'node:crypto';
import { unzipSync, strFromU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { MAX_PLATES } from '../public/plate-ids.js';

const execute=promisify(execFile),retention=24*60*60*1000,prefix='liqu3d-bambu-';
const loopback=host=>['localhost','127.0.0.1','::1','[::1]','::ffff:127.0.0.1'].includes(String(host).toLowerCase());

// Native launch is only for the same computer, never a hosted/proxied visitor.
export function localBambuRequest(req) {
  try {if(!loopback(req.socket?.remoteAddress)||!loopback(new URL(`http://${req.headers.host}`).hostname))return false;}catch{return false;}
  if(['forwarded','x-forwarded-for','x-forwarded-host','cf-connecting-ip'].some(key=>req.headers[key]))return false;
  if(req.headers['sec-fetch-site']&&!['same-origin','none'].includes(req.headers['sec-fetch-site']))return false;
  try {if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return false;}catch{return false;}
  return true;
}

export async function findBambuStudio({platform=process.platform,env=process.env,home=os.homedir(),access=fs.access}={}) {
  const candidates=[];
  if(platform==='darwin')for(const root of ['/Applications',path.join(home,'Applications')])
    for(const name of ['BambuStudio.app','Bambu Studio.app'])candidates.push(path.join(root,name));
  else if(platform==='win32')for(const root of [env.ProgramFiles,env['ProgramFiles(x86)'],env.LOCALAPPDATA&&path.join(env.LOCALAPPDATA,'Programs')].filter(Boolean))
    candidates.push(path.join(root,'Bambu Studio','bambu-studio.exe'));
  else if(platform==='linux')for(const root of String(env.PATH||'').split(path.delimiter).filter(Boolean))
    for(const name of ['bambu-studio','bambustudio'])candidates.push(path.join(root,name));
  for(const candidate of candidates)try {
    await access(platform==='darwin'?path.join(candidate,'Contents/MacOS/BambuStudio'):candidate,constants.X_OK);
    return {platform,application:candidate};
  }catch{}
  return null;
}

export function bambuExportFiles(result) {
  if(result.extension==='3mf')return [{name:path.basename(result.filename||'export.3mf'),bytes:result.archive}];
  if(result.extension!=='zip')throw new Error('Expected a 3MF export.');
  // Only unpack our generated manifest and its 3MF projects, never arbitrary paths.
  const entries=unzipSync(new Uint8Array(result.archive),{filter:entry=>entry.name==='plates.json'||entry.name.toLowerCase().endsWith('.3mf')});
  const projects=entries['plates.json']&&JSON.parse(strFromU8(entries['plates.json'])).projects;
  if(!Array.isArray(projects)||!projects.length||projects.length>MAX_PLATES)throw new Error('Invalid 3MF bundle.');
  const seen=new Set();
  return projects.map(({filename})=>{
    if(typeof filename!=='string'||!filename.toLowerCase().endsWith('.3mf')||/[\\/\0]/.test(filename)||!entries[filename]||seen.has(filename))throw new Error('Invalid 3MF project.');
    seen.add(filename);return {name:filename,bytes:entries[filename]};
  });
}

// Short-lived capabilities let the user's Studio download its exact export
// without receiving account cookies. Nothing is persisted to the database.
export function createBambuHandoffStore({ttl=10*60*1000,maxBytes=512*1024*1024,now=Date.now}={}) {
  const entries=new Map();let size=0;
  const remove=token=>{const entry=entries.get(token);if(entry){size-=entry.bytes.length;entries.delete(token);}};
  const prune=()=>{for(const [token,entry] of entries)if(entry.expires<=now())remove(token);};
  return {
    create(result,owner) {
      prune();const projects=bambuExportFiles(result),bytes=projects.reduce((sum,file)=>sum+file.bytes.length,0);
      if(size+bytes>maxBytes)throw new Error('Automatic opening is busy. Open the downloaded 3MF files in Bambu Studio.');
      const tokens=[],files=projects.map(file=>{
        const token=randomBytes(32).toString('base64url');tokens.push(token);
        entries.set(token,{...file,owner,expires:now()+ttl});size+=file.bytes.length;
        return {name:file.name,path:`/api/bambu-handoff/${token}/${encodeURIComponent(file.name)}`};
      });
      setTimeout(()=>tokens.forEach(remove),ttl).unref();return files;
    },
    get(token,name) {prune();const entry=entries.get(token);return entry?.name===name?entry:null;}
  };
}

async function launchBambuProject(studio,file) {
  // Start one Studio process per project so bundles retain separate settings.
  // Do not pass --no-single-instance: released Studio versions reject it.
  if(studio.platform==='darwin') {
    await execute('/usr/bin/open',['-n','-a',studio.application,'--args',file],{timeout:15000});
  } else await new Promise((resolve,reject)=>{
    const child=spawn(studio.application,[file],{detached:true,stdio:'ignore'});
    child.once('error',reject);child.once('spawn',()=>{child.unref();resolve();});
  });
}

async function removeExpiredBambuFiles(root) {
  for(const entry of await fs.readdir(root,{withFileTypes:true}))if(entry.isDirectory()&&entry.name.startsWith(prefix)) {
    const directory=path.join(root,entry.name);
    try {if(Date.now()-(await fs.stat(directory)).mtimeMs>retention)await fs.rm(directory,{recursive:true,force:true});}catch{}
  }
}

export async function openExportInBambu(result,{enabled=false,allowLocal=false,request,createHandoff}={},
  {findStudio=findBambuStudio,launch=launchBambuProject,tempRoot=os.tmpdir()}={}) {
  if(!enabled||request?.headers?.['x-instant-export']!=='1')return null;
  let directory,opened=0,count=0;
  try {
    if(!allowLocal||!localBambuRequest(request)) {
      if(!createHandoff)return {opened:0,message:'Instant Export is unavailable here. Use Download instead to open the export yourself.'};
      const files=createHandoff(result);
      return {opened:0,count:files.length,files,message:`Requesting Bambu Studio for ${files.length} 3MF${files.length===1?'':'s'}. Allow any prompts to continue.`};
    }
    const studio=await findStudio();
    if(!studio)return {opened:0,message:'Bambu Studio was not found. Use Download instead to open the export yourself.'};
    const projects=bambuExportFiles(result);count=projects.length;
    await removeExpiredBambuFiles(tempRoot);
    directory=await fs.mkdtemp(path.join(tempRoot,prefix));
    await fs.chmod(directory,0o700);
    const files=[];
    for(const [index,project] of projects.entries()) {
      const file=path.join(directory,`${String(index+1).padStart(2,'0')}-${project.name}`);
      await fs.writeFile(file,project.bytes,{mode:0o600,flag:'wx'});files.push(file);
    }
    // Keep inputs long enough for a cold Studio launch; no 3MF bytes enter history.
    setTimeout(()=>void fs.rm(directory,{recursive:true,force:true}).catch(()=>{}),retention).unref();
    for(const file of files){await launch(studio,file);opened++;}
    return {opened,count,message:`Sent ${opened} 3MF${opened===1?'':'s'} to Bambu Studio.`};
  } catch {
    if(directory&&!opened)await fs.rm(directory,{recursive:true,force:true}).catch(()=>{});
    return {opened,count,message:opened?`Sent ${opened} of ${count} 3MFs to Bambu Studio. Use Download instead for the remaining files.`:'Bambu Studio could not be opened. Use Download instead to open the export yourself.'};
  }
}
