#!/usr/bin/env bash
# Build native/stream → native/out/stream.wasm (gitignored).
# NOTE: `zig build` runner hangs in this environment; use direct build-lib.
# build-lib emits an ar archive wrapping the wasm32 object — extract it.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p ../out

# Resolve zig: honor ZIG_BIN if set, then try candidates.
# PATH may point to a stripped ELF that cannot find its own install directory.
zig_bin="${ZIG_BIN:-}"
if [ -z "$zig_bin" ] || ! "$zig_bin" build-lib --help >/dev/null 2>&1; then
  zig_candidates=(
    "/tmp/zig-linux-aarch64-0.14.0/zig"
    "$(command -v zig 2>/dev/null || true)"
  )
  zig_bin=""
  for cand in "${zig_candidates[@]}"; do
    [ -z "$cand" ] && continue
    [ -x "$cand" ] || continue
    if "$cand" build-lib --help >/dev/null 2>&1; then
      zig_bin="$cand"
      break
    fi
  done
fi
if [ -z "$zig_bin" ]; then
  echo "ERROR: no usable zig binary found in ZIG_BIN, PATH, or candidates"; exit 1
fi

# -dynamic is rejected by wasm32-freestanding target (Zig 0.14.0).
# -rdynamic and -fPIC are also unnecessary for freestanding wasm.
# build-lib wraps the wasm32 object in an ar archive; extract the member.
# Use a temp dir to avoid ar's path-in-member-name rejection.
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
"$zig_bin" build-lib parse.zig \
  -target wasm32-freestanding \
  -O ReleaseSmall \
  -femit-bin="$tmpdir/stream.wasm"

# build-lib emits an ar archive (magic "!<arch>") wrapping the wasm32 object.
# ar member names include the emit-bin path, so extract in a temp dir.
if head -c 4 "$tmpdir/stream.wasm" 2>/dev/null | grep -q '!<arch'; then
  (cd "$tmpdir" && ar x stream.wasm)
  # Find the extracted member with wasm magic.
  for f in "$tmpdir"/*.o; do
    [ -f "$f" ] || continue
    if head -c 4 "$f" 2>/dev/null | grep -q $'\0asm'; then
      cp "$f" ../out/stream.wasm
      break
    fi
  done
else
  cp "$tmpdir/stream.wasm" ../out/stream.wasm
fi

# Verify wasm magic.
head -c 4 ../out/stream.wasm | grep -q $'\0asm' \
  || { echo "ERROR: native/out/stream.wasm not valid wasm"; exit 1; }
echo "ok: native/out/stream.wasm built ($(wc -c < ../out/stream.wasm) bytes)"