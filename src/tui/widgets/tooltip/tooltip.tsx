/**
 * @fileoverview Tooltip widget — hover/focus hint overlay. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Tooltip props. @since 0.2.6 */
export interface TooltipProps {
  text?: string;
  content?: React.ReactNode;
  visible?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}

/** @brief Tooltip component. @since 0.2.6 */
export function Tooltip({
  text,
  content,
  visible = true,
  children,
}: TooltipProps): React.ReactElement {
  const tip = text ?? content;
  return (
    <Text>
      {children}
      {visible && tip != null && (
        <Text color="cyan" backgroundColor="black">
          {' '}
          {tip}{' '}
        </Text>
      )}
    </Text>
  );
}
