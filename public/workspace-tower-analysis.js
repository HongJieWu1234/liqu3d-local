import { analyzeColorLayers } from './color-optimization.js?v=tower-free1';

// Read generated meshes in print coordinates. Reuse their buffers and cache the
// compact layer occupancy; never analyze the decorative tower itself.
export function analyzeWorkspaceTowerMeshes(meshes, {layerHeight,firstLayerHeight=layerHeight} = {}) {
  const solids=[],keys=[];
  for(const mesh of meshes) {
    mesh.updateWorldMatrix(true,false);
    const geometry=mesh.geometry,p=geometry.getAttribute('position'),m=mesh.matrixWorld.elements;
    const indices=geometry.index?.array||Uint32Array.from({length:p.count},(_,i)=>i);
    const component=(i,a,b,c,d)=>m[a]*p.getX(i)+m[b]*p.getY(i)+m[c]*p.getZ(i)+m[d];
    const position={count:p.count,getX:i=>component(i,0,4,8,12),getY:i=>-component(i,2,6,10,14),getZ:i=>component(i,1,5,9,13)};
    solids.push({geometry:{getAttribute:()=>position,index:{array:indices,count:indices.length}},
      faceProperties:new Uint8Array(indices.length/3),propertyTable:[{color:mesh.userData.hexColor,material:''}]});
    keys.push([geometry.uuid,p.version,geometry.index?.version,mesh.userData.hexColor,...m]);
  }
  return analyzeColorLayers(solids,{layerHeight:Number(layerHeight),firstLayerHeight:Number(firstLayerHeight),scope:'workspace-tower',cacheKey:JSON.stringify([layerHeight,firstLayerHeight,keys])});
}
