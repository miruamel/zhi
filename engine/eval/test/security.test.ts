/** @brief Test scanSecrets. @since 0.1.0 */
import { describe, it, expect } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanSecrets } from '../security';

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'zhi-sec-'));
}

describe('scanSecrets', () => {
  it('detects api key assignment', () => {
    const d = tmp();
    writeFileSync(join(d, 'cfg.ts'), `const apiKey = "sk-abcdefghijklmnopqrstuvwx";\n`);
    const r = scanSecrets(d);
    expect(r.leaked).toBe(true);
    expect(r.findings.length).toBeGreaterThan(0);
  });
  it('clean file passes', () => {
    const d = tmp();
    writeFileSync(join(d, 'ok.ts'), `export const n = 1;\n`);
    expect(scanSecrets(d).leaked).toBe(false);
  });
});

describe('scanSecrets (extra)', () => {
  it('nonexistent worktree -> fail-closed (leaked)', () => {
    const r = scanSecrets('/nonexistent/path/zhi-xyz');
    expect(r.leaked).toBe(true);
    expect(r.findings[0]).toContain('scan error');
  });
});
