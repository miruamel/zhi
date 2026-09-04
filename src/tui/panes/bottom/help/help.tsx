/** @brief Help / keybindings footer pane. @since 0.1.2 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

const BINDINGS: Array<[string, string]> = [
  ['q / esc', 'quit (abort loop if running)'],
  ['space', 'pause / resume render'],
  ['l', 'toggle log expansion'],
  ['c', 'toggle critics detail'],
  ['p', 'toggle PR/CI detail'],
  ['h / ?', 'toggle this help'],
  ['d', 'toggle detail expansion'],
  ['g / G', 'log top / bottom'],
  ['r', 'force redraw'],
  ['tab', 'cycle focus'],
  ['ctrl+c', 'abort loop → DONE partial'],
];

export interface HelpProps {
  paused?: boolean;
  showHelp?: boolean;
}

/** @brief Render the keybindings footer (always visible). @since 0.1.2 */
export function Help({ paused, showHelp }: HelpProps) {
  if (!showHelp) {
    return (
      <Box paddingX={1} gap={1}>
        <Text color={colors.fgDim}>keys:</Text>
        <Text color={colors.fg}>q</Text>
        <Text color={colors.fgDim}>uit</Text>
        <Text color={colors.fgDim}> · </Text>
        <Text color={colors.fg}>space</Text>
        <Text color={colors.fgDim}>pause</Text>
        <Text color={colors.fgDim}> · </Text>
        <Text color={colors.fg}>l/c/p/h</Text>
        <Text color={colors.fgDim}>panels</Text>
        <Text color={colors.fgDim}> · </Text>
        <Text color={colors.fg}>?</Text>
        <Text color={colors.fgDim}>help</Text>
        {paused && (
          <Text color={colors.warn} bold>
            {' '}
            · PAUSED
          </Text>
        )}
      </Box>
    );
  }
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.accent} paddingX={1}>
      <Text color={colors.accent} bold>
        ⌨ KEYBINDINGS
      </Text>
      <Box flexWrap="wrap" columnGap={3}>
        {BINDINGS.map(([k, d]) => (
          <Box key={k} gap={1}>
            <Text color={colors.fg}>{k.padEnd(8)}</Text>
            <Text color={colors.fgDim}>{d}</Text>
          </Box>
        ))}
      </Box>
      {paused && (
        <Text color={colors.warn} bold>
          ⏸ PAUSED — press space to resume
        </Text>
      )}
    </Box>
  );
}
