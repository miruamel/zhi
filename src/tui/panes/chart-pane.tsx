/**
 * @fileoverview Chart pane — horizontal bar chart from numeric data.
 * @since 0.1.11
 * @updated 0.1.12 — split from pane-display.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Text } from 'ink';
import { Pane } from './pane-base';

/** @brief Chart pane. @since 0.1.11 */
export function ChartPane({
  data,
  labels,
  title,
  focused = false,
}: {
  data: number[];
  labels?: string[];
  title?: string;
  focused?: boolean;
}) {
  const max = Math.max(...data, 1);
  const width = 40;
  return (
    <Pane title={title} focused={focused}>
      {data.map((value, i) => {
        const barLen = Math.round((value / max) * width);
        return (
          <Text key={i}>
            {labels?.[i] ?? `Item ${i}`.padEnd(10)} {'█'.repeat(barLen)} {value}
          </Text>
        );
      })}
    </Pane>
  );
}