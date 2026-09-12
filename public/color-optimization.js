import { minimumPackingPlates } from './plate-packing.js?v=tower-free1';
import { MAX_PLATES, plateIdAt } from './plate-ids.js';
import { primeTowerReservations } from './prime-tower.js?v=tower-free1';

export const COLOR_ANALYSIS_VERSION = 3;
export function colorOptimizationSettings(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid colour optimization settings.');
  const maxFilamentSlots = Number(value.maxFilamentSlots ?? 4);
  if (!Number.isInteger(maxFilamentSlots) || maxFilamentSlots < 1 || maxFilamentSlots > 64) throw new Error('Filament slots must be a whole number from 1 to 64.');
  if (value.enabled !== undefined && typeof value.enabled !== 'boolean') throw new Error('Invalid colour optimization setting.');
  if (value.filamentSlotsConfigured !== undefined && typeof value.filamentSlotsConfigured !== 'boolean') throw new Error('Invalid filament capacity setting.');
  const maxColorChanges = value.maxColorChanges;
  if (maxColorChanges !== undefined && (!Number.isSafeInteger(maxColorChanges) || maxColorChanges < 0)) throw new Error('Maximum color changes must be a nonnegative whole number.');
  return { enabled: value.enabled !== false, maxFilamentSlots, ...(maxColorChanges === undefined ? {} : { maxColorChanges }),
    ...(value.filamentSlotsConfigured === undefined ? {} : { filamentSlotsConfigured: value.filamentSlotsConfigured }) };
}

// Account-scoped, bounded LRU. Only lightweight analyses are retained, never meshes.
export class ColorAnalysisCache {
  constructor({ maxEntries = 2048, maxBytes = 16 * 1024 * 1024 } = {}) { this.entries = new Map(); this.bytes = 0; this.maxEntries = maxEntries; this.maxBytes = maxBytes; this.hits = 0; this.misses = 0; }
  get(key) {
    const entry = this.entries.get(key);
    if (!entry) { this.misses++; return null; }
    this.hits++; this.entries.delete(key); this.entries.set(key, entry); return entry.value;
  }
  set(key, value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value)).byteLength + key.length * 2;
    if (bytes > this.maxBytes) return value;
    if (this.entries.has(key)) { this.bytes -= this.entries.get(key).bytes; this.entries.delete(key); }
    while (this.entries.size && (this.entries.size >= this.maxEntries || this.bytes + bytes > this.maxBytes)) {
      const oldest = this.entries.keys().next().value; this.bytes -= this.entries.get(oldest).bytes; this.entries.delete(oldest);
    }
    this.entries.set(key, { value, bytes }); this.bytes += bytes; return value;
  }
  clearScope(scope) { for (const key of this.entries.keys()) if (key.startsWith(`${scope}\0`)) { this.bytes -= this.entries.get(key).bytes; this.entries.delete(key); } }
}
export const instantColorCache = new ColorAnalysisCache();
const normalizedMaterial = value => String(value || '').trim().toUpperCase().replace(/[\s_]+/g, '-');
const sorted = values => [...new Set(values)].sort();
const channelKey = (color, material) => `${color}|${material}`;
const unavailable = reason => ({ status: 'unavailable', reason, channels: [], materials: [], runs: [] });

/** Conservative triangle/slab occupancy, not contours or toolpaths. O(T + E log E). */
export function analyzeColorLayers(solids, { layerHeight, firstLayerHeight = layerHeight, defaultMaterial = '', scope = 'local', cache = instantColorCache, cacheKey = null, signatureHash = value => value } = {}) {
  const fallback = reason => ({ ...unavailable(reason), materials: sorted(solids.flatMap(solid => (solid.propertyTable || []).map(property => normalizedMaterial(property.material || defaultMaterial))).filter(Boolean)) });
  try {
    if (![layerHeight, firstLayerHeight].every(v => Number.isFinite(v) && v > 0)) return fallback('A positive fixed layer height is required.');
    let floor = Infinity, ceiling = -Infinity, triangleCount = 0;
    for (const solid of solids) {
      const position = solid.geometry.getAttribute('position'), index = solid.geometry.index;
      if (!position || !index || !solid.faceProperties || !solid.propertyTable) return fallback('No per-face colour metadata.');
      triangleCount += index.count / 3;
      if (triangleCount > 2_000_000) return fallback('Model exceeds the colour analysis triangle limit.');

    }
    const key = cacheKey === null ? null : `${scope}\0${cacheKey}`, cached = key === null ? null : cache.get(key);
    if (cached) return cached;
    for (const solid of solids) {
      const position = solid.geometry.getAttribute('position');
      for (let i = 0; i < position.count; i++) { const z = position.getZ(i); if (!Number.isFinite(z)) return fallback('Invalid geometry.'); floor = Math.min(floor, z); ceiling = Math.max(ceiling, z); }
    }
    const finish = value => key === null ? value : cache.set(key, value);
    if (!(ceiling > floor)) return finish(fallback('No volumetric colour geometry.'));
    const layerAt = z => z < firstLayerHeight ? 0 : 1 + Math.floor((z - firstLayerHeight) / layerHeight);
    // Export vertices are commonly Float32. Treat their rounding at an exact
    // layer boundary as the boundary, not an extra mixed-color layer.
    const epsilon = Math.min(layerHeight, firstLayerHeight) * 1e-5
      + Math.max(Math.abs(floor), Math.abs(ceiling)) * 2 ** -23;
    const layerCount = layerAt(ceiling - floor - epsilon) + 1;
    if (layerCount > 100_000) return finish(fallback('Model exceeds the colour analysis layer limit.'));
    const channels = new Map(), events = new Map();
    const event = (layer, channel, delta) => {
      if (!events.has(layer)) events.set(layer, new Map());
      const changes = events.get(layer); changes.set(channel, (changes.get(channel) || 0) + delta);
    };
    for (const solid of solids) {
      const position = solid.geometry.getAttribute('position'), indices = solid.geometry.index.array;
      for (let face = 0; face < indices.length / 3; face++) {
        const property = solid.propertyTable[solid.faceProperties[face]];
        if (!property?.color) return finish(fallback(property?.reason || 'Missing colour metadata.'));
        const material = normalizedMaterial(property.material || defaultMaterial), id = channelKey(property.color, material);
        channels.set(id, { id, color: property.color, material, materialKnown: Boolean(property.material) });
        if (channels.size > 256) return finish(fallback('Too many colour groups for lightweight analysis.'));
        const a = indices[face * 3], b = indices[face * 3 + 1], c = indices[face * 3 + 2];
        const zs = [position.getZ(a), position.getZ(b), position.getZ(c)];
        const low = Math.min(...zs) - floor, high = Math.max(...zs) - floor;
        // Horizontal caps at a colour boundary must not bleed onto the next layer.
        // The side triangles of a closed solid cover its occupied slabs.
        if (high - low <= epsilon) continue;
        const ux = position.getX(b) - position.getX(a), uy = position.getY(b) - position.getY(a), uz = zs[1] - zs[0];
        const vx = position.getX(c) - position.getX(a), vy = position.getY(c) - position.getY(a), vz = zs[2] - zs[0];
        if (Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) <= 1e-15) continue;
        const start = Math.max(0, layerAt(low + epsilon)), end = Math.max(start, layerAt(high - epsilon));
        event(start, id, 1); event(end + 1, id, -1);
      }
    }
    const runs = sweepEvents(events);
    if (!runs.length) return finish(fallback('No volumetric colour geometry.'));
    const occupied = new Set(runs.flatMap(run => run.colors));
    if ([...channels.keys()].some(id => !occupied.has(id))) return finish(fallback('Surface-only colours cannot be estimated reliably.'));
    const materials = sorted([...channels.values()].map(channel => channel.material).filter(Boolean));
    const signature = signatureHash(JSON.stringify(runs));
    return finish({ status: 'ready', version: COLOR_ANALYSIS_VERSION, layerHeight, firstLayerHeight, layerCount, channels: [...channels.values()].sort((a,b) => a.id.localeCompare(b.id)), materials, runs, signature, estimatedSwaps: estimateSwaps(runs) });
  } catch (error) { return fallback(`Colour analysis unavailable: ${String(error.message).slice(0,200)}`); }
}

function sweepEvents(events) {
  const levels = [...events.keys()].sort((a,b) => a-b), active = new Map(), runs = [];
  for (let i = 0; i < levels.length - 1; i++) {
    const level = levels[i];
    for (const [key, delta] of events.get(level)) { const count = (active.get(key) || 0) + delta; if (count > 0) active.set(key, count); else active.delete(key); }
    const colors = [...active.keys()].sort(); if (!colors.length) continue;
    const from = level + 1, to = levels[i + 1], previous = runs.at(-1);
    if (previous && previous.to + 1 === from && JSON.stringify(previous.colors) === JSON.stringify(colors)) previous.to = to;
    else runs.push({ from, to, colors });
  }
  return runs;
}
export function combineColorRuns(analyses) {
  const events = new Map();
  for (const analysis of analyses) for (const run of analysis.runs) for (const id of run.colors) {
    for (const [level, delta] of [[run.from - 1, 1], [run.to, -1]]) {
      if (!events.has(level)) events.set(level, new Map());
      const changes = events.get(level); changes.set(id, (changes.get(id) || 0) + delta);
    }
  }
  return sweepEvents(events);
}
// Track the filament left in the nozzle, including at layer boundaries. Merely
// intersecting adjacent colour sets misses R -> {R,W} -> R's second change.
// This estimates the minimum tool sequence, excluding the initial load.
export function estimateSwaps(runs) {
  let costs = new Map();
  for (const run of runs) {
    const colors = sorted(run.colors), count = run.to - run.from + 1;
    if (!colors.length || count <= 0) continue;
    const step = () => {
      if (!costs.size) { costs = new Map(colors.map(color => [color, colors.length - 1])); return; }
      const cheapest = Math.min(...costs.values());
      const ranked = colors.map(color => [color, costs.get(color) ?? Infinity]).sort((a,b) => a[1] - b[1]);
      costs = new Map(colors.map(color => {
        const same = costs.get(color) ?? Infinity;
        if (colors.length === 1) return [color, Math.min(same, cheapest + 1)];
        const other = ranked[0][0] === color ? ranked[1][1] : ranked[0][1];
        return [color, colors.length - 1 + Math.min(other, cheapest + 1)];
      }));
    };
    step();
    if (count > 1 && colors.length > 1) {
      step();
      // With two colours, the cheaper ending alternates. With three or more,
      // all endings have equal cost after two identical layers.
      const remaining = count - 2, values = [...costs.values()];
      if (colors.length === 2 && remaining % 2) values.reverse();
      costs = new Map(colors.map((color,index) => [color, values[index] + remaining * (colors.length - 1)]));
    }
  }
  return costs.size ? Math.min(...costs.values()) : 0;
}

const materialKey = analysis => JSON.stringify(analysis.materials);
const compatibilityKey = analysis => JSON.stringify([analysis.materials,analysis.layerHeight,analysis.firstLayerHeight]);
const summarizeGroup = items => {
  const analyses = items.map(item => item.colorAnalysis), known = analyses.every(a => a.status === 'ready');
  const distinct = new Map(analyses.map(analysis => [analysis.signature, analysis]));
  const runs = known ? combineColorRuns([...distinct.values()]) : [];
  return { items, known, runs, swaps: known ? estimateSwaps(runs) : null, colors: sorted(analyses.flatMap(a => a.channels.map(c => c.id))), materials: materialKey(analyses[0]) };
};

/** Group first, then use the existing spatial packer unchanged for every fit. */
export function packColorGroups(items, printer, { pack, maxFilamentSlots = 4, maxPlates = MAX_PLATES, maxColorChanges, maxObjectsPerPlate = null, primeTower } = {}) {
  if (maxColorChanges !== undefined) return packColorBudget(items, printer, { pack, maxFilamentSlots, maxPlates, maxColorChanges, maxObjectsPerPlate, primeTower });
  const packCopies = objects => {
    let best, lastError, count = Infinity;
    const lowerBound = minimumPackingPlates(objects, printer, { maxObjectsPerPlate });
    for (const strategy of [{},{rotatedFirst:true},{order:'longest'},{order:'longest',rotatedFirst:true},{order:'shortest'},{order:'shortest',rotatedFirst:true}]) {
      const copies = objects.map(item => ({ ...item }));
      try { pack(copies, printer, { ...strategy, maxObjectsPerPlate, primeTower }); } catch (error) { lastError=error; continue; }
      const plates = Math.max(-1, ...copies.map(item => item.placement.plateIndex)) + 1;
      if (plates < count) { best = copies; count = plates; }
      if (count <= lowerBound) break;
    }
    if (!best) throw lastError;
    return best;
  };
  const baseline = packCopies(items);
  const plateGroups = objects => {
    const map = new Map(); for (const item of objects) { const id = item.placement.plateIndex; if (!map.has(id)) map.set(id, []); map.get(id).push(item); } return [...map.values()].map(summarizeGroup);
  };
  const baselineGroups = plateGroups(baseline);
  const buckets = new Map();
  for (const item of items) {
    const analysis = item.colorAnalysis;
    if (analysis.status === 'ready' && analysis.channels.length > maxFilamentSlots) throw new Error(`${item.name} needs ${analysis.channels.length} filament slots; ${maxFilamentSlots} are available.`);
    const key = `${compatibilityKey(analysis)}:${analysis.status === 'ready' ? analysis.signature : 'unavailable'}`;
    if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(item);
  }
  let groups = [...buckets.values()].flatMap(bucket => plateGroups(packCopies(bucket)));
  // Exact profiles share first. Bounded neighbour searches then fill compatible
  // plates when doing so does not increase estimated swaps. No all-pairs meshes.
  groups.sort((a,b) => a.materials.localeCompare(b.materials) || a.colors.join().localeCompare(b.colors.join()) || a.swaps - b.swaps || a.items[0].index - b.items[0].index);
  const tryMerge = (a, b) => {
    if (maxObjectsPerPlate !== null && a.items.length + b.items.length > maxObjectsPerPlate) return null;
    if (!a.known || !b.known || compatibilityKey(a.items[0].colorAnalysis) !== compatibilityKey(b.items[0].colorAnalysis) || sorted([...a.colors, ...b.colors]).length > maxFilamentSlots) return null;
    // Cheap area bound before asking the existing rectangle packer.
    if ([...a.items, ...b.items].reduce((sum,item) => sum + item.width * item.depth, 0) > (printer.width - 10) * (printer.depth - 10)) return null;
    const copies = packCopies([...a.items, ...b.items]);
    if (copies.some(item => item.placement.plateIndex)) return null;
    return summarizeGroup(copies);
  };
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (let i = 0; i < groups.length; i++) {
      let best = null;
      for (let j = i + 1; j < Math.min(groups.length, i + 25); j++) {
        const merged = tryMerge(groups[i], groups[j]); if (!merged) continue;
        const delta = merged.swaps - groups[i].swaps - groups[j].swaps;
        if (delta <= 0 && (!best || delta < best.delta || delta === best.delta && merged.items.length > best.merged.items.length)) best = { j, merged, delta };
      }
      if (best) { groups[i] = best.merged; groups.splice(best.j, 1); changed = true; }
    }
    if (!changed) break;
  }
  // Respect the existing plate cap, choosing the least costly legal merge if
  // more plates would otherwise be needed. Never exceed slots or mix materials.
  while (groups.length > maxPlates) {
    let best = null;
    for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < Math.min(groups.length, i + 25); j++) {
      const merged = tryMerge(groups[i], groups[j]); if (!merged) continue;
      const delta = merged.swaps - groups[i].swaps - groups[j].swaps;
      if (!best || delta < best.delta) best = { i, j, merged, delta };
    }
    if (!best) throw new Error(`This batch needs more than ${maxPlates} plates with the selected filament slots and material separation. Split the order file.`);
    groups[best.i] = best.merged; groups.splice(best.j, 1);
  }
  const baselineFeasible = baselineGroups.length <= maxPlates && baselineGroups.every(group => group.known && group.colors.length <= maxFilamentSlots && group.items.every(item => compatibilityKey(item.colorAnalysis) === compatibilityKey(group.items[0].colorAnalysis)));
  const before = baselineGroups.every(group => group.known) ? baselineGroups.reduce((n,g) => n + g.swaps, 0) : null;
  let after = groups.every(group => group.known) ? groups.reduce((n,g) => n + g.swaps, 0) : null;
  if (baselineFeasible && (before < after || before === after && baselineGroups.length < groups.length)) { groups = baselineGroups; after = before; }
  groups.sort((a,b) => Math.min(...a.items.map(item => item.index)) - Math.min(...b.items.map(item => item.index)));
  const originals = new Map(items.map(item => [item.index, item]));
  for (const [plateIndex, group] of groups.entries()) for (const item of group.items) originals.get(item.index).placement = { ...item.placement, plateIndex };
  return { primeTowers: primeTowerReservations(items), plateCount: groups.length, estimatedSwaps: after, baselineSwaps: before, baselineFeasible, baselinePlateCount: baselineGroups.length,
    plates: groups.map((group,index) => ({ plate: plateIdAt(index), objectIndices: group.items.map(item => item.index), estimatedSwaps: group.swaps, filamentSlots: group.known ? group.colors.length : null, materials: group.known ? JSON.parse(group.materials) : [], colors: group.colors, runs: group.runs })) };
}


// Workspace-wide budget: grids/materials remain separate, but share one allowance.
export function packColorBudget(items, printer, options) {
  const { maxColorChanges, maxFilamentSlots } = colorOptimizationSettings(options);
  const { pack, maxPlates = MAX_PLATES, maxObjectsPerPlate = null, primeTower } = options;
  if (maxColorChanges === undefined) throw new Error('A color-change budget is required.');
  if (items.some(item => item.colorAnalysis.status !== 'ready')) throw new Error('Cannot verify the color-change limit: some color estimates are unavailable. Layout unchanged.');
  const key = item => JSON.stringify([item.colorAnalysis.materials, item.colorAnalysis.layerHeight, item.colorAnalysis.firstLayerHeight]);
  const packCopies = (objects,strategy) => { const copies = objects.map(item => ({ ...item })); pack(copies, printer, { ...strategy, maxObjectsPerPlate, primeTower }); return copies; };
  const groupsFor = (objects,strategy) => {
    const plates = new Map();
    for (const item of packCopies(objects,strategy)) {
      const id = item.placement.plateIndex;
      if (!plates.has(id)) plates.set(id, []);
      plates.get(id).push(item);
    }
    return [...plates.values()].map(group => ({ ...summarizeGroup(group), key: key(group[0]) }));
  };
  const seeds = new Map(), compact = new Map();
  for (const item of items) {
    if (item.colorAnalysis.channels.length > maxFilamentSlots) throw new Error(`${item.name} needs more than ${maxFilamentSlots} filament slots.`);
    const groupKey = key(item), seedKey = `${groupKey}:${item.colorAnalysis.signature}`;
    for (const [map, id] of [[seeds, seedKey], [compact, groupKey]]) {
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(item);
    }
  }
  let groups = [...seeds.values()].flatMap(bucket=>groupsFor(bucket));
  const baseline = [...compact.values()].flatMap(bucket=>groupsFor(bucket));
  const cost = groups => groups.reduce((sum, group) => sum + group.swaps, 0);
  const baselineSwaps = cost(baseline);
  const baselineFeasible = baseline.every(group => group.colors.length <= maxFilamentSlots);
  groups.sort((a,b) => a.key.localeCompare(b.key) || a.colors.join().localeCompare(b.colors.join()) || a.items[0].index-b.items[0].index);
  let total = cost(groups), lowest = baselineFeasible ? Math.min(total, baselineSwaps) : total;
  const cache = new WeakMap();
  const merge = (a,b) => {
    let row = cache.get(a); if (!row) { row = new WeakMap(); cache.set(a,row); }
    if (row.has(b)) return row.get(b);
    let result = null;
    if ((maxObjectsPerPlate === null || a.items.length + b.items.length <= maxObjectsPerPlate) && a.key === b.key && new Set([...a.colors,...b.colors]).size <= maxFilamentSlots) {
      const objects = [...a.items,...b.items];
      if (objects.reduce((sum,item)=>sum+item.width*item.depth,0) <= (printer.width-10)*(printer.depth-10)) {
        const packed = packCopies(objects);
        if (packed.every(item=>item.placement.plateIndex===0)) result = { ...summarizeGroup(packed), key:a.key };
      }
    }
    row.set(b,result); return result;
  };
  for (;;) {
    let best = null;
    for (let i=0;i<groups.length;i++) for (let j=i+1;j<Math.min(groups.length,i+25);j++) {
      const merged = merge(groups[i],groups[j]); if (!merged) continue;
      const delta = merged.swaps-groups[i].swaps-groups[j].swaps;
      if ((delta<=0 || total+delta<=maxColorChanges) && (!best || delta<best.delta)) best={i,j,merged,delta};
    }
    if (!best) break;
    total+=best.delta; lowest=Math.min(lowest,total);
    groups[best.i]=best.merged; groups.splice(best.j,1);
  }
  const valid = candidate => candidate.length<=maxPlates && cost(candidate)<=maxColorChanges && candidate.every(group=>group.colors.length<=maxFilamentSlots);
  const compare = (a,b) => a.length-b.length || cost(a)-cost(b);
  const candidates = [groups, ...(baselineFeasible ? [baseline] : [])].filter(valid).sort(compare);
  const packingLowerBound = [...compact.values()].reduce((sum,bucket)=>sum+Math.max(
    minimumPackingPlates(bucket,printer,{maxObjectsPerPlate}),
    Math.ceil(new Set(bucket.flatMap(item=>item.colorAnalysis.channels.map(channel=>channel.id))).size/maxFilamentSlots)
  ),0);
  // First-fit packing can strand space even with a generous color budget. Try
  // bounded, deterministic object orders and rotations against the whole batch.
  // Stop once a valid result meets the physical/compatibility lower bound.
  let packingTrials=1;
  for (const strategy of [{rotatedFirst:true},{order:'longest'},{order:'longest',rotatedFirst:true},{order:'shortest'},{order:'shortest',rotatedFirst:true}]) {
    if (candidates[0]?.length<=packingLowerBound) break;
    let alternative;
    packingTrials++;
    try { alternative=[...compact.values()].flatMap(bucket=>groupsFor(bucket,strategy)); }
    catch { continue; } // A different ordering may exceed the packer's plate cap.
    if (alternative.every(group=>group.colors.length<=maxFilamentSlots)) lowest=Math.min(lowest,cost(alternative));
    if (valid(alternative)) { candidates.push(alternative); candidates.sort(compare); }
  }
  if (!candidates.length) throw new Error(`No arrangement found within ${maxColorChanges} estimated changes and ${maxPlates} plates. Lowest estimate found: ~${lowest} changes. Layout unchanged.`);
  groups=candidates[0];
  groups.sort((a,b)=>Math.min(...a.items.map(item=>item.index))-Math.min(...b.items.map(item=>item.index)));
  const originals=new Map(items.map(item=>[item.index,item]));
  for (const [plateIndex,group] of groups.entries()) for (const item of group.items) originals.get(item.index).placement={...item.placement,plateIndex};
  return {primeTowers:primeTowerReservations(items),plateCount:groups.length,estimatedSwaps:cost(groups),maxColorChanges,baselineSwaps,baselineFeasible,baselinePlateCount:baseline.length,packingTrials,packingLowerBound};
}
