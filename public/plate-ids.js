const letters = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
export const PLATE_IDS = Object.freeze([
  ...letters,
  ...Array.from({ length: 10 }, (_, digit) => letters.map(letter => `${letter}${digit}`)).flat()
]);
export const MAX_PLATES = PLATE_IDS.length;
const indices = new Map(PLATE_IDS.map((id, index) => [id, index]));

export const isValidPlateId = value => typeof value === 'string' && indices.has(value);
export const plateIndex = value => indices.get(value) ?? -1;
export function plateIdAt(index) {
  if (!Number.isInteger(index) || index < 0 || index >= MAX_PLATES) throw new Error(`This batch needs more than ${MAX_PLATES} plates.`);
  return PLATE_IDS[index];
}
export function comparePlateIds(left, right) {
  return plateIndex(left) - plateIndex(right) || String(left).localeCompare(String(right));
}
