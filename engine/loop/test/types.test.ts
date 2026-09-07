/**
 * @fileoverview Loop types tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { type LoopPhase } from '../types';

describe('loop types', () => {
  it('exports valid phases', () => {
    const phases: LoopPhase[] = [
      'init',
      'running',
      'paused',
      'resuming',
      'finishing',
      'aborted',
      'finished',
    ];
    expect(phases.length).toBe(7);
  });
});
