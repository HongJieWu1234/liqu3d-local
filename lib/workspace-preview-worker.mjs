import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { workspacePreviewPng } from './workspace-preview.mjs';

// Keep mesh parsing and image generation off the web request thread.
export async function renderWorkspacePreview(data, { accent, metadata, render }) {
  const worker = new Worker(new URL(import.meta.url), { workerData: {
    data, accent, definitions: data.plates.map(plate => metadata(plate.source).objects)
  } });
  const controller = new AbortController(), pending = new Set();
  try {
    return await new Promise((resolve, reject) => {
      worker.on('message', message => {
        if (message.type === 'result') return resolve(Buffer.from(message.bytes));
        if (message.type === 'error') return reject(new Error(message.error));
        if (message.type !== 'render') return;
        const job = Promise.resolve().then(() => render(message.values, message.format, { ...message.extra, signal: controller.signal }))
          .then(bytes => { if (!controller.signal.aborted) worker.postMessage({ id: message.id, bytes }); },
            error => { if (!controller.signal.aborted) worker.postMessage({ id: message.id, error: error.message }); })
          .finally(() => pending.delete(job));
        pending.add(job);
      });
      worker.once('error', reject);
      worker.once('exit', code => reject(new Error(`Workspace preview worker exited (${code}).`)));
    });
  } finally {
    controller.abort();
    await Promise.allSettled([...pending]);
    await worker.terminate();
  }
}

if (!isMainThread) {
  const waiting = new Map(); let nextId = 0;
  parentPort.on('message', message => {
    const job = waiting.get(message.id);
    if (!job) return;
    waiting.delete(message.id);
    if (message.error) job.reject(new Error(message.error)); else job.resolve(message.bytes);
  });
  const definitions = new Map(workerData.data.plates.map((plate, index) => [plate.source, workerData.definitions[index]]));
  try {
    const bytes = await workspacePreviewPng(workerData.data, {
      accent: workerData.accent, metadata: source => ({ objects: definitions.get(source) || [] }),
      render: (values, format, { signal, ...extra }) => new Promise((resolve, reject) => {
        const id = ++nextId; waiting.set(id, { resolve, reject });
        parentPort.postMessage({ type: 'render', id, values, format, extra });
      })
    });
    parentPort.postMessage({ type: 'result', bytes });
  } catch (error) { parentPort.postMessage({ type: 'error', error: error.message }); }
}
