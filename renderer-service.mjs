import http from 'node:http';
import fs from 'node:fs';
import { timingSafeEqual } from 'node:crypto';
import { ContainerRenderer } from './lib/renderer-containers.mjs';
import { normalizeAssets } from './lib/instant-assets.mjs';

process.umask(0o077);
const HOST = process.env.HOST || '0.0.0.0', PORT = Number(process.env.PORT || 4180);
const TRUST_INTERNAL = process.env.PMM_RENDERER_TRUST_INTERNAL === '1';
const TOKEN = (process.env.PMM_RENDERER_TOKEN ?? (process.env.PMM_RENDERER_TOKEN_FILE ? fs.readFileSync(process.env.PMM_RENDERER_TOKEN_FILE, 'utf8') : '')).trim();
const MAX_BODY = 64 * 1024 ** 2;
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('Invalid renderer port.');
if (process.env.NODE_ENV === 'production' && !TRUST_INTERNAL && TOKEN.length < 32) throw new Error('Production renderer requires a token of at least 32 characters or explicit private-network trust.');
const renderer = new ContainerRenderer();
await renderer.initialize();
let health;
async function capabilities() {
  if (renderer.closing) return { ready: false, error: 'Renderer is unavailable.' };
  health ||= renderer.run('health').catch(error => { health = null; throw error; });
  return health;
}
function authorized(req) {
  if (TRUST_INTERNAL) return true;
  if (!TOKEN) return process.env.NODE_ENV !== 'production';
  const value = Buffer.from(String(req.headers['x-pmm-renderer-token'] || '')), expected = Buffer.from(TOKEN);
  return value.length === expected.length && timingSafeEqual(value, expected);
}
function sendJson(res, status, body) {
  if (res.destroyed) return;
  const bytes = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': bytes.length, 'Cache-Control': 'no-store' });
  res.end(bytes);
}
async function readJson(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('Renderer request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
const server = http.createServer({ requestTimeout: 650000, headersTimeout: 10000, keepAliveTimeout: 5000, maxHeaderSize: 8192 }, async (req, res) => {
  const controller = new AbortController();
  const cancel = () => { if (!res.writableEnded) controller.abort(new Error('Generation cancelled.')); };
  req.once('aborted', cancel); res.once('close', cancel);
  try {
    const route = new URL(req.url, 'http://renderer').pathname;
    if (req.method === 'GET' && route === '/healthz') {
      const info = await capabilities(); return sendJson(res, info.ready ? 200 : 503, info);
    }
    if (!authorized(req)) return sendJson(res, 401, { error: 'Renderer authentication failed.' });
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });
    if (!['/render', '/thumbnail'].includes(route)) return sendJson(res, 404, { error: 'Not found.' });
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return sendJson(res, 415, { error: 'Use JSON.' });
    const body = await readJson(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return sendJson(res, 400, { error: 'Invalid render request.' });
    if (body.dependencies) {
      try { body.dependencies = normalizeAssets(body.dependencies); }
      catch (error) { return sendJson(res, 422, { error: error.message }); }
    }
    const output = await renderer.run(route.slice(1), body, controller.signal);
    if (res.destroyed) return;
    res.writeHead(200, { 'Content-Type': route === '/thumbnail' ? 'image/webp' : 'application/octet-stream', 'Content-Length': output.length, 'Cache-Control': 'no-store',
      ...(renderer.cacheIdentity ? { 'X-Render-Identity': renderer.cacheIdentity } : {}) });
    res.end(output);
  } catch (error) {
    const status = error.status || (error instanceof SyntaxError ? 400 : 503);
    if (status >= 500) console.error('Renderer:', error.message);
    sendJson(res, status, { error: status >= 500 ? 'Isolated renderer unavailable. Check the worker image and Docker service.' : error.message });
  } finally { req.removeListener('aborted', cancel); res.removeListener('close', cancel); }
});
server.listen(PORT, HOST, () => {
  console.log(`Disposable-container renderer: http://${HOST}:${PORT}`);
  void capabilities().catch(error => console.error('Worker health probe:', error.message));
});
let closing = false;
async function shutdown() {
  if (closing) return; closing = true;
  server.close(); server.closeIdleConnections?.();
  const deadline = setTimeout(() => process.exit(1), 20000);
  await renderer.shutdown(); clearTimeout(deadline); process.exit(0);
}
process.once('SIGTERM', shutdown); process.once('SIGINT', shutdown);
