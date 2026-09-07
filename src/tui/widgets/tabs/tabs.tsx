/**
 * @fileoverview Tabs widget — tab bar with active indicator. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Tab definition. @since 0.2.6 */
export interface Tab {
  id: string;
  label: string;
  count?: number;
}

/** @brief Tabs props. @since 0.2.6 */
export interface TabsProps {
  tabs: Tab[];
  active: string;
}

/** @brief Tabs component. @since 0.2.6 */
export function Tabs({ tabs, active }: TabsProps): React.ReactElement {
  return (
    <Text>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const label = tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label;
        return (
          <Text key={tab.id} color={isActive ? 'cyan' : 'gray'}>
            {isActive ? `▶ ${label}` : `  ${label}`}
          </Text>
        );
      })}
    </Text>
  );
}
