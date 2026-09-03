/** @brief Tests for Notifications pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import type { WriteStream } from 'node:fs';
import { Notifications } from './notifications';
import type { Notification } from './notifications';

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
  const inst = render(el, { stdout: stdout as unknown as WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

const sample: Notification[] = [
  { id: '1', type: 'info', title: 'Build started', message: 'compiling', ts: 0, read: false },
  { id: '2', type: 'success', title: 'Tests passed', ts: 1000 },
  { id: '3', type: 'warn', title: 'Slow query', message: '>500ms', ts: 2000, read: true },
  { id: '4', type: 'error', title: 'Deploy failed', ts: 3000 },
];

test('renders notification titles', () => {
  const out = wrap(React.createElement(Notifications, { notifications: sample }));
  expect(out).toContain('Build started');
  expect(out).toContain('Tests passed');
  expect(out).toContain('Slow query');
  expect(out).toContain('Deploy failed');
});

test('shows type icons for each variant', () => {
  const out = wrap(React.createElement(Notifications, { notifications: sample }));
  expect(out).toContain('ℹ');
  expect(out).toContain('✓');
  expect(out).toContain('⚠');
  expect(out).toContain('✕');
});

test('shows panel header and counts', () => {
  const out = wrap(React.createElement(Notifications, { notifications: sample }));
  expect(out).toContain('NOTIFICATIONS');
  expect(out).toContain('4');
  expect(out).toContain('unread');
});

test('empty state renders when no notifications', () => {
  const out = wrap(React.createElement(Notifications, { notifications: [] }));
  expect(out).toContain('NOTIFICATIONS');
  expect(out).toContain('no notifications');
});

test('renders message body when provided', () => {
  const out = wrap(React.createElement(Notifications, { notifications: sample }));
  expect(out).toContain('compiling');
  expect(out).toContain('>500ms');
});

test('truncates long messages', () => {
  const long: Notification[] = [
    { id: 'x', type: 'info', title: 't', message: 'a'.repeat(200), ts: 0 },
  ];
  const out = wrap(React.createElement(Notifications, { notifications: long }));
  expect(out).toContain('…');
  expect(out).not.toContain('a'.repeat(200));
});

test('exposes callbacks via props without invoking on render', () => {
  let marks = 0;
  let clears = 0;
  const out = wrap(
    React.createElement(Notifications, {
      notifications: sample,
      onMarkRead: () => { marks++; },
      onClear: () => { clears++; },
    }),
  );
  expect(out).toContain('clear');
  expect(marks).toBe(0);
  expect(clears).toBe(0);
});

test('renders timestamp formatted as time string', () => {
  const fixed: Notification = { id: 't', type: 'info', title: 'fixed', ts: 0 };
  const out = wrap(React.createElement(Notifications, { notifications: [fixed] }));
  // formatTime(0) -> "00:00:00"
  expect(out).toContain('00:00:00');
});

test('marks unread items with indicator', () => {
  const unread: Notification = { id: 'u', type: 'info', title: 'fresh', ts: 0, read: false };
  const out = wrap(React.createElement(Notifications, { notifications: [unread] }));
  expect(out).toContain('●');
});