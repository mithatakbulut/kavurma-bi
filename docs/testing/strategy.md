# Testing strategy — kavurma-bi

One entry point: `./scripts/verify.sh`. It must fail closed and must never be
bypassed. Local verification is the recorded gate while CI may be unavailable.

## Levels

| Level | What it covers | Where |
|---|---|---|
| Unit | Pure logic, parsing, state transitions | package tests |
| Contract | Shared schemas and fixtures accepted/rejected by every binding | fixtures |
| Integration | Database, filesystem, process or service adapters | integration tests |
| End-to-end | A real user path against a disposable environment | e2e tests, conditional |

Mark a level `conditional` or `not_applicable` in `.harness/project.yaml` with a
stated reason. A missing check is a failure, not a silent pass.

## Fixtures

Every shared contract needs at least one valid and one invalid fixture. An
invalid fixture must fail for the intended reason, not merely with a non-zero
exit. Fixtures contain no real credentials or private data.

## Evidence

A check is evidence only when it ran against the exact commit. A claim, a plan
or a screenshot alone is not evidence. A new commit invalidates earlier
evidence. `not_run`, `unknown`, `not_applicable` and `stale` never count as a
pass.

## Local commands

Read `.harness/project.yaml` for the authoritative command arrays. Record the
exact command, exit status and relevant output in the change description.
