/**
 * @fileoverview Inspector pane tests.
 * @since 0.1.13
 */
import { describe, it, expect } from 'bun:test';
import TestRenderer from 'react-test-renderer';
import { InspectorPane } from './inspector';
import { colors } from '../../../core/colors';
import { renderToString } from '../../../core/test/render/render';
function findSingleBorderProps(node: unknown): Record<string, unknown> | undefined {
  if (!node || typeof node !== 'object') return undefined;
  const record = node as Record<string, unknown>;
  if (record.type === 'ink-box') {
    const props = record.props as { style?: Record<string, unknown> } | undefined;
    const style = props?.style as Record<string, unknown> | undefined;
    if (style?.borderStyle === 'single' && style?.width === '50%' && style?.paddingX === 1)
      return style;
  }
  const children = record.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const props = findSingleBorderProps(child);
      if (props) return props;
    }
  }
  return undefined;
}

const nodes = [
  {
    id: '1',
    label: 'App',
    value: 'app',
    children: [{ id: '2', label: 'Header', value: 'header' }],
    props: { title: 'Zhi', env: 'prod' },
    state: { count: 0, ready: true },
  },
];

describe('InspectorPane', () => {
  it('renders title', () => {
    const out = renderToString(InspectorPane({ nodes }));
    expect(out).toContain('INSPECTOR');
    expect(out).toContain('COMPONENTS (1)');
  });

  it('renders tree nodes', () => {
    const out = renderToString(InspectorPane({ nodes }));
    expect(out).toContain('App');
    expect(out).toContain('Header');
  });

  it('renders props when selected', () => {
    const out = renderToString(InspectorPane({ nodes, selected: 'app' }));
    expect(out).toContain('props');
    expect(out).toContain('title');
    expect(out).toContain('Zhi');
  });

  it('renders state when selected', () => {
    const out = renderToString(InspectorPane({ nodes, selected: 'app' }));
    expect(out).toContain('state');
    expect(out).toContain('count');
    expect(out).toContain('ready');
  });

  it('shows empty state when no selection', () => {
    const out = renderToString(InspectorPane({ nodes }));
    expect(out).toContain('Select a component.');
  });

  it('renders search hint when onSearch provided', () => {
    const out = renderToString(InspectorPane({ nodes, onSearch: () => {}, search: 'app' }));
    expect(out).toContain('find: app');
  });

  it('keeps only the left divider on the detail pane', () => {
    const props = findSingleBorderProps(TestRenderer.create(InspectorPane({ nodes })).toJSON());

    expect(props).toBeDefined();
    expect(props?.borderStyle).toBe('single');
    expect(props?.borderLeftColor).toBe(colors.fgDim);
    expect(props?.borderLeft).not.toBe(false);
    expect(props?.borderTop).toBe(false);
    expect(props?.borderRight).toBe(false);
    expect(props?.borderBottom).toBe(false);
  });
});
