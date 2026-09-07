/**
 * @fileoverview Model pricing + task routing. @since 0.2.6
 * @package zhi
 */
import type { ModelPricing } from './types';

export type TaskKind =
  | 'generate'
  | 'critique'
  | 'verify'
  | 'format'
  | 'classify'
  | 'tag'
  | 'review'
  | 'plan'
  | 'embed'
  | 'code'
  | 'chat';
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o': { inputPerMToken: 2.5, outputPerMToken: 10.0, cachedInputPerMToken: 1.25 },
  'gpt-4o-mini': { inputPerMToken: 0.15, outputPerMToken: 0.6, cachedInputPerMToken: 0.075 },
  'gpt-4-turbo': { inputPerMToken: 10.0, outputPerMToken: 30.0, cachedInputPerMToken: 5.0 },
  'claude-3-5-sonnet': { inputPerMToken: 3.0, outputPerMToken: 15.0, cachedInputPerMToken: 0.375 },
  'claude-3-opus': { inputPerMToken: 15.0, outputPerMToken: 75.0, cachedInputPerMToken: 1.875 },
  'claude-3-haiku': { inputPerMToken: 0.25, outputPerMToken: 1.25, cachedInputPerMToken: 0.03125 },
  'gemini-1.5-pro': { inputPerMToken: 1.25, outputPerMToken: 5.0, cachedInputPerMToken: 0.1875 },
  'gemini-1.5-flash': {
    inputPerMToken: 0.075,
    outputPerMToken: 0.3,
    cachedInputPerMToken: 0.01875,
  },
  'mistral-large': { inputPerMToken: 2.0, outputPerMToken: 6.0 },
  'llama-3-70b': { inputPerMToken: 0.0, outputPerMToken: 0.0 },
};

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  cachedTokens = 0,
): number {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) return 0;
  const nonCachedInput = Math.max(0, inputTokens - cachedTokens);
  return (
    (nonCachedInput * pricing.inputPerMToken +
      outputTokens * pricing.outputPerMToken +
      cachedTokens * (pricing.cachedInputPerMToken ?? pricing.inputPerMToken)) /
    1_000_000
  );
}

export function getPricing(modelId: string): ModelPricing | undefined {
  return MODEL_PRICING[modelId];
}

export function listPricing(): Record<string, ModelPricing> {
  return { ...MODEL_PRICING };
}

/** @brief Route task kind to model descriptor. @since 0.1.1 */
export function route(kind: TaskKind): { model: string; endpoint: string; tier: string } {
  switch (kind) {
    case 'generate':
    case 'critique':
      return { model: 'claude-sonnet', endpoint: 'cloud', tier: 'heavy' };
    case 'verify':
    case 'format':
      return { model: 'text-embedding-3', endpoint: 'cloud', tier: 'light' };
    case 'classify':
    case 'tag':
      return { model: 'local-stub', endpoint: 'local', tier: 'micro' };
    default:
      return { model: 'local-stub', endpoint: 'local', tier: 'micro' };
  }
}
