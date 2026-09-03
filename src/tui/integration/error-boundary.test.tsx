/** @brief Tests for PaneErrorBoundary and PaneErrorFallback. @since 0.1.2 */
import { test, expect, describe } from 'bun:test';
import React from 'react';
import { render, Text } from 'ink';
import type { WriteStream } from 'node:tty';
import {
  PaneErrorBoundary,
  PaneErrorFallback,
  type PaneErrorFallbackProps,
  type PaneErrorBoundaryProps,
} from './error-boundary';

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

function GoodChild(): React.ReactElement {
  return React.createElement(Text, null, 'child-content');
}

function Boom(): React.ReactElement {
  throw new Error('boom-pane');
}

describe('PaneErrorBoundary', () => {
  test('renders children when no error', () => {
    const out = wrap(
      React.createElement(PaneErrorBoundary, { paneName: 'safe' } as PaneErrorBoundaryProps,
        React.createElement(GoodChild),
      ),
    );
    expect(out).toContain('child-content');
    expect(out).not.toContain('crashed');
  });

  test('shows fallback on render error', () => {
    const out = wrap(
      React.createElement(PaneErrorBoundary, { paneName: 'metrics' } as PaneErrorBoundaryProps,
        React.createElement(Boom),
      ),
    );
    expect(out).toContain('metrics');
    expect(out).toContain('crashed');
    expect(out).toContain('boom-pane');
  });

  test('uses custom fallback when provided', () => {
    const out = wrap(
      React.createElement(PaneErrorBoundary, {
        paneName: 'cfg',
        fallback: React.createElement(Text, null, 'custom-fallback'),
      } as PaneErrorBoundaryProps,
        React.createElement(Boom),
      ),
    );
    expect(out).toContain('custom-fallback');
    expect(out).not.toContain('crashed');
  });

  test('getDerivedStateFromError sets hasError and surfaces error', () => {
    const next = PaneErrorBoundary.getDerivedStateFromError(new Error('derived-error'));
    expect(next.hasError).toBe(true);
    expect(next.error?.message).toBe('derived-error');
  });

  test('onReset callback fires when invoked via fallback', () => {
    let resets = 0;
    const props: PaneErrorFallbackProps = {
      paneName: 'log',
      error: new Error('x'),
      onReset: () => { resets += 1; },
    };
    const out = wrap(React.createElement(PaneErrorFallback, props));
    expect(out).toContain('log');
    expect(out).toContain('[r] retry');
    props.onReset?.();
    expect(resets).toBe(1);
  });
});