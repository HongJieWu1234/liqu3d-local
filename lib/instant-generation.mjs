import { parallelWork } from './parallel-work.mjs';
import { randomUUID } from 'node:crypto';
import { DOMParser } from '@xmldom/xmldom';
import { Box3, Matrix4, Vector3 } from '../public/vendor/three/three.module.js';
import { readSolid3mf } from '../public/solid-3mf.js';
import { packBambuPlateArchive } from '../public/core-3mf.js';
import { PRINTERS } from '../public/print-settings-schema.js';
import { analyzeColorLayers, colorOptimizationSettings, packColorGroups } from './instant-color-optimization.mjs';

import { arrangeObjects } from '../public/plate-packing.js';
import { plateIdAt } from '../public/plate-ids.js';
import { normalizeMaxObjectsPerPlate } from '../public/packing-settings.js';
import { orientedFootprint } from '../public/oriented-footprint.js';
import { normalizePrimeTowerSettings, primeTowerReservations } from '../public/prime-tower.js';
export { arrangeObjects } from '../public/plate-packing.js';

export async function generateInstant(snapshot, { render, profileTemplate, signal, progress, cacheScope = 'local', concurrency = 1 }) {
  const { source, packageId, entry, resolved, group, printProfile, name } = snapshot;
  const printer = PRINTERS[printProfile.printer];
  const template = await profileTemplate(printProfile);
  if (!template) throw new Error('Print settings could not be embedded in the 3MF.');
  const maxObjectsPerPlate = normalizeMaxObjectsPerPlate(snapshot.maxObjectsPerPlate);
  const primeTower = normalizePrimeTowerSettings(template);
  const packingOptions = { maxObjectsPerPlate, primeTower };
  // Old durable snapshots keep their original packing behavior on recovery.
  const optimization = colorOptimizationSettings(snapshot.colorOptimization || { enabled: false });
  const budgetMode = optimization.enabled && optimization.maxColorChanges !== undefined;
  const layerHeight = Number(template.config?.layer_height || printProfile.settings.layer_height);
  const firstLayerHeight = Number(template.config?.initial_layer_print_height || printProfile.settings.initial_layer_print_height || layerHeight);
  const geometries = [], unique = new Map(), items = [], skipped = [], unoptimized = [];
  const analyses = new WeakMap();
  try {
    const groups = new Map();
    for (const object of resolved.objects) {
      const key = JSON.stringify(object.values);
      if (!groups.has(key)) groups.set(key, { key, values: object.values, copies: 0 });
      groups.get(key).copies++;
    }
    let completed = 0;
    await parallelWork([...groups.values()], concurrency, async ({ key, values, copies }, _index, jobSignal) => {
      const solids = [];
      try {
        for (const member of group.memberIds.length ? group.memberIds : [null]) {
          const data = await render(values, '3mf', { source, sourceName: entry, packageId, packageEntry: entry, objectId: member ?? undefined, signal: jobSignal, background: true });
          const parts = readSolid3mf(data, text => new DOMParser().parseFromString(text, 'application/xml'), { colorMetadata: true });
          solids.push(...parts); geometries.push(...parts.map(solid => solid.geometry));
        }
        unique.set(key, solids);
      } catch (error) {
        if (jobSignal.aborted) throw error;
        unique.set(key, error);
      }
      completed += copies;
      await progress(completed, resolved.objectCount, 'Rendering');
    }, signal);
    for (const [index, object] of resolved.objects.entries()) {
      if (signal.aborted) throw new Error('Generation cancelled.');
      try {
      const solids = unique.get(JSON.stringify(object.values));
      if (solids instanceof Error) throw solids;
      const bounds = new Box3();
      for (const solid of solids) { solid.geometry.computeBoundingBox(); bounds.union(solid.geometry.boundingBox); }
      if (bounds.isEmpty() || !Number.isFinite(bounds.max.z)) throw new Error(`Order ${object.order} produced no printable geometry.`);
      const printableHeight = Number(template.config?.printable_height);
      if (printableHeight > 0 && bounds.max.z - bounds.min.z > printableHeight) throw new Error(`Order ${object.order} exceeds the printer's ${printableHeight} mm build height.`);
      const labelParam = group.labelParam || Object.keys(object.values).find(key => /name_text|label_text|^name$/.test(key));
      const label = String(object.values[labelParam] || `Order ${object.order}`);
      const footprint = orientedFootprint(solids.map(solid => ({geometry:{positions:solid.geometry.attributes.position.array}})));
      const fitBounds = new Box3(new Vector3(footprint.minX, footprint.minY, bounds.min.z), new Vector3(footprint.maxX, footprint.maxY, bounds.max.z));
      const towerChannels = [...new Set(solids.flatMap(solid => solid.colors?.length ? solid.colors : ['#D9DDE5']).map(color => String(color || '#D9DDE5').toUpperCase()))];
      const item = { ...object, index, id: randomUUID(), name: `${label} · ${object.order}.${object.copy}`, solids, bounds, fitBounds, fitRotation: footprint.rotation,
        width: footprint.maxX - footprint.minX, depth: footprint.maxY - footprint.minY, height: bounds.max.z - bounds.min.z, towerChannels };
      if (optimization.enabled || primeTower.enable_prime_tower) {
        if (!analyses.has(solids)) analyses.set(solids, analyzeColorLayers(solids, { layerHeight, firstLayerHeight, defaultMaterial: printProfile.settings.filament_type, scope: cacheScope }));
        item.colorAnalysis = analyses.get(solids);
      }
      if (optimization.enabled) {
        if (item.colorAnalysis.channels.length > optimization.maxFilamentSlots) throw new Error(`Needs ${item.colorAnalysis.channels.length} filament slots; ${optimization.maxFilamentSlots} are available.`);
        if (item.colorAnalysis.status !== 'ready') unoptimized.push({ index, order: object.order, copy: object.copy, reason: item.colorAnalysis.reason });
      }
      arrangeObjects([item], printer, packingOptions); // Isolate oversized or invalid models too.
      items.push(item);
      } catch (error) {
        if (signal.aborted) throw error;
        skipped.push({ index, order: object.order, copy: object.copy, reason: String(error.message).slice(0,500) });
      }
    }
    if (budgetMode && skipped.length) throw new Error(`Cannot apply the color-change limit to every order: ${skipped[0].reason}`);
    for (;;) {
    if (!items.length) throw new Error(`Could not create the 3MF. ${skipped[0]?.reason || 'The SCAD produced no printable geometry.'}`);
    const attemptGeometryStart = geometries.length;
    await progress(items.length, resolved.objectCount, optimization.enabled ? 'Grouping colours' : 'Arranging objects');
    const grouping = optimization.enabled ? packColorGroups(items, printer, { pack: arrangeObjects, ...packingOptions, maxFilamentSlots: optimization.maxFilamentSlots, maxColorChanges: optimization.maxColorChanges }) : { plateCount: arrangeObjects(items, printer, packingOptions) };
    const primeTowers = primeTowerReservations(items).map(({plateIndex,...tower}) => ({plateId:plateIdAt(plateIndex),...tower}));
    const plateCount = grouping.plateCount, palette = [];
    const colorOptimization = { ...optimization, layerHeight, firstLayerHeight, analyzedCount: optimization.enabled ? items.length - unoptimized.length : 0, unoptimized, skipped, ...grouping };
    const colorSlot = hex => { const color = String(hex || '#D9DDE5').toUpperCase(); let index = palette.indexOf(color); if (index < 0) { index = palette.length; palette.push(color); } return index; };
    const plateModels = Array.from({ length: plateCount }, (_, i) => ({ id: plateIdAt(i), name: `Plate ${plateIdAt(i)}`, primeTower: primeTowers.find(tower => tower.plateId === plateIdAt(i)) || null, objects: [] }));
    const recordKey = group.memberIds.length ? `group:${group.key}` : 'model';
    const records = {}, transforms = {}, instances = [];
    for (const item of items) {
      const rotation = new Matrix4().makeRotationZ(item.fitRotation + item.placement.rotation);
      const rotatedBounds = item.fitBounds.clone().applyMatrix4(new Matrix4().makeRotationZ(item.placement.rotation));
      const dx = item.placement.x - rotatedBounds.min.x, dy = item.placement.y - rotatedBounds.min.y, dz = -rotatedBounds.min.z;
      const transform = new Matrix4().makeTranslation(dx, dy, dz).multiply(rotation);
      const parts = item.solids.map(solid => {
        const geometry = solid.geometry.clone().applyMatrix4(transform); geometries.push(geometry);
        return { name: solid.name, geometry, materialIndex: colorSlot(solid.colors?.[0]), materialIndices: solid.colors ? Uint32Array.from(solid.colors, colorSlot) : undefined };
      });
      const plateId = plateIdAt(item.placement.plateIndex);
      plateModels[item.placement.plateIndex].objects.push({ name: item.name, parts, instantIndex: item.index });
      const selectionKey = item === items[0] ? recordKey : `instance:${item.id}`;
      records[selectionKey] = { id: item.id, selectionKey, sourceKey: recordKey, label: item.name, plateId, configuration: { parameters: structuredClone(item.values) }, printOverrides: {} };
      transforms[selectionKey] = { x: dx - printer.width / 2, z: printer.depth / 2 - dy, y: dz, rotation: item.fitRotation + item.placement.rotation };
      if (item !== items[0]) instances.push({ id: item.id, sourceKey: recordKey, productionSourceId: items[0].id, memberIds: group.memberIds, label: item.name, plateId, configuration: { parameters: structuredClone(item.values) } });
    }
    const recipeRequests=[], requestIds=new Map();
    const recipeObjects=items.map(item=>{
      const rotation=new Matrix4().makeRotationZ(item.fitRotation+item.placement.rotation),b=item.fitBounds.clone().applyMatrix4(new Matrix4().makeRotationZ(item.placement.rotation));
      const matrix=new Matrix4().makeTranslation(item.placement.x-b.min.x,item.placement.y-b.min.y,-b.min.z).multiply(rotation).toArray();
      const contributions=(group.memberIds.length?group.memberIds:[null]).map(member=>{
        const request={source:0,values:structuredClone(item.values),format:'3mf',...(member===null?{}:{objectId:member})},key=JSON.stringify(request);
        if(!requestIds.has(key)){requestIds.set(key,recipeRequests.length);recipeRequests.push(request);}
        return {request:requestIds.get(key),matrix};
      });
      return {id:item.id,name:item.name,plateId:plateIdAt(item.placement.plateIndex),settings:{},contributions};
    });
    const recipe={version:1,title:name,scope:'all',profile:printProfile,primeTowers,sources:[{source,sourceName:entry,packageId,packageEntry:entry}],requests:recipeRequests,objects:recipeObjects,
      plateNames:Object.fromEntries(plateModels.map(plate=>[plate.id,plate.name])),workflow:{colorOptimization:optimization,maxObjectsPerPlate,primeTower,orderCount:resolved.orderCount,objectCount:items.length,plateCount,skipped,objects:Object.values(records)}};
    const sourceId = randomUUID();
    const workspace = { version: 1, printProfile, colorOptimization: optimization, maxObjectsPerPlate, primeTowers, activeSourceInstanceId: sourceId, activeViewPlateId: 'A', loadedPlateIds: plateModels.map(p=>p.id), batchPlateMeta: Object.fromEntries(plateModels.map(p=>[p.id,{name:p.name,hidden:false}])), plates: [{ sourceInstanceId: sourceId, sourceName: entry.split('/').pop(), source, packageId, packageEntry: entry, values: items[0].values, baseValues: items[0].values, defaultPlateId: records[recordKey].plateId, objectBinding: { selectionKey: recordKey, memberIds: group.memberIds }, objectRecords: records, objectTransforms: transforms, batchInstances: instances }] };
    await progress(items.length, items.length, 'Packing 3MF');
    let archive, archiveExtension, mimeType;
    try { const packed = packBambuPlateArchive({ title: name, application: 'Liqu3D Quick batch', plates: plateModels, palette, bambuTemplate: template, bedSize: printer, primeTowerSettings: primeTower,
      attachments: { 'print-profile.json': JSON.stringify(printProfile), 'workflow.json': JSON.stringify({ orderCount: resolved.orderCount, objectCount: items.length, plateCount, skipped, objects: Object.values(records) }),
        'color-optimization.json': JSON.stringify({ ...colorOptimization,
          analyses: Object.fromEntries(items.filter(item => item.colorAnalysis?.signature).map(item => [item.colorAnalysis.signature, item.colorAnalysis])),
          models: items.map(item => ({ index: item.index, order: item.order, copy: item.copy, name: item.name, analysis: item.colorAnalysis?.signature || null })) }) } });
      archive = packed.archive; archiveExtension = packed.extension; mimeType = packed.mimeType;
    } catch (error) {
      const failedIndex = Number.isInteger(error.exportObjectIndex) ? plateModels.flatMap(plate => plate.objects)[error.exportObjectIndex]?.instantIndex : undefined;
      const failed = items.find(item => item.index === failedIndex);
      if (budgetMode || !failed || signal.aborted) throw error;
      // Native export already validates topology. Use its failure identity to
      // discard only the broken geometry and retry packing, without rendering
      // again or adding a second topology pass to every healthy model.
      for (let i = items.length - 1; i >= 0; i--) if (items[i].solids === failed.solids) {
        const item = items.splice(i, 1)[0]; skipped.push({ index: item.index, order: item.order, copy: item.copy, reason: String(error.message).slice(0,500) });
        const fallbackIndex = unoptimized.findIndex(entry => entry.index === item.index); if (fallbackIndex >= 0) unoptimized.splice(fallbackIndex, 1);
      }
      for (const geometry of geometries.splice(attemptGeometryStart)) geometry.dispose();
      continue;
    }
    // The full per-layer report lives in the archive, not every status poll.
    const { plates, ...summary } = colorOptimization;
    return { archive: Buffer.from(archive), archiveExtension, mimeType, primeTowers, recipe, workspace, plateCount, objectCount: items.length, orderCount: resolved.orderCount, colorOptimization: summary, skippedCount: skipped.length };
    }
  } finally { for (const geometry of geometries) geometry.dispose(); }
}
