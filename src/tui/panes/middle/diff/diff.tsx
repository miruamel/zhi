/**
 * @fileoverview Diff Viewer pane — unified diff display.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Diff, type DiffLine } from '../../../widgets/diff';

export interface DiffViewerProps {
  diff?: string;
  maxLines?: number;
}

/** @brief Parse a unified diff string into lines. @since 0.2.0 */
export function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split('\n');
  const result: DiffLine[] = [];
  let oldNum = 0;
  let newNum = 0;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      const m = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (m) {
        oldNum = parseInt(m[1], 10);
        newNum = parseInt(m[2], 10);
      }
      result.push({ type: 'context', content: line });
    } else if (line.startsWith('+')) {
      result.push({ type: 'added', newLine: newNum++, content: line.slice(1) });
    } else if (line.startsWith('-')) {
      result.push({ type: 'removed', oldLine: oldNum++, content: line.slice(1) });
    } else if (line.startsWith('+++') || line.startsWith('---')) {
      result.push({ type: 'context', content: line });
    } else {
      result.push({ type: 'context', oldLine: oldNum++, newLine: newNum++, content: line });
    }
  }
  return result;
}

/** @brief Render a diff viewer pane. @since 0.2.0 */
export function DiffViewer({ diff, maxLines = 30 }: DiffViewerProps) {
  if (!diff) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.fgDim}
        paddingX={1}
        flexGrow={1}
      >
        <Text color={colors.accent} bold>
          _DIFF
        </Text>
        <Text color={colors.fgDim}> (no diff)</Text>
      </Box>
    );
  }

  const lines = parseDiff(diff).slice(0, maxLines);
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.warn}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.warn} bold>
        _DIFF ({lines.length} lines)
      </Text>
      <Diff lines={lines} />
    </Box>
  );
}
