/** @brief Header pane: ASCII banner + loop state badge + version. @since 0.1.0 */
import { Box, Text } from 'ink';
import { colors } from '../../colors';
import { formatMs } from '../../format';

const BANNER = [
  '  ______   _    _   _    ___              ',
  ' |__  / | | |  / / | |  / _ \\             ',
  '   / /| |_| | / /  | | | | | |            ',
  '  / /_|  _  |/ /   | | | |_| |            ',
  ' /____|_| |_/_/    |_|  \\___/             ',
  '   志 — autonomous coding agent            ',
];

export interface HeaderProps {
  loop: string;
  goal: string;
  startedAt: number;
  finished: boolean;
  aborted: boolean;
}

/** @brief Render the header pane (banner + status bar). @since 0.1.0 */
export function Header({ loop, goal, startedAt, finished, aborted }: HeaderProps) {
  const elapsed = Date.now() - startedAt;
  const stateColor = aborted ? colors.error
    : finished ? colors.complete
    : colors.running;
  const stateLabel = aborted ? 'ABORTED' : finished ? 'DONE' : 'RUNNING';
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.accent} paddingX={1}>
      {BANNER.map((line, i) => (
        <Text key={i} color={i === BANNER.length - 1 ? colors.accent : colors.fgDim}>{line}</Text>
      ))}
      <Box marginTop={1} gap={2}>
        <Text color={colors.fgDim}>state:</Text>
        <Text color={stateColor} bold>{loop}</Text>
        <Text color={colors.fgDim}>·</Text>
        <Text color={stateColor} bold>{stateLabel}</Text>
        <Text color={colors.fgDim}>·</Text>
        <Text color={colors.fgDim}>elapsed {formatMs(elapsed)}</Text>
      </Box>
      <Box gap={1}>
        <Text color={colors.fgDim}>goal:</Text>
        <Text color={colors.fg}>{goal.length > 80 ? goal.slice(0, 77) + '…' : goal}</Text>
      </Box>
    </Box>
  );
}
