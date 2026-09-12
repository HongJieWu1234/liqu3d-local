// Offline cutaway for the landing illustration, using the authentic SVG contours.
// No slicing, polygon work, or geometry generation happens in the browser.
import { MeshoptSimplifier } from 'meshoptimizer';
await MeshoptSimplifier.ready;
const tetrahedra = [[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
const corners = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];

function outlineSegments(outline) {
  const tokens = outline.match(/[MLz]|[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/g);
  const segments = [];
  let start, previous;
  for (let i=0;i<tokens.length;) {
    const command=tokens[i++];
    if(command === 'z') { if(previous && start)segments.push([...previous,...start]); continue; }
    if(command !== 'M' && command !== 'L')throw new Error('Unsupported outline command');
    // OpenSCAD's SVG exporter flips the model Y coordinate.
    const point=[Number(tokens[i++]),-Number(tokens[i++])];
    if(command === 'M')start=point;
    else segments.push([...previous,...point]);
    previous=point;
  }
  return segments;
}

function outlineDistance(x,y,segments) {
  let inside=false,distance=Infinity;
  for(const [ax,ay,bx,by] of segments) {
    if((ay>y)!==(by>y) && x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
    const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
    const t=length ? Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)) : 0;
    distance=Math.min(distance,(x-ax-t*dx)**2+(y-ay-t*dy)**2);
  }
  return Math.sqrt(distance)*(inside ? -1 : 1);
}

function bakeBase(outline) {
  const segments=outlineSegments(outline);
  const dx=.34,dy=.34,dz=.16;
  const low=[Math.min(...segments.map(s=>s[0]))-.7,Math.min(...segments.map(s=>s[1]))-.7,-.19];
  const high=[Math.max(...segments.map(s=>s[0]))+.7,Math.max(...segments.map(s=>s[1]))+.7,3.79];
  const nx=Math.ceil((high[0]-low[0])/dx)+1,ny=Math.ceil((high[1]-low[1])/dy)+1,nz=Math.ceil((high[2]-low[2])/dz)+1;
  const field=new Float32Array(nx*ny*nz);
  const k=2*Math.PI/7.8;
  const bottom=0,top=3.6;
  for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++) {
    const x=low[0]+ix*dx,y=low[1]+iy*dy;
    const outlineSdf=outlineDistance(x,y,segments);
    for(let iz=0;iz<nz;iz++) {
      const z=low[2]+iz*dz;
      // An actual triply periodic gyroid sheet, clipped to each letter outline.
      const gyroid=Math.sin(k*x)*Math.cos(k*y)+Math.sin(k*y)*Math.cos(k*z)+Math.sin(k*z)*Math.cos(k*x);
      const wall=-outlineSdf-.78;
      const infill=Math.abs(gyroid)/k*.65-.27;
      const floor=z-bottom-.42;
      const interior=Math.min(wall,infill,floor);
      field[(iz*ny+iy)*nx+ix]=Math.max(outlineSdf,bottom-z,z-top,interior);
    }
  }
  const positions=[],indices=[],vertices=new Map();
  const addVertex=point=>{
    const quantized=point.map(v=>Math.round(v*256));
    const key=quantized.join(',');
    if(!vertices.has(key)){vertices.set(key,positions.length/3);positions.push(...quantized);}
    return vertices.get(key);
  };
  const addTriangle=(a,b,c,outward)=>{
    const ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]);
    const normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
    if(normal.reduce((sum,v,i)=>sum+v*outward[i],0)<0)[b,c]=[c,b];
    const ids=[a,b,c].map(addVertex);
    if(new Set(ids).size === 3)indices.push(...ids);
  };
  for(let iz=0;iz<nz-1;iz++)for(let iy=0;iy<ny-1;iy++)for(let ix=0;ix<nx-1;ix++) {
    const values=corners.map(([x,y,z])=>field[((iz+z)*ny+iy+y)*nx+ix+x]);
    if(values.every(v=>v>=0) || values.every(v=>v<0))continue;
    const points=corners.map(([x,y,z])=>[low[0]+(ix+x)*dx,low[1]+(iy+y)*dy,low[2]+(iz+z)*dz]);
    const edge=(a,b)=>points[a].map((v,i)=>v+(points[b][i]-v)*values[a]/(values[a]-values[b]));
    for(const tetra of tetrahedra) {
      const inside=tetra.filter(i=>values[i]<0),outside=tetra.filter(i=>values[i]>=0);
      if(!inside.length || !outside.length)continue;
      const outward=[0,1,2].map(axis=>outside.reduce((n,i)=>n+points[i][axis],0)/outside.length-inside.reduce((n,i)=>n+points[i][axis],0)/inside.length);
      if(inside.length === 2) {
        const [a,b]=inside,[c,d]=outside;
        const ac=edge(a,c),ad=edge(a,d),bc=edge(b,c),bd=edge(b,d);
        addTriangle(ac,ad,bc,outward);addTriangle(ad,bd,bc,outward);
      } else {
        const solo=inside.length === 1 ? inside : outside;
        const other=inside.length === 1 ? outside : inside;
        addTriangle(...other.map(i=>edge(solo[0],i)),outward);
      }
    }
  }
  if(positions.some(value=>Math.abs(value)>32767))throw new Error('Infill exceeds packed bounds');
  const floats=Float32Array.from(positions,value=>value/256);
  // Retain the dense surface normals; recomputing after decimation dents the rims.
  const normals=new Float32Array(floats.length);
  for(let i=0;i<indices.length;i+=3){
    const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;
    const ab=[0,1,2].map(axis=>floats[b+axis]-floats[a+axis]);
    const ac=[0,1,2].map(axis=>floats[c+axis]-floats[a+axis]);
    const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
    for(const offset of [a,b,c])for(let axis=0;axis<3;axis++)normals[offset+axis]+=n[axis];
  }
  const [simplified]=MeshoptSimplifier.simplify(new Uint32Array(indices),floats,3,90000,.065,['ErrorAbsolute']);
  const [remap,count]=MeshoptSimplifier.compactMesh(simplified);
  const compact=new Int16Array(count*3);
  const compactNormals=new Int8Array(count*3);
  for(let i=0;i<remap.length;i++)if(remap[i]<count){
    compact.set(positions.slice(i*3,i*3+3),remap[i]*3);
    const length=Math.hypot(normals[i*3],normals[i*3+1],normals[i*3+2]) || 1;
    for(let axis=0;axis<3;axis++)compactNormals[remap[i]*3+axis]=Math.round(normals[i*3+axis]/length*127);
  }
  if(count>65535)throw new Error('Infill exceeds 16-bit index bounds');
  console.log(`Half-print base: ${count} vertices, ${simplified.length/3} triangles.`);
  return {
    positions:Buffer.from(compact.buffer).toString('base64'),
    normals:Buffer.from(compactNormals.buffer).toString('base64'),
    indices:Buffer.from(new Uint16Array(simplified).buffer).toString('base64')
  };
}

export function bakeHalfPrintedTag(outlines) {
  return {base:bakeBase(outlines[0])};
}

export function halfPrintedFallback(outlines) {
  const patterns=[['pink','#bd8298','#f19cbb',3.5]].map(([name,dark,color,z])=>{
    const size=7.8,step=size/40,k=Math.PI*2/size;
    const field=(x,y)=>Math.sin(k*x)*Math.cos(k*y)+Math.sin(k*y)*Math.cos(k*z)+Math.sin(k*z)*Math.cos(k*x);
    const lines=[];
    for(let y=0;y<size-step/2;y+=step)for(let x=0;x<size-step/2;x+=step){
      const points=[[x,y],[x+step,y],[x+step,y+step],[x,y+step]];
      const values=points.map(([px,py])=>field(px,-py));
      const hits=[];
      for(let a=0;a<4;a++){
        const b=(a+1)%4;
        if((values[a]<0)===(values[b]<0))continue;
        const t=values[a]/(values[a]-values[b]);
        hits.push(points[a].map((v,i)=>v+(points[b][i]-v)*t));
      }
      for(let i=0;i+1<hits.length;i+=2)lines.push(`M${hits[i].map(v=>v.toFixed(3))}L${hits[i+1].map(v=>v.toFixed(3))}`);
    }
    return `<pattern id="infill-${name}" patternUnits="userSpaceOnUse" width="7.8" height="7.8"><rect width="7.8" height="7.8" fill="${dark}"/><path d="${lines.join('')}" fill="none" stroke="${color}" stroke-width=".72" stroke-linecap="round"/></pattern>`;
  });
  return `${patterns.join('')}
<g id="fallbackHalfPrintedJordan"><path d="${outlines[0]}" fill="url(#infill-pink)" fill-rule="evenodd" stroke="#f19cbb" stroke-width=".8"/></g>`;
}
