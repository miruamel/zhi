import { describe, it, expect } from 'bun:test';
import { LoopState, LoopEvent, transition, gatePass } from '../states';

describe('loop state machine', () => {
  it('happy path INTAKE -> DONE', () => {
    let s = LoopState.INTAKE;
    s = transition(s, LoopEvent.GOAL_READY)!;
    expect(s).toBe(LoopState.PLAN);
    s = transition(s, LoopEvent.PLAN_OK)!;
    expect(s).toBe(LoopState.ISOLATE);
    s = transition(s, LoopEvent.ISOLATED)!;
    expect(s).toBe(LoopState.EXECUTE);
    s = transition(s, LoopEvent.EXECUTED)!;
    expect(s).toBe(LoopState.CRITIQUE);
    s = transition(s, LoopEvent.CRITIQUED)!;
    expect(s).toBe(LoopState.EVALUATE);
    s = transition(s, LoopEvent.GATE_PASS)!;
    expect(s).toBe(LoopState.COMMIT);
    s = transition(s, LoopEvent.COMMITTED)!;
    expect(s).toBe(LoopState.PR_OPEN);
    s = transition(s, LoopEvent.PR_OPENED)!;
    expect(s).toBe(LoopState.CI_WATCH);
    s = transition(s, LoopEvent.CI_GREEN)!;
    expect(s).toBe(LoopState.DONE);
  });

  it('illegal transition returns null', () => {
    expect(transition(LoopState.DONE, LoopEvent.GOAL_READY)).toBeNull();
    expect(transition(LoopState.INTAKE, LoopEvent.COMMITTED)).toBeNull();
    expect(transition(LoopState.PLAN, LoopEvent.CI_RED)).toBeNull();
  });

  it('CI red routes to RECOVER (bounded, not blind EXECUTE)', () => {
    expect(transition(LoopState.CI_WATCH, LoopEvent.CI_RED)).toBe(LoopState.RECOVER);
  });

  it('budget out from PLAN/EXECUTE/RECOVER routes to RECOVER/DONE', () => {
    expect(transition(LoopState.PLAN, LoopEvent.BUDGET_OUT)).toBe(LoopState.RECOVER);
    expect(transition(LoopState.EXECUTE, LoopEvent.BUDGET_OUT)).toBe(LoopState.RECOVER);
    expect(transition(LoopState.RECOVER, LoopEvent.BUDGET_OUT)).toBe(LoopState.DONE);
  });

  it('gatePass requires EVALUATE + scores', () => {
    const ok = { paretoScore: 0.9, paretoThreshold: 0.8, qualityGateGreen: true };
    const lowPareto = { paretoScore: 0.7, paretoThreshold: 0.8, qualityGateGreen: true };
    const redGate = { paretoScore: 0.9, paretoThreshold: 0.8, qualityGateGreen: false };
    expect(gatePass(LoopState.EXECUTE, ok)).toBe(false);
    expect(gatePass(LoopState.EVALUATE, ok)).toBe(true);
    expect(gatePass(LoopState.EVALUATE, lowPareto)).toBe(false);
    expect(gatePass(LoopState.EVALUATE, redGate)).toBe(false);
  });
});
