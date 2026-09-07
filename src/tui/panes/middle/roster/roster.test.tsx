/**
 * @fileoverview AgentRosterPane tests. @since 0.2.3
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { AgentRosterPane } from './roster';

const agents = [
  { id: 'a', name: 'builder', status: 'done' as const, tasksCompleted: 5 },
  {
    id: 'b',
    name: 'reviewer',
    status: 'running' as const,
    tasksCompleted: 2,
    currentTask: 'review PR',
  },
  { id: 'c', name: 'tester', status: 'idle' as const, tasksCompleted: 0 },
];

describe('AgentRosterPane', () => {
  it('renders agent count and names', () => {
    const f = renderToString(<AgentRosterPane agents={agents} />);
    expect(f).toContain('_ROSTER (3');
    expect(f).toContain('builder');
    expect(f).toContain('reviewer');
    expect(f).toContain('tester');
  });

  it('shows no agents message when empty', () => {
    const f = renderToString(<AgentRosterPane agents={[]} />);
    expect(f).toContain('No agents registered.');
  });

  it('shows current task for running agent', () => {
    const f = renderToString(<AgentRosterPane agents={agents} />);
    expect(f).toContain('review PR');
  });

  it('shows task count', () => {
    const f = renderToString(<AgentRosterPane agents={agents} />);
    expect(f).toContain('(5t)');
    expect(f).toContain('(2t)');
  });
});
