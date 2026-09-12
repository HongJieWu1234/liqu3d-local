import { analyzeColorLayers, packColorGroups, colorOptimizationSettings, COLOR_ANALYSIS_VERSION } from './color-optimization.js?v=tower-free1';
import { arrangeObjects } from './plate-packing.js?v=tower-free1';
import { MAX_PLATES, plateIdAt } from './plate-ids.js';
import { normalizePrimeTowerSettings, primeTowerReservations } from './prime-tower.js?v=tower-free1';
import { normalizeMaxObjectsPerPlate } from './packing-settings.js';
import { snapQuarterTurn } from './quarter-turn.js';

const digest = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(n => n.toString(16).padStart(2, '0')).join('');
const textBytes = value => new TextEncoder().encode(JSON.stringify(value));
const paletteColor = (palette, index) => String(palette?.[index ?? 0] || '#D9DDE5').toUpperCase().replace(/^(#[0-9A-F]{6})FF$/, '$1');

export { orientedFootprint } from './oriented-footprint.js?v=tower-free1';
import { orientedFootprint } from './oriented-footprint.js?v=tower-free1';

// Analyze Z-up export geometry and return placements for export or editor arrangement.
export async function optimizeWorkspacePlates(plates, printer, options, progress = () => {}) {
  const inputOptions = options || {};
  const maxObjectsPerPlate = normalizeMaxObjectsPerPlate(inputOptions.maxObjectsPerPlate);
  options = colorOptimizationSettings(inputOptions);
  const first = plates[0].model;
  const palette = [...new Set(plates.flatMap(plate => (plate.model.palette?.length ? plate.model.palette : ['#D9DDE5']).map((_,index)=>paletteColor(plate.model.palette,index))))];
  const primeTower = inputOptions.primeTower ?? (first.bambuTemplate ? normalizePrimeTowerSettings(first.bambuTemplate) : undefined);
  const packingOptions = {maxObjectsPerPlate,primeTower};
  const buckets = new Map(), items = [], unavailable = [];
  for (const plate of plates) for (const object of plate.model.objects) {
    const config = plate.model.bambuTemplate?.config || {};
    const bounds = { minX:Infinity, minY:Infinity, minZ:Infinity, maxX:-Infinity, maxY:-Infinity, maxZ:-Infinity };
    const solids = [], hashes = [], towerChannels = new Set();
    for (const part of object.parts) {
      const positions = part.geometry.positions;
      const indices = part.geometry.indices || Uint32Array.from({length:positions.length / 3}, (_,i) => i);
      const position = { array:positions, count:positions.length / 3, getX:i=>positions[i*3], getY:i=>positions[i*3+1], getZ:i=>positions[i*3+2] };
      for (let i=0;i<positions.length;i+=3) {
        bounds.minX=Math.min(bounds.minX,positions[i]);bounds.maxX=Math.max(bounds.maxX,positions[i]);
        bounds.minY=Math.min(bounds.minY,positions[i+1]);bounds.maxY=Math.max(bounds.maxY,positions[i+1]);
        bounds.minZ=Math.min(bounds.minZ,positions[i+2]);bounds.maxZ=Math.max(bounds.maxZ,positions[i+2]);
      }
      const properties=[], propertyIds=new Map(), faceProperties=new Uint32Array(indices.length/3);
      for(let face=0;face<faceProperties.length;face++) {
        const material=part.colorMetadata?.propertyTable?.[part.colorMetadata.faceProperties?.[face]]?.material || '';
        const exportedColor=paletteColor(plate.model.palette,part.materialIndices?.[face] ?? part.materialIndex);
        towerChannels.add(exportedColor);
        const color=part.colorKnown===false ? null : exportedColor;
        const key=JSON.stringify([color,material]);
        if(!propertyIds.has(key)){propertyIds.set(key,properties.length);properties.push({color,material});}
        faceProperties[face]=propertyIds.get(key);
      }
      solids.push({geometry:{getAttribute:()=>position,index:{array:indices,count:indices.length}},faceProperties,propertyTable:properties});
      hashes.push(await digest(positions),await digest(indices),await digest(faceProperties),properties);
    }
    if(!Object.values(bounds).every(Number.isFinite))throw new Error(`${object.name} has invalid export geometry.`);
    const layerHeight=Number(object.settings?.layer_height || config.layer_height || .2);
    const firstLayerHeight=Number(config.initial_layer_print_height || layerHeight);
    const defaultMaterial=Array.isArray(config.filament_type)?config.filament_type[0]:config.filament_type || '';
    const cacheKey=await digest(textBytes([COLOR_ANALYSIS_VERSION,layerHeight,firstLayerHeight,defaultMaterial,hashes]));
    const analysis=analyzeColorLayers(solids,{layerHeight,firstLayerHeight,defaultMaterial,cacheKey,scope:'workspace-export'});
    if(analysis.status==='ready')analysis.signature=await digest(textBytes(analysis.runs));
    else unavailable.push({name:object.name,reason:analysis.reason});
    const footprint=orientedFootprint(object.parts,object.editorRotation || 0);
    Object.assign(bounds,{minX:footprint.minX,minY:footprint.minY,maxX:footprint.maxX,maxY:footprint.maxY});
    const item={index:items.length,name:object.name,object,bounds,palette:plate.model.palette,fitRotation:footprint.rotation,width:bounds.maxX-bounds.minX,depth:bounds.maxY-bounds.minY,height:bounds.maxZ-bounds.minZ,towerChannels:[...towerChannels],colorAnalysis:analysis,sourcePlateId:plate.plateId};
    items.push(item);
    // Different object layer heights cannot share the same estimated layer grid.
    const bucketKey=JSON.stringify([layerHeight,firstLayerHeight]);
    if(!buckets.has(bucketKey))buckets.set(bucketKey,[]);buckets.get(bucketKey).push(item);
    progress(`Analyzing colors ${items.length}…`);
  }
  let offset=0,estimatedSwaps=0,baselineSwaps=0;
  const planningBuckets = !options.enabled || options.maxColorChanges !== undefined ? [items] : buckets.values();
  for(const bucket of planningBuckets) {
    const report=options.enabled ? packColorGroups(bucket,printer,{pack:arrangeObjects,...packingOptions,maxFilamentSlots:options.maxFilamentSlots,maxPlates:MAX_PLATES,maxColorChanges:options.maxColorChanges}) : {plateCount:arrangeObjects(bucket,printer,packingOptions),estimatedSwaps:null,baselineSwaps:null};
    estimatedSwaps=estimatedSwaps===null||report.estimatedSwaps===null?null:estimatedSwaps+report.estimatedSwaps;
    baselineSwaps=baselineSwaps===null||report.baselineSwaps===null?null:baselineSwaps+report.baselineSwaps;
    for(const item of bucket)item.placement.plateIndex+=offset;
    offset+=report.plateCount;
  }
  if(offset>MAX_PLATES)throw new Error(`Color grouping needs more than ${MAX_PLATES} plates. Export fewer objects.`);
  const result=Array.from({length:offset},(_,i)=>{const id=plateIdAt(i);return {plateId:id,filename:`plate-${id}.3mf`,model:{...first,palette,title:`Plate ${id}`,objects:[]}};});
  for(const item of items) {
    const {bounds,placement}=item,rotate=Boolean(placement.rotation);
    const dx=placement.x-(rotate?-bounds.maxY:bounds.minX),dy=placement.y-(rotate?bounds.minX:bounds.minY);
    const rotation=item.fitRotation+placement.rotation, c=Math.cos(rotation), s=Math.sin(rotation);
    item.transform={dx,dy,dz:-bounds.minZ,rotation};
    for(const part of item.object.parts) {
      part.materialIndex=palette.indexOf(paletteColor(item.palette,part.materialIndex));
      if(part.materialIndices)part.materialIndices=Uint32Array.from(part.materialIndices,index=>palette.indexOf(paletteColor(item.palette,index)));
      const p=part.geometry.positions;
      for(let i=0;i<p.length;i+=3){const x=p[i],y=p[i+1];p[i]=c*x-s*y+dx;p[i+1]=s*x+c*y+dy;p[i+2]-=bounds.minZ;}
    }
    result[placement.plateIndex].model.objects.push(item.object);
    item.object.editorRotation=snapQuarterTurn((item.object.editorRotation || 0)+rotation);
    result[placement.plateIndex].model.primeTower=placement.primeTower;
    result[placement.plateIndex].primeTower=placement.primeTower;
  }
  return {plates:result,report:{...options,maxObjectsPerPlate,primeTowerSettings:primeTower,primeTowers:primeTowerReservations(items).map(tower=>({...tower,plateId:plateIdAt(tower.plateIndex)})),estimatedSwaps,baselineSwaps,plateCount:offset,unavailable,
    objects:items.map(item=>({id:item.object.exportId,name:item.name,sourcePlateId:item.sourcePlateId,plateId:result[item.placement.plateIndex].plateId,placement:item.placement,transform:item.transform}))}};
}

// Convert the packer's bed-coordinate transform to the editor's Y-up offsets.
export function optimizedEditorOffset(offset, transform, printer) {
  const x=printer.width/2+offset.x, y=printer.depth/2-offset.z;
  const c=Math.cos(transform.rotation), s=Math.sin(transform.rotation);
  return {x:c*x-s*y+transform.dx-printer.width/2,
    z:printer.depth/2-(s*x+c*y+transform.dy),
    y:(offset.y || 0)+transform.dz, rotation:(offset.rotation || 0)+transform.rotation};
}
