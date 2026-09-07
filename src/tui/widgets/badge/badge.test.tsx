/**
 * @fileoverview Badge tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Badge } from './badge';
import { renderToString } from '../../core/test/render';

describe('Badge', () => {
  it('renders label text', () => {
    const out = renderToString(Badge({ label: 'OK' }));
    expect(out).toContain('OK');
  });

  it('renders with custom color', () => {
    const out = renderToString(Badge({ label: 'WARN', color: 'yellow' }));
    expect(out).toContain('WARN');
  });
});
