/**
 * @fileoverview Loop driver — state machine conductor with event-driven transitions, budget guards, and timeout enforcement. @since 0.1.10
 * @package zhi
 */
import { LoopState, LoopEvent, transitions, isTerminal, validEvents } from './states';
import type { LoopDriverOptions, LoopHandlers } from './driver-types';

/** @brief State-machine loop driver. @since 0.1.10 */
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

  /** @brief True when loop reached DONE. @since 0.1.10 */
  get finished(): boolean {
    return isTerminal(this.current);
  }

  /** @brief Send event, return true if transition applied. @since 0.1.10 */
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

  /** @brief Run loop through handler map until DONE or error. @since 0.1.10 */
  async run(handlers: LoopHandlers, stepTimeoutMs?: number, budget?: number): Promise<void> {
    let current = this.current;
    const timeout = stepTimeoutMs ?? this.defaultTimeoutMs;
    let stepsRemaining = budget;
    let stepCount = 0;
    let budgetUsed = 0;

    while (!isTerminal(current)) {
      if (budget !== undefined) {
        if (stepsRemaining !== undefined && stepsRemaining <= 0) throw new Error('budget exceeded');
        if (stepsRemaining !== undefined) stepsRemaining--;
      }
      const handler = handlers[current];
      if (!handler) throw new Error(`no handler for state ${current}`);

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

      const next = transitions[current]?.[event];
      if (!next) throw new Error(`illegal transition from ${current} via ${event}`);

      const from = current;
      current = next;
      this.onTransition?.(from, event, next);
      stepCount++;
      budgetUsed++;
      this.onLog?.(`step ${stepCount}: ${from} -> ${event}`);
    }

    this.current = current;
    this.stepCount = stepCount;
    this.budgetUsed = budgetUsed;
  }

  /** @brief Get step count. @since 0.1.10 */
  get steps(): number {
    return this.stepCount;
  }

  /** @brief Get budget used. @since 0.1.10 */
  get budget(): number {
    return this.budgetUsed;
  }

  /** @brief Reset driver to initial state. @since 0.1.10 */
  reset(start?: LoopState): void {
    this.current = start ?? LoopState.INTAKE;
    this.stepCount = 0;
    this.budgetUsed = 0;
  }

  /** @brief Get valid events from current state. @since 0.1.10 */
  availableEvents(): LoopEvent[] {
    return validEvents(this.current);
  }

  /** @brief Check if state is terminal. @since 0.1.10 */
  isTerminal(): boolean {
    return isTerminal(this.current);
  }
}

/** @brief Create a driver instance. @since 0.1.10 */
export function createDriver(options?: LoopDriverOptions): LoopDriver {
  return new LoopDriver(options);
}
