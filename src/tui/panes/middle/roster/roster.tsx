/**
 * @fileoverview Agent roster pane — agent list, capabilities, dispatch.
 * @since 0.2.3
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief Agent roster props. @since 0.2.3 */
export interface AgentRosterPaneProps {
  agents: Array<{
    id: string;
    name: string;
    status: 'idle' | 'running' | 'done' | 'failed';
    tasksCompleted: number;
    currentTask?: string;
    capabilities?: string[];
  }>;
}

const STATUS_COLOR: Record<string, string> = {
  idle: colors.fgDim,
  running: colors.forward,
  done: colors.complete,
  failed: colors.error,
};

const STATUS_ICON: Record<string, string> = {
  idle: '○',
  running: '◐',
  done: '●',
  failed: '✗',
};

/** @brief Render the agent roster pane. @since 0.2.3 */
export function AgentRosterPane({ agents }: AgentRosterPaneProps) {
  const activeCount = agents.filter((a) => a.status === 'running').length;
  const doneCount = agents.filter((a) => a.status === 'done').length;
  const failedCount = agents.filter((a) => a.status === 'failed').length;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _ROSTER ({agents.length} · {activeCount}▶ {doneCount}✓ {failedCount}✗)
      </Text>
      {agents.length === 0 ? (
        <Text color={colors.fgDim}>No agents registered.</Text>
      ) : (
        agents.map((a) => {
          const color = STATUS_COLOR[a.status] ?? colors.fg;
          const icon = STATUS_ICON[a.status] ?? '?';
          const cap = a.capabilities?.join(', ') ?? '';
          return (
            <Box key={a.id} gap={1}>
              <Text color={color}>
                {icon} {a.name.padEnd(12)}
                {a.currentTask ? `→ ${a.currentTask.slice(0, 22)}` : ''}
                <Text color={colors.fgDim}> ({a.tasksCompleted}t)</Text>
              </Text>
              {cap && (
                <Text color={colors.fgDim} wrap="truncate">
                  {cap.slice(0, 40)}
                </Text>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}
