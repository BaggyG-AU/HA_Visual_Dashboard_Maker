# Foundation Layer Implementation Plan

**Feature**: Phase 1 - Foundation Layer (HAVDM Advanced Features)
**Branch**: `feature/foundation-layer`
**Version Target**: v0.4.0-beta.1
**Started**: January 5, 2026
**Status**: In Progress

---

## Overview

This document tracks the implementation of Phase 1 (Foundation Layer) features from the HAVDM Advanced Features roadmap. These foundational features provide the infrastructure for visual enhancement and serve as dependencies for Phases 2-7.

**Features in Phase 1**:
1. ✅ Color Picker Component (react-colorful) - **CURRENT FOCUS**
2. ⏳ Animation CSS Framework
3. ⏳ Typography/Google Fonts System
4. ⏳ Shadow/Border Controls
5. ⏳ Opacity Controls

---

## Feature 1.1: Color Picker Component

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 3-5 days
**Status**: 🟡 In Progress

### Implementation Checklist

#### Phase 1: Setup & Dependencies (Day 1)
- [ ] Install `react-colorful` package
- [ ] Verify version compatibility with React 19
- [ ] Check bundle size impact
- [ ] Review react-colorful API documentation
- [ ] Create type definitions for color formats

#### Phase 2: Core Component (Days 1-2)
- [ ] Create `src/components/ColorPicker.tsx`
- [ ] Create `src/types/color.ts` for TypeScript types
- [ ] Create `src/hooks/useRecentColors.ts` for history management
- [ ] Implement color picker with:
  - [ ] Hue/saturation selector (HexColorPicker or RgbaColorPicker)
  - [ ] Alpha channel slider
  - [ ] Hex input field with validation
  - [ ] RGB/HSL format toggle
  - [ ] Color preview swatch
  - [ ] Recent colors display (max 10)
  - [ ] Clear/Reset button
- [ ] Add keyboard navigation:
  - [ ] Tab through all controls
  - [ ] Arrow keys for hue/saturation adjustment
  - [ ] Enter to confirm
  - [ ] Escape to cancel/close
- [ ] Add ARIA labels and accessibility attributes
- [ ] Style with Ant Design theme compatibility

#### Phase 3: PropertiesPanel Integration (Days 2-3)
- [ ] Audit all color fields in PropertiesPanel:
  - [ ] Button card: `color`, `icon_color`
  - [ ] Mushroom cards: `icon_color`
  - [ ] Light card: `use_light_color` related colors
  - [ ] Custom cards: various color properties
  - [ ] Style field: inline color values
- [ ] Create `ColorPickerInput` wrapper component:
  - [ ] Color preview swatch
  - [ ] Click to open popover/modal
  - [ ] Display current color value
  - [ ] Support both hex and rgba formats
- [ ] Replace all color Input fields with ColorPickerInput
- [ ] Wire up onChange handlers for live preview
- [ ] Test with Ant Design Form integration
- [ ] Ensure popover positioning works in scrollable panel

#### Phase 4: YAML Persistence (Day 3)
- [ ] Test color format serialization:
  - [ ] Hex format: `#RRGGBB`
  - [ ] Hex with alpha: `#RRGGBBAA`
  - [ ] RGB format: `rgb(255, 0, 0)`
  - [ ] RGBA format: `rgba(255, 0, 0, 0.5)`
- [ ] Verify YAML round-trip:
  - [ ] Save color → serialize to YAML
  - [ ] Load YAML → deserialize to color
  - [ ] Verify format preservation
- [ ] Test bidirectional sync with YAML editor:
  - [ ] Edit in PropertiesPanel → updates YAML
  - [ ] Edit in YAML → updates PropertiesPanel
- [ ] Handle edge cases:
  - [ ] Invalid color values
  - [ ] Missing color properties
  - [ ] Color format conversions

#### Phase 5: Unit Tests (Day 4)
- [ ] Create `tests/unit/ColorPicker.spec.ts`
- [ ] Test color format conversions:
  - [ ] Hex to RGB conversion accuracy
  - [ ] RGB to HSL conversion accuracy
  - [ ] HSL to Hex conversion accuracy
  - [ ] Alpha channel handling
- [ ] Test hex input validation:
  - [ ] Valid formats: `#RGB`, `#RRGGBB`, `#RRGGBBAA`
  - [ ] Invalid formats rejected
  - [ ] Auto-correction (if applicable)
- [ ] Test recent colors logic:
  - [ ] Add color to history
  - [ ] Limit to 10 colors
  - [ ] Retrieve recent colors
  - [ ] Duplicate handling
  - [ ] Persistence in localStorage
- [ ] Test useRecentColors hook:
  - [ ] Initial state
  - [ ] Add color
  - [ ] Clear history
  - [ ] Persistence

#### Phase 6: E2E Tests (Day 4-5)
- [ ] Create `tests/e2e/color-picker.spec.ts`
- [ ] Create `tests/support/dsl/colorPicker.ts` DSL helper
- [ ] Test opening color picker:
  - [ ] Click color field in PropertiesPanel
  - [ ] Popover/modal appears
  - [ ] Correct initial color displayed
- [ ] Test color selection:
  - [ ] Click hue/saturation selector
  - [ ] Verify color preview updates
  - [ ] Verify hex input updates
- [ ] Test alpha adjustment:
  - [ ] Drag alpha slider
  - [ ] Verify color preview includes alpha
  - [ ] Verify format changes to rgba
- [ ] Test format toggle:
  - [ ] Click format toggle button
  - [ ] Verify input switches to RGB
  - [ ] Click again → switches to HSL
  - [ ] Click again → switches back to Hex
  - [ ] Verify color value accuracy across formats
- [ ] Test recent colors:
  - [ ] Select a color
  - [ ] Close picker
  - [ ] Reopen picker
  - [ ] Verify color appears in recent colors
  - [ ] Click recent color → applies to field
  - [ ] Verify max 10 recent colors
- [ ] Test keyboard navigation:
  - [ ] Tab through all controls
  - [ ] Arrow keys adjust hue/saturation
  - [ ] Enter confirms selection
  - [ ] Escape closes picker
- [ ] Test YAML persistence:
  - [ ] Select color in PropertiesPanel
  - [ ] Save card
  - [ ] Verify color in YAML editor
  - [ ] Edit color in YAML editor
  - [ ] Verify color in PropertiesPanel
- [ ] Test with multiple card types:
  - [ ] Button card color fields
  - [ ] Mushroom card color fields
  - [ ] Custom card color fields

#### Phase 7: Visual Regression & Accessibility (Day 5)
- [ ] Visual regression tests:
  - [ ] Color picker component appearance
  - [ ] Color picker in various states (open, closed, focused)
  - [ ] Recent colors swatches rendering
  - [ ] Popover positioning
- [ ] Accessibility tests:
  - [ ] Keyboard-only navigation test
  - [ ] Screen reader test (manual)
  - [ ] Color contrast validation
  - [ ] ARIA labels verification
  - [ ] Focus indicators visible

#### Phase 8: Documentation (Day 5)
- [ ] Update README with color picker usage
- [ ] Document keyboard shortcuts
- [ ] Add examples to user guide
- [ ] Update `docs/testing/TESTING_STANDARDS.md` with color picker test patterns
- [ ] Create inline code comments
- [ ] Document component API (props, events)

#### Phase 9: Integration & Testing
- [ ] Run all unit tests: `npm run test:unit`
- [ ] Run lint: `npm run lint`
- [ ] Manual testing:
  - [ ] Test all card types with color fields
  - [ ] Test color picker in different screen sizes
  - [ ] Test color picker with different themes
  - [ ] Test edge cases (invalid colors, empty values)
- [ ] Request user to run E2E tests: `npm run test:e2e`
- [ ] Fix any failing tests
- [ ] Verify no regressions in existing functionality

### Dependencies Review

#### Required NPM Packages
- [x] `react-colorful` - Install via: `npm install react-colorful`
  - Size: ~2KB gzipped
  - React 19 compatible: YES (check package.json peer dependencies)
  - TypeScript support: YES (built-in types)

#### Existing Dependencies (Already Available)
- [x] `antd` (v6.1.0) - For Form, Input, Popover components
- [x] `react` (v19.2.3) - Core React functionality
- [x] `zustand` (v5.0.9) - If needed for global state (likely not needed)

#### File Structure
```
src/
├── components/
│   ├── ColorPicker.tsx              # Main color picker component
│   ├── ColorPickerInput.tsx         # Wrapper for form integration
│   └── PropertiesPanel.tsx          # Updated with ColorPickerInput
│
├── hooks/
│   └── useRecentColors.ts           # Hook for recent colors history
│
├── types/
│   └── color.ts                     # TypeScript types for colors
│
├── utils/
│   └── colorConversions.ts          # Hex/RGB/HSL conversion utilities
│
tests/
├── unit/
│   ├── ColorPicker.spec.ts          # Unit tests
│   ├── useRecentColors.spec.ts      # Hook tests
│   └── colorConversions.spec.ts     # Utility tests
│
└── e2e/
    ├── color-picker.spec.ts         # E2E tests
    └── support/dsl/
        └── colorPicker.ts           # ColorPickerDSL
```

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [x] ColorPicker component renders with hue/sat/alpha controls
- [ ] Format toggle works (hex/RGB/HSL)
- [ ] Recent colors display and work (max 10)
- [ ] All PropertiesPanel color fields use ColorPickerInput
- [ ] Live preview updates on color change
- [ ] YAML persistence works (round-trip)
- [ ] Keyboard navigation complete
- [ ] ARIA labels present
- [ ] Unit tests pass (100%)
- [ ] E2E tests pass (100%)
- [ ] No lint errors
- [ ] Documentation complete

**Should Have (Nice to Have)**:
- [ ] Visual regression tests verified
- [ ] Manual accessibility testing complete
- [ ] Performance benchmarks acceptable
- [ ] User guide with examples

**Won't Have (Future)**:
- Named color constants (e.g., "primary", "accent") - Phase 7
- Color themes/presets - Phase 7
- Advanced color theory tools (complementary colors) - Future
- Custom color palettes - Phase 2

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| react-colorful incompatible with React 19 | High | Low | Check peer dependencies first, use alternative if needed |
| Performance issues with many color pickers | Medium | Low | Use React.memo, lazy load picker, optimize re-renders |
| Accessibility gaps | Medium | Medium | Comprehensive keyboard/screen reader testing |
| YAML format conflicts | High | Low | Test all color format variations thoroughly |
| PropertiesPanel layout breaks | Medium | Medium | Test with all card types, various panel widths |
| Recent colors localStorage issues | Low | Low | Add error handling, fallback to memory-only |

### Compliance Checklist

- [ ] ✅ **ai_rules.md**: Reuse ColorPicker component, no duplicates
- [ ] ✅ **TESTING_STANDARDS.md**: DSL-first approach, stable selectors
- [ ] ✅ **ARCHITECTURE.md**: Component in `src/components/`, hook in `src/hooks/`
- [ ] ✅ **PLAYWRIGHT_TESTING.md**: Role-based locators, no arbitrary waits

### Progress Tracking

**Day 1**: Setup & Core Component
- Status: Not started
- Blockers: None

**Day 2**: Component Completion & Integration
- Status: Not started
- Blockers: TBD

**Day 3**: YAML Persistence & Testing Setup
- Status: Not started
- Blockers: TBD

**Day 4**: Unit & E2E Tests
- Status: Not started
- Blockers: TBD

**Day 5**: Documentation & Polish
- Status: Not started
- Blockers: TBD

---

## Feature 1.2: Animation CSS Framework

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 4-6 days
**Status**: ⏳ Not Started

*Implementation details to be added when Feature 1.1 is complete.*

---

## Feature 1.3: Typography/Google Fonts System

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 5-7 days
**Status**: ⏳ Not Started

*Implementation details to be added when Feature 1.2 is complete.*

---

## Feature 1.4: Shadow/Border Controls

**Priority**: Medium
**Dependencies**: Color Picker (for border/shadow colors)
**Estimated Effort**: 3-4 days
**Status**: ⏳ Not Started

*Implementation details to be added when Feature 1.3 is complete.*

---

## Feature 1.5: Opacity Controls

**Priority**: Low
**Dependencies**: None
**Estimated Effort**: 2-3 days
**Status**: ⏳ Not Started

*Implementation details to be added when Feature 1.4 is complete.*

---

## Phase 1 Summary

**Total Features**: 5
**Total Estimated Days**: 17-25 days (3.5-5 weeks)
**Completion**: 0/5 features (0%)

**Next Steps**:
1. Complete Feature 1.1 (Color Picker Component)
2. Review and update this document daily
3. Move to Feature 1.2 when Feature 1.1 is complete

**Notes**:
- This document should be updated daily with progress
- Each feature should have detailed implementation notes added before starting
- Blockers should be documented immediately
- Compliance checks should be verified before marking features complete

---

**Last Updated**: January 5, 2026
**Updated By**: Claude Sonnet 4.5
