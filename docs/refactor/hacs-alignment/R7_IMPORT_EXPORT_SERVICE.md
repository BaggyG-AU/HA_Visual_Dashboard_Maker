# R7: Import/Export Conversion Service — `yamlConversionService.ts`

## Mandatory Pre-Reading

1. `ai_rules.md` (highest priority; immutable)
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md`

**Tripwire phrase (quote exactly):** "The fastest correct fix is already in the repository."

---

## Objective

Create a centralized YAML conversion service that handles bidirectional conversion between upstream HACS card YAML and HAVDM's internal normalized format. This service is the bridge that makes HAVDM dashboards export valid Home Assistant YAML while keeping HAVDM-only editor features internally.

**Dependencies**: R2, R3, R4 must be complete before R7 (the conversion service needs the final type shapes from each card alignment).

---

## Architecture

### New File: `src/services/yamlConversionService.ts`

### Public API

```typescript
/**
 * Convert a single card from upstream HACS/HA YAML format to HAVDM internal format.
 * Called when importing/loading a dashboard YAML file.
 */
export function importCard(card: Record<string, unknown>): Record<string, unknown>;

/**
 * Convert a single card from HAVDM internal format to upstream HACS/HA YAML format.
 * Called when exporting a dashboard for use in Home Assistant.
 */
export function exportCard(card: Record<string, unknown>): Record<string, unknown>;

/**
 * Convert a legacy HAVDM card (pre-alignment format) to the new upstream-aligned format.
 * Called when loading old saved dashboards.
 */
export function migrateLegacyCard(card: Record<string, unknown>): Record<string, unknown>;

/**
 * Recursively process all cards in a full dashboard YAML for import.
 */
export function importDashboard(dashboard: Record<string, unknown>): Record<string, unknown>;

/**
 * Recursively process all cards in a full dashboard YAML for export.
 */
export function exportDashboard(dashboard: Record<string, unknown>): Record<string, unknown>;
```

---

## Conversion Rules by Card Type

### Swipe Card (`custom:swipe-card`)

**Import (upstream → HAVDM internal):**
| Upstream Property | Internal Property | Notes |
|-------------------|-------------------|-------|
| `parameters.slidesPerView` | `slides_per_view` | camelCase → snake_case |
| `parameters.spaceBetween` | `space_between` | camelCase → snake_case |
| `parameters.centeredSlides` | `centered_slides` | camelCase → snake_case |
| `parameters.freeMode` | `free_mode` | camelCase → snake_case |
| `parameters.autoplay.delay` | `autoplay.delay` | Flatten from parameters |
| `parameters.autoplay.disableOnInteraction` | `autoplay.pause_on_interaction` | Rename |
| `parameters.autoplay.stopOnLastSlide` | `autoplay.stop_on_last_slide` | Rename |
| `parameters.pagination` | `pagination` | Flatten from parameters |
| `parameters.navigation` | `navigation` | Flatten from parameters |
| `parameters.effect` | `effect` | Flatten from parameters |
| `parameters.loop` | `loop` | Flatten from parameters |
| `parameters.direction` | `direction` | Flatten from parameters |
| `parameters.speed` | `speed` | Flatten from parameters |
| `start_card` | — | Store internally (1-indexed) |
| `reset_after` | — | Store internally |
| `cards` | `cards` + generate `slides[]` | Each card → one slide |

**Export (HAVDM internal → upstream):**
- Reverse all import mappings
- Wrap snake_case properties into `parameters` object (camelCase)
- Convert `slides[]` back to flat `cards[]`
- Strip HAVDM-only: `slides[].background`, `slides[].alignment`, `slides[].autoplay_delay`, `slides[].skip_navigation`
- Convert `autoplay.enabled: false` → omit `autoplay` entirely

### Expander Card (`custom:expander-card`)

**Import (upstream → HAVDM internal):**
| Upstream Property | Internal Property | Notes |
|-------------------|-------------------|-------|
| `title` | `title` | Direct |
| `title-card` | `titleCard` | kebab-case → camelCase |
| `title-card-button-overlay` | `titleCardButtonOverlay` | kebab-case → camelCase |
| `cards` | `cards` | Direct |
| `expanded` | `expanded` | Direct |
| `expanded-icon` | `expandedIcon` | kebab-case → camelCase |
| `collapsed-icon` | `collapsedIcon` | kebab-case → camelCase |
| `gap` | `gap` | Direct |
| `padding` | `padding` | Direct |
| `clear` | `clear` | Direct |
| `overlay-margin` | `overlayMargin` | kebab-case → camelCase |
| `child-padding` | `childPadding` | kebab-case → camelCase |
| `button-background` | `buttonBackground` | kebab-case → camelCase |

**Export (HAVDM internal → upstream):**
- Reverse all camelCase → kebab-case
- Strip HAVDM-only: `_expanderDepth` (if present)

### Tabbed Card (`custom:tabbed-card`)

**Import (upstream → HAVDM internal):**
| Upstream Property | Internal Property | Notes |
|-------------------|-------------------|-------|
| `options.defaultTabIndex` | `default_tab` | Restructure |
| `tabs[].attributes.label` | `tabs[].title` | Flatten |
| `tabs[].attributes.icon` | `tabs[].icon` | Flatten |
| `tabs[].card` (singular) | `tabs[].cards[]` (array) | Wrap in array |
| `styles` | — | Store as `_havdm_styles` (pass-through) |
| `attributes` | — | Store global defaults, merge into tabs |

**Export (HAVDM internal → upstream):**
- `default_tab` → `options.defaultTabIndex`
- `tabs[].title` → `tabs[].attributes.label`
- `tabs[].icon` → `tabs[].attributes.icon`
- `tabs[].cards[]` (if 1 card) → `tabs[].card` (singular)
- `tabs[].cards[]` (if N cards) → `tabs[].card: { type: 'vertical-stack', cards: [...] }`
- Strip HAVDM-only: `tab_position`, `tab_size`, `animation`, `lazy_render`, `badge`, `count`

### Popup Card (`custom:popup-card`)

**Export only** — add warning comment:
```yaml
# WARNING: custom:popup-card is a HAVDM editor feature.
# This card will not render in Home Assistant without the HAVDM runtime.
# Consider using browser_mod popup or Bubble Card pop-up for HA-native popups.
```

No import conversion needed (HAVDM-only card).

---

## Legacy Migration Rules

When `migrateLegacyCard()` encounters old HAVDM format:

### `custom:swiper-card` → `custom:swipe-card`
- Change type string
- Properties that were flat (snake_case) stay flat internally
- The normalizer already handles both formats

### `custom:accordion-card` → `custom:expander-card`
- Change type string
- Convert multi-section model to stack of single-section cards:
  ```
  { type: 'custom:accordion-card', sections: [A, B, C] }
  →
  { type: 'vertical-stack', cards: [
    { type: 'custom:expander-card', title: A.title, expanded: true, cards: A.cards },
    { type: 'custom:expander-card', title: B.title, cards: B.cards },
    { type: 'custom:expander-card', title: C.title, cards: C.cards },
  ]}
  ```
- First section gets `expanded: true` by default

### `custom:tabs-card` → `custom:tabbed-card`
- Change type string
- `tabs[].title` → keep as-is (normalizer handles both formats)
- `tabs[].cards[]` → keep as-is (normalizer wraps to singular on export)

---

## Recursive Card Processing

The `importDashboard` and `exportDashboard` functions must recursively process cards in containers:

```typescript
function processCardsRecursively(
  cards: Record<string, unknown>[],
  processor: (card: Record<string, unknown>) => Record<string, unknown>
): Record<string, unknown>[] {
  return cards.map(card => {
    const processed = processor(card);

    // Recurse into container card types
    if (processed.cards && Array.isArray(processed.cards)) {
      processed.cards = processCardsRecursively(processed.cards, processor);
    }
    if (processed.card && typeof processed.card === 'object') {
      processed.card = processor(processed.card as Record<string, unknown>);
      // Also recurse into the singular card's children
      if ((processed.card as any).cards) {
        (processed.card as any).cards = processCardsRecursively(
          (processed.card as any).cards, processor
        );
      }
    }

    return processed;
  });
}
```

Container types that have nested cards:
- `vertical-stack` → `cards[]`
- `horizontal-stack` → `cards[]`
- `grid` → `cards[]`
- `custom:swipe-card` → `cards[]`
- `custom:expander-card` → `cards[]`
- `custom:tabbed-card` → `tabs[].card`
- `custom:popup-card` → `popup.cards[]`
- `conditional` → `card` or `cards[]`

---

## Unknown Property Passthrough

For forward compatibility, the conversion service must NOT strip unknown properties. If a card has properties the service doesn't recognize, they must be passed through unchanged. This ensures:
- New HACS card properties added after our alignment still work
- Custom CSS, `card_mod`, and other HA ecosystem integrations are preserved
- User-added YAML properties are not silently deleted

Implementation: use spread operator for passthrough:
```typescript
function exportSwipeCard(card: Record<string, unknown>): Record<string, unknown> {
  const { slides_per_view, space_between, /* known props */ ...rest } = card;
  return {
    ...rest,  // passthrough unknowns
    type: 'custom:swipe-card',
    parameters: { slidesPerView: slides_per_view, /* ... */ },
  };
}
```

---

## Files to Create/Modify

### 1. New Service
**File**: `src/services/yamlConversionService.ts`
- All public API functions listed above
- Internal conversion functions per card type
- Recursive card processing
- Unknown property passthrough

### 2. Unit Tests
**File**: `tests/unit/yaml-conversion-service.spec.ts`
- Import round-trip tests for each card type
- Export round-trip tests for each card type
- Legacy migration tests
- Recursive processing tests (nested containers)
- Unknown property passthrough tests
- Edge cases: empty cards array, missing optional properties, null values

### 3. Integration Points
**File**: Wherever dashboard YAML is loaded/saved (likely `src/services/dashboardService.ts` or similar)
- Wire `importDashboard()` into the load/open path
- Wire `exportDashboard()` into the save/export path
- Wire `migrateLegacyCard()` into the load path (detect legacy format, auto-migrate)

---

## Validation

The executing agent must run all three test levels after implementing changes. Follow `ai_rules.md` §5 for test execution and reporting policy.

1. **Lint**: `npm run lint`
2. **Unit tests**: `npm run test:unit -- --grep "yaml conversion"`
3. **Targeted E2E tests**: Run any E2E tests that exercise YAML import/export (e.g., dashboard load/save specs)

After one test run, pause → diagnose any failures → report results to the user before proceeding (per ai_rules §5).

Full regression and CI testing are handled separately and are not part of this phase.

---

## YAML Round-Trip Verification

For each card type, verify: `exportCard(importCard(upstreamYAML)) === upstreamYAML`

Also verify: `importCard(exportCard(internalConfig))` produces equivalent internal config.

This ensures no data loss or corruption during conversion in either direction.
