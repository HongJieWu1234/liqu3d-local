import { Color } from '../public/vendor/three/three.module.js';
import { createPrimeTowerPreview } from '../public/prime-tower-preview.js';
import { pngFromRgba } from './export-preview.mjs';

// Fixed straight top-down camera: printer X runs right and Y runs up.
const project = (x,y,z) => [x,-y,z];
const light = [-.36,-.48,.8], fill = [.55,.25,.8];
const edge = (a,b,x,y) => (x-a[0])*(b[1]-a[1])-(y-a[1])*(b[0]-a[0]);
const linear = value => { value/=255; return value<=.04045?value/12.92:((value+.055)/1.055)**2.4; };
const display = value => Math.round(255*(value<=.0031308?value*12.92:1.055*Math.max(0,value)**(1/2.4)-.055));
const rgb = color => [1,3,5].map(i=>parseInt(String(color||'#D9DDE5').slice(i,i+2),16));

function blur(mask,width,height,radius) {
  const horizontal=new Float32Array(mask.length),result=new Float32Array(mask.length),span=2*radius+1;
  for(let y=0;y<height;y++) {
    let sum=0,row=y*width;
    for(let x=0;x<Math.min(width,radius+1);x++)sum+=mask[row+x];
    for(let x=0;x<width;x++) {
      horizontal[row+x]=sum/span;
      if(x-radius>=0)sum-=mask[row+x-radius];
      if(x+radius+1<width)sum+=mask[row+x+radius+1];
    }
  }
  for(let x=0;x<width;x++) {
    let sum=0;
    for(let y=0;y<Math.min(height,radius+1);y++)sum+=horizontal[y*width+x];
    for(let y=0;y<height;y++) {
      result[y*width+x]=sum/span;
      if(y-radius>=0)sum-=horizontal[(y-radius)*width+x];
      if(y+radius+1<height)sum+=horizontal[(y+radius+1)*width+x];
    }
  }
  return result;
}

// Render the saved geometry with soft contact shadows and supersampled edges.
// The physical plate stays centered even when its objects are off-center.
export function workspacePreviewImage(plates,bed,{width=1200,height=800,accent='#00AE42'}={}) {
  const sampling=2,w=width*sampling,ht=height*sampling,meshes=[];
  for(const plate of plates) {
    for(const object of plate.objects)for(const part of object.parts)meshes.push({geometry:part.geometry,palette:plate.palette,part});
    if(plate.primeTower) {
      const tower=plate.primeTower,root=createPrimeTowerPreview(tower);
      root.updateMatrixWorld(true);
      root.traverse(mesh=>{
        if(!mesh.isMesh)return;
        const geometry=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld),p=geometry.getAttribute('position');
        for(let i=0;i<p.count;i++) {
          const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
          p.setXYZ(i,tower.x+tower.w/2+x,tower.y+tower.h/2-z,y);
        }
        meshes.push({geometry,vertexColors:geometry.getAttribute('color'),temporary:true});
        mesh.geometry.dispose();mesh.material.dispose();
      });
    }
  }
  try {
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    const include=p=>{minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);};
    for(const mesh of meshes) {
      const p=mesh.geometry.getAttribute('position');
      mesh.world=Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)]);
      mesh.projected=mesh.world.map(([x,y,z])=>project(x,y,z));
      for(const point of mesh.projected)include(point);
      mesh.indices=mesh.geometry.index?.array||Uint32Array.from({length:p.count},(_,i)=>i);
    }
    for(const [x,y] of [[0,0],[bed.width,0],[bed.width,bed.depth],[0,bed.depth]])include(project(x,y,0));
    const [cx,cy]=project(bed.width/2,bed.depth/2,0),padding=32*sampling;
    const spanX=2*Math.max(12,cx-minX,maxX-cx),spanY=2*Math.max(12,cy-minY,maxY-cy);
    const scale=Math.min((w-2*padding)/spanX,(ht-2*padding)/spanY);
    const screen=p=>[(p[0]-cx)*scale+w/2,(p[1]-cy)*scale+ht/2,p[2]];
    const pixels=new Uint8Array(w*ht*4),depth=new Float32Array(w*ht).fill(-Infinity),mask=new Float32Array(w*ht),accentRgb=rgb(accent);
    for(let y=0;y<ht;y++)for(let x=0;x<w;x++) {
      const bx=(x-w/2)/scale+cx,by=-((y-ht/2)/scale+cy);
      const onBed=bx>=0&&by>=0&&bx<=bed.width&&by<=bed.depth;
      const distance=Math.min(Math.abs(bx-Math.round(bx/10)*10),Math.abs(by-Math.round(by/10)*10));
      const grid=onBed?Math.max(0,1-distance*scale/(.55*sampling))*4:0;
      const rim=onBed&&Math.min(bx,by,bed.width-bx,bed.depth-by)*scale<sampling;
      const gradient=3*(y/ht)+2*Math.min(1,Math.hypot((x-w*.45)/w,(y-ht*.35)/ht)),index=(y*w+x)*4;
      for(let k=0;k<3;k++)pixels[index+k]=(onBed?[246,248,250]:[235,239,243])[k]-gradient-grid-(rim?12:0)+accentRgb[k]*.004;
      pixels[index+3]=255;
    }
    function triangles(mesh,shadow) {
      const positions=shadow?mesh.world.map(([x,y,z])=>screen(project(x+Math.max(0,z)*.42,y+Math.max(0,z)*.32,0))):mesh.projected.map(screen);
      for(let t=0;t<mesh.indices.length;t+=3) {
        const ia=mesh.indices[t],ib=mesh.indices[t+1],ic=mesh.indices[t+2];
        const a=positions[ia],b=positions[ib],cc=positions[ic],area=edge(a,b,cc[0],cc[1]);
        if(Math.abs(area)<1e-8)continue;
        let shaded;
        if(!shadow) {
          const aw=mesh.world[ia],bw=mesh.world[ib],cw=mesh.world[ic],u=bw.map((n,i)=>n-aw[i]),v=cw.map((n,i)=>n-aw[i]);
          const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n)||1;
          for(let i=0;i<3;i++)n[i]/=length;
          if(n[2]<0)for(let i=0;i<3;i++)n[i]*=-1;
          const key=Math.max(0,n.reduce((sum,value,i)=>sum+value*light[i],0)),bounce=Math.max(0,n.reduce((sum,value,i)=>sum+value*fill[i],0));
          const intensity=.48+.48*key+.16*bounce;
          const hex=mesh.vertexColors?'#'+new Color().fromBufferAttribute(mesh.vertexColors,ia).getHexString():mesh.palette?.[mesh.part.materialIndices?.[t/3]??mesh.part.materialIndex];
          shaded=rgb(hex).map(value=>Math.min(255,display(linear(value)*intensity)));
        }
        const left=Math.max(0,Math.floor(Math.min(a[0],b[0],cc[0]))),right=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],cc[0])));
        const top=Math.max(0,Math.floor(Math.min(a[1],b[1],cc[1]))),bottom=Math.min(ht-1,Math.ceil(Math.max(a[1],b[1],cc[1])));
        for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++) {
          const u=edge(b,cc,x+.5,y+.5)/area,v=edge(cc,a,x+.5,y+.5)/area,z=1-u-v;
          if(u<0||v<0||z<0)continue;
          const index=y*w+x;
          if(shadow){mask[index]=1;continue;}
          const d=u*a[2]+v*b[2]+z*cc[2];if(d<=depth[index])continue;
          depth[index]=d;for(let k=0;k<3;k++)pixels[index*4+k]=shaded[k];
        }
      }
    }
    for(const mesh of meshes)triangles(mesh,true);
    const soft=blur(mask,w,ht,8*sampling),contact=blur(mask,w,ht,2*sampling);
    for(let i=0;i<mask.length;i++)for(let k=0;k<3;k++)pixels[i*4+k]*=1-.16*soft[i]-.12*contact[i];
    for(const mesh of meshes)triangles(mesh,false);
    const output=new Uint8Array(width*height*4);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
      for(let k=0;k<3;k++) {
        let sum=0;
        for(let dy=0;dy<sampling;dy++)for(let dx=0;dx<sampling;dx++)sum+=pixels[((y*sampling+dy)*w+x*sampling+dx)*4+k];
        output[(y*width+x)*4+k]=Math.round(sum/(sampling*sampling));
      }
      output[(y*width+x)*4+3]=255;
    }
    return pngFromRgba(output,width,height);
  } finally {for(const mesh of meshes)if(mesh.temporary)mesh.geometry.dispose();}
}
