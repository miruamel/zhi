/** @since 0.1.8
 * @brief dependency-cruiser configuration — replaces scripts/ci/architecture/check-circular.ts
 * @see AGENTS.md layer-first architecture (§6.11)
 * Validates layer separation (engine→src, src→native, native→engine/src).
 * Circular dep check via dependency-cruiser built-in (via dep.circular in JSON output).
 * Note: orphan detection is NOT included — the old check-circular.ts never penalized orphans.
 */
module.exports = {
  forbidden: [
    // Layer boundary: engine may NOT depend on src
    {
      name: 'engine-may-not-depend-on-src',
      comment: 'AGENTS.md layer-first: engine is a sibling of src, not its child',
      severity: 'error',
      from: { path: '^engine/' },
      to: { path: '^src/' },
    },
    // Layer boundary: src may NOT depend on native
    {
      name: 'src-may-not-depend-on-native',
      comment: 'AGENTS.md layer-first: src (app) may not reach into native (infra)',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '^native/' },
    },
    // Layer boundary: native may NOT depend on engine or src
    {
      name: 'native-may-not-depend-on-engine-or-src',
      comment: 'AGENTS.md layer-first: native is a leaf layer, cannot reach up',
      severity: 'error',
      from: { path: '^native/' },
      to: { path: '^(engine|src)/' },
    },
    // Deep relative import: 4+ levels of ../
    {
      name: 'deep-relative-import',
      comment: 'No more than 3 levels of ../ in any import path',
      severity: 'error',
      from: {},
      to: { path: '\\.\\./(\\.\\./){3,}' },
    },
  ],
};
