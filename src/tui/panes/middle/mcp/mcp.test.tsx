/**
 * @fileoverview McpPane tests. @since 0.2.3
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { McpPane } from './mcp';

const servers = [
  { name: 'filesystem', transport: 'stdio' as const, connected: true, toolCount: 5 },
  {
    name: 'github',
    transport: 'http' as const,
    connected: false,
    toolCount: 3,
    error: 'token expired',
  },
];

describe('McpPane', () => {
  it('renders server count and names', () => {
    const f = renderToString(<McpPane servers={servers} />);
    expect(f).toContain('_MCP (1/2 up · 8 tools)');
    expect(f).toContain('filesystem');
    expect(f).toContain('github');
  });

  it('shows no servers message when empty', () => {
    const f = renderToString(<McpPane servers={[]} />);
    expect(f).toContain('No MCP servers configured.');
  });

  it('shows error for disconnected server', () => {
    const f = renderToString(<McpPane servers={servers} />);
    expect(f).toContain('token expired');
  });
});
