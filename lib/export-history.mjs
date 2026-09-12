import { parallelWork } from './parallel-work.mjs';
import { createHash, randomUUID } from 'node:crypto';
import { DOMParser } from '@xmldom/xmldom';
import { Matrix4 } from '../public/vendor/three/three.module.js';
import { STLLoader } from '../public/vendor/three/addons/loaders/STLLoader.js';
import { readSolid3mf } from '../public/solid-3mf.js';
import { packCore3mf, packBambuPlateArchive } from '../public/core-3mf.js';
import { isValidPlateId, comparePlateIds, MAX_PLATES } from '../public/plate-ids.js';
import { normalizePrimeTowerSettings } from '../public/prime-tower.js';
import { placeObjectsOnBed } from '../public/export-geometry.js';
import { estimateFilament } from '../public/filament-estimate.js';
import { exportPreview } from './export-preview.mjs';
import { unzipSync, strFromU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { PRINTERS, PRINT_SETTINGS_GROUPS } from '../public/print-settings-schema.js';
import { normalizeHistoryFilter, historyReportCsv } from '../public/export-history-report.js';

const hash = value => createHash('sha256').update(value).digest('hex');
const fail = (message,status=400) => Object.assign(new Error(message),{status,code:status===404?'WORKSPACE_NOT_FOUND':'BAD_REQUEST'});
const name = (value,fallback) => String(value || fallback).replace(/[\u0000-\u001f\u007f]/g,'').slice(0,180);
const parseXml = text => new DOMParser().parseFromString(text,'application/xml');
const printFields=new Map(PRINT_SETTINGS_GROUPS.filter(group=>group.scope==='process').flatMap(group=>group.sections.flatMap(section=>section.settings)).filter(item=>!item.globalOnly).map(item=>[item.key,item]));
function objectSettings(input={}) {
  const result={};
  for(const [key,value] of Object.entries(input)) {
    const field=printFields.get(key);if(!field)throw fail(`Unsupported object print setting: ${key}.`);
    if(field.type==='boolean') {if(![true,false,'1','0'].includes(value))throw fail(`Invalid ${field.label}.`);result[key]=value===true||value==='1'?'1':'0';}
    else if(field.type==='select') {if(!field.options.includes(value))throw fail(`Invalid ${field.label}.`);result[key]=value;}
    else {const n=parseFloat(value);if(!Number.isFinite(n)||n<field.min||n>field.max)throw fail(`Invalid ${field.label}.`);result[key]=`${n}${field.type==='percent'&&['sparse_infill_density','ironing_flow'].includes(key)?'%':''}`;}
  }
  return result;
}

// Fingerprint uncompressed entries: ZIP timestamps are not print settings.
export function archiveFingerprint(archive) {
  const entries=unzipSync(new Uint8Array(archive)), digest=createHash('sha256');
  const projectBundle=!entries['3D/3dmodel.model'];
  for(const key of Object.keys(entries).sort()) digest.update(key).update('\0').update(projectBundle&&/\.3mf$/i.test(key)?archiveFingerprint(entries[key]):entries[key]);
  return digest.digest('hex');
}

export function exportedPrintSettings(archive, plateIds) {
  const entries=unzipSync(new Uint8Array(archive));
  if(entries['Metadata/project_settings.config']) {
    const config=JSON.parse(strFromU8(entries['Metadata/project_settings.config']));
    return Object.fromEntries(plateIds.map(id=>[id,config]));
  }
  if(entries['plates.json'])return Object.assign({},...JSON.parse(strFromU8(entries['plates.json'])).projects.map(project=>exportedPrintSettings(entries[project.filename],project.plateIds)));
  return {};
}

function recipePrimeTowers(input, plateIds) {
  if (!Array.isArray(input) || input.length > MAX_PLATES) throw fail('Invalid export prime towers.');
  const seen = new Set();
  return input.map(tower => {
    if (!tower || !isValidPlateId(tower.plateId) || seen.has(tower.plateId)
      || !['x','y','bodyX','bodyY'].every(key => Number.isFinite(tower[key]) && Math.abs(tower[key]) < 100000)
      || !['w','h','width','depth'].every(key => Number.isFinite(tower[key]) && tower[key] > 0 && tower[key] < 100000)
      || !Number.isFinite(tower.brim) || tower.brim < 0 || tower.brim > 1000) throw fail('Invalid export prime tower placement.');
    seen.add(tower.plateId);
    return {...structuredClone(tower),settings:normalizePrimeTowerSettings(tower.settings || {})};
  }).filter(tower => plateIds.has(tower.plateId));
}

export function validateRecipe(input) {
  if(Buffer.byteLength(JSON.stringify(input||{}))>20*1024**2)throw fail('Export settings exceed the 20 MB limit.');
  if(input?.version!==1 || !Array.isArray(input.sources) || !input.sources.length || input.sources.length>32
    || !Array.isArray(input.requests) || !input.requests.length || input.requests.length>1200
    || !Array.isArray(input.objects) || !input.objects.length || input.objects.length>1000) throw fail('Invalid export settings.');
  const sources=input.sources.map(source=>{
    if(typeof source.source!=='string'||!source.source.trim()||Buffer.byteLength(source.source)>8*1024**2||source.source.includes('\0')) throw fail('Invalid export SCAD.');
    return {source:source.source,sourceName:name(source.sourceName,'model.scad'),packageId:source.packageId?String(source.packageId):null,packageEntry:source.packageEntry?String(source.packageEntry):null};
  });
  const requests=input.requests.map(request=>{
    if(!Number.isInteger(request.source)||!sources[request.source]||!['stl','3mf'].includes(request.format)
      || request.objectId!==undefined&&(!Number.isInteger(request.objectId)||request.objectId<1)
      || !request.values||typeof request.values!=='object'||Array.isArray(request.values)) throw fail('Invalid export render settings.');
    return {source:request.source,format:request.format,values:structuredClone(request.values),
      ...(request.objectId===undefined?{}:{objectId:request.objectId}),
      ...(request.part?{part:String(request.part)}:{}),...(request.solidParts?{solidParts:structuredClone(request.solidParts)}:{})};
  });
  const objects=input.objects.map(object=>{
    if(!isValidPlateId(object.plateId)||!Array.isArray(object.contributions)||!object.contributions.length||object.contributions.length>128) throw fail('Invalid export plate.');
    return {id:name(object.id,'object'),name:name(object.name,'Object'),plateId:object.plateId,settings:objectSettings(object.settings),contributions:object.contributions.map(part=>{
      if(!Number.isInteger(part.request)||!requests[part.request]||!Array.isArray(part.matrix)||part.matrix.length!==16
        ||!part.matrix.every(v=>Number.isFinite(v)&&Math.abs(v)<1e6)||Math.abs(new Matrix4().fromArray(part.matrix).determinant())<1e-10
        ||part.matrix[3]!==0||part.matrix[7]!==0||part.matrix[11]!==0||part.matrix[15]!==1) throw fail('Invalid export placement.');
      if(part.color&&!/^#[0-9a-f]{6}$/i.test(part.color))throw fail('Invalid export color.');
      return {request:part.request,matrix:[...part.matrix],prefix:name(part.prefix,''),partName:name(part.partName,''),color:part.color||null};
    })};
  });
  return {version:1,...(requests.some(request=>request.solidParts)?{colorExportVersion:3}:{}),title:name(input.title,'Workspace'),scope:input.scope==='selected'?'selected':'all',sources,requests,objects,
    plateNames:Object.fromEntries([...new Set(objects.map(o=>o.plateId))].sort(comparePlateIds).map(id=>[id,name(input.plateNames?.[id],`Plate ${id}`)])),
    ...(input.primeTowers===undefined?{}:{primeTowers:recipePrimeTowers(input.primeTowers,new Set(objects.map(object=>object.plateId)))}),
    profile:structuredClone(input.profile),workflow:structuredClone(input.workflow || {})};
}

export async function renderExportRecipe(recipe,{render,signal,makePreview=true,concurrency=1}) {
  const geometries=[], palette=[], rendered=new Map(), printer=PRINTERS[recipe.profile.printer];
  const slot=color=>{color=String(color||recipe.profile.filamentColor||'#D9DDE5').toUpperCase();let i=palette.indexOf(color);if(i<0){i=palette.length;palette.push(color);}return i;};
  try {
    const requests = [...new Map(recipe.requests.map(request => [JSON.stringify(request), request])).entries()];
    await parallelWork(requests, concurrency, async ([key, request], _index, jobSignal) => {
      const source=recipe.sources[request.source];
      const bytes=await render(request.values,request.format,{...source,objectId:request.objectId,part:request.part,solidParts:request.solidParts,
        dependencies:source.dependencies,frozenFonts:true,allowEmpty:Boolean(request.part),requireSandbox:true,signal:jobSignal});
      const solids=!bytes.length?[]:request.format==='3mf'?readSolid3mf(bytes,parseXml,{colorMetadata:true}):[{geometry:new STLLoader().parse(Uint8Array.from(bytes).buffer)}];
      geometries.push(...solids.map(s=>s.geometry));rendered.set(key,solids);
    }, signal);
    recipe.requests.forEach((request,index)=>rendered.set(index,rendered.get(JSON.stringify(request))));
    const plates=Object.keys(recipe.plateNames).map(id=>({id,name:recipe.plateNames[id],objects:[],palette,primeTower:recipe.primeTowers?.find(tower=>tower.plateId===id)}));
    for(const object of recipe.objects) {
      const parts=[];
      for(const contribution of object.contributions)for(const solid of rendered.get(contribution.request)) {
        const matrix=new Matrix4().fromArray(contribution.matrix),geometry=solid.geometry.clone().applyMatrix4(matrix);geometries.push(geometry);
        if(matrix.determinant()<0){const n=geometry.index?.count||geometry.getAttribute('position').count,indices=geometry.index?Array.from(geometry.index.array):Array.from({length:n},(_,i)=>i);for(let i=0;i<n;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];geometry.setIndex(indices);}
        parts.push({name:`${contribution.prefix}${contribution.partName||solid.name||'Solid part'}`,geometry,
          materialIndex:slot(contribution.color||solid.colors?.[0]),materialIndices:solid.colors&&!contribution.color?Uint32Array.from(solid.colors,slot):undefined});
      }
      if(parts.length)plates.find(p=>p.id===object.plateId).objects.push({name:object.name,settings:object.settings,parts});
    }
    const populated=plates.filter(p=>p.objects.length);if(!populated.length)throw fail('No printable geometry was generated.');
    for(const plate of populated)placeObjectsOnBed(plate.objects);
    const attachments={'workflow.json':JSON.stringify(recipe.workflow),'print-profile.json':JSON.stringify(recipe.profile)};
    const model={title:recipe.title,application:'Liqu3D',palette,bambuTemplate:recipe.template,attachments,bedSize:printer,primeTowerSettings:recipe.workflow?.primeTower};
    const packed=populated.length===1&&!populated[0].primeTower
      ? {archive:packCore3mf({...model,title:populated[0].name,objects:populated[0].objects}),extension:'3mf',mimeType:'model/3mf',projectCount:1}
      : packBambuPlateArchive({...model,plates:populated});
    const {archive,...format}=packed;
    const projectSettings=exportedPrintSettings(archive,populated.map(plate=>plate.id));
    const estimate=estimateFilament(populated,recipe.profile,recipe.template,{projectSettings}),preview=makePreview?exportPreview(populated,printer):null;
    return {archive:Buffer.from(archive),...format,estimate,preview,plateIds:populated.map(p=>p.id),objectCount:populated.reduce((n,p)=>n+p.objects.length,0),fingerprint:archiveFingerprint(archive)};
  } finally {for(const geometry of geometries)geometry.dispose();}
}

export function createExportHistory(db,options) {
  db.exec(`CREATE TABLE IF NOT EXISTS export_snapshots(id TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_json TEXT NOT NULL,preview BLOB NOT NULL,summary_json TEXT NOT NULL,fingerprint TEXT NOT NULL,recipe_hash TEXT NOT NULL,created_at INTEGER NOT NULL,
    UNIQUE(user_id,recipe_hash));
    CREATE TABLE IF NOT EXISTS export_history(id TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_id TEXT NOT NULL REFERENCES export_snapshots(id) ON DELETE CASCADE,created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS export_history_user ON export_history(user_id,created_at DESC);
    CREATE TABLE IF NOT EXISTS export_history_estimates(history_id TEXT PRIMARY KEY REFERENCES export_history(id) ON DELETE CASCADE,estimate_json TEXT NOT NULL);`);
  const active=new Set();
  const find=(userId,id)=>{const row=db.prepare('SELECT s.*,h.id AS history_id,h.created_at AS exported_at FROM export_history h JOIN export_snapshots s ON s.id=h.snapshot_id WHERE h.user_id=? AND h.id=?').get(userId,id);if(!row)throw fail('Export was not found.',404);return row;};
  const summary=row=>({...JSON.parse(row.summary_json),...(row.estimate_json?{estimate:JSON.parse(row.estimate_json)}:{}),id:row.history_id,createdAt:row.exported_at});
  const historyJoin='export_history h JOIN export_snapshots s ON s.id=h.snapshot_id LEFT JOIN export_history_estimates e ON e.history_id=h.id';
  const estimateJson="COALESCE(e.estimate_json,json_extract(s.summary_json,'$.estimate'),'{}')";
  const query=(userId,input={})=>{
    let filter;try{filter=normalizeHistoryFilter(input);}catch(error){throw fail(error.message);}
    const clauses=['h.user_id=?'],params=[userId];
    for(const [key,op] of [['from','>='],['to','<']])if(filter[key]!==undefined){clauses.push(`h.created_at ${op} ?`);params.push(filter[key]);}
    if(filter.ids){clauses.push(`h.id IN (${filter.ids.map(()=>'?').join(',')})`);params.push(...filter.ids);}
    return {where:clauses.join(' AND '),params,filter};
  };
  async function perform(userId,input,{id,signal}={}) {
    if(active.has(userId))throw fail('An export is already running. Please wait.',409);active.add(userId);
    try {
      let recipe,row;
      if(id){row=find(userId,id);recipe=JSON.parse(row.recipe_json);if(recipe.requests.some(request=>request.solidParts)&&recipe.colorExportVersion!==3)throw fail('This export used the older color exporter. Create a new export from your workspace to preserve its colors.',409);if(recipe.runtime!==await options.runtime())throw fail('The renderer has changed since this export. The original settings are preserved, but an identical export cannot be guaranteed.',409);}
      else {
        recipe=validateRecipe(input);recipe.profile=options.sanitizeProfile(recipe.profile);
        recipe.template=await options.profileTemplate(recipe.profile);recipe.runtime=await options.runtime();
        for(const source of recipe.sources){source.dependencies=await options.freezeDependencies(userId,source);source.packageId=null;}
      }
      const encoded=JSON.stringify(recipe),recipeHash=hash(encoded);
      row ||= db.prepare('SELECT * FROM export_snapshots WHERE user_id=? AND recipe_hash=?').get(userId,recipeHash);
      const result=await renderExportRecipe(recipe,{signal,makePreview:!row,concurrency:await options.renderConcurrency?.(),render:(values,format,extra)=>options.render(values,format,{...extra,owner:`user:${userId}`})});
      if(row&&result.fingerprint!==row.fingerprint)throw fail('Regenerated geometry or print settings differ from this export. Nothing was downloaded.',409);
      if(signal?.aborted)throw fail('Export cancelled.');
      const filename=`${recipe.title.replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,80)||'export'}-${recipe.profile.printer}-${recipe.profile.nozzleDiameter}mm-${result.plateIds.length}-plates.${result.extension}`;
      const info={title:recipe.title,filename,extension:result.extension,mimeType:result.mimeType,projectCount:result.projectCount,scope:recipe.scope,plateIds:result.plateIds,objectCount:result.objectCount,
        overrideCount:recipe.objects.filter(object=>Object.keys(object.settings).length).length,profile:recipe.profile,estimate:result.estimate};
      options.enforceStorage(userId,(row?256:Buffer.byteLength(encoded)+result.preview.length+Buffer.byteLength(JSON.stringify(info))+256)+Buffer.byteLength(JSON.stringify(result.estimate)));
      const now=Date.now(),snapshotId=row?.id||randomUUID(),historyId=randomUUID();
      // Persist only source/parameters/assets, print settings, thumbnail and
      // estimates. The generated 3MF exists only until this response is sent.
      if(!row)db.prepare('INSERT INTO export_snapshots VALUES(?,?,?,?,?,?,?,?)').run(snapshotId,userId,encoded,result.preview,JSON.stringify(info),result.fingerprint,recipeHash,now);
      db.prepare('INSERT INTO export_history VALUES(?,?,?,?)').run(historyId,userId,snapshotId,now);
      db.prepare('INSERT INTO export_history_estimates VALUES(?,?)').run(historyId,JSON.stringify(result.estimate));
      return {...result,summary:{...info,id:historyId,createdAt:now},filename};
    } finally {active.delete(userId);}
  }
  return {perform,
    list(userId,{offset=0,limit=30,...filter}={}) {
      const q=query(userId,filter);
      return db.prepare(`SELECT h.id AS history_id,h.created_at AS exported_at,s.summary_json,e.estimate_json FROM ${historyJoin} WHERE ${q.where} ORDER BY h.created_at DESC,h.rowid DESC LIMIT ? OFFSET ?`).all(...q.params,Math.min(100,Math.max(1,limit)),Math.max(0,offset)).map(summary);
    },
    stats(userId,filter={}) {
      const q=query(userId,filter);
      return db.prepare(`SELECT COUNT(*) AS count,
        COALESCE(SUM(json_extract(${estimateJson},'$.totalGrams')),0) AS totalGrams,
        COALESCE(SUM(json_extract(${estimateJson},'$.wasteGrams')),0) AS wasteGrams,
        COALESCE(SUM(json_extract(${estimateJson},'$.totalGrams') IS NULL),0) AS missingTotal,
        COALESCE(SUM(json_extract(${estimateJson},'$.wasteGrams') IS NULL),0) AS missingWaste,
        COALESCE(SUM(COALESCE(json_extract(${estimateJson},'$.version'),1)<2),0) AS legacyCount
        FROM ${historyJoin} WHERE ${q.where}`).get(...q.params);
    },
    report(userId,input={}) {
      const q=query(userId,input);
      const rows=db.prepare(`SELECT h.id AS history_id,h.created_at AS exported_at,s.summary_json,e.estimate_json FROM ${historyJoin} WHERE ${q.where} ORDER BY h.created_at DESC,h.rowid DESC LIMIT 10001`).all(...q.params);
      if(rows.length>10000)throw fail('This report exceeds 10,000 exports. Choose a shorter date range.');
      return historyReportCsv(rows.map(summary),q.filter);
    },
    removeMany(userId,ids) {
      if(!Array.isArray(ids))throw fail('Select between 1 and 500 exports.');
      const q=query(userId,{ids});
      if(active.has(userId))throw fail('Wait for the current export to finish before deleting history.',409);
      const rows=db.prepare(`SELECT h.id,h.snapshot_id FROM export_history h WHERE ${q.where}`).all(...q.params);
      if(rows.length!==q.filter.ids.length)throw fail('One or more exports were not found. Refresh history and try again.',404);
      db.exec('SAVEPOINT delete_selected_exports');
      try {
        for(const row of rows)db.prepare('DELETE FROM export_history WHERE user_id=? AND id=?').run(userId,row.id);
        for(const snapshotId of new Set(rows.map(row=>row.snapshot_id)))db.prepare('DELETE FROM export_snapshots WHERE user_id=? AND id=? AND NOT EXISTS (SELECT 1 FROM export_history WHERE snapshot_id=?)').run(userId,snapshotId,snapshotId);
        db.exec('RELEASE delete_selected_exports');return {deleted:rows.length};
      }catch(error){db.exec('ROLLBACK TO delete_selected_exports; RELEASE delete_selected_exports');throw error;}
    },
    preview(userId,id){return find(userId,id).preview;},
    remove(userId,id){
      const row=find(userId,id);
      if(active.has(userId))throw fail('Wait for the current export to finish before deleting history.',409);
      db.exec('SAVEPOINT delete_export_history');
      try {
        db.prepare('DELETE FROM export_history WHERE user_id=? AND id=?').run(userId,id);
        db.prepare('DELETE FROM export_snapshots WHERE user_id=? AND id=? AND NOT EXISTS (SELECT 1 FROM export_history WHERE snapshot_id=?)').run(userId,row.id,row.id);
        db.exec('RELEASE delete_export_history');
        return {id,deleted:true};
      } catch(error) {db.exec('ROLLBACK TO delete_export_history; RELEASE delete_export_history');throw error;}
    },
    storageBytes(userId){return Number(db.prepare('SELECT COALESCE(SUM(length(CAST(recipe_json AS BLOB))+length(preview)+length(CAST(summary_json AS BLOB))),0) AS bytes FROM export_snapshots WHERE user_id=?').get(userId).bytes)+Number(db.prepare('SELECT COALESCE(SUM(length(CAST(e.estimate_json AS BLOB))),0) AS bytes FROM export_history_estimates e JOIN export_history h ON h.id=e.history_id WHERE h.user_id=?').get(userId).bytes);},
    export(userId){return db.prepare('SELECT * FROM export_snapshots WHERE user_id=?').all(userId).map(row=>({...row,preview:Buffer.from(row.preview).toString('base64')}));},
    clear(userId){return db.prepare('DELETE FROM export_snapshots WHERE user_id=?').run(userId).changes;}
  };
}
