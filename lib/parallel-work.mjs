// Preserve input order while bounding work to the renderer's advertised capacity.
// Drain cancelled work before callers dispose shared geometry or temporary files.
export async function parallelWork(items, concurrency, run, signal) {
  const controller = new AbortController();
  const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
  const results = new Array(items.length);
  let next = 0, failure;
  const worker = async () => {
    while (next < items.length && !combined.aborted) {
      const index = next++;
      try { results[index] = await run(items[index], index, combined); }
      catch (error) { failure ||= error; controller.abort(error); }
    }
  };
  const count = Math.min(items.length, Math.max(1, Math.min(16, Math.floor(Number(concurrency)) || 1)));
  await Promise.all(Array.from({ length: count }, worker));
  if (combined.aborted) throw failure || combined.reason;
  return results;
}
