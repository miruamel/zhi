import { describe, it, expect } from 'bun:test';
import { branchSlug } from './git';

describe('branchSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(branchSlug('Build Auth Module')).toBe('feat/build-auth-module');
  });
  it('strips non-alphanumerics', () => {
    expect(branchSlug('  weird @#$ chars!! ')).toBe('feat/weird-chars');
  });
  it('falls back to task on empty', () => {
    expect(branchSlug('')).toBe('feat/task');
  });
  it('truncates to 40 chars', () => {
    const s = branchSlug('a'.repeat(100));
    expect(s.startsWith('feat/')).toBe(true);
    expect(s.length).toBeLessThanOrEqual(5 + 40);
  });
});
