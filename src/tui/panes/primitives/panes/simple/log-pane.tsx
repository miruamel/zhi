/**
 * @fileoverview Log pane — timestamped log entries with level color.
 * @since 0.1.11
 * @updated 0.1.12 — split from pane-display.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Text } from 'ink';
import { Pane } from '../../base/pane-base';

/** @brief Log pane. @since 0.1.11 */
export function LogPane({
  entries,
  maxEntries = 100,
  focused = false,
}: {
  entries: Array<{ level: string; message: string; timestamp: number }>;
  maxEntries?: number;
  focused?: boolean;
}) {
  const levelColor = (l: string) =>
    l === 'error'
      ? 'red'
      : l === 'warn'
        ? 'yellow'
        : l === 'info'
          ? 'cyan'
          : l === 'debug'
            ? 'gray'
            : 'white';
  const visible = entries.slice(-maxEntries);
  return (
    <Pane title="Log" focused={focused} height={20}>
      {visible.map((entry, i) => (
        <Text key={i} color={levelColor(entry.level) as any}>
          [{new Date(entry.timestamp).toLocaleTimeString()}] {entry.message}
        </Text>
      ))}
    </Pane>
  );
}
