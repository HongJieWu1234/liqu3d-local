// Manual placement is unrestricted, including across objects and bed edges.
// Automatic packing applies its own spacing rules separately.
export function movePrimeTower(tower, printer, objects, x, y) {
  if (![x,y,tower.w,tower.h,tower.padding].every(Number.isFinite)) return null;
  return {...tower,x,y,bodyX:x+tower.padding,bodyY:y+tower.padding,manual:true};
}
