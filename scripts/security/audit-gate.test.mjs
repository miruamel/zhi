/**
 * @fileoverview Tests for fail-closed npm audit report handling.
 * @since 0.1.13
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'bun:test';

const script = join(dirname(fileURLToPath(import.meta.url)), 'audit-gate.mjs');

function runGate(status, report) {
  const dir = mkdtempSync(join(tmpdir(), 'zhi-audit-gate-'));
  const reportPath = join(dir, 'audit.json');
  writeFileSync(reportPath, report);

  try {
    const output = execFileSync(process.execPath, [script, reportPath, String(status)], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, output };
  } catch (error) {
    return {
      status: error.status,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const validReport = (counts = {}) =>
  JSON.stringify({
    vulnerabilities: {},
    metadata: {
      vulnerabilities: {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        ...counts,
      },
    },
  });

test('passes a valid clean audit report', () => {
  const result = runGate(0, validReport());
  expect(result.status).toBe(0);
  expect(result.output).toContain('critical: 0');
  expect(result.output).toContain('high: 0');
});

test('fails when high vulnerabilities are present', () => {
  expect(runGate(0, validReport({ high: 1 })).status).toBe(1);
});

test('fails when critical vulnerabilities are present', () => {
  expect(runGate(0, validReport({ critical: 1 })).status).toBe(1);
});

test('allows moderate and low findings at the high threshold', () => {
  expect(runGate(0, validReport({ moderate: 2, low: 3 })).status).toBe(0);
});

test('preserves a nonzero npm audit status for a valid report', () => {
  expect(runGate(2, validReport()).status).toBe(2);
});

test('fails when the audit report is missing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'zhi-audit-gate-'));
  try {
    const result = execFileSync(process.execPath, [script, join(dir, 'missing.json'), '0'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    expect(result).toBeUndefined();
  } catch (error) {
    expect(error.status).toBe(1);
    expect(error.stderr).toContain('missing or empty');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('fails when the audit report is malformed', () => {
  expect(runGate(0, '{not-json').status).toBe(1);
});

test('fails when the metadata vulnerability summary is missing', () => {
  expect(runGate(0, JSON.stringify({ vulnerabilities: {} })).status).toBe(1);
});

test('fails when a vulnerability count is malformed', () => {
  expect(runGate(0, validReport({ high: 'one' })).status).toBe(1);
});

test('fails when a vulnerability count is fractional', () => {
  expect(runGate(0, validReport({ high: 1.5 })).status).toBe(1);
});

test('fails when the vulnerability report is an array', () => {
  expect(runGate(0, JSON.stringify({ vulnerabilities: [], metadata: { vulnerabilities: {} } })).status).toBe(1);
});

test('fails when the metadata vulnerability summary is an array', () => {
  expect(runGate(0, JSON.stringify({ vulnerabilities: {}, metadata: { vulnerabilities: [] } })).status).toBe(1);
});

test('fails when the audit report is empty', () => {
  const dir = mkdtempSync(join(tmpdir(), 'zhi-audit-gate-'));
  const reportPath = join(dir, 'audit.json');
  writeFileSync(reportPath, '');
  try {
    execFileSync(process.execPath, [script, reportPath, '0'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    expect(error.status).toBe(1);
    expect(error.stderr).toContain('missing or empty');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('fails when the vulnerability report is missing', () => {
  expect(runGate(0, JSON.stringify({ metadata: { vulnerabilities: {} } })).status).toBe(1);
});
