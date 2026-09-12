import './setup.mjs';
import { recipeForExport } from '../public/export-recipe.js';
import { effectiveObjectValues } from '../public/object-render-state.js';
import { estimateSummary } from '../public/export-history-ui.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { DOMParser } from '@xmldom/xmldom';
import * as THREE from '../public/vendor/three/three.module.js';
import { geometryForPrint, placeObjectsOnBed } from '../public/export-geometry.js';
import { readSolid3mf } from '../public/solid-3mf.js';
import { packCore3mf, packZip, utf8 } from '../public/core-3mf.js';
import { unzipSync, strFromU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { supportsSolidParts } from '../lib/solid-parts.mjs';

const parse = (xml) => new DOMParser().parseFromString(xml, 'application/xml');
const rounded = (values) => values.map((value) => Math.round(value * 1e6) / 1e6 || 0);
const source = new THREE.BoxGeometry(30, 20, 3).translate(0, 0, 1.5);
const mesh = new THREE.Mesh(source);
mesh.rotation.x = -Math.PI / 2;
mesh.position.set(910, 0, 385);
const originalPositions = source.attributes.position.array.slice();
const geometry = geometryForPrint(source, mesh, { x: 900, z: 400 }, { width: 256, depth: 256 });
geometry.computeBoundingBox();
assert.deepEqual(rounded(geometry.boundingBox.min.toArray()), [123, 133, 0]);
assert.deepEqual(rounded(geometry.boundingBox.max.toArray()), [153, 153, 3]);
assert.deepEqual(source.attributes.position.array, originalPositions, 'Export cannot mutate the visible model');
const raised = geometry.clone().translate(0, 0, 10);
const top = geometry.clone().translate(0, 0, 13);
placeObjectsOnBed([{ parts: [{ geometry: raised }, { geometry: top }] }]);
raised.computeBoundingBox(); top.computeBoundingBox();
assert.equal(raised.boundingBox.min.z, 0);
assert.equal(top.boundingBox.min.z, 3, 'Colour layers keep their relative heights');
const materialIndices = Uint32Array.from({ length: 12 }, (_, index) => index % 2);
const model = { title: 'Orientation & solid test', palette: ['#FF0000', '#00FF00'], objects: [{ name: 'Asymmetric part', parts: [{ name: 'Closed box', geometry, materialIndex: 0, materialIndices }] }] };
const packed = packCore3mf(model);
const xml = strFromU8(unzipSync(packed)['3D/3dmodel.model']);
assert.equal([...xml.matchAll(/<vertex /g)].length, 8, 'STL/display seams must be welded');
assert.equal([...xml.matchAll(/<triangle /g)].length, 12);
assert.match(xml, /pid="1" p1="1"/);
assert.match(xml, /xmlns:m="http:\/\/schemas.microsoft.com\/3dmanufacturing\/material\/2015\/02" requiredextensions="m"/);
assert.match(xml, /<m:colorgroup id="1"><m:color color="#FF0000FF"\/><m:color color="#00FF00FF"\/><\/m:colorgroup>/);
assert.doesNotMatch(xml, /basematerials/, 'Bambu ignores Core displaycolor hints; export actual colour groups');
for (const triangle of Array.from(parse(xml).getElementsByTagName('triangle'))) {
  assert.equal(triangle.getAttribute('pid'), '1');
  assert.equal(triangle.getAttribute('p1'), triangle.getAttribute('p2'));
  assert.equal(triangle.getAttribute('p1'), triangle.getAttribute('p3'));
}
const withPart = (part) => ({ ...model, objects: [{ parts: [{ geometry, ...part }] }] });
assert.throws(() => packCore3mf(withPart({ materialIndex: 2 })), /colour index/);
assert.throws(() => packCore3mf(withPart({ materialIndex: -1 })), /colour index/);
assert.throws(() => packCore3mf(withPart({ materialIndices: new Uint32Array(11) })), /colours do not match/);
assert.throws(() => packCore3mf(withPart({ materialIndices: new Uint32Array(12).fill(2) })), /colour index/);
const roundtrip = readSolid3mf(packed, parse);
assert.equal(roundtrip.length, 1, 'Face colours cannot split a closed solid');
assert.deepEqual(new Set(roundtrip[0].colors), new Set(['#FF0000', '#00FF00']));
const legacyXml = xml.replace(' requiredextensions="m"', '').replace(/<m:colorgroup[^>]*>.*?<\/m:colorgroup>/, '<basematerials id="1"><base name="Red" displaycolor="#FF0000FF"/><base name="Green" displaycolor="#00FF00FF"/></basematerials>');
assert.deepEqual(new Set(readSolid3mf(packZip({ '3D/3dmodel.model': utf8(legacyXml) }), parse)[0].colors), new Set(['#FF0000', '#00FF00']), 'Native OpenSCAD base materials still import');
const alternatePrefix = xml.replaceAll('xmlns:m=', 'xmlns:color=').replaceAll('m:', 'color:').replace('requiredextensions="m"', 'requiredextensions="color"');
assert.deepEqual(new Set(readSolid3mf(packZip({ '3D/3dmodel.model': utf8(alternatePrefix) }), parse)[0].colors), new Set(['#FF0000', '#00FF00']));
assert.throws(() => readSolid3mf(packZip({ '3D/3dmodel.model': utf8(xml.replace('p1="0"', 'p1="99"')) }), parse), /invalid colour reference/);
roundtrip[0].geometry.computeBoundingBox();
assert.deepEqual(roundtrip[0].geometry.boundingBox.min.toArray(), [123, 133, 0]);
assert.deepEqual(roundtrip[0].geometry.boundingBox.max.toArray(), [153, 153, 3]);
const open = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 10, 0, 0, 0, 10, 0], 3));
assert.throws(() => packCore3mf({ ...model, objects: [{ parts: [{ geometry: open }] }] }), /not a closed/);
const mirrored = new THREE.Mesh(source); mirrored.rotation.x = -Math.PI / 2; mirrored.scale.x = -1;
const mirroredGeometry = geometryForPrint(source, mirrored, { x: 0, z: 0 }, { width: 256, depth: 256 });
assert.doesNotThrow(() => packCore3mf({ ...model, objects: [{ parts: [{ geometry: mirroredGeometry }] }] }));

const messages = [];
const workerContext = vm.createContext({ packCore3mf, packZip, utf8, self: { postMessage: (data) => messages.push(data) } });
const workerSource = await fs.readFile(new URL('../public/export-worker.js', import.meta.url), 'utf8');
vm.runInContext(workerSource.replace(/^import[^\n]+\n/gm, ''), workerContext);
const descriptor = { ...model, objects: [{ name: 'Box', parts: [{ geometry: { positions: geometry.attributes.position.array, indices: geometry.index.array }, materialIndex: 0, materialIndices }] }] };
workerContext.self.onmessage({ data: { plates: [{ filename: 'plate-A.3mf', model: descriptor }, { filename: 'plate-B.3mf', model: descriptor }], extras: { 'README.txt': 'Extract before importing.' } } });
const complete = messages.at(-1);
assert.equal(complete.error, undefined);
assert.equal(complete.count, 2);
const files = unzipSync(complete.archive);
assert.deepEqual(Object.keys(files), ['plate-A.3mf', 'plate-B.3mf', 'README.txt']);
assert.equal(readSolid3mf(files['plate-A.3mf'], parse).length, 1);
assert.equal(readSolid3mf(files['plate-B.3mf'], parse).length, 1);

const fixture = `render_part="all"; export_single_design=1;\nmodule placed_design(i) { if (render_part=="base") cube(10); else translate([0,0,10]) cube([10,10,2]); }\n// GENERATED RENDER BLOCK START\nplaced_design(export_single_design);\n// GENERATED RENDER BLOCK END\n`;
const metadata = { partSelectorParam: 'render_part', objectSelectorParam: 'export_single_design' };
assert.equal(supportsSolidParts(fixture, metadata), true);
assert.equal(supportsSolidParts(fixture.replace('placed_design(export_single_design);', 'custom_geometry();'), metadata), false);

// Run the actual export coordinator: identical parts share a render, each plate
// retains its own placement, and repeated downloads regenerate from settings.
const appSource = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const exportPlates = ['A', 'B'].map((id, index) => {
  const viewMesh = new THREE.Mesh(source);
  viewMesh.rotation.x = -Math.PI / 2;
  viewMesh.position.set(index * 400, 0, 0);
  viewMesh.userData.objectId = 1;
  return { key: id, defaultPlateId: id, modelId: 'same-source', source: fixture, sourceName: 'part.scad', solidPartsExport: true,
    partSelectorParam: 'render_part', values: { width: 30 }, lastGeneratedValues: { width: 30 }, meshes: [viewMesh] };
});
let requestCount = 0, exportCount = 0, previewChecks = 0, snapshotVersion = 1;
const downloads = [];
const exportContext = vm.createContext({
  console, Blob, AbortController, Uint32Array, structuredClone, setTimeout, recipeForExport, effectiveObjectValues, estimateSummary,
  workspaceMaxObjectsPerPlate: null, workspacePrimeTowers: [], refreshWorkspacePrimeTowers() {},
  reduceColorChanges:{disabled:false},workspaceColorOptimization:{enabled:false},workspaceName:{value:'Test'},grams:()=> '~1 g',
  downloadRecordedExport:async(url,recipe)=>{
    requestCount+=recipe.requests.length;exportCount++;
    assert.equal(recipe.requests[0].format,'3mf');assert.deepEqual(recipe.requests[0].solidParts,['base','tag_text']);
    assert.equal(recipe.objects.length,2);
    for(const object of recipe.objects){const geometry=source.clone().applyMatrix4(new THREE.Matrix4().fromArray(object.contributions[0].matrix));placeObjectsOnBed([{parts:[{geometry}]}]);geometry.computeBoundingBox();assert.deepEqual(rounded(geometry.boundingBox.min.toArray()),[113,118,0]);geometry.dispose();}
    downloads.push({recipe});return {estimate:{totalGrams:1}};
  },
  mfBtn: { textContent: 'Export', disabled: false }, viewerMessage: {},
  exportInProgress: false, exportFontRevision: 0, printProfile: {},
  usedExportPlateIds: () => ['A', 'B'], closeExportMenu() {},
  getPrintProfileFromUi: () => ({ printer: 'p1s', filamentColor: '#FF0000' }),
  workspaceSnapshot: () => ({ version: snapshotVersion }),
  ensurePlatePreviews: async () => { previewChecks += 1; },
  PRINTERS: { p1s: { width: 256, depth: 256 } }, fitMinorPlateOverflows() {}, buildPreflightReport: () => ({ issues: [] }),
  setStatus: (text, error) => { if (error) throw new Error(text); },
  colorHexForName: (color, fallback) => color || fallback,
  layerHeightBounds: () => ({ min: 0.08, max: 0.28 }), layerHeightRangeError: () => 'Invalid layer height.',
  plates: exportPlates, PLATE_IDS: ['A', 'B'], batchPlateMeta: {},
  exportGroupsForPlate: (plate) => [{ key: 'group:1', label: `Box ${plate.key}`, meshes: plate.meshes, defs: [{ id: 1 }], record: { plateId: plate.key } }],
  plateLayoutForId: (id) => ({ x: id === 'A' ? 0 : 400, z: 0 }),
  objectColorParts: () => [{ part: 'base', hex: '#FF0000' }, { part: 'tag_text', hex: '#00FF00' }],
  allObjectEntries: () => []
});
vm.runInContext(appSource.slice(appSource.indexOf('function exportSnapshotKey('), appSource.indexOf('\nfunction packExportInWorker(')), exportContext);
vm.runInContext(appSource.slice(appSource.indexOf('function clearExportError('), appSource.indexOf('\nfunction selectObject(')), exportContext);
const initial = exportContext.downloadGeneric3mf();
await exportContext.downloadGeneric3mf(); // A click during export must not queue another.
await initial;
assert.equal(requestCount, 1);
assert.equal(exportCount, 1);
assert.equal(downloads.length, 1);
const cachedStarted = performance.now();
await exportContext.downloadGeneric3mf();
console.log(`Unchanged repeat export coordinator: ${(performance.now() - cachedStarted).toFixed(2)} ms, source/settings regeneration, no stored 3MF.`);
assert.equal(previewChecks, 2);
assert.equal(requestCount, 2);
assert.equal(exportCount, 2);
assert.equal(downloads.length, 2);
snapshotVersion += 1;
await exportContext.downloadGeneric3mf();
assert.equal(requestCount, 3, 'Changed input must be regenerated');
assert.equal(exportCount, 3);

// Retrying clears a stale export failure immediately, including menu reopening.
const successfulDownload = exportContext.downloadRecordedExport;
exportContext.setStatus = () => {};
exportContext.downloadRecordedExport = async () => { throw new Error('Invalid wall loops.'); };
await exportContext.downloadGeneric3mf();
assert.equal(exportContext.viewerMessage.hidden, false);
assert.equal(exportContext.viewerMessage.textContent, 'Export stopped: Invalid wall loops.');
exportContext.downloadRecordedExport = successfulDownload;
const retry = exportContext.downloadGeneric3mf();
assert.equal(exportContext.viewerMessage.hidden, true, 'Clear the previous failure before retry work starts');
assert.equal(exportContext.viewerMessage.textContent, '');
await retry;
assert.equal(exportContext.viewerMessage.hidden, true);
exportContext.viewerMessage.textContent = 'Generate a preview first.';
exportContext.viewerMessage.hidden = false;
exportContext.clearExportError();
assert.equal(exportContext.viewerMessage.hidden, false, 'Unrelated preview messages remain visible');
assert.equal(exportContext.viewerMessage.textContent, 'Generate a preview first.');
const menuSource=appSource.slice(appSource.indexOf('function openExportMenu()'),appSource.indexOf('function closeExportMenu('));
assert.ok(menuSource.indexOf('clearExportError()') < menuSource.indexOf('exportMenuLayer.hidden = false'));
console.log('Export retry clears stale errors immediately and preserves unrelated preview messages.');

if (process.env.PMM_VALIDATE_SLICER) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-export-valid-'));
  const filename = path.join(directory, 'plate-A.3mf');
  await fs.writeFile(filename, packed);
  const { stdout } = await promisify(execFile)(process.env.PMM_VALIDATE_SLICER, ['--datadir', path.join(directory, 'slicer-profile'), '--debug', '4', '--info', filename]);
  assert.match(stdout, /process group colors, size 1/, 'The real Bambu importer must recognise the colour resource, not silently ignore it');
  assert.doesNotMatch(stdout, /open_edges = [1-9]/);
  assert.match(stdout, /size_x = 30\.000000/);
  assert.match(stdout, /size_y = 20\.000000/);
  assert.match(stdout, /size_z = 3\.000000/);
  // Bambu's --info reports centred mesh-local coordinates, not build placement;
  // the round-trip assertions above validate the actual Z=0 build coordinates.
  assert.match(stdout, /volume = 1800\.000000/);
  console.log('Bambu Studio import: colour group recognised, no open edges, correct 30 × 20 × 3 mm orientation and original volume; package placement Z=0 verified.');
  console.log(`Validated file: ${filename}`);
}
console.log('Export tests passed: indexed solids, bed orientation, colours, layers, mirror winding, multipart ZIP, worker packing, and guarded batching.');
