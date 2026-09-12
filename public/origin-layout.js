import { arrangeObjects } from './plate-packing.js?v=tower-free1';
import { optimizedEditorOffset } from './workspace-color-optimization.js?v=tower-free1';
import { primeTowerReservations } from './prime-tower.js?v=tower-free1';

// Geometry bounds are in printer coordinates; the SCAD origin is bed-centred.
// A zero mesh.position alone is insufficient: SCAD may bake a layout into vertices.
export function originLayout(sources, printer, options = {}) {
  const epsilon = 0.01, x = printer.width / 2, y = printer.depth / 2;
  if (sources.length < 2 || sources.some(({ bounds: b, offset = {} }) =>
    ['x', 'y', 'z', 'rotation'].some(key => Math.abs(Number(offset[key]) || 0) > epsilon)
    || ![b.minX, b.maxX, b.minY, b.maxY, b.minZ].every(Number.isFinite)
    || b.minX > x + epsilon || b.maxX < x - epsilon
    || b.minY > y + epsilon || b.maxY < y - epsilon)) return null;
  // Touching the origin at an edge is valid, but merely adjacent designs must stay put.
  if (Math.min(...sources.map(s => s.bounds.maxX)) - Math.max(...sources.map(s => s.bounds.minX)) <= epsilon
    || Math.min(...sources.map(s => s.bounds.maxY)) - Math.max(...sources.map(s => s.bounds.minY)) <= epsilon) return null;
  const items = sources.map((source, index) => ({ source, index, name: source.name,
    height:source.height,layerHeight:source.layerHeight,towerChannels:source.towerChannels,colorAnalysis:source.colorAnalysis,
    width: source.bounds.maxX - source.bounds.minX, depth: source.bounds.maxY - source.bounds.minY }));
  const plateCount = arrangeObjects(items, printer, options);
  for (const item of items) {
    const b = item.source.bounds, p = item.placement, rotated = Boolean(p.rotation);
    item.offset = optimizedEditorOffset(item.source.offset, {
      rotation: p.rotation, dx: p.x - (rotated ? -b.maxY : b.minX),
      dy: p.y - (rotated ? b.minX : b.minY), dz: -b.minZ
    }, printer);
  }
  return { items, plateCount, primeTowers:primeTowerReservations(items) };
}
