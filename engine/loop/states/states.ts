/**
 * @fileoverview Loop states — enums and transition table. @since 0.1.10
 * @package zhi
 */

/** @brief Loop states. @since 0.1.10 */
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
  CI_PENDING = 'CI_PENDING',
  CI_RED = 'CI_RED',
  COMPLETE = 'COMPLETE',
  FAIL = 'FAIL',
  RETRY = 'RETRY',
  ABORT = 'ABORT',
  SKIP = 'SKIP',
  RECOVERED = 'RECOVERED',
  BUDGET_OUT = 'BUDGET_OUT',
}

/** @brief State transition table. @since 0.1.10 */
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
    [LoopEvent.CI_PENDING]: LoopState.CI_WATCH,
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
