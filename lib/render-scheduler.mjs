export function renderAbortError() {
  return Object.assign(new Error('Render cancelled.'), { name: 'AbortError', code: 'ABORT_ERR' });
}

function normalizedWeight(value, capacity) {
  const weight = Number(value);
  if (!Number.isFinite(weight)) return 1;
  return Math.max(1, Math.min(capacity, Math.ceil(weight)));
}

// Bound CPU/memory-heavy render work while giving waiting accounts preference
// over accounts already rendering. Weighted slots let lightweight previews share
// a machine while full-quality exports can reserve most of the render budget.
export class RenderScheduler {
  constructor({ concurrency, maxQueued }) {
    this.concurrency = Math.max(1, Math.floor(Number(concurrency) || 1));
    this.maxQueued = Math.max(1, Math.floor(Number(maxQueued) || 1));
    this.active = 0;
    this.activeWeight = 0;
    this.activeByOwner = new Map();
    this.queue = [];
  }

  setConcurrency(value) {
    const next = Math.max(1, Math.floor(Number(value) || 1));
    if (next === this.concurrency) return this.concurrency;
    this.concurrency = next;
    this.drain();
    return this.concurrency;
  }

  acquire({ signal, owner = 'background', priority = 0, weight = 1 } = {}) {
    if (signal?.aborted) return Promise.reject(renderAbortError());
    const normalized = normalizedWeight(weight, this.concurrency);
    const immediatelyFits = this.activeWeight + normalized <= this.concurrency;
    if (!immediatelyFits && this.queue.length >= this.maxQueued) {
      return Promise.reject(Object.assign(new Error('The render queue is full. Try again shortly.'), { code: 'SERVER_BUSY' }));
    }
    return new Promise((resolve, reject) => {
      const entry = { owner: String(owner), priority: Number(priority) || 0, weight: normalized, signal, resolve, reject };
      entry.onAbort = () => {
        const index = this.queue.indexOf(entry);
        if (index !== -1) this.queue.splice(index, 1);
        reject(renderAbortError());
      };
      signal?.addEventListener('abort', entry.onAbort, { once: true });
      this.queue.push(entry);
      this.drain();
    });
  }

  drain() {
    while (this.queue.length) {
      let next = -1;
      // Never let lower-priority lightweight work repeatedly jump ahead of a
      // waiting heavy export. If the highest-priority job does not fit yet,
      // let current work drain until it does.
      let highestPriority = Infinity;
      for (const entry of this.queue) if (entry.priority < highestPriority) highestPriority = entry.priority;
      for (let index = 0; index < this.queue.length; index += 1) {
        const candidate = this.queue[index];
        if (candidate.priority !== highestPriority) continue;
        if (this.activeWeight + candidate.weight > this.concurrency) continue;
        if (next === -1) { next = index; continue; }
        const selected = this.queue[next];
        const candidateOwnerLoad = this.activeByOwner.get(candidate.owner) || 0;
        const selectedOwnerLoad = this.activeByOwner.get(selected.owner) || 0;
        if (candidateOwnerLoad < selectedOwnerLoad) next = index;
      }
      if (next === -1) break;

      const entry = this.queue.splice(next, 1)[0];
      entry.signal?.removeEventListener('abort', entry.onAbort);
      if (entry.signal?.aborted) { entry.reject(renderAbortError()); continue; }
      this.active += 1;
      this.activeWeight += entry.weight;
      this.activeByOwner.set(entry.owner, (this.activeByOwner.get(entry.owner) || 0) + entry.weight);
      let released = false;
      entry.resolve(() => {
        if (released) return;
        released = true;
        this.active -= 1;
        this.activeWeight = Math.max(0, this.activeWeight - entry.weight);
        const remaining = (this.activeByOwner.get(entry.owner) || 0) - entry.weight;
        if (remaining > 0) this.activeByOwner.set(entry.owner, remaining);
        else this.activeByOwner.delete(entry.owner);
        this.drain();
      });
    }
  }
}

// Register before queueing: identical requests occupy one slot, even while waiting.
// One disconnected client must not cancel work still needed by another client.
export class SharedRenders {
  constructor() { this.jobs = new Map(); }

  run(key, execute, signal) {
    if (signal?.aborted) return Promise.reject(renderAbortError());
    let job = this.jobs.get(key);
    if (!job) {
      job = { controller: new AbortController(), subscribers: 0, settled: false };
      this.jobs.set(key, job);
      job.promise = Promise.resolve().then(() => {
        if (job.controller.signal.aborted) throw renderAbortError();
        return execute(job.controller.signal);
      }).finally(() => {
        job.settled = true;
        if (this.jobs.get(key) === job) this.jobs.delete(key);
      });
      job.promise.catch(() => {});
    }
    job.subscribers += 1;
    return new Promise((resolve, reject) => {
      let finished = false;
      const finish = (callback, value) => {
        if (finished) return;
        finished = true;
        signal?.removeEventListener('abort', onAbort);
        job.subscribers -= 1;
        callback(value);
        if (!job.subscribers && !job.settled) {
          if (this.jobs.get(key) === job) this.jobs.delete(key);
          job.controller.abort();
        }
      };
      const onAbort = () => finish(reject, renderAbortError());
      signal?.addEventListener('abort', onAbort, { once: true });
      job.promise.then((value) => finish(resolve, value), (error) => finish(reject, error));
    });
  }
}
