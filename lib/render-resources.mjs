const GIB = 1024 ** 3;

export function localVmResources(cpuCount, totalBytes) {
  const cpus = Math.max(1, Math.floor(Number(cpuCount) || 1));
  const memory = Math.max(1, Math.floor(Number(totalBytes) / GIB || 1));
  return { cpus: Math.max(1, cpus - Math.max(1, Math.ceil(cpus / 3))), memory: Math.max(1, Math.floor(memory / 2)) };
}

export function workerCapacity(info, { cpus = 1, memory = '1g' } = {}) {
  const match = String(memory).match(/^(\d+)([mg])$/i);
  const bytes = match ? Number(match[1]) * (match[2].toLowerCase() === 'g' ? GIB : 1024 ** 2) : GIB;
  const availableBytes = Math.max(0, Number(info.MemTotal) || 0);
  const reserve = Math.max(GIB, availableBytes * .15);
  return Math.max(1, Math.min(8,
    Math.floor((Number(info.NCPU) || 1) / Math.max(.1, Number(cpus) || 2)),
    Math.floor((availableBytes - reserve) / bytes)));
}
