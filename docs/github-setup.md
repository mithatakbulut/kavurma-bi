# GitHub setup — owner-only steps

These steps need repository-owner permission. Tandem reports what it can read
and never applies a ruleset, branch protection or CODEOWNERS change silently.
Run them in the GitHub UI or with `gh`; review each one.

## 1. Confirm the required check name

The generated workflow runs one required job named `verify`. Required status
checks are matched by that exact name. If the workflow is renamed, update the
protection rule in the same change, or the required check stays pending.

## 2. Protect the default branch

- Require a pull request before merging.
- Require the `verify` status check.
- Require branches to be up to date before merging when merges are serial.
- Do not allow force pushes or deletions.
- Keep direct pushes to the default branch disabled for agents.

```bash
gh api --method PUT "repos/{owner}/{repo}/branches/main/protection" \
  --input protection.json
```

`protection.json` is a local file you review; do not paste a token into it.

## 3. Rulesets instead of branch protection

Organizations on a plan that supports rulesets may prefer them. The observability
is different: a token without admin read permission can see neither the rule nor
its enforcement. Tandem reports `unknown` in that case, never `protected`.

## 4. CODEOWNERS

Add real, authorized owners. Tandem does not generate CODEOWNERS because it
cannot know who owns the code. An empty or placeholder CODEOWNERS file gives a
false sense of review coverage.

## 5. Secrets and workflow permissions

- The verification workflow uses `permissions: contents: read`.
- Do not run untrusted pull-request code under `pull_request_target`.
- Keep write tokens and secrets out of test jobs.
- Pin third-party actions to a full commit SHA and update them in a separate PR.
