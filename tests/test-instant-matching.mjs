import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { parseScadParameters } from '../lib/parser.mjs';
import { parseOrders, resolveOrders, selectOrderModel, parametersForModel } from '../lib/instant-orders.mjs';
import { createInstantStore } from '../lib/instant-store.mjs';
import { createDefaultProfile } from '../public/print-settings-schema.js';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { packCore3mf } from '../public/core-3mf.js';

const parameters=parseScadParameters('shadow_layer_color="Red";\nbase_layer_color="Black";\nsize=10;\nname_text="Default";');
for (const header of ['shadow_layer_color','SHADOW-LAYER-COLOR','Color layer shadow']) {
  const result=resolveOrders(parseOrders(`${header}: Red`),parameters);
  assert.equal(result.mapping[header],'shadow_layer_color');assert.deepEqual(result.errors,[]);
}
let result=resolveOrders(parseOrders('Shadow background layer: Red'),parameters);
assert.equal(result.mapping['Shadow background layer'],'shadow_layer_color');assert.equal(result.matches['Shadow background layer'].method,'words');
result=resolveOrders(parseOrders('Layer color: Red'),parameters);
assert.deepEqual(result.unresolved,['Layer color']);assert.equal(result.matches['Layer color'].method,'ambiguous');
assert.equal(result.matches['Layer color'].candidates[0].wordCount,2);
assert.deepEqual(resolveOrders(parseOrders('Unrelated: X'),parameters).unresolved,['Unrelated']);
result=resolveOrders(parseOrders('shadow_layer_color: Black'),parameters,{'Shadow Layer Color':'base_layer_color'});
assert.equal(result.mapping.shadow_layer_color,'base_layer_color','saved corrections survive normalized header changes');
assert.equal(result.matches.shadow_layer_color.method,'manual');
assert.ok(resolveOrders(parseOrders('size: 5\nTotal size: 8'),parameters).errors.some(message=>message.includes('More than one')));
assert.ok(resolveOrders(parseOrders('Large size: enormous'),parameters).errors.some(message=>message.includes('Order 1')));

const catalog=parseScadParameters('design1_name_text="One";\ndesign1_size=10;\ndesign2_name_text="Two";\ndesign2_size=20;\nshared_color="Red";');
const groups=[{key:'one',label:'One',memberIds:[1]},{key:'two',label:'Two',memberIds:[2]}];
assert.equal(selectOrderModel(parseOrders('Name: Alex'),catalog,groups).key,'one');
assert.equal(selectOrderModel(parseOrders('Design2 Name Text: Alex'),catalog,groups).key,'two');
assert.equal(selectOrderModel(parseOrders('Name: Alex'),catalog,groups,{Name:'design2_name_text'}).key,'two');
assert.equal(selectOrderModel(parseOrders('Design2 Name Text: Alex'),catalog,groups,{},'manual','one').key,'one');
assert.equal(selectOrderModel(parseOrders('Name: Alex'),catalog,groups,{},'manual','removed'),null);
assert.deepEqual(parametersForModel(catalog,{memberIds:[]}),catalog,'complete-model SCAD exposes all parsed parameters');
assert.ok(!parametersForModel(catalog,groups[0]).some(param=>param.name==='design2_size'));
assert.ok(parametersForModel(catalog,groups[0]).some(param=>param.name==='shared_color'));
const special=parseScadParameters('design1_star_height=2;\ndesign2_circle_radius=3;');
assert.equal(selectOrderModel(parseOrders('Large circle radius: 10'),special,groups).key,'two');

const db=new DatabaseSync(':memory:');db.exec("PRAGMA foreign_keys=ON;CREATE TABLE users(id INTEGER PRIMARY KEY);INSERT INTO users VALUES(1);CREATE TABLE workspaces(id TEXT PRIMARY KEY,user_id INTEGER REFERENCES users(id),name TEXT,kind TEXT,pinned INTEGER NOT NULL DEFAULT 0,expires_at INTEGER,preview_status TEXT,updated_at INTEGER,data_json TEXT DEFAULT '{}');CREATE TABLE workspace_revisions(user_id INTEGER,data_json TEXT);INSERT INTO workspaces(id,user_id,name) VALUES('test',1,'Auto matching');");
const renderCalls=[];
const options={enforceStorage(){},activeProfile:createDefaultProfile,sanitizeProfile:value=>value,
 modelInfo:()=>({parameters:catalog,objects:[{id:1,label:'One',mergeKey:'one'},{id:2,label:'Two',mergeKey:'two'}]}),
 profileTemplate:async()=>({config:{layer_height:'0.28'},filament:{filament_type:['PLA']},filamentName:'Generic PLA',filamentId:'GFL99',hotendCount:1,nozzleDiameters:[0.4]}),
 render:async(values,format,extra)=>{renderCalls.push({values,objectId:extra.objectId});const geometry=new BoxGeometry(values[`design${extra.objectId}_size`],10,2);try{return packCore3mf({objects:[{name:'Part',parts:[{name:'Part',geometry,materialIndex:0}]}],palette:['#FF0000']});}finally{geometry.dispose();}},saveWorkspace(){}};
let store=createInstantStore(db,options);store.create(1,'test');
const source=catalog.map(param=>`${param.name}=${JSON.stringify(param.default)};`).join('\n');
store.save(1,'test',{ordersText:'Name: Alex'});
store.files(1,'test',{files:[{path:'model.scad',base64:Buffer.from(source).toString('base64')}]});
async function finish(){for(let i=0;i<200;i++){const state=store.get(1,'test');if(!['queued','running'].includes(state.current?.status))return state;await new Promise(resolve=>setTimeout(resolve,5));}throw new Error('Timeout');}
async function generate(){store.retry(1,'test');return finish();}
let state=await generate();assert.equal(state.current.status,'ready',state.current.error);assert.equal(state.validation.model.key,'one');assert.equal(renderCalls.at(-1).objectId,1);
store.save(1,'test',{ordersText:'design2_name_text: Bea'});state=await generate();assert.equal(state.validation.model.key,'two');assert.equal(renderCalls.at(-1).objectId,2);
store.save(1,'test',{ordersText:'Display caption: Bea'});state=store.get(1,'test');assert.equal(state.validation.ready,false);
store.save(1,'test',{mappingPatch:{'Display caption':'design2_name_text'}});state=await generate();assert.equal(state.current.status,'ready');assert.equal(state.validation.model.key,'two');
const snapshot=JSON.parse(db.prepare('SELECT snapshot_json FROM instant_runs WHERE id=?').get(state.current.id).snapshot_json);
assert.equal(snapshot.resolution.version,2);assert.equal(snapshot.resolution.model,'two');assert.equal(snapshot.resolution.mapping['Display caption'],'design2_name_text');
store.save(1,'test',{mappingPatch:{'Other unused header':'@ignore'}});await generate();
store.save(1,'test',{ordersText:'display_caption: Cara'});state=await generate();assert.equal(state.validation.mapping.display_caption,'design2_name_text');assert.equal(renderCalls.at(-1).values.design2_name_text,'Cara');
const fingerprint=db.prepare('SELECT fingerprint FROM instant_setups').get().fingerprint;
store.save(1,'test',{groupKey:'one',modelSelection:'manual',mapping:{'display_caption':'design1_name_text'}});state=await generate();assert.equal(state.validation.model.key,'one');assert.notEqual(db.prepare('SELECT fingerprint FROM instant_setups').get().fingerprint,fingerprint);
// Existing saved selections and completed runs survive the update without regeneration.
const row=db.prepare('SELECT * FROM instant_setups').get(),config=JSON.parse(row.config_json);delete config.modelSelection;
db.prepare('UPDATE instant_setups SET config_json=?').run(JSON.stringify(config));
await store.shutdown();store=createInstantStore(db,options);store.recover();
state=store.get(1,'test');assert.equal(state.validation.model.selection,'manual');assert.equal(state.validation.model.key,'one');
store.save(1,'test',{});assert.equal(store.get(1,'test').current.id,row.current_run);assert.equal(store.get(1,'test').canConvert,true);
await store.shutdown();db.close();

const fixture=process.env.PMM_INSTANT_FIXTURE_DIR;
if(fixture){
 const params=parseScadParameters(fs.readFileSync(`${fixture}/GENERATION/fridge_tag_template.scad`,'utf8'));
 const designs=[1,2,3,4].map(id=>({key:`design_${id}`,label:`Design ${id}`,memberIds:[id]}));
 const parsed=parseOrders(fs.readFileSync(`${fixture}/Orders.txt`,'utf8'));
 const group=selectOrderModel(parsed,params,designs);assert.equal(group.key,'design_1');
 const batch=resolveOrders(parsed,parametersForModel(params,group));assert.deepEqual(batch.unresolved,[]);assert.deepEqual(batch.errors,[]);assert.equal(batch.objectCount,16);
}
console.log('Instant matching passed: ranked words, ties, manual corrections, model inference, scoped settings, explicit generation, snapshots, legacy selections.');
