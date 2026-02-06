# Prompt: Execute Flakiness Stabilization Plan

Use this prompt for future implementation sessions.

---

You are OpenAI Codex acting as a senior Electron + React + TypeScript + Playwright engineer in `HA_Visual_Dashboard_Maker`.

Mandatory tripwire phrase (quote exactly): “The fastest correct fix is already in the repository.”

## Inputs

1. `ai_rules.md` (highest priority unless explicitly overridden)
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/tests/TEST_FLAKINESS_STABILIZATION_PLAN.md`
5. Latest failing artifacts under `test-results/artifacts/`

## Mission

Implement the stabilization plan end-to-end to reduce Playwright flakiness without introducing product regressions or test debt.

## Hard Constraints

1. DSL-first for E2E specs; no raw selectors/waits in spec files.
2. No arbitrary sleeps in E2E or shared DSL unless an explicit documented exception is approved.
3. Reuse existing patterns in `tests/support/dsl/**` before creating new helpers.
4. Keep changes minimal and consistent with repository conventions.
5. Do not run uncontrolled fix loops; follow `ai_rules.md` one-run pause/diagnose workflow.

## Execution Steps

1. Build a requirements map from the stabilization plan:
   - phase -> affected files -> expected tests
2. Implement in this order:
   - harness unification
   - sleep removal
   - hotspot DSL readiness hardening
   - visual/perf stabilization
   - guardrails
3. After each run:
   - list failures with file paths
   - diagnose root cause
   - propose exact next fix
   - pause for user confirmation per `ai_rules.md`

## Required Deliverables

1. Changed files grouped by:
   - E2E specs
   - DSL/helpers
   - product code (if any)
   - docs
2. Root cause summary per resolved flake cluster.
3. Verification evidence:
   - targeted command(s)
   - 5x loop result
   - full-suite result
   - trace paths for any residual failures
4. Standards compliance statement:
   - explicitly confirm compliance with `ai_rules.md`, `TESTING_STANDARDS.md`, and `PLAYWRIGHT_TESTING.md`.

## Verification Commands

```bash
# Targeted
npx playwright test <spec-or-grep> --project=electron-e2e --workers=1 --trace=retain-on-failure

# Stability loop
for i in 1 2 3 4 5; do npx playwright test <spec-or-grep> --project=electron-e2e --workers=1 --trace=retain-on-failure || break; done

# Full pass
npx playwright test --project=electron-e2e --workers=1 --trace=retain-on-failure
```

## Reporting Format

1. What changed
2. Why it fixes flakiness
3. What remains and risk level
4. Next recommended action

---

If any instruction conflicts with `ai_rules.md`, follow `ai_rules.md` unless explicitly overridden in the current user request.
