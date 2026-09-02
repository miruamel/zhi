/** @brief Jahit state loop ke modul engine (critic/eval). @since 0.1.0 */
import { LoopState, LoopEvent, gatePass } from '../states';
import { aggregate, type Critique } from '../../critic/aggregate';
import { gate, type EvalOutput } from '../../eval/gate';
import { classifyError, withResilience, CircuitBreaker, type DLQEntry } from '../../resil';
import type { LoopContext } from './context';
import { branchSlug } from './git';
import type { StateHandler } from '../driver';
import { LoopMetrics, timedStage } from '../observability/metrics';

/** @brief Batas retry recovery sebelum abort (selaras resil maxAttempts=3, ADR-003). @since 0.1.0 */
const MAX_RECOVER = 3;

/** @brief Batas retry generate per EXECUTE (selaras resil default). @since 0.1.0 */
const GENERATE_RETRY = 3;

/** @brief True bila hasil withResilience adalah DLQ (gagal definitif). @since 0.1.0 */
const isDLQ = (r: string | DLQEntry): r is DLQEntry =>
  typeof r === 'object' && r !== null && 'error' in r;

/** @brief Dependensi injeksi untuk state LLM-dependent + ambang. @since 0.1.0 */
export interface LoopDeps {
  /** @brief Normalisasi goal (INTAKE). */
  ingest: (goal: string) => string;
  /** @brief Buat rencana dari goal (PLAN). */
  plan: (goal: string) => string;
  /** @brief Generate kode dari rencana (EXECUTE). Bila worktree diberi, tulis file ke sana. */
  generate: (plan: string, worktree?: string) => Promise<string>;
  critique: (code: string) => Critique[];
  /** @brief Kompres kode hasil EXECUTE agar muat context window (opsional). */
  compress?: (code: string) => string;
  /** @brief Isolasi kerja ke git worktree terpisah (ISOLATE, opsional). @return {string} path worktree absolut. */
  isolate?: () => string;
  /** @brief Commit hasil EXECUTE di dalam worktree (COMMIT, opsional). */
  commit?: (worktree: string) => void;
  /** @brief Buka PR via gh dari dalam worktree (PR_OPEN, opsional). @return {string} URL PR. */
  prOpen?: (worktree: string, title: string, body: string) => string;
  ciWatch?: () => 'green' | 'red' | 'pending';
  /** @brief Evaluasi worktree (test + secret-scan) di EVALUATE (opsional). @return {EvalOutput} hasil gate. */
  eval?: (worktree: string) => EvalOutput;
  /** @brief Ambang Pareto layak-commit (EVALUATE). */
  paretoThreshold: number;
}

/** @brief Bangun handler tiap state yang menutup ctx + deps.
 * @param {LoopContext} ctx - akumulator loop (dimutasi per-state).
 * @param {LoopDeps} deps - injeksi LLM-dependent + ambang.
 * @return {Partial<Record<LoopState, StateHandler>>} handler tiap state aktif.
 * @see docs/design/loop.md
 * @since 0.1.0 */
export function buildHandlers(
  ctx: LoopContext,
  deps: LoopDeps,
  metrics?: LoopMetrics,
): Partial<Record<LoopState, StateHandler>> {
  const breaker = new CircuitBreaker({ windowSize: 5, openThreshold: 0.5 });
  const raw: Partial<Record<LoopState, StateHandler>> = {
    [LoopState.INTAKE]: () => {
      ctx.goal = deps.ingest(ctx.goal);
      return LoopEvent.GOAL_READY;
    },
    [LoopState.PLAN]: () => {
      ctx.plan = deps.plan(ctx.goal);
      return LoopEvent.PLAN_OK;
    },
    [LoopState.ISOLATE]: () => {
      if (deps.isolate) {
        ctx.worktree = deps.isolate();
        ctx.branch = branchSlug(ctx.goal);
      }
      return LoopEvent.ISOLATED;
    },
    [LoopState.EXECUTE]: async () => {
      const res = await withResilience(() => deps.generate(ctx.plan ?? '', ctx.worktree), {
        breaker,
        maxAttempts: GENERATE_RETRY,
      });
      if (isDLQ(res)) {
        ctx.error = `generate failed after ${GENERATE_RETRY} retry: ${res.error}`;
        return LoopEvent.BUDGET_OUT;
      }
      ctx.code = deps.compress ? deps.compress(res) : res;
      return LoopEvent.EXECUTED;
    },
    [LoopState.CRITIQUE]: () => {
      ctx.critiques = deps.critique(ctx.code ?? '');
      ctx.aggregate = aggregate(ctx.critiques, deps.paretoThreshold);
      return LoopEvent.CRITIQUED;
    },
    [LoopState.EVALUATE]: () => {
      ctx.eval =
        deps.eval && ctx.worktree
          ? deps.eval(ctx.worktree)
          : gate({ score: ctx.aggregate?.score ?? 0, criteria: [], blockers: [] });
      const ok = gatePass(LoopState.EVALUATE, {
        paretoScore: ctx.aggregate?.score ?? 0,
        paretoThreshold: deps.paretoThreshold,
        qualityGateGreen: ctx.eval.passed,
      });
      return ok ? LoopEvent.GATE_PASS : LoopEvent.GATE_FAIL;
    },
    [LoopState.RECOVER]: () => {
      ctx.attempts = (ctx.attempts ?? 0) + 1;
      const signal = [
        ctx.eval ? ctx.eval.reasons.join(' ') : '',
        ctx.aggregate ? `pareto ${ctx.aggregate.score} < ${deps.paretoThreshold}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
      const classified = classifyError(signal);
      const exhausted = ctx.attempts >= MAX_RECOVER;
      if (classified.fatal || exhausted) {
        ctx.error = classified.fatal
          ? `fatal: ${signal}`
          : `recover exhausted after ${ctx.attempts} attempt(s)`;
        return LoopEvent.BUDGET_OUT;
      }
      return LoopEvent.RECOVERED;
    },
    [LoopState.COMMIT]: () => {
      if (deps.commit && ctx.worktree) deps.commit(ctx.worktree);
      return LoopEvent.COMMITTED;
    },
    [LoopState.PR_OPEN]: () => {
      if (deps.prOpen && ctx.worktree)
        ctx.prUrl = deps.prOpen(ctx.worktree, ctx.goal ?? 'autoloop', ctx.plan ?? '');
      return LoopEvent.PR_OPENED;
    },
    [LoopState.CI_WATCH]: () => {
      const st = deps.ciWatch ? deps.ciWatch() : 'green';
      return st === 'green' ? LoopEvent.CI_GREEN : LoopEvent.CI_RED;
    },
  };
  if (!metrics) return raw;
  const wrapped: Partial<Record<LoopState, StateHandler>> = {};
  for (const k of Object.keys(raw) as LoopState[]) {
    const h = raw[k];
    if (h) wrapped[k] = timedStage(k, h, metrics);
  }
  return wrapped;
}
