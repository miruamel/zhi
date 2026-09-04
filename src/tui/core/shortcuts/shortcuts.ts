/**
 * @brief Shortcut binding manager: parse, match, and register keyboard combos.
 *
 * @since 0.1.2
 */

const MODIFIER_ALIASES: Record<string, "ctrl" | "shift" | "alt" | "meta"> = {
  ctrl: "ctrl",
  control: "ctrl",
  shift: "shift",
  alt: "alt",
  option: "alt",
  meta: "meta",
  cmd: "meta",
  command: "meta",
  super: "meta",
  win: "meta",
};

/** @brief A normalized key combination. @since 0.1.2 */
export interface KeyCombo {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  key: string;
}

/** @brief Parse a shortcut string like "ctrl+shift+k" or "cmd+," into a KeyCombo. @since 0.1.2 */
export function parseShortcut(s: string): KeyCombo {
  const parts = s
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const combo: KeyCombo = { key: "" };
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    const mod = MODIFIER_ALIASES[part];
    if (mod) {
      combo[mod] = true;
      continue;
    }
    if (i < parts.length - 1) {
      combo[part as "ctrl" | "shift" | "alt" | "meta"] = true;
      continue;
    }
    combo.key = part;
  }
  if (!combo.key) throw new Error(`parseShortcut: missing key in "${s}"`);
  return combo;
}

/** @brief Canonical string id for a combo (e.g. "ctrl+shift+k"). @since 0.1.2 */
export function comboToId(c: KeyCombo): string {
  const mods: string[] = [];
  if (c.ctrl) mods.push("ctrl");
  if (c.shift) mods.push("shift");
  if (c.alt) mods.push("alt");
  if (c.meta) mods.push("meta");
  return [...mods, c.key.toLowerCase()].join("+");
}

/** @brief True if the input key event matches the combo. @since 0.1.2 */
export function matchShortcut(
  input: string,
  key: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean },
  combo: KeyCombo,
): boolean {
  if (input.toLowerCase() !== combo.key.toLowerCase()) return false;
  return (
    Boolean(combo.ctrl) === Boolean(key.ctrl) &&
    Boolean(combo.shift) === Boolean(key.shift) &&
    Boolean(combo.alt) === Boolean(key.alt) &&
    Boolean(combo.meta) === Boolean(key.meta)
  );
}

/** @brief Binding entry stored in the registry. @since 0.1.2 */
interface Binding {
  combo: KeyCombo;
  comboId: string;
  action: string;
  desc?: string;
}

/** @brief Shortcut registry: bind action names to key combos, look up by event. @since 0.1.2 */
export class ShortcutRegistry {
  private bindings: Binding[] = [];

  /** @brief Bind an action to a combo (string or KeyCombo). @since 0.1.2 */
  bind(combo: KeyCombo | string, action: string, desc?: string): void {
    const c = typeof combo === "string" ? parseShortcut(combo) : combo;
    const id = comboToId(c);
    this.unbind(action);
    this.bindings.push({ combo: c, comboId: id, action, desc });
  }

  /** @brief Remove all bindings for an action. @since 0.1.2 */
  unbind(action: string): void {
    this.bindings = this.bindings.filter((b) => b.action !== action);
  }

  /** @brief Return the first action matching the input event, or null. @since 0.1.2 */
  match(input: string, key: Record<string, boolean>): string | null {
    const event = {
      ctrl: key.ctrl,
      shift: key.shift,
      alt: key.alt,
      meta: key.meta,
    };
    for (const b of this.bindings) {
      if (matchShortcut(input, event, b.combo)) return b.action;
    }
    return null;
  }

  /** @brief List all bindings. @since 0.1.2 */
  list(): Array<{ combo: string; action: string; desc?: string }> {
    return this.bindings.map((b) => ({ combo: b.comboId, action: b.action, desc: b.desc }));
  }

  /** @brief Remove all bindings. @since 0.1.2 */
  clear(): void {
    this.bindings = [];
  }
}
