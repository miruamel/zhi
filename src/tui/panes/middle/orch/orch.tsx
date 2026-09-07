/**
 * @fileoverview Orchestrator pane — DAG visualizer, step scheduling.
 * @since 0.2.2
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import type { DagStep } from '../../../core/state';

/** @brief One step summary row. @since 0.2.2 */
export interface OrchStep {
  id: string;
  kind: string;
  title: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  tokens?: number;
}

export interface OrchPaneProps {
  steps: OrchStep[];
  currentStepId?: string;
  onStepAbort?: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  pending: colors.fgDim,
  running: colors.forward,
  done: colors.complete,
  failed: colors.error,
  skipped: colors.warn,
};

const STATUS_ICON: Record<string, string> = {
  pending: '○',
  running: '◐',
  done: '●',
  failed: '✗',
  skipped: '⊘',
};

/** @brief Render the orchestrator pane. @since 0.2.2 */
export function OrchPane({ steps, currentStepId, onStepAbort }: OrchPaneProps) {
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const failedCount = steps.filter((s) => s.status === 'failed').length;
  const runningCount = steps.filter((s) => s.status === 'running').length;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _ORCH ({steps.length} · {doneCount}✓ {runningCount}▶ {failedCount}✗)
      </Text>
      {steps.length === 0 ? (
        <Text color={colors.fgDim}>No steps yet.</Text>
      ) : (
        steps.map((s) => {
          const isCurrent = s.id === currentStepId;
          const color = isCurrent ? colors.forward : (STATUS_COLOR[s.status] ?? colors.fg);
          const icon = STATUS_ICON[s.status] ?? '?';
          const tokenStr = s.tokens != null ? ` ${s.tokens}t` : '';
          return (
            <Box key={s.id} gap={1}>
              <Text color={color}>
                {isCurrent ? '▸ ' : '  '}
                {icon} {s.title.length > 28 ? s.title.slice(0, 27) + '…' : s.title}
                <Text color={colors.fgDim}>{tokenStr}</Text>
              </Text>
            </Box>
          );
        })
      )}
      {onStepAbort && (
        <Box marginTop={1}>
          <Text color={colors.error}>[x] abort</Text>
        </Box>
      )}
    </Box>
  );
}

/** @brief Convert DagStep to OrchStep. @since 0.2.2 */
export function toOrchStep(s: DagStep): OrchStep {
  return {
    id: s.id,
    kind: s.kind,
    title: s.detail ?? s.id,
    status: s.status,
    tokens: s.tokensUsed,
  };
}
