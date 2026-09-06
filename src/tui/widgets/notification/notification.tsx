/**
 * @fileoverview Notification — toast/alert banner.
 * @since 0.2.0
 */
import { Text } from 'ink';
import { colors } from '../../core/colors';

export type NotifType = 'info' | 'success' | 'warn' | 'error';

export interface NotificationProps {
  message: string;
  type?: NotifType;
  duration?: number;
  onClose?: () => void;
}

const TYPE_COLORS: Record<NotifType, string> = {
  info: colors.accentBlue,
  success: colors.done,
  warn: colors.warn,
  error: colors.error,
};

const TYPE_ICONS: Record<NotifType, string> = {
  info: 'ℹ',
  success: '✓',
  warn: '⚠',
  error: '✕',
};

/** @brief Render a notification toast. @since 0.2.0 */
export function Notification({ message, type = 'info', onClose }: NotificationProps) {
  return (
    <Text>
      <Text color={TYPE_COLORS[type]}>{TYPE_ICONS[type]} </Text>
      <Text>{message}</Text>
      {onClose && (
        <Text dimColor> [esc]</Text>
      )}
    </Text>
  );
}