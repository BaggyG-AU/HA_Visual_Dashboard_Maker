# Skipped Tests Register

**Purpose**: Single source of truth for tests that are intentionally skipped after investigation. Release notes may also reference skips, but individual entries live here.

**Last Updated**: January 15, 2026

## Summary
- Total skipped (current suite): **3** Playwright spec/test
- Primary causes:
  - Monaco/YAML model visibility issues in the Properties Panel (Playwright + Electron)
  - Focus/portal detection issues in Electron (Color Picker visual/a11y)
  - ColorPicker controlled component state sync issues with Playwright input methods
  - Intentional Playwright omissions where unit coverage already exists

## Skipped Tests

| Test File | Test Name | Status | Date Skipped | Reason | Revisit Trigger / Reference |
|-----------|-----------|--------|--------------|--------|-----------------------------|
| `tests/e2e/card-background.spec.ts` | `image and blur backgrounds update preview + YAML` | Skipped | Jan 10, 2026 | ColorPicker controlled component does not update when using Playwright's `fill()` or `pressSequentially()` methods. The input shows default value `#000000` instead of test value `#112233`. Issue appears specific to `background-overlay-color-input` field. Root cause: ColorPicker's `handleInputChange` only updates local state and waits for Enter/blur to commit, but Playwright input methods don't properly trigger React's onChange handler in this context. Stacking context issue was also investigated (popover rendering behind canvas) but fixing getPopupContainer did not resolve the input issue. | Revisit when Playwright + React controlled component interaction is stable for this specific field, or when ColorPicker input handling is refactored. May require unit test coverage instead. |
| `tests/e2e/color-picker.spec.ts` | `visual regression and accessibility in scrollable PropertiesPanel` | Skipped | Jan 8, 2026 | Playwright still reports focus state as "inactive" in Electron during keyboard assertions even after deterministic window activation and tab-history diagnostics. Manual checks pass. | Revisit when Electron window focus can be made deterministic in Playwright without timing hacks. |
| `tests/e2e/color-picker.spec.ts` | `should update YAML when color is changed` | **PASS (unskipped Jan 8, 2026)** | Jan 6, 2026 | RESOLVED: DSL now reads Monaco model via explicit handles/scoped editor selection with diagnostics; assertions are stable. | n/a |
| `tests/e2e/color-picker.spec.ts` | `button card color + icon color should update preview and YAML` | **PASS (unskipped Jan 8, 2026)** | Jan 6, 2026 | RESOLVED: Same Monaco-model read path + diagnostics as above. | n/a |
| `tests/e2e/gradient-editor.spec.ts` | `gradient editor applies preset and persists to yaml` | **PASS (unskipped Jan 8, 2026)** | Jan 7, 2026 | RESOLVED: Uses Monaco-model read with diagnostics; portal disambiguation handled in DSL. | n/a |
| `tests/e2e/entity-remapping.spec.ts` | `auto-maps missing entities and updates YAML` | Skipped | Jan 15, 2026 | Apply button click does not invoke handler in Electron E2E; modal wrapper remains visible and `remapModalVisible` stays true. Diagnostics show `data-has-config=1`, `data-mapping-count=1`, but no `remapApplyClicked`/`remapOnApplyInvoked` markers in `window.__remapDebug`. Modal wrapper is visible with full-screen rect while modal root height is 0. Evidence: `test-results/artifacts/e2e-entity-remapping-Entit-03101-g-entities-and-updates-YAML-electron-e2e/remap-apply-pre.json`, `remap-apply-debug.json`, trace.zip. | Revisit when modal event handling in Electron test context is verified; add click-capture instrumentation and confirm handler firing before unskipping. |

## Policy (applies to all entries)
1) Include a concrete reason and reference; no “temporary” skips without documentation.  
2) Skips should be reviewed quarterly or when underlying blockers are resolved.  
3) Do not add arbitrary waits/timeouts to avoid skips; fix root causes or document here.  
4) If manual verification shows the feature works, note it explicitly (as above).  
5) Keep release notes consistent with this register; release notes may summarize counts but not diverge on reasons.
