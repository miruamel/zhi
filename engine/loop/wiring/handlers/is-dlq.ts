/**
 * @fileoverview Dead-letter queue check — determines if a step should be retried or quarantined. @since 0.2.6
 * @package zhi
 */
import type { LoopStep, StepResult } from '../../types';

/** @brief DLQ check result. @since 0.2.6 */
export interface DlqResult {
  action: 'retry' | 'quarantine' | 'skip';
  reason: string;
}

/** @brief Check if a step should be quarantined. @since 0.2.6 */
export function isDlq(step: LoopStep, result: StepResult, maxRetries = 3): DlqResult {
  const retryCount = step.retryCount ?? 0;
  if (!result.ok) {
    if (retryCount >= maxRetries) {
      return { action: 'quarantine', reason: `max retries exceeded (${retryCount}/${maxRetries})` };
    }
    return { action: 'retry', reason: `attempt ${retryCount + 1} of ${maxRetries}` };
  }
  return { action: 'skip', reason: 'step completed' };
}

/** @brief Classify error for DLQ decision. @since 0.2.6 */
export function classifyError(error: string): 'transient' | 'permanent' | 'unknown' {
  const lower = error.toLowerCase();
  if (/(timeout|network|econnrefused|econnreset|etimedout|503|502|429)/i.test(lower))
    return 'transient';
  if (/(permission|unauthorized|forbidden|not found|404|403|401)/i.test(lower)) return 'permanent';
  return 'unknown';
}

/** @brief Create a DLQ checker. @since 0.2.6 */
export function createDlqChecker(maxRetries?: number) {
  return (step: LoopStep, result: StepResult) => isDlq(step, result, maxRetries);
}

/** @brief Check if a step result is dead-letter quarantined (boolean).
 * @param {unknown} res - step result to check.
 * @return {boolean} true when quarantined.
 * @since 0.2.6 */
export function isDLQ(res: unknown): boolean {
  if (res === null || res === undefined) return false;
  if (typeof res === 'string') return false;
  if (typeof res !== 'object') return false;
  const r = res as Record<string, unknown>;
  if (r.error === undefined) return false;
  const attempts = typeof r.attempts === 'number' ? r.attempts : 0;
  return attempts >= 3;
}
