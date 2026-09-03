/** @brief React error boundary for panes — catches render-time crashes and shows a fallback. @since 0.1.2 */
import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../../core/style/colors';

/** @brief Props for the fallback UI element. @since 0.1.2 */
export interface PaneErrorFallbackProps {
  /** @brief Stable pane id used in headings and tests. */
  paneName: string;
  /** @brief Captured error from getDerivedStateFromError. */
  error?: Error;
  /** @brief Optional reset handler from the boundary owner. */
  onReset?: () => void;
}

/** @brief Default fallback shown when a pane throws during render. @since 0.1.2 */
export function PaneErrorFallback({ paneName, error, onReset }: PaneErrorFallbackProps): React.ReactElement {
  const message = error?.message ?? 'unknown error';
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={colors.error} bold>{`! ${paneName} crashed`}</Text>
      <Text color={colors.fgDim}>{message}</Text>
      {onReset ? <Text color={colors.accentBlue}>{'[r] retry'}</Text> : null}
    </Box>
  );
}

/** @brief Props for PaneErrorBoundary. @since 0.1.2 */
export interface PaneErrorBoundaryProps {
  /** @brief Pane subtree to guard. */
  children: React.ReactNode;
  /** @brief Stable pane id surfaced in the fallback. */
  paneName: string;
  /** @brief Optional custom fallback element; defaults to PaneErrorFallback. */
  fallback?: React.ReactNode;
  /** @brief Optional reset callback forwarded to the fallback. */
  onReset?: () => void;
}

/** @brief React error boundary state. @since 0.1.2 */
interface PaneErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/** @brief Error boundary that isolates pane render failures from the rest of the TUI. @since 0.1.2 */
export class PaneErrorBoundary extends React.Component<PaneErrorBoundaryProps, PaneErrorBoundaryState> {
  state: PaneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): PaneErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidMount(): void {
    // No-op mount hook kept explicit so subclasses have a stable override point.
    // ponytail: when wiring telemetry, push { paneName, error } here without touching render.
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) return this.props.fallback;
      return (
        <PaneErrorFallback
          paneName={this.props.paneName}
          error={this.state.error}
          onReset={this.props.onReset}
        />
      );
    }
    return this.props.children;
  }
}