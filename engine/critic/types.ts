/**
 * @fileoverview Critic types and interfaces.
 * @since 0.2.6
 * @package zhi
 */

/** @brief Critique severity levels. @since 0.2.6 */
export type CritiqueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/** @brief Critique categories. @since 0.2.6 */
export type CritiqueCategory =
  'security' | 'performance' | 'architecture' | 'consistency' | 'maintainability' | 'correctness';

/** @brief A single critique finding. @since 0.2.6 */
export interface Critique {
  id: string;
  severity: CritiqueSeverity;
  category: CritiqueCategory;
  message: string;
  file: string;
  line: number;
  suggestion?: string;
  rule?: string;
}

/** @brief Critic configuration. @since 0.2.6 */
export interface CriticConfig {
  enabled: boolean;
  severityThreshold: CritiqueSeverity;
  categories: CritiqueCategory[];
  maxFindings: number;
  ignorePatterns: string[];
}

/** @brief Default critic configuration. @since 0.2.6 */
export const DEFAULT_CRITIC_CONFIG: CriticConfig = {
  enabled: true,
  severityThreshold: 'info',
  categories: [
    'security',
    'performance',
    'architecture',
    'consistency',
    'maintainability',
    'correctness',
  ],
  maxFindings: 100,
  ignorePatterns: ['node_modules', '.git', 'dist', 'out'],
};

/** @brief Create a critique finding. @since 0.2.6 */
export function createCritique(
  severity: CritiqueSeverity,
  category: CritiqueCategory,
  message: string,
  file: string,
  line: number,
  suggestion?: string,
  rule?: string,
): Critique {
  return {
    id: `${category}-${file}-${line}-${Date.now()}`,
    severity,
    category,
    message,
    file,
    line,
    suggestion,
    rule,
  };
}

/** @brief Check if severity is at or above threshold. @since 0.2.6 */
export function severityAtLeast(severity: CritiqueSeverity, threshold: CritiqueSeverity): boolean {
  const order: CritiqueSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  return order.indexOf(severity) <= order.indexOf(threshold);
}

/** @brief Get severity weight for scoring. @since 0.2.6 */
export function severityWeight(severity: CritiqueSeverity): number {
  switch (severity) {
    case 'critical':
      return 10;
    case 'high':
      return 5;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    case 'info':
      return 0;
  }
}

/** @brief Get category label. @since 0.2.6 */
export function categoryLabel(category: CritiqueCategory): string {
  return category;
}

/** @brief Get severity label. @since 0.2.6 */
export function severityLabel(severity: CritiqueSeverity): string {
  return severity;
}
