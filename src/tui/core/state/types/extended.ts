/**
 * @fileoverview File and network types for TUI state. @since 0.2.0
 * @package zhi
 */
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
