/**
 * @fileoverview ReleasePane tests. @since 0.2.5
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { ReleasePane } from './release';

const builds = [
  { id: 'b1', status: 'success' as const, branch: 'main', commit: 'abc1234', duration: 12 },
  { id: 'b2', status: 'running' as const, branch: 'feat/x', commit: 'def5678' },
];
const releases = [{ version: '0.2.5', tag: 'v0.2.5', date: Date.now(), artifacts: 3, sbom: true }];

describe('ReleasePane', () => {
  it('renders builds and releases', () => {
    const f = renderToString(<ReleasePane builds={builds} releases={releases} />);
    expect(f).toContain('_RELEASE');
    expect(f).toContain('main');
    expect(f).toContain('0.2.5');
  });

  it('shows empty state when no builds', () => {
    const f = renderToString(<ReleasePane builds={[]} releases={[]} />);
    expect(f).toContain('No builds.');
  });

  it('shows empty state when no releases', () => {
    const f = renderToString(<ReleasePane builds={builds} releases={[]} />);
    expect(f).toContain('No releases.');
  });
});
