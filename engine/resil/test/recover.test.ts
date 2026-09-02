/**
 * @brief Unit: classifyError — error → recovery strategy. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import { classifyError } from '../recover';

describe('classifyError', () => {
  it('fatal for budget/timeout', () => {
    expect(classifyError('budget exceeded').strategy).toBe('abort');
    expect(classifyError('budget exceeded').fatal).toBe(true);
  });

  it('replan for cycle/parse', () => {
    expect(classifyError('dag cycle detected').strategy).toBe('replan');
  });

  it('patch default', () => {
    expect(classifyError('syntax error').strategy).toBe('patch');
  });

  it('fatal for timeout/quota', () => {
    expect(classifyError('timeout exceeded').fatal).toBe(true);
    expect(classifyError('quota exceeded').strategy).toBe('abort');
  });

  it('replan for ambig/parse', () => {
    expect(classifyError('ambig detected').strategy).toBe('replan');
    expect(classifyError('parse detected').fatal).toBe(false);
  });

  it('handles null/undefined without crash', () => {
    expect(classifyError(undefined).strategy).toBe('patch');
    expect(classifyError(null).fatal).toBe(false);
  });
});
