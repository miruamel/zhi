/**
 * @fileoverview Critic plant barrel. @since 0.2.6
 * @package zhi
 */
export { plantCritics, type CriticReport, type PlantOptions } from './compose';
export { CRITIC_REGISTRY, getCriticDescriptor } from './critics';
export type {
  CriticDescriptor,
  CriticFinding,
  CriticInput,
  CriticOutput,
  CriticSeverity,
} from './types';
