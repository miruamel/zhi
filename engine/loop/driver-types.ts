/**
 * @fileoverview Loop driver types. @since 0.1.10
 * @package zhi
 */
import type { LoopState, LoopEvent } from './states';

/** @brief Driver constructor options. @since 0.1.10 */
export interface LoopDriverOptions {
  start?: LoopState;
  onTransition?: (from: LoopState, event: LoopEvent, to: LoopState) => void;
  stepTimeoutMs?: number;
  maxRetries?: number;
  onLog?: (msg: string) => void;
}

/** @brief Handler map for run(). @since 0.1.10 */
export type LoopHandlers = Partial<Record<LoopState, () => LoopEvent | Promise<LoopEvent>>>;

/** @brief Step result. @since 0.1.10 */
export interface StepResult {
  event: LoopEvent;
  ok: boolean;
  error?: string;
  durationMs: number;
  state: LoopState;
}

/** @brief Run result. @since 0.1.10 */
export interface RunResult {
  steps: StepResult[];
  finalState: LoopState;
  ok: boolean;
  error?: string;
  durationMs: number;
  budgetUsed: number;
}
