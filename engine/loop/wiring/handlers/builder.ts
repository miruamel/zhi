/**
 * @brief Bangun handler tiap state yang menutup ctx + deps.
 * @param {LoopContext} ctx - akumulator loop (dimutasi per-state).
 * @param {LoopDeps} deps - injeksi LLM-dependent + ambang.
 * @param {LoopMetrics} [metrics] - bila diberi, setiap handler dibungkus timedStage.
 * @return {Partial<Record<LoopState, StateHandler>>} handler tiap state aktif.
 * @see docs/design/loop.md
 * @since 0.1.2 */
import { aggregate } from '../../../critic/aggregate';
import { gate } from '../../../eval/gate';
import { classifyError, CircuitBreaker, withResilience } from '../../../resil';
import { LoopDriver, type StateHandler } from '../../driver';
import { LoopEvent, LoopState, gatePass } from '../../states';
import type { LoopContext } from '../context';
import { branchSlug } from '../git';
import { LoopMetrics, timedStage } from '../../observability/metrics';
import { GENERATE_RETRY, MAX_RECOVER, type LoopDeps } from './types';
import { isDLQ } from './is-dlq';

/**
 * @brief Build per-state handlers (INTAKE → DONE) with optional metrics wrapping.
 * @param {LoopContext} ctx - akumulator loop.
 * @param {LoopDeps} deps - deps injeksi.
 * @param {LoopMetrics} [metrics] - optional metrics wrapper.
 * @return {Partial<Record<LoopState, StateHandler>>} map state → handler.
 * @since 0.1.2
 */
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
          : gate(
              { score: ctx.aggregate?.score ?? 0, criteria: [], blockers: [] },
              deps.paretoThreshold,
            );
      const ok = gatePass(LoopState.EVALUATE, {
        paretoScore: ctx.aggregate?.score ?? 0,
        paretoThreshold: deps.paretoThreshold,
        qualityGateGreen: ctx.eval.passed,
      });
      return ok ? LoopEvent.GATE_PASS : LoopEvent.GATE_FAIL;
    },
    [LoopState.RECOVER]: () => {
      ctx.attempts = (ctx.attempts ?? 0) + 1;
      if (metrics) metrics.recoverAttempts = ctx.attempts;
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

// Re-export types untuk konsumer.
export type { LoopDeps } from './types';
export { MAX_RECOVER, GENERATE_RETRY } from './types';
// Silence unused import lint warning (LoopDriver imported via StateHandler type above).
export type { LoopDriver };
