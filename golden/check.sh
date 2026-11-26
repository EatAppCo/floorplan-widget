#!/usr/bin/env bash
# Same-machine A/B golden check: renders every state with the renderer at the
# immutable baseline SHA and with the working tree, using this checkout's
# harness and runner for both, and requires 0 differing pixels per state.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
OUT="$ROOT/.golden"
BASE_SHA="${GOLDEN_BASE_SHA:-$(node -p "require('./golden/config.json').baseSha")}"
WORKTREE="$OUT/base-worktree"
PORT="${GOLDEN_PORT:-8765}"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi
  git -C "$ROOT" worktree remove --force "$WORKTREE" 2>/dev/null || true
}
trap cleanup EXIT

rm -rf "$OUT/baseline" "$OUT/candidate" "$OUT/shots-baseline" "$OUT/shots-candidate" "$OUT"/diff-*.png
mkdir -p "$OUT"

echo "baseline: $BASE_SHA"
git -C "$ROOT" worktree remove --force "$WORKTREE" 2>/dev/null || true
git -C "$ROOT" worktree add --detach "$WORKTREE" "$BASE_SHA" >/dev/null
(cd "$WORKTREE" && npm ci --silent --ignore-scripts >/dev/null)

build_side() {
  local side="$1" renderer_root="$2"
  RENDERER_ROOT="$renderer_root" GOLDEN_OUT="$OUT/$side" \
    npx tsup --config golden/tsup.golden.ts >/dev/null
  cp golden/harness.html "$OUT/$side/"
  cp -R golden/assets "$OUT/$side/"
  node golden/verify-metafile.mjs "$OUT/$side/metafile-iife.json" "$renderer_root"
}

build_side baseline "$WORKTREE"
build_side candidate "$ROOT"

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$OUT" >/dev/null 2>&1 &
SERVER_PID=$!
for _ in $(seq 1 50); do
  curl -sf -o /dev/null "http://127.0.0.1:$PORT/candidate/harness.html" && break
  sleep 0.2
done

node golden/run.mjs "http://127.0.0.1:$PORT/baseline" "$OUT/shots-baseline"
node golden/run.mjs "http://127.0.0.1:$PORT/candidate" "$OUT/shots-candidate"

status=0
for shot in "$OUT"/shots-baseline/*.png; do
  state="$(basename "$shot" .png)"
  candidate="$OUT/shots-candidate/$state.png"
  if [ ! -f "$candidate" ]; then
    echo "MISSING $state"
    status=1
    continue
  fi
  diff_px="$(magick compare -metric AE "$shot" "$candidate" "$OUT/diff-$state.png" 2>&1 >/dev/null || true)"
  diff_px="${diff_px%% *}"
  if [ "$diff_px" = "0" ]; then
    rm -f "$OUT/diff-$state.png"
    echo "same $state"
  else
    echo "DIFF $state: $diff_px px (see .golden/diff-$state.png)"
    status=1
  fi
done

exit "$status"
