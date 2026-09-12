import { snapQuarterTurn } from './quarter-turn.js';

// Keep source geometry's orientation. Only correct an explicitly known legacy
// editor angle to a quarter turn; never infer diagonal rotations from hull edges.
// The packer compares 0° and 90° (180°/270° have the same rectangular bounds).
export function orientedFootprint(parts, editorRotation = 0) {
  const rotation = snapQuarterTurn(editorRotation) - editorRotation;
  const c = Math.cos(rotation), s = Math.sin(rotation);
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for (const part of parts) {
    const p = part.geometry.positions;
    for (let i=0;i<p.length;i+=3) {
      const x=c*p[i]-s*p[i+1], y=s*p[i]+c*p[i+1];
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);
      minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    }
  }
  return {rotation,minX,minY,maxX,maxY,area:(maxX-minX)*(maxY-minY)};
}
