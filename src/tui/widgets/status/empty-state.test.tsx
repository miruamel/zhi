/** @brief Tests for EmptyState widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// removed: WriteStream from node:fs (ink uses NodeJS.WriteStream)
import { EmptyState } from './empty-state';

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
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

test('renders title', () => {
  const out = wrap(React.createElement(EmptyState, { title: 'No items' }));
  expect(out).toContain('No items');
});

test('shows description', () => {
  const out = wrap(React.createElement(EmptyState, {
    title: 'Empty',
    description: 'Add your first item to get started',
  }));
  expect(out).toContain('Empty');
  expect(out).toContain('Add your first item to get started');
});

test('renders icon when provided', () => {
  const out = wrap(React.createElement(EmptyState, {
    icon: '📅',
    title: 'Nothing scheduled',
  }));
  expect(out).toContain('📅');
  expect(out).toContain('Nothing scheduled');
});

test('renders action button with label', () => {
  const out = wrap(React.createElement(EmptyState, {
    title: 'No results',
    action: { label: 'Create new', onClick: () => {} },
  }));
  expect(out).toContain('No results');
  expect(out).toContain('Create new');
});

test('shows hint when provided', () => {
  const out = wrap(React.createElement(EmptyState, {
    title: 'All clear',
    hint: 'Press r to refresh',
  }));
  expect(out).toContain('All clear');
  expect(out).toContain('Press r to refresh');
});

test('handles missing optional props', () => {
  const out = wrap(React.createElement(EmptyState, { title: 'Bare' }));
  expect(out).toContain('Bare');
});

test('renders all sections together', () => {
  const out = wrap(React.createElement(EmptyState, {
    icon: '○',
    title: 'No tasks',
    description: 'You have nothing to do',
    action: { label: 'Add task', onClick: () => {} },
    hint: 'Tip: use n to create one',
  }));
  expect(out).toContain('○');
  expect(out).toContain('No tasks');
  expect(out).toContain('You have nothing to do');
  expect(out).toContain('Add task');
  expect(out).toContain('Tip: use n to create one');
});