/**
 * @fileoverview Modal tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Modal } from './modal';
import { Text } from 'ink';
import { renderToString } from '../../core/test/render';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const out = renderToString(Modal({ open: false, children: <Text>hidden</Text> }));
    expect(out).not.toContain('hidden');
  });

  it('renders children when open', () => {
    const out = renderToString(Modal({ open: true, children: <Text>visible</Text> }));
    expect(out).toContain('visible');
  });

  it('renders title when provided', () => {
    const out = renderToString(Modal({ open: true, title: 'My Modal', children: <Text>x</Text> }));
    expect(out).toContain('My Modal');
  });
});