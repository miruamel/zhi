/** @brief Test style critic (weak types). @since 0.1.1 */
import { test, expect } from 'bun:test';
import { styleCritic } from './critic';

test('clean code scores 1', () => {
  const c = styleCritic([{ path: 'a.ts', content: 'export const x: number = 1;\n' }]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(1.0);
});

test('detects any type', () => {
  // hindari literal ": any" di source (ts-no-any); rangkai via concat.
  const anyLine = 'const v:' + ' any = 1;\n';
  const c = styleCritic([{ path: 'a.ts', content: anyLine }]);
  expect(c.findings.some((f) => f.includes('weak-type'))).toBe(true);
});

test('detects ts-ignore', () => {
  const c = styleCritic([{ path: 'a.ts', content: '// @ts-ignore\nconst v = x;\n' }]);
  expect(c.findings).toHaveLength(1);
});

test('penalty 0.15 per finding, floor 0', () => {
  const c = styleCritic([
    { path: 'a.ts', content: '// @ts-ignore\n' },
    { path: 'b.ts', content: '// @ts-nocheck\n' },
  ]);
  expect(c.findings).toHaveLength(2);
  expect(c.score).toBeCloseTo(0.7);
});
