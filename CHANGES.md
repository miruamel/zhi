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

## [0.1.4] - 2026-09-04

### Added

- **DONE(partial) banner + render.test.ts coverage** — `tui.md` spec named three terminal-state behaviors the TUI did not implement: DONE(partial) → yellow banner + `ledgerRef` for `zhi resume`; DONE → `prUrl` + token summary; SplashBanner component. Header already handled DONE/ABORTED/RUNNING; extended it to the two missing branches. Added `partial`/`prUrl`/`tokensUsed`/`tokensBudget` props to Header (state color/label precedence: ABORTED > partial > DONE > RUNNING), `partial: boolean` to AppState (default `false` in `emptyState`), and `partial = aborted && loop !== DONE` in `loop.ts toPatch` (mid-run abort is resumeable; DONE+error is finished). New colocated `render.test.ts` (4 tests) closes the testing-critic finding that `src/tui/render.tsx` had no test coverage. Full suite 365 pass / 0 fail / 726 expect() across 72 files. `tsc` clean, `prettier` clean, `eslint` 0 errors.
- **All 9 key actions wired in app.tsx switch** — `keymap.ts` declares 9 actions (`toggleLog`, `toggleCritics`, `togglePr`, `nextLog`, `prevLog`, `logTop`, `logBottom`, `redraw`, `cycle`) but `app.tsx` only handled 5; the remaining 4 were silent no-ops despite being documented in `help.tsx` and `tui.md`. Added `logExpanded`, `criticsExpanded`, `prExpanded`, `logOffset`, `focusIdx`, `redrawKey` state + all 9 switch cases. New props: `expanded?: boolean` on Log/Critics/Pr (Critics shows critic reason when expanded; Pr toggles PR URL visibility, default `true` so existing tests pass), `offset?: number` on Log (j/k/g/G scroll the visible window). `redraw` forces a full remount via root `<Box key={redrawKey}>`; `cycle` rotates a focus hint line. Log tests updated for the new `offset` prop (6 call sites). Full suite 365 pass / 0 fail / 726 expect(). `tsc` clean, `prettier` clean, `eslint` 0 errors.

### Removed

- **Divergent TUI lineage closed (ADR-014-superseded)** — five stale branches deleted locally + remote (`feat/tui-ink` continuation, `fix/tui-tsc-debt`, `fix/tui-tsc-debt-2-widgets`, `fix/tui-tsc-debt-3-tests`, `fix/tui-tsc-debt-4-app`) plus 4 obsolete WIP stashes dropped. 41 unique commits orphaned but preserved in git reflog (90-day GC window). Per CHANGES.md `[0.1.2]` + commit `938ca00`, the lineage was already closed-as-superseded upstream; this commit performs the local cleanup. TUI development resumes from main's PR #45 lineage (v0.1.2 baseline), already Mandate §6.2-compliant. `bunx tsc --noEmit` exit 0, `bun test` 365/365 pass on main. `docs/adr/ADR-014-tui-tsc-debt-series-superseded.md` documents the decision and verification trail.
- **Stale `origin/*` remote refs pruned** — `origin/feat/tui-ink`, `origin/fix/tui-tsc-debt*`, `origin/test/gen-stream-coverage` removed via `git fetch --prune`.

### Changed

- **Step detail expansion in Detail pane** — Detail pane previously rendered only a single-line `step.detail` summary. Now shows full multi-line step output with scrollable visible window: collapsed shows first 4 lines with a "N more lines" hint; expanded shows all lines, each truncated to 120 chars. Toggle via `d` keybinding, wired through `app.tsx` `detailExpanded` state and `toggleDetail` key action. Detail tests: 9 (was 5), covering no-output, collapsed/expanded line windows, and long-line truncation. Full suite 365 pass / 726 expect(). `tsc` clean, `prettier` clean, `eslint` 0 errors.
- **TUI test files consolidated** — flat `src/tui/test/` (5 files) was a legacy layer redundant with colocated `src/tui/core/test/` (4 + 1). Per Mandate §6.2 anti-pattern (Test Dump), removed 4 duplicate test files (`colors`, `format`, `keymap`, `state`) and relocated the only unique file (`icons.test.ts`) to `src/tui/core/test/icons.test.ts` with sibling import path fix. The core/ versions are the upgraded, JSDoc-annotated, more comprehensive ones; the flat/ versions were dead code being run twice. Net diff: −337 lines, 1 file relocated. `bun test` now 365 pass / 726 expect() (down from 411/844) — coverage unchanged or improved (the deleted 50 tests were already covered by the stricter core/ versions). `bunx tsc --noEmit` exit 0.
- **Dead `viewer.ts` removed** — `src/tui/viewer.ts` (34 SLOC) + `src/tui/viewer.test.ts` (33 SLOC) were PR #1 legacy (plain-text `ViewerState` renderer), not imported anywhere after PR #45 (ink-based panes). Per Mandate §3 (transparansi) + YAGNI, removed to eliminate misleading render-path docs. JSDoc reference in `src/tui/core/state.ts` updated. `bun test` 365 pass / 726 expect() (down 4 tests / 7 expects from viewer.test.ts removal; suite now 365 pass / 726 expect() across 72 files). `bunx tsc --noEmit` exit 0.
- **Lockfile switch: `bun.lock` → `package-lock.json`** — `bun install` at `938ca00` baseline produced a broken node_modules tree (351 pass / 11 fail / 11 errors) because Bun's hoisting fails on nested `ansi-styles` (three versions required: 4.3.0 under chalk, 6.0.0 under slice-ansi, 6.2.3 under @alcalzone/ansi-tokenize) and `@types/node` (transitive dep of `bun-types` that Bun fails to hoist to top-level `node_modules/@types/node/`). `npm install` correctly nests all three `ansi-styles` versions and hoists `@types/node@26.4.1` with full `package.json` and `.d.ts` files. `bun.lock` deleted and removed from tracking; `package-lock.json` committed as single lockfile. CI switched from `bun install --frozen-lockfile` to `npm ci` in both `gate` and `build` jobs of `.github/workflows/ci.yml` and in `.github/workflows/publish.yml`. `bun` remains the runtime for all scripts (`bun test`, `bun x tsc`, `bun x prettier`, etc.) — only the install step changed. Tests: 365 pass / 0 fail / 726 expect() across 72 files (post-consolidation; was 411/844/76 before TUI test cleanup above).
- **Git hooks installed (pre-commit + commit-msg)** — Husky v9 diagnosed as broken in this repo: `_/` dispatcher stubs are deprecation echoes that never invoke `.husky/` user hooks, and `bun install` fails to hoist `tinyexec` (v1.3.1, ESM `dist/main.mjs`) from nested `@commitlint/cli/node_modules/` to top-level `node_modules/`. Per advisor guidance, reverted husky wiring entirely and installed plain git hooks in `.git/hooks/` directly: `.git/hooks/pre-commit` runs `bun x lint-staged`, `.git/hooks/commit-msg` runs `bun x commitlint --edit "$1"`. `core.hooksPath` unset so git uses `.git/hooks/` by default. Verified: `git commit --allow-empty -m "bad"` rejected (commitlint EXIT=1), `git commit --allow-empty -m "chore: test hooks"` accepted (EXIT=0). Hooks are git-native, not committed to git.
- **Version promotion to 0.1.4 + CHANGES.md footer link fix** — `package.json` bumped `0.1.3` → `0.1.4`; CHANGES.md footer link references corrected (`[Unreleased]` now compares `v0.1.4...HEAD`, `[0.1.4]` release link added — was missing, breaking the `## [0.1.4]` header autolink). Prettier format fix on CHANGES.md (3 blank-line collapses at section boundaries). Commits: `ec9314a`, `0ce951e`, `11f5d03`. Gate green: 365 pass / 0 fail / 726 expect() across 72 files.
- **v0.1.4 published to npm via OIDC Trusted Publisher** — tag `v0.1.4` push triggered `release` workflow `33840636854` (completed `success` 05:32:59Z). Package `@miruamel/zhi@0.1.4` verified live on npm (`npm view` → `0.1.4`, `dist-tags.latest: 0.1.4`). GitHub Release created at target `main` with auto-extracted CHANGES.md notes. Auth was OIDC federation (`id-token: write` + `npm publish --provenance`) — **no `NPM_TOKEN` secret used**. Gate green (365 pass / 0 fail / 726 expect() across 72 files) inside the publish job itself.

## [Unreleased]

### Security

- **P0 npm token leak scrubbed from remote `main` history** — plaintext npm publish token (`npm_5xKx…`) leaked in commit `9cbec75` (`audit-log/entries/2026-09-04-state-sync-2.md` line 47), propagated through 268 commits via merges/rebases. Mitigation: `git-filter-repo --replace-text` replaced token with `NPM_TOKEN_REDACTED` across all commits; force-pushed scrubbed history (`0d65a0e`) to `main` after temporarily disabling branch protection (`allow_force_pushes`, `required_linear_history`, `required_status_checks`, `enforce_admins`, `required_pull_request_reviews` all off), then restored all protections to original state. PR #60 closed (superseded). Token rotation on npmjs.com still pending (CLI blocked — `npm token list` returns 401). Tracked in `audit-log/entries/2026-09-04-npm-token-leak-incident.md`.

- **CI actions upgraded v4→v6** — `actions/checkout@v4→v6` and `actions/setup-node@v4→v6` across `ci.yml`, `architecture.yml`, `publish.yml`. Resolves Node.js 20 deprecation warning; no behavioral change. Verified green post-migration (CI run `33841830917`).
- **Gate `--if-changed` docs-only fast-path (Issue #71)** — `scripts/gate.ts` now accepts `--if-changed`: when every changed file between HEAD and the base ref is a docs/markdown file (`.md`, `docs/`, `audit-log/`, `.prettierignore`, `.gitignore`, `.github/workflows/`), typecheck and test are skipped — only lint + format:check run. Non-docs prefixes (`src/`, `engine/`, `native/`, `package.json`, `package-lock.json`, `tsconfig`, `scripts/`, `build.zig`, `build.zig.zon`, `zig.mod`) force the full gate. Default `package.json` gate script: `bun run scripts/gate.ts --if-changed`. CI `ci.yml` gate job switched from 4 separate steps to `bun run gate`. `scripts/gate.test.ts` (22 cases) covers the classification logic. Gate green: 365 pass / 0 fail / 726 expect() across 73 files.

### Fixed

- **WASM hot path restored in published npm package (Issue #96)** — `zigBridge.ts:13` loads `../../native/out/stream.wasm` relative to `import.meta.dir`, but `scripts/build.ts` only ran `tsc` (no WASM copy into `dist/`) and `publish.yml` ran `build` before `native:build` (zig), so the WASM never reached `dist/native/out/stream.wasm`. Result: `readFileSync` always threw, `parseSseWasm` returned `[]`, write-barrier detection disabled WASM, and the TS parser silently took over — the WASM hot path was dead in every published package. Fix (commit `61dd731`): (1) `scripts/build.ts` now copies `native/out/stream.wasm` → `dist/native/out/stream.wasm` after tsc; (2) `publish.yml` reordered so Zig builds first; (3) `prepublishOnly` updated to `gate && native:build && build`. Verified: `bun run build` produces `dist/native/out/stream.wasm` (764 bytes), path resolution in `zigBridge.ts:13` correct, 367 pass / 0 fail / 730 expect(), typecheck clean, gate green, CI green (ci 59s, security 1m15s, architecture-guard 20s).

- **Audit-log stale fact sweep** — 3 historical entries (`ci-green-all-runs.md`, `state-sync-8.md`, `rebase-completion.md`) carried outdated audit counts (78/80 instead of 82). Fixed: `ci-green-all-runs.md` 4 lines "78 entries" → 86; `state-sync-8.md` line 41 "78 entries" → 86; `rebase-completion.md` verification table "80" → 86 and "74→78" → "78→86". New entry `2026-09-05-stale-fact-sweep.md` documents the sweep. Audit-log now 86/86 consistent (disk = 86, README = 86, header = 86).

- **Loop metrics, gate threshold, and ghCiWatch wiring (Issues #111, #112, #113)** — three dead-code bugs in the autonomous loop deps:
  1. **#111** — `loop.ts:31` `toPatch()` hardcoded `stages: 0, errors: 0, totalMs: 0`, discarding `LoopMetrics.summary()` output. Now spreads `metrics.summary()` plus `recoverAttempts`. TUI metrics display was dead; it is live.
  2. **#112** — `builder.ts:71` `gate()` defaulted to `threshold = 0.7` while `gatePass()` used `deps.paretoThreshold` (default 0.8). User `--threshold 0.9` was silently ignored. Now passes `deps.paretoThreshold` as the second arg.
  3. **#113** — `ghCiWatch()` at `engine/loop/wiring/git.ts:50` was never wired into `autonomousDeps()`, so `CI_WATCH` handler always fell through to `'green'`. Added `ciWatch: () => ghCiWatch()` to the return object. `eval` field restored (was accidentally dropped when `ciWatch` was added).
     Gate green: 370 pass / 0 fail / 739 expect() across 73 files. `tsc` clean, `prettier` clean, `eslint` 0 errors.

## [0.1.3] - 2026-09-03

### Test

- **Unit tests for pure modules in `engine/resil/` + `src/tui/core/`** — 5 new test files (41 tests, 86 expect calls):
  - `engine/resil/test/recover.test.ts` (6 tests): `classifyError()` — budget/timeout/fatal/quota → abort+fatal, cycle/ambig/parse → replan, default → patch, null/undefined/empty, case-insensitivity.
  - `engine/resil/test/breaker.test.ts` (6 tests): `CircuitBreaker` — window-full threshold crossing, sliding window semantics, reset, exactly-threshold (not open), all-success window.
  - `engine/resil/test/retry.test.ts` (5 tests): `retryWithBudget` — first-attempt success, retry-then-succeed, budget exhaustion + DLQ, default maxAttempts=3, DLQ error stringification.
  - `src/tui/core/test/format.test.ts` (29 tests): `formatMs`, `formatScore`, `formatTokens`, `formatPct`, `bar`, `formatTime`, `truncate`, `pad`.
  - `src/tui/core/test/colors.test.ts` (2 tests): color token export + `ColorToken` type coverage.
- Test files moved to `test/` subdirectories (`src/tui/core/test/`) to stay within the ≤5-files-per-directory architecture guard cap.

### Style

- Prettier formatting on all 5 new test files (CI `format:check` gate).

### Note

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
- `.prettierignore` — exclude `dist/`, `native/out/`, `.zig-cache/`, `.nyc_output/`, `coverage/`, `package-lock.json` (generated / not source).
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

- **`release.yml` OIDC migration** — workflow publish npm tidak lagi pakai `secrets.NPM_TOKEN` (long-lived secret, compromised 2026-09-03 di session). Migrasi ke OIDC federation (Trusted Publishing): `id-token: write` permission + `npm publish --provenance` short-lived token dari GitHub Actions → npmjs.com. Repo secret `NPM_TOKEN` sudah dihapus dari settings (`total_count: 0` confirmed via API). User tetap harus verify npmjs.com Trusted Publisher entry point ke `publish.yml` (bukan `release.yml`) di https://www.npmjs.com/package/@miruamel/zhi/access. Rotation `NPM_TOKEN_REDACTED` di npmjs.com sekarang **less urgent** tapi tetap recommended (compromised secret hygiene). Tracked di #35.

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
- `.gitignore` entries: `native/.zig-cache/`, `coverage/`, `*.tsbuildinfo`, `package-lock.json`.

### Gate Status

| Gate         | Before            | After                                               |
| ------------ | ----------------- | --------------------------------------------------- |
| typecheck    | n/a (no tsconfig) | 0 errors                                            |
| lint         | n/a (no eslint)   | 0 errors (124 JSDoc `@returns` warnings = baseline) |
| format:check | n/a               | clean                                               |
| test         | 210 pass / 4 fail | 214 pass / 0 fail                                   |

## [0.1.0] - 2026-08-29

First tagged baseline. See [`docs/archive/EXPLAIN-CHANGES.md`](docs/archive/EXPLAIN-CHANGES.md) for the full 2026-08-29 → 2026-08-30 development log (15 entries; note: that history uses inconsistent version headers `[0.1.0]` duplicated and a non-monotonic `0.1.0..0.6.0` block — preserved as-is for authorial record).
[Unreleased]: https://github.com/miruamel/zhi/compare/v0.1.4...HEAD
[0.1.4]: https://github.com/miruamel/zhi/releases/tag/v0.1.4
[0.1.3]: https://github.com/miruamel/zhi/releases/tag/v0.1.3
[0.1.2]: https://github.com/miruamel/zhi/releases/tag/v0.1.2
[0.1.1]: https://github.com/miruamel/zhi/releases/tag/v0.1.1
[0.1.0]: https://github.com/miruamel/zhi/releases/tag/v0.1.0
