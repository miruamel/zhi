/**
 * @fileoverview Progress tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Progress } from './progress';
import { renderToString } from '../../core/test/render';

describe('Progress', () => {
  it('renders 0% when value is 0', () => {
    const out = renderToString(Progress({ value: 0 }));
    expect(out).toContain('0%');
  });

  it('renders 100% when value equals max', () => {
    const out = renderToString(Progress({ value: 100 }));
    expect(out).toContain('100%');
  });

  it('renders label when provided', () => {
    const out = renderToString(Progress({ value: 50, label: 'Test' }));
    expect(out).toContain('Test');
  });
});