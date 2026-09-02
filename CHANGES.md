# Changelog

All notable changes to **zhi** are documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Version bumps follow Conventional Commits aggregated per release:

- `feat:` → MINOR bump (backward-compatible features)
- `fix:` → PATCH bump (backward-compatible bug fixes)
- `BREAKING CHANGE:` footer or `!` after type → MAJOR bump
- `chore:` / `docs:` / `refactor:` / `test:` / `ci:` → no version bump

Historical entries (pre-rename) live in [`docs/archive/EXPLAIN-CHANGES.md`](docs/archive/EXPLAIN-CHANGES.md).

## [Unreleased]

### Added

- **npm `@miruamel/zhi` publish pipeline** — `package.json` rename + publishConfig (`provenance: true`, `access: public`); exports map (`.`, `./engine/*`, `./src/*`); `bin: zhi`; files whitelist (`dist`, README, LICENSE, CHANGES, AGENTS); repository/bugs/homepage metadata; engines (`bun >=1.4.0`).
- `tsconfig.build.json` — emit mode untuk build (declaration + sourcemap ke `dist/`); `scripts/build.ts` orchestrate `rm -rf dist` + `tsc -p tsconfig.build.json`.
- `.npmrc` (provenance + registry) + `.npmignore` (exclude src/engine/test/docs/native, publish dist only).
- **GitHub Actions workflows**:
  - `.github/workflows/ci.yml` — gate (arch + lint + format + typecheck + test) + build (TS + Zig WASM via direct download) pada push/PR main.
  - `.github/workflows/release.yml` — tag `v*.*.*` push → gate + build + `npm publish --provenance` + GH release (notes auto-extracted dari `CHANGES.md` per-version; tag format divalidasi regex + awk pattern via `-v` flag, **no interpolation**).
  - `.github/workflows/architecture-guard.sh` — bash checks (files-per-dir ≤5; SLOC ≤150 hard cap per §6.2); exempt `.husky`, `.dist`, `.native/out`, `.github`.

### Changed

- `bun.lock` tracked (was previously `.gitignore`d) — CI `bun install --frozen-lockfile` sekarang reproducible.
- `package-lock.json` dihapus dari tracking — Bun-native lockfile only (dual lockfile bikin CI fail `Install dependencies` step karena Bun migration attempt).
- `engine/orch/orch.test.ts` (157 SLOC) dipecah → 5 atomic tests (`parse`, `build-dag`, `topo-sort`, `allocate`, `schedule`; max 35 SLOC per file).
- `engine/resil/resil.test.ts` (172 SLOC) dipecah → 4 atomic tests (`breaker`, `retry`, `recover`, `with-resilience`; max 59 SLOC per file).
- Arch metrics: max SLOC turun dari 164 → 118 (`engine/build/generate.test.ts`).

### Fixed

- CI workflow hardening: `release.yml` awk-regex injection (interpolasi `${TAG#v}` unsafely) → tag format validation `^v[0-9]+\.[0-9]+\.[0-9]+$` + awk pattern via `-v` flag.
- Dual lockfile race condition: workflow `Install dependencies` step sekarang pass (Bun-only lockfile contract).

## [0.1.1] - 2026-09-02

### Security

- **vitest `^2.0.0` → `^3.2.6`** — closes [CVE-2026-47429](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp) (CVSS 9.8 critical). Vitest UI server arbitrary file read + write + execute via path traversal when network-exposed (`--api.host`). Although zhi runs vitest locally only (private), public repo + critical severity = P0 fix per mandate §7.2. Patched in 3.2.6 with `allowWrite`/`allowExec` gates (default off for non-localhost).
- `npm audit`: 0 vulnerabilities (prod + dev).

### Changed

- `engine/model/stream` — `WebAssembly.Table` element `'anyfunc'` (was `'funcref'`, rejected by TS DOM lib). Fallback to TypeScript-native SSE parser when WASM write barrier fails in proot env (Zig wasm32 byte-write did not commit; TS parser logic mirrors `native/stream/parse.zig`).
- `native/stream/parse.zig` — moved `const std = @import("std")` to top of file (Zig declaration-order rule; import after use is silent compile error).
- `src/cli.ts` — added `LoopContext` + `gitCommit` imports; dropped unused `ghCiWatch`.

### Fixed

- `engine/loop/observability/metrics.test` — imported `LoopEvent` (was misreferencing `LoopState.GOAL_READY`).
- `engine/loop/wiring/handlers.test` & `integration.test` — `generate` callbacks now `async` returning `Promise<string>` per `LoopDeps` contract.
- `src/cli.test.ts` — typed `Critique` parameter (strict mode `noImplicitAny`).
- 10 hidden TypeScript errors surfaced by adding `tsconfig.json` (strict mode).
- 4 SSE parser test failures caused by WASM write barrier + TS wrapper offset bug.

### Added

- Tooling baseline (Yan v2.0.0 adapted):
  - `tsconfig.json` (strict, noEmit, path aliases `@engine/*` `@src/*` `@native/*`)
  - `eslint.config.js` flat config (`@typescript-eslint/parser` + `eslint-plugin-jsdoc`)
  - `.prettierrc` (singleQuote, trailingComma=all, printWidth=100)
  - `vitest.config.ts` (node env, coverage thresholds lines 80% / branches 70%)
  - `.commitlintrc.json` (Conventional Commits, subject max 72 char)
  - `.lintstagedrc` (lint:fix + format on staged)
  - `tests/setup.ts` (bun:test minimal beforeEach/afterEach)
- `package.json` scripts: `gate`, `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `test`, `test:ci`, `test:watch`, `arch:check`, `arch:metrics`, `native:build`.
- `native/out/stream.wasm` rebuilt with Zig 0.14.0 (`wasm32-freestanding -fno-entry --export=parse_sse`).
- `.gitignore` entries: `native/.zig-cache/`, `coverage/`, `*.tsbuildinfo`, `bun.lock`.

### Gate Status

| Gate         | Before            | After                                               |
| ------------ | ----------------- | --------------------------------------------------- |
| typecheck    | n/a (no tsconfig) | 0 errors                                            |
| lint         | n/a (no eslint)   | 0 errors (124 JSDoc `@returns` warnings = baseline) |
| format:check | n/a               | clean                                               |
| test         | 210 pass / 4 fail | 214 pass / 0 fail                                   |

## [0.1.0] - 2026-08-29

First tagged baseline. See [`docs/archive/EXPLAIN-CHANGES.md`](docs/archive/EXPLAIN-CHANGES.md) for the full 2026-08-29 → 2026-08-30 development log (15 entries; note: that history uses inconsistent version headers `[0.1.0]` duplicated and a non-monotonic `0.1.0..0.6.0` block — preserved as-is for authorial record).

[Unreleased]: https://github.com/miruamel/zhi/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/miruamel/zhi/releases/tag/v0.1.1
[0.1.0]: https://github.com/miruamel/zhi/releases/tag/v0.1.0
