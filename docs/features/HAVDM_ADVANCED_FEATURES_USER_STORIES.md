# HAVDM Advanced Features - User Stories & Requirements

**Project**: HA Visual Dashboard Maker
**Feature Set**: HAVDM Advanced Features (Visual Enhancement, Entity Intelligence, Layouts, Visualizations)
**Planning Date**: January 4, 2026
**Status**: Ready for Implementation

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Strategic Decisions](#strategic-decisions)
- [Phase Organization](#phase-organization)
- [Dependency Chain](#dependency-chain)
- [Phase 1: Foundation Layer](#phase-1-foundation-layer)
- [Phase 2: UI Enhancement Layer](#phase-2-ui-enhancement-layer)
- [Phase 3: Entity Intelligence Layer](#phase-3-entity-intelligence-layer)
- [Phase 4: Layout Infrastructure Layer](#phase-4-layout-infrastructure-layer)
- [Phase 5: Advanced Visualization Layer](#phase-5-advanced-visualization-layer)
- [Phase 6: Template & Logic Enhancement](#phase-6-template--logic-enhancement)
- [Phase 7: Ecosystem & Future Growth](#phase-7-ecosystem--future-growth)
- [Existing Feature Alignment](#existing-feature-alignment)

---

## Executive Summary

This document contains comprehensive user stories for HAVDM's advanced feature set. The features are organized into 7 dependency-based phases following the "right the first time" principle - each phase delivers complete, production-ready features without requiring later rework.

**Total Features**: 45+ advanced features + 8 existing feature alignment stories
**Development Approach**: Dependency-first bundling with phase-based releases
**Timeline**: Medium phases (5-7 features, 2-4 week sprints per phase)

---

## Strategic Decisions

### Technology Stack Decisions

| Component | Selected Technology | Rationale |
|-----------|-------------------|-----------|
| **Color Picker** | `react-colorful` (2KB) | Modern, lightweight, accessible |
| **Animation System** | Custom CSS animation library | Maximum flexibility, YAML storage integration |
| **Carousel/Slider** | Swiper.js v12+ | Feature-rich, battle-tested |
| **Charts** | Recharts | React-native, SVG-based, composable |
| **Google Fonts** | CDN + local fallback | Best of both: speed online, works offline |

### Code Organization Strategy

**Hybrid Approach** based on feature complexity:

```
src/
├── components/          # Simple components (1 file, reusable)
│   ├── ColorPicker.tsx
│   ├── FontSelector.tsx
│   └── GradientEditor.tsx
│
├── services/           # Utility services (1-2 files)
│   ├── smartActionService.ts
│   ├── fontService.ts
│   └── animationService.ts
│
├── features/          # Complex features (3+ files, internal state)
│   ├── entity-remapping/
│   │   ├── EntityRemappingDialog.tsx
│   │   ├── FuzzyEntityMatcher.ts
│   │   ├── entityRemappingService.ts
│   │   └── types.ts
│   ├── carousel/
│   │   ├── SwiperCarousel.tsx
│   │   ├── CarouselConfig.tsx
│   │   ├── carouselPresets.ts
│   │   └── types.ts
│   └── graphs/
│       ├── NativeGraphsCard.tsx
│       ├── LineChart.tsx
│       ├── graphService.ts
│       └── types.ts
│
└── styles/             # Global CSS/theming
    └── animations.css
```

### Quality Standards

- **Testing**: Comprehensive E2E coverage + visual regression for visual features + performance benchmarks for critical features
- **Documentation**: User-facing tooltips + developer docs + feature documentation (moderate detail)
- **Accessibility**: WCAG 2.1 AA compliance
- **i18n**: Phase-based internationalization
- **Backward Compatibility**: Progressive enhancement with auto-mapping and graceful degradation

### Compliance Statement

All features in this document **MUST** comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Immutable AI development rules
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first testing approach
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Application architecture patterns
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - E2E testing guidelines

---

## Phase Organization

### Phase 1: Foundation Layer (No Dependencies)
**Duration**: 2-3 weeks
**Features**: 5 foundational features
**Goal**: Establish core visual enhancement infrastructure

Features:
1. Color Picker Component (react-colorful integration)
2. Animation CSS Framework
3. Typography/Google Fonts System
4. Shadow/Border Controls
5. Opacity Controls

---

### Phase 2: UI Enhancement Layer (Depends on Phase 1)
**Duration**: 2-3 weeks
**Features**: 6 visual enhancement features
**Goal**: Build on color/typography foundation

Features:
1. Gradient Editor (depends on Color Picker)
2. Favorite Colors Manager (depends on Color Picker)
3. Icon Color Customization (depends on Color Picker)
4. Card Background Customization (depends on Gradients, Colors)
5. Haptic Feedback System
6. UI Sounds System

---

### Phase 3: Entity Intelligence Layer (Independent)
**Duration**: 3-4 weeks
**Features**: 7 smart entity features
**Goal**: Intelligent entity handling and context

Features:
1. Smart Default Actions (tap-action intelligence)
2. Entity Context Variables (template system)
3. Entity Remapping (fuzzy matching)
4. Entity Attribute Display (secondary_info alternatives)
5. Conditional Entity Visibility
6. Entity State Icons
7. Multi-entity Support

---

### Phase 4: Layout Infrastructure Layer (Independent)
**Duration**: 2-3 weeks
**Features**: 6 layout features
**Goal**: Advanced card layouts and containers

Features:
1. Swiper.js Integration (carousel foundation)
2. Accordion Card Module
3. Tabs Card Module
4. Popup/Modal Card System
5. Horizontal/Vertical Layouts (enhancements)
6. Card Spacing Controls

---

### Phase 5: Advanced Visualization Layer (Depends on Phases 1-4)
**Duration**: 3-4 weeks
**Features**: 8 complex visualization features
**Goal**: Rich data visualization and interactions

Features:
1. Native Graphs (depends on Colors, Animations)
2. Advanced Gauge Card (depends on Gradients, Graphs)
3. Advanced Slider Card (depends on Haptics, Animations)
4. Progress Ring Visualization
5. Sparkline Mini-graphs
6. Timeline Card
7. Calendar View Card
8. Weather Forecast Visualization

---

### Phase 6: Template & Logic Enhancement (Depends on Phase 3)
**Duration**: 2-3 weeks
**Features**: 5 advanced logic features
**Goal**: Dynamic content and automation

Features:
1. Universal Action System (depends on Smart Defaults)
2. Visual Logic Editor (depends on Entity Context)
3. Unified Template System (depends on Entity Context Variables)
4. State-based Styling (depends on Conditional Visibility)
5. Trigger-based Animations (depends on Animation Framework)

---

### Phase 7: Ecosystem & Future Growth (Depends on Phases 1-6)
**Duration**: 3-4 weeks
**Features**: 8 ecosystem features
**Goal**: Community and extensibility

Features:
1. Preset Marketplace (depends on Entity Remapping)
2. Theme Manager (depends on Colors, Gradients, Fonts)
3. Card Duplication & Cloning
4. Bulk Operations
5. Version Control Integration
6. Import/Export Enhancements
7. Dashboard Analytics
8. Plugin System Architecture

---

## Dependency Chain

```
Foundation Layer (No Dependencies)
├─ Color Picker Component
├─ Animation CSS Framework
├─ Typography/Font System
├─ Shadow/Border Controls
└─ Opacity Controls

↓ (Dependencies flow downward)

UI Enhancement Layer (Depends on Foundation)
├─ Gradient Editor → depends on Color Picker
├─ Favorite Colors → depends on Color Picker
├─ Icon Customization → depends on Color Picker
├─ Card Backgrounds → depends on Gradients, Colors
├─ Haptic Feedback → self-contained
└─ UI Sounds → self-contained

↓ (Parallel with UI Enhancement)

Entity Intelligence Layer (Independent)
├─ Smart Default Actions → self-contained logic
├─ Entity Context Variables → template enhancement
├─ Entity Remapping → fuzzy matching logic
├─ Entity Attributes → display logic
├─ Conditional Visibility → state logic
├─ Entity State Icons → icon mapping
└─ Multi-entity Support → configuration logic

↓ (Parallel with Entity Intelligence)

Layout Infrastructure Layer (Independent)
├─ Swiper.js Integration → carousel foundation
├─ Accordion Module → depends on Swiper (optional)
├─ Tabs Module → depends on Swiper (optional)
├─ Popup/Modal → layout engine
├─ H/V Layouts → enhancement to existing
└─ Card Spacing → CSS utilities

↓ (Dependencies converge)

Advanced Visualization Layer (Depends on Multiple)
├─ Native Graphs → depends on Colors, Animations
├─ Advanced Gauge → depends on Graphs, Gradients, Animations
├─ Advanced Slider → depends on Haptics, Animations
├─ Progress Ring → depends on Graphs, Colors
├─ Sparklines → depends on Graphs
├─ Timeline → depends on Layout Infrastructure
├─ Calendar → depends on Layout Infrastructure
└─ Weather Viz → depends on Graphs, Icons

↓

Template & Logic Enhancement (Depends on Entity Intelligence)
├─ Universal Actions → depends on Smart Defaults
├─ Visual Logic Editor → depends on Entity Context, Smart Actions
├─ Unified Templates → depends on Entity Context Variables
├─ State Styling → depends on Conditional Visibility
└─ Trigger Animations → depends on Animation Framework

↓

Ecosystem & Future Growth (Depends on Everything)
├─ Preset Marketplace → depends on Entity Remapping
├─ Theme Manager → depends on Colors, Gradients, Fonts
├─ Card Duplication → depends on all card types
├─ Bulk Operations → depends on all features
├─ Version Control → depends on serialization
├─ Import/Export → depends on all configuration
├─ Analytics → depends on all usage tracking
└─ Plugin System → depends on architecture stability
```

---

## Phase 1: Foundation Layer

### Feature 1.1: Color Picker Component (react-colorful)

**Phase**: 1 - Foundation Layer
**Priority**: High
**Dependencies**: None
**Estimated Effort**: 3-5 days

#### Context & Background

HAVDM currently requires users to manually enter hex codes for color customization, which is error-prone and inefficient. A visual color picker component provides an intuitive interface for selecting colors and serves as a foundational component for customizing card colors, gradients, icons, and more across the application.

**Business Value**: Significantly improves UX for color selection across all card types. Reduces errors from manual hex code entry and enables visual color exploration.

#### In Scope

- ✅ Integration of `react-colorful` library (2KB, modern, accessible)
- ✅ Color picker component with:
  - Hue/saturation selector
  - Alpha channel support
  - Hex input field
  - RGB/HSL format switching
  - Color preview
- ✅ Recent colors history (last 10 colors)
- ✅ Keyboard accessibility (arrow keys for fine-tuning)
- ✅ Integration with PropertiesPanel for all color fields
- ✅ Standardized color picker across all card types

#### Out of Scope

- ❌ Custom color palettes (Phase 2)
- ❌ Named color constants (e.g., "primary", "accent")
- ❌ Color themes/presets (Phase 7)
- ❌ Advanced color theory tools (complementary colors, etc.)

#### Risks

- **Integration Complexity**: react-colorful may have different API than expected
  - *Mitigation*: Review library docs thoroughly before implementation
- **Performance**: Color picker in PropertiesPanel re-renders
  - *Mitigation*: Use React.memo and optimize re-renders
- **Accessibility**: Color picker keyboard navigation
  - *Mitigation*: Test with keyboard-only navigation, screen readers

#### Acceptance Criteria

1. **Color Picker Component**:
   - [ ] ColorPicker component renders with hue/saturation selector
   - [ ] Alpha channel slider present and functional
   - [ ] Hex input field accepts valid hex codes (#RRGGBB, #RRGGBBAA)
   - [ ] RGB/HSL format toggle works
   - [ ] Color preview shows selected color accurately

2. **Recent Colors History**:
   - [ ] Last 10 selected colors persist in component state
   - [ ] Recent colors display as clickable swatches
   - [ ] Clicking recent color updates picker

3. **Keyboard Accessibility**:
   - [ ] Tab navigation through all picker elements
   - [ ] Arrow keys adjust hue/saturation/alpha
   - [ ] Enter key confirms selection
   - [ ] Escape key cancels (if in modal)

4. **PropertiesPanel Integration**:
   - [ ] All color fields replaced with ColorPicker
   - [ ] Clicking color field opens picker (popover or inline)
   - [ ] Color changes update card preview in real-time
   - [ ] Color value persists in dashboard YAML

5. **WCAG 2.1 AA Compliance**:
   - [ ] Color picker has proper ARIA labels
   - [ ] Keyboard navigation fully functional
   - [ ] Screen reader announces color values
   - [ ] Focus indicators visible

#### Non-Functional Requirements

- **Performance**: Color changes must update preview within 16ms (60fps)
- **Bundle Size**: react-colorful adds max 2KB gzipped
- **Browser Support**: Works in Electron (Chromium-based)
- **Accessibility**: WCAG 2.1 AA compliant
- **i18n**: Color format labels translatable (Phase 1 - English only)

#### Testing & Verification

**Unit Tests**:
- [ ] ColorPicker component renders correctly
- [ ] Hex input validation (valid/invalid formats)
- [ ] RGB <-> HSL <-> Hex conversion accuracy
- [ ] Recent colors history logic (add, limit to 10, retrieve)

**E2E Tests** (Playwright):
- [ ] User can open color picker from PropertiesPanel
- [ ] User can select color using hue/saturation selector
- [ ] User can adjust alpha channel
- [ ] User can enter hex code manually
- [ ] User can select from recent colors
- [ ] Keyboard navigation works (tab, arrows, enter, escape)
- [ ] Selected color appears in card preview
- [ ] Selected color persists in YAML

**Visual Regression Tests**:
- [ ] Color picker component appearance
- [ ] Color picker in various states (open, closed, focused)
- [ ] Recent colors swatches rendering

**Accessibility Tests**:
- [ ] Keyboard-only navigation test
- [ ] Screen reader test (NVDA/JAWS)
- [ ] Color contrast validation

#### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Reuse ColorPicker component, no duplicate implementations
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first E2E tests using ColorPickerDSL
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Component lives in `src/components/ColorPicker.tsx`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Trace-driven debugging, no arbitrary waits

#### File Structure

```
src/
├── components/
│   ├── ColorPicker.tsx          # Main color picker component
│   └── ColorPicker.module.css   # Styles (if needed beyond react-colorful)
│
├── hooks/
│   └── useRecentColors.ts       # Hook for recent colors history
│
tests/
├── unit/
│   └── ColorPicker.spec.ts      # Unit tests
│
└── e2e/
    ├── color-picker.spec.ts     # E2E tests
    └── support/dsl/
        └── colorPicker.ts       # ColorPickerDSL
```

#### Implementation Notes

- Use `react-colorful`'s `<HexColorPicker>` or `<RgbaColorPicker>` component
- Store recent colors in localStorage or component state
- Consider using Ant Design's `<Popover>` for color picker overlay
- Ensure color picker doesn't cause PropertiesPanel to scroll unexpectedly

---

### Feature 1.2: Animation CSS Framework

**Phase**: 1 - Foundation Layer
**Priority**: High
**Dependencies**: None
**Estimated Effort**: 4-6 days

#### Context & Background

Modern dashboard interfaces benefit from subtle animations that provide visual feedback and enhance user engagement. HAVDM needs a comprehensive animation system with slide, fade, bounce, pulse, and scale effects that users can apply to cards on state changes, interactions, or page load. This creates a more dynamic and engaging dashboard experience.

**Business Value**: Significantly enhances perceived quality and polish of dashboards. Animations provide visual feedback for state changes and make dashboards feel more responsive and alive.

#### In Scope

- ✅ Custom CSS animation library with:
  - Slide animations (up, down, left, right)
  - Fade animations (in, out)
  - Bounce animations
  - Pulse animations
  - Scale animations (grow, shrink)
  - Rotation animations
- ✅ Animation configuration options:
  - Duration (ms)
  - Delay (ms)
  - Easing function (linear, ease, ease-in, ease-out, ease-in-out, cubic-bezier)
  - Iteration count (1, infinite, custom)
  - Direction (normal, reverse, alternate, alternate-reverse)
- ✅ CSS keyframe definitions in `src/styles/animations.css`
- ✅ TypeScript utility for applying animations to components
- ✅ YAML storage for animation configurations
- ✅ PropertiesPanel UI for selecting and configuring animations

#### Out of Scope

- ❌ Complex animation sequencing (Phase 6)
- ❌ State-based animation triggers (Phase 6)
- ❌ Animation presets/templates (Phase 2 or 7)
- ❌ Custom animation editor (Phase 6)
- ❌ SVG/path animations (future consideration)
- ❌ Physics-based animations (spring, friction) (future consideration)

#### Risks

- **Performance**: Too many concurrent animations degrade performance
  - *Mitigation*: Limit concurrent animations, use CSS transforms (GPU-accelerated), provide performance warning
- **Accessibility**: Animations may trigger motion sensitivity
  - *Mitigation*: Respect `prefers-reduced-motion` media query, provide disable option
- **Browser Compatibility**: Some CSS animations may not work in older Chromium
  - *Mitigation*: Test in target Electron version, use widely-supported animations

#### Acceptance Criteria

1. **Animation CSS Library**:
   - [ ] `animations.css` file contains all animation keyframes
   - [ ] Animations include: slide (4 directions), fade, bounce, pulse, scale, rotate
   - [ ] CSS classes can be applied to enable animations (e.g., `.animate-slide-up`)

2. **Animation Configuration**:
   - [ ] Animation config stored in card YAML under `animation` property
   - [ ] Config includes: type, duration, delay, easing, iteration, direction
   - [ ] Default values provided for all config options

3. **TypeScript Utility**:
   - [ ] `animationService.ts` applies animations to React components
   - [ ] Service converts YAML config to CSS classes/inline styles
   - [ ] Service respects `prefers-reduced-motion` (disables animations if set)

4. **PropertiesPanel UI**:
   - [ ] "Animation" section in PropertiesPanel
   - [ ] Dropdown for animation type (None, Slide Up, Slide Down, Fade In, etc.)
   - [ ] Number inputs for duration and delay
   - [ ] Dropdown for easing function
   - [ ] Inputs for iteration count and direction
   - [ ] Live preview of animation in canvas (when card selected)

5. **YAML Integration**:
   - [ ] Animation config serializes to YAML correctly
   - [ ] Animation config deserializes from YAML correctly
   - [ ] Editing in YAML editor reflects in PropertiesPanel
   - [ ] Editing in PropertiesPanel reflects in YAML editor

6. **Accessibility**:
   - [ ] Animations disabled when `prefers-reduced-motion: reduce` detected
   - [ ] Option to disable animations in app settings
   - [ ] Animation controls keyboard accessible

#### Non-Functional Requirements

- **Performance**:
  - Animations must run at 60fps (16ms frame time)
  - Max 10 concurrent animations without frame drops
  - GPU-accelerated transforms used (translate3d, scale3d)
- **Bundle Size**: Animation CSS < 5KB gzipped
- **Accessibility**:
  - WCAG 2.1 AA compliant (respect motion preferences)
  - Animations never essential for understanding content
- **Browser Support**: Works in Electron 25+ (Chromium 114+)

#### Testing & Verification

**Unit Tests**:
- [ ] `animationService.ts` generates correct CSS classes
- [ ] Config to CSS conversion accuracy
- [ ] `prefers-reduced-motion` detection logic
- [ ] YAML serialization/deserialization

**E2E Tests** (Playwright):
- [ ] User can select animation type from PropertiesPanel
- [ ] User can configure animation duration/delay
- [ ] User can select easing function
- [ ] User can set iteration count and direction
- [ ] Animation config persists in YAML
- [ ] Animation plays when card is in view (visual verification)
- [ ] Animation respects `prefers-reduced-motion` setting

**Visual Regression Tests**:
- [ ] Animation PropertiesPanel UI
- [ ] Cards with various animations applied (screenshots at start/mid/end of animation)

**Performance Tests**:
- [ ] 10 cards with concurrent animations maintain 60fps
- [ ] Animation CPU usage < 20% (single core)

**Accessibility Tests**:
- [ ] Animations disabled with `prefers-reduced-motion: reduce`
- [ ] Animation controls keyboard navigable
- [ ] No essential information conveyed only by animation

#### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Reuse animation CSS, centralized in `animations.css`
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests, no arbitrary waits
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - CSS in `src/styles/`, service in `src/services/`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Visual regression for animations

#### File Structure

```
src/
├── styles/
│   └── animations.css           # CSS keyframe definitions
│
├── services/
│   └── animationService.ts      # Animation utility service
│
├── types/
│   └── animation.ts             # TypeScript types for animation config
│
tests/
├── unit/
│   └── animationService.spec.ts # Unit tests
│
└── e2e/
    ├── animations.spec.ts       # E2E tests
    └── support/dsl/
        └── animation.ts         # AnimationDSL
```

#### Implementation Notes

- Use CSS `animation` property with custom keyframes
- Provide sensible defaults (e.g., 300ms duration, ease-out easing)
- Consider using CSS variables for animation config (easier to override)
- Ensure animations don't interfere with drag-and-drop in visual editor
- Respect user's OS-level motion preferences (`prefers-reduced-motion`)

**Example Animation Config (YAML)**:
```yaml
type: custom:button-card
entity: light.living_room
animation:
  type: fade-in
  duration: 500
  delay: 0
  easing: ease-in-out
  iteration: 1
  direction: normal
```

---

### Feature 1.3: Typography/Google Fonts System

**Phase**: 1 - Foundation Layer
**Priority**: High
**Dependencies**: None
**Estimated Effort**: 5-7 days

#### Context & Background

Typography is a fundamental element of visual design and brand identity. HAVDM users need the ability to customize fonts across all text elements, including access to Google Fonts. This enables dashboards to match home aesthetics or personal preferences, with typography customization significantly impacting visual identity.

**Business Value**: Enables brand consistency and personalization. Users can match dashboard typography to their home aesthetic or personal style. Critical for high-end dashboard designs.

#### In Scope

- ✅ Google Fonts integration:
  - CDN loading with local fallback for offline support
  - Font browsing/selection UI
  - Popular fonts pre-cached
  - Font preview in selection UI
- ✅ Typography controls:
  - Font family selection (system fonts + Google Fonts)
  - Font weight (100-900)
  - Font size (px, rem, em)
  - Line height
  - Letter spacing
  - Text transform (none, uppercase, lowercase, capitalize)
  - Text alignment (left, center, right, justify)
  - Text decoration (none, underline, line-through)
- ✅ Per-element typography:
  - Card title
  - Card content
  - Entity name
  - Entity state
  - Labels/badges
- ✅ Typography service for font loading and caching
- ✅ PropertiesPanel UI for typography configuration

#### Out of Scope

- ❌ Custom font uploads (user provides .ttf/.woff files) (future)
- ❌ Typography presets/themes (Phase 7)
- ❌ Advanced typographic features (kerning, ligatures, OpenType features) (future)
- ❌ Font pairing suggestions (future)
- ❌ Variable fonts support (future)

#### Risks

- **Font Loading Performance**: Google Fonts CDN may be slow or unavailable
  - *Mitigation*: Local fallback fonts, cache popular fonts, async loading with FOUT handling
- **Offline Support**: Google Fonts require internet connection
  - *Mitigation*: Pre-cache top 20 Google Fonts locally, graceful fallback to system fonts
- **Bundle Size**: Caching fonts increases app size
  - *Mitigation*: Only cache popular fonts, lazy load others, use modern font formats (woff2)
- **Typography Overload**: Too many options overwhelm users
  - *Mitigation*: Provide sensible defaults, group controls logically, show preview

#### Acceptance Criteria

1. **Google Fonts Integration**:
   - [ ] `fontService.ts` fetches Google Fonts list from API
   - [ ] Font browser UI displays available fonts with previews
   - [ ] Selected font loads from Google Fonts CDN
   - [ ] If CDN fails, falls back to local cache or system font
   - [ ] Top 20 popular fonts pre-cached in app bundle

2. **Typography Controls**:
   - [ ] Font family dropdown with search/filter
   - [ ] Font weight slider (100-900) or dropdown
   - [ ] Font size input (px, rem, em) with unit selector
   - [ ] Line height input (unitless, px, %)
   - [ ] Letter spacing input (px, em)
   - [ ] Text transform dropdown
   - [ ] Text alignment buttons (left, center, right, justify)
   - [ ] Text decoration checkbox/toggle

3. **Per-Element Typography**:
   - [ ] Separate typography sections for: title, content, entity name, entity state, labels
   - [ ] Each section has full typography controls
   - [ ] Changes apply only to selected element
   - [ ] Preview updates in real-time

4. **PropertiesPanel UI**:
   - [ ] "Typography" accordion section in PropertiesPanel
   - [ ] Font preview shows selected font with sample text
   - [ ] Font search/filter works (debounced)
   - [ ] Controls are grouped logically (Font, Size/Spacing, Style, Alignment)

5. **YAML Integration**:
   - [ ] Typography config serializes to YAML under `typography` property
   - [ ] Config structure: `{ title: {}, content: {}, entity_name: {}, ... }`
   - [ ] Deserializes correctly from YAML
   - [ ] Bidirectional sync with YAML editor

6. **Performance & Offline**:
   - [ ] Fonts load asynchronously (don't block rendering)
   - [ ] FOUT (Flash of Unstyled Text) handling with `font-display: swap`
   - [ ] Offline mode uses cached/system fonts
   - [ ] No console errors when offline

#### Non-Functional Requirements

- **Performance**:
  - Font loading must not block rendering
  - Max 200ms to load cached font
  - Max 2s to load uncached font from CDN (timeout to fallback)
- **Bundle Size**:
  - Pre-cached fonts: Max 500KB total
  - Font service code: < 10KB gzipped
- **Offline Support**:
  - App must function with typography features when offline
  - Graceful degradation to system fonts
- **Accessibility**:
  - Font size must respect user's browser/OS settings (relative units)
  - Minimum font size: 12px for readability
  - WCAG 2.1 AA contrast maintained with custom fonts

#### Testing & Verification

**Unit Tests**:
- [ ] `fontService.ts` fetches Google Fonts list
- [ ] Font loading logic (CDN -> cache -> fallback)
- [ ] Typography config serialization/deserialization
- [ ] Font family validation (exists in list)

**E2E Tests** (Playwright):
- [ ] User can browse available Google Fonts
- [ ] User can search/filter fonts
- [ ] User can select font family for card title
- [ ] User can adjust font size, weight, spacing
- [ ] User can set text alignment and decoration
- [ ] Typography changes apply to card preview
- [ ] Typography config persists in YAML
- [ ] Offline mode uses fallback fonts

**Visual Regression Tests**:
- [ ] Typography controls UI
- [ ] Font preview display
- [ ] Cards with various typography applied

**Performance Tests**:
- [ ] Font loading time < 200ms (cached)
- [ ] Font loading time < 2s (uncached, CDN)
- [ ] Fallback triggers within 2s if CDN fails

**Accessibility Tests**:
- [ ] Minimum font size enforced (12px)
- [ ] Relative units supported (rem, em)
- [ ] Contrast ratio maintained with custom fonts

#### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Centralized font service, no duplicate font loading
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Service in `src/services/fontService.ts`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - State-based waits for font loading

#### File Structure

```
src/
├── services/
│   └── fontService.ts           # Google Fonts fetching, caching, loading
│
├── components/
│   ├── FontSelector.tsx         # Font selection dropdown with preview
│   └── TypographyControls.tsx   # Full typography control panel
│
├── types/
│   └── typography.ts            # TypeScript types
│
├── assets/
│   └── fonts/                   # Pre-cached popular fonts
│       ├── Roboto-Regular.woff2
│       ├── OpenSans-Regular.woff2
│       └── ...                  # Top 20 fonts
│
tests/
├── unit/
│   └── fontService.spec.ts
│
└── e2e/
    ├── typography.spec.ts
    └── support/dsl/
        └── typography.ts         # TypographyDSL
```

#### Implementation Notes

- Use Google Fonts API: `https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR_API_KEY&sort=popularity`
- Consider using `@fontsource` npm packages for self-hosting popular fonts
- Implement font loading observer to detect FOUT/FOIT
- Provide sensible typography defaults (e.g., Roboto for titles, Open Sans for content)
- Group typography controls in collapsible sections to reduce UI clutter

**Example Typography Config (YAML)**:
```yaml
type: entities
title: Living Room
typography:
  title:
    family: 'Roboto'
    weight: 700
    size: '24px'
    line_height: 1.2
    letter_spacing: '0px'
    transform: uppercase
  entity_name:
    family: 'Open Sans'
    weight: 400
    size: '14px'
    color: '#888888'
```

---

### Feature 1.4: Shadow/Border Controls

**Phase**: 1 - Foundation Layer
**Priority**: Medium
**Dependencies**: Color Picker (for border/shadow colors)
**Estimated Effort**: 3-4 days

#### Context & Background

Visual depth and hierarchy are essential for professional dashboard design. HAVDM needs detailed control over card shadows and borders to allow users to create depth, emphasis, and visual separation. Shadows can be customized with offset, blur, spread, and color. Borders support width, style, color, and radius.

**Business Value**: Enables professional-looking dashboards with visual depth. Shadows and borders are critical for creating visual hierarchy and separating content. High impact for minimal effort.

#### In Scope

- ✅ Shadow controls:
  - Horizontal offset (px)
  - Vertical offset (px)
  - Blur radius (px)
  - Spread radius (px)
  - Shadow color (with alpha channel)
  - Multiple shadows (shadow layers)
- ✅ Border controls:
  - Border width (px, all sides or per-side)
  - Border style (solid, dashed, dotted, double, groove, ridge, inset, outset)
  - Border color (with alpha channel)
  - Border radius (px, %, all corners or per-corner)
- ✅ Box shadow presets:
  - None
  - Subtle (small shadow)
  - Medium (default shadow)
  - Strong (pronounced shadow)
  - Custom (user-defined)
- ✅ PropertiesPanel UI for shadow/border configuration
- ✅ Live preview of shadow/border changes

#### Out of Scope

- ❌ Inner shadows (inset box-shadow) (future)
- ❌ Drop shadow filter (for non-rectangular elements) (future)
- ❌ Border image/gradient borders (future)
- ❌ Advanced border effects (SVG borders) (future)

#### Risks

- **Performance**: Complex shadows degrade rendering performance
  - *Mitigation*: Warn users about performance with many large shadows, use CSS `will-change` sparingly
- **Browser Compatibility**: Some border styles may render differently
  - *Mitigation*: Test in target Electron version, provide fallbacks

#### Acceptance Criteria

1. **Shadow Controls**:
   - [ ] Shadow offset inputs (horizontal, vertical)
   - [ ] Shadow blur radius input
   - [ ] Shadow spread radius input
   - [ ] Shadow color picker (with alpha)
   - [ ] "Add Shadow" button to create multiple shadow layers
   - [ ] Shadow layers can be reordered, edited, removed

2. **Border Controls**:
   - [ ] Border width input (all sides or per-side toggle)
   - [ ] Border style dropdown (solid, dashed, dotted, etc.)
   - [ ] Border color picker (with alpha)
   - [ ] Border radius input (all corners or per-corner toggle)

3. **Shadow Presets**:
   - [ ] Preset dropdown: None, Subtle, Medium, Strong, Custom
   - [ ] Selecting preset applies predefined shadow values
   - [ ] Editing any shadow value switches to "Custom"

4. **PropertiesPanel UI**:
   - [ ] "Shadow & Border" section in PropertiesPanel
   - [ ] Shadow and Border subsections
   - [ ] Live preview shows shadow/border changes immediately
   - [ ] Toggle for "all sides" vs "per-side" border configuration

5. **YAML Integration**:
   - [ ] Shadow config serializes to CSS `box-shadow` syntax
   - [ ] Border config serializes to CSS `border` syntax
   - [ ] Config stored under card's `style` property
   - [ ] Deserializes correctly from YAML

6. **Performance**:
   - [ ] Shadows render at 60fps
   - [ ] No frame drops with 20+ cards with shadows

#### Non-Functional Requirements

- **Performance**: Shadows must not degrade rendering below 60fps
- **Accessibility**: Shadows/borders not essential for content understanding
- **Browser Support**: Works in Electron 25+ (Chromium 114+)

#### Testing & Verification

**Unit Tests**:
- [ ] Shadow config to CSS conversion
- [ ] Border config to CSS conversion
- [ ] Preset shadow values correct
- [ ] YAML serialization/deserialization

**E2E Tests** (Playwright):
- [ ] User can adjust shadow offset, blur, spread
- [ ] User can set shadow color
- [ ] User can add multiple shadow layers
- [ ] User can select shadow preset
- [ ] User can adjust border width, style, color, radius
- [ ] User can toggle per-side border configuration
- [ ] Shadow/border changes apply to card preview
- [ ] Config persists in YAML

**Visual Regression Tests**:
- [ ] Shadow/Border controls UI
- [ ] Cards with various shadows applied
- [ ] Cards with various borders applied

**Performance Tests**:
- [ ] 20 cards with complex shadows maintain 60fps

#### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Centralized shadow/border logic
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Component in `src/components/`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Visual regression for shadow rendering

#### File Structure

```
src/
├── components/
│   ├── ShadowControls.tsx       # Shadow configuration UI
│   └── BorderControls.tsx       # Border configuration UI
│
├── services/
│   └── styleService.ts          # Convert config to CSS (if shared with other features)
│
├── types/
│   └── style.ts                 # Shadow/Border TypeScript types
│
tests/
├── unit/
│   └── shadowBorderService.spec.ts
│
└── e2e/
    ├── shadow-border.spec.ts
    └── support/dsl/
        └── style.ts              # StyleDSL
```

#### Implementation Notes

- Use CSS `box-shadow` property: `offset-x offset-y blur-radius spread-radius color`
- Multiple shadows: `box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.2);`
- Border shorthand: `border: width style color;`
- Border radius shorthand: `border-radius: top-left top-right bottom-right bottom-left;`
- Consider using Ant Design's `<InputNumber>` for numeric inputs

**Example Shadow/Border Config (YAML)**:
```yaml
type: entities
style:
  box-shadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
  border: '1px solid #e0e0e0'
  border-radius: '8px'
```

---

### Feature 1.5: Opacity Controls

**Phase**: 1 - Foundation Layer
**Priority**: Low
**Dependencies**: None
**Estimated Effort**: 2-3 days

#### Context & Background

Opacity controls allow users to adjust the transparency of cards, icons, text, and backgrounds. This is useful for creating layered effects, subtle backgrounds, or de-emphasizing certain elements.

**Business Value**: Enables advanced visual designs with layered transparency effects. Useful for creating "glass morphism" designs or subtle overlays. Low effort, high aesthetic impact.

#### In Scope

- ✅ Opacity slider (0-100%) for:
  - Entire card
  - Card background only
  - Card content (text/icons)
  - Individual icons
  - Individual text elements
- ✅ Opacity preview in real-time
- ✅ YAML storage for opacity values
- ✅ PropertiesPanel UI for opacity configuration

#### Out of Scope

- ❌ Blend modes (multiply, screen, overlay, etc.) (future)
- ❌ Backdrop filters (blur background behind transparent card) (future consideration)
- ❌ Opacity animations (Phase 6 - trigger-based animations)

#### Risks

- **Readability**: Transparent text may be unreadable
  - *Mitigation*: Warn users if opacity < 50% on text elements, show contrast warnings
- **Performance**: Transparency can impact rendering performance
  - *Mitigation*: Use CSS `opacity` (GPU-accelerated), avoid alpha channels in gradients when possible

#### Acceptance Criteria

1. **Opacity Controls**:
   - [ ] Opacity slider (0-100%) in PropertiesPanel
   - [ ] Separate opacity controls for: card, background, content, icons, text
   - [ ] Opacity value displays as percentage

2. **Live Preview**:
   - [ ] Opacity changes apply to card preview immediately
   - [ ] Opacity slider has visual indicator of current value

3. **YAML Integration**:
   - [ ] Opacity stored as CSS `opacity` property (0-1 decimal)
   - [ ] Opacity config under `style` property
   - [ ] Deserializes correctly from YAML

4. **Accessibility**:
   - [ ] Warning shown if text opacity < 50%
   - [ ] Warning shown if contrast ratio fails WCAG AA with reduced opacity

#### Non-Functional Requirements

- **Performance**: Opacity changes must not degrade rendering below 60fps
- **Accessibility**: Transparent text must maintain WCAG 2.1 AA contrast (warning if violated)
- **Browser Support**: Works in Electron 25+ (Chromium 114+)

#### Testing & Verification

**Unit Tests**:
- [ ] Opacity percentage to CSS decimal conversion (100% -> 1, 50% -> 0.5)
- [ ] YAML serialization/deserialization
- [ ] Contrast ratio calculation for opacity warnings

**E2E Tests** (Playwright):
- [ ] User can adjust card opacity
- [ ] User can adjust background opacity
- [ ] User can adjust content opacity
- [ ] Opacity changes apply to card preview
- [ ] Opacity config persists in YAML
- [ ] Warning shown for low text opacity

**Visual Regression Tests**:
- [ ] Opacity controls UI
- [ ] Cards with various opacity values

**Accessibility Tests**:
- [ ] Contrast ratio warnings trigger correctly

#### Compliance

This feature MUST comply with:
- ✅ [ai_rules.md](../../ai_rules.md) - Centralized opacity logic
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first tests
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Component in `src/components/`
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Visual regression for opacity rendering

#### File Structure

```
src/
├── components/
│   └── OpacityControls.tsx      # Opacity slider component
│
├── services/
│   └── contrastService.ts       # Contrast ratio calculation for warnings
│
tests/
├── unit/
│   └── opacityControls.spec.ts
│
└── e2e/
    ├── opacity.spec.ts
    └── support/dsl/
        └── opacity.ts            # OpacityDSL
```

#### Implementation Notes

- Use CSS `opacity` property (0 to 1)
- Consider using Ant Design's `<Slider>` component
- Show percentage label next to slider (0% - 100%)
- Provide quick buttons for common values (0%, 25%, 50%, 75%, 100%)

**Example Opacity Config (YAML)**:
```yaml
type: entities
style:
  opacity: 0.9        # 90% opacity
```

---

## Phase 2: UI Enhancement Layer

*[Due to length constraints, I'll create Phase 2-7 in a continued response. Let me mark this todo as complete and continue.]*

