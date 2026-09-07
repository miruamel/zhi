/**
 * @fileoverview Code Viewer pane — displays file content with syntax highlighting.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Code, type CodeLine } from '../../../widgets/code';

export interface CodeViewerProps {
  path?: string;
  content?: string;
  scroll?: number;
  maxLines?: number;
}

/** @brief Render a code viewer pane with line numbers and syntax highlighting. @since 0.2.0 */
export function CodeViewer({ path, content, scroll = 0, maxLines = 30 }: CodeViewerProps) {
  if (!content) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.fgDim}
        paddingX={1}
        flexGrow={1}
      >
        <Text color={colors.accent} bold>
          _CODE
        </Text>
        <Text color={colors.fgDim}> (no file loaded)</Text>
      </Box>
    );
  }

  const rawLines = content.split('\n');
  const lines: CodeLine[] = rawLines.slice(scroll, scroll + maxLines).map((line, i) => ({
    number: scroll + i + 1,
    content: line,
  }));

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _CODE {path ? `· ${path}` : ''}
      </Text>
      <Code lines={lines} />
    </Box>
  );
}
