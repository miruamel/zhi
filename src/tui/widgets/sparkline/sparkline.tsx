/**
 * @fileoverview Sparkline widget — mini line chart. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Sparkline props. @since 0.2.6 */
export interface SparklineProps {
  data: number[];
  width?: number;
  color?: string;
  showLabels?: boolean;
}

const BLOCKS = '▁▂▃▄▅▆▇█';

/** @brief Sparkline component. @since 0.2.6 */
export function Sparkline({
  data,
  width = 20,
  color = 'cyan',
  showLabels = false,
}: SparklineProps): React.ReactElement {
  if (data.length === 0) return <Text color="gray">—</Text>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = Math.max(1, Math.floor(data.length / width));
  let out = '';
  let labels = '';
  for (let i = 0; i < data.length; i += step) {
    const idx = Math.min(7, Math.round(((data[i] - min) / range) * 7));
    out += BLOCKS[idx];
    if (showLabels) labels += `${data[i]}/${max}`;
  }
  return (
    <Text color={color}>
      {out}
      {showLabels && (
        <>
          {'\n'}
          <Text color="gray">{labels}</Text>
        </>
      )}
    </Text>
  );
}
