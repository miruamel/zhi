/**
 * @fileoverview Badge widget — status label. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Badge props. @since 0.2.6 */
export interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  color?: string;
  variant?: 'solid' | 'outline';
}

/** @brief Badge component. @since 0.2.6 */
export function Badge({
  label,
  children,
  color = 'cyan',
  variant = 'solid',
}: BadgeProps): React.ReactElement {
  const content = label ?? children;
  return <Text color={color}>{variant === 'outline' ? `(${content})` : `[${content}]`}</Text>;
}
