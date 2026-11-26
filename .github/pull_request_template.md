## Summary

What changed and why, in a few sentences. Link the issue.

Closes #

## Risk

Risk class (R0–R4) and the reason. List protected paths touched, if any.
State any gate, policy or schema change and its justification.

## Acceptance criteria

Copy the issue criteria and mark each one with where it is proven.

- [ ] AC1 — evidence:
- [ ] AC2 — evidence:

## Verification

Exact commands, exit status and relevant output. A new commit invalidates
earlier evidence.

```text
command
result
```

## Live versus unit evidence

- Live (real service, disposable environment):
- Unit/contract only:
- Not run, and why:

## Limitations and rollback

State known limitations and any scope not delivered. Describe how to roll the
change back.

## Checklist

- [ ] The diff matches the stated scope.
- [ ] A focused test covers the new behaviour.
- [ ] No gate, test, fixture or policy was weakened.
- [ ] No secret, token or private transcript is included.
- [ ] Protected-path changes have an explicit justification.
