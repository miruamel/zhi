/**
 * @fileoverview Textarea widget — multi-line text input.
 * @since 0.1.12
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';

/** @brief Textarea props. @since 0.1.12 */
export interface TextareaProps {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  label?: string;
  focused?: boolean;
  rows?: number;
}

const BORDER = '─';

/** @brief Multi-line textarea. @since 0.1.12 */
export function Textarea({
  value,
  onChange,
  placeholder = '',
  label,
  focused = false,
  rows = 3,
}: TextareaProps) {
  void onChange;
  const border = focused ? colors.accent : colors.fgDim;
  const lines = value ? value.split('\n') : [];
  while (lines.length < rows) lines.push('');

  return (
    <Box flexDirection="column" gap={0}>
      {label && <Text color={colors.fgDim}>{label}</Text>}
      <Text color={border} bold={focused}>
        ┌{BORDER.repeat(20)}┐
      </Text>
      {lines.map((line, i) => (
        <Box key={i}>
          <Text color={border} bold={focused}>
            │
          </Text>
          <Text color={focused ? colors.fg : colors.fgDim}>{line || placeholder}</Text>
          <Text color={border} bold={focused}>
            │
          </Text>
        </Box>
      ))}
      <Text color={border} bold={focused}>
        └{BORDER.repeat(20)}┘
      </Text>
    </Box>
  );
}
