import fs from 'node:fs/promises';
import path from 'node:path';
import { PRINTERS, PRINT_SETTINGS_GROUPS, createDefaultProfile, migratePrintSettings } from '../public/print-settings-schema.js';
import { normalizePrimeTowerSettings, primeTowerConfig } from '../public/prime-tower.js';

// Read only locally installed Bambu Studio vendor presets. No cloud/printer access is used.
const directory = process.env.PMM_BAMBU_PROFILES_DIR || '/Applications/BambuStudio.app/Contents/Resources/profiles/BBL';
const cache = new Map();
const presetIndexCache = new Map();
const metadata = new Set(['type', 'name', 'inherits', 'include', 'from', 'setting_id', 'filament_id', 'instantiation', 'description', 'compatible_printers', 'compatible_printers_condition', 'compatible_prints', 'compatible_prints_condition']);
const clean = (data) => Object.fromEntries(Object.entries(data).filter(([key]) => !metadata.has(key)));

async function jsonFilesRecursive(root) {
  const output = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) output.push(full);
    }
  }
  return output;
}

async function presetIndex(kind) {
  if (!['machine', 'process', 'filament'].includes(kind)) throw new Error('Invalid Bambu preset kind.');
  const key = `${directory}:${kind}`;
  if (!presetIndexCache.has(key)) {
    presetIndexCache.set(key, (async () => {
      const root = path.join(directory, kind);
      const index = new Map();
      for (const file of await jsonFilesRecursive(root)) {
        const basename = path.basename(file, '.json');
        if (!index.has(basename)) index.set(basename, file);
        try {
          const data = JSON.parse(await fs.readFile(file, 'utf8'));
          const presetName = String(data?.name || '').trim();
          if (presetName && !index.has(presetName)) index.set(presetName, file);
        } catch {
          // Ignore malformed unrelated vendor files; resolving that specific preset will still fail cleanly.
        }
      }
      return index;
    })().catch((error) => { presetIndexCache.delete(key); throw error; }));
  }
  return presetIndexCache.get(key);
}

async function resolvePreset(kind, name, stack = []) {
  const presetName = String(name || '').trim();
  if (!presetName || /[\r\n\0]/.test(presetName) || stack.includes(`${kind}:${presetName}`) || stack.length > 30) throw new Error('Invalid Bambu preset dependency.');
  const index = await presetIndex(kind);
  const file = index.get(presetName);
  if (!file) throw Object.assign(new Error(`Bambu ${kind} preset not found: ${presetName}`), { code: 'ENOENT' });
  const data = JSON.parse(await fs.readFile(file, 'utf8'));
  const next = [...stack, `${kind}:${presetName}`];
  let result = data.inherits ? await resolvePreset(kind, data.inherits, next) : {};
  const includes = Array.isArray(data.include) ? data.include : (data.include ? [data.include] : []);
  for (const include of includes) result = { ...result, ...await resolvePreset(kind, include, next) };
  return { ...result, ...data };
}

async function loadTemplate(printer, material, profileNozzle = 0.4) {
  const labels = { a1mini: 'A1 mini', x1c: 'X1 Carbon', h2dpro: 'H2D Pro' };
  const label = labels[printer] || PRINTERS[printer]?.shortLabel;
  if (!label) throw new Error('Unknown printer.');
  const nozzle = Number(profileNozzle ?? 0.4);
  const machineName = `Bambu Lab ${label} ${nozzle.toFixed(1)} nozzle`;
  const machine = await resolvePreset('machine', machineName);
  const process = await resolvePreset('process', machine.default_print_profile);
  const filamentIndex = await presetIndex('filament');
  const names = [...new Set([...filamentIndex.keys()].filter((name) => name === `Generic ${material}` || name.startsWith(`Generic ${material} @`)))]
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
  let filament;
  for (const name of names) {
    const candidate = await resolvePreset('filament', name);
    const compatible = Array.isArray(candidate.compatible_printers) ? candidate.compatible_printers : [];
    if ((candidate.instantiation === 'true' || candidate.instantiation === true) && (!compatible.length || compatible.includes(machineName))) { filament = candidate; break; }
  }
  if (!filament) throw new Error(`No compatible ${material} preset is installed for ${label}.`);
  const nozzleDiameters = Array.isArray(machine.nozzle_diameter) ? machine.nozzle_diameter.map(Number).filter(Number.isFinite) : [nozzle];
  return {
    config: { ...clean(machine), ...clean(process) }, filament: clean(filament),
    rawProcess: process, rawFilament: filament,
    machineName, processName: process.name, filamentName: filament.name, filamentId: filament.filament_id,
    hotendCount: Math.max(1, nozzleDiameters.length), nozzleDiameters
  };
}

function templateKey(profile, settings) {
  return `${profile.printer}:${Number(profile.nozzleDiameter) || 0.4}:${settings.filament_type || 'PLA'}`;
}

async function templateFor(profile, settings) {
  const key = templateKey(profile, settings);
  if (!cache.has(key)) cache.set(key, loadTemplate(profile.printer, settings.filament_type || 'PLA', Number(profile.nozzleDiameter) || 0.4).catch((error) => { cache.delete(key); throw error; }));
  return structuredClone(await cache.get(key));
}

function normalizeValue(item, value) {
  if (item.type === 'boolean') return value ? '1' : '0';
  if (item.type === 'percent' && ['sparse_infill_density', 'ironing_flow'].includes(item.key)) return `${value}%`;
  return String(value);
}

function setPreservingArray(target, key, value) {
  target[key] = Array.isArray(target[key]) ? target[key].map(() => String(value)) : String(value);
}

function validateSettings(profile) {
  const settings = { ...createDefaultProfile().settings, ...migratePrintSettings(profile.settings) };
  for (const group of PRINT_SETTINGS_GROUPS) for (const item of group.settings) {
    const value = settings[item.key];
    if ((item.type === 'number' || item.type === 'percent') && (typeof value !== 'number' || !Number.isFinite(value) || value < item.min || value > item.max)) throw new Error(`Invalid ${item.label.toLowerCase()}.`);
    if (item.type === 'select' && !item.options.includes(value)) throw new Error(`Invalid ${item.label.toLowerCase()}.`);
    if (item.type === 'boolean' && typeof value !== 'boolean') throw new Error(`Invalid ${item.label.toLowerCase()}.`);
  }
  return settings;
}

const bedMap = {
  'Textured PEI': 'Textured PEI Plate',
  'Smooth PEI': 'High Temp Plate',
  'Cool Plate': 'Cool Plate',
  'Engineering Plate': 'Engineering Plate'
};

export async function bambuVendorDefaults(profile) {
  const settings = { ...createDefaultProfile().settings, ...migratePrintSettings(profile?.settings) };
  const result = await templateFor(profile, settings);
  const defaults = {};
  for (const group of PRINT_SETTINGS_GROUPS) for (const item of group.settings) {
    let raw;
    if (group.scope === 'filament') raw = result.filament[item.key];
    else raw = result.config[item.key];
    if (Array.isArray(raw)) raw = raw[0];
    if (raw === undefined || raw === null || raw === '') continue;
    if (item.type === 'boolean') defaults[item.key] = raw === true || raw === 1 || raw === '1' || raw === 'true';
    else if (item.type === 'number' || item.type === 'percent') {
      const value = Number(String(raw).replace('%', ''));
      if (Number.isFinite(value)) defaults[item.key] = value;
    } else defaults[item.key] = String(raw);
  }
  return { settings: defaults, processName: result.processName, filamentName: result.filamentName, machineName: result.machineName };
}

export async function bambuExportProfile(profile) {
  const settings = validateSettings(profile);
  if (!bedMap[profile.bedType]) throw new Error('Select a compatible Bambu build plate to include printer settings.');
  const nozzleDiameter = Number(profile.nozzleDiameter) || 0.4;
  if (![0.2, 0.4, 0.6, 0.8].includes(nozzleDiameter)) throw new Error('Select a supported nozzle diameter.');
  const minLayerHeight = Number((nozzleDiameter * 0.2).toFixed(2));
  const maxLayerHeight = Number((nozzleDiameter * 0.7).toFixed(2));
  if (settings.layer_height < minLayerHeight || settings.layer_height > maxLayerHeight) {
    throw new Error(`Layer height must be ${minLayerHeight}–${maxLayerHeight} mm for a ${nozzleDiameter} mm nozzle.`);
  }
  const result = await templateFor(profile, settings);
  const { config, filament } = result;

  for (const group of PRINT_SETTINGS_GROUPS) for (const item of group.settings) {
    const value = settings[item.key];
    if (group.scope === 'filament') continue;
    setPreservingArray(config, item.key, normalizeValue(item, value));
  }
  config.curr_bed_type = bedMap[profile.bedType];

  for (const group of PRINT_SETTINGS_GROUPS.filter((entry) => entry.scope === 'filament')) for (const item of group.settings) {
    const value = settings[item.key];
    setPreservingArray(filament, item.key, normalizeValue(item, value));
  }

  // Generic advanced overrides are limited to process-level keys. Raw G-code,
  // hardware identity and filament/AMS mapping remain blocked.
  const blockedAdvanced = /(?:^|_)(?:gcode|script)$|^(?:printer_settings_id|print_settings_id|filament_settings_id|printer_model|printer_variant|nozzle_diameter|bed_exclude_area|curr_bed_type|printable_area|printable_height|printer_technology|filament_colour|filament_map|flush_volumes_matrix|flush_volumes_vector)$/i;
  for (const [key, value] of Object.entries(profile.advanced || {})) {
    if (blockedAdvanced.test(key)) continue;
    const normalize = (item) => item === null ? '' : typeof item === 'boolean' ? (item ? '1' : '0') : String(item);
    config[key] = Array.isArray(value) ? value.map(normalize) : normalize(value);
  }

  config.printer_settings_id = result.machineName;
  const profileName = String(profile.name || 'Custom print profile').trim().slice(0, 90) || 'Custom print profile';
  config.print_settings_id = `${profileName} · ${Number(settings.layer_height).toFixed(2)}mm`;
  config.printer_technology = 'FFF';
  // This process control sets the priming volume for each exported filament.
  // Keep the filament preset in sync so it cannot overwrite the selected value.
  if (config.filament_prime_volume !== undefined) {
    filament.filament_prime_volume = Array.isArray(config.filament_prime_volume)
      ? [...config.filament_prime_volume] : [String(config.filament_prime_volume)];
  }
  result.primeTowerSettings = normalizePrimeTowerSettings(result);
  for (const [key,value] of Object.entries(primeTowerConfig(result.primeTowerSettings))) setPreservingArray(config,key,typeof value === 'boolean' ? (value ? '1' : '0') : value);
  return result;
}
