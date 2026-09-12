import { BufferGeometry, BufferAttribute, Matrix4 } from './vendor/three/three.module.js';
import { unzipSync, strFromU8 } from './vendor/three/addons/libs/fflate.module.js';

const nodes = (element, name) => Array.from(element.getElementsByTagNameNS('*', name));
const transform = (value) => {
  if (!value) return new Matrix4();
  const m = value.trim().split(/\s+/).map(Number);
  if (m.length !== 12 || !m.every(Number.isFinite)) throw new Error('Invalid 3MF transform.');
  return new Matrix4().set(m[0], m[3], m[6], m[9], m[1], m[4], m[7], m[10], m[2], m[5], m[8], m[11], 0, 0, 0, 1);
};

// The display loader splits faces by colour, which can open an otherwise closed
// mesh. Export must retain the complete mesh and its per-triangle materials.
export function readSolid3mf(data, parseXml = (xml) => new DOMParser().parseFromString(xml, 'application/xml'), { colorMetadata = false } = {}) {
  const archive = unzipSync(new Uint8Array(data));
  const filename = Object.keys(archive).find((name) => name.toLowerCase() === '3d/3dmodel.model');
  if (!filename) throw new Error('The generated 3MF has no model.');
  const xml = strFromU8(archive[filename]);
  if (/<!DOCTYPE/i.test(xml)) throw new Error('Unexpected 3MF document type.');
  const document = parseXml(xml);
  if (nodes(document, 'parsererror').length) throw new Error('The generated 3MF contains invalid XML.');
  const model = nodes(document, 'model')[0];
  const unitScale = { micron: 0.001, millimeter: 1, centimeter: 10, inch: 25.4, foot: 304.8, meter: 1000 }[model?.getAttribute('unit') || 'millimeter'];
  if (!model || !unitScale || (!colorMetadata && unitScale !== 1)) throw new Error('Expected a millimetre 3MF model.');
  const materials = new Map();
  // Metadata is optional: ordinary workspace exports retain their strict reader.
  const properties = new Map();
  const materialType = element => {
    const explicit = nodes(element, 'metadata').find(node => node.parentNode === element && /(?:^|:)(?:filament_type|material_type|material)$/i.test(node.getAttribute('name')));
    return explicit?.textContent.trim() || '';
  };
  const modelMaterial = colorMetadata ? materialType(model) : '';
  const remember = (key, value, material = '') => {
    materials.set(key, (value || '#D9DDE5').slice(0, 7));
    if (colorMetadata) properties.set(key, { color: /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value) ? value.slice(0, 7).toUpperCase() : null, material });
  };
  for (const palette of nodes(model, 'basematerials')) {
    nodes(palette, 'base').forEach((base, index) => {
      const name = base.getAttribute('name') || '';
      // Colour names are not material types. Only recognise explicit polymer names.
      const polymer = name.match(/\b(PLA|PETG|ABS|ASA|TPU|TPE|PVA|HIPS|PA(?:6|12)?|NYLON|PC|PPS|PEEK|PEI)(?:[- ](?:CF|GF))?\b/i)?.[0] || '';
      remember(`${palette.getAttribute('id')}:${index}`, base.getAttribute('displaycolor'), polymer);
    });
  }
  for (const palette of nodes(model, 'colorgroup')) {
    nodes(palette, 'color').forEach((color, index) => remember(`${palette.getAttribute('id')}:${index}`, color.getAttribute('color')));
  }
  const objects = new Map(nodes(model, 'object').map((object) => [object.getAttribute('id'), object]));
  const results = [];
  const visit = (id, matrix, ancestors = new Set(), inheritedMaterial = modelMaterial) => {
    const object = objects.get(id);
    if (!object || ancestors.has(id)) throw new Error('Invalid 3MF object reference.');
    const nextAncestors = new Set([...ancestors, id]);
    const objectMaterial = colorMetadata ? materialType(object) || inheritedMaterial : '';
    const mesh = nodes(object, 'mesh')[0];
    if (mesh) {
      const vertices = nodes(mesh, 'vertex');
      const triangles = nodes(mesh, 'triangle');
      const positions = new Float64Array(vertices.length * 3);
      vertices.forEach((vertex, index) => ['x', 'y', 'z'].forEach((axis, offset) => {
        if (colorMetadata && !vertex.hasAttribute(axis)) throw new Error('Invalid 3MF vertex.');
        positions[index * 3 + offset] = Number(vertex.getAttribute(axis));
      }));
      const indices = new Uint32Array(triangles.length * 3);
      const colors = new Array(triangles.length);
      const faceProperties = colorMetadata ? new Uint32Array(triangles.length) : null;
      const propertyTable = [], propertyIds = new Map();
      if (colorMetadata && !positions.every(Number.isFinite)) throw new Error('Invalid 3MF vertex.');
      triangles.forEach((triangle, index) => {
        ['v1', 'v2', 'v3'].forEach((attribute, offset) => {
          const vertex = Number(triangle.getAttribute(attribute));
          if ((colorMetadata && !triangle.hasAttribute(attribute)) || !Number.isInteger(vertex) || vertex < 0 || vertex >= vertices.length) throw new Error('Invalid 3MF triangle.');
          indices[index * 3 + offset] = vertex;
        });
        const pid = triangle.getAttribute('pid') || object.getAttribute('pid');
        const pindex = triangle.getAttribute('p1') || object.getAttribute('pindex') || '0';
        const color = materials.get(`${pid}:${pindex}`);
        if (pid && !color && !colorMetadata) throw new Error('The generated 3MF contains an invalid colour reference.');
        colors[index] = color || '#D9DDE5';
        if (colorMetadata) {
          const p2 = triangle.getAttribute('p2') || pindex, p3 = triangle.getAttribute('p3') || pindex;
          const gradient = [p2, p3].some(p => p !== pindex && materials.get(`${pid}:${p}`) !== color);
          const property = properties.get(`${pid}:${pindex}`);
          const entry = { color: gradient ? null : property?.color || null, material: property?.material || objectMaterial, reason: gradient ? 'Interpolated vertex colours' : !property?.color ? 'Missing or unsupported colour properties' : '' };
          const key = JSON.stringify(entry);
          if (!propertyIds.has(key)) { propertyIds.set(key, propertyTable.length); propertyTable.push(entry); }
          faceProperties[index] = propertyIds.get(key);
        }
      });
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(positions, 3));
      geometry.setIndex(new BufferAttribute(indices, 1));
      geometry.applyMatrix4(matrix);
      results.push({ geometry, colors, name: object.getAttribute('name') || 'Solid part', ...(colorMetadata ? { faceProperties, propertyTable } : {}) });
    }
    for (const component of nodes(object, 'component')) {
      if (component.hasAttribute('p:path')) throw new Error('External 3MF components are not supported in generated exports.');
      visit(component.getAttribute('objectid'), matrix.clone().multiply(transform(component.getAttribute('transform'))), nextAncestors, objectMaterial);
    }
  };
  try {
    for (const build of nodes(model, 'build')) for (const item of nodes(build, 'item')) visit(item.getAttribute('objectid'), new Matrix4().makeScale(unitScale, unitScale, unitScale).multiply(transform(item.getAttribute('transform'))));
  } catch (error) { for (const solid of results) solid.geometry.dispose(); throw error; }
  if (!results.length) throw new Error('The generated 3MF contains no solids.');
  return results;
}
