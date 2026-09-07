/**
 * @fileoverview Critic registry — metadata for all registered critics. @since 0.2.6
 * @package zhi
 */
import type { CriticDescriptor } from './types';

/** @brief Registry of all critic descriptors. @since 0.2.6 */
export const CRITIC_REGISTRY: CriticDescriptor[] = [
  {
    id: 'architecture',
    name: 'Architecture',
    severity: 'error',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'todo',
    name: 'TODO/FIXME',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'style',
    name: 'Style',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'sloc',
    name: 'SLOC Limits',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'security',
    name: 'Security',
    severity: 'error',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'privacy',
    name: 'Privacy',
    severity: 'error',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'perf',
    name: 'Performance',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'maintainability',
    name: 'Maintainability',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'imports',
    name: 'Imports',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'doc',
    name: 'Documentation',
    severity: 'info',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'license',
    name: 'License',
    severity: 'info',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'secrets',
    name: 'Secrets',
    severity: 'error',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'complexity',
    name: 'Complexity',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'duplication',
    name: 'Duplication',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'consistency',
    name: 'Consistency',
    severity: 'info',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'testing',
    name: 'Testing',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'concurrency',
    name: 'Concurrency',
    severity: 'error',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'api-safety',
    name: 'API Safety',
    severity: 'error',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'data-privacy',
    name: 'Data Privacy',
    severity: 'error',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'cost',
    name: 'Cost',
    severity: 'info',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'data-integrity',
    name: 'Data Integrity',
    severity: 'error',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'dependency',
    name: 'Dependency',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
  {
    id: 'configuration',
    name: 'Configuration',
    severity: 'warn',
    check: () => ({ findings: [], score: 1, durationMs: 0 }),
  },
];

/** @brief Look up a critic descriptor by id. @since 0.2.6 */
export function getCriticDescriptor(id: string): CriticDescriptor | undefined {
  return CRITIC_REGISTRY.find((c) => c.id === id);
}
