// Test-only Docker protocol transport. Exercises real worker rendering locally;
// it does NOT provide or test OS isolation. Production never imports this file.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function localWorkerTransport(openscad) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-test-transport-'));
  const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const config = { root, worker: path.join(project, 'renderer-worker.mjs'), openscad: openscad || process.env.OPENSCAD_BIN || path.join(project, 'tests/fixtures/modern-openscad-shim'), fonts: path.join(project, 'fonts') };
  const command = path.join(root, 'docker-test');
  await fs.writeFile(command, `#!${process.execPath}
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
const config = ${JSON.stringify(config)};
const args = process.argv.slice(2);
if (args[0] === 'image') process.stdout.write(JSON.stringify({Id:'sha256:'+'a'.repeat(64),Config:{Labels:{'io.pmm.disposable-worker':'1'}}}));
else if (args[0] === 'ps') {}
else if (args[0] === 'create') {
  const name = args[args.indexOf('--name')+1];
  await fs.mkdir(path.join(config.root, name));
  process.stdout.write(name);
} else if (args[0] === 'start') {
  const dir = path.join(config.root, args.at(-1));
  const child = spawn(process.execPath, [config.worker], { env: {PATH:process.env.PATH,HOME:dir,TMPDIR:dir,PMM_JOB_ROOT:dir,OPENSCAD_BIN:config.openscad,CUSTOM_FONT_DIR:config.fonts}, stdio:['pipe','inherit','inherit'] });
  await fs.writeFile(path.join(dir, 'pid'), String(child.pid));
  process.stdin.pipe(child.stdin);
  child.stdin.on('error', () => {});
  child.on('close', code => { process.exitCode = code || 0; });
} else if (args[0] === 'rm') {
  const dir = path.join(config.root, args.at(-1));
  try { process.kill(Number(await fs.readFile(path.join(dir,'pid'),'utf8')), 'SIGKILL'); } catch {}
  await fs.rm(dir, {recursive:true,force:true});
} else process.exitCode = 1;
`, { mode: 0o700 });
  return { command, close: () => fs.rm(root, { recursive: true, force: true }) };
}
