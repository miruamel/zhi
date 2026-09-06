/**
 * @fileoverview Store primitive types — enums, base types. @since 0.2.0
 * @package zhi
 */

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

/** Stream status */
export type StreamStatus = 'idle' | 'streaming' | 'paused' | 'done' | 'error';

/** Keyboard mode */
export type KeyboardMode = 'normal' | 'insert' | 'command' | 'search';

/** Theme name */
export type ThemeName = 'dark' | 'light' | 'codespaces' | 'nord' | 'dracula';

/** Pane id */
export type PaneId =
  | 'header'
  | 'dag'
  | 'detail'
  | 'file-tree'
  | 'code-viewer'
  | 'metrics'
  | 'critics'
  | 'eval'
  | 'diff'
  | 'terminal'
  | 'agents'
  | 'network'
  | 'log'
  | 'help'
  | 'command-palette'
  | 'notifications'
  | 'status-bar'
  | 'config';

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
export type StepType =
  'research' | 'planning' | 'coding' | 'testing' | 'review' | 'deployment' | 'unknown';

/** Log entry level */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'system';
