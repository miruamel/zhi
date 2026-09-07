/**
 * @fileoverview Model router — selects invoker based on task type. @since 0.2.6
 * @package zhi
 */
import type { ModelRequest, ModelResponse, ModelInvoker } from './invoker/types';
import type { TaskKind } from './pricing';

/** @brief Router options. @since 0.2.6 */
export interface RouterOptions {
  defaultInvoker?: string;
  fallbackInvoker?: string;
  maxRetries?: number;
}

/** @brief Model router. @since 0.2.6 */
export class ModelRouter {
  private invokers: Map<string, ModelInvoker> = new Map();
  private readonly defaultInvoker: string;
  private readonly fallbackInvoker?: string;
  private readonly maxRetries: number;

  constructor(invokers: ModelInvoker[], options: RouterOptions = {}) {
    for (const inv of invokers) {
      this.invokers.set(inv.name, inv);
    }
    this.defaultInvoker = options.defaultInvoker ?? invokers[0]?.name ?? 'local';
    this.fallbackInvoker = options.fallbackInvoker;
    this.maxRetries = options.maxRetries ?? 2;
  }

  /** @brief Register an invoker. @since 0.2.6 */
  register(invoker: ModelInvoker): void {
    this.invokers.set(invoker.name, invoker);
  }

  /** @brief Get invoker by name. @since 0.2.6 */
  getInvoker(name: string): ModelInvoker | undefined {
    return this.invokers.get(name);
  }

  /** @brief Classify task into kind. @since 0.2.6 */
  classifyTask(prompt: string, _context?: string): TaskKind {
    const lower = prompt.toLowerCase();
    if (/(review|audit|critique|check)/i.test(lower)) return 'review';
    if (/(plan|roadmap|design|architecture)/i.test(lower)) return 'plan';
    if (/(embed|vector|similarity)/i.test(lower)) return 'embed';
    if (/(classify|categorize|tag)/i.test(lower)) return 'classify';
    if (/(write|implement|create|build|generate|code)/i.test(lower)) return 'code';
    return 'chat';
  }

  /** @brief Route a request to the best invoker. @since 0.2.6 */
  async route(request: ModelRequest): Promise<ModelResponse> {
    const kind = request.taskKind ?? this.classifyTask(request.prompt);
    const invoker = this.selectInvoker(kind);
    let lastError: Error | undefined;
    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        const text = await invoker.invoke(request.prompt);
        return { text, tokens: 0, cost: 0, model: invoker.name, finishReason: 'stop' };
      } catch (e) {
        lastError = e as Error;
        if (i < this.maxRetries && this.fallbackInvoker) {
          const fb = this.invokers.get(this.fallbackInvoker);
          if (fb) {
            try {
              const text = await fb.invoke(request.prompt);
              return { text, tokens: 0, cost: 0, model: fb.name, finishReason: 'stop' };
            } catch {
              /* continue */
            }
          }
        }
      }
    }
    throw lastError ?? new Error('router: no invoker available');
  }

  /** @brief Select invoker for task kind. @since 0.2.6 */
  private selectInvoker(kind: TaskKind): ModelInvoker {
    const preferred = this.invokers.get(kind) ?? this.invokers.get(this.defaultInvoker);
    if (preferred) return preferred;
    if (this.fallbackInvoker) {
      const fallback = this.invokers.get(this.fallbackInvoker);
      if (fallback) return fallback;
    }
    const any = this.invokers.values().next();
    if (any.value) return any.value;
    throw new Error('router: no invoker registered');
  }

  /** @brief List available invokers. @since 0.2.6 */
  listInvokers(): string[] {
    return [...this.invokers.keys()];
  }
}
export { route } from './pricing';
export type { TaskKind } from './pricing';
export function createRouter(invokers: ModelInvoker[], options?: RouterOptions): ModelRouter {
  return new ModelRouter(invokers, options);
}
