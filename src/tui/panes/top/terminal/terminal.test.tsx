/** @brief Tests for Terminal pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import React from 'react';
import { render } from 'ink';
import { Terminal, type TerminalLine } from './terminal';

/** @brief Render an ink element to a string using a synchronous writable stdout. */
function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout = {
    write: (s: string) => { chunks.push(s); return true; },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

const SAMPLE: TerminalLine[] = [
  { no: 1, text: 'bun test', type: 'cmd' },
  { no: 2, text: 'pass 42 tests', type: 'stdout' },
  { no: 3, text: 'warn: deprecated api', type: 'info' },
  { no: 4, text: 'error: missing module', type: 'stderr' },
];

test('renders lines with numbers', () => {
  const out = wrap(React.createElement(Terminal, { lines: SAMPLE }));
  expect(out).toContain('bun test');
  expect(out).toContain('pass 42 tests');
  expect(out).toContain('warn: deprecated api');
  expect(out).toContain('error: missing module');
  expect(out).toContain('  1');
  expect(out).toContain('  2');
  expect(out).toContain('  3');
  expect(out).toContain('  4');
});

test('truncates at maxLines keeping last window', () => {
  const many: TerminalLine[] = Array.from({ length: 50 }, (_, i) => ({
    no: i + 1,
    text: `line ${i + 1}`,
    type: 'stdout' as const,
  }));
  const out = wrap(React.createElement(Terminal, { lines: many, maxLines: 5 }));
  expect(out).toContain('line 46');
  expect(out).toContain('line 50');
  expect(out).not.toContain('line 45');
  expect(out).toContain('45 hidden');
});

test('renders empty state when no lines', () => {
  const out = wrap(React.createElement(Terminal, { lines: [] }));
  expect(out).toContain('no output yet');
});

test('shows default title', () => {
  const out = wrap(React.createElement(Terminal, { lines: SAMPLE }));
  expect(out).toContain('TERMINAL');
});

test('shows custom title', () => {
  const out = wrap(React.createElement(Terminal, { lines: SAMPLE, title: 'build.log' }));
  expect(out).toContain('build.log');
});

test('shows FOLLOW label when autoScroll true', () => {
  const out = wrap(React.createElement(Terminal, { lines: SAMPLE, autoScroll: true }));
  expect(out).toContain('FOLLOW');
  expect(out).not.toContain('PAUSED');
});

test('shows PAUSED label when autoScroll false', () => {
  const out = wrap(React.createElement(Terminal, { lines: SAMPLE, autoScroll: false }));
  expect(out).toContain('PAUSED');
  expect(out).not.toContain('FOLLOW');
});

test('includes total line count in header', () => {
  const out = wrap(React.createElement(Terminal, { lines: SAMPLE }));
  expect(out).toContain('4 lines');
});

test('renders all four line types without throwing', () => {
  const out = wrap(React.createElement(Terminal, { lines: SAMPLE }));
  expect(out.length).toBeGreaterThan(0);
});

test('defaults maxLines to 100 when unspecified', () => {
  const many: TerminalLine[] = Array.from({ length: 150 }, (_, i) => ({
    no: i + 1,
    text: `out ${i + 1}`,
    type: 'stdout' as const,
  }));
  const out = wrap(React.createElement(Terminal, { lines: many }));
  expect(out).toContain('out 100');
  expect(out).not.toContain('out 50');
  expect(out).toContain('50 hidden');
});

test('treats missing type as stdout (renders text)', () => {
  const untyped: TerminalLine[] = [{ no: 1, text: 'plain output' }];
  const out = wrap(React.createElement(Terminal, { lines: untyped }));
  expect(out).toContain('plain output');
});