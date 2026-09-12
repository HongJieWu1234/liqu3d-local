import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { boundRecord, resolveSkuVariant } from '../public/sku-model.js';
import { createDefaultProfile } from '../public/print-settings-schema.js';
import { syncObjectPlateLocation } from '../public/object-plate-location.js';
import { captureObjectSnapshot } from './fixtures/sku-snapshot.mjs';

// Exercise saved-workspace restoration; the former SKU installation callbacks
// no longer exist in app.js. Resolved variants use the current restore path.
const source = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const profile = createDefaultProfile();
const defs = [{ id: 1, mergeKey: 'pair' }, { id: 2, mergeKey: 'pair' }, { id: 3, mergeKey: 'other' }];
const data = { id: 'shared-source', model: 'parts.scad', parameters: [{ name: 'size', type: 'number', default: 10 }], objects: defs };
let sequence = 0;
let active;
const context = vm.createContext({
  structuredClone, syncObjectPlateLocation,
  parametricPresets: [], activePresetIds: [], objectIdentityStore: {}, plateKeySequence: 0,
  createPersistentId: () => `id-${++sequence}`, ensureBatchPlate: id => id,
  evaluatePresetStack: () => ({ values: { size: 999 } }), nextRealPlateId: () => 'A',
  activePlate: () => active,
  logicalObjectGroupsFor: objects => [...new Set(objects.map(def => def.mergeKey))].map(key => ({
    key, label: key, memberIds: objects.filter(def => def.mergeKey === key).map(def => def.id)
  }))
});
for (const name of ['valuesFromParameters', 'plateFromModel', 'ensureObjectRecords', 'activeObjectDefs', 'exportGroupsForPlate']) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf('\n}', start) + 2;
  assert.ok(start >= 0 && end > start, name);
  vm.runInContext(source.slice(start, end), context);
}

const original = { sourceInstanceId: 'source', sourceName: 'parts.scad', source: 'cube(size);' };
const record = { id: 'pair-id', selectionKey: 'group:pair', plateId: 'B', printOverrides: {} };
const snapshot = captureObjectSnapshot(original, record, { size: 10 }, [1, 2]);
const saved = snapshot.plates[0];
saved.defaultPlateId = 'B';
saved.plateAssignmentVersion = 1;
saved.objectRecords['group:pair'].plateId = 'B';
saved.objectTransforms = { 'group:pair': { x: 23, z: 7 } };
const sku = { id: 'sku-one', revision: 1, parameters: data.parameters, workspaceSnapshot: snapshot, printProfile: profile };
const variant = { id: 'variant-one', revision: 1, skuId: sku.id, skuRevision: 1, design: { size: 20 }, print: { layer_height: 0.12 } };
const baseline = structuredClone(sku);
const resolved = resolveSkuVariant(sku, variant);
const base = resolveSkuVariant(sku);
assert.deepEqual(sku, baseline, 'Resolving a variant must not change its saved base');
assert.equal(boundRecord(resolved.workspaceSnapshot).configuration.parameters.size, 20);
assert.equal(boundRecord(resolved.workspaceSnapshot).printOverrides.layer_height, 0.12);
assert.equal(boundRecord(base.workspaceSnapshot).printOverrides.layer_height, undefined, 'Base clears variant differences');
assert.equal(boundRecord(base.workspaceSnapshot).skuLink.variantId, null);
assert.equal(profile.settings.layer_height, 0.2, 'Object settings must not change global defaults');
assert.throws(() => resolveSkuVariant(sku, { ...variant, skuId: 'different' }), /different SKU revision/);
assert.throws(() => resolveSkuVariant(sku, { ...variant, skuRevision: 2 }), /different SKU revision/);

const restored = [resolved, base].map(item => context.plateFromModel(data, { state: item.workspaceSnapshot.plates[0] }));
for (const [index, plate] of restored.entries()) {
  const size = index === 0 ? 20 : 10;
  active = plate;
  context.objectDefs = plate.objectDefs;
  assert.equal(plate.values.size, size, 'Bound objects ignore the legacy preset stack');
  assert.equal(plate.baseValues.size, size);
  assert.equal(context.activeObjectDefs({ render_design: 'design_3' }).map(def => def.id).join(','), '1,2', 'Multipart preview excludes the sibling');
  context.ensureObjectRecords(plate);
  assert.deepEqual(Object.keys(plate.objectRecords), ['group:pair']);
  assert.equal(plate.objectRecords['group:pair'].id, 'pair-id', 'Saved object identity survives restoration');
  assert.equal(plate.objectRecords['group:pair'].plateId, 'B');
  assert.equal(plate.objectTransforms['group:pair'].x, 23);
  plate.meshes = plate.objectDefs.map(def => ({ userData: { objectId: def.id, selectionKey: 'group:pair' } }));
  const groups = context.exportGroupsForPlate(plate);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].defs.map(def => def.id).join(','), '1,2', 'Export keeps every bound part');
  assert.equal(groups[0].record.configuration.parameters.size, size);
}
restored[0].values.size = 31;
restored[0].objectRecords['group:pair'].printOverrides.layer_height = 0.16;
assert.equal(restored[1].values.size, 10, 'Restored objects sharing a source retain independent values');
assert.equal(resolved.workspaceSnapshot.plates[0].values.size, 20, 'Editor changes must not mutate the saved variant');
assert.equal(boundRecord(resolved.workspaceSnapshot).printOverrides.layer_height, 0.12);
assert.deepEqual(sku, baseline);
console.log('SKU object isolation passed: saved multipart restoration, independent settings, pinned variants, base restoration, placement, preview and export grouping.');
