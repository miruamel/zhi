/**
 * @brief Unit: classifyError() — fatal vs transient classification. @since 0.1.2 @updated 0.2.6
 */
import { describe, expect, it } from 'bun:test';
import { classifyError } from '../index';

describe('classifyError', () => {
  it('classifies budget/timeout/fatal/quota as fatal', () => {
    expect(classifyError('budget exceeded')).toEqual({ fatal: true });
    expect(classifyError('TIMEOUT after 30s')).toEqual({ fatal: true });
    expect(classifyError('FATAL: disk full')).toEqual({ fatal: true });
    expect(classifyError('quota exceeded for api')).toEqual({ fatal: true });
  });

  it('classifies cycle/ambig/parse as transient (non-fatal)', () => {
    expect(classifyError('cycle detected in dag')).toEqual({ fatal: false });
    expect(classifyError('ambiguous goal: build thing')).toEqual({ fatal: false });
    expect(classifyError('parse error in goal')).toEqual({ fatal: false });
  });

  it('defaults to transient for unknown errors', () => {
    expect(classifyError('some random failure')).toEqual({ fatal: false });
  });

  it('handles null/undefined as transient', () => {
    expect(classifyError(null)).toEqual({ fatal: false });
    expect(classifyError(undefined)).toEqual({ fatal: false });
  });

  it('handles empty string as transient', () => {
    expect(classifyError('')).toEqual({ fatal: false });
  });

  it('is case-insensitive', () => {
    expect(classifyError('Budget')).toEqual({ fatal: true });
    expect(classifyError('CYCLE')).toEqual({ fatal: false });
  });
});
