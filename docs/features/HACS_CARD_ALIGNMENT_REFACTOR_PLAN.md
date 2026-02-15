# HACS Card Alignment Refactor Plan

**Branch**: `refactor/hacs-card-alignment`
**Status**: In Progress (R2/R3/R4 aligned; popup alignment research active)
**Created**: 2026-02-11

---

## Current Tracking Note (2026-02-14)

- Carousel, accordion, and tabs naming/schema alignment work has been implemented in product code (`custom:swipe-card`, `custom:expander-card`, `custom:tabbed-card`) with legacy migration support.
- Popup is not fully complete from an alignment perspective. The current `custom:popup-card` implementation remains HAVDM-specific while HACS alignment options are being researched.

## Phase 5 Alignment Addendum (2026-02-15)

- Advanced Visualization delivery in `v0.7.5-beta.10` includes upstream-aligned card types for:
  - `custom:apexcharts-card`
  - `custom:gauge-card-pro`
  - `custom:slider-button-card`
  - `custom:mini-graph-card`
  - Built-in `calendar` and `weather-forecast`
- Remaining Phase 5 alignment debt is explicitly tracked for:
  - `custom:native-graph-card`
  - `custom:modern-circular-gauge`
- These two types require a dedicated conversion decision (upstream mapping and export contract) before Phase 5 can be considered fully HACS-aligned.

---

## Objective

Align all HAVDM custom card implementations with real upstream HACS card YAML schemas so that:
1. YAML exported from HAVDM can be pasted into a Home Assistant dashboard and render correctly using the corresponding HACS card.
2. YAML from existing Home Assistant dashboards (using these HACS cards) can be imported into HAVDM and display correctly.
3. Users familiar with these HACS cards find the property names and structure match their expectations.

---

## Guiding Principle

> **All custom card functionality in HAVDM must be backed by an existing HACS or base HA card.** HAVDM must not invent card type strings that do not exist in the HA/HACS ecosystem. Where HAVDM adds editor-only conveniences (e.g., per-slide backgrounds in a visual editor), these must either map cleanly to upstream YAML or be documented as HAVDM-only extensions that are stripped on export.

---

## Research Findings: Upstream HACS Cards vs. HAVDM Implementations

### 1. Carousel/Swiper (Historical Pre-Alignment Snapshot)

| Aspect | Upstream: `custom:swipe-card` (bramkragten) | HAVDM Legacy (pre-refactor): `custom:swiper-card` |
|--------|----------------------------------------------|------------------------------|
| Card type string | `custom:swipe-card` | `custom:swiper-card` |
| Parameter naming | camelCase (Swiper.js native) in `parameters` object | snake_case flat top-level properties |
| Config structure | `parameters` object = direct Swiper.js passthrough | Flat top-level `pagination`, `autoplay`, `effect`, etc. |
| Child cards | `cards[]` only (1 card = 1 slide) | `cards[]` OR `slides[]` (slides support multi-card per slide, backgrounds, alignment) |
| `start_card` | 1-indexed, top-level | Not present |
| `reset_after` | Seconds to auto-reset | Not present |
| Pagination | `parameters.pagination` | Top-level `pagination` |
| Autoplay | `parameters.autoplay` | Top-level `autoplay` |
| Breakpoints | `parameters.breakpoints` | Not implemented |
| Per-slide backgrounds | Not supported | Supported (HAVDM-only) |
| `prefers-reduced-motion` | Not handled | Handled (HAVDM-only, good) |

**Upstream YAML Example:**
```yaml
type: custom:swipe-card
start_card: 1
reset_after: 30
parameters:
  pagination:
    type: bullets
    clickable: true
  navigation: true
  autoplay:
    delay: 5000
    disableOnInteraction: true
  effect: slide
  slidesPerView: 1
  spaceBetween: 16
  loop: true
cards:
  - type: button
    entity: light.living_room
  - type: entities
    entities:
      - sensor.temperature
```

### 2. Accordion/Expander (Historical Pre-Alignment Snapshot)

| Aspect | Upstream: `custom:expander-card` (Alia5) | HAVDM Legacy (pre-refactor): `custom:accordion-card` |
|--------|-------------------------------------------|--------------------------------|
| Card type string | `custom:expander-card` | `custom:accordion-card` |
| Structure | Single expandable section with `title` + `cards` | Multi-section via `sections[]` array |
| Title | `title` (string) OR `title-card` (full card config for header) | `sections[].title` (string only) |
| Icon | `expanded-icon` / `collapsed-icon` (MDI icons for toggle) | `sections[].icon` (single icon per section) |
| Child cards | `cards[]` at top level | `sections[].cards[]` |
| Default state | `expanded` (boolean, default false) | `sections[].default_expanded` |
| Expand mode | N/A (single section per card; nest multiple for multi-section) | `expand_mode: 'single' | 'multi'` |
| Styling | `gap` (px between header/content), `padding` (content padding), `clear` (boolean), `overlay-margin` (string), `child-padding` (string), `button-background` (CSS color) | `style: 'bordered' | 'borderless' | 'ghost'`, `header_background`, `content_padding` |
| Nesting | Supported naturally (put expander-card inside expander-card) | Supported with depth limit (MAX_ACCORDION_DEPTH=3) |

**Upstream YAML Example:**
```yaml
type: custom:expander-card
title: Living Room Controls
expanded: true
gap: 0.6em
padding: 0
clear: false
overlay-margin: 2em
title-card:
  type: entities
  entities:
    - light.living_room
title-card-button-overlay: true
cards:
  - type: button
    entity: switch.tv
  - type: entities
    entities:
      - sensor.temperature
      - sensor.humidity
```

**Key differences:**
- `expander-card` is one section per card instance. For multiple sections, users nest multiple expander-cards inside a vertical-stack.
- HAVDM's `accordion-card` bundles multiple sections in one card (not how the real card works).
- `expander-card` supports `title-card` (render any HA card as the header), HAVDM only supports a string title.
- `expander-card` has `title-card-button-overlay` to overlay the expand button on the title card.

### 3. Tabs (Historical Pre-Alignment Snapshot)

| Aspect | Upstream: `custom:tabbed-card` (kinghat) | HAVDM Legacy (pre-refactor): `custom:tabs-card` |
|--------|-------------------------------------------|----------------------------|
| Card type string | `custom:tabbed-card` | `custom:tabs-card` |
| Tab content | `tabs[].card` (single card per tab) | `tabs[].cards[]` (array of cards per tab) |
| Tab header | `attributes.label` + `attributes.icon` (global or per-tab) | `tabs[].title` + `tabs[].icon` |
| Default tab | `options.defaultTabIndex` (0-based) | `default_tab` (0-based) |
| Styling | CSS custom properties via `styles` object (`--mdc-theme-primary`, etc.) | No CSS property support |
| Tab attributes | `attributes.stacked`, `attributes.isFadingIndicator`, `attributes.minWidth`, `attributes.isMinWidthIndicator` | Not supported |
| Global vs per-tab | Global `attributes`/`styles` with per-tab overrides | Per-tab only |
| Tab position | Not supported (tabs always on top) | `tab_position: top | bottom | left | right` (HAVDM-only) |
| Tab size | Not supported | `tab_size: default | small | large` (HAVDM-only) |
| Animation | Not supported | `animation: none | fade | slide` (HAVDM-only) |
| Lazy render | Not supported | `lazy_render: boolean` (HAVDM-only) |
| Badge/count | Not supported | `tabs[].badge`, `tabs[].count` (HAVDM-only) |

**Upstream YAML Example:**
```yaml
type: custom:tabbed-card
options:
  defaultTabIndex: 0
styles:
  --mdc-theme-primary: yellow
  --mdc-tab-text-label-color-default: rgba(225, 225, 225, 0.8)
attributes:
  stacked: true
tabs:
  - attributes:
      label: Lights
      icon: mdi:lightbulb
    card:
      type: entities
      entities:
        - light.living_room
        - light.kitchen
  - attributes:
      label: Sensors
      icon: mdi:thermometer
    card:
      type: entities
      entities:
        - sensor.temperature
        - sensor.humidity
```

**Key differences:**
- Upstream uses `tabs[].card` (singular), HAVDM uses `tabs[].cards` (plural array). Users put multiple cards in a tab by using a stack card as the single `card`.
- Upstream uses `attributes.label`/`attributes.icon` nesting, HAVDM uses flat `tabs[].title`/`tabs[].icon`.
- Upstream supports CSS custom properties via `styles`, HAVDM does not.
- HAVDM has several features (tab_position, animation, lazy_render, badge/count) not in upstream.

### 4. Popup/Modal

| Aspect | Upstream: `custom:bubble-card` (Clooos) | HAVDM: `custom:popup-card` |
|--------|------------------------------------------|----------------------------|
| Card type string | `custom:bubble-card` with `card_type: pop-up` | `custom:popup-card` (invented, not a real HACS card) |
| Trigger | Pop-up card is placed in a HA subview; triggered by navigation or `navigate` action | Dedicated popup-card with trigger button |
| Config structure | `card_type: pop-up` + `hash` (URL hash for navigation) | `popup` object with `title`, `size`, `cards[]` |
| Positioning | Bottom sheet (slides up from bottom) | Centered modal (Ant Design Modal) |
| Child cards | Any cards placed in the subview alongside the pop-up card | `popup.cards[]` |
| Sizing | `width_desktop` (string, default '540px'), auto height | `size: auto | small | medium | large | fullscreen | custom` |
| Backdrop | `bg_color`, `bg_opacity`, `bg_blur` | `backdrop_opacity`, `close_on_backdrop` |
| Header/footer | Icon, name, entity display in header; optional action buttons | `show_header`, `show_footer`, `footer_actions[]` |
| Close behavior | Swipe down, click outside, back navigation | Click backdrop, close button, Escape key |
| Hash routing | `hash: '#my-popup'` (URL-based navigation trigger) | Not URL-based |

**Upstream YAML Example (Bubble Card Pop-up):**
```yaml
type: custom:bubble-card
card_type: pop-up
hash: '#living-room'
name: Living Room
icon: mdi:sofa
entity: light.living_room
bg_color: var(--ha-card-background)
bg_opacity: 0.85
bg_blur: 10
width_desktop: 540px
close_on_click: true
auto_close: ''
back_open: true
```

**Key differences:**
- Bubble Card pop-up is fundamentally different architecture -- it uses HA subviews and URL hash routing.
- `custom:popup-card` does not exist as a real HACS card. It's entirely a HAVDM invention.
- Bubble Card pop-ups are positioned as bottom sheets, HAVDM uses centered modals.
- Bubble Card needs the pop-up card placed in a HA subview; child content is other cards in the same subview.

---

## Refactor Plan

### Phase R1: Add HACS-Alignment Rule to ai_rules.md

Add an immutable rule that all custom card types must map to real upstream HACS cards. Document that HAVDM-only extensions are permitted but must be clearly marked and stripped on YAML export.

**Files**: `ai_rules.md`

### Phase R2: Carousel Alignment (`custom:swipe-card`)

**Goal**: Rename `custom:swiper-card` to `custom:swipe-card` and restructure config to match upstream.

**Changes:**
1. **Type string**: `custom:swiper-card` → `custom:swipe-card`
2. **Config structure**: Move Swiper params under `parameters` object with camelCase keys
3. **Add missing properties**: `start_card` (1-indexed), `reset_after`
4. **Remove HAVDM-only properties from YAML output**: `slides[]` with per-slide config should be a HAVDM editor feature that exports as flat `cards[]`
5. **Import support**: Parse upstream `parameters` passthrough format into internal normalized config
6. **Export support**: Convert internal normalized config back to upstream `parameters` format

**Files to modify:**
- `src/features/carousel/types.ts` — Update type names and add import/export types
- `src/features/carousel/carouselService.ts` — Add import/export conversion functions
- `src/features/carousel/SwiperCarousel.tsx` — Update component props
- `src/components/cards/SwiperCardRenderer.tsx` — Update type references
- `src/services/cardRegistry.ts` — Update registered type string
- `src/schemas/ha-dashboard-schema.json` — Update type enum and property schema
- `src/components/PropertiesPanel.tsx` — Update type checks
- `src/components/BaseCard.tsx` — Update type checks
- `tests/unit/carousel-service.spec.ts` — Update tests
- `tests/e2e/carousel.spec.ts` — Update tests
- `tests/support/dsl/carousel.ts` — Update DSL

**Complexity**: Medium-High (touches many files, but mostly mechanical renames + service layer restructure)

### Phase R3: Accordion Alignment (`custom:expander-card`)

**Goal**: Rename `custom:accordion-card` to `custom:expander-card` and restructure to match upstream single-section-per-card model.

**Changes:**
1. **Type string**: `custom:accordion-card` → `custom:expander-card`
2. **Config structure**: Flatten from multi-section to single-section per card
   - `sections[]` → top-level `title` + `cards[]`
   - Multi-section accordion = multiple expander-cards in a vertical-stack (as upstream does it)
3. **Add missing properties**: `title-card` (card config for header), `title-card-button-overlay`, `gap`, `padding`, `clear`, `overlay-margin`, `child-padding`, `button-background`, `expanded-icon`, `collapsed-icon`
4. **Remove HAVDM-only properties**: `expand_mode`, `style` (Ant Design styles), `header_background`, `content_padding`
5. **Import support**: Parse upstream flat format
6. **Export support**: Convert internal config to upstream format; multi-section HAVDM accordion exports as vertical-stack of expander-cards

**Files to modify:**
- `src/features/accordion/types.ts` — Restructure types
- `src/features/accordion/accordionService.ts` — Rewrite normalization
- `src/features/accordion/AccordionPanel.tsx` — Update UI
- `src/components/cards/AccordionCardRenderer.tsx` — Update renderer
- `src/services/cardRegistry.ts` — Update registered type string
- `src/schemas/ha-dashboard-schema.json` — Update schema
- `src/components/PropertiesPanel.tsx` — Update properties
- `src/components/BaseCard.tsx` — Update type checks
- `tests/unit/accordion-service.spec.ts` — Rewrite tests
- `tests/e2e/accordion.spec.ts` — Update tests
- `tests/support/dsl/accordion.ts` — Update DSL

**Complexity**: High (fundamental structural change from multi-section to single-section model)

### Phase R4: Tabs Alignment (`custom:tabbed-card`)

**Goal**: Rename `custom:tabs-card` to `custom:tabbed-card` and align config with upstream attributes/styles pattern.

**Changes:**
1. **Type string**: `custom:tabs-card` → `custom:tabbed-card`
2. **Config structure**:
   - `tabs[].title` → `tabs[].attributes.label`
   - `tabs[].icon` → `tabs[].attributes.icon`
   - `tabs[].cards[]` → `tabs[].card` (singular; multi-card = use stack card)
   - `default_tab` → `options.defaultTabIndex`
3. **Add missing properties**: `styles` (CSS custom properties), `attributes.stacked`, `attributes.isFadingIndicator`, `attributes.minWidth`, `attributes.isMinWidthIndicator`
4. **HAVDM-only properties** (keep internally, strip on export): `tab_position`, `tab_size`, `animation`, `lazy_render`, `badge`, `count`
5. **Import support**: Parse upstream `attributes`/`styles` pattern
6. **Export support**: Convert internal config to upstream format

**Files to modify:**
- `src/types/tabs.ts` — Restructure types
- `src/services/tabsService.ts` — Update normalization
- `src/features/tabs/TabsPanel.tsx` — Update UI
- `src/components/cards/TabsCardRenderer.tsx` — Update renderer
- `src/services/cardRegistry.ts` — Update registered type string
- `src/schemas/ha-dashboard-schema.json` — Update schema
- `src/components/PropertiesPanel.tsx` — Update properties
- `src/components/BaseCard.tsx` — Update type checks
- `tests/unit/tabs-service.spec.ts` — Update tests
- `tests/e2e/tabs.spec.ts` — Update tests
- `tests/support/dsl/tabs.ts` — Update DSL

**Complexity**: Medium (mostly structural property renaming + adding nested attributes/styles)

### Phase R5: Popup Alignment (Decision: Keep as HAVDM-only)

**Decision**: Keep `custom:popup-card` as a HAVDM-only feature.
- No upstream HACS equivalent exists
- Bubble Card pop-up architecture is too different (subview-based, hash routing) to align
- Mark clearly in registry metadata and card palette UI as HAVDM-only
- On HA export, prepend warning comments when `custom:popup-card` is present:
  - `# WARNING: custom:popup-card is a HAVDM editor feature.`
  - `# This card will not render in Home Assistant without the HAVDM runtime.`
  - `# Consider using browser_mod popup or Bubble Card pop-up for HA-native popups.`
- Future consideration: optional export conversion to Bubble Card pop-up format

### Phase R6: Schema & Registry Updates

Update the central schema and registry files after all card type renames are complete.

**Files:**
- `src/schemas/ha-dashboard-schema.json` — All type string changes, property schema updates
- `src/services/cardRegistry.ts` — All registered card types
- Card palette/picker UI (if applicable)

### Phase R7: Import/Export Service

Create a dedicated import/export conversion layer that:
1. **On import**: Converts upstream HACS YAML → HAVDM internal format (normalized config)
2. **On export**: Converts HAVDM internal format → upstream HACS YAML (stripping editor-only props)
3. **Preserves unknown properties**: Passes through any unrecognized YAML keys (for forward compatibility)

**New files:**
- `src/services/yamlConversionService.ts` — Central import/export conversion service
- `tests/unit/yaml-conversion-service.spec.ts` — Comprehensive round-trip tests

### Phase R8: Regression Testing

After all changes:
1. Run full unit test suite
2. Run full E2E test suite
3. Add new round-trip YAML tests that verify upstream YAML → HAVDM → upstream YAML preserves structure
4. Add import tests that verify real-world HACS card YAML configurations parse correctly

---

## Execution Order

1. **R1** — ai_rules.md update (standalone, do first)
2. **R7** — Import/export service skeleton (foundation for conversion logic)
3. **R2** — Carousel alignment (most mechanical, good first refactor)
4. **R4** — Tabs alignment (medium complexity)
5. **R3** — Accordion alignment (highest complexity due to structural change)
6. **R5** — Popup decision & implementation
7. **R6** — Final schema/registry cleanup
8. **R8** — Full regression testing

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing user dashboards saved in HAVDM format | High | Migration function that auto-converts old format on load |
| Test suite breakage from renames | Medium | Methodical search-replace with blast-radius check per ai_rules §4a |
| Per-slide config loss on export | Low | Document as HAVDM-only; preserve internally, strip on export |
| Popup architectural gap | Medium | Option B keeps existing functionality; document limitations |
| Accordion multi-section → single-section migration | High | Multi-section configs auto-convert to vertical-stack of expander-cards |

---

## Decided Questions

1. **Transition period?** No. App is not in production — clean-cut refactor with no backward-compatible dual format.
2. **Accordion model?** Match upstream single-section model. Editor presents "Expander Group" UX (vertical-stack of expander-cards) but YAML output is upstream-compatible. See R3 prompt.
3. **Card-mod?** Deferred. Card-mod is a cross-cutting CSS injection system (`card_mod:` / `style:` on any card), not a card type. Handle as a separate future task.
4. **Priority?** Complete refactor before Phase 4 features (4.5, 4.6). Refactor prompts are ready.

## Prompt Framework

Self-contained prompts for each phase are in `docs/refactor/hacs-alignment/`:

| Phase | File | Suggested Agent | Complexity |
|-------|------|----------------|------------|
| R2 | `R2_CAROUSEL_ALIGNMENT.md` | Codex | Medium-High |
| R3 | `R3_ACCORDION_ALIGNMENT.md` | Claude | High |
| R4 | `R4_TABS_ALIGNMENT.md` | Codex | Medium |
| R5 | `R5_POPUP_ALIGNMENT.md` | Codex | Low |
| R7 | `R7_IMPORT_EXPORT_SERVICE.md` | Claude | Medium |
| R8 | `R8_REGRESSION_TESTING.md` | Either | Medium |

Agent assignment is at the user's discretion — any phase can be given to any agent.

Each phase prompt includes a Validation section with lint, unit, and targeted E2E tests. The executing agent runs all three levels. Full regression and CI are handled separately.

R2, R3, R4, R5 are independent and can run in parallel.
R7 depends on R2+R3+R4 being complete.
R8 depends on all prior phases.
