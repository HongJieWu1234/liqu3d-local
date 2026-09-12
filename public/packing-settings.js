export function normalizeMaxObjectsPerPlate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (!Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new Error('Objects per plate must be a whole number from 1 to 100, or Auto.');
  }
  return value;
}
