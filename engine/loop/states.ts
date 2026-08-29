/** @brief State conductor loop Zhi (murni, tanpa dependensi eksternal). @since 0.1.0 */

/** @brief State mesin status loop otonom. @since 0.1.0 */
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
  DONE = 'DONE',
}

/** @brief Event pemicu transisi antar-state. @since 0.1.0 */
export enum LoopEvent {
  GOAL_READY = 'GOAL_READY',
  PLAN_OK = 'PLAN_OK',
  ISOLATED = 'ISOLATED',
  EXECUTED = 'EXECUTED',
  CRITIQUED = 'CRITIQUED',
  GATE_PASS = 'GATE_PASS',
  GATE_FAIL = 'GATE_FAIL',
  RECOVERED = 'RECOVERED',
  COMMITTED = 'COMMITTED',
  PR_OPENED = 'PR_OPENED',
  CI_GREEN = 'CI_GREEN',
  CI_RED = 'CI_RED',
  BUDGET_OUT = 'BUDGET_OUT',
}

/** @brief Input gate sebelum COMMIT. @since 0.1.0 */
export interface GateInput {
  /** @brief Skor Pareto agregat dari critic plant. */
  paretoScore: number;
  /** @brief Ambang layak-commit (mis. 0.8). */
  paretoThreshold: number;
  /** @brief Quality-gate eval hijau (build/test/lint/secret-scan). */
  qualityGateGreen: boolean;
}

/** @brief Tabel transisi valid: state -> event -> next state. @since 0.1.0 */
export const transitions: Record<LoopState, Partial<Record<LoopEvent, LoopState>>> = {
  [LoopState.INTAKE]: { [LoopEvent.GOAL_READY]: LoopState.PLAN },
  [LoopState.PLAN]: { [LoopEvent.PLAN_OK]: LoopState.ISOLATE, [LoopEvent.BUDGET_OUT]: LoopState.RECOVER },
  [LoopState.ISOLATE]: { [LoopEvent.ISOLATED]: LoopState.EXECUTE },
  [LoopState.EXECUTE]: { [LoopEvent.EXECUTED]: LoopState.CRITIQUE, [LoopEvent.BUDGET_OUT]: LoopState.RECOVER },
  [LoopState.CRITIQUE]: { [LoopEvent.CRITIQUED]: LoopState.EVALUATE },
  [LoopState.EVALUATE]: { [LoopEvent.GATE_PASS]: LoopState.COMMIT, [LoopEvent.GATE_FAIL]: LoopState.RECOVER },
  [LoopState.RECOVER]: { [LoopEvent.RECOVERED]: LoopState.EXECUTE, [LoopEvent.BUDGET_OUT]: LoopState.DONE },
  [LoopState.COMMIT]: { [LoopEvent.COMMITTED]: LoopState.PR_OPEN },
  [LoopState.PR_OPEN]: { [LoopEvent.PR_OPENED]: LoopState.CI_WATCH },
  [LoopState.CI_WATCH]: { [LoopEvent.CI_GREEN]: LoopState.DONE, [LoopEvent.CI_RED]: LoopState.RECOVER },
  [LoopState.DONE]: {},
};

/** @brief Transisi state via event.
 * @param {LoopState} state - state saat ini.
 * @param {LoopEvent} ev - event pemicu.
 * @return {LoopState|null} next state, atau null bila transisi ilegal.
 * @since 0.1.0 */
export function transition(state: LoopState, ev: LoopEvent): LoopState | null {
  return transitions[state]?.[ev] ?? null;
}

/** @brief Gate sebelum COMMIT: state EVALUATE DAN Pareto >= threshold DAN quality-gate hijau.
 * @param {LoopState} state - state saat ini.
 * @param {GateInput} input - skor Pareto + status quality-gate.
 * @return {boolean} layak commit.
 * @since 0.1.0 */
export function gatePass(state: LoopState, input: GateInput): boolean {
  if (state !== LoopState.EVALUATE) return false;
  return input.paretoScore >= input.paretoThreshold && input.qualityGateGreen;
}
