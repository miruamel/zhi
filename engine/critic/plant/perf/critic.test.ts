/** @brief Test perf critic (debug noise). @since 0.1.1 */
import { test, expect } from 'bun:test';
import { perfCritic } from './critic';

test('clean code scores 1', () => {
  const c = perfCritic([{ path: 'a.ts', content: 'export const x = 1;\n' }]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(1.0);
});

test('detects debugger', () => {
  const c = perfCritic([{ path: 'a.ts', content: 'function f() { debugger; }\n' }]);
  expect(c.findings.some((f) => f.includes('debug-noise'))).toBe(true);
});

test('detects console.log', () => {
  const c = perfCritic([{ path: 'a.ts', content: 'console.log("x");\n' }]);
  expect(c.findings).toHaveLength(1);
});

test('penalty 0.15 per finding, floor 0', () => {
  const c = perfCritic([
    { path: 'a.ts', content: 'debugger;\n' },
    { path: 'b.ts', content: 'console.error("e");\n' },
  ]);
  expect(c.findings).toHaveLength(2);
  expect(c.score).toBeCloseTo(0.7);
});
