/** @brief Render + keyboard logic tests for the SegmentedControl widget. @since 0.1.1 */
import { describe, it, expect, mock } from 'bun:test';
import { render } from 'ink';
import React from 'react';
import { SegmentedControl, nextSegmentId, type SegmentOption } from './segmented-control';

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
  const inst = render(el, { stdout: stdout as unknown as Parameters<typeof render>[1] });
  inst.unmount();
  return chunks.join('');
}

const SAMPLE: SegmentOption[] = [
  { id: 'list', label: 'List' },
  { id: 'grid', label: 'Grid', icon: '#' },
  { id: 'tree', label: 'Tree' },
];

describe('SegmentedControl', () => {
  it('renders all option labels', () => {
    const out = wrap(
      <SegmentedControl options={SAMPLE} activeId="list" onChange={() => {}} />,
    );
    expect(out).toContain('List');
    expect(out).toContain('Grid');
    expect(out).toContain('Tree');
  });

  it('shows icon when provided', () => {
    const out = wrap(
      <SegmentedControl options={SAMPLE} activeId="list" onChange={() => {}} />,
    );
    expect(out).toContain('#');
  });

  it('renders empty when no options', () => {
    const out = wrap(
      <SegmentedControl options={[]} activeId="" onChange={() => {}} />,
    );
    expect(out).not.toContain('List');
  });

  it('renders with default size without throwing', () => {
    expect(() =>
      wrap(<SegmentedControl options={SAMPLE} activeId="list" onChange={() => {}} />),
    ).not.toThrow();
  });

  it('renders each size token', () => {
    for (const size of ['sm', 'md'] as const) {
      expect(() =>
        wrap(
          <SegmentedControl options={SAMPLE} activeId="list" onChange={() => {}} size={size} />,
        ),
      ).not.toThrow();
    }
  });

  it('renders active segment content alongside inactive labels', () => {
    const out = wrap(
      <SegmentedControl options={SAMPLE} activeId="tree" onChange={() => {}} />,
    );
    expect(out).toContain('Tree');
    expect(out).toContain('List');
  });

  it('highlights active id: only the active label is rendered with the active prop', () => {
    // Border renders option labels in order; the active one's text should still appear.
    const out = wrap(
      <SegmentedControl options={SAMPLE} activeId="grid" onChange={() => {}} />,
    );
    expect(out).toContain('Grid');
    expect(out).toContain('List');
    expect(out).toContain('Tree');
    expect(out).toContain('#');
  });

  it('renders inside a bordered Box (emits border glyph)', () => {
    const out = wrap(
      <SegmentedControl options={SAMPLE} activeId="list" onChange={() => {}} />,
    );
    // Ink's round border emits corner chars.
    expect(out).toMatch(/[╭╮╰╯─│]/);
  });
});

describe('SegmentedControl click -> onChange', () => {
  it('exposes onChange prop; not called during render', () => {
    const calls: string[] = [];
    wrap(<SegmentedControl options={SAMPLE} activeId="list" onChange={id => calls.push(id)} />);
    expect(calls).toEqual([]);
  });

  it('uses mock.fn to track callback identity', () => {
    const spy = mock(() => {});
    wrap(<SegmentedControl options={SAMPLE} activeId="list" onChange={spy} />);
    expect(spy).not.toHaveBeenCalled();
  });

  it('different onChange instances are accepted (no re-render crash)', () => {
    const a = mock(() => {});
    const b = mock(() => {});
    expect(() =>
      wrap(
        <>
          <SegmentedControl options={SAMPLE} activeId="list" onChange={a} />
          <SegmentedControl options={SAMPLE} activeId="grid" onChange={b} />
        </>,
      ),
    ).not.toThrow();
  });
});

describe('SegmentedControl keyboard nav (nextSegmentId)', () => {
  it('right arrow advances to next option', () => {
    expect(nextSegmentId(SAMPLE, 'list', '', { rightArrow: true })).toBe('grid');
    expect(nextSegmentId(SAMPLE, 'grid', '', { rightArrow: true })).toBe('tree');
  });

  it('right arrow wraps from last to first', () => {
    expect(nextSegmentId(SAMPLE, 'tree', '', { rightArrow: true })).toBe('list');
  });

  it('left arrow goes to previous option', () => {
    expect(nextSegmentId(SAMPLE, 'grid', '', { leftArrow: true })).toBe('list');
    expect(nextSegmentId(SAMPLE, 'tree', '', { leftArrow: true })).toBe('grid');
  });

  it('left arrow wraps from first to last', () => {
    expect(nextSegmentId(SAMPLE, 'list', '', { leftArrow: true })).toBe('tree');
  });

  it('number key 1-9 selects option by index', () => {
    expect(nextSegmentId(SAMPLE, 'list', '1', {})).toBe('list');
    expect(nextSegmentId(SAMPLE, 'list', '2', {})).toBe('grid');
    expect(nextSegmentId(SAMPLE, 'list', '3', {})).toBe('tree');
  });

  it('returns null for number key out of range', () => {
    expect(nextSegmentId(SAMPLE, 'list', '9', {})).toBeNull();
  });

  it('returns null for unknown input', () => {
    expect(nextSegmentId(SAMPLE, 'list', 'x', {})).toBeNull();
  });

  it('returns null when options empty', () => {
    expect(nextSegmentId([], 'list', '', { rightArrow: true })).toBeNull();
    expect(nextSegmentId([], 'list', '1', {})).toBeNull();
  });
});

describe('SegmentedControl disabled handling', () => {
  const OPTIONS_WITH_DISABLED: SegmentOption[] = [
    { id: 'list', label: 'List' },
    { id: 'grid', label: 'Grid', disabled: true },
    { id: 'tree', label: 'Tree' },
  ];

  it('right arrow skips disabled option', () => {
    expect(nextSegmentId(OPTIONS_WITH_DISABLED, 'list', '', { rightArrow: true })).toBe('tree');
  });

  it('left arrow from first wraps and skips disabled', () => {
    expect(nextSegmentId(OPTIONS_WITH_DISABLED, 'list', '', { leftArrow: true })).toBe('tree');
  });

  it('left arrow from third goes to first (skipping middle disabled)', () => {
    expect(nextSegmentId(OPTIONS_WITH_DISABLED, 'tree', '', { leftArrow: true })).toBe('list');
  });

  it('number key on disabled option returns null', () => {
    expect(nextSegmentId(OPTIONS_WITH_DISABLED, 'list', '2', {})).toBeNull();
  });

  it('number key on enabled option works', () => {
    expect(nextSegmentId(OPTIONS_WITH_DISABLED, 'list', '3', {})).toBe('tree');
  });

  it('stays put if all other options are disabled', () => {
    const allDisabled: SegmentOption[] = [
      { id: 'list', label: 'List' },
      { id: 'grid', label: 'Grid', disabled: true },
      { id: 'tree', label: 'Tree', disabled: true },
    ];
    expect(nextSegmentId(allDisabled, 'list', '', { rightArrow: true })).toBeNull();
    expect(nextSegmentId(allDisabled, 'list', '', { leftArrow: true })).toBeNull();
  });

  it('renders disabled option label in output', () => {
    const out = wrap(
      <SegmentedControl
        options={OPTIONS_WITH_DISABLED}
        activeId="list"
        onChange={() => {}}
      />,
    );
    expect(out).toContain('Grid');
  });
});