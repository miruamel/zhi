/** @brief Tests for ProgressRing widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import type { WriteStream } from 'node:fs';
import { ProgressRing } from './progress-ring';

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
  const inst = render(el, { stdout: stdout as unknown as WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

test('renders label below the ring', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 50, label: 'Loading' }));
  expect(out).toContain('Loading');
});

test('shows percent in the center when showPercent is true', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 50, max: 100, showPercent: true }));
  expect(out).toContain('50%');
});

test('omits percent when showPercent is false (default)', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 50, max: 100 }));
  expect(out).not.toContain('50%');
});

test('handles value 0 — all empty cells', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 0, max: 100 }));
  expect(out).toContain('░');
  expect(out).not.toContain('▓');
});

test('handles value equal to max — all filled cells', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 100, max: 100 }));
  expect(out).toContain('▓');
  expect(out).not.toContain('░');
});

test('handles missing max — defaults to 100', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 75, showPercent: true }));
  expect(out).toContain('75%');
});

test('partial fill shows both filled and empty cells', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 50, max: 100 }));
  expect(out).toContain('▓');
  expect(out).toContain('░');
});

test('handles value greater than max — clamps to full', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 200, max: 100, showPercent: true }));
  expect(out).toContain('100%');
  expect(out).not.toContain('░');
});

test('handles negative value — renders as zero', () => {
  const out = wrap(React.createElement(ProgressRing, { value: -10, max: 100, showPercent: true }));
  expect(out).toContain('0%');
  expect(out).not.toContain('▓');
});

test('handles max of 0 — renders all empty without crashing', () => {
  const out = wrap(React.createElement(ProgressRing, { value: 50, max: 0, showPercent: true }));
  expect(out).toContain('0%');
});
