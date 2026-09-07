import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { Eval } from './eval';
import type { EvalReport } from '../../../core/state';

describe('Eval', () => {
  const passingReport: EvalReport = {
    build: { name: 'build', ok: true, detail: 'passed', durationMs: 100 },
    test: { name: 'test', ok: true, detail: '255 passed', durationMs: 500 },
    security: { name: 'security', ok: true, detail: 'clean', durationMs: 50 },
    gate: { name: 'gate', ok: true, detail: 'green', durationMs: 25 },
    gatePass: true,
    weightedAvg: 0.95,
  };

  it('shows EVAL header', () => {
    const out = renderToString(Eval({ evalReport: passingReport }) as any);
    expect(out).toContain('EVAL');
  });

  it('shows all stage names', () => {
    const out = renderToString(Eval({ evalReport: passingReport }) as any);
    expect(out).toContain('build');
    expect(out).toContain('test');
    expect(out).toContain('security');
    expect(out).toContain('gate');
  });

  it('shows PASS when all stages ok', () => {
    const out = renderToString(Eval({ evalReport: passingReport }) as any);
    expect(out).toContain('PASS');
  });

  it('shows FAIL when gate fails', () => {
    const failingReport: EvalReport = {
      ...passingReport,
      test: { name: 'test', ok: false, detail: '3 failed', durationMs: 500 },
      gate: { name: 'gate', ok: false, detail: 'lint failed', durationMs: 25 },
      gatePass: false,
      weightedAvg: 0.5,
    };
    const out = renderToString(Eval({ evalReport: failingReport }) as any);
    expect(out).toContain('FAIL');
  });

  it('shows coverage percentage', () => {
    const out = renderToString(Eval({ evalReport: passingReport }) as any);
    expect(out).toContain('95%');
  });

  it('shows stage durations', () => {
    const out = renderToString(Eval({ evalReport: passingReport }) as any);
    expect(out).toContain('500ms');
  });
});
