import { randomUUID, createHash } from 'node:crypto';
import { normalizeAssets, packageSource, validateDependencies } from './instant-assets.mjs';
import { parseOrders, resolveOrders, normalizeField, selectOrderModel, parametersForModel } from './instant-orders.mjs';
import { generateInstant } from './instant-generation.mjs';
import { colorOptimizationSettings, instantColorCache } from './instant-color-optimization.mjs';
import { normalizeMaxObjectsPerPlate } from '../public/packing-settings.js';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const decode = text => JSON.parse(text || '{}');
export function createInstantStore(db, options) {
  db.exec(`CREATE TABLE IF NOT EXISTS instant_setups (
    workspace_id TEXT PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    config_json TEXT NOT NULL, fingerprint TEXT NOT NULL DEFAULT '', current_run TEXT, last_success TEXT);
    CREATE TABLE IF NOT EXISTS instant_packages (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, files_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS instant_runs (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, fingerprint TEXT NOT NULL, snapshot_json TEXT NOT NULL,
      status TEXT NOT NULL, progress_json TEXT NOT NULL DEFAULT '{}', error TEXT, result BLOB, workspace_json TEXT,
      created_at INTEGER NOT NULL, finished_at INTEGER);
    CREATE INDEX IF NOT EXISTS instant_run_queue ON instant_runs(status,created_at);`);
  if(!db.prepare('PRAGMA table_info(instant_runs)').all().some(column=>column.name==='recipe_json')) db.exec('ALTER TABLE instant_runs ADD COLUMN recipe_json TEXT');
  // Older runs retain their source snapshot and regenerate on demand too.
  db.exec('UPDATE instant_runs SET result=NULL WHERE result IS NOT NULL');
  const active = new Map(); let pumping = false, closing = false;
  const setup = (userId, id, allowConverted = false) => {
    const row = db.prepare('SELECT s.*,w.kind,w.name,w.pinned,w.expires_at FROM instant_setups s JOIN workspaces w ON w.id=s.workspace_id WHERE s.user_id=? AND s.workspace_id=?').get(userId, id);
    if (!row || (!allowConverted && row.kind !== 'instant')) throw Object.assign(new Error('Quick batch was not found.'), {code:'WORKSPACE_NOT_FOUND'});
    return row;
  };
  const run = (userId, id, full = false) => id ? db.prepare(`SELECT ${full ? '*' : 'id,workspace_id,user_id,fingerprint,status,progress_json,error,created_at,finished_at,snapshot_json'} FROM instant_runs WHERE user_id=? AND id=?`).get(userId,id) : null;
  const packageFiles = (userId, id) => {
    const row = db.prepare('SELECT files_json FROM instant_packages WHERE user_id=? AND id=?').get(userId,id);
    if (!row) throw Object.assign(new Error('Model dependencies were not found.'), {code:'WORKSPACE_NOT_FOUND'}); return decode(row.files_json);
  };
  function analyze(userId, row) {
    const config = decode(row.config_json); const modelSelection = config.modelSelection || (config.groupKey ? 'manual' : 'auto'); const errors = []; let parsed = { headers: [], records: [] }, source = '', metadata = { parameters: [], objects: [] }, groups = [], group = null;
    let resolved = { mapping: {}, matches: {}, unresolved: [], errors: [], objects: [], orderCount: 0, objectCount: 0 }, parameters = [];
    try {
      if (config.ordersText) parsed = parseOrders(config.ordersText, config.format);
      if (config.packageId && config.entry) {
        const files = packageFiles(userId,config.packageId); validateDependencies(files);
        source = packageSource(files,config.entry); metadata = options.modelInfo(source);
        const map = new Map();
        for (const object of metadata.objects) {
          const key = object.mergeKey || `object_${object.id}`;
          if (!map.has(key)) map.set(key,{ key, label: object.label, labelParam: object.labelParam, memberIds: [] });
          map.get(key).memberIds.push(Number(object.id));
        }
        groups = [...map.values()];
        if (!groups.length) groups = [{ key: 'model', label: 'Complete model', memberIds: [] }];
        group = selectOrderModel(parsed, metadata.parameters, groups, config.mapping || {}, modelSelection, config.groupKey);
        if (group) {
          parameters = parametersForModel(metadata.parameters, group);
          const defaults = Object.fromEntries(metadata.parameters.map(param=>[param.name,param.default]));
          resolved = resolveOrders(parsed, parameters, config.mapping || {}, defaults); errors.push(...resolved.errors);
        } else errors.push('The saved model is unavailable. Choose Automatic or another model in More options.');
      }
      if (!config.ordersText) errors.push('Add an order file.');
      if (!config.packageId) errors.push('Add a SCAD file or model folder.');
      else if (!config.entry) errors.push('Choose the entry SCAD file.');
    } catch(error) { errors.push(error.message); }
    const ready = Boolean(source && group && parsed.records.length && !errors.length && !resolved.unresolved.length);
    return { config, modelSelection, errors, parsed, source, group, groups, parameters, resolved, ready };
  }
  const summaryRun = row => row ? { id:row.id, status:row.status, progress:decode(row.progress_json), error:row.error, createdAt:row.created_at, finishedAt:row.finished_at, ordersName:decode(row.snapshot_json).ordersName } : null;
  function get(userId,id) {
    const row = setup(userId,id), analysis = analyze(userId,row);
    const files = analysis.config.packageId ? packageFiles(userId,analysis.config.packageId).map(file=>({path:file.path,bytes:Buffer.from(file.base64,'base64').length})) : [];
    const current = run(userId,row.current_run), success = run(userId,row.last_success);
    return { id,name:row.name,pinned:Boolean(row.pinned),expiresAt:row.expires_at??null,config:analysis.config,files,parameters:analysis.parameters,groups:analysis.groups,
      validation:{ ready:analysis.ready,errors:analysis.errors,unresolved:analysis.resolved.unresolved,mapping:analysis.resolved.mapping,matches:analysis.resolved.matches,model:analysis.group?{...analysis.group,selection:analysis.modelSelection}:null,headers:analysis.parsed.headers,records:analysis.parsed.records.slice(0,5),orderCount:analysis.resolved.orderCount,objectCount:analysis.resolved.objectCount },
      current:summaryRun(current),currentMatchesInputs:current?.fingerprint===row.fingerprint,result:summaryRun(success),needsGeneration:analysis.ready && (!success || success.fingerprint!==row.fingerprint),canConvert:!!success && row.current_run === row.last_success && success.fingerprint === row.fingerprint && analysis.ready && !decode(success.progress_json).skippedCount };
  }
  function stop(userId,id) {
    active.get(id)?.abort();
    db.prepare("UPDATE instant_runs SET status='cancelled',finished_at=? WHERE user_id=? AND workspace_id=? AND status IN ('queued','running')").run(Date.now(),userId,id);
  }
  function save(userId,id,body,{resolve=false}={}) {
    const row=setup(userId,id), old=decode(row.config_json), config={...old};
    for (const key of ['ordersName','ordersText','format','entry','groupKey']) if (Object.hasOwn(body,key)) config[key]=String(body[key]);
    if (Object.hasOwn(body,'modelSelection')) {
      if (!['auto','manual'].includes(body.modelSelection)) throw new Error('Invalid model selection.');
      config.modelSelection=body.modelSelection;
    } else if (Object.hasOwn(body,'groupKey')) config.modelSelection=body.groupKey?'manual':'auto';
    if (Object.hasOwn(body,'mapping')) config.mapping=Object.fromEntries(Object.entries(body.mapping || {}).map(([key,value])=>[key,String(value)]));
    if (body.mappingPatch) {
      config.mapping={...(config.mapping||{})};
      for (const [header,target] of Object.entries(body.mappingPatch)) {
        for (const existing of Object.keys(config.mapping)) if (normalizeField(existing)===normalizeField(header)) delete config.mapping[existing];
        if (target!==null) config.mapping[header]=String(target);
      }
    }
    if (body.printProfile) config.printProfile=options.sanitizeProfile(body.printProfile);
    if (Object.hasOwn(body,'colorOptimization')) config.colorOptimization=colorOptimizationSettings(body.colorOptimization);
    if (Object.hasOwn(body,'maxObjectsPerPlate')) config.maxObjectsPerPlate=normalizeMaxObjectsPerPlate(body.maxObjectsPerPlate);
    const encoded=JSON.stringify(config); if(Buffer.byteLength(encoded)>4*1024*1024) throw new Error('Quick batch setup exceeds 4 MB.');
    options.enforceStorage(userId,Buffer.byteLength(encoded),Buffer.byteLength(row.config_json));
    const analysis=analyze(userId,{...row,config_json:encoded});
    const fingerprint=(resolve||encoded!==row.config_json)?hash({config,resolution:resolutionFor(analysis)}):row.fingerprint;
    if(fingerprint!==row.fingerprint) stop(userId,id);
    db.prepare('UPDATE instant_setups SET config_json=?,fingerprint=? WHERE user_id=? AND workspace_id=?').run(encoded,fingerprint,userId,id);
    db.prepare('UPDATE workspaces SET updated_at=? WHERE user_id=? AND id=?').run(Date.now(),userId,id);
    if (body.name) db.prepare('UPDATE workspaces SET name=? WHERE user_id=? AND id=?').run(String(body.name).trim().slice(0,120)||'Untitled Quick batch',userId,id);
    return get(userId,id);
  }
  function resolutionFor(analysis) { return {version:2,model:analysis.group?.key||null,selection:analysis.modelSelection,mapping:analysis.resolved.mapping}; }
  function enqueue(userId,id,retry=false) {
    const row=setup(userId,id), analysis=analyze(userId,row);
    if(!analysis.ready) throw new Error(analysis.errors[0] || 'Match the remaining order fields.');
    if(retry){ row.fingerprint=hash({config:analysis.config,resolution:resolutionFor(analysis)}); db.prepare('UPDATE instant_setups SET fingerprint=? WHERE user_id=? AND workspace_id=?').run(row.fingerprint,userId,id); }
    const previous=run(userId,row.current_run);
    if(!retry && previous?.fingerprint===row.fingerprint) return;
    stop(userId,id);
    const {matches,...resolved}=analysis.resolved;
    const snapshot={resolution:resolutionFor(analysis),name:row.name,ordersName:analysis.config.ordersName,source:analysis.source,packageId:analysis.config.packageId,entry:analysis.config.entry,group:analysis.group,resolved,printProfile:analysis.config.printProfile,colorOptimization:colorOptimizationSettings(analysis.config.colorOptimization),maxObjectsPerPlate:normalizeMaxObjectsPerPlate(analysis.config.maxObjectsPerPlate)};
    const encoded=JSON.stringify(snapshot); options.enforceStorage(userId,Buffer.byteLength(encoded));
    const runId=randomUUID();
    db.prepare("INSERT INTO instant_runs(id,workspace_id,user_id,fingerprint,snapshot_json,status,created_at) VALUES(?,?,?,?,?,'queued',?)").run(runId,id,userId,row.fingerprint,encoded,Date.now());
    db.prepare('UPDATE instant_setups SET current_run=? WHERE user_id=? AND workspace_id=?').run(runId,userId,id);
    // Retain only the active run and last successful download.
    db.prepare('DELETE FROM instant_runs WHERE workspace_id=? AND id!=? AND id!=COALESCE((SELECT last_success FROM instant_setups WHERE workspace_id=?),\'\')').run(id,runId,id);
    prune(userId);
    setImmediate(pump);
  }
  async function pump() {
    if(pumping) return; pumping=true;
    try {
      let job;
      while (!closing && (job=db.prepare("SELECT * FROM instant_runs WHERE status='queued' ORDER BY created_at LIMIT 1").get())) {
        const controller=new AbortController(); active.set(job.workspace_id,controller);
        db.prepare("UPDATE instant_runs SET status='running' WHERE id=?").run(job.id);
        try {
          const result=await generateInstant(decode(job.snapshot_json), { signal:controller.signal, cacheScope:`user:${job.user_id}`, concurrency:await options.renderConcurrency?.(),
            render:(values,format,extra)=>options.render(values,format,{...extra,requireSandbox:true,owner:`user:${job.user_id}`}),
            profileTemplate:options.profileTemplate,
            progress:async(done,total,stage)=> { if(controller.signal.aborted) throw new Error('Generation cancelled.'); db.prepare("UPDATE instant_runs SET progress_json=? WHERE id=? AND status='running'").run(JSON.stringify({done,total,stage}),job.id); } });
          const current=db.prepare('SELECT * FROM instant_setups WHERE workspace_id=? AND user_id=?').get(job.workspace_id,job.user_id);
          if(controller.signal.aborted || current?.current_run!==job.id || current.fingerprint!==job.fingerprint) continue;
          const workspace=JSON.stringify(result.workspace);
          const completedProgress=JSON.stringify({done:result.objectCount,total:result.objectCount,stage:'Ready',orderCount:result.orderCount,objectCount:result.objectCount,plateCount:result.plateCount,skippedCount:result.skippedCount,colorOptimization:result.colorOptimization,primeTowers:result.primeTowers||[],archiveExtension:result.archiveExtension||'3mf'});
          options.enforceStorage(job.user_id,Buffer.byteLength(JSON.stringify(result.recipe))+Buffer.byteLength(workspace)+Buffer.byteLength(completedProgress));
          db.prepare("UPDATE instant_runs SET status='ready',result=NULL,recipe_json=?,workspace_json=?,progress_json=?,finished_at=? WHERE id=? AND status='running'").run(JSON.stringify(result.recipe),workspace,completedProgress,Date.now(),job.id);
          db.prepare('UPDATE instant_setups SET last_success=? WHERE workspace_id=? AND current_run=?').run(job.id,job.workspace_id,job.id);
          db.prepare('DELETE FROM instant_runs WHERE workspace_id=? AND id!=?').run(job.workspace_id,job.id);
          prune(job.user_id);
        } catch(error) { db.prepare("UPDATE instant_runs SET status=?,error=?,finished_at=? WHERE id=? AND status='running'").run(closing?'queued':controller.signal.aborted?'cancelled':'failed',String(error.message).slice(0,2000),Date.now(),job.id); }
        finally { active.delete(job.workspace_id); }
      }
    } finally { pumping=false; }
  }
  function prune(userId) {
      db.prepare(`DELETE FROM instant_packages WHERE user_id=? AND id NOT IN (
        SELECT json_extract(config_json,'$.packageId') FROM instant_setups WHERE user_id=? AND json_extract(config_json,'$.packageId') IS NOT NULL
        UNION SELECT json_extract(snapshot_json,'$.packageId') FROM instant_runs WHERE user_id=? AND json_extract(snapshot_json,'$.packageId') IS NOT NULL
        UNION SELECT json_extract(p.value,'$.packageId') FROM workspaces w,json_each(w.data_json,'$.plates') p WHERE w.user_id=? AND json_extract(p.value,'$.packageId') IS NOT NULL
        UNION SELECT json_extract(p.value,'$.packageId') FROM workspace_revisions w,json_each(w.data_json,'$.plates') p WHERE w.user_id=? AND json_extract(p.value,'$.packageId') IS NOT NULL)`).run(userId,userId,userId,userId,userId);
    }
  return {
    create(userId,id) { const config={format:'auto',modelSelection:'auto',mapping:{},printProfile:options.activeProfile(userId),colorOptimization:colorOptimizationSettings()}; const text=JSON.stringify(config); options.enforceStorage(userId,Buffer.byteLength(text)); db.prepare("UPDATE workspaces SET kind='instant',preview_status='ready' WHERE user_id=? AND id=?").run(userId,id); db.prepare('INSERT INTO instant_setups(workspace_id,user_id,config_json,fingerprint) VALUES(?,?,?,?)').run(id,userId,text,hash(config)); return get(userId,id); },
    get,save,packageFiles,
    files(userId,id,body) {
      const row=setup(userId,id),config=decode(row.config_json);
      const previous=body.replace ? [] : config.packageId ? packageFiles(userId,config.packageId) : [];
      const merged=new Map(previous.map(file=>[file.path,file]));
      if (Object.hasOwn(body,'remove')) {
        if (!Array.isArray(body.remove) || !body.remove.length || body.remove.some(name=>typeof name!=='string'||!merged.has(name))) throw new Error('Choose an included file to remove.');
        for (const name of body.remove) merged.delete(name);
      }
      const additions=body.files?.length ? normalizeAssets(body.files) : (body.replace===true&&Array.isArray(body.files)||Object.hasOwn(body,'remove')) ? [] : normalizeAssets(body.files);
      for(const file of additions) merged.set(file.path,file);
      const files=(merged.size?normalizeAssets([...merged.values()]):[]).sort((a,b)=>a.path.localeCompare(b.path)),encoded=JSON.stringify(files),packageId=files.length?randomUUID():null;
      if (config.packageId && encoded === JSON.stringify(packageFiles(userId,config.packageId).sort((a,b)=>a.path.localeCompare(b.path)))) return get(userId,id);
      options.enforceStorage(userId,Buffer.byteLength(encoded));
      stop(userId,id);
      if (packageId) db.prepare('INSERT INTO instant_packages VALUES(?,?,?)').run(packageId,userId,encoded);
      const scads=files.filter(file=>/\.scad$/i.test(file.path)); config.packageId=packageId;
      if (!files.some(file=>file.path===config.entry)) { config.mapping={};config.groupKey='';config.modelSelection='auto'; }
      config.entry=files.some(file=>file.path===config.entry)?config.entry:scads.length===1?scads[0].path:'';
      db.prepare('UPDATE instant_setups SET config_json=? WHERE workspace_id=? AND user_id=?').run(JSON.stringify(config),id,userId);
      const state=save(userId,id,{},{resolve:true});prune(userId);return state;
    },
    retry(userId,id) { enqueue(userId,id,true); return get(userId,id); },
    cancel(userId,id) { setup(userId,id);stop(userId,id);return get(userId,id); },
    async result(userId,id,signal) {
      const row=setup(userId,id,true),success=run(userId,row.last_success,true);
      if(success?.status!=='ready')throw new Error('No completed export is available yet.');
      let recipe=success.recipe_json?decode(success.recipe_json):null;
      if(!recipe){
        const generated=await generateInstant(decode(success.snapshot_json),{signal:signal||new AbortController().signal,cacheScope:`user:${userId}`,concurrency:await options.renderConcurrency?.(),progress:async()=>{},profileTemplate:options.profileTemplate,
          render:(values,format,extra)=>options.render(values,format,{...extra,requireSandbox:true,owner:`user:${userId}`})});
        recipe=generated.recipe;
        db.prepare('UPDATE instant_runs SET recipe_json=?,result=NULL WHERE id=? AND user_id=?').run(JSON.stringify(recipe),success.id,userId);
      }
      return options.exportRecipe(userId,recipe,signal);
    },
    convert(userId,id,input={}) {
      const retention=input?.retention ?? 'permanent';
      if(!['permanent','temporary'].includes(retention)) throw new Error('Choose a normal or temporary workspace copy.');
      const state=get(userId,id);
      if(!state.canConvert) throw new Error('Finish generating the current inputs before creating a workspace copy.');
      const row=setup(userId,id),completed=run(userId,row.last_success,true);
      db.exec('SAVEPOINT instant_workspace_copy');
      try {
        const result=options.createWorkspace(userId,`${row.name} — Workspace`,decode(completed.workspace_json));
        if(retention==='temporary') {
          result.expiresAt=Date.now()+24*60*60*1000;
          db.prepare('UPDATE workspaces SET expires_at=? WHERE user_id=? AND id=?').run(result.expiresAt,userId,result.id);
        }
        db.exec('RELEASE instant_workspace_copy');
        return result;
      } catch(error) {
        db.exec('ROLLBACK TO instant_workspace_copy; RELEASE instant_workspace_copy');
        throw error;
      }
    },
    summary(userId,id) { const row=db.prepare('SELECT * FROM instant_setups WHERE user_id=? AND workspace_id=?').get(userId,id);if(!row)return null;const current=run(userId,row.current_run),success=run(userId,row.last_success);return {status:current?.fingerprint===row.fingerprint?current.status:'needs-input',progress:current?decode(current.progress_json):{},hasResult:!!success,result:summaryRun(success)}; },
    remove(userId,id) { stop(userId,id); },
    clear(userId) { for(const row of db.prepare('SELECT workspace_id FROM instant_setups WHERE user_id=?').all(userId)) stop(userId,row.workspace_id);db.prepare('DELETE FROM instant_packages WHERE user_id=?').run(userId);instantColorCache.clearScope(`user:${userId}`); },
    storageBytes(userId) { return ['instant_setups','instant_packages','instant_runs'].reduce((sum,table)=>sum+Number(db.prepare(`SELECT COALESCE(SUM(${table==='instant_setups'?'length(CAST(config_json AS BLOB))':table==='instant_packages'?'length(CAST(files_json AS BLOB))':"length(CAST(snapshot_json AS BLOB))+length(CAST(progress_json AS BLOB))+COALESCE(length(CAST(recipe_json AS BLOB)),0)+COALESCE(length(CAST(workspace_json AS BLOB)),0)"}),0) AS bytes FROM ${table} WHERE user_id=?`).get(userId).bytes),0); },
    export(userId) { return { setups:db.prepare('SELECT * FROM instant_setups WHERE user_id=?').all(userId), packages:db.prepare('SELECT * FROM instant_packages WHERE user_id=?').all(userId),runs:db.prepare('SELECT * FROM instant_runs WHERE user_id=?').all(userId).map(row=>({...row,result:row.result?Buffer.from(row.result).toString('base64'):null})) }; },
    async shutdown() { closing=true;for (const controller of active.values()) controller.abort();while(pumping)await new Promise(resolve=>setTimeout(resolve,20)); },
    prune,
    recover() { db.prepare("UPDATE instant_runs SET status='queued' WHERE status='running'").run();setImmediate(pump); }
  };
}
