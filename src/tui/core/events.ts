/**
 * @brief Typed event bus with subscribe/emit/once/clear and propagation cancellation.
 * @since 0.1.2
 */

/** @brief Sentinel returned by a handler to stop further propagation. @since 0.1.2 */
export const CANCEL = Symbol('cancel');

/** @brief Propagation control returned by a handler. @since 0.1.2 */
export type EmitResult = void | typeof CANCEL | boolean;

/** @brief Default event map (empty). Override via EventBus<E>. @since 0.1.2 */
export type DefaultEventMap = Record<string, unknown>;

/** @brief Handler signature. Receives the event payload, may return CANCEL to stop. @since 0.1.2 */
export type Handler<T = unknown> = (payload: T) => EmitResult;

/** @brief Internal handler record, tracks once-only subscriptions. @since 0.1.2 */
interface HandlerEntry<T> {
  fn: Handler<T>;
  once: boolean;
}

/**
 * @brief Typed event bus parameterized over an event map.
 * @since 0.1.2
 */
export class EventBus<E extends Record<string, unknown> = DefaultEventMap> {
  private readonly listeners: { [K in keyof E]?: HandlerEntry<E[K]>[] } = {};

  /**
   * @brief Register a handler for an event.
   * @param {K} event - Event key.
   * @param {Handler<E[K]>} handler - Handler invoked on emit.
   * @return {() => void} Unsubscribe function.
   * @since 0.1.2
   */
  subscribe<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    const list = this.listeners[event] ?? (this.listeners[event] = []);
    list.push({ fn: handler, once: false });
    return () => this.unsubscribe(event, handler);
  }

  /**
   * @brief Register a handler that fires at most once.
   * @param {K} event - Event key.
   * @param {Handler<E[K]>} handler - Handler invoked on the next emit only.
   * @return {() => void} Unsubscribe function.
   * @since 0.1.2
   */
  once<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    const list = this.listeners[event] ?? (this.listeners[event] = []);
    list.push({ fn: handler, once: true });
    return () => this.unsubscribe(event, handler);
  }

  /**
   * @brief Emit an event, invoking handlers in registration order.
   * @param {K} event - Event key.
   * @param {E[K]} payload - Payload delivered to each handler.
   * @return {boolean} true if any handler returned CANCEL.
   * @since 0.1.2
   */
  emit<K extends keyof E>(event: K, payload: E[K]): boolean {
    const list = this.listeners[event];
    if (!list || list.length === 0) return false;
    const snapshot = list.slice();
    let cancelled = false;
    for (const entry of snapshot) {
      const result = entry.fn(payload);
      if (entry.once) {
        const idx = list.indexOf(entry);
        if (idx !== -1) list.splice(idx, 1);
      }
      if (!cancelled && (result === CANCEL || result === true)) {
        cancelled = true;
        break;
      }
    }
    return cancelled;
  }

  /**
   * @brief Remove a specific handler for an event.
   * @param {K} event - Event key.
   * @param {Handler<E[K]>} handler - Handler reference previously registered.
   * @return {boolean} true if a handler was removed.
   * @since 0.1.2
   */
  unsubscribe<K extends keyof E>(event: K, handler: Handler<E[K]>): boolean {
    const list = this.listeners[event];
    if (!list) return false;
    const idx = list.findIndex((e) => e.fn === handler);
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }

  /**
   * @brief Remove every listener, optionally scoped to one event.
   * @param {K} [event] - If provided, only clear that event; otherwise clear all.
   * @since 0.1.2
   */
  clear<K extends keyof E>(event?: K): void {
    if (event === undefined) {
      for (const k of Object.keys(this.listeners) as (keyof E)[]) {
        this.listeners[k] = [];
      }
      return;
    }
    const list = this.listeners[event];
    if (list) list.length = 0;
  }

  /**
   * @brief Number of handlers currently registered for an event.
   * @param {K} event - Event key.
   * @return {number} Listener count.
   * @since 0.1.2
   */
  listenerCount<K extends keyof E>(event: K): number {
    return this.listeners[event]?.length ?? 0;
  }
}

/**
 * @brief Factory creating a fresh EventBus bound to an event map type.
 * @return {EventBus<E>} New bus instance.
 * @since 0.1.2
 */
export function createEventBus<E extends Record<string, unknown> = DefaultEventMap>(): EventBus<E> {
  return new EventBus<E>();
}