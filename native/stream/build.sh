#!/usr/bin/env bash
# Build native/stream → native/out/stream.wasm (gitignored).
# NOTE: `zig build` runner hangs in this environment; use direct build-lib.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p ../out
zig build-lib parse.zig \
  -target wasm32-freestanding \
  -O ReleaseSmall \
  -femit-bin=../out/stream.wasm
