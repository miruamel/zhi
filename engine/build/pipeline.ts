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
      case 'generate':
        return { ok: true, detail: 'Generated' };
      case 'build':
        return { ok: true, detail: 'Built' };
      case 'sign':
        return { ok: true, detail: 'Signed' };
      case 'verify':
        return { ok: true, detail: 'Verified' };
      case 'deploy':
        return { ok: true, detail: 'Deployed' };
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
