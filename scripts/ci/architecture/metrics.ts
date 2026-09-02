/**
 * @brief Compute §6.14 architecture metrics for /root/zhi.
 * @detail Walks code roots (src, engine, native, scripts) for ts/js/zig files,
 *   excluding node_modules/.git and ADR-allowlisted doc roots. Reports SLOC
 *   (non-blank, non-comment), depth, files-per-dir, god/flat counts.
 *   Circular/skipped/deep-relative are covered by check-circular.ts.
 * @usage bun scripts/ci/architecture/metrics.ts
 */

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.zig']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'audit-log', 'docs']);

interface FileStat {
  path: string;
  sloc: number;
  depth: number;
}

function isComment(line: string, ext: string): boolean {
  const t = line.trimStart();
  if (t.length === 0) return true;
  if (ext === '.zig') return t.startsWith('//');
  return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*');
}

function countSloc(p: string): number {
  const ext = p.slice(p.lastIndexOf('.'));
  const lines = readFileSync(p, 'utf8').split('\n');
  let n = 0;
  for (const l of lines) if (!isComment(l, ext)) n++;
  return n;
}

function walk(dir: string, out: FileStat[]): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (CODE_EXT.has(entry.slice(entry.lastIndexOf('.')))) {
      const rel = relative(ROOT, full);
      out.push({ path: rel, sloc: countSloc(full), depth: rel.split('/').length });
    }
  }
}

const files: FileStat[] = [];
walk(ROOT, files);

const slocVals = files.map((f) => f.sloc);
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const maxFile = files.reduce((m, f) => (f.sloc > m.sloc ? f : m), files[0]);
const godFiles = files.filter((f) => f.sloc > 200);
const depths = files.map((f) => f.depth);
const dirCounts = new Map<string, number>();
for (const f of files) {
  const d = f.path.split('/').slice(0, -1).join('/') || '.';
  dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1);
}
const fatDirs = [...dirCounts.entries()].filter(([, c]) => c > 5).sort((a, b) => b[1] - a[1]);

console.log(
  JSON.stringify(
    {
      codeFiles: files.length,
      sloc: { avg: +avg(slocVals).toFixed(1), max: Math.max(...slocVals), maxFile: maxFile?.path },
      godFiles: godFiles.map((f) => f.path),
      depth: { min: Math.min(...depths), max: Math.max(...depths), avg: +avg(depths).toFixed(1) },
      fatDirs: fatDirs.map(([d, c]) => [d, c]),
      note: 'circular/skipped/deep-relative covered by check-circular.ts',
    },
    null,
    2,
  ),
);
