/** @brief Test emptyState: factory for default AppState. @since 0.1.0 */
import { describe, test, expect } from 'bun:test';
import { emptyState } from '../state';

describe('emptyState', () => {
  test('returns AppState with given goal', () => {
    const s = emptyState('ship v1', 1000);
    expect(s.goal).toBe('ship v1');
  });

  test('returns AppState with given tokensBudget', () => {
    const s = emptyState('ship v1', 500);
    expect(s.tokensBudget).toBe(500);
  });

  test('starts at INTAKE state', () => {
    const s = emptyState('x', 0);
    expect(s.loop).toBe('INTAKE');
  });

  test('initialises empty arrays', () => {
    const s = emptyState('x', 0);
    expect(s.steps).toEqual([]);
    expect(s.critics).toEqual([]);
    expect(s.log).toEqual([]);
  });

  test('initialises eval with all stages false', () => {
    const s = emptyState('x', 0);
    expect(s.eval.build.ok).toBe(false);
    expect(s.eval.test.ok).toBe(false);
    expect(s.eval.security.ok).toBe(false);
    expect(s.eval.gate.ok).toBe(false);
    expect(s.eval.gatePass).toBe(false);
    expect(s.eval.weightedAvg).toBe(0);
  });

  test('initialises metrics with zeros', () => {
    const s = emptyState('x', 0);
    expect(s.metrics.stages).toBe(0);
    expect(s.metrics.errors).toBe(0);
    expect(s.metrics.totalMs).toBe(0);
    expect(s.metrics.recoverAttempts).toBe(0);
  });

  test('initialises prCi with unknown status', () => {
    const s = emptyState('x', 0);
    expect(s.prCi.ciStatus).toBe('unknown');
  });

  test('starts not finished and not aborted', () => {
    const s = emptyState('x', 0);
    expect(s.finished).toBe(false);
    expect(s.aborted).toBe(false);
  });

  test('sets startedAt to a recent timestamp', () => {
    const before = Date.now();
    const s = emptyState('x', 0);
    const after = Date.now();
    expect(s.startedAt).toBeGreaterThanOrEqual(before);
    expect(s.startedAt).toBeLessThanOrEqual(after);
  });

  test('tokensUsed starts at 0', () => {
    const s = emptyState('x', 0);
    expect(s.tokensUsed).toBe(0);
  });
});
