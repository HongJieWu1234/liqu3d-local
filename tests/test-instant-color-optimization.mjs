import './setup.mjs';
import assert from 'node:assert/strict';
import { DOMParser } from '@xmldom/xmldom';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { packCore3mf } from '../public/core-3mf.js';
import { readSolid3mf } from '../public/solid-3mf.js';
import { unzipSync, zipSync, strFromU8, strToU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { analyzeColorLayers, combineColorRuns, estimateSwaps, ColorAnalysisCache, packColorGroups, colorOptimizationSettings } from '../lib/instant-color-optimization.mjs';
import { arrangeObjects, generateInstant } from '../lib/instant-generation.mjs';
import { createDefaultProfile } from '../public/print-settings-schema.js';

const red = '#FF0000', white = '#FFFFFF', blue = '#0000FF';
const parser = xml => new DOMParser().parseFromString(xml, 'application/xml');
const allocated = [];
function fixture(layers, { width = 110, depth = 80 } = {}) {
  const palette = [...new Set(layers.map(layer => layer[2]))];
  const parts = layers.map(([low,high,color],i) => {
    const geometry = new BoxGeometry(width, depth, high-low).translate(0,0,(high+low)/2); allocated.push(geometry);
    return { name:`Part ${i}`, geometry, materialIndex:palette.indexOf(color) };
  });
  return packCore3mf({ palette, objects:[{ name:'Multipart', parts }] });
}
function rewrite(data, edit) { const files=unzipSync(data);files['3D/3dmodel.model']=strToU8(edit(strFromU8(files['3D/3dmodel.model'])));return zipSync(files); }
function read(data) { const solids=readSolid3mf(data,parser,{colorMetadata:true});allocated.push(...solids.map(s=>s.geometry));return solids; }
const analyze = (data, options={}) => analyzeColorLayers(read(data),{layerHeight:1,defaultMaterial:'PLA',...options});
const printer = { width:256, depth:110, excludedAreas:[], nozzleLimitedAreas:[] };
const item = (index,analysis,width=110,depth=80) => ({ index, name:`Object ${index}`, width, depth, colorAnalysis:analysis });
const same = fixture([[0,5,red],[5,10,white]]), reverse = fixture([[0,5,white],[5,10,red]]);
const a=analyze(same),b=analyze(reverse);
assert.equal(a.status,'ready');
assert.deepEqual(a.runs,[{from:1,to:5,colors:[`${red}|PLA`]},{from:6,to:10,colors:[`${white}|PLA`]}]);
assert.equal(a.estimatedSwaps,1);
assert.equal(estimateSwaps(combineColorRuns([a,a])),1,'aligned transitions share one swap');
assert.equal(estimateSwaps(combineColorRuns([a,b])),10,'opposed colours require changes at every layer');
const offset=analyze(fixture([[0,3,red],[3,10,white]]));
assert.ok(estimateSwaps(combineColorRuns([a,offset]))>1,'different transition heights penalize grouping');
const disjoint=analyze(fixture([[0,2,red],[2,4,white],[4,6,red]]));
assert.deepEqual(disjoint.runs.map(r=>[r.from,r.to,r.colors]),[[1,2,[`${red}|PLA`]],[3,4,[`${white}|PLA`]],[5,6,[`${red}|PLA`]]],'disconnected same-colour volumes do not fill their bounding-box gap');
const overlap=analyze(fixture([[0,6,red],[2,4,white]]));
assert.deepEqual(overlap.runs.map(r=>r.colors.length),[1,2,1]);
const unequal=analyze(fixture([[0,0.3,red],[0.3,1.3,white]]),{layerHeight:0.2,firstLayerHeight:0.3});
assert.deepEqual(unequal.runs.map(r=>[r.from,r.to]),[[1,1],[2,6]],'first layer follows embedded print settings');
const raised=analyze(fixture([[20,25,red],[25,30,white]]));assert.deepEqual(raised.runs,a.runs,'each assembly is normalized to the bed');
const transformed=analyze(rewrite(same,xml=>xml.replace(/<item objectid="(\d+)"[^>]*\/>/, '<item objectid="$1" transform="1 0 0 0 1 0 0 0 1 10 20 30"/>')));assert.deepEqual(transformed.runs,a.runs,'build transforms retain relative heights');
const inches=analyze(rewrite(same,xml=>xml.replace('unit="millimeter"','unit="inch"')),{layerHeight:25.4});assert.deepEqual(inches.runs,a.runs);
const missing=rewrite(same,xml=>xml.replace(/\s(?:pid|pindex|p1|p2|p3)="[^"]*"/g,''));
assert.equal(analyze(missing).status,'unavailable','missing colour is not real gray');
const gradient=rewrite(same,xml=>xml.replace(/p2="0"/,'p2="1"'));
assert.equal(analyze(gradient).status,'unavailable');
const invalid=rewrite(same,xml=>xml.replace(/v1="\d+"/,'v1="999999"'));
assert.throws(()=>read(invalid),/triangle/);
const openMesh=rewrite(same,xml=>xml.replace(/<triangle\b[^>]*\/>/,''));
const badPosition=rewrite(same,xml=>xml.replace(/<vertex x="[^"]+"/,'<vertex x="NaN"'));assert.throws(()=>read(badPosition),/vertex/);

const objects=[item(0,a),item(1,b),item(2,a),item(3,b)];
const grouped=packColorGroups(objects,printer,{pack:arrangeObjects,maxFilamentSlots:2});
assert.equal(grouped.plateCount,2);assert.equal(grouped.baselineSwaps,20);assert.equal(grouped.estimatedSwaps,2);
assert.equal(objects[0].placement.plateIndex,objects[2].placement.plateIndex);
assert.notEqual(objects[0].placement.plateIndex,objects[1].placement.plateIndex);
for(const object of objects){assert.ok(object.placement.x>=5);assert.ok(object.placement.x+object.placement.w<=printer.width-5);}
const redOnly=analyze(fixture([[0,10,red]])),whiteOnly=analyze(fixture([[0,10,white]]));
const slots=packColorGroups([item(0,redOnly),item(1,whiteOnly)],printer,{pack:arrangeObjects,maxFilamentSlots:1});assert.equal(slots.plateCount,2);
assert.throws(()=>packColorGroups([item(0,a)],printer,{pack:arrangeObjects,maxFilamentSlots:1}),/needs 2 filament slots/);
const petg=analyze(rewrite(fixture([[0,10,red]]),xml=>xml.replace('<resources>','<metadata name="filament_type">PETG</metadata><resources>')));
assert.deepEqual(petg.materials,['PETG']);
const materialGroups=packColorGroups([item(0,redOnly),item(1,petg)],printer,{pack:arrangeObjects});assert.equal(materialGroups.plateCount,2);assert.equal(materialGroups.baselineFeasible,false);
const missingPetg=analyze(rewrite(missing,xml=>xml.replace('<resources>','<metadata name="filament_type">PETG</metadata><resources>')));
assert.equal(packColorGroups([item(0,analyze(missing)),item(1,missingPetg)],printer,{pack:arrangeObjects}).plateCount,2,'unknown colours still respect available material metadata');
const baseMaterials=analyze(rewrite(same,xml=>xml.replace(/<m:colorgroup[^>]*>.*?<\/m:colorgroup>/,'<basematerials id="1"><base name="PLA red" displaycolor="#FF0000FF"/><base name="PLA white" displaycolor="#FFFFFFFF"/></basematerials>')));
assert.deepEqual(baseMaterials.runs,a.runs,'Core base materials match Materials-extension colours');
const inherited=analyze(rewrite(same,xml=>xml.replace('<components>','<metadata name="material_type">PETG</metadata><components>')));
assert.deepEqual(inherited.materials,['PETG'],'assembly material metadata reaches component meshes');
assert.throws(()=>colorOptimizationSettings({maxFilamentSlots:0}),/whole number/);assert.throws(()=>colorOptimizationSettings({maxFilamentSlots:4.5}),/whole number/);
assert.throws(()=>colorOptimizationSettings(null),/Invalid/);

const cache=new ColorAnalysisCache({maxEntries:3,maxBytes:30000}),solids=read(same);
const start=performance.now();
for(let i=0;i<1000;i++)assert.equal(analyzeColorLayers(solids,{layerHeight:1,defaultMaterial:'PLA',cache,scope:'one'}).status,'ready');
assert.equal(cache.hits,999);assert.equal(cache.misses,1);
analyzeColorLayers(solids,{layerHeight:0.5,cache,scope:'one'});analyzeColorLayers(solids,{layerHeight:1,cache,scope:'two'});
assert.equal(cache.misses,3,'height and account are part of cache identity');
analyzeColorLayers(solids,{layerHeight:0.25,cache,scope:'one'});assert.equal(cache.entries.size,3);assert.ok(cache.bytes<=30000);
cache.clearScope('one');assert.equal(cache.entries.size,1);
const thousand=Array.from({length:1000},(_,i)=>item(i,a,9,9));
const capacityPack=items=>{items.forEach((item,i)=>{item.placement={x:5+(i%5)*14,y:5+(Math.floor(i/5)%5)*14,w:9,h:9,rotation:0,plateIndex:Math.floor(i/25)};});return Math.ceil(items.length/25);};
assert.equal(packColorGroups(thousand,{width:75,depth:75},{pack:capacityPack,maxPlates:100}).plateCount,40);
console.log(`Colour analysis: 1,000 identical models cached and grouped in ${Math.round(performance.now()-start)} ms.`);

// Exercise the real native exporter/packer with different patterns and one bad
// 3MF first. The first surviving model must still become the workspace base.
const profile=createDefaultProfile();profile.settings.layer_height=1;profile.settings.initial_layer_print_height=1;
const template={config:{layer_height:'1',initial_layer_print_height:'1',printable_height:'256',nozzle_diameter:['0.4']},filament:{filament_type:['PLA']},filamentName:'Generic PLA',filamentId:'GFL99',hotendCount:1};
const snapshot={name:'Pattern batch',source:'cube(1);',entry:'model.scad',packageId:'owned-package',group:{key:'model',memberIds:[]},resolved:{objectCount:5,orderCount:5,objects:Array.from({length:5},(_,i)=>({order:i+1,copy:1,values:{pattern:i}}))},printProfile:profile,colorOptimization:{enabled:true,maxFilamentSlots:2}};
const generated=await generateInstant(snapshot,{render:async values=>values.pattern===0?invalid:values.pattern%2?same:reverse,profileTemplate:async()=>template,signal:new AbortController().signal,progress:async()=>{}});
assert.equal(generated.objectCount,4);assert.equal(generated.skippedCount,1);assert.equal(generated.workspace.plates[0].values.pattern,1);assert.equal(generated.workspace.plates[0].batchInstances.length,3);
assert.equal(generated.workspace.plates[0].packageId,'owned-package');
const files=unzipSync(generated.archive),settings=JSON.parse(strFromU8(files['Metadata/project_settings.config']));assert.equal(settings.layer_height,'1');assert.equal(settings.filament_colour.length,2);
const report=JSON.parse(strFromU8(files['Metadata/pmm/color-optimization.json']));assert.equal(report.skipped[0].order,1);assert.equal(report.models.length,4);assert.ok(report.estimatedSwaps<=report.baselineSwaps);
const exported=read(generated.archive);assert.equal(exported.length,8,'four complete two-part objects survive native export');
const fallback=await generateInstant({...snapshot,resolved:{objectCount:2,orderCount:2,objects:snapshot.resolved.objects.slice(1,3)}},{render:async()=>missing,profileTemplate:async()=>template,signal:new AbortController().signal,progress:async()=>{}});
assert.equal(fallback.objectCount,2);assert.equal(fallback.skippedCount,0);assert.equal(fallback.colorOptimization.unoptimized.length,2);assert.equal(fallback.colorOptimization.estimatedSwaps,null);
let topologyRenders=0;
const topology=await generateInstant(snapshot,{render:async values=>{topologyRenders++;return values.pattern===0?openMesh:same;},profileTemplate:async()=>template,signal:new AbortController().signal,progress:async()=>{}});
assert.equal(topology.objectCount,4);assert.equal(topology.skippedCount,1);assert.match(topology.colorOptimization.skipped[0].reason,/closed/);assert.equal(topologyRenders,5,'packing retries do not repeat OpenSCAD rendering');
await assert.rejects(()=>generateInstant(snapshot,{render:async()=>invalid,profileTemplate:async()=>template,signal:new AbortController().signal,progress:async()=>{}}),/Could not create the 3MF/);
// Budget applies to the complete Instant batch, with no candidate renders.
function budgetFixture(pattern) {
  const palette=[red,white,'#00FF00',blue];
  const regions=pattern===0?[[0,18,0,0],[0,18,1,1]]:[[0,6,2,0],[0,6,0,1],[6,18,3,0],[6,18,2,1]];
  const parts=regions.map(([low,high,color,side])=>{
    const geometry=new BoxGeometry(50,80,high-low).translate(side*50,0,(high+low)/2);allocated.push(geometry);
    return {name:'Color',geometry,materialIndex:color};
  });
  return packCore3mf({palette,objects:[{name:'Pattern',parts}]});
}
const budgetSources=[budgetFixture(0),budgetFixture(1)];
const budgetSnapshot={...snapshot,resolved:{objectCount:2,orderCount:2,objects:[0,1].map(pattern=>({order:pattern+1,copy:1,values:{pattern}}))}};
for (const [limit,count] of [[36,2],[48,1],[50,1]]) {
  let renders=0;
  const result=await generateInstant({...budgetSnapshot,colorOptimization:{enabled:true,maxFilamentSlots:4,maxColorChanges:limit}},
    {render:async values=>{renders++;return budgetSources[values.pattern];},profileTemplate:async()=>template,signal:new AbortController().signal,progress:async()=>{}});
  assert.equal(result.plateCount,count);assert.equal(result.colorOptimization.estimatedSwaps,count===2?36:48);
  assert.equal(result.workspace.colorOptimization.maxColorChanges,limit);assert.equal(result.recipe.workflow.colorOptimization.maxColorChanges,limit);
  assert.equal(renders,2,'Merges reuse solids without additional SCAD renders');
}
for (const [limit,render,pattern] of [[0,values=>budgetSources[values.pattern],/No arrangement/],[35,values=>budgetSources[values.pattern],/No arrangement/],[50,()=>missing,/unavailable/],[50,()=>invalid,/every order/],[50,()=>openMesh,/closed/]]) {
  await assert.rejects(()=>generateInstant({...budgetSnapshot,colorOptimization:{enabled:true,maxFilamentSlots:4,maxColorChanges:limit}},
    {render:async values=>render(values),profileTemplate:async()=>template,signal:new AbortController().signal,progress:async()=>{}}),pattern);
}
for(const geometry of allocated)geometry.dispose();
console.log('Instant colour optimization passed: layer patterns, gaps, transforms, heights, slots, materials, bounded cache, malformed-model isolation, packing and native 3MF export.');
