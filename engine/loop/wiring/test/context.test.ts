/** @brief Contract test LoopContext (pure type). @since 0.2.0 */
import { test, expect } from 'bun:test';
import type { LoopContext } from '../context';

test('LoopContext requires goal, accepts optional fields', () => {
  const ctx: LoopContext = { goal: 'deploy cli' };
  expect(ctx.goal).toBe('deploy cli');
  const full: LoopContext = {
    goal: 'g',
    plan: 'p',
    code: 'c',
    branch: 'b',
    worktree: '/wt',
    prUrl: 'https://x',
    error: 'e',
    budgetUsed: 1,
    attempts: 2,
  };
  expect(full.plan).toBe('p');
  expect(full.attempts).toBe(2);
});
