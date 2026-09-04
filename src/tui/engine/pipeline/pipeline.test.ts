/**
 * @brief Tests for the pipeline state machine.
 */

import { describe, expect, test } from 'bun:test';
import {
  LOOP_TRANSITIONS,
  isTerminal,
  nextLoopState,
  stateColor,
  stateLabel,
  validateTransition,
  type LoopState,
} from './pipeline';

const ALL_STATES: LoopState[] = [
  'INTAKE',
  'PLAN',
  'ISOLATE',
  'EXECUTE',
  'CRITIQUE',
  'EVALUATE',
  'COMMIT',
  'PR_OPEN',
  'CI_WATCH',
  'DONE',
];

describe('validateTransition', () => {
  test('passes for the canonical forward edge of each non-terminal state', () => {
    const expected: Array<[LoopState, LoopState]> = [
      ['INTAKE', 'PLAN'],
      ['PLAN', 'ISOLATE'],
      ['ISOLATE', 'EXECUTE'],
      ['EXECUTE', 'CRITIQUE'],
      ['CRITIQUE', 'EVALUATE'],
      ['EVALUATE', 'COMMIT'],
      ['COMMIT', 'PR_OPEN'],
      ['PR_OPEN', 'CI_WATCH'],
    ];
    for (const [from, to] of expected) {
      expect(validateTransition(from, to)).toBe(true);
    }
  });

  test('passes for branch edges used by nextLoopState', () => {
    expect(validateTransition('EVALUATE', 'EXECUTE')).toBe(true);
    expect(validateTransition('PR_OPEN', 'DONE')).toBe(true);
    expect(validateTransition('CI_WATCH', 'DONE')).toBe(true);
    expect(validateTransition('CI_WATCH', 'EXECUTE')).toBe(true);
  });

  test('fails for self-loops on non-DONE states', () => {
    for (const s of ALL_STATES) {
      if (s === 'DONE') continue;
      expect(validateTransition(s, s)).toBe(false);
    }
  });

  test('fails for skipping ahead', () => {
    expect(validateTransition('INTAKE', 'EXECUTE')).toBe(false);
    expect(validateTransition('PLAN', 'CRITIQUE')).toBe(false);
    expect(validateTransition('EXECUTE', 'EVALUATE')).toBe(false);
  });

  test('fails for reversing backwards', () => {
    expect(validateTransition('PLAN', 'INTAKE')).toBe(false);
    expect(validateTransition('COMMIT', 'EXECUTE')).toBe(false);
    expect(validateTransition('DONE', 'CI_WATCH')).toBe(false);
  });

  test('DONE has no outgoing transitions', () => {
    for (const to of ALL_STATES) {
      expect(validateTransition('DONE', to)).toBe(false);
    }
  });

  test('LOOP_TRANSITIONS lists every state as a key', () => {
    for (const s of ALL_STATES) {
      expect(Array.isArray(LOOP_TRANSITIONS[s])).toBe(true);
    }
  });
});

describe('nextLoopState', () => {
  test('walks INTAKE → PLAN forward', () => {
    expect(nextLoopState('INTAKE', { gatePass: true, hasPr: true, ciStatus: 'success' })).toBe('PLAN');
  });

  test('PLAN advances to ISOLATE', () => {
    expect(nextLoopState('PLAN', { gatePass: false, hasPr: false, ciStatus: 'pending' })).toBe('ISOLATE');
  });

  test('EVALUATE goes to COMMIT on gatePass=true', () => {
    expect(nextLoopState('EVALUATE', { gatePass: true, hasPr: true, ciStatus: 'success' })).toBe('COMMIT');
  });

  test('EVALUATE loops back to EXECUTE on gatePass=false', () => {
    expect(nextLoopState('EVALUATE', { gatePass: false, hasPr: true, ciStatus: 'success' })).toBe('EXECUTE');
  });

  test('COMMIT → PR_OPEN', () => {
    expect(nextLoopState('COMMIT', { gatePass: true, hasPr: false, ciStatus: 'pending' })).toBe('PR_OPEN');
  });

  test('PR_OPEN advances to CI_WATCH when hasPr=true', () => {
    expect(nextLoopState('PR_OPEN', { gatePass: true, hasPr: true, ciStatus: 'pending' })).toBe('CI_WATCH');
  });

  test('PR_OPEN skips to DONE when hasPr=false', () => {
    expect(nextLoopState('PR_OPEN', { gatePass: true, hasPr: false, ciStatus: 'pending' })).toBe('DONE');
  });

  test('CI_WATCH → DONE on ciStatus="success"', () => {
    expect(nextLoopState('CI_WATCH', { gatePass: true, hasPr: true, ciStatus: 'success' })).toBe('DONE');
  });

  test('CI_WATCH → EXECUTE on ciStatus="failure"', () => {
    expect(nextLoopState('CI_WATCH', { gatePass: true, hasPr: true, ciStatus: 'failure' })).toBe('EXECUTE');
  });

  test('CI_WATCH → EXECUTE on ciStatus="pending"', () => {
    expect(nextLoopState('CI_WATCH', { gatePass: true, hasPr: true, ciStatus: 'pending' })).toBe('EXECUTE');
  });

  test('DONE stays DONE regardless of condition', () => {
    expect(nextLoopState('DONE', { gatePass: true, hasPr: true, ciStatus: 'success' })).toBe('DONE');
    expect(nextLoopState('DONE', { gatePass: false, hasPr: false, ciStatus: 'failure' })).toBe('DONE');
  });
});

describe('isTerminal', () => {
  test('returns true only for DONE', () => {
    for (const s of ALL_STATES) {
      expect(isTerminal(s)).toBe(s === 'DONE');
    }
  });
});

describe('stateLabel', () => {
  test('returns human-readable labels for every state', () => {
    expect(stateLabel('INTAKE')).toBe('Intake');
    expect(stateLabel('PLAN')).toBe('Plan');
    expect(stateLabel('ISOLATE')).toBe('Isolate');
    expect(stateLabel('EXECUTE')).toBe('Execute');
    expect(stateLabel('CRITIQUE')).toBe('Critique');
    expect(stateLabel('EVALUATE')).toBe('Evaluate');
    expect(stateLabel('COMMIT')).toBe('Commit');
    expect(stateLabel('PR_OPEN')).toBe('PR Open');
    expect(stateLabel('CI_WATCH')).toBe('CI Watch');
    expect(stateLabel('DONE')).toBe('Done');
  });

  test('covers every LoopState key', () => {
    for (const s of ALL_STATES) {
      expect(stateLabel(s).length).toBeGreaterThan(0);
    }
  });
});

describe('stateColor', () => {
  test('returns a non-empty token for every state', () => {
    for (const s of ALL_STATES) {
      expect(stateColor(s).length).toBeGreaterThan(0);
    }
  });

  test('DONE renders in a success color', () => {
    expect(stateColor('DONE')).toBe('greenBright');
  });
});