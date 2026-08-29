import { describe, it, expect } from 'bun:test';
import { nextAction } from './conductor';
import { LoopState } from '../loop/states';

describe('orch conductor', () => {
  it('generates during intake/plan/isolate/execute/recover', () => {
    expect(nextAction(LoopState.INTAKE)).toBe('generate');
    expect(nextAction(LoopState.PLAN)).toBe('generate');
    expect(nextAction(LoopState.ISOLATE)).toBe('generate');
    expect(nextAction(LoopState.EXECUTE)).toBe('generate');
    expect(nextAction(LoopState.RECOVER)).toBe('generate');
  });

  it('critiques after execute', () => {
    expect(nextAction(LoopState.CRITIQUE)).toBe('critique');
  });

  it('evaluates after critique', () => {
    expect(nextAction(LoopState.EVALUATE)).toBe('eval');
  });

  it('done at commit/pr_open/ci_watch/done', () => {
    expect(nextAction(LoopState.COMMIT)).toBe('done');
    expect(nextAction(LoopState.PR_OPEN)).toBe('done');
    expect(nextAction(LoopState.CI_WATCH)).toBe('done');
    expect(nextAction(LoopState.DONE)).toBe('done');
  });
});
