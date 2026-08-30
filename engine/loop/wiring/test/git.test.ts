import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { branchSlug, worktreePath, gitIsolate, gitCommit } from '../git';
import { mkdtempSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

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
describe('gitIsolate + gitCommit', () => {
  const orig = process.cwd();
  const repo = mkdtempSync(join(tmpdir(), 'zhi-git-'));
  beforeAll(() => {
    process.chdir(repo);
    execSync('git init -q && git config user.email t@t.t && git config user.name t && git commit --allow-empty -q -m init');
  });
  afterAll(() => {
    process.chdir(orig);
    rmSync(repo, { recursive: true, force: true });
  });
  it('creates isolated worktree and commits inside it', () => {
    const wt = gitIsolate('Build Isolated Feature');
    expect(existsSync(wt)).toBe(true);
    const branch = branchSlug('Build Isolated Feature');
    expect(execSync(`git -C "${wt}" rev-parse --abbrev-ref HEAD`).toString().trim()).toBe(branch);
    writeFileSync(join(wt, 'x.txt'), 'hi');
    gitCommit(wt, 'add x');
    expect(execSync(`git -C "${wt}" log --oneline`).toString()).toContain('add x');
    execSync(`git worktree remove --force "${wt}"`);
  });
});

describe('worktreePath', () => {
  it('resolves outside cwd with zhi-wt prefix', () => {
    const p = worktreePath('feat/foo');
    expect(p.endsWith('zhi-wt-feat-foo')).toBe(true);
    expect(p).not.toBe(process.cwd());
  });
});
