import { parseLiteral, valueToScad } from './parser.mjs';

export const normalizeField = value => String(value).normalize('NFKC').toLowerCase().replace(/[\s_-]+/g, ' ').trim();
const fail = message => { throw new Error(message); };

function tableRows(text, delimiter) {
  const rows = []; let row = [], cell = '', quoted = false, endedQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') { quoted = false; endedQuote = true; }
      else cell += c;
    } else if (c === '"' && !cell && !endedQuote) quoted = true;
    else if (c === delimiter) { row.push(cell); cell = ''; endedQuote = false; }
    else if (c === '\n') { row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = ''; endedQuote = false; }
    else if (endedQuote && !/\s/.test(c)) fail('Unexpected text after a quoted field. Choose the correct delimiter.');
    else if (!endedQuote) cell += c;
  }
  if (quoted) fail('An order has an unclosed quote.');
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

export function parseOrders(input, format = 'auto') {
  const text = String(input || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').replace(/^\n+|\n+$/g, '');
  if (!text.trim()) return { headers: [], records: [], format: 'auto' };
  const first = text.split('\n').find(line => line.trim()) || '';
  if (format === 'auto') {
    const candidates = [',', '\t', ';', '|'].map(delimiter => {
      try { const rows = tableRows(text, delimiter); return { delimiter, rows }; } catch { return null; }
    }).filter(item => item && item.rows.length > 1 && item.rows[0].length > 1 && item.rows.every(row => row.length === item.rows[0].length));
    if (candidates.length === 1) format = candidates[0].delimiter;
    else if (/^[^:=\n]+\s*[:=]/.test(first)) format = 'records';
    else if (!candidates.length && !/[,\t;|]/.test(first) && tableRows(text, ',').length > 1) format = ',';
    else fail('Choose a format: key/value records or a table delimiter.');
  }
  let records, headers;
  if (format === 'records') {
    records = text.split(/\n[ \t]*\n+/).map((block, index) => {
      const result = {};
      for (const line of block.split('\n')) {
        const match = line.match(/^\s*([^:=]+?)\s*[:=][ \t]?(.*)$/);
        if (!match) fail(`Order ${index + 1}: expected a field followed by : or =. Separate orders with a blank line.`);
        const key = match[1].trim();
        if (Object.keys(result).some(existing => normalizeField(existing) === normalizeField(key))) fail(`Order ${index + 1}: duplicate field ${key}. Separate orders with a blank line.`);
        if (['__proto__', 'constructor', 'prototype'].includes(key)) fail('Invalid field name.');
        result[key] = match[2];
      }
      return result;
    });
    headers = [...new Set(records.flatMap(Object.keys))];
  } else {
    if (![',', '\t', ';', '|'].includes(format)) fail('Unsupported order format.');
    const rows = tableRows(text, format); headers = rows.shift()?.map(header => header.trim()) || [];
    if (headers.some(header => !header) || new Set(headers.map(normalizeField)).size !== headers.length) fail('Order headers must be nonempty and unique.');
    records = rows.map((row, index) => {
      if (row.length !== headers.length) fail(`Order ${index + 1}: expected ${headers.length} fields, found ${row.length}.`);
      return Object.fromEntries(headers.map((header, i) => [header, row[i]]));
    });
  }
  if (!records.length) fail('The order file has no orders.');
  if (records.length > 100) fail('A Quick batch supports up to 100 orders and 100 total copies.');
  return { headers, records, format };
}

function aliases(param) {
  const key = param.name.replace(/^design\d+_/, '');
  const names = [param.name, key, param.label];
  for (const value of [...names]) names.push(String(value).replace(/(?:_preview| Preview)$/i, '').replace(/(?:_text| Text|_type| Type)$/i, ''));
  names.push(key.replace(/_color_preview$/, '_layer_color'));
  return new Set(names.map(normalizeField));
}

function savedMapping(header, mapping) {
  if (Object.hasOwn(mapping, header)) return { explicit: true, target: mapping[header] };
  const entries = Object.entries(mapping).filter(([key]) => normalizeField(key) === normalizeField(header));
  return entries.length === 1 ? { explicit: true, target: entries[0][1] } : { explicit: false, target: '' };
}

export function rankFieldMatches(header, parameters) {
  const normalized = normalizeField(header), words = new Set(normalized.split(' ').filter(Boolean));
  return parameters.map(param => {
    const names = aliases(param);
    const wordCount = Math.max(0, ...[...names].map(name => [...new Set(name.split(' '))].filter(word => words.has(word)).length));
    const tier = param.name === header ? 4 : normalizeField(param.name) === normalized ? 3 : names.has(normalized) ? 2 : wordCount ? 1 : 0;
    return { name: param.name, label: param.label || param.name, method: ['none','words','alias','normalized','exact'][tier], tier, wordCount };
  }).sort((a,b) => b.tier - a.tier || (a.tier === 1 ? b.wordCount - a.wordCount : 0) || a.label.localeCompare(b.label) || a.name.localeCompare(b.name));
}

function fieldMatch(header, parameters, mapping) {
  const candidates = rankFieldMatches(header, parameters), saved = savedMapping(header, mapping);
  if (saved.explicit) return { target: saved.target, method: 'manual', candidates };
  const best = candidates[0];
  if (['quantity','qty','copies'].includes(normalizeField(header))) {
    return { target: best?.tier >= 2 ? '' : '@quantity', method: best?.tier >= 2 ? 'ambiguous' : 'quantity', candidates };
  }
  if (!best?.tier) return { target: '', method: 'unmatched', candidates };
  const tied = candidates.filter(item => item.tier === best.tier && (best.tier !== 1 || item.wordCount === best.wordCount));
  return { target: tied.length === 1 ? best.name : '', method: tied.length === 1 ? best.method : 'ambiguous', candidates };
}

export function parametersForModel(parameters, group) {
  if (!group.memberIds.length) return parameters;
  return parameters.filter(param => {
    const match = param.name.match(/^design(\d+)_/i);
    return !match || group.memberIds.includes(Number(match[1]));
  });
}

export function selectOrderModel(parsed, parameters, groups, mapping = {}, mode = 'auto', groupKey = '') {
  if (groups.length === 1) return groups[0];
  if (mode === 'manual') return groups.find(group => group.key === groupKey) || null;
  let best = null, bestScore = null;
  for (const group of groups) {
    const available = parametersForModel(parameters, group), score = [0,0,0,0,0];
    for (const header of parsed.headers) {
      const match = fieldMatch(header, available, mapping);
      if (!match.target || match.target.startsWith('@')) continue;
      if (match.method === 'manual') { if (available.some(param => param.name === match.target)) score[0]++; continue; }
      const candidate = match.candidates.find(item => item.name === match.target);
      if (candidate.tier >= 2) score[5 - candidate.tier]++;
      else score[4] += candidate.wordCount;
    }
    const different = bestScore ? score.findIndex((value,index) => value !== bestScore[index]) : -1;
    if (!best || (different !== -1 && score[different] > bestScore[different])) { best = group; bestScore = score; }
  }
  return best;
}

function typedValue(raw, param) {
  let value = raw;
  if (param.type === 'number') {
    if (!String(raw).trim()) fail(`${param.label}: enter a number.`);
    value = Number(raw);
  } else if (param.type === 'boolean') {
    const normalized = normalizeField(raw);
    if (['true', 'yes', 'on', '1'].includes(normalized)) value = true;
    else if (['false', 'no', 'off', '0'].includes(normalized)) value = false;
    else fail(`${param.label}: use true or false.`);
  } else if (param.type === 'vector') {
    const parsed = parseLiteral(String(raw));
    if (parsed.type !== 'vector' || !Array.isArray(parsed.value)) fail(`${param.label}: enter a literal array.`);
    value = parsed.value;
  }
  if (param.options?.length) {
    const options = param.options.map(option => typeof option === 'object' ? option.value : option);
    if (!options.some(option => option === value)) {
      const matches = options.filter(option => normalizeField(option) === normalizeField(value));
      if (matches.length !== 1) fail(`${param.label}: unsupported choice ${raw}.`);
      value = matches[0];
    }
  }
  valueToScad(value, param);
  return value;
}

export function resolveOrders(parsed, parameters, mapping = {}, sourceDefaults = {}) {
  const catalog = new Map(parameters.map(param => [param.name, param]));
  const defaults = { ...sourceDefaults, ...Object.fromEntries(parameters.map(param => [param.name, param.default])) };
  const resolvedMapping = {}, matches = {}, unresolved = [], errors = [], used = new Set();
  for (const header of parsed.headers) {
    const match = fieldMatch(header, parameters, mapping), target = match.target;
    matches[header] = match;
    if (!target || (!['@quantity', '@ignore'].includes(target) && !catalog.has(target))) { unresolved.push(header); continue; }
    if (target !== '@ignore' && used.has(target)) errors.push(`More than one field maps to ${target === '@quantity' ? 'Copies' : target}.`);
    used.add(target); resolvedMapping[header] = target;
  }
  const objects = [];
  if (!unresolved.length && !errors.length) parsed.records.forEach((record, index) => {
    // Each order starts from the SCAD, never a previous order or upload.
    const values = structuredClone(defaults); let quantity = 1;
    try {
      for (const [header, raw] of Object.entries(record)) {
        const target = resolvedMapping[header];
        if (target === '@ignore') continue;
        if (target === '@quantity') {
          quantity = Number(raw);
          if (!String(raw).trim() || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) fail('Copies must be a whole number from 1 to 100.');
        } else values[target] = typedValue(raw, catalog.get(target));
      }
      for (let copy = 0; copy < quantity; copy++) objects.push({ order: index + 1, copy: copy + 1, values });
    } catch (error) { errors.push(`Order ${index + 1}: ${error.message}`); }
  });
  if (objects.length > 100) errors.push('This batch exceeds 100 total copies. Split the order file into smaller batches.');
  return { mapping: resolvedMapping, matches, unresolved, errors, objects, orderCount: parsed.records.length, objectCount: objects.length };
}
