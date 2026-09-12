import { strToU8, zipSync } from './vendor/three/addons/libs/fflate.module.js';
import { plateIdAt, isValidPlateId, MAX_PLATES } from './plate-ids.js';
import { primeTowerConfig } from './prime-tower.js?v=tower-free1';

// Bambu Studio's PartPlate.hpp defines MAX_PLATE_COUNT as 36.
export const BAMBU_MAX_PLATES = 36;

const CORE_NS = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02';
const MATERIAL_NS = 'http://schemas.microsoft.com/3dmanufacturing/material/2015/02';
const REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const CONTENT_TYPES_NS = 'http://schemas.openxmlformats.org/package/2006/content-types';

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function cleanName(value, fallback) {
  const result = String(value || fallback)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return result.slice(0, 240) || fallback;
}

function numberText(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error('3MF geometry contains a non-finite coordinate.');
  const rounded = Math.abs(number) < 1e-9 ? 0 : Math.round(number * 1e6) / 1e6;
  return String(rounded);
}

function normalizedColor(value) {
  const match = String(value || '').trim().match(/^#?([0-9a-f]{6})(?:[0-9a-f]{2})?$/i);
  return match ? `#${match[1].toUpperCase()}FF` : '#D9DDE5FF';
}

function validateMaterial(index, colorCount) {
  if (!Number.isInteger(index) || index < 0 || index >= colorCount) throw new Error('3MF colour index is outside its palette.');
  return index;
}

function meshXml(geometry, materialIndices, defaultMaterial, colorCount, bambu, worldOffset = null) {
  const coordinates = geometry?.positions;
  const position = coordinates ? {
    itemSize: 3, count: coordinates.length / 3,
    getX: (i) => coordinates[i * 3], getY: (i) => coordinates[i * 3 + 1], getZ: (i) => coordinates[i * 3 + 2]
  } : geometry?.getAttribute?.('position');
  if (!position || position.itemSize < 3 || position.count < 3) {
    throw new Error('3MF export found an empty mesh.');
  }

  const vertices = [];
  const vertexIds = new Map();
  const remap = new Uint32Array(position.count);
  for (let index = 0; index < position.count; index += 1) {
    const x = numberText(position.getX(index) + (Number(worldOffset?.x) || 0));
    const y = numberText(position.getY(index) + (Number(worldOffset?.y) || 0));
    const z = numberText(position.getZ(index) + (Number(worldOffset?.z) || 0));
    const key = `${x},${y},${z}`;
    let id = vertexIds.get(key);
    if (id === undefined) {
      id = vertices.length;
      vertexIds.set(key, id);
      vertices.push(`<vertex x="${x}" y="${y}" z="${z}"/>`);
    }
    remap[index] = id;
  }

  const geometryIndex = geometry.getIndex?.();
  const indices = geometry.indices || geometryIndex?.array || null;
  const count = indices ? indices.length : position.count;
  if (count % 3 !== 0) throw new Error('3MF export requires triangle geometry.');
  if (materialIndices && materialIndices.length !== count / 3) throw new Error('3MF triangle colours do not match the geometry.');
  const triangles = [];
  const edges = new Map();
  const addEdge = (a, b) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    const edge = edges.get(key) || { count: 0, direction: 0 };
    edge.count += 1;
    edge.direction += a < b ? 1 : -1;
    edges.set(key, edge);
  };
  for (let offset = 0; offset < count; offset += 3) {
    const v1 = Number(indices ? indices[offset] : offset);
    const v2 = Number(indices ? indices[offset + 1] : offset + 1);
    const v3 = Number(indices ? indices[offset + 2] : offset + 2);
    if (![v1, v2, v3].every((value) => Number.isInteger(value) && value >= 0 && value < position.count)) {
      throw new Error('3MF export found an invalid triangle index.');
    }
    const a = remap[v1], b = remap[v2], c = remap[v3];
    if (a === b || b === c || c === a) continue;
    const material = validateMaterial(materialIndices ? materialIndices[offset / 3] : defaultMaterial, colorCount);
    // Explicit, identical vertex colours avoid interpolation and slicer-specific
    // inheritance differences. Keep each complete solid intact.
    // Bambu's unsplit-face paint encoding, alongside portable 3MF colours.
    let paint = '';
    if (bambu && material !== defaultMaterial) {
      let state = material + 1;
      let code = state < 3 ? (state << 2).toString(16) : 'C';
      if (state >= 3) { state -= 3; while (state >= 15) { code = `F${code}`; state -= 15; } code = `${state.toString(16)}${code}`; }
      paint = ` paint_color="${code.toUpperCase()}"`;
    }
    triangles.push(`<triangle v1="${a}" v2="${b}" v3="${c}" pid="1" p1="${material}" p2="${material}" p3="${material}"${paint}/>`);
    addEdge(a, b); addEdge(b, c); addEdge(c, a);
  }

  if (!triangles.length) throw new Error('3MF export found an empty solid.');
  for (const edge of edges.values()) {
    if (edge.count !== 2 || edge.direction !== 0) throw new Error('A part is not a closed, consistently oriented solid. Check the SCAD geometry before exporting.');
  }

  return `<mesh><vertices>${vertices.join('')}</vertices><triangles>${triangles.join('')}</triangles></mesh>`;
}

function pathSafeAttachmentName(value) {
  const base = String(value || 'metadata.txt').split(/[\\/]/).pop() || 'metadata.txt';
  const cleaned = base.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^\.+/, '').slice(0, 120);
  return cleaned || 'metadata.txt';
}

function objectSettingsXml(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return '';
  return Object.entries(settings).flatMap(([key, value]) => {
    if (!/^[A-Za-z0-9_]+$/.test(key) || key === 'name' || key === 'extruder' || value === undefined || value === null) return [];
    const serialized = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
    return [`<metadata key="${escapeXml(key)}" value="${escapeXml(serialized)}"/>`];
  }).join('');
}

export function packCore3mf({ title, application = 'Liqu3D', objects, palette, bambuTemplate, attachments = null, plateDefinitions = null, primeTowerSettings = null }) {
  if (!Array.isArray(objects) || !objects.length) throw new Error('There is no geometry to export.');
  let colors = Array.isArray(palette) && palette.length ? palette.map(normalizedColor) : ['#D9DDE5FF'];
  // Each plate gets only its used colours, with all references remapped together.
  const used = new Set();
  for (const object of objects) for (const part of object.parts || []) {
    validateMaterial(part.materialIndex ?? 0, colors.length);
    if (part.materialIndices?.length) for (const index of part.materialIndices) used.add(validateMaterial(index, colors.length));
    else used.add(part.materialIndex ?? 0);
  }
  const remap = new Map();
  const compact = [];
  for (const index of [...used].sort((a, b) => a - b)) {
    let slot = compact.indexOf(colors[index]);
    if (slot < 0) { slot = compact.length; compact.push(colors[index]); }
    remap.set(index, slot);
  }
  objects = objects.map((object) => ({ ...object, parts: object.parts?.map((part) => ({ ...part,
    materialIndex: remap.get(part.materialIndices?.[0] ?? part.materialIndex ?? 0),
    materialIndices: part.materialIndices ? Uint32Array.from(part.materialIndices, (index) => remap.get(index)) : undefined
  })) }));
  colors = compact;
  const resources = [
    // Bambu's standard-3MF colour importer reads colorgroup, not the Core
    // basematerials displaycolor hint. Do not invent printer/filament presets.
    `<m:colorgroup id="1">${colors.map((color) => `<m:color color="${color}"/>`).join('')}</m:colorgroup>`
  ];
  const buildItems = [];
  const projectObjects = [];
  const projectInstancesByPlate = new Map();
  let nextId = 2;

  for (const [objectIndex, object] of objects.entries()) {
    if (!Array.isArray(object.parts) || !object.parts.length) continue;
    const componentIds = [];
    const projectParts = [];
    for (const [partIndex, part] of object.parts.entries()) {
      const materialIndex = validateMaterial(part.materialIndex ?? 0, colors.length);
      const partId = nextId++;
      let mesh;
      try { mesh = meshXml(part.geometry, part.materialIndices, materialIndex, colors.length, Boolean(bambuTemplate), object.worldOffset); }
      catch (error) { error.exportObjectIndex = objectIndex; throw error; }
      resources.push(
        `<object id="${partId}" type="model" name="${escapeXml(cleanName(part.name, `Part ${partIndex + 1}`))}" pid="1" pindex="${materialIndex}">${mesh}</object>`
      );
      projectParts.push(`<part id="${partId}" subtype="normal_part"><metadata key="name" value="${escapeXml(cleanName(part.name, `Part ${partIndex + 1}`))}"/><metadata key="extruder" value="${materialIndex + 1}"/></part>`);
      componentIds.push(partId);
    }
    if (!componentIds.length) continue;
    const objectId = nextId++;
    resources.push(
      `<object id="${objectId}" type="model" name="${escapeXml(cleanName(object.name, `Object ${objectIndex + 1}`))}"><components>${componentIds.map((id) => `<component objectid="${id}"/>`).join('')}</components></object>`
    );
    buildItems.push(`<item objectid="${objectId}"/>`);
    projectObjects.push(`<object id="${objectId}"><metadata key="name" value="${escapeXml(cleanName(object.name, `Object ${objectIndex + 1}`))}"/><metadata key="extruder" value="1"/>${objectSettingsXml(object.settings)}${projectParts.join('')}</object>`);
    const plateKey = String(object.plateId || 'A').slice(0, 12) || 'A';
    if (!projectInstancesByPlate.has(plateKey)) projectInstancesByPlate.set(plateKey, []);
    projectInstancesByPlate.get(plateKey).push(`<model_instance><metadata key="object_id" value="${objectId}"/><metadata key="instance_id" value="0"/><metadata key="identify_id" value="${objectId}"/></model_instance>`);
  }

  if (!buildItems.length) throw new Error('There is no geometry to export.');
  const model = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<model unit="millimeter" xml:lang="en-US" xmlns="${CORE_NS}" xmlns:m="${MATERIAL_NS}" requiredextensions="m"${bambuTemplate ? ' xmlns:BambuStudio="http://schemas.bambulab.com/package/2021"' : ''}>`,
    `<metadata name="Title" preserve="1">${escapeXml(cleanName(title, 'Parametric model'))}</metadata>`,
    // Bambu requires this compatibility marker to load project settings at all.
    `<metadata name="Application" preserve="1">${bambuTemplate ? 'BambuStudio-2.3.4' : escapeXml(cleanName(application, 'Liqu3D'))}</metadata>`,
    ...(bambuTemplate ? [`<metadata name="BambuStudio:3mfVersion">1</metadata>`, `<metadata name="Description">Exported by ${escapeXml(application)} as a Bambu-compatible project.</metadata>`] : []),
    `<resources>${resources.join('')}</resources>`,
    `<build>${buildItems.join('')}</build>`,
    '</model>'
  ].join('');

  const contentTypes = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<Types xmlns="${CONTENT_TYPES_NS}">`,
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>',
    ...(bambuTemplate ? ['<Default Extension="config" ContentType="application/octet-stream"/>'] : []),
    ...(attachments && Object.keys(attachments).length || plateDefinitions?.some(plate => plate.primeTower) ? ['<Default Extension="json" ContentType="application/json"/>', '<Default Extension="txt" ContentType="text/plain"/>'] : []),
    '</Types>'
  ].join('');
  const relationships = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<Relationships xmlns="${REL_NS}">`,
    '<Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>',
    '</Relationships>'
  ].join('');

  const extraFiles = {};
  if (attachments && typeof attachments === 'object') {
    const usedNames = new Set();
    for (const [rawName, rawValue] of Object.entries(attachments)) {
      let name = pathSafeAttachmentName(rawName);
      let suffix = 2;
      const stem = name.replace(/(\.[^.]+)?$/, '');
      const ext = name.slice(stem.length);
      while (usedNames.has(name.toLowerCase())) name = `${stem}-${suffix++}${ext}`;
      usedNames.add(name.toLowerCase());
      extraFiles[`Metadata/pmm/${name}`] = rawValue instanceof Uint8Array ? rawValue : strToU8(String(rawValue));
    }
  }
  if (bambuTemplate) {
    const config = { ...bambuTemplate.config };
    for (const [key, value] of Object.entries(bambuTemplate.filament)) {
      if (key.startsWith('filament_dev_')) continue; // AMS device settings are not project filament settings.
      config[key] = Array.isArray(value) ? colors.map(() => value.length === 1 ? value[0] : value.join(',')) : value;
    }
    config.filament_colour = colors.map((color) => color.slice(0, 7));
    config.filament_multi_colour = [...config.filament_colour];
    config.filament_colour_type = colors.map(() => '0');
    config.filament_settings_id = colors.map(() => bambuTemplate.filamentName);
    config.filament_ids = colors.map(() => bambuTemplate.filamentId);
    config.filament_self_index = colors.map((_, index) => String(index + 1));
    config.filament_extruder_variant = colors.map(() => (config.extruder_variant_list?.[0] || 'Direct Drive Standard').split(',')[0]);
    config.filament_extruder_compatibility = colors.map(() => '0');
    config.filament_map = colors.map(() => '1');
    config.filament_map_mode = 'Auto For Flush';
    config.flush_volumes_vector = colors.flatMap(() => ['140', '140']);
    config.flush_volumes_matrix = colors.flatMap((_, from) => colors.map((_, to) => from === to ? '0' : '300'));
    const declaredPlates = Array.isArray(plateDefinitions) && plateDefinitions.length
      ? plateDefinitions.map((plate, index) => ({ ...plate, id: String(plate.id || plateIdAt(index)), name: cleanName(plate.name, `Plate ${plate.id || plateIdAt(index)}`) }))
      : [{ id: 'A', name: cleanName(title, 'Plate A') }];
    const seenPlateIds = new Set(declaredPlates.map((plate) => plate.id));
    for (const id of projectInstancesByPlate.keys()) if (!seenPlateIds.has(id)) declaredPlates.push({ id, name: `Plate ${id}` });
    if (declaredPlates.length > BAMBU_MAX_PLATES) throw new Error(`A Bambu project supports up to ${BAMBU_MAX_PLATES} plates. Export this batch as multiple projects.`);
    const frozenTowerSettings = primeTowerSettings || declaredPlates.find(plate => plate.primeTower)?.primeTower.settings;
    if (frozenTowerSettings) {
      for (const [key, value] of Object.entries(primeTowerConfig(frozenTowerSettings))) config[key] = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
      for (const key of ['filament_prime_volume','filament_change_length','filament_diameter']) {
        const values = frozenTowerSettings[key];
        if (Array.isArray(values) && values.length) config[key] = colors.map(() => values.length === 1 ? String(values[0]) : values.join(','));
      }
    }
    if (declaredPlates.some(plate => plate.primeTower)) {
      config.wipe_tower_x = declaredPlates.map(plate => numberText(plate.primeTower?.bodyX ?? 5));
      config.wipe_tower_y = declaredPlates.map(plate => numberText(plate.primeTower?.bodyY ?? 5));
      config.wipe_tower_rotation_angle = declaredPlates.map(() => '0');
      extraFiles['Metadata/pmm/prime-towers.json'] = strToU8(JSON.stringify(Object.fromEntries(declaredPlates.map(plate => [plate.id, plate.primeTower || null]))));
    }
    extraFiles['Metadata/project_settings.config'] = strToU8(JSON.stringify(config));
    const plateXml = declaredPlates.map((plate, index) => {
      const instances = projectInstancesByPlate.get(plate.id) || [];
      return `<plate><metadata key="plater_id" value="${index + 1}"/><metadata key="plater_name" value="${escapeXml(plate.name)}"/><metadata key="locked" value="false"/>${instances.join('')}</plate>`;
    }).join('');
    extraFiles['Metadata/model_settings.config'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?><config>${projectObjects.join('')}${plateXml}</config>`);
  }
  return zipSync({
    '[Content_Types].xml': strToU8(contentTypes),
    '_rels/.rels': strToU8(relationships),
    '3D/3dmodel.model': strToU8(model),
    ...extraFiles
  }, { level: 1 });
}

export function packBambuMultiPlate3mf({ title = 'Parametric production project', application = 'Liqu3D', plates, palette, bambuTemplate, attachments = null, bedSize = null, primeTowerSettings = null }) {
  if (!bambuTemplate) throw new Error('Native multi-plate Bambu export requires a Bambu project template.');
  if (!Array.isArray(plates) || !plates.length) throw new Error('There are no plates to export.');
  const objects = [];
  const plateDefinitions = [];
  const populated = plates.filter((plate) => Array.isArray(plate?.objects) && plate.objects.length);
  const count = populated.length;
  if (!count) throw new Error('There is no geometry to export.');
  if (count > BAMBU_MAX_PLATES) throw new Error(`A Bambu project supports up to ${BAMBU_MAX_PLATES} plates. Export this batch as multiple projects.`);
  const width = Math.max(1, Number(bedSize?.width) || 256);
  const depth = Math.max(1, Number(bedSize?.depth) || 256);
  // Match Bambu Studio's PartPlate grid. Plate membership is determined from
  // world-space object bounds as well as model_settings.config, so metadata
  // alone is insufficient for reliable multi-plate reopening.
  const root = Math.sqrt(count);
  let columns = Math.round(root);
  if (root > columns) columns += 1;
  columns = Math.max(1, columns);
  const strideX = width * 1.2;
  const strideY = depth * 1.2;
  for (const [index, plate] of populated.entries()) {
    const id = String(plate.id || plateIdAt(index));
    const name = cleanName(plate.name || plate.title, `Plate ${id}`);
    const row = Math.floor(index / columns);
    const column = index % columns;
    const worldOffset = { x: column * strideX, y: -row * strideY, z: 0 };
    plateDefinitions.push({ id, name, ...(plate.primeTower ? { primeTower: plate.primeTower } : {}) });
    for (const object of plate.objects) objects.push({ ...object, plateId: id, worldOffset });
  }
  return packCore3mf({ title, application, objects, palette, bambuTemplate, attachments, plateDefinitions, primeTowerSettings });
}

function projectAttachments(attachments, plates) {
  if (!attachments?.['workflow.json']) return attachments;
  const result = { ...attachments };
  const workflow = JSON.parse(String(attachments['workflow.json']));
  const ids = new Set(plates.map(plate => plate.id));
  workflow.plateOrder = plates.map(plate => plate.id);
  if (workflow.plates) workflow.plates = Object.fromEntries(Object.entries(workflow.plates).filter(([id]) => ids.has(id)));
  if (Array.isArray(workflow.objects)) workflow.objects = workflow.objects.filter(object => ids.has(object.plateId));
  if (Array.isArray(workflow.primeTowers)) workflow.primeTowers = workflow.primeTowers.filter(tower => ids.has(tower.plateId));
  if (workflow.plateCount !== undefined) workflow.plateCount = plates.length;
  if (workflow.objectCount !== undefined) workflow.objectCount = plates.reduce((sum, plate) => sum + plate.objects.length, 0);
  result['workflow.json'] = JSON.stringify(workflow);
  return result;
}

// Preserve all app plate identities while keeping each native slicer project
// within its own grid and plate capacity. A normal batch stays a single 3MF.
export function packBambuPlateArchive(options) {
  const plates = (options.plates || []).filter(plate => plate?.objects?.length)
    .map((plate, index) => ({ ...plate, id: plate.id || plateIdAt(index) }));
  if (!plates.length) throw new Error('There is no geometry to export.');
  if (plates.length > MAX_PLATES || plates.some(plate => !isValidPlateId(plate.id)) || new Set(plates.map(plate => plate.id)).size !== plates.length) throw new Error('Invalid or duplicate export plate.');
  if (plates.length <= BAMBU_MAX_PLATES) return {
    archive: packBambuMultiPlate3mf({ ...options, plates }), extension: '3mf', mimeType: 'model/3mf', projectCount: 1
  };
  const files = {}, projects = [];
  const stem = pathSafeAttachmentName(options.title || 'production').replace(/\.[^.]+$/, '').slice(0, 80) || 'production';
  let objectOffset = 0;
  for (let offset = 0; offset < plates.length; offset += BAMBU_MAX_PLATES) {
    const chunk = plates.slice(offset, offset + BAMBU_MAX_PLATES);
    const filename = `${stem}-part-${String(projects.length + 1).padStart(2, '0')}-${chunk[0].id}-${chunk.at(-1).id}.3mf`;
    try { files[filename] = packBambuMultiPlate3mf({ ...options, plates: chunk, attachments: projectAttachments(options.attachments, chunk) }); }
    catch (error) { if (Number.isInteger(error.exportObjectIndex)) error.exportObjectIndex += objectOffset; throw error; }
    const objectCount = chunk.reduce((sum, plate) => sum + plate.objects.length, 0);
    projects.push({ filename, plateIds: chunk.map(plate => plate.id), objectCount });
    objectOffset += objectCount;
  }
  files['plates.json'] = strToU8(JSON.stringify({ version: 1, projects }, null, 2));
  return { archive: packZip(files), extension: 'zip', mimeType: 'application/zip', projectCount: projects.length };
}


export function packZip(files) {
  // 3MF files are already compressed ZIPs; deflating them again wastes time.
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, data]) => [name, /\.3mf$/i.test(name) ? [data, { level: 0 }] : data])), { level: 1 });
}

export function utf8(value) {
  return strToU8(String(value));
}
