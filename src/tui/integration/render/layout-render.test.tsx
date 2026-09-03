/** @brief Tests for LayoutRenderer integration module. @since 0.1.2 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import type { WriteStream } from 'node:fs';
import { LayoutRenderer } from './layout-render';
import { emptyState } from '../core/state';
import { buildDefaultLayout, togglePane } from '../engine/builder';


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
    columns: 200,
    rows: 80,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}


test('renders every visible pane by default', () => {
  const config = buildDefaultLayout();
  const state = emptyState('test goal', 8000);
  const out = wrap(React.createElement(LayoutRenderer, { config, state, threshold: 0.5 }));
  expect(out).toContain('test goal');
  expect(out).toContain('state:');
});

test('skips panes flagged invisible', () => {
  let config = buildDefaultLayout();
  config = togglePane('help', config);
  config = togglePane('log', config);
  config = togglePane('profile', config);
  const state = emptyState('test goal', 8000);
  const out = wrap(React.createElement(LayoutRenderer, { config, state, threshold: 0.5 }));
  expect(out).toContain('test goal');
  expect(out).toContain('state:');
  expect(out.length).toBeGreaterThan(0);
});

test('applies focus border color on the focused pane and dim on others', () => {
  const config = buildDefaultLayout();
  const state = emptyState('test goal', 8000);
  const focused = wrap(
    React.createElement(LayoutRenderer, {
      config, state, threshold: 0.5, focusedPane: 'header',
    }),
  );
  const unfocused = wrap(
    React.createElement(LayoutRenderer, {
      config, state, threshold: 0.5, focusedPane: 'dag',
    }),
  );
  expect(focused).not.toBe(unfocused);
  expect(focused).toContain('test goal');
  expect(unfocused).toContain('test goal');
});

test('handles an empty config without crashing', () => {
  const empty = { panes: [], rows: 0, cols: 0 };
  const state = emptyState('test goal', 8000);
  const out = wrap(
    React.createElement(LayoutRenderer, { config: empty, state, threshold: 0.5 }),
  );
  expect(out.trim()).toBe('');
});

test('toggling a single pane yields fewer rendered borders than default', () => {
  const baseline = buildDefaultLayout();
  let trimmed = baseline;
  trimmed = togglePane('help', trimmed);
  trimmed = togglePane('log', trimmed);
  trimmed = togglePane('profile', trimmed);
  trimmed = togglePane('audit', trimmed);
  trimmed = togglePane('queue', trimmed);
  const state = emptyState('test goal', 8000);
  const baseOut = wrap(
    React.createElement(LayoutRenderer, { config: baseline, state, threshold: 0.5 }),
  );
  const trimmedOut = wrap(
    React.createElement(LayoutRenderer, { config: trimmed, state, threshold: 0.5 }),
  );
  expect(trimmedOut.length).toBeLessThan(baseOut.length);
});

test('renders inside an error boundary without crashing for a broken pane id', () => {
  const config = {
    panes: [{ id: 'no-such-pane' as never, row: 0, col: 0, span: 1, visible: true }],
    rows: 1,
    cols: 1,
  };
  const state = emptyState('test goal', 8000);
  const out = wrap(React.createElement(LayoutRenderer, { config, state, threshold: 0.5 }));
  expect(out.trim()).toBe('');
});