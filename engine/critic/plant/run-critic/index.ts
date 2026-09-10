/**
 * @fileoverview Critic plant — single-critic runner. @since 0.1.9 @package zhi
 */
/** @brief Cruiser report shape (inlined to break circular dep with compose). @since 0.1.10 */
type CruiserReport = {
  modules: Array<{ source: string; dependencies: string[]; orphan: boolean; valid: boolean }>;
  errors?: string[];
};

/** @brief Run a single critic by name. @since 0.1.10 */
export function runCritic(
  name: string,
  files: Array<{ path: string; content: string }>,
  cruiser: CruiserReport,
): { score: number; findings: string[] } {
  const findings: string[] = [];
  let violations = 0;
  for (const f of files) {
    const lines = f.content.split('\n');
    const loc = lines.length;
    switch (name) {
      case 'sloc': {
        if (loc > 150) {
          findings.push(`sloc: ${f.path} has ${loc} lines (max 150)`);
          violations++;
        }
        break;
      }
      case 'todo': {
        for (const l of lines) {
          if (/(TODO|FIXME|XXX)/.test(l)) {
            findings.push(`todo: ${f.path} has TODO/FIXME/XXX`);
            violations++;
          }
        }
        break;
      }
      case 'imports': {
        for (const l of lines) {
          if (l.match(/^import\s.*from\s+['"]\.\.?\//)) {
            findings.push(`imports: ${f.path} has relative import`);
            violations++;
          }
        }
        break;
      }
      case 'security': {
        for (const l of lines) {
          if (/(eval\(|exec\(|password\s*=|secret\s*=|api[_-]?key\s*=)/i.test(l)) {
            findings.push(`security: ${f.path} has potential secret`);
            violations++;
          }
        }
        break;
      }
      case 'privacy': {
        for (const l of lines) {
          if (/(email|phone|ssn|dob|address)\s*[:=]/i.test(l)) {
            findings.push(`privacy: ${f.path} has potential PII`);
            violations++;
          }
        }
        break;
      }
      case 'style': {
        for (const l of lines) {
          if (l.match(/^\s{2,}\S/) && !l.match(/^\s*\/\//)) {
            findings.push(`style: ${f.path} has inconsistent indentation`);
            violations++;
          }
        }
        break;
      }
      case 'doc': {
        for (const l of lines) {
          if (l.match(/^export\s+(function|const|class)\s+\w+/) && !l.match(/\/\*\*|@brief/)) {
            findings.push(`doc: ${f.path} missing JSDoc on export`);
            violations++;
          }
        }
        break;
      }
      case 'maintainability': {
        if (loc > 400) {
          findings.push(`maintainability: ${f.path} too large (${loc} lines)`);
          violations++;
        }
        break;
      }
      case 'perf': {
        for (const l of lines) {
          if (l.match(/\.map\(|\.filter\(|\.forEach\(/)) {
            findings.push(`perf: ${f.path} has array iteration`);
            violations++;
          }
        }
        break;
      }
      case 'accessibility': {
        for (const l of lines) {
          if (l.match(/<button|<input|<a\s/) && !l.match(/aria-|role=/)) {
            findings.push(`accessibility: ${f.path} missing ARIA on interactive element`);
            violations++;
          }
        }
        break;
      }
      case 'architecture': {
        if (cruiser.modules.length > 0) {
          const orphan = cruiser.modules.filter((m) => m.orphan);
          if (orphan.length > 0) {
            findings.push(`architecture: ${orphan.length} orphan modules detected`);
            violations++;
          }
        }
        break;
      }
      default:
        break;
    }
  }
  return { score: Math.pow(0.5, violations), findings };
}