export const supportedModelFile = /\.(scad|stl|3mf|off|amf|obj|svg|dxf|png|dat|txt|csv|json|ttf|otf)$/i;
export const acceptsModelUpload = name => supportedModelFile.test(name) || /\.zip$/i.test(name);
const filePath = file => file.relativePath || file.webkitRelativePath || file.name;

export async function readSelectedFile(file) {
  try { return new Uint8Array(await file.arrayBuffer()); }
  catch (cause) {
    const name = filePath(file);
    const permission = ['NotReadableError', 'NotFoundError', 'NotAllowedError', 'SecurityError'].includes(cause.name);
    throw new Error(permission
      ? `Cannot read “${name}”. Select the file again. If it is in iCloud or another cloud folder, download it to this device first, then choose it again.`
      : `Cannot read “${name}”: ${cause.message}`, { cause });
  }
}
const base64 = bytes => {
  let text = ''; for (let i = 0; i < bytes.length; i += 32768) text += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(text);
};
export async function readModelFiles(files) {
  const output = []; let total = 0;
  for (const file of files) {
    // Ignored files must never be opened: cloud placeholders and locked project
    // files can throw even though they aren't part of the dependency package.
    if (!acceptsModelUpload(file.name)) continue;
    const zip = /\.zip$/i.test(file.name), limit = (zip ? 16 : 8) * 1024 * 1024;
    if (file.size > limit) throw new Error(`“${filePath(file)}” exceeds the ${zip ? 16 : 8} MB file limit.`);
    if (output.length >= 200) throw new Error('Choose up to 200 model and dependency files.');
    const bytes = await readSelectedFile(file);
    total += bytes.length;
    if (bytes.length > limit || total > 16 * 1024 * 1024) throw new Error('Model folder exceeds the upload limit.');
    // Send the original archive to quarantine; the server checks ZIP metadata,
    // paths, symlinks, duplicates and actual expanded sizes before accepting it.
    output.push({ path: filePath(file), base64: base64(bytes) });
  }
  if (!output.length) throw new Error('Add a SCAD file and its supported dependencies.');
  return output;
}
