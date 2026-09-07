/**
 * @fileoverview Loop pane — loop control, pause/resume/abort.
 * @since 0.2.2
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief Loop pane props. @since 0.2.2 */
export interface LoopPaneProps {
  loop: string;
  paused: boolean;
  aborted: boolean;
  finished: boolean;
  partial: boolean;
  stepsCompleted: number;
  stepsTotal: number;
  onTogglePause?: () => void;
  onAbort?: () => void;
  onRestart?: () => void;
}

const STATUS_TEXT: Record<string, string> = {
  running: 'RUNNING',
  paused: 'PAUSED',
  aborted: 'ABORTED',
  finished: 'FINISHED',
  partial: 'PARTIAL',
};

/** @brief Render the loop pane. @since 0.2.2 */
export function LoopPane({
  loop,
  paused,
  aborted,
  finished,
  partial,
  stepsCompleted,
  stepsTotal,
  onTogglePause,
  onAbort,
  onRestart,
}: LoopPaneProps) {
  let status = 'running';
  if (aborted) status = 'aborted';
  else if (finished) status = 'finished';
  else if (partial) status = 'partial';
  else if (paused) status = 'paused';

  const statusColor =
    status === 'running'
      ? colors.forward
      : status === 'paused'
        ? colors.warn
        : status === 'aborted'
          ? colors.error
          : colors.complete;

  const pct = stepsTotal > 0 ? (stepsCompleted / stepsTotal) * 100 : 0;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={statusColor}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={statusColor} bold>
        _LOOP · {STATUS_TEXT[status]}
      </Text>
      <Box marginTop={1}>
        <Text color={colors.fgDim}>{loop}</Text>
      </Box>
      <Box gap={2} marginTop={1}>
        <Text color={colors.fgDim}>
          {stepsCompleted}/{stepsTotal} ({pct.toFixed(0)}%)
        </Text>
      </Box>
      <Box gap={1} marginTop={1}>
        {onTogglePause && !aborted && !finished && (
          <Text color={colors.complete}>
            [{paused ? 'r' : 'p'}] {paused ? 'resume' : 'pause'}
          </Text>
        )}
        {onAbort && !aborted && !finished && <Text color={colors.error}>[x] abort</Text>}
        {onRestart && (aborted || finished) && <Text color={colors.forward}>[n] restart</Text>}
      </Box>
    </Box>
  );
}
