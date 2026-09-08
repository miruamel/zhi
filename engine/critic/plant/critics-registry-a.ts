/** @fileoverview Critic plant — registry chunk A (accessibility→duplication). @since 0.1.10 @package zhi */
import type { CriticDescriptor } from './types/types';

const stub = (): CriticDescriptor['check'] => () => ({ findings: [], score: 100, durationMs: 0 });

/** @brief Registry chunk A (accessibility–duplication). @since 0.1.10 */
export const CRITIC_REGISTRY_A: CriticDescriptor[] = [
  { id: 'accessibility', name: 'Accessibility', severity: 'warn', check: stub() },
  { id: 'api-safety', name: 'API Safety', severity: 'error', check: stub() },
  { id: 'architecture', name: 'Architecture', severity: 'warn', check: stub() },
  { id: 'complexity', name: 'Complexity', severity: 'warn', check: stub() },
  { id: 'concurrency', name: 'Concurrency', severity: 'error', check: stub() },
  { id: 'consistency', name: 'Consistency', severity: 'warn', check: stub() },
  { id: 'cost', name: 'Cost', severity: 'info', check: stub() },
  { id: 'data-privacy', name: 'Data Privacy', severity: 'error', check: stub() },
  { id: 'doc', name: 'Documentation', severity: 'info', check: stub() },
  { id: 'duplication', name: 'Duplication', severity: 'warn', check: stub() },
];
