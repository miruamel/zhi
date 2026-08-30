/** @brief Composer plant: jalankan sloc + todo + imports + maintainability + architecture → Critique[]. @since 0.1.0 */
import type { Critique } from '../aggregate';
import { slocCritic, type FileRecord } from './sloc/critic';
import { todoCritic } from './todo/critic';
import { importsCritic } from './imports/critic';
import { maintainabilityCritic } from './maintainability/critic';
import { architectureCritic } from './architecture/critic';

/** @brief Jalankan semua critic plant pada kumpulan file.
 * @param {FileRecord[]} files - artefak yang diaudit.
 * @return {Critique[]} hasil tiap critic (siap di-aggregate).
 * @see docs/design/critic.md
 * @since 0.1.0 */
export function composeCritiques(files: FileRecord[]): Critique[] {
  return [slocCritic(files), todoCritic(files), importsCritic(files), maintainabilityCritic(files), architectureCritic(files)];
}
