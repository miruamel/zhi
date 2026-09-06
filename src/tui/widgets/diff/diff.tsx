/**
 * @fileoverview Diff — unified diff display.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';

export interface DiffLine {
  type: 'context' | 'added' | 'removed';
  oldNum?: number;
  newNum?: number;
  content: string;
}

export interface DiffProps {
  lines: DiffLine[];
  maxWidth?: number;
}

/** @brief Parse unified diff text into DiffLine[]. @since 0.2.0 */
export function parseDiff(text: string): DiffLine[] {
  if (!text) return [];
  const lines = text.split('\n');
  const result: DiffLine[] = [];
  let oldNum = 0;
  let newNum = 0;
  for (const line of lines) {
    if (line.startsWith('+')) {
      newNum++;
      result.push({ type: 'added', newNum, content: line.slice(1) });
    } else if (line.startsWith('-')) {
      oldNum++;
      result.push({ type: 'removed', oldNum, content: line.slice(1) });
    } else {
      oldNum++;
      newNum++;
      result.push({
        type: 'context',
        oldNum,
        newNum,
        content: line.startsWith(' ') ? line.slice(1) : line,
      });
    }
  }
  return result;
}

/** @brief Render a unified diff. @since 0.2.0 */
export function Diff({ lines }: DiffProps) {
  const colors_map = {
    context: colors.fgDim,
    added: colors.done,
    removed: colors.error,
  };
  const prefix = { context: ' ', added: '+', removed: '-' };

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i}>
          <Text dimColor>
            {line.oldNum != null ? String(line.oldNum).padStart(5) : '     '}{' '}
            {line.newNum != null ? String(line.newNum).padStart(5) : '     '}{' '}
          </Text>
          <Text color={colors_map[line.type]}>
            {prefix[line.type]}
            {line.content}
          </Text>
        </Text>
      ))}
    </Box>
  );
}
