/** @brief Render + keyboard logic tests for the Tabs widget. @since 0.1.1 */
import { describe, it, expect, mock } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import { Tabs, nextTabId, type TabDef } from './tabs';
import { emptyState } from '../../core/state';

/** @brief Render an ink element to a string using a synchronous writable stdout.
 * @param {React.ReactElement} el - component to render.
 * @return {string} captured stdout text.
 * @note debug:true bypasses ink's render throttle so onRender fires immediately.
 * The synchronous mock stdout omits ink's full WriteStream surface; cast through unknown. */
function wrap(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout = {
    write: (s: string) => {
      chunks.push(s);
      return true;
    },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream });
  inst.unmount();
  return chunks.join('');
}

const SAMPLE: TabDef[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Bravo', badge: '3' },
  { id: 'c', label: 'Charlie', icon: '*' },
];

describe('Tabs', () => {
  it('renders all tab labels', () => {
    const out = wrap(<Tabs tabs={SAMPLE} activeId="a" onChange={() => {}} />);
    expect(out).toContain('Alpha');
    expect(out).toContain('Bravo');
    expect(out).toContain('Charlie');
  });

  it('shows badge when provided', () => {
    const out = wrap(<Tabs tabs={SAMPLE} activeId="a" onChange={() => {}} />);
    expect(out).toContain('3');
  });

  it('shows icon when provided', () => {
    const out = wrap(<Tabs tabs={SAMPLE} activeId="a" onChange={() => {}} />);
    expect(out).toContain('*');
  });

  it('renders empty when no tabs', () => {
    const out = wrap(<Tabs tabs={[]} activeId="" onChange={() => {}} />);
    expect(out).not.toContain('Alpha');
  });

  it('renders with default size without throwing', () => {
    expect(() => wrap(<Tabs tabs={SAMPLE} activeId="a" onChange={() => {}} />)).not.toThrow();
  });

  it('renders each size token', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      expect(() =>
        wrap(<Tabs tabs={SAMPLE} activeId="a" onChange={() => {}} size={size} />),
      ).not.toThrow();
    }
  });

  it('renders active tab label visible alongside inactive ones', () => {
    const out = wrap(<Tabs tabs={SAMPLE} activeId="b" onChange={() => {}} />);
    expect(out).toContain('Bravo');
    expect(out).toContain('Alpha');
  });
});

describe('Tabs click -> onChange', () => {
  it('exposes onChange prop; not called during render', () => {
    const calls: string[] = [];
    wrap(<Tabs tabs={SAMPLE} activeId="a" onChange={id => calls.push(id)} />);
    expect(calls).toEqual([]);
  });

  it('uses mock.fn to track callback identity', () => {
    const spy = mock(() => {});
    wrap(<Tabs tabs={SAMPLE} activeId="a" onChange={spy} />);
    expect(spy).not.toHaveBeenCalled();
  });

  it('different onChange instances are accepted (no re-render crash)', () => {
    const a = mock(() => {});
    const b = mock(() => {});
    expect(() =>
      wrap(
        <>
          <Tabs tabs={SAMPLE} activeId="a" onChange={a} />
          <Tabs tabs={SAMPLE} activeId="b" onChange={b} />
        </>,
      ),
    ).not.toThrow();
  });
});

describe('Tabs keyboard nav (nextTabId)', () => {
  it('right arrow advances to next tab', () => {
    expect(nextTabId(SAMPLE, 'a', '', { rightArrow: true })).toBe('b');
    expect(nextTabId(SAMPLE, 'b', '', { rightArrow: true })).toBe('c');
  });

  it('right arrow wraps from last to first', () => {
    expect(nextTabId(SAMPLE, 'c', '', { rightArrow: true })).toBe('a');
  });

  it('left arrow goes to previous tab', () => {
    expect(nextTabId(SAMPLE, 'b', '', { leftArrow: true })).toBe('a');
    expect(nextTabId(SAMPLE, 'c', '', { leftArrow: true })).toBe('b');
  });

  it('left arrow wraps from first to last', () => {
    expect(nextTabId(SAMPLE, 'a', '', { leftArrow: true })).toBe('c');
  });

  it('number key 1-9 selects tab by index', () => {
    expect(nextTabId(SAMPLE, 'a', '1', {})).toBe('a');
    expect(nextTabId(SAMPLE, 'a', '2', {})).toBe('b');
    expect(nextTabId(SAMPLE, 'a', '3', {})).toBe('c');
  });

  it('returns null for number key out of range', () => {
    expect(nextTabId(SAMPLE, 'a', '9', {})).toBeNull();
  });

  it('returns null for unknown input', () => {
    expect(nextTabId(SAMPLE, 'a', 'x', {})).toBeNull();
  });

  it('returns null when tabs empty', () => {
    expect(nextTabId([], 'a', '', { rightArrow: true })).toBeNull();
    expect(nextTabId([], 'a', '1', {})).toBeNull();
  });
});

describe('Tabs disabled handling', () => {
  const TABS_WITH_DISABLED: TabDef[] = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Bravo', disabled: true },
    { id: 'c', label: 'Charlie' },
  ];

  it('right arrow skips disabled tab', () => {
    expect(nextTabId(TABS_WITH_DISABLED, 'a', '', { rightArrow: true })).toBe('c');
  });

  it('left arrow from first wraps and skips disabled', () => {
    expect(nextTabId(TABS_WITH_DISABLED, 'a', '', { leftArrow: true })).toBe('c');
  });

  it('left arrow from third goes to first (skipping middle disabled)', () => {
    expect(nextTabId(TABS_WITH_DISABLED, 'c', '', { leftArrow: true })).toBe('a');
  });

  it('number key on disabled tab returns null', () => {
    expect(nextTabId(TABS_WITH_DISABLED, 'a', '2', {})).toBeNull();
  });

  it('number key on enabled tab works', () => {
    expect(nextTabId(TABS_WITH_DISABLED, 'a', '3', {})).toBe('c');
  });

  it('stays put if all other tabs are disabled', () => {
    const allDisabled: TabDef[] = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B', disabled: true },
      { id: 'c', label: 'C', disabled: true },
    ];
    expect(nextTabId(allDisabled, 'a', '', { rightArrow: true })).toBeNull();
    expect(nextTabId(allDisabled, 'a', '', { leftArrow: true })).toBeNull();
  });

  it('renders disabled tab label in output', () => {
    const out = wrap(
      <Tabs tabs={TABS_WITH_DISABLED} activeId="a" onChange={() => {}} />,
    );
    expect(out).toContain('Bravo');
  });
});

describe('Tabs integration with emptyState', () => {
  it('renders using real state module (no crash)', () => {
    const s = emptyState('goal', 100);
    expect(s.goal).toBe('goal');
    const out = wrap(
      <Tabs
        tabs={[{ id: 'logs', label: 'Logs' }]}
        activeId="logs"
        onChange={() => {}}
      />,
    );
    expect(out).toContain('Logs');
  });
});
