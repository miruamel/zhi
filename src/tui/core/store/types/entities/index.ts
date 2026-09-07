/**
 * @fileoverview Store entity types — barrel re-export. @since 0.2.0
 * @package zhi
 */
import type { DagStep } from './dag';
import type { MetricsSummary } from './metrics-config';
export type { StepStatus, StepType, ThemeName } from '../primitives';
export type { DagStep, EvalCheck, EvalStage, LogEntry, CriticItem, GitStatus } from './dag';
export type { FileNode, FileChange, DiffHunk, DiffLine } from './filetree';
export type {
  NotificationAction,
  NotificationItem,
  CommandItem,
  TabItem,
  AgentInfo,
  NetworkRequest,
} from './notification-palette';
export type { MetricPoint, MetricsSummary } from './metrics-config';
export type { ThemeColors, Theme, ConfigSetting, AppConfig } from './metrics-config';

/** Search result */
export interface SearchResult {
  id: string;
  type: 'file' | 'code' | 'step' | 'log' | 'command';
  title: string;
  description?: string;
  path?: string;
  line?: number;
  score: number;
}

/** Stream message */
export interface StreamMessage {
  type: 'chunk' | 'done' | 'error' | 'tool_call' | 'tool_result';
  content: string;
  tool?: string;
  args?: unknown;
  error?: string;
}

/** Session info */
export interface SessionInfo {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  projectPath?: string;
  steps: DagStep[];
  metrics: MetricsSummary;
  tags?: string[];
}
