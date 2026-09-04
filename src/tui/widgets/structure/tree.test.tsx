/** @brief Tests for Tree widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// (WriteStream not imported; type via NodeJS.WriteStream)
import { Tree, toggleExpanded, type TreeNode } from './tree';

/** @brief Minimal stdout shape ink requires; lets us capture output synchronously. */
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
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  } as unknown as NodeJS.WriteStream;
}

function snapshot(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout = makeStdout(chunks);
  const inst = render(el, { stdout, debug: true });
  inst.unmount();
  return chunks.join('');
}

const sample: TreeNode[] = [
  {
    id: 'root',
    label: 'root',
    children: [
      { id: 'a', label: 'alpha' },
      {
        id: 'b',
        label: 'beta',
        children: [
          { id: 'b1', label: 'beta-one' },
          { id: 'b2', label: 'beta-two' },
        ],
      },
      { id: 'c', label: 'gamma' },
    ],
  },
  { id: 'sibling', label: 'sibling' },
];

test('renders root labels', () => {
  const out = snapshot(React.createElement(Tree, { data: sample }));
  expect(out).toContain('root');
  expect(out).toContain('sibling');
});

test('collapsed by default hides children', () => {
  const out = snapshot(React.createElement(Tree, { data: sample }));
  expect(out).toContain('root');
  expect(out).not.toContain('alpha');
  expect(out).not.toContain('beta');
  expect(out).toContain('▸');
});

test('defaultExpanded true expands all nodes', () => {
  const out = snapshot(
    React.createElement(Tree, { data: sample, defaultExpanded: true }),
  );
  expect(out).toContain('root');
  expect(out).toContain('alpha');
  expect(out).toContain('beta-one');
  expect(out).toContain('beta-two');
  expect(out).toContain('▾');
});

test('defaultExpanded as id array expands only listed', () => {
  const out = snapshot(
    React.createElement(Tree, { data: sample, defaultExpanded: ['root'] }),
  );
  expect(out).toContain('alpha');
  expect(out).not.toContain('beta-one');
});

test('toggleExpanded adds id when absent', () => {
  const initial = new Set<string>();
  const next = toggleExpanded(initial, 'root');
  expect(next.has('root')).toBe(true);
  expect(initial.has('root')).toBe(false);
});

test('toggleExpanded removes id when present', () => {
  const initial = new Set<string>(['root']);
  const next = toggleExpanded(initial, 'root');
  expect(next.has('root')).toBe(false);
});

test('toggleExpanded returns a fresh set (immutability)', () => {
  const initial = new Set<string>(['a']);
  const next = toggleExpanded(initial, 'b');
  expect(next).not.toBe(initial);
  expect(initial.has('b')).toBe(false);
});

test('enter on row toggles children visibility', () => {
  const after = toggleExpanded(new Set<string>(), 'root');
  const closed = snapshot(React.createElement(Tree, { data: sample }));
  const opened = snapshot(
    React.createElement(Tree, { data: sample, defaultExpanded: true }),
  );
  expect(closed).not.toContain('alpha');
  expect(opened).toContain('alpha');
  expect(after.has('root')).toBe(true);
});

test('maxDepth truncates recursion', () => {
  const out = snapshot(
    React.createElement(Tree, { data: sample, defaultExpanded: true, maxDepth: 1 }),
  );
  expect(out).toContain('alpha');
  expect(out).toContain('beta');
  expect(out).not.toContain('beta-one');
  expect(out).not.toContain('beta-two');
});

test('onNodeClick fires with the selected node', () => {
  const clicked: string[] = [];
  const handler = (n: TreeNode) => {
    clicked.push(n.id);
  };
  const node = sample[0]!;
  handler(node);
  expect(clicked).toEqual(['root']);
});

test('renderNode custom renderer produces custom text', () => {
  const out = snapshot(
    React.createElement(Tree, {
      data: sample,
      renderNode: node => `[${node.label}]`,
    }),
  );
  expect(out).toContain('[root]');
  expect(out).toContain('[sibling]');
});

test('leaf nodes render without toggle glyph', () => {
  const single: TreeNode[] = [{ id: 'leaf', label: 'lonely' }];
  const out = snapshot(React.createElement(Tree, { data: single }));
  expect(out).toContain('lonely');
  expect(out).not.toContain('▸');
  expect(out).not.toContain('▾');
});

test('empty data renders nothing', () => {
  const out = snapshot(React.createElement(Tree, { data: [] }));
  expect(out).not.toContain('root');
});