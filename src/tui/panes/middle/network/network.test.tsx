/**
 * @fileoverview Network pane tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { NetworkPane } from './network';
import { renderToString } from '../../../core/test/render';

describe('NetworkPane', () => {
  it('renders online status', () => {
    const out = renderToString(NetworkPane({ requests: [], online: true }));
    expect(out).toContain('NETWORK');
    expect(out).toContain('ONLINE');
  });

  it('renders offline status', () => {
    const out = renderToString(NetworkPane({ requests: [], online: false }));
    expect(out).toContain('OFFLINE');
  });

  it('renders request data', () => {
    const out = renderToString(NetworkPane({
      requests: [{ url: '/api/test', status: 200, durationMs: 50, timestamp: Date.now() }],
    }));
    expect(out).toContain('/api/test');
    expect(out).toContain('200');
  });
});