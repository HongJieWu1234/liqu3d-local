// Lexical boundaries only: uploaded code is never evaluated here. Keep paths,
// strings and comments opaque so their punctuation cannot create fake settings.
const NUMBER = /(?:0x[0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/y;
const IDENTIFIER = /(?:[A-Za-z_$][A-Za-z0-9_]*|[0-9][A-Za-z0-9_]*)/y;
const CLOSE = { '(':')', '[':']', '{':'}' };
export const MAX_SYNTAX_DEPTH = 256;

export function scanScad(source) {
  const tokens = [], pairs = new Map(), diagnostics = [], stack = [];
  let i = 0, line = 1, lineHasCode = false;
  const error = (message, start = i) => diagnostics.push({ message, offset:start, line });
  const advance = end => {
    for (; i < end; i++) {
      if (source[i] === '\n' || source[i] === '\r' && source[i + 1] !== '\n') { line++; lineHasCode = false; }
    }
  };
  while (i < source.length) {
    if (tokens.length >= 500000) { error('SCAD is too large to inspect safely; settings were left in the source.'); break; }
    if (/[\s\uFEFF]/.test(source[i])) { advance(i + 1); continue; }
    const start = i, startLine = line, standalone = !lineHasCode;
    let kind = 'symbol', end = i + 1;
    if (source.startsWith('//', i)) {
      kind = 'line-comment'; end = i + 2;
      while (end < source.length && source[end] !== '\n') end++;
    } else if (source.startsWith('/*', i)) {
      kind = 'block-comment'; end = source.indexOf('*/', i + 2);
      if (end < 0) { error('Unterminated block comment.'); break; }
      end += 2;
    } else if (source[i] === '"') {
      kind = 'string'; end = i + 1;
      while (end < source.length && source[end] !== '"') { if (source[end] === '\\') end++; end++; }
      if (end >= source.length) { error('Unterminated string.'); break; }
      end++;
    } else {
      NUMBER.lastIndex = IDENTIFIER.lastIndex = i;
      const number = NUMBER.exec(source)?.[0], identifier = IDENTIFIER.exec(source)?.[0];
      if (number && number.length >= (identifier?.length || 0)) { kind = 'number'; end = i + number.length; }
      else if (identifier) { kind = 'identifier'; end = i + identifier.length; }
      if (kind === 'identifier' && ['include', 'use'].includes(source.slice(start, end))) {
        let pathStart = end;
        while (pathStart < source.length && /\s/.test(source[pathStart])) pathStart++;
        if (source[pathStart] === '<') {
          kind = 'directive'; end = source.indexOf('>', pathStart + 1);
          if (end < 0) { error('Unterminated include/use path.'); break; }
          end++;
        }
      }
      if (kind === 'symbol' && ['==','!=','<=','>=','&&','||','<<','>>'].includes(source.slice(i, i + 2))) end++;
    }
    advance(end);
    const token = { kind, text:source.slice(start, end), start, end, line:startLine, endLine:line, standalone };
    const index = tokens.length; tokens.push(token);
    if (!kind.endsWith('comment')) lineHasCode = true;
    if (kind !== 'symbol') continue;
    if (CLOSE[token.text]) {
      stack.push(index);
      if (stack.length > MAX_SYNTAX_DEPTH) { error('SCAD nesting is too deep to inspect safely.', start); break; }
    } else if ([')',']','}'].includes(token.text)) {
      const open = stack.pop();
      if (open === undefined || CLOSE[tokens[open].text] !== token.text) { error(`Unmatched ${token.text}.`, start); break; }
      pairs.set(open, index);
    }
  }
  if (!diagnostics.length && stack.length) {
    const token = tokens[stack.at(-1)];
    diagnostics.push({ message:`Unclosed ${token.text}.`, offset:token.start, line:token.line });
  }
  return { tokens, pairs, diagnostics };
}

export const isComment = token => token?.kind.endsWith('comment');

// OpenSCAD strings are not JSON: \xHH, \UHHHHHH and unknown escapes differ.
export function decodeScadString(text) {
  let value = '';
  for (let i = 1; i < text.length - 1; i++) {
    const ch = text[i];
    if (ch === '\n') continue;
    if (ch !== '\\') { value += ch; continue; }
    const next = text[++i], escapes = { n:'\n', r:'\r', t:'\t', '\\':'\\', '"':'"' };
    if (Object.hasOwn(escapes, next)) { value += escapes[next]; continue; }
    const length = next === 'x' ? 2 : next === 'u' ? 4 : next === 'U' ? 6 : 0;
    const hex = text.slice(i + 1, i + 1 + length);
    if (length && hex.length === length && /^[0-9a-f]+$/i.test(hex) && (next !== 'x' || /^[0-7]/.test(hex))) {
      const code = parseInt(hex, 16);
      if (code > 0x10ffff || code >= 0xd800 && code <= 0xdfff || code === 0 && next !== 'x') return null;
      value += String.fromCodePoint(code || 32); i += length;
    } else if (next !== '\n') value += next;
  }
  return value.includes('\0') ? null : value;
}
