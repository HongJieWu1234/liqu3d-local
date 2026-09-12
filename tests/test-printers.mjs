import './setup.mjs';
import assert from 'node:assert/strict';
import { PRINTERS, createDefaultProfile } from '../public/print-settings-schema.js';

const expectedPrinters = [
  'a1mini', 'a1', 'a2l', 'p1p', 'p1s', 'p2s', 'x1', 'x1c', 'x1e',
  'h2s', 'h2d', 'h2dpro', 'h2c', 'x2d'
];

assert.deepEqual(Object.keys(PRINTERS), expectedPrinters);
assert.equal(createDefaultProfile().printer, 'p1s');

for (const id of ['p1p', 'p1s', 'x1', 'x1c', 'x1e']) {
  assert.deepEqual(PRINTERS[id].excludedAreas, [
    { x1: 0, y1: 0, x2: 18, y2: 28, label: 'Front-left no-print area' }
  ]);
}

assert.deepEqual(PRINTERS.h2d.nozzleLimitedAreas.map(({ x1, x2 }) => [x1, x2]), [[0, 25], [325, 350]]);
assert.deepEqual(PRINTERS.x2d.nozzleLimitedAreas.map(({ x1, x2 }) => [x1, x2]), [[0, 20.5]]);

console.log('Printer profile tests passed.');
