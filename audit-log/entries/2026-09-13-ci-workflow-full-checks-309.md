# CI workflow changes force full gate

## Resolved 2026-09-13

- **Actor:** `miruamel`
- **Issue:** #309
- **Implementation PR:** #310
- **Audit PR:** #316
- **Impact:** CI workflow edits now run the full gate; this record preserves root cause, security hardening, verification, and repository state.
- **Rollback:** Revert PR #316 for documentation only; implementation remains in PR #310.
- Root cause: `scripts/gate.ts --if-changed` classified `.github/workflows/*` as documentation, so CI workflow changes skipped TypeScript typecheck and tests.
- Fix: workflow changes now force the full gate. Missing or unusable changed-file discovery also fails closed instead of falling back to a docs-only result.
- Security hardening: `GITHUB_BASE_REF` is passed to Git through `execFileSync` argv with `--end-of-options`; crafted shell and Git-option references are covered by regression tests.
- Focused verification: `bun test scripts/gate.test.ts` — 6 pass, 0 fail, 30 expectations.
- Full verification: `bun run scripts/gate.ts` — lint, Prettier, TypeScript typecheck, and tests passed; 937 pass, 0 fail, 1866 expectations across 184 files.
- Dependency verification: `npm audit` and `npm audit --omit=dev` — 0 vulnerabilities each.
- PR verification: Devin Review, Kilo Code Review, and both invariants checks passed for PR #310.
- Final repository state: `main` at `70bdb92d71a6`, clean; historical branch `fix/gate-workflow-full-checks-308` is an ancestor of `main`. No duplicate open PR found.
- Project-board update attempted through `gh project list`; blocked by missing `read:project` token scope.
