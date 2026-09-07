/**
 * @fileoverview Navigation hook — pane focus cycling and history.
 * @description Provides useFocus, useHistory, useJump utilities for TUI navigation.
 * @package zhi
 */
import { useState, useCallback } from 'react';

export interface NavigationState {
  focusIndex: number;
  paneOrder: string[];
  history: string[];
  historyIndex: number;
}

/** @brief Hook for managing pane focus index. @since 0.2.0 */
export function useFocus(paneOrder: string[], initial = 0) {
  const [focusIndex, setFocusIndex] = useState(initial);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const current = paneOrder[focusIndex] ?? paneOrder[0];

  const move = useCallback(
    (delta: number) => {
      setFocusIndex((i) => Math.max(0, Math.min(paneOrder.length - 1, i + delta)));
    },
    [paneOrder.length],
  );

  const jump = useCallback(
    (index: number) => {
      if (index >= 0 && index < paneOrder.length) {
        setFocusIndex(index);
        setHistory((h) => [...h, paneOrder[index]]);
        setHistoryIndex((prev) => prev + 1);
      }
    },
    [paneOrder],
  );

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      const pane = history[idx];
      const i = paneOrder.indexOf(pane);
      if (i >= 0) setFocusIndex(i);
    }
  }, [history, historyIndex, paneOrder]);

  return { focusIndex, current, move, jump, goBack, history, historyIndex };
}
