// Only persisted payloads charged by accountStorageBytes belong in this inventory.
const definitions = [
  ['workspaces','Projects','data_json','name'],
  ['workspace_revisions','Revisions','data_json',"name || ' · ' || datetime(created_at/1000, 'unixepoch')",'workspaces','workspace_id'],
  ['print_profiles','Print presets','profile_json','name'],
  ['production_skus','Products','workspace_snapshot_json print_profile_json rules_json bom_json quote_json calibration_json','name'],
  ['production_jobs','Production jobs','parameters_json workspace_snapshot_json print_profile_json colors_json materials_json bom_json quote_json',"COALESCE(NULLIF(order_ref,''), NULLIF(output_name,''), 'Production job')"],
  ['production_templates','Templates','template_json','name'],
  ['production_components','Components','scad_source description','name'],
  ['calibration_profiles','Calibrations','values_json','name'],
  ['customer_configurators','Customer links','allowed_params_json','name','production_skus','sku_id'],
  ['sku_revisions','Product revisions','data_json',"'Revision ' || revision",'production_skus','sku_id',false],
  ['production_variants','Variants','data_json',"COALESCE(json_extract(data_json,'$.name'),'Variant')",'production_skus','sku_id'],
  ['variant_revisions','Variant revisions','data_json',"'Revision ' || revision",'production_variants','variant_id',false],
  ['configurator_variants','Linked variants','data_json',"'Saved variant link'",'customer_configurators','configurator_id',false,'configurator_id'],
  ['instant_setups','Quick batch settings','config_json',"'Settings'",'workspaces','workspace_id',false,'workspace_id'],
  ['instant_packages','Quick batch source packages','files_json',"'Source package ' || substr(id,1,8)",null,null,false],
  ['instant_runs','Quick batch runs','snapshot_json progress_json recipe_json workspace_json',"'Run · ' || datetime(created_at/1000,'unixepoch')",'workspaces','workspace_id',false],
  ['export_snapshots','Export history','recipe_json preview summary_json',"COALESCE(json_extract(summary_json,'$.name'),'Export') || ' · ' || datetime(created_at/1000,'unixepoch')"]
];

export function createAccountStorage(db, { deleteWorkspace, variants, exportHistory, badRequest }) {
  const descriptors = definitions.map(([kind, group, columns, name, parentKind, parentColumn, deletable = true, id = 'id']) => {
    const bytes = columns.split(' ').map(column => `COALESCE(length(CAST(${column} AS BLOB)),0)`).join('+');
    const logicalId = ['sku_revisions','variant_revisions'].includes(kind) ? 'rowid' : id;
    return { kind, group, deletable, parentKind,
      list: db.prepare(`SELECT rowid AS key, ${logicalId} AS id, ${name} AS name, ${bytes} AS bytes ${parentColumn ? `, ${parentColumn} AS parentId` : ''} FROM ${kind} WHERE user_id=?`),
      find: db.prepare(`SELECT ${logicalId} AS id FROM ${kind} WHERE user_id=? AND rowid=?`),
      remove: db.prepare(`DELETE FROM ${kind} WHERE user_id=? AND rowid=?`) };
  });
  function list(userId) {
    const nodes = descriptors.flatMap(d => d.list.all(userId).map(row => ({
      kind:d.kind, key:Number(row.key), id:String(row.id), name:row.name, bytes:Number(row.bytes),
      group:d.group, parent:d.parentKind ? `${d.parentKind}:${row.parentId}` : null,
      deletable:d.deletable, children:[]
    })));
    // Estimates belong to their shared export snapshot; count each payload once.
    for (const row of db.prepare(`SELECT h.snapshot_id AS id, SUM(length(CAST(e.estimate_json AS BLOB))) AS bytes FROM export_history_estimates e JOIN export_history h ON h.id=e.history_id WHERE h.user_id=? GROUP BY h.snapshot_id`).all(userId)) {
      const node=nodes.find(n=>n.kind==='export_snapshots' && n.id===row.id);
      if(node) node.bytes+=Number(row.bytes);
    }
    const byId=new Map(nodes.map(node=>[`${node.kind}:${node.id}`,node]));
    const groups=new Map();
    for(const node of nodes) {
      const parent=byId.get(node.parent);
      if(parent) parent.children.push(node);
      else {
        if(!groups.has(node.group)) groups.set(node.group,{name:node.group,children:[]});
        groups.get(node.group).children.push(node);
      }
      delete node.parent;
    }
    const total=node=>{
      node.bytes=(node.bytes||0)+node.children.reduce((sum,child)=>sum+total(child),0);
      node.children.sort((a,b)=>b.bytes-a.bytes);
      return node.bytes;
    };
    return [...groups.values()].map(group=>{total(group);return group;}).sort((a,b)=>b.bytes-a.bytes);
  }
  async function remove(userId, body) {
    if(body.confirm!==true) throw badRequest('Confirm the item to delete.');
    const d=descriptors.find(d=>d.kind===body.kind && d.deletable);
    if(!d || !Number.isSafeInteger(body.key)) throw badRequest('Choose a deletable storage item.');
    const row=d.find.get(userId,body.key);
    if(!row || String(row.id)!==body.id) {const error=badRequest('Storage item not found.');error.status=404;throw error;}
    if(d.kind==='workspaces') await deleteWorkspace(userId,row.id);
    else if(d.kind==='production_skus') variants.deleteSku(userId,row.id);
    else if(d.kind==='production_variants') variants.deleteVariant(userId,row.id);
    else if(d.kind==='export_snapshots') {
      const ids=db.prepare('SELECT id FROM export_history WHERE user_id=? AND snapshot_id=?').all(userId,row.id).map(r=>r.id);
      // Existing removal enforces in-progress export protection and shared snapshot cleanup.
      for(const id of ids) exportHistory.remove(userId,id);
    } else d.remove.run(userId,body.key);
    return {deleted:true};
  }
  return {list,remove};
}
