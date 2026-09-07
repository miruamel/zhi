/**
 * @fileoverview Gate runner tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { runGate } from '../gate';

describe('runGate', () => {
  it('runs all checks', () => {
    const r = runGate({ checks: ['lint', 'typecheck', 'test'] });
    expect(r.checks.length).toBe(3);
    expect(r.pass).toBe(true);
  });

  it('detects empty checks', () => {
    const r = runGate({ checks: [] });
    expect(r.pass).toBe(false);
  });

  it('records duration', () => {
    const r = runGate({ checks: ['lint'] });
    expect(r.durationMs).toBeGreaterThanOrEqual(0);
  });
});
