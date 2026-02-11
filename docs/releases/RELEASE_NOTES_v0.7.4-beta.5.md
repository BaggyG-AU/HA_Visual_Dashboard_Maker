# Release Notes — v0.7.4-beta.5

**Release Date**: February 11, 2026  
**Release Type**: Beta Release  
**Version**: 0.7.4-beta.5

---

## 🎯 Highlights

- **Layout Infrastructure Layer (Phase 4) delivered end-to-end** with five shipped features: Carousel foundation, Accordion card, Tabs card, Popup/Modal system, and native layout enhancements.
- **Feature 4.5 complete**: native Home Assistant `vertical-stack`, `horizontal-stack`, and `grid` now support configurable spacing, alignment, and wrap controls with backward-compatible defaults.
- **PropertiesPanel stability hardening** completed to prevent Ant Design Tabs remount regressions and portal flicker, with explicit guardrails codified in `ai_rules.md`.
- **DSL-first test coverage expanded** for all new layout/container workflows, including targeted visual regression coverage and YAML round-trip assertions.

---

## ✨ Features / Changes

### Feature 4.1: Carousel Foundation
- Integrated Swiper v12 foundation for carousel layout infrastructure.
- Added renderer and DSL/test coverage patterns used by later layout features.

### Feature 4.2: Accordion Card Module
- Added Accordion container card with card registry and BaseCard integration.
- Added regression guardrails and DSL coverage for accordion flows.

### Feature 4.3: Tabs Card Module
- Added Tabs container card with tab switching, orientation, defaults, and YAML persistence support.
- Added E2E and visual coverage for tabs behavior and accessibility workflows.

### Feature 4.4: Popup/Modal Card System
- Added popup trigger card workflow integrated with PropertiesPanel and YAML serialization.
- Added E2E and visual tests for modal open/close behavior, keyboard handling, and focus restoration.

### Feature 4.5: Horizontal/Vertical Layout Enhancements
- Enhanced existing HA layout cards (no new card type) with configurable layout controls:
  - `vertical-stack`: `gap`, `align_items`
  - `horizontal-stack`: `gap`, `align_items`, `justify_content`, `wrap`
  - `grid`: `row_gap`, `column_gap`, `align_items`, `justify_items`
- Added gap presets (`none`, `tight`, `normal`, `relaxed`, `custom`) with normalization/clamping logic.
- Preserved backward compatibility when new properties are omitted.
- Added live preview updates in PropertiesPanel and YAML round-trip preservation for new layout config.
- Added deferred-note tracking for future `align_content` enhancement (explicitly out of current MVP scope).

### Stability / Regression Hardening
- Fixed systemic PropertiesPanel Tabs remount behavior that previously caused broad E2E instability.
- Hardened shared `ColorPickerDSL.closePopover()` behavior using flow-defensive close retries (`Escape` + conditional outside click fallback) to resolve popover dismissal flake in visual flows.

---

## 🧪 Testing & Quality

- **Lint**: `npm run lint` passed (warnings only; no lint errors).
- **Feature 4.5 targeted validation**:
  - `tests/unit/layout-config.spec.ts` passed.
  - `tests/e2e/layout.spec.ts` passed.
  - `tests/e2e/layout.visual.spec.ts` passed.
- **Regression validation**:
  - Full Electron regression run identified one popover-dismiss flake in `tests/e2e/card-background.visual.spec.ts`.
  - Applied DSL hardening fix and re-ran full affected consumer set (`closePopover` consumers): `25 passed`, `2 skipped`, `0 failed`.

Testing standards compliance:
- ✅ DSL-first E2E approach maintained
- ✅ Shared DSL blast-radius verification completed after DSL change
- ✅ State-based waits used; no arbitrary sleeps introduced

---

## 📝 Documentation

- Updated `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md` with Feature 4.5 completion and deferred follow-up notes.
- Added Feature 4.5 prompt/spec reference document:
  - `docs/features/PHASE_4_5_LAYOUT_ENHANCEMENTS_PROMPT.md`
- Updated/maintained standards and prompt alignment docs for Phase 4 implementation flow.

---

## 🐛 Known Issues & Limitations

- Repository retains existing ESLint warning baseline (`any`-typing and hook dependency warnings in legacy areas); no new lint errors introduced.
- Some tests remain intentionally skipped per existing documented Electron/focus constraints.
- Advanced multi-row alignment (`align_content`) is intentionally deferred beyond Feature 4.5 MVP.

---

## 📦 Upgrade Instructions

1) Pull latest changes:
   ```bash
   git checkout feature/layout-infrastructure-layer
   git pull
   ```

2) Install dependencies:
   ```bash
   npm install
   ```

3) Recommended validation:
   ```bash
   npm run lint
   npm run test:unit -- layout-config
   npx playwright test tests/e2e/layout.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure
   npx playwright test tests/e2e/layout.visual.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure
   ```

---

## 🏁 Git Information

- **Branch**: `feature/layout-infrastructure-layer`
- **Version bump**: `package.json` set to `0.7.4-beta.5`
- **Commits included since last PR merge (`d433949`)**:
  - `4680385` Initial: Create Phase 4 implimentation documents
  - `1774ac0` Feature 4.1: Integrate Swiper v12 carousel foundation with DSL + tests
  - `23f441a` Fix: Resolve 17 E2E regressions caused by PropertiesPanel Tabs remounting children
  - `e67be52` Feature 4.2 - Accordian Card Module + regression guardrail hardening
  - `ca4fe81` Feature 4.3: Tabs card module (v0.7.4-beta.3)
  - `0c2a54d` Feature 4.4: Popup/Modal Card System (v0.7.4-beta.4)
  - `ddb438a` Feature 4.5: Horizontal/Vertical Layout Enhancements (v0.7.4-beta.5)

- For full diff, compare `d433949...feature/layout-infrastructure-layer` in git history.

---

## 🎯 Summary

v0.7.4-beta.5 delivers the complete Phase 4 Layout Infrastructure Layer and finalizes Feature 4.5 layout enhancements for native HA stack/grid cards. The release includes functional layout controls, PropertiesPanel integration, YAML round-trip support, and stabilized shared DSL behavior with verified blast-radius coverage.
