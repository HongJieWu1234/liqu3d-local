import { analyzeColorLayers, combineColorRuns, estimateSwaps } from './color-optimization.js?v=tower-free1';

import { estimatePrintWaste } from './purge-estimate.js';

const number = (value, fallback) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;
const at = (value, index, fallback) => number(Array.isArray(value) ? value[index] ?? value[0] : value, fallback);

// A mesh/shell approximation, deliberately separate from slicer toolpath totals.
export function meshMeasures(geometry, materialIndices, defaultMaterial = 0) {
  const p = geometry.getAttribute('position'), indices = geometry.index?.array;
  let volume = 0, verticalArea = 0, horizontalArea = 0;
  const materialAreas=new Map();
  const origin = [p.getX(0), p.getY(0), p.getZ(0)];
  for (let i = 0; i < (indices?.length || p.count); i += 3) {
    const points = [0, 1, 2].map(n => {
      const id = indices ? indices[i + n] : i + n;
      return [p.getX(id) - origin[0], p.getY(id) - origin[1], p.getZ(id) - origin[2]];
    });
    const [a,b,c] = points, u = b.map((v,j)=>v-a[j]), v = c.map((v,j)=>v-a[j]);
    const cross = [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const material=materialIndices?.[i/3]??defaultMaterial;
    materialAreas.set(material,(materialAreas.get(material)||0)+Math.hypot(...cross)/2);
    horizontalArea += Math.abs(cross[2]) / 2;
    verticalArea += Math.hypot(cross[0],cross[1]) / 2;
    volume += (a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0])) / 6;
  }
  return { volume: Math.abs(volume), verticalArea, horizontalArea, materialAreas };
}

export function estimateFilament(plates, profile, template = {}, {projectSettings = {}} = {}) {
  const defaults = { ...template.config, ...template.filament, ...profile.settings };
  const nozzle = number(profile.nozzleDiameter, .4), density = at(defaults.filament_density,0,1.24);
  const nozzleCapacity = Math.max(1,Number(template.hotendCount) || template.nozzleDiameters?.length || 1);
  let modelMm3=0,modelGrams=0,changes=0,minimumChanges=0,flushGrams=0,towerGrams=0,flushMm3=0,towerMm3=0,flushChanges=0,nozzleChanges=0,towerCount=0;
  let unknown=false,mappingKnown=true,purgeAssumed=false,flushIntoObjects=false,towerSparseAssumed=false;
  let mixedColorApproximation=false;
  const colors=new Map();
  const primeTowers=[];
  const colorEstimate=color=>{
    const key=String(color).split('|')[0].slice(0,7).toUpperCase();
    if(!colors.has(key))colors.set(key,{color:key,modelGrams:0,flushGrams:0,primeTowerGrams:0});
    return colors.get(key);
  };
  for (const plate of plates) {
    // Read the settings actually written into this 3MF, after palette remapping.
    const config = {...defaults,...projectSettings[plate.id]};
    const settingPalette=config.filament_colour || plate.palette;
    const slot=index=>settingPalette.findIndex(color=>String(color).slice(0,7).toUpperCase()===String(plate.palette[index]).slice(0,7).toUpperCase());
    const analyses=[],items=[];
    for (const object of plate.objects) {
      const settings = { ...config, ...object.settings };
      const layer = number(settings.layer_height, .2);
      const wall = number(settings.wall_loops, 3) * number(settings.line_width, nozzle * 1.05);
      const shells = Math.max(number(settings.top_shell_thickness,0), number(settings.top_shell_layers,5)*layer)
        + Math.max(number(settings.bottom_shell_thickness,0), number(settings.bottom_shell_layers,4)*layer);
      const infill = Math.max(0, Math.min(1, number(settings.sparse_infill_density,15)/100));
      const solids = [];let minZ=Infinity,maxZ=-Infinity;
      for (const part of object.parts) {
        const m = meshMeasures(part.geometry,part.materialIndices,part.materialIndex);
        const shellVolume = Math.min(m.volume, m.verticalArea*wall + m.horizontalArea*shells/2);
        const mm3 = shellVolume + Math.max(0,m.volume-shellVolume)*infill;
        modelMm3 += mm3;
        const surfaceArea=[...m.materialAreas.values()].reduce((sum,value)=>sum+value,0);
        mixedColorApproximation ||= m.materialAreas.size>1;
        for(const [index,area] of m.materialAreas) {
          const grams=mm3*(surfaceArea?area/surfaceArea:0)*at(config.filament_density,slot(index),density)/1000;
          modelGrams+=grams;colorEstimate(plate.palette[index]).modelGrams+=grams;
        }
        const positions=part.geometry.getAttribute('position');
        for(let i=0;i<positions.count;i++){minZ=Math.min(minZ,positions.getZ(i));maxZ=Math.max(maxZ,positions.getZ(i));}
        const count = (part.geometry.index?.count || positions.count) / 3;
        const geometry = part.geometry.index ? part.geometry : part.geometry.clone().setIndex(Array.from({length:count*3},(_,i)=>i));
        solids.push({ geometry, faceProperties:part.materialIndices || new Uint32Array(count).fill(part.materialIndex),
          propertyTable:plate.palette.map((color,index)=>({color,material:String(Array.isArray(settings.filament_type)?settings.filament_type[slot(index)] || settings.filament_type[0]:settings.filament_type || 'PLA')})) });
      }
      const analysis=analyzeColorLayers(solids,{layerHeight:layer,firstLayerHeight:number(config.initial_layer_print_height,layer),cacheKey:null});
      analyses.push(analysis);
      items.push({name:object.name,height:maxZ-minZ,layerHeight:layer,colorAnalysis:analysis,towerChannels:analysis.channels.map(channel=>channel.color)});
      for (let i=0;i<solids.length;i++) if(solids[i].geometry!==object.parts[i].geometry) solids[i].geometry.dispose();
    }
    const heights = new Set(analyses.map(a=>`${a.layerHeight}:${a.firstLayerHeight}`));
    if (analyses.some(a=>a.status!=='ready') || heights.size>1) { unknown=true; continue; }
    const runs=combineColorRuns(analyses),waste=estimatePrintWaste(runs,plate.palette,config,items,plate.primeTower);
    if(!waste){unknown=true;continue;}
    if(waste.tower)primeTowers.push({plateId:plate.id,...waste.tower});
    minimumChanges+=estimateSwaps(runs);changes+=waste.changes;flushChanges+=waste.flushChanges;
    flushMm3+=waste.flushMm3;flushGrams+=waste.flushGrams;towerMm3+=waste.towerMm3;towerGrams+=waste.towerGrams;towerCount+=waste.towerCount;
    for(const entry of waste.perColor) {
      const color=colorEstimate(entry.color);color.flushGrams+=entry.flushGrams;color.primeTowerGrams+=entry.primeTowerGrams;
    }
    mappingKnown &&= waste.mappingKnown || nozzleCapacity===1;nozzleChanges+=waste.nozzleChanges || 0;
    purgeAssumed ||= waste.purgeAssumed;flushIntoObjects ||= waste.flushIntoObjects;towerSparseAssumed ||= waste.towerSparseAssumed;
  }
  const notes=[
    'Pre-slice estimate, not measured waste. The slicer can choose a different color order and nozzle assignment.',
    'Startup flushing, filament cutting/reloading, calibration, supports, model brims and skirts are not included.'
  ];
  if(purgeAssumed)notes.push('Missing flush matrix: assumes 280 mm³ per shared-nozzle color change, adjusted by the flush multiplier.');
  else notes.push('Flushing uses the directional color matrix and multiplier saved inside the exported 3MF.');
  if(!mappingKnown)notes.push('Automatic nozzle mapping is unresolved; assumes shared-nozzle flushing instead of claiming zero purge.');
  if(towerCount)notes.push('Tower dimensions use the saved footprint when available and the exported layer/color settings. Height ends at the last required layer; skipped sparse layers shorten the tower. Rib taper, rounded walls, priming, nozzle-change extrusion and tower brim are included; scaffold fill is approximated at 15%. Exact tower paths require slicing.');
  else if(!unknown)notes.push('No prime tower is estimated: towers are disabled or the plates do not require one under the saved settings.');
  if(mixedColorApproximation)notes.push('For a solid painted with multiple colors, model volume is divided by colored surface area; internal color boundaries require slicing.');
  notes.push('Per-color waste follows the estimated tool order; tower scaffold follows the priming mix, or the active color on layers without a change.');
  if(flushIntoObjects)notes.push('Flush-to-infill/support savings cannot be known before slicing; no savings have been deducted.');
  if(unknown)notes.push('Some layer, color or prime-tower information is unavailable; waste and total are left blank.');
  const wasteGrams=unknown?null:flushGrams+towerGrams;
  const perColor=[...colors.values()].map(color=>({...color,flushGrams:unknown?null:color.flushGrams,
    primeTowerGrams:unknown?null:color.primeTowerGrams,wasteGrams:unknown?null:color.flushGrams+color.primeTowerGrams,
    totalGrams:unknown?null:color.modelGrams+color.flushGrams+color.primeTowerGrams}));
  return {version:4,primeTowers,perColor,modelMm3,modelGrams,purgeGrams:unknown?null:flushGrams,flushGrams:unknown?null:flushGrams,
    primeTowerGrams:unknown?null:towerGrams,wasteGrams,totalGrams:wasteGrams===null?null:modelGrams+wasteGrams,
    flushMm3:unknown?null:flushMm3,primeTowerMm3:unknown?null:towerMm3,primeTowerCount:towerCount,
    changes:unknown?null:changes,minimumColorChanges:unknown?null:minimumChanges,
    nozzleChanges:unknown||!mappingKnown?null:nozzleChanges,nozzleMappingKnown:mappingKnown,
    nozzleCapacity,dedicatedPossible:!unknown&&mappingKnown&&changes>0&&flushChanges===0,
    noPurgeGrams:modelGrams,density,nozzleDiameter:nozzle,purgeMm3PerChange:flushChanges?flushMm3/flushChanges:0,
    purgeAssumed,towerSparseAssumed,approximate:true,notes};
}
