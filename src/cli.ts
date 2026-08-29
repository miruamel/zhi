#!/usr/bin/env bun
/** @brief Entry CLI Zhi: argv -> boot loop otonom. @since 0.1.0 */
import { LoopDriver } from '../engine/loop/driver';
import { buildHandlers, type LoopDeps } from '../engine/loop/wiring/handlers';
import type { LoopContext } from '../engine/loop/wiring/context';

// ponytail: stub offline deterministik. Upgrade: ganti dengan backend nyata
// (route() + client HTTP) bila env ZHI_LLM_ENDPOINT terisi. Saat ini generate/
// plan/critique hanya untuk smoke + verifikasi pipeline tanpa LLM.
function offlineDeps(threshold: number): LoopDeps {
  return {
    ingest: (g) => g.trim(),
    plan: (g) => `plan(${g})`,
    generate: (p) => `code(${p})`,
    critique: () => [{ name: 'security', score: 0.9, weight: 1, findings: [] }],
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
