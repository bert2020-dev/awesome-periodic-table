#!/usr/bin/env bash
# Awesome Periodic Table -- Linux/macOS build helper
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "Awesome Periodic Table -- Unix build"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js was not found on PATH." >&2
  echo "Install Node.js LTS from https://nodejs.org/ and try again." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm was not found on PATH. Install Node.js with npm included." >&2
  exit 1
fi
if ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then
  echo "ERROR: Python 3 was not found on PATH." >&2
  echo "Install Python 3 using your distribution's package manager and try again." >&2
  exit 1
fi

mode="${1:-build}"
case "$mode" in
  all) mode="build:all" ;;
  build|build:plain|build:arcager|build:arcager:brotli|build:arcager:gzip|build:all|release|check|test)
    ;;
  *)
    echo "Usage: bash build.sh [build|plain|build:plain|build:arcager|build:arcager:brotli|all|release|test]" >&2
    exit 2
    ;;
esac

echo "Using Node: $(node --version)"
echo "Using npm:  $(npm --version)"
if command -v python3 >/dev/null 2>&1; then
  echo "Using Python: $(python3 --version)"
else
  echo "Using Python: $(python --version)"
fi
echo
if [[ ! -d node_modules ]]; then
  echo "Installing project dependencies..."
  npm install
  echo
fi

npm run "$mode"

echo
echo "Command completed successfully."
case "$mode" in
  build|build:all|release)
    echo "Output: dist/plain/awesome-periodic-table.html"
    echo "        dist/arcager/awesome-periodic-table.html"
    ;;
  build:plain)
    echo "Output: dist/plain/awesome-periodic-table.html"
    ;;
  build:arcager|build:arcager:gzip|build:arcager:brotli)
    echo "Output: dist/arcager/awesome-periodic-table.html"
    ;;
esac
