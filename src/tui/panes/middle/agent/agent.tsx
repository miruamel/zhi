/**
 * @fileoverview Agent pane — agent list, capabilities, dispatch, runtime control.
 * @since 0.1.11
 * @updated 0.1.11 — refactored: types/utils/table/log/dispatch split (Phase 1)
 * @package zhi
 */
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { colors } from '../../../core/colors';
import { Tabs, type Tab } from '../../../widgets/tabs/tabs';
import type { AgentDisplay, AgentPaneProps } from './agent-types';
import { AgentTable } from './tabs/agent-table';
import { RuntimeLogTab } from './tabs/runtime-log-tab';
import { DispatchTab } from './tabs/dispatch-tab';

/** @brief Agent pane component. @since 0.1.11 */
export function AgentPane({
  agents,
  runtimeLog,
  selectedAgent,
  onDispatch,
  onRefresh,
}: AgentPaneProps): React.ReactNode {
  const [tab] = useState('agents');
  const [dispatchInput, setDispatchInput] = useState('');

  useInput((input, key) => {
    if (key.return && dispatchInput.trim() && selectedAgent) {
      onDispatch?.(selectedAgent, dispatchInput.trim());
      setDispatchInput('');
    }
    if (key.ctrl && input === 'r') onRefresh?.();
  });

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
        {' '}
        _AGENTS
      </Text>
      <Box marginTop={1} marginBottom={1}>
        <Tabs tabs={tabs} active={tab} />
      </Box>
      {tab === 'agents' && <AgentTable agents={agents} selectedAgent={selectedAgent} />}
      {tab === 'log' && <RuntimeLogTab runtimeLog={runtimeLog} />}
      {tab === 'dispatch' && (
        <DispatchTab
          dispatchInput={dispatchInput}
          selectedAgent={agents.find((a: AgentDisplay) => a.id === selectedAgent)}
        />
      )}
    </Box>
  );
}
