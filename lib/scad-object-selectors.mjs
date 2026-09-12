// Older SCAD customizers declare a string dropdown instead of a numeric
// object manifest. Recognize it only when its choices name parameter groups.
export function inferDesignSelector(parameters) {
  const candidates = [];
  for (const parameter of parameters) {
    if (parameter.type !== 'string' || !parameter.options?.some(option => option.value === 'all')) continue;
    const choices = parameter.options.filter(option => option.value !== 'all');
    const objects = [], seen = new Set();
    for (const option of choices) {
      const match = String(option.value).match(/^design[_-]?(\d+)$/i);
      const id = Number(match?.[1]);
      const members = parameters.filter(item => new RegExp(`^design${id}_`, 'i').test(item.name));
      if (!match || id < 1 || id > 1000 || seen.has(id) || !members.length) break;
      seen.add(id);
      objects.push({ id, label: option.label && option.label !== option.value ? option.label : `Design ${id}`,
        labelParam: members.find(item => /_name_text$/i.test(item.name))?.name || null,
        mergeKey: `object_${id}`, selectorValue: option.value });
    }
    if (objects.length && objects.length === choices.length) candidates.push({ objectSelectorParam: parameter.name, objects });
  }
  // An ambiguous dropdown is not sufficient evidence to split a whole model.
  return candidates.length === 1 ? candidates[0] : null;
}

export function objectSelectorDefinition(value, metadata) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1 || id > 1000) throw new Error('Invalid object id.');
  if (!metadata.objectSelectorParam) throw new Error('This SCAD does not declare an object selector parameter.');
  const object = metadata.objects.find(object => object.id === id);
  if (!object) throw new Error('This SCAD does not expose that object.');
  return `${metadata.objectSelectorParam}=${JSON.stringify(object.selectorValue ?? id)}`;
}
