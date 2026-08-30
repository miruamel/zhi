/** @brief Test evaluate (orchestrasi test + secret-scan -> gate). @since 0.2.0 */
import { test, expect } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { evaluate } from './index';

/** @brief Buat worktree temp. @return {string} path */
function wt(): string {
  return mkdtempSync(join(tmpdir(), 'eval-'));
}

test('clean worktree with passing test -> passed', () => {
  const d = wt();
  writeFileSync(join(d, 'ok.test.ts'), 'import { test, expect } from "bun:test";\ntest("p", () => { expect(1).toBe(1); });\n');
  const r = evaluate(d);
  expect(r.passed).toBe(true);
  expect(r.reasons.some((x) => x.includes('criteria met'))).toBe(true);
});

test('failing test -> blocker', () => {
  const d = wt();
  writeFileSync(join(d, 'bad.test.ts'), 'import { test, expect } from "bun:test";\ntest("f", () => { expect(1).toBe(2); });\n');
  const r = evaluate(d);
  expect(r.passed).toBe(false);
  expect(r.reasons.some((x) => x.includes('test gagal'))).toBe(true);
});

test('secret in worktree -> blocker', () => {
  const d = wt();
  writeFileSync(join(d, 'ok.test.ts'), 'import { test, expect } from "bun:test";\ntest("p", () => { expect(1).toBe(1); });\n');
  writeFileSync(join(d, 'cfg.ts'), 'const x = { token: "abcdefghij1234567890" };\n');
  const r = evaluate(d);
  expect(r.passed).toBe(false);
  expect(r.reasons.some((x) => x.includes('secret bocor'))).toBe(true);
});
