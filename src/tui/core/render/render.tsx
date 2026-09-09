/**
 * @fileoverview TUI render — rendering engine for the Zhi terminal interface.
 * @since 0.1.11
 * @updated 0.1.11 — barrel re-export after structural split (Phase 1)
 * @package zhi
 */
export { type RenderOptions, type RenderContext, type Renderable } from './render-types';
export { Renderer, createRenderer } from './render-class';
export {
  renderBox,
  renderText,
  renderList,
  renderTable,
  renderProgress,
  renderSpinner,
  renderBadge,
  renderDivider,
  renderHelp,
} from './render-functions';
