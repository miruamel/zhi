/**
 * @fileoverview Grid pane — responsive grid layout from item list.
 * @since 0.1.11
 * @updated 0.1.12 — split from pane-display.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import React from 'react';
import { Box } from 'ink';
import { Pane } from '../../base/pane-base';

/** @brief Grid pane. @since 0.1.11 */
export function GridPane({
  items,
  columns = 3,
}: {
  items: Array<{ id: string; content: React.ReactNode }>;
  columns?: number;
}) {
  const rows: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return (
    <Pane title="Grid">
      {rows.map((row, ri) => (
        <Box key={ri} flexDirection="row" gap={1}>
          {row.map((item) => (
            <Box key={item.id} flexDirection="column">
              {item.content}
            </Box>
          ))}
        </Box>
      ))}
    </Pane>
  );
}
