/**
 * @fileoverview Toggle widget — checkbox and radio button.
 * @since 0.1.12
 * @package zhi
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

/** @brief Toggle props. @since 0.1.12 */
export interface ToggleProps {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
  description?: string;
  variant?: 'checkbox' | 'radio';
  focused?: boolean;
}

/** @brief Checkbox / radio toggle. @since 0.1.12 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  variant = 'checkbox',
  focused = false,
}: ToggleProps) {
  void onChange;
  const glyph = variant === 'checkbox' ? (checked ? '☑' : '☐') : checked ? '◉' : '○';
  const color = checked ? colors.accent : focused ? colors.fg : colors.fgDim;

  return (
    <Text>
      <Text color={color} bold={focused}>
        {glyph}{' '}
      </Text>
      {label && <Text color={focused ? colors.fg : colors.fgDim}>{label}</Text>}
      {description && <Text color={colors.fgDim}> — {description}</Text>}
    </Text>
  );
}
