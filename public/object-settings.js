const normalized = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const groupKey = def => `group:${def.mergeKey || `object_${def.id}`}`;

function sectionsForDefinition(def, parameters) {
  const sections = [...new Set(parameters.map(param => param.section).filter(Boolean))];
  const names = new Set([def.label, def.mergeKey].filter(Boolean).map(normalized));
  const matches = sections.filter(section => names.has(normalized(section)) || parameters.some(param =>
    param.section === section && ((def.labelParam && param.name === def.labelParam)
      || (def.mergeKey && param.name.startsWith(`${def.mergeKey}_`)))));
  return matches.length ? matches : sections.filter(section => normalized(section) === `design${def.id}`);
}

function sectionsForSelection(plate, selection) {
  const instance = plate?.batchInstances?.find(item => `instance:${item.id}` === selection);
  const definitions = (plate?.objectDefs || []).filter(def => instance?.memberIds?.length
    ? instance.memberIds.includes(Number(def.id)) : groupKey(def) === (instance?.sourceKey || selection));
  return [...new Set(definitions.flatMap(def => sectionsForDefinition(def, plate.parameters || [])))];
}

export function objectSettingsSection(plate, selection, currentSection) {
  const sections = sectionsForSelection(plate, selection);
  return sections.includes(currentSection) ? currentSection : sections[0] || null;
}

export function settingsSectionSelection(plate, section, currentSelection) {
  // Keep editing the same copy when opening another section belonging to it.
  if (sectionsForSelection(plate, currentSelection).includes(section)) return currentSelection;
  const matches = new Set((plate?.objectDefs || []).filter(def =>
    sectionsForDefinition(def, plate.parameters || []).includes(section)).map(groupKey));
  return matches.size === 1 ? [...matches][0] : null;
}
