/**
 * @fileoverview Terminal pane — embedded shell output.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Terminal } from '../../../widgets/terminal';

export interface TerminalPaneProps {
  lines: string[];
  maxLines?: number;
}

/** @brief Render the terminal pane. @since 0.2.0 */
export function TerminalPane({ lines, maxLines = 20 }: TerminalPaneProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _TERMINAL
      </Text>
      <Terminal lines={lines} maxLines={maxLines} />
    </Box>
  );
}
