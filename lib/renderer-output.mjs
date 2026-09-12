import { readBoundedZip } from './instant-archive.mjs';

export function validateRendererOutput(input, format, { maxBytes = 64 * 1024 ** 2, allowEmpty = false } = {}) {
  const bytes = Buffer.from(input);
  if (!bytes.length && allowEmpty) return bytes;
  if (!bytes.length || bytes.length > maxBytes) throw new Error('Invalid or oversized renderer output.');
  if (format === '3mf') {
    const entries = readBoundedZip(bytes, { archive: maxBytes, file: maxBytes * 2, total: maxBytes * 2, files: 1000 });
    if (!entries.some(entry => entry.path === '[Content_Types].xml') || !entries.some(entry => /\.model$/i.test(entry.path))) throw new Error('Renderer returned an invalid 3MF.');
    for (const entry of entries) if (/\.(xml|model|rels)$/i.test(entry.path) && /<!DOCTYPE|<!ENTITY/i.test(entry.bytes.toString('utf8'))) throw new Error('Renderer XML contains unsupported declarations.');
  } else if (format === 'stl') {
    if (bytes.length < 84 || bytes.readUInt32LE(80) === 0 || bytes.length !== 84 + bytes.readUInt32LE(80) * 50) throw new Error('Renderer returned an invalid binary STL.');
  } else if (format === 'webp') {
    if (bytes.length < 12 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP' || bytes.readUInt32LE(4) + 8 !== bytes.length) throw new Error('Renderer returned an invalid thumbnail.');
  } else throw new Error('Unsupported renderer output.');
  return bytes;
}
