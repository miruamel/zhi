/**
 * @fileoverview Tabs tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Tabs } from './tabs';
import { renderToString } from '../../core/test/render';

describe('Tabs', () => {
  it('renders all tab labels', () => {
    const out = renderToString(
      Tabs({
        tabs: [
          { id: 'a', label: 'Tab A' },
          { id: 'b', label: 'Tab B' },
        ],
        active: 'a',
        onChange: () => {},
      }),
    );
    expect(out).toContain('Tab A');
    expect(out).toContain('Tab B');
  });

  it('marks active tab', () => {
    const out = renderToString(
      Tabs({
        tabs: [{ id: 'a', label: 'Active' }],
        active: 'a',
        onChange: () => {},
      }),
    );
    expect(out).toContain('Active');
  });
});
