/**
 * @fileoverview Markdown preview + parser for the editor widget.
 * @since 0.1.13
 * @package zhi
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

/** @brief A parsed markdown node. @since 0.1.13 */
export interface MdNode {
  kind: 'heading' | 'paragraph' | 'list' | 'codeblock';
  level?: number;
  content: string;
  lang?: string;
}

/** @brief Parse markdown text into MdNode tree. @since 0.1.13 */
export function parseMarkdown(text: string): MdNode[] {
  const src = text.split('\n');
  const nodes: MdNode[] = [];
  let i = 0;
  while (i < src.length) {
    const line = src[i] ?? '';
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < src.length && !src[i].startsWith('```')) {
        codeLines.push(src[i] ?? '');
        i++;
      }
      i++;
      nodes.push({ kind: 'codeblock', content: codeLines.join('\n'), lang });
      continue;
    }
    if (line.trim() === '') {
      i++;
      continue;
    }
    const hm = line.match(/^(#{1,6})\s+(.*)$/);
    if (hm) {
      nodes.push({ kind: 'heading', level: hm[1].length, content: hm[2] });
      i++;
      continue;
    }
    if (line.match(/^\s*[-*+]\s+(.*)$/)) {
      nodes.push({ kind: 'list', content: line.replace(/^\s*[-*+]\s+/, '') });
      i++;
      continue;
    }
    if (line.match(/^\s*\d+\.\s+(.*)$/)) {
      nodes.push({ kind: 'list', content: line.replace(/^\s*\d+\.\s+/, '') });
      i++;
      continue;
    }
    nodes.push({ kind: 'paragraph', content: line });
    i++;
  }
  return nodes;
}

/** @brief Render inline markdown (bold/italic/code). @since 0.1.13 */
function renderInline(text: string) {
  const parts: { text: string; color?: string; bold?: boolean }[] = [];
  let rest = text;
  while (rest) {
    const m = rest.match(/(\*\*|__)(.+?)\1|(\*|_)(.+?)\2|`(.+?)`/);
    if (!m) {
      parts.push({ text: rest });
      break;
    }
    const idx = m.index ?? 0;
    if (idx > 0) parts.push({ text: rest.slice(0, idx) });
    if (m[1]) parts.push({ text: m[2], bold: true });
    else if (m[3]) parts.push({ text: m[4] });
    else if (m[5]) parts.push({ text: m[5], color: colors.accent });
    rest = rest.slice(idx + m[0].length);
  }
  return parts;
}

/** @brief Markdown preview pane. @since 0.1.13 */
export function MarkdownPreview({ markdown }: { markdown: string }) {
  const nodes = parseMarkdown(markdown);
  return (
    <Text>
      {nodes.map((n, i) => {
        if (n.kind === 'heading') {
          const color = n.level === 1 ? colors.fg : n.level === 2 ? colors.accent : colors.fgDim;
          return (
            <Text key={i} color={color} bold>
              {'\n'}
              {n.content}
            </Text>
          );
        }
        if (n.kind === 'codeblock') {
          return (
            <Text key={i} color={colors.complete}>
              {'\n'}
              {n.lang ? `// ${n.lang}` : ''}
              {'\n'}
              {n.content}
            </Text>
          );
        }
        if (n.kind === 'list') {
          return (
            <Text key={i} color={colors.fgDim}>
              {'\n'}• {n.content}
            </Text>
          );
        }
        return (
          <Text key={i}>
            {'\n'}
            {renderInline(n.content).map((p, j) => (
              <Text key={j} color={p.color} bold={p.bold}>
                {p.text}
              </Text>
            ))}
          </Text>
        );
      })}
    </Text>
  );
}
