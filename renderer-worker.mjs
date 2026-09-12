// This entrypoint is copied into the execution image, never run by the web app.
import { capabilities, render, thumbnail } from './lib/renderer-runtime.mjs';
import { configureWorkerCpuAffinity } from './lib/worker-cpu-affinity.mjs';
let size = 0;
const chunks = [];
try {
  await configureWorkerCpuAffinity(process.argv[3], process.argv[2]);
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 64 * 1024 ** 2) throw new Error('Worker request is too large.');
    chunks.push(chunk);
  }
  const { action, body } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (action === 'health') process.stdout.write(JSON.stringify({ capabilities: await capabilities({ probe: true }) }));
  else if (action === 'render' || action === 'thumbnail') {
    const bytes = action === 'render' ? await render(body) : await thumbnail(body);
    process.stdout.write(JSON.stringify({ base64: bytes.toString('base64') }));
  } else throw new Error('Unsupported worker action.');
} catch (error) {
  process.stdout.write(JSON.stringify({ error: String(error.message || error).slice(0, 4000) }));
  process.exitCode = 1;
}
