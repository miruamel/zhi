/** @brief Callout widget: contextual boxed message with variant color. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../core/style/colors';

export type CalloutVariant = 'info' | 'success' | 'warn' | 'error';

export interface CalloutVariantMeta {
  color: string;
  icon: string;
  label: string;
}

/** @brief Variant palette — icon + border color per semantic meaning. @since 0.1.1 */
export const CALLOUT_VARIANTS: Record<CalloutVariant, CalloutVariantMeta> = {
  info: { color: colors.accentBlue, icon: 'ℹ', label: 'Info' },
  success: { color: colors.done, icon: '✓', label: 'Success' },
  warn: { color: colors.warn, icon: '⚠', label: 'Warning' },
  error: { color: colors.error, icon: '✕', label: 'Error' },
};

export interface CalloutProps {
  children: React.ReactNode;
  variant?: CalloutVariant;
  title?: string;
  icon?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  paddingX?: number;
}

/** @brief Render a bordered callout with variant color, optional title and dismiss. @since 0.1.1 */
export function Callout({
  children,
  variant = 'info',
  title,
  icon,
  dismissible = false,
  onDismiss,
  paddingX = 1,
}: CalloutProps) {
  const meta = CALLOUT_VARIANTS[variant];
  const leadingIcon = icon ?? meta.icon;

  return (
    <Box borderStyle="round" borderColor={meta.color} paddingX={paddingX} flexDirection="column">
      {(title !== undefined || leadingIcon !== undefined) && (
        <Box>
          <Text color={meta.color}>{leadingIcon} </Text>
          {title !== undefined && <Text color={meta.color} bold>{title}</Text>}
          {dismissible && (
            <Text color={meta.color}>  (×</Text>
          )}
        </Box>
      )}
      <Box>
        <Text>{children}</Text>
      </Box>
      {dismissible && onDismiss && (
        <Box>
          <Text color={meta.color} dimColor>{'(press to dismiss)'}</Text>
        </Box>
      )}
    </Box>
  );
}