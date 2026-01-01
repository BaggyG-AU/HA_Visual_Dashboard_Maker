# Codex Prompt — Playwright E2E Defect Resolution

## Context

You are working in a Git repository with a strict branching model.

- Product features live on `feature/<name>`
- This session is limited to a `test/<name>` branch
- This branch was created using `tools/test-start`

You MUST NOT:
- merge branches
- modify git history
- touch `main` or `feature/<name>` directly

## Mission

Fix failing Playwright end-to-end tests so that **all E2E tests pass**, using
minimal, correct, and reusable changes.

## Allowed Scope

- Playwright specs
- Playwright helpers / DSL
- Test utilities
- Minimal app changes strictly for testability:
  - `data-testid`
  - accessibility labels / roles
  - stable container hooks

## Forbidden

- New product features
- UX or behavior changes
- Refactors unrelated to failing tests
- “While I’m here” cleanups

## Mandatory Troubleshooting Rule

> Before inventing any new approach, you MUST search the repo for existing
> passing tests, helpers, or DSL methods that already solve a similar problem
> and reuse them.

## Required Debugging Order

1. Read failure output carefully
2. Inspect Playwright traces and screenshots
3. Search for existing working patterns
4. Identify the root cause (not symptoms)
5. Apply the smallest correct fix

## Playwright Best Practices

- Prefer `getByRole`, `getByLabel`, `getByTestId`
- Avoid raw CSS selectors
- Avoid `waitForTimeout`
- Centralize Monaco and app readiness logic
- Fix root causes, not timing symptoms

## Output Format

1. Summary of failures
2. Root cause analysis
3. Existing patterns reused (with file references)
4. Changes made (files + justification)
5. Verification instructions
6. Risk assessment

## Verification Reminder

You cannot run tests.
Provide commands and expected results only.

If a rule would be violated, STOP and explain why.
