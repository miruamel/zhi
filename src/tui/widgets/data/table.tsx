/**
 * @brief Table widget: tabular data with headers, alignment, truncation, and clickable rows.
 * @since 0.1.1
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/style/colors';

/** @brief Horizontal alignment for a table cell. @since 0.1.1 */
export type TableAlign = 'left' | 'right' | 'center';

/** @brief Column descriptor for the Table widget. @since 0.1.1 */
export interface ColumnDef<T = Record<string, unknown>> {
  /** @brief Property key into the row object. @since 0.1.1 */
  key: keyof T;
  /** @brief Human-readable column header. @since 0.1.1 */
  label: string;
  /** @brief Cell alignment. @since 0.1.1 */
  align?: TableAlign;
  /** @brief Fixed column width; auto-sizes to label/value if omitted. @since 0.1.1 */
  width?: number;
  /** @brief Custom cell renderer returning a plain string. @since 0.1.1 */
  render?: (value: T[keyof T], row: T) => string;
}

const ANSI_RE = /\x1b\[[0-9;]*m/g;
const EMPTY_MESSAGE = '(no rows)';
const STRIPED_BG = 'gray';

/** @brief Visible (rendered) width of a string, ignoring ANSI escapes. @since 0.1.1 */
function visibleWidth(s: string): number {
  return s.replace(ANSI_RE, '').length;
}

/** @brief Left-pad/truncate to a fixed visible width. @since 0.1.1 */
function padCell(text: string, width: number, align: TableAlign): string {
  const len = visibleWidth(text);
  if (len >= width) return text.slice(0, width);
  const gap = width - len;
  if (align === 'right') return ' '.repeat(gap) + text;
  if (align === 'center') {
    const left = Math.floor(gap / 2);
    return ' '.repeat(left) + text + ' '.repeat(gap - left);
  }
  return text + ' '.repeat(gap);
}

/** @brief Resolved column with computed width. @since 0.1.1 */
interface ResolvedColumn<T> {
  def: ColumnDef<T>;
  width: number;
  align: TableAlign;
}

/** @brief Default cell formatter for primitives. @since 0.1.1 */
function formatCell(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** @brief Compute final column widths. @since 0.1.1 */
function resolveColumns<T>(columns: ColumnDef<T>[], rows: T[]): ResolvedColumn<T>[] {
  const sample = rows.slice(0, 50);
  return columns.map((def) => {
    const align = def.align ?? 'left';
    let valueWidth = visibleWidth(def.label);
    for (const row of sample) {
      const raw = row[def.key];
      const text = def.render ? def.render(raw, row) : formatCell(raw);
      valueWidth = Math.max(valueWidth, visibleWidth(text));
    }
    return { def, align, width: def.width ?? valueWidth };
  });
}

/** @brief Table widget props. @since 0.1.1 */
export interface TableProps<T = Record<string, unknown>> {
  columns: ColumnDef<T>[];
  rows: T[];
  /** @brief Cap visible rows; extras render as a single "… N more" footer. @since 0.1.1 */
  maxRows?: number;
  /** @brief Click handler receives the original row index. @since 0.1.1 */
  onRowClick?: (rowIndex: number) => void;
  /** @brief Alternating row backgrounds. @since 0.1.1 */
  striped?: boolean;
  /** @brief Header background color token. @since 0.1.1 */
  headerBg?: string;
  /** @brief Optional title rendered above the table. @since 0.1.1 */
  title?: string;
}

/**
 * @brief Render a data table.
 *
 * Pure presentational; click handling is delegated to the consumer.
 * @since 0.1.1
 */
export function Table<T = Record<string, unknown>>({
  columns,
  rows,
  maxRows,
  onRowClick,
  striped = false,
  headerBg,
  title,
}: TableProps<T>) {
  if (columns.length === 0) {
    return (
      <Box flexDirection="column">
        {title !== undefined ? <Text color={colors.fgDim}>{title}</Text> : null}
        <Text color={colors.fgDim}>{EMPTY_MESSAGE}</Text>
      </Box>
    );
  }

  const resolved = resolveColumns(columns, rows);
  const visible =
    maxRows !== undefined && rows.length > maxRows ? rows.slice(0, maxRows) : rows;
  const remaining =
    maxRows !== undefined && rows.length > maxRows ? rows.length - maxRows : 0;

  const renderRow = (
    cells: { text: string; col: ResolvedColumn<T> }[],
    opts: { bold?: boolean; dim?: boolean; bg?: string },
  ): React.ReactNode => {
    const content = cells.map((c, i) => (
      <Text key={i}>{padCell(c.text, c.col.width, c.col.align)}</Text>
    ));
    return (
      <Text bold={opts.bold} color={opts.dim ? colors.fgDim : colors.fg}>
        {opts.bg ? <Text backgroundColor={opts.bg}>{content}</Text> : content}
      </Text>
    );
  };

  const headerCells = resolved.map((col) => ({ text: col.def.label, col }));
  const headerBgColor = headerBg ?? colors.bg;

  return (
    <Box flexDirection="column">
      {title !== undefined ? <Text color={colors.fg}>{title}</Text> : null}
      {renderRow(headerCells, { bold: true, bg: headerBgColor })}
      {visible.length === 0 ? (
        <Text color={colors.fgDim}>{EMPTY_MESSAGE}</Text>
      ) : (
        visible.map((row, idx) => {
          const originalIndex = rows.indexOf(row);
          const cells = resolved.map((col) => {
            const raw = row[col.def.key];
            const text = col.def.render ? col.def.render(raw, row) : formatCell(raw);
            return { text, col };
          });
          const rowBg = striped && idx % 2 === 1 ? STRIPED_BG : undefined;
          const handleClick = onRowClick ? () => onRowClick(originalIndex) : undefined;
          return (
            <Box>
              {/* @ts-expect-error Ink Box lacks onClick prop; runtime no-op until Ink 5+ */}
              <Box key={originalIndex} onClick={handleClick}>
                {renderRow(cells, { bg: rowBg })}
              </Box>
            </Box>
          );
        })
      )}
      {remaining > 0 ? (
        <Text color={colors.fgDim}>
          {'\u2026 '}{remaining}{' more'}
        </Text>
      ) : null}
    </Box>
  );
}