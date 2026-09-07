/**
 * @fileoverview Notification widget — toast-style message display. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Notification type. @since 0.2.6 */
export type NotificationType = 'info' | 'success' | 'warn' | 'error';

/** @brief Notification. @since 0.2.6 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
}

/** @brief Notification widget props. @since 0.2.6 */
export interface NotificationProps {
  notifications?: Notification[];
  message?: string;
  type?: NotificationType;
  onDismiss?: (id: string) => void;
}

const TYPE_COLOR: Record<NotificationType, string> = {
  info: 'cyan',
  success: 'green',
  warn: 'yellow',
  error: 'red',
};

const TYPE_ICON: Record<NotificationType, string> = {
  info: 'ℹ',
  success: '✓',
  warn: '⚠',
  error: '✕',
};

/** @brief Notification component. @since 0.2.6 */
export function Notification({
  notifications,
  message,
  type = 'info',
  onDismiss,
}: NotificationProps): React.ReactElement {
  if (notifications && notifications.length > 0) {
    return (
      <Text>
        {notifications.map((n) => (
          <Text key={n.id}>
            <Text color={TYPE_COLOR[n.type]}>{TYPE_ICON[n.type]} </Text>
            <Text>{n.message}</Text>
            {onDismiss && <Text color="gray">{' [x]'}</Text>}
            {'\n'}
          </Text>
        ))}
      </Text>
    );
  }
  return (
    <Text>
      <Text color={TYPE_COLOR[type]}>{TYPE_ICON[type]} </Text>
      <Text>{message}</Text>
    </Text>
  );
}
