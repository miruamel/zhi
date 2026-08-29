#!/usr/bin/env bun
/** @brief Entry CLI Zhi: argv -> boot loop otonom. @since 0.1.0 */
import { LoopDriver } from '../engine/loop/driver';
import { parseGoal } from '../engine/orch/parse';
import { buildDag } from '../engine/orch/dag';
import { allocate, schedule } from '../engine/orch/schedule';
import { generate as scaffold } from '../engine/build/generate';
import { verify } from '../engine/build/verify';
import { compress } from '../engine/build/context/compress';
import { buildHandlers, type LoopDeps } from '../engine/loop/wiring/handlers';
import { gitIsolate, ghPrOpen, ghCiWatch } from '../engine/loop/wiring/git';
import { composeCritiques } from '../engine/critic/plant/compose';
// ponytail: PLAN + EXECUTE nyata (orch + engine/build scaffolder).
// CI_WATCH opsional: tanpa ciWatch -> loop anggap green (mode offline, aman untuk
// test/smoke). Mode autonom (buka PR + pantau CI) aktif bila env ZHI_AUTO_PR=1;
// adapter git/gh di engine/loop/wiring/git.ts (deterministik, egress-aware).
/** @brief Derivasi identifier simbol dari plan (token pertama). @since 0.1.0 */
function planSymbol(plan: string): string {
  const head = plan.split(/[\s>]+/)[0] ?? '';
  const cleaned = head.replace(/[^a-zA-Z0-9_]/g, '');
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : 'main';
}
function offlineDeps(threshold: number): LoopDeps {
  return {
    ingest: (g) => g.trim(),
    plan: (g) => {
      const dag = buildDag(parseGoal(g));
      const alloc = allocate(dag, 1000);
      return schedule(dag, alloc)
        .map((s) => s.label)
        .join(' -> ');
    },
    generate: (p) => {
      const files = scaffold({ domain: planSymbol(p) });
      const report = verify(files);
      const body = files.map((f) => `// ${f.path}\n${f.content}`).join('\n');
      const verdict = report.ok
        ? '// verify: ok'
        : `// verify: FAIL\n${report.violations.map((v) => `//   - ${v}`).join('\n')}`;
      return `${body}\n${verdict}`;
    },
    critique: (code) => composeCritiques([{ path: 'generated.ts', content: code }]),
    compress: (code) =>
      compress({ entries: [{ key: 'code', weight: 1, text: code }], budget: 20000 }).entries[0]?.text ?? '',
    paretoThreshold: threshold,
  };
}
/** @brief Deeps otonom (git/gh nyata) bila ZHI_AUTO_PR=1; else offline. @since 0.1.0 */
function autonomousDeps(base: LoopDeps, goal: string): LoopDeps {
  if (process.env.ZHI_AUTO_PR !== '1') return base;
  return {
    ...base,
    isolate: () => gitIsolate(goal),
    prOpen: (title, body) => ghPrOpen(title, body),
    ciWatch: () => ghCiWatch(),
  };
}

/** @brief Parse argv: goal (arg non-flag) + --threshold=N. @since 0.1.0 */
export function parseArgs(argv: string[]): { goal: string; threshold: number } {
  const goal = argv.find((a) => !a.startsWith('--')) ?? '';
  const thr = argv.find((a) => a.startsWith('--threshold='));
  const parsed = thr ? Number(thr.split('=')[1]) : 0.8;
  return { goal, threshold: Number.isFinite(parsed) ? parsed : 0.8 };
}

/** @brief Jalankan satu siklus loop dari goal CLI.
 * @param {string[]} argv - argumen baris perintah.
 * @return {Promise<LoopContext>} konteks akhir loop (sampai DONE).
 * @since 0.1.0 */
export async function main(argv: string[]): Promise<LoopContext> {
  const { goal, threshold } = parseArgs(argv);
  if (!goal) throw new Error('cli: goal kosong');
  const ctx: LoopContext = { goal };
  const driver = new LoopDriver();
  await driver.run(buildHandlers(ctx, autonomousDeps(offlineDeps(threshold), ctx.goal)));
  return ctx;
}

// ponytail: jalankan hanya bila dieksekusi langsung (bukan saat diimpor test).
if (import.meta.main) {
  main(process.argv.slice(2))
    .then((ctx) => console.log(JSON.stringify({ goal: ctx.goal, plan: ctx.plan, code: ctx.code, score: ctx.aggregate?.score }, null, 2)))
    .catch((e) => {
      console.error(String(e));
      process.exit(1);
    });
}
