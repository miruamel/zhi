/**
 * @brief Layout-driven, focus-aware renderer + shared renderPane mapper.
 *
 * `LayoutRenderer` wires panes, focus border, and the error boundary; skips
 * panes flagged invisible. `renderPane` maps a `PaneId` to its component with
 * the props it expects, shared with `app.tsx`.
 *
 * @since 0.2.0
 */
export { LayoutRenderer, type LayoutRendererProps } from './layout-render';
export { renderPane, type PaneRenderState } from './pane-renderer';
