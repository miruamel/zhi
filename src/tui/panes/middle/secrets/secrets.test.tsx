/** @brief Tests for Secrets pane. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { render } from 'ink';
import React from 'react';
// removed: WriteStream from node:fs (ink uses NodeJS.WriteStream)
import { Secrets, daysUntil, isExpiringSoon, type SecretEntry } from './secrets';

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
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

const NOW = 1_700_000_000_000;
const DAY = 86_400_000;

function fixture(): SecretEntry[] {
  return [
    { id: 's1', name: 'github-token', provider: 'gh', lastRotated: NOW - 3 * DAY, expires: NOW + 30 * DAY, status: 'active' },
    { id: 's2', name: 'aws-key', provider: 'aws', lastRotated: NOW - 60 * DAY, expires: NOW + 5 * DAY, status: 'expiring' },
    { id: 's3', name: 'npm-secret', provider: 'npm', lastRotated: NOW - 120 * DAY, expires: NOW - 2 * DAY, status: 'expired' },
  ];
}

test('renders secret names', () => {
  const out = wrap(React.createElement(Secrets, { secrets: fixture(), maxLines: 16 } as React.ComponentProps<typeof Secrets>));
  expect(out).toContain('github-token');
  expect(out).toContain('aws-key');
  expect(out).toContain('npm-secret');
});

test('shows status text for every entry', () => {
  const out = wrap(React.createElement(Secrets, { secrets: fixture(), maxLines: 16 } as React.ComponentProps<typeof Secrets>));
  expect(out).toContain('active');
  expect(out).toContain('expiring');
  expect(out).toContain('expired');
});

test('shows providers', () => {
  const out = wrap(React.createElement(Secrets, { secrets: fixture(), maxLines: 16 } as React.ComponentProps<typeof Secrets>));
  expect(out).toContain('gh');
  expect(out).toContain('aws');
  expect(out).toContain('npm');
});

test('renders expiry label formats', () => {
  const out = wrap(React.createElement(Secrets, { secrets: fixture(), maxLines: 16 } as React.ComponentProps<typeof Secrets>));
  expect(out).toMatch(/\d+d\b/);
  expect(out).toContain('exp:');
});

test('renders empty state when no secrets', () => {
  const out = wrap(React.createElement(Secrets, { secrets: [] }));
  expect(out).toContain('no secrets registered');
});

test('SECRETS title present', () => {
  const out = wrap(React.createElement(Secrets, { secrets: fixture() }));
  expect(out).toContain('SECRETS');
});

test('caps rendered rows to maxLines', () => {
  const many: SecretEntry[] = Array.from({ length: 25 }, (_, i) => ({
    id: `id-${i}`,
    name: `name-${i}`,
    provider: 'gh',
    status: 'active',
  }));
  const out = wrap(React.createElement(Secrets, { secrets: many, maxLines: 5 }));
  expect(out).toContain('name-0');
  expect(out).toContain('name-4');
  expect(out).not.toContain('name-5');
  expect(out).toContain('+20 more');
});

test('daysUntil returns positive for future expiry', () => {
  expect(daysUntil(NOW + 5 * DAY, NOW)).toBe(5);
});

test('daysUntil returns negative for past expiry', () => {
  expect(daysUntil(NOW - 2 * DAY, NOW)).toBe(-2);
});

test('isExpiringSoon true inside threshold window', () => {
  expect(isExpiringSoon(NOW + 3 * DAY, NOW)).toBe(true);
});

test('isExpiringSoon false outside threshold window', () => {
  expect(isExpiringSoon(NOW + 30 * DAY, NOW)).toBe(false);
});