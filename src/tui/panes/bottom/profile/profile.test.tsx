/** @brief Tests for Profile pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// removed: WriteStream from node:fs (ink uses NodeJS.WriteStream)
import { Profile, type AgentProfile } from './profile';

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

const sample: AgentProfile = {
  name: 'zhi-agent',
  model: 'opus-4',
  version: '0.1.1',
  uptime: 3_660_000,
  tokensUsed: 12_500,
  tokensBudget: 100_000,
  features: ['plan', 'build', 'critique'],
  endpoints: { api: 'http://localhost:7331', ws: 'ws://localhost:7332' },
};

test('renders profile name', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('zhi-agent');
});

test('shows model', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('opus-4');
});

test('shows version', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('0.1.1');
});

test('formats uptime', () => {
  // 3_660_000ms = 1h 1m
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('1h');
  expect(out).toContain('1m');
});

test('formats uptime as days', () => {
  const p: AgentProfile = { ...sample, uptime: 86_400_000 + 3_600_000 };
  const out = wrap(React.createElement(Profile, { profile: p }));
  expect(out).toContain('1d');
});

test('formats uptime as seconds when short', () => {
  const p: AgentProfile = { ...sample, uptime: 5_000 };
  const out = wrap(React.createElement(Profile, { profile: p }));
  expect(out).toContain('5s');
});

test('shows token usage', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('12.5k');
  expect(out).toContain('100.0k');
});

test('renders title', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('PROFILE');
});

test('renders endpoints', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('localhost:7331');
  expect(out).toContain('localhost:7332');
});

test('renders features as badges', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('[plan]');
  expect(out).toContain('[build]');
  expect(out).toContain('[critique]');
});

test('shows placeholder when features empty', () => {
  const p: AgentProfile = { ...sample, features: [] };
  const out = wrap(React.createElement(Profile, { profile: p }));
  expect(out).toContain('(none)');
});

test('renders without onEdit/onExport', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  expect(out).toContain('zhi-agent');
});

test('handles zero token budget without crashing', () => {
  const p: AgentProfile = { ...sample, tokensUsed: 0, tokensBudget: 0 };
  const out = wrap(React.createElement(Profile, { profile: p }));
  expect(out).toContain('zhi-agent');
});

test('renders token usage bar', () => {
  const out = wrap(React.createElement(Profile, { profile: sample }));
  // bar() returns blocks of █/░ — confirm at least one bar character renders
  expect(out).toMatch(/[█░]/);
});