/**
 * @fileoverview Agent list tab — table of agents + selected agent detail card.
 * @since 0.1.11
 * @updated 0.2.6 — extracted from agent.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../../../core/colors';
import { Badge } from '../../../../widgets/badge/badge';
import { Table } from '../../../../widgets/table/table';
import type { AgentDisplay } from '../agent-types';
import { formatRelative, formatTokens } from '../agent-utils';

/** @brief Render agent list table + selected detail. @since 0.1.11 */
export function AgentTable({
  agents,
  selectedAgent,
}: {
  agents: AgentDisplay[];
  selectedAgent?: string;
}): React.ReactNode {
  const selected = agents.find((a) => a.id === selectedAgent);

  return (
    <Box flexDirection="column">
      <Text color={colors.fgDim}>
        {agents.length} agent(s) registered · Ctrl+R refresh · Enter dispatch
      </Text>
      <Box marginTop={1}>
        <Table
          headers={['Agent', 'Status', 'Capabilities', 'Tasks', 'Tokens', 'Last Active']}
          rows={agents.map((a) => ({
            Agent: a.id,
            Status: a.status,
            Capabilities: String(a.capabilities.length),
            Tasks: `${a.tasksCompleted}✓/${a.tasksFailed}✗`,
            Tokens: formatTokens(a.tokensUsed),
            LastActive: formatRelative(a.lastActive),
          }))}
        />
      </Box>
      {selected && (
        <Box marginTop={1} borderStyle="single" borderColor={colors.fgDim} paddingX={1}>
          <Text color={colors.forward} bold>
            {selected.name}
          </Text>
          <Text color={colors.fgDim}> id: {selected.id}</Text>
          <Text color={colors.fgDim}> status: {selected.status}</Text>
          <Text color={colors.fgDim}>
            {' '}
            completed: {selected.tasksCompleted} · failed: {selected.tasksFailed}
          </Text>
          <Text color={colors.fgDim}> capabilities:</Text>
          {selected.capabilities.map((c) => (
            <Text key={c} color={colors.complete}>
              {'  • '}
              {c}
            </Text>
          ))}
          <Box marginTop={1} gap={1}>
            <Badge color={colors.warn}>terminate</Badge>
            <Badge color={colors.complete}>dispatch</Badge>
          </Box>
        </Box>
      )}
    </Box>
  );
}
