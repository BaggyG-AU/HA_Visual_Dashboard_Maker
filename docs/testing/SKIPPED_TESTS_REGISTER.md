# Skipped Tests Register

**Purpose**: Single source of truth for tests that are intentionally skipped after investigation. Release notes may also reference skips, but individual entries live here.

**Last Updated**: January 7, 2026

## Summary
- Total skipped (current suite): **5** Playwright specs/tests + **1** integration suite
- Primary causes:
  - Monaco/YAML model visibility issues in the Properties Panel (Playwright + Electron)
  - Focus/portal detection issues in Electron (Color Picker visual/a11y)
  - Intentional Playwright omissions where unit coverage already exists

## Skipped Tests

| Test File | Test Name | Status | Date Skipped | Reason | Revisit Trigger / Reference |
|-----------|-----------|--------|--------------|--------|-----------------------------|
| `tests/e2e/color-picker.spec.ts` | `visual regression and accessibility in scrollable PropertiesPanel` | Skipped | Jan 6, 2026 | Playwright intermittently reports focus state as “inactive” in Electron during keyboard assertions; manual checks pass. | Revisit when Electron window focus is deterministic in PW without timing hacks. |
| `tests/e2e/color-picker.spec.ts` | `should update YAML when color is changed` | Skipped | Jan 6, 2026 | Monaco YAML model not reliably exposed/detected in Playwright; UI updates manually. | Revisit when Monaco model can be read deterministically in E2E. |
| `tests/e2e/color-picker.spec.ts` | `button card color + icon color should update preview and YAML` | Skipped | Jan 6, 2026 | Properties Panel Monaco visibility/model flake; manual behavior correct. | Revisit when Properties Panel Monaco detection is stable. |
| `tests/e2e/gradient-editor.spec.ts` | `gradient editor applies preset and persists to yaml` | Skipped | Jan 7, 2026 | Playwright cannot reliably target Properties Panel YAML editor when duplicate/portal YAML containers exist; manual behavior correct. | Revisit when YAML editor disambiguation is reliable. |
| `tests/integration/dashboard-generator.spec.ts` | `Dashboard Generator Service (covered by unit tests)` (suite) | Skipped | Jan 6, 2026 | Pure service logic already covered by Vitest; Playwright integration adds no value. | Enable only if UI-level integration coverage becomes necessary. |

## Policy (applies to all entries)
1) Include a concrete reason and reference; no “temporary” skips without documentation.  
2) Skips should be reviewed quarterly or when underlying blockers are resolved.  
3) Do not add arbitrary waits/timeouts to avoid skips; fix root causes or document here.  
4) If manual verification shows the feature works, note it explicitly (as above).  
5) Keep release notes consistent with this register; release notes may summarize counts but not diverge on reasons.
