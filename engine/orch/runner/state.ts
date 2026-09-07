/**
 * @fileoverview Orchestrator state machine. @since 0.1.10
 * @package zhi
 */
/** @brief Orchestrator state. @since 0.1.10 */
export type OrchState =
  | 'idle'
  | 'planning'
  | 'running'
  | 'pausing'
  | 'paused'
  | 'resuming'
  | 'finishing'
  | 'finished'
  | 'aborted'
  | 'error'
  | 'failed'
  | 'completed';

/** @brief Valid state transitions. @since 0.1.10 */
const TRANSITIONS: Record<OrchState, OrchState[]> = {
  idle: ['planning', 'aborted', 'error'],
  planning: ['running', 'aborted'],
  running: ['pausing', 'finishing', 'aborted', 'error', 'failed'],
  pausing: ['paused', 'error'],
  paused: ['resuming', 'aborted', 'finishing'],
  resuming: ['running', 'error'],
  finishing: ['finished', 'error'],
  finished: ['completed'],
  aborted: [],
  error: [],
  failed: ['completed'],
  completed: [],
};

/** @brief State machine. @since 0.1.10 */
export interface StateMachine {
  current(): OrchState;
  transition(to: OrchState): boolean;
  toString(): string;
}

/** @brief Create a state machine. @since 0.1.10 */
export function createOrchState(initial: OrchState = 'planning'): StateMachine {
  let state = initial;
  return {
    current(): OrchState {
      return state;
    },
    transition(to: OrchState): boolean {
      if (TRANSITIONS[state].includes(to)) {
        state = to;
        return true;
      }
      return false;
    },
    toString(): string {
      return state;
    },
  };
}
