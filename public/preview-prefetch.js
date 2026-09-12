const cancelled = () => new DOMException('Render cancelled.', 'AbortError');

// Share one render budget across the current and next source plate. Keep the
// lookahead bounded so a slow browser cannot accumulate a workspace of buffers.
export class PreviewPrefetch {
  constructor(batches, concurrency) {
    this.concurrency = Math.max(1, Math.min(16, Math.floor(Number(concurrency)) || 1));
    this.current = 0;
    this.active = new Set();
    this.closed = false;
    this.batches = batches.map(batch => ({ ...batch, controller: new AbortController(), jobs: batch.jobs.map(job => {
      const entry = { ...job, started: false };
      entry.promise = new Promise((resolve, reject) => { entry.resolve = resolve; entry.reject = reject; });
      entry.promise.catch(() => {});
      return entry;
    }) }));
    this.pump();
  }

  pump() {
    if (this.closed) return;
    for (const batch of this.batches.slice(this.current, this.current + 2)) {
      if (batch.controller.signal.aborted) continue;
      for (const job of batch.jobs) {
        if (this.active.size >= this.concurrency) return;
        if (job.started) continue;
        job.started = true;
        const work = { batch };
        this.active.add(work);
        work.promise = Promise.resolve().then(async () => {
          batch.controller.signal.throwIfAborted();
          const value = await job.run(batch.controller.signal);
          batch.controller.signal.throwIfAborted();
          return value;
        }).then(job.resolve, job.reject).finally(() => {
          this.active.delete(work);
          this.pump();
        });
      }
    }
  }

  async read(key, signature) {
    const batch = this.batches.find(batch => batch.key === key);
    if (this.closed || !batch || batch.signature !== signature) {
      // Changed values must never use prefetched output. Drain before the
      // normal generation path starts, retaining the same concurrency bound.
      await this.close();
      return null;
    }
    return new Map(batch.jobs.map(job => [job.key, job.promise]));
  }

  async release(key) {
    const index = this.batches.findIndex(batch => batch.key === key);
    if (index < 0) return;
    const batch = this.batches[index];
    batch.controller.abort(cancelled());
    for (const job of batch.jobs) if (!job.started) job.reject(cancelled());
    await Promise.allSettled([...this.active].filter(work => work.batch === batch).map(work => work.promise));
    batch.jobs = [];
    this.current = index + 1;
    this.pump();
  }

  close() {
    if (this.closing) return this.closing;
    this.closed = true;
    for (const batch of this.batches) {
      batch.controller.abort(cancelled());
      for (const job of batch.jobs) if (!job.started) job.reject(cancelled());
    }
    this.closing = Promise.allSettled([...this.active].map(work => work.promise)).then(() => {
      for (const batch of this.batches) batch.jobs = [];
    });
    return this.closing;
  }
}
