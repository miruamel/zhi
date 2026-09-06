/**
 * @fileoverview Config — settings panel widget.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface ConfigEntry {
  key: string;
  value: string;
  description?: string;
}

export interface ConfigProps {
  entries: ConfigEntry[];
}

/** @brief Render a configuration key-value panel. @since 0.2.0 */
export function Config({ entries }: ConfigProps) {
  return (
    <Text flexDirection="column">
      {entries.map((e) => (
        <Text key={e.key}>
          <Text color={colors.accentBlue}>{e.key}:</Text>
          {'  '}
          <Text>{e.value}</Text>
          {e.description && <Text dimColor> — {e.description}</Text>}
        </Text>
      ))}
    </Text>
  );
}