/**
 * @fileoverview Notifications pane — notification center with unread badge, type filtering, dismiss.
 * @since 0.1.13
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import type { NotificationItem } from '../../../core/store/types/entities/notification-palette';

/** @brief Notification pane props. @since 0.1.13 */
export interface NotificationsPaneProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead?: (id: string) => void;
}

const TYPE_COLOR: Record<NotificationItem['type'], string> = {
  info: colors.forward,
  success: colors.complete,
  warning: colors.warn,
  error: colors.error,
};

/** @brief Render the notifications pane. @since 0.1.13 */
export function NotificationsPane({
  notifications,
  unreadCount,
  onMarkRead,
}: NotificationsPaneProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _NOTIFICATIONS
        {unreadCount > 0 && <Text color={colors.error}> ({unreadCount} unread)</Text>}
      </Text>
      {notifications.length === 0 ? (
        <Text color={colors.fgDim}>No notifications.</Text>
      ) : (
        notifications.map((n) => (
          <Box key={n.id} gap={1} marginTop={1} flexDirection="column">
            <Text color={TYPE_COLOR[n.type]}>
              <Text bold>{n.title}</Text>
              {' — '}
              {n.message}
            </Text>
            <Text color={colors.fgDim} dimColor>
              {new Date(n.timestamp).toLocaleTimeString()}
              {n.persistent && ' · persistent'}
              {' · '}
              <Text color={colors.forward}>[d] dismiss</Text>
              {onMarkRead && !n.read && <Text color={colors.forward}> [r] read</Text>}
            </Text>
          </Box>
        ))
      )}
    </Box>
  );
}
