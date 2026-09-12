import { scanScad, isComment, decodeScadString, MAX_SYNTAX_DEPTH } from './scad-syntax.mjs';
const RESERVED = new Set(['module','function','if','else','let','assert','echo','for','each','true','false','undef']);

export function parseLiteral(raw) {
  const text = String(raw).trim(), fallback = { type:'raw', value:text };
  const scanned = scanScad(text);
  if (scanned.diagnostics.length) return fallback;
  const tokens = scanned.tokens.filter(token => !isComment(token));
  let cursor = 0;
  function value(depth = 0) {
    if (depth > MAX_SYNTAX_DEPTH) return null;
    const token = tokens[cursor++];
    if (!token) return null;
    if (token.kind === 'number') {
      const number = Number(token.text);
      return Number.isFinite(number) ? { type:'number', value:number } : null;
    }
    if (token.kind === 'string') {
      const string = decodeScadString(token.text);
      return string === null ? null : { type:'string', value:string };
    }
    if (token.text === 'true' || token.text === 'false') return { type:'boolean', value:token.text === 'true' };
    if (token.text === '+' || token.text === '-') {
      const result = value(depth + 1);
      return result?.type === 'number' ? { ...result, value:token.text === '-' ? -result.value : result.value } : null;
    }
    if (token.text === '(') {
      const result = value(depth + 1);
      return tokens[cursor++]?.text === ')' ? result : null;
    }
    if (token.text !== '[') return null;
    const items = [];
    while (tokens[cursor]?.text !== ']') {
      const item = value(depth + 1);
      if (!item) return null;
      items.push(item.value);
      if (tokens[cursor]?.text === ']') break;
      if (tokens[cursor++]?.text !== ',') return null;
    }
    return tokens[cursor++]?.text === ']' ? { type:'vector', value:items } : null;
  }
  const result = value();
  return result && cursor === tokens.length ? result : fallback;
}

// Only split hint punctuation outside quotes/brackets. Labels and font names
// may contain colons or commas; a bad hint must not change the source default.
function splitHint(text, separator) {
  const parts = []; let start = 0, quote = false, depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (quote) { if (text[i] === '\\') i++; else if (text[i] === '"') quote = false; continue; }
    if (text[i] === '"') quote = true;
    else if (text[i] === '[' || text[i] === '(') depth++;
    else if (text[i] === ']' || text[i] === ')') depth--;
    else if (!depth && text[i] === separator) { parts.push(text.slice(start, i).trim()); start = i + 1; }
    if (depth < 0) return [];
  }
  return quote || depth ? [] : [...parts, text.slice(start).trim()];
}

function parseCustomizerHint(comment, literal) {
  if (literal.type === 'number' && comment) {
    const step = parseLiteral(comment);
    if (step.type === 'number' && step.value > 0) return { step:step.value };
  }
  const match = comment.match(/^\[([\s\S]*)\]$/);
  if (!match || !match[1].trim()) return {};
  const inner = match[1].trim(), colon = splitHint(inner, ':');
  const numeric = colon.map(part => parseLiteral(part));
  if (literal.type === 'number' && [2,3].includes(colon.length) && numeric.every(part => part.type === 'number')) {
    const [min, middle, last] = numeric.map(part => part.value), max = last ?? middle, step = last === undefined ? 1 : middle;
    return min <= literal.value && literal.value <= max && step > 0 ? { min, max, step } : {};
  }
  const pieces = splitHint(inner, ',');
  if (!pieces.length || pieces.some(part => !part)) return {};
  if (pieces.length === 1 && numeric.length === 1 && numeric[0].type === 'number') {
    const max = numeric[0].value;
    return literal.type === 'number' && literal.value >= 0 && literal.value <= max ? { min:0, max, step:1 } : {};
  }
  const options = pieces.map(piece => {
    const fields = splitHint(piece, ':'), rawValue = fields.shift();
    if (rawValue === undefined) return null;
    const parsed = parseLiteral(rawValue);
    const value = literal.type === 'string' ? parsed.type === 'string' ? parsed.value : rawValue : parsed.type === literal.type ? parsed.value : null;
    if (value === null || !['string','number','boolean'].includes(literal.type)) return null;
    const rawLabel = fields.join(':').trim(), label = rawLabel ? parseLiteral(rawLabel) : null;
    return { value, label:label?.type === 'string' ? label.value : rawLabel || String(value) };
  });
  if (options.some(option => !option) || !options.some(option => option.value === literal.value)) return {};
  return { options };
}

function prettify(name, section) {
  let short = name.replace(/^\$/, '');
  const design = section.match(/^DESIGN\s+(\d+)$/i);
  if (design) short = short.replace(new RegExp(`^design${design[1]}_`, 'i'), '');
  return short.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Read complete statements, not lines. Bare blocks share their containing
// scope; module bodies, conditionals and call children introduce local scopes.
// Expressions stay in SCAD instead of being echoed back as -D overrides.
export function parseScadDocument(source) {
  const { tokens, pairs, diagnostics } = scanScad(source);
  const assignments = new Map(), components = { modules:[], functions:[] };
  let section = 'Parameters', descriptions = [];
  const skipComments = index => { while (isComment(tokens[index])) index++; return index; };
  const fail = index => { const token = tokens[index]; diagnostics.push({ message:'Could not determine this SCAD statement safely.', offset:token?.start ?? source.length, line:token?.line ?? 1 }); return tokens.length; };
  function trivia(index, collect) {
    while (isComment(tokens[index])) {
      const token = tokens[index++];
      if (!collect || !token.standalone) continue;
      const header = token.kind === 'block-comment' && token.text.match(/^\/\*\s*\[([^\]]+)\]\s*\*\/$/);
      if (header) { section = header[1].trim() || 'Parameters'; descriptions = []; }
      else if (token.kind === 'line-comment') {
        const text = token.text.slice(2).trim();
        if (text && !/^\[.*\]$/.test(text)) descriptions.push(text);
      } else descriptions = [];
    }
    return index;
  }
  function terminated(index) {
    for (let i = index; i < tokens.length; i++) {
      if (pairs.has(i)) i = pairs.get(i);
      else if (tokens[i].text === ';') return i;
      else if (tokens[i].text === '}') break;
    }
    return -1;
  }
  function statement(index, collect, depth = 0) {
    index = trivia(index, collect);
    if (depth > MAX_SYNTAX_DEPTH) return fail(index);
    const token = tokens[index];
    if (!token) return fail(index);
    const next = skipComments(index + 1);
    if (token.kind === 'directive' || token.text === ';') { descriptions = []; return index + 1; }
    if (token.text === '{') {
      const end = pairs.get(index);
      if (end === undefined) return fail(index);
      if (collect) {
        for (let i = index + 1; i < end;) { i = trivia(i, true); if (i < end) i = statement(i, true, depth + 1); }
      }
      descriptions = []; return end + 1;
    }
    if (token.text === 'module' || token.text === 'function') {
      const name = tokens[next], open = skipComments(next + 1), close = pairs.get(open);
      if (name?.kind !== 'identifier' || tokens[open]?.text !== '(' || close === undefined) return fail(index);
      if (collect) components[token.text === 'module' ? 'modules' : 'functions'].push(name.text);
      descriptions = [];
      if (token.text === 'module') return statement(close + 1, false, depth + 1);
      const end = terminated(close + 1);
      return end < 0 ? fail(index) : end + 1;
    }
    if (token.kind === 'identifier' && !RESERVED.has(token.text) && tokens[next]?.text === '=') {
      const end = terminated(next + 1);
      if (end < 0) return fail(index);
      if (collect) {
        const rawDefault = source.slice(tokens[next].end, tokens[end].start).trim();
        const after = tokens[end + 1];
        const comment = after?.kind === 'line-comment' && after.line === tokens[end].endLine ? after.text.slice(2).trim() : '';
        assignments.set(token.text, { name:token.text, rawDefault, literal:parseLiteral(rawDefault), section,
          hidden:section.toLowerCase() === 'hidden', description:descriptions.join(' '), comment, line:token.line });
      }
      descriptions = []; return end + 1;
    }
    if (['!','#','%','*'].includes(token.text)) return statement(next, false, depth + 1);
    if (token.kind === 'identifier' && tokens[next]?.text === '(' && pairs.has(next)) {
      let end = statement(pairs.get(next) + 1, false, depth + 1);
      const after = skipComments(end);
      if (token.text === 'if' && tokens[after]?.text === 'else') end = statement(after + 1, false, depth + 1);
      descriptions = []; return end;
    }
    return fail(index);
  }
  if (!diagnostics.length) {
    for (let i = 0; i < tokens.length && !diagnostics.length;) { i = trivia(i, true); if (i < tokens.length) i = statement(i, true); }
  }
  if (diagnostics.length) return { parameters:[], assignments:[], components:{ modules:[], functions:[] }, diagnostics };
  const parameters = [...assignments.values()].filter(item => !item.hidden && item.literal.type !== 'raw').map(item => {
    const { name, section, description, hidden, literal, rawDefault, comment, line } = item;
    const customizer = parseCustomizerHint(comment, literal), fontPicker = /^font$/i.test(comment) && literal.type === 'string';
    const control = fontPicker ? 'font' : customizer.options ? 'select' : customizer.min !== undefined ? 'range' : literal.type === 'vector' ? 'text' : literal.type;
    return { name, label:prettify(name, section), section, description, hidden, type:literal.type, control,
      default:literal.value, rawDefault, fontPicker, line, ...customizer };
  });
  return { parameters, assignments:[...assignments.values()], components:Object.fromEntries(Object.entries(components).map(([key,names]) => [key,[...new Set(names)]])), diagnostics };
}

export function parseScadParameters(source) { return parseScadDocument(source).parameters; }

function stringToScad(value) {
  let text = '"';
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code === 0 || code >= 0xd800 && code <= 0xdfff) throw new Error('Text contains an unsupported character.');
    if (ch === '"' || ch === '\\') text += `\\${ch}`;
    else if (code < 32) text += `\\u${code.toString(16).padStart(4,'0')}`;
    else text += ch;
  }
  return `${text}"`;
}

function arrayToScad(value, depth = 0) {
  if (depth > MAX_SYNTAX_DEPTH) throw new Error('Vector nesting is too deep.');
  return `[${Array.from(value, item => {
    if (Array.isArray(item)) return arrayToScad(item, depth + 1);
    if (typeof item === 'string') return stringToScad(item);
    if (typeof item === 'boolean') return String(item);
    if (typeof item === 'number' && Number.isFinite(item)) return String(item);
    throw new Error('Vectors must contain finite numbers, strings, booleans or literal vectors.');
  }).join(', ')}]`;
}

export function valueToScad(value, param) {
  switch (param.type) {
    case 'number': {
      const number = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
      if (!Number.isFinite(number)) throw new Error(`${param.name} must be a finite number.`);
      if (param.min !== undefined && number < param.min) throw new Error(`${param.name} must be at least ${param.min}.`);
      if (param.max !== undefined && number > param.max) throw new Error(`${param.name} must be at most ${param.max}.`);
      return String(number);
    }
    case 'boolean':
      if (value === true || value === 'true') return 'true';
      if (value === false || value === 'false') return 'false';
      throw new Error(`${param.name} must be true or false.`);
    case 'string': return stringToScad(String(value));
    case 'vector': {
      const parsed = Array.isArray(value) ? { type:'vector', value } : parseLiteral(String(value));
      if (parsed.type !== 'vector') throw new Error(`${param.name} must be a literal OpenSCAD vector like [1, 2, 3].`);
      return arrayToScad(parsed.value);
    }
    case 'raw': {
      const text = String(value).trim(), syntax = scanScad(text);
      if (!text || text.length > 5000 || syntax.diagnostics.length || syntax.tokens.some(token => token.kind !== 'string' && !isComment(token) && [';','{','}','='].includes(token.text))) throw new Error(`${param.name} contains unsupported OpenSCAD syntax.`);
      return text;
    }
    default: throw new Error(`Unsupported parameter type for ${param.name}.`);
  }
}
