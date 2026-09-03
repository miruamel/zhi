---
name: Bug report
about: Something Zhi did is wrong, broken, or unexpected
title: '[bug] '
labels: bug
assignees: ''
---

## What happened

<!-- One or two sentences. -->

## What I expected

<!-- One or two sentences. -->

## Reproduction

```bash
# minimal reproduction — the actual command(s) you ran
zhi run "..." --repo ./... --base main --budget ...
```

## Environment

- Zhi version: `zhi --version` (or commit SHA)
- Bun version: `bun --version`
- OS: (e.g. macOS 14, Ubuntu 24.04, Windows 11 + WSL2)
- Model backend: (9router / OMP / local — don't share the key)

## Logs / output

<!-- Paste the relevant log lines. The ledger is at `KB/ledger/<runId>.jsonl`. Redact any secrets. -->

## Screenshot / recording

<!-- Optional. Especially helpful for TUI bugs. -->

## Severity

<!-- One of: blocker (can't proceed), high (workaround needed), medium (annoying), low (cosmetic). -->
