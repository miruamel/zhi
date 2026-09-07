/**
 * @fileoverview Help pane — keyboard shortcuts reference.
 * @since 0.1.2
 * @updated 0.2.0 — integrated with new pane system
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

export interface HelpProps {
  paused?: boolean;
  showHelp?: boolean;
}

const TOGGLE_KEYS = ['l/c/p/h'];

/** @brief Render the help pane (compact or expanded). @since 0.1.2 */
export function Help({ paused = false, showHelp = false }: HelpProps) {
  if (showHelp) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.accentBlue}
        paddingX={2}
        paddingY={1}
      >
        <Text color={colors.accentBlue} bold>
          KEYBINDINGS
        </Text>
        {paused && (
          <Text color={colors.warn} bold>
            ⏸ PAUSED
          </Text>
        )}
        <Box marginTop={1} flexDirection="column" gap={0}>
          <Text color={colors.fgDim}> q quit</Text>
          <Text color={colors.fgDim}> Space pause / resume</Text>
          <Text color={colors.fgDim}> Ctrl+C abort</Text>
          <Text color={colors.fgDim}> h toggle help</Text>
          <Text color={colors.fgDim}> Tab cycle panels</Text>
          <Text color={colors.fgDim}> l/c/p/h toggle panels</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box gap={1}>
      <Text color={colors.fgDim}>keys</Text>
      <Text color={colors.fgDim}>|</Text>
      <Text color={colors.fgDim}>quit</Text>
      <Text color={colors.fgDim}>|</Text>
      <Text color={colors.fgDim}>panels {TOGGLE_KEYS.join('/')}</Text>
      {paused && (
        <>
          <Text color={colors.fgDim}>|</Text>
          <Text color={colors.warn} bold>
            PAUSED
          </Text>
        </>
      )}
    </Box>
  );
}

/** @brief Alias for HelpPane — keyboard shortcuts reference. @since 0.2.0 */
export function HelpPane() {
  return <Help showHelp={false} />;
}
