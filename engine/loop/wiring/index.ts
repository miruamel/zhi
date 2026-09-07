/**
 * @fileoverview Loop wiring — composes handlers, context, and DLQ into a runnable loop. @since 0.2.6
 * @package zhi
 */
import type { LoopState, LoopEvent } from '../states';
import type { LoopStep, StepResult } from '../types';
import {
  createWiringContext,
  budgetOk,
  allDone,
  anyFailed,
  countByStatus,
  progressPct,
} from './context';
import { isDlq, classifyError } from './handlers/is-dlq';

/** @brief Wiring result. @since 0.2.6 */
export interface WiringResult {
  event: LoopEvent;
  ok: boolean;
  reason?: string;
}

/** @brief Wire a step through the loop. @since 0.2.6 */
export function wireStep(step: LoopStep, result: StepResult, maxRetries = 3): WiringResult {
  const dlq = isDlq(step, result, maxRetries);
  if (dlq.action === 'retry') {
    step.retryCount = (step.retryCount ?? 0) + 1;
    return { event: 'retry' as LoopEvent, ok: true, reason: dlq.reason };
  }
  if (dlq.action === 'quarantine') {
    return { event: 'fail' as LoopEvent, ok: true, reason: dlq.reason };
  }
  return { event: 'complete' as LoopEvent, ok: true, reason: dlq.reason };
}

/** @brief Evaluate loop health. @since 0.2.6 */
export function evaluateHealth(
  steps: LoopStep[],
  results: StepResult[],
  tokensUsed: number,
  tokensBudget: number,
  startedAt: number,
): {
  progress: number;
  done: boolean;
  failed: boolean;
  budgetOk: boolean;
  counts: Record<string, number>;
  elapsedMs: number;
} {
  const ctx = createWiringContext(
    'running' as LoopState,
    steps,
    results,
    tokensUsed,
    tokensBudget,
    startedAt,
    () => true,
    () => {},
  );
  return {
    progress: progressPct(ctx),
    done: allDone(ctx),
    failed: anyFailed(ctx),
    budgetOk: budgetOk(ctx),
    counts: countByStatus(ctx),
    elapsedMs: ctx.elapsedMs,
  };
}

/** @brief Classify error for recovery routing. @since 0.2.6 */
export { classifyError };

/** @brief Create a wiring helper. @since 0.2.6 */
export function createWiring(maxRetries?: number) {
  return {
    wire: (step: LoopStep, result: StepResult) => wireStep(step, result, maxRetries),
    health: (
      steps: LoopStep[],
      results: StepResult[],
      tokensUsed: number,
      tokensBudget: number,
      startedAt: number,
    ) => evaluateHealth(steps, results, tokensUsed, tokensBudget, startedAt),
  };
}
