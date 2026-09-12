// Shared pre-slice tool order. Actual slicer paths can use a different order.
export const towerColor = id => String(id).split('|')[0].toUpperCase().replace(/^(#[0-9A-F]{6})FF$/, '$1');
export function orderLayerColors(colors, next, last, flush = () => 0) {
  const remaining=[...new Set(colors)].sort(),result=[];
  const candidates=remaining.filter(id=>next.includes(id)&&(remaining.length===1||id!==last));
  const end=candidates.at(-1)||remaining.filter(id=>id!==last).at(-1)||remaining[0];
  while(remaining.length) {
    const choices=remaining.length>1?remaining.filter(id=>id!==end):remaining;
    const id=choices.includes(last)?last:[...choices].sort((a,b)=>(last?flush(last,a)-flush(last,b):0)||a.localeCompare(b))[0];
    remaining.splice(remaining.indexOf(id),1);result.push(id);last=id;
  }
  return result;
}
export function combineTowerRuns(analyses) {
  const events=new Map();
  for(const analysis of analyses)for(const run of analysis.runs)for(const id of new Set(run.colors.map(towerColor))) {
    for(const [layer,delta] of [[run.from,1],[run.to+1,-1]]) {
      if(!events.has(layer))events.set(layer,new Map());
      const event=events.get(layer);event.set(id,(event.get(id)||0)+delta);
    }
  }
  const levels=[...events.keys()].sort((a,b)=>a-b),active=new Map(),runs=[];
  for(let i=0;i<levels.length-1;i++) {
    for(const [id,delta] of events.get(levels[i])){const count=(active.get(id)||0)+delta;if(count)active.set(id,count);else active.delete(id);}
    if(active.size)runs.push({from:levels[i],to:levels[i+1]-1,colors:[...active.keys()].sort()});
  }
  return runs;
}
export function summarizeTowerLayers(runs, settings) {
  const palette=settings.filament_colour.map(towerColor),slot=id=>palette.indexOf(towerColor(id));
  const at=(values,id)=>values[slot(id)]??(values.length===1?values[0]:Math.max(...values));
  const map=settings.filament_map_mode==='Nozzle Manual'?settings.filament_nozzle_map:settings.filament_map;
  const mapped=['Manual','Nozzle Manual'].includes(settings.filament_map_mode)&&Array.isArray(map)
    && runs.every(run=>run.colors.every(id=>slot(id)>=0&&Number(map[slot(id)])>0));
  const nozzle=id=>mapped?Number(map[slot(id)]):1;
  const matrix=settings.flush_volumes_matrix,n=palette.length;
  const flush=(from,to)=>matrix.length===n*n&&slot(from)>=0&&slot(to)>=0?Number(matrix[slot(from)*n+slot(to)]):0;
  let last=null,lastChangeLayer=0,changeLayers=0,peakArea=0,peakPrime=0,peakColors=0,firstChanges=false;
  const runChanges=[];
  for(let r=0;r<runs.length;r++) {
    const run=runs[r],seen=new Map(),changesBefore=changeLayers;
    if(!Number.isSafeInteger(run.from)||!Number.isSafeInteger(run.to)||run.from<1||run.to<run.from||run.to>100000)throw new Error('Invalid tower layer information.');
    for(let current=run.from;current<=run.to;) {
      // Repeated layers cycle between the same ending tools. Skip whole cycles
      // while retaining the last change height, peak demand and printed layers.
      if(current<run.to) {
        const previous=seen.get(last);
        if(previous) {
          const cycles=Math.floor((run.to-current)/(current-previous.layer));
          if(cycles) {
            const skipped=cycles*(current-previous.layer);
            if(lastChangeLayer>=previous.layer)lastChangeLayer+=skipped;
            changeLayers+=cycles*(changeLayers-previous.changeLayers);current+=skipped;continue;
          }
        } else seen.set(last,{layer:current,changeLayers});
      }
      const next=current<run.to?run.colors:runs[r+1]?.colors||[];
      let volume=0,changes=0;
      for(const id of orderLayerColors(run.colors,next,last,flush)) {
        if(last!==null&&last!==id) {
          changes++;
          const nozzleChange=mapped?nozzle(last)!==nozzle(id):settings.hotendCount>1;
          volume+=nozzleChange?at(settings.filament_prime_volume_nc,id):settings.prime_volume_mode==='Saving'?15:at(settings.filament_prime_volume,id);
          if(nozzleChange)volume+=at(settings.filament_change_length,last)*Math.PI*(at(settings.filament_diameter,last)/2)**2;
        }
        last=id;
      }
      if(changes){lastChangeLayer=current;changeLayers++;if(current===1)firstChanges=true;}
      const thickness=current===1?settings.firstLayerHeight:settings.layerHeight;
      peakArea=Math.max(peakArea,volume/thickness);peakPrime=Math.max(peakPrime,volume);peakColors=Math.max(peakColors,run.colors.length);
      current++;
    }
    runChanges.push(changeLayers-changesBefore);
  }
  const special=settings.enable_wrapping_detection||['1','smooth'].includes(settings.timelapse_type.toLowerCase());
  if(!lastChangeLayer&&!special)return null;
  const lastLayer=special?runs.at(-1).to:lastChangeLayer;
  const skip=settings.wipe_tower_no_sparse_layers&&!special;
  const printedLayerCount=skip?changeLayers+(firstChanges?0:1):lastLayer;
  const colorRuns=runs.filter(run=>run.from<=lastLayer).map(run=>({...run,to:Math.min(run.to,lastLayer)}));
  let printed=0;
  const previewRuns=skip?runs.flatMap((run,i)=>{
    const count=runChanges[i]+(i===0&&!firstChanges?1:0);
    if(!count)return [];
    const from=printed+1;printed+=count;
    return [{from,to:printed,colors:run.colors}];
  }):colorRuns;
  return {layerAware:true,lastChangeLayer:lastLayer,printedLayerCount,peakLayerColors:peakColors,peakLayerPrimeMm3:peakPrime,
    height:settings.firstLayerHeight+(printedLayerCount-1)*settings.layerHeight,primeArea:peakArea,
    colorRuns,previewRuns};
}
