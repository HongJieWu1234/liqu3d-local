import { createHash } from 'node:crypto';
import { analyzeColorLayers as analyze, COLOR_ANALYSIS_VERSION } from '../public/color-optimization.js';
export { COLOR_ANALYSIS_VERSION, colorOptimizationSettings, ColorAnalysisCache, instantColorCache, combineColorRuns, estimateSwaps, packColorGroups } from '../public/color-optimization.js';
export function analyzeColorLayers(solids, options = {}) {
  let cacheKey = null;
  try {
    const { layerHeight, firstLayerHeight = layerHeight, defaultMaterial = '' } = options;
    const hash = createHash('sha256').update(JSON.stringify([COLOR_ANALYSIS_VERSION, layerHeight, firstLayerHeight, defaultMaterial]));
    for (const solid of solids) {
      const position = solid.geometry.getAttribute('position'), index = solid.geometry.index;
      hash.update(JSON.stringify([position.count, position.array.constructor.name, index.count, solid.faceProperties.length]));
      for (const array of [position.array, index.array, solid.faceProperties]) hash.update(Buffer.from(array.buffer, array.byteOffset, array.byteLength));
      hash.update(JSON.stringify(solid.propertyTable));
    }
    cacheKey = hash.digest('hex');
  } catch {} // The shared analyzer supplies a graceful unavailable result.
  return analyze(solids, { ...options, cacheKey, signatureHash: value => createHash('sha256').update(value).digest('hex') });
}
