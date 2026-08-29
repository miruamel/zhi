# Audit: package.json Manifest Gap

- **Date**: 2026-08-29
- **Repo**: miruamel/zhi (local, unpushed)
- **Mandate**: §5.4 (SemVer/maturity), zhi/AGENTS.md ("Root package.json deklarasikan maturity")

## Finding
Repository lacked `package.json` despite project AGENTS.md mandating a root manifest declaring
`maturity` and the mandate requiring SemVer versioning. No dependency manifest, no `bun test`
script entry, no version declaration. Bun-native runtime executed `.ts` directly so tests passed,
but governance metadata was absent.

## Evidence
- `glob /root/zhi/package.json` → Path not found.
- `read /root/zhi/package.json` → not found.
- Code imports: stdlib/Bun only; zero external deps confirmed (no `node_modules`, no import of npm scopes).

## Action
Created `/root/zhi/package.json`:
- `version: 0.1.0` (experimental start per zhi/AGENTS.md: "Zhi mulai experimental (0.y.z)").
- `maturity: experimental`.
- `type: module`, `private: true`, `license: MIT` (LICENSE present).
- `scripts.test: bun test`, `scripts.arch:check: bun run scripts/ci/architecture/check-circular.ts`.
- No `dependencies`/`devDependencies`: Bun-native, zero third-party deps (§5.6 hygiene — no new deps added).

## Risk
Low (additive config; no behavior change; no breaking change). Prep budget §2.1: low-risk (5 min).

## Verification
- `bun test` → 59 pass / 0 fail (unchanged).
- `bun run scripts/ci/architecture/metrics.ts` → 33 files, avg SLOC 32, max 84, 0 god/fat dir (compliant).

## Status
Resolved locally. Will sync with other 20 unpushed commits when GitHub push recovers (§2.11).
