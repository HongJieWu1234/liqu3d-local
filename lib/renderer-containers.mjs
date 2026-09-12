import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { decodeBase64 } from './instant-archive.mjs';
import { validateRendererOutput } from './renderer-output.mjs';
import { RenderScheduler } from './render-scheduler.mjs';

export function containerArguments(name, config) {
  return ['create', '--name', name, '--label', `io.pmm.worker-scope=${config.scope}`, '--interactive', '--init', '--pull', 'never',
    '--network', 'none', '--user', '10000:10000', '--read-only', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges:true',
    '--pids-limit', '128', '--memory', config.memory, '--memory-swap', config.memory, '--cpus', config.cpus,
    '--ulimit', 'nofile=1024:1024', '--ulimit', 'core=0:0', '--log-driver', 'none', '--restart', 'no',
    '--tmpfs', '/job:rw,noexec,nosuid,nodev,size=1g,uid=10000,gid=10000,mode=0700',
    '--tmpfs', '/tmp:rw,noexec,nosuid,nodev,size=256m,uid=10000,gid=10000,mode=1777',
    ...(config.fontVolume ? ['--mount', `type=volume,src=${config.fontVolume},dst=/fonts/custom,readonly,volume-nocopy`] : []),
    '--workdir', '/job', '--entrypoint', '/usr/bin/timeout', config.image,
    '--signal=KILL', '610s', '/usr/local/bin/node', '/runtime/renderer-worker.mjs', String(config.cpuSlot ?? 0), config.cpus];
}

// Only this trusted manager gets the Docker socket. Requests never choose an
// image, command, environment, volume, container name or runtime options.
export class ContainerRenderer {
  constructor({ command = process.env.PMM_DOCKER_BIN || 'docker', image = process.env.PMM_WORKER_IMAGE || 'scad-maker-worker:v1',
    scope = process.env.PMM_WORKER_SCOPE || 'pmm', memory = process.env.PMM_WORKER_MEMORY || '1g', cpus = process.env.PMM_WORKER_CPUS || '1',
    timeout = Number(process.env.OPENSCAD_RENDER_TIMEOUT_MS) || 120000, maxOutput = Number(process.env.PMM_RENDERER_MAX_OUTPUT_MB || 64) * 1024 ** 2,
    maxJobs = Number(process.env.PMM_WORKER_MAX_JOBS || 2), maxQueued = 8, fontVolume = process.env.PMM_WORKER_FONT_VOLUME || '',
    dockerHost = process.env.PMM_DOCKER_HOST || '', execute } = {}) {
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(scope) || fontVolume && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(fontVolume) || !/^\d+[mg]$/i.test(memory) || !(Number(cpus) > 0 && Number(cpus) <= 32) || !Number.isInteger(maxJobs) || maxJobs < 1 || maxJobs > 8) throw new Error('Invalid worker resource configuration.');
    this.command = command; this.config = { image, scope, memory, fontVolume, cpus: String(cpus) };
    if (dockerHost && !/^unix:\/\/\/[^\u0000-\u001f]+$/.test(dockerHost)) throw new Error('PMM_DOCKER_HOST must identify a local Unix socket.');
    this.dockerHost = dockerHost;
    if (!Number.isFinite(timeout) || !Number.isFinite(maxOutput) || !Number.isInteger(maxQueued) || maxQueued < 1 || maxQueued > 8) throw new Error('Invalid worker timeout, output or queue limit.');
    this.timeout = Math.max(1000, Math.min(600000, timeout));
    this.maxOutput = Math.max(1024, Math.min(256 * 1024 ** 2, maxOutput));
    this.maxJobs = maxJobs; this.active = new Map(); this.closing = false;
    this.cpuSlots = new Set();
    this.scheduler = new RenderScheduler({ concurrency: maxJobs, maxQueued });
    this.execute = execute || this.runCommand.bind(this);
  }
  get cacheIdentity() {
    // Image contents are immutable; an attached font volume can change live.
    return !this.config.fontVolume && /^sha256:[a-f0-9]{64}$/.test(this.config.image) ? this.config.image : null;
  }
  runCommand(args, { input, signal, limit = 65536, timeout = 15000 } = {}) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(signal.reason);
      // Allow only the local daemon socket and CLI search path, without server credentials.
      const child = spawn(this.command, args, { env: { PATH: process.env.PATH, HOME: '/tmp', ...(this.dockerHost ? { DOCKER_HOST: this.dockerHost } : {}) }, stdio: ['pipe', 'pipe', 'pipe'] });
      let size = 0, stderr = '', failure; const chunks = [];
      const stop = error => { failure ||= error; child.kill('SIGKILL'); };
      const onAbort = () => stop(signal.reason || new Error('Generation cancelled.'));
      signal?.addEventListener('abort', onAbort, { once: true });
      const timer = setTimeout(() => stop(new Error('Container operation timed out.')), timeout);
      child.stdout.on('data', chunk => {
        size += chunk.length;
        if (size > limit) stop(new Error('Worker output exceeds the size limit.'));
        else chunks.push(chunk);
      });
      child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-4000); });
      child.stdin.on('error', error => { if (error.code !== 'EPIPE') stop(error); });
      child.once('error', error => { failure = error; });
      child.once('close', code => {
        clearTimeout(timer); signal?.removeEventListener('abort', onAbort);
        if (failure) return reject(failure);
        // Worker failures carry a bounded JSON error on stdout.
        if (code !== 0 && args[0] !== 'start') return reject(new Error(stderr || `Container operation failed (${code}).`));
        resolve(Buffer.concat(chunks));
      });
      child.stdin.end(input);
    });
  }
  async initialize() {
    const info = JSON.parse((await this.execute(['image', 'inspect', '--format', '{{json .}}', this.config.image])).toString());
    if (!/^sha256:[a-f0-9]{64}$/.test(info.Id) || Object.keys(info.Config?.Volumes || {}).length || info.Config?.Labels?.['io.pmm.disposable-worker'] !== '1') throw new Error('Build the approved disposable worker image before starting the renderer.');
    this.config.image = info.Id;
    // One manager owns each scope. Reclaim containers left by an interrupted
    // manager before accepting jobs; each also has an independent hard deadline.
    const ids = (await this.execute(['ps', '-aq', '--filter', `label=io.pmm.worker-scope=${this.config.scope}`])).toString().trim().split(/\s+/).filter(Boolean);
    for (const id of ids) {
      if (!/^[a-f0-9]{12,64}$/.test(id)) throw new Error('Invalid orphan container identifier.');
      await this.execute(['rm', '--force', id]);
    }
  }
  async run(action, body = {}, signal) {
    if (this.closing) throw new Error('Renderer is shutting down.');
    if (signal?.aborted) throw signal.reason || new Error('Generation cancelled.');
    const name = `pmm-${this.config.scope}-${randomUUID()}`, controller = new AbortController();
    const onAbort = () => controller.abort(signal.reason || new Error('Generation cancelled.'));
    signal?.addEventListener('abort', onAbort, { once: true });
    const timer = setTimeout(() => controller.abort(new Error('Rendering timed out.')), this.timeout);
    let finish, release, cpuSlot, createAttempted = false;
    this.active.set(name, { controller, done: new Promise(resolve => { finish = resolve; }) });
    try {
      try { release = await this.scheduler.acquire({ signal: controller.signal, priority: action === 'thumbnail' ? 1 : 0 }); }
      catch (error) { if (error.code === 'SERVER_BUSY') error.status = 429; throw controller.signal.reason || error; }
      if (this.closing || controller.signal.aborted) throw controller.signal.reason || new Error('Renderer is shutting down.');
      cpuSlot = 0;
      while (this.cpuSlots.has(cpuSlot)) cpuSlot++;
      this.cpuSlots.add(cpuSlot);
      createAttempted = true;
      await this.execute(containerArguments(name, { ...this.config, cpuSlot }), { signal: controller.signal });
      const raw = await this.execute(['start', '--attach', '--interactive', name], {
        input: JSON.stringify({ action, body }), signal: controller.signal, timeout: this.timeout,
        limit: action === 'health' ? 65536 : Math.ceil(this.maxOutput / 3) * 4 + 8192
      });
      if (controller.signal.aborted) throw controller.signal.reason;
      const result = JSON.parse(raw.toString('utf8'));
      if (result.error) throw Object.assign(new Error(String(result.error).slice(0, 4000)), { status: 422 });
      if (action === 'health') {
        if (!result.capabilities || typeof result.capabilities.ready !== 'boolean') throw new Error('Invalid worker health response.');
        return { ...result.capabilities, renderSlots: this.maxJobs, isolation: 'disposable-container-v1', renderCacheIdentity: this.cacheIdentity };
      }
      return validateRendererOutput(decodeBase64(result.base64, this.maxOutput), action === 'thumbnail' ? 'webp' : body.format || 'stl', { maxBytes: this.maxOutput, allowEmpty: Boolean(body.allowEmpty) });
    } finally {
      clearTimeout(timer); signal?.removeEventListener('abort', onAbort);
      try { if (createAttempted) await this.execute(['rm', '--force', name]); }
      catch (error) { this.closing = true; throw new Error(`Worker cleanup failed; renderer stopped accepting jobs: ${error.message}`); }
      finally { this.active.delete(name); this.cpuSlots.delete(cpuSlot); release?.(); finish(); }
    }
  }
  async shutdown() {
    this.closing = true;
    const jobs = [...this.active.values()];
    for (const job of jobs) job.controller.abort(new Error('Renderer is shutting down.'));
    await Promise.allSettled(jobs.map(job => job.done));
  }
}
