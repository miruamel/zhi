#!/usr/bin/env bash
# Build native/stream → native/out/stream.wasm (gitignored).
# NOTE: `zig build` runner hangs in this environment; use direct build-lib.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p ../out
zig build-lib parse.zig \
  -target wasm32-freestanding \
  -O ReleaseSmall \
  -dynamic -rdynamic -fPIC \
  -femit-bin=../out/stream.wasm
# Self-diagnose: -femit-bin path may be ignored on some Zig versions
# (wasm emitted to default name in CWD). Verify magic, fallback to copy.
if ! head -c 4 ../out/stream.wasm 2>/dev/null | grep -q $'\0asm'; then
  emitted=$(find . -maxdepth 1 -name '*.wasm' | head -1)
  if [ -n "$emitted" ]; then
    cp "$emitted" ../out/stream.wasm
  else
    echo "ERROR: zig build-lib emitted no .wasm"; exit 1
  fi
fi
head -c 4 ../out/stream.wasm | grep -q $'\0asm' \
  || { echo "ERROR: native/out/stream.wasm not valid wasm"; exit 1; }
echo "ok: native/out/stream.wasm built ($(wc -c < ../out/stream.wasm) bytes)"
