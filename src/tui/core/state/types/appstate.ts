/**
 * @fileoverview Top-level TUI app state. @since 0.1.2 @updated 0.2.0
 * @package zhi
 */
import type { DagStep, CriticLine, EvalReport, PrCiState, LogEntry, Fact } from './models';
import type {
  FileEntry,
  NetworkRequest,
  AgentInfo,
  GitState,
  SessionInfo,
  ConfigEntry,
} from './extended';
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
  // 0.2.1 additions — session, memory, settings panes
  sessions: SessionInfo[];
  activeSessionId?: string;
  memoryFacts: Fact[];
  configEntries: ConfigEntry[];
}
