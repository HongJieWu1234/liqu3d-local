import { inflateRawSync } from 'node:zlib';

export const uploadLimits = Object.freeze({ files: 200, file: 8 * 1024 ** 2, total: 16 * 1024 ** 2, archive: 16 * 1024 ** 2 });
export function assetPath(value) {
  if (typeof value !== 'string') throw new Error('Invalid dependency path.');
  const name = value.replaceAll('\\', '/').normalize('NFC');
  if (!name || name.length > 500 || /[:\u0000-\u001f\u007f]/.test(name) || name.split('/').some(part => !part || part === '.' || part === '..' || /[. ]$/.test(part))) throw new Error('Dependency paths must stay inside the uploaded folder.');
  return name;
}
export function uniquePaths(names) {
  const seen = new Set();
  for (const name of names) {
    const key = assetPath(name).toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate dependency: ${name}`);
    seen.add(key);
  }
  for (const name of seen) {
    const parts = name.split('/'); parts.pop();
    while (parts.length) {
      if (seen.has(parts.join('/'))) throw new Error(`Conflicting file and folder: ${name}`);
      parts.pop();
    }
  }
}
export function decodeBase64(value, maxBytes) {
  if (typeof value !== 'string' || value.length % 4 || value.length > 4 * Math.ceil(maxBytes / 3) || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error('Invalid or oversized file data.');
  const bytes = Buffer.from(value, 'base64');
  if (bytes.length > maxBytes || bytes.toString('base64') !== value) throw new Error('Invalid or oversized file data.');
  return bytes;
}
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// Inspect both ZIP headers before inflation. No archive path is ever extracted
// to the server filesystem; declared and actual sizes are independently bounded.
export function readBoundedZip(input, limits = uploadLimits) {
  const bytes = Buffer.from(input);
  const fail = () => { throw new Error('Malformed or unsupported ZIP archive.'); };
  const uint64 = (buffer, offset) => {
    if (offset < 0 || offset + 8 > buffer.length) fail();
    const value = buffer.readBigUInt64LE(offset);
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) fail();
    return Number(value);
  };
  const zip64Extra = (start, length) => {
    const stop = start + length; let result;
    if (stop > bytes.length) fail();
    while (start < stop) {
      if (start + 4 > stop) fail();
      const tag = bytes.readUInt16LE(start), size = bytes.readUInt16LE(start + 2);
      if (start + 4 + size > stop) fail();
      if (tag === 1) { if (result) fail(); result = bytes.subarray(start + 4, start + 4 + size); }
      start += 4 + size;
    }
    return result || Buffer.alloc(0);
  };
  if (bytes.length < 22 || bytes.length > limits.archive) fail();
  let end = bytes.length - 22;
  for (; end >= Math.max(0, bytes.length - 65557); end--) {
    if (bytes.readUInt32LE(end) === 0x06054b50 && end + 22 + bytes.readUInt16LE(end + 20) === bytes.length) break;
  }
  if (end < 0 || bytes.readUInt32LE(end) !== 0x06054b50) fail();
  let count = bytes.readUInt16LE(end + 10), centralSize = bytes.readUInt32LE(end + 12), central = bytes.readUInt32LE(end + 16), centralEnd = end;
  if (bytes.readUInt16LE(end + 4) || bytes.readUInt16LE(end + 6) || bytes.readUInt16LE(end + 8) !== count) fail();
  if (count === 0xffff || centralSize === 0xffffffff || central === 0xffffffff) {
    if (end < 20 || bytes.readUInt32LE(end - 20) !== 0x07064b50 || bytes.readUInt32LE(end - 16) || bytes.readUInt32LE(end - 4) !== 1) fail();
    centralEnd = uint64(bytes, end - 12);
    if (centralEnd + 56 > end - 20 || bytes.readUInt32LE(centralEnd) !== 0x06064b50 || uint64(bytes, centralEnd + 4) !== end - 20 - centralEnd - 12 || bytes.readUInt32LE(centralEnd + 16) || bytes.readUInt32LE(centralEnd + 20)) fail();
    const count64 = uint64(bytes, centralEnd + 32), size64 = uint64(bytes, centralEnd + 40), start64 = uint64(bytes, centralEnd + 48);
    if (uint64(bytes, centralEnd + 24) !== count64 || count !== 0xffff && count !== count64 || centralSize !== 0xffffffff && centralSize !== size64 || central !== 0xffffffff && central !== start64) fail();
    count = count64; centralSize = size64; central = start64;
  }
  if (!count || count > limits.files || central + centralSize !== centralEnd) fail();
  const entries = [], allNames = new Set(), spans = []; let offset = central, total = 0;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > centralEnd || bytes.readUInt32LE(offset) !== 0x02014b50) fail();
    const flags = bytes.readUInt16LE(offset + 8), method = bytes.readUInt16LE(offset + 10), crc = bytes.readUInt32LE(offset + 16);
    let compressed = bytes.readUInt32LE(offset + 20), size = bytes.readUInt32LE(offset + 24), local = bytes.readUInt32LE(offset + 42);
    const nameSize = bytes.readUInt16LE(offset + 28);
    const next = offset + 46 + nameSize + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
    const mode = bytes.readUInt32LE(offset + 38) >>> 16;
    if (next > centralEnd || !nameSize || flags & ~0x080e || flags & 1 || ![0, 8].includes(method) || bytes.readUInt16LE(offset + 34) || ![0, 0x4000, 0x8000].includes(mode & 0xf000)) fail();
    const extended = zip64Extra(offset + 46 + nameSize, bytes.readUInt16LE(offset + 30)); let field = 0;
    const wide = size === 0xffffffff || compressed === 0xffffffff;
    if (size === 0xffffffff) { size = uint64(extended, field); field += 8; }
    if (compressed === 0xffffffff) { compressed = uint64(extended, field); field += 8; }
    if (local === 0xffffffff) local = uint64(extended, field);
    const rawName = bytes.subarray(offset + 46, offset + 46 + nameSize);
    let name;
    try { name = new TextDecoder('utf-8', { fatal: true }).decode(rawName); } catch { fail(); }
    const directory = name.endsWith('/');
    name = assetPath(directory ? name.slice(0, -1) : name);
    const key = name.toLowerCase();
    if (allNames.has(key)) throw new Error(`Duplicate dependency: ${name}`);
    allNames.add(key);
    if ((mode & 0xf000) === 0x4000 && !directory || directory && (size || compressed && method === 0)) fail();
    total += size;
    if (size > limits.file || total > limits.total) throw new Error('ZIP exceeds the extracted file size limit.');
    if (local + 30 > central || bytes.readUInt32LE(local) !== 0x04034b50 || bytes.readUInt16LE(local + 6) !== flags || bytes.readUInt16LE(local + 8) !== method || bytes.readUInt16LE(local + 26) !== nameSize) fail();
    const dataStart = local + 30 + nameSize + bytes.readUInt16LE(local + 28), dataEnd = dataStart + compressed;
    if (dataEnd > central || !bytes.subarray(local + 30, local + 30 + nameSize).equals(rawName)) fail();
    const localExtra = zip64Extra(local + 30 + nameSize, bytes.readUInt16LE(local + 28)); let localField = 0;
    let localSize = bytes.readUInt32LE(local + 22), localCompressed = bytes.readUInt32LE(local + 18);
    if (localSize === 0xffffffff) { localSize = uint64(localExtra, localField); localField += 8; }
    if (localCompressed === 0xffffffff) localCompressed = uint64(localExtra, localField);
    if (!(flags & 8) && (bytes.readUInt32LE(local + 14) !== crc || localCompressed !== compressed || localSize !== size)) fail();
    let spanEnd = dataEnd;
    if (flags & 8) {
      if (spanEnd + 12 > central) fail();
      if (bytes.readUInt32LE(spanEnd) === 0x08074b50) spanEnd += 4;
      const descriptorSize = wide ? 20 : 12;
      if (spanEnd + descriptorSize > central || bytes.readUInt32LE(spanEnd) !== crc || (wide ? uint64(bytes, spanEnd + 4) : bytes.readUInt32LE(spanEnd + 4)) !== compressed || (wide ? uint64(bytes, spanEnd + 12) : bytes.readUInt32LE(spanEnd + 8)) !== size) fail();
      spanEnd += descriptorSize;
    }
    spans.push([local, spanEnd]);
    entries.push({ name, directory, method, size, crc, dataStart, dataEnd }); offset = next;
  }
  if (offset !== centralEnd) fail();
  spans.sort((a, b) => a[0] - b[0]);
  if (spans[0][0] !== 0 || spans.some((span, i) => span[1] !== (spans[i + 1]?.[0] ?? central))) fail();
  uniquePaths(entries.filter(entry => !entry.directory).map(entry => entry.name));
  for (const entry of entries.filter(entry => entry.directory)) {
    if (entries.some(file => !file.directory && (entry.name.toLowerCase() === file.name.toLowerCase() || entry.name.toLowerCase().startsWith(file.name.toLowerCase() + '/')))) fail();
  }
  return entries.flatMap(entry => {
    const compressed = bytes.subarray(entry.dataStart, entry.dataEnd);
    let data;
    try { data = entry.method === 0 ? compressed : inflateRawSync(compressed, { maxOutputLength: Math.max(1, entry.size) }); } catch { fail(); }
    if (data.length !== entry.size || crc32(data) !== entry.crc) fail();
    return entry.directory ? [] : [{ path: entry.name, bytes: data }];
  });
}
