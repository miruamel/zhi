/**
 * @brief Unit: toPatch — ctx+metrics+loop → AppState patch (pure, no TUI).
 * @since 0.1.4
 */
import { describe, expect, it } from 'bun:test';
import type { Critique } from '@engine/critic/aggregate';
import { LoopState } from '@engine/loop/states';
import { LoopMetrics } from '@engine/loop/observability/metrics';
import type { LoopContext } from '@engine/loop/wiring/context';
import { toPatch } from './loop';

/** @brief Buat LoopContext minimal dengan field yang diuji. */
function ctx(over: Partial<LoopContext> = {}): LoopContext {
  return { goal: 'build auth', ...over };
}

describe('toPatch', () => {
  it('maps critics: name, score, abstain=false, reason=first finding', () => {
    const critiques: Critique[] = [
      { name: 'security', score: 0.9, weight: 1, findings: ['no leak', 'ok'] },
      { name: 'style', score: 0.5, weight: 1, findings: [] },
    ];
    const r = toPatch(ctx({ critiques }), new LoopMetrics(), LoopState.PLAN, false);
    expect(r.critics).toHaveLength(2);
    expect(r.critics?.[0]).toMatchObject({
      name: 'security',
      score: 0.9,
      abstain: false,
      reason: 'no leak',
    });
    expect(r.critics?.[1]).toMatchObject({
      name: 'style',
      score: 0.5,
      abstain: false,
      reason: undefined,
    });
  });

  it('returns empty critics when ctx.critiques is undefined', () => {
    const r = toPatch(ctx(), new LoopMetrics(), LoopState.PLAN, false);
    expect(r.critics).toEqual([]);
  });

  it('passes loop state and finished flag', () => {
    expect(toPatch(ctx(), new LoopMetrics(), LoopState.DONE, false).loop).toBe('DONE');
    expect(toPatch(ctx(), new LoopMetrics(), LoopState.DONE, false).finished).toBe(true);
    expect(toPatch(ctx(), new LoopMetrics(), LoopState.PLAN, false).finished).toBe(false);
  });

  it('maps eval gate from ctx.eval.passed (truthy/falsy)', () => {
    const r1 = toPatch(
      ctx({ eval: { passed: true, score: 0.8, reasons: ['score 0.8 >= 0.7'] } }),
      new LoopMetrics(),
      LoopState.PLAN,
      false,
    );
    expect(r1.eval?.gate.ok).toBe(true);
    expect(r1.eval?.gatePass).toBe(true);
    expect(r1.eval?.gate.detail).toBe('score 0.8 >= 0.7');

    const r2 = toPatch(ctx(), new LoopMetrics(), LoopState.PLAN, false);
    expect(r2.eval?.gate.ok).toBe(false);
    expect(r2.eval?.gatePass).toBe(false);
    expect(r2.eval?.gate.detail).toBe('');
  });

  it('maps weightedAvg from ctx.aggregate.score (fallback 0)', () => {
    const r = toPatch(
      ctx({ aggregate: { score: 0.75, passed: true, byCritic: {}, findings: [] } }),
      new LoopMetrics(),
      LoopState.PLAN,
      false,
    );
    expect(r.eval?.weightedAvg).toBe(0.75);
    expect(toPatch(ctx(), new LoopMetrics(), LoopState.PLAN, false).eval?.weightedAvg).toBe(0);
  });

  it('maps prCi.ciStatus per loop state', () => {
    expect(
      toPatch(ctx({ prUrl: 'https://x' }), new LoopMetrics(), LoopState.CI_WATCH, false).prCi,
    ).toMatchObject({ prUrl: 'https://x', ciStatus: 'pending' });
    expect(
      toPatch(ctx({ prUrl: 'https://y' }), new LoopMetrics(), LoopState.DONE, false).prCi,
    ).toMatchObject({ prUrl: 'https://y', ciStatus: 'green' });
    expect(toPatch(ctx(), new LoopMetrics(), LoopState.PLAN, false).prCi).toMatchObject({
      prUrl: undefined,
      ciStatus: undefined,
    });
  });

  it('passes recoverAttempts from metrics and aborted flag', () => {
    const m = new LoopMetrics();
    m.recoverAttempts = 3;
    const r = toPatch(ctx(), m, LoopState.RECOVER, true);
    expect(r.metrics?.recoverAttempts).toBe(3);
    expect(r.aborted).toBe(true);
  });
});
