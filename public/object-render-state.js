// Each logical object owns a complete render input, even when it shares SCAD
// with other objects. Changing an object never mutates another object's input.
export function effectiveObjectValues(plate, selectionKey, sourceValues = plate?.values || {}) {
  const instance = plate?.batchInstances?.find(item => `instance:${item.id}` === String(selectionKey));
  return structuredClone(instance?.configuration?.parameters || {
    ...sourceValues, ...(plate?.objectRecords?.[selectionKey]?.parameterOverrides || {})
  });
}

export function stableRenderKey(value) {
  if (Array.isArray(value)) return `[${value.map(stableRenderKey).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableRenderKey(value[key])}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

const sourceStates = new WeakMap();
let sourceRevision = 0;
function sourceRenderIdentity(plate, fontRevision) {
  const context = stableRenderKey([plate.modelId, plate.packageId, plate.packageEntry, plate.sourceName, fontRevision]);
  let state = sourceStates.get(plate);
  if (!state || state.source !== plate.source || state.context !== context) {
    state = { source:plate.source, context, revision:++sourceRevision };
    sourceStates.set(plate, state);
  }
  // Keep the large source once, rather than repeating it in every copy's key.
  return state.revision;
}

export function objectRenderTargets(plate, sourceValues = plate?.values || {}, fontRevision = 0) {
  if (!plate) return [];
  const sourceIdentity = sourceRenderIdentity(plate, fontRevision);
  const definitions = plate?.objectDefs || [];
  const vectorNames = new Set((plate.parameters || []).filter(param => param.type === 'vector').map(param => param.name));
  const groups = new Map();
  for (const def of definitions) {
    const key = `group:${def.mergeKey || `object_${def.id}`}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(def);
  }
  if (!definitions.length) groups.set('model', [{ id: 'model' }]);
  const candidates = [...groups].map(([key, defs]) => ({ key, defs, instance: null }));
  for (const instance of plate?.batchInstances || []) candidates.push({
    key: `instance:${instance.id}`, instance,
    defs: definitions.length ? definitions.filter(def => !instance.memberIds?.length || instance.memberIds.includes(Number(def.id))) : [{ id: 'model' }]
  });
  return candidates.filter(target => !plate?.objectRecords?.[target.key]?.deleted).map(target => {
    const values = effectiveObjectValues(plate, target.key, sourceValues);
    const selectedDesign = !plate?.objectBinding && typeof values.render_design === 'string' && values.render_design.match(/^design_(\d+)$/)?.[1];
    const defs = target.defs.filter(def => (!selectedDesign || String(def.id) === selectedDesign)
      && (!def.labelParam || String(values[def.labelParam] ?? '').trim()));
    // Saved vectors are arrays; text controls submit their JSON representation.
    // Both render identically, so switching the form must not invalidate work.
    const signatureValues = vectorNames.size ? Object.fromEntries(Object.entries(values).map(([name, value]) =>
      [name, vectorNames.has(name) && Array.isArray(value) ? JSON.stringify(value) : value])) : values;
    const signature = stableRenderKey({ source: sourceIdentity,
      definitions: defs, values: signatureValues, quality: 'preview-3mf-v2' });
    return { ...target, defs, values, signature, revision: plate?.objectRecords?.[target.key]?.parameterRevision || 0 };
  });
}

export function pendingObjectRenderTargets(plate, targets = objectRenderTargets(plate)) {
  const existing = new Set((plate?.meshes || []).map(mesh => String(mesh.userData.selectionKey)));
  return targets.filter(target => {
    const state = plate?.renderStates?.[target.key];
    return state?.signature !== target.signature || (!state.empty && !existing.has(target.key));
  });
}

export function objectRenderSnapshot(targets) {
  return stableRenderKey(targets.map(target => [target.key, target.signature, target.revision]));
}
