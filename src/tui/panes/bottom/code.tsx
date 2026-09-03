/** @brief Code viewer pane: shows the generated code from the loop. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../core/style/colors';
import { glyphs } from '../../core/style/icons';
import type { AppState } from '../../core/state';

export interface CodeViewerProps {
  state: AppState;
  maxLines?: number;
}

/** @brief Render the code viewer pane. @since 0.1.1 */
export function CodeViewer({ state, maxLines = 20 }: CodeViewerProps) {
  const code = state.code;
  if (!code) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.fgDim}
        paddingX={1}
        flexGrow={1}
      >
        <Text color={colors.fgDim} bold>
          {glyphs.code} CODE
        </Text>
        <Text color={colors.fgDim}> (no code generated yet)</Text>
      </Box>
    );
  }
  const lines = code.split('\n').slice(0, maxLines);
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accent}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accent} bold>
        {glyphs.code} CODE ({code.split('\n').length} lines)
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {lines.map((line, i) => (
          <Text key={i} color={colors.fgDim}>
            {line}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
