/**
 * @fileoverview Notification tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Notification } from './notification';
import { renderToString } from '../../core/test/render';

describe('Notification', () => {
  it('renders info message', () => {
    const out = renderToString(Notification({ message: 'Hello' }));
    expect(out).toContain('Hello');
    expect(out).toContain('ℹ');
  });

  it('renders success with checkmark', () => {
    const out = renderToString(Notification({ message: 'Done', type: 'success' }));
    expect(out).toContain('✓');
  });

  it('renders error with X', () => {
    const out = renderToString(Notification({ message: 'Fail', type: 'error' }));
    expect(out).toContain('✕');
  });
});
