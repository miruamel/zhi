/**
 * @brief Unit: planSymbol() — derive identifier dari plan. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import { planSymbol } from './plan-symbol';

describe('planSymbol', () => {
  it('takes first token before whitespace/arrow', () => {
    expect(planSymbol('build auth')).toBe('build');
    expect(planSymbol('feat:auth > handler')).toBe('featauth');
  });

  it('strips non-alphanumeric chars', () => {
    expect(planSymbol('feat/auth')).toBe('featauth');
    expect(planSymbol('feat-auth-v2')).toBe('featauthv2');
  });

  it('falls back to main when empty or invalid start', () => {
    expect(planSymbol('')).toBe('main');
    expect(planSymbol('123foo')).toBe('main');
    expect(planSymbol('###')).toBe('main');
    expect(planSymbol(' ')).toBe('main');
  });
});
