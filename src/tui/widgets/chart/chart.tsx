/**
 * @fileoverview Chart — simple bar/line chart.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartProps {
  data: ChartDataPoint[];
  width?: number;
  color?: string;
  type?: 'bar' | 'line';
}

/** @brief Render a simple bar chart. @since 0.2.0 */
export function Chart({ data, width = 30, color = colors.accent, type = 'bar' }: ChartProps) {
  if (data.length === 0) return <Text dimColor>—</Text>;
  const max = Math.max(...data.map((d) => d.value)) || 1;

  if (type === 'line') {
    const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const points = data.map((d) => chars[Math.floor((d.value / max) * (chars.length - 1))]);
    return (
      <Text>
        <Text color={color}>{points.join('')}</Text>
        <Text dimColor> {data.map((d) => d.label).join(' ')}</Text>
      </Text>
    );
  }

  return (
    <Box flexDirection="column">
      {data.map((d) => {
        const barLen = Math.round((d.value / max) * width);
        return (
          <Text key={d.label}>
            <Text color={colors.fgDim}>{d.label.padEnd(8)}</Text>
            <Text color={color}>{'█'.repeat(barLen)}</Text>
            <Text dimColor> {d.value}</Text>
          </Text>
        );
      })}
    </Box>
  );
}
