import './setup.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate} from '../public/object-plate-location.js';
const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const handler=name=>{const start=app.indexOf(`function ${name}(`);assert.ok(start>=0);return app.slice(start,app.indexOf('\n}',start)+2);};
const params={design1_name:'Name',layer_height:.2};
let plate={sourceInstanceId:'source',defaultPlateId:'A',name:'Tags',objectDefs:[{id:1}],values:params,objectRecords:{},batchInstances:[]};
const tabs=[{dataset:{section:'DESIGN 1'},classList:{toggle:(name,on)=>tabs[0].red=on}}];
const context={syncObjectPlateLocation,moveObjectToPlate,currentObjectPlate,structuredClone,objectIdentityStore:{},createPersistentId:()=> 'tag-1',ensureBatchPlate:id=>id,activePresetIds:[],parametricPresets:[],activePlate:()=>plate,sectionTabs:{querySelectorAll:()=>tabs},logicalObjectGroupsFor:()=>[{key:'object_1',label:'Name'}]};
runInNewContext(['ensureObjectRecords','updateSectionTabAssignmentState'].map(handler).join('\n'),context);
let [record]=context.ensureObjectRecords(plate);
assert.equal(record.originalPlateId,'A');assert.equal(record.moved_plate,null);
moveObjectToPlate(record,'C');
plate.defaultPlateId='C'; // Empty original physical plate removed by the optimizer.
context.updateSectionTabAssignmentState();
record=plate.objectRecords['group:object_1'];
assert.equal(record.originalPlateId,'A');assert.equal(record.moved_plate,'C');assert.equal(currentObjectPlate(record),'C');
assert.equal(tabs[0].red,true);assert.match(tabs[0].title,/original Plate A.*moved_plate: C/);
assert.equal(tabs[0].dataset.originalPlate,'A');assert.equal(tabs[0].dataset.movedPlate,'C');
plate=JSON.parse(JSON.stringify(plate)); // Workspace save/reopen, with original plate no longer present.
[record]=context.ensureObjectRecords(plate);
moveObjectToPlate(record,'D');context.updateSectionTabAssignmentState();
assert.match(tabs[0].title,/original Plate A.*moved_plate: D/);
record=plate.objectRecords['group:object_1'];
moveObjectToPlate(record,'C'); // Undo a second relocation.
assert.equal(record.originalPlateId,'A');assert.equal(record.moved_plate,'C');
moveObjectToPlate(record,'A');context.updateSectionTabAssignmentState();
assert.equal(record.moved_plate,null);assert.equal(tabs[0].red,false);
assert.deepEqual(record.configuration.parameters,params,'location metadata never changes SCAD parameters');
const legacy={plateId:'B'};syncObjectPlateLocation(legacy,'A');assert.equal(legacy.originalPlateId,'A');assert.equal(legacy.moved_plate,'B');
assert.throws(()=>moveObjectToPlate(legacy,'invalid'),/Invalid destination/);assert.equal(currentObjectPlate(legacy),'B');
console.log('Object location passed: stable origins, moved_plate navigation, red design tabs, save/reopen, repeat moves and undo.');
