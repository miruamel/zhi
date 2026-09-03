/** @brief Log pane: append-only log stream with filters. @since 0.1.0 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';
import { formatTime, truncate } from '../../../core/style/format';
import type { LogEntry } from '../../../core/state';

export interface LogProps {
  log: LogEntry[];
  maxLines: number;
  scroll?: number;
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

export function Log({ log, maxLines, scroll = 0 }: LogProps) {
  const end = Math.max(0, log.length - scroll);
  const start = Math.max(0, end - maxLines);
  const visible = log.slice(start, end);
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
