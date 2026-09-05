#!/usr/bin/env bash
# dev.sh — Start development: install deps + run tests in watch mode

set -e

echo "=== dev: installing deps + starting test watch ==="
npm ci
bun run test:watch
