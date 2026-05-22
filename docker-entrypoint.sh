#!/bin/sh
set -e

CONFIG_DIR="${CONFIG_DIR:-/config}"
export CONFIG_DIR
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-3000}"

echo "[homepage] Building from config at ${CONFIG_DIR}…"
pnpm build

echo "[homepage] Starting Astro standalone server…"
exec node ./dist/server/entry.mjs
