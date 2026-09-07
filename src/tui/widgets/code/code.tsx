/**
 * @fileoverview Code viewer widget — syntax-highlighted code block. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief A single code line. @since 0.2.6 */
export interface CodeLine {
  number: number;
  content: string;
}

/** @brief Code viewer props. @since 0.2.6 */
export interface CodeViewerProps {
  code: string;
  maxLines?: number;
}

/** @brief Code block props. @since 0.2.6 */
export interface CodeProps {
  lines: CodeLine[];
}

/** @brief Code block component — renders lines with line numbers. @since 0.2.6 */
export function Code({ lines }: CodeProps): React.ReactElement {
  return (
    <Text>
      {lines.map((line, i) => (
        <Text key={i}>
          <Text color="gray">{String(line.number).padStart(4)} │ </Text>
          {line.content}
          {'\n'}
        </Text>
      ))}
    </Text>
  );
}

/** @brief Code viewer component. @since 0.2.6 */
export function CodeViewer({ code, maxLines = 50 }: CodeViewerProps): React.ReactElement {
  const lines: CodeLine[] = code
    .split('\n')
    .slice(0, maxLines)
    .map((content, i) => ({
      number: i + 1,
      content,
    }));
  return <Code lines={lines} />;
}
