/** @brief Knowledge pane: facts stored by the engine during the loop. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../core/style/colors';
import { glyphs } from '../../core/style/icons';
import type { AppState } from '../../core/state';

export interface KnowledgeProps {
  state: AppState;
  maxLines?: number;
}

/** @brief Render the knowledge store pane. @since 0.1.1 */
export function Knowledge({ state, maxLines = 10 }: KnowledgeProps) {
  const facts = state.facts;
  const visible = facts.slice(0, maxLines);
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accent}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accent} bold>
        {glyphs.bulb} KNOWLEDGE ({facts.length})
      </Text>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no facts yet)</Text>
      ) : (
        visible.map((f, i) => (
          <Box key={i} flexDirection="column">
            <Text color={colors.fg}>
              {glyphs.bulb} {f.key}
            </Text>
            <Text color={colors.fgDim}> {f.value}</Text>
            {f.tags.length > 0 && <Text color={colors.fgDim}> tags: {f.tags.join(', ')}</Text>}
          </Box>
        ))
      )}
    </Box>
  );
}
