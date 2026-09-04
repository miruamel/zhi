/** @brief Terminal pane: live command output with line numbers and type coloring. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';

export interface TerminalLine {
  no: number;
  text: string;
  type?: 'stdout' | 'stderr' | 'cmd' | 'info';
}

export interface TerminalProps {
  lines: TerminalLine[];
  maxLines?: number;
  title?: string;
  autoScroll?: boolean;
  onToggleScroll?: () => void;
}

const DEFAULT_MAX_LINES = 100;

function lineColor(type: TerminalLine['type']): string {
  switch (type) {
    case 'stderr':
      return colors.error;
    case 'cmd':
      return colors.accent;
    case 'info':
      return colors.warn;
    case 'stdout':
    default:
      return colors.fg;
  }
}

/** @brief Render the terminal output pane. @since 0.1.1 */
export function Terminal({
  lines,
  maxLines = DEFAULT_MAX_LINES,
  title = 'TERMINAL',
  autoScroll = true,
  // onToggleScroll: reserved for future scroll-toggle hotkey wiring
}: TerminalProps) {
  const visible = lines.slice(-maxLines);
  const hidden = lines.length - visible.length;
  const scrollLabel = autoScroll ? 'FOLLOW' : 'PAUSED';
  const scrollColor = autoScroll ? colors.accent : colors.warn;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.commit}
      paddingX={1}
      flexGrow={1}
    >
      <Box gap={2}>
        <Text color={colors.commit} bold>
          ▣ {title}
        </Text>
        <Text color={colors.fgDim}>
          ({lines.length} lines{hidden > 0 ? `, ${hidden} hidden` : ''})
        </Text>
        <Text color={scrollColor} bold>
          {scrollLabel}
        </Text>
      </Box>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no output yet)</Text>
      ) : (
        visible.map((line) => (
          <Box key={line.no} gap={1}>
            <Text color={colors.fgDim}>{String(line.no).padStart(4)}</Text>
            <Text color={lineColor(line.type)}>{line.text}</Text>
          </Box>
        ))
      )}
    </Box>
  );
}