/**
 * @fileoverview App state interface. @since 0.2.0
 * @package zhi
 */
import type {
  KeyboardMode,
  PaneId,
  PaneVisibility,
  PaneSizes,
  ThemeName,
  StreamStatus,
  LogLevel,
} from '../primitives';
import type {
  DagStep,
  LogEntry,
  CriticItem,
  EvalStage,
  FileNode,
  MetricsSummary,
  NotificationItem,
  TabItem,
  AgentInfo,
  NetworkRequest,
  GitStatus,
  AppConfig,
  SearchResult,
  SessionInfo,
} from '../entities';

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
