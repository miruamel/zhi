/**
 * @fileoverview Select widget — dropdown with options list.
 * @since 0.1.12
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';

/** @brief Select option. @since 0.1.12 */
export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

/** @brief Select props. @since 0.1.12 */
export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  focused?: boolean;
  maxVisible?: number;
}

const BORDER = '─';

/** @brief Select dropdown. @since 0.1.12 */
export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  focused = false,
  maxVisible = 5,
}: SelectProps) {
  void onChange;
  const border = focused ? colors.accent : colors.fgDim;
  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? placeholder;
  const visible = options.slice(0, maxVisible);

  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <Text color={border} bold={focused}>
          ▼
        </Text>
        <Text color={focused ? colors.fg : colors.fgDim}>
          {display}
          {focused && '█'}
        </Text>
      </Box>
      {focused && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={border} bold={focused}>
            ┌{BORDER.repeat(20)}┐
          </Text>
          {visible.map((opt) => (
            <Box key={opt.value} gap={1}>
              <Text color={border} bold={focused}>
                │
              </Text>
              <Text
                color={opt.value === value ? colors.accent : colors.fg}
                bold={opt.value === value}
              >
                {opt.value === value ? '► ' : '  '}
                {opt.label}
              </Text>
              <Text color={border} bold={focused}>
                │
              </Text>
            </Box>
          ))}
          <Text color={border} bold={focused}>
            └{BORDER.repeat(20)}┘
          </Text>
        </Box>
      )}
    </Box>
  );
}
