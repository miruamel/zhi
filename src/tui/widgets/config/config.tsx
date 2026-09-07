/**
 * @fileoverview Config widget — key-value configuration display. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Config entry. @since 0.2.6 */
export interface ConfigEntry {
  key: string;
  value: string;
  source?: string;
}

/** @brief Config props. @since 0.2.6 */
export interface ConfigProps {
  entries: ConfigEntry[];
  filter?: string;
}

/** @brief Config component. @since 0.2.6 */
export function Config({ entries, filter }: ConfigProps): React.ReactElement {
  const filtered = filter
    ? entries.filter((e) => e.key.toLowerCase().includes(filter.toLowerCase()))
    : entries;
  return (
    <Text>
      {filtered.map((e) => (
        <Text key={e.key}>
          <Text color="cyan">{e.key}</Text>
          <Text color="gray"> = </Text>
          <Text>{e.value}</Text>
          {e.source && <Text color="gray"> ({e.source})</Text>}
          {'\n'}
        </Text>
      ))}
    </Text>
  );
}
