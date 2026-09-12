import './setup.mjs';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { BoxGeometry, Matrix4 } from '../public/vendor/three/three.module.js';
import { strFromU8, unzipSync, zipSync } from '../public/vendor/three/addons/libs/fflate.module.js';
import { PLATE_IDS, MAX_PLATES, isValidPlateId, plateIdAt, plateIndex, comparePlateIds } from '../public/plate-ids.js';
import { plateShortcutAction } from '../public/workflow-store.js';
import { syncObjectPlateLocation, moveObjectToPlate, currentObjectPlate } from '../public/object-plate-location.js';
import { BAMBU_MAX_PLATES, packBambuPlateArchive, packBambuMultiPlate3mf, packCore3mf, packZip } from '../public/core-3mf.js';
import { archiveFingerprint, createExportHistory, validateRecipe } from '../lib/export-history.mjs';
import { createDefaultProfile } from '../public/print-settings-schema.js';

assert.equal(MAX_PLATES, 286);
assert.equal(new Set(PLATE_IDS).size, MAX_PLATES);
assert.deepEqual([0,25,26,51,52,285].map(plateIdAt), ['A','Z','A0','Z0','A1','Z9']);
for (const [index,id] of PLATE_IDS.entries()) { assert.ok(isValidPlateId(id)); assert.equal(plateIndex(id),index); }
for (const id of ['AA','A10','a1','0A','A-1','1','']) assert.equal(isValidPlateId(id),false);
assert.throws(() => plateIdAt(MAX_PLATES), /286 plates/);
assert.deepEqual(['A1','Z','Z0','A0','A'].sort(comparePlateIds),['A','Z','A0','Z0','A1']);
assert.deepEqual(plateShortcutAction('a1',true),{type:'move-selection',plateId:'A1'});
assert.equal(plateShortcutAction('A1',false),null);
const record = syncObjectPlateLocation({plateId:'Z'},'Z');
moveObjectToPlate(record,'A0');
const restored=JSON.parse(JSON.stringify(record));
assert.equal(currentObjectPlate(restored),'A0');assert.equal(restored.originalPlateId,'Z');
moveObjectToPlate(restored,'Z9');assert.equal(restored.moved_plate,'Z9');
moveObjectToPlate(restored,'Z');assert.equal(restored.moved_plate,null);

const template={config:{layer_height:'0.2',nozzle_diameter:['0.4'],enable_prime_tower:'1'},filament:{filament_type:['PLA']},filamentName:'Generic PLA',filamentId:'GFL99'};
const tower={version:1,estimated:true,x:75,y:175,w:45,h:25,bodyX:80,bodyY:180,width:35,depth:15,brim:2,colorCount:2,settings:{prime_tower_width:35}};
const cube=new BoxGeometry(10,10,2).translate(20,20,1);
const plates=PLATE_IDS.slice(0,37).map((id,index)=>({id,name:`Plate ${id}`,objects:[{name:`Object ${index}`,parts:[{name:'Solid',geometry:cube,materialIndex:0}]}],...(index===0||index===36?{primeTower:tower}:{})}));
const options={title:'Production',palette:['#00AE42'],bambuTemplate:template,plates,bedSize:{width:256,depth:256},attachments:{'workflow.json':JSON.stringify({plateOrder:plates.map(p=>p.id),objects:plates.map(p=>({plateId:p.id})),plateCount:37,objectCount:37})}};
assert.equal(BAMBU_MAX_PLATES,36);
const towerOnly=unzipSync(packBambuPlateArchive({...options,plates:plates.slice(0,1),attachments:null}).archive);
assert.match(strFromU8(towerOnly['[Content_Types].xml']),/Extension="json" ContentType="application\/json"/);
assert.equal(JSON.parse(strFromU8(towerOnly['Metadata/project_settings.config'])).prime_tower_width,'35');
const frozenSettings={enable_prime_tower:false,prime_tower_width:44,filament_prime_volume:[51],filament_change_length:[8,12],filament_diameter:[1.75]};
const frozen=unzipSync(packBambuPlateArchive({...options,plates:plates.slice(1,2),primeTowerSettings:frozenSettings}).archive);
const frozenConfig=JSON.parse(strFromU8(frozen['Metadata/project_settings.config']));
assert.equal(frozenConfig.enable_prime_tower,'0');assert.equal(frozenConfig.prime_tower_width,'44');
assert.deepEqual(frozenConfig.filament_prime_volume,['51']);assert.deepEqual(frozenConfig.filament_change_length,['8,12']);assert.deepEqual(frozenConfig.filament_diameter,['1.75']);
assert.throws(()=>packBambuMultiPlate3mf(options),/36 plates/);
assert.equal(packBambuPlateArchive({...options,plates:plates.slice(0,36)}).extension,'3mf');
const bundle=packBambuPlateArchive(options);
assert.equal(bundle.extension,'zip');assert.equal(bundle.mimeType,'application/zip');assert.equal(bundle.projectCount,2);
const outer=unzipSync(bundle.archive),manifest=JSON.parse(strFromU8(outer['plates.json']));
assert.deepEqual(manifest.projects.map(project=>project.plateIds.length),[36,1]);
assert.deepEqual(manifest.projects.flatMap(project=>project.plateIds),plates.map(plate=>plate.id));
let count=0;
for (const [index,project] of manifest.projects.entries()) {
  const files=unzipSync(outer[project.filename]),settings=strFromU8(files['Metadata/model_settings.config']);
  const config=JSON.parse(strFromU8(files['Metadata/project_settings.config']));
  const workflow=JSON.parse(strFromU8(files['Metadata/pmm/workflow.json']));
  assert.equal((settings.match(/<plate>/g)||[]).length,project.plateIds.length);
  assert.equal((settings.match(/<model_instance>/g)||[]).length,project.objectCount);
  assert.deepEqual(workflow.plateOrder,project.plateIds);assert.equal(workflow.objectCount,project.objectCount);
  assert.equal(config.wipe_tower_x.length,project.plateIds.length);assert.equal(config.wipe_tower_x[0],'80');assert.equal(config.wipe_tower_y[0],'180');
  assert.ok(files['Metadata/pmm/prime-towers.json']);
  if(index===1) {
    const model=strFromU8(files['3D/3dmodel.model']);
    assert.match(settings,/value="Plate K0"/);
    assert.ok(Math.max(...[...model.matchAll(/<vertex x="([^"]+)"/g)].map(match=>Number(match[1])))<256,'New project starts at its own first plate');
  }
  count+=project.objectCount;
}
assert.equal(count,37);
const rezip={...outer};
for(const project of manifest.projects) rezip[project.filename]=zipSync(unzipSync(outer[project.filename]),{mtime:new Date('2001-01-01T00:00:00Z')});
assert.equal(archiveFingerprint(bundle.archive),archiveFingerprint(packZip(rezip)),'Nested ZIP timestamps do not cause replay drift');
const changed=unzipSync(rezip[manifest.projects[0].filename]);changed['3D/3dmodel.model']=new TextEncoder().encode(strFromU8(changed['3D/3dmodel.model'])+' ');
rezip[manifest.projects[0].filename]=zipSync(changed);
assert.notEqual(archiveFingerprint(bundle.archive),archiveFingerprint(packZip(rezip)),'Nested geometry changes remain detectable');

const profile=createDefaultProfile(),db=new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys=ON;CREATE TABLE users(id INTEGER PRIMARY KEY);INSERT INTO users VALUES(1)');
const sourceBytes=packCore3mf({palette:['#00AE42'],objects:[{name:'Cube',parts:[{geometry:cube,materialIndex:0}]}]});
let renders=0;
const history=createExportHistory(db,{sanitizeProfile:p=>p,profileTemplate:async()=>template,runtime:async()=> 'test',enforceStorage(){},freezeDependencies:async()=>[],render:async()=>{renders++;return sourceBytes;}});
const recipe={version:1,title:'Production',profile,sources:[{source:'cube(10);',sourceName:'model.scad'}],requests:[{source:0,values:{},format:'3mf'}],objects:plates.map(plate=>({id:plate.id,name:plate.name,plateId:plate.id,settings:{},contributions:[{request:0,matrix:new Matrix4().toArray()}]})),plateNames:Object.fromEntries(plates.map(plate=>[plate.id,plate.name])),primeTowers:[{plateId:'A',...tower},{plateId:'K0',...tower}],workflow:{plateOrder:plates.map(plate=>plate.id)}};
const normalized=validateRecipe({...recipe,objects:[...recipe.objects].reverse()});
assert.deepEqual(Object.keys(normalized.plateNames),plates.map(plate=>plate.id));
const exported=await history.perform(1,recipe);
assert.match(exported.filename,/37-plates\.zip$/);assert.equal(exported.mimeType,'application/zip');assert.equal(exported.summary.projectCount,2);
const replay=await history.perform(1,null,{id:exported.summary.id});
assert.equal(replay.filename,exported.filename);assert.equal(replay.fingerprint,exported.fingerprint);assert.equal(renders,2,'Each replay resolves one deduplicated render request');
const bad=structuredClone(recipe);bad.primeTowers[0].bodyX=null;assert.throws(()=>validateRecipe(bad),/prime tower/);
db.close();cube.dispose();
console.log('Extended plates passed: 286 IDs, assignment, location, native capacity, split metadata/towers, nested replay fingerprints and history ZIP downloads.');
