# R2: Carousel Alignment — `custom:swiper-card` → `custom:swipe-card`

## Mandatory Pre-Reading

1. `ai_rules.md` (highest priority; immutable)
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md`

**Tripwire phrase (quote exactly):** "The fastest correct fix is already in the repository."

---

## Objective

Rename `custom:swiper-card` to `custom:swipe-card` and restructure the YAML config to match the upstream bramkragten/swipe-card HACS card. After this refactor, YAML exported from HAVDM for a swipe-card must be valid YAML that renders correctly in a Home Assistant dashboard with the swipe-card HACS component installed.

---

## Upstream HACS Card Schema: `custom:swipe-card`

### Top-Level Properties

| Property | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `type` | `string` | — | Yes | Must be `custom:swipe-card` |
| `cards` | `Card[]` | — | Yes | Array of child card configs. Each card = one slide. |
| `parameters` | `object` | `{}` | No | Swiper.js parameters passed through directly. camelCase keys. |
| `start_card` | `number` | `1` | No | 1-indexed card to show first. |
| `reset_after` | `number` | — | No | Seconds of inactivity before resetting to `start_card`. |

### Common `parameters` Keys (camelCase, Swiper.js native)

```yaml
parameters:
  pagination:
    type: bullets          # 'bullets' | 'fraction' | 'progressbar' | 'custom'
    clickable: true
  navigation: true
  autoplay:
    delay: 5000
    disableOnInteraction: true
    stopOnLastSlide: false
  effect: slide            # 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip'
  speed: 300
  slidesPerView: 1         # number or 'auto'
  spaceBetween: 16
  centeredSlides: false
  direction: horizontal    # 'horizontal' | 'vertical'
  loop: true
  freeMode: false
  keyboard:
    enabled: true
    onlyInViewport: true
  breakpoints:
    640:
      slidesPerView: 2
```

### Upstream YAML Examples

**Minimal:**
```yaml
type: custom:swipe-card
cards:
  - type: button
    entity: light.living_room
  - type: button
    entity: light.kitchen
```

**Full-featured:**
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

---

## Current HAVDM Implementation (What Exists Today)

### Type string: `custom:swiper-card` (note the extra 'r')

### Config uses snake_case flat properties (NOT inside `parameters`):
```yaml
type: custom:swiper-card
pagination:
  type: bullets
  clickable: true
navigation: true
autoplay:
  enabled: true
  delay: 5000
  pause_on_interaction: true
effect: slide
slides_per_view: 1
space_between: 16
loop: false
direction: horizontal
centered_slides: false
free_mode: false
cards:
  - type: button
    entity: light.living_room
```

### HAVDM-Only Features (NOT in upstream, keep internally, strip on export):
- `slides[]` array with per-slide config (background, alignment, autoplay_delay, skip_navigation)
- `autoplay.enabled` (upstream uses presence/absence of autoplay object)
- `autoplay.pause_on_interaction` (upstream: `disableOnInteraction`)
- `autoplay.stop_on_last_slide` (upstream: `stopOnLastSlide`)

---

## Files to Modify

### 1. Type Definitions
**File**: `src/features/carousel/types.ts`

**Changes:**
- Rename `SwiperCardConfig.type` from `'custom:swiper-card'` to `'custom:swipe-card'`
- Add new interface `UpstreamSwipeCardConfig` for the upstream YAML format:
  ```typescript
  export interface UpstreamSwipeCardConfig {
    type: 'custom:swipe-card';
    cards?: Card[];
    parameters?: Record<string, unknown>;
    start_card?: number;
    reset_after?: number;
  }
  ```
- Keep existing internal `SwiperCardConfig` and `NormalizedCarouselConfig` (these are the HAVDM-internal working format)
- Add conversion type aliases/helpers

### 2. Service Layer
**File**: `src/features/carousel/carouselService.ts`

**Changes:**
- Add `parseUpstreamSwipeCard(yaml: UpstreamSwipeCardConfig): SwiperCardConfig` function:
  - Maps `parameters.slidesPerView` → `slides_per_view`
  - Maps `parameters.spaceBetween` → `space_between`
  - Maps `parameters.centeredSlides` → `centered_slides`
  - Maps `parameters.freeMode` → `free_mode`
  - Maps `parameters.autoplay.disableOnInteraction` → `autoplay.pause_on_interaction`
  - Maps `parameters.autoplay.stopOnLastSlide` → `autoplay.stop_on_last_slide`
  - Maps `start_card` (1-indexed) → handle internally
  - Maps `reset_after` → store internally
- Add `toUpstreamSwipeCard(config: NormalizedCarouselConfig): UpstreamSwipeCardConfig` function:
  - Reverses all the above mappings
  - Strips HAVDM-only properties (slides[], per-slide config)
  - Converts `slides[]` back to flat `cards[]` (one card per slide)

### 3. Component
**File**: `src/features/carousel/SwiperCarousel.tsx`

**Changes:**
- No structural changes needed (component uses NormalizedCarouselConfig internally)
- Update any hardcoded `'custom:swiper-card'` string references

### 4. Card Renderer
**File**: `src/components/cards/SwiperCardRenderer.tsx`

**Changes:**
- Update type string reference from `'custom:swiper-card'` to `'custom:swipe-card'`

### 5. Card Registry
**File**: `src/services/cardRegistry.ts` (line ~305)

**Changes:**
```typescript
// BEFORE:
type: 'custom:swiper-card',
name: 'Swiper Carousel',

// AFTER:
type: 'custom:swipe-card',
name: 'Swipe Card',
source: 'hacs',  // was 'custom'
```
- Update `defaultProps` to use upstream format (with `parameters`)

### 6. BaseCard
**File**: `src/components/BaseCard.tsx` (line ~254)

**Changes:**
```typescript
// BEFORE:
case 'custom:swiper-card':

// AFTER:
case 'custom:swipe-card':
```

### 7. PropertiesPanel
**File**: `src/components/PropertiesPanel.tsx`

**Changes:**
- Replace all occurrences of `'custom:swiper-card'` with `'custom:swipe-card'`
- Lines: ~584, ~998, ~2635, ~4194
- PropertiesPanel internal form handling stays the same (it works with normalized config)

### 8. JSON Schema
**File**: `src/schemas/ha-dashboard-schema.json` (line ~189)

**Changes:**
- Replace `"custom:swiper-card"` with `"custom:swipe-card"` in the type enum
- Update any property definitions in the schema

### 9. Card Sizing Contract
**File**: `src/utils/cardSizingContract.ts` (line ~199)

**Changes:**
- Replace `'custom:swiper-card'` with `'custom:swipe-card'`

### 10. Unit Tests
**File**: `tests/unit/carousel-service.spec.ts`

**Changes:**
- Replace all `'custom:swiper-card'` with `'custom:swipe-card'`
- Add new test cases for `parseUpstreamSwipeCard()` and `toUpstreamSwipeCard()` round-trip
- Test that camelCase parameters map correctly to/from snake_case

### 11. E2E Tests
**Files:**
- `tests/e2e/carousel.spec.ts` — Update BASE_YAML and all type string refs
- `tests/e2e/carousel.visual.spec.ts` — Update BASE_YAML and all type string refs

### 12. DSL
**File**: `tests/support/dsl/carousel.ts`

**Changes:**
- Update any palette search strings from `'custom:swiper-card'` to `'custom:swipe-card'`

---

## Validation

The executing agent must run all three test levels after implementing changes. Follow `ai_rules.md` §5 for test execution and reporting policy.

1. **Lint**: `npm run lint`
2. **Unit tests**: `npm run test:unit -- --grep carousel`
3. **Targeted E2E tests**: `npx playwright test tests/e2e/carousel.spec.ts tests/e2e/carousel.visual.spec.ts --project=electron-e2e`

After one test run, pause → diagnose any failures → report results to the user before proceeding (per ai_rules §5).

Full regression and CI testing are handled separately and are not part of this phase.

---

## YAML Round-Trip Test Cases

Add these test cases to verify upstream compatibility:

### Import Test (upstream YAML → HAVDM):
```yaml
# Input (upstream format):
type: custom:swipe-card
start_card: 2
reset_after: 30
parameters:
  slidesPerView: 2
  spaceBetween: 20
  centeredSlides: true
  loop: true
  autoplay:
    delay: 3000
    disableOnInteraction: true
  pagination:
    type: fraction
  navigation: true
  effect: coverflow
cards:
  - type: button
    entity: light.room_1
  - type: button
    entity: light.room_2
  - type: button
    entity: light.room_3
```

Expected internal normalized config:
- `slides_per_view`: 2
- `space_between`: 20
- `centered_slides`: true
- `loop`: true
- `autoplay.delay`: 3000
- `autoplay.pause_on_interaction`: true
- `pagination.type`: 'fraction'
- `navigation`: true
- `effect`: 'coverflow'
- 3 slides, each with 1 card

### Export Test (HAVDM → upstream YAML):
Internal config should serialize back to the upstream format above (minus any HAVDM-only properties).
