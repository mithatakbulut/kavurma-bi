#!/usr/bin/env bash
# Read-only readiness report for kavurma-bi. It never changes a file.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

problems=0
note() { printf '%s\n' "$*"; }
problem() { printf 'problem: %s\n' "$*"; problems=$((problems + 1)); }
need() { command -v "$1" >/dev/null 2>&1 || problem "required tool not found: $1"; }

printf 'doctor: project kavurma-bi (node)\n'

printf '\n==> toolchain\n'


need node

need git

printf '\n==> contract files\n'
for file in .harness/project.yaml .harness/manifest.yaml scripts/verify.sh docs/architecture/overview.md; do
  if [ -f "$file" ]; then
    note "ok: $file"
  else
    problem "missing: $file"
  fi
done

printf '\n==> git\n'
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  note "ok: git repository"
  if git remote get-url origin >/dev/null 2>&1; then
    note "ok: remote origin $(git remote get-url origin)"
  else
    problem "missing git remote origin"
  fi
  if [ -n "$(git status --porcelain)" ]; then
    note "note: working tree has uncommitted changes"
  else
    note "ok: clean working tree"
  fi
else
  problem "not a git repository"
fi

printf '\n==> blueprint drift\n'
if command -v tandem >/dev/null 2>&1; then
  if tandem doctor --path . --json >/dev/null 2>&1; then
    note "ok: tandem doctor reports consistent state"
  else
    note "needs_setup: tandem doctor reports a problem; run 'tandem doctor --path .' for details"
  fi
else
  note "needs_setup: the tandem CLI is not installed; manifest drift is not checked"
fi

if [ "$problems" -gt 0 ]; then
  printf '\ndoctor: NEEDS_SETUP (%d problem(s))\n' "$problems"
  exit 1
fi
printf '\ndoctor: READY\n'
