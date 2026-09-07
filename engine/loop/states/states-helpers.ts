/**
 * @fileoverview Loop states — helper functions and gate logic. @since 0.1.10
 * @package zhi
 */
import { LoopState, LoopEvent, transitions } from './states';

/** @brief Check if state is terminal. @since 0.1.10 */
export function isTerminal(state: LoopState): boolean {
  return state === LoopState.DONE || state === LoopState.ABORTED || state === LoopState.ERROR;
}

/** @brief Check if event is valid from state. @since 0.1.10 */
export function isValidTransition(state: LoopState, event: LoopEvent): boolean {
  return transitions[state]?.[event] !== undefined;
}

/** @brief Get next state for transition. @since 0.1.10 */
export function nextState(state: LoopState, event: LoopEvent): LoopState | undefined {
  return transitions[state]?.[event];
}

/** @brief Get all valid events from state. @since 0.1.10 */
export function validEvents(state: LoopState): LoopEvent[] {
  return Object.keys(transitions[state] ?? {}).map((k) => k as LoopEvent);
}

/** @brief Get state label. @since 0.1.10 */
export function stateLabel(state: LoopState): string {
  return state;
}

/** @brief Get event label. @since 0.1.10 */
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
