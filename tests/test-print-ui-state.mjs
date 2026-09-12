import './setup.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import * as THREE from '../public/vendor/three/three.module.js';
const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const handler=name=>{const start=app.indexOf(`function ${name}(`);assert.ok(start>=0);return app.slice(start,app.indexOf('\n}',start)+2);};
const rect={minX:-50,maxX:-30,minZ:-50,maxZ:50};
const box=(x,z)=>new THREE.Box3(new THREE.Vector3(x,0,z),new THREE.Vector3(x+4,4,z+4));
const sources=[{defaultPlateId:'A',objectRecords:{a:{plateId:'A'},b:{plateId:'B'},c:{plateId:'C'},e:{plateId:'E'}},meshes:[['a',box(0,0)],['b',box(-45,0)],['c',box(40,40)],['e',box(60,0)]].map(([key,bounds])=>({userData:{selectionKey:key},bounds}))}];
const refs=Object.fromEntries(['A','B','C','D','E'].map(id=>[id,{children:['surface','grid','border','keepout-surface','nozzle-limit-surface'].map(role=>({userData:{plateRole:role},material:new THREE.MeshBasicMaterial()}))}]));
const state={requestRender(){},THREE,plates:sources,batchPlateReferences:refs,activeViewPlateId:'B',renderAppearance:{accent:'#00ff00',light:false},activePrinter:()=>({width:100,depth:100,label:'Test'}),excludedRectsForPrinter:()=>[{minX:35,maxX:50,minZ:35,maxZ:50}],nozzleLimitedRectsForPrinter:()=>[rect],objectBoxesForMeshes:meshes=>meshes.map(m=>m.bounds),plateBadge:{dataset:{},classList:{toggle:()=>{}}}};
runInNewContext(['plateUiColor','boxIntersectsRect','updatePlateFitStatus','addPlateAreaOverlay','plateGridPoints'].map(handler).join('\n'),state);
state.updatePlateFitStatus();
const color=(id,role)=>refs[id].children.find(c=>c.userData.plateRole===role).material.color.getHex();
assert.equal(color('B','border'),0xffcc48,'yellow overrides the accent on the assigned physical plate');
assert.equal(color('C','border'),0xff6666,'red marks blocked objects from a shared source');
assert.equal(color('E','border'),0xff6666,'out-of-bounds applies to the actual plate');
assert.notEqual(color('A','border'),0xff6666,'the original source plate is not falsely marked');
assert.match(state.plateBadge.textContent,/nozzle reach/);
state.activeViewPlateId='C';state.updatePlateFitStatus();assert.equal(color('C','border'),0xff6666);
const overlay=new THREE.Group();
for(const role of ['keepout','nozzle-limit'])state.addPlateAreaOverlay(overlay,rect,'source','A',{role,surface:0x98352c,border:0xff725f,hatch:0xff8b78,opacity:role==='keepout'?.72:.42});
const red=overlay.children.find(c=>c.userData.plateRole==='keepout-surface'),yellow=overlay.children.find(c=>c.userData.plateRole==='nozzle-limit-surface');
assert.ok(red.renderOrder>yellow.renderOrder && yellow.renderOrder>0,'red/yellow render over accent grid, with red first in priority');
assert.equal(red.material.opacity,.72);assert.equal(yellow.material.opacity,.42);assert.equal(red.material.depthTest,true,'objects remain visible above the zone');

const settings={layer_height:.2,filament_type:'PLA',nozzle_temperature:220};
const record={printOverrides:{}};
const ui={printSettingsScope:'global',printProfile:{settings,advanced:{layer_height:.16}},advancedJson:{value:'{"layer_height":0.16}'},PRINT_SETTING_ITEM_BY_KEY:new Map([['layer_height',{key:'layer_height',scope:'process',type:'number'}],['filament_type',{key:'filament_type',scope:'filament',type:'select'}],['nozzle_temperature',{key:'nozzle_temperature',scope:'filament',type:'number'}]]),activeObjectPrintRecord:()=>record,normalizedAdvanced:()=>JSON.parse(ui.advancedJson.value||'{}'),structuredClone,persistUploadedPlates:()=>{},persistWorkflowState:()=>{},preparedExport:{},updatePrintModifiedHighlights:()=>{},bambuFilamentSummary:{},nozzleDiameterSelect:{value:'.4'},layerHeightBounds:()=>({min:.08,max:.28}),setStatus:()=>{}};
runInNewContext(['printValueFromInput','samePrintValue','handlePrintSettingEdit'].map(handler).join('\n'),ui);
ui.handlePrintSettingEdit({type:'input',target:{name:'layer_height',value:'.28'}});
assert.equal(settings.layer_height,.28);assert.equal(ui.advancedJson.value,'','stale advanced override cannot overwrite the latest control edit');assert.equal(ui.preparedExport,null);
ui.printSettingsScope='object';ui.handlePrintSettingEdit({type:'input',target:{name:'layer_height',value:'.16'}});
assert.equal(record.printOverrides.layer_height,.16);assert.equal(settings.layer_height,.28,'object and global settings stay distinct');
ui.handlePrintSettingEdit({type:'input',target:{name:'nozzle_temperature',value:'231'}});
assert.equal(settings.nozzle_temperature,231);assert.equal(record.printOverrides.nozzle_temperature,undefined,'filament remains global from either process mode');
let towerRefreshes=0,towerRedraws=0;
const towerToggle={};ui.document={querySelector:()=>towerToggle};
ui.refreshWorkspacePrimeTowers=()=>{towerRefreshes++;return '';};
ui.buildPlateReference=()=>{towerRedraws++;};
ui.PRINT_SETTING_ITEM_BY_KEY.set('enable_prime_tower',{key:'enable_prime_tower',scope:'process',type:'boolean',globalOnly:true});
ui.printSettingsScope='global';
for(const checked of [false,true])ui.handlePrintSettingEdit({type:'change',target:{name:'enable_prime_tower',checked}});
assert.equal(towerRefreshes,2);assert.equal(towerRedraws,2,'Prime tower toggles update the viewer immediately');
ui.printSettingsScope='object';ui.handlePrintSettingEdit({type:'change',target:{name:'enable_prime_tower',checked:false}});
assert.equal(settings.enable_prime_tower,false);assert.equal(record.printOverrides.enable_prime_tower,undefined,'Tower control remains global with an object selected');
assert.equal(towerToggle.checked,false);
console.log('Print UI passed: physical plate warnings, zone priority, live settings, advanced precedence and object/global separation.');

const zones=[rect,{minX:-40,maxX:-20,minZ:-10,maxZ:10},{minX:30,maxX:50,minZ:20,maxZ:50}];
const grid=state.plateGridPoints(100,100,zones);
assert.equal(state.plateGridPoints(100,100,[]).length,44,'normal grid stays intact without zones');
assert.ok(grid.length>0);
for(let i=0;i<grid.length;i+=2) {
  const a=grid[i],b=grid[i+1],vertical=a.x===b.x;
  for(const zone of zones) {
    const cross=vertical?a.x:a.z;
    if(cross<(vertical?zone.minX:zone.minZ) || cross>(vertical?zone.maxX:zone.maxZ))continue;
    const overlap=Math.min(vertical?b.z:b.x,vertical?zone.maxZ:zone.maxX)-Math.max(vertical?a.z:a.x,vertical?zone.minZ:zone.minX);
    assert.ok(overlap<=0,'no grid geometry lies inside either warning zone, including overlapping zones');
  }
}
assert.equal(state.plateGridPoints(100,100,[{minX:-50,maxX:50,minZ:-50,maxZ:50}]).length,0);
console.log('Grid clipping passed: both axes, zone boundaries, overlapping areas and unchanged printable-area grid.');
