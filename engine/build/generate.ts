/** @brief Generator modul domain: deterministik atau model-driven via ModelInvoker. @since 0.1.0 */
import type { ModelInvoker } from '../model/invoker';

/** @brief Satu file hasil scaffold. @since 0.1.0 */
export interface ScaffoldFile {
  /** @brief Path relatif file. */
  path: string;
  /** @brief Isi file. */
  content: string;
}

/** @brief Spesifikasi generasi modul domain. @since 0.1.0 */
export interface GenSpec {
  /** @brief Nama domain (snake/kebab). */
  domain: string;
}

/** @brief Layer fractal wajib per AGENTS.md. @since 0.1.0 */
const LAYERS = ['handlers', 'services', 'utils', 'constants'] as const;

/** @brief Scaffold modul domain fractal (belum ditulis ke disk).
 * @param {GenSpec} spec - spesifikasi domain.
 * @param {ModelInvoker} [invoker] - bila ada, isi file dihasilkan via model; else deterministik @brief.
 * @return {Promise<ScaffoldFile[]>} daftar file hasil scaffold.
 * @see docs/design/build.md
 * @since 0.1.0 */
export async function generate(spec: GenSpec, invoker?: ModelInvoker): Promise<ScaffoldFile[]> {
  const d = spec.domain;
  const files: ScaffoldFile[] = await Promise.all(
    LAYERS.map(async (layer) => ({
      path: `engine/${d}/${layer}/index.ts`,
      content: invoker
        ? await invoker.invoke(`Generate ${layer} module for domain ${d} (AGENTS.md fractal).`)
        : `/** @brief ${d} ${layer}. @since 0.1.0 */\n`,
    })),
  );
  files.push({
    path: `engine/${d}/index.ts`,
    content: invoker
      ? await invoker.invoke(`Generate barrel index for domain ${d}.`)
      : `/** @brief Modul ${d}. @since 0.1.0 */\n`,
  });
  return files;
}
/** @brief Stream generasi modul domain (token plan). Fallback batch bila invoker tak stream.
 * @param {GenSpec} spec - spesifikasi domain.
 * @param {ModelInvoker} [invoker] - bila ada & stream, alirkan token; else batch.
 * @return {AsyncGenerator<string>} token plan (atau satu chunk batch). @since 0.1.1 */
export async function* generateStream(
  spec: GenSpec,
  invoker?: ModelInvoker,
): AsyncGenerator<string> {
  const d = spec.domain;
  const prompts = [
    ...LAYERS.map((l) => `Generate ${l} module for domain ${d} (AGENTS.md fractal).`),
    `Generate barrel index for domain ${d}.`,
  ];
  if (!invoker?.stream) {
    const files = await generate(spec, invoker);
    yield files.map((f) => `// ${f.path}\n${f.content}`).join('\n');
    return;
  }
  for (const p of prompts) yield* invoker.stream(p);
}
