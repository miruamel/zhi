/** @brief Config pane: shows runtime settings (threshold, budget, offline mode). @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';
import { glyphs } from '../../../core/style/icons';
import type { AppState } from '../../../core/state';

export interface ConfigProps {
  state: AppState;
}

/** @brief Render the config/settings pane. @since 0.1.1 */
export function Config({ state }: ConfigProps) {
  const cfg = state.config;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.warn}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.warn} bold>
        {glyphs.gear} CONFIG
      </Text>
      {cfg ? (
        <Box flexDirection="column" marginTop={1}>
          <Box gap={1}>
            <Text color={colors.fgDim}>threshold:</Text>
            <Text color={colors.fg}>{cfg.threshold}</Text>
          </Box>
          <Box gap={1}>
            <Text color={colors.fgDim}>budget:</Text>
            <Text color={colors.fg}>{cfg.tokensBudget} tokens</Text>
          </Box>
          <Box gap={1}>
            <Text color={colors.fgDim}>offline:</Text>
            <Text color={cfg.offline ? colors.warn : colors.done}>
              {cfg.offline ? 'yes' : 'no'}
            </Text>
          </Box>
        </Box>
      ) : (
        <Text color={colors.fgDim}> (not configured)</Text>
      )}
    </Box>
  );
}
