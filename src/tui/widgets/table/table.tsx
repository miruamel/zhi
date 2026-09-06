/**
 * @fileoverview Table — simple tabular data display.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export interface TableRow {
  [key: string]: string | number;
}

export interface TableProps {
  headers: string[];
  rows: TableRow[];
  maxRows?: number;
}

/** @brief Render a simple table. @since 0.2.0 */
export function Table({ headers, rows, maxRows = 10 }: TableProps) {
  const visible = rows.slice(0, maxRows);
  const colWidths = headers.map((h) =>
    Math.max(h.length, ...visible.map((r) => String(r[h] ?? '').length))
  );

  const pad = (val: string | number, w: number) => String(val).padEnd(w);

  return (
    <Text flexDirection="column">
      <Text color={colors.accentBlue} bold>
        {headers.map((h, i) => pad(h, colWidths[i])).join('  ')}
      </Text>
      <Text color={colors.fgDim}>
        {headers.map((_, i) => '─'.repeat(colWidths[i])).join('  ')}
      </Text>
      {visible.map((row, ri) => (
        <Text key={ri}>
          {headers.map((h, i) => (
            <Text key={i} color={colors.fg}>
              {pad(row[h] ?? '', colWidths[i])}
            </Text>
          ))}
        </Text>
      ))}
    </Text>
  );
}