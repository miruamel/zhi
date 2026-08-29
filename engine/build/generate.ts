/** @brief Generator kode deterministik (tanpa LLM) dari spesifikasi modul. @since 0.1.0 */

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
 * @return {ScaffoldFile[]} daftar file hasil scaffold.
 * @see docs/design/build.md
 * @since 0.1.0 */
export function generate(spec: GenSpec): ScaffoldFile[] {
  const d = spec.domain;
  const files: ScaffoldFile[] = LAYERS.map((layer) => ({
    path: `engine/${d}/${layer}/index.ts`,
    content: `/** @brief ${d} ${layer}. @since 0.1.0 */\n`,
  }));
  files.push({
    path: `engine/${d}/index.ts`,
    content: `/** @brief Modul ${d}. @since 0.1.0 */\n`,
  });
  return files;
}
