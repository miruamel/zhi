# Audit: fail-closed npm audit gate (#311, PR #312)

**Date:** 2026-09-13
**Issue:** #311
**PR:** #312
**Implementation commit:** `37dd7c3c77fb064ad0d7170c2e0e18808833f9d6`
**Merge commit:** `4849facb5dd22e7884983d507600a92c2f7b086c`

## Context

The security workflow previously ran `npm audit --json` with `|| true`, so dependency findings could not fail the workflow. Issue #311 required a fail-closed gate while retaining the audit JSON as an artifact.

## Changes

- Updated `.github/workflows/security.yml` to capture the npm audit exit status, invoke `scripts/security/audit-gate.mjs`, and upload `/tmp/audit.json` with `if: always()`.
- Added `scripts/security/audit-gate.mjs` to validate report presence, nonempty output, JSON shape, vulnerability-report objects, severity counts, and high/critical blocking.
- Moderate and low findings remain visible and nonblocking at the documented high threshold.
- Added `scripts/security/audit-gate.test.mjs` with valid-report, severity, malformed-report, missing-file, empty-output, and nonzero-status cases.
- Follow-up issue #313 tightened count validation to integers and added array-shape regression cases; the gate now rejects fractional counts and array-shaped vulnerability summaries.

## Verification

- Audit-gate tests: 14 pass, 0 fail, 18 `expect()` calls.
- Full gate before merge: 934 pass, 0 fail, 1863 `expect()` calls across 184 files.
- Lint, Prettier, TypeScript typecheck, architecture guard, dependency-cruiser, gitleaks, CodeQL, and dependency vulnerability scan passed.
- Real npm audit through the gate: `critical=0`, `high=0`, `moderate=0`, `low=0`; npm and gate exited `0`.
- PR #312 merged through GitHub after required checks passed.

## Related

- https://github.com/miruamel/zhi/issues/311
- https://github.com/miruamel/zhi/issues/313
- https://github.com/miruamel/zhi/pull/312
