/** @brief Tests for Spinner widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import React from 'react';
import { render } from 'ink';
import { Spinner, SPINNER_PRESETS, type SpinnerType } from './spinner';

/** @brief Render an ink element to a string using a synchronous writable stdout.
 * @param {React.ReactElement} el - component to render.
 * @return {string} captured stdout text.
 * @note debug:true bypasses ink's render throttle so onRender fires immediately. */
function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout = {
    write: (s: string) => { chunks.push(s); return true; },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as any, debug: true });
  inst.unmount();
  return chunks.join('');
}

test('renders label when provided', () => {
  const out = wrap(React.createElement(Spinner, { label: 'Loading' }));
  expect(out).toContain('Loading');
});

test('does not render label whitespace when label absent', () => {
  const out = wrap(React.createElement(Spinner, {}));
  expect(out.trim().length).toBeGreaterThan(0);
  expect(out).not.toContain('  ');
});

test('renders first frame of default braille spinner', () => {
  const out = wrap(React.createElement(Spinner, {}));
  expect(out).toContain(SPINNER_PRESETS.braille[0]);
});

test('has 10 preset types', () => {
  const presets = Object.keys(SPINNER_PRESETS) as SpinnerType[];
  expect(presets.length).toBe(10);
});

test('each preset has at least 2 frames', () => {
  for (const type of Object.keys(SPINNER_PRESETS) as SpinnerType[]) {
    expect(SPINNER_PRESETS[type].length).toBeGreaterThanOrEqual(2);
  }
});

test('renders every preset type without error', () => {
  for (const type of Object.keys(SPINNER_PRESETS) as SpinnerType[]) {
    const out = wrap(React.createElement(Spinner, { type, label: type }));
    expect(out).toContain(type);
  }
});

test('handles missing type gracefully by falling back to braille', () => {
  const out = wrap(
    React.createElement(Spinner, { type: 'nonexistent' as SpinnerType, label: 'fallback' }),
  );
  expect(out).toContain('fallback');
  expect(out).toContain(SPINNER_PRESETS.braille[0]);
});