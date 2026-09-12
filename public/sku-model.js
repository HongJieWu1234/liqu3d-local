import { PRINT_SETTINGS_GROUPS } from './print-settings-schema.js';

export const processSettings = PRINT_SETTINGS_GROUPS.filter(group => group.scope === 'process').flatMap(group => group.settings);
export const equalValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function boundRecord(snapshot) {
  const plate = snapshot?.plates?.[0];
  return plate?.objectBinding ? plate.objectRecords?.[plate.objectBinding.selectionKey] : null;
}
export function baseProcessSettings(sku) {
  return { ...sku.printProfile?.settings, ...(sku.calibration?.settings || {}), ...boundRecord(sku.workspaceSnapshot)?.printOverrides };
}
export function validateOverrides(sku, design = {}, print = {}) {
  const catalog = new Map((sku.parameters || []).map(item => [item.name, item]));
  const printCatalog = new Map(processSettings.map(item => [item.key, item]));
  const check = (key, value, item) => {
    if (!item) throw new Error(`Unknown setting: ${key}`);
    const type = item.type === 'percent' ? 'number' : item.type === 'select' ? typeof (item.default ?? item.value) : item.type;
    if (['number', 'boolean', 'string'].includes(type) && typeof value !== type) throw new Error(`Invalid value for ${item.label || key}.`);
    if (typeof value === 'number' && (!Number.isFinite(value) || (item.min != null && value < item.min) || (item.max != null && value > item.max))) throw new Error(`${item.label || key} is outside its supported range.`);
    const options = item.options?.map(option => typeof option === 'object' ? option.value : option);
    if (options?.length && !options.some(option => equalValue(option, value))) throw new Error(`Unsupported choice for ${item.label || key}.`);
    if (typeof value === 'string' && value.length > 1000) throw new Error(`${item.label || key} is too long.`);
    if (value === undefined || value === null || (typeof value === 'object' && (!Array.isArray(value) || value.length > 100))) throw new Error(`Invalid value for ${item.label || key}.`);
  };
  for (const [key, value] of Object.entries(design)) check(key, value, catalog.get(key));
  for (const [key, value] of Object.entries(print)) check(key, value, printCatalog.get(key));
}
export function variantDifferences(sku, design = {}, print = {}) {
  validateOverrides(sku, design, print);
  const defaults = Object.assign({}, ...(sku.workspaceSnapshot?.plates || []).map(plate => plate.values));
  const printDefaults = baseProcessSettings(sku);
  return {
    design: Object.fromEntries(Object.entries(design).filter(([key, value]) => !equalValue(value, defaults[key]))),
    print: Object.fromEntries(Object.entries(print).filter(([key, value]) => !equalValue(value, printDefaults[key])))
  };
}
export function resolveSkuVariant(sku, variant = null) {
  if (variant && (variant.skuId !== sku.id || variant.skuRevision !== sku.revision)) throw new Error('This variant belongs to a different SKU revision.');
  const { design = {}, print = {} } = variant || {};
  validateOverrides(sku, design, print);
  const snapshot = structuredClone(sku.workspaceSnapshot);
  for (const plate of snapshot.plates || []) {
    plate.values = { ...plate.values, ...design };
    plate.baseValues = structuredClone(plate.values);
    const record = plate.objectRecords?.[plate.objectBinding?.selectionKey];
    if (record) {
      record.configuration = { ...record.configuration, parameters: structuredClone(plate.values) };
      record.printOverrides = { ...record.printOverrides, ...print };
      record.skuLink = { skuId: sku.id, skuRevision: sku.revision, variantId: variant?.id || null, variantRevision: variant?.revision || null };
    }
  }
  return { ...sku, workspaceSnapshot: snapshot, variant: variant ? structuredClone(variant) : null };
}
