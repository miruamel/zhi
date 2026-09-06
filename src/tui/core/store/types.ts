/**
 * @fileoverview Store types - Core state management interfaces
 * @description Type definitions for the reactive state store
 * @package zhi
 */

import type { FC, ReactNode } from 'react';

// ============================================================================
// Store Types
// ============================================================================

/** Action type for store updates */
export type Action<S> = (state: S) => Partial<S> | void;

/** Middleware for store */
export interface Middleware<S> {
  (action: Action<S>, prevState: S, nextState: S): void;
}

/** Subscribe callback */
export type Subscriber<S> = (state: S, prevState: S) => void;

/** Selector function */
export type Selector<T, S> = (state: S) => T;

/** Equality function for selectors */
export type EqualityFn<T> = (a: T, b: T) => boolean;

// ============================================================================
// App State Types
// ============================================================================

/** Stream status */
export type StreamStatus = 'idle' | 'streaming' | 'paused' | 'done' | 'error';

/** Keyboard mode */
export type KeyboardMode = 'normal' | 'insert' | 'command' | 'search';

/** Theme name */
export type ThemeName = 'dark' | 'light' | 'codespaces' | 'nord' | 'dracula';

/** Pane id */
export type PaneId = 'header' | 'dag' | 'detail' | 'file-tree' | 'code-viewer' | 'metrics' | 'critics' | 'eval' | 'diff' | 'terminal' | 'agents' | 'network' | 'log' | 'help' | 'command-palette' | 'notifications' | 'status-bar' | 'config';

/** Pane visibility */
export interface PaneVisibility {
  [key: string]: boolean;
}

/** Pane size */
export interface PaneSizes {
  [key: string]: number;
}

/** DAG step status */
export type StepStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped';

/** DAG step type */
export type StepType = 'research' | 'planning' | 'coding' | 'testing' | 'review' | 'deployment' | 'unknown';

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

/** Log entry level */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'system';

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

/** Eval check */
export interface EvalCheck {
  id: string;
  name: string;
  passed: boolean;
  message?: string;
  duration?: number;
}

/** File node for tree */
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size?: number;
  modified?: number;
  children?: FileNode[];
  expanded?: boolean;
  selected?: boolean;
  icon?: string;
  depth?: number;
}

/** Notification item */
export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: number;
  read?: boolean;
  persistent?: boolean;
  action?: NotificationAction;
}

/** Notification action */
export interface NotificationAction {
  label: string;
  onClick: () => void;
}

/** Command item for palette */
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category?: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

/** Tab item */
export interface TabItem {
  id: string;
  title: string;
  icon?: string;
  modified?: boolean;
  closable?: boolean;
  paneId?: PaneId;
}

/** Agent info */
export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  tasks?: string[];
  memory?: number;
  tokens?: number;
  startTime?: number;
}

/** Network request */
export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
  size?: number;
  error?: string;
}

/** Metric data point */
export interface MetricPoint {
  timestamp: number;
  value: number;
  label?: string;
}

/** Metrics summary */
export interface MetricsSummary {
  tokensUsed: number;
  tokensLimit: number;
  costTotal: number;
  costBudget: number;
  stepsCompleted: number;
  stepsTotal: number;
  successRate: number;
  avgStepDuration: number;
  tokensHistory: MetricPoint[];
  costHistory: MetricPoint[];
  stepsHistory: MetricPoint[];
}

/** Theme colors */
export interface ThemeColors {
  bg: string;
  bgAlt: string;
  fg: string;
  fgAlt: string;
  fgMuted: string;
  accent: string;
  accentAlt: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  borderAlt: string;
  highlight: string;
  highlightAlt: string;
  scrollbar: string;
  selection: string;
}

/** Theme definition */
export interface Theme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
  icons?: Record<string, string>;
}

/** Config setting */
export interface ConfigSetting {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  value: unknown;
  options?: { label: string; value: unknown }[];
  description?: string;
}

/** App config */
export interface AppConfig {
  theme: ThemeName;
  fontSize: number;
  fontFamily: string;
  animations: boolean;
  sound: boolean;
  notifications: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  maxLogEntries: number;
  maxHistorySteps: number;
  syntaxTheme: string;
  showHiddenFiles: boolean;
  confirmQuit: boolean;
}

/** Stream message */
export interface StreamMessage {
  type: 'chunk' | 'done' | 'error' | 'tool_call' | 'tool_result';
  content: string;
  tool?: string;
  args?: unknown;
  error?: string;
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

/** File change */
export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  hunks?: DiffHunk[];
}

/** Diff hunk */
export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

/** Diff line */
export interface DiffLine {
  type: 'context' | 'add' | 'delete' | 'header';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
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

// ============================================================================
// Store Interfaces
// ============================================================================

/** Main app store interface */
export interface AppState {
  // UI State
  keyboardMode: KeyboardMode;
  activePane: PaneId;
  paneVisibility: PaneVisibility;
  paneSizes: PaneSizes;
  theme: ThemeName;
  sidebarWidth: number;
  statusBarHeight: number;

  // Stream State
  streamStatus: StreamStatus;
  streamContent: string;
  streamTokens: number;

  // DAG State
  steps: DagStep[];
  currentStepId: string | null;
  expandedSteps: Set<string>;

  // Log State
  logs: LogEntry[];
  logFilter: LogLevel | 'all';
  logSearch: string;

  // Critics State
  critics: CriticItem[];
  criticsFilter: string;
  showFixedCritics: boolean;

  // Eval State
  evalStages: EvalStage[];

  // File Tree State
  fileTreeRoot: FileNode | null;
  fileTreeFilter: string;
  selectedFilePath: string | null;

  // Code Viewer State
  codeContent: string | null;
  codeLanguage: string;
  codeCursorLine: number;
  codeScrollOffset: number;

  // Metrics State
  metrics: MetricsSummary;

  // Notifications State
  notifications: NotificationItem[];
  unreadCount: number;

  // Command Palette State
  commandPaletteOpen: boolean;
  commandSearch: string;

  // Tabs State
  tabs: TabItem[];
  activeTabId: string | null;

  // Agents State
  agents: AgentInfo[];

  // Network State
  networkRequests: NetworkRequest[];

  // Git State
  gitStatus: GitStatus | null;

  // Config State
  config: AppConfig;

  // Session State
  session: SessionInfo | null;
  sessions: SessionInfo[];

  // Search State
  globalSearchOpen: boolean;
  globalSearchQuery: string;
  globalSearchResults: SearchResult[];
}

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

/** Store actions */
export interface StoreActions {
  // UI Actions
  setKeyboardMode: (mode: KeyboardMode) => void;
  setActivePane: (pane: PaneId) => void;
  togglePaneVisibility: (pane: PaneId) => void;
  setPaneSize: (pane: PaneId, size: number) => void;
  setTheme: (theme: ThemeName) => void;
  setSidebarWidth: (width: number) => void;

  // Stream Actions
  setStreamStatus: (status: StreamStatus) => void;
  appendStreamContent: (content: string) => void;
  clearStreamContent: () => void;

  // DAG Actions
  addStep: (step: DagStep) => void;
  updateStep: (id: string, updates: Partial<DagStep>) => void;
  removeStep: (id: string) => void;
  setCurrentStep: (id: string | null) => void;
  toggleStepExpanded: (id: string) => void;
  clearSteps: () => void;

  // Log Actions
  addLog: (entry: LogEntry) => void;
  clearLogs: () => void;
  setLogFilter: (filter: LogLevel | 'all') => void;
  setLogSearch: (search: string) => void;

  // Critics Actions
  addCritic: (critic: CriticItem) => void;
  removeCritic: (id: string) => void;
  fixCritic: (id: string) => void;
  setCriticsFilter: (filter: string) => void;
  toggleShowFixedCritics: () => void;

  // Eval Actions
  addEvalStage: (stage: EvalStage) => void;
  updateEvalStage: (id: string, updates: Partial<EvalStage>) => void;
  clearEvalStages: () => void;

  // File Tree Actions
  setFileTreeRoot: (root: FileNode | null) => void;
  toggleFileExpanded: (id: string) => void;
  selectFile: (path: string) => void;
  setFileTreeFilter: (filter: string) => void;

  // Code Viewer Actions
  setCodeContent: (content: string | null, language?: string) => void;
  setCodeCursorLine: (line: number) => void;
  setCodeScrollOffset: (offset: number) => void;

  // Metrics Actions
  updateMetrics: (updates: Partial<MetricsSummary>) => void;
  addMetricPoint: (type: 'tokens' | 'cost' | 'steps', point: MetricPoint) => void;

  // Notification Actions
  addNotification: (notification: NotificationItem) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Command Palette Actions
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setCommandSearch: (search: string) => void;

  // Tab Actions
  addTab: (tab: TabItem) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<TabItem>) => void;

  // Agent Actions
  addAgent: (agent: AgentInfo) => void;
  updateAgent: (id: string, updates: Partial<AgentInfo>) => void;
  removeAgent: (id: string) => void;

  // Network Actions
  addNetworkRequest: (request: NetworkRequest) => void;
  clearNetworkRequests: () => void;

  // Git Actions
  setGitStatus: (status: GitStatus | null) => void;

  // Config Actions
  updateConfig: (updates: Partial<AppConfig>) => void;

  // Session Actions
  saveSession: () => void;
  loadSession: (id: string) => void;
  createSession: (name: string) => void;
  deleteSession: (id: string) => void;

  // Search Actions
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  setGlobalSearchQuery: (query: string) => void;
  setGlobalSearchResults: (results: SearchResult[]) => void;

  // Bulk Actions
  reset: () => void;
}

/** Full store type */
export type Store = AppState & StoreActions;
