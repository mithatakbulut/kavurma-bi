#!/usr/bin/env bash
# Reproducible local setup for kavurma-bi. It installs nothing global and
# never needs a production credential.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

step() { printf '\n==> %s\n' "$*"; }
fail() { printf '\nbootstrap: FAILED: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "required tool not found: $1"; }

step "contract"
[ -f .harness/project.yaml ] || fail ".harness/project.yaml is missing"
[ -f .harness/manifest.yaml ] || fail ".harness/manifest.yaml is missing"

step "toolchain"


need node
printf 'node: %s\n' "$(node --version)"

need git
printf 'git: %s\n' "$(git --version)"



step "dependencies"
# This starter has no third-party runtime dependency. If you add one, install
# it from a committed lockfile here and keep the verify step offline.
printf 'no package dependencies to install\n'


printf '\nbootstrap: PASS\n'
