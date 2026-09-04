/**
 * @brief Build TypeScript sources ke dist/ untuk publish npm.
 * Pakai tsconfig.build.json (noEmit=false, declaration=true).
 * @since 0.1.1
 */
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
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
// Copy Zig WASM ke dist/ agar zigBridge.ts (relative path ../../native/out/stream.wasm)
// tetap berfungsi di package terpublish. Tanpa langkah ini, readFileSync selalu throws
// dan WASM hot path tidak pernah dijalankan (hanya fallback TS).
mkdirSync('./dist/native/out', { recursive: true });
copyFileSync('./native/out/stream.wasm', './dist/native/out/stream.wasm');
console.log('[build] copied native/out/stream.wasm -> dist/native/out/stream.wasm');

console.log(`[build] ok: dist/ siap untuk publish`);
