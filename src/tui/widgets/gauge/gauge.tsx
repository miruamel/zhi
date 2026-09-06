/**
 * @fileoverview Gauge — radial progress indicator.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface GaugeProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  width?: number;
}

const ARC = ['░', '▒', '▓', '█'];

/** @brief Render a text-based gauge showing value/max. @since 0.2.0 */
export function Gauge({ value, max = 100, label, color = colors.accent, width = 12 }: GaugeProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const filled = Math.round(pct * width);
  const bar = ARC[3].repeat(filled) + ARC[0].repeat(width - filled);
  const display = label ? `${label} ` : '';

  return (
    <Text>
      <Text>{display}</Text>
      <Text color={pct > 0.9 ? colors.error : color}>{bar}</Text>
      <Text dimColor> {Math.round(pct * 100)}%</Text>
    </Text>
  );
}