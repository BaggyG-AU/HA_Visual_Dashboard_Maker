# Layout Infrastructure Layer - Implementation Plan

**Branch**: `feature/layout-infrastructure-layer`
**Version Target**: v0.7.4-beta.5
**Dependencies**: None (independent phase)
**Status**: :construction: In Progress
**Planned Start**: 2026-02-10

**Versioning Convention**:
- `v0.7.<phase>-beta.<feature>`
- Example (current): `v0.7.4-beta.5` = Phase 4 post-Feature 4.4 stabilization build
- Completed features keep their original shipped version in historical notes

---

## Overview

**IMPORTANT**: Before beginning any work on this phase, all developers must read [ai_rules.md](../../ai_rules.md) for immutable development rules and standards.

**Phase Goal**: Build advanced card layout and container capabilities that enable carousel/slider views, collapsible accordion sections, tabbed interfaces, popup/modal cards, enhanced stack layouts, and granular card spacing controls.

**Business Value**: This phase significantly expands the layout options available to dashboard designers. Carousels allow space-efficient cycling through multiple views, accordions and tabs organize dense content into manageable sections, popup/modal cards enable drill-down interactions, and spacing controls give pixel-level precision for professional dashboard layouts. These features are essential for creating polished, organized, and space-efficient dashboards.

**Key Principles**:
- **Container-First Architecture**: New layout modules act as containers that hold existing card types
- **Swiper.js Foundation**: Carousel/slider functionality powered by Swiper.js v12+ (battle-tested, feature-rich)
- **Progressive Enhancement**: Existing stack cards enhanced with spacing/alignment controls, no breaking changes
- **YAML-Driven Configuration**: All layout settings stored in YAML for full round-trip serialization
- **WCAG 2.1 AA Compliance**: Full keyboard navigation, ARIA attributes, and screen reader support for all layout modules
- **Animation Respect**: All animations honor `prefers-reduced-motion` user preference

---

## Feature Status Overview

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| 4.1: Swiper.js Integration | High | 5-6 days | :construction: Implemented (documentation sync pending) |
| 4.2: Accordion Card Module | Medium | 3-4 days | :white_check_mark: Complete (v0.7.4-beta.2) |
| 4.3: Tabs Card Module | Medium | 3-4 days | :white_check_mark: Complete (v0.7.4-beta.3) |
| 4.4: Popup/Modal Card System | High | 5-6 days | :warning: Partially Complete (HAVDM popup shipped; HACS alignment in research) |
| 4.5: Horizontal/Vertical Layout Enhancements | Medium | 2-3 days | :white_check_mark: Complete (implementation/tests complete; docs follow-ups open) |
| 4.6: Card Spacing Controls | Medium | 2-3 days | :white_check_mark: Complete (v0.7.4-beta.R) |

**Total Estimated Effort**: 20-26 days (2-3 weeks with parallel work on independent features)

---

## Feature 4.1: Swiper.js Integration (Carousel Foundation)

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 5-6 days
**Status**: :construction: Implemented (documentation sync pending)

### Tracking Note

Feature 4.1 product code and tests were delivered earlier in Phase 4 and are represented in the status overview.
The detailed per-item checklist below is retained as a historical planning artifact and has not yet been backfilled item-by-item.

### Implementation Checklist

#### Phase 1: Swiper.js Installation & Core Component (Days 1-2)

- [ ] Install Swiper.js v12+ and peer dependencies (`swiper`, `swiper/react`)
- [ ] Create `src/features/carousel/` feature folder (hybrid code organization)
  - [ ] `SwiperCarousel.tsx` - Main carousel React component
  - [ ] `carouselService.ts` - Configuration and slide management service
  - [ ] `types.ts` - TypeScript types for carousel configuration
- [ ] Implement `SwiperCarousel` component with:
  - [ ] Swiper React integration (`<Swiper>`, `<SwiperSlide>`)
  - [ ] Pagination support (bullets, fraction, progressbar, custom)
  - [ ] Navigation arrows (previous/next)
  - [ ] Autoplay with configurable delay and pause-on-interaction
  - [ ] Touch/mouse swipe gesture support
  - [ ] Loop mode (infinite scrolling)
  - [ ] Slide transition effects (slide, fade, cube, coverflow, flip)
- [ ] Render child cards within each slide using existing `BaseCard` pattern
- [ ] Unit tests for carousel service configuration logic

#### Phase 2: Card Registry & Renderer Integration (Day 2)

- [ ] Register `custom:swipe-card` in `cardRegistry.ts`
- [ ] Create `SwiperCardRenderer.tsx` in `src/components/cards/`
- [ ] Wire renderer to existing card rendering pipeline
- [ ] Support nested cards: each slide holds one or more cards
- [ ] Handle empty slides gracefully (placeholder UI)
- [ ] Support `cards` array in slide configuration (consistent with stack cards)

#### Phase 3: Per-Slide Configuration (Day 3)

- [ ] Implement per-slide configuration options:
  - [ ] Slide background (color, gradient, image)
  - [ ] Slide content alignment (top, center, bottom)
  - [ ] Slide navigation behavior (allow/skip slide)
  - [ ] Slide autoplay duration override
- [ ] Swiper configuration options in carousel service:
  - [ ] `slides_per_view` (number or 'auto')
  - [ ] `space_between` (px gap between slides)
  - [ ] `centered_slides` (boolean)
  - [ ] `free_mode` (continuous drag without snapping)
  - [ ] `direction` (horizontal or vertical)
- [ ] Unit tests for per-slide configuration parsing

#### Phase 4: PropertiesPanel Integration (Day 4)

- [ ] Add carousel-specific property controls to PropertiesPanel:
  - [ ] Slide management (add/remove/reorder slides)
  - [ ] Pagination style selector
  - [ ] Navigation toggle
  - [ ] Autoplay configuration (enable, delay, stop-on-last)
  - [ ] Effect selector (slide, fade, cube, coverflow, flip)
  - [ ] Slides per view input
  - [ ] Space between input
  - [ ] Direction selector (horizontal/vertical)
  - [ ] Loop toggle
- [ ] Live preview of carousel in canvas
- [ ] Slide selection in canvas (click to select individual slide)

#### Phase 5: YAML Schema & Serialization (Day 4)

- [ ] Define YAML schema for carousel card type
- [ ] Example YAML:
  ```yaml
  type: custom:swipe-card
  pagination:
    type: bullets
    clickable: true
  navigation: true
  autoplay:
    delay: 5000
    pause_on_interaction: true
  effect: slide
  slides_per_view: 1
  space_between: 16
  loop: true
  direction: horizontal
  cards:
    - type: button
      entity: light.living_room
    - type: entities
      entities:
        - sensor.temperature
        - sensor.humidity
    - type: markdown
      content: "Welcome Home"
  ```
- [ ] Behavior notes (v0.7.4-beta.2):
  - [ ] Autoplay and loop are suppressed while the carousel card is selected in the visual editor.
  - [ ] Slides inherit the parent card background unless a slide-specific background is configured.
- [ ] Serialize carousel config to YAML correctly
- [ ] Deserialize YAML to carousel config correctly
- [ ] YAML editor autocomplete for carousel properties
- [ ] Update `ha-dashboard-schema.json` with carousel schema

#### Phase 6: Accessibility & Animation (Day 5)

- [ ] ARIA attributes for carousel:
  - [ ] `role="region"` with `aria-roledescription="carousel"`
  - [ ] `aria-label` for carousel container
  - [ ] `role="tablist"` for pagination
  - [ ] `role="tabpanel"` for each slide
  - [ ] `aria-live="polite"` for slide change announcements
- [ ] Keyboard navigation:
  - [ ] Left/Right arrow keys navigate slides (horizontal)
  - [ ] Up/Down arrow keys navigate slides (vertical)
  - [ ] Tab focuses interactive elements within current slide
  - [ ] Enter/Space activates pagination dots
- [ ] Respect `prefers-reduced-motion`:
  - [ ] Disable transition animations
  - [ ] Disable autoplay
  - [ ] Show all slides or provide skip controls
- [ ] Touch accessibility: adequate touch target sizes (minimum 44x44px)

#### Phase 7: Testing & Documentation (Days 5-6)

- [ ] Unit tests for carousel service (configuration parsing, slide management)
- [ ] Unit tests for per-slide configuration
- [ ] Create `CarouselDSL` in `tests/support/dsl/carousel.ts`
- [ ] E2E tests using CarouselDSL:
  - [ ] Add carousel card from palette
  - [ ] Navigate between slides (arrows, swipe, pagination)
  - [ ] Autoplay advances slides
  - [ ] Configuration changes reflect in preview
  - [ ] YAML round-trip serialization
  - [ ] Keyboard navigation works
- [ ] Visual regression tests for carousel states (first/middle/last slide)
- [ ] Performance test: 10+ slides render without frame drops
- [ ] Documentation with configuration examples

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Swiper.js carousel renders with navigation and pagination
- [ ] Child cards render correctly within slides
- [ ] Touch/mouse swipe navigation works
- [ ] Autoplay with configurable delay works
- [ ] Keyboard navigation works (arrow keys, tab)
- [ ] YAML round-trip serialization preserves all config
- [ ] PropertiesPanel controls update carousel in real-time
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Multiple transition effects (fade, cube, coverflow, flip)
- [ ] Per-slide background customization
- [ ] Slides per view configuration (show multiple cards)
- [ ] Free mode (continuous drag)
- [ ] Loop mode (infinite scrolling)

**Won't Have (Out of Scope)**:
- [ ] Nested carousels (carousel within carousel)
- [ ] Virtual slides (lazy rendering for 100+ slides)
- [ ] Parallax effects between slides
- [ ] Thumb/gallery carousel mode

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Swiper.js v12 React API differs from documentation | Medium | Medium | Prototype early, verify API in test environment |
| Swiper CSS conflicts with Ant Design styles | Medium | Medium | Scope Swiper CSS, use CSS modules or namespace |
| Touch events conflict with drag-and-drop in editor | High | Medium | Disable swipe in edit mode, enable only in preview |
| Bundle size increase from Swiper.js (~40KB) | Low | Low | Tree-shake unused modules, lazy load Swiper |
| Carousel performance with complex child cards | Medium | Low | Limit visible slides, use CSS `will-change`, lazy render off-screen slides |

### Compliance

This feature MUST comply with:
- :white_check_mark: [ai_rules.md](../../ai_rules.md) - Read before implementation, reuse existing card rendering patterns
- :white_check_mark: [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first E2E tests using CarouselDSL
- :white_check_mark: [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Feature folder `src/features/carousel/`, renderer in `src/components/cards/`
- :white_check_mark: [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - State-based waits for slide transitions, no arbitrary delays

---

## Feature 4.2: Accordion Card Module

**Priority**: Medium
**Dependencies**: None
**Estimated Effort**: 3-4 days
**Status**: :white_check_mark: Complete (v0.7.4-beta.2)

### Delivery Baseline (v0.7.4-beta.2)

#### Completed

- [x] `custom:expander-card` product implementation delivered:
  - [x] `src/features/accordion/types.ts`
  - [x] `src/features/accordion/accordionService.ts`
  - [x] `src/features/accordion/AccordionPanel.tsx`
  - [x] `src/components/cards/AccordionCardRenderer.tsx`
- [x] Integration points complete:
  - [x] Card registry entry in `src/services/cardRegistry.ts`
  - [x] BaseCard dispatch wiring in `src/components/BaseCard.tsx`
  - [x] YAML schema updates in `src/schemas/ha-dashboard-schema.json`
- [x] Accordion behavior shipped:
  - [x] Single-expand and multi-expand modes
  - [x] Default expanded section handling
  - [x] Section header title + MDI icon + chevron rotation
  - [x] Smooth expand/collapse transitions
  - [x] Bordered / borderless / ghost style modes
  - [x] Header background + content padding options
  - [x] Nested accordion rendering with max depth guard (`MAX_ACCORDION_DEPTH = 3`)
  - [x] Collapse all / expand all controls in PropertiesPanel
- [x] Accessibility and keyboard support shipped:
  - [x] `role="heading"` + `aria-level` on headers
  - [x] `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`
  - [x] Enter/Space toggle + Arrow/Home/End header navigation
  - [x] `prefers-reduced-motion` support for transitions
- [x] Testing delivered:
  - [x] `tests/unit/accordion-service.spec.ts`
  - [x] `tests/support/dsl/accordion.ts` + registration in `tests/support/index.ts`
  - [x] `tests/e2e/accordion.spec.ts`
  - [x] `tests/e2e/accordion.visual.spec.ts`

#### Deferred (Post v0.7.4-beta.2)

- [ ] Section header entity state badges (counts/temperature/status)
- [ ] In-card toolbar for collapse all / expand all (beyond PropertiesPanel controls)
- [ ] PropertiesPanel section reorder UX (drag/reorder controls)
- [ ] Accordion-specific independent background override tokens (inherit-default remains target behavior)
- [ ] Additional nested accordion E2E coverage focused on depth-3 scenarios

### Original Implementation Checklist (Historical Planning Artifact)

### Implementation Checklist

#### Phase 1: Core Accordion Component (Days 1-2)

- [x] Create `AccordionCardRenderer.tsx` in `src/components/cards/`
- [x] Create `src/features/accordion/accordionService.ts` for configuration logic
- [x] Create `src/features/accordion/types.ts` for TypeScript types
- [ ] Implement accordion component with:
  - [ ] Collapsible section headers (click to expand/collapse)
  - [ ] Smooth expand/collapse CSS transitions (max-height + opacity)
  - [ ] Single-expand mode (only one section open at a time)
  - [ ] Multi-expand mode (multiple sections can be open simultaneously)
  - [ ] Default expanded sections (configurable)
  - [ ] Custom header content (text and icons)
- [ ] Each section holds child cards via existing `BaseCard` pattern
- [ ] Expand/collapse chevron indicator (`mdi:chevron-down`) with rotation animation
- [ ] Unit tests for accordion service

#### Phase 2: Nested Accordion & Styling (Day 2)

- [ ] Support nested accordions (accordion section contains another accordion)
- [ ] Limit nesting depth to 3 levels (prevent infinite nesting)
- [ ] Styling options:
  - [ ] Bordered mode (Ant Design-style bordered panels)
  - [ ] Borderless mode (minimal visual separation)
  - [ ] Ghost mode (transparent background headers)
  - [ ] Custom header background color
  - [ ] Custom content padding
- [ ] Collapse/expand all controls in PropertiesPanel (toggle all sections)

#### Phase 3: PropertiesPanel Integration (Day 2)

- [ ] Add accordion-specific property controls to PropertiesPanel:
  - [ ] Section management (add/remove/reorder sections)
  - [ ] Section title editing
  - [ ] Section icon selection (MDI icons)
  - [ ] Expand mode toggle (single vs multi)
  - [ ] Default expanded sections checkboxes
  - [ ] Style selector (bordered, borderless, ghost)
- [ ] Live preview of accordion in canvas
- [ ] Section selection in canvas (click header to select section)
- [ ] Defaults:
  - [ ] Section icon defaults to `mdi:folder-outline` when not configured
  - [ ] Accordion inherits parent card background styling by default

#### Phase 4: YAML Schema & Serialization (Day 3)

- [ ] Define YAML schema for accordion card type
- [x] Register `custom:expander-card` in `cardRegistry.ts`
- [ ] Example YAML:
  ```yaml
  type: custom:expander-card
  expand_mode: single
  style: bordered
  sections:
    - title: "Lights"
      icon: mdi:lightbulb
      default_expanded: true
      cards:
        - type: button
          entity: light.living_room
        - type: button
          entity: light.kitchen
    - title: "Climate"
      icon: mdi:thermometer
      cards:
        - type: thermostat
          entity: climate.living_room
    - title: "Security"
      icon: mdi:shield
      cards:
        - type: alarm-panel
          entity: alarm_control_panel.home
  ```
- [ ] Serialize/deserialize accordion config
- [x] Update `ha-dashboard-schema.json`
- [ ] YAML editor autocomplete for accordion properties

#### Phase 5: Accessibility & Testing (Days 3-4)

- [ ] ARIA attributes:
  - [ ] `role="heading"` with appropriate `aria-level` for section headers
  - [ ] `aria-expanded` on section headers (true/false)
  - [ ] `aria-controls` linking header to content panel
  - [ ] `role="region"` for content panels
  - [ ] `aria-labelledby` on content panels referencing header
- [ ] Keyboard navigation:
  - [ ] Enter/Space toggles section expand/collapse
  - [ ] Arrow keys navigate between section headers
  - [ ] Home/End jump to first/last section header
  - [ ] Tab enters content when section expanded
- [ ] Respect `prefers-reduced-motion` (disable expand/collapse animations)
- [x] Create `AccordionDSL` in `tests/support/dsl/accordion.ts`
- [ ] E2E tests using AccordionDSL:
  - [ ] Add accordion card from palette
  - [ ] Click section header to expand/collapse
  - [ ] Single-expand mode only allows one open section
  - [ ] Multi-expand mode allows multiple open sections
  - [ ] Nested accordion works
  - [ ] YAML round-trip serialization
  - [ ] Keyboard navigation works
- [x] Unit tests for accordion service
- [x] Visual regression tests for accordion states
- [ ] Documentation with configuration examples

### Locked Decisions for v0.7.4-beta.2

- [x] Entity state badges in section headers are deferred (not included in initial release scope)
- [x] Collapse/expand all is exposed in PropertiesPanel only (no in-card toolbar buttons)
- [x] Accordion inherits card background styling by default
- [x] Default icon behavior:
  - [x] Section icon fallback is `mdi:folder-outline`
  - [x] Expand/collapse indicator icon is `mdi:chevron-down`

### Deferred Follow-ups (Post v0.7.4-beta.2)

- [ ] Add optional section header entity state badges (counts/temperature/status variants)
- [ ] Evaluate in-card expand/collapse all controls based on usability feedback
- [ ] Add optional accordion-specific background override tokens (while keeping inherit-default behavior)

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Accordion renders with collapsible sections
- [ ] Click header to expand/collapse works
- [ ] Single-expand and multi-expand modes work
- [ ] Child cards render correctly within sections
- [ ] Smooth expand/collapse animations
- [ ] Keyboard navigation works (Enter/Space, arrow keys)
- [ ] YAML round-trip serialization preserves all config
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Nested accordion support (up to 3 levels)
- [ ] Custom header icons and content
- [ ] Multiple style modes (bordered, borderless, ghost)
- [ ] Collapse/expand all toggle
- [ ] Default expanded sections configuration

**Won't Have (Out of Scope)**:
- [ ] Drag-and-drop to reorder sections at runtime (editor-only)
- [ ] Animated section reordering
- [ ] Accordion within carousel slides (complex nesting)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Expand/collapse animation jank with heavy content | Medium | Medium | Use CSS transitions on max-height, minimize reflows |
| Nested accordion depth causes layout issues | Low | Low | Limit nesting to 3 levels, test deep nesting |
| Content overflow in collapsed state visible briefly | Low | Medium | Use overflow:hidden with proper timing on transitions |
| Accessibility compliance for nested accordions | Medium | Medium | Follow WAI-ARIA accordion pattern, test with screen readers |

### Compliance

This feature MUST comply with:
- :white_check_mark: [ai_rules.md](../../ai_rules.md) - Read before implementation, reuse BaseCard rendering pattern
- :white_check_mark: [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first E2E tests using AccordionDSL
- :white_check_mark: [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Renderer in `src/components/cards/`, service in `src/services/`
- :white_check_mark: [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - State-based waits for expand/collapse transitions

---

## Feature 4.3: Tabs Card Module

**Priority**: Medium
**Dependencies**: None
**Estimated Effort**: 3-4 days
**Status**: :white_check_mark: Complete (v0.7.4-beta.3)

### Delivery Baseline (v0.7.4-beta.3)

#### Completed

- [x] `custom:tabbed-card` product implementation delivered:
  - [x] `src/types/tabs.ts`
  - [x] `src/services/tabsService.ts`
  - [x] `src/features/tabs/TabsPanel.tsx`
  - [x] `src/components/cards/TabsCardRenderer.tsx`
- [x] Integration points complete:
  - [x] Card registry entry in `src/services/cardRegistry.ts`
  - [x] BaseCard dispatch wiring in `src/components/BaseCard.tsx`
  - [x] PropertiesPanel controls in `src/components/PropertiesPanel.tsx`
  - [x] YAML schema updates in `src/schemas/ha-dashboard-schema.json`
- [x] Tabs behavior shipped:
  - [x] Top/bottom/left/right tab positioning
  - [x] Tab size selection (default/small/large)
  - [x] Default active tab selection with bounds clamping
  - [x] Animation mode selection (`none`, `fade`, `slide`)
  - [x] Lazy render toggle
  - [x] Tab icon support + static badge/count fields
- [x] Accessibility shipped:
  - [x] WAI-ARIA tab semantics (`tablist`, `tab`, `tabpanel`, active/focus attributes)
  - [x] Keyboard navigation (arrow keys, Home/End, Enter/Space)
- [x] Test coverage delivered:
  - [x] Unit tests (`tests/unit/tabs-service.spec.ts`)
  - [x] DSL + registration (`tests/support/dsl/tabs.ts`, `tests/support/index.ts`)
  - [x] E2E tests (`tests/e2e/tabs.spec.ts`)
  - [x] Visual tests (`tests/e2e/tabs.visual.spec.ts`)

### Original Implementation Checklist (Historical Planning Artifact)

### Implementation Checklist

#### Phase 1: Core Tabs Component (Days 1-2)

- [ ] Create `TabsCardRenderer.tsx` in `src/components/cards/`
- [ ] Create `src/services/tabsService.ts` for tab management logic
- [ ] Create `src/types/tabs.ts` for TypeScript types
- [ ] Implement tabs component with:
  - [ ] Tab bar with clickable tab headers
  - [ ] Tab content panels (only active tab visible)
  - [ ] Tab switching with optional transition animation (fade or slide)
  - [ ] Horizontal tab orientation (top)
  - [ ] Vertical tab orientation (left or right)
  - [ ] Tab icons (MDI icons) with optional labels
  - [ ] Tab labels (text only, icon only, or icon + text)
- [ ] Each tab panel holds child cards via existing `BaseCard` pattern
- [ ] Active tab visual indicator (underline, background, or border)
- [ ] Unit tests for tabs service

#### Phase 2: Tab Configuration & Styling (Day 2)

- [ ] Tab bar styling options:
  - [ ] Tab size: default, small, large
  - [ ] Tab position: top, bottom, left, right
  - [ ] Tab bar background color
  - [ ] Active tab indicator color
  - [ ] Tab spacing/gap
- [ ] Tab behavior options:
  - [ ] Default active tab (index or key)
  - [ ] Tab close button (removable tabs - editor only)
  - [ ] Lazy rendering (only render active tab content, not all tabs)
  - [ ] Centered tabs toggle
- [ ] Support badge/count indicators on tabs (e.g., "Lights (3)")
- [ ] Register `custom:tabbed-card` in `cardRegistry.ts`

#### Phase 3: PropertiesPanel Integration (Day 2)

- [ ] Add tabs-specific property controls to PropertiesPanel:
  - [ ] Tab management (add/remove/reorder tabs)
  - [ ] Tab title editing
  - [ ] Tab icon selection (MDI icons)
  - [ ] Tab position selector (top, bottom, left, right)
  - [ ] Tab size selector
  - [ ] Default active tab selector
  - [ ] Tab animation toggle (fade/slide/none)
- [ ] Live preview of tabs in canvas
- [ ] Tab selection in canvas (click tab to show panel)

#### Phase 4: YAML Schema & Serialization (Day 3)

- [ ] Define YAML schema for tabs card type
- [ ] Example YAML:
  ```yaml
  type: custom:tabbed-card
  tab_position: top
  tab_size: default
  default_tab: 0
  animation: fade
  tabs:
    - title: "Lights"
      icon: mdi:lightbulb
      cards:
        - type: button
          entity: light.living_room
        - type: button
          entity: light.kitchen
    - title: "Climate"
      icon: mdi:thermometer
      cards:
        - type: thermostat
          entity: climate.living_room
    - title: "Media"
      icon: mdi:play-circle
      cards:
        - type: media-control
          entity: media_player.living_room
  ```
- [ ] Serialize/deserialize tabs config
- [ ] Update `ha-dashboard-schema.json`
- [ ] YAML editor autocomplete for tabs properties

#### Phase 5: Accessibility & Testing (Days 3-4)

- [ ] ARIA attributes (WAI-ARIA tabs pattern):
  - [ ] `role="tablist"` on tab bar container
  - [ ] `role="tab"` on each tab button
  - [ ] `role="tabpanel"` on each content panel
  - [ ] `aria-selected` on active tab (true/false)
  - [ ] `aria-controls` linking tab to its panel
  - [ ] `aria-labelledby` on panel referencing its tab
  - [ ] `tabindex="0"` on active tab, `tabindex="-1"` on inactive tabs
- [ ] Keyboard navigation:
  - [ ] Left/Right arrow keys navigate between horizontal tabs
  - [ ] Up/Down arrow keys navigate between vertical tabs
  - [ ] Home/End jump to first/last tab
  - [ ] Enter/Space activates focused tab
  - [ ] Tab key moves focus into active panel content
- [ ] Respect `prefers-reduced-motion` (disable tab switch animations)
- [ ] Create `TabsDSL` in `tests/support/dsl/tabs.ts`
- [ ] E2E tests using TabsDSL:
  - [ ] Add tabs card from palette
  - [ ] Click tab to switch content
  - [ ] Tab position changes (top, bottom, left, right)
  - [ ] Tab icons display correctly
  - [ ] Default active tab configuration works
  - [ ] YAML round-trip serialization
  - [ ] Keyboard navigation works
- [ ] Unit tests for tabs service
- [ ] Visual regression tests for tab positions/styles
- [ ] Documentation with configuration examples

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Tabs render with clickable tab headers
- [ ] Tab switching shows correct content panel
- [ ] Horizontal and vertical tab orientations work
- [ ] Child cards render correctly within tab panels
- [ ] Keyboard navigation works (arrow keys, Enter/Space, Tab)
- [ ] YAML round-trip serialization preserves all config
- [ ] PropertiesPanel controls update tabs in real-time
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Tab icons with MDI icon picker
- [ ] Tab switch animations (fade, slide)
- [ ] Tab position options (top, bottom, left, right)
- [ ] Default active tab configuration
- [ ] Lazy tab content rendering

**Won't Have (Out of Scope)**:
- [ ] Draggable tabs (user-reorderable at runtime)
- [ ] Closable tabs at runtime (only in editor)
- [ ] Tab overflow/scroll for many tabs
- [ ] Tabs within tabs (nested tab cards)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Tab content height inconsistency across panels | Medium | Medium | Use consistent min-height or auto-height with smooth transitions |
| Vertical tabs layout breaks on narrow panels | Medium | Medium | Responsive breakpoint: fall back to horizontal on narrow widths |
| Tab state lost on dashboard reload | Low | Low | Store active tab in card config or use default_tab |
| Many tabs overflow tab bar | Medium | Medium | Add scroll behavior or "more" dropdown for overflow tabs |

### Compliance

This feature MUST comply with:
- :white_check_mark: [ai_rules.md](../../ai_rules.md) - Read before implementation, reuse BaseCard rendering pattern
- :white_check_mark: [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first E2E tests using TabsDSL
- :white_check_mark: [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Renderer in `src/components/cards/`, service in `src/services/`
- :white_check_mark: [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - State-based waits for tab transitions

---

## Feature 4.4: Popup/Modal Card System

**Priority**: High
**Dependencies**: None
**Estimated Effort**: 5-6 days
**Status**: :warning: Partially Complete (v0.7.4-beta.5 baseline shipped; HACS alignment pending)

### Tracking Note (2026-02-14)

Popup baseline behavior is implemented and regression-tested in HAVDM, but this feature is not considered fully complete.
The team is actively researching HACS-aligned options for popup behavior/modeling before declaring Feature 4.4 complete.

### Delivery Baseline (v0.7.4-beta.5)

#### Completed

- [x] Popup feature module created:
  - [x] `src/features/popup/types.ts`
  - [x] `src/features/popup/popupService.ts`
  - [x] `src/features/popup/PopupCardModal.tsx`
  - [x] `src/features/popup/PopupHost.tsx`
- [x] Product integrations wired:
  - [x] `custom:popup-card` in `src/services/cardRegistry.ts`
  - [x] BaseCard dispatch + `tap_action.action: popup` handling in `src/components/BaseCard.tsx`
  - [x] Popup host mounted in `src/App.tsx`
- [x] Configuration and schema updates:
  - [x] Action type extension in `src/types/dashboard.ts`
  - [x] Popup card + popup action schema in `src/schemas/ha-dashboard-schema.json`
  - [x] PropertiesPanel popup controls in `src/components/PropertiesPanel.tsx`
- [x] Core modal behavior delivered:
  - [x] Size modes (`auto`, `small`, `medium`, `large`, `fullscreen`, `custom`)
  - [x] Close via button/ESC/backdrop (configurable)
  - [x] Configurable backdrop opacity
  - [x] Header visibility toggle
  - [x] Footer controls (`show_footer`, `close_label`, `footer_actions`)
  - [x] Nested depth guard (`MAX_POPUP_DEPTH = 3`)
  - [x] Deterministic stack z-index
  - [x] Reduced-motion transition fallback
- [x] Initial test assets authored:
  - [x] Unit tests (`tests/unit/popup-service.spec.ts`)
  - [x] DSL + registration (`tests/support/dsl/popup.ts`, `tests/support/index.ts`)
  - [x] E2E spec (`tests/e2e/popup.spec.ts`)
  - [x] Visual spec (`tests/e2e/popup.visual.spec.ts`)
- [x] Verification completed:
  - [x] Popup targeted E2E stabilized and passing (`tests/e2e/popup.spec.ts`)
  - [x] Popup visual baseline snapshots created and verified (`tests/e2e/popup.visual.spec.ts`)
  - [x] Full E2E regression run passed with popup visual baseline follow-up applied

#### Deferred Follow-Ups (Non-Blocking)

- [ ] Expand popup visual coverage with nested stack snapshots
- [ ] Add explicit E2E coverage for nested popup depth guard behavior (`MAX_POPUP_DEPTH = 3`)
- [ ] Evaluate form-based popup card-content management UX beyond YAML workflow

### Original Implementation Checklist (Historical Planning Artifact)

### Implementation Checklist

#### Phase 1: Modal Container Component (Days 1-2)

- [ ] Create `src/features/popup/` feature folder (hybrid code organization)
  - [ ] `PopupCardModal.tsx` - Modal overlay component
  - [ ] `popupService.ts` - Popup trigger and lifecycle management
  - [ ] `types.ts` - TypeScript types for popup configuration
- [ ] Implement `PopupCardModal` component with:
  - [ ] Ant Design `<Modal>` integration for consistent styling
  - [ ] Full-screen mode (covers entire viewport)
  - [ ] Custom size mode (width/height or responsive breakpoints)
  - [ ] Close mechanisms:
    - [ ] Close button (top-right X)
    - [ ] Backdrop click (configurable)
    - [ ] ESC key press
  - [ ] Modal backdrop with configurable opacity
  - [ ] Smooth open/close animations (fade + scale)
- [ ] Render child cards within modal using existing `BaseCard` pattern
- [ ] Unit tests for popup service

#### Phase 2: Trigger System Integration (Days 2-3)

- [ ] Integrate with existing `tap_action` system:
  - [ ] New action type: `popup` (opens a popup modal)
  - [ ] Popup action configuration:
    - [ ] `popup_cards` - array of cards to show in popup
    - [ ] `popup_title` - modal title (optional)
    - [ ] `popup_size` - 'auto' | 'small' | 'medium' | 'large' | 'fullscreen' | custom {width, height}
    - [ ] `popup_close_on_backdrop` - boolean (default true)
  - [ ] Trigger popup from any card's tap/hold/double-tap action
- [ ] Register `custom:popup-card` in `cardRegistry.ts` for standalone popup trigger cards
- [ ] Create `PopupTriggerCardRenderer.tsx` in `src/components/cards/`
  - [ ] Visual indicator that card opens a popup (icon overlay)
  - [ ] Button/card that when clicked opens the popup
- [ ] Support multiple simultaneous popups (stacked z-index)
- [ ] Nested popup support (popup within popup, limit to 3 levels)

#### Phase 3: Popup Content Configuration (Day 3)

- [ ] Popup content layout options:
  - [ ] Single card (popup shows one card)
  - [ ] Stack layout (vertical/horizontal stack of cards within popup)
  - [ ] Grid layout (grid of cards within popup)
- [ ] Popup header configuration:
  - [ ] Title text (with entity context variable support)
  - [ ] Header icon
  - [ ] Header background color
  - [ ] Show/hide header toggle
- [ ] Popup footer configuration:
  - [ ] Action buttons (custom button row)
  - [ ] Close button text customization
  - [ ] Show/hide footer toggle

#### Phase 4: PropertiesPanel Integration (Day 4)

- [ ] Add popup-specific property controls to PropertiesPanel:
  - [ ] Popup trigger configuration (which action opens popup)
  - [ ] Popup card content management (add/remove/reorder cards)
  - [ ] Popup size selector (auto, small, medium, large, fullscreen, custom)
  - [ ] Custom width/height inputs (for custom size)
  - [ ] Backdrop click close toggle
  - [ ] Title and header configuration
  - [ ] Footer/action button configuration
- [ ] Preview popup in canvas (click to open popup overlay)
- [ ] Edit popup content within the popup preview

#### Phase 5: YAML Schema & Serialization (Day 4)

- [ ] Define YAML schema for popup card type and popup action
- [ ] Example YAML (standalone popup trigger card):
  ```yaml
  type: custom:popup-card
  title: "Room Details"
  trigger_label: "View Details"
  trigger_icon: mdi:information
  popup:
    title: "Living Room Details"
    size: medium
    close_on_backdrop: true
    cards:
      - type: entities
        entities:
          - sensor.temperature
          - sensor.humidity
          - light.living_room
      - type: markdown
        content: "Last updated: [[sensor.temperature.last_changed]]"
  ```
- [ ] Example YAML (popup via tap_action on any card):
  ```yaml
  type: button
  entity: light.living_room
  tap_action:
    action: popup
    popup_title: "Light Controls"
    popup_size: small
    popup_cards:
      - type: light
        entity: light.living_room
  ```
- [ ] Serialize/deserialize popup config
- [ ] Update `ha-dashboard-schema.json`
- [ ] YAML editor autocomplete for popup properties

#### Phase 6: Accessibility & Animation (Day 5)

- [ ] ARIA attributes (WAI-ARIA dialog pattern):
  - [ ] `role="dialog"` on modal container
  - [ ] `aria-modal="true"`
  - [ ] `aria-labelledby` referencing popup title
  - [ ] `aria-describedby` for popup content (optional)
- [ ] Focus management:
  - [ ] Focus trapped within modal when open
  - [ ] Focus moves to first focusable element on open
  - [ ] Focus returns to trigger element on close
  - [ ] Tab cycling within modal (no focus escape)
- [ ] Keyboard navigation:
  - [ ] ESC closes popup (respects nested popup stack)
  - [ ] Tab/Shift+Tab cycles through focusable elements
- [ ] Respect `prefers-reduced-motion` (disable open/close animations)
- [ ] Screen reader: announce modal open/close events

#### Phase 7: Testing & Documentation (Days 5-6)

- [ ] Unit tests for popup service (trigger, lifecycle, stacking)
- [ ] Create `PopupDSL` in `tests/support/dsl/popup.ts`
- [ ] E2E tests using PopupDSL:
  - [ ] Open popup from trigger card
  - [ ] Open popup via tap_action on existing card
  - [ ] Close popup via close button
  - [ ] Close popup via backdrop click
  - [ ] Close popup via ESC key
  - [ ] Popup content renders correctly
  - [ ] Nested popup works (popup within popup)
  - [ ] Popup size configurations work
  - [ ] YAML round-trip serialization
  - [ ] Keyboard navigation and focus trapping
- [ ] Visual regression tests for popup states (open, sizes)
- [ ] Documentation with configuration examples

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Popup modal opens with child card content
- [ ] Close via button, backdrop click, and ESC key
- [ ] Popup triggered from tap_action on any card
- [ ] Full-screen and custom size modes work
- [ ] Focus trapping works (keyboard users can't escape modal)
- [ ] YAML round-trip serialization preserves all config
- [ ] PropertiesPanel controls work for popup configuration
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Nested popup support (popup within popup)
- [ ] Standalone popup trigger card type
- [ ] Popup header/footer customization
- [ ] Smooth open/close animations
- [ ] Multiple simultaneous popups with stacked z-index

**Won't Have (Out of Scope)**:
- [ ] Popup positioning (always centered, no anchor-based positioning)
- [ ] Popup drag/resize at runtime
- [ ] Popup persistence across navigation
- [ ] Popup as notification/toast (different UX pattern)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Focus trapping conflicts with Ant Design modals | High | Medium | Use Ant Design Modal's built-in focus management, test thoroughly |
| Nested popups create z-index conflicts | Medium | Medium | Manage z-index stack explicitly, limit nesting depth |
| Popup content larger than viewport | Medium | Low | Add scrollable content area, responsive sizing |
| Popup interaction conflicts with editor mode | Medium | Medium | Disable popup triggers in edit mode, show preview overlay |
| Memory leaks from unclosed popup references | Low | Low | Proper cleanup on unmount, weakref for popup stack |

### Compliance

This feature MUST comply with:
- :white_check_mark: [ai_rules.md](../../ai_rules.md) - Read before implementation, reuse Ant Design Modal patterns
- :white_check_mark: [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first E2E tests using PopupDSL
- :white_check_mark: [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Feature folder `src/features/popup/`, renderer in `src/components/cards/`
- :white_check_mark: [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Modal interaction tests, focus management verification

---

## Feature 4.5: Horizontal/Vertical Layout Enhancements

**Priority**: Medium
**Dependencies**: None
**Estimated Effort**: 2-3 days
**Status**: :white_check_mark: Complete (implementation/tests complete; documentation follow-ups pending)

### Implementation Checklist

#### Phase 1: Gap/Spacing Controls (Day 1)

- [x] Enhance existing `VerticalStackCardRenderer.tsx`:
  - [x] Configurable `gap` property (px value, default: 12px)
  - [x] Gap presets: none (0), tight (4px), normal (12px), relaxed (24px), custom
- [x] Enhance existing `HorizontalStackCardRenderer.tsx`:
  - [x] Configurable `gap` property (same as vertical)
  - [x] Gap presets (same as vertical)
- [x] Enhance existing `GridCardRenderer.tsx`:
  - [x] Configurable `row_gap` and `column_gap` (independent)
  - [x] Gap presets (same pattern)
- [x] Update stack card types in `src/types/dashboard.ts`
- [x] Unit tests for gap configuration parsing

#### Phase 2: Alignment Controls (Day 1)

- [x] Add alignment options to stack cards:
  - [x] Vertical stack: `align_items` (start, center, end, stretch)
  - [x] Horizontal stack: `align_items` (start, center, end, stretch, baseline)
  - [x] Horizontal stack: `justify_content` (start, center, end, space-between, space-around, space-evenly)
  - [x] Grid card: `align_items` and `justify_items`
- [x] Add wrap behavior for horizontal stack:
  - [x] `wrap` property: nowrap (default), wrap, wrap-reverse
  - [x] When wrapped, gap applies between rows too
- [x] Update renderers with alignment CSS properties
- [x] Unit tests for alignment configuration

#### Phase 3: PropertiesPanel Integration (Day 2)

- [x] Add layout-specific property controls to PropertiesPanel for stack/grid cards:
  - [x] Gap control (input with presets)
  - [x] Alignment selector (Select controls)
  - [x] Justify content selector (for horizontal stack)
  - [x] Wrap toggle (for horizontal stack)
- [x] Live preview reflects layout changes immediately
- [ ] Visual alignment preview (icon buttons showing alignment options)

#### Phase 4: YAML Schema & Serialization (Day 2)

- [x] Update YAML schema for enhanced stack/grid cards
- [ ] Example YAML (vertical stack with gap/alignment):
  ```yaml
  type: vertical-stack
  gap: 16
  align_items: center
  cards:
    - type: button
      entity: light.living_room
    - type: button
      entity: light.kitchen
  ```
- [ ] Example YAML (horizontal stack with wrap/justify):
  ```yaml
  type: horizontal-stack
  gap: 8
  align_items: stretch
  justify_content: space-between
  wrap: wrap
  cards:
    - type: button
      entity: light.living_room
    - type: button
      entity: light.kitchen
    - type: button
      entity: light.bedroom
  ```
- [x] Serialize/deserialize enhanced layout config
- [x] Update `ha-dashboard-schema.json`
- [x] Backward compatible: missing properties use current defaults

#### Phase 5: Testing & Documentation (Days 2-3)

- [x] Create `LayoutDSL` in `tests/support/dsl/layout.ts`
- [x] E2E tests using LayoutDSL:
  - [x] Gap configuration changes layout spacing
  - [x] Alignment options apply correctly
  - [x] Wrap behavior works for horizontal stack
  - [x] Justify content options work
  - [x] YAML round-trip serialization
  - [x] Backward compatibility (existing stacks unchanged)
- [x] Unit tests for layout configuration parsing
- [x] Visual regression tests for alignment/gap combinations
- [ ] Documentation with layout examples

### Deferred Decisions

- `align_content` for multi-row horizontal wrap is explicitly deferred to a later enhancement to keep Feature 4.5 MVP scope focused on `align_items` + `justify_content` + `wrap`.

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Gap/spacing control works for vertical-stack, horizontal-stack, and grid cards
- [ ] Gap presets work (none, tight, normal, relaxed, custom)
- [ ] Alignment options work (start, center, end, stretch)
- [ ] Existing dashboards are not affected (backward compatible defaults)
- [ ] YAML round-trip serialization preserves layout config
- [ ] PropertiesPanel shows layout controls for stack/grid cards
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Wrap behavior for horizontal stack
- [ ] Justify content options (space-between, space-around, space-evenly)
- [ ] Visual alignment preview buttons in PropertiesPanel
- [ ] Independent row/column gap for grid cards

**Won't Have (Out of Scope)**:
- [ ] CSS Grid template areas (complex grid layouts)
- [ ] Responsive breakpoints for layout switching
- [ ] Auto-sizing based on content

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Existing dashboard layouts shift with new defaults | High | Low | Default values match current behavior exactly |
| Gap values conflict with card margin/padding | Medium | Medium | Document interaction between gap and spacing controls |
| Wrap behavior creates unexpected layouts | Low | Medium | Provide visual preview, document wrap behavior |

### Compliance

This feature MUST comply with:
- :white_check_mark: [ai_rules.md](../../ai_rules.md) - Read before implementation, enhance existing renderers (no new files unless necessary)
- :white_check_mark: [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first E2E tests using LayoutDSL
- :white_check_mark: [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Enhance existing stack card renderers in `src/components/cards/`
- :white_check_mark: [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Visual regression for layout changes

---

## Feature 4.6: Card Spacing Controls

**Priority**: Medium
**Dependencies**: None
**Estimated Effort**: 2-3 days
**Status**: :white_check_mark: Complete (v0.7.4-beta.R)

### Implementation Checklist

#### Phase 1: Margin & Padding Service (Day 1)

- [x] Create `src/services/cardSpacing.ts` service
  - [x] Parse spacing configuration (margin/padding)
  - [x] Support all-sides shorthand: `margin: 8` (all sides 8px)
  - [x] Support per-side values: `margin: { top: 8, right: 16, bottom: 8, left: 16 }`
  - [x] Support CSS shorthand format: `margin: "8px 16px"` (top/bottom left/right)
  - [x] Spacing presets: none (0), tight (4px), normal (8px), relaxed (16px), spacious (24px), custom
  - [x] Convert spacing config to CSS margin/padding inline styles
- [x] Create `src/types/spacing.ts` for TypeScript types
- [x] Unit tests for spacing service (all formats, presets, edge cases)

#### Phase 2: Card Integration (Day 1)

- [x] Apply spacing to `BaseCard.tsx` wrapper component:
  - [x] Read `card_margin` and `card_padding` from card config
  - [x] Apply as inline styles on card wrapper element
  - [x] Ensure spacing doesn't break existing card layouts
- [x] Support spacing on all card types (applied at BaseCard level)
- [x] Handle negative margin gracefully (warn or clamp to 0)
- [x] Spacing applies in both editor canvas and preview

#### Phase 3: PropertiesPanel Integration (Day 2)

- [x] Create `SpacingControls.tsx` component for PropertiesPanel:
  - [x] Margin section with visual box model diagram
  - [x] Padding section with visual box model diagram
  - [x] All-sides mode (single input applies to all sides)
  - [x] Per-side mode (individual inputs for top/right/bottom/left)
  - [x] Toggle between all-sides and per-side modes
  - [x] Spacing preset dropdown (none, tight, normal, relaxed, spacious, custom)
  - [x] Unit display (px)
- [x] Add spacing controls to PropertiesPanel for all card types
- [x] Live preview of spacing changes in canvas

#### Phase 4: YAML Schema & Serialization (Day 2)

- [x] Define YAML schema for spacing properties
- [ ] Example YAML (all-sides):
  ```yaml
  type: button
  entity: light.living_room
  card_margin: 8
  card_padding: 16
  ```
- [ ] Example YAML (per-side):
  ```yaml
  type: entities
  card_margin:
    top: 0
    right: 8
    bottom: 16
    left: 8
  card_padding:
    top: 12
    right: 16
    bottom: 12
    left: 16
  ```
- [ ] Example YAML (preset):
  ```yaml
  type: button
  entity: light.living_room
  card_margin: relaxed
  card_padding: normal
  ```
- [x] Serialize/deserialize spacing config
- [x] Update `ha-dashboard-schema.json`
- [x] Backward compatible: missing spacing properties = no spacing changes

#### Phase 5: Testing & Documentation (Days 2-3)

- [x] Create `SpacingDSL` in `tests/support/dsl/spacing.ts`
- [x] E2E tests using SpacingDSL:
  - [x] Set margin via PropertiesPanel
  - [x] Set padding via PropertiesPanel
  - [x] Toggle all-sides vs per-side mode
  - [x] Spacing presets apply correctly
  - [x] YAML round-trip serialization
  - [x] Backward compatibility (existing cards unchanged)
  - [x] Spacing visible in canvas preview
- [x] Unit tests for spacing service
- [x] Visual regression tests for spacing combinations
- [x] Documentation with spacing examples

### Acceptance Criteria

**Must Have (Blocking Release)**:
- [x] Margin controls work (all-sides and per-side)
- [x] Padding controls work (all-sides and per-side)
- [x] Spacing presets work (none, tight, normal, relaxed, spacious)
- [x] Spacing applies to all card types (via BaseCard)
- [x] Existing dashboards are not affected (backward compatible)
- [x] YAML round-trip serialization preserves spacing config
- [x] PropertiesPanel shows spacing controls for all cards
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Visual box model diagram in PropertiesPanel
- [ ] Toggle between all-sides and per-side modes
- [ ] CSS shorthand format support in YAML
- [ ] Spacing preview in canvas

**Won't Have (Out of Scope)**:
- [ ] Responsive spacing (different spacing at different viewport sizes)
- [ ] Global spacing settings (per-card only for now)
- [ ] Negative margins (may cause layout issues)
- [ ] Spacing animations/transitions

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Spacing conflicts with stack card gap | Medium | Medium | Document interaction, spacing = per-card, gap = between cards |
| Large spacing values cause overflow | Low | Low | Clamp values to reasonable range (0-64px), show preview |
| Spacing breaks card selection/drag in editor | Medium | Medium | Apply spacing to visual wrapper, not interactive layer |

### Compliance

This feature MUST comply with:
- :white_check_mark: [ai_rules.md](../../ai_rules.md) - Read before implementation, enhance BaseCard (no duplicate spacing logic)
- :white_check_mark: [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) - DSL-first E2E tests using SpacingDSL
- :white_check_mark: [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) - Service in `src/services/cardSpacing.ts`, controls in `src/components/`
- :white_check_mark: [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) - Visual regression for spacing rendering

---

## Phase Completion Checklist

### Implementation Complete

- [ ] All 6 features implemented with full functionality
- [ ] All unit tests passing (95%+ coverage target for new services)
- [ ] All E2E tests passing with DSL-first approach
- [ ] Visual regression tests updated (baseline snapshots for new components)
- [ ] Performance benchmarks met (60fps animations, <2s load with new components)
- [ ] YAML round-trip serialization verified for all features
- [ ] Swiper.js integration verified (carousel performance with 10+ slides)

### Quality Assurance

- [ ] Accessibility audit passed (WCAG 2.1 AA compliance)
- [ ] Keyboard navigation works for all features (carousel, accordion, tabs, popup)
- [ ] Screen reader compatibility verified (ARIA attributes, announcements)
- [ ] `prefers-reduced-motion` respected in all animations
- [ ] All error cases handled gracefully
- [ ] Loading states and empty states implemented
- [ ] No console errors or warnings
- [ ] Memory leaks tested (long-running sessions with popup open/close cycles)

### Documentation

- [ ] User documentation complete for all features
- [ ] Developer documentation updated
- [ ] YAML configuration reference for new card types
- [ ] Code comments added for complex logic
- [ ] Examples and configuration snippets created
- [ ] Release notes drafted

### Compliance Verification

- [ ] [ai_rules.md](../../ai_rules.md) compliance verified
- [ ] [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md) compliance verified
- [ ] [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) compliance verified
- [ ] [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md) compliance verified
- [ ] Code review completed
- [ ] Security review completed (XSS in popup content, injection in YAML parsing)

### Release Preparation

- [ ] Branch merged to main (via PR)
- [ ] Version bumped to v0.7.4-beta.2
- [ ] Changelog updated
- [ ] Beta release created
- [ ] Stakeholders notified
- [ ] User acceptance testing scheduled

---

## Risk Management

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Swiper.js v12 breaking changes or API differences | High | Medium | Prototype early, pin version, verify React wrapper |
| Bundle size increase from Swiper.js (~40KB gzipped) | Medium | Low | Tree-shake, lazy load, code-split carousel module |
| CSS conflicts between Swiper and Ant Design | Medium | Medium | Scope CSS with CSS modules or BEM namespacing |
| Complex nested layouts (carousel > accordion > tabs) | High | Low | Limit nesting depth, test edge cases, document constraints |
| Animation performance with many concurrent transitions | Medium | Medium | Use CSS transforms (GPU), limit concurrent animations, test on low-end hardware |

### Integration Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| New card types break existing card rendering pipeline | High | Low | Use same BaseCard pattern, thorough regression testing |
| PropertiesPanel complexity increases significantly | Medium | Medium | Lazy load property controls, use accordion sections |
| YAML schema changes break existing dashboards | High | Low | Additive-only schema changes, backward compatible defaults |
| Drag-and-drop in editor conflicts with swipe/touch events | Medium | High | Disable swipe in edit mode, use mode-based event handling |

### UX Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Too many layout options overwhelm users | Medium | Medium | Progressive disclosure, sensible defaults, guided setup |
| Inconsistent behavior across layout modules | Medium | Low | Shared layout service, consistent configuration patterns |
| Popup/modal cards confuse users in editor | Medium | Medium | Clear visual indicators, edit-mode popup preview |

---

## Success Metrics

### Functional Metrics

- [ ] All 6 features deployed and functional
- [ ] Zero critical (P0) bugs
- [ ] <5 high-priority (P1) bugs at release
- [ ] 95%+ unit test coverage for new services
- [ ] 90%+ unit test coverage for new components
- [ ] 100% E2E test pass rate
- [ ] WCAG 2.1 AA compliance achieved for all new components

### Performance Metrics

- [ ] Carousel slide transitions at 60fps
- [ ] Accordion expand/collapse at 60fps
- [ ] Tab switching <100ms
- [ ] Popup open/close at 60fps
- [ ] 10+ carousel slides render without frame drops
- [ ] Memory usage <50MB increase for phase
- [ ] Bundle size increase <60KB gzipped (Swiper.js + new components)

### User Experience Metrics

- [ ] All layout modules work with existing card types
- [ ] YAML configuration is intuitive and well-documented
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader users can navigate all layout modules
- [ ] Existing dashboards load without changes (zero regressions)

---

## Dependencies for Future Phases

This phase provides foundation for:

### Phase 5: Advanced Visualization Layer

- **Timeline Card** depends on Layout Infrastructure (container patterns)
- **Calendar View Card** depends on Layout Infrastructure (container patterns)

### Phase 7: Ecosystem & Future Growth

- **Card Duplication & Cloning** benefits from standardized container card patterns
- **Bulk Operations** benefits from container card support

---

**Document Status**: :construction: In Progress (4.1-4.3 complete, 4.4 partial pending HACS alignment, 4.5 complete, 4.6 complete)
**Last Updated**: February 14, 2026
**Next Review**: Before starting Feature 4.6 implementation
**Owner**: Development Team
