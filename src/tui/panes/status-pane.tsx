/**
 * @fileoverview Status pane — key-value list with status color.
 * @since 0.1.11
 * @updated 0.1.12 — split from pane-display.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Box, Text } from 'ink';
import { Pane } from './pane-base';

/** @brief Status pane. @since 0.1.11 */
export function StatusPane({
  items,
  focused = false,
}: {
  items: Array<{ label: string; value: string; status?: 'ok' | 'warn' | 'error' | 'pending' }>;
  focused?: boolean;
}) {
  const statusColor = (s?: string) =>
    s === 'ok'
      ? 'green'
      : s === 'warn'
        ? 'yellow'
        : s === 'error'
          ? 'red'
          : s === 'pending'
            ? 'gray'
            : 'white';
  return (
    <Pane title="Status" focused={focused}>
      {items.map((item, i) => (
        <Box key={i}>
          <Text>{item.label}: </Text>
          <Text color={statusColor(item.status) as any}>{item.value}</Text>
        </Box>
      ))}
    </Pane>
  );
}