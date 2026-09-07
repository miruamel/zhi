/**
 * @fileoverview Config tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Config } from './config';
import { renderToString } from '../../core/test/render';

describe('Config', () => {
  it('renders key-value entries', () => {
    const out = renderToString(
      Config({
        entries: [{ key: 'theme', value: 'dark' }],
      }),
    );
    expect(out).toContain('theme');
    expect(out).toContain('dark');
  });
});
