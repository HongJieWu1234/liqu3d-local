import { estimatePrimeTower } from './prime-tower.js';
import { primeTowerOutline } from './prime-tower-preview.js';
import { orderLayerColors } from './prime-tower-layers.js?v=tower-free1';

export const settingNumber = (value, fallback) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;
export const settingAt = (value,index,fallback) => settingNumber(Array.isArray(value)?value[index]??value[0]:value,fallback);
const enabled = value => [true,1,'1','true'].includes(Array.isArray(value)?value[0]:value);
const colorKey = value => String(value).split('|')[0].toUpperCase().slice(0,7);
const perimeter = points => points.reduce((sum,p,i)=>sum+p.distanceTo(points[(i+1)%points.length]),0);
const area = points => Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y;},0))/2;

// A deterministic pre-slice tool order, not a claimed G-code schedule. Track
// material resident in each explicitly assigned nozzle across every transition.
// Bambu definitions: PrintConfig.cpp (flush_multiplier, filament_prime_volume,
// filament_prime_volume_nc, filament_change_length, filament_map_mode).
export function estimatePrintWaste(runs, palette, config, items, reservation) {
  const settingPalette=(config.filament_colour || palette).map(colorKey);
  const slot=id=>settingPalette.indexOf(colorKey(id));
  const matrix=Array.isArray(config.flush_volumes_matrix)?config.flush_volumes_matrix.flat(Infinity).map(Number):[];
  const matrixValid=matrix.length===settingPalette.length**2 && matrix.every(n=>Number.isFinite(n)&&n>=0);
  const multiplier=Math.max(0,settingAt(config.prime_volume_mode==='Fast'?config.flush_multiplier_fast:config.flush_multiplier,0,1));
  const mapping=config.filament_map_mode==='Nozzle Manual'?config.filament_nozzle_map:config.filament_map;
  const manual=['Manual','Nozzle Manual'].includes(config.filament_map_mode);
  const used=[...new Set(runs.flatMap(run=>run.colors))];
  const perColor=new Map(used.map(id=>[id,{color:colorKey(id),flushGrams:0,primeTowerGrams:0}]));
  const mappingKnown=manual && Array.isArray(mapping) && used.every(id=>slot(id)>=0 && Number.isInteger(Number(mapping[slot(id)])) && Number(mapping[slot(id)])>0);
  const nozzle=id=>mappingKnown?Number(mapping[slot(id)]):1;
  const density=id=>Math.max(.01,settingAt(config.filament_density,slot(id),1.24));
  const prime=id=>config.prime_volume_mode==='Saving'?15:Math.max(0,settingAt(config.filament_prime_volume,slot(id),45));
  const flush=(from,to)=>from===to?0:(matrixValid && slot(from)>=0 && slot(to)>=0?matrix[slot(from)*settingPalette.length+slot(to)]:280)*multiplier;
  let tower;
  try {tower=estimatePrimeTower(items,{config},{runs});} catch {return null;}
  if(tower && reservation?.version===tower.version && [reservation.width,reservation.depth,reservation.height].every(n=>Number.isFinite(n)&&n>0))
    tower={...tower,width:reservation.width,depth:reservation.depth,
      ...(Number.isFinite(reservation.brim)&&reservation.brim>=0?{brim:reservation.brim}:{})};
  const towerEnabled=Boolean(tower),resident=new Map();
  const outline=towerEnabled?primeTowerOutline(tower):[],top=towerEnabled?primeTowerOutline(tower,true):[];
  const section=t=>outline.map((point,i)=>point.clone().lerp(top[i],t));
  const lineWidth=Math.max(.1,settingNumber(config.line_width,settingAt(config.nozzle_diameter,0,.4)*1.05));
  const layer=items[0]?.layerHeight || settingNumber(config.layer_height,.2),firstLayer=settingNumber(config.initial_layer_print_height,layer);
  const sparse=!enabled(config.wipe_tower_no_sparse_layers) || ['1','smooth'].includes(String(config.timelapse_type).toLowerCase()) || enabled(config.enable_wrapping_detection);
  let last=null,changes=0,nozzleChanges=0,flushChanges=0,flushMm3=0,flushGrams=0,towerMm3=0,towerGrams=0,printedLayers=0,printedHeight=0;
  const totalVisits=runs.reduce((n,run)=>n+(run.to-run.from+1)*run.colors.length,0);
  if(totalVisits>2_000_000 || used.some(id=>slot(id)<0))return null;
  for(let r=0;r<runs.length;r++) {
    const run=runs[r];
    for(let current=run.from;current<=run.to;current++) {
      const next=current<run.to?run.colors:runs[r+1]?.colors || [];
      let layerPrime=0,layerPrimeGrams=0,layerChanges=0;
      const layerColors=new Map();
      const addPrime=(id,grams)=>layerColors.set(id,(layerColors.get(id)||0)+grams);
      for(const id of orderLayerColors(run.colors,next,last,flush)) {
        if(last!==null && last!==id) {
          changes++;layerChanges++;
          const changingNozzle=nozzle(last)!==nozzle(id);
          if(changingNozzle)nozzleChanges++;
          const previous=resident.get(nozzle(id));
          if(previous && previous!==id) {
            const mm3=flush(previous,id);flushMm3+=mm3;flushGrams+=mm3*density(id)/1000;flushChanges++;
            perColor.get(id).flushGrams+=mm3*density(id)/1000;
          }
          let mm3=changingNozzle?Math.max(0,settingAt(config.filament_prime_volume_nc,slot(id),60)):prime(id);
          let grams=mm3*density(id)/1000;
          addPrime(id,grams);
          if(changingNozzle) {
            const length=settingAt(config[config.filament_map_mode==='Nozzle Manual'?'filament_change_length_nc':'filament_change_length'],slot(last),10);
            const ram=Math.max(0,length)*Math.PI*(settingAt(config.filament_diameter,slot(last),1.75)/2)**2;
            mm3+=ram;grams+=ram*density(last)/1000;
            addPrime(last,ram*density(last)/1000);
          }
          layerPrime+=mm3;layerPrimeGrams+=grams;
        }
        resident.set(nozzle(id),id);last=id;
      }
      if(towerEnabled && (!tower.layerAware || current<=tower.lastChangeLayer) && (sparse || layerChanges || !printedLayers)) {
        const thickness=Math.max(0,Math.min(printedLayers?layer:firstLayer,tower.height-printedHeight));
        if(!thickness)continue;
        const low=section(printedHeight/tower.height),high=section((printedHeight+thickness)/tower.height);
        const middle=section((printedHeight+thickness/2)/tower.height);
        // Integrate the tapered outline through this printed layer, including
        // compressed tower height when sparse layers are skipped.
        const volume=(area(low)+4*area(middle)+area(high))*thickness/6;
        const wall=Math.min(volume,(perimeter(low)+4*perimeter(middle)+perimeter(high))/6*lineWidth*thickness);
        // Priming occupies the tower's fill; do not add a solid block on top of
        // the prime volume. Sparse layers use a 15% scaffold plus the perimeter.
        const scaffold=printedLayers?wall+(volume-wall)*.15:volume;
        const mm3=Math.max(scaffold,layerPrime),rho=layerPrime?layerPrimeGrams*1000/layerPrime:density(last);
        towerMm3+=mm3;towerGrams+=mm3*rho/1000;printedLayers++;printedHeight+=thickness;
        if(layerPrime)for(const [id,grams] of layerColors)perColor.get(id).primeTowerGrams+=grams*mm3/layerPrime;
        else perColor.get(last).primeTowerGrams+=mm3*rho/1000;
      }
    }
  }
  if(towerEnabled && printedLayers) {
    const brim=Math.max(0,tower.brim),mm3=(perimeter(outline)*brim+Math.PI*brim*brim)*firstLayer;
    towerMm3+=mm3;towerGrams+=mm3*density(used[0])/1000;
    perColor.get(used[0]).primeTowerGrams+=mm3*density(used[0])/1000;
  }
  const towerDetails=towerEnabled&&printedLayers?{width:tower.width,depth:tower.depth,height:printedHeight,brim:tower.brim,
    shape:tower.settings.prime_tower_rib_wall?'ribbed':'rectangular',rounded:tower.settings.prime_tower_fillet_wall,
    ribWidth:tower.settings.prime_tower_rib_width,extraRibLength:tower.settings.prime_tower_extra_rib_length,
    infillGap:tower.settings.prime_tower_infill_gap,primeVolumeMode:tower.settings.prime_volume_mode,
    sparseLayers:sparse,printedLayers,grams:towerGrams,mm3:towerMm3}:null;
  return {tower:towerDetails,perColor:[...perColor.values()],changes,nozzleChanges:mappingKnown?nozzleChanges:null,flushChanges,flushMm3,flushGrams,towerMm3,towerGrams,
    towerCount:towerEnabled?1:0,mappingKnown,purgeAssumed:!matrixValid,purgeMm3PerChange:flushChanges?flushMm3/flushChanges:0,
    flushIntoObjects:enabled(config.flush_into_infill)||enabled(config.flush_into_objects)||enabled(config.flush_into_support),
    towerSparseAssumed:towerEnabled&&sparse};
}
