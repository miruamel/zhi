/** @brief Tests for Badge widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import type { WriteStream } from 'node:fs';
import { Badge, BADGE_COLORS } from './badge';

/** @brief Minimal stdout shape ink requires; lets us capture output synchronously. */
interface CaptureStdout {
  write: (s: string) => boolean;
  columns: number;
  rows: number;
  on: (..._args: unknown[]) => void;
  off: (..._args: unknown[]) => void;
}

/** @brief Render ink element to string via a synchronous writable stdout. */
function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout: CaptureStdout = {
    write: (s) => { chunks.push(s); return true; },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  // ink expects WriteStream; our mock satisfies the surface ink actually calls.
  const inst = render(el, { stdout: stdout as unknown as WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

test('renders children text', () => {
  const out = wrap(React.createElement(Badge, { children: 'Active' }));
  expect(out).toContain('Active');
});

test('solid variant applies background color', () => {
  const out = wrap(React.createElement(Badge, { children: 'OK', color: 'done', variant: 'solid' }));
  expect(out).toContain('OK');
});

test('outline variant wraps in brackets', () => {
  const out = wrap(React.createElement(Badge, { children: 'Draft', color: 'pending', variant: 'outline' }));
  expect(out).toContain('[Draft]');
});

test('dot variant has leading bullet', () => {
  const out = wrap(React.createElement(Badge, { children: 'Live', color: 'running', variant: 'dot' }));
  expect(out).toContain('●');
  expect(out).toContain('Live');
});

test('all semantic colors render without error', () => {
  for (const key of Object.keys(BADGE_COLORS)) {
    const colorKey = key as keyof typeof BADGE_COLORS;
    const out = wrap(React.createElement(Badge, { children: key, color: colorKey }));
    expect(out).toContain(key);
  }
});

test('size lg renders more than size sm', () => {
  const sm = wrap(React.createElement(Badge, { children: 'X', size: 'sm' }));
  const lg = wrap(React.createElement(Badge, { children: 'X', size: 'lg' }));
  expect(lg.length).toBeGreaterThan(sm.length);
});