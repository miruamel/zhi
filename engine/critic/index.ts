/**
 * @fileoverview Critic engine — public API surface.
 * @since 0.2.6
 * @package zhi
 */
import { CriticEngine, type CriticOptions, type AggregatedCritique } from './engine';
import type { Critique, CritiqueSeverity, CritiqueCategory } from './types';

/** @brief Create and run a critic. @since 0.2.6 */
export function runCritic(
  input: { files: Array<{ path: string; content: string }> },
  options?: CriticOptions,
): AggregatedCritique {
  const engine = new CriticEngine();
  return engine.run(input, options);
}

/** @brief Create a critic engine. @since 0.2.6 */
export { CriticEngine, type CriticOptions, type AggregatedCritique };

/** @brief Critic types. @since 0.2.6 */
export type { Critique, CritiqueSeverity, CritiqueCategory };
