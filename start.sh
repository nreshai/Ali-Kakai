#!/usr/bin/env bash
# ==============================================================================
# SpecterOS v7.4 - Fast Direct Launcher
# Maintainer: Senior DevOps & Termux Platform Engineer
# File: start.sh
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ -f "$SCRIPT_DIR/alikakai" ]; then
  exec "$SCRIPT_DIR/alikakai" "$@"
else
  export PORT="${PORT:-3000}"
  exec npm run dev -- --host 0.0.0.0 --port "$PORT"
fi
