/**
 * @brief Shared cross-cutting utility types for the TUI core layer.
 *
 * Only types that are genuinely reused across multiple modules belong here.
 * One type per file would be over-engineered for simple utility aliases.
 * @since 0.2.0
 */

/** @brief Handle for a scheduled timeout (setTimeout return value). @since 0.2.0 */
export type TimeoutHandle = ReturnType<typeof setTimeout>;
