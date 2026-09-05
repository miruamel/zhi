#!/usr/bin/env bash
# ci.sh — Run all CI checks locally (mirrors GitHub Actions)

set -e

echo "=== ci: arch check ==="
bun run arch:check
bun run arch:metrics
bash .github/workflows/architecture-guard.sh

echo "=== ci: gate ==="
bun run gate

echo "=== ci: all checks passed ==="
