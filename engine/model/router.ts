/** @brief Model router: pilih backend + tier per task. @since 0.1.0 */

/** @brief Jenis task yang dirutekan ke LLM. @since 0.1.0 */
export type TaskKind = 'generate' | 'critique' | 'verify' | 'format' | 'classify' | 'tag';

/** @brief Tier komputasi (berat/ringan/mikro). @since 0.1.0 */
export type Tier = 'heavy' | 'light' | 'micro';

/** @brief Backend terpilih untuk sebuah task. @since 0.1.0 */
export interface Backend {
  /** @brief Tier komputasi. */
  tier: Tier;
  /** @brief Nama model (class, bukan secret). */
  model: string;
  /** @brief Endpoint logical: 9router | omp | local. */
  endpoint: string;
}

/** @brief Route task ke backend + tier.
 * @param {TaskKind} kind - jenis task.
 * @return {Backend} backend terpilih.
 * @see docs/design/model.md
 * @since 0.1.0 */
export function route(kind: TaskKind): Backend {
  switch (kind) {
    case 'generate':
      return { tier: 'heavy', model: 'gpt-4-class', endpoint: '9router' };
    case 'critique':
      return { tier: 'heavy', model: 'claude-class', endpoint: '9router' };
    case 'verify':
    case 'format':
      return { tier: 'light', model: 'haiku-class', endpoint: 'omp' };
    case 'classify':
    case 'tag':
      return { tier: 'micro', model: 'phi-3', endpoint: 'local' };
  }
}
