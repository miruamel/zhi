/**
 * @fileoverview Top-level TUI app state. @since 0.1.2 @updated 0.1.11
 * @package zhi
 */
import type {
  DagStep,
  CriticLine,
  EvalReport,
  PrCiState,
  LogEntry,
  Fact,
  ConflictEntry,
} from './extended';
import type { InspectorNode } from '../../../panes/middle/inspector/inspector';
import type { DebugBreakpoint, DebugVariable, DebugFrame } from '../../../panes/middle/debug/debug';
export interface AppState {
  loop: string;
  goal: string;
  steps: DagStep[];
  currentStepId?: string;
  critics: CriticLine[];
  criticItems: CriticItem[];
  criticsFilter: string;
  showFixedCritics: boolean;
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
  costEstimate: number;
  costBudget: number;
  costTrend?: number;
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
  memoryQuery?: string;
  memoryActiveTag?: string | null;
  embeddingDims?: number;
  runtimeLog: Array<{
    id: string;
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    agentId?: string;
    message: string;
  }>;
  selectedAgent?: string;
  configEntries: ConfigEntry[];
  // 0.1.13 additions — inspector pane
  inspectorNodes: InspectorNode[];
  inspectorSelected?: string;
  inspectorQuery?: string;
  // 0.1.13 additions — debug pane
  debugBreakpoints: DebugBreakpoint[];
  debugVariables: DebugVariable[];
  debugCallStack: DebugFrame[];
  debugSelectedFrame?: string;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
    timestamp: number;
    read?: boolean;
    persistent?: boolean;
  }>;
  unreadCount: number;
  /** @brief DAG conflict entries (M4c). @since 0.1.12 */
  conflicts: ConflictEntry[];
  conflictResolverOpen: boolean;
  selectedConflictId?: string;
  // 0.1.11 additions — dispatch/refresh patches from UI
  dispatch?: { agentId: string; task: string };
  refresh?: boolean;
}
