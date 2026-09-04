/** @brief Tests for Agents pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// removed: WriteStream from node:fs (ink uses NodeJS.WriteStream)
import { Agents, type AgentCard } from './agents';

interface CaptureStdout {
  write: (s: string) => boolean;
  columns: number;
  rows: number;
  on: (..._args: unknown[]) => void;
  off: (..._args: unknown[]) => void;
}

function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout: CaptureStdout = {
    write: (s) => { chunks.push(s); return true; },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

const sample: AgentCard[] = [
  { id: 'a1', name: 'planner', status: 'done', task: 'plan v2', tokensUsed: 1200, model: 'opus' },
  { id: 'a2', name: 'builder', status: 'running', task: 'editing panes', tokensUsed: 8400 },
  { id: 'a3', name: 'critic', status: 'failed', tokensUsed: 320 },
  { id: 'a4', name: 'idle-one', status: 'idle' },
];

test('renders agent names', () => {
  const out = wrap(React.createElement(Agents, { agents: sample }));
  expect(out).toContain('planner');
  expect(out).toContain('builder');
  expect(out).toContain('critic');
  expect(out).toContain('idle-one');
});

test('renders title', () => {
  const out = wrap(React.createElement(Agents, { agents: sample }));
  expect(out).toContain('AGENTS');
});

test('shows status dots for each agent', () => {
  const out = wrap(React.createElement(Agents, { agents: sample }));
  expect(out).toContain('●');
  expect(out).toContain('✓');
  expect(out).toContain('✗');
  expect(out).toContain('○');
});

test('truncates long tasks', () => {
  const long: AgentCard[] = [
    { id: 'x', name: 'long-task', status: 'running', task: 'a'.repeat(80) },
  ];
  const out = wrap(React.createElement(Agents, { agents: long }));
  expect(out).toContain('…');
});

test('renders tokens when present', () => {
  const out = wrap(React.createElement(Agents, { agents: sample }));
  expect(out).toContain('1.2k');
  expect(out).toContain('8.4k');
});

test('omits tokens row when undefined', () => {
  const none: AgentCard[] = [{ id: 'p', name: 'pure', status: 'idle' }];
  const out = wrap(React.createElement(Agents, { agents: none }));
  expect(out).not.toContain('t');
});

test('respects maxLines', () => {
  const out = wrap(React.createElement(Agents, { agents: sample, maxLines: 1 }));
  expect(out).toContain('planner');
  expect(out).toContain('+3 more');
});

test('shows empty state when no agents', () => {
  const out = wrap(React.createElement(Agents, { agents: [] }));
  expect(out).toContain('no agents');
});

test('renders without onAgentClick', () => {
  const out = wrap(React.createElement(Agents, { agents: sample }));
  expect(out).toContain('planner');
});
