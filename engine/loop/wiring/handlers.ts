/** @brief Jahit state loop ke modul engine (critic/eval). @since 0.1.0 */
import { LoopState, LoopEvent, gatePass } from '../states';
import { aggregate, type Critique } from '../../critic/aggregate';
import { gate } from '../../eval/gate';
import type { LoopContext } from './context';
import type { StateHandler } from '../driver';

/** @brief Dependensi injeksi untuk state LLM-dependent + ambang. @since 0.1.0 */
export interface LoopDeps {
  /** @brief Normalisasi goal (INTAKE). */
  ingest: (goal: string) => string;
  /** @brief Buat rencana dari goal (PLAN). */
  plan: (goal: string) => string;
  /** @brief Generate kode dari rencana (EXECUTE). */
  generate: (plan: string) => string;
  /** @brief Jalankan critic plant pada kode (CRITIQUE). */
  critique: (code: string) => Critique[];
  /** @brief Kompres kode hasil EXECUTE agar muat context window (opsional). */
  compress?: (code: string) => string;
  /** @brief Ambang Pareto layak-commit (EVALUATE). */
  paretoThreshold: number;
}

/** @brief Bangun handler tiap state yang menutup ctx + deps.
 * @param {LoopContext} ctx - akumulator loop (dimutasi per-state).
 * @param {LoopDeps} deps - injeksi LLM-dependent + ambang.
 * @return {Partial<Record<LoopState, StateHandler>>} handler tiap state aktif.
 * @see docs/design/loop.md
 * @since 0.1.0 */
export function buildHandlers(ctx: LoopContext, deps: LoopDeps): Partial<Record<LoopState, StateHandler>> {
  return {
    [LoopState.INTAKE]: () => {
      ctx.goal = deps.ingest(ctx.goal);
      return LoopEvent.GOAL_READY;
    },
    [LoopState.PLAN]: () => {
      ctx.plan = deps.plan(ctx.goal);
      return LoopEvent.PLAN_OK;
    },
    [LoopState.ISOLATE]: () => LoopEvent.ISOLATED,
    [LoopState.EXECUTE]: () => {
      const raw = deps.generate(ctx.plan ?? '');
      ctx.code = deps.compress ? deps.compress(raw) : raw;
      return LoopEvent.EXECUTED;
    },
    [LoopState.CRITIQUE]: () => {
      ctx.critiques = deps.critique(ctx.code ?? '');
      ctx.aggregate = aggregate(ctx.critiques, deps.paretoThreshold);
      return LoopEvent.CRITIQUED;
    },
    [LoopState.EVALUATE]: () => {
      ctx.eval = gate({ score: ctx.aggregate?.score ?? 0, criteria: [], blockers: [] });
      const ok = gatePass(LoopState.EVALUATE, {
        paretoScore: ctx.aggregate?.score ?? 0,
        paretoThreshold: deps.paretoThreshold,
        qualityGateGreen: ctx.eval.passed,
      });
      return ok ? LoopEvent.GATE_PASS : LoopEvent.GATE_FAIL;
    },
    [LoopState.RECOVER]: () => LoopEvent.RECOVERED,
    [LoopState.COMMIT]: () => LoopEvent.COMMITTED,
    [LoopState.PR_OPEN]: () => LoopEvent.PR_OPENED,
    [LoopState.CI_WATCH]: () => (deps.ciGreen() ? LoopEvent.CI_GREEN : LoopEvent.CI_RED),
  };
}
