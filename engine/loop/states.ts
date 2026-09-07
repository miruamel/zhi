/**
 * @fileoverview Loop states — state machine definitions and transitions.
 * @since 0.2.6
 * @package zhi
 */

/** @brief Loop states. @since 0.2.6 */
export enum LoopState {
  INTAKE = 'INTAKE',
  PLAN = 'PLAN',
  ISOLATE = 'ISOLATE',
  EXECUTE = 'EXECUTE',
  CRITIQUE = 'CRITIQUE',
  EVALUATE = 'EVALUATE',
  RECOVER = 'RECOVER',
  COMMIT = 'COMMIT',
  PR_OPEN = 'PR_OPEN',
  CI_WATCH = 'CI_WATCH',
  RETRY = 'RETRY',
  DONE = 'DONE',
  ABORTED = 'ABORTED',
  ERROR = 'ERROR',
}

export enum LoopEvent {
  GOAL_READY = 'GOAL_READY',
  PLAN_OK = 'PLAN_OK',
  ISOLATED = 'ISOLATED',
  EXECUTED = 'EXECUTED',
  CRITIQUED = 'CRITIQUED',
  GATE_PASS = 'GATE_PASS',
  GATE_FAIL = 'GATE_FAIL',
  COMMITTED = 'COMMITTED',
  PR_OPENED = 'PR_OPENED',
  CI_GREEN = 'CI_GREEN',
  CI_RED = 'CI_RED',
  COMPLETE = 'COMPLETE',
  FAIL = 'FAIL',
  RETRY = 'RETRY',
  ABORT = 'ABORT',
  SKIP = 'SKIP',
  RECOVERED = 'RECOVERED',
  BUDGET_OUT = 'BUDGET_OUT',
}

/** @brief State transition table. @since 0.2.6 */
export const transitions: Record<LoopState, Partial<Record<LoopEvent, LoopState>>> = {
  [LoopState.INTAKE]: {
    [LoopEvent.GOAL_READY]: LoopState.PLAN,
    [LoopEvent.ABORT]: LoopState.ABORTED,
  },
  [LoopState.PLAN]: {
    [LoopEvent.PLAN_OK]: LoopState.ISOLATE,
    [LoopEvent.RETRY]: LoopState.RETRY,
    [LoopEvent.BUDGET_OUT]: LoopState.RECOVER,
    [LoopEvent.FAIL]: LoopState.ERROR,
  },
  [LoopState.ISOLATE]: {
    [LoopEvent.ISOLATED]: LoopState.EXECUTE,
    [LoopEvent.RETRY]: LoopState.RETRY,
    [LoopEvent.ABORT]: LoopState.ABORTED,
    [LoopEvent.FAIL]: LoopState.ERROR,
  },
  [LoopState.EXECUTE]: {
    [LoopEvent.EXECUTED]: LoopState.CRITIQUE,
    [LoopEvent.RETRY]: LoopState.RETRY,
    [LoopEvent.BUDGET_OUT]: LoopState.RECOVER,
    [LoopEvent.FAIL]: LoopState.ERROR,
  },
  [LoopState.CRITIQUE]: {
    [LoopEvent.CRITIQUED]: LoopState.EVALUATE,
    [LoopEvent.RETRY]: LoopState.RETRY,
    [LoopEvent.ABORT]: LoopState.ABORTED,
    [LoopEvent.FAIL]: LoopState.ERROR,
  },
  [LoopState.EVALUATE]: {
    [LoopEvent.GATE_PASS]: LoopState.COMMIT,
    [LoopEvent.GATE_FAIL]: LoopState.RECOVER,
    [LoopEvent.ABORT]: LoopState.ABORTED,
    [LoopEvent.BUDGET_OUT]: LoopState.ABORTED,
  },
  [LoopState.RECOVER]: {
    [LoopEvent.RECOVERED]: LoopState.ISOLATE,
    [LoopEvent.BUDGET_OUT]: LoopState.DONE,
    [LoopEvent.ABORT]: LoopState.ABORTED,
    [LoopEvent.FAIL]: LoopState.ERROR,
  },
  [LoopState.COMMIT]: {
    [LoopEvent.COMMITTED]: LoopState.PR_OPEN,
    [LoopEvent.RETRY]: LoopState.RETRY,
    [LoopEvent.ABORT]: LoopState.ABORTED,
    [LoopEvent.FAIL]: LoopState.ERROR,
    [LoopEvent.BUDGET_OUT]: LoopState.ABORTED,
  },
  [LoopState.PR_OPEN]: {
    [LoopEvent.PR_OPENED]: LoopState.CI_WATCH,
    [LoopEvent.RETRY]: LoopState.RETRY,
    [LoopEvent.ABORT]: LoopState.ABORTED,
    [LoopEvent.FAIL]: LoopState.ERROR,
  },
  [LoopState.CI_WATCH]: {
    [LoopEvent.CI_GREEN]: LoopState.DONE,
    [LoopEvent.CI_RED]: LoopState.RECOVER,
    [LoopEvent.COMPLETE]: LoopState.DONE,
    [LoopEvent.ABORT]: LoopState.ABORTED,
    [LoopEvent.FAIL]: LoopState.ERROR,
    [LoopEvent.BUDGET_OUT]: LoopState.ABORTED,
  },
  [LoopState.RETRY]: {
    [LoopEvent.RETRY]: LoopState.ISOLATE,
    [LoopEvent.ABORT]: LoopState.ABORTED,
    [LoopEvent.FAIL]: LoopState.ERROR,
    [LoopEvent.BUDGET_OUT]: LoopState.ABORTED,
  },
  [LoopState.DONE]: {},
  [LoopState.ABORTED]: {},
  [LoopState.ERROR]: {},
};

/** @brief Check if state is terminal. @since 0.2.6 */
export function isTerminal(state: LoopState): boolean {
  return state === LoopState.DONE || state === LoopState.ABORTED || state === LoopState.ERROR;
}

/** @brief Check if event is valid from state. @since 0.2.6 */
export function isValidTransition(state: LoopState, event: LoopEvent): boolean {
  return transitions[state]?.[event] !== undefined;
}

/** @brief Get next state for transition. @since 0.2.6 */
export function nextState(state: LoopState, event: LoopEvent): LoopState | undefined {
  return transitions[state]?.[event];
}

/** @brief Get all valid events from state. @since 0.2.6 */
export function validEvents(state: LoopState): LoopEvent[] {
  return Object.keys(transitions[state] ?? {}).map((k) => k as LoopEvent);
}

/** @brief Get state label. @since 0.2.6 */
export function stateLabel(state: LoopState): string {
  return state;
}

/** @brief Get event label. @since 0.2.6 */
export function eventLabel(event: LoopEvent): string {
  return event;
}

/** @brief Gate input for gatePass check. @since 0.1.1 */
export interface GateInput {
  paretoScore: number;
  paretoThreshold: number;
  qualityGateGreen: boolean;
}

/** @brief Gate sebelum COMMIT: state EVALUATE DAN Pareto >= threshold DAN quality-gate hijau.
 * @param {LoopState} state - state saat ini.
 * @param {GateInput} input - skor Pareto + status quality-gate.
 * @return {boolean} layak commit.
 * @since 0.1.1 */
export function gatePass(state: LoopState, input: GateInput): boolean {
  if (state !== LoopState.EVALUATE) return false;
  return input.paretoScore >= input.paretoThreshold && input.qualityGateGreen;
}

/**
 * @brief Transition state by event. Returns current state if invalid transition.
 * @param {LoopState} state - current state.
 * @param {LoopEvent} event - event to transition on.
 * @return {LoopState | null} new state, or null if no transition exists.
 * @since 0.1.1
 */
export function transition(state: LoopState, event: LoopEvent): LoopState | null {
  return transitions[state]?.[event] ?? null;
}
