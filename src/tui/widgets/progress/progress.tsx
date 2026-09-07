/**
 * @fileoverview Progress widget — horizontal progress bar. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Progress props. @since 0.2.6 */
export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  width?: number;
}

/** @brief Progress component. @since 0.2.6 */
export function Progress({
  value,
  max = 100,
  label,
  color = 'green',
  width = 30,
}: ProgressProps): React.ReactElement {
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
