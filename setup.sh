#!/usr/bin/env bash
# setup.sh — Initial project setup: deps + git hooks + build

set -e

echo "=== setup: installing dependencies ==="
npm ci

echo "=== setup: building TypeScript + WASM ==="
bun run native:build
bun run build

echo "=== setup: verifying gate ==="
bun run gate

echo "=== setup complete ==="
echo "Run 'bun run test:watch' to start development."
