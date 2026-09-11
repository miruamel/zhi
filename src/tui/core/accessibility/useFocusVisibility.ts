/**
 * @fileoverview Focus visibility hook — tracks keyboard vs mouse focus.
 * @since 0.1.13
 * @package zhi
 */
import { useState } from 'react';
import { useInput } from 'ink';

/** @brief Focus source. @since 0.1.13 */
export type FocusSource = 'keyboard' | 'mouse' | 'none';

/** @brief Return type of useFocusVisibility. @since 0.1.13 */
export interface FocusVisibilityResult {
  source: FocusSource;
  isKeyboard: boolean;
  /** @brief Call after a mouse interaction to reset to keyboard mode. */
  markMouse: () => void;
  /** @brief Call after a keyboard interaction to set keyboard mode. */
  markKeyboard: () => void;
}

/**
 * @brief Detect whether focus arrived via keyboard (Tab/Shift+Tab) or mouse.
 * Uses Ink's useInput to intercept Tab key presses; resets to mouse on any
 * non-Tab input. This is the Ink-native equivalent of CSS :focus-visible.
 * @since 0.1.13
 */
export function useFocusVisibility(): FocusVisibilityResult {
  const [source, setSource] = useState<FocusSource>('none');

  const markKeyboard = () => setSource('keyboard');
  const markMouse = () => setSource('mouse');

  useInput((_input: string, key: { tab?: boolean; shift?: boolean; return?: boolean }) => {
    if (key.tab || key.return) {
      setSource('keyboard');
    } else {
      setSource('mouse');
    }
  });

  return { source, isKeyboard: source === 'keyboard', markKeyboard, markMouse };
}
