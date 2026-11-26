#!/usr/bin/env bash
# Single verification entry point for kavurma-bi. Fails closed: a missing
# tool, a skipped check or a broken test is a failure. Do not weaken it to make
# a change pass.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

step() { printf '\n==> %s\n' "$*"; }
fail() { printf '\nverify: FAILED: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "required tool not found: $1"; }
trap 'printf "\nverify: FAILED (line %s, exit %s)\n" "$LINENO" "$?" >&2' ERR

step "toolchain"


need node
need npm
printf 'node: %s\n' "$(node --version)"

need git




step "node: syntax"
while IFS= read -r -d '' file; do
  node --check "$file" || fail "syntax check failed: $file"
done < <(find src test \( -name '*.js' -o -name '*.mjs' \) -print0)

step "node: unit"
node --test

step "node: production build"
npm run build






step "architecture"
./scripts/check-architecture.sh

step "security"
./scripts/security.sh

printf '\nverify: PASS\n'
