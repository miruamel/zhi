/**
 * @brief Layout builder: maps pane identifiers to grid positions.
 * @since 0.1.1
 */
import type { PaneId } from "./focus.ts";

/** @brief One pane's placement inside the grid. */
export interface LayoutPane {
  id: PaneId;
  row: number;
  col: number;
  span: number;
  visible: boolean;
}

/** @brief Whole-grid layout: rows, cols, and each pane's position. */
export interface LayoutConfig {
  panes: LayoutPane[];
  rows: number;
  cols: number;
}

const PANE_POSITIONS: ReadonlyArray<Omit<LayoutPane, "visible">> = [
  { id: "header", row: 0, col: 0, span: 4 },
  { id: "dag", row: 1, col: 0, span: 2 },
  { id: "detail", row: 1, col: 2, span: 2 },
  { id: "metrics", row: 2, col: 0, span: 2 },
  { id: "critics", row: 2, col: 2, span: 2 },
  { id: "timeline", row: 3, col: 0, span: 2 },
  { id: "stages", row: 3, col: 2, span: 2 },
  { id: "eval", row: 4, col: 0, span: 1 },
  { id: "pr", row: 4, col: 1, span: 1 },
  { id: "knowledge", row: 4, col: 2, span: 1 },
  { id: "code", row: 4, col: 3, span: 1 },
  { id: "config", row: 5, col: 0, span: 1 },
  { id: "help", row: 5, col: 1, span: 1 },
  { id: "log", row: 5, col: 2, span: 1 },
  { id: "terminal", row: 5, col: 3, span: 1 },
  { id: "agents", row: 6, col: 0, span: 1 },
  { id: "files", row: 6, col: 1, span: 1 },
  { id: "diff", row: 6, col: 2, span: 1 },
  { id: "secrets", row: 6, col: 3, span: 1 },
  { id: "notifications", row: 7, col: 0, span: 1 },
  { id: "network", row: 7, col: 1, span: 1 },
  { id: "resources", row: 7, col: 2, span: 1 },
  { id: "gate", row: 7, col: 3, span: 1 },
  { id: "audit", row: 8, col: 0, span: 1 },
  { id: "queue", row: 8, col: 1, span: 1 },
  { id: "profile", row: 8, col: 2, span: 1 },
];

const GRID_ROWS = 9;
const GRID_COLS = 4;

/** @brief Default layout: every pane visible at its canonical position. */
export const DEFAULT_LAYOUT: LayoutConfig = {
  panes: PANE_POSITIONS.map((p) => ({ ...p, visible: true })),
  rows: GRID_ROWS,
  cols: GRID_COLS,
};

/** @brief Return a fresh default layout. Equivalent to `DEFAULT_LAYOUT`. */
export function buildDefaultLayout(): LayoutConfig {
  return {
    panes: PANE_POSITIONS.map((p) => ({ ...p, visible: true })),
    rows: GRID_ROWS,
    cols: GRID_COLS,
  };
}

/** @brief Filter `config` to panes in `visible`; keep grid dimensions. */
export function resolveLayout(
  config: LayoutConfig,
  visible: Set<PaneId>,
): LayoutConfig {
  return {
    panes: config.panes.filter((p) => visible.has(p.id)),
    rows: config.rows,
    cols: config.cols,
  };
}

/** @brief Row index for `id`, or undefined if absent. */
export function getPaneRow(
  id: PaneId,
  config: LayoutConfig,
): number | undefined {
  return config.panes.find((p) => p.id === id)?.row;
}

/** @brief Flip visibility of `id`; leave positions and grid unchanged. */
export function togglePane(id: PaneId, config: LayoutConfig): LayoutConfig {
  return {
    panes: config.panes.map((p) =>
      p.id === id ? { ...p, visible: !p.visible } : p,
    ),
    rows: config.rows,
    cols: config.cols,
  };
}
