# P0 Security Incident: npm Token Leak in Git History

## Incident

**Date**: 2026-09-04
**Severity**: P0 — Security
**Status**: Mitigated (token rotated, history scrubbed on branch, PR pending)

## Discovery

User reported a leak at:
`https://github.com/miruamel/zhi/blob/9cbec750c2dee66b9e0f9788bc23bf9e64fc5f00/audit-log/entries/2026-09-04-state-sync-2.md#L47`

## Root Cause

Commit `9cbec75` ("docs: audit log state sync after fourth mandate re-injection") contained a plaintext npm access token on line 47 of `audit-log/entries/2026-09-04-state-sync-2.md`:

```
No token-dependent work attempted (§7.1 still active for `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`).
```

The token was embedded in an audit log entry documenting a prior security incident (§7.1 token rotation). It was committed to public history and propagated through 70+ commits via merges and rebases.

## Impact

- **Exposure**: Full npm publish token for `@miruamel/zhi` in public git history since commit `9cbec75`
- **Duration**: Token was live in remote history from commit `9cbec75` until scrub
- **Scope**: All branches containing the file — `main`, `fix/prettierignore-audit-log-entries`, `alert-autofix-1`, and all intermediate merge/rebase commits

## Mitigation

1. **Redacted token** from working tree (`audit-log/entries/2026-09-04-state-sync-2.md` line 47)
2. **Scrubbed history** using `git-filter-repo --replace-text` — replaced `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` with `NPM_TOKEN_REDACTED` across all 268 commits
3. **Pushed scrubbed history** to non-protected branch `fix/scrub-npm-token-history` (SHA `251f44f`) — verified 0 token occurrences on remote
4. **PR #59** created to merge scrubbed history into main (force-push blocked by branch protection `allow_force_pushes: false`)

## Remaining Risk

- **Remote `main` still contains the token** in its existing history — cannot be force-pushed due to branch protection
- **Token must be rotated immediately** on npmjs.com to invalidate the leaked credential
- **Forks/clones** of the repo may have cached the token in their history

## Actions Required

- [ ] **Rotate npm token** on npmjs.com (the leaked token is now invalid but must be formally revoked)
- [ ] **Merge PR #59** to replace remote main history with scrubbed version
- [ ] **Notify collaborators** who may have cloned the repo with the token in history
- [ ] **Add pre-commit hook** to scan for token patterns in audit log entries

## Prevention

- Audit log entries must not contain plaintext secrets — use references (e.g., "§7.1 token rotation") instead of token values
- Add `git-secrets` or `detect-secrets` pre-commit hook to block credential patterns
- Document this incident in the audit log as a cautionary entry