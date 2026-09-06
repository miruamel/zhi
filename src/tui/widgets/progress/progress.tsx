/**
 * @fileoverview Progress bar — horizontal fill indicator.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface ProgressProps {
  value: number;
  max?: number;
  width?: number;
  label?: string;
  color?: string;
  showPct?: boolean;
}

/** @brief Render a horizontal progress bar. @since 0.2.0 */
export function Progress({
  value,
  max = 100,
  width = 20,
  label,
  color = colors.accent,
  showPct = true,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const filled = Math.round(pct * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return (
    <Text>
      {label && <Text>{label} </Text>}
      <Text color={pct > 0.9 ? colors.error : color}>{bar}</Text>
      {showPct && <Text dimColor> {Math.round(pct * 100)}%</Text>}
    </Text>
  );
}
