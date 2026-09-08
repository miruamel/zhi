/**
 * @fileoverview Circuit breaker — sliding-window error-rate breaker. @since 0.1.10
 * @package zhi
 */

/** @brief Circuit state. @since 0.1.10 */
export type CircuitState = 'closed' | 'open' | 'half-open';

/** @brief Circuit breaker options. @since 0.1.10 */
export interface BreakerOptions {
  windowSize?: number;
  openThreshold?: number;
  halfOpenTimeout?: number;
  resetTimeout?: number;
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

/** @brief Circuit breaker — pure sliding-window failure-rate breaker. @since 0.1.10 */
export class CircuitBreaker {
  private window: boolean[] = [];
  private state: CircuitState = 'closed';
  private openedAt = 0;
  private readonly windowSize: number;
  private readonly openThreshold: number;
  private readonly halfOpenTimeout: number;
  private readonly onStateChange?: (from: CircuitState, to: CircuitState) => void;

  constructor(options: BreakerOptions = {}) {
    this.windowSize = options.windowSize ?? 5;
    this.openThreshold = options.openThreshold ?? 0.5;
    this.halfOpenTimeout = options.halfOpenTimeout ?? options.resetTimeout ?? 10_000;
    this.onStateChange = options.onStateChange;
  }

  /** @brief Current state. @since 0.1.10 */
  get currentState(): CircuitState {
    this.checkHalfOpen();
    return this.state;
  }

  /** @brief Check if circuit is open. @since 0.1.10 */
  isOpen(): boolean {
    this.checkHalfOpen();
    return this.state === 'open';
  }

  /** @brief Record a result (true = success, false = failure). @since 0.1.10 */
  record(success: boolean): void {
    this.checkHalfOpen();
    if (this.state === 'half-open') {
      if (success) {
        this.window = [];
        this.setState('closed');
      } else {
        this.setState('open');
      }
      return;
    }

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

  /** @brief Check if request allowed. @since 0.1.10 */
  allow(): boolean {
    this.checkHalfOpen();
    return this.state !== 'open';
  }

  /** @brief Transition breaker to half-open to allow probe. @since 0.1.10 */
  halfOpen(): void {
    this.setState('half-open');
  }

  /** @brief Wrap a function with circuit breaker. @since 0.1.10 */
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

  /** @brief Reset breaker to closed. @since 0.1.10 */
  reset(): void {
    this.window = [];
    this.openedAt = 0;
    this.setState('closed');
  }

  private checkHalfOpen(): void {
    if (this.state === 'open' && Date.now() - this.openedAt >= this.halfOpenTimeout) {
      this.setState('half-open');
    }
  }

  private setState(next: CircuitState): void {
    if (this.state === next) return;
    const from = this.state;
    this.state = next;
    if (next === 'open') {
      this.openedAt = Date.now();
    }
    this.onStateChange?.(from, next);
  }
}

/** @brief Create a circuit breaker. @since 0.1.10 */
export function createBreaker(options?: BreakerOptions): CircuitBreaker {
  return new CircuitBreaker(options);
}
