/**
 * @brief React glue between ink's useInput and the core ShortcutRegistry.
 * @since 0.1.2
 */
import { useEffect, useRef } from "react";
import { useInput } from "ink";
import { ShortcutRegistry, matchShortcut, parseShortcut, type KeyCombo } from "../../core/shortcuts";

/** @brief ink's key event shape (the fields we actually consume). */
type InputKey = {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  [k: string]: boolean | undefined;
};

/**
 * @brief Mount a global shortcut listener that maps any registry binding
 *        onto the given action dispatcher.
 * @param {ShortcutRegistry} registry - Source of truth for combos.
 * @param {(action: string) => void} onAction - Called once per matched key press.
 * @since 0.1.2
 */
export function useGlobalShortcuts(
  registry: ShortcutRegistry,
  onAction: (action: string) => void,
): void {
  const actionRef = useRef(onAction);
  actionRef.current = onAction;

  useInput((input: string, key: InputKey) => {
    const event = {
      ctrl: key.ctrl,
      shift: key.shift,
      alt: key.alt,
      meta: key.meta,
    };
    const action = registry.match(input, event);
    if (action !== null) actionRef.current(action);
  });
}

/**
 * @brief Component-scoped shortcut: invoke `handler` when `key` (with optional
 *        modifiers) is pressed.
 * @param {string} key - Combo string like "ctrl+s" or "q".
 * @param {string} action - Action name (kept for symmetry / future logging).
 * @param {() => void} handler - Invoked on a matching press.
 * @param {unknown[]} [deps] - When any dep changes, the combo is re-parsed.
 * @since 0.1.2
 */
export function useShortcut(
  key: string,
  action: string,
  handler: () => void,
  deps: unknown[] = [],
): void {
  const comboRef = useRef<KeyCombo>(parseShortcut(key));
  comboRef.current = parseShortcut(key);

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    comboRef.current = parseShortcut(key);
  }, [key, ...deps]);

  useInput((input: string, keyEvent: InputKey) => {
    if (!matchShortcut(input, keyEvent, comboRef.current)) return;
    handlerRef.current();
  });
  // `action` is reserved for symmetric API / future logging — not used at runtime.
  void action;
}

// Re-exports for callers that want the building blocks from one place.
export { ShortcutRegistry, matchShortcut, parseShortcut };
export type { KeyCombo };
