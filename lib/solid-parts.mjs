import { DOMParser } from '@xmldom/xmldom';
import { readSolid3mf } from '../public/solid-3mf.js';
import { packCore3mf } from '../public/core-3mf.js';
import { parallelWork } from './parallel-work.mjs';

// Keep complete closed parts and their own materials. Some OpenSCAD builds
// reuse the first part's colour indices in lazy-union 3MF exports.
export async function renderSolidParts(parts, render, { concurrency = 1, signal } = {}) {
  const geometries = [];
  try {
    const rendered = await parallelWork(parts, concurrency, async (part, _index, partSignal) => {
      const bytes = await render(part, partSignal);
      const solids = bytes.length ? readSolid3mf(bytes, text => new DOMParser().parseFromString(text, 'application/xml')) : [];
      geometries.push(...solids.map(solid => solid.geometry));
      return solids.map(solid => ({ ...solid, name: part }));
    }, signal);
    const solids = rendered.flat();
    if (!solids.length) return Buffer.alloc(0);
    const palette = [], indices = new Map();
    const slot = color => {
      color = color.toUpperCase();
      if (!indices.has(color)) { indices.set(color, palette.length); palette.push(color); }
      return indices.get(color);
    };
    const modelParts = solids.map(solid => ({ name: solid.name, geometry: solid.geometry,
      materialIndex: slot(solid.colors[0]), materialIndices: Uint32Array.from(solid.colors, slot) }));
    return Buffer.from(packCore3mf({ title: 'Colored solids', palette, objects: [{ name: 'Model', parts: modelParts }] }));
  } finally { for (const geometry of geometries) geometry.dispose(); }
}

// Opt-in adapter for the maker's generated SCAD layout. Arbitrary SCAD retains
// its native color groups; saved source files are never modified.
const START = '// GENERATED RENDER BLOCK START';
const END = '// GENERATED RENDER BLOCK END';

export function supportsSolidParts(source, metadata) {
  if (metadata.partSelectorParam !== 'render_part' || metadata.objectSelectorParam !== 'export_single_design') return false;
  const start = source.indexOf(START);
  const end = source.indexOf(END, start);
  if (start < 0 || end < 0 || source.indexOf(START, start + START.length) !== -1) return false;
  if (!/module\s+placed_design\s*\(\s*i\s*\)/.test(source)) return false;
  const block = source.slice(start + START.length, end);
  // Reject blocks with custom calls rather than silently changing their design.
  const calls = [...block.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map((match) => match[1]);
  return calls.length > 0 && calls.every((name) => ['if', 'union', 'd_name', 'placed_design', 'placed_design_object', 'selected_part'].includes(name));
}

