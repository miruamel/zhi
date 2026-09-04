/** @brief Test evaluate. @since 0.1.1 */
import { describe, it, expect } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { evaluate } from '../index';

describe('evaluate', () => {
  it('passes on clean worktree', () => {
    const d = mkdtempSync(join(tmpdir(), 'zhi-e-'));
    writeFileSync(
      join(d, 'ok.test.ts'),
      `import { expect, test } from 'bun:test';\ntest('p', () => { expect(1).toBe(1); });\n`,
    );
    writeFileSync(join(d, 'ok.ts'), `export const n = 1;\n`);
    expect(evaluate(d).passed).toBe(true);
  });
  it('blocks on leaked secret', () => {
    const d = mkdtempSync(join(tmpdir(), 'zhi-e-'));
    writeFileSync(
      join(d, 'ok.test.ts'),
      `import { expect, test } from 'bun:test';\ntest('p', () => { expect(1).toBe(1); });\n`,
    );
    writeFileSync(join(d, 'cfg.ts'), `const token = "sk-abcdefghijklmnopqrstuvwx";\n`);
    const r = evaluate(d);
    expect(r.passed).toBe(false);
    expect(r.reasons.join(' ')).toContain('secret bocor');
  });
});

describe('evaluate (extra)', () => {
  it('failing test -> blocker', () => {
    const d = mkdtempSync(join(tmpdir(), 'zhi-e-'));
    writeFileSync(
      join(d, 'bad.test.ts'),
      `import { expect, test } from 'bun:test';\ntest('f', () => { expect(1).toBe(2); });\n`,
    );
    const r = evaluate(d);
    expect(r.passed).toBe(false);
    expect(r.reasons.join(' ')).toContain('test gagal');
  });
  it('passed run reports criteria met', () => {
    const d = mkdtempSync(join(tmpdir(), 'zhi-e-'));
    writeFileSync(
      join(d, 'ok.test.ts'),
      `import { expect, test } from 'bun:test';\ntest('p', () => { expect(1).toBe(1); });\n`,
    );
    const r = evaluate(d);
    expect(r.passed).toBe(true);
    expect(r.reasons.join(' ')).toContain('criteria met');
  });
});
