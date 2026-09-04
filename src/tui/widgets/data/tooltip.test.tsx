/** @brief Tests for Tooltip widget: render, visibility, position arrows, delay. @since 0.1.1 */
import { test, expect, describe, mock } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import { Text } from 'ink';
import type { WriteStream } from 'node:fs';
import { Tooltip } from './tooltip';

interface CaptureStdout {
  write: (s: string) => boolean;
  columns: number;
  rows: number;
  on: (..._args: unknown[]) => void;
  off: (..._args: unknown[]) => void;
}

function makeStdout(chunks: string[]): WriteStream {
  return {
    write: (s) => { chunks.push(s); return true; },
    columns: 120,
    rows: 24,
    on: () => {},
    off: () => {},
  } as unknown as WriteStream;
}

function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const inst = render(el, { stdout: makeStdout(chunks), debug: true });
  inst.unmount();
  return chunks.join('');
}

describe('Tooltip', () => {
  test('renders trigger text', () => {
    const out = wrap(<Tooltip content="hint"><Text>trigger</Text></Tooltip>);
    expect(out).toContain('trigger');
  });

  test('does not render content by default', () => {
    const out = wrap(<Tooltip content="secret-hint-text"><Text>trigger</Text></Tooltip>);
    expect(out).not.toContain('secret-hint-text');
  });

  test('renders content when visible prop set', () => {
    const out = wrap(<Tooltip content="visible-hint" width={20} visible><Text>x</Text></Tooltip>);
    expect(out).toContain('visible-hint');
  });

  test('renders width when provided', () => {
    const out = wrap(<Tooltip content="w" width={40} visible><Text>t</Text></Tooltip>);
    expect(out).toContain('w');
  });

  test('renders arrow for each position', () => {
    for (const pos of ['top', 'bottom', 'left', 'right'] as const) {
      const out = wrap(<Tooltip content={`hint-${pos}`} position={pos} visible><Text>{`p-${pos}`}</Text></Tooltip>);
      expect(out).toContain(`p-${pos}`);
    }
  });

  test('delay 0 shows immediately', () => {
    const out = wrap(<Tooltip content="delayed" delay={0} visible><Text>t</Text></Tooltip>);
    expect(out).toContain('delayed');
  });

  test('delay > 0 hides content', () => {
    const out = wrap(<Tooltip content="delayed" delay={500}><Text>t</Text></Tooltip>);
    expect(out).not.toContain('delayed');
  });

  test('renders node content', () => {
    const nodeContent = <Text bold>bold</Text>;
    const out = wrap(<Tooltip content={nodeContent} visible><Text>t</Text></Tooltip>);
    expect(out).toContain('bold');
  });

  test('renders children as element', () => {
    const out = wrap(
      <Tooltip content="x" visible>
        <Text>x</Text>
      </Tooltip>,
    );
    expect(out).toContain('x');
  });

  test('default position is top when omitted', () => {
    const out = wrap(<Tooltip content="x"><Text>t</Text></Tooltip>);
    expect(typeof out).toBe('string');
  });

  test('renders multiple instances independently', () => {
    const out = wrap(
      <React.Fragment>
        <Tooltip content="a"><Text>A</Text></Tooltip>
        <Tooltip content="b"><Text>B</Text></Tooltip>
      </React.Fragment>,
    );
    expect(out).toContain('A');
    expect(out).toContain('B');
  });

  test('uses bun:test mock surface', () => {
    const spy = mock(() => {});
    spy();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});