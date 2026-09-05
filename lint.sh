#!/usr/bin/env bash
# lint.sh — Run linter with optional auto-fix

set -e

if [ "$1" = "--fix" ]; then
  echo "=== lint: fixing ==="
  bun run lint:fix
else
  echo "=== lint: checking ==="
  bun run lint
fi
