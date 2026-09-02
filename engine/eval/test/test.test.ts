/** @brief Test runTests. @since 0.1.0 */
import { describe, it, expect } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runTests } from '../test';

describe('runTests', () => {
  it('passes with a passing test', () => {
    const d = mkdtempSync(join(tmpdir(), 'zhi-t-'));
    writeFileSync(
      join(d, 'ok.test.ts'),
      `import { expect, test } from 'bun:test';\ntest('p', () => { expect(1).toBe(1); });\n`,
    );
    expect(runTests(d).passed).toBe(true);
  });
  it('fails on a failing test', () => {
    const d = mkdtempSync(join(tmpdir(), 'zhi-t-'));
    writeFileSync(
      join(d, 'bad.test.ts'),
      `import { expect, test } from 'bun:test';\ntest('x', () => { expect(1).toBe(2); });\n`,
    );
    expect(runTests(d).passed).toBe(false);
  });
});
