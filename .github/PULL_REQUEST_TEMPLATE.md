## What

<!-- One or two sentences: what does this PR change? -->

## Why

<!-- What's the user-visible problem or opportunity? Link to the issue. -->

## How

<!-- High-level: which modules, which approach. -->

## Checklist

<!-- Per `docs/standards/commit.md` §7. Tick what applies. -->

- [ ] Typecheck passes (`bun run typecheck`)
- [ ] Lint passes (`bun run lint`)
- [ ] Format clean (`bun run format:check`)
- [ ] Tests pass (`bun test`) — new tests added for new behavior
- [ ] Coverage ≥ 80% (when applicable)
- [ ] `@brief` on every new public symbol
- [ ] `CHANGES.md` updated under `## [Unreleased]` (when behavior changes)
- [ ] Cross-link docs updated (when relevant)
- [ ] Arch guard clean (`bun run arch:check`)
- [ ] No new circular deps, no illegal layer edges

## Test plan

<!-- How did you verify? What's the test scenario? Paste the run output for confidence. -->

```bash
$ bun test
...
$ bun run arch:check
...
```

## Screenshots / recordings

<!-- Especially for TUI / docs / asset changes. -->

## Breaking changes

<!-- None / list of migrations. -->

## Linked issues

<!-- Fixes #..., relates to #..., depends on #... -->
