/**
 * @fileoverview Gauge widget — circular progress indicator. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Gauge props. @since 0.2.6 */
export interface GaugeProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  width?: number;
}

/** @brief Gauge component. @since 0.2.6 */
export function Gauge({
  value,
  max = 100,
  label,
  color = 'cyan',
  width = 10,
}: GaugeProps): React.ReactElement {
  const pct = Math.min(1, Math.max(0, value / max));
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const pctStr = (pct * 100).toFixed(0).padStart(3);
  return (
    <Text>
      {label && <Text color="gray">{label}: </Text>}
      <Text color={color}>{bar} </Text>
      <Text color={color}>{pctStr}%</Text>
    </Text>
  );
}
