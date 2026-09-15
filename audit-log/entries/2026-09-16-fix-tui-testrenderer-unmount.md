# 2026-09-16-fix-tui-testrenderer-unmount.md

**@brief** Workflow selesaikan fix `MaxListenersExceededWarning` di TUI test suite (PR #337, issue #336). Perbaikan test-only: `TestRenderer.create()` instances selalu di-unmount via `try/finally`. CHANGES.md net diff nol vs base `f939836`.

**@param** none

**@return** none

**@throw** none

**@see** https://github.com/miruamel/zhi/pull/337
**@see** https://github.com/miruamel/zhi/issues/336

---

## Context

TUI test suite mengeluarkan `MaxListenersExceededWarning` karena `TestRenderer.create()` instances tidak pernah di-unmount. React `useInput` listeners menumpuk setiap render; `use-input.js:90-93` sudah benar (`process.removeListener` di cleanup), tapi React tidak pernah jalankan cleanup karena renderer tidak pernah di-unmount.

Issue #335 dilaporkan sebagai duplicate dari #336 (sama akar penyebab). #335 ditutup dengan label `duplicate` dan komentar merujuk ke #336.

## What happened

| Step | Result |
| --- | --- |
| Issue #335 | Ditutup sebagai duplicate, label `duplicate` ditambahkan, komentar rujuk ke #336. |
| Issue #336 | Body diperbaiki: leak spesifik adalah `useInput` listeners, bukan "setiap render". |
| `src/tui/core/test/render/render.ts` | `renderToString` wrap `toJSON()` + `extractText()` dalam `try/finally { renderer.unmount(); }`. Dropped `as any` cast. `extractText(node: any)` → `extractText(node: unknown)` dengan guard `'children' in node`. |
| `src/tui/panes/middle/inspector/inspector.test.tsx` line 78 | Direct `TestRenderer.create` wrap dalam `try/finally { renderer.unmount(); }`. |
| Verifikasi caller | Semua `TestRenderer.create` di `src/tui/` (2 caller) sudah punya `unmount` yang match. |
| Full suite | 937 pass, 0 fail, 1866 expect() across 184 files, zero `MaxListenersExceededWarning` di stderr. |
| `tsc --noEmit` | Clean, exit 0. |
| CHANGES.md | Net diff nol vs base `f939836`. Unreleased section ditambahkan lalu di-drop; sisa satu blank line yang di-commit (`8ef8bd9`). |
| PR #337 | Body di-update via `gh api -X PATCH` (workaround `gh pr edit` yang gagal karena Projects classic tidak didukung). Stat diperbaiki: 2 file, bukan 3. |

## Alternatives Rejected

- Naikkan `defaultMaxListeners` — mask leak, tidak fix akar penyakit.
- Wrap `useInput` dalam `useCallback` — bukan akar penyakit.
- Modifikasi `use-input.js` / `StdinContext.js` — tinggal di `node_modules/ink/`, sudah benar.

## Verification

- `bun test --isolate` (rerun 2026-09-16, `set -o pipefail`, full stdout/stderr di `/tmp/suite.out` + `/tmp/suite.err`): **937 pass, 0 fail, 1866 expect() calls, Ran 937 tests across 184 files**. Exit 0.
- Zero `MaxListenersExceededWarning` di `/tmp/suite.err` (11 baris, tidak ada match).
- `git diff f939836 HEAD --stat`: 3 file. Detail add/delete: `render.ts` +9/-5, `inspector.test.tsx` +13/-8, `audit-log/entries/2026-09-16-fix-tui-testrenderer-unmount.md` +55/-0. CHANGES.md tidak muncul.
- `gh api repos/miruamel/zhi/pulls/337/files`: 3 file (setelah commit audit entry `16395ab`), CHANGES.md tidak ada.

## Security

Tidak ada secret, tidak ada perubahan dependensi, tidak ada akses baru. Test-only change.

## Status

- PR #337 open di branch `fix/tui-testrenderer-unmount`, head `16395ab`. `gh pr checks 337`: Build TypeScript + Native WASM **pass**, CodeQL **pass**, Dependency Vulnerability Scan **pass**, Gate (lint + format + typecheck + test + arch) **pass**, Secret Detection (gitleaks) **pass**, invariants **pass**, Devin Review **pass**, Kilo Code Review **pass**. Siap untuk merge.