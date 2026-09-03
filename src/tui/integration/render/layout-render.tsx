/** @brief Layout-aware renderer: filters visible panes via resolveLayout, focuses the active pane. @since 0.1.2 */
import React from 'react';
import { Box } from 'ink';
import { colors } from '../core/style/colors';
import { resolveLayout, type LayoutConfig } from '../engine/builder.ts';
import type { PaneId } from '../engine/focus.ts';
import type { AppState } from '../core/state.ts';
import { PaneErrorBoundary } from '../error';
import { renderPane } from './pane-renderer.tsx';
/** @brief Props for the integration-layer renderer. @since 0.1.2 */
export interface LayoutRendererProps {
  config: LayoutConfig;
  state: AppState;
  threshold: number;
  onAbort?: () => void;
  onQuit?: () => void;
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
  focusedPane?: PaneId;
  onPaneFocus?: (id: PaneId) => void;
  onTogglePane?: (id: PaneId) => void;
}


/** @brief Derive the visible set from a LayoutConfig (panes whose flag is true). */
function visibleSet(config: LayoutConfig): Set<PaneId> {
  const set = new Set<PaneId>();
  for (const p of config.panes) {
    if (p.visible) set.add(p.id);
  }
  return set;
}

/**
 * @brief Layout-driven, focus-aware renderer. Wires panes, focus border,
 *        and the error boundary; skips panes flagged invisible.
 * @since 0.1.2
 */
export function LayoutRenderer(props: LayoutRendererProps): React.ReactElement {
  const { config, state, threshold, focusedPane } = props;
  const visible = visibleSet(config);
  const resolved = resolveLayout(config, visible);
  const currentStep = state.steps.find((s) => s.id === state.currentStepId);

  return (
    <Box flexDirection="column">
      {resolved.panes.map((pane) => {
        const element = renderPane(pane.id, state, threshold, currentStep);
        if (!element) return null;
        const isFocused = focusedPane === pane.id;
        const borderColor = isFocused ? colors.accent : colors.fgDim;
        return (
          <PaneErrorBoundary key={pane.id} paneName={pane.id}>
            <Box borderStyle="single" borderColor={borderColor} flexDirection="column">
              {element}
            </Box>
          </PaneErrorBoundary>
        );
      })}
    </Box>
  );
}