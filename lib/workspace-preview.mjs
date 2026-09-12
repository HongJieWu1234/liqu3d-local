import { DOMParser } from '@xmldom/xmldom';
import { Matrix4 } from '../public/vendor/three/three.module.js';
import { readSolid3mf } from '../public/solid-3mf.js';
import { objectRenderTargets, stableRenderKey } from '../public/object-render-state.js';
import { currentObjectPlate } from '../public/object-plate-location.js';
import { isValidPlateId, comparePlateIds } from '../public/plate-ids.js';
import { PRINTERS, createDefaultProfile } from '../public/print-settings-schema.js';
import { parallelWork } from './parallel-work.mjs';
import { workspacePreviewImage } from './workspace-preview-image.mjs';

// Reuse editor objects and render inputs. Stored offsets are Y-up; convert
// them to the printer's Z-up basis without rearranging or moving the objects.
export async function workspacePreviewScene(data, { metadata, render, concurrency = 2 }) {
  const printer = PRINTERS[data.printProfile?.printer] || PRINTERS[createDefaultProfile().printer];
  const plateIds = new Set((data.loadedPlateIds || []).filter(isValidPlateId));
  for (const source of data.plates || []) {
    plateIds.add(source.defaultPlateId || 'A');
    for (const record of Object.values(source.objectRecords || {})) {
      if (!record.deleted) plateIds.add(currentObjectPlate(record, source.defaultPlateId || 'A'));
    }
  }
  const plateId = [...plateIds].filter(isValidPlateId).sort(comparePlateIds)[0] || 'A';
  const palette = [], geometries = [], requests = new Map(), objects = [];
  const slot = color => {
    color = color || '#D9DDE5';
    let index = palette.indexOf(color);
    if (index < 0) { index = palette.length; palette.push(color); }
    return index;
  };
  const dispose = () => { for (const geometry of geometries) geometry.dispose(); };
  try {
    for (const source of data.plates || []) {
      const info = metadata(source.source);
      const objectDefs = info.objects.filter(def => !source.objectBinding || source.objectBinding.memberIds.includes(Number(def.id)));
      for (const target of objectRenderTargets({ ...source, objectDefs })) {
        const record = source.objectRecords?.[target.key];
        if (currentObjectPlate(record, source.defaultPlateId || 'A') !== plateId) continue;
        const object = { name: record?.label || source.sourceName, parts: [], requests: [], offset: source.objectTransforms?.[target.key] || {} };
        for (const def of target.defs) {
          const extra = { source: source.source, sourceName: source.sourceName, packageId: source.packageId, packageEntry: source.packageEntry,
            ...(def.id === 'model' ? {} : { objectId: Number(def.id) }), previewQuality: true, background: true, allowEmpty: true };
          const key = stableRenderKey([extra, target.values]);
          if (!requests.has(key)) requests.set(key, { values: target.values, extra });
          object.requests.push(key);
        }
        objects.push(object);
      }
    }
    await parallelWork([...requests.values()], concurrency, async (request, index, signal) => {
      const bytes = await render(request.values, '3mf', { ...request.extra, signal });
      request.solids = bytes.length ? readSolid3mf(Uint8Array.from(bytes).buffer, xml => new DOMParser().parseFromString(xml, 'application/xml')) : [];
      geometries.push(...request.solids.map(solid => solid.geometry));
    });
    for (const object of objects) {
      const offset = object.offset;
      const matrix = new Matrix4().makeTranslation(printer.width / 2 + (Number(offset.x) || 0), printer.depth / 2 - (Number(offset.z) || 0), Number(offset.y) || 0)
        .multiply(new Matrix4().makeRotationZ(Number(offset.rotation) || 0));
      for (const key of object.requests) for (const solid of requests.get(key).solids) {
        const geometry = solid.geometry.clone().applyMatrix4(matrix);
        geometries.push(geometry);
        object.parts.push({ geometry, materialIndex: slot(solid.colors?.[0]), materialIndices: solid.colors ? Uint32Array.from(solid.colors, slot) : undefined });
      }
      delete object.requests; delete object.offset;
    }
    return { printer, plates: [{ id: plateId, objects: objects.filter(object => object.parts.length), palette,
      primeTower: data.primeTowers?.find(tower => tower.plateId === plateId) }], dispose };
  } catch (error) { dispose(); throw error; }
}

export async function workspacePreviewPng(data, options) {
  const scene = await workspacePreviewScene(data, options);
  try { return workspacePreviewImage(scene.plates, scene.printer, { accent: options.accent }); }
  finally { scene.dispose(); }
}
