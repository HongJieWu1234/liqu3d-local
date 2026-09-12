// Build an object-bound workspace fixture for SKU model and API tests.
export function captureObjectSnapshot(plate, record, values, memberIds = []) {
  const selectionKey = record.sourceKey || record.selectionKey;
  const savedRecord = { ...structuredClone(record), selectionKey, sourceKey: selectionKey, deleted: false,
    plateId: 'A', configuration: { parameters: structuredClone(values) } };
  delete savedRecord.skuLink;
  return { version: 1, activeSourceInstanceId: plate.sourceInstanceId, activeViewPlateId: 'A', loadedPlateIds: ['A'],
    activePresetIds: [], parametricPresets: [],
    plates: [{ sourceInstanceId: plate.sourceInstanceId, sourceName: plate.sourceName || plate.name, source: plate.source,
      defaultPlateId: 'A', objectBinding: { selectionKey, memberIds: [...memberIds] },
      values: structuredClone(values), baseValues: structuredClone(values),
      objectRecords: { [selectionKey]: savedRecord }, objectTransforms: {}, batchInstances: [], selectedObjectId: selectionKey }] };
}
