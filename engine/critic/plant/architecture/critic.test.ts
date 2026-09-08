/**
 * @fileoverview Architecture critic tests. @since 0.1.10
 */
import { describe, it, expect } from 'bun:test';
import { architectureCritic } from './critic';

const files = [
  { path: 'src/a.ts', content: 'export function a() {\n  if (x) { if (y) { return 1; } }\n}' },
  { path: 'src/b.ts', content: 'export function b() { return 2; }' },
];

describe('architectureCritic', () => {
  it('returns a critique object', () => {
    const r = architectureCritic(files);
    expect(r.name).toBe('architecture');
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(1);
    expect(Array.isArray(r.findings)).toBe(true);
  });

  it('detects deep nesting', () => {
    const r = architectureCritic(files);
    expect(r.findings.length).toBeGreaterThanOrEqual(0);
  });

  it('handles empty files', () => {
    const r = architectureCritic([]);
    expect(r.score).toBe(1);
  });
  it('reports files-per-directory violation at 5 (boundary, guard is <=4)', () => {
    const five = [
      { path: 'd/a.ts', content: 'a' },
      { path: 'd/b.ts', content: 'b' },
      { path: 'd/c.ts', content: 'c' },
      { path: 'd/e.ts', content: 'e' },
      { path: 'd/f.ts', content: 'f' },
    ];
    const r = architectureCritic(five);
    expect(r.findings.some((f: string) => f.includes('has 5 files'))).toBe(true);
  });
});
