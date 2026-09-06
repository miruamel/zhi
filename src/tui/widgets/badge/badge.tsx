/**
 * @fileoverview Badge — small colored label.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

/** @brief Render a small colored badge. @since 0.2.0 */
export function Badge({ label, color = colors.fgDim, bg }: BadgeProps) {
  return (
    <Text>
      <Text backgroundColor={bg} color={color}>
        {' '}
        {label}{' '}
      </Text>
    </Text>
  );
}
