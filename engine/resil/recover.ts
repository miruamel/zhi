/** @brief Klasifikasi error -> strategi recovery. @since 0.1.0 */

/** @brief Strategi recovery yang didukung. @since 0.1.0 */
export type RecoveryStrategy = 'replan' | 'patch' | 'abort';

/** @brief Hasil klasifikasi. @since 0.1.0 */
export interface ClassifiedError {
  /** @brief Strategi yang disarankan. */
  strategy: RecoveryStrategy;
  /** @brief True bila error fatal (harus abort, tidak spin). */
  fatal: boolean;
}

/** @brief Klasifikasi error jadi strategi recovery.
 * @param {unknown} err - error apa pun.
 * @return {ClassifiedError} strategi + kefatalan.
 * @since 0.1.0 */
export function classifyError(err: unknown): ClassifiedError {
  const msg = String(err ?? '');
  if (/budget|timeout|fatal|quota/i.test(msg)) return { strategy: 'abort', fatal: true };
  if (/cycle|ambig|parse/i.test(msg)) return { strategy: 'replan', fatal: false };
  return { strategy: 'patch', fatal: false };
}
