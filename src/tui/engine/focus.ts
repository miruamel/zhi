/** @brief Pane identifiers eligible for keyboard focus. @since 0.1.1 */

/** @brief Stable identifier for every focusable pane. */
export type PaneId =
  | "header"
  | "dag"
  | "detail"
  | "metrics"
  | "critics"
  | "timeline"
  | "stages"
  | "eval"
  | "pr"
  | "knowledge"
  | "code"
  | "config"
  | "help"
  | "log"
  | "terminal"
  | "agents"
  | "files"
  | "diff"
  | "secrets"
  | "notifications"
  | "network"
  | "resources"
  | "gate"
  | "audit"
  | "queue"
  | "profile";

/** @brief Default traversal order used when no explicit order is provided. */
const DEFAULT_ORDER: PaneId[] = [
  "header",
  "dag",
  "detail",
  "metrics",
  "critics",
  "timeline",
  "stages",
  "eval",
  "pr",
  "knowledge",
  "code",
  "config",
  "help",
  "log",
  "terminal",
  "agents",
  "files",
  "diff",
  "secrets",
  "notifications",
  "network",
  "resources",
  "gate",
  "audit",
  "queue",
  "profile",
];

/** @brief Cyclic focus tracker for a fixed pane order.
 * @since 0.1.1 */
export class FocusManager {
  private current: PaneId;
  private initial: PaneId;
  private paneOrder: PaneId[];

  /** @param {PaneId} [initial] Pane to start focused; defaults to first in order.
   *  @param {PaneId[]} [order] Tab traversal order; defaults to {@link DEFAULT_ORDER}. */
  constructor(initial?: PaneId, order?: PaneId[]) {
    this.paneOrder = order ? [...order] : [...DEFAULT_ORDER];
    const fallback = this.paneOrder[0] ?? "header";
    this.initial = initial ?? fallback;
    this.current = this.initial;
  }

  /** @brief Focus a specific pane by id.
   *  @param {PaneId} id */
  focus(id: PaneId): void {
    this.current = id;
  }

  /** @brief Advance focus to the next pane in order, wrapping at the end. */
  focusNext(): void {
    const idx = this.paneOrder.indexOf(this.current);
    if (idx === -1) {
      const first = this.paneOrder[0];
      if (first !== undefined) this.current = first;
      return;
    }
    const next = this.paneOrder[(idx + 1) % this.paneOrder.length];
    if (next !== undefined) this.current = next;
  }

  /** @brief Move focus to the previous pane in order, wrapping at the start. */
  focusPrev(): void {
    const idx = this.paneOrder.indexOf(this.current);
    if (idx === -1) {
      const last = this.paneOrder[this.paneOrder.length - 1];
      if (last !== undefined) this.current = last;
      return;
    }
    const prev =
      this.paneOrder[(idx - 1 + this.paneOrder.length) % this.paneOrder.length];
    if (prev !== undefined) this.current = prev;
  }

  /** @return {PaneId} The currently focused pane. */
  get focused(): PaneId {
    return this.current;
  }

  /** @brief Replace the traversal order. Current pane is preserved if still present,
   *  otherwise focus resets to the first pane in the new order.
   *  @param {PaneId[]} order */
  setOrder(order: PaneId[]): void {
    this.paneOrder = [...order];
    if (!this.paneOrder.includes(this.current)) {
      const first = this.paneOrder[0];
      if (first !== undefined) this.current = first;
    }
  }

  /** @return {PaneId[]} A copy of the active traversal order. */
  get order(): PaneId[] {
    return [...this.paneOrder];
  }

  /** @brief Restore focus to the pane supplied at construction time. */
  reset(): void {
    this.current = this.initial;
  }
}

/** @brief Factory mirroring the {@link FocusManager} constructor.
 *  @param {PaneId} [initial] @param {PaneId[]} [order] @return {FocusManager} */
export function createFocusManager(
  initial?: PaneId,
  order?: PaneId[],
): FocusManager {
  return new FocusManager(initial, order);
}