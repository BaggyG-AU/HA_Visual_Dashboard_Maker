# Test Flakiness Stabilization Plan

Date: 2026-02-05  
Scope: Playwright `electron-e2e` and shared DSL/helpers

Tripwire: “The fastest correct fix is already in the repository.”

## Context

Recent full-suite runs showed timeout-heavy failures across unrelated specs. This pattern indicates suite-level instability (readiness, synchronization, and environment-sensitive assertions), not one feature regression.

This plan aligns with:
- `ai_rules.md`
- `docs/testing/TESTING_STANDARDS.md`
- `docs/testing/PLAYWRIGHT_TESTING.md`
- Playwright best-practice guidance:
  - https://playwright.dev/docs/best-practices
  - https://playwright.dev/docs/actionability
  - https://playwright.dev/docs/test-timeouts
  - https://playwright.dev/docs/test-fixtures
  - https://playwright.dev/docs/test-snapshots
  - https://playwright.dev/docs/test-retries

## Current Flakiness Signals

1. Mixed launcher/readiness patterns in E2E (`launchWithDSL` vs `launchElectronApp + waitForAppReady`).
2. Sleep-based waits still present in specs and support layers (`waitForTimeout`).
3. Tight time budgets on async UI transitions (2-5s in many helper paths).
4. Focus/visibility assumptions in Electron (popover + tab + editor readiness races).
5. Visual/perf checks that are sensitive to machine load.

## Objectives

1. Eliminate systemic timeout flakes by standardizing readiness and waits.
2. Preserve DSL-first behavior (no raw selectors/waits in E2E specs).
3. Keep visual/perf tests meaningful while reducing environment noise.
4. Add enforceable guardrails to prevent reintroduction.

## Plan of Attack

## Phase 0: Baseline and Failure Taxonomy

1. Create a flake ledger for each failing test:
   - test id/path
   - first failing DSL/helper line
   - symptom class (`timeout`, `focus`, `visual`, `perf`, `state leak`)
   - artifact pointers (`trace.zip`, screenshot)
2. Use one-run pause/diagnose workflow from `ai_rules.md`.
3. Keep traces retained on failure for every verification run.

Exit criteria:
- Every active failure mapped to one owner abstraction (DSL/helper/spec/product).

## Phase 1: Harness Unification

1. Standardize E2E on `launchWithDSL()` + `close(ctx)` from `tests/support/electron.ts`.
2. Migrate E2E specs still using `tests/helpers/electron-helper.ts` launch path.
3. Remove duplicate readiness branches after migration.

Exit criteria:
- No E2E spec launches Electron via non-DSL path unless explicitly documented exception.

## Phase 2: Remove Sleep-Based Synchronization

1. Replace `waitForTimeout` in E2E specs with state-based DSL calls.
2. Replace fixed-delay waits in DSL/helpers with:
   - locator/actionability assertions
   - `expect.poll` for async persistence/state convergence
   - explicit UI-state contracts (open/closed/selected/enabled)
3. Keep waits scoped to behavior, not timing.

Exit criteria:
- `tests/e2e/**` contains zero raw `waitForTimeout(...)`.

## Phase 3: Harden Shared DSL Contracts (High-Reuse Hotspots)

1. `PropertiesPanelDSL`: tab-switch readiness must verify both selected tab and mounted panel content.
2. `YamlEditorDSL`: unify Monaco readiness contract and scope selection.
3. `EntityContextDSL`: strengthen test-api readiness poll and add diagnostics on failure.
4. `GradientEditorDSL`: deterministic import/export/preset application readiness.
5. `ColorPickerDSL`: robust localStorage + recents synchronization (`expect.poll` only).

Exit criteria:
- A single DSL-level fix addresses all tests in each affected workflow family.

## Phase 4: Visual and Perf Stability

1. Snapshot preconditions:
   - deterministic viewport and scale
   - animations disabled for snapshot operations
   - capture only after state convergence
2. Use narrowly-scoped tolerances only where anti-aliasing drift is proven.
3. Keep strict assertions for structural changes.
4. For perf checks, sample over a window and gate on stable metrics (avoid single-point FPS noise).

Exit criteria:
- Visual/perf failures correspond to real UI regressions, not host jitter.

## Phase 5: Guardrails and Regression Prevention

1. Add lint/check to block raw sleeps in E2E specs.
2. Add a checklist for any new DSL method:
   - explicit readiness contract
   - no fixed sleeps
   - diagnostics attachment on failure path
3. Add a required 5x targeted stability loop for changed flaky workflows before full-run signoff.

Exit criteria:
- New test code cannot reintroduce known flake patterns unnoticed.

## Verification Matrix

1. Targeted fix verification:
```bash
npx playwright test <spec-or-grep> --project=electron-e2e --workers=1 --trace=retain-on-failure
```
2. Targeted stability loop (Linux/macOS):
```bash
for i in 1 2 3 4 5; do npx playwright test <spec-or-grep> --project=electron-e2e --workers=1 --trace=retain-on-failure || break; done
```
3. Targeted stability loop (PowerShell):
```powershell
1..5 | ForEach-Object { npx playwright test <spec-or-grep> --project=electron-e2e --workers=1 --trace=retain-on-failure; if ($LASTEXITCODE -ne 0) { break } }
```
4. Full regression pass:
```bash
npx playwright test --project=electron-e2e --workers=1 --trace=retain-on-failure
```
5. Trace review:
```bash
npx playwright show-trace test-results/artifacts/<failure-dir>/trace.zip
```

## Done Criteria (Stabilization)

1. Previously flaky test clusters pass targeted 5x loops.
2. Two consecutive full E2E suite runs complete without new timeout-class flakes.
3. Standards docs contain explicit anti-flake guardrails.
4. No DSL/spec divergence from `ai_rules.md` and testing standards.
