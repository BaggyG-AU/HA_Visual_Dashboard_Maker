# Release Notes — v0.4.0-beta.1

**Release Date**: January 6, 2026  
**Release Type**: Beta Release  
**Version**: 0.4.0-beta.1

---

## 🎯 Highlights

- **Foundation Layer: Color Picker** delivered end-to-end: new `ColorPicker` + `ColorPickerInput`, integrated across Properties Panel color fields with recent colors and format support.
- **Visual Regression + Accessibility coverage** added for the Color Picker integration (with documented skips for known Electron/Monaco limitations).
- **Smoother editing UX**: reduced “Card updated” toast spam and batched rapid property edits to reduce undo/history churn while keeping live preview updates.
- **Documentation Phase completed**: user guide, keyboard shortcuts, component API docs, and testing standards updates.

---

## ✨ Features

### Foundation Layer — Color Picker

- Added full-featured color picker component built around `react-colorful`.
- Added `ColorPickerInput` (popover-based form input) used throughout the Properties Panel for card color fields.
- Recent colors history with clear action.
- Format toggle and typed input validation/normalization.
- Improved ARIA labeling for core controls and recent colors list items.

Key files:
- `src/components/ColorPicker.tsx`
- `src/components/ColorPickerInput.tsx`
- `src/hooks/useRecentColors.ts`
- `src/utils/colorConversions.ts`
- `src/components/PropertiesPanel.tsx`

### Properties Editing UX — Reduced Update Churn

- Split “live update” vs “commit” for Properties Panel edits:
  - Live edits update the preview immediately.
  - Expensive side effects (history/toast/commit) are debounced to avoid per-keystroke spam.
- Dashboard store batching support to avoid pushing undo history on every intermediate keystroke during rapid edits.
- Added a small, testable debounce utility to keep behavior deterministic and unit-testable.

Key files:
- `src/components/PropertiesPanel.tsx`
- `src/store/dashboardStore.ts`
- `src/utils/debouncedCommit.ts`

---

## 🧪 Testing & Quality

### Playwright (Electron)

- Added/extended Playwright DSL for color picker interactions:
  - Keyboard open/type/confirm flows
  - Popover containment checks
  - Contrast checks and focus indicator validation
- Added E2E coverage for Color Picker integration in the Properties Panel.

Key files:
- `tests/e2e/color-picker.spec.ts`
- `tests/support/dsl/colorPicker.ts`
- `tests/support/dsl/propertiesPanel.ts`

### Unit Tests (Vitest)

- Expanded unit coverage for color conversion utilities, `useRecentColors`, and color picker behavior.
- Added focused unit test verifying debounced commit fires once after idle.
- Added/updated dashboard store tests for batching behavior.

Key files:
- `tests/unit/ColorPicker.spec.tsx`
- `tests/unit/colorConversions.spec.ts`
- `tests/unit/useRecentColors.spec.ts`
- `tests/unit/debounced-commit.spec.ts`
- `tests/unit/dashboard-store.spec.ts`

### Lint / Hygiene

- Improved ESLint stability by preventing lint from trying to parse third-party bundled JS.
- Reduced net new warning count introduced by recent work (kept warnings under the pre-existing baseline).

Key files:
- `.eslintrc.json`
- `.eslintignore`

---

## 📝 Documentation

Phase 8 documentation is completed for the Color Picker Foundation Layer work:

- README updated with Color Picker overview and doc links.
- User guide and keyboard shortcuts documentation added.
- Component API documented (props, events, and test id conventions).
- Testing standards updated with:
  - Color picker testing patterns
  - Snapshot guidance
  - Skipped tests registry (with revisit triggers)

Key files:
- `docs/archive/features/FOUNDATION_LAYER_IMPLEMENTATION.md`
- `docs/features/COLOR_PICKER_COMPONENT_API.md`
- `docs/product/COLOR_PICKER_USER_GUIDE.md`
- `docs/product/KEYBOARD_SHORTCUTS.md`
- `docs/testing/TESTING_STANDARDS.md`
- `README.md`

---

## ✅ Test Results

Latest recorded Playwright run (`test-results/results.json`):
- **269 passed**
- **22 skipped**
- **0 failed**

Vitest:
- `npm run test:unit` ✅

ESLint:
- `npm run lint` ✅ (warnings only)

---

## 🐛 Known Issues & Limitations

- **Electron focus “inactive” in Playwright** can cause flaky keyboard-focus assertions for some visual/a11y checks in Electron traces. The visual regression + accessibility Color Picker test remains skipped until a deterministic focus strategy is available.
- **Monaco editor model/visibility limitations in E2E**: YAML sync assertions from Playwright remain partially skipped due to intermittent Monaco model detection/visibility in the Properties Panel YAML tab.

See the Skipped Tests Registry in `docs/testing/TESTING_STANDARDS.md` for details and revisit triggers.

---

## 📦 Upgrade Instructions

1) Pull latest changes (or merge the feature branch into your target branch).
2) Install dependencies:
   ```bash
   npm install
   ```
3) Recommended local verification:
   ```bash
   npm run lint
   npm run test:unit
   npx playwright test --trace retain-on-failure
   ```

---

## 🏁 Git Information

### Changes Included Since Last Merge

This release includes changes after merge commit `18d2fcf` (“Merge pull request #12 from BaggyG-AU/fix/deploy-error”), including:

- `2b679a3` feat(foundation): Add color picker infrastructure and utilities
- `63b0a3f` feat(foundation): Add ColorPicker and ColorPickerInput components
- `35e1939` feat(color-picker): add unit tests and PropertiesPanel integration
- `e9d16a7` fix: E2E test fixes and documentation updates for Color Picker
- `3020a32` feat: Wire ColorPickerInput across PropertiesPanel and stabilize color E2E
- `f58e78e` feat: Debounce card property commits, reduce update churn, and complete Phase 7 test work

---

## 🎯 Summary

**v0.4.0-beta.1** advances the Foundation Layer with a production-ready Color Picker workflow, stronger automated coverage, and smoother editing UX by eliminating spammy update feedback and reducing state/history churn during rapid edits.

