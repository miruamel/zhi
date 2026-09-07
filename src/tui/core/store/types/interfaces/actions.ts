/**
 * @fileoverview Store actions interface. @since 0.2.0
 * @package zhi
 */
import type { KeyboardMode, PaneId, ThemeName, StreamStatus, LogLevel } from '../primitives';
import type {
  DagStep,
  LogEntry,
  CriticItem,
  EvalStage,
  FileNode,
  MetricPoint,
  MetricsSummary,
  NotificationItem,
  TabItem,
  AgentInfo,
  NetworkRequest,
  GitStatus,
  AppConfig,
  SearchResult,
} from '../entities';

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
