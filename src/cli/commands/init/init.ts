/**
 * @fileoverview Init command — project scaffolding. @since 0.2.6
 * @package zhi
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** @brief Init options. @since 0.2.6 */
export interface InitOpts {
  name?: string;
  force?: boolean;
}

/** @brief Init result. @since 0.2.6 */
export interface InitResult {
  ok: boolean;
  created: string[];
  message: string;
}

/** @brief Scaffold a new Zhi project. @since 0.2.6 */
export async function init(opts: InitOpts = {}): Promise<InitResult> {
  const name = opts.name ?? 'zhi-project';
  const created: string[] = [];
  const dirs = ['.zhi', 'docs', 'src', 'engine', 'native'];
  for (const d of dirs) {
    await mkdir(join(process.cwd(), d), { recursive: true });
    created.push(d);
  }
  const config = `name: ${name}\nmaturity: experimental\nversion: 0.2.6\n`;
  await writeFile(join(process.cwd(), '.zhi', 'config.yaml'), config);
  created.push('.zhi/config.yaml');
  const agents = `# AGENTS.md — ${name}\n\nEngineering standards for ${name}.\n`;
  await writeFile(join(process.cwd(), 'AGENTS.md'), agents);
  created.push('AGENTS.md');
  return { ok: true, created, message: `Initialized ${name}` };
}
