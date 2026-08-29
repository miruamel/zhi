/** @brief Cek circular dependency + deep relative import (mandate §6.10, §6.11, §6.14). @since 0.1.0 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';

const ROOT = resolve(import.meta.dir, '..', '..', '..');
const CODE_EXT = new Set(['.ts', '.js', '.zig']);
const SKIP = new Set(['.git', 'node_modules', 'out']);

/** @brief Kumpulkan file kode produksi di engine/, src/, native/. @return {string[]} abs path */
function collect(): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name)) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (CODE_EXT.has(full.slice(full.lastIndexOf('.')))) out.push(full);
    }
  };
  for (const top of ['engine', 'src', 'native']) {
    const p = join(ROOT, top);
    if (statSync(p, { throwIfNoEntry: false })) walk(p);
  }
  return out;
}

/** @brief Parse specifier import relatif dari isi file. @param {string} src @return {string[]} specifier */
function specs(src: string): string[] {
  const re = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|@import\(\s*['"]([^'"]+)['"]\s*\)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) out.push(m[1] ?? m[2] ?? m[3] ?? '');
  return out;
}

/** @brief Resolve specifier ke abs path repo, atau null bila eksternal. @param {string} file @param {string} spec @return {string|null} */
function resolveSpec(file: string, spec: string): string | null {
  if (!spec.startsWith('.') && !spec.startsWith('engine/') && !spec.startsWith('src/')) return null;
  const base = spec.startsWith('.') ? dirname(file) : ROOT;
  const rel = spec.startsWith('.') ? spec : spec;
  const abs = resolve(base, rel);
  return statSync(abs, { throwIfNoEntry: false }) ? abs : null;
}

const files = collect();
const graph = new Map<string, string[]>();
const deep: string[] = [];
for (const f of files) {
  const deps: string[] = [];
  for (const s of specs(readFileSync(f, 'utf8'))) {
    const abs = resolveSpec(f, s);
    if (!abs) continue;
    deps.push(abs);
    const ups = (s.match(/\.\.\//g) ?? []).length;
    if (ups > 3) deep.push(`${f.replace(ROOT + '/', '')} -> ${s} (${ups} naik)`);
  }
  graph.set(f, deps);
}

// DFS detect siklus
const WHITE = 0, GRAY = 1, BLACK = 2;
const color = new Map<string, number>();
const cycles: string[] = [];
const stack: string[] = [];
const dfs = (n: string): void => {
  color.set(n, GRAY);
  stack.push(n);
  for (const d of graph.get(n) ?? []) {
    if (color.get(d) === GRAY) {
      const i = stack.indexOf(d);
      cycles.push(stack.slice(i).concat(d).map((p) => p.replace(ROOT + '/', '')).join(' -> '));
    } else if (color.get(d) === WHITE) dfs(d);
  }
  stack.pop();
  color.set(n, BLACK);
};
for (const f of files) if (color.get(f) === WHITE) dfs(f);

let bad = 0;
if (cycles.length) { bad = 1; console.log('CIRCULAR DEPENDENCY:'); cycles.forEach((c) => console.log('  ' + c)); }
else console.log('ok: 0 circular dependency');
if (deep.length) { bad = 1; console.log('DEEP RELATIVE IMPORT (>3 naik):'); deep.forEach((d) => console.log('  ' + d)); }
else console.log('ok: 0 deep relative import');

process.exit(bad);
