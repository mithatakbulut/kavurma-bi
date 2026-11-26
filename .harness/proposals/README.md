# kavurma-bi

A node project. This repository is managed with the Tandem blueprint:
the workflow contracts, gates and templates live in the repository and work
without a running daemon.

## Quick start

```bash
./scripts/bootstrap.sh
./scripts/verify.sh
./scripts/doctor.sh
```

## Documentation

- `AGENTS.md` — short map for coding agents.
- `docs/architecture/overview.md` — components, boundaries and invariants.
- `docs/testing/strategy.md` — test levels and required evidence.
- `docs/decisions/` — architecture decision records.
- `docs/github-setup.md` — owner-only branch protection and ruleset steps.

## Blueprint

`.harness/manifest.yaml` records the blueprint release, the digest and merge
strategy of every managed file, and the migrations already applied. Do not edit
it by hand; run `tandem doctor` to detect drift and `tandem upgrade` to apply a
new release.
