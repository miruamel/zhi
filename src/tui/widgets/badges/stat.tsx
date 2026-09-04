/** @brief StatCard widget: labelled metric tile with optional trend arrow. @since 0.1.1 */
import { Text } from 'ink';
import { colors } from '../../core/style/colors';

export interface StatCardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'flat';
  color?: string;
}

/** @brief Render a single labelled metric tile. @since 0.1.1 */
export function StatCard({ label, value, trend = 'flat', color = colors.fg }: StatCardProps) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const arrowColor = trend === 'up' ? colors.done : trend === 'down' ? colors.error : colors.fgDim;
  return (
    <Text>
      <Text color={colors.fgDim}>{label} </Text>
      <Text color={color} bold>
        {value}
      </Text>
      <Text color={arrowColor}> {arrow}</Text>
    </Text>
  );
}
