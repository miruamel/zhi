/** @brief Composer plant: jalankan sloc + todo + imports + maintainability + architecture + privacy + doc + accessibility → Critique[]. @since 0.1.1 */
import type { Critique } from '../aggregate';
import { slocCritic, type FileRecord } from './sloc/critic';
import { todoCritic } from './todo/critic';
import { importsCritic } from './imports/critic';
import { maintainabilityCritic } from './maintainability/critic';
import { architectureCritic, type CruiserRunner } from './architecture/critic';
import { privacyCritic } from './privacy/critic';
import { docCritic } from './doc/critic';
import { accessibilityCritic } from './accessibility/critic';
import { securityCritic } from './security/critic';
import { perfCritic } from './perf/critic';
import { styleCritic } from './style/critic';

/** @brief Jalankan semua critic plant pada kumpulan files.
 * @param {FileRecord[]} files - artefak yang diaudit.
 * @param {CruiserRunner} [architectureRunner] - optional runner for architecture critic (testing).
 * @return {Critique[]} hasil tiap critic (siap di-aggregate).
 * @see docs/design/critic.md
 * @since 0.1.1 */
export function composeCritiques(
  files: FileRecord[],
  architectureRunner?: CruiserRunner,
): Critique[] {
  return [
    slocCritic(files),
    todoCritic(files),
    importsCritic(files),
    maintainabilityCritic(files),
    architectureCritic(files, architectureRunner),
    privacyCritic(files),
    docCritic(files),
    accessibilityCritic(files),
    securityCritic(files),
    perfCritic(files),
    styleCritic(files),
  ];
}
