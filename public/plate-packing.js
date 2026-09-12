import { estimatePrimeTower } from './prime-tower.js?v=tower-free1';
import { MAX_PLATES } from './plate-ids.js';
import { normalizeMaxObjectsPerPlate } from './packing-settings.js';
import { movePrimeTower } from './prime-tower-position.js?v=tower-free1';

const MARGIN=5,GAP=5,EPSILON=1e-7;
const intersects=(a,b)=>a.x<b.x+b.w-EPSILON && a.x+a.w>b.x+EPSILON && a.y<b.y+b.h-EPSILON && a.y+a.h>b.y+EPSILON;
const contains=(a,b)=>b.x>=a.x-EPSILON && b.y>=a.y-EPSILON && b.x+b.w<=a.x+a.w+EPSILON && b.y+b.h<=a.y+a.h+EPSILON;
const rank=(a,b)=>{for(let i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>EPSILON)return a[i]-b[i];return 0;};
function splitFree(free,used) {
  const next=[];
  for(const rect of free) {
    if(!intersects(rect,used)){next.push(rect);continue;}
    if(used.x>rect.x+EPSILON)next.push({...rect,w:used.x-rect.x});
    if(used.x+used.w<rect.x+rect.w-EPSILON)next.push({...rect,x:used.x+used.w,w:rect.x+rect.w-used.x-used.w});
    if(used.y>rect.y+EPSILON)next.push({...rect,h:used.y-rect.y});
    if(used.y+used.h<rect.y+rect.h-EPSILON)next.push({...rect,y:used.y+used.h,h:rect.y+rect.h-used.y-used.h});
  }
  return next.filter((rect,i)=>rect.w>EPSILON && rect.h>EPSILON && !next.some((other,j)=>i!==j && contains(other,rect) && (!contains(rect,other)||j<i)));
}
function ordered(items,order) {
  const size=item=>order==='longest'?Math.max(item.width,item.depth):order==='shortest'?Math.min(item.width,item.depth):item.width*item.depth;
  return [...items].sort((a,b)=>size(b)-size(a)||b.width*b.depth-a.width*a.depth||a.index-b.index);
}
// Recompute a reservation after an object edit without moving any objects.
export function placePrimeTower(items,printer,settings,preferred=null) {
  const tower=estimatePrimeTower(items,settings);
  if(!tower)return null;
  if (preferred && [preferred.x,preferred.y].every(Number.isFinite)) {
    // Preserve position only; colors, dimensions and layer data are always fresh.
    const moved=movePrimeTower(tower,printer,[],preferred.x,preferred.y);
    return {...moved,manual:Boolean(preferred.manual)};
  }
  const blocked=[...(printer.excludedAreas||[]),...(printer.nozzleLimitedAreas||[])].map(a=>({x:a.x1,y:a.y1,w:a.x2-a.x1,h:a.y2-a.y1}));
  const positions=[...(preferred?[[preferred.x,preferred.y]]:[]),[printer.width-MARGIN-tower.w,printer.depth-MARGIN-tower.h],[MARGIN,printer.depth-MARGIN-tower.h],[printer.width-MARGIN-tower.w,MARGIN],[MARGIN,MARGIN]];
  const occupied=[...blocked,...items.map(item=>item.placement)];
  if(occupied.some(rect=>!rect||![rect.x,rect.y,rect.w,rect.h].every(Number.isFinite)))throw new Error('Cannot reserve the prime tower: current object positions are unavailable. Run Auto fit.');
  for(const [x,y] of positions) {
    const candidate={...tower,x,y,bodyX:x+tower.padding,bodyY:y+tower.padding};
    if(x<MARGIN-EPSILON||y<MARGIN-EPSILON||x+tower.w>printer.width-MARGIN+EPSILON||y+tower.h>printer.depth-MARGIN+EPSILON)continue;
    if(occupied.some(rect=>intersects({...candidate,w:candidate.w+GAP,h:candidate.h+GAP},{...rect,w:rect.w+GAP,h:rect.h+GAP})))continue;
    return candidate;
  }
  const [x,y]=positions[0];
  return {...tower,x,y,bodyX:x+tower.padding,bodyY:y+tower.padding};
}
function packOne(items,printer,options) {
  const tower=estimatePrimeTower(items,options.primeTower);
  const blocked=[...(printer.excludedAreas||[]),...(printer.nozzleLimitedAreas||[])].map(a=>({x:a.x1,y:a.y1,w:a.x2-a.x1,h:a.y2-a.y1}));
  const corners=tower?[[printer.width-MARGIN-tower.w,printer.depth-MARGIN-tower.h],[MARGIN,printer.depth-MARGIN-tower.h],[printer.width-MARGIN-tower.w,MARGIN],[MARGIN,MARGIN]]:[null];
  let best=null;
  for(const corner of corners) {
    const reservation=tower?{...tower,x:corner[0],y:corner[1],bodyX:corner[0]+tower.padding,bodyY:corner[1]+tower.padding}:null;
    if(reservation && (reservation.x<MARGIN-EPSILON || reservation.y<MARGIN-EPSILON || blocked.some(rect=>intersects({...reservation,w:reservation.w+GAP,h:reservation.h+GAP},{...rect,w:rect.w+GAP,h:rect.h+GAP}))))continue;
    for(const order of options.order?[options.order]:['area','longest','shortest']) {
      let free=[{x:MARGIN,y:MARGIN,w:printer.width-2*MARGIN+GAP,h:printer.depth-2*MARGIN+GAP}];
      for(const rect of [...blocked,...(reservation?[reservation]:[])])free=splitFree(free,{...rect,w:rect.w+GAP,h:rect.h+GAP});
      const placements=new Map();let failed=false;
      for(const item of ordered(items,order)) {
        let choice=null;
        for(const rect of free)for(const rotation of options.rotatedFirst?[Math.PI/2,0]:[0,Math.PI/2]) {
          const w=(rotation?item.depth:item.width)+GAP,h=(rotation?item.width:item.depth)+GAP;
          if(w>rect.w+EPSILON||h>rect.h+EPSILON)continue;
          const score=[Math.min(rect.w-w,rect.h-h),Math.max(rect.w-w,rect.h-h),rect.y,rect.x,options.rotatedFirst?(rotation?0:1):(rotation?1:0)];
          if(!choice||rank(score,choice.score)<0)choice={x:rect.x,y:rect.y,w,h,rotation,score};
        }
        if(!choice){failed=true;break;}
        placements.set(item.index,{x:choice.x,y:choice.y,w:choice.w-GAP,h:choice.h-GAP,rotation:choice.rotation,primeTower:reservation});
        free=splitFree(free,choice);
      }
      if(failed)continue;
      const values=[...placements.values()],score=[Math.max(...values.map(p=>p.y+p.h))-MARGIN,Math.max(...values.map(p=>p.x+p.w))-MARGIN];
      if(!best||rank(score,best.score)<0)best={items,placements,score};
    }
  }
  return best;
}
export function arrangeObjects(objects,printer,options={}) {
  const cap=normalizeMaxObjectsPerPlate(options.maxObjectsPerPlate),plates=[],maxPlates=options.maxPlates??MAX_PLATES;
  for(const object of objects)if(![object.width,object.depth].every(v=>Number.isFinite(v)&&v>0))throw new Error(`${object.name||'An object'} has invalid generated dimensions.`);
  for(const object of ordered(objects,options.order||'area')) {
    let chosen=null;
    for(let p=0;p<plates.length;p++) {
      if(cap!==null && plates[p].items.length>=cap)continue;
      const fit=packOne([...plates[p].items,object],printer,options);
      if(fit){chosen={p,fit};break;}
    }
    if(!chosen){const fit=packOne([object],printer,options);if(fit)chosen={p:plates.length,fit};}
    if(!chosen)throw new Error(`${object.name} measures ${object.width.toFixed(1)} × ${object.depth.toFixed(1)} mm and does not fit the selected printer's ${printer.width} × ${printer.depth} mm bed with its edge clearance, excluded areas, and prime tower. Choose a larger printer or adjust the model dimensions.`);
    if(chosen.p>=maxPlates)throw new Error(`This batch needs more than ${maxPlates} plates. Split the order file.`);
    plates[chosen.p]=chosen.fit;
  }
  const byIndex=new Map(objects.map(item=>[item.index,item]));
  for(const [plateIndex,plate] of plates.entries())for(const [index,placement] of plate.placements)byIndex.get(index).placement={...placement,plateIndex};
  return plates.length;
}
export function minimumPackingPlates(objects,printer,{maxObjectsPerPlate}={}) {
  const cap=normalizeMaxObjectsPerPlate(maxObjectsPerPlate);
  return Math.max(Math.ceil(objects.reduce((sum,item)=>sum+(item.width+GAP)*(item.depth+GAP),0)/((printer.width-MARGIN)*(printer.depth-MARGIN))),cap===null?0:Math.ceil(objects.length/cap));
}
