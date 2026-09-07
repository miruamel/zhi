/**
 * @fileoverview AgentPane tests. @since 0.2.7
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { AgentPane } from './agent';

const agents = [
  {
    id: 'architect',
    name: 'Architect',
    status: 'idle' as const,
    capabilities: ['design', 'review'],
    tasksCompleted: 5,
    tasksFailed: 1,
    tokensUsed: 12345,
    lastActive: Date.now() - 5000,
  },
  {
    id: 'coder',
    name: 'Coder',
    status: 'running' as const,
    capabilities: ['generate', 'refactor'],
    tasksCompleted: 12,
    tasksFailed: 0,
    tokensUsed: 98765,
  },
];

const runtimeLog = [
  {
    id: 'e1',
    timestamp: Date.now() - 1000,
    level: 'info' as const,
    agentId: 'coder',
    message: 'task started',
  },
  {
    id: 'e2',
    timestamp: Date.now() - 500,
    level: 'warn' as const,
    agentId: 'coder',
    message: 'high token usage',
  },
];

describe('AgentPane', () => {
  it('renders agents tab by default', () => {
    const f = renderToString(
      <AgentPane agents={agents} runtimeLog={runtimeLog} selectedAgent="architect" />,
    );
    expect(f).toContain('_AGENTS');
    expect(f).toContain('architect');
    expect(f).toContain('coder');
  });

  it('shows runtime log tab', () => {
    const f = renderToString(
      <AgentPane agents={agents} runtimeLog={runtimeLog} selectedAgent="architect" />,
    );
    expect(f).toContain('Runtime Log');
  });

  it('shows dispatch tab', () => {
    const f = renderToString(
      <AgentPane agents={agents} runtimeLog={runtimeLog} selectedAgent="architect" />,
    );
    expect(f).toContain('Dispatch');
  });

  it('shows empty state when no agents', () => {
    const f = renderToString(<AgentPane agents={[]} runtimeLog={[]} />);
    expect(f).toContain('0 agent(s)');
  });
});
