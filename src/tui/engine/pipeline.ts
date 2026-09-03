/**
 * @brief Loop pipeline state machine: intake → plan → execute → critique →
 *        evaluate → commit → pr_open → ci_watch → done.
 * @since 0.1.1
 */
import { colors, type ColorToken } from '../core/style/colors.ts';

/** @brief One stage of the orchestrator loop. */
export type LoopState =
  | 'INTAKE'
  | 'PLAN'
  | 'ISOLATE'
  | 'EXECUTE'
  | 'CRITIQUE'
  | 'EVALUATE'
  | 'COMMIT'
  | 'PR_OPEN'
  | 'CI_WATCH'
  | 'DONE';

/** @brief Allowed next-state edges per current state. */
export const LOOP_TRANSITIONS: Record<LoopState, LoopState[]> = {
  INTAKE: ['PLAN'],
  PLAN: ['ISOLATE'],
  ISOLATE: ['EXECUTE'],
  EXECUTE: ['CRITIQUE'],
  CRITIQUE: ['EVALUATE'],
  EVALUATE: ['COMMIT', 'EXECUTE'],
  COMMIT: ['PR_OPEN'],
  PR_OPEN: ['CI_WATCH', 'DONE'],
  CI_WATCH: ['DONE', 'EXECUTE'],
  DONE: [],
};
/** @brief True when `from → to` is a permitted edge. */
export function validateTransition(from: LoopState, to: LoopState): boolean {
  return LOOP_TRANSITIONS[from].includes(to);
}

/** @brief Inputs that select the next stage from a current one. */
export interface NextLoopCondition {
  gatePass: boolean;
  hasPr: boolean;
  ciStatus: string;
}

/** @brief Pick the next state from `current` given a condition snapshot. */
export function nextLoopState(
  current: LoopState,
  condition: NextLoopCondition,
): LoopState {
  switch (current) {
    case 'INTAKE':
      return 'PLAN';
    case 'PLAN':
      return 'ISOLATE';
    case 'ISOLATE':
      return 'EXECUTE';
    case 'EXECUTE':
      return 'CRITIQUE';
    case 'CRITIQUE':
      return 'EVALUATE';
    case 'EVALUATE':
      return condition.gatePass ? 'COMMIT' : 'EXECUTE';
    case 'COMMIT':
      return 'PR_OPEN';
    case 'PR_OPEN':
      return condition.hasPr ? 'CI_WATCH' : 'DONE';
    case 'CI_WATCH':
      return condition.ciStatus === 'success' ? 'DONE' : 'EXECUTE';
    case 'DONE':
      return 'DONE';
  }
}

/** @brief True when no further transitions are possible. */
export function isTerminal(state: LoopState): boolean {
  return state === 'DONE';
}

const LABELS: Record<LoopState, string> = {
  INTAKE: 'Intake',
  PLAN: 'Plan',
  ISOLATE: 'Isolate',
  EXECUTE: 'Execute',
  CRITIQUE: 'Critique',
  EVALUATE: 'Evaluate',
  COMMIT: 'Commit',
  PR_OPEN: 'PR Open',
  CI_WATCH: 'CI Watch',
  DONE: 'Done',
};

/** @brief Human-readable label for `state`. */
export function stateLabel(state: LoopState): string {
  return LABELS[state];
}

const STATE_COLOR: Record<LoopState, ColorToken> = {
  INTAKE: 'pending',
  PLAN: 'accentBlue',
  ISOLATE: 'forward',
  EXECUTE: 'running',
  CRITIQUE: 'scoring',
  EVALUATE: 'scoring',
  COMMIT: 'commit',
  PR_OPEN: 'accentBlue',
  CI_WATCH: 'warn',
  DONE: 'complete',
};

/** @brief Color token for rendering `state`. */
export function stateColor(state: LoopState): string {
  return colors[STATE_COLOR[state]];
}