# AGENTS.md — kavurma-bi

Short map for coding agents. Read this file, `docs/architecture/overview.md`
and `docs/testing/strategy.md` before a non-trivial change. This is a map, not
an instruction dump; keep it short and current.

## Purpose

Describe in two or three sentences what this repository does and what a correct
change must preserve. Replace this paragraph when you adopt the blueprint.

## Setup and verification

```bash
./scripts/bootstrap.sh
./scripts/verify.sh
```

`./scripts/doctor.sh` reports missing tools, configuration, git remote and
blueprint drift. It never changes files. A skipped, missing or unknown check is
not a pass. Do not add a parallel test path and do not weaken a gate to make a
change land.

## Layout

Document the real top-level directories here. The blueprint creates:

```text
.harness/        project.yaml, policy.yaml, manifest.yaml, exceptions
.github/         issue and PR templates, required verification workflow
docs/            architecture, testing, decisions, plans
scripts/         bootstrap, verify, doctor, architecture and security checks
```

## Protected paths

Changes under these paths are high risk and need an explicit justification and
human review:

- `.github/**`
- `scripts/verify.sh`
- `.harness/**`
- `docs/decisions/**`

An agent may not edit a gate, test, policy or schema to make its own change
pass.

## Rules

- Keep the diff inside the stated task; no unrelated refactors or dependency
  upgrades.
- Record durable decisions as ADRs in `docs/decisions/`.
- Never print, commit or log secrets or raw private transcripts.
- Leave unfinished work in place; do not delete a worktree or discard
  uncommitted work.

## Definition of done

1. The requested behaviour exists and is covered by a focused test.
2. `./scripts/verify.sh` exits 0 on the exact commit.
3. Documentation and the risk record are updated.
4. Known limitations are stated explicitly; no silent scope reduction.
