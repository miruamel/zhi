/** @brief Critics pane: 15-critic weighted Pareto display with filter + fix. @since 0.1.2 @updated 0.1.14 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { bar, formatScore } from '../../../core/format';
import type { CriticLine } from '../../../core/state';
import type { CriticItem } from '../../../core/store/types/entities/dag';

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

const SEVERITY_COLOR: Record<string, string> = {
  critical: colors.failed,
  high: colors.warn,
  medium: colors.warn,
  low: colors.fgDim,
};

export interface CriticsProps {
  critics: CriticLine[];
  weightedAvg: number;
  threshold: number;
  expanded?: boolean;
  items?: CriticItem[];
  criticsFilter?: string;
  showFixedCritics?: boolean;
  onFix?: (id: string) => void;
  onFilter?: (query: string) => void;
  onToggleFixed?: () => void;
}

function buildKnown(critics: CriticLine[]): Record<string, CriticLine> {
  const out: Record<string, CriticLine> = {};
  for (const c of critics) out[c.name] = c;
  return out;
}

export function Critics({
  critics,
  weightedAvg,
  threshold,
  expanded = false,
  items = [],
  criticsFilter = '',
  showFixedCritics = false,
  onFix,
  onFilter,
  onToggleFixed,
}: CriticsProps) {
  const known = buildKnown(critics);
  const names = Object.keys(WEIGHTS);
  const passed = weightedAvg >= threshold;
  const filter = criticsFilter.toLowerCase();
  const visibleItems = items.filter((i) => {
    if (!showFixedCritics && i.fixed) return false;
    if (!filter) return true;
    return (
      i.title.toLowerCase().includes(filter) ||
      i.category.toLowerCase().includes(filter) ||
      i.description.toLowerCase().includes(filter) ||
      (i.file ?? '').toLowerCase().includes(filter)
    );
  });

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
      {onFilter ? (
        <Text color={colors.fgDim}>
          🔍 {criticsFilter || 'filter…'} {visibleItems.length} shown
        </Text>
      ) : null}
      {onToggleFixed ? (
        <Text color={colors.fgDim}>
          {showFixedCritics ? 'Showing fixed' : 'Hiding fixed'} [f] toggle
        </Text>
      ) : null}
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
      {visibleItems.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={colors.scoring} bold>
            ◉ FINDINGS ({visibleItems.length})
          </Text>
          {visibleItems.map((item) => (
            <Box key={item.id} flexDirection="column">
              <Text color={SEVERITY_COLOR[item.severity] ?? colors.warn} bold>
                [{item.severity.toUpperCase()}] {item.title}
              </Text>
              <Text color={colors.fgDim}>
                {item.category}
                {item.file ? ` — ${item.file}` : ''}
                {item.line ? `:${item.line}` : ''}
              </Text>
              {item.description ? <Text color={colors.fgDim}>{item.description}</Text> : null}
              {item.suggestion ? <Text color={colors.done}>→ {item.suggestion}</Text> : null}
              {item.fixed ? (
                <Text color={colors.done}>✓ fixed</Text>
              ) : onFix ? (
                <Text color={colors.warn}>[f] fix</Text>
              ) : null}
            </Box>
          ))}
        </Box>
      )}
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
