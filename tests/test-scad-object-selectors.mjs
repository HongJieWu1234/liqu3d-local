import './setup.mjs';
import assert from 'node:assert/strict';
import { parseScadParameters } from '../lib/parser.mjs';
import { inferDesignSelector, objectSelectorDefinition } from '../lib/scad-object-selectors.mjs';
import { parseOrders, parametersForModel, resolveOrders, selectOrderModel } from '../lib/instant-orders.mjs';
import { arrangeObjects } from '../lib/instant-generation.mjs';
import { PRINTERS } from '../public/print-settings-schema.js';

const source = 'show_model="all"; // [all,design_2:Second,design_1:First]\ndesign1_name_text="One";\ndesign2_name_text="Two";\nshared_height=3;';
const parameters = parseScadParameters(source), metadata = inferDesignSelector(parameters);
assert.equal(metadata.objectSelectorParam, 'show_model');
assert.deepEqual(metadata.objects.map(object => object.id), [2, 1], 'preserve declaration order');
assert.equal(metadata.objects[0].label, 'Second');
assert.equal(objectSelectorDefinition(1, metadata), 'show_model="design_1"');
assert.equal(objectSelectorDefinition(2, { objectSelectorParam: 'export_single_design', objects: [{ id: 2 }] }), 'export_single_design=2');
assert.throws(() => objectSelectorDefinition(3, metadata), /does not expose/);
assert.throws(() => objectSelectorDefinition('1;cube(99)', metadata), /Invalid object/);
for (const unrelated of [
  'part="all"; // [all,base,text]\nheight=3;',
  'mode="all"; // [all,design_1]\nheight=3;',
  'mode="all"; // [all,design_1,unknown]\ndesign1_height=3;',
  'mode="all"; // [all,design_1,design_1]\ndesign1_height=3;',
  source + '\nother="all"; // [all,design_1,design_2]'
]) assert.equal(inferDesignSelector(parseScadParameters(unrelated)), null);

const groups = metadata.objects.map(object => ({ key: object.mergeKey, memberIds: [object.id] }));
assert.equal(selectOrderModel(parseOrders('Name: Mason'), parameters, groups).key, 'object_2');
const orders = parseOrders('Design1 Name Text: Mason');
const group = selectOrderModel(orders, parameters, groups);
assert.equal(group.key, 'object_1');
const defaults = Object.fromEntries(parameters.map(parameter => [parameter.name, parameter.default]));
const resolved = resolveOrders(orders, parametersForModel(parameters, group), {}, defaults);
assert.equal(resolved.objects[0].values.design1_name_text, 'Mason');
assert.equal(resolved.objects[0].values.design2_name_text, 'Two');
assert.equal(resolved.objects[0].values.shared_height, 3);

assert.throws(() => arrangeObjects([{ name: 'Mason', width: 500, depth: 40, index: 0 }], PRINTERS.p1s), /Mason measures 500\.0 × 40\.0 mm.*256 × 256 mm/);
assert.equal(arrangeObjects([{ name: 'Mason', width: 180, depth: 40, index: 0 }], PRINTERS.p1s), 1);
console.log('SCAD selectors passed: string and numeric selectors, scoped matching, defaults, ambiguous models and fit diagnostics.');
