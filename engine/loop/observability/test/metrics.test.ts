/** @brief Unit: LoopMetrics + timedStage. @since 0.1.1 */
import { describe, it, expect } from 'bun:test';
import { LoopMetrics, timedStage } from '../metrics';
import { LoopEvent, LoopState } from '../../states';
import type { StateHandler } from '../../wiring/handlers/types';

describe('LoopMetrics', () => {
  it('aggregates summary from records', () => {
    const m = new LoopMetrics();
    m.record({ stage: 'INTAKE', ms: 10, ok: true });
    m.record({ stage: 'PLAN', ms: 5, ok: false, error: 'boom' });
    const s = m.summary();
    expect(s.stages).toBe(2);
    expect(s.errors).toBe(1);
    expect(s.totalMs).toBe(15);
    expect(m.stages[0].stage).toBe('INTAKE');
  });
  it('reset clears records and recoverAttempts', () => {
    const m = new LoopMetrics();
    m.record({ stage: 'INTAKE', ms: 10, ok: true });
    m.record({ stage: 'PLAN', ms: 5, ok: false, error: 'boom' });
    m.recoverAttempts = 3;
    expect(m.stages).toHaveLength(2);
    expect(m.summary().recoverAttempts).toBe(3);
    m.reset();
    expect(m.stages).toHaveLength(0);
    expect(m.summary().stages).toBe(0);
    expect(m.summary().recoverAttempts).toBe(0);
  });
});

describe('timedStage', () => {
  it('records ok and returns the event', async () => {
    const m = new LoopMetrics();
    const h: StateHandler = () => LoopEvent.GOAL_READY;
    const wrapped = timedStage('INTAKE', h, m);
    const ev = await wrapped(LoopState.INTAKE);
    expect(ev).toBe(LoopEvent.GOAL_READY);
    expect(m.stages).toHaveLength(1);
    expect(m.stages[0].ok).toBe(true);
    expect(m.stages[0].ms).toBeGreaterThanOrEqual(0);
  });

  it('records error and rethrows', async () => {
    const m = new LoopMetrics();
    const h: StateHandler = () => {
      throw new Error('x');
    };
    const wrapped = timedStage('EXECUTE', h, m);
    await expect(wrapped(LoopState.EXECUTE)).rejects.toThrow('x');
    expect(m.stages).toHaveLength(1);
    expect(m.stages[0].ok).toBe(false);
    expect(m.stages[0].error).toContain('x');
  });
});
