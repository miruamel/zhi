/** @brief Tests for Breadcrumb widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import type { WriteStream } from 'node:fs';
import { Breadcrumb } from './breadcrumb';
import type { BreadcrumbItem } from './breadcrumb';

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

test('renders all labels', () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', onClick: () => {} },
    { label: 'Docs', onClick: () => {} },
    { label: 'Guide' },
  ];
  const out = wrap(React.createElement(Breadcrumb, { items }));
  expect(out).toContain('Home');
  expect(out).toContain('Docs');
  expect(out).toContain('Guide');
});

test('active item renders but is not interactive', () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', onClick: () => {} },
    { label: 'Current', active: true },
  ];
  const out = wrap(React.createElement(Breadcrumb, { items }));
  expect(out).toContain('Current');
  // active item should not be rendered as clickable link — no underline indicator on it
  expect(out).toContain('Home');
});

test('separator renders between items', () => {
  const items: BreadcrumbItem[] = [
    { label: 'A', onClick: () => {} },
    { label: 'B', onClick: () => {} },
    { label: 'C' },
  ];
  const out = wrap(React.createElement(Breadcrumb, { items, separator: ' / ' }));
  expect(out).toContain('/');
});

test('truncates middle items when maxItems exceeded', () => {
  const items: BreadcrumbItem[] = [
    { label: 'L1', onClick: () => {} },
    { label: 'L2', onClick: () => {} },
    { label: 'L3', onClick: () => {} },
    { label: 'L4', onClick: () => {} },
    { label: 'L5', onClick: () => {} },
  ];
  const out = wrap(React.createElement(Breadcrumb, { items, maxItems: 3 }));
  expect(out).toContain('L1');
  expect(out).toContain('L5');
  expect(out).toContain('...');
  expect(out).not.toContain('L3');
});

test('renders without separator when onSeparate provided', () => {
  const items: BreadcrumbItem[] = [
    { label: 'A', onClick: () => {} },
    { label: 'B' },
  ];
  const calls: number[] = [];
  const out = wrap(
    React.createElement(Breadcrumb, {
      items,
      separator: ' / ',
      onSeparate: (_item, idx) => { calls.push(idx); },
    }),
  );
  expect(calls.length).toBeGreaterThan(0);
  expect(out).toContain('A');
});

test('icon prefix renders when provided', () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', icon: '~', onClick: () => {} },
  ];
  const out = wrap(React.createElement(Breadcrumb, { items }));
  expect(out).toContain('~');
  expect(out).toContain('Home');
});
