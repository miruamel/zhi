/**
 * @fileoverview Chart widget — simple bar/line chart with labels. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Chart data point. @since 0.2.6 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/** @brief Chart props. @since 0.2.6 */
export interface ChartProps {
  data: ChartDataPoint[];
  type?: 'bar' | 'line';
  width?: number;
  height?: number;
  showLabels?: boolean;
  color?: string;
}

const BLOCKS = '▁▂▃▄▅▆▇█';

/** @brief Chart component. @since 0.2.6 */
export function Chart({
  data,
  type = 'bar',
  width = 30,
  height = 10,
  showLabels = true,
}: ChartProps): React.ReactElement {
  if (data.length === 0) return <Text color="gray">—</Text>;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  if (type === 'line') {
    const step = Math.max(1, Math.floor(data.length / width));
    let out = '';
    for (let i = 0; i < data.length; i += step) {
      const idx = Math.min(7, Math.round(((data[i].value - min) / range) * 7));
      out += BLOCKS[idx];
    }
    let labels = '';
    if (showLabels) {
      for (let i = 0; i < data.length; i += step) {
        labels += (data[i].label ?? '?')[0];
      }
    }
    return (
      <Text color="cyan">
        {out}
        {'\n'}
        <Text color="gray">{labels}</Text>
      </Text>
    );
  }

  const rows: string[] = [];
  for (let row = height; row >= 0; row--) {
    const threshold = min + (range * row) / height;
    let line = '';
    for (const d of data) {
      line += d.value >= threshold ? '█' : '░';
    }
    rows.push(line);
  }

  let labelRow = '';
  if (showLabels) {
    for (const d of data) {
      labelRow += (d.label ?? '?').padEnd(1).slice(0, 1);
    }
  }

  return (
    <Text>
      {rows.map((r, i) => (
        <Text key={i}>
          <Text color="gray">{r}</Text>
          {'\n'}
        </Text>
      ))}
      <Text color="gray">{labelRow}</Text>
    </Text>
  );
}
