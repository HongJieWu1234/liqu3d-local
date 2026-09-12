// Pre-slice footprint and layer-demand estimate based on Bambu Studio's
// PartPlate.cpp and GCode/WipeTower.cpp at 926a7192574bcb9b3a732e1ec59a46d79cb45466.
import { combineTowerRuns, summarizeTowerLayers, towerColor } from './prime-tower-layers.js?v=tower-free1';
export const PRIME_TOWER_VERSION = 'bambu-layer-estimate-v2';
const first = value => Array.isArray(value) ? value[0] : value;
const list = value => value == null ? [] : Array.isArray(value) ? value : [value];
const number = (value, fallback, minimum = 0) => {
  const n = Number(String(first(value) ?? fallback).replace('%', ''));
  if (!Number.isFinite(n) || n < minimum) throw new Error('Invalid prime tower settings.');
  return n;
};
const bool = (value, fallback) => { value = first(value); return value == null ? fallback : value === true || value === 1 || value === '1' || value === 'true'; };
const numbers = (value, fallback, minimum = 0) => (Array.isArray(value) && value.length ? value : [first(value) ?? fallback]).map(v => number(v, fallback, minimum));
export function normalizePrimeTowerSettings(template = {}) {
  const c = template.config || template.settings || template, f = { ...template.filament, ...c };
  return Object.freeze({
    version: PRIME_TOWER_VERSION,
    enable_prime_tower: bool(c.enable_prime_tower, true),
    prime_tower_width: number(c.prime_tower_width, 35, 1),
    prime_tower_brim_width: number(c.prime_tower_brim_width, 3, -1),
    prime_tower_rib_wall: bool(c.prime_tower_rib_wall, true),
    prime_tower_fillet_wall: bool(c.prime_tower_fillet_wall, true),
    prime_tower_rib_width: number(c.prime_tower_rib_width, 8),
    prime_tower_extra_rib_length: number(c.prime_tower_extra_rib_length, 0, -300),
    prime_tower_infill_gap: number(c.prime_tower_infill_gap, 150, 100),
    prime_volume_mode: String(c.prime_volume_mode || 'Default'),
    filament_prime_volume: Object.freeze(numbers(f.filament_prime_volume, 45, 1)),
    filament_prime_volume_nc: Object.freeze(numbers(f.filament_prime_volume_nc, 60)),
    filament_change_length: Object.freeze(numbers(f.filament_change_length, 10)),
    filament_diameter: Object.freeze(numbers(f.filament_diameter, 1.75, .01)),
    nozzleDiameter: number(template.nozzleDiameter ?? template.nozzleDiameters ?? c.nozzle_diameter, .4, .01),
    hotendCount: number(template.hotendCount ?? c.hotendCount ?? template.nozzleDiameters?.length ?? (Array.isArray(c.nozzle_diameter) ? c.nozzle_diameter.length : undefined), 1, 1),
    layerHeight: number(c.layerHeight ?? c.layer_height, .2, .001),
    firstLayerHeight: number(c.firstLayerHeight ?? c.initial_layer_print_height ?? c.layerHeight ?? c.layer_height, .2, .001),
    wipe_tower_no_sparse_layers: bool(c.wipe_tower_no_sparse_layers, false),
    filament_colour: Object.freeze([...list(c.filament_colour ?? f.filament_colour)]),
    filament_map_mode: String(c.filament_map_mode || ''),
    filament_map: Object.freeze([...list(c.filament_map)]),
    filament_nozzle_map: Object.freeze([...list(c.filament_nozzle_map)]),
    flush_volumes_matrix: Object.freeze(list(c.flush_volumes_matrix).flat(Infinity)),
    timelapse_type: String(c.timelapse_type || '0'),
    enable_wrapping_detection: bool(c.enable_wrapping_detection, false)
  });
}
export function minimumTowerDepth(height) {
  const points = [[5,5],[100,20],[250,40],[350,60]];
  if (height <= 5) return 5;
  for (let i = 1; i < points.length; i++) {
    const [h,d] = points[i], [ph,pd] = points[i-1];
    if (height <= h) return pd + (height-ph)/(h-ph)*(d-pd);
  }
  return 60;
}
export function estimatePrimeTower(items, input, {runs} = {}) {
  if (!input || !items.length) return null;
  const settings = normalizePrimeTowerSettings(input);
  if (!settings.enable_prime_tower) return null;
  const channels = new Set(); let height = 0, layerHeight = Infinity;
  for (const item of items) {
    const ids = item.towerChannels ?? (item.colorAnalysis?.status === 'ready' ? item.colorAnalysis.channels.map(c => c.id) : null);
    if (!Array.isArray(ids) || !ids.length || ids.some(id => typeof id !== 'string' || !id)) throw new Error(`Cannot reserve the prime tower for ${item.name || 'this object'}: generated filament colors are unavailable. Generate the object with color information first.`);
    ids.forEach(id => channels.add(towerColor(id)));
    const itemHeight = Number(item.height ?? (item.bounds ? item.bounds.maxZ - item.bounds.minZ : NaN));
    if (!(itemHeight > 0) || !Number.isFinite(itemHeight)) throw new Error(`Cannot estimate the prime tower: ${item.name || 'an object'} has no valid generated height.`);
    height = Math.max(height, itemHeight);
    const objectLayerHeight = Number(item.colorAnalysis?.layerHeight ?? item.layerHeight ?? settings.layerHeight);
    layerHeight = Math.min(layerHeight, objectLayerHeight > 0 && Number.isFinite(objectLayerHeight) ? objectLayerHeight : settings.layerHeight);
  }
  if (channels.size < 2) return null;
  const sourceHeight=height;
  const analyses=items.map(item=>item.colorAnalysis);
  if(!runs&&analyses.every(a=>a?.status==='ready')&&new Set(analyses.map(a=>`${a.layerHeight}:${a.firstLayerHeight}`)).size===1)runs=combineTowerRuns(analyses);
  const plan=runs?.length?summarizeTowerLayers(runs.map(run=>({...run,colors:[...new Set(run.colors.map(towerColor))]})),
    {...settings,layerHeight,firstLayerHeight:analyses[0]?.firstLayerHeight||settings.firstLayerHeight}):null;
  if(runs?.length&&!plan)return null;
  if(plan)height=Math.min(sourceHeight,plan.height);
  const primeVolume = settings.prime_volume_mode === 'Saving' ? 15 : Math.max(...settings.filament_prime_volume);
  const dual = settings.hotendCount > 1, changes = dual ? channels.size : channels.size-1;
  const rammingVolume = Math.max(...settings.filament_change_length) * Math.PI * Math.max(...settings.filament_diameter) ** 2 / 4;
  const volume = primeVolume * changes + (dual ? Math.floor(channels.size/2)*rammingVolume : 0);
  const area = (plan?plan.primeArea:volume/layerHeight) * settings.prime_tower_infill_gap / 100, minimum = minimumTowerDepth(height);
  let width = settings.prime_tower_width, depth;
  if (settings.prime_tower_rib_wall) {
    const volumeSide = Math.sqrt(area), side = Math.max(volumeSide, minimum);
    width = depth = Math.min(settings.prime_tower_rib_width, side/2)/Math.SQRT2 + Math.max(side + settings.prime_tower_extra_rib_length, volumeSide);
  } else depth = Math.max(area/width, minimum);
  const brim = settings.prime_tower_brim_width < 0 ? Math.min(8, height*.08) : settings.prime_tower_brim_width, padding = brim + 2*settings.nozzleDiameter;
  return { version: PRIME_TOWER_VERSION, settings, estimated: true, ...plan, sourceHeight, colorCount: channels.size, channels: [...channels].sort(), height, layerHeight,
    width, depth, brim, padding, w: width+2*padding, h: depth+2*padding };
}
export function primeTowerReservations(items) {
  const map = new Map();
  for (const item of items) if (item.placement?.primeTower) map.set(item.placement.plateIndex, item.placement.primeTower);
  return [...map].sort((a,b)=>a[0]-b[0]).map(([plateIndex,tower]) => ({plateIndex,...tower}));
}
export function primeTowerConfig(settings) {
  return Object.fromEntries(Object.entries(settings).filter(([key]) => key.startsWith('prime_') || key === 'enable_prime_tower' || key === 'wipe_tower_no_sparse_layers'));
}
