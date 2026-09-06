/**
 * @fileoverview Agents pane tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { AgentsPane } from './agents';
import { renderToString } from '../../../core/test/render';

describe('AgentsPane', () => {
  it('renders empty state', () => {
    const out = renderToString(AgentsPane({ agents: [] }));
    expect(out).toContain('AGENTS');
    expect(out).toContain('0');
  });

  it('renders agent list', () => {
    const out = renderToString(AgentsPane({
      agents: [{ id: '1', name: 'Coder', status: 'running', tasksCompleted: 3 }],
    }));
    expect(out).toContain('Coder');
    expect(out).toContain('running');
  });
});