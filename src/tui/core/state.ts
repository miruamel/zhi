/**
 * @brief TUI application state shape (derived from LoopMetrics + LoopLogger).
 * @since 0.1.2
 * @updated 0.2.0 — added file tree, terminal, network, agents, diff fields
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

/** @brief File entry for tree view. @since 0.2.0 */
export interface FileEntry {
  path: string;
  type: 'file' | 'dir';
  size?: number;
  modified?: number;
}

/** @brief Network request record. @since 0.2.0 */
export interface NetworkRequest {
  url: string;
  status: number;
  durationMs: number;
  timestamp: number;
}

/** @brief Agent info for agents pane. @since 0.2.0 */
export interface AgentInfo {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'done' | 'failed';
  tasksCompleted: number;
  currentTask?: string;
}

/** @brief Git state. @since 0.1.2 */
export interface GitState {
  branch?: string;
  ahead?: number;
  behind?: number;
}

/** @brief Top-level TUI app state. @since 0.1.2 @updated 0.2.0 */
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
  // 0.2.0 additions
  files: FileEntry[];
  selectedFile?: string;
  fileContent?: string;
  fileLanguage?: string;
  diff?: string;
  terminalLines: string[];
  networkRequests: NetworkRequest[];
  networkOnline: boolean;
  agents: AgentInfo[];
  tokenSparkline: number[];
  git?: GitState;
  prUrl?: string;
}

/** @brief Empty default state. @since 0.1.2 @updated 0.2.0 */
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
    // 0.2.0 defaults
    files: [],
    terminalLines: [],
    networkRequests: [],
    networkOnline: true,
    agents: [],
    tokenSparkline: [],
  };
}