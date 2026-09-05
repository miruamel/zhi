/** @brief Test architecture critic v2: parseGuard + graduated scoring + infra error classification. @since 0.1.1 */
import { describe, it, expect, mock } from 'bun:test';

const mockSpawnSync = mock();
mock.module('child_process', () => ({ spawnSync: mockSpawnSync }));

const { architectureCritic, parseGuard } = await import('./critic');

describe('parseGuard', () => {
  it('clean stdout = 0 violations, no infra error', () => {
    const stdout =
      'ok: 0 circular dependency\nok: 0 deep relative import\nok: 0 illegal layer edge\n';
    const r = parseGuard(stdout, '');
    expect(r.circular).toBe(0);
    expect(r.deep).toBe(0);
    expect(r.illegal).toBe(0);
    expect(r.infraError).toBe(null);
  });

  it('counts each category from guard output', () => {
    const stdout = [
      'CIRCULAR DEPENDENCY:',
      '  a.ts -> b.ts -> a.ts',
      '  c.ts -> d.ts -> c.ts',
      'ok: 0 deep relative import',
      'DEEP RELATIVE IMPORT (>3 naik):',
      '  e.ts -> ../../../f',
      '  g.ts -> ../../../../h',
      '  i.ts -> ../../../../../../j',
      'SKIPPED/ILLEGAL LAYER EDGE:',
      '  k.ts -> m.ts (src->native)',
    ].join('\n');
    const r = parseGuard(stdout, '');
    expect(r.circular).toBe(2);
    expect(r.deep).toBe(3);
    expect(r.illegal).toBe(1);
  });

  it('captures stderr as infra error', () => {
    const r = parseGuard('ok: 0 circular dependency\n', 'bun: command not found\n');
    expect(r.infraError).toContain('command not found');
  });

  it('handles guard exit 0 (no violation blocks)', () => {
    const stdout =
      'ok: 0 circular dependency\nok: 0 deep relative import\nok: 0 illegal layer edge\n';
    const r = parseGuard(stdout, '');
    expect(r.circular + r.deep + r.illegal).toBe(0);
  });
});

describe('architectureCritic (mocked spawnSync)', () => {
  it('real clean repo scores 1', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: 'ok: 0 circular dependency\nok: 0 deep relative import\nok: 0 illegal layer edge\n',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    const c = architectureCritic([{ path: 'engine/foo/a.ts', content: 'export const x = 1;\n' }]);
    expect(c.score).toBe(1);
    expect(c.weight).toBe(1.5);
    expect(c.findings).toHaveLength(0);
  });

  it('ignores files param (holistic check)', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: 'ok: 0 circular dependency\nok: 0 deep relative import\nok: 0 illegal layer edge\n',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    const c = architectureCritic([
      { path: 'engine/foo/a.ts', content: "import { z } from '../../../src/bar';\n" },
    ]);
    expect(c.score).toBe(1);
    expect(c.findings).toHaveLength(0);
  });

  it('throws on spawn error (res.error)', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: '',
      stderr: '',
      error: new Error('ENOENT'),
      signal: undefined,
    });
    const c = architectureCritic([]);
    expect(c.score).toBe(0);
    expect(c.weight).toBe(1.5);
    expect(c.findings[0]).toContain('infra error');
    expect(c.findings[0]).toContain('ENOENT');
  });

  it('throws on signal kill (res.signal)', () => {
    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: '',
      stderr: '',
      error: undefined,
      signal: 'SIGTERM',
    });
    const c = architectureCritic([]);
    expect(c.score).toBe(0);
    expect(c.weight).toBe(1.5);
    expect(c.findings[0]).toContain('infra error');
    expect(c.findings[0]).toContain('SIGTERM');
  });

  it('graduated scoring with circular + deep + illegal', () => {
    mockSpawnSync.mockReturnValue({
      status: 1,
      stdout: [
        'CIRCULAR DEPENDENCY:',
        '  a.ts -> b.ts -> a.ts',
        'DEEP RELATIVE IMPORT (>3 naik):',
        '  e.ts -> ../../../f',
        'SKIPPED/ILLEGAL LAYER EDGE:',
        '  k.ts -> m.ts (src->native)',
      ].join('\n'),
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    const c = architectureCritic([]);
    expect(c.score).toBe(0);
    expect(c.weight).toBe(1.5);
    expect(c.findings).toHaveLength(3);
    expect(c.findings).toContain('circular dependency: 1 cycle(s)');
    expect(c.findings).toContain('deep relative import: 1 violation(s)');
    expect(c.findings).toContain('illegal layer edge: 1 violation(s)');
  });

  it('partial penalty (only deep)', () => {
    mockSpawnSync.mockReturnValue({
      status: 1,
      stdout: ['DEEP RELATIVE IMPORT (>3 naik):', '  e.ts -> ../../../f'].join('\n'),
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    const c = architectureCritic([]);
    expect(c.score).toBe(0.75);
    expect(c.findings).toContain('deep relative import: 1 violation(s)');
  });

  it('infra error from guard stderr', () => {
    mockSpawnSync.mockReturnValue({
      status: 1,
      stdout: '',
      stderr: 'bun: command not found',
      error: undefined,
      signal: undefined,
    });
    const c = architectureCritic([]);
    expect(c.score).toBe(0);
    expect(c.findings[0]).toContain('infra error');
    expect(c.findings[0]).toContain('command not found');
  });

  it('non-zero exit with no violations parsed', () => {
    mockSpawnSync.mockReturnValue({
      status: 1,
      stdout: 'some unknown output',
      stderr: '',
      error: undefined,
      signal: undefined,
    });
    const c = architectureCritic([]);
    expect(c.score).toBe(1);
    expect(c.findings).toContain('guard exited non-zero but no violations parsed (unknown drift)');
  });
});
