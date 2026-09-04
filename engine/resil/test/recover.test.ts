/**
 * @brief Unit: classifyError() — recovery strategy classification. @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import { classifyError } from '../recover';

describe('classifyError', () => {
  it('classifies budget/timeout/fatal/quota as abort+fatal', () => {
    expect(classifyError('budget exceeded')).toEqual({ strategy: 'abort', fatal: true });
    expect(classifyError('TIMEOUT after 30s')).toEqual({ strategy: 'abort', fatal: true });
    expect(classifyError('FATAL: disk full')).toEqual({ strategy: 'abort', fatal: true });
    expect(classifyError('quota exceeded for api')).toEqual({ strategy: 'abort', fatal: true });
  });

  it('classifies cycle/ambig/parse as replan', () => {
    expect(classifyError('cycle detected in dag')).toEqual({ strategy: 'replan', fatal: false });
    expect(classifyError('ambiguous goal: build thing')).toEqual({
      strategy: 'replan',
      fatal: false,
    });
    expect(classifyError('parse error in goal')).toEqual({ strategy: 'replan', fatal: false });
  });

  it('defaults to patch for unknown errors', () => {
    expect(classifyError('some random failure')).toEqual({ strategy: 'patch', fatal: false });
  });

  it('handles null/undefined as patch', () => {
    expect(classifyError(null)).toEqual({ strategy: 'patch', fatal: false });
    expect(classifyError(undefined)).toEqual({ strategy: 'patch', fatal: false });
  });

  it('handles empty string as patch', () => {
    expect(classifyError('')).toEqual({ strategy: 'patch', fatal: false });
  });

  it('is case-insensitive', () => {
    expect(classifyError('Budget')).toEqual({ strategy: 'abort', fatal: true });
    expect(classifyError('CYCLE')).toEqual({ strategy: 'replan', fatal: false });
  });
});
