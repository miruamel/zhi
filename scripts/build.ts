/**
 * @brief Build TypeScript sources ke dist/ untuk publish npm.
 * Pakai tsconfig.build.json (noEmit=false, declaration=true).
 * @since 0.1.1
 */
import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const project = './tsconfig.build.json';

console.log(`[build] rm -rf dist/`);
rmSync('./dist', { recursive: true, force: true });

console.log(`[build] bun x tsc -p ${project}`);
const r = spawnSync('bun', ['x', 'tsc', '-p', project], { stdio: 'inherit' });
if (r.status !== 0) {
  console.error(`[build] tsc gagal exit ${r.status}`);
  process.exit(r.status ?? 1);
}

console.log(`[build] ok: dist/ siap untuk publish`);
