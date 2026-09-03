/** @brief Agents pane: roster of running/idle agents with status + token usage. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { colors } from '../../core/style/colors';
import { glyphs } from '../../core/style/icons';
import { formatTokens, truncate } from '../../core/style/format';

const STATUS_DOT: Record<AgentCard['status'], string> = {
  idle: '○',
  running: '●',
  done: '✓',
  failed: '✗',
};

const STATUS_COLOR: Record<AgentCard['status'], string> = {
  idle: colors.pending,
  running: colors.running,
  done: colors.done,
  failed: colors.failed,
};

const TASK_MAX = 24;

export interface AgentCard {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'done' | 'failed';
  task?: string;
  tokensUsed?: number;
  model?: string;
}

export interface AgentsProps {
  agents: AgentCard[];
  onAgentClick?: (id: string) => void;
  maxLines?: number;
  focused?: boolean;
}

/** @brief Render the agent roster pane. @since 0.1.1 */
export function Agents({ agents, onAgentClick, maxLines , focused = true }: AgentsProps) {
  const limit = maxLines ?? agents.length;
  const visible = agents.slice(0, limit);

  useInput((input, key) => {
    if (!focused) return;
    if (key.return && onAgentClick && visible[0]) {
      onAgentClick(visible[0].id);
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        {glyphs.info} AGENTS
      </Text>
      {visible.length === 0 ? (
        <Box marginTop={1}>
          <Text color={colors.fgDim}>no agents</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          {visible.map((a) => (
            <Box key={a.id} gap={1}>
              <Text color={STATUS_COLOR[a.status]}>{STATUS_DOT[a.status]}</Text>
              <Text bold color={colors.fg}>
                {a.name}
              </Text>
              {a.task ? <Text color={colors.fgDim}>{truncate(a.task, TASK_MAX)}</Text> : null}
              {a.tokensUsed !== undefined ? (
                <Text color={colors.warn}>{formatTokens(a.tokensUsed)}t</Text>
              ) : null}
            </Box>
          ))}
          {agents.length > visible.length ? (
            <Text color={colors.fgDim}>+{agents.length - visible.length} more</Text>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
