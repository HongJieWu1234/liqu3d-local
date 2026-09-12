import * as THREE from './vendor/three/three.module.js';

// Visual estimate based on Bambu Studio's diagonal corner ribs and tapered
// reinforcement, with a thin brim. It stays inside the packing reservation.
// Reference: BambuStudio/GCode/WipeTower.cpp, rib_section / its_make_rib_tower
// https://github.com/bambulab/BambuStudio/blob/926a7192574bcb9b3a732e1ec59a46d79cb45466/src/libslic3r/GCode/WipeTower.cpp
function rounded(points, radius) {
  return points.flatMap((point,i) => {
    const before=points[(i+points.length-1)%points.length], after=points[(i+1)%points.length];
    const d=Math.min(radius,point.distanceTo(before)*.2,point.distanceTo(after)*.2);
    const a=point.clone().lerp(before,d/point.distanceTo(before));
    const b=point.clone().lerp(after,d/point.distanceTo(after));
    return Array.from({length:5},(_,j)=>{
      const t=j/4;
      return a.clone().multiplyScalar((1-t)**2).addScaledVector(point,2*t*(1-t)).addScaledVector(b,t*t);
    });
  });
}

export function primeTowerOutline(tower, top = false) {
  const settings=tower.settings || {}, width=tower.width, depth=tower.depth;
  let points;
  if (settings.prime_tower_rib_wall !== false && settings.prime_tower_rib_width !== 0) {
    const rib=Math.min(settings.prime_tower_rib_width ?? 8,Math.min(width,depth)/(2+1/Math.SQRT2));
    const tip=rib/(2*Math.SQRT2);
    const extension=Math.max(0,Math.min(settings.prime_tower_extra_rib_length || 0,Math.min(width,depth)/3))/2;
    const halfX=width/2-tip-extension, halfY=depth/2-tip-extension;
    const reach=top?0:extension;
    points=[];
    for (const [sx,sy] of [[1,1],[-1,1],[-1,-1],[1,-1]]) {
      const corner=[
        new THREE.Vector2(sx*halfX,sy*(halfY-2*tip)),
        new THREE.Vector2(sx*(halfX+reach+tip),sy*(halfY+reach-tip)),
        new THREE.Vector2(sx*(halfX+reach-tip),sy*(halfY+reach+tip)),
        new THREE.Vector2(sx*(halfX-2*tip),sy*halfY)
      ];
      points.push(...(sx===sy?corner:corner.reverse()));
    }
  } else points=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]].map(p=>new THREE.Vector2(...p));
  return settings.prime_tower_fillet_wall === false ? points : rounded(points,1.2);
}

function solid(bottom, top, height, colors, bands = [{low:0,high:1,color:colors[0]}]) {
  const positions=[], vertexColors=[], triangles=THREE.ShapeUtils.triangulateShape(bottom,[]);
  const vertex=(point,y,color)=>{positions.push(point.x,y,-point.y);vertexColors.push(color.r,color.g,color.b);};
  const face=(a,ay,b,by,c,cy,color)=>{vertex(a,ay,color);vertex(b,by,color);vertex(c,cy,color);};
  for (const [a,b,c] of triangles) {
    face(bottom[c],0,bottom[b],0,bottom[a],0,colors[0]);
    face(top[a],height,top[b],height,top[c],height,bands.at(-1).color);
  }
  for(const {low,high,color} of bands) {
    for(let i=0;i<bottom.length;i++) {
      const j=(i+1)%bottom.length;
      const a=bottom[i].clone().lerp(top[i],low), b=bottom[j].clone().lerp(top[j],low);
      const c=bottom[i].clone().lerp(top[i],high),d=bottom[j].clone().lerp(top[j],high);
      face(a,height*low,b,height*low,c,height*high,color);
      face(b,height*low,d,height*high,c,height*high,color);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(vertexColors,3));
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:0,side:THREE.DoubleSide}));
}

export function createPrimeTowerPreview(tower) {
  const group=new THREE.Group();group.userData.plateRole='prime-tower-model';
  const bottom=primeTowerOutline(tower),top=primeTowerOutline(tower,true);
  const channels=(tower.channels || []).map(id=>String(id).split('|')[0]).filter(color=>/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color));
  const colors=(channels.length?channels:['#AAC4AD']).map(color=>new THREE.Color(color.slice(0,7)));
  const height=Math.max(.001,tower.height),layer=Math.max(.001,tower.layerHeight || .2);
  const firstLayer=Math.min(height,tower.settings?.firstLayerHeight || layer);
  const layerTop=n=>n<=0?0:Math.min(height,firstLayer+(n-1)*layer);
  const sourceRuns=tower.previewRuns || tower.colorRuns;
  // Keep long sliced-height profiles cheap to draw while retaining their span.
  const stride=Math.max(1,Math.ceil((sourceRuns?.length || 0)/64));
  const runs=[];
  for(let i=0;i<(sourceRuns?.length || 0);i+=stride) {
    const section=sourceRuns.slice(i,i+stride);
    runs.push({from:section[0].from,to:section.at(-1).to,colors:[...new Set(section.flatMap(run=>run.colors))]});
  }
  const bands=[];
  const bandLimit=Math.max(1,Math.floor(256/Math.max(1,runs.length)));
  const addBands=(low,high,palette)=>{
    if(high<=low)return;
    const count=palette.length===1?1:Math.min(bandLimit,Math.max(palette.length,Math.ceil((high-low)/layer)));
    for(let i=0;i<count;i++)bands.push({low:(low+(high-low)*i/count)/height,high:(low+(high-low)*(i+1)/count)/height,color:palette[i%palette.length]});
  };
  if(runs?.length)for(const run of runs) {
    const palette=run.colors.map(id=>String(id).split('|')[0]).filter(id=>/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(id)).map(id=>new THREE.Color(id.slice(0,7)));
    addBands(layerTop(run.from-1),layerTop(run.to),palette.length?palette:colors);
  }
  if(!bands.length)addBands(0,height,colors);
  const body=solid(bottom,top,height,colors,bands);
  body.userData.plateRole='prime-tower-body';group.add(body);
  // Expand the brim within the existing reserved padding, including at concave ribs.
  const brimWidth=Math.max(0,Math.min(tower.brim || 0,tower.padding || 0));
  if (brimWidth>0) {
    const brim=bottom.map(p=>new THREE.Vector2(p.x*(1+2*brimWidth/tower.width),p.y*(1+2*brimWidth/tower.depth)));
    const mesh=solid(brim,brim,firstLayer,[bands[0].color]);mesh.userData.plateRole='prime-tower-brim';group.add(mesh);
  }
  // Bound detail for large workspaces while retaining visible print layers.
  const lines=[],count=Math.min(100,Math.floor(height/layer));
  for(let n=1;n<=count;n++) {
    const t=n/count;
    for(let i=0;i<bottom.length;i++) {
      for(const index of [i,(i+1)%bottom.length]) {
        const p=bottom[index].clone().lerp(top[index],t);
        lines.push(p.x,height*t,-p.y);
      }
    }
  }
  // Top-surface extrusion lines follow the ribbed outline instead of a flat cap.
  const pitch=Math.max(.6,(tower.settings?.nozzleDiameter || .4)*1.5);
  const minY=Math.min(...top.map(p=>p.y)),maxY=Math.max(...top.map(p=>p.y));
  for(let y=minY+pitch;y<maxY;y+=pitch) {
    const crossings=[];
    for(let i=0;i<top.length;i++) {
      const a=top[i],b=top[(i+1)%top.length];
      if ((a.y<=y && b.y>y) || (b.y<=y && a.y>y)) crossings.push(a.x+(y-a.y)*(b.x-a.x)/(b.y-a.y));
    }
    crossings.sort((a,b)=>a-b);
    for(let i=0;i+1<crossings.length;i+=2)if(crossings[i+1]-crossings[i]>.5)
      lines.push(crossings[i]+.2,height+.001,-y,crossings[i+1]-.2,height+.001,-y);
  }
  const detail=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lines,3)),
    new THREE.LineBasicMaterial({color:0x24332c,transparent:true,opacity:.16,depthWrite:false}));
  detail.raycast=()=>{};detail.userData.plateRole='prime-tower-layers';group.add(detail);
  return group;
}
