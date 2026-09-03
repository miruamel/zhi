/**
 * @brief Bridges imperative loop updates into React state with metrics + perf marks.
 * @since 0.1.2
 */
import type { AppState } from "../core/state.ts";
import type { PerfTracker } from "../engine/perf.ts";

/** @brief Aggregate counters for state pushes. */
export interface BridgeMetrics {
  /** @brief Total number of individual `push` calls. */
  pushes: number;
  /** @brief Timestamp of the most recent push (ms); 0 if none yet. */
  lastPush: number;
  /** @brief Number of `pushBatch` calls. */
  batches: number;
}

/** @brief Monotonic clock in milliseconds; isolated for testability. */
function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/**
 * @brief Wraps a `setState` setter with batch/individual push helpers,
 *        counting calls and optionally recording perf marks per push.
 * @since 0.1.2
 */
export class StateBridge {
  private setState: (p: Partial<AppState>) => void;
  private perf: PerfTracker;
  private metrics: BridgeMetrics = { pushes: 0, lastPush: 0, batches: 0 };

  /** @brief Bind a React-style setter and a perf tracker. */
  constructor(setState: (p: Partial<AppState>) => void, perf: PerfTracker) {
    this.setState = setState;
    this.perf = perf;
  }

  /** @brief Push a partial state update and bump the push counter. */
  push(p: Partial<AppState>): void {
    this.metrics = {
      pushes: this.metrics.pushes + 1,
      lastPush: now(),
      batches: this.metrics.batches,
    };
    this.setState(p);
  }

  /** @brief Push a batch of partial updates as one setState call; counts batches. */
  pushBatch(batch: Partial<AppState>[]): void {
    if (batch.length === 0) return;
    const merged = batch.reduce<Partial<AppState>>(
      (acc, p) => ({ ...acc, ...p }),
      {},
    );
    this.metrics = {
      pushes: this.metrics.pushes + batch.length,
      lastPush: now(),
      batches: this.metrics.batches + 1,
    };
    this.setState(merged);
  }

  /** @brief Wrap a push in a named perf mark (start before, end after). */
  pushWithPerf(name: string, p: Partial<AppState>): void {
    this.perf.start(name);
    this.push(p);
    this.perf.end(name);
  }

  /** @brief Read-only snapshot of current bridge counters. */
  getMetrics(): BridgeMetrics {
    return { ...this.metrics };
  }

  /** @brief Reset all counters to zero (does not touch perf tracker). */
  reset(): void {
    this.metrics = { pushes: 0, lastPush: 0, batches: 0 };
  }
}

/** @brief Convenience constructor matching `new StateBridge(setState, perf)`. */
export function createBridge(
  setState: (p: Partial<AppState>) => void,
  perf: PerfTracker,
): StateBridge {
  return new StateBridge(setState, perf);
}