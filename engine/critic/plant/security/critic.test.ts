/** @brief Test security critic (injection sinks). @since 0.2.0 */
import { test, expect } from 'bun:test';
import { securityCritic } from './critic';

test('clean code scores 1', () => {
  const c = securityCritic([{ path: 'a.ts', content: 'export const x = 1;\n' }]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(1.5);
});

test('detects eval', () => {
  const c = securityCritic([{ path: 'a.ts', content: 'const v = eval(input);\n' }]);
  expect(c.findings.some((f) => f.includes('eval-call'))).toBe(true);
});

test('detects innerHTML', () => {
  const c = securityCritic([{ path: 'a.ts', content: 'el.innerHTML = html;\n' }]);
  expect(c.findings.some((f) => f.includes('innerHTML-assign'))).toBe(true);
});

test('penalty 0.3 per finding, floor 0', () => {
  const c = securityCritic([
    { path: 'a.ts', content: 'eval(x);\n' },
    { path: 'b.ts', content: 'el.innerHTML = y;\n' },
  ]);
  expect(c.findings).toHaveLength(2);
  expect(c.score).toBeCloseTo(0.4);
});

test('does not flag method-call eval (deps.eval)', () => {
  const c = securityCritic([{ path: 'a.ts', content: 'deps.eval(ctx.worktree);\n' }]);
  expect(c.findings.some((f) => f.includes('eval-call'))).toBe(false);
  expect(c.score).toBe(1);
});