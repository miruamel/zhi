import { describe, it, expect } from 'bun:test';
import { emptyState, type AppState } from '../core/state';

describe('tui state', () => {
  it('creates empty state with goal and budget', () => {
    const state = emptyState('build feature', 10000);
    expect(state.goal).toBe('build feature');
    expect(state.tokensBudget).toBe(10000);
    expect(state.tokensUsed).toBe(0);
  });

  it('initializes with empty arrays', () => {
    const state = emptyState('test', 1000);
    expect(state.steps).toEqual([]);
    expect(state.critics).toEqual([]);
    expect(state.log).toEqual([]);
  });

  it('sets initial loop to INTAKE', () => {
    const state = emptyState('test', 1000);
    expect(state.loop).toBe('INTAKE');
  });

  it('sets startedAt to recent timestamp', () => {
    const before = Date.now();
    const state = emptyState('test', 1000);
    const after = Date.now();
    expect(state.startedAt).toBeGreaterThanOrEqual(before);
    expect(state.startedAt).toBeLessThanOrEqual(after);
  });

  it('initializes eval with all stages failing', () => {
    const state = emptyState('test', 1000);
    expect(state.eval.build.ok).toBe(false);
    expect(state.eval.test.ok).toBe(false);
    expect(state.eval.security.ok).toBe(false);
    expect(state.eval.gate.ok).toBe(false);
    expect(state.eval.gatePass).toBe(false);
    expect(state.eval.weightedAvg).toBe(0);
  });

  it('initializes metrics to zero', () => {
    const state = emptyState('test', 1000);
    expect(state.metrics.stages).toBe(0);
    expect(state.metrics.errors).toBe(0);
    expect(state.metrics.totalMs).toBe(0);
    expect(state.metrics.recoverAttempts).toBe(0);
  });

  it('sets finished and aborted to false', () => {
    const state = emptyState('test', 1000);
    expect(state.finished).toBe(false);
    expect(state.aborted).toBe(false);
  });

  it('initializes prCi with unknown status', () => {
    const state = emptyState('test', 1000);
    expect(state.prCi.ciStatus).toBe('unknown');
  });

  it('has all required AppState fields as keys', () => {
    const state = emptyState('test', 1000);
    const requiredKeys: (keyof AppState)[] = [
      'loop',
      'goal',
      'steps',
      'critics',
      'eval',
      'prCi',
      'log',
      'metrics',
      'tokensUsed',
      'tokensBudget',
      'startedAt',
      'finished',
      'aborted',
    ];
    for (const k of requiredKeys) {
      expect(k in state).toBe(true);
    }
  });

  it('handles zero token budget', () => {
    const state = emptyState('test', 0);
    expect(state.tokensBudget).toBe(0);
  });

  it('handles empty goal string', () => {
    const state = emptyState('', 1000);
    expect(state.goal).toBe('');
  });
});
