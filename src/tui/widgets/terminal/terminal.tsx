/**
 * @fileoverview Terminal widget — scrollable terminal output pane. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Terminal props. @since 0.2.6 */
export interface TerminalProps {
  lines: string[];
  maxLines?: number;
  scrollOffset?: number;
  onScroll?: (offset: number) => void;
}

/** @brief Terminal component. @since 0.2.6 */
export function Terminal({
  lines,
  maxLines = 50,
  scrollOffset = 0,
}: TerminalProps): React.ReactElement {
  const start =
    scrollOffset > 0
      ? Math.max(0, Math.min(lines.length - maxLines, scrollOffset))
      : Math.max(0, lines.length - maxLines);
  const visible = lines.slice(start, start + maxLines);
  return (
    <Text>
      {visible.map((line, i) => (
        <Text key={i}>
          <Text color="gray">{String(start + i + 1).padStart(4)} │ </Text>
          {line}
          {'\n'}
        </Text>
      ))}
    </Text>
  );
}
