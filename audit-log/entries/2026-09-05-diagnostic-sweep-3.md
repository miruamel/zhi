# 2026-09-05 Diagnostic Sweep #3 — Issue #117–#122 Verification

## Summary
Third autonomous diagnostic sweep. All gates green. Verified all six issues from prior sweep (#117–#122) against source: **zero actionable findings**. All 6 are either already fixed or false positives from prior session's summary.

## Phase 1: Symptom Gathering
- `bun test --max-concurrency=2`: 370 pass, 0 fail, 742 `expect()` calls
- `bun run typecheck`: clean
- `bun run gate`: all checks passed
- `gh run list`: 5/5 success (ci, security, architecture-guard, stale)
- Code scanning: 3 `actions/missing-workflow-permissions` (all `fixed`)
- Secret scanning: 0
- Dependabot: 0
- Open issues: #115 only (debt, triaged)

## Phase 2: Issue Verification

### #117 (Critical) — toPatch() hardcodes metrics to zero
**Verdict: Already fixed.** `loop.ts:29` reads `metrics: { ...metrics.summary(), recoverAttempts: metrics.recoverAttempts }`. The `summary()` method at `metrics.ts:33-40` returns `{ totalMs, errors, stages, recoverAttempts }` — `recoverAttempts` is included. Fix applied at commit `ea6d7ab`. No action needed.

### #118 (High) — retryWithBudget swallows non-fatal errors
**Verdict: False positive.** `recover.ts:18-22` — `classifyError()` uses message-pattern matching (`/budget|timeout|fatal|quota/i`), not `instanceof Error`. No `isFatalError()` function exists. No `instanceof TypeError` or `instanceof Error` checks anywhere in the codebase (grep confirmed 0 matches). The claim in the prior summary does not match the code.

### #119 (Medium) — --dry-run blocked, 404 info disclosure
**Verdict: False positive.** `autonomous-deps.ts:15-17` — when `ZHI_AUTO_PR !== '1'`, returns `base` (offline deps) directly. No HTTP call, no `--dry-run` flag, no 404. The function is an intentional offline fallback, not a security vulnerability.

### #120 (Low) — temp dir leak /tmp/zhi-critique-*
**Verdict: False positive.** The `/tmp/zhi-critique-*` directories visible in gate output come from `critique-repo-traversal.test.ts:19` (`mkdtempSync(join(tmpdir(), 'zhi-critique-'))`). The test file has proper cleanup at `afterEach:29` (`rmSync(tmp, { recursive: true, force: true })`). `critique-repo.ts` itself creates no temp directories. The only `mktemp -d` in the repo is `native/stream/build.sh:34` with `trap 'rm -rf "$tmpdir"' EXIT` at line 35 — proper cleanup.

### #121 (Medium) — secrets regex matches /* inside strings
**Verdict: False positive.** `security.ts:6-11` defines 4 regex patterns. None contain `s/\/\*/`. The patterns are:
1. `/(?:api[_-]?key|secret|token|password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}/i`
2. `/sk-[A-Za-z0-9]{20,}/`
3. `/ghp_[A-Za-z0-9]{20,}/`
4. `/AKIA[0-9A-Z]{16}/`
No `/*` matching pattern exists. The claim in the prior summary does not match the code.

### #122 (Tech Debt) — critic.ts duplicates check-circular.ts
**Verdict: False positive.** `critic.ts` (runtime critic, `engine/critic/plant/imports/critic.ts`) and `check-circular.ts` (CI guard, `scripts/ci/architecture/check-circular.ts`) serve different purposes:
- `critic.ts`: Returns a `Critique` score for the runtime loop's Pareto aggregation
- `check-circular.ts`: CI gate that exits with non-zero on violation
They share the concept of "deep relative import detection" but operate at different layers (runtime vs CI) with different output contracts. Not a duplication issue.

## Phase 3: Structural Analysis
- Engine→engine imports: 0 cycles
- src→engine boundary: clean (all imports are `@engine/` alias, no relative engine imports from src)
- TODO/FIXME/XXX markers in source: 0 (only `engine/critic/plant/todo/critic.ts:5` which is the detector regex itself)
- Console statements in source: 7 across 4 files, all legitimate (CLI output, logger sink default)
- Bare `catch {}` blocks: 6, all verified as fail-closed patterns
- `throw new Error(...)`: 16 across 8 files, all legitimate validation guards
- Largest source file: 147 lines (`engine/stream/zigBridge.ts`)
- `dist/` is gitignored, not tracked — the `recoverAttempts` references in `dist/` are build artifacts

## Phase 4: Dependency Health
- 4 packages remain outdated (@types/react, ink, react, typescript) — all blocked by upstream incompatibilities
- React 19 upgrade remains the linchpin
- Dependabot: 0 active alerts

## Phase 5: Audit-Log Consistency
- 90 entries on disk, 90 entries in README, header count = 90 — consistent

## Outcome
**No new issues filed.** All six prior-sweep issues verified as non-actionable. System healthy. Only open issue is #115 (dependency drift, triaged, awaiting upstream readiness).