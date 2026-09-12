import { zlibSync } from '../public/vendor/three/addons/libs/fflate.module.js';
import { Color } from '../public/vendor/three/three.module.js';
import { createPrimeTowerPreview } from '../public/prime-tower-preview.js';

const crcTable = Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function chunk(type,data) {
  const body=Buffer.concat([Buffer.from(type),Buffer.from(data)]), result=Buffer.alloc(body.length+8);
  result.writeUInt32BE(data.length,0);body.copy(result,4);let crc=0xffffffff;
  for(const b of body)crc=crcTable[(crc^b)&255]^(crc>>>8);
  result.writeUInt32BE((crc^0xffffffff)>>>0,result.length-4);return result;
}

// Orthographic, depth-tested thumbnail of the final export solids and plate
// placement. No live workspace image or serialized mesh is retained.
export function exportPreview(plates,bed,{width=800,height=450}={}) {
  const pixels=Buffer.alloc(width*height*4), depth=new Float64Array(width*height).fill(-Infinity);
  for(let i=0;i<pixels.length;i+=4){pixels[i]=17;pixels[i+1]=21;pixels[i+2]=20;pixels[i+3]=255;}
  const columns=Math.min(3,Math.ceil(Math.sqrt(plates.length))), vertices=[];
  const project=(x,y,z)=>[(x-y)*.70710678,(x+y)*.35355339-z*.8660254,(x+y)*.61237244+z*.5];
  const offsets=plates.map((_,i)=>[(i%columns)*(bed.width+35),Math.floor(i/columns)*(bed.depth+35)]);
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  function point(x,y,z){const p=project(x,y,z);minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);return p;}
  for(const [i,plate] of plates.entries()) {
    const [dx,dy]=offsets[i];
    const corners=[[0,0],[bed.width,0],[bed.width,bed.depth],[0,bed.depth]].map(([x,y])=>point(x+dx,y+dy,-.2));
    vertices.push({points:corners,color:[30,44,36],triangles:[0,1,2,0,2,3],plate:true});
    for(const object of plate.objects)for(const part of object.parts){
      const p=part.geometry.getAttribute('position'),points=Array.from({length:p.count},(_,j)=>point(p.getX(j)+dx,p.getY(j)+dy,p.getZ(j)));
      vertices.push({points,triangles:part.geometry.index?.array || Array.from({length:p.count},(_,j)=>j),part,palette:plate.palette});
    }
    if(plate.primeTower) {
      const tower=plate.primeTower,preview=createPrimeTowerPreview(tower);
      const cx=tower.x+tower.w/2,cy=tower.y+tower.h/2;
      preview.traverse(mesh=>{
        if(mesh.isMesh) {
          const p=mesh.geometry.getAttribute('position'),colors=mesh.geometry.getAttribute('color');
          const points=Array.from({length:p.count},(_,j)=>point(cx+p.getX(j)+dx,cy-p.getZ(j)+dy,p.getY(j)+mesh.position.y));
          const faceColors=Array.from({length:p.count/3},(_,j)=>{
            const hex=new Color().fromBufferAttribute(colors,j*3).getHexString();
            return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));
          });
          vertices.push({points,triangles:Array.from({length:p.count},(_,j)=>j),faceColors});
        }
        mesh.geometry?.dispose();mesh.material?.dispose();
      });
    }
  }
  const scale=Math.min((width-40)/Math.max(1,maxX-minX),(height-40)/Math.max(1,maxY-minY));
  const ox=(width-(maxX-minX)*scale)/2,oy=(height-(maxY-minY)*scale)/2;
  const edge=(a,b,x,y)=>(x-a[0])*(b[1]-a[1])-(y-a[1])*(b[0]-a[0]);
  for(const mesh of vertices){
    const points=mesh.points.map(([x,y,z])=>[(x-minX)*scale+ox,(y-minY)*scale+oy,z]);
    for(let t=0;t<mesh.triangles.length;t+=3){
      const [a,b,c]=[0,1,2].map(j=>points[mesh.triangles[t+j]]),area=edge(a,b,c[0],c[1]);if(Math.abs(area)<1e-9)continue;
      const hex=mesh.palette?.[mesh.part.materialIndices?.[t/3]??mesh.part.materialIndex] || '#00AE42';
      const rgb=mesh.faceColors?.[t/3] || mesh.color || [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
      const left=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),right=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const top=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),bottom=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
        const u=edge(b,c,x+.5,y+.5)/area,v=edge(c,a,x+.5,y+.5)/area,w=1-u-v;
        if(u<0||v<0||w<0)continue;const z=u*a[2]+v*b[2]+w*c[2],index=y*width+x;
        if(z<=depth[index])continue;depth[index]=z;for(let j=0;j<3;j++)pixels[index*4+j]=rgb[j];
      }
    }
  }
  return pngFromRgba(pixels,width,height);
}

export function pngFromRgba(pixels,width,height) {
  pixels=Buffer.from(pixels.buffer,pixels.byteOffset,pixels.byteLength);
  const raw=Buffer.alloc(height*(width*4+1));for(let y=0;y<height;y++)pixels.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4);
  const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlibSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
