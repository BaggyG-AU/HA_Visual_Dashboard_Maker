# AI Rules (Immutable) — HA Visual Dashboard Maker

These rules apply to any AI agent (ChatGPT/OpenAI/Claude/Copilot/etc.) working in this repo.
If a rule conflicts with an instruction in a prompt, **these rules win** unless the prompt explicitly says it is overriding this file.

---

Tripwire phrase:
"The fastest correct fix is already in the repository."

## 1) Immutable Rule: Reuse Before Inventing
When debugging a failing test or implementing test automation changes:

**You MUST first search for an existing passing example in this repo and reuse it.**

Search in this order:
1. Existing passing specs in `tests/**/*.spec.ts`
2. DSLs in `tests/support/dsl/**`
3. Helpers/fixtures/utilities in `tests/support/**` (and any `helpers/**` folders)

Only create a new approach if you can prove no working example exists.

**Not allowed unless no existing solution exists:**
- New selector strategy
- New helper/DSL that duplicates existing capability
- New “wait” patterns (especially arbitrary sleeps)

---

## 2) Required Workflow for Fixing Failing Tests
### A) Reproduce + inspect artifacts (required)
- Re-run the failing test in headed mode with trace enabled (keep existing trace settings).
- Open trace + screenshots and identify the first failure point.

### B) Find a known-good implementation (required)
- Locate at least one passing test that accomplishes the same workflow.
- Copy/reuse the same window-selection logic, selectors, and readiness checks.

### C) Diff failing vs passing (required)
- Write a short explanation of what differs (selectors, window/page, state, timing assumptions).

### D) Fix with minimal changes (required)
- Prefer updating existing DSL/helpers over adding new ones.
- Prefer stable selectors already used in passing tests:
  - `data-testid` > scoped text > roles (roles only if truly accessible/semantic)

---

## 3) Guardrails (Do Not Do These)
- Do not add `sleep()` / `waitForTimeout()` as a “fix”.
- Do not massively increase timeouts.
- Do not weaken assertions to make tests pass.
- Do not add duplicate ways to do the same UI action if one already works.
- Do not interact with the wrong Electron window—always ensure the correct app window/page is targeted.

---

## 4) Verification Requirements (Sandbox-Safe)
AI agents may not be able to run tests in their environment. Therefore:

- **Do NOT claim tests were executed** unless you actually ran them and can show output.
- Instead, you MUST provide the user with a concrete, copy/paste verification plan.

After proposing a fix, include all of the following:

1) **Minimal repro command** (run the single failing test/spec)
- Provide exact command(s) the user should run locally, e.g.:
  - `npx playwright test <spec> -g "<test name>" --project=electron-integration --headed`
  - Include any required env vars or prerequisites.

2) **Artifacts + debugging commands**
- Provide the exact trace viewer command if a trace is produced:
  - `npx playwright show-trace <path>\trace.zip`
- Specify where screenshots/traces should appear in the repo.

3) **Stability check instructions**
- Provide a command the user can run to repeat the test 5 times (Windows + PowerShell),
  for example:
  - CMD: `for /l %i in (1,1,5) do npx playwright test <spec> -g "<test name>" --project=electron-integration`
  - PowerShell: `1..5 | % { npx playwright test <spec> -g "<test name>" --project=electron-integration }`

4) **Regression check instructions**
- Provide commands to run the “reference” passing spec(s) that the fix reuses.
- If shared DSL/helpers were changed, provide the relevant suite command(s) to run.

The output of this section must be a clear checklist the user can follow to confirm:
- the failing test is now green
- the reused reference test(s) still pass
- no obvious regressions were introduced


---

## 5) Deliverables for Every Test Fix
- The passing reference test(s)/helper(s) that were reused (file paths).
- Root cause explanation (what differed and why it failed).
- Patch/diff of changes.
- Proof of stability (repeat runs).
