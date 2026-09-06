/** @brief Test architecture critic v3: dependency-cruiser JSON parsing + graduated scoring. @since 0.1.1 */
import { describe, it, expect, mock } from 'bun:test';

const mockSpawnSync = mock();
mock.module('child_process', () => ({ spawnSync: mockSpawnSync }));

const { architectureCritic } = await import('./critic');

describe('architectureCritic (mocked dependency-cruiser)', () => {
  it('clean repo (no violations) scores 1', () => {
    mockSpawnSync.mockReturnValueOnce({
      status: 0,
      stdout: JSON.stringify({
        modules: [
          {
            source: 'src/cli/index.ts',
            dependencies: [
              {
                module: './engine',
                resolved: 'engine/index.ts',
                circular: false,
                valid: true,
                dependencyTypes: ['local'],
              },
            ],
            orphan: false,
            valid: true,
          },
        ],
      }),
      stderr: '',
    });
    const r = architectureCritic([]);
    expect(r.name).toBe('architecture');
    expect(r.score).toBe(1);
    expect(r.weight).toBe(1.5);
    expect(r.findings).toEqual([]);
  });

  it('ignores files param (holistic check)', () => {
    mockSpawnSync.mockReturnValueOnce({
      status: 0,
      stdout: JSON.stringify({ modules: [] }),
      stderr: '',
    });
    const r = architectureCritic([{ path: 'x.ts', content: '' }]);
    expect(r.score).toBe(1);
  });

  it('throws on spawn error (res.error)', () => {
    mockSpawnSync.mockReturnValueOnce({
      error: new Error('spawn failed'),
      stdout: '',
      stderr: '',
    });
    const r = architectureCritic([]);
    expect(r.score).toBe(0);
    expect(r.findings[0]).toContain('infra error');
  });

  it('graduated scoring with circular + illegal + orphan', () => {
    mockSpawnSync.mockReturnValueOnce({
      status: 1,
      stdout: JSON.stringify({
        modules: [
          {
            source: 'src/cli/index.ts',
            dependencies: [
              {
                module: './engine',
                resolved: 'engine/index.ts',
                circular: true,
                valid: false,
                dependencyTypes: ['local'],
              },
              {
                module: './src',
                resolved: 'src/index.ts',
                circular: false,
                valid: false,
                dependencyTypes: ['local'],
              },
            ],
            orphan: true,
            valid: false,
          },
        ],
      }),
      stderr: '',
    });
    const r = architectureCritic([]);
    // score = max(0, 1 - 0.5*1 - 0.5*1) = 0; orphan is not penalized
    expect(r.score).toBe(0);
    expect(r.findings.some((f) => f.includes('circular dependency'))).toBe(true);
    expect(r.findings.some((f) => f.includes('illegal layer edge'))).toBe(true);
    expect(r.findings.some((f) => f.includes('orphan'))).toBe(false);
  });

  it('orphan-only violations score 1 (orphan not penalized)', () => {
    mockSpawnSync.mockReturnValueOnce({
      status: 1,
      stdout: JSON.stringify({
        modules: [
          {
            source: 'src/cli/index.ts',
            dependencies: [],
            orphan: true,
            valid: true,
          },
        ],
      }),
      stderr: '',
    });
    const r = architectureCritic([]);
    // orphan is not penalized: score = 1, no findings
    expect(r.score).toBe(1);
    expect(r.findings).toEqual([]);
  });

  it('infra error from stderr', () => {
    mockSpawnSync.mockReturnValueOnce({
      status: 1,
      stdout: '',
      stderr: 'dependency-cruiser: command not found',
    });
    const r = architectureCritic([]);
    expect(r.score).toBe(0);
    expect(r.findings[0]).toContain('infra error');
  });

  it('non-zero exit with no violations parsed (unknown drift)', () => {
    mockSpawnSync.mockReturnValueOnce({
      status: 1,
      stdout: 'invalid json',
      stderr: '',
    });
    const r = architectureCritic([]);
    expect(r.score).toBe(0);
    expect(r.findings[0]).toContain('infra error');
  });
});
