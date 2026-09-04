/** @brief Secrets pane: rotated/expired inventory with rotate hotkey. @since 0.1.1 */
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../../../core/style/colors';

const MS_PER_DAY = 86_400_000;
const EXPIRING_SOON_DAYS = 7;

const STATUS_COLOR: Record<SecretEntry['status'], string> = {
  active: colors.done,
  expiring: colors.warn,
  expired: colors.error,
};

const STATUS_GLYPH: Record<SecretEntry['status'], string> = {
  active: '●',
  expiring: '◐',
  expired: '○',
};

/** @brief Single secret row entry. @since 0.1.1 */
export interface SecretEntry {
  /** @brief Stable id. */
  id: string;
  /** @brief Human label. */
  name: string;
  /** @brief Owning provider (gh, aws, ...). */
  provider: string;
  /** @brief Last rotation epoch ms. */
  lastRotated?: number;
  /** @brief Expiry epoch ms. */
  expires?: number;
  /** @brief Lifecycle status. */
  status: 'active' | 'expiring' | 'expired';
}

/** @brief Props for the Secrets pane. @since 0.1.1 */
export interface SecretsProps {
  /** @brief Secret entries to render. */
  secrets: SecretEntry[];
  /** @brief Rotate callback (receives secret id). */
  onRotate?: (id: string) => void;
  /** @brief Cap rendered rows. @default 16 */
  maxLines?: number;
  focused?: boolean;
}

/** @brief Days until expiry; negative when expired; '—' if unknown. Exported for tests. @since 0.1.1 */
export function daysUntilExpiry(expires: number | undefined, now: number): string {
  if (expires === undefined) return '—';
  const days = Math.ceil((expires - now) / MS_PER_DAY);
  if (days < 0) return `${Math.abs(days)}d past`;
  if (days === 0) return 'today';
  return `${days}d`;
}

/** @brief Days until `expires` from `now`; positive = future. Exported for tests. @since 0.1.1 */
export function daysUntil(expires: number, now: number = Date.now()): number {
  return Math.ceil((expires - now) / MS_PER_DAY);
}

/** @brief True when `expires` falls within `thresholdDays` of `now` and is not past. Exported for tests. @since 0.1.1 */
export function isExpiringSoon(expires: number, now: number = Date.now(), thresholdDays: number = EXPIRING_SOON_DAYS): boolean {
  return daysUntil(expires, now) <= thresholdDays;
}

/** @brief Secrets manager pane (rows + rotate hotkey). @since 0.1.1 */
export function Secrets({ secrets, onRotate, maxLines = 16 , focused = true }: SecretsProps): React.ReactElement {
  const [focus] = useState(0);
  const visible = secrets.slice(0, maxLines);

  useInput((input) => {
    if (!focused) return;
    if (input === 'r' && onRotate && visible[focus]) {
      onRotate(visible[focus].id);
    }
  });

  const now = Date.now();

  if (secrets.length === 0) {
    return (
      <Box borderStyle="round" borderColor={colors.error} flexDirection="column" paddingX={1}>
        <Text bold color={colors.error}>SECRETS</Text>
        <Text dimColor>no secrets registered</Text>
      </Box>
    );
  }

  return (
    <Box borderStyle="round" borderColor={colors.error} flexDirection="column" paddingX={1}>
      <Text bold color={colors.error}>SECRETS</Text>
      {visible.map((s, idx) => {
        const isFocused = idx === focus;
        const marker = isFocused ? '▸' : ' ';
        const lastRot = s.lastRotated === undefined ? '—' : `${Math.floor((now - s.lastRotated) / MS_PER_DAY)}d ago`;
        const untilExp = daysUntilExpiry(s.expires, now);
        return (
          <Box key={s.id} flexDirection="row">
            <Text color={isFocused ? colors.accent : undefined}>{marker} </Text>
            <Text>{s.name.padEnd(14)}</Text>
            <Text dimColor>{s.provider.padEnd(8)} </Text>
            <Text color={STATUS_COLOR[s.status]}>
              {STATUS_GLYPH[s.status]} {s.status.padEnd(8)}
            </Text>
            <Text dimColor>rot:{lastRot.padEnd(8)} </Text>
            <Text color={s.status === 'expired' ? colors.error : undefined}>exp:{untilExp}</Text>
          </Box>
        );
      })}
      {secrets.length > maxLines ? (
        <Text dimColor>+{secrets.length - maxLines} more (showing {maxLines})</Text>
      ) : null}
    </Box>
  );
}