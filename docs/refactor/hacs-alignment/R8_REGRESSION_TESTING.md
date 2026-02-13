# R8: Regression Testing — Full Suite Validation

## Mandatory Pre-Reading

1. `ai_rules.md` (highest priority; immutable)
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md`

**Tripwire phrase (quote exactly):** "The fastest correct fix is already in the repository."

---

## Objective

After all refactor phases (R2–R7) are complete, run a comprehensive regression test suite to verify:
1. No existing functionality was broken by the card type renames and restructuring
2. All YAML round-trips produce correct output
3. No stale references to old card type strings remain in the codebase
4. All card types render correctly in the editor

**Dependencies**: All prior phases (R2, R3, R4, R5, R7) must be complete before R8.

---

## Test Execution Plan

### Level 1: Static Analysis

**1a. Lint**
```bash
npm run lint
```
Expected: 0 errors. Warnings are acceptable if they match the pre-refactor baseline (~145 warnings).

**1b. Stale Reference Search**

Search for any remaining references to old card type strings that should have been renamed:

```bash
# Old swiper-card references (should be 0 outside of migration code)
grep -r "custom:swiper-card" src/ tests/ --include="*.ts" --include="*.tsx" --include="*.json"

# Old accordion-card references (should be 0 outside of migration code)
grep -r "custom:accordion-card" src/ tests/ --include="*.ts" --include="*.tsx" --include="*.json"

# Old tabs-card references (should be 0 outside of migration code)
grep -r "custom:tabs-card" src/ tests/ --include="*.ts" --include="*.tsx" --include="*.json"
```

**Expected results:**
- `custom:swiper-card`: Only in `yamlConversionService.ts` (legacy migration) and test fixtures for migration
- `custom:accordion-card`: Only in `yamlConversionService.ts` (legacy migration) and test fixtures for migration
- `custom:tabs-card`: Only in `yamlConversionService.ts` (legacy migration) and test fixtures for migration
- `custom:popup-card`: Allowed everywhere (HAVDM-only, not renamed)

### Level 2: Unit Tests

```bash
npm run test:unit
```

Run the full unit test suite, not just targeted tests. All tests must pass.

Key unit test files to verify:
- `tests/unit/carousel-service.spec.ts` — swipe-card normalization
- `tests/unit/accordion-service.spec.ts` — expander-card normalization
- `tests/unit/tabs-service.spec.ts` — tabbed-card normalization
- `tests/unit/yaml-conversion-service.spec.ts` — import/export round-trips
- All other unit tests — catch import breakage from renames

### Level 3: Targeted E2E Tests (Per Card Type)

Run each card type's E2E tests individually to isolate failures:

```bash
# Carousel / Swipe Card
npx playwright test tests/e2e/carousel.spec.ts tests/e2e/carousel.visual.spec.ts --project=electron-e2e

# Accordion / Expander Card
npx playwright test tests/e2e/accordion.spec.ts tests/e2e/accordion.visual.spec.ts --project=electron-e2e

# Tabs / Tabbed Card
npx playwright test tests/e2e/tabs.spec.ts tests/e2e/tabs.visual.spec.ts --project=electron-e2e

# Popup Card
npx playwright test tests/e2e/popup.spec.ts tests/e2e/popup.visual.spec.ts --project=electron-e2e
```

### Level 4: Full E2E Suite

```bash
npm run test:e2e
```

Run the complete E2E suite to catch cross-feature regressions. Pay attention to:
- Card palette tests (card types must appear with new names)
- Dashboard save/load tests (YAML must round-trip correctly)
- Properties panel tests (form fields must bind to new property names)
- BaseCard rendering tests (case statements must match new type strings)

### Level 5: Integration Tests

```bash
npm run test:integration
```

Run any integration tests that exercise the full stack.

---

## YAML Fixture Files

Create test fixture files for regression testing:

### Upstream Format Fixtures

**File**: `tests/fixtures/upstream-swipe-card.yaml`
```yaml
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

**File**: `tests/fixtures/upstream-expander-card.yaml`
```yaml
type: custom:expander-card
title: Living Room Controls
expanded: true
gap: 1em
padding: 8px
expanded-icon: mdi:chevron-up
collapsed-icon: mdi:chevron-down
button-background: rgba(0,0,0,0.3)
cards:
  - type: button
    entity: light.living_room
  - type: entities
    entities:
      - sensor.temperature
      - sensor.humidity
```

**File**: `tests/fixtures/upstream-tabbed-card.yaml`
```yaml
type: custom:tabbed-card
options:
  defaultTabIndex: 1
styles:
  --mdc-theme-primary: yellow
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
  - attributes:
      label: Climate
      icon: mdi:thermometer
    card:
      type: vertical-stack
      cards:
        - type: thermostat
          entity: climate.living_room
        - type: sensor
          entity: sensor.temperature
```

### Legacy HAVDM Format Fixtures (for migration testing)

**File**: `tests/fixtures/legacy-swiper-card.yaml`
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

**File**: `tests/fixtures/legacy-accordion-card.yaml`
```yaml
type: custom:accordion-card
expand_mode: single
style: bordered
header_background: '#1a1a2e'
content_padding: 12
sections:
  - title: Living Room
    icon: mdi:sofa
    default_expanded: true
    cards:
      - type: button
        entity: light.living_room
  - title: Kitchen
    icon: mdi:food
    cards:
      - type: button
        entity: light.kitchen
```

**File**: `tests/fixtures/legacy-tabs-card.yaml`
```yaml
type: custom:tabs-card
tab_position: top
tab_size: default
default_tab: 0
animation: none
lazy_render: true
tabs:
  - title: Lights
    icon: mdi:lightbulb
    badge: "3"
    count: 5
    cards:
      - type: button
        entity: light.living_room
      - type: entities
        entities:
          - sensor.temperature
```

---

## Success Criteria

| Check | Expected | Status |
|-------|----------|--------|
| `npm run lint` | 0 errors | |
| Stale `custom:swiper-card` refs | Only in migration code | |
| Stale `custom:accordion-card` refs | Only in migration code | |
| Stale `custom:tabs-card` refs | Only in migration code | |
| `npm run test:unit` | All pass | |
| Carousel E2E | All pass | |
| Accordion E2E | All pass | |
| Tabs E2E | All pass | |
| Popup E2E | All pass | |
| `npm run test:e2e` (full) | All pass | |
| `npm run test:integration` | All pass | |
| Upstream YAML import → export round-trip | Lossless for all card types | |
| Legacy YAML migration | Correct conversion for all card types | |

---

## Failure Handling

Follow `ai_rules.md` §5 strictly:

1. After **one** test run, pause.
2. List all errors/failures (by test + file path).
3. Provide diagnosis and proposed resolution.
4. Ask the user whether to proceed with fixes and/or another test run.

Do NOT attempt to fix and re-run in a loop without user confirmation.

---

## Reporting

After all tests pass, produce a summary report:

```
## HACS Card Alignment — Regression Report

### Environment
- Branch: refactor/hacs-card-alignment
- Date: YYYY-MM-DD
- Node: vX.Y.Z

### Results
- Lint: PASS (0 errors, N warnings)
- Unit tests: X/X passed
- E2E tests: X/X passed
- Integration tests: X/X passed
- Stale references: CLEAN (only in migration code)

### Card Type Mapping (Final)
| Old Type | New Type | Source |
|----------|----------|--------|
| custom:swiper-card | custom:swipe-card | hacs |
| custom:accordion-card | custom:expander-card | hacs |
| custom:tabs-card | custom:tabbed-card | hacs |
| custom:popup-card | custom:popup-card | custom (HAVDM-only) |

### YAML Round-Trip: PASS
### Legacy Migration: PASS
```
