import './setup.mjs';
import assert from 'node:assert/strict';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { packBambuMultiPlate3mf, packCore3mf } from '../public/core-3mf.js';
import { strFromU8, unzipSync } from '../public/vendor/three/addons/libs/fflate.module.js';
import { DOMParser } from '@xmldom/xmldom';

const template = {
  config: { printer_settings_id: 'Bambu Lab P1S 0.4 nozzle', print_settings_id: '0.20mm Standard @BBL P1P', nozzle_diameter: ['0.4'], extruder_variant_list: ['Direct Drive Standard'], layer_height: '0.2', enable_prime_tower: '1' },
  filament: { filament_type: ['PLA'], filament_flow_ratio: ['0.98'], nozzle_temperature: ['220'], nozzle_temperature_initial_layer: ['220'], textured_plate_temp: ['65'], textured_plate_temp_initial_layer: ['65'] },
  filamentName: 'Generic PLA @BBL P1P', filamentId: 'GFL99', hotendCount: 1, nozzleDiameters: [0.4]
};

const object = (name, x, materialIndex = 0) => ({ name, parts: [{ name: `${name} body`, materialIndex, geometry: new BoxGeometry(20, 10, 2).translate(x, 0, 1) }] });
const extras = { 'workflow.json': JSON.stringify({ version: 1, plateOrder: ['A','B'] }), 'print-profile.json': JSON.stringify({ version: 5 }) };
const bytes = packBambuMultiPlate3mf({ title: 'Two plate production test', application: 'Liqu3D', palette: ['#FF0000','#0000FF'], bambuTemplate: template, attachments: extras, bedSize: { width: 256, depth: 256 }, plates: [
  { id: 'A', name: 'Names', objects: [object('Alice', 10, 0)] },
  { id: 'B', name: 'Bases', objects: [object('Base', 20, 1)] }
] });

assert.equal(bytes[0], 0x50); assert.equal(bytes[1], 0x4b, '3MF must be an OPC ZIP archive');
const files = unzipSync(bytes);
for (const required of ['[Content_Types].xml','_rels/.rels','3D/3dmodel.model','Metadata/project_settings.config','Metadata/model_settings.config','Metadata/pmm/workflow.json','Metadata/pmm/print-profile.json']) assert.ok(files[required], `Missing ${required}`);

const contentTypes = strFromU8(files['[Content_Types].xml']);
const rels = strFromU8(files['_rels/.rels']);
const model = strFromU8(files['3D/3dmodel.model']);
const settings = strFromU8(files['Metadata/model_settings.config']);
const project = JSON.parse(strFromU8(files['Metadata/project_settings.config']));
assert.match(contentTypes, /3dmanufacturing-3dmodel\+xml/);
assert.match(rels, /Target="\/3D\/3dmodel\.model"/);
assert.match(model, /BambuStudio:3mfVersion/);
for (const [name, xml] of [['[Content_Types].xml', contentTypes], ['_rels/.rels', rels], ['3D/3dmodel.model', model], ['Metadata/model_settings.config', settings]]) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  assert.equal(doc.getElementsByTagName('parsererror').length, 0, `${name} must be well-formed XML`);
  assert.ok(doc.documentElement, `${name} must have a document element`);
}
const relDoc = new DOMParser().parseFromString(rels, 'application/xml');
for (const rel of [...relDoc.getElementsByTagName('Relationship')]) {
  const target = rel.getAttribute('Target')?.replace(/^\//, '');
  assert.ok(target && files[target], `OPC relationship target ${target} must exist in the archive`);
}
assert.equal((settings.match(/<plate>/g) || []).length, 2, 'Native project needs two plate metadata nodes');
assert.match(settings, /key="plater_id" value="1"/); assert.match(settings, /key="plater_id" value="2"/);
assert.match(settings, /key="plater_name" value="Names"/); assert.match(settings, /key="plater_name" value="Bases"/);
assert.equal((settings.match(/<model_instance>/g) || []).length, 2);
assert.deepEqual(project.filament_colour, ['#FF0000','#0000FF']);
assert.equal(project.filament_settings_id.length, 2);

const resourceIds = new Set([...model.matchAll(/<object id="(\d+)"/g)].map((match) => match[1]));
const buildIds = [...model.matchAll(/<item objectid="(\d+)"/g)].map((match) => match[1]);
assert.equal(buildIds.length, 2);
assert.ok(buildIds.every((id) => resourceIds.has(id)), 'Every build item must reference a resource object');
const instanceIds = [...settings.matchAll(/key="object_id" value="(\d+)"/g)].map((match) => match[1]);
assert.equal(instanceIds.length, buildIds.length, 'Each build object must occur in exactly one Bambu plate instance');
assert.deepEqual(new Set(instanceIds), new Set(buildIds), 'Every build object must belong to exactly one Bambu plate');
const componentIds = [...model.matchAll(/<component objectid="(\d+)"/g)].map((match) => match[1]);
assert.ok(componentIds.length >= 2);
assert.ok(componentIds.every((id) => resourceIds.has(id)), 'Every component must reference an existing 3MF resource object');
// Bambu Studio assigns objects to PartPlate cells from their world-space
// bounds. For two 256 mm plates, plate B occupies the next 307.2 mm grid cell.
const meshVertexGroups = [...model.matchAll(/<object id="(\d+)"[^>]*>\s*<mesh><vertices>([\s\S]*?)<\/vertices>/g)].map((match) => ({
  id: match[1],
  xs: [...match[2].matchAll(/<vertex x="([^"]+)"/g)].map((entry) => Number(entry[1]))
}));
assert.ok(meshVertexGroups.length >= 2);
const firstMeshMinX = Math.min(...meshVertexGroups[0].xs);
const secondMeshMinX = Math.min(...meshVertexGroups[1].xs);
assert.ok(secondMeshMinX - firstMeshMinX > 250, 'Second plate geometry must occupy the next Bambu PartPlate grid cell');

for (const meshMatch of model.matchAll(/<object id="\d+"[^>]*>\s*<mesh>([\s\S]*?)<\/mesh>\s*<\/object>/g)) {
  const mesh = meshMatch[1];
  const vertexCount = (mesh.match(/<vertex\b/g) || []).length;
  assert.ok(vertexCount >= 4);
  for (const tri of mesh.matchAll(/<triangle[^>]*v1="(\d+)"[^>]*v2="(\d+)"[^>]*v3="(\d+)"[^>]*>/g)) {
    for (const value of tri.slice(1)) assert.ok(Number(value) >= 0 && Number(value) < vertexCount, `Triangle index ${value} exceeds ${vertexCount} vertices`);
  }
}

// Single-plate packing remains valid and attachments are retained.
const single = packCore3mf({ title:'Single', palette:['#FFFFFF'], bambuTemplate:template, objects:[object('One',0,0)], attachments:{'README.txt':'metadata'} });
const singleFiles = unzipSync(single);
assert.equal(strFromU8(singleFiles['Metadata/pmm/README.txt']), 'metadata');
assert.equal((strFromU8(singleFiles['Metadata/model_settings.config']).match(/<plate>/g)||[]).length, 1);
console.log('3MF structure tests passed: OPC package, triangle references, Bambu project settings, and native two-plate metadata are internally consistent.');
