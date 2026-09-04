/** @brief Test sloc critic. @since 0.1.1 */
import { test, expect } from 'bun:test';
import { slocCritic, countSloc } from './critic';

test('countSloc ignores blank + comment lines', () => {
  expect(countSloc('a\n\nb\n//c\n/*x*/\n')).toBe(2);
});

test('slocCritic scores 1 when all files within limit', () => {
  const c = slocCritic([{ path: 'a.ts', content: 'x\ny\n' }]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
});

test('slocCritic penalizes files exceeding limit', () => {
  const big = 'x\n'.repeat(250);
  const c = slocCritic([{ path: 'big.ts', content: big }], 200);
  expect(c.score).toBeLessThan(1);
  expect(c.findings[0]).toContain('big.ts');
  expect(c.findings[0]).toContain('250');
});
