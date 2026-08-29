/** @brief Test compress: trim konteks by budget + weight. @since 0.1.0 */
import { describe, it, expect } from 'bun:test';
import { compress, type BuildContext } from './compress';

describe('build/context.compress', () => {
  it('drops low-weight entry entirely when budget < its size', () => {
    const ctx: BuildContext = {
      budget: 4,
      entries: [
        { key: 'a', weight: 1, text: 'AAAA' },
        { key: 'b', weight: 9, text: 'BBBB' },
      ],
    };
    const out = compress(ctx);
    expect(out.entries.map((e) => e.key)).toEqual(['b']);
    expect(out.entries[0].text).toBe('BBBB');
  });

  it('keeps high-weight first and truncates low-weight to fill budget', () => {
    const ctx: BuildContext = {
      budget: 6,
      entries: [
        { key: 'lo', weight: 1, text: 'low' },
        { key: 'hi', weight: 5, text: 'HIGH' },
      ],
    };
    const out = compress(ctx);
    expect(out.entries[0].key).toBe('hi');
    expect(out.entries.length).toBe(2);
    expect(out.entries[1].text).toBe('lo');
  });

  it('truncates overflow entry to fit budget', () => {
    const ctx: BuildContext = {
      budget: 3,
      entries: [{ key: 'x', weight: 1, text: 'XYZW' }],
    };
    const out = compress(ctx);
    expect(out.entries[0].text).toBe('XYZ');
    expect(out.budget).toBe(3);
  });

  it('returns empty on empty entries', () => {
    const out = compress({ entries: [], budget: 100 });
    expect(out.entries).toEqual([]);
  });
});
