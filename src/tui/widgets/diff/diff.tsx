/**
 * @fileoverview Diff widget — unified diff display with line numbers. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Diff line. @since 0.2.6 */
export interface DiffLine {
  type: 'context' | 'added' | 'removed';
  oldLine?: number;
  newLine?: number;
  content: string;
}

/** @brief Diff props. @since 0.2.6 */
export interface DiffProps {
  lines?: DiffLine[];
  diff?: string;
  maxLines?: number;
}

/** @brief Parse unified diff into structured lines. @since 0.2.6 */
export function parseDiff(diff: string = ''): DiffLine[] {
  const raw = diff.split('\n');
  const lines = raw.length > 0 && raw[raw.length - 1] === '' ? raw.slice(0, -1) : raw;
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;
  for (const line of lines) {
    if (line.startsWith('@@')) {
      const m = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (m) {
        oldLine = parseInt(m[1], 10);
        newLine = parseInt(m[2], 10);
      }
      result.push({ type: 'context', content: line });
    } else if (line.startsWith('+')) {
      result.push({ type: 'added', newLine: newLine++, content: line.slice(1) });
    } else if (line.startsWith('-')) {
      result.push({ type: 'removed', oldLine: oldLine++, content: line.slice(1) });
    } else if (line.startsWith(' ')) {
      result.push({
        type: 'context',
        oldLine: oldLine++,
        newLine: newLine++,
        content: line.slice(1),
      });
    } else {
      result.push({ type: 'context', content: line });
    }
  }
  return result;
}

/** @brief Diff component. @since 0.2.6 */
export function Diff({ lines, diff, maxLines = 100 }: DiffProps): React.ReactElement {
  const resolved = lines ?? parseDiff(diff ?? '');
  const visible = resolved.slice(0, maxLines);
  return (
    <Text>
      {visible.map((line, i) => {
        const color = line.type === 'added' ? 'green' : line.type === 'removed' ? 'red' : 'gray';
        const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
        const nums =
          line.oldLine && line.newLine
            ? `${String(line.oldLine).padStart(5)},${String(line.newLine).padStart(5)}`
            : '';
        return (
          <Text key={i}>
            <Text color="gray">{nums} </Text>
            <Text color={color}>
              {prefix}
              {line.content}
            </Text>
            {'\n'}
          </Text>
        );
      })}
    </Text>
  );
}
