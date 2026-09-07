/**
 * @fileoverview Metrics, config, and theme entity types. @since 0.2.0
 * @package zhi
 */
import type { ThemeName } from '../primitives';

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
