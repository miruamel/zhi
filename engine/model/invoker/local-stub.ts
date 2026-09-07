/**
 * @fileoverview Local stub invoker — deterministic mock for testing and offline use. @since 0.2.6
 * @package zhi
 */
import type { ModelInvoker } from './types';

/** @brief Local stub options. @since 0.2.6 */
export interface LocalStubOptions {
  defaultResponse?: string;
  latencyMs?: number;
  failRate?: number;
}

/** @brief Local stub invoker. @since 0.1.1 */
export class LocalStubInvoker implements ModelInvoker {
  readonly name = 'local';
  private readonly latencyMs: number;
  private readonly failRate: number;
  private callCount = 0;

  constructor(options: LocalStubOptions = {}) {
    this.latencyMs = options.latencyMs ?? 0;
    this.failRate = options.failRate ?? 0;
  }

  /** @brief Invoke with deterministic mock response. @since 0.1.1 */
  async invoke(prompt: string): Promise<string> {
    this.callCount++;
    if (this.latencyMs > 0) {
      await new Promise((r) => setTimeout(r, this.latencyMs));
    }
    if (this.failRate > 0 && Math.random() < this.failRate) {
      throw new Error('local stub: simulated failure');
    }
    return `// [local-stub] OK\n/** @brief Generated stub for: ${prompt} */\n`;
  }

  /** @brief Call count. @since 0.2.6 */
  get calls(): number {
    return this.callCount;
  }

  /** @brief Reset call count. @since 0.2.6 */
  reset(): void {
    this.callCount = 0;
  }
}

/** @brief Create a local stub invoker. @since 0.2.6 */
export function createLocalStub(options?: LocalStubOptions): LocalStubInvoker {
  return new LocalStubInvoker(options);
}
