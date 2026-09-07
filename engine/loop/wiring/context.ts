/**
 * @fileoverview Loop wiring context — shared state and helpers for loop wiring. @since 0.2.6
 * @package zhi
 */
import type { LoopState, LoopEvent } from '../states';
import type { LoopStep, StepResult } from '../types';

/** @brief Re-export LoopContext from handlers/types. @since 0.1.2 */
export type { LoopContext } from './handlers/types';
/** @brief Wiring context. @since 0.2.6 */
export interface WiringContext {
  state: LoopState;
  step: LoopStep | null;
  steps: LoopStep[];
  results: StepResult[];
  tokensUsed: number;
  tokensBudget: number;
  elapsedMs: number;
  send: (event: LoopEvent) => boolean;
  push: (step: LoopStep) => void;
}

/** @brief Create wiring context. @since 0.2.6 */
export function createWiringContext(
  state: LoopState,
  steps: LoopStep[],
  results: StepResult[],
  tokensUsed: number,
  tokensBudget: number,
  startedAt: number,
  send: (event: LoopEvent) => boolean,
  push: (step: LoopStep) => void,
): WiringContext {
  return {
    state,
    step: steps.find((s) => s.status === 'running') ?? null,
    steps,
    results,
    tokensUsed,
    tokensBudget,
    elapsedMs: Date.now() - startedAt,
    send,
    push,
  };
}

/** @brief Check if budget allows another step. @since 0.2.6 */
export function budgetOk(ctx: WiringContext): boolean {
  return ctx.tokensUsed < ctx.tokensBudget;
}

/** @brief Check if all steps completed. @since 0.2.6 */
export function allDone(ctx: WiringContext): boolean {
  return ctx.steps.length > 0 && ctx.steps.every((s) => s.status === 'completed');
}

/** @brief Check if any step failed. @since 0.2.6 */
export function anyFailed(ctx: WiringContext): boolean {
  return ctx.steps.some((s) => s.status === 'failed');
}

/** @brief Count steps by status. @since 0.2.6 */
export function countByStatus(ctx: WiringContext): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of ctx.steps) {
    counts[s.status] = (counts[s.status] ?? 0) + 1;
  }
  return counts;
}

/** @brief Get step progress as percentage. @since 0.2.6 */
export function progressPct(ctx: WiringContext): number {
  if (ctx.steps.length === 0) return 0;
  const done = ctx.steps.filter((s) => s.status === 'completed').length;
  return Math.round((done / ctx.steps.length) * 100);
}
