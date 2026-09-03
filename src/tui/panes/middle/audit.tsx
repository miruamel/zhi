/** @brief Audit pane: trail of actor/action/resource events with filter. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { colors } from '../../core/style/colors';
import { formatTime, truncate } from '../../core/style/format';

/** @brief Single audit trail entry. @since 0.1.1 */
export interface AuditEntry {
  id: string;
  ts: number;
  actor: string;
  action: string;
  resource: string;
  result: 'allow' | 'deny' | 'error';
  ip?: string;
  userAgent?: string;
}

/** @brief Audit pane props. @since 0.1.1 */
export interface AuditProps {
  entries: AuditEntry[];
  maxLines?: number;
  filter?: string;
  onFilter?: (filter: string) => void;
}

const FILTER_CYCLE = ['', 'allow', 'deny', 'error'] as const;


/** @brief Render the audit pane with filter input and entry rows. @since 0.1.1 */
export function Audit({ entries, maxLines = 50, filter = '', onFilter }: AuditProps) {
  const [filtering, setFiltering] = useState(false);
  const [draft, setDraft] = useState(filter);

  useInput((input, key) => {
    if (filtering) {
      if (key.return) {
        setFiltering(false);
        onFilter?.(draft);
      } else if (key.escape) {
        setFiltering(false);
        setDraft(filter);
      } else if (key.backspace || key.delete) {
        setDraft((d) => d.slice(0, -1));
      } else if (input.length > 0) {
        setDraft((d) => d + input);
      }
      return;
    }
    if (input === '/') setFiltering(true);
    else if (input === 'f') {
      const i = FILTER_CYCLE.indexOf(filter as (typeof FILTER_CYCLE)[number]);
      const next = FILTER_CYCLE[(i + 1) % FILTER_CYCLE.length] ?? '';
      onFilter?.(next);
    }
  });

  const q = filter.toLowerCase();
  const matched = q ? entries.filter((e) => e.actor.toLowerCase().includes(q)) : entries;
  const visible = matched.slice(-maxLines);
  const hidden = matched.length - visible.length;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.fgDim}
      paddingX={1}
      flexGrow={1}
    >
      <Box gap={1}>
        <Text color={colors.fgDim} bold>
          ◉ AUDIT
        </Text>
        <Text color={colors.fgDim}>
          ({entries.length} entries{hidden > 0 ? `, ${hidden} filtered` : ''})
        </Text>
        {filtering ? (
          <Text color={colors.fg}>{`/${draft}▏`}</Text>
        ) : filter ? (
          <Text color={colors.warn}>{`filter: ${filter}`}</Text>
        ) : null}
      </Box>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no events yet)</Text>
      ) : (
        visible.map((e) => (
          <Box key={e.id} gap={1}>
            <Text color={colors.fgDim}>{formatTime(e.ts)}</Text>
            <Text color={colors.fg} bold>
              {e.actor.padEnd(12)}
            </Text>
            <Text color={colors.accentBlue}>{e.action.padEnd(16)}</Text>
            <Text color={colors.fg}>{truncate(e.resource, 32)}</Text>
            <Text color={e.result === 'allow' ? colors.done : colors.error} bold>
              {e.result === 'allow' ? '✓ ALLOW' : e.result === 'deny' ? '✗ DENY' : '✗ ERROR'}
            </Text>
          </Box>
        ))
      )}
    </Box>
  );
}
