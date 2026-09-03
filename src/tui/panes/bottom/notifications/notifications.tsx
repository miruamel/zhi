/** @brief Notifications center: inbox with type icon, title, message, ts, read state. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { colors } from '../../../core/style/colors';
import { formatTime, truncate } from '../../../core/style/format';

/** @brief Single notification record. @since 0.1.1 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warn' | 'error';
  title: string;
  message?: string;
  ts: number;
  read?: boolean;
}

/** @brief Props for the Notifications pane. @since 0.1.1 */
export interface NotificationsProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onClear?: () => void;
  maxLines?: number;
  focused?: boolean;
}

/** @brief Per-type icon + color mapping. @since 0.1.1 */
const TYPE_META: Record<Notification['type'], { icon: string; color: string }> = {
  info: { icon: 'ℹ', color: colors.accentBlue },
  success: { icon: '✓', color: colors.done },
  warn: { icon: '⚠', color: colors.warn },
  error: { icon: '✕', color: colors.error },
};

/** @brief Notifications pane: scrollable inbox with keyboard controls. @since 0.1.1 */
export function Notifications({ notifications, onMarkRead, onClear, maxLines = 8 , focused = true }: NotificationsProps) {
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (!focused) return;
    if (notifications.length === 0) return;
    if (key.return && onMarkRead) {
      onMarkRead(notifications[selected]!.id);
      return;
    }
    if (key.upArrow && selected > 0) setSelected(selected - 1);
    if (key.downArrow && selected < notifications.length - 1) setSelected(selected + 1);
    if (input === 'c' && onClear) onClear();
  });

  const unread = notifications.filter((n) => !n.read).length;
  const visible = notifications.slice(0, maxLines);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.accent} paddingX={1} flexGrow={1}>
      <Box gap={1}>
        <Text color={colors.accent} bold>
          🔔 NOTIFICATIONS
        </Text>
        <Text color={colors.fgDim}>({notifications.length}{unread > 0 ? ` · ${unread} unread` : ''})</Text>
        {onClear && <Text color={colors.fgDim}> · c clear</Text>}
      </Box>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (no notifications)</Text>
      ) : (
        visible.map((n, i) => {
          const meta = TYPE_META[n.type];
          const isSelected = i === selected;
          return (
            <Box key={n.id} gap={1}>
              <Text color={colors.fgDim}>{isSelected ? '▶' : ' '}</Text>
              <Text color={meta.color}>{meta.icon}</Text>
              <Text color={meta.color} bold={!n.read}>
                {truncate(n.title, 28)}
              </Text>
              {n.message && <Text color={colors.fgDim}>{truncate(n.message, 40)}</Text>}
              <Text color={colors.fgDim}>{formatTime(n.ts)}</Text>
              {!n.read && <Text color={colors.accent}>●</Text>}
            </Box>
          );
        })
      )}
    </Box>
  );
}