# 2026-09-16-dependabot-react-test-renderer-ignore.md

**@brief** PR #326 added react-test-renderer to dependabot ignore with `update-types: ["version-update:semver-major"]` (scoped, not blanket). Supersedes PR #319.

**@param** none

**@return** none

**@throw** none

| Hasil | Detail |
| --- | --- |
| PR #326 | `chore(deps): add react-test-renderer to dependabot ignore`, branch `chore/dependabot-ignore-react-test-renderer`, commit `cd2b32b`. |
| Issue #325 | Created, closed after PR merge. |
| PR #319 | Already closed (superseded). |

**@see** https://github.com/miruamel/zhi/pull/326

---

## Context

PR #319 (react-test-renderer 18.3.1 → 19.3.0) failed CI with `ERESOLVE`: react-test-renderer@19.3.0 requires `react@^19.0.0` but root project pins `react@18.3.1`; `ink@4.4.1` peer requires `react@>=18.0.0` (incompatible with 19).

## Decision

Add react-test-renderer to `.github/dependabot.yml` ignore with `update-types: ["version-update:semver-major"]` — blocks only the unsafe React 19 major bump while keeping patch/minor/security updates eligible.

**Alternatives considered**:

| Alternative | Verdict |
| --- | --- |
| Upgrade react to 19 | Major bump, breaks ink@4.4.1 peer, cascades through entire TUI stack. Unsafe blind upgrade. |
| Remove react-test-renderer | Not viable — it IS used in `src/tui/core/test/render/render.ts` and `src/tui/panes/middle/inspector/inspector.test.tsx`. |
| Blanket ignore (all updates) | Rejected — would block security patches too. Scoped `version-update:semver-major` is strictly better. |
| Scoped ignore (chosen) | Blocks only the unsafe major bump; patch/minor/security updates still flow automatically. |

## Verification

- [x] Config change only — no code, no tests needed.
- [x] CI green on PR #326: Gate, invariants, CodeQL, dependency scan, secret detection, build all SUCCESS.
- [x] `npm audit` clean (0 vulnerabilities).
- [x] `tsc --noEmit` clean, `eslint --quiet` clean.

## Related

- Closes #325
- Supersedes #319