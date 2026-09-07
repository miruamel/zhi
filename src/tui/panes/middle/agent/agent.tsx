/**
 * @fileoverview Agent pane — agent list, capabilities, dispatch, runtime control.
 * @since 0.2.7
 */
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { colors } from '../../../core/colors';
import { Badge } from '../../../widgets/badge/badge';
import { Tabs, type Tab } from '../../../widgets/tabs/tabs';
import { Table } from '../../../widgets/table/table';

/** @brief Agent display entry. @since 0.2.7 */
export interface AgentDisplay {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'failed' | 'terminated';
  capabilities: string[];
  tasksCompleted: number;
  tasksFailed: number;
  tokensUsed: number;
  lastActive?: number;
}

/** @brief Runtime event log entry. @since 0.2.7 */
export interface RuntimeLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  agentId?: string;
  message: string;
}

/** @brief Agent pane props. @since 0.2.7 */
export interface AgentPaneProps {
  agents: AgentDisplay[];
  runtimeLog: RuntimeLogEntry[];
  selectedAgent?: string;
  onDispatch?: (agentId: string, task: string) => void;
  onTerminate?: (agentId: string) => void;
  onRefresh?: () => void;
}

const LEVEL_COLOR: Record<string, string> = {
  info: colors.fg,
  warn: colors.warn,
  error: colors.error,
};

/** @brief Format a timestamp as relative string. @since 0.2.7 */
function formatRelative(ts?: number): string {
  if (!ts) return 'never';
  const diff = Date.now() - ts;
  if (diff < 1000) return 'now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

/** @brief Format token count with K/M suffix. @since 0.2.7 */
function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/** @brief Agent pane component. @since 0.2.7 */
export function AgentPane({
  agents,
  runtimeLog,
  selectedAgent,
  onDispatch,
  onRefresh,
}: AgentPaneProps) {
  const [tab] = useState('agents');
  const [dispatchInput, setDispatchInput] = useState('');

  useInput((input, key) => {
    if (key.return && dispatchInput.trim() && selectedAgent) {
      onDispatch?.(selectedAgent, dispatchInput.trim());
      setDispatchInput('');
    }
    if (key.ctrl && input === 'r') onRefresh?.();
  });

  const selected = agents.find((a) => a.id === selectedAgent);
  const tabs: Tab[] = [
    { id: 'agents', label: 'Agents' },
    { id: 'log', label: 'Runtime Log' },
    { id: 'dispatch', label: 'Dispatch' },
  ];

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _AGENTS
      </Text>
      <Box marginTop={1} marginBottom={1}>
        <Tabs tabs={tabs} active={tab} />
      </Box>
      {tab === 'agents' && (
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
      )}
      {tab === 'log' && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={colors.fgDim}>{runtimeLog.length} event(s) in runtime log</Text>
          <Box marginTop={1} flexDirection="column">
            {runtimeLog.slice(-50).map((e) => (
              <Box key={e.id}>
                <Text color={LEVEL_COLOR[e.level]}>{`[${e.level.toUpperCase().padEnd(5)}]`}</Text>
                <Text color={colors.fgDim}>{formatRelative(e.timestamp)}</Text>
                {e.agentId && <Text color={colors.forward}>{` ${e.agentId}`}</Text>}
                <Text color={colors.fg}> {e.message}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {tab === 'dispatch' && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={colors.fgDim}>Dispatch task to selected agent:</Text>
          <Box marginTop={1} borderStyle="single" borderColor={colors.fgDim} paddingX={1}>
            <Text color={colors.forward}>{'> '}</Text>
            <Text color={colors.fg}>{dispatchInput || 'type task...'}</Text>
          </Box>
          {selected && (
            <Box marginTop={1}>
              <Text color={colors.fgDim}>
                Target: {selected.name} ({selected.id}) · capabilities:{' '}
                {selected.capabilities.join(', ')}
              </Text>
            </Box>
          )}
          <Box marginTop={1} gap={1}>
            <Badge color={colors.complete}>Enter send</Badge>
            <Badge color={colors.warn}>Esc clear</Badge>
          </Box>
        </Box>
      )}
    </Box>
  );
}
