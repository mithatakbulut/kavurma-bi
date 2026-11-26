# Architecture overview — kavurma-bi

This document records what exists, not what is planned. Update it in the same
change that alters a component or a boundary.

## Components

| Component | Responsibility | Owner |
|---|---|---|
| `src/` or `cmd/` | Application code | TODO |
| `.harness/` | Machine-readable project contract and policy | Repository owner |
| `scripts/` | Bootstrap, verification and diagnostic gates | Repository owner |

## Boundaries

- Dependencies point inward: transport and CLI code may depend on domain code,
  never the reverse.
- A gate (`scripts/verify.sh`, policy, managed workflow) is not edited to make a
  change pass.
- External services are reached through an adapter with a typed error and a
  test double; domain code does not know a wire protocol.

## Invariants

List the rules a change must not break. Examples of the form:

- Every command in `.harness/project.yaml` is an argv array, never a shell
  string.
- A required check either runs and passes or fails; `not_applicable` requires a
  stated reason.
- No secret value is written to logs, reports or committed files.

## Diagrams

Add a small text diagram when a boundary is not obvious. Keep it accurate.
