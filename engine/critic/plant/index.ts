/**
 * @fileoverview Critic plant barrel. @since 0.1.9
 * @package zhi
 */
import { CRITIC_REGISTRY_A } from './critics-registry/critics-registry-a';
import { CRITIC_REGISTRY_B } from './critics-registry/critics-registry-b';
import type { CriticDescriptor } from './types';

export {
  plantCritics,
  composeCritiques,
  type CriticReport,
  type PlantOptions,
  type CriticFinding,
  type CriticInput,
  type CriticOutput,
  type CriticSeverity,
} from './compose';

export type { CriticDescriptor } from './types';

/** @brief Combined critic registry. @since 0.1.10 */
export const CRITIC_REGISTRY: CriticDescriptor[] = [...CRITIC_REGISTRY_A, ...CRITIC_REGISTRY_B];

/** @brief Get critic descriptor by id. @since 0.1.10 */
export function getCriticDescriptor(id: string): CriticDescriptor | undefined {
  return CRITIC_REGISTRY.find((c) => c.id === id);
}