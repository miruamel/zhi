/**
 * @brief Shared render helper tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from './render';
import { Text } from 'ink';

describe('renderToString', () => {
  it('renders text content', () => {
    const out = renderToString(<Text>hello</Text>);
    expect(out).toContain('hello');
  });

  it('returns empty for null', () => {
    const out = renderToString(null);
    expect(out).toBe('');
  });
});
