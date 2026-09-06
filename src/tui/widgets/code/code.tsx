/**
 * @fileoverview Code — syntax-highlighted code display.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface CodeLine {
  number: number;
  content: string;
  highlight?: boolean;
}

export interface CodeProps {
  lines: CodeLine[];
  language?: string;
  maxWidth?: number;
}

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'class', 'interface', 'type', 'import', 'export', 'from', 'async', 'await',
  'new', 'this', 'super', 'extends', 'implements', 'public', 'private', 'protected',
  'static', 'abstract', 'true', 'false', 'null', 'undefined', 'void', 'number',
  'string', 'boolean', 'object', 'array', 'typeof', 'instanceof', 'in',
]);

/** @brief Render code with basic syntax highlighting. @since 0.2.0 */
export function Code({ lines, language, maxWidth = 80 }: CodeProps) {
  const highlightToken = (token: string): React.ReactNode => {
    const t = token.trim();
    if (!t) return token;
    if (KEYWORDS.has(t)) return <Text color={colors.accentBlue}>{token}</Text>;
    if (t.startsWith('//') || t.startsWith('#') || t.startsWith('/*')) return <Text dimColor>{token}</Text>;
    if (/^["'`]/.test(t)) return <Text color={colors.warn}>{token}</Text>;
    if (/^\d/.test(t)) return <Text color={colors.complete}>{token}</Text>;
    return <Text>{token}</Text>;
  };

  return (
    <Text flexDirection="column">
      {lines.map((line) => (
        <Text key={line.number}>
          <Text dimColor>{String(line.number).padStart(4)} │ </Text>
          <Text color={line.highlight ? colors.warn : colors.fg}>
            {line.content.split(/(\s+|\W)/).map((part, i) => (
              <Text key={i}>{highlightToken(part)}</Text>
            ))}
          </Text>
        </Text>
      ))}
    </Text>
  );
}