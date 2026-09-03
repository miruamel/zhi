/** @brief Timeline pane: stage start/finish/error events in chronological order. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';
import { formatMs, formatTime } from '../../../core/style/format';
import type { TimelineEntry } from '../../../core/state';

export interface TimelineProps {
  entries: TimelineEntry[];
  maxLines?: number;
}

const EVENT_ICON: Record<string, string> = {
  start: '▶',
  finish: '◆',
  error: '✖',
  skip: '⊘',
};

const EVENT_COLOR: Record<string, string> = {
  start: colors.accent,
  finish: colors.done,
  error: colors.failed,
  skip: colors.fgDim,
};

/** @brief Render the timeline pane. @since 0.1.1 */
export function Timeline({ entries, maxLines = 12 }: TimelineProps) {
  const visible = entries.slice(-maxLines);
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accent}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accent} bold>
        ◈ TIMELINE ({entries.length})
      </Text>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no events yet)</Text>
      ) : (
        visible.map((e, i) => (
          <Box key={i}>
            <Text color={EVENT_COLOR[e.event] ?? colors.fgDim}>{EVENT_ICON[e.event] ?? '·'} </Text>
            <Text color={colors.fgDim}>{formatTime(e.ts)} </Text>
            <Text color={colors.fgDim}>{e.stage.padEnd(14)} </Text>
            <Text color={EVENT_COLOR[e.event] ?? colors.fgDim}>{e.event}</Text>
            {e.ms !== undefined && <Text color={colors.fgDim}> {formatMs(e.ms)}</Text>}
            {e.msg && <Text color={colors.fgDim}> · {e.msg}</Text>}
          </Box>
        ))
      )}
    </Box>
  );
}
