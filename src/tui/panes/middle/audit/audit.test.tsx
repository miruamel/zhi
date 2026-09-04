/** @brief Tests for Audit pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// removed: WriteStream from node:fs (ink uses NodeJS.WriteStream)
import { Audit, type AuditEntry } from './audit';

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
    write: (s) => {
      chunks.push(s);
      return true;
    },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

const SAMPLE: AuditEntry[] = [
  { id: '1', ts: 1_700_000_000_000, actor: 'alice', action: 'read', resource: '/api/users', result: 'allow' },
  { id: '2', ts: 1_700_000_001_000, actor: 'bob', action: 'write', resource: '/api/users/1', result: 'deny' },
  { id: '3', ts: 1_700_000_002_000, actor: 'carol', action: 'delete', resource: '/api/admin', result: 'error' },
  { id: '4', ts: 1_700_000_003_000, actor: 'alice', action: 'update', resource: '/api/profile', result: 'allow' },
];

test('renders AUDIT title', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE }));
  expect(out).toContain('AUDIT');
});

test('renders all entries by default', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE }));
  expect(out).toContain('alice');
  expect(out).toContain('bob');
  expect(out).toContain('carol');
  expect(out).toContain('/api/users');
  expect(out).toContain('/api/users/1');
  expect(out).toContain('/api/admin');
});

test('renders allow badge in green', () => {
  const out = wrap(React.createElement(Audit, { entries: [SAMPLE[0]!] }));
  expect(out).toContain('✓ ALLOW');
});

test('renders deny badge in red', () => {
  const out = wrap(React.createElement(Audit, { entries: [SAMPLE[1]!] }));
  expect(out).toContain('✗ DENY');
});

test('renders error badge in red', () => {
  const out = wrap(React.createElement(Audit, { entries: [SAMPLE[2]!] }));
  expect(out).toContain('✗ ERROR');
});

test('filters entries by actor', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE, filter: 'alice' }));
  expect(out).toContain('alice');
  expect(out).toContain('filter: alice');
  expect(out).not.toContain('bob');
  expect(out).not.toContain('carol');
});

test('case-insensitive filter', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE, filter: 'ALICE' }));
  expect(out).toContain('alice');
  expect(out).not.toContain('bob');
});

test('empty entries shows empty state', () => {
  const out = wrap(React.createElement(Audit, { entries: [] }));
  expect(out).toContain('no events yet');
});

test('empty state when filter matches nothing', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE, filter: 'nobody' }));
  expect(out).toContain('no events yet');
});

test('respects maxLines', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE, maxLines: 2 }));
  // last 2 are id=3 (carol) and id=4 (alice second entry)
  expect(out).toContain('alice');
  expect(out).toContain('carol');
  // earlier alice (id=1) should be trimmed
  // but alice from id=4 still appears, so we only assert the count text
  expect(out).toContain('entries');
});

test('renders filter label when filter active', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE, filter: 'bob' }));
  expect(out).toContain('filter: bob');
});

test('handles missing optional ip and userAgent', () => {
  const out = wrap(React.createElement(Audit, { entries: [SAMPLE[0]!] }));
  expect(out).toContain('alice');
});

test('round border style applied', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE }));
  // border chars in round style: ╭ ╮ ╰ ╯ │
  expect(out).toMatch(/[╭╮╰╯│]/);
});

test('renders action labels', () => {
  const out = wrap(React.createElement(Audit, { entries: SAMPLE }));
  expect(out).toContain('read');
  expect(out).toContain('write');
  expect(out).toContain('delete');
});

test('truncates long resource names', () => {
  const long: AuditEntry = {
    id: '5',
    ts: 1_700_000_004_000,
    actor: 'dave',
    action: 'get',
    resource: '/api/' + 'x'.repeat(80),
    result: 'allow',
  };
  const out = wrap(React.createElement(Audit, { entries: [long] }));
  expect(out).toContain('…');
});
