/**
 * @fileoverview Model types — provider, pricing, capability. @since 0.2.6
 * @package zhi
 */
export type ModelProvider =
  'openai' | 'anthropic' | 'google' | 'mistral' | 'groq' | 'cohere' | 'local';

export interface ModelPricing {
  inputPerMToken: number;
  outputPerMToken: number;
  cachedInputPerMToken?: number;
}

export interface ModelCapability {
  name: string;
  description: string;
  enabled: boolean;
}

export interface ModelDescriptor {
  id: string;
  provider: ModelProvider;
  name: string;
  contextWindow: number;
  maxOutput: number;
  pricing: ModelPricing;
  capabilities: ModelCapability[];
  fallback?: string;
  deprecated?: boolean;
  releaseDate?: string;
}

export interface ModelConfig {
  defaultModel: string;
  fallbackChain: string[];
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  retries: number;
}
