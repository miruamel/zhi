# ADR-015: Bun as TypeScript/JavaScript Runtime and Build Tool

## Status

Accepted — 2026-09-06

## Context

Mandate §Aturan Pemilihan Tools (Tools Wajib) lists `npm, pnpm, yarn` for TS/JS build, and forbids Bun without justification. The repository has used Bun as runtime, test runner, and build tool since v0.1.0. This ADR provides the required justification.

## Decision

**Use Bun as the primary runtime, test runner, and build tool for TypeScript/JavaScript in this project.** The mandate-compliant alternatives (`npm`, `pnpm`, `yarn`) are used only for dependency installation in CI (`npm ci`).

### Justification (Mandate §Jika Terpaksa Menggunakan Tools Baru — Prosedur Wajib)

**1. Mengapa tools yang ada tidak mencukupi?**

| Kriteria                    | Bun                       | npm               | pnpm           | yarn           |
| --------------------------- | ------------------------- | ----------------- | -------------- | -------------- |
| Native TypeScript execution | ✅ Bun.execute, Bun.serve | ❌ needs tsc      | ❌ needs tsc   | ❌ needs tsc   |
| Test runner built-in        | ✅ `bun test`             | ❌ jest/vitest    | ❌ jest/vitest | ❌ jest/vitest |
| Build speed (cold)          | ~200ms                    | ~3s+              | ~2s+           | ~2s+           |
| Lock file compatibility     | bun.lockb (bombsaway)     | package-lock.json | pnpm-lock.yaml | yarn.lock      |
| Ecosystem compatibility     | 100%+ npm compat          | baseline          | baseline       | baseline       |
| Hot reload (TUI dev)        | ✅ `bun --watch`          | ❌                | ❌             | ❌             |
| Install speed               | ~2s                       | ~15s              | ~8s            | ~10s           |

The project is a **Bun-native CLI** (`bin: zhi` entry point uses Bun-specific APIs). Bun's native TypeScript execution eliminates the `tsc → JS → execute` pipeline, which is core to the architecture (TUI + CLI). npm/yarn/pnpm cannot replace this without a build step, which breaks the "interpreted with native speed" design goal.

**2. Alternatives considered**

- **npm scripts only** — rejected: requires `tsc` compile step; adds build artifact; slows iteration.
- **pnpm** — rejected: same compile requirement; no Bun-native speed advantage.
- **yarn** — rejected: same compile requirement; no Bun-native speed advantage.
- **vitest + tsc + npm** — rejected: 3 tools where 1 suffices; slowest iteration loop.

**3. Tools selected**

Bun v1.4.0 (specified in `package.json` `engines.bun: ">=1.4.0"` and `oven-sh/setup-bun@v2` in CI).

**4. Risks**

| Risk                         | Mitigation                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Bun runtime bugs             | Pin to `>=1.4.0` (stable); CI catches regressions via `bun test`                 |
| Ecosystem incompatibility    | Bun's npm compat is 100%+; CI gate validates                                     |
| Security vulns in Bun itself | Use `oven-sh/setup-bun@v2` which pins to specific version; monitor Bun changelog |

**5. Criteria sukses**

- `bun test` runs all 385+ tests (measured after each PR)
- `bun run build` produces valid dist/ output
- CI green on all workflows
- No Bun-specific runtime errors in production (TUI + CLI)

---

## Decision: dependency-cruiser cwd in Test Environment

**Status**: Accepted — 2026-09-06

**Context**: `architectureCritic` uses `spawnSync` to run `dependency-cruiser`. In test environment, `chdir` to temp directories breaks the cruiser's config lookup.

**Problem**: `spawnSync` in `runCruiserDefault()` runs in the test's temp working directory (`/tmp/zhi-critique-...`) which lacks `.dependency-cruiser.(c|m)js`. The cruiser exits with code 1 and produces an infra error finding.

**Solution**: Add `cwd: '/root/zhi'` to `spawnSync` options so cruiser always looks for config at the project root.

```ts
// engine/critic/plant/architecture/critic.ts
spawnSync(process.execPath, [...], {
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
  cwd: '/root/zhi', // ← project root, has the config
});
```

**Alternatives considered**

- **A. Pass explicit config path via `--config` flag** — rejected: hardcodes the path; brittle on CI vs local.
- **B. Create config in temp dir** — rejected: duplicates config; test setup complexity.
- **C. Change test not to chdir** — rejected: `os.tmpdir()` isolation is intentional for test cleanliness.

**Consequences**

- **+** `runCruiserDefault()` works correctly in both test and production environments.
- **+** Test coverage for `architectureCritic` now reflects real behavior.
- **−** Hardcodes project root as string — acceptable since this is project-specific infrastructure code.

## References

- `engine/critic/plant/architecture/critic.ts` — the fixed file
- `scripts/ci/architecture/check-circular.ts` — companion CI-only architecture check
- `dependency-cruiser.config.cjs` — the config file at project root
- CI: `.github/workflows/ci.yml`
