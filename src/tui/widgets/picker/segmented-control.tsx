/** @brief SegmentedControl widget: bordered horizontal toggle with keyboard nav. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { colors } from '../../core/style/colors';

/** @brief Single segment definition. @since 0.1.1 */
export interface SegmentOption {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

/** @brief SegmentedControl size token. @since 0.1.1 */
export type SegmentedControlSize = 'sm' | 'md';

export interface SegmentedControlProps {
  options: SegmentOption[];
  activeId: string;
  onChange: (id: string) => void;
  size?: SegmentedControlSize;
  disabled?: boolean;
}

/** @brief Padding per size token. @since 0.1.1 */
const SEGMENT_PADDING: Record<SegmentedControlSize, number> = { sm: 1, md: 2 };

/** @brief Pick the next segment id for a key event, or null if no change. @since 0.1.1 */
export function nextSegmentId(
  options: SegmentOption[],
  activeId: string,
  input: string,
  key: { leftArrow?: boolean; rightArrow?: boolean },
): string | null {
  if (options.length === 0) return null;
  const activeIndex = Math.max(0, options.findIndex(o => o.id === activeId));
  if (key.leftArrow || key.rightArrow) {
    const dir = key.leftArrow ? -1 : 1;
    let next = (activeIndex + dir + options.length) % options.length;
    const start = activeIndex;
    while (options[next]?.disabled) {
      next = (next + dir + options.length) % options.length;
      if (next === start) return null;
    }
    return options[next]!.id;
  }
  if (input && /^[1-9]$/.test(input)) {
    const target = options[Number(input) - 1];
    if (target && !target.disabled) return target.id;
  }
  return null;
}

/** @brief Bordered horizontal segmented toggle with arrow + number-key navigation. @since 0.1.1 */
export function SegmentedControl({
  options,
  activeId,
  onChange,
  size = 'md',
  disabled = false,
}: SegmentedControlProps) {
  const pad = SEGMENT_PADDING[size];

  useInput(
    (input: string, key: { leftArrow?: boolean; rightArrow?: boolean }) => {
      if (disabled) return;
      const next = nextSegmentId(options, activeId, input, key);
      if (next !== null) onChange(next);
    },
  );

  return (
    <Box borderStyle="round" borderColor={colors.fgDim} flexDirection="row">
      {options.map(option => {
        const isActive = option.id === activeId;
        const isDisabled = option.disabled === true;
        const labelText = option.icon ? `${option.icon} ${option.label}` : option.label;
        const labelColor = isDisabled
          ? colors.fgDim
          : isActive
            ? colors.bg
            : colors.fg;
        const bgColor = isActive ? colors.accent : undefined;
        return (
          <Box key={option.id} marginRight={1}>
            <Text
              backgroundColor={bgColor}
              color={labelColor}
              bold={isActive}
              underline={isActive}
            >
              {`${' '.repeat(pad)}${labelText}${' '.repeat(pad)}`}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}