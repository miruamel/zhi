/** @brief Engine barrel — re-exports layout, pipeline, focus, perf modules. @since 0.1.2 */
export type { PaneId, LayoutPane, LayoutConfig } from './builder';
export { DEFAULT_LAYOUT, buildDefaultLayout, resolveLayout, getPaneRow, togglePane } from './builder';
export type { LoopState } from './pipeline';
export { LOOP_TRANSITIONS, validateTransition, nextLoopState, isTerminal, stateLabel, stateColor } from './pipeline';
export { FocusManager, createFocusManager } from './focus';
export { PerfTracker, createPerfTracker, measure, formatDuration } from './perf';