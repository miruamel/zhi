/** @brief Critics pane: 15-critic weighted Pareto display. @since 0.1.0 */
import { Box, Text } from 'ink';
import { colors } from '../../colors';
import { bar, formatScore } from '../../format';
import type { CriticLine } from '../../state';

const WEIGHTS: Record<string, number> = {
  security: 1.5,
  perf: 1.0,
  architecture: 1.5,
  testing: 1.0,
  doc: 1.0,
  devops: 1.0,
  legal: 1.0,
  privacy: 1.5,
  style: 1.0,
  dx: 0.8,
  accessibility: 1.0,
  maintainability: 1.0,
  sloc: 1.0,
  imports: 1.5,
  todo: 1.0,
};

const ICONS: Record<string, string> = {
  security: '🛡',
  perf: '⚡',
  architecture: '🏛',
  testing: '✓',
  doc: '📖',
  devops: '⚙',
  legal: '⚖',
  privacy: '🔒',
  style: '🎨',
  dx: '✦',
  accessibility: '♿',
  maintainability: '🔧',
  sloc: '⊟',
  imports: '⇄',
  todo: '✗',
};

export interface CriticsProps {
  critics: CriticLine[];
  weightedAvg: number;
  threshold: number;
}

function buildKnown(critics: CriticLine[]): Record<string, CriticLine> {
  const out: Record<string, CriticLine> = {};
  for (const c of critics) out[c.name] = c;
  return out;
}

/** @brief Render the critics pane (15 bars + avg). @since 0.1.0 */
export function Critics({ critics, weightedAvg, threshold }: CriticsProps) {
  const known = buildKnown(critics);
  const names = Object.keys(WEIGHTS);
  const passed = weightedAvg >= threshold;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.scoring}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.scoring} bold>
        ◉ CRITICS ({critics.length}/{names.length} reported)
      </Text>
      {names.map((name) => {
        const c = known[name];
        const w = WEIGHTS[name] ?? 1;
        const icon = ICONS[name] ?? '·';
        if (!c) {
          return (
            <Box key={name}>
              <Text color={colors.fgDim}>
                {icon} {name.padEnd(16)} weight={w.toFixed(1)} — — abstain
              </Text>
            </Box>
          );
        }
        if (c.abstain) {
          return (
            <Box key={name}>
              <Text color={colors.fgDim}>
                {icon} {name.padEnd(16)} weight={w.toFixed(1)} abstain
              </Text>
            </Box>
          );
        }
        const color =
          c.score >= threshold ? colors.done : c.score < 0.4 ? colors.failed : colors.warn;
        return (
          <Box key={name}>
            <Text color={color}>
              {icon} {name.padEnd(16)} w={w.toFixed(1)}{' '}
            </Text>
            <Text color={color}>{bar(c.score, 14)}</Text>
            <Text color={color}>{formatScore(c.score)}</Text>
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text color={colors.fgDim}>weighted avg </Text>
        <Text color={passed ? colors.done : colors.warn} bold>
          {formatScore(weightedAvg)}
        </Text>
        <Text color={colors.fgDim}>/ {threshold.toFixed(2)}</Text>
        <Text color={passed ? colors.done : colors.warn} bold>
          {' '}
          {passed ? '→ PASS' : '→ FAIL'}
        </Text>
      </Box>
    </Box>
  );
}
