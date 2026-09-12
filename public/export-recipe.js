import { Matrix4 } from './vendor/three/three.module.js';

export function recipeForExport({plans,requests,profile,printer,title,scope,workflow}) {
  const sources=[],sourceIds=new Map(),objects=new Map();
  for(const plan of plans)objects.set(plan,{id:plan.group.record?.id,name:plan.group.label,plateId:plan.targetPlateId,
    settings:plan.group.record?.printOverrides || {},contributions:[]});
  const jobs=[...requests.values()].map((request,index)=>{
    const plate=request.plate;
    if(!sourceIds.has(plate)){sourceIds.set(plate,sources.length);sources.push({source:plate.source,sourceName:plate.sourceName||plate.name,packageId:plate.packageId,packageEntry:plate.packageEntry});}
    const url=new URL(request.url,'http://local'),objectId=url.searchParams.get('id');
    for(const target of request.targets){
      const {plan,def,part}=target,reference=plan.references.get(String(def.id))||plan.references.values().next().value;
      const matrix=new Matrix4().makeTranslation(printer.width/2,printer.depth/2,0)
        .multiply(new Matrix4().makeRotationX(Math.PI/2)).multiply(new Matrix4().makeTranslation(-plan.layout.x,0,-plan.layout.z)).multiply(reference.matrixWorld);
      objects.get(plan).contributions.push({request:index,matrix:matrix.toArray(),
        prefix:plan.group.defs.length>1&&def.label?`${def.label} · `:'',partName:part?.label||'',color:part?.hex||null});
    }
    return {source:sourceIds.get(plate),format:request.format,values:structuredClone(request.values),
      ...(objectId===null?{}:{objectId:Number(objectId)}),...(url.searchParams.has('part')?{part:url.searchParams.get('part')}:{}),...structuredClone(request.body)};
  });
  return {version:1,title,scope,sources,requests:jobs,objects:[...objects.values()],profile:structuredClone(profile),
    workflow:structuredClone(workflow),plateNames:Object.fromEntries(Object.entries(workflow.plates).map(([id,plate])=>[id,plate.name]))};
}
