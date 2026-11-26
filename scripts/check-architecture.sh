#!/usr/bin/env bash
# Architecture boundary checks for kavurma-bi. Replace the example rule
# with the invariant this project actually relies on; do not delete the check.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

fail() { printf 'check-architecture: FAILED: %s\n' "$*" >&2; exit 1; }




if [ -d src ]; then
  if grep -rn 'from "../test' src >/dev/null 2>&1 || grep -rn "from '../test" src >/dev/null 2>&1; then
    fail "src/ imports test code; dependencies must point inward"
  fi
fi
printf 'check-architecture: PASS (source import direction)\n'



