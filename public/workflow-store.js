import { PLATE_IDS } from './plate-ids.js';
export { PLATE_IDS, MAX_PLATES, isValidPlateId, plateIdAt, plateIndex, comparePlateIds } from './plate-ids.js';

export function plateShortcutAction(key, shiftKey = false) {
  const plateId = String(key || '').toUpperCase();
  if (!shiftKey || !PLATE_IDS.includes(plateId)) return null;
  return { type: 'move-selection', plateId };
}

export function createPersistentId(prefix = 'item') {
  const uuid = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${uuid.replaceAll('-', '')}`;
}

export function compatiblePresetValues(parameters, preset) {
  const available = new Map((parameters || []).map((param) => [param.name, param]));
  const values = {};
  const incompatible = [];
  for (const [key, value] of Object.entries(preset?.values || {})) {
    const param = available.get(key);
    if (!param || (preset.parameterTypes?.[key] && preset.parameterTypes[key] !== param.type)) {
      incompatible.push(key);
      continue;
    }
    values[key] = structuredClone(value);
  }
  return { values, matched: Object.keys(values), incompatible };
}

export function evaluatePresetStack(parameters, presets, activeIds) {
  const byId = new Map((presets || []).map((preset) => [preset.id, preset]));
  const resolved = {};
  const owners = {};
  const conflicts = {};
  const compatibility = {};
  for (const id of activeIds || []) {
    const preset = byId.get(id);
    if (!preset) continue;
    const match = compatiblePresetValues(parameters, preset);
    compatibility[id] = match;
    for (const [key, value] of Object.entries(match.values)) {
      if (Object.hasOwn(resolved, key) && JSON.stringify(resolved[key]) !== JSON.stringify(value)) {
        if (!conflicts[key]) conflicts[key] = [{ presetId: owners[key], value: structuredClone(resolved[key]) }];
        conflicts[key].push({ presetId: id, value: structuredClone(value) });
      }
      resolved[key] = structuredClone(value);
      owners[key] = id;
    }
  }
  return { values: resolved, owners, conflicts, compatibility };
}
