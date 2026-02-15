Execute the following slice exactly as written.

Constraints:

- Follow ai_rules.md strictly.
- Follow Stop Conditions defined in the blueprint.
- Do NOT expand scope beyond this slice.
- Do NOT refactor outside defined boundaries.
- Enforce Immutable Reuse Rule (search order: passing specs → DSL → helpers).
- If DSL is modified, enforce DSL Change Contract requirements.
- Preserve selectors, roles, and data-testids.
- Preserve YAML compatibility.
- Do not introduce timing hacks.
- Keep branch regression-safe.

Test Execution Policy:

- Run relevant tests.
- If any failures occur:
  1) List failures.
  2) Diagnose root cause.
  3) Propose resolution.
  4) Pause and ask before proceeding.
- Do NOT auto-fix after failures without user confirmation.

Stop Immediately If:

- Unexpected E2E failures occur.
- >2 unrelated tests fail.
- YAML output changes unexpectedly.
- Monaco instances desync.
- IPC errors appear.
- Render churn increases.
- You feel compelled to rewrite a subsystem.

If Stop Condition triggers:
- Halt.
- Re-run regression.
- Analyze diff.
- Revert if necessary.
- Await instruction.

Stop after one test run if failures occur.

Now execute the slice below.
