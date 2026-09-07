/**
 * @fileoverview Loop runner tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { createRunner, finishLoop } from '../runner';

describe('createRunner', () => {
  it('starts in init state', () => {
    const r = createRunner({ maxSteps: 5, budgetTokens: 100 });
    expect(r.status().phase).toBe('init');
  });

  it('transitions to running on start', () => {
    const r = createRunner({ maxSteps: 5, budgetTokens: 100 });
    r.start();
    expect(r.status().phase).toBe('running');
  });

  it('pauses and resumes', () => {
    const r = createRunner({ maxSteps: 5, budgetTokens: 100 });
    r.start();
    r.pause();
    expect(r.status().phase).toBe('paused');
    r.resume();
    expect(r.status().phase).toBe('running');
  });

  it('aborts', () => {
    const r = createRunner({ maxSteps: 5, budgetTokens: 100 });
    r.start();
    r.abort();
    expect(r.status().phase).toBe('aborted');
  });
});

describe('finishLoop', () => {
  it('returns finished when steps >= max', () => {
    const result = finishLoop(
      { phase: 'running', step: 5, startedAt: Date.now(), tokensUsed: 100 },
      { maxSteps: 5 },
    );
    expect(result.aborted).toBe(false);
  });
});
