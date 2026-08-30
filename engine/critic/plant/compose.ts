/** @brief Composer plant: jalankan sloc + todo + imports + maintainability + architecture + privacy + doc + accessibility → Critique[]. @since 0.1.0 */
import type { Critique } from '../aggregate';
import { slocCritic, type FileRecord } from './sloc/critic';
import { todoCritic } from './todo/critic';
import { importsCritic } from './imports/critic';
import { maintainabilityCritic } from './maintainability/critic';
import { architectureCritic } from './architecture/critic';
import { privacyCritic } from './privacy/critic';
import { docCritic } from './doc/critic';
import { accessibilityCritic } from './accessibility/critic';
import { devopsCritic } from './hygiene/devops/critic';
import { legalCritic } from './hygiene/legal/critic';
import { dxCritic } from './hygiene/dx/critic';

/** @brief Jalankan semua critic plant pada kumpulan file.
 * @param {FileRecord[]} files - artefak yang diaudit.
 * @return {Critique[]} hasil tiap critic (siap di-aggregate).
 * @see docs/design/critic.md
 * @since 0.1.0 */
export function composeCritiques(files: FileRecord[]): Critique[] {
  return [slocCritic(files), todoCritic(files), importsCritic(files), maintainabilityCritic(files), architectureCritic(files), privacyCritic(files), docCritic(files), accessibilityCritic(files)];
}

/** @brief Jalankan critic repo-hygiene (DevOps/Legal/DX) pada root repo.
 * @param {string} root - path repo (bukan per-file).
 * @return {Critique[]} hasil tiap critic (siap di-aggregate).
 * @see docs/design/critic.md
 * @since 0.2.0 */
export function composeHygiene(root: string): Critique[] {
  return [devopsCritic(root), legalCritic(root), dxCritic(root)];
}
