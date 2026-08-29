#!/usr/bin/env bun
/** @brief Entry CLI Zhi: argv -> boot loop otonom. @since 0.1.0 */
import { LoopDriver } from '../engine/loop/driver';
import { parseGoal } from '../engine/orch/parse';
import { buildDag } from '../engine/orch/dag';
import { allocate, schedule } from '../engine/orch/schedule';
import { generate as genStub } from '../engine/build/generate';
import { buildHandlers, type LoopDeps } from '../engine/loop/wiring/handlers';
import { composeCritiques } from '../engine/critic/plant/compose';
import type { LoopContext } from '../engine/loop/wiring/context';
// ponytail: PLAN + EXECUTE sekarang nyata (orch + engine/build). generate/ciGreen
// masih stub deterministik (tanpa LLM/git/CI nyata). Upgrade: ganti generate dengan
// backend kode LLM (design/build.md) dan ciGreen dengan watcher CI bila env ZHI_LLM_ENDPOINT terisi.
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
    generate: (p) => genStub({ name: planSymbol(p), kind: 'function' }),
    critique: (code) => composeCritiques([{ path: 'generated.ts', content: code }]),
    ciGreen: () => true,
    paretoThreshold: threshold,
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
  await driver.run(buildHandlers(ctx, offlineDeps(threshold)));
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
