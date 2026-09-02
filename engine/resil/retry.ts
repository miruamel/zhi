/** @brief Retry budget (max-3) + Dead Letter Queue. @since 0.1.0 */

/** @brief Entri DLQ: kegagalan final yang tak boleh dibuang diam-diam. @since 0.1.0 */
export interface DLQEntry {
  /** @brief Pesan error terakhir. */
  error: string;
  /** @brief Jumlah percobaan. */
  attempts: number;
  /** @brief Timestamp kegagalan (ms). */
  at: number;
}

/** @brief Hasil retry: sukses atau DLQ. @since 0.1.0 */
export interface RetryResult<T> {
  /** @brief True bila fn sukses. */
  ok: boolean;
  /** @brief Nilai hasil (bila ok). */
  value?: T;
  /** @brief Jumlah percobaan yang dilakukan. */
  attempts: number;
  /** @brief Entri DLQ (bila !ok). */
  dlq?: DLQEntry;
}

/** @brief Coba fn maksimal maxAttempts kali; gagal total -> DLQ.
 * @param {() => Promise<T>} fn - operasi yang mungkin gagal.
 * @param {number} maxAttempts - batas retry (default 3).
 * @return {Promise<RetryResult<T>>} hasil atau DLQ.
 * @since 0.1.0 */
export async function retryWithBudget<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<RetryResult<T>> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const value = await fn();
      return { ok: true, value, attempts: attempt };
    } catch (e) {
      lastErr = e;
    }
  }
  return {
    ok: false,
    attempts: maxAttempts,
    dlq: { error: String(lastErr), attempts: maxAttempts, at: Date.now() },
  };
}
