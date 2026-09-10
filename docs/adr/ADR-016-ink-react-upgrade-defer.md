# ADR-016: Defer ink 7.1.1 + react 19.3.0 major upgrade

## Status
Accepted (deferred — no action in v0.1.13)

## Context
- Current: `ink@4.4.1`, `react@18.3.1`. `tsc --noEmit` passes clean.
- Available: `ink@7.1.1` (React 19 compatible), `react@19.3.0`.
- Ink v4→v7 spans major reconciler changes, ESM-only transition, and React 19 peer requirement.
- React 19 removes `forwardRef`, changes effect cleanup timing, requires New JSX Transform.

## Decision
**Defer the upgrade.** Do not bump ink or react in v0.1.13.

## Justification
1. **Risk/reward asymmetry**: Ink v4.4.1 + React 18.3.1 is a stable, well-tested combination. The TUI is functional and passing all quality gates. A major bump risks breaking the rendering pipeline with no user-visible benefit.
2. **Upgrade impact is low**: Codebase audit shows:
   - Zero `forwardRef` usages (React 19 deprecation irrelevant)
   - All `useEffect` have proper cleanup functions
   - `useInput`/`useStdin`/`useStdout` usage is standard Ink API, stable across v4→v7
   - `import React` already removed from 4 of 6 pane files (New JSX Transform already in use via `jsx: "react-jsx"`)
3. **Version strategy**: v0.1.x is intentionally slow (project complex, hard to implement). A major dependency bump without a corresponding feature milestone violates the "slow and steady" principle.
4. **No security pressure**: `npm audit` shows 0 vulnerabilities. No CVE forces the upgrade.

## When to Revisit
- Next MAJOR version (v0.2.0 or v1.0.0) — major deps should align with major product version
- If Ink v4 reaches EOL or stops receiving security patches
- If a feature requires React 19 APIs (`useActionState`, `useTransition`)

## Alternatives Considered
- **Upgrade now**: Rejected — high risk, low reward, no feature driving it.
- **Upgrade to ink v5/v6 (React 18 compatible)**: Rejected — intermediate versions still require reconciler changes; no clear benefit over staying on v4.4.1.
- **Pin and monitor**: Accepted — keep current versions, track ink/react releases, upgrade when a feature requires it.

## Date
2026-09-11

## Author
@miruamel