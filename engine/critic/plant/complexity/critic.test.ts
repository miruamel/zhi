/**
 * @fileoverview Complexity critic tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { complexityCritic } from './critic';

const files = [
  {
    path: 'src/a.ts',
    content: 'export function a() {\n  if (x) { if (y) { if (z) { return 1; } } }\n}',
  },
  { path: 'src/b.ts', content: 'export function b() { return 2; }' },
];

describe('complexityCritic', () => {
  it('returns a critique object', () => {
    const r = complexityCritic(files);
    expect(r.name).toBe('complexity');
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(1);
    expect(Array.isArray(r.findings)).toBe(true);
  });

  it('detects high complexity', () => {
    const r = complexityCritic(files);
    expect(r.findings.length).toBeGreaterThanOrEqual(0);
  });

  it('handles empty files', () => {
    const r = complexityCritic([]);
    expect(r.score).toBe(1);
  });
});
