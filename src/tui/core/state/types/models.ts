/**
 * @fileoverview Model types for TUI state. @since 0.1.2
 * @package zhi
 */
/** @brief Single critic score line. @since 0.1.2 */
export interface CriticLine {
  name: string;
  score: number;
  abstain?: boolean;
  reason?: string;
}

/** @brief Per-stage eval status. @since 0.1.2 */
export interface EvalStage {
  name: string;
  ok: boolean;
  detail: string;
  durationMs: number;
}

/** @brief Full eval report. @since 0.1.2 */
export interface EvalReport {
  build: EvalStage;
  test: EvalStage;
  security: EvalStage;
  gate: EvalStage;
  gatePass: boolean;
  weightedAvg: number;
}

/** @brief One DAG step in the conductor plan. @since 0.1.2 */
export interface DagStep {
  id: string;
  kind: 'generate' | 'verify' | 'critique' | 'eval' | 'commit' | 'pr' | 'classify' | 'isolate';
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  tokenBudget?: number;
  tokensUsed?: number;
  detail?: string;
}

/** @brief Log entry from LoopLogger. @since 0.1.2 */
export interface LogEntry {
  ts: number;
  runId: string;
  from?: string;
  to?: string;
  event?: string;
  kind: 'transition' | 'info' | 'warn' | 'error' | 'gate';
  msg: string;
}

/** @brief Active PR / CI state. @since 0.1.2 */
export interface PrCiState {
  prUrl?: string;
  prNumber?: number;
  ciStatus?: 'unknown' | 'pending' | 'green' | 'red';
  ciDurationMs?: number;
}
