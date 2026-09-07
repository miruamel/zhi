/**
 * @fileoverview Critic engine — aggregates, composes, and routes critiques.
 * @since 0.2.6
 * @package zhi
 */
import type { Critique, CritiqueSeverity, CritiqueCategory } from './types';

/** @brief Critic options. @since 0.2.6 */
export interface CriticOptions {
  minSeverity?: CritiqueSeverity;
  categories?: CritiqueCategory[];
  maxFindings?: number;
}

/** @brief Aggregated critique result. @since 0.2.6 */
export interface AggregatedCritique {
  critiques: Critique[];
  total: number;
  bySeverity: Record<CritiqueSeverity, number>;
  byCategory: Record<CritiqueCategory, number>;
  passed: boolean;
  blockers: string[];
  summary: string;
}

/** @brief Critic engine — runs all registered critics. @since 0.2.6 */
export class CriticEngine {
  private readonly critics: Array<{
    name: string;
    run: (input: { files: Array<{ path: string; content: string }> }) => Critique[];
  }>;

  constructor() {
    this.critics = [];
  }

  /** @brief Register a critic. @since 0.2.6 */
  register(
    name: string,
    run: (input: { files: Array<{ path: string; content: string }> }) => Critique[],
  ): void {
    this.critics.push({ name, run });
  }

  /** @brief Run all critics and aggregate results. @since 0.2.6 */
  run(
    input: { files: Array<{ path: string; content: string }> },
    options?: CriticOptions,
  ): AggregatedCritique {
    const minSeverity = options?.minSeverity ?? 'info';
    const severityOrder: CritiqueSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
    const minIndex = severityOrder.indexOf(minSeverity);

    let all: Critique[] = [];
    for (const critic of this.critics) {
      try {
        const results = critic.run(input);
        all.push(...results);
      } catch (err) {
        all.push({
          id: `critic-error-${critic.name}`,
          severity: 'high',
          category: 'consistency',
          message: `Critic ${critic.name} failed: ${err instanceof Error ? err.message : String(err)}`,
          file: '',
          line: 0,
        });
      }
    }

    if (options?.categories) {
      all = all.filter((c) => options.categories!.includes(c.category));
    }
    all = all.filter((c) => severityOrder.indexOf(c.severity) <= minIndex);
    if (options?.maxFindings) all = all.slice(0, options.maxFindings);

    const bySeverity: Record<CritiqueSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    const byCategory: Record<CritiqueCategory, number> = {
      security: 0,
      performance: 0,
      architecture: 0,
      consistency: 0,
      maintainability: 0,
      correctness: 0,
    };
    const blockers: string[] = [];

    for (const c of all) {
      bySeverity[c.severity]++;
      byCategory[c.category]++;
      if (c.severity === 'critical' || c.severity === 'high') blockers.push(c.message);
    }

    const passed = blockers.length === 0;
    const summary = `${all.length} findings: ${bySeverity.critical} critical, ${bySeverity.high} high, ${bySeverity.medium} medium, ${bySeverity.low} low, ${bySeverity.info} info`;

    return { critiques: all, total: all.length, bySeverity, byCategory, passed, blockers, summary };
  }
}

/** @brief Create a critic engine. @since 0.2.6 */
export function createCriticEngine(): CriticEngine {
  return new CriticEngine();
}
