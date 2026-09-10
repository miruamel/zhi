/**
 * @fileoverview Build scaffold — domain module generator + stream. @since 0.1.10
 * @package zhi
 */
import type { ModelInvoker } from '../../model/invoker';

/** @brief Scaffold file. @since 0.1.10 */
export interface ScaffoldFile {
  path: string;
  content: string;
}

/** @brief Generate input. @since 0.1.10 */
export interface GenerateInput {
  /** @brief Domain name (optional, defaults to 'app'). */
  domain?: string;
  /** @brief Entry file path (optional, for pipeline integration). */
  entry?: string;
  /** @brief Output directory (optional, for pipeline integration). */
  outDir?: string;
}

/** @brief Generate output. @since 0.1.10 */
export type GenerateOutput = ScaffoldFile[];

/**
 * @brief Scaffold a fractal domain module (handlers/services/utils/constants + barrel).
 * @param {GenerateInput} input - domain name.
 * @param {ModelInvoker} [invoker] - optional model invoker for content generation.
 * @return {ScaffoldFile[]} generated files.
 * @since 0.1.10
 */
export async function generate(
  input: GenerateInput,
  invoker?: ModelInvoker,
): Promise<ScaffoldFile[]> {
  const domain = input.domain ?? 'app';
  const files: ScaffoldFile[] = [
    {
      path: `engine/${domain}/index.ts`,
      content: `/**\n * @brief ${domain} domain barrel. @since 0.1.10\n * @package zhi\n */\nexport * from './handlers';\nexport * from './services';\nexport * from './utils';\nexport * from './constants';\n`,
    },
    {
      path: `engine/${domain}/handlers/index.ts`,
      content: `/**\n * @brief ${domain} handlers barrel. @since 0.1.10\n * @package zhi\n */\n`,
    },
    {
      path: `engine/${domain}/services/index.ts`,
      content: `/**\n * @brief ${domain} services barrel. @since 0.1.10\n * @package zhi\n */\n`,
    },
    {
      path: `engine/${domain}/utils/index.ts`,
      content: `/**\n * @brief ${domain} utils barrel. @since 0.1.10\n * @package zhi\n */\n`,
    },
    {
      path: `engine/${domain}/constants/index.ts`,
      content: `/**\n * @brief ${domain} constants barrel. @since 0.1.10\n * @package zhi\n */\n`,
    },
  ];
  if (invoker) {
    for (const f of files) {
      const result = await invoker.invoke(f.content);
      f.content = result;
    }
  }
  return files;
}

/**
 * @brief Generate stream — yields one stream per scaffold file via invoker.stream.
 * @param {GenerateInput} input - domain name.
 * @param {ModelInvoker} invoker - model invoker.
 * @return {AsyncGenerator<string>} stream of generated content.
 * @since 0.1.10
 */
export async function* generateStream(
  input: GenerateInput,
  invoker: ModelInvoker,
): AsyncGenerator<string> {
  const files = await generate(input);
  if (invoker.stream) {
    for (const f of files) {
      const stream = invoker.stream(f.content);
      for await (const chunk of stream) {
        yield chunk;
      }
    }
  } else {
    yield files.map((f) => f.path).join('\n');
  }
}
