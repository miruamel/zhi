/**
 * @fileoverview Loop driver — run loop execution. @since 0.1.10
 * @package zhi
 */
import { LoopState, LoopEvent, isTerminal } from './states';

/** @brief Run loop through handler map until DONE or error. @since 0.1.10 */
export async function runLoop(
  handlers: Partial<Record<LoopState, () => LoopEvent | Promise<LoopEvent>>>,
  transitions: Record<LoopState, Partial<Record<LoopEvent, LoopState>>>,
  startState: LoopState,
  options?: { stepTimeoutMs?: number; budget?: number; onLog?: (msg: string) => void },
): Promise<{ steps: number; budgetUsed: number }> {
  const { stepTimeoutMs = 0, budget, onLog } = options ?? {};
  let current = startState;
  let stepsRemaining = budget;
  let stepCount = 0;
  let budgetUsed = 0;

  while (!isTerminal(current)) {
    if (budget !== undefined) {
      if (stepsRemaining !== undefined && stepsRemaining <= 0) {
        throw new Error('budget exceeded');
      }
      if (stepsRemaining !== undefined) stepsRemaining--;
    }

    const handler = handlers[current];
    if (!handler) throw new Error(`no handler for state ${current}`);

    let event: LoopEvent;
    if (stepTimeoutMs > 0) {
      event = await Promise.race([
        Promise.resolve(handler()),
        new Promise<LoopEvent>((_, reject) =>
          setTimeout(() => reject(new Error('step timeout')), stepTimeoutMs),
        ),
      ]);
    } else {
      event = await Promise.resolve(handler());
    }

    const next = transitions[current]?.[event];
    if (!next) throw new Error(`illegal transition from ${current} via ${event}`);

    const from = current;
    current = next;
    stepCount++;
    budgetUsed++;
    onLog?.(`step ${stepCount}: ${from} -> ${event}`);
  }

  return { steps: stepCount, budgetUsed };
}
