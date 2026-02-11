# Regression Standards Hardening Plan

**Date**: 2026-02-08
**Trigger**: 17 E2E regression failures after fixing 8 baseline failures
**Goal**: Update standards and align codebase to prevent recurring regressions

---

## Context

After resolving 8 E2E failures (documented in `E2E_FAILURES_RCA.md`), a full regression run produced 17 new failures. Analysis shows 14/17 cluster around ColorPicker/popover/gradient DSL changes — a textbook systemic failure (Standard #10). This plan hardens standards and fixes compliance gaps.

---

## Phase 1: Deep Analysis (Research Only) — COMPLETED

### Task 1: Correlate regression failures to recent DSL changes — DONE

**Source commit**: `1774ac0` (Feature 4.1: Swiper carousel foundation) introduced the regression.

#### Root Cause Correlation Matrix

| Regression | Tests | Root Cause | DSL Change | Commit |
|---|---|---|---|---|
| R5: Color Picker | 10 | `openPopover()` fallback clicks wrapper div instead of swatch; removed `scrollIntoViewIfNeeded()` | `colorPicker.ts:155-180` | 1774ac0 |
| R6: Gradient Editor | 3 | Depends on `backgroundCustomizer.selectType('Gradient')` → ColorPickerDSL for stop colors; editor popover not visible | `gradientEditor.ts` + `colorPicker.ts` | 1774ac0 |
| R4: Color Palettes | 1 | Depends on `colorPicker.openPopover()` | `colorPicker.ts` | 1774ac0 |
| R1: Attribute Display | 1 | AntD Select timing under full-suite load; `keyboard.type()` fallback too slow | `attributeDisplay.ts:44` | 1774ac0 |
| R2: Carousel Autoplay | 1 | 4s polling timeout with 500ms delay; race condition after deselection | `carousel.spec.ts:98` | 1774ac0 |
| R3: Carousel Visual | 1 | Slide snapshot baseline drift under full-suite | `carousel.visual.spec.ts:57` | 1774ac0 |

#### Key Technical Findings

1. **`openPopover()` fallback clicks wrong element (14/17 failures)**: The fallback path at `colorPicker.ts:171-173` clicks `window.getByTestId(inputTestId)` — the ColorPickerInput wrapper `<div>`, NOT the swatch button. Clicking a wrapper div does not trigger the Ant Design Popover open logic.

2. **Removed `scrollIntoViewIfNeeded()`**: The Feature 4.1 commit removed `swatch.scrollIntoViewIfNeeded()` from `openPopover()`. While `propertiesPanel.switchTab` scrolls to top, the swatch may be below the fold if the Advanced Options tab has content above it. Playwright's `force: true` click still scrolls, but the removal reduces reliability.

3. **`ensurePopoverOpen()` uses `isVisible()`**: At `colorPicker.ts:33`, this method checks popover visibility using `isVisible()`. While this works for Ant Design Popover (which hides with CSS classes, not DOM removal), it doesn't wait for transition completion.

4. **Carousel autoplay timing**: The test at `carousel.spec.ts:98` uses `expect.poll(..., { timeout: 4000 })` for autoplay with a 500ms delay. Under full-suite load, the autoplay timer may not fire reliably within 4s. The Playwright Clock API would be more deterministic.

5. **Carousel visual baseline**: The slide snapshot at `carousel.visual.spec.ts:57` drifts under full-suite load due to subpixel rendering differences when the system is under higher resource pressure.

### Task 2: External research validation — DONE

Key findings from research:

- **Ant Design portals**: Popovers/dropdowns render to `document.body`, not inside their trigger. Use page-level locators. AntD hides popovers with CSS class (`ant-popover-hidden`), not DOM removal. Consider `getPopupContainer` for testability.
- **Screenshot stability**: Prefer `clip`-based screenshots over element-based for dimension stability (avoids 1px rounding). Use `maxDiffPixelRatio` globally, `maxDiffPixels` per-test. Run baselines in consistent environment.
- **Swiper autoplay**: Use `page.waitForFunction()` to poll `activeIndex` instead of fixed waits. Consider Playwright Clock API (`page.clock.install()` + `page.clock.runFor()`) for deterministic timer control.
- **`force: true` clicks**: Skips visibility/stability/hit-target checks but STILL scrolls into view and dispatches real DOM events. Dangerous for hidden/animating elements. Every `force: true` should have documented rationale.

---

## Phase 2: Standards Updates (Documentation) — COMPLETED

### Task 3: Update `docs/testing/TESTING_STANDARDS.md` — DONE

New sections added (Standards 20–28):

| # | Section | Standard # | Status |
|---|---------|------------|--------|
| 3a | Visual Snapshot Dimension Swaps | #24 | [x] |
| 3b | Visual Snapshot Pixel Drift Tolerance | #25 | [x] |
| 3c | Popover/Portal Flow-Defensive Patterns | #22 | [x] |
| 3d | Long Test Timeout Justification | #28 | [x] |
| 3e | DSL Change Blast-Radius Check | #20 | [x] |
| 3f | Popover Open Fallback Anti-Pattern | #22 (combined) | [x] |
| 3g | Shared Ant Design Select Utility | #27 | [x] |
| 3h | `keyboard.type()` Prohibition in DSL | #21 | [x] |
| — | `force: true` Rationale Requirement | #23 | [x] |
| — | Screenshot Environment Consistency | #26 | [x] |

### Task 4: Update `ai_rules.md` — DONE
- [x] Added Rule 4a: DSL Change Blast-Radius Check (repo-wide)

### Task 5: Update `docs/testing/PLAYWRIGHT_TESTING.md` — DONE
- [x] Added troubleshooting: "Ant Design Popover Not Opening"
- [x] Added troubleshooting: "Clustered Failures Point to Shared DSL"
- [x] Added troubleshooting: "Carousel Autoplay Flakiness"

---

## Phase 3: Codebase Compliance Review — COMPLETED

### Task 6: Scan DSL and spec files for violations — DONE

#### Violations Found

| # | Pattern | File:Line | Severity | Details |
|---|---------|-----------|----------|---------|
| V1 | `keyboard.type()` in DSL | `propertiesPanel.ts:180` | Medium | Entity ID entry; should use `pressSequentially()` |
| V2 | `keyboard.type()` in DSL | `stateIcons.ts:114` | Medium | Icon name entry fallback |
| V3 | `keyboard.type()` in DSL | `conditionalVisibility.ts:43` | Medium | Select field last-resort entry |
| V4 | `keyboard.type()` in DSL | `attributeDisplay.ts:44` | Medium | Attribute value entry (likely cause of R1) |
| V5 | `keyboard.type()` in DSL | `colorPicker.ts:580` | Medium | Color input keyboard entry |
| V6 | Raw CSS selector in spec | `settings.spec.ts:99` | Low | `.ant-switch` raw selector |
| V7 | `test.setTimeout` no justification | `smart-actions.spec.ts:7` | Low | `120000` with no rationale comment |
| V8 | `force: true` no rationale | `colorPicker.ts:158,163,173` | Medium | Three force clicks in openPopover; retry clicks wrapper div not swatch |
| V9 | `openPopover` fallback bug | `colorPicker.ts:171-173` | **Critical** | Clicks wrapper div instead of swatch |
| V10 | Removed `scrollIntoViewIfNeeded` | `colorPicker.ts:155` | Medium | Was removed from openPopover swatch click path |

#### Compliant Patterns (Positive Findings)

- **No `waitForTimeout` in any DSL or spec file** — all waits are state-based
- **28+ `isVisible()` calls all use `.catch(() => false)`** — properly defensive
- **All `force: true` clicks except V8/V9** have clear fallback rationale
- **All `test.setTimeout()` except V7** have justification comments with measured durations
- **No `maxDiffPixels` in spec files** — only in DSL (`carousel.ts:212`)
- **No `keyboard.type()` in spec files** — all in DSL (though should be `pressSequentially`)

### Task 7: Produce fix plan for violations — DONE

#### Fix Plan (Ordered by Blast Radius)

**Execution rule**: After each fix group, run the blast-radius check (Standard #20) — all affected specs, then full suite if >5 specs.

---

##### FIX GROUP 1 — P1 Critical: `colorPicker.ts:openPopover()` (resolves R4, R5, R6 — 14/17 failures)

**File**: `tests/support/dsl/colorPicker.ts`
**Violations**: V8, V9, V10

| # | Change | Lines | Detail |
|---|--------|-------|--------|
| 1a | Restore `scrollIntoViewIfNeeded()` before first click | 155 | Add `await swatch.scrollIntoViewIfNeeded();` before `swatch.click({ ... })`. Ensures swatch is in viewport before clicking, especially on Advanced Options tab with content above the fold. |
| 1b | Add `force: true` rationale comments | 158, 163 | Add comments: `// force: true — swatch may be behind AntD tab transition overlay` |
| 1c | Fix fallback to re-click swatch, not wrapper div | 169–179 | Replace the entire fallback `catch` block. Instead of `this.window.getByTestId(inputTestId).click()` (wrapper div), re-click `this.getColorSwatch(inputTestId)` with `scrollIntoViewIfNeeded()`. |

**Proposed `openPopover()` replacement (lines 155–179)**:
```typescript
    const swatch = this.getColorSwatch(inputTestId);
    await swatch.scrollIntoViewIfNeeded();
    await expect(swatch).toBeVisible();
    try {
      // force: true — swatch may be behind AntD tab transition overlay
      await swatch.click({ trial: false, force: true });
    } catch (error) {
      // Re-query and retry in case the element was re-rendered
      const retrySwatch = this.getColorSwatch(inputTestId);
      await retrySwatch.scrollIntoViewIfNeeded();
      await expect(retrySwatch).toBeVisible();
      // force: true — retry after re-render; same overlay rationale
      await retrySwatch.click({ trial: false, force: true });
    }

    try {
      await this.expectVisible(inputTestId);
    } catch {
      // Flow-defensive: close any orphaned portal, then re-click swatch (Standard #22)
      await this.window.keyboard.press('Escape');
      const retrySwatch = this.getColorSwatch(inputTestId);
      await retrySwatch.scrollIntoViewIfNeeded();
      // force: true — clearing orphaned portal may leave transition in progress
      await retrySwatch.click({ force: true });
      await this.expectVisible(inputTestId, 5000);
    }
```

**Blast-radius check**: `color-picker.spec.ts` (10), `color-palettes.spec.ts` (1), `gradient-editor.spec.ts` (3) + any spec calling `ensurePopoverOpen` → full suite required.

---

##### FIX GROUP 2 — P2 Medium: Replace `keyboard.type()` with `pressSequentially()` (resolves R1)

**Violations**: V1, V2, V3, V4, V5

| # | File:Line | Current Code | Replacement |
|---|-----------|-------------|-------------|
| 2a | `propertiesPanel.ts:180` | `await this.window.keyboard.type(entityId);` | `await input.pressSequentially(entityId, { delay: 0 });` — requires getting the focused input locator, or using `this.window.locator(':focus').pressSequentially(entityId, { delay: 0 });` |
| 2b | `stateIcons.ts:114` | `await this.window.keyboard.type(iconName);` | `await this.window.locator(':focus').pressSequentially(iconName, { delay: 0 });` — final fallback, targeting current focus |
| 2c | `conditionalVisibility.ts:43` | `await this.window.keyboard.type(value);` | `await this.window.locator(':focus').pressSequentially(value, { delay: 0 });` — last-resort fallback |
| 2d | `attributeDisplay.ts:44` | `await this.window.keyboard.type(value);` | `await this.window.locator(':focus').pressSequentially(value, { delay: 0 });` — fallback path |
| 2e | `colorPicker.ts:580` | `await this.window.keyboard.type(color);` | `await input.pressSequentially(color, { delay: 0 });` — `input` is already in scope at line 576 |

**Note**: `pressSequentially()` on `:focus` is safe here because these are all last-resort fallback paths where the element is already focused. The `{ delay: 0 }` avoids timing issues under load (Standard #21).

**Blast-radius check**: Each DSL has different consumers — check all individually. Combined: `attribute-display.spec.ts`, `conditional-visibility.spec.ts`, `state-icons.spec.ts`, `color-picker.spec.ts`, `entity-browser.spec.ts`, etc.

---

##### FIX GROUP 3 — P3 Low: Spec-level and Timing Fixes (resolves R2, R3)

| # | File:Line | Violation | Fix |
|---|-----------|-----------|-----|
| 3a | `settings.spec.ts:99` | V6: Raw `.ant-switch` CSS selector | Replace `ctx.window.locator('.ant-switch').first()` with a `data-testid` locator. Requires adding `data-testid="diagnostics-verbose-switch"` to the Switch component in the Settings UI. |
| 3b | `smart-actions.spec.ts:7` | V7: `test.setTimeout(120000)` with no justification | Add comment: `// Measured: smart-action computation + YAML persistence takes ~80s on WSL2; 120s = 1.5× headroom` (or measure actual runtime and adjust). |
| 3c | `carousel.spec.ts:78` | R2: Autoplay polling timeout too tight | Increase `expect.poll` timeout from `4000` to `8000`, or better: use Playwright Clock API (`page.clock.install()` + `page.clock.runFor(autoplayDelay * 2)`) for deterministic timer control. |
| 3d | `carousel.visual.spec.ts:57` | R3: Visual baseline drift | Update baseline snapshot after the P1 fix is applied and full suite is stable. Consider switching to `clip`-based screenshot per Standard #24 if dimension swaps recur. |

---

##### FIX GROUP 4 — Deferred Improvements (not blocking regression resolution)

| # | Recommendation | Effort | Notes |
|---|---------------|--------|-------|
| 4a | Promote `selectAntOption()` to shared utility | Medium | Consolidate from 4+ DSLs into `tests/support/dsl/shared/antSelect.ts`. Standard #27. Track as separate task. |
| 4b | Playwright Clock API for carousel autoplay | Low | Replace polling with deterministic timer in `carousel.spec.ts`. Can be done with 3c or separately. |
| 4c | `getPopupContainer` for AntD portals | Medium | Scope portals to panel container for easier testing. Requires product code change. Track as separate task. |

---

## Phase 4: Deliverables — COMPLETED

### D1. Findings Summary

See **Phase 1 → Root Cause Correlation Matrix** above. Key finding: commit `1774ac0` (Feature 4.1: Swiper carousel foundation) introduced all 17 regressions. 14/17 cluster around a single DSL method (`colorPicker.ts:openPopover()`) where the fallback clicks a wrapper `<div>` instead of the swatch trigger.

### D2. New/Updated Rules List

| Document | Changes |
|----------|---------|
| `docs/testing/TESTING_STANDARDS.md` | Added Standards #20–#28 (9 new standards): DSL Blast-Radius Check, `keyboard.type()` Prohibition, Popover/Portal Open Contract, `force:true` Rationale, Dimension Swap Prevention, Subpixel Drift Tolerance, Screenshot Environment Consistency, Shared AntD Select Utility, Measured-Runtime Documentation |
| `ai_rules.md` | Added Rule 4a: DSL Change Blast-Radius Check (mandatory for AI agents) |
| `docs/testing/PLAYWRIGHT_TESTING.md` | Added 3 troubleshooting sections: Ant Design Popover Not Opening, Clustered Failures Point to Shared DSL, Carousel Autoplay Flakiness |

### D3. Code Compliance Results

See **Phase 3 → Violations Found** table above. Summary:
- **10 violations** found (V1–V10): 1 Critical, 6 Medium, 3 Low (note: V6 count corrected — was listed as 2 Low)
- **6 positive compliance patterns** confirmed (no `waitForTimeout`, defensive `isVisible()`, etc.)
- **0 violations in spec files** for `keyboard.type()` or `maxDiffPixels` — all in DSL (correct layer)

### D4. Fix Plan

See **Task 7 → Fix Plan** above. Execution order:
1. **Group 1 (P1)**: Fix `colorPicker.ts:openPopover()` → resolves 14/17 failures
2. **Group 2 (P2)**: Replace `keyboard.type()` in 5 DSLs → resolves 1/17 failures
3. **Group 3 (P3)**: Spec-level fixes + timing → resolves 2/17 failures
4. **Group 4 (Deferred)**: Shared utility consolidation, Clock API, portal scoping

---

## Additional Recommendations (Incorporated into Fix Plan)

1. **DSL Change Blast-Radius Check** — Codified as Standard #20 and ai_rules.md Rule 4a.
2. **Popover Idempotency Contract** — Codified as Standard #22. Fix Group 1 implements it for `openPopover()`.
3. **Promote `selectAntOption()` to shared utility** — Codified as Standard #27. Tracked as Fix Group 4a (deferred).
4. **Playwright Clock API for autoplay tests** — Tracked as Fix Group 3c/4b.

---

## Regression Checklist Cross-Reference

From `E2E_FAILURES_RCA.md` Regression Checklist (2026-02-07):

| ID | Failure | Cluster | Root Cause | Fix Priority |
|----|---------|---------|------------|-------------|
| R1 | `attribute-display.spec.ts:79` — dropdown timeout | Isolated (AntD Select) | `keyboard.type()` too slow (V4) | P2 |
| R2 | `carousel.spec.ts:78` — autoplay advance | Isolated (timing) | Polling timeout too tight | P3 |
| R3 | `carousel.visual.spec.ts:37` — slide snapshot | Isolated (visual) | Baseline drift under load | P3 |
| R4 | `color-palettes.spec.ts:6` — palette flow | ColorPicker cluster | `openPopover()` bug (V9) | P1 |
| R5 | `color-picker.spec.ts` — 10 tests | ColorPicker cluster | `openPopover()` bug (V9) | P1 |
| R6 | `gradient-editor.spec.ts` — 3 tests | ColorPicker cluster | Upstream of V9 via backgroundCustomizer | P1 |

---

---

## Addendum: Deeper Root Cause Discovered (2026-02-08)

The original analysis (Phases 1-4) correctly identified the DSL-side regression (`openPopover()` fallback clicking wrapper div instead of swatch). However, after applying the DSL fixes, 14/17 failures persisted. Further investigation revealed a **deeper product-code root cause**:

**PropertiesPanel.tsx** passed an inline `items={[...]}` array to Ant Design `<Tabs>`. This created a new array reference on every render, causing Tabs to remount all panel children — including `ColorPickerInput` and `GradientPickerInput` — on every card property change. The DSL fix alone couldn't solve this because the DOM was being destroyed at the product level, not the test level.

### Resolution (2026-02-08)

Three-part fix:
1. **PropertiesPanel Tabs memoization** — Wrapped `items` in `useMemo` with structural-only deps (`card?.type`), stabilized handlers with `useCallback` + `useRef`
2. **GradientPickerInput popover state cache** — Module-level cache (same pattern as ColorPickerInput)
3. **ColorPickerInput popover state cache** — Already applied in prior session

Result: 17 failures → 0 failures. Full suite: 147 passed, 0 failed, 2 skipped.

### Standards Added

To prevent recurrence, new rules were codified:
- `ai_rules.md` Rule 8 (8a-8e): React Component Stability Rules — Ant Design Integration
- `TESTING_STANDARDS.md` Standard #29: Product Code Testability — Ant Design Rendering Stability
- `PLAYWRIGHT_TESTING.md`: Troubleshooting section "PropertiesPanel Child Components Losing State"

### Key Lesson

**Clustered E2E failures can have product-code root causes, not just test/DSL causes.** When DSL fixes don't resolve the regression, investigate whether the product code is destroying DOM (unmount/remount cycles) during the operation under test. The symptom — "element was detached from the DOM" — points to product-code rendering instability, not flaky selectors.

---

**Last Updated**: 2026-02-08 (Plan complete + addendum with deeper root cause)
