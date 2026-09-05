/** @brief Test git adapter error paths via mock.module. @since 0.1.3 */
import { describe, it, expect, mock } from 'bun:test';

const mockSpawnSync = mock();
mock.module('node:child_process', () => ({ spawnSync: mockSpawnSync }));

const { ghPrOpen, ghCiWatch } = await import('../git');

describe('ghPrOpen (mocked spawnSync)', () => {
  it('throws on spawn error (r.error)', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: '',
      stderr: '',
      error: new Error('ENOENT'),
      signal: undefined,
    });
    expect(() => ghPrOpen('/tmp/wt', 't', 'b')).toThrow(/spawn error/);
  });

  it('throws on non-zero exit', () => {
    mockSpawnSync.mockReturnValue({
      status: 1,
      stdout: '',
      stderr: 'authentication failed',
      error: undefined,
      signal: undefined,
    });
    expect(() => ghPrOpen('/tmp/wt', 't', 'b')).toThrow(/failed/);
  });

  it('throws when no URL in output', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: 'no url here',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    expect(() => ghPrOpen('/tmp/wt', 't', 'b')).toThrow(/no URL/);
  });

  it('extracts URL from output', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: 'https://github.com/owner/repo/pull/42\n',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    expect(ghPrOpen('/tmp/wt', 't', 'b')).toBe('https://github.com/owner/repo/pull/42');
  });
});

describe('ghCiWatch (mocked spawnSync)', () => {
  it('returns red on fail', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: 'FAIL: build\n',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    expect(ghCiWatch()).toBe('red');
  });

  it('returns green on pass', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: 'PASS: build\n',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    expect(ghCiWatch()).toBe('green');
  });

  it('returns pending on empty output', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: '',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    expect(ghCiWatch()).toBe('pending');
  });

  it('returns pending on in progress', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: 'in progress\n',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    expect(ghCiWatch()).toBe('pending');
  });
});
