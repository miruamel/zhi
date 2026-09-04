/** @brief Tests for Queue pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import { render as liveRender } from 'ink-testing-library';
import React from 'react';
// (WriteStream not imported; type via NodeJS.WriteStream)
import { Queue, type QueueTask } from './queue';

interface CaptureStdout {
  write: (s: string) => boolean;
  columns: number;
  rows: number;
  on: (..._args: unknown[]) => void;
  off: (..._args: unknown[]) => void;
}

function makeStdout(chunks: string[]): NodeJS.WriteStream {
  return {
    write: (s: string) => {
      chunks.push(s);
      return true;
    },
    columns: 120,
    rows: 24,
    on: () => {},
    off: () => {},
  } as unknown as NodeJS.WriteStream;
}

function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const inst = render(el, { stdout: makeStdout(chunks), debug: true });
  inst.unmount();
  return chunks.join('');
}

const sleep = (ms: number): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
};

const ICON = {
  running: '●',
  done: '✓',
  failed: '✗',
  pending: '○',
} as const;

const sample: QueueTask[] = [
  { id: 't1', title: 'ship alpha', status: 'running', priority: 'high', progress: 60, eta: 30, worker: 'agent-1' },
  { id: 't2', title: 'fix bug', status: 'failed', priority: 'critical', progress: 20 },
  { id: 't3', title: 'rebuild cache', status: 'queued', priority: 'low', progress: 0 },
  { id: 't4', title: 'run tests', status: 'done', priority: 'medium', progress: 100 },
];

test('renders QUEUE title', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('QUEUE');
});

test('renders every task title', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('ship alpha');
  expect(out).toContain('fix bug');
  expect(out).toContain('rebuild cache');
  expect(out).toContain('run tests');
});

test('renders task count in header', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('(4)');
});

test('shows priority label for each task', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('HIGH');
  expect(out).toContain('CRITICAL');
  expect(out).toContain('LOW');
  expect(out).toContain('MEDIUM');
});

test('shows status icons', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain(ICON.running);
  expect(out).toContain(ICON.done);
  expect(out).toContain(ICON.failed);
  expect(out).toContain(ICON.pending);
});

test('shows progress bar fill characters', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('█');
  expect(out).toContain('░');
});

test('shows percentage label', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('100%');
  expect(out).toContain('60%');
});

test('shows eta when provided', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('eta 30s');
});

test('shows worker name when provided', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('@agent-1');
});

test('omits eta/worker when absent', () => {
  const tasks: QueueTask[] = [{ id: 'x', title: 'plain', status: 'queued', priority: 'low', progress: 0 }];
  const out = wrap(React.createElement(Queue, { tasks }));
  expect(out).toContain('plain');
  expect(out).not.toContain('eta ');
  expect(out).not.toContain('@');
});

test('empty state renders without crash', () => {
  const out = wrap(React.createElement(Queue, { tasks: [] }));
  expect(out).toContain('QUEUE');
  expect(out).toContain('empty');
});

test('maxLines truncates visible tasks', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample, maxLines: 2 }));
  expect(out).toContain('ship alpha');
  expect(out).toContain('fix bug');
  expect(out).not.toContain('rebuild cache');
  expect(out).not.toContain('run tests');
  expect(out).toContain('+2 more');
});

test('press r calls onRetry with first task id', async () => {
  const retried: string[] = [];
  const { stdin, unmount } = liveRender(
    React.createElement(Queue, { tasks: sample, onRetry: (id) => retried.push(id) }),
  );
  await sleep(50);
  stdin.write('r');
  await sleep(50);
  unmount();
  expect(retried).toEqual(['t1']);
});

test('press x calls onCancel with first task id', async () => {
  const cancelled: string[] = [];
  const { stdin, unmount } = liveRender(
    React.createElement(Queue, { tasks: sample, onCancel: (id) => cancelled.push(id) }),
  );
  await sleep(50);
  stdin.write('x');
  await sleep(50);
  unmount();
  expect(cancelled).toEqual(['t1']);
});

test('does not crash when handlers missing', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('ship alpha');
});

test('shows retry/cancel hint keys', () => {
  const out = wrap(React.createElement(Queue, { tasks: sample }));
  expect(out).toContain('retry');
  expect(out).toContain('cancel');
});

test('low priority renders without high-priority label collisions', () => {
  const tasks: QueueTask[] = [
    { id: 'a', title: 'low task', status: 'queued', priority: 'low', progress: 10 },
  ];
  const out = wrap(React.createElement(Queue, { tasks }));
  expect(out).toContain('LOW');
  expect(out).toContain('low task');
});

test('progress 0 shows empty bar', () => {
  const tasks: QueueTask[] = [
    { id: 'q', title: 'waiting', status: 'queued', priority: 'low', progress: 0 },
  ];
  const out = wrap(React.createElement(Queue, { tasks }));
  expect(out).toContain('0%');
});

test('progress 100 shows full bar', () => {
  const tasks: QueueTask[] = [
    { id: 'q', title: 'finished', status: 'done', priority: 'low', progress: 100 },
  ];
  const out = wrap(React.createElement(Queue, { tasks }));
  expect(out).toContain('100%');
});