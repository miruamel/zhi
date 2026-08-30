/** @brief Test scanSecrets. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanSecrets } from './security';

/** @brief Buat worktree temp. @return {string} path */
function wt(): string {
  return mkdtempSync(join(tmpdir(), 'sec-'));
}

test('clean worktree -> not leaked', () => {
  const d = wt();
  writeFileSync(join(d, 'a.ts'), 'export const a = 1;\n');
  const r = scanSecrets(d);
  expect(r.leaked).toBe(false);
  expect(r.findings).toHaveLength(0);
});

test('worktree with secret -> leaked + finding', () => {
  const d = wt();
  writeFileSync(join(d, 'cfg.ts'), 'const cfg = { password: "supersecretvalue123" };\n');
  const r = scanSecrets(d);
  expect(r.leaked).toBe(true);
  expect(r.findings.some((f) => f.includes('password'))).toBe(true);
});

test('nonexistent worktree -> fail-closed (leaked)', () => {
  const r = scanSecrets('/nonexistent/path/zhi-xyz');
  expect(r.leaked).toBe(true);
  expect(r.findings[0]).toContain('scan error');
});
