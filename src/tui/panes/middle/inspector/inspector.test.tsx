/**
 * @fileoverview Inspector pane tests.
 * @since 0.1.13
 */
import { describe, it, expect } from 'bun:test';
import { InspectorPane } from './inspector';
import { renderToString } from '../../../core/test/render/render';

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
});
