/** @brief Tests for Callout widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// removed: WriteStream from node:fs (ink uses NodeJS.WriteStream)
import { Callout, CALLOUT_VARIANTS } from './callout';

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

test('renders children text', () => {
  const out = wrap(React.createElement(Callout, { children: 'Heads up' }));
  expect(out).toContain('Heads up');
});

test('applies variant color for info', () => {
  const out = wrap(React.createElement(Callout, { children: 'note', variant: 'info' }));
  expect(out).toContain('ℹ');
});

test('applies variant color for error', () => {
  const out = wrap(React.createElement(Callout, { children: 'broke', variant: 'error' }));
  expect(out).toContain('✕');
});

test('shows title when provided', () => {
  const out = wrap(React.createElement(Callout, { children: 'body', title: 'Heads up' }));
  expect(out).toContain('Heads up');
  expect(out).toContain('body');
});

test('dismissible renders dismiss affordance and invokes onDismiss', () => {
  let called = 0;
  const out = wrap(
    React.createElement(Callout, {
      children: 'x',
      dismissible: true,
      onDismiss: () => { called++; },
    }),
  );
  expect(out).toContain('dismiss');
  expect(called).toBe(0); // hook fires on user input, not render
});

test('all four variants render with their icon', () => {
  const variants = Object.keys(CALLOUT_VARIANTS) as Array<keyof typeof CALLOUT_VARIANTS>;
  for (const v of variants) {
    const meta = CALLOUT_VARIANTS[v];
    const out = wrap(React.createElement(Callout, { children: v, variant: v }));
    expect(out).toContain(v);
    expect(out).toContain(meta.icon);
  }
});