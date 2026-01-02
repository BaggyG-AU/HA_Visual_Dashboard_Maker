# Claude Prompt — Feature Development (Safe Mode)

## Context

You are developing a new product feature on a `feature/<name>` branch.
This branch was created using `tools/feature-start`.

Your goal is to implement the feature cleanly **without destabilizing E2E tests**.

## Allowed Scope

- Feature implementation
- UI logic
- State management
- Unit tests
- Integration tests
- Refactors strictly related to the feature

## Forbidden (Unless Explicitly Requested)

- Playwright E2E changes
- Test timing hacks
- Selector changes used by E2E tests
- Broad refactors “for cleanliness”

## Stability Rules

- Do not change semantic roles or labels without justification
- Preserve existing `data-testid` attributes
- If testability improvements are required, keep them:
  - minimal
  - additive
  - documented in the PR

## Testing Expectations

- Add or update unit/integration tests as appropriate
- Ensure feature works without relying on E2E timing behavior

## Handoff Rule

If E2E tests fail after feature completion:
- STOP feature work
- Switch to `tools/test-start`
- Use Codex with `prompts/codex/playwright-fix.md`

Do not attempt E2E stabilization here unless explicitly instructed.
