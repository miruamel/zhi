/**
 * @fileoverview Table — tabular data display with ReactNode cells.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';

/** @brief A table cell can be a string/number or a ReactNode. @since 0.2.7 */
export type TableCell = string | number | React.ReactNode;

/** @brief A table row is a record of named cells. @since 0.2.7 */
export interface TableRow {
  [key: string]: TableCell;
}

/** @brief Table props. @since 0.2.0 */
export interface TableProps {
  headers: string[];
  rows: TableRow[];
  maxRows?: number;
  highlight?: (row: TableRow) => boolean;
}

/** @brief Render a table with optional row click highlighting. @since 0.2.0 */
export function Table({ headers, rows, maxRows = 10, highlight }: TableProps) {
  const visible = rows.slice(0, maxRows);

  const cellText = (v: TableCell): string =>
    typeof v === 'string' || typeof v === 'number' ? String(v) : '';

  const colWidths = headers.map((h) =>
    Math.max(h.length, ...visible.map((r) => cellText(r[h]).length)),
  );

  const pad = (val: string, w: number) => val.padEnd(w);

  return (
    <Box flexDirection="column">
      <Text color={colors.accentBlue} bold>
        {headers.map((h, i) => pad(h, colWidths[i])).join('  ')}
      </Text>
      <Text color={colors.fgDim}>{headers.map((_, i) => '─'.repeat(colWidths[i])).join('  ')}</Text>
      {visible.map((row, ri) => {
        const isH = highlight ? highlight(row) : false;
        return (
          <Text key={ri} color={isH ? colors.forward : colors.fg}>
            {headers.map((h, i) => {
              const v = row[h];
              const w = colWidths[i];
              if (typeof v === 'string' || typeof v === 'number') {
                return (
                  <Text key={i} color={isH ? colors.forward : colors.fg}>
                    {pad(String(v), w)}
                  </Text>
                );
              }
              return <Text key={i}>{v}</Text>;
            })}
          </Text>
        );
      })}
    </Box>
  );
}
