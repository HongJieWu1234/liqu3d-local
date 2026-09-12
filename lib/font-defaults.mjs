import { scanScad, isComment } from './scad-syntax.mjs';

export const DEFAULT_FONT = 'Baloo 2:style=ExtraBold';
export function applyFontDefaultsToSource(source) {
  const syntax = scanScad(source);
  if (syntax.diagnostics.length) return source;
  const tokens = syntax.tokens.filter(token => !isComment(token));
  let result = '', start = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].kind !== 'identifier' || tokens[i].text !== 'font' || tokens[i + 1]?.text !== '=' || tokens[i + 2]?.kind !== 'string'
      || ![';',',',')'].includes(tokens[i + 3]?.text)) continue;
    const literal = tokens[i + 2];
    result += source.slice(start, literal.start) + JSON.stringify(DEFAULT_FONT); start = literal.end;
  }
  return result + source.slice(start);
}
export function defaultFontParameters(parameters) {
  return parameters.map(parameter => {
    if (parameter.type !== 'string' || !(parameter.fontPicker || /(?:^|_)font(?:_preset|_family)?$/.test(parameter.name))) return parameter;
    const option = parameter.options?.find(option => /baloo/i.test(String(option.value)));
    // A preset enum must keep its SCAD token; font pickers use a fontconfig name.
    if (parameter.options?.length && !option) return parameter;
    return { ...parameter, default:option?.value || DEFAULT_FONT };
  });
}
