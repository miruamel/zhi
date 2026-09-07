/**
 * @fileoverview Circuit breaker — sliding-window error-rate breaker. @since 0.2.6
 * @package zhi
 */

/** @brief Circuit state. @since 0.2.6 */
export type CircuitState = 'closed' | 'open' | 'half-open';

/** @brief Circuit breaker options. @since 0.2.6 */
export interface BreakerOptions {
  windowSize?: number;
  openThreshold?: number;
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

/** @brief Circuit breaker — pure sliding-window failure-rate breaker. @since 0.2.6 */
export class CircuitBreaker {
  private window: boolean[] = [];
  private state: CircuitState = 'closed';
  private readonly windowSize: number;
  private readonly openThreshold: number;
  private readonly onStateChange?: (from: CircuitState, to: CircuitState) => void;

  constructor(options: BreakerOptions = {}) {
    this.windowSize = options.windowSize ?? 5;
    this.openThreshold = options.openThreshold ?? 0.5;
    this.onStateChange = options.onStateChange;
  }

  /** @brief Current state. @since 0.2.6 */
  get currentState(): CircuitState {
    return this.state;
  }

  /** @brief Check if circuit is open. @since 0.2.6 */
  isOpen(): boolean {
    return this.state === 'open';
  }

  /** @brief Record a result (true = success, false = failure). @since 0.2.6 */
  record(success: boolean): void {
    this.window.push(success);
    if (this.window.length > this.windowSize) {
      this.window.shift();
    }

    if (this.window.length >= this.windowSize) {
      const failures = this.window.filter((s) => !s).length;
      const rate = failures / this.window.length;
      if (rate > this.openThreshold) {
        this.setState('open');
      } else {
        this.setState('closed');
      }
    }
  }

  /** @brief Check if request allowed. @since 0.2.6 */
  allow(): boolean {
    return this.state !== 'open';
  }

  /** @brief Wrap a function with circuit breaker. @since 0.2.6 */
  async wrap<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.allow()) throw new Error('circuit open');
    try {
      const result = await fn();
      this.record(true);
      return result;
    } catch (err) {
      this.record(false);
      throw err;
    }
  }

  /** @brief Reset breaker to closed. @since 0.2.6 */
  reset(): void {
    this.window = [];
    this.setState('closed');
  }

  private setState(next: CircuitState): void {
    if (this.state === next) return;
    const from = this.state;
    this.state = next;
    this.onStateChange?.(from, next);
  }
}

/** @brief Create a circuit breaker. @since 0.2.6 */
export function createBreaker(options?: BreakerOptions): CircuitBreaker {
  return new CircuitBreaker(options);
}
