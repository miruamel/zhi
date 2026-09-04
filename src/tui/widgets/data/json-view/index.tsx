/**
 * @brief JsonView widget: collapsible tree viewer for JSON values.
 *
 * Split from json-view.tsx (311 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.1.1
 */
import { Text, Box, useInput } from 'ink';
import { useState } from 'react';
import type { JsonPath, JsonViewProps } from './types';
import { buildLines } from './renderers';

/** @brief Render a collapsible JSON viewer. @since 0.1.1 */
export function JsonView({
  data,
  collapsed = false,
  maxDepth = 10,
  onPathClick,
}: JsonViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [focused, setFocused] = useState<string>('');

  const isOpen = (k: string): boolean => {
    if (expanded.has(k)) return true;
    return !collapsed;
  };

  const toggle = (key: string): void => {
    if (!key) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (isOpen(key)) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  useInput((input, key) => {
    if (key.return || input === ' ') {
      toggle(focused);
    }
  });

  const lines = buildLines(data, '', 0, collapsed, maxDepth, onPathClick, isOpen, focused, setFocused);

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i}>
          {line.indent}
          {line.head}
          {line.body}
        </Text>
      ))}
    </Box>
  );
}

export type { JsonPath, JsonViewProps };