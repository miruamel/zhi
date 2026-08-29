/** @brief Generator stub kode dari spesifikasi. @since 0.1.0 */

/** @brief Spesifikasi generasi. @since 0.1.0 */
export interface GenSpec {
  /** @brief Nama simbol. */
  name: string;
  /** @brief Jenis simbol. */
  kind: 'function' | 'class';
}

/** @brief Generate stub kode dari spec.
 * @param {GenSpec} spec - spesifikasi.
 * @return {string} kode stub.
 * @see docs/design/build.md
 * @since 0.1.0 */
export function generate(spec: GenSpec): string {
  if (spec.kind === 'function') {
    return `export function ${spec.name}(): void {\n  // TODO\n}\n`;
  }
  return `export class ${spec.name} {\n  // TODO\n}\n`;
}
