# Prompt: Deliver Feature 4.1 — Swiper.js Integration (Carousel Foundation)

## Context

You are an AI assistant implementing **Feature 4.1: Swiper.js Integration (Carousel Foundation)** for the HA Visual Dashboard Maker (Electron + React + TypeScript). This is **Phase 4: Layout Infrastructure Layer**. Your task is to deliver the feature end-to-end following project standards and architecture.

**Phase 4 is independent** (no dependencies on prior phases), but must follow established patterns in code and testing.

**Mandatory tripwire phrase (quote exactly in your response):** “The fastest correct fix is already in the repository.”

---

## Mandatory Pre-Reading (in this order)

1. `ai_rules.md` (highest priority; immutable)
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/architecture/ARCHITECTURE.md`
5. `docs/features/HAVDM_ADVANCED_FEATURES_PLANNING.md`
6. `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`
7. `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`
8. `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`

---

## Feature 4.1 Overview

**Goal**: Add a Swiper.js v12+ based carousel/slider foundation to enable sliding layouts of existing cards.

**Branch**: `feature/layout-infrastructure-layer`  
**Version Target**: v0.7.4-beta.2  
**Dependencies**: None  
**Estimated Effort**: 5–6 days  
**Status**: Ready to Begin  

### Key Requirements

- **Swiper.js v12+** integration (React + SwiperSlide).
- **Carousel as a container** that renders existing cards inside slides.
- Supports:
  - Pagination (bullets, fraction, progressbar, custom)
  - Navigation arrows
  - Autoplay (delay, pause-on-interaction)
  - Touch/mouse swipes
  - Loop mode
  - Transition effects: slide, fade, cube, coverflow, flip
- Per-slide configuration:
  - Background (color/gradient/image)
  - Alignment (top/center/bottom)
  - Per-slide autoplay duration override
  - Optional skip/disallow slide navigation
- YAML round-trip schema + schema updates (`ha-dashboard-schema.json`)
- PropertiesPanel integration with live preview
- Accessibility: ARIA roles, keyboard navigation, `prefers-reduced-motion`

---

## Implementation Targets

### Code Organization

- Create feature folder: `src/features/carousel/`
  - `SwiperCarousel.tsx` (main component)
  - `carouselService.ts` (configuration + parsing)
  - `types.ts` (TypeScript types)
- Add renderer in `src/components/cards/SwiperCardRenderer.tsx`
- Register card in `cardRegistry.ts` as `custom:swipe-card`

### YAML Example

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

---

## Acceptance Criteria

**Must Have**
- Swiper carousel renders with pagination + navigation
- Child cards render inside slides
- Touch/mouse swipe works
- Autoplay configurable
- Keyboard navigation works (arrow keys + tab)
- YAML round-trip preserves all config
- PropertiesPanel controls update live
- All unit + E2E tests pass

**Should Have**
- Multiple transition effects
- Per-slide backgrounds
- Slides per view
- Free mode + loop mode

**Won’t Have**
- Nested carousels
- Virtual slides (100+)
- Parallax effects
- Thumb/gallery mode

---

## Testing Requirements

### Unit Tests
- `carouselService` parsing and validation
- Per-slide config parsing

### E2E Tests (DSL-first only)
- Create `tests/support/dsl/carousel.ts` (CarouselDSL)
- E2E coverage:
  - Add carousel from palette
  - Navigate slides (arrows, swipe, pagination)
  - Autoplay advances slides
  - Property changes reflect in preview
  - YAML round-trip
  - Keyboard navigation

### Visual Regression
- Snapshot: first/middle/last slide
- Snapshot: pagination styles

### Accessibility
- ARIA role + roledescription
- Keyboard navigation
- `prefers-reduced-motion` respected

---

## Guardrails and Standards

- E2E specs: **DSL-first only**, no raw selectors or sleeps.
- Use existing DSL patterns and helper conventions before adding new ones.
- `ai_rules.md` one-run pause/diagnose workflow for test execution.
- Architecture: carousel in `src/features`, renderer in `src/components/cards/`.

---

## Clarifying Questions (ask before coding)

1. Any required Swiper behaviors beyond standard pagination/navigation?
2. Should carousel behave differently in edit mode vs preview?
3. Do we need responsive slide sizing rules for mobile preview?
4. Should slide background defaults inherit from card background?

---

## Deliverables

1. **Product Code**
   - Swiper integration + renderer + config service + types
2. **YAML Schema**
   - Update `ha-dashboard-schema.json`
3. **PropertiesPanel UI**
   - Full config controls + live preview
4. **Tests**
   - Unit + E2E + Visual regression
5. **Docs**
   - Feature doc snippet + YAML example

---

## Output Format

Respond with:
1. A concise implementation plan for Feature 4.1
2. File-by-file change list (planned)
3. Test plan + commands
4. Open questions or risks

Remember: include the mandatory tripwire phrase verbatim.
