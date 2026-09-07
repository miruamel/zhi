/**
 * @fileoverview Resilience — retry with backoff and DLQ. @since 0.2.6
 * @package zhi
 */

/** @brief DLQ entry. @since 0.2.6 */
export interface DLQEntry {
  error: string;
  attempts: number;
  at: number;
}

/** @brief Retry result. @since 0.2.6 */
export interface RetryResult<T> {
  ok: boolean;
  value?: T;
  attempts: number;
  dlq?: DLQEntry;
}

/** @brief Retry options. @since 0.2.6 */
export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoff?: 'linear' | 'exponential' | 'jitter';
  retryOn?: (error: Error) => boolean;
}

/** @brief Default retry options. @since 0.2.6 */
export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  backoff: 'exponential',
  retryOn: () => true,
};

/** @brief Classify error as fatal (no retry) or transient. @since 0.2.6 */
function isFatal(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return msg.includes('fatal') || msg.includes('budget exhausted');
}

/** @brief Sleep helper using Promise.withResolvers. @since 0.2.6 */
function sleep(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

/** @brief Retry with backoff. @since 0.2.6 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const opts: Required<RetryOptions> = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const { maxAttempts, baseDelayMs, maxDelayMs, backoff, retryOn } = opts;
  let lastError: Error | undefined;
  let attempts = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attempts++;
    try {
      const value = await fn();
      return { ok: true, value, attempts };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt >= maxAttempts) break;
      if (isFatal(lastError)) break;
      if (retryOn && !retryOn(lastError)) break;

      let delay = (baseDelayMs ?? 100) * attempt;
      if (backoff === 'exponential') delay = (baseDelayMs ?? 100) * Math.pow(2, attempt - 1);
      if (backoff === 'jitter') delay = Math.random() * (baseDelayMs ?? 100) * attempt;
      delay = Math.min(delay, maxDelayMs ?? 5000);
      await sleep(delay);
    }
  }

  return {
    ok: false,
    attempts,
    dlq: {
      error: lastError?.message ?? 'unknown error',
      attempts,
      at: Date.now(),
    },
  };
}

/** @brief Retry with budget — caps attempts by maxAttempts argument. @since 0.2.6 */
export async function retryWithBudget<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
): Promise<RetryResult<T>> {
  return retry(fn, { maxAttempts });
}

/** @brief Create retry options with overrides. @since 0.2.6 */
export function createRetryOptions(overrides: Partial<RetryOptions> = {}): RetryOptions {
  return { ...DEFAULT_RETRY_OPTIONS, ...overrides };
}

/** @brief Recovery strategy. @since 0.1.1 */
export type RecoveryStrategy = 'replan' | 'patch' | 'abort';

/** @brief Classified error. @since 0.1.1 */
export interface ClassifiedError {
  strategy: RecoveryStrategy;
  fatal: boolean;
}

/** @brief Classify error into recovery strategy. @since 0.1.1 */
export function classifyError(err: unknown): ClassifiedError {
  const msg = String(err ?? '');
  if (/budget|timeout|fatal|quota/i.test(msg)) return { strategy: 'abort', fatal: true };
  if (/cycle|ambig|parse/i.test(msg)) return { strategy: 'replan', fatal: false };
  return { strategy: 'patch', fatal: false };
}
