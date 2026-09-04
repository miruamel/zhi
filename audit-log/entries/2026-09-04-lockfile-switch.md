# 2026-09-04 — Lockfile switch: bun.lock → package-lock.json

## Context

`bun install` at commit `938ca00` baseline produced a **broken node_modules tree**: 351 pass / 11 fail / 11 errors. Root cause: Bun's hoisting algorithm fails on two nested dependency chains:

1. **`ansi-styles`**: three versions required (4.3.0 under `chalk`, 6.0.0 under `slice-ansi`, 6.2.3 under `@alcalzone/ansi-tokenize`). Bun hoists only one version to top-level, breaking the other two.
2. **`@types/node`**: transitive dep of `bun-types@1.4.0` that Bun fails to hoist to top-level `node_modules/@types/node/`. The directory exists but is empty of `package.json` and `.d.ts` files. `npm ls @types/node` shows: `bun-types@1.4.0 -> @types/node@` (deduped, empty version). Not a direct dependency in `package.json`.

`npm install` correctly nests all three `ansi-styles` versions in their respective parent `node_modules` directories and properly hoists `@types/node@26.4.1` with full `package.json` and `.d.ts` files. Tests: 411 pass / 0 fail / 844 expect() across 76 files.

## What was done

- **`bun.lock` deleted and removed from tracking** — was tracked, now deleted. `git rm bun.lock`
- **`package-lock.json` committed** as single source of truth for reproducible installs
- **CI switched from `bun install --frozen-lockfile` to `npm ci`** in both `gate` and `build` jobs of `.github/workflows/ci.yml`
- **`bun` remains the runtime** for all scripts (`bun test`, `bun x tsc`, `bun x prettier`, etc.) — only the install step changed
- **Stale references cleaned**: `.gitignore` comment, `.prettierignore` lockfiles section, and CHANGES.md `[0.1.2]` section all updated from `bun.lock`/`bun install --frozen-lockfile` to `package-lock.json`/`npm ci`

## Verification

- `npm ci` → clean install, all 314 packages resolved
- `bun test` → 411 pass / 0 fail / 844 expect() across 76 files (pre-merge count)
- `bun x tsc --noEmit` → 0 errors
- `bun x prettier --check` → all files clean
- Architecture guard → all checks passed
- `npm ls ansi-styles` → confirms proper nesting: `ansi-styles@4.3.0` under chalk, `ansi-styles@6.2.3` under slice-ansi/wrap-ansi/@alcalzone/ansi-tokenize
- `npm ls @types/node` → `@types/node@26.4.1` properly hoisted to top-level

## Risk assessment

- **Medium risk**: changes CI install path. `npm ci` requires `package-lock.json` to be committed and in sync with `package.json`. Any `package.json` change requires regenerating the lockfile.
- **Rollback**: revert commits `6ddf1c4` + `7463611`, restore `bun.lock` from git history, switch CI back to `bun install --frozen-lockfile`. Known: this produces the broken tree (351/11/11).
- **Follow-up (P2)**: monitor whether Bun fixes hoisting for `ansi-styles` and `@types/node` chains. If fixed, can switch back to `bun install` + `bun.lock` for faster CI. Tracked in CHANGES.md `[Unreleased]`.

## Files changed

- `bun.lock` — deleted (was tracked)
- `package-lock.json` — committed (was untracked)
- `.github/workflows/ci.yml` — `bun install --frozen-lockfile` → `npm ci` in `gate` and `build` jobs
- `.gitignore` — stale `bun.lock` comment replaced with `package-lock.json` reference
- `.prettierignore` — `bun.lock` → `package-lock.json` in lockfiles section
- `CHANGES.md` — `[0.1.2]` section stale bun.lock refs fixed; `[Unreleased]` lockfile switch entry added

## Related

- Commit `6ddf1c4`: `chore(deps): drop broken bun.lock; npm ci is the install path`
- Commit `7463611`: `chore(deps): switch to npm lockfile; fix stale bun.lock refs in docs`
- Lost in merge `92a4b74` (upstream merge overwrote audit-log directory state)
- `git log --oneline --all -- audit-log/entries/2026-09-04-lockfile-switch.md` returns nothing — entry is not in any branch