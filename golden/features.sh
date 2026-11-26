#!/usr/bin/env bash
# Candidate-only browser checks of the opt-in features (inspects real Fabric
# objects). Not compared with the baseline: these options don't exist there.
set -euo pipefail

cd "$(dirname "$0")/.."
OUT="$PWD/.golden"
PORT="${GOLDEN_PORT:-8766}"
SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

RENDERER_ROOT="$PWD" GOLDEN_OUT="$OUT/features" npx tsup --config golden/tsup.golden.ts >/dev/null
cp golden/harness.html "$OUT/features/"
cp -R golden/assets "$OUT/features/"

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$OUT" >/dev/null 2>&1 &
SERVER_PID=$!
for _ in $(seq 1 50); do
  curl -sf -o /dev/null "http://127.0.0.1:$PORT/features/harness.html" && break
  sleep 0.2
done

node golden/run.mjs "http://127.0.0.1:$PORT/features" "$OUT/shots-features" features
