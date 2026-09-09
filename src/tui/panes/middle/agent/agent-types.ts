/**
 * @fileoverview Agent pane types — display entries, runtime log, props.
 * @since 0.1.11
 * @updated 0.2.6 — extracted from agent.tsx to enforce 150-SLOC guard
 * @package zhi
 */

/** @brief Agent display entry. @since 0.1.11 */
export interface AgentDisplay {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'failed' | 'terminated';
  capabilities: string[];
  tasksCompleted: number;
  tasksFailed: number;
  tokensUsed: number;
  lastActive?: number;
}

/** @brief Runtime event log entry. @since 0.1.11 */
export interface RuntimeLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  agentId?: string;
  message: string;
}

/** @brief Agent pane props. @since 0.1.11 */
export interface AgentPaneProps {
  agents: AgentDisplay[];
  runtimeLog: RuntimeLogEntry[];
  selectedAgent?: string;
  onDispatch?: (agentId: string, task: string) => void;
  onTerminate?: (agentId: string) => void;
  onRefresh?: () => void;
}
