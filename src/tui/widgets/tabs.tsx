/** @brief Tabs widget: horizontal tab bar with badges, icons, keyboard nav. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { colors } from '../core/style/colors';

/** @brief Single tab definition. @since 0.1.1 */
export interface TabDef {
  id: string;
  label: string;
  badge?: string;
  icon?: string;
  disabled?: boolean;
}

/** @brief Tabs size token. @since 0.1.1 */
export type TabsSize = 'sm' | 'md' | 'lg';

export interface TabsProps {
  tabs: TabDef[];
  activeId: string;
  onChange: (id: string) => void;
  size?: TabsSize;
}

/** @brief Padding per size token. @since 0.1.1 */
const TAB_PADDING: Record<TabsSize, number> = { sm: 1, md: 2, lg: 3 };

/** @brief Pick the next tab id for a key event, or null if no change. @since 0.1.1 */
export function nextTabId(
  tabs: TabDef[],
  activeId: string,
  input: string,
  key: { leftArrow?: boolean; rightArrow?: boolean },
): string | null {
  if (tabs.length === 0) return null;
  const activeIndex = Math.max(0, tabs.findIndex(t => t.id === activeId));
  if (key.leftArrow || key.rightArrow) {
    const dir = key.leftArrow ? -1 : 1;
    let next = (activeIndex + dir + tabs.length) % tabs.length;
    for (let i = 0; i < tabs.length - 1; i += 1) {
      if (!tabs[next]?.disabled) return tabs[next]!.id;
      next = (next + dir + tabs.length) % tabs.length;
    }
    return null;
  }
  if (input && /^[1-9]$/.test(input)) {
    const target = tabs[Number(input) - 1];
    if (target && !target.disabled) return target.id;
  }
  return null;
}

/** @brief Horizontal tab bar with arrow + number-key navigation. @since 0.1.1 */
export function Tabs({ tabs, activeId, onChange, size = 'md' }: TabsProps) {
  const pad = TAB_PADDING[size];

  useInput((input: string, key: { leftArrow?: boolean; rightArrow?: boolean }) => {
    const next = nextTabId(tabs, activeId, input, key);
    if (next !== null) onChange(next);
  });

  return (
    <Box>
      {tabs.map(tab => {
        const isActive = tab.id === activeId;
        const isDisabled = tab.disabled === true;
        const labelText = tab.icon ? `${tab.icon} ${tab.label}` : tab.label;
        const labelColor = isDisabled
          ? colors.fgDim
          : isActive
            ? colors.bg
            : colors.fg;
        const bgColor = isActive ? colors.accent : undefined;
        return (
          <Box key={tab.id} marginRight={1}>
            <Text
              backgroundColor={bgColor}
              color={labelColor}
              bold={isActive}
              underline={isActive}
            >
              {`${' '.repeat(pad)}${labelText}${' '.repeat(pad)}`}
            </Text>
            {tab.badge !== undefined && (
              <Text color={isActive ? colors.accent : colors.fgDim}> ({tab.badge})</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
