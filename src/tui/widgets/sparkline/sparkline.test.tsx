/**
 * @fileoverview Sparkline tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Sparkline } from './sparkline';
import { renderToString } from '../../core/test/render';

describe('Sparkline', () => {
  it('renders empty state for no data', () => {
    const out = renderToString(Sparkline({ data: [] }));
    expect(out).toContain('—');
  });

  it('renders bars for numeric data', () => {
    const out = renderToString(Sparkline({ data: [1, 5, 3, 8, 2] }));
    expect(out).toMatch(/[▁▂▃▄▅▆▇█]/);
  });

  it('shows labels when requested', () => {
    const out = renderToString(Sparkline({ data: [10, 20, 30], showLabels: true }));
    expect(out).toMatch(/\d+\/\d+/);
  });
});
