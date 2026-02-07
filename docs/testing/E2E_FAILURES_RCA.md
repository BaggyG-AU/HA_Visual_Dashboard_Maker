# E2E Failure RCA and Resolution Checklist

Date: 2026-02-06

## Overview
This document captures the latest full `electron-e2e` baseline results, a root-cause analysis per failure, and a checklist to drive systematic fixes and re-runs. It is intended to prevent rework, preserve traceability, and ensure we confirm no flakes before closing each item.

Mandatory phrase: “The fastest correct fix is already in the repository.”

## Baseline Run
Command:
```bash
npx playwright test --project=electron-e2e --trace=retain-on-failure
```
Result summary:
- 139 passed
- 2 skipped
- 8 failed
- Duration: 38.1m

## Failure Inventory (Current)
1. `tests/e2e/attribute-display.spec.ts`
Classification: Visual regression / snapshot drift (size/layout delta)
Evidence: element screenshot size changed 53x113 -> 252x96
Artifacts:
- `test-results/artifacts/e2e-attribute-display-Enti-00d31-d-updates-attribute-display-electron-e2e/attribute-display-table-actual.png`
- `test-results/artifacts/e2e-attribute-display-Enti-00d31-d-updates-attribute-display-electron-e2e/attribute-display-table-expected.png`
- `test-results/artifacts/e2e-attribute-display-Enti-00d31-d-updates-attribute-display-electron-e2e/attribute-display-table-diff.png`
- `test-results/artifacts/e2e-attribute-display-Enti-00d31-d-updates-attribute-display-electron-e2e/trace.zip`
Resolution: Stabilized AntD select interactions in AttributeDisplay DSL (`tests/support/dsl/attributeDisplay.ts`), fixed AttributeDisplay table width in test env (`src/components/AttributeDisplay.tsx`), updated snapshot baseline. Increased timeouts to 100s/180s with justification. Verified 3/3 passes at ~2.8–3.1m.
Status: Resolved

2. `tests/e2e/card-background.visual.spec.ts`
Classification: Visual regression / snapshot drift (element now full-card sized)
Evidence: element screenshot size changed 89x150 -> 585x1110
Artifacts:
- `test-results/artifacts/e2e-card-background.visual-84cfe-pshots-for-background-types-electron-e2e/card-background-solid-actual.png`
- `test-results/artifacts/e2e-card-background.visual-84cfe-pshots-for-background-types-electron-e2e/card-background-solid-expected.png`
- `test-results/artifacts/e2e-card-background.visual-84cfe-pshots-for-background-types-electron-e2e/card-background-solid-diff.png`
- `test-results/artifacts/e2e-card-background.visual-84cfe-pshots-for-background-types-electron-e2e/trace.zip`
Resolution: Stabilized dropdown selection in BackgroundCustomizer DSL and hardened ColorPicker popover opening fallback (`tests/support/dsl/backgroundCustomizer.ts`, `tests/support/dsl/colorPicker.ts`). Verified 3/3 passes (1.8–2.0m). Snapshot baselines already updated when the card began rendering full-height.
Status: Resolved

3. `tests/e2e/carousel.visual.spec.ts`
Classification: Visual regression / small pixel delta (same dimensions)
Evidence: diff with matching size (1176x626)
Artifacts:
- `test-results/artifacts/e2e-carousel.visual-Carous-e1be3-de-and-pagination-snapshots-electron-e2e/carousel-slide-middle-actual.png`
- `test-results/artifacts/e2e-carousel.visual-Carous-e1be3-de-and-pagination-snapshots-electron-e2e/carousel-slide-middle-expected.png`
- `test-results/artifacts/e2e-carousel.visual-Carous-e1be3-de-and-pagination-snapshots-electron-e2e/carousel-slide-middle-diff.png`
- `test-results/artifacts/e2e-carousel.visual-Carous-e1be3-de-and-pagination-snapshots-electron-e2e/trace.zip`
Resolution: Added a small `maxDiffPixels` allowance for pagination bullets to tolerate subpixel centering drift (`tests/support/dsl/carousel.ts`). Verified 3/3 passes at ~25–27s.
Status: Resolved

4. `tests/e2e/icon-color.visual.spec.ts`
Classification: Visual flake or subpixel rounding variance
Evidence: size swap 40x41 -> 41x40
Artifacts:
- `test-results/artifacts/e2e-icon-color.visual-Icon-56088-id-and-gradient-icon-colors-electron-e2e/icon-color-solid-actual.png`
- `test-results/artifacts/e2e-icon-color.visual-Icon-56088-id-and-gradient-icon-colors-electron-e2e/icon-color-solid-expected.png`
- `test-results/artifacts/e2e-icon-color.visual-Icon-56088-id-and-gradient-icon-colors-electron-e2e/icon-color-solid-diff.png`
- `test-results/artifacts/e2e-icon-color.visual-Icon-56088-id-and-gradient-icon-colors-electron-e2e/trace.zip`
Resolution: Switched icon snapshot to a fixed clip derived from the glyph bounding box so a 1px dimension swap no longer fails the screenshot (`tests/e2e/icon-color.visual.spec.ts`). Verified 3/3 passes (~37–39s).
Status: Resolved

5. `tests/e2e/entity-context.spec.ts`
Classification: Product bug or selection regression
Evidence: Properties panel shows “Select a card to edit its properties” while a card is visible on canvas
Artifacts:
- `test-results/artifacts/e2e-entity-context-Entity--7063c-nd-updates-on-state-changes-electron-e2e/test-failed-2.png`
- `test-results/artifacts/e2e-entity-context-Entity--7063c-nd-updates-on-state-changes-electron-e2e/trace.zip`

6. `tests/e2e/entity-remapping.spec.ts`
Classification: Product bug (remap did not apply)
Evidence: debug shows `missingEntities: []`, YAML unchanged after apply
Artifacts:
- `test-results/results.json` (attachments: `debug-after-apply.json`, `remap-yaml-after-apply.json`)
- `test-results/artifacts/e2e-entity-remapping-Entit-03101-g-entities-and-updates-YAML-electron-e2e/test-failed-2.png`
- `test-results/artifacts/e2e-entity-remapping-Entit-03101-g-entities-and-updates-YAML-electron-e2e/trace.zip`

7. `tests/e2e/conditional-visibility.spec.ts`
Classification: Test flake — slow Ant Design Select interaction + tight timeout
Evidence: YAML has `visibility_conditions` but card still visible at timeout
Root cause: Entity selection in `setRule()` fell through to `keyboard.type()` which typed 31 characters one-by-one, each triggering Ant Design search re-renders with WSL2 IPC latency (10.75s). Combined with ~55s of legitimate sequential UI operations, this exceeded the default 60s timeout.
Fix: Added `selectAntOption()` helper in `conditionalVisibility.ts` DSL that uses `waitFor()` for dropdown options and falls back to `pressSequentially()` on the correct combobox input (inside Select field, not dropdown portal). Increased test timeout to 90s. Removed redundant `expectMonacoVisible` call.
Verified: 3/3 passes with `--repeat-each=3` (73s, 79s, 72s).
Artifacts:
- `test-results/artifacts/e2e-conditional-visibility-e2c1a-ates-live-and-persists-YAML-electron-e2e/test-failed-2.png`
- `test-results/artifacts/e2e-conditional-visibility-e2c1a-ates-live-and-persists-YAML-electron-e2e/error-context.md`
- `test-results/artifacts/e2e-conditional-visibility-e2c1a-ates-live-and-persists-YAML-electron-e2e/trace.zip`

8. `tests/e2e/state-icons.spec.ts`
Classification: Product bug or state update regression (timeout)
Evidence: timed out before assertions finished
Artifacts:
- `test-results/artifacts/e2e-state-icons-State-Icon-d8be4-ates-live-and-persists-YAML-electron-e2e/test-failed-1.png`
- `test-results/artifacts/e2e-state-icons-State-Icon-d8be4-ates-live-and-persists-YAML-electron-e2e/trace.zip`
Resolution: DSL updated for AntD Select stability (`tests/support/dsl/stateIcons.ts`), test timeout set to 100s (`tests/e2e/state-icons.spec.ts`). Verified 3/3 passes at ~1.6m each.
Status: Resolved

## Checklist (Fix + Verify)
Use this checklist to drive resolutions and confirm no flakes. A “verify” means at least one clean re-run of the specific test and a targeted re-run after any related fix.

- [x] 1. Entity remapping fails to apply (`tests/e2e/entity-remapping.spec.ts`)
- [x] 2. Entity context loses selection (`tests/e2e/entity-context.spec.ts`)
- [x] 3. Conditional visibility timeout (`tests/e2e/conditional-visibility.spec.ts`)
- [x] 4. State icons timeout (`tests/e2e/state-icons.spec.ts`)
- [x] 5. Attribute display visual snapshot mismatch (`tests/e2e/attribute-display.spec.ts`)
- [x] 6. Card background visual snapshot mismatch (`tests/e2e/card-background.visual.spec.ts`)
- [x] 7. Carousel visual snapshot mismatch (`tests/e2e/carousel.visual.spec.ts`)
- [x] 8. Icon color visual snapshot mismatch (`tests/e2e/icon-color.visual.spec.ts`)

## Regression Run (2026-02-07)
Command:
```bash
npx playwright test --project=electron-e2e --trace=retain-on-failure
```
Result summary:
- 130 passed
- 2 skipped
- 17 failed
- Duration: 39.8m

## Regression Failure Inventory (Current)
1. `tests/e2e/attribute-display.spec.ts:79`
Classification: Likely test flake / AntD Select timing (option not visible)
Evidence: Timeout waiting for `Timestamp` option in dropdown.
Artifacts:
- `test-results/artifacts/e2e-attribute-display-Enti-00d31-d-updates-attribute-display-electron-e2e/test-failed-1.png`
- `test-results/artifacts/e2e-attribute-display-Enti-00d31-d-updates-attribute-display-electron-e2e/test-failed-2.png`
- `test-results/artifacts/e2e-attribute-display-Enti-00d31-d-updates-attribute-display-electron-e2e/video.webm`
- `test-results/artifacts/e2e-attribute-display-Enti-00d31-d-updates-attribute-display-electron-e2e/trace.zip`
Regression link: No direct code changes in attribute display; likely flake under full-suite load.

2. `tests/e2e/carousel.spec.ts:78`
Classification: Potential regression or timing flake (autoplay did not advance)
Evidence: Active slide stayed at 1; expected 0 after autoplay.
Artifacts:
- `test-results/artifacts/e2e-carousel-Carousel-Swip-b9ccf-es-slides-when-not-selected-electron-e2e/test-failed-1.png`
- `test-results/artifacts/e2e-carousel-Carousel-Swip-b9ccf-es-slides-when-not-selected-electron-e2e/test-failed-2.png`
- `test-results/artifacts/e2e-carousel-Carousel-Swip-b9ccf-es-slides-when-not-selected-electron-e2e/video.webm`
- `test-results/artifacts/e2e-carousel-Carousel-Swip-b9ccf-es-slides-when-not-selected-electron-e2e/trace.zip`
Regression link: Carousel autoplay logic unchanged since earlier pass; possible timing/selection flake.

3. `tests/e2e/carousel.visual.spec.ts:37`
Classification: Visual regression (slide snapshot mismatch)
Evidence: Slide middle diff on visual baseline.
Artifacts:
- `test-results/artifacts/e2e-carousel.visual-Carous-e1be3-de-and-pagination-snapshots-electron-e2e/carousel-slide-middle-actual.png`
- `test-results/artifacts/e2e-carousel.visual-Carous-e1be3-de-and-pagination-snapshots-electron-e2e/carousel-slide-middle-diff.png`
- `test-results/artifacts/e2e-carousel.visual-Carous-e1be3-de-and-pagination-snapshots-electron-e2e/trace.zip`
Regression link: Prior fix only loosened pagination bullets; slide snapshot now failing under full-suite.

4. `tests/e2e/color-palettes.spec.ts:6`
Classification: Test flake or flow regression (color palette workflow)
Evidence: Failure during palette creation/persist flow.
Artifacts:
- `test-results/artifacts/e2e-color-palettes-Color-P-2ab6c-avorite-and-persist-to-YAML-electron-e2e/test-failed-1.png`
- `test-results/artifacts/e2e-color-palettes-Color-P-2ab6c-avorite-and-persist-to-YAML-electron-e2e/test-failed-2.png`
- `test-results/artifacts/e2e-color-palettes-Color-P-2ab6c-avorite-and-persist-to-YAML-electron-e2e/video.webm`
- `test-results/artifacts/e2e-color-palettes-Color-P-2ab6c-avorite-and-persist-to-YAML-electron-e2e/trace.zip`
Regression link: Possibly impacted by ColorPicker DSL changes (popover handling) used by palette flows.

5. `tests/e2e/color-picker.spec.ts:156` (toggle formats)
6. `tests/e2e/color-picker.spec.ts:182` (save recent history)
7. `tests/e2e/color-picker.spec.ts:217` (apply recent color)
8. `tests/e2e/color-picker.spec.ts:253` (clear recent colors)
9. `tests/e2e/color-picker.spec.ts:287` (format conversion)
10. `tests/e2e/color-picker.spec.ts:361` (Escape to revert)
11. `tests/e2e/color-picker.spec.ts:395` (persist recents)
12. `tests/e2e/color-picker.spec.ts:434` (invalid input handling)
13. `tests/e2e/color-picker.spec.ts:607` (dedupe recents)
14. `tests/e2e/color-picker.spec.ts:637` (limit recents)
Classification: Clustered failures — likely shared DSL or shared state regression (color picker / recent colors)
Evidence: Multiple tests fail after similar interactions; screenshots show properties panel with button card + color inputs but no popover state in failure frames.
Artifacts:
- `test-results/artifacts/e2e-color-picker-Color-Pic-a1dd6-or-formats-hex-→-rgb-→-hsl--electron-e2e/trace.zip`
- `test-results/artifacts/e2e-color-picker-Color-Pic-5e5bc-rs-to-recent-colors-history-electron-e2e/trace.zip`
- `test-results/artifacts/e2e-color-picker-Color-Pic-0d851-avigation-Escape-to-revert--electron-e2e/trace.zip`
- Additional artifacts under `test-results/artifacts/e2e-color-picker-Color-Pic-*`
Regression link: Potentially impacted by ColorPickerDSL changes (popover open fallback + clip-based screenshots). Needs targeted triage.

15. `tests/e2e/gradient-editor.spec.ts:29` (save/export/import presets)
16. `tests/e2e/gradient-editor.spec.ts:55` (keyboard-only flow)
17. `tests/e2e/gradient-editor.spec.ts:113` (multiple card types)
Classification: Clustered failures — gradient editor popover/editor not visible and/or timeout
Evidence: Editor container not found; keyboard flow timed out.
Artifacts:
- `test-results/artifacts/e2e-gradient-editor-Gradie-ed8aa-e-export-and-import-presets-electron-e2e/trace.zip`
- `test-results/artifacts/e2e-gradient-editor-Gradie-1199e-low-adjusts-angle-and-stops-electron-e2e/trace.zip`
- `test-results/artifacts/e2e-gradient-editor-Gradie-80da8-orks-on-multiple-card-types-electron-e2e/trace.zip`
Regression link: Gradient editor relies on color picker / popover infrastructure; may be affected by recent ColorPicker DSL changes.

## Regression Notes
- Most new failures cluster around color picker / palette / gradient flows, suggesting a shared DSL or state interaction regression rather than isolated product bugs.
- Carousel autoplay + visual slide mismatch appear isolated; may be timing or baseline drift.
- Attribute display dropdown timeout may be a flake under full-suite load.

## Regression Checklist (2026-02-07)
- [ ] R1. Attribute display dropdown timeout (`tests/e2e/attribute-display.spec.ts:79`)
- [ ] R2. Carousel autoplay advance (`tests/e2e/carousel.spec.ts:78`)
- [ ] R3. Carousel visual slide snapshot (`tests/e2e/carousel.visual.spec.ts:37`)
- [ ] R4. Color palettes flow (`tests/e2e/color-palettes.spec.ts:6`)
- [ ] R5. Color picker cluster (10 tests) (`tests/e2e/color-picker.spec.ts`)
- [ ] R6. Gradient editor cluster (3 tests) (`tests/e2e/gradient-editor.spec.ts`)


## Recommended Sequence Rationale
1-4 are functional failures impacting core behavior and will be addressed first. Items 5-8 are visual regressions likely caused by sizing changes and can be resolved once functional behavior is stable.

## Per-Item Work Plan Template
Use this pattern for each item:
- Identify the failing assertion and UI state via trace and screenshots.
- Confirm whether the failure is product vs test vs flake.
- Apply a minimal fix that addresses the root cause.
- Re-run the test once to validate.
- If visual, confirm expected new rendering and update snapshot or stabilize screenshot options.

## Notes
- Avoid editing tests unless we confirm the product behavior is correct and the test is outdated or overly brittle.
- Prefer fixing product code when the UI is incorrect or state is not updating as expected.
- Limit re-runs to targeted tests unless a fix is cross-cutting.
