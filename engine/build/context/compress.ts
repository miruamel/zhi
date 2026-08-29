/** @brief Entri konteks loop yang bisa dikompres. @since 0.1.0 */
export interface ContextEntry {
  /** @brief Kunci unik entri. */
  key: string;
  /** @brief Bobot prioritas (besar = dipertahankan dulu). */
  weight: number;
  /** @brief Teks entri. */
  text: string;
}

/** @brief Konteks loop yang dikompres agar muat budget karakter. @since 0.1.0 */
export interface BuildContext {
  /** @brief Entri konteks (urutan bebas). */
  entries: ContextEntry[];
  /** @brief Budget karakter total (>=0). */
  budget: number;
}

/** @brief Kompres konteks: pertahankan entri bobot-tinggi dalam budget.
 * @param {BuildContext} ctx - konteks sebelum kompresi.
 * @return {BuildContext} konteks terkompresi (total karakter <= budget).
 * @see docs/design/build.md (compress: jaga konteks loop panjang)
 * @since 0.1.0 */
// ponytail: urutan asli tidak dipertahankan, hanya prioritas bobot; bila urutan
// stateful dibutuhkan, ganti sort dengan stable-keep-by-recency.
export function compress(ctx: BuildContext): BuildContext {
  const budget = Math.max(0, Math.floor(ctx.budget));
  const ordered = [...ctx.entries].sort((a, b) => b.weight - a.weight);
  const out: ContextEntry[] = [];
  let used = 0;
  for (const e of ordered) {
    const len = e.text.length;
    if (used + len <= budget) {
      out.push(e);
      used += len;
    } else if (used < budget) {
      const room = budget - used;
      out.push({ key: e.key, weight: e.weight, text: e.text.slice(0, room) });
      used = budget;
      break;
    } else {
      break;
    }
  }
  return { entries: out, budget };
}
