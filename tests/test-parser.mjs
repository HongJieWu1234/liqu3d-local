import './setup.mjs';
import assert from 'node:assert/strict';
import { parseLiteral, parseScadParameters, valueToScad } from '../lib/parser.mjs';
import { evaluatePresetStack, plateShortcutAction } from '../public/workflow-store.js';
import * as THREE from '../public/vendor/three/three.module.js';
import { packCore3mf } from '../public/core-3mf.js';
import { strFromU8, unzipSync } from '../public/vendor/three/addons/libs/fflate.module.js';

const scad = `
/* [Size] */
// Width in millimeters
width = 120; // [50:1:300]
enabled = true;
mode = 2; // [1:Fast,2:Fine]
name = "Desk tray";
vec = [1,2,3];
$fn = 48; // [16:8:96]
/* [Hidden] */
secret = 99; // [0:100]
`;
const p = parseScadParameters(scad);
assert.equal(p.length, 6);
assert.equal(p[0].name, 'width');
assert.equal(p[0].min, 50);
assert.equal(p[0].step, 1);
assert.equal(p[0].max, 300);
assert.equal(p[2].control, 'select');
assert.deepEqual(p[4].default, [1,2,3]);
assert.equal(p[5].name, '$fn');
assert.equal(valueToScad(125, p[0]), '125');
assert.equal(valueToScad(false, p[1]), 'false');
console.log('Parser tests passed.');

// A multiline comparison in a helper function is not a Customizer assignment.
// Nor are named call arguments, let bindings, module locals or block comments.
{
  const source = `
include <lib/part.scad>
use <lib/braces{and}(parens).scad>
/* [Design] */
name = "Red";
function rgb(c) =
  c == "Red" ? [1, 0, 0] :
  c == "Blue" ? [0, 0, 1] : [1, 1, 1];
function measured(i) = let(
  width = 12,
  size = 3
) width * size;
module label(
  size = 5
) {
  name = "local";
  width = 10;
  text(name,
    size = size,
    font = "Fake local font");
  /* [Hidden] */
}
/*
bogus = 123;
*/
// Semicolons and braces in strings/comments do not affect lexical scope.
caption = "text; { } // literal";
include <lib/
other.scad>
vector = [
  [1, 2],
  [3, 4]
];
/* [Next] */
height = 7; // [1:1:20]
`;
  const settings = parseScadParameters(source.replaceAll('\n', '\r\n'));
  assert.deepEqual(settings.map(param => param.name), ['name', 'caption', 'vector', 'height']);
  assert.equal(settings.at(-1).section, 'Next');
  for (const param of settings) assert.doesNotThrow(() => valueToScad(param.default, param));
}

const presetParams = [
  { name: 'name', type: 'string' }, { name: 'font_size', type: 'number' },
  { name: 'thickness', type: 'number' }, { name: 'hole_size', type: 'number' }
];
const presetStack = evaluatePresetStack(presetParams, [
  { id: 'john', values: { name: 'John', font_size: 18, spacing: 1.05 }, parameterTypes: { name: 'string', font_size: 'number', spacing: 'number' } },
  { id: 'thick', values: { font_size: 20, thickness: 3.2 }, parameterTypes: { font_size: 'number', thickness: 'number' } }
], ['john', 'thick']);
assert.deepEqual(presetStack.values, { name: 'John', font_size: 20, thickness: 3.2 });
assert.equal(presetStack.owners.font_size, 'thick');
assert.deepEqual(Object.keys(presetStack.conflicts), ['font_size']);

assert.equal(plateShortcutAction('b'), null);
assert.deepEqual(plateShortcutAction('b', true), { type: 'move-selection', plateId: 'B' });
assert.equal(plateShortcutAction('1'), null);

console.log('Workflow tests passed.');

// Font-picker comment convention.
{
  const fontParams = parseScadParameters('font_name = "Roboto"; // font\n');
  assert.equal(fontParams.length, 1);
  assert.equal(fontParams[0].control, 'font');
  assert.equal(fontParams[0].fontPicker, true);
}

// V4.4 object-manifest vectors can be parsed without executing SCAD.
{
  const manifest = parseLiteral('[[1, "Design 1", "design1_name_text", "pair_a"], [2, "Design 2", "design2_name_text", "pair_a"]]');
  assert.equal(manifest.type, 'vector');
  assert.deepEqual(manifest.value[0], [1, 'Design 1', 'design1_name_text', 'pair_a']);
  assert.equal(manifest.value[1][3], 'pair_a');
}

// Vendor-neutral 3MF Core package contains the required parts and mesh data.
{
  const geometry = new THREE.BoxGeometry(10, 10, 3);
  const archive = packCore3mf({
    title: 'Closed box',
    objects: [{ name: 'Object', parts: [{ name: 'Part', geometry, materialIndex: 0 }] }],
    palette: ['#336699']
  });
  const files = unzipSync(archive);
  assert.ok(files['[Content_Types].xml']);
  assert.ok(files['_rels/.rels']);
  const model = strFromU8(files['3D/3dmodel.model']);
  assert.match(model, /<m:color color="#336699FF"/);
  assert.equal([...model.matchAll(/<triangle /g)].length, 12);
  assert.equal([...model.matchAll(/<vertex /g)].length, 8);
  geometry.dispose();
}

console.log('3MF tests passed.');
