import { describe, it, expect } from 'bun:test';
import type { Critique } from '../../../engine/critic/aggregate';
import type { EvalOutput } from '../../../engine/eval/gate';
import { LoopState } from '../../../engine/loop/states';
import { LoopMetrics } from '../../../engine/loop/observability/metrics';
import type { LoopContext } from '../../../engine/loop/wiring/context';
import { toPatch } from './loop';
import type { AppState, LogEntry, TimelineEntry } from '../../tui/core/state';
/** @brief Cast Partial<AppState> to full for assertions — toPatch returns partial patches. */
const full = (p: Partial<AppState>): AppState => p as AppState;
const ctx = (over: Partial<LoopContext> = {}): LoopContext => ({
  goal: 'build api',
  critiques: [{ name: 'security', score: 0.92, weight: 1.5, findings: ['ok'] }] as Critique[],
  aggregate: { score: 0.92, passed: true, byCritic: { security: 0.92 }, findings: ['ok'] },
  eval: { passed: true, reasons: ['coverage 0.84'] } as EvalOutput,
  ...over,
});

const entries: LogEntry[] = [
  { ts: 1, runId: 'r1', kind: 'transition', msg: 'INTAKE --PLAN--> PLAN' },
  { ts: 2, runId: 'r1', kind: 'transition', msg: 'PLAN --EXECUTE--> EXECUTE' },
];

describe('toPatch', () => {
  it('passes through real metrics and log entries', () => {
    const m = new LoopMetrics();
    m.record({ stage: 'PLAN', ms: 120, ok: true });
    m.record({ stage: 'EXECUTE', ms: 450, ok: true });
    m.recoverAttempts = 1;
    const p = full(toPatch(ctx(), m, LoopState.EXECUTE, false, entries, 570, 0));
    expect(p.log).toHaveLength(2);
    expect(p.log[0].msg).toContain('INTAKE');
    expect(p.metrics.stages).toBe(2);
    expect(p.metrics.totalMs).toBe(570);
    expect(p.metrics.errors).toBe(0);
    expect(p.metrics.recoverAttempts).toBe(1);
    expect(p.critics[0].name).toBe('security');
    expect(p.eval.gatePass).toBe(true);
    expect(p.eval.weightedAvg).toBe(0.92);
  });

  it('defaults to empty log and zero metrics when no args', () => {
    const m = new LoopMetrics();
    const p = full(toPatch(ctx(), m, LoopState.PLAN, false));
    expect(p.log).toHaveLength(0);
    expect(p.metrics.stages).toBe(0);
    expect(p.metrics.totalMs).toBe(0);
    expect(p.finished).toBe(false);
  });

  it('marks finished when DONE and carries prUrl', () => {
    const m = new LoopMetrics();
    const p = full(
      toPatch(ctx({ prUrl: 'https://github.com/miruamel/zhi/pull/42' }), m, LoopState.DONE, false),
    );
    expect(p.finished).toBe(true);
    expect(p.prCi.prUrl).toContain('pull/42');
    expect(p.prCi.ciStatus).toBe('green');
  });

  it('marks pending CI when in CI_WATCH', () => {
    const m = new LoopMetrics();
    const p = full(toPatch(ctx(), m, LoopState.CI_WATCH, false));
    expect(p.prCi.ciStatus).toBe('pending');
  });

  it('propagates errors and abort flag', () => {
    const m = new LoopMetrics();
    m.record({ stage: 'EXECUTE', ms: 10, ok: false, error: 'boom' });
    const p = full(toPatch(ctx({ error: 'boom' }), m, LoopState.RECOVER, true, entries, 10, 1));
    expect(p.aborted).toBe(true);
    expect(p.metrics.errors).toBe(1);
    expect(p.log).toHaveLength(2);
  });
});

const timeline: TimelineEntry[] = [
  { ts: 100, stage: 'PLAN', event: 'start' },
  { ts: 200, stage: 'PLAN', event: 'finish', ms: 100 },
  { ts: 300, stage: 'EXECUTE', event: 'error', msg: 'boom' },
];

describe('toPatch timeline', () => {
  it('passes through timeline entries', () => {
    const m = new LoopMetrics();
    const p = full(toPatch(ctx(), m, LoopState.PLAN, false, entries, 0, 0, timeline));
    expect(p.timeline).toHaveLength(3);
    expect(p.timeline[0].stage).toBe('PLAN');
    expect(p.timeline[0].event).toBe('start');
    expect(p.timeline[2].event).toBe('error');
    expect(p.timeline[2].msg).toBe('boom');
  });

  it('defaults to empty timeline', () => {
    const m = new LoopMetrics();
    const p = full(toPatch(ctx(), m, LoopState.PLAN, false));
    expect(p.timeline).toHaveLength(0);
  });
});
