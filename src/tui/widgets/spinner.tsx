/** @brief Spinner widget: animated cycling frame sequence with optional label. @since 0.1.1 */
import React, { useState, useEffect } from 'react';
import { Text } from 'ink';
import { type ColorToken } from '../core/style/colors';

export type SpinnerType =
  | 'braille'
  | 'dots'
  | 'line'
  | 'arc'
  | 'moon'
  | 'star'
  | 'toggle'
  | 'sand'
  | 'box'
  | 'triangle';

/** @brief Frame sequences for each spinner preset. @since 0.1.1 */
export const SPINNER_PRESETS: Record<SpinnerType, string[]> = {
  braille: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  dots: ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
  line: ['-', '\\', '|', '/'],
  arc: ['◜', '◠', '◝', '◞', '◡', '◟'],
  moon: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
  star: ['✶', '✷', '✸', '✹', '✺', '✹', '✸', '✷'],
  toggle: ['▫', '▪'],
  sand: ['⠁', '⠃', '⠇', '⠧', '⠷', '⠿', '⠷', '⠧', '⠇', '⠃'],
  box: ['▖', '▘', '▝', '▗'],
  triangle: ['◢', '◣', '◤', '◥'],
};

const DEFAULT_INTERVAL_MS = 80;

export interface SpinnerProps {
  size?: number;
  color?: ColorToken;
  label?: string;
  type?: SpinnerType;
}

/** @brief Animated spinner cycling through preset frames. @since 0.1.1 */
export function Spinner({
  size = DEFAULT_INTERVAL_MS,
  color = 'accent',
  label,
  type = 'braille',
}: SpinnerProps) {
  const frames = SPINNER_PRESETS[type] ?? SPINNER_PRESETS.braille;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, size);
    return () => clearInterval(timer);
  }, [frames.length, size]);

  const frame = frames[index] ?? '';

  return (
    <Text color={color}>
      {frame}
      {label !== undefined && label.length > 0 ? ` ${label}` : ''}
    </Text>
  );
}