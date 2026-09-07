/**
 * @fileoverview Security scanner tests. @since 0.1.9
 */
import { describe, it, expect } from 'bun:test';
import { scanSecurity } from '../eval';

describe('scanSecurity', () => {
  it('detects API keys', async () => {
    const r = await scanSecurity([
      { path: 'a.ts', content: 'const apiKey = "sk-abcdefghijklmnopqrstuvwxyz";' },
    ]);
    expect(r.findings.length).toBeGreaterThan(0);
  });
  it('returns clean report for safe code', async () => {
    const r = await scanSecurity([{ path: 'a.ts', content: 'const x = 1;' }]);
    expect(r.findings.length).toBe(0);
    expect(r.score).toBe(100);
  });
  it('detects private keys', async () => {
    const r = await scanSecurity([
      {
        path: 'a.ts',
        content: '-----BEGIN RSA PRIVATE KEY-----\nkey\n-----END RSA PRIVATE KEY-----',
      },
    ]);
    expect(r.findings.some((f: { rule: string }) => f.rule === 'private-key')).toBe(true);
  });
});
