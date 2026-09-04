/**
 * @brief TUI application state shape (derived from LoopMetrics + LoopLogger).
 * @since 0.1.0
 */

/** @brief Single critic score line. @since 0.1.0 */
export interface CriticLine {
  name: string;
  score: number;
  abstain?: boolean;
  reason?: string;
}

/** @brief Per-stage eval status. @since 0.1.0 */
export interface EvalStage {
  name: string;
  ok: boolean;
  detail: string;
  durationMs: number;
}

/** @brief Full eval report. @since 0.1.0 */
export interface EvalReport {
  build: EvalStage;
  test: EvalStage;
  security: EvalStage;
  gate: EvalStage;
  gatePass: boolean;
  weightedAvg: number;
}

/** @brief One DAG step in the conductor plan. @since 0.1.0 */
export interface DagStep {
  id: string;
  kind: 'generate' | 'verify' | 'critique' | 'eval' | 'commit' | 'pr' | 'classify' | 'isolate';
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  tokenBudget?: number;
  tokensUsed?: number;
  detail?: string;
}

/** @brief Log entry from LoopLogger. @since 0.1.0 */
export interface LogEntry {
  ts: number;
  runId: string;
  from?: string;
  to?: string;
  event?: string;
  kind: 'transition' | 'info' | 'warn' | 'error' | 'gate';
  msg: string;
}

/** @brief Active PR / CI state. @since 0.1.0 */
export interface PrCiState {
  prUrl?: string;
  prNumber?: number;
  ciStatus?: 'unknown' | 'pending' | 'green' | 'red';
  ciDurationMs?: number;
}

/** @brief Top-level TUI app state. @since 0.1.0 */
export interface AppState {
  loop: string;
  goal: string;
  steps: DagStep[];
  currentStepId?: string;
  critics: CriticLine[];
  eval: EvalReport;
  prCi: PrCiState;
  log: LogEntry[];
  metrics: {
    stages: number;
    errors: number;
    totalMs: number;
    recoverAttempts: number;
  };
  tokensUsed: number;
  tokensBudget: number;
  startedAt: number;
  finished: boolean;
  aborted: boolean;
  partial: boolean;
}

/** @brief Empty default state. @since 0.1.0 */
export function emptyState(goal: string, tokensBudget: number): AppState {
  return {
    loop: 'INTAKE',
    goal,
    steps: [],
    critics: [],
    eval: {
      build: { name: 'build', ok: false, detail: '', durationMs: 0 },
      test: { name: 'test', ok: false, detail: '', durationMs: 0 },
      security: { name: 'security', ok: false, detail: '', durationMs: 0 },
      gate: { name: 'gate', ok: false, detail: '', durationMs: 0 },
      gatePass: false,
      weightedAvg: 0,
    },
    prCi: { ciStatus: 'unknown' },
    log: [],
    metrics: { stages: 0, errors: 0, totalMs: 0, recoverAttempts: 0 },
    tokensUsed: 0,
    tokensBudget,
    startedAt: Date.now(),
    finished: false,
    aborted: false,
    partial: false,
  };
}
