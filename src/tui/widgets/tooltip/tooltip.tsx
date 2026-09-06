/**
 * @fileoverview Tooltip — small floating label.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface TooltipProps {
  text: string;
  visible?: boolean;
}

/** @brief Render a small tooltip label. @since 0.2.0 */
export function Tooltip({ text, visible = true }: TooltipProps) {
  if (!visible) return null;
  return (
    <Text color={colors.fgDim} dimColor>
      {text}
    </Text>
  );
}