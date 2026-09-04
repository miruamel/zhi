/** @brief Engine barrel — re-exports layout, pipeline, focus, perf modules. @since 0.1.2 */
export type { PaneId } from './focus/index';
export type { LayoutPane, LayoutConfig } from './layout/index';
export { DEFAULT_LAYOUT, buildDefaultLayout, resolveLayout, getPaneRow, togglePane } from './layout/index';
export type { LoopState, NextLoopCondition } from './pipeline/index';
export { LOOP_TRANSITIONS, validateTransition, nextLoopState, isTerminal, stateLabel, stateColor } from './pipeline/index';
export { FocusManager, createFocusManager } from './focus/index';
export { PerfTracker, createPerfTracker, measure, formatDuration } from './perf/index';