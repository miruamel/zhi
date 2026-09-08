/** @fileoverview Critic plant — registry chunk B (imports→concurrency-2). @since 0.1.10 @package zhi */
import type { CriticDescriptor } from '../types';

const stub = (): CriticDescriptor['check'] => () => ({ findings: [], score: 100, durationMs: 0 });

/** @brief Registry chunk B (imports–concurrency-2). @since 0.1.10 */
export const CRITIC_REGISTRY_B: CriticDescriptor[] = [
  { id: 'imports', name: 'Imports', severity: 'warn', check: stub() },
  { id: 'license', name: 'License', severity: 'info', check: stub() },
  { id: 'maintainability', name: 'Maintainability', severity: 'warn', check: stub() },
  { id: 'perf', name: 'Performance', severity: 'warn', check: stub() },
  { id: 'privacy', name: 'Privacy', severity: 'error', check: stub() },
  { id: 'sloc', name: 'SLOC', severity: 'info', check: stub() },
  { id: 'style', name: 'Style', severity: 'info', check: stub() },
  { id: 'test', name: 'Testing', severity: 'warn', check: stub() },
  { id: 'todo', name: 'TODO', severity: 'info', check: stub() },
  { id: 'security', name: 'Security', severity: 'error', check: stub() },
  { id: 'accessibility-2', name: 'Accessibility 2', severity: 'warn', check: stub() },
  { id: 'api-safety-2', name: 'API Safety 2', severity: 'error', check: stub() },
  { id: 'architecture-2', name: 'Architecture 2', severity: 'warn', check: stub() },
  { id: 'complexity-2', name: 'Complexity 2', severity: 'warn', check: stub() },
  { id: 'concurrency-2', name: 'Concurrency 2', severity: 'error', check: stub() },
];