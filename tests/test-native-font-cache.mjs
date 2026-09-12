import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createNativeFontIdentity} from '../lib/native-font-cache.mjs';
const root=await fs.mkdtemp(path.join(os.tmpdir(),'native-font-cache-test-'));
try {
  const fonts=path.join(root,'fonts');await fs.mkdir(fonts);
  const config=path.join(root,'fonts.conf'),binary=path.join(root,'openscad'),font=path.join(fonts,'font.ttf');
  await fs.writeFile(config,'font configuration');await fs.writeFile(binary,'version one');await fs.writeFile(font,'font one');
  const args={binary,config,directories:[fonts]},identity=createNativeFontIdentity();
  const original=await identity(args);assert.match(original,/^sha256:[0-9a-f]{64}$/);
  assert.equal(await identity(args),original);
  assert.equal(await createNativeFontIdentity()(args),original,'Stable across restarts');
  await fs.writeFile(font,'font two');const changed=await identity(args);assert.notEqual(changed,original,'Font contents invalidate cached text');
  await fs.writeFile(path.join(fonts,'new.otf'),'new');const added=await identity(args);assert.notEqual(added,changed);
  await fs.rm(path.join(fonts,'new.otf'));assert.equal(await identity(args),changed);
  await fs.writeFile(binary,'version two');const runtime=await identity(args);assert.notEqual(runtime,changed);
  await fs.writeFile(config,'new configuration');assert.notEqual(await identity(args),runtime);
  await fs.rm(fonts,{recursive:true});assert.equal(await identity(args),null,'Missing font directories disable reuse');
  console.log('Native cache identity: content, add/remove, runtime/config changes and restart persistence passed.');
}finally{await fs.rm(root,{recursive:true,force:true});}
