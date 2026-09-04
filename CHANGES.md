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
- `.github/workflows/publish.yml` (sebelumnya `release.yml`) — tag `v*.*.*` push → gate + build + `npm publish --provenance` (OIDC Trusted Publisher, **no `secrets.NPM_TOKEN`**); GH release notes auto-extracted dari `CHANGES.md` per-version; tag format divalidasi regex + awk pattern via `-v` flag, **no interpolation**. Workflow filename rename supaya match npmjs.com Trusted Publisher entry.
- `docs/runbooks/npm-trusted-publishing.md` — runbook migrasi npm auth dari long-lived `NPM_TOKEN` ke OIDC federation (Trusted Publishing). Target: hapus `secrets.NPM_TOKEN` dari GitHub repo. Status: target.
- `.github/ISSUE_TEMPLATE/` — `security-incident.md` (private-rotation tracker, no paste-secret policy) + `tech-debt.md` (hygiene-gap tracker).
- `.prettierignore` — exclude `dist/`, `native/out/`, `.zig-cache/`, `.nyc_output/`, `coverage/`, `bun.lock` (generated / not source).
- `.gitignore` — tambah `dist/` (TS emit, bukan source).
- **Ink TUI** — `src/tui/` (18 files, 4 dirs): `app.tsx` (root ink component with `useState` + `useEffect` + `useInput` + `useApp`), `render.tsx` (`mountTui()` entry, `RenderOptions`), `state.ts` (`AppState`, `DagStep`, `CriticLine`, `EvalReport`, `PrCiState`, `LogEntry`, `emptyState()`), `colors.ts`, `format.ts`, `icons.ts`, `keymap.ts`, `viewer.ts`, `viewer.test.ts` (4 tests pass). 6 panes per `docs/guides/tui.md` spec: DAG, Step Detail, Critics, Eval, PR/CI, Log (+ Help overlay). `onRegister` prop pattern (not bus/patch-sink) — `ZhiApp` receives `onRegister?: (push) => void`, calls it in `useEffect` with a `setState`-merging closure. `mountTui` exposes `onRegister` in `RenderOptions`. `loop.ts` uses a `holder.push` mutable ref. `engine/loop/driver.ts`: added `abort()` method (`this.state = LoopState.DONE`). `src/cli/index.ts`: rewritten — `main()` now dispatches `gen`/`critique:repo`/`loopCommandTui` (TTY) or `loopCommand` (non-TTY). `loopCommandTui` subscribes to `driver.onTransition`, emits `toPatch()` snapshots. `toPatch()` returns plain `Partial<AppState>` (shallow patches only; `PartialDeep<T>` type alias was added speculatively then dropped — it poisoned React `setState` spread with `undefined` per leaf). `LoopDriver.abort()` added as small justified engine change (was `private readonly`, made public).

### Changed

- `bun.lock` tracked (was previously `.gitignore`d) — CI `bun install --frozen-lockfile` sekarang reproducible.
- `package-lock.json` dihapus dari tracking — Bun-native lockfile only (dual lockfile bikin CI fail `Install dependencies` step karena Bun migration attempt).
- `engine/orch/orch.test.ts` (157 SLOC) dipecah → 5 atomic tests (`parse`, `build-dag`, `topo-sort`, `allocate`, `schedule`; max 35 SLOC per file).
- `engine/resil/resil.test.ts` (172 SLOC) dipecah → 4 atomic tests (`breaker`, `retry`, `recover`, `with-resilience`; max 59 SLOC per file).
- Arch metrics: max SLOC turun dari 164 → 118 (`engine/build/generate.test.ts`).
- `src/tui/integration/` flat (14 files) di-restructure → 4 nested subdir (`error/`, `render/`, `shortcuts/`, `state/`), masing-masing ≤4 file dengan barrel `index.ts` per Mandate §6.2/§6.6. Import path normalization di 4 test files (depth 2 → 3 setelah nest) + 2 component imports di `app.tsx`/`layout-render.tsx`.
- `src/tui/widgets/` flat (26 files) di-restructure → 7 nested subdir per purpose: `badges/`, `status/`, `indicators/`, `wayfinding/`, `picker/`, `structure/`, `data/` (max 5 file per dir per §6.2). `json-view/` nested 3 levels di `data/`. Import path normalization di 26 consumer files.
- `src/tui/core/` flat (17 files) di-restructure → 9 nested subdir per domain: `animation/`, `events/`, `history/`, `keymap/`, `search/`, `shortcuts/`, `state/`, `storage/`, `markdown/`. `markdown/parser/` + `markdown/render/` nested 2 levels dengan 3-file split (types/blocks/inline, semua ≤110 SLOC). Barrel `index.ts` ditambahkan di 3 subdir tanpa source (keymap, shortcuts, state, style) untuk allow short import.
- 4 oversized test/source files dipecah untuk comply dengan §6.2 SLOC cap 200: `ansi/ansi.test.ts` (241 → 6 file di 3 subdir), `core/search.test.ts` (222 → 4 file), `core/markdown.test.ts` (202 → 4 file), `core/markdown/parser/ast.ts` (234 → 3 file types/blocks/inline).

### Fixed

- **P1: merge conflict markers** — 8 `<<<<<<< |=======|>>>>>>>` markers di 7 file `src/tui/integration/` dari `stash apply` + `rebase` sequence (commit 9ef6df1..edc1411). Resolved dengan memilih variant yang match codebase convention (no `.ts` extension, no `/index` suffix, double quotes). `bun test` 875/875 pass; `tsc --noEmit` pre-existing debt di integration/ (AppState schema drift, WriteStream pollution, DiffProps/ResourcesProps mismatch) — tracked terpisah, di luar scope refactor ini (Mandate §6.7: 1 modul per PR).
- CI workflow hardening: `release.yml` awk-regex injection (interpolasi `${TAG#v}` unsafely) → tag format validation `^v[0-9]+\.[0-9]+\.[0-9]+$` + awk pattern via `-v` flag.
- Dual lockfile race condition: workflow `Install dependencies` step sekarang pass (Bun-only lockfile contract).

### Security

- **`release.yml` OIDC migration** — workflow publish npm tidak lagi pakai `secrets.NPM_TOKEN` (long-lived secret, compromised 2026-09-03 di session). Migrasi ke OIDC federation (Trusted Publishing): `id-token: write` permission + `npm publish --provenance` short-lived token dari GitHub Actions → npmjs.com. Repo secret `NPM_TOKEN` sudah dihapus dari settings (`total_count: 0` confirmed via API). User tetap harus verify npmjs.com Trusted Publisher entry point ke `publish.yml` (bukan `release.yml`) di https://www.npmjs.com/package/@miruamel/zhi/access. Rotation `npm_5xKx…` di npmjs.com sekarang **less urgent** tapi tetap recommended (compromised secret hygiene). Tracked di #35.

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
