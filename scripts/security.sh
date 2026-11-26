#!/usr/bin/env bash
# Local security checks for kavurma-bi. Offline and dependency-free: it
# flags tracked credential files and high-signal secret patterns. It never
# prints a matched value.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

status=0
fail() { printf 'security: FAILED: %s\n' "$*" >&2; status=1; }

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  files="$(git ls-files)"
else
  files="$(find . -type f -not -path './.git/*' -not -path './node_modules/*')"
fi

# 1. Credential-bearing files must not be tracked. Examples are allowed.
suspicious="$(printf '%s\n' "$files" | grep -E '(^|/)(\.env|id_rsa|id_ed25519)$|\.(pem|key)$' || true)"
if [ -n "$suspicious" ]; then
  printf '%s\n' "$suspicious" | sed 's/^/security: tracked credential file: /' >&2
  status=1
fi

# 2. High-signal content patterns. Report file and line only, never the match.
scan() {
  name="$1"
  pattern="$2"
  while IFS= read -r file; do
    [ -f "$file" ] || continue
    while IFS=: read -r line _rest; do
      fail "pattern $name at $file:$line"
    done < <(grep -nIE "$pattern" "$file" 2>/dev/null || true)
  done <<< "$files"
}

scan "private-key" 'BEGIN [A-Z ]*PRIVATE KEY'
scan "aws-access-key" 'AKIA[0-9A-Z]{16}'
scan "github-token" 'gh[pousr]_[A-Za-z0-9]{20,}'
scan "slack-token" 'xox[baprs]-[0-9A-Za-z-]{10,}'

if [ "$status" -ne 0 ]; then
  exit 1
fi
printf 'security: PASS (no tracked credential files or high-signal patterns)\n'
