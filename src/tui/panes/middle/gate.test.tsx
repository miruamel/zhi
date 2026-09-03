/** @brief Tests for Gate pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import React from 'react';
import { render } from 'ink';
import { Gate, handleGateKey, type GateResult } from './gate';

function makeStdout(chunks: string[]) {
  return {
    write: (s: string) => { chunks.push(s); return true; },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
}

function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const inst = render(el, { stdout: makeStdout(chunks) as unknown as NodeJS.WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

const SAMPLE: GateResult[] = [
  { id: 'lint', name: 'lint', status: 'pass', score: 0.98, durationMs: 320 },
  { id: 'test', name: 'test', status: 'fail', score: 0.42, detail: '2 failed', durationMs: 1240 },
  { id: 'coverage', name: 'coverage', status: 'pending', score: 0.7, durationMs: 0 },
  { id: 'e2e', name: 'e2e', status: 'skip', score: 0, durationMs: 0 },
];

test('renders the GATE title with gate count', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('GATE (4)');
});

test('renders each gate name', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('lint');
  expect(out).toContain('test');
  expect(out).toContain('coverage');
  expect(out).toContain('e2e');
});

test('shows pass icon for pass status', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('✓');
});

test('shows fail icon for fail status', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('✗');
});

test('shows pending icon for pending status', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('◌');
});

test('shows skip icon for skip status', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('⊘');
});

test('renders score bar for each gate', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('0.98');
  expect(out).toContain('0.42');
  expect(out).toContain('0.70');
  expect(out).toContain('0.00');
});

test('renders detail when provided', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('2 failed');
});

test('shows empty state when no gates', () => {
  const out = wrap(React.createElement(Gate, { gates: [] }));
  expect(out).toContain('no gates yet');
});

test('shows focus marker on first row', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('▶');
});

test('handleGateKey fires onReplay for focused gate', () => {
  const replayed: string[] = [];
  const result = handleGateKey('r', {}, SAMPLE, 0, (id) => replayed.push(id));
  expect(result.nextFocus).toBe(0);
  expect(result.replayed).toBe('lint');
  if (result.replayed) (result.replayed as string);
});

test('handleGateKey navigates focus down with j', () => {
  const result = handleGateKey('j', {}, SAMPLE, 0);
  expect(result.nextFocus).toBe(1);
});

test('handleGateKey navigates focus up with k', () => {
  const result = handleGateKey('k', {}, SAMPLE, 2);
  expect(result.nextFocus).toBe(1);
});

test('handleGateKey clamps focus at bounds', () => {
  expect(handleGateKey('j', {}, SAMPLE, 10).nextFocus).toBe(3);
  expect(handleGateKey('k', {}, SAMPLE, 0).nextFocus).toBe(0);
});

test('handleGateKey does not replay when onReplay missing', () => {
  const result = handleGateKey('r', {}, SAMPLE, 0);
  expect(result.replayed).toBeUndefined();
});

test('does not crash when onReplay missing', () => {
  const out = wrap(React.createElement(Gate, { gates: SAMPLE }));
  expect(out).toContain('GATE (4)');
});

test('respects maxLines truncation', () => {
  const many: GateResult[] = Array.from({ length: 10 }, (_, i) => ({
    id: `g${i}`,
    name: `gate${i}`,
    status: 'pass' as const,
    score: 0.5,
    durationMs: 100,
  }));
  const out = wrap(React.createElement(Gate, { gates: many, maxLines: 3 }));
  expect(out).toContain('gate0');
  expect(out).toContain('gate2');
  expect(out).not.toContain('gate3');
});