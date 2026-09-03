/** @brief Engine barrel — re-exports layout, pipeline, focus, perf modules. @since 0.1.2 */
export type { PaneId } from './focus/index.ts';
export type { LayoutPane, LayoutConfig } from './layout/index.ts';
export { DEFAULT_LAYOUT, buildDefaultLayout, resolveLayout, getPaneRow, togglePane } from './layout/index.ts';
export type { LoopState, NextLoopCondition } from './pipeline/index.ts';
export { LOOP_TRANSITIONS, validateTransition, nextLoopState, isTerminal, stateLabel, stateColor } from './pipeline/index.ts';
export { FocusManager, createFocusManager } from './focus/index.ts';
export { PerfTracker, createPerfTracker, measure, formatDuration } from './perf/index.ts';