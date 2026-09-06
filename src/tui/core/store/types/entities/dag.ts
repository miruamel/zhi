/**
 * @fileoverview DAG, log, critic, and git entity types. @since 0.2.0
 * @package zhi
 */
import type { LogLevel, StepStatus, StepType } from '../primitives';
import type { FileChange } from './filetree';

/** DAG step */
export interface DagStep {
  id: string;
  type: StepType;
  title: string;
  status: StepStatus;
  startTime?: number;
  endTime?: number;
  duration?: number;
  tokens?: number;
  cost?: number;
  children?: string[];
  parent?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/** Eval check */
export interface EvalCheck {
  id: string;
  name: string;
  passed: boolean;
  message?: string;
  duration?: number;
}

/** Eval stage */
export interface EvalStage {
  id: string;
  name: string;
  status: StepStatus;
  score?: number;
  maxScore?: number;
  duration?: number;
  checks?: EvalCheck[];
}

/** Log entry */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

/** Critic item */
export interface CriticItem {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
  autoFix?: boolean;
  fixed?: boolean;
}

/** Git status */
export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: FileChange[];
  unstaged: FileChange[];
  untracked: string[];
  conflicted: string[];
}
