/**
 * @fileoverview Notifications pane tests.
 * @since 0.1.13
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render/render';
import { NotificationsPane } from './notifications';

const baseProps = {
  notifications: [
    {
      id: 'n1',
      type: 'info' as const,
      title: 'Build passed',
      message: 'CI green after PR #271',
      timestamp: Date.now(),
    },
    {
      id: 'n2',
      type: 'error' as const,
      title: 'Gate failed',
      message: 'format:check exited 1',
      timestamp: Date.now(),
      read: true,
    },
  ],
  unreadCount: 1,
  onMarkRead: () => {},
};

describe('NotificationsPane', () => {
  it('renders empty state', () => {
    const out = renderToString(NotificationsPane({ notifications: [], unreadCount: 0 }));
    expect(out).toContain('_NOTIFICATIONS');
    expect(out).toContain('No notifications.');
  });

  it('renders notification list', () => {
    const out = renderToString(<NotificationsPane {...baseProps} />);
    expect(out).toContain('_NOTIFICATIONS');
    expect(out).toContain('Build passed');
    expect(out).toContain('CI green after PR #271');
    expect(out).toContain('Gate failed');
    expect(out).toContain('(1 unread)');
  });
  it('renders mark-read hint when unread', () => {
    const out = renderToString(<NotificationsPane {...baseProps} />);
    expect(out).toContain('[r] read');
  });
});
