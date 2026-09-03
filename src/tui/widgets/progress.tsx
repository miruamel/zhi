/** @brief ProgressBar widget: horizontal fill bar with label + percentage. @since 0.1.1 */
import { Text } from 'ink';
import { colors } from '../core/style/colors';

export interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  width?: number;
  color?: string;
}

/** @brief Render a horizontal progress bar. @since 0.1.1 */
export function ProgressBar({
  label,
  value,
  max,
  width = 20,
  color = colors.accent,
}: ProgressBarProps) {
  const safeValue = Math.max(0, value);
  const pct = max > 0 ? Math.min(1, safeValue / max) : 0;
  const filled = Math.max(0, Math.min(width, Math.round(pct * width)));
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  const pctText = (pct * 100).toFixed(0).padStart(3);
  return (
    <Text>
      <Text color={colors.fgDim}>{label.padEnd(14)}</Text>
      <Text color={color}>{bar}</Text>
      <Text color={colors.fgDim}> {pctText}%</Text>
    </Text>
  );
}
