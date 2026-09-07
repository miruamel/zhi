/**
 * @fileoverview Security scanner tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { scanSecurity } from '../eval';

describe('scanSecurity', () => {
  it('detects API keys', () => {
    const r = scanSecurity([
      { path: 'a.ts', content: 'const apiKey = "sk-abcdefghijklmnopqrstuvwxyz";' },
    ]);
    expect(r.findings.length).toBeGreaterThan(0);
  });

  it('returns clean report for safe code', () => {
    const r = scanSecurity([{ path: 'a.ts', content: 'const x = 1;' }]);
    expect(r.findings.length).toBe(0);
    expect(r.score).toBe(100);
  });

  it('detects private keys', () => {
    const r = scanSecurity([
      {
        path: 'a.ts',
        content: '-----BEGIN RSA PRIVATE KEY-----\nkey\n-----END RSA PRIVATE KEY-----',
      },
    ]);
    expect(r.findings.some((f) => f.rule === 'private-key')).toBe(true);
  });
});
