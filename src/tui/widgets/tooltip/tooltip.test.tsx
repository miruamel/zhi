/**
 * @fileoverview Tooltip tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Tooltip } from './tooltip';
import { renderToString } from '../../core/test/render';

describe('Tooltip', () => {
  it('renders text when visible', () => {
    const out = renderToString(Tooltip({ text: 'hint', visible: true }));
    expect(out).toContain('hint');
  });

  it('renders nothing when hidden', () => {
    const out = renderToString(Tooltip({ text: 'hidden', visible: false }));
    expect(out).not.toContain('hidden');
  });
});
