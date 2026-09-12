// Bake a lightweight SVG view of the same four machines for browsers without WebGL.
import { readFile, writeFile } from 'node:fs/promises';
import * as THREE from '../public/vendor/three/three.module.js';
import { buildPrinterFarm } from '../public/welcome-scene.js';
import { tagDesigns, fontDesigns } from '../public/welcome-tag-geometry.js';

const templates=[tagDesigns[0],...fontDesigns].map(design=>{
  const group=new THREE.Group();
  ['base','shadow','text'].forEach((part,i)=>{
    const data=design.layers[part];
    const packed=new Int16Array(Uint8Array.from(Buffer.from(data.positions,'base64')).buffer);
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(Float32Array.from(packed,value=>value/256),3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(Uint8Array.from(Buffer.from(data.indices,'base64')).buffer),1));
    group.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:design.colors[i]})));
  });
  group.children[0].geometry.computeBoundingBox();
  const center=group.children[0].geometry.boundingBox.getCenter(new THREE.Vector3());
  group.children.forEach(mesh=>mesh.geometry.translate(-center.x,-center.y,0));
  return group;
});
const farm=buildPrinterFarm(templates);
farm.setExpansion(1);farm.animate(0);farm.group.updateMatrixWorld(true);
const camera=new THREE.PerspectiveCamera(32,1.3,5,2000);
camera.position.z=farm.radius*1.04/Math.sin(THREE.MathUtils.degToRad(16));
camera.updateMatrixWorld(true);
const light=new THREE.Vector3(-.5,.8,1).normalize();
const faces=[];
const format=value=>Number(value.toFixed(2));
const project=point=>{const value=point.clone().project(camera);return [value.x*130,-value.y*100];};
const outline=keys=>{
  const points=keys.map(key=>key.split(' ').map(Number));
  let changed=true;
  while(changed && points.length>3){
    changed=false;
    for(let i=0;i<points.length && points.length>3;i++){
      const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];
      const dx=c[0]-a[0],dy=c[1]-a[1],length=dx*dx+dy*dy;
      const t=length ? ((b[0]-a[0])*dx+(b[1]-a[1])*dy)/length : -1;
      const cross=dx*(b[1]-a[1])-dy*(b[0]-a[0]);
      if(t>=0 && t<=1 && cross*cross/length<.0064){points.splice(i--,1);changed=true;}
    }
  }
  return points.length>2 ? 'M'+points.map(point=>point.map(value=>Number(value.toFixed(1))).join(' ')).join('L')+'Z' : '';
};
farm.group.traverse(mesh=>{
  if(!mesh.isMesh || mesh.material.transparent)return;
  const positions=mesh.geometry.attributes.position,indices=mesh.geometry.index;
  for(let instance=0;instance<(mesh.isInstancedMesh ? mesh.count : 1);instance++){
    const matrix=mesh.matrixWorld.clone();
    if(mesh.isInstancedMesh){const local=new THREE.Matrix4();mesh.getMatrixAt(instance,local);matrix.multiply(local);}
    const regions=new Map();
    for(let i=0;i<(indices?.count || positions.count);i+=3){
      const vertices=[0,1,2].map(corner=>new THREE.Vector3().fromBufferAttribute(positions,indices ? indices.getX(i+corner) : i+corner).applyMatrix4(matrix));
      const points=vertices.map(project);
      const [[ax,ay],[bx,by],[cx,cy]]=points;
      const area=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
      if(area>=-.0001)continue;
      const normal=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).normalize();
      const shade=mesh.material.isMeshBasicMaterial ? 1 : Math.round((.48+.52*Math.max(0,normal.dot(light)))*12)/12;
      const color=mesh.material.color.clone().multiplyScalar(shade).getHexString();
      if(!regions.has(color))regions.set(color,{edges:new Map(),depth:0,count:0});
      const region=regions.get(color);
      region.depth+=vertices.reduce((sum,p)=>sum+p.z,0)/3;region.count++;
      const keys=points.map(point=>point.map(format).join(' '));
      for(let edge=0;edge<3;edge++){
        const a=keys[edge],b=keys[(edge+1)%3];
        if(a === b)continue;
        if(region.edges.has(b+'|'+a))region.edges.delete(b+'|'+a);
        else region.edges.set(a+'|'+b,[a,b]);
      }
    }
    for(const [color,region] of regions){
      const outgoing=new Map();
      for(const [a,b] of region.edges.values()){
        if(!outgoing.has(a))outgoing.set(a,[]);
        outgoing.get(a).push(b);
      }
      let path='';
      while(outgoing.size){
        const first=outgoing.keys().next().value;
        let current=first;const contour=[first];
        do {
          const choices=outgoing.get(current);
          if(!choices?.length)break;
          const previous=current;current=choices.pop();
          if(!choices.length)outgoing.delete(previous);
          if(current !== first)contour.push(current);
        }while(current !== first);
        path+=outline(contour);
      }
      if(path)faces.push({depth:region.depth/region.count,color,path});
    }
  }
});
faces.sort((a,b)=>a.depth-b.depth);
// Adjacent triangles with identical shading share one SVG element.
const paths=[];
for(const face of faces){
  const previous=paths.at(-1);
  if(previous?.color === face.color)previous.path+=face.path;
  else paths.push({color:face.color,path:face.path});
}
let preview=`<!-- PRINTER PREVIEW START -->\n            <g class="fallback-production">\n`;
preview+=paths.map(({color,path})=>`<path fill="#${color}" stroke="#${color}" stroke-width=".04" stroke-linejoin="round" d="${path}"/>`).join('\n');
farm.group.traverse(line=>{
  if(!line.isLine)return;
  const coordinates=[];
  for(let i=0;i<line.geometry.attributes.position.count;i++){
    coordinates.push(project(new THREE.Vector3().fromBufferAttribute(line.geometry.attributes.position,i).applyMatrix4(line.matrixWorld)).map(format).join(' '));
  }
  preview+=`\n<polyline points="${coordinates.join(' ')}" fill="none" stroke="#${line.material.color.getHexString()}" stroke-width=".2"/>`;
});
preview+='\n            </g>\n<!-- PRINTER PREVIEW END -->';
const file=new URL('../public/welcome.html',import.meta.url);
let html=await readFile(file,'utf8');
html=html.replace(/\s*<g id="fallbackProductionPlate">[\s\S]*?<\/g>/,'');
const marker=/<!-- PRINTER PREVIEW START -->[\s\S]*?<!-- PRINTER PREVIEW END -->/;
html=marker.test(html) ? html.replace(marker,preview) : html.replace(/<g class="fallback-production"[\s\S]*?<\/g>/,preview);
await writeFile(file,html);
console.log(`Baked ${faces.length} shaded regions into ${paths.length} paths (${Math.round(preview.length/1024)} KiB).`);
