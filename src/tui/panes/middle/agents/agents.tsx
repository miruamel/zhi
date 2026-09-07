/**
 * @fileoverview Agents pane — agent status and metrics.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Badge } from '../../../widgets';

export interface AgentInfo {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'done' | 'failed';
  tasksCompleted: number;
  currentTask?: string;
}

export interface AgentsPaneProps {
  agents: AgentInfo[];
}

const STATUS_COLOR = {
  idle: colors.fgDim,
  running: colors.running,
  done: colors.done,
  failed: colors.error,
};

/** @brief Render the agents pane. @since 0.2.0 */
export function AgentsPane({ agents }: AgentsPaneProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.scoring}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.scoring} bold>
        _AGENTS ({agents.length})
      </Text>
      {agents.map((a) => (
        <Box key={a.id} gap={1} marginTop={1}>
          <Badge label={a.status} color={STATUS_COLOR[a.status]} />
          <Text color={colors.fg}>{a.name}</Text>
          <Text dimColor>· {a.tasksCompleted} tasks</Text>
          {a.currentTask && <Text color={colors.fgDim}>→ {a.currentTask}</Text>}
        </Box>
      ))}
    </Box>
  );
}
