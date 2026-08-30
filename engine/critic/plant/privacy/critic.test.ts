/** @brief Test privacy critic (secret detection). @since 0.2.0 */
import { test, expect } from 'bun:test';
import { privacyCritic } from './critic';

test('clean files score 1', () => {
  const c = privacyCritic([{ path: 'a.ts', content: 'export const x = 1;\n' }]);
  expect(c.score).toBe(1);
  expect(c.findings).toHaveLength(0);
  expect(c.weight).toBe(1.5);
});

test('detects private key block', () => {
  const c = privacyCritic([{ path: 'k.pem', content: '-----BEGIN RSA PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n' }]);
  expect(c.findings.some((f) => f.includes('private-key-block'))).toBe(true);
  expect(c.score).toBeLessThan(1);
});

test('detects aws key id', () => {
  const c = privacyCritic([{ path: 'a.ts', content: 'const k = "AKIAIOSFODNN7EXAMPLE";\n' }]);
  expect(c.findings.some((f) => f.includes('aws-access-key-id'))).toBe(true);
});

test('detects jwt', () => {
  const c = privacyCritic([{ path: 'a.ts', content: 'const t = "eyJhbGc.eyJzdWIi.SflKxw";\n' }]);
  expect(c.findings.some((f) => f.includes('jwt-token'))).toBe(true);
});

test('detects db url with credentials', () => {
  const c = privacyCritic([{ path: 'a.ts', content: 'const u = "postgres://user:pass@localhost:5432/db";\n' }]);
  expect(c.findings.some((f) => f.includes('db-url-with-credentials'))).toBe(true);
});

test('detects hardcoded credential assignment', () => {
  const c = privacyCritic([{ path: 'a.ts', content: 'const password = "supersecret123";\n' }]);
  expect(c.findings.some((f) => f.includes('hardcoded-credential'))).toBe(true);
});

test('ignores url-path values (no false positive)', () => {
  const c = privacyCritic([{ path: 'a.ts', content: 'const token = "/api/v1/session/abc";\n' }]);
  expect(c.findings).toHaveLength(0);
});

test('penalty 0.5 per finding, floor 0', () => {
  const c = privacyCritic([
    { path: 'a.ts', content: 'const password = "supersecret123";\n' },
    { path: 'b.ts', content: 'const k = "AKIAIOSFODNN7EXAMPLE";\n' },
  ]);
  expect(c.findings).toHaveLength(2);
  expect(c.score).toBe(0);
});
