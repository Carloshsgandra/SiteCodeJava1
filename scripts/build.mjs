import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'server'), { recursive: true });
await mkdir(resolve(dist, '.openai'), { recursive: true });
await cp(resolve(root, 'assets'), resolve(dist, 'assets'), { recursive: true });
await cp(resolve(root, 'index.html'), resolve(dist, 'index.html'));
await cp(resolve(root, 'sw.js'), resolve(dist, 'sw.js'));
await cp(resolve(root, 'worker.js'), resolve(dist, 'server/index.js'));

try {
  const hosting = JSON.parse(await readFile(resolve(root, '.openai/hosting.json'), 'utf8'));
  await writeFile(resolve(dist, '.openai/hosting.json'), JSON.stringify(hosting, null, 2));
} catch {
  await writeFile(resolve(dist, '.openai/hosting.json'), '{}\n');
}

console.log('Build concluído em dist/.');
