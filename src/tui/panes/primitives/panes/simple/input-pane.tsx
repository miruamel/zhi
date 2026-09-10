/**
 * @fileoverview Input pane — single-line command input with placeholder.
 * @since 0.1.11
 * @updated 0.1.12 — split from pane-display.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Text } from 'ink';
import { Pane } from '../../base/pane-base';

/** @brief Input pane. @since 0.1.11 */
export function InputPane({
  value,
  placeholder = 'Type a command...',
  focused = false,
}: {
  value: string;
  placeholder?: string;
  focused?: boolean;
}) {
  return (
    <Pane title="Input" focused={focused}>
      <Text>
        {'> '}
        {value || placeholder}
      </Text>
    </Pane>
  );
}
