/**
 * @fileoverview Tabs — horizontal tab bar.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface TabItem {
  id: string;
  label: string;
  badge?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

/** @brief Render a horizontal tab bar. @since 0.2.0 */
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <Text>
      {tabs.map((t, i) => {
        const isActive = t.id === active;
        return (
          <Text key={t.id}>
            {i > 0 && <Text> </Text>}
            <Text
              color={isActive ? colors.accent : colors.fgDim}
              backgroundColor={isActive ? colors.bg : undefined}
            >
              {isActive ? '▸ ' : '  '}
              {t.label}
              {t.badge && <Text color={colors.warn}> ({t.badge})</Text>}
            </Text>
          </Text>
        );
      })}
    </Text>
  );
}