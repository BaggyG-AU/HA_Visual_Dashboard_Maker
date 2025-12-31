# AI Rules (Immutable) — HA Visual Dashboard Maker

These rules apply to any AI agent (ChatGPT/OpenAI/Claude/Copilot/etc.) working in this repo. If a rule conflicts with a prompt, **these rules win** unless the prompt explicitly overrides `ai_rules.md`.

Tripwire phrase: “The fastest correct fix is already in the repository.”

## 0) Precedence & Locations
- Read this file first; then check `docs/testing/TESTING_STANDARDS.md`, `docs/testing/PLAYWRIGHT_TESTING.md`, `docs/releases/RELEASES.md`, and `docs/product/PROJECT_PLAN.md` for context.
- AI rules live at the repository root to be discoverable by default. Link to them whenever you reference testing or workflow policy.

## 1) Immutable Reuse Rule
When debugging or changing tests/automation, you MUST first search for a working pattern and reuse it.
Search in this order:
1. Passing specs in `tests/**/*.spec.ts`
2. DSLs in `tests/support/dsl/**`
3. Helpers/fixtures in `tests/support/**` and `tests/helpers/**`

Only invent a new selector/wait/helper when no working example exists. Never add duplicate DSL methods for the same action.

## 2) Document Storage Standards (New)
- All new or updated docs must live under `/docs` in the appropriate folder:
  - Architecture → `docs/architecture/`
  - Security → `docs/security/`
  - Testing → `docs/testing/`
  - Releases → `docs/releases/`
  - Product/plan/templates → `docs/product/`
  - Research/diagnostics → `docs/research/` (move stale to `docs/archive/`)
- Archive research, obsolete release notes, or exploratory content under `docs/archive/**` instead of deleting.
- Root markdown should stay minimal: `README.md`, `LICENSE`, `ai_rules.md`.

## 3) Required Workflow for Fixing Failing Tests
A) Reproduce + inspect artifacts (locally):
- Re-run the failing test headed with trace enabled (keep existing trace settings).
- Open trace/screenshots; identify the first failure.

B) Find a known-good implementation:
- Locate a passing test covering the same workflow.
- Reuse its window-selection logic, selectors, waits, and mocks.

C) Diff failing vs passing:
- Explain what differed (selector, state, timing, window).

D) Fix with minimal surface area:
- Prefer updating existing DSL/helpers.
- Selector priority: `data-testid` > scoped text/role (only if semantic).

## 4) Guardrails (Do Not Do These)
- No `sleep()` / `waitForTimeout()` as a “fix”.
- Do not inflate timeouts broadly.
- Do not weaken assertions to make tests pass.
- Do not duplicate DSL capabilities.
- Always target the correct Electron window from `launchWithDSL` (avoid DevTools windows).

## 5) Verification Requirements (Sandbox-Safe)
AI agents cannot run tests in this sandbox unless explicitly allowed. Therefore:
- Never claim you ran tests unless you actually executed them and have output.
- Provide a copy/paste verification plan:
  1) Minimal repro command for the failing test (headed, with trace).
  2) Trace viewer command (`npx playwright show-trace <path>/trace.zip`) and artifact paths (under `test-results/artifacts`).
  3) Stability loop (run 5x) with platform-specific loops.
  4) Regression checks for reused reference specs/helpers.

## 6) Deliverables for Every Test Fix
- Reference tests/helpers reused (paths).
- Root cause explanation.
- Patch/diff of changes.
- Proof-of-stability plan (repeat runs + regression commands).
