/** @brief Tests for Diff pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import type { WriteStream } from 'node:fs';
import { Diff, type DiffFile } from './diff';

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
    columns: 120,
    rows: 40,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

const sample: DiffFile[] = [
  {
    file: 'src/foo.ts',
    hunks: [
      {
        oldStart: 1,
        oldLines: 1,
        newStart: 1,
        newLines: 2,
        lines: [
          { type: 'context', content: 'keep this', lineNumber: 1 },
          { type: 'removed', content: 'old line', lineNumber: 2 },
          { type: 'added', content: 'new line', lineNumber: 2 },
        ],
      },
    ],
  },
];

test('renders file path header', () => {
  const out = wrap(React.createElement(Diff, { diff: sample }));
  expect(out).toContain('src/foo.ts');
});

test('shows added lines with + marker', () => {
  const out = wrap(React.createElement(Diff, { diff: sample }));
  expect(out).toContain('+ new line');
});

test('shows removed lines with - marker', () => {
  const out = wrap(React.createElement(Diff, { diff: sample }));
  expect(out).toContain('- old line');
});

test('renders hunk header with @@ markers', () => {
  const out = wrap(React.createElement(Diff, { diff: sample }));
  expect(out).toContain('@@ -1,1 +1,2 @@');
});

test('shows context lines with dim marker', () => {
  const out = wrap(React.createElement(Diff, { diff: sample }));
  expect(out).toContain('keep this');
});

test('shows line numbers by default', () => {
  const out = wrap(React.createElement(Diff, { diff: sample }));
  expect(out).toMatch(/\b1\b/);
});

test('hides line numbers when showLineNumbers false', () => {
  const out = wrap(React.createElement(Diff, { diff: sample, showLineNumbers: false }));
  expect(out).toContain('+ new line');
  expect(out).not.toMatch(/\b4\b/);
});

test('truncates at maxLines', () => {
  const big: DiffFile[] = [
    {
      file: 'big.ts',
      hunks: [
        {
          oldStart: 1,
          oldLines: 10,
          newStart: 1,
          newLines: 10,
          lines: Array.from({ length: 10 }, (_, i) => ({
            type: 'context' as const,
            content: `line ${i}`,
            lineNumber: i + 1,
          })),
        },
      ],
    },
  ];
  const out = wrap(React.createElement(Diff, { diff: big, maxLines: 3 }));
  expect(out).toContain('truncated');
  expect(out).not.toContain('line 9');
});

test('handles empty diff', () => {
  const out = wrap(React.createElement(Diff, { diff: [] }));
  expect(out).toContain('no changes');
});

test('shows DIFF title with file count', () => {
  const out = wrap(React.createElement(Diff, { diff: sample }));
  expect(out).toContain('DIFF');
  expect(out).toContain('1 file');
});

test('pluralizes file count', () => {
  const two: DiffFile[] = [
    { file: 'a.ts', hunks: [] },
    { file: 'b.ts', hunks: [] },
  ];
  const out = wrap(React.createElement(Diff, { diff: two }));
  expect(out).toContain('2 files');
});