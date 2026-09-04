/** @brief Tests for Resources pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// removed: WriteStream from node:fs (ink uses NodeJS.WriteStream)
import { Resources, type ResourceSnapshot } from './resources';

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

const base: ResourceSnapshot = {
  cpu: 42,
  memory: { used: 4 * 1024 * 1024 * 1024, total: 16 * 1024 * 1024 * 1024 },
  disk: { used: 200 * 1024 * 1024 * 1024, total: 500 * 1024 * 1024 * 1024 },
  network: { bytesIn: 128 * 1024, bytesOut: 64 * 1024 },
};

test('renders CPU bar with percentage', () => {
  const out = wrap(React.createElement(Resources, { resources: base }));
  expect(out).toContain('cpu');
  expect(out).toContain(' 42%');
});

test('shows memory used/total', () => {
  const out = wrap(React.createElement(Resources, { resources: base }));
  expect(out).toContain('mem:');
  expect(out).toContain('4.0G');
  expect(out).toContain('16.0G');
});

test('formats disk used/total', () => {
  const out = wrap(React.createElement(Resources, { resources: base }));
  expect(out).toContain('dsk:');
  expect(out).toContain('200.0G');
  expect(out).toContain('500.0G');
});

test('shows network throughput in and out', () => {
  const out = wrap(React.createElement(Resources, { resources: base }));
  expect(out).toContain('net:');
  expect(out).toContain('128.0k');
  expect(out).toContain('64.0k');
});

test('handles missing history gracefully', () => {
  const noHistory: ResourceSnapshot = { ...base };
  const out = wrap(React.createElement(Resources, { resources: noHistory }));
  expect(out).not.toContain('history');
  expect(out).toContain('cpu');
});

test('renders sparkline when history provided', () => {
  const withHistory: ResourceSnapshot = {
    ...base,
    history: { cpu: [0.1, 0.3, 0.5, 0.8, 0.9], mem: [0.2, 0.2, 0.4, 0.4, 0.6] },
  };
  const out = wrap(React.createElement(Resources, { resources: withHistory }));
  expect(out).toContain('history');
  // sparkline chars from the set
  expect(out).toMatch(/[▁▂▃▄▅▆▇█]/);
});

test('renders RESOURCES title', () => {
  const out = wrap(React.createElement(Resources, { resources: base }));
  expect(out).toContain('RESOURCES');
});

test('clamps CPU out of range without crashing', () => {
  const oob: ResourceSnapshot = { ...base, cpu: 250 };
  const out = wrap(React.createElement(Resources, { resources: oob }));
  expect(out).toContain('cpu');
});

test('accepts width prop', () => {
  const out = wrap(React.createElement(Resources, { resources: base, width: 60 }));
  expect(out).toContain('cpu');
});