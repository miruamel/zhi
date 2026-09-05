/** @brief Test git adapter error paths via injected spawn (no mock.module). @since 0.1.4 */
import { describe, it, expect } from 'bun:test';
import { run, ghPrOpen, ghCiWatch } from '../git';

describe('run (injected spawn)', () => {
  it('throws on spawn error (r.error)', () => {
    const spawn = (() => ({
      error: new Error('boom'),
      status: 0,
      stdout: '',
      stderr: '',
    })) as any;
    expect(() => run(['git', 'worktree', 'add', '/tmp/x'], '/tmp', 30000, spawn)).toThrow(
      /spawn error/,
    );
  });

  it('throws on non-zero exit', () => {
    const spawn = (() => ({
      error: null,
      status: 1,
      stdout: '',
      stderr: 'fatal: no such path',
    })) as any;
    expect(() => run(['git', 'worktree', 'add', '/tmp/x'], '/tmp', 30000, spawn)).toThrow(/failed/);
  });
});

describe('ghPrOpen (injected spawn)', () => {
  it('throws when no URL in output', () => {
    const spawn = (() => ({
      error: null,
      status: 0,
      stdout: 'no url here',
      stderr: '',
    })) as any;
    expect(() => ghPrOpen('/tmp/wt', 't', 'b', spawn)).toThrow(/no URL/);
  });

  it('extracts URL from output', () => {
    const spawn = (() => ({
      error: null,
      status: 0,
      stdout: 'https://github.com/owner/repo/pull/42',
      stderr: '',
    })) as any;
    const out = ghPrOpen('/tmp/wt', 't', 'b', spawn);
    expect(out).toBe('https://github.com/owner/repo/pull/42');
  });
});

describe('ghCiWatch (injected spawn)', () => {
  it('returns red on fail', () => {
    const spawn = (() => ({ error: null, status: 0, stdout: 'FAIL', stderr: '' })) as any;
    expect(ghCiWatch(spawn)).toBe('red');
  });

  it('returns green on pass', () => {
    const spawn = (() => ({ error: null, status: 0, stdout: 'PASS', stderr: '' })) as any;
    expect(ghCiWatch(spawn)).toBe('green');
  });

  it('returns pending on empty output', () => {
    const spawn = (() => ({ error: null, status: 0, stdout: '', stderr: '' })) as any;
    expect(ghCiWatch(spawn)).toBe('pending');
  });

  it('returns pending on in progress', () => {
    const spawn = (() => ({
      error: null,
      status: 0,
      stdout: 'in progress',
      stderr: '',
    })) as any;
    expect(ghCiWatch(spawn)).toBe('pending');
  });
});
