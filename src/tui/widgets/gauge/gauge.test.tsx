/**
 * @fileoverview Gauge tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Gauge } from './gauge';
import { renderToString } from '../../core/test/render';

describe('Gauge', () => {
  it('renders 0% when value is 0', () => {
    const out = renderToString(Gauge({ value: 0 }));
    expect(out).toContain('0%');
  });

  it('renders 100% when value equals max', () => {
    const out = renderToString(Gauge({ value: 100, max: 100 }));
    expect(out).toContain('100%');
  });

  it('renders 50% at midpoint', () => {
    const out = renderToString(Gauge({ value: 50, max: 100, width: 10 }));
    expect(out).toContain('50%');
  });

  it('clamps value above max', () => {
    const out = renderToString(Gauge({ value: 200, max: 100 }));
    expect(out).toContain('100%');
  });
});