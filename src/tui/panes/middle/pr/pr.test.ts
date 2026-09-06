import { describe, it, expect } from 'bun:test';
import { renderToString } from "../../../core/test/render";
import { Pr } from './pr';
import type { PrCiState } from '../../../core/state';

describe('Pr', () => {
  it('shows no-PR message when not opened', () => {
    const prCi: PrCiState = { ciStatus: 'unknown' };
    const out = renderToString(Pr({ prCi }) as any);
    expect(out).toContain('not opened yet');
  });

  it('shows PR link when available', () => {
    const prCi: PrCiState = {
      prUrl: 'https://github.com/miruamel/zhi/pull/1',
      prNumber: 1,
      ciStatus: 'green',
    };
    const out = renderToString(Pr({ prCi }) as any);
    expect(out).toContain('https://github.com/miruamel/zhi/pull/1');
  });

  it('shows CI status green', () => {
    const prCi: PrCiState = { ciStatus: 'green' };
    const out = renderToString(Pr({ prCi }) as any);
    expect(out).toContain('CI green');
  });

  it('shows CI status red', () => {
    const prCi: PrCiState = { ciStatus: 'red' };
    const out = renderToString(Pr({ prCi }) as any);
    expect(out).toContain('CI red');
  });

  it('shows CI pending', () => {
    const prCi: PrCiState = { ciStatus: 'pending' };
    const out = renderToString(Pr({ prCi }) as any);
    expect(out).toContain('CI running');
  });

  it('shows CI duration when available', () => {
    const prCi: PrCiState = { ciStatus: 'green', ciDurationMs: 5000 };
    const out = renderToString(Pr({ prCi }) as any);
    expect(out).toContain('5.0s');
  });
});
