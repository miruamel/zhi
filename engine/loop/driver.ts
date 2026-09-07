/**
 * @fileoverview Loop driver — state machine conductor with event-driven transitions, budget guards, and timeout enforcement.
 * @since 0.2.6
 * @package zhi
 */
import { LoopState, LoopEvent, transitions, isTerminal, validEvents } from './states';

/** @brief Driver constructor options. @since 0.2.6 */
export interface LoopDriverOptions {
  start?: LoopState;
  onTransition?: (from: LoopState, event: LoopEvent, to: LoopState) => void;
  stepTimeoutMs?: number;
  maxRetries?: number;
  onLog?: (msg: string) => void;
}

/** @brief Handler map for run(). @since 0.2.6 */
export type LoopHandlers = Partial<Record<LoopState, () => LoopEvent | Promise<LoopEvent>>>;

/** @brief Step result. @since 0.2.6 */
export interface StepResult {
  event: LoopEvent;
  ok: boolean;
  error?: string;
  durationMs: number;
  state: LoopState;
}

/** @brief Run result. @since 0.2.6 */
export interface RunResult {
  steps: StepResult[];
  finalState: LoopState;
  ok: boolean;
  error?: string;
  durationMs: number;
  budgetUsed: number;
}

/** @brief State-machine loop driver. @since 0.2.6 */
export class LoopDriver {
  current: LoopState;
  private readonly onTransition?: (from: LoopState, event: LoopEvent, to: LoopState) => void;
  private readonly defaultTimeoutMs: number;
  private readonly onLog?: (msg: string) => void;
  private stepCount = 0;
  private budgetUsed = 0;

  constructor(options: LoopDriverOptions = {}) {
    this.current = options.start ?? LoopState.INTAKE;
    this.onTransition = options.onTransition;
    this.defaultTimeoutMs = options.stepTimeoutMs ?? 0;
    this.onLog = options.onLog;
  }

  /** @brief True when loop reached DONE. @since 0.2.6 */
  get finished(): boolean {
    return isTerminal(this.current);
  }

  /** @brief Send event, return true if transition applied. @since 0.2.6 */
  send(event: LoopEvent): boolean {
    const next = transitions[this.current]?.[event];
    if (!next) return false;
    const from = this.current;
    this.current = next;
    this.onTransition?.(from, event, next);
    return true;
  }

  /** @brief Abort the loop by sending ABORT event. @since 0.1.2 */
  abort(): boolean {
    return this.send(LoopEvent.ABORT);
  }
  /** @brief Run loop through handler map until DONE or error.
   * @param {LoopHandlers} handlers - per-state handler functions.
   * @param {number} stepTimeoutMs - optional per-step timeout in ms (0 = disabled).
   * @param {number} budget - optional step budget; 0 = exhausted after first step.
   * @since 0.2.6 */
  async run(handlers: LoopHandlers, stepTimeoutMs?: number, budget?: number): Promise<void> {
    const timeout = stepTimeoutMs ?? this.defaultTimeoutMs;
    let stepsRemaining = budget;

    while (!this.finished) {
      if (budget !== undefined) {
        if (stepsRemaining !== undefined && stepsRemaining <= 0) {
          throw new Error('budget exceeded');
        }
        if (stepsRemaining !== undefined) stepsRemaining--;
      }

      const handler = handlers[this.current];
      if (!handler) throw new Error(`no handler for state ${this.current}`);

      let event: LoopEvent;
      if (timeout > 0) {
        event = await Promise.race([
          Promise.resolve(handler()),
          new Promise<LoopEvent>((_, reject) =>
            setTimeout(() => reject(new Error('step timeout')), timeout),
          ),
        ]);
      } else {
        event = await Promise.resolve(handler());
      }

      const ok = this.send(event);
      if (!ok) throw new Error(`illegal transition from ${this.current} via ${event}`);

      this.stepCount++;
      this.budgetUsed++;
      this.onLog?.(`step ${this.stepCount}: ${this.current} -> ${event}`);
    }
  }

  /** @brief Get step count. @since 0.2.6 */
  get steps(): number {
    return this.stepCount;
  }

  /** @brief Get budget used. @since 0.2.6 */
  get budget(): number {
    return this.budgetUsed;
  }

  /** @brief Reset driver to initial state. @since 0.2.6 */
  reset(start?: LoopState): void {
    this.current = start ?? LoopState.INTAKE;
    this.stepCount = 0;
    this.budgetUsed = 0;
  }

  /** @brief Get valid events from current state. @since 0.2.6 */
  availableEvents(): LoopEvent[] {
    return validEvents(this.current);
  }

  /** @brief Check if state is terminal. @since 0.2.6 */
  isTerminal(): boolean {
    return isTerminal(this.current);
  }
}

/** @brief Create a driver instance. @since 0.2.6 */
export function createDriver(options?: LoopDriverOptions): LoopDriver {
  return new LoopDriver(options);
}

/** @brief Run a one-shot loop with inline handlers. @since 0.2.6 */
export async function runLoop(
  handlers: LoopHandlers,
  options?: LoopDriverOptions & { stepTimeoutMs?: number; budget?: number },
): Promise<void> {
  const driver = createDriver(options);
  return driver.run(handlers, options?.stepTimeoutMs, options?.budget);
}
