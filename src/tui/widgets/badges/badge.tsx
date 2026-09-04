/** @brief Badge widget: colored status pill with solid/outline/dot variants. @since 0.1.1 */
import { Text } from 'ink';
import { colors, type ColorToken } from '../../core/style/colors';

export type BadgeVariant = 'solid' | 'outline' | 'dot';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeColor {
  bg: string;
  fg: string;
  border: string;
}

/** @brief Semantic palette — keyed by status name, not raw color. @since 0.1.1 */
export const BADGE_COLORS: Record<string, BadgeColor> = {
  success: { bg: colors.done, fg: colors.bg, border: colors.done },
  error: { bg: colors.error, fg: colors.bg, border: colors.error },
  warn: { bg: colors.warn, fg: colors.bg, border: colors.warn },
  info: { bg: colors.accentBlue, fg: colors.bg, border: colors.accentBlue },
  pending: { bg: colors.pending, fg: colors.bg, border: colors.pending },
  running: { bg: colors.running, fg: colors.bg, border: colors.running },
  done: { bg: colors.done, fg: colors.bg, border: colors.done },
  failed: { bg: colors.failed, fg: colors.bg, border: colors.failed },
  scoring: { bg: colors.scoring, fg: colors.bg, border: colors.scoring },
};

export interface BadgeProps {
  children: string;
  color?: ColorToken;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

/** @brief Render a status badge. @since 0.1.1 */
export function Badge({
  children,
  color = 'accent',
  variant = 'solid',
  size = 'md',
}: BadgeProps) {
  const palette = BADGE_COLORS[color] ?? BADGE_COLORS.pending;
  const pad = size === 'sm' ? 0 : size === 'lg' ? 2 : 1;
  const padStr = ' '.repeat(pad);

  if (variant === 'dot') {
    return (
      <Text>
        <Text color={palette.border}>{'●'}</Text>
        <Text color={palette.border}>{padStr}{children}{padStr}</Text>
      </Text>
    );
  }

  if (variant === 'outline') {
    return (
      <Text color={palette.border}>
        {'['}{children}{']'}
      </Text>
    );
  }

  return (
    <Text backgroundColor={palette.bg} color={palette.fg} bold>
      {padStr}{children}{padStr}
    </Text>
  );
}