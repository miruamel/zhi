/** @brief Circuit breaker: buka bila error rate > threshold dalam window. @since 0.1.1 */

/** @brief Konfigurasi breaker. @since 0.1.1 */
export interface BreakerConfig {
  /** @brief Jumlah panggilan terakhir yang dilacak. */
  windowSize: number;
  /** @brief Rasio error untuk membuka breaker (mis. 0.5). */
  openThreshold: number;
}

/** @brief Breaker stateful: catat hasil, buka bila error rate tinggi. @since 0.1.1 */
export class CircuitBreaker {
  private calls: boolean[] = [];

  /** @brief @param {BreakerConfig} cfg */
  constructor(private cfg: BreakerConfig) {}

  /** @brief Catat hasil satu panggilan. @param {boolean} success */
  record(success: boolean): void {
    this.calls.push(success);
    if (this.calls.length > this.cfg.windowSize) this.calls.shift();
  }

  /** @brief Apakah breaker terbuka (harus abort). @return {boolean} */
  isOpen(): boolean {
    if (this.calls.length < this.cfg.windowSize) return false;
    const errs = this.calls.filter((s) => !s).length;
    return errs / this.calls.length > this.cfg.openThreshold;
  }

  /** @brief Reset state (pasca recovery). */
  reset(): void {
    this.calls = [];
  }
}
