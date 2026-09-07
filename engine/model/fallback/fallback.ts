/**
 * @fileoverview Model fallback chain — retries with alternate providers. @since 0.2.6
 * @package zhi
 */
import type { ModelDescriptor } from '../types';

export interface FallbackDecision {
  original: string;
  fallback: string | null;
  reason: string;
  attempts: number;
}

export class FallbackChain {
  private chain: string[];
  private current = 0;

  constructor(chain: string[]) {
    this.chain = [...chain];
  }

  currentModel(): string {
    return this.chain[this.current] ?? this.chain[0];
  }

  next(): string | null {
    if (this.current >= this.chain.length - 1) return null;
    this.current++;
    return this.chain[this.current];
  }

  reset(): void {
    this.current = 0;
  }

  getChain(): string[] {
    return [...this.chain];
  }
}

export function createFallbackChain(models: string[]): FallbackChain {
  return new FallbackChain(models);
}

export function selectFallback(models: ModelDescriptor[], failed: string): FallbackDecision {
  const idx = models.findIndex((m) => m.id === failed);
  const next = models[idx + 1];
  return { original: failed, fallback: next?.id ?? null, reason: 'provider_error', attempts: 1 };
}
