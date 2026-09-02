/** @brief Test architecture critic v2: parseGuard + graduated scoring + infra error classification. @since 0.1.0 */
import { test, expect } from 'bun:test';
import { architectureCritic, parseGuard } from './critic';

test('parseGuard: clean stdout = 0 violations, no infra error', () => {
  const stdout =
    'ok: 0 circular dependency\nok: 0 deep relative import\nok: 0 illegal layer edge\n';
  const r = parseGuard(stdout, '');
  expect(r.circular).toBe(0);
  expect(r.deep).toBe(0);
  expect(r.illegal).toBe(0);
  expect(r.infraError).toBe(null);
});

test('parseGuard: counts each category from guard output', () => {
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

test('parseGuard: captures stderr as infra error', () => {
  const r = parseGuard('ok: 0 circular dependency\n', 'bun: command not found\n');
  expect(r.infraError).toContain('command not found');
});

test('architectureCritic: real clean repo scores 1', () => {
  const c = architectureCritic([{ path: 'engine/foo/a.ts', content: 'export const x = 1;\n' }]);
  expect(c.score).toBe(1);
  expect(c.weight).toBe(1.5);
  expect(c.findings).toHaveLength(0);
});

test('architectureCritic: ignores files param (holistic check)', () => {
  // Path fakes an illegal layer edge, but the param is ignored — guard runs against real repo.
  const c = architectureCritic([
    { path: 'engine/foo/a.ts', content: "import { z } from '../../../src/bar';\n" },
  ]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
});

test('parseGuard: handles guard exit 0 (no violation blocks)', () => {
  const stdout =
    'ok: 0 circular dependency\nok: 0 deep relative import\nok: 0 illegal layer edge\n';
  const r = parseGuard(stdout, '');
  expect(r.circular + r.deep + r.illegal).toBe(0);
});
