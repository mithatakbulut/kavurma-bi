# Adoption plan — kavurma-bi

- Generated: 2026-11-26T01:37:22Z
- Blueprint: tandem-blueprint 0.1.0
- Branch: `tandem/adopt-0.1.0` (from `main`)
- Authorized by: local-operator
- Risk: R2

## Summary

- Stack: node
- Preserved: 1
- Added: 21
- Modified: 0
- Conflicts: 2
- Baseline: not_run (baseline disabled by the caller)

## Baseline

Not run: baseline disabled by the caller.

## Conflicts (existing files preserved)

- `README.md` — existing file differs and there is no managed baseline; proposed content at `.harness/proposals/README.md`
- `.gitignore` — existing file differs and there is no managed baseline; proposed content at `.harness/proposals/.gitignore`

Resolve each conflict by hand, then delete its proposal. The adoption remains partial until then.

## Pull request plan

- Title: `chore(blueprint): adopt tandem-blueprint 0.1.0`
- Base: the original branch; head: `tandem/adopt-0.1.0`
- Body: this plan, the baseline result, the conflict list and the verification result
- Labels: `blueprint`, `adoption`
- Reviewers: CODEOWNERS of the repository, not an agent

## Verification

Run `./scripts/verify.sh` on the adoption branch. A baseline failure is not a new regression; a new failure is. Never mark a failing check as passed.

## Rollback

```bash
git switch main
git branch -D tandem/adopt-0.1.0
```
