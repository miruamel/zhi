/** @brief Orchestrator resilience: breaker + retry + recovery. @since 0.1.1 */
import { CircuitBreaker } from './breaker';
import { retryWithBudget, type RetryResult, type DLQEntry } from './retry';

/** @brief Context resilience untuk withResilience. @since 0.1.1 */
export interface ResilCtx {
  /** @brief Breaker bersama (dari loop). */
  breaker?: CircuitBreaker;
  /** @brief Batas retry (default 3). */
  maxAttempts?: number;
}

/** @brief Jalankan fn dengan circuit breaker + retry budget + recovery.
 * @param {() => Promise<T>} fn - operasi.
 * @param {ResilCtx} ctx - breaker + budget.
 * @return {Promise<T | DLQEntry>} hasil atau DLQ (tidak pernah throw).
 * @since 0.1.1 */
export async function withResilience<T>(
  fn: () => Promise<T>,
  ctx: ResilCtx = {},
): Promise<T | DLQEntry> {
  const max = ctx.maxAttempts ?? 3;
  if (ctx.breaker?.isOpen()) {
    return { error: 'circuit-open', attempts: 0, at: Date.now() } as DLQEntry;
  }
  const res: RetryResult<T> = await retryWithBudget(fn, max);
  if (ctx.breaker) ctx.breaker.record(res.ok);
  if (res.ok) return res.value as T;
  // ponytail: classifyError result is dead — both branches return res.dlq.
  // classifyError is still used by loop/wiring/handlers/builder.ts:87 for recovery strategy.
  return res.dlq as DLQEntry;
}

export { CircuitBreaker } from './breaker';
export { retryWithBudget } from './retry';
export type { RetryResult, DLQEntry } from './retry';
export { classifyError } from './recover';
export type { RecoveryStrategy, ClassifiedError } from './recover';
