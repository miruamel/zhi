/**
 * @fileoverview Trace pane — structured log search, filter, replay.
 * @since 0.2.4
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief A single trace entry. @since 0.2.4 */
export interface TraceEntry {
  ts: number;
  from?: string;
  to?: string;
  event?: string;
  kind: 'transition' | 'info' | 'warn' | 'error' | 'gate';
  msg: string;
}

/** @brief Trace pane props. @since 0.2.4 */
export interface TracePaneProps {
  entries: TraceEntry[];
  filter?: string;
  selectedIdx?: number;
  onReplay?: (idx: number) => void;
}

const KIND_COLOR: Record<string, string> = {
  transition: colors.forward,
  info: colors.fg,
  warn: colors.warn,
  error: colors.error,
  gate: colors.complete,
};

const KIND_ICON: Record<string, string> = {
  transition: '→',
  info: '·',
  warn: '!',
  error: '✗',
  gate: '✓',
};

/** @brief Render the trace pane. @since 0.2.4 */
export function TracePane({ entries, filter, selectedIdx, onReplay }: TracePaneProps) {
  const q = (filter ?? '').toLowerCase();
  const filtered = q
    ? entries.filter(
        (e) => e.msg.toLowerCase().includes(q) || (e.event ?? '').toLowerCase().includes(q),
      )
    : entries;
  const visible = filtered.slice(0, 40);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _TRACE ({filtered.length}/{entries.length})
      </Text>
      {filter && <Text color={colors.fgDim}> filter: {filter}</Text>}
      {visible.length === 0 ? (
        <Text color={colors.fgDim}>No trace entries.</Text>
      ) : (
        visible.map((e, i) => {
          const isSel = i === selectedIdx;
          const color = isSel ? colors.forward : (KIND_COLOR[e.kind] ?? colors.fg);
          const icon = KIND_ICON[e.kind] ?? '·';
          const ts = new Date(e.ts).toLocaleTimeString();
          return (
            <Box key={i} gap={1}>
              <Text color={color}>
                {isSel ? '▸ ' : '  '}
                <Text color={colors.fgDim}>{ts}</Text> {icon} {e.event ?? e.kind}{' '}
                {e.msg.slice(0, 50)}
              </Text>
            </Box>
          );
        })
      )}
      {onReplay && selectedIdx != null && (
        <Box marginTop={1}>
          <Text color={colors.complete}>{'>'} replay</Text>
        </Box>
      )}
    </Box>
  );
}
