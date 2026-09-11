/**
 * @fileoverview TUI store — observable in-memory state with critic actions.
 * Minimal observable store backing StoreActions critic subset. Other actions
 * are stubbed until their consumers exist (M5 extensibility, ADR-017).
 * @since 0.1.11 @updated 0.1.15
 * @package zhi
 */
import type { CriticItem } from './types/entities/dag';

/** @brief Store listener. @since 0.1.15 */
type Listener = () => void;

/** @brief Minimal observable store state. @since 0.1.15 */
interface StoreState {
  critics: CriticItem[];
  criticsFilter: string;
  showFixedCritics: boolean;
}

const state: StoreState = {
  critics: [],
  criticsFilter: '',
  showFixedCritics: false,
};

const listeners: Set<Listener> = new Set();

/** @brief Subscribe to store changes. @since 0.1.15 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** @brief Notify all listeners. @since 0.1.15 */
function notify(): void {
  for (const l of listeners) l();
}

/** @brief Get current critic items. @since 0.1.15 */
export function getCritics(): CriticItem[] {
  return state.critics;
}

/** @brief Get current critics filter. @since 0.1.15 */
export function getCriticsFilter(): string {
  return state.criticsFilter;
}

/** @brief Get whether fixed critics are shown. @since 0.1.15 */
export function getShowFixedCritics(): boolean {
  return state.showFixedCritics;
}

/** @brief Add a critic item. @since 0.1.11 */
export function addCritic(critic: CriticItem): void {
  state.critics = [...state.critics, critic];
  notify();
}

/** @brief Remove a critic item by id. @since 0.1.11 */
export function removeCritic(id: string): void {
  const before = state.critics.length;
  state.critics = state.critics.filter((c) => c.id !== id);
  if (state.critics.length !== before) notify();
}

/** @brief Mark a critic item as fixed. @since 0.1.11 */
export function fixCritic(id: string): void {
  let changed = false;
  state.critics = state.critics.map((c) => {
    if (c.id === id && !c.fixed) {
      changed = true;
      return { ...c, fixed: true };
    }
    return c;
  });
  if (changed) notify();
}

/** @brief Set the critics filter query. @since 0.1.11 */
export function setCriticsFilter(filter: string): void {
  if (state.criticsFilter === filter) return;
  state.criticsFilter = filter;
  notify();
}

/** @brief Toggle visibility of fixed critics. @since 0.1.11 */
export function toggleShowFixedCritics(): void {
  state.showFixedCritics = !state.showFixedCritics;
  notify();
}

/** @brief Reset store to empty state. @since 0.1.15 */
export function reset(): void {
  state.critics = [];
  state.criticsFilter = '';
  state.showFixedCritics = false;
  notify();
}
