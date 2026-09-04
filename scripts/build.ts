/**
 * @brief Build TypeScript sources ke dist/ untuk publish npm.
 * Pakai tsconfig.build.json (noEmit=false, declaration=true).
 * @since 0.1.1
 */
import { rmSync, mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
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

console.log('[build] copy native/out/stream.wasm -> dist/native/out/stream.wasm');
const wasmSrc = join(process.cwd(), 'native', 'out', 'stream.wasm');
const wasmDst = join(process.cwd(), 'dist', 'native', 'out', 'stream.wasm');
mkdirSync(dirname(wasmDst), { recursive: true });
if (existsSync(wasmSrc)) {
  copyFileSync(wasmSrc, wasmDst);
  console.log(`[build] ok: wasm copied (${statSync(wasmDst).size} bytes)`);
} else {
  console.warn(`[build] WARN: ${wasmSrc} not found — skipping wasm copy`);
}

console.log(`[build] ok: dist/ siap untuk publish`);
