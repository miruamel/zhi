/**
 * @fileoverview Chart tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Chart } from './chart';
import { renderToString } from '../../core/test/render';

describe('Chart', () => {
  it('renders empty state for no data', () => {
    const out = renderToString(Chart({ data: [] }));
    expect(out).toContain('—');
  });

  it('renders bar chart rows', () => {
    const out = renderToString(
      Chart({
        data: [
          { label: 'A', value: 5 },
          { label: 'B', value: 10 },
        ],
      }),
    );
    expect(out).toContain('A');
    expect(out).toContain('B');
    expect(out).toContain('█');
  });

  it('renders line chart with block chars', () => {
    const out = renderToString(Chart({ data: [{ label: 'x', value: 3 }], type: 'line' }));
    expect(out).toMatch(/[▁▂▃▄▅▆▇█]/);
  });

  it('renders with custom color', () => {
    const out = renderToString(Chart({ data: [{ label: 'c', value: 1 }], color: 'red' }));
    expect(out).toContain('c');
  });
});
