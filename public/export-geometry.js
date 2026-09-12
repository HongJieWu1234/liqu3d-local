import { Matrix4 } from './vendor/three/three.module.js';

export function geometryForPrint(sourceGeometry, referenceMesh, layout, printer) {
  // Source geometry is Z-up. Mesh transforms place it in the Y-up viewer.
  // Undo that display basis once, then move from bed-centred to bed coordinates.
  referenceMesh.updateMatrixWorld(true);
  const transform = new Matrix4().makeTranslation(printer.width / 2, printer.depth / 2, 0)
    .multiply(new Matrix4().makeRotationX(Math.PI / 2))
    .multiply(new Matrix4().makeTranslation(-layout.x, 0, -layout.z))
    .multiply(referenceMesh.matrixWorld);
  const geometry = sourceGeometry.clone().applyMatrix4(transform);
  if (transform.determinant() < 0) {
    const count = geometry.index?.count || geometry.getAttribute('position').count;
    const indices = geometry.index ? Array.from(geometry.index.array) : Array.from({ length: count }, (_, index) => index);
    for (let index = 0; index < count; index += 3) [indices[index + 1], indices[index + 2]] = [indices[index + 2], indices[index + 1]];
    geometry.setIndex(indices);
  }
  return geometry;
}

export function placeObjectsOnBed(objects) {
  // Move the entire assembly, never individual colour layers, onto Z=0.
  let minimum = Infinity;
  for (const object of objects) for (const part of object.parts) {
    part.geometry.computeBoundingBox();
    minimum = Math.min(minimum, part.geometry.boundingBox.min.z);
  }
  if (Number.isFinite(minimum) && minimum !== 0) {
    for (const object of objects) for (const part of object.parts) part.geometry.translate(0, 0, -minimum);
  }
}
