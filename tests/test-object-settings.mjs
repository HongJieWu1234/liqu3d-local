import './setup.mjs';
import { effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot } from '../public/object-render-state.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { parseScadParameters } from '../lib/parser.mjs';
import { objectSettingsSection, settingsSectionSelection } from '../public/object-settings.js';

const scad = Array.from({ length: 10 }, (_, i) => `/* [Box ${i + 1}] */
box_${i + 1}_preset = 0; // [0:Custom dimensions,1:Compact]
box_${i + 1}_enabled = true;
box_${i + 1}_width = 40; // [20:1:240]`).join('\n');
const parameters = parseScadParameters(scad);
const plate = { parameters, objectDefs: Array.from({ length: 10 }, (_, i) =>
  ({ id: i + 1, label: `Box ${i + 1}`, mergeKey: `box_${i + 1}` })), batchInstances: [],
  values: Object.fromEntries(parameters.map(param => [param.name, param.default])),
  objectRecords: { 'group:box_1': { deleted: true } } };
for (let id = 1; id <= 10; id++) {
  assert.equal(objectSettingsSection(plate, `group:box_${id}`, 'Box 1'), `Box ${id}`);
  assert.equal(settingsSectionSelection(plate, `Box ${id}`, 'all'), `group:box_${id}`);
}
assert.equal(settingsSectionSelection(plate, 'Global Preview Quality', 'all'), null);

const inputs = new Map(parameters.map(param => [param.name, { id: param.name, name: param.name,
  type: param.type === 'boolean' ? 'checkbox' : 'number', tagName: 'INPUT',
  checked: Boolean(param.default), value: String(param.default) }]));
const source = await fs.readFile('public/app.js', 'utf8');
const noop = () => {};
const state = vm.createContext({ effectiveObjectValues, objectRenderTargets, pendingObjectRenderTargets, objectRenderSnapshot, parameters, objectSettingsSection, settingsSectionSelection, structuredClone,
  activeSection: 'Box 1', selectedObjectId: 'all', batchSelectedObjectIds: new Set(),
  activePlate: () => plate, printSettingsScope: 'global', updateSelectionVisuals: noop,
  setActiveSection: name => { state.activeSection = name; },
  form: { elements: { length: inputs.size, namedItem: name => inputs.get(name) }, querySelector: () => null,
    addEventListener(type, handler) { if (type === 'input') state.edit = handler; } },
  displayValue: String, CSS: { escape: value => value },
  generateBtn: { classList: { add: noop } }, persistUploadedPlates: noop,
  renderParametricRulesState: noop, markPlateCardDirty: noop, setStatus: noop,
  accountPreferences: { workspace: { autoRegenerate: true } }, scheduleAutoRegenerate: noop,
  valuesFromParameters: params => Object.fromEntries(params.map(param => [param.name, param.default]))
});
for (const name of ['selectObject', 'selectSettingsSection', 'setFormValues', 'getValues', 'valueFromParameterInput']) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  vm.runInContext(source.slice(start, source.indexOf('\n}', start) + 2), state);
}
vm.runInContext(source.slice(source.indexOf("form.addEventListener('input'"),
  source.indexOf("parameterSearch.addEventListener('input'")), state);

// Box 1 was removed; selecting Box 10 still opens and edits Box 10's controls.
state.selectObject('group:box_10');
assert.equal(state.activeSection, 'Box 10');
inputs.get('box_10_width').value = '79';
state.edit({ target: inputs.get('box_10_width') });
assert.equal(plate.objectRecords['group:box_10'].parameterOverrides.box_10_width, 79);
assert.equal(plate.values.box_10_width, 40, 'Selected edits preserve shared source defaults');
assert.equal(plate.values.box_1_width, 40);
inputs.get('box_10_enabled').checked = false;
state.edit({ target: inputs.get('box_10_enabled') });
assert.equal(plate.objectRecords['group:box_10'].parameterOverrides.box_10_enabled, false);
assert.equal(plate.values.box_10_enabled, true);
assert.equal(plate.values.box_1_enabled, true);

// Copies use their source object's section; changing tabs selects the intended native object.
const copy = { id: 'copy', sourceKey: 'group:box_10', memberIds: [10],
  configuration: { parameters: { ...plate.values, box_10_width: 99 } } };
plate.batchInstances.push(copy);
state.selectObject('instance:copy');
assert.equal(state.activeSection, 'Box 10');
assert.equal(inputs.get('box_10_width').value, '99');
state.selectSettingsSection('Box 10');
assert.equal(state.selectedObjectId, 'instance:copy');
state.selectSettingsSection('Box 2');
assert.equal(state.selectedObjectId, 'group:box_2');
assert.equal(state.activeSection, 'Box 2');
inputs.get('box_2_width').value = '55';
state.edit({ target: inputs.get('box_2_width') });
assert.equal(plate.objectRecords['group:box_2'].parameterOverrides.box_2_width, 55);
assert.equal(plate.values.box_2_width, 40);
assert.equal(copy.configuration.parameters.box_2_width, 40);
assert.equal(copy.configuration.parameters.box_10_width, 99);

// Legacy designs, named sections and multipart objects retain deterministic mappings.
const legacy = { parameters: [{ name: 'design2_width', section: 'DESIGN 2' }], objectDefs: [{ id: 2, mergeKey: 'object_2' }] };
assert.equal(objectSettingsSection(legacy, 'group:object_2', ''), 'DESIGN 2');
const multipart = { parameters: [{ name: 'base_text', section: 'Base' }, { name: 'lid_text', section: 'Lid' }],
  objectDefs: [{ id: 1, labelParam: 'base_text', mergeKey: 'assembly' }, { id: 2, labelParam: 'lid_text', mergeKey: 'assembly' }] };
assert.equal(objectSettingsSection(multipart, 'group:assembly', 'Lid'), 'Lid');
assert.equal(settingsSectionSelection(multipart, 'Base', 'all'), 'group:assembly');
assert.match(source, /tab.addEventListener\('click', \(\) => selectSettingsSection\(sectionName\)\)/);
state.statusEl = { hidden: true, textContent: '', classList: {
  contains: () => Boolean(state.statusError), toggle: (name, error) => { state.statusError = error; }
} };
const statusStart = source.indexOf('function setStatus(');
vm.runInContext(source.slice(statusStart, source.indexOf('\n}', statusStart) + 2), state);
state.setStatus('Changes ready. Click Generate all to update the preview.');
assert.equal(state.statusEl.hidden, false, 'Manual generation instructions must be visible');
state.setStatus('Rule: width must exceed wall thickness.', true);
assert.equal(state.statusEl.hidden, false, 'Settings failures cannot be hidden');
assert.equal(state.statusError, true);
assert.equal(state.statusEl.title, state.statusEl.textContent);
console.log('Object settings passed: all ten drawer sections, removed objects, enable controls, copies, tab selection, legacy designs and multipart groups.');
