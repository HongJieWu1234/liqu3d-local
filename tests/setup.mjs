import { fileURLToPath } from 'node:url';

// Test fixtures and subprocesses always resolve from the project, regardless of cwd.
export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
process.chdir(projectRoot);
