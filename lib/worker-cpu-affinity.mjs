import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execute = promisify(execFile);

export function workerCpuList(allowed, count, slot) {
  if (!(Number(count) > 0 && Number(count) <= 32) || !Number.isInteger(Number(slot)) || Number(slot) < 0 || Number(slot) > 7) return null;
  if (!/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/.test(allowed)) return null;
  const cpus = [];
  for (const range of allowed.split(',')) {
    const [first, last = first] = range.split('-').map(Number);
    if (last < first || last > 65535 || last - first > 4096) return null;
    for (let cpu = first; cpu <= last; cpu++) cpus.push(cpu);
  }
  const width = Math.min(Math.ceil(Number(count)), cpus.length);
  const start = Number(slot) * width;
  return Array.from({ length: width }, (_, index) => cpus[(start + index) % cpus.length]).join(',');
}

export async function configureWorkerCpuAffinity(count, slot) {
  // Docker's quota remains the hard limit. Affinity prevents native thread
  // pools from spreading a one-core job over every CPU and wasting its quota.
  if (process.platform !== 'linux' || count === undefined || slot === undefined) return false;
  try {
    const status = await fs.readFile('/proc/self/status', 'utf8');
    const allowed = status.match(/^Cpus_allowed_list:\s*(.+)$/m)?.[1].trim();
    const cpus = workerCpuList(allowed || '', count, slot);
    if (!cpus) return false;
    await execute('/usr/bin/taskset', ['--all-tasks', '--pid', '--cpu-list', cpus, String(process.pid)], { timeout: 5000 });
    return true;
  } catch { return false; } // Older/local runtimes retain their enforced quota.
}
