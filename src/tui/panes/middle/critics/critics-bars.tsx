/** @brief Pareto bar rendering for Critics pane. @since 0.1.15 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { bar, formatScore } from '../../../core/format';
import type { CriticLine } from '../../../core/state';

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

/** @brief Ordered critic names (used for header count). @since 0.1.15 */
export const CRITIC_NAMES: readonly string[] = Object.keys(WEIGHTS);

export interface CriticsBarsProps {
  critics: CriticLine[];
  threshold: number;
  expanded?: boolean;
}

function buildKnown(critics: CriticLine[]): Record<string, CriticLine> {
  const out: Record<string, CriticLine> = {};
  for (const c of critics) out[c.name] = c;
  return out;
}

export function CriticsBars({ critics, threshold, expanded = false }: CriticsBarsProps) {
  const known = buildKnown(critics);
  return (
    <>
      {CRITIC_NAMES.map((name) => {
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
          <Box key={name} flexDirection="column">
            <Text color={color}>
              {icon} {name.padEnd(16)} w={w.toFixed(1)}{' '}
            </Text>
            <Text color={color}>{bar(c.score, 14)}</Text>
            <Text color={color}>{formatScore(c.score)}</Text>
            {expanded && c.reason ? <Text color={colors.fgDim}> {c.reason}</Text> : null}
          </Box>
        );
      })}
    </>
  );
}
