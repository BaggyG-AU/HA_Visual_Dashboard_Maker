# Release Notes — v0.4.1-beta.1

**Release Date**: January 9, 2026  
**Release Type**: Beta Release  
**Version**: 0.4.1-beta.1

---

## 🎯 Highlights

- **Gradient Editor Phase 7 (Documentation & QA)** completed: user guide, component API, README integration, and testing standards now cover gradient workflows end-to-end.
- **Testing verification**: Gradient Editor unit specs and full Playwright E2E suite for gradients executed and passing; YAML round-trip and keyboard flows validated via DSL.
- **Version bump**: project version set to `0.4.1-beta.1` to reflect the completed documentation/testing phase for Feature 2.1.

---

## ✨ Features / Changes

### Gradient Editor – Documentation & Guidance
- Added user-facing guide detailing supported CSS formats, keyboard workflow, presets import/export, accessibility notes, and troubleshooting (`docs/product/GRADIENT_EDITOR_USER_GUIDE.md`).
- Published component API reference for `GradientEditor` and `GradientPickerInput` with props, behaviors, and testing hooks (`docs/features/GRADIENT_EDITOR_COMPONENT_API.md`).
- Updated README to surface Gradient Editor overview and link to docs.
- Implementation plan updated to mark Phase 7 and Must Have items complete (`docs/features/UI_ENHANCEMENT_LAYER_IMPLEMENTATION.md`).

### Testing Standards
- Added Gradient Editor testing patterns to `docs/testing/TESTING_STANDARDS.md`, emphasizing DSL-only usage, keyboard coverage, preset workflows, and YAML round-trip checks.

---

## 🧪 Testing & Quality

- **Lint**: `npm run lint` — warnings only (longstanding `any` / unused-var baseline; no new errors introduced).
- **Unit**: `npm run test:unit -- GradientEditor gradient-conversions` — passed.
- **E2E (Playwright Electron)**: `npx playwright test tests/e2e/gradient-editor.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure` — passed (4/4), including presets import/export, keyboard-only flow, YAML round-trip, and multi-card coverage. Artifacts under `test-results/artifacts/*gradient-editor*`.

---

## 📝 Documentation

- New: `docs/product/GRADIENT_EDITOR_USER_GUIDE.md`
- New: `docs/features/GRADIENT_EDITOR_COMPONENT_API.md`
- Updated: `docs/features/UI_ENHANCEMENT_LAYER_IMPLEMENTATION.md` (Phase 7 checklist), `docs/testing/TESTING_STANDARDS.md` (gradient patterns), `README.md` (version and feature overview)

---

## 🐛 Known Issues & Limitations

- Repository retains existing ESLint warnings around `any` types and unused vars; no regressions introduced in this release.
- Previously documented Electron focus/Monaco edge cases remain unchanged; see `docs/testing/SKIPPED_TESTS_REGISTER.md` for current skip state.

---

## 📦 Upgrade Instructions

1) Pull latest changes.
2) Install dependencies (if needed):
   ```bash
   npm install
   ```
3) Recommended validation:
   ```bash
   npm run lint
   npm run test:unit -- GradientEditor gradient-conversions
   npx playwright test tests/e2e/gradient-editor.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure
   ```

---

## 🏁 Git Information

- Version bump: `package.json` / `package-lock.json` set to `0.4.1-beta.1`.
- Work included: documentation and testing additions for Gradient Editor Phase 7, README update, testing standards update.
- For full diff, compare `v0.4.0-beta.1...v0.4.1-beta.1` in git history.

---

## 🎯 Summary

v0.4.1-beta.1 finalizes the Gradient Editor’s documentation and testing phase, delivering user-facing guides, API references, and DSL-driven test coverage to accompany the previously delivered functionality.
