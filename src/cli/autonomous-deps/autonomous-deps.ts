/**
 * @brief Factory deps LoopDeps autonomous: tambah isolate/commit/prOpen/eval saat ZHI_AUTO_PR=1.
 * Tanpa env var, return base (offline mode).
 * @param {LoopDeps} base - deps offline pembuka.
 * @param {string} goal - goal loop untuk pesan commit + isolate path.
 * @return {LoopDeps} deps enriched (atau base bila env var absent).
 * @since 0.1.2
 */
import type { LoopDeps } from '../../../engine/loop/wiring/handlers';
import { gitIsolate, gitCommit, ghPrOpen, ghCiWatch } from '../../../engine/loop/wiring/git';
import { evaluate } from '../../../engine/eval/index';

/** @brief Aktifkan git/gh nyata bila ZHI_AUTO_PR=1. @param {LoopDeps} base @param {string} goal @return {LoopDeps} */
export function autonomousDeps(base: LoopDeps, goal: string): LoopDeps {
  if (process.env['ZHI_AUTO_PR'] !== '1') {
    return base;
  }
  return {
    ...base,
    isolate: () => gitIsolate(goal),
    commit: (wt) => gitCommit(wt, 'chore: autoloop generated changes'),
    prOpen: (wt, t, b) => ghPrOpen(wt, t, b),
    eval: (wt) => evaluate(wt) as unknown as import('../../../engine/eval/gate').EvalOutput,
    ciWatch: () => ghCiWatch(),
  };
}
