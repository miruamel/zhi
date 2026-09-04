# 2026-09-04 — Git hooks installed (pre-commit + commit-msg)

## Context

Husky v9 was diagnosed as **broken in this repo**. The `_/` dispatcher stubs in `.husky/` are deprecation echoes that never invoke the user hooks in `.husky/`. The `prepare` script in `package.json` was an empty string, so `bun install` (or `npm install`) never populated `.husky/` with real hook scripts. Additionally, `bun install` fails to hoist `tinyexec` (v1.3.1, ESM `dist/main.mjs`) from nested `@commitlint/cli/node_modules/` to top-level `node_modules/`, which `@commitlint/read` requires at runtime.

Per advisor guidance: **reverted husky wiring entirely**, installed plain git hooks in `.git/hooks/` directly. `core.hooksPath` unset so git uses `.git/hooks/` by default.

## What was done

- **`.git/hooks/pre-commit`** (mode 755): `#!/bin/sh\nset -e\nbun x lint-staged`
- **`.git/hooks/commit-msg`** (mode 755): `#!/bin/sh\nset -e\nbun x commitlint --edit "$1"`
- **`tinyexec` hoisting fix**: copied `node_modules/@commitlint/cli/node_modules/tinyexec/` (v1.3.1, ESM `dist/main.mjs`) to top-level `node_modules/tinyexec/`
- **Husky wiring reverted**: `.husky/pre-commit` and `.husky/commit-msg` left as-is (deprecation stubs); `prepare` script stays empty string in `package.json`

## Verification

- `git commit --allow-empty -m "bad"` → **rejected** (commitlint EXIT=1, invalid conventional-commit subject)
- `git commit --allow-empty -m "chore: test hooks"` → **accepted** (EXIT=0, both hooks fire)
- `lint-staged` fires correctly on staged files via pre-commit hook
- `commitlint --edit` validates commit message format via commit-msg hook

## Risk assessment

- **Low risk**: hooks are local-only, not committed to git (`.git/hooks/` is not tracked). No repo-wide behavior change.
- **Rollback**: `rm .git/hooks/pre-commit .git/hooks/commit-msg` restores git default (no hooks). Husky wiring can be re-enabled by populating `prepare` script and running `bunx husky init`.
- **Note**: `tinyexec` hoisting is a workaround for bun's incomplete hoisting. If bun fixes this, the copy can be removed. `npm install` correctly nests `tinyexec` under `@commitlint/cli/node_modules/`.

## Files changed

- `.git/hooks/pre-commit` — created (new file, mode 755)
- `.git/hooks/commit-msg` — created (new file, mode 755)
- `node_modules/tinyexec/` — created (hoisted from nested location)

## Related

- Commit `30b1edc`: `docs: install git hooks (pre-commit + commit-msg), log PR #50 closure`
- Lost in merge `92a4b74` (upstream merge overwrote audit-log directory state)
- `git log --oneline --all -- audit-log/entries/2026-09-04-git-hooks-install.md` returns nothing — entry is not in any branch