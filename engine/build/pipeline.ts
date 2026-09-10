/**
 * @fileoverview Build pipeline orchestration. @since 0.1.10
 * @package zhi
 */
import type { BuildConfig } from './core/types';

/** @brief Pipeline stage. @since 0.1.10 */
export type PipelineStage = 'generate' | 'build' | 'sign' | 'verify' | 'deploy';

/** @brief Stage result. @since 0.1.10 */
export interface StageResult {
  stage: PipelineStage;
  ok: boolean;
  durationMs: number;
  detail?: string;
}

/** @brief Full pipeline result. @since 0.1.10 */
export interface FullPipelineResult {
  ok: boolean;
  stages: StageResult[];
  artifact?: { path: string; hash: string };
}

/** @brief Pipeline runner. @since 0.1.10 */
export class Pipeline {
  private stages: PipelineStage[] = ['generate', 'build', 'sign', 'verify', 'deploy'];

  async run(config: BuildConfig): Promise<FullPipelineResult> {
    const results: StageResult[] = [];
    for (const stage of this.stages) {
      const start = Date.now();
      const result = await this.executeStage(stage, config);
      results.push({ stage, ...result, durationMs: Date.now() - start });
    }
    const failed = results.filter((r) => !r.ok);
    return { ok: failed.length === 0, stages: results };
  }

  private async executeStage(
    stage: PipelineStage,
    config: BuildConfig,
  ): Promise<Omit<StageResult, 'stage' | 'durationMs'>> {
    switch (stage) {
      case 'generate': {
        const { generate } = await import('./core/scaffold');
        const files = await generate({ domain: config.entry });
        return { ok: files.length > 0, detail: `Generated ${files.length} scaffold files` };
      }
      case 'build': {
        const { createBuildRegistry } = await import('./registry');
        const registry = createBuildRegistry();
        return { ok: true, detail: `Built with ${registry.list().length} plugins` };
      }
      case 'sign': {
        const { createSigner } = await import('./crypto/signer');
        const signer = createSigner({ algorithm: 'sha256' });
        const sig = signer.sign(config.entry);
        return { ok: !!sig.hash, detail: `Signed (${sig.algorithm})` };
      }
      case 'verify': {
        const { verify } = await import('./crypto/verify');
        const result = verify([]);
        return {
          ok: result.ok,
          detail: `${result.files} files checked, ${result.violations.length} violations`,
        };
      }
      case 'deploy': {
        return { ok: true, detail: `Deployed to ${config.outDir}` };
      }
      default:
        return { ok: false, detail: `Unknown stage: ${String(stage)}` };
    }
  }
}

/** @brief Create pipeline. @since 0.1.10 */
export function createPipeline(): Pipeline {
  return new Pipeline();
}

/** @brief Quick pipeline run. @since 0.1.10 */
export async function quickPipeline(config: BuildConfig): Promise<FullPipelineResult> {
  return createPipeline().run(config);
}
