export function historyDateRange(period='all',days=7,now=new Date()) {
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const end=new Date(start);end.setDate(end.getDate()+1);
  if(period==='all')return {from:null,to:null,label:'All export dates'};
  if(period==='week')start.setDate(start.getDate()-(start.getDay()+6)%7);
  else if(period==='month')start.setDate(1);
  else if(period==='days') {
    if(!Number.isInteger(Number(days)) || Number(days)<1 || Number(days)>3650)throw new Error('Enter a whole number of days from 1 to 3,650.');
    start.setDate(start.getDate()-Number(days)+1);
  } else if(period!=='today')throw new Error('Choose a valid date range.');
  return {from:start.getTime(),to:end.getTime(),label:`${start.toLocaleDateString()} – ${now.toLocaleDateString()} · export dates in your time zone`};
}

export function normalizeHistoryFilter(input={}) {
  const result={};
  for(const key of ['from','to']) {
    if(input[key]===undefined || input[key]===null || input[key]==='')continue;
    const value=Number(input[key]);
    if(!Number.isSafeInteger(value)||value<0||value>8640000000000000)throw new Error('Invalid history date range.');
    result[key]=value;
  }
  if(result.from!==undefined&&result.to!==undefined&&result.from>=result.to)throw new Error('The start date must be before the end date.');
  if(input.ids!==undefined) {
    if(!Array.isArray(input.ids)||!input.ids.length||input.ids.length>500||input.ids.some(id=>typeof id!=='string'||!/^[0-9a-f-]{36}$/i.test(id)))throw new Error('Select between 1 and 500 exports.');
    result.ids=[...new Set(input.ids)];
  }
  result.timeZone=String(input.timeZone||'UTC');
  try {new Intl.DateTimeFormat('en',{timeZone:result.timeZone}).format();}catch{throw new Error('Invalid report time zone.');}
  return result;
}

const csvCell=value=>{
  let text=value===null||value===undefined?'':String(value);
  // Protect spreadsheet users from formulas in user-controlled titles/notes.
  if(typeof value==='string'&&/^[\s]*[=+@-]/.test(text))text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
};
const numeric=value=>Number.isFinite(value)?Number(value.toFixed(4)):null;
export function historyTowerDescription(tower) {
  const mm=value=>Number.isFinite(value)?String(Number(value.toFixed(2))):'—';
  return `Plate ${tower.plateId}: ${mm(tower.width)} × ${mm(tower.depth)} × ${mm(tower.height)} mm · ${tower.shape} · ${tower.rounded?'rounded':'sharp'} corners · ${mm(tower.brim)} mm brim`
    +(tower.shape==='ribbed'?` · ${mm(tower.ribWidth)} mm ribs · ${mm(tower.extraRibLength)} mm extra rib length`:'')
    +` · ${mm(tower.infillGap)}% infill gap · ${tower.primeVolumeMode} priming · ${tower.sparseLayers?'sparse layers included':'sparse layers skipped'} · ${tower.printedLayers} layers · ~${mm(tower.grams)} g`;
}
export function historyReportCsv(exports,{timeZone='UTC'}={}) {
  const format=new Intl.DateTimeFormat('en-CA',{timeZone,dateStyle:'short',timeStyle:'medium',hour12:false});
  const rows=[['Export ID','Exported at (UTC)','Exported at (local)','Time zone','Title','Printer','Nozzle diameter (mm)','Layer height (mm)','Plate IDs','Plate count','Design count','Model filament (g, estimated)','Flushed filament (g, estimated)','Prime tower (g, estimated)','Total waste (g, estimated)','Total filament (g, estimated)','Color switches (estimated)','Nozzle switches (estimated)','Estimate version','Record type','Estimate notes']];
  rows[0].push('Prime tower count (estimated)','Prime tower dimensions and variation (estimated; width × depth × height)');
  for(const item of exports) {
    const e=item.estimate||{},profile=item.profile||{};
    rows.push([item.id,new Date(item.createdAt).toISOString(),format.format(item.createdAt),timeZone,item.title,profile.printer,
      profile.nozzleDiameter,profile.settings?.layer_height,(item.plateIds||[]).join(' / '),item.plateIds?.length,item.objectCount,
      numeric(e.modelGrams),numeric(e.flushGrams??e.purgeGrams),numeric(e.primeTowerGrams),numeric(e.wasteGrams),numeric(e.totalGrams),
      e.changes,e.nozzleChanges,e.version||1,'Export event; not a confirmed print',
      (e.notes||['Legacy estimate: prime towers, startup purging, supports and brims were excluded.']).join(' '),
      e.primeTowerCount,e.primeTowers?.map(historyTowerDescription).join(' / ')]);
  }
  return '\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
