/**
 * @fileoverview Sessions pane — list, inspect, create, switch sessions.
 * @since 0.2.1
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Badge } from '../../../widgets';

/** @brief Session info. @since 0.2.1 */
export interface SessionInfo {
  id: string;
  label: string;
  createdAt: number;
  lastActive: number;
  steps: number;
  tokensUsed: number;
  finished: boolean;
}

export interface SessionsPaneProps {
  sessions: SessionInfo[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onCreate?: (label: string) => void;
}

const STATUS_COLOR = (finished: boolean) => (finished ? colors.done : colors.running);

/** @brief Render the sessions pane. @since 0.2.1 */
export function SessionsPane({ sessions, activeId, onSelect, onCreate }: SessionsPaneProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _SESSIONS ({sessions.length})
      </Text>
      {sessions.length === 0 ? (
        <Text color={colors.fgDim}>No sessions yet.</Text>
      ) : (
        sessions.map((s) => (
          <Box key={s.id} gap={1} marginTop={1}>
            <Badge label={s.finished ? 'done' : 'active'} color={STATUS_COLOR(s.finished)} />
            <Text color={activeId === s.id ? colors.forward : colors.fg}>{s.label}</Text>
            <Text dimColor>
              · {s.steps} steps · {s.tokensUsed} tok
            </Text>
            {onSelect && <Text color={colors.fgDim}>[enter]</Text>}
          </Box>
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
