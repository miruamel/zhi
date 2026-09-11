/**
 * @fileoverview Log viewer widget — filterable, searchable log stream.
 * @since 0.1.12
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';
import { formatTime, truncate } from '../../core/format';

/** @brief Log entry for the viewer. @since 0.1.12 */
export interface LogViewerEntry {
  ts: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  source?: string;
  message: string;
}

/** @brief Log viewer props. @since 0.1.12 */
export interface LogViewerProps {
  entries: LogViewerEntry[];
  levels?: Set<string>;
  search?: string;
  maxLines?: number;
  follow?: boolean;
  showTimestamps?: boolean;
}

const LEVEL_COLOR: Record<string, string> = {
  debug: colors.fgDim,
  info: colors.fg,
  warn: colors.warn,
  error: colors.error,
};

const LEVEL_GLYPH: Record<string, string> = {
  debug: '·',
  info: 'ℹ',
  warn: '⚠',
  error: '✗',
};

/** @brief Filter and render log entries. @since 0.1.12 */
export function LogViewer({
  entries,
  levels,
  search,
  maxLines = 50,
  follow = false,
  showTimestamps = true,
}: LogViewerProps) {
  const filtered = entries.filter((e) => {
    if (levels && !levels.has(e.level)) return false;
    if (search && !e.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const visible = follow ? filtered.slice(-maxLines) : filtered.slice(0, maxLines);
  const hidden = filtered.length - visible.length;

  return (
    <Box flexDirection="column">
      <Text color={colors.fgDim} bold>
        LOG ({filtered.length} entries{hidden > 0 ? `, ${hidden} hidden` : ''})
      </Text>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no entries)</Text>
      ) : (
        visible.map((e, i) => (
          <Box key={i} gap={1}>
            {showTimestamps && <Text color={colors.fgDim}>{formatTime(e.ts)}</Text>}
            <Text color={LEVEL_COLOR[e.level] ?? colors.fg} bold>
              {LEVEL_GLYPH[e.level] ?? '·'}
            </Text>
            {e.source && <Text color={colors.accentBlue}>{e.source}</Text>}
            <Text color={colors.fg}>{truncate(e.message, 120)}</Text>
          </Box>
        ))
      )}
    </Box>
  );
}
