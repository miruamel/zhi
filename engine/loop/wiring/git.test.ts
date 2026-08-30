/** @brief Test git wiring helpers (pure, no spawn). @since 0.2.0 */
import { test, expect } from 'bun:test';
import { branchSlug, worktreePath } from './git';

test('branchSlug lowercases + dashes + feat prefix', () => {
  expect(branchSlug('Build a CLI')).toBe('feat/build-a-cli');
});

test('branchSlug empty/non-alphanumeric -> feat/task', () => {
  expect(branchSlug('')).toBe('feat/task');
  expect(branchSlug('!!!')).toBe('feat/task');
});

test('branchSlug truncates to 40 chars', () => {
  const s = branchSlug('a'.repeat(60));
  expect(s).toBe('feat/' + 'a'.repeat(40));
  expect(s.length).toBe(45); // 'feat/' (5) + 40
});

test('worktreePath resolves outside cwd with zhi-wt prefix', () => {
  const p = worktreePath('feat/foo');
  expect(p.endsWith('zhi-wt-feat-foo')).toBe(true);
  expect(p).not.toBe(process.cwd());
});
