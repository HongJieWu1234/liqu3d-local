import { isValidPlateId as validPlate } from './plate-ids.js';

// Original location is stable; plateId remains the current location for older
// workspace/export consumers. moved_plate explicitly records relocation.
export function syncObjectPlateLocation(record, originalPlateId) {
  if (!validPlate(record.originalPlateId)) {
    record.originalPlateId = validPlate(originalPlateId) ? originalPlateId : validPlate(record.plateId) ? record.plateId : 'A';
  }
  if (!validPlate(record.plateId)) record.plateId = validPlate(record.moved_plate) ? record.moved_plate : record.originalPlateId;
  record.moved_plate = record.plateId === record.originalPlateId ? null : record.plateId;
  return record;
}

export function moveObjectToPlate(record, plateId, originalPlateId = record.plateId) {
  if (!validPlate(plateId)) throw new Error('Invalid destination plate.');
  syncObjectPlateLocation(record, originalPlateId);
  record.plateId = plateId;
  return syncObjectPlateLocation(record);
}

export function currentObjectPlate(record, fallback = 'A') {
  return validPlate(record?.moved_plate) ? record.moved_plate : validPlate(record?.plateId) ? record.plateId : fallback;
}
