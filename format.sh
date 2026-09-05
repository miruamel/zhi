#!/usr/bin/env bash
# format.sh — Format code with Prettier

set -e

echo "=== format: formatting code ==="
bun run format
echo "=== format: done ==="
