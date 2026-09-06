/**
 * @fileoverview Terminal — embedded shell output pane.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';

export interface TerminalProps {
  lines: string[];
  maxLines?: number;
  follow?: boolean;
}

/** @brief Render a scrollable terminal output pane. @since 0.2.0 */
export function Terminal({ lines, maxLines = 20 }: TerminalProps) {
  const visible = lines.slice(-maxLines);
  return (
    <Box flexDirection="column">
      {visible.map((line, i) => (
        <Text key={i} dimColor={line.startsWith('$') || line.startsWith('')}>
          {line}
        </Text>
      ))}
    </Box>
  );
}
