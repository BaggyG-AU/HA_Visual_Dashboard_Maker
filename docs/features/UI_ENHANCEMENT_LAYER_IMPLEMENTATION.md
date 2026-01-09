# UI Enhancement Layer Implementation Plan

**Feature**: Phase 2 - UI Enhancement Layer (HAVDM Advanced Features)
**Branch**: `feature/ui-enhancement-layer`
**Version Target**: v0.5.0-beta.1
**Dependencies**: Phase 1 (Foundation Layer - Color Picker, Animations, Typography)
**Status**: In Progress (Gradient Editor started)
**Planned Start**: After v0.4.0 release

---

## Overview

This document tracks the implementation of Phase 2 (UI Enhancement Layer) features from the HAVDM Advanced Features roadmap. These features build on the Foundation Layer (Phase 1) to provide rich visual enhancements and customization options.

**Phase 2 Goal**: Rich visual enhancements using foundation components

**Features in Phase 2**:
1. 🚧 Gradient Editor (core + presets + PropertiesPanel integration delivered; tests in progress)
2. ⏳ Favorite Colors Manager
3. ⏳ Icon Color Customization
4. ⏳ Card Background Customization
5. ⏳ Haptic Feedback System
6. ⏳ UI Sounds System

**Dependencies from Phase 1**:
- ✅ Color Picker Component (react-colorful)
- ⏳ Animation CSS Framework
- ⏳ Typography/Google Fonts System

---

## Feature 2.1: Gradient Editor

**Priority**: High
**Dependencies**: Phase 1 Color Picker Component
**Estimated Effort**: 4-5 days
**Status**: 🚧 In Progress

### Implementation Checklist

#### Phase 1: Core Gradient Component (Days 1-2)
- [x] Create `src/components/GradientEditor.tsx`
- [x] Create `src/types/gradient.ts` for TypeScript types
- [x] Create `src/utils/gradientConversions.ts` for gradient utilities
- [x] Implement gradient editor with:
  - [x] Linear/radial gradient toggle
  - [x] Angle selector (0-360°) for linear gradients
  - [x] Position selector (center/right/left/top/bottom) for radial gradients
  - [x] Color stops manager (add/remove/reorder)
  - [x] Position slider for each color stop (0-100%)
  - [x] Color picker integration for each stop
  - [x] Live preview panel
  - [x] CSS output display
- [x] Add keyboard navigation:
  - [x] Tab through gradient controls
  - [x] Arrow keys to adjust angle/position
  - [x] Delete key to remove color stops
  - [x] Enter to add new color stop
- [x] Add ARIA labels and accessibility attributes
- [x] Style with Ant Design theme compatibility

#### Phase 2: Preset Gradients Library (Day 2)
- [x] Create `src/data/gradientPresets.ts`
- [x] Implement preset categories:
  - [x] Material Design gradients
  - [x] Nature (sunset, ocean, forest, etc.)
  - [x] Tech (neon, cyberpunk, aurora)
  - [x] Monochrome (grayscale variations)
  - [x] User-saved presets
- [x] Add preset selector UI:
  - [x] Grid view of preset thumbnails
  - [x] Category filter/search
  - [x] Click to apply preset
- [x] Implement preset management:
  - [x] Save current gradient as preset
  - [x] Delete user presets
  - [x] Import/export preset collections

#### Phase 3: PropertiesPanel Integration (Day 3)
- [x] Create `GradientPickerInput` wrapper component:
  - [x] Gradient preview swatch
  - [x] Click to open popover/modal
  - [x] Display current gradient type (linear/radial)
  - [x] Support solid color fallback
- [x] Integrate with Advanced Styling Tab:
  - [x] Add "Background Gradient" section to PropertiesPanel
  - [x] "Use Gradient" toggle switch
  - [x] Gradient editor appears when enabled
  - [x] Falls back to solid color when disabled
- [x] Wire up onChange handlers for live preview
- [x] Ensure popover positioning works in scrollable panel (rendered to body + z-index)

#### Phase 4: YAML Persistence (Day 3-4)
- [x] Test gradient format serialization:
  - [x] Linear: `linear-gradient(90deg, #FF0000 0%, #0000FF 100%)`
  - [x] Radial: `radial-gradient(circle at center, #FF0000 0%, #0000FF 100%)`
  - [x] Multiple stops: `linear-gradient(90deg, #F00 0%, #0F0 50%, #00F 100%)`
- [x] Verify YAML round-trip:
  - [x] Save gradient → serialize to YAML (E2E: `tests/e2e/gradient-editor.spec.ts` passes)
  - [x] Load YAML → deserialize to gradient
  - [x] Verify format preservation
- [x] Handle edge cases:
  - [x] Invalid gradient syntax
  - [x] Missing color stops
  - [x] Fallback to solid color
  - [x] CSS variable gradients (future)

#### Phase 5: Unit Tests (Day 4)
- [x] Create `tests/unit/GradientEditor.spec.tsx`
- [x] Add conversion coverage in `tests/unit/gradient-conversions.spec.ts`
- [x] Test gradient parsing (linear/radial, invalid fallback)
- [x] Test gradient generation (linear/radial)
- [x] Test preset management:
  - [x] Load preset gradients
  - [x] Save custom gradient
  - [x] Delete user preset
  - [x] Import/export presets

#### Phase 6: E2E Tests (Day 5)
- [x] Create `tests/e2e/gradient-editor.spec.ts`
- [x] Create `tests/support/dsl/gradientEditor.ts` DSL helper
- [x] Test gradient editor interactions:
  - [x] Open gradient editor from PropertiesPanel (E2E: `tests/e2e/gradient-editor.spec.ts` passes)
  - [x] Toggle linear/radial mode
  - [x] Add color stop
  - [x] Remove color stop
  - [x] Adjust color stop position
  - [x] Change color stop color
  - [x] Adjust gradient angle
  - [x] Apply preset gradient
- [x] Test PropertiesPanel integration:
  - [x] Enable gradient mode
  - [x] Live preview updates
  - [x] Save gradient to YAML
  - [x] Load gradient from YAML
- [x] Test keyboard navigation
- [x] Test with multiple card types

#### Phase 7: Documentation (Day 5)
- [x] Update README with gradient editor overview
- [x] Document gradient CSS format
- [x] Add examples to user guide
- [x] Update `docs/testing/TESTING_STANDARDS.md` with gradient test patterns
- [x] Create inline code comments
- [x] Document component API (props, events)

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [x] GradientEditor component renders with linear/radial modes
- [x] Color stops can be added, removed, repositioned
- [x] Preset gradients library available
- [x] Advanced Styling Tab integration in PropertiesPanel
- [x] Live preview updates on gradient change
- [x] YAML persistence works (round-trip)
- [x] Keyboard navigation complete
- [x] ARIA labels present
- [x] Unit tests pass (95%+)
- [x] E2E tests pass (95%+)
- [x] No lint errors
- [x] Documentation complete

**Should Have (Nice to Have)**:
- [ ] Visual regression tests verified
- [ ] Performance benchmarks acceptable
- [ ] Export gradient as PNG/SVG
- [ ] Gradient animation support

**Won't Have (Future)**:
- CSS variable gradients (e.g., `var(--primary-color)`) - Phase 7
- Mesh gradients - Future
- Animated gradient transitions - Future

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex gradient CSS parsing | Medium | Medium | Use proven CSS parser library or regex patterns |
| Performance with many color stops | Low | Low | Limit to 10 color stops, optimize re-renders |
| Gradient preview accuracy | Medium | Low | Use CSS-based preview, match browser rendering |
| YAML format conflicts | Medium | Low | Test gradient syntax with HA dashboard |
| Preset library size | Low | Low | Start with 20-30 presets, add more over time |

---

## Feature 2.2: Favorite Colors Manager

**Priority**: Medium
**Dependencies**: Phase 1 Color Picker Component
**Estimated Effort**: 2-3 days
**Status**: ✅ Completed (Favorites delivered)

### Implementation Checklist

#### Phase 1: Color Palette Data Model (Day 1)
- [x] Create `src/types/colorPalette.ts`
- [x] Define palette structure:
  - [x] Palette ID, name, description
  - [x] Color array (max 20 colors per palette)
  - [x] Metadata (created date, last modified)
  - [x] Default palette vs user palette flag
- [x] Create `src/hooks/useColorPalettes.ts` for palette management
- [x] Implement palette operations:
  - [x] Create new palette
  - [x] Add color to palette
  - [x] Remove color from palette
  - [x] Rename palette
  - [x] Delete palette
  - [x] Reorder colors within palette
- [x] Persist palettes to localStorage

#### Phase 2: Palette Manager UI (Day 1-2)
- [x] Create `src/components/ColorPaletteManager.tsx`
- [x] Implement UI features:
  - [x] List of palettes (dropdown)
  - [x] Selected palette color swatches grid
  - [x] "New Palette" button
  - [x] "Add Color" button (uses current picker color)
  - [x] Reorder colors (up/down controls)
  - [x] Right-click remove (user palettes), duplicate, delete (non-default)
- [x] Add default palettes:
  - [x] Material Design colors
  - [x] Tailwind CSS colors
  - [x] Home Assistant brand colors
  - [x] Flat UI colors
- [x] Import/Export functionality:
  - [x] Export palette as JSON
  - [x] Import palette from JSON
  - [x] Export as CSS variables (clipboard)

#### Phase 3: Color Picker Integration (Day 2)
- [x] Extend `ColorPickerInput` to show favorite palettes
- [x] Add "Favorites" tab/section to color picker popover
- [x] Display current palette colors as swatches
- [x] Click swatch to apply color
- [x] Right-click swatch to remove from palette
- [x] "Add to Palette" button in color picker
- [x] Palette selector dropdown in color picker

#### Phase 4: Testing & Documentation (Day 3)
- [x] Create `tests/unit/useColorPalettes.spec.ts`
- [x] Test palette operations
- [x] Test import/export functionality
- [x] Create `tests/e2e/color-palettes.spec.ts`
- [x] Document palette JSON format (`docs/product/COLOR_PALETTE_USER_GUIDE.md`)
- [ ] Create `tests/unit/ColorPaletteManager.spec.tsx` (optional UI unit)
- [x] Update user guide with palette management

### Acceptance Criteria

**Must Have**:
- [x] Create, rename, delete color palettes
- [x] Add/remove colors from palettes
- [x] Persist palettes to localStorage
- [x] Quick access from color picker
- [x] Import/export palettes (JSON)
- [x] Default palettes included
- [x] Unit tests pass (95%+)
- [x] E2E tests pass (95%+)

**Should Have**:
- [x] Drag-and-drop reorder colors (via up/down controls)
- [x] Duplicate palette feature
- [x] Export as CSS variables (clipboard)
- [ ] Palette preview thumbnails

---

## Feature 2.3: Icon Color Customization

**Priority**: Medium
**Dependencies**: Phase 1 Color Picker Component
**Estimated Effort**: 2-3 days
**Status**: ✅ Completed

### Implementation Checklist

#### Phase 1: Icon Color Logic (Day 1)
- [x] Extend card type definitions to support icon color
- [x] Implement icon color override logic:
  - [x] Static color (fixed color regardless of state)
  - [x] State-based color (different color per entity state)
  - [x] Attribute-based color (color from entity attribute value)
- [x] Create `src/utils/iconColorResolver.ts`:
  - [x] Resolve icon color from entity state
  - [x] Parse color attribute values
  - [x] Fallback to default icon color

#### Phase 2: PropertiesPanel Integration (Day 1-2)
- [x] Add "Icon Color" section to PropertiesPanel
- [x] Color mode selector:
  - [x] Default (use entity default)
  - [x] Custom (fixed color picker)
  - [x] State-based (state→color mapping UI)
  - [x] Attribute-based (attribute selector + color)
- [x] State-based color mapper UI:
  - [x] List entity states (on, off, unavailable)
  - [x] Color picker for each state
- [x] Live preview icon color changes

#### Phase 3: Gradient Icon Support (Day 2)
- [x] Extend icon rendering to support CSS gradients
- [x] Integrate with Gradient Editor for icon gradients
- [x] SVG gradient fill implementation
- [x] Fallback for bitmap icons (solid color only)

#### Phase 4: Testing & Documentation (Day 3)
- [x] Create `tests/unit/iconColorResolver.spec.ts`
- [x] Test state-based color resolution
- [x] Test attribute-based color resolution
- [x] Create `tests/e2e/icon-color.spec.ts`
- [x] Document icon color configuration
- [x] Update user guide

### Acceptance Criteria

**Must Have**:
- [x] Fixed icon color customization
- [x] State-based icon colors
- [x] PropertiesPanel integration
- [x] Live preview updates
- [x] YAML persistence
- [x] Unit tests pass (95%+)
- [x] E2E tests pass (95%+)

**Should Have**:
- [x] Attribute-based icon colors
- [x] Gradient icon support
- [ ] Icon color animation on state change

---

## Feature 2.4: Card Background Customization

**Priority**: High
**Dependencies**: Gradient Editor, Color Picker
**Estimated Effort**: 3-4 days
**Status**: ⏳ Not Started

### Implementation Checklist

#### Phase 1: Background Options (Day 1)
- [ ] Create `src/components/BackgroundCustomizer.tsx`
- [ ] Implement background types:
  - [ ] None (transparent)
  - [ ] Solid color
  - [ ] Gradient (linear/radial)
  - [ ] Image (URL)
  - [ ] Blur effect (frosted glass)
- [ ] Background image options:
  - [ ] Image URL input
  - [ ] Image position (center, cover, contain, repeat)
  - [ ] Image opacity
  - [ ] Blur amount

#### Phase 2: Advanced Effects (Day 2)
- [ ] Backdrop blur (frosted glass effect)
- [ ] Background opacity slider (0-100%)
- [ ] Background blend modes (normal, multiply, screen, overlay)
- [ ] Overlay color with opacity (tint effect)
- [ ] Background size controls (cover, contain, custom)

#### Phase 3: PropertiesPanel Integration (Day 2-3)
- [ ] Add "Background" section to Advanced Styling Tab
- [ ] Background type selector dropdown
- [ ] Conditional UI based on background type:
  - [ ] Color picker for solid
  - [ ] Gradient editor for gradient
  - [ ] Image URL + controls for image
- [ ] Live preview background changes on canvas

#### Phase 4: Testing & Documentation (Day 4)
- [ ] Create `tests/unit/BackgroundCustomizer.spec.tsx`
- [ ] Test background CSS generation
- [ ] Create `tests/e2e/card-background.spec.ts`
- [ ] Test all background types
- [ ] Document background configuration
- [ ] Update user guide with examples

### Acceptance Criteria

**Must Have**:
- [ ] Solid color backgrounds
- [ ] Gradient backgrounds
- [ ] Image backgrounds
- [ ] Background opacity control
- [ ] PropertiesPanel integration
- [ ] Live preview updates
- [ ] YAML persistence
- [ ] Unit tests pass (95%+)
- [ ] E2E tests pass (95%+)

**Should Have**:
- [ ] Backdrop blur effect
- [ ] Blend modes
- [ ] Overlay tint
- [ ] Image position controls

---

## Feature 2.5: Haptic Feedback System

**Priority**: Low
**Dependencies**: None
**Estimated Effort**: 2-3 days
**Status**: ⏳ Not Started

### Implementation Checklist

#### Phase 1: Haptic API Wrapper (Day 1)
- [ ] Create `src/services/hapticService.ts`
- [ ] Implement browser Vibration API wrapper
- [ ] Define haptic patterns:
  - [ ] Light tap (10ms)
  - [ ] Medium tap (25ms)
  - [ ] Heavy tap (50ms)
  - [ ] Double tap (10ms, pause, 10ms)
  - [ ] Success (50ms, pause, 25ms)
  - [ ] Error (25ms, pause, 25ms, pause, 25ms)
- [ ] Feature detection (check if vibration supported)
- [ ] User preferences (enable/disable, intensity)

#### Phase 2: Card Integration (Day 1-2)
- [ ] Add haptic feedback to button cards
- [ ] Trigger on tap_action
- [ ] Configurable haptic pattern per card
- [ ] Default haptic based on action type (toggle vs navigate)

#### Phase 3: Settings & Testing (Day 2-3)
- [ ] Add "Haptic Feedback" to Settings dialog
- [ ] Global enable/disable toggle
- [ ] Intensity slider (0-100%)
- [ ] Test haptic pattern UI
- [ ] Create `tests/unit/hapticService.spec.ts`
- [ ] Create `tests/e2e/haptic-feedback.spec.ts` (mock Vibration API)
- [ ] Document haptic configuration

### Acceptance Criteria

**Must Have**:
- [ ] Vibration API wrapper
- [ ] Basic haptic patterns (light, medium, heavy)
- [ ] Button card integration
- [ ] Settings UI (enable/disable)
- [ ] Unit tests pass (95%+)
- [ ] E2E tests pass (95%+)

**Should Have**:
- [ ] Custom haptic patterns
- [ ] Intensity control
- [ ] Per-card haptic configuration

---

## Feature 2.6: UI Sounds System

**Priority**: Low
**Dependencies**: None
**Estimated Effort**: 2-3 days
**Status**: ⏳ Not Started

### Implementation Checklist

#### Phase 1: Sound Service (Day 1)
- [ ] Create `src/services/soundService.ts`
- [ ] Implement Web Audio API wrapper
- [ ] Preload sound effects:
  - [ ] Click/tap (short beep)
  - [ ] Success (ascending chime)
  - [ ] Error (descending buzz)
  - [ ] Toggle on (positive click)
  - [ ] Toggle off (negative click)
  - [ ] Notification (alert chime)
- [ ] Volume control (0-100%)
- [ ] Sound pool management (limit concurrent sounds)

#### Phase 2: Sound Integration (Day 1-2)
- [ ] Add sound effects to card interactions
- [ ] Trigger on tap_action
- [ ] Default sound based on action type
- [ ] Configurable sound per card

#### Phase 3: Settings & Testing (Day 2-3)
- [ ] Add "UI Sounds" to Settings dialog
- [ ] Global enable/disable toggle
- [ ] Volume slider (0-100%)
- [ ] Sound preview buttons
- [ ] Create `tests/unit/soundService.spec.ts`
- [ ] Create `tests/e2e/ui-sounds.spec.ts` (mock Audio API)
- [ ] Document sound configuration

### Acceptance Criteria

**Must Have**:
- [ ] Web Audio API wrapper
- [ ] Basic sound effects (click, success, error)
- [ ] Button card integration
- [ ] Settings UI (enable/disable, volume)
- [ ] Unit tests pass (95%+)
- [ ] E2E tests pass (95%+)

**Should Have**:
- [ ] Custom sound effects
- [ ] Sound library browser
- [ ] Per-card sound configuration

---

## Phase 2 Summary

**Total Features**: 6
**Total Estimated Days**: 17-23 days (3.5-4.5 weeks)
**Completion**: 0/6 features (0%)

**Dependencies from Phase 1**:
- ✅ Color Picker Component (complete)
- ⏳ Animation CSS Framework (in progress)
- ⏳ Typography/Google Fonts System (planned)

**Next Steps**:
1. Complete Phase 1 (Foundation Layer)
2. Begin Feature 2.1 (Gradient Editor)
3. Update this document daily with progress
4. Move to Feature 2.2 when Feature 2.1 is complete

**Notes**:
- This document should be updated daily with progress
- Each feature should have detailed implementation notes added before starting
- Blockers should be documented immediately
- Compliance checks should be verified before marking features complete

---

## Compliance Checklist

- [ ] ✅ **ai_rules.md**: Reuse components, no duplicates
- [ ] ✅ **TESTING_STANDARDS.md**: DSL-first approach, stable selectors
- [ ] ✅ **ARCHITECTURE.md**: Hybrid organization (complex features in `src/features/`)
- [ ] ✅ **PLAYWRIGHT_TESTING.md**: Role-based locators, no arbitrary waits
- [ ] ✅ **WCAG 2.1 AA**: Keyboard navigation, ARIA labels, color contrast
- [ ] ✅ **Performance**: 60fps animations, <500ms render times
- [ ] ✅ **Visual Regression**: Required for all visual features
- [ ] ✅ **Accessibility**: Comprehensive keyboard and screen reader testing

---

**Last Updated**: January 6, 2026
**Updated By**: Claude Sonnet 4.5
