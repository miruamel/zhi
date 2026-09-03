/** @brief Log pane: append-only log stream with filters. @since 0.1.0 */
import { Box, Text } from 'ink';
import { colors } from '../../colors';
import { formatTime, truncate } from '../../format';
import type { LogEntry } from '../../state';

export interface LogProps {
  log: LogEntry[];
  expanded: boolean;
  maxLines: number;
}

function kindColor(k: LogEntry['kind']): string {
  switch (k) {
    case 'transition':
      return colors.accent;
    case 'gate':
      return colors.warn;
    case 'error':
      return colors.error;
    case 'warn':
      return colors.warn;
    case 'info':
    default:
      return colors.fg;
  }
}

/** @brief Render the log pane (latest N entries, color-coded). @since 0.1.0 */
export function Log({ log, expanded, maxLines }: LogProps) {
  const visible = expanded ? log.slice(-maxLines) : log.slice(-Math.min(8, maxLines));
  const hiddenCount = log.length - visible.length;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.fgDim}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.fgDim} bold>
        ℹ LOG ({log.length} entries{hiddenCount > 0 ? `, ${hiddenCount} hidden` : ''})
      </Text>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no events yet)</Text>
      ) : (
        visible.map((e, i) => (
          <Box key={i} gap={1}>
            <Text color={colors.fgDim}>{formatTime(e.ts)}</Text>
            <Text color={kindColor(e.kind)} bold>
              {e.kind.padEnd(10)}
            </Text>
            <Text color={colors.fg}>{truncate(e.msg, 80)}</Text>
          </Box>
        ))
      )}
    </Box>
  );
}
