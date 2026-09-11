/**
 * @fileoverview Sessions pane — list, inspect, create, switch sessions.
 * @since 0.1.11 @updated 0.1.12 — M4b: add parallel run view
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Badge } from '../../../widgets';
import { Progress } from '../../../widgets/progress';

/** @brief Session info. @since 0.1.11 @updated 0.1.12 — M4b: add parallel/concurrency fields */
export interface SessionInfo {
  id: string;
  label: string;
  createdAt: number;
  lastActive: number;
  steps: number;
  tokensUsed: number;
  finished: boolean;
  /** @brief Whether this session runs in parallel mode. @since 0.1.12 */
  parallel?: boolean;
  /** @brief Number of concurrent sub-runs within this session. @since 0.1.12 */
  concurrent?: number;
}

export interface SessionsPaneProps {
  sessions: SessionInfo[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onCreate?: (label: string) => void;
}

const STATUS_COLOR = (finished: boolean) => (finished ? colors.done : colors.running);

/** @brief Render one session row. @since 0.1.11 @updated 0.1.12 */
function SessionRow({
  s,
  isActive,
  onSelect,
}: {
  s: SessionInfo;
  isActive: boolean;
  onSelect?: (id: string) => void;
}) {
  const status = s.finished ? 'done' : 'active';
  const parallelTag = s.parallel ? ' ⚡' + (s.concurrent != null ? `×${s.concurrent}` : '') : '';
  return (
    <Box key={s.id} gap={1} marginTop={1}>
      <Badge label={status} color={STATUS_COLOR(s.finished)} />
      <Text color={isActive ? colors.forward : colors.fg}>
        {s.label}
        {parallelTag}
      </Text>
      <Text dimColor>
        · {s.steps} steps · {s.tokensUsed} tok
      </Text>
      {s.parallel && s.concurrent != null && s.concurrent > 1 && (
        <Progress value={1} max={s.concurrent} width={s.concurrent} color={colors.running} />
      )}
      {onSelect && <Text color={colors.fgDim}>[enter]</Text>}
    </Box>
  );
}

/** @brief Render the sessions pane. @since 0.1.11 @updated 0.1.12 */
export function SessionsPane({ sessions, activeId, onSelect, onCreate }: SessionsPaneProps) {
  const parallelCount = sessions.filter((s) => s.parallel).length;
  const maxConcurrent = Math.max(0, ...sessions.map((s) => s.concurrent ?? 0));

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _SESSIONS ({sessions.length}
        {parallelCount > 0 ? ` · ${parallelCount} parallel` : ''}
        {maxConcurrent > 0 ? ` · max×${maxConcurrent}` : ''})
      </Text>
      {sessions.length === 0 ? (
        <Text color={colors.fgDim}>No sessions yet.</Text>
      ) : (
        sessions.map((s) => (
          <SessionRow key={s.id} s={s} isActive={activeId === s.id} onSelect={onSelect} />
        ))
      )}
      {onCreate && (
        <Box marginTop={1}>
          <Text color={colors.fgDim}>[n] new · [enter] switch</Text>
        </Box>
      )}
    </Box>
  );
}
