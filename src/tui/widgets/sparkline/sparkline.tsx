/**
 * @fileoverview Sparkline — compact inline trend visualization.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface SparklineProps {
  data: number[];
  width?: number;
  color?: string;
  /** @brief Show min/max labels beside the sparkline. */
  showLabels?: boolean;
}

const BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/** @brief Render a compact sparkline from numeric data. @since 0.2.0 */
export function Sparkline({
  data,
  width = 20,
  color = colors.accent,
  showLabels = false,
}: SparklineProps) {
  if (data.length === 0) return <Text dimColor>—</Text>;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Sample to fit width
  const step = Math.max(1, Math.ceil(data.length / width));
  const sampled: number[] = [];
  for (let i = 0; i < data.length; i += step) sampled.push(data[i]);

  const chars = sampled.map((v) => {
    const idx = Math.floor(((v - min) / range) * (BLOCKS.length - 1));
    return BLOCKS[Math.max(0, Math.min(BLOCKS.length - 1, idx))];
  });

  return (
    <Text>
      <Text color={color}>{chars.join('')}</Text>
      {showLabels && (
        <Text dimColor>
          {' '}
          {min}/{max}
        </Text>
      )}
    </Text>
  );
}
