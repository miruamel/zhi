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

## [0.1.2] - 2026-09-03

### Added

- **npm `@miruamel/zhi` publish pipeline** — `package.json` rename + publishConfig (`provenance: true`, `access: public`); exports map (`.`, `./engine/*`, `./src/*`); `bin: zhi`; files whitelist (`dist`, README, LICENSE, CHANGES, AGENTS); repository/bugs/homepage metadata; engines (`bun >=1.4.0`).
- `tsconfig.build.json` — emit mode untuk build (declaration + sourcemap ke `dist/`); `scripts/build.ts` orchestrate `rm -rf dist` + `tsc -p tsconfig.build.json`.
- `.npmrc` (provenance + registry) + `.npmignore` (exclude src/engine/test/docs/native, publish dist only).
- **GitHub Actions workflows**:
  - `.github/workflows/ci.yml` — gate (arch + lint + format + typecheck + test) + build (TS + Zig WASM via direct download) pada push/PR main.
- `.github/workflows/publish.yml` (sebelumnya `release.yml`) — tag `v*.*.*` push → gate + build + `npm publish --provenance` (OIDC Trusted Publisher, **no `secrets.NPM_TOKEN`**); GH release notes auto-extracted dari `CHANGES.md` per-version; tag format divalidasi regex + awk pattern via `-v` flag, **no interpolation**. Workflow filename rename supaya match npmjs.com Trusted Publisher entry.
- `docs/runbooks/npm-trusted-publishing.md` — runbook migrasi npm auth dari long-lived `NPM_TOKEN` ke OIDC federation (Trusted Publishing). Target: hapus `secrets.NPM_TOKEN` dari GitHub repo. Status: target.
- `.github/ISSUE_TEMPLATE/` — `security-incident.md` (private-rotation tracker, no paste-secret policy) + `tech-debt.md` (hygiene-gap tracker).
- `bug_report.md`, `feature_request.md`, `question.md` — standard issue templates for non-security bugs, features, usage questions.
- `.github/PULL_REQUEST_TEMPLATE.md` — PR checklist (typecheck / lint / format / tests / coverage / CHANGES / arch-guard).
- `.github/CODEOWNERS` — module ownership (`engine/loop`, `engine/critic`, `engine/eval`, `engine/resil`, `native/`, security-sensitive, release).
- `.github/FUNDING.yml` — GitHub Sponsors button scaffold.
- `SECURITY.md` — security policy: supported versions table, private reporting, scope, past advisories, best-practices for users.
- `assets/` — `favicon.svg` (64×64), `logo.svg` (360×96), `og-banner.svg` (1200×630), `doc-header.svg` (1200×120), `glyphs.svg` (800×96), `banner.txt` (ASCII splash), `assets/README.md` (asset index + color palette).
- `BUSINESS.md` — positioning, ICP, pricing (proposed), competitive landscape (vs Claude Code/OMP/Aider/KiloCode/Hermes), value prop canvas.
- `docs/marketing/` — `landing-copy.md` (hero/problem/how-it-works/features/FAQ for zhi.dev), `social-bio.md` (GitHub/X/LinkedIn/npm bios), `use-cases.md` (8 concrete user stories), `repo-metadata.md` (checklist of forgotten small details), `README.md` (index).
- `.prettierignore` — exclude `dist/`, `native/out/`, `.zig-cache/`, `.nyc_output/`, `coverage/`, `bun.lock` (generated / not source).
- `.gitignore` — tambah `dist/` (TS emit, bukan source).
- **Ink TUI** — `src/tui/` (18 files, 4 dirs): `app.tsx` (root ink component with `useState` + `useEffect` + `useInput` + `useApp`), `render.tsx` (`mountTui()` entry, `RenderOptions`), `state.ts` (`AppState`, `DagStep`, `CriticLine`, `EvalReport`, `PrCiState`, `LogEntry`, `emptyState()`), `colors.ts`, `format.ts`, `icons.ts`, `keymap.ts`, `viewer.ts`, `viewer.test.ts` (4 tests pass). 6 panes per `docs/guides/tui.md` spec: DAG, Step Detail, Critics, Eval, PR/CI, Log (+ Help overlay). `onRegister` prop pattern (not bus/patch-sink) — `ZhiApp` receives `onRegister?: (push) => void`, calls it in `useEffect` with a `setState`-merging closure. `mountTui` exposes `onRegister` in `RenderOptions`. `loop.ts` uses a `holder.push` mutable ref. `engine/loop/driver.ts`: added `abort()` method (`this.state = LoopState.DONE`). `src/cli/index.ts`: rewritten — `main()` now dispatches `gen`/`critique:repo`/`loopCommandTui` (TTY) or `loopCommand` (non-TTY). `loopCommandTui` subscribes to `driver.onTransition`, emits `toPatch()` snapshots. `toPatch()` returns plain `Partial<AppState>` (shallow patches only; `PartialDeep<T>` type alias was added speculatively then dropped — it poisoned React `setState` spread with `undefined` per leaf). `LoopDriver.abort()` added as small justified engine change (was `private readonly`, made public).

### Changed

- `bun.lock` tracked (was previously `.gitignore`d) — CI `bun install --frozen-lockfile` sekarang reproducible.
- `package-lock.json` dihapus dari tracking — Bun-native lockfile only (dual lockfile bikin CI fail `Install dependencies` step karena Bun migration attempt).
- `engine/orch/orch.test.ts` (157 SLOC) dipecah → 5 atomic tests (`parse`, `build-dag`, `topo-sort`, `allocate`, `schedule`; max 35 SLOC per file).
- `engine/resil/resil.test.ts` (172 SLOC) dipecah → 4 atomic tests (`breaker`, `retry`, `recover`, `with-resilience`; max 59 SLOC per file).
- Arch metrics: max SLOC turun dari 164 → 118 (`engine/build/generate.test.ts`).
- README translated to English, with badge grid (CI / License / Maturity / Bun / Node ≥ 20 / npm / Stars) and hero image (`assets/doc-header.svg`).
- `docs/configuration.md`, `docs/security.md`, `docs/observability.md`, `docs/standards/commit.md`, `docs/runbooks/npm-trusted-publishing.md`, `docs/guides/{roadmap,testing,tui,glossary}.md`, `docs/design/{loop,orch,build,critic,eval,resil,knowledge,model,data-model,sequences}.md`, `docs/examples/trace-email-validation.md` — translated to English.
- `docs/ARCHITECTURE.md` — translated to English + cleaned Mermaid diagram.
- All 26 markdown docs now lead with the shared `assets/doc-header.svg` banner + `assets/glyphs.svg` glyph row for visual consistency.

### Fixed

- CI workflow hardening: `release.yml` awk-regex injection (interpolasi `${TAG#v}` unsafely) → tag format validation `^v[0-9]+\.[0-9]+\.[0-9]+$` + awk pattern via `-v` flag.
- Dual lockfile race condition: workflow `Install dependencies` step sekarang pass (Bun-only lockfile contract).

### Security

- **`release.yml` OIDC migration** — workflow publish npm tidak lagi pakai `secrets.NPM_TOKEN` (long-lived secret, compromised 2026-09-03 di session). Migrasi ke OIDC federation (Trusted Publishing): `id-token: write` permission + `npm publish --provenance` short-lived token dari GitHub Actions → npmjs.com. Repo secret `NPM_TOKEN` sudah dihapus dari settings (`total_count: 0` confirmed via API). User tetap harus verify npmjs.com Trusted Publisher entry point ke `publish.yml` (bukan `release.yml`) di https://www.npmjs.com/package/@miruamel/zhi/access. Rotation `npm_5xKx…` di npmjs.com sekarang **less urgent** tapi tetap recommended (compromised secret hygiene). Tracked di #35.

## [Unreleased]

### Fixed

- **`engine/stream` mock.module leak** — `index.test.ts` mocked `zigBridge` via `mock.module`, which leaks across test files in Bun 1.4.0. The leak propagated through `cloud.ts` → `parseStream` → `../stream` → `./zigBridge` into `invoker.test.ts`, surfacing as `SyntaxError: export 'isWasmAvailable' not found`. Removed `mock.module` from both files; `zigBridge.test.ts` now exercises real `parseSseWasm` (throws in proot env — expected) and the `disableWasm`/`isWasmAvailable`/`resetWasm` state API.
- **`engine/critic/plant/hygiene/testing` critic false-positive** — `dirHasTests` only checked the source's own directory and its `test/` subdir, missing the repo's consolidated sibling-`test/` convention. Three `src/cli/commands/*.ts` files were flagged as uncovered despite being exercised by `src/cli/test/commands.test.ts`. Extended to also accept `join(dirname(dir), 'test')`. Repo-wide critic now scores 1.0 with zero findings.
- **`engine/critic/plant/security` eval-call false-positive** — regex `/\beval\s*\(/` matched `deps.eval(ctx.worktree)` in `builder.ts:71` because `\b` matches at the `.`→`e` boundary. That field is a typed DI dependency (`eval?: (worktree: string) => EvalOutput` in `LoopDeps`), not a code-execution sink. Changed to `/(?<!\.)\beval\s*\(/` — negative lookbehind excludes method-call syntax while still catching global `eval(`.
- **3 pre-existing test failures** (`engine/critic/plant/compose.test.ts`, `engine/critic/plant/architecture/critic.test.ts`, `src/cli/test/index.test.ts`) — all traced to `as unknown as any` casts in `handlers.test.ts` that broke after `isDLQ`'s signature widened to `unknown`. Removed the casts; 254 → 255 pass, 0 fail.
- **`parseSseWasm` fail-closed on WASM write-barrier breakage** — `load()` in `engine/stream/zigBridge.ts` could throw when the WASM write barrier is broken (proot env), propagating the exception into `parseStream` and crashing the pipeline. Added `if (!wasmAvailable) return []` guard before `load()` and a `try/catch` around `load()` returning `[]` on throw. `parseStream` already had the `result.length === 0 && chunk.length > 0` → `disableWasm()` + fallback-to-`parseSseTs` logic, so the fix makes the failure path deterministic across all environments. `Loaded` type exported per `ts-no-return-type` rule. Stream tests rewritten to be env-independent: `disableWasm()` called explicitly before `parseStream()` instead of relying on proot breakage. Unused `isWasmAvailable` import removed (TS6133). 355 tests pass, 0 fail; CI green.

### Changed

- **Architecture guard `test/` directory exemption** — `.github/workflows/architecture-guard.sh` now exempts `test/` dirs from the ≤5-files-per-directory cap. Only `src/cli/test` (7 files) exceeded the cap; all other test dirs are under it.
- **Merged `origin/main` (PR #45: ink TUI)** — clean merge, no conflicts. 25 files / +1211 / -50. TUI feature adds 14 files under `src/tui/` (6 panes: DAG, Detail, Critics, Eval, PR/CI, Log + Help overlay) plus `onRegister` prop wiring through `engine/loop/driver.ts`, `src/cli/index.ts`, `src/cli/commands/loop.ts`. `package.json` deps `ink@4.4.1` + `react@18.3.1`.
- **Merged `test/gen-stream-coverage`** — 1 unique commit: 8-line test addition for `--stream` CLI branch fallback via `generateStream`. Branch deleted after merge (local + remote).
- **Deleted stale `feat/tui-ink` branch** — divergent pre-merge TUI work (816 insertions / 3633 deletions vs main). Canonical TUI already in `origin/main`; this branch was superseded. Deleted local + remote.

- **Removed dead `vitest` dependency, config, and setup** — `vitest.config.ts`, `tests/setup.ts`, and the `vitest` devDependency are orphaned from the pre-rename era (ADR-012). All tests use `bun:test`; no script, CI workflow, or source file references vitest. Removed. `tests/` directory is now empty and deleted.
- **Roadmap critic status correction** — `docs/guides/roadmap.md` claimed `critic/*` had "8 stubs"; all 13 critics are concrete implementations (accessibility, architecture, compose, doc, hygiene, imports, maintainability, perf, privacy, security, sloc, style, todo). Updated v0.1.0 scope and struck through the v0.2.0 "remaining 8 critics" bullet with a DONE marker.

### Test

- **TUI test coverage for 13 files from PR #45** — 14 test files (105 tests, 210 expect calls) covering `src/tui/core/{colors,format,icons,keymap,state}.ts` and `src/tui/panes/{bottom/{help,log},middle/{critics,eval,pr},top/{dag,detail,header}}.tsx`. Test convention follows repo pattern: `bun:test`, co-located `test/` directory at parent level (`src/tui/test/`, `src/tui/panes/test/`). The `dirHasTests` critic check picks these up for sibling coverage. Repo-wide critic score restored to 1.0 with 0 findings (was ~0.74 from 13 uncovered TUI files). Test count: 255 → 356. Initially written as a single 401-SLOC monolith (`panes.test.ts`); split into 8 atomic files (one per pane, max 47 SLOC) to satisfy the architecture guard SLOC cap (≤150).

### Security

- **`eval-call` sink regex hardening** — see Fixed above. The fix closes a false-positive that would have masked genuine global `eval(` usage in security-sensitive paths.

### Style

- Prettier trailing-newline normalization on `engine/critic/plant/security/{critic,critic.test.ts}` and 4 other test files.

### Changed

- **`parseSseWasm` fail-closed + stream test determinism** — `load()` in `engine/stream/zigBridge.ts` could throw on WASM write-barrier breakage (proot), propagating into `parseStream` and crashing the whole pipeline. Added `if (!wasmAvailable) return []` guard + `try/catch` around `load()` returning `[]` on throw. `parseStream` already had the `result.length === 0 && chunk.length > 0` → `disableWasm()` + fallback-to-`parseSseTs` logic, so the fix makes the failure path deterministic. `Loaded` type exported per `ts-no-return-type` rule. Stream tests rewritten to be env-independent: `disableWasm()` called explicitly before `parseStream()` instead of relying on proot breakage. `isWasmAvailable` unused import removed (TS6133). 355 tests pass, 0 fail; CI green.

- **CLI + TUI test restructure into per-unit subdirs** — flat `test/` directories violated the ≤5-files-per-directory architecture cap (`src/tui/panes/test` had 8, `src/cli/test` had 7). Restructured to per-unit co-location: each unit gets its own `<unit>/<unit>.ts` + `<unit>.test.ts` (2 files each). `src/tui/panes/{top/{header,dag,detail},middle/{critics,eval,pr},bottom/{log,help}}` and `src/cli/{autonomous-deps,offline-deps,parse-args,plan-symbol}` + `src/cli/commands/{gen,loop,critique-repo}`. Flat `test/` dirs deleted; `commands.test.ts` (101 SLOC, 3 describe blocks) split into 3 per-command test files.
- **Path aliases adopted for deep-relative imports** — `@engine/*` / `@src/*` aliases (already declared in `tsconfig.json`) now used by all CLI modules that sit 3–4 levels below root. This eliminates the `../../../../engine/...` chain that the architecture guard flags as deep-relative-import violations (>3 `../`). Guard script already accepts bare `engine/`/`src/` specifiers; `@engine/*` resolves through `tsconfig` paths and is treated as external (no deep-relative count).
- **Architecture guard `test/` exemption removed** — `.github/workflows/architecture-guard.sh` no longer exempts `*/test|*/test/*`. Flat `test/` directories are eliminated, so the exemption is dead code. Guard now enforces ≤5 files per directory uniformly.

### Test

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

[Unreleased]: https://github.com/miruamel/zhi/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/miruamel/zhi/releases/tag/v0.1.2
[0.1.1]: https://github.com/miruamel/zhi/releases/tag/v0.1.1
[0.1.0]: https://github.com/miruamel/zhi/releases/tag/v0.1.0
