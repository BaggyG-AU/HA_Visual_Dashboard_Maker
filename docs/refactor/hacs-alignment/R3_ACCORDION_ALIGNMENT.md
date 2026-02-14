# R3: Accordion Alignment — `custom:accordion-card` → `custom:expander-card`

## Mandatory Pre-Reading

1. `ai_rules.md` (highest priority; immutable)
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md`

**Tripwire phrase (quote exactly):** "The fastest correct fix is already in the repository."

---

## Objective

Rename `custom:accordion-card` to `custom:expander-card` and restructure from a multi-section model to a single-section-per-card model that matches the upstream Alia5/lovelace-expander-card HACS card.

**This is the most complex refactor phase** because it changes the fundamental data model: from one card containing N sections to one card = one collapsible section (users nest multiple expander-cards in a vertical-stack for multi-section behavior).

---

## Upstream HACS Card Schema: `custom:expander-card`

### Top-Level Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `string` | — | Must be `custom:expander-card` |
| `title` | `string` | — | Text shown in the header |
| `title-card` | `Card` | — | Full HA card config to render as header (overrides `title`) |
| `title-card-button-overlay` | `boolean` | `false` | Overlay expand button on the title-card |
| `cards` | `Card[]` | `[]` | Child cards shown when expanded |
| `expanded` | `boolean` | `false` | Whether section is expanded by default |
| `expanded-icon` | `string` | `mdi:chevron-up` | MDI icon shown when expanded |
| `collapsed-icon` | `string` | `mdi:chevron-down` | MDI icon shown when collapsed |
| `gap` | `string` | `0.6em` | Gap between header and content |
| `padding` | `string` | `0` | Content area padding |
| `clear` | `boolean` | `false` | Clear content area float |
| `overlay-margin` | `string` | `2em` | Margin for overlay button |
| `child-padding` | `string` | — | Padding applied to each child card |
| `button-background` | `string` | — | CSS color for expand/collapse button background |

### Upstream YAML Examples

**Basic (text title):**
```yaml
type: custom:expander-card
title: Living Room Controls
expanded: true
cards:
  - type: button
    entity: light.living_room
  - type: entities
    entities:
      - sensor.temperature
      - sensor.humidity
```

**With title-card:**
```yaml
type: custom:expander-card
title-card:
  type: entities
  entities:
    - light.living_room
title-card-button-overlay: true
gap: 0.6em
padding: 0
cards:
  - type: button
    entity: switch.tv
  - type: entities
    entities:
      - sensor.temperature
```

**Multi-section (multiple expander-cards in a stack):**
```yaml
type: vertical-stack
cards:
  - type: custom:expander-card
    title: Living Room
    expanded: true
    cards:
      - type: button
        entity: light.living_room
  - type: custom:expander-card
    title: Kitchen
    cards:
      - type: button
        entity: light.kitchen
  - type: custom:expander-card
    title: Bedroom
    cards:
      - type: button
        entity: light.bedroom
```

**Nested expander-cards:**
```yaml
type: custom:expander-card
title: Home
expanded: true
cards:
  - type: custom:expander-card
    title: Living Room
    cards:
      - type: button
        entity: light.living_room
  - type: custom:expander-card
    title: Kitchen
    cards:
      - type: button
        entity: light.kitchen
```

---

## Current HAVDM Implementation (What Exists Today)

### Type string: `custom:accordion-card`

### Multi-section model with `sections[]` array:
```yaml
type: custom:accordion-card
expand_mode: single   # 'single' | 'multi'
style: bordered        # 'bordered' | 'borderless' | 'ghost'
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

### HAVDM-Only Features (NOT in upstream):
- `expand_mode: 'single' | 'multi'` — upstream doesn't have this; each expander-card is independent
- `style: 'bordered' | 'borderless' | 'ghost'` — Ant Design styling modes
- `header_background` — upstream uses `button-background` differently
- `content_padding` — upstream uses `padding` (string with CSS units, not number)
- `sections[]` array — upstream has no sections concept; one card = one section
- `sections[].icon` — upstream uses `expanded-icon`/`collapsed-icon` (toggle icons, not section icons)
- `_accordionDepth` — internal nesting tracker

---

## Refactor Strategy

### Data Model Change

**BEFORE (HAVDM):** One `custom:accordion-card` contains N sections.
**AFTER (Upstream):** One `custom:expander-card` = one collapsible section. N sections = N expander-cards in a `vertical-stack`.

### Editor UX Approach

The HAVDM editor will present a **grouped editing experience**: when the user adds an "Expander Group" from the palette, it creates a `vertical-stack` containing one `custom:expander-card`. The "Add Section" button adds another `custom:expander-card` to the stack. This gives users the same multi-section UX but the YAML output matches upstream.

The card palette entry changes from "Accordion" → "Expander Card" with `source: 'hacs'`.

---

## Files to Modify

### 1. Type Definitions
**File**: `src/features/accordion/types.ts`

**Replace entire file with:**

```typescript
import type { Card } from '../../types/dashboard';

export interface ExpanderCardConfig {
  type: 'custom:expander-card';
  title?: string;
  'title-card'?: Card;
  'title-card-button-overlay'?: boolean;
  cards?: Card[];
  expanded?: boolean;
  'expanded-icon'?: string;
  'collapsed-icon'?: string;
  gap?: string;
  padding?: string;
  clear?: boolean;
  'overlay-margin'?: string;
  'child-padding'?: string;
  'button-background'?: string;
}

export interface NormalizedExpanderConfig {
  title: string;
  titleCard?: Card;
  titleCardButtonOverlay: boolean;
  cards: Card[];
  expanded: boolean;
  expandedIcon: string;
  collapsedIcon: string;
  gap: string;
  padding: string;
  clear: boolean;
  overlayMargin: string;
  childPadding: string;
  buttonBackground?: string;
}
```

### 2. Service Layer
**File**: `src/features/accordion/accordionService.ts`

**Rewrite to match single-section model:**
- `normalizeExpanderConfig(card: ExpanderCardConfig): NormalizedExpanderConfig`
- Remove `normalizeAccordionConfig`, `getDefaultExpandedSections`, `toggleAccordionSection`, `setAllSectionsExpanded`
- Remove multi-section logic (ensureValidDefaultExpansion, normalizeSection)
- Keep `getAccordionNestingDepth` → rename to `getExpanderNestingDepth` (check `'custom:expander-card'`)
- Keep `validateAccordionNestingDepth` → rename to `validateExpanderNestingDepth`
- Keep `MAX_ACCORDION_DEPTH` → rename to `MAX_EXPANDER_DEPTH`

### 3. Component
**File**: `src/features/accordion/AccordionPanel.tsx`

**Rename to `ExpanderPanel.tsx` and restructure:**
- Single collapsible section (no sections loop)
- Header: render `title-card` if present, otherwise text title
- Expand/collapse with `expanded-icon`/`collapsed-icon`
- Apply `gap`, `padding`, `clear`, `overlay-margin`, `child-padding`, `button-background`
- Remove Ant Design Collapse dependency; use simple div + CSS transition
- Keep accessibility: `aria-expanded`, keyboard Enter/Space

### 4. Card Renderer
**File**: `src/components/cards/AccordionCardRenderer.tsx`

**Rename to `ExpanderCardRenderer.tsx`:**
- Update imports to reference new types and component names
- Update type check from `'custom:accordion-card'` to `'custom:expander-card'`

### 5. Card Registry
**File**: `src/services/cardRegistry.ts` (line ~326)

**Changes:**
```typescript
// BEFORE:
{
  type: 'custom:accordion-card',
  name: 'Accordion',
  source: 'custom',
  defaultProps: {
    expand_mode: 'single',
    style: 'bordered',
    sections: [{ title: 'Section 1', ... }],
  },
  requiredProps: ['sections'],
}

// AFTER:
{
  type: 'custom:expander-card',
  name: 'Expander Card',
  source: 'hacs',
  defaultProps: {
    title: 'Section 1',
    expanded: false,
    cards: [],
  },
  requiredProps: ['cards'],
}
```

### 6. BaseCard
**File**: `src/components/BaseCard.tsx` (line ~257)

**Changes:**
```typescript
// BEFORE:
case 'custom:accordion-card':

// AFTER:
case 'custom:expander-card':
```
- Update import of renderer component name

### 7. PropertiesPanel
**File**: `src/components/PropertiesPanel.tsx`

**Changes (extensive — accordion has ~600 lines of form UI):**
- Replace all `'custom:accordion-card'` with `'custom:expander-card'`
- Lines: ~603, ~1105, ~1115, ~1134, ~2460, ~3179, ~4369
- Remove multi-section management UI (add section, remove section, section list)
- Replace with single-section properties: title, title-card toggle, expanded, icons, gap, padding, etc.
- Remove `expand_mode` and `style` dropdowns

### 8. JSON Schema
**File**: `src/schemas/ha-dashboard-schema.json` (line ~190)

**Changes:**
- Replace `"custom:accordion-card"` with `"custom:expander-card"` in type enum
- Update property definitions to match upstream schema

### 9. Unit Tests
**File**: `tests/unit/accordion-service.spec.ts`

**Rewrite completely:**
- Replace all `'custom:accordion-card'` with `'custom:expander-card'`
- Remove multi-section test cases
- Add single-section normalization tests
- Add title-card tests
- Add nesting depth tests (using new function names)

### 10. E2E Tests
**Files:**
- `tests/e2e/accordion.spec.ts` — Rewrite BASE_YAML to upstream format, update all assertions
- `tests/e2e/accordion.visual.spec.ts` — Update BASE_YAML

### 11. DSL
**File**: `tests/support/dsl/accordion.ts`

**Changes:**
- Update palette search from `'custom:accordion-card'` to `'custom:expander-card'`
- Remove multi-section DSL methods (addSection, removeSection, getSectionCount)
- Add single-section DSL methods (setTitle, toggleExpanded, setTitleCard)

---

## Validation

The executing agent must run all three test levels after implementing changes. Follow `ai_rules.md` §5 for test execution and reporting policy.

1. **Lint**: `npm run lint`
2. **Unit tests**: `npm run test:unit -- --grep expander`
3. **Targeted E2E tests**: `npx playwright test tests/e2e/accordion.spec.ts tests/e2e/accordion.visual.spec.ts --project=electron-e2e`

After one test run, pause → diagnose any failures → report results to the user before proceeding (per ai_rules §5).

Full regression and CI testing are handled separately and are not part of this phase.

---

## YAML Round-Trip Test Cases

### Import Test (upstream → HAVDM):
```yaml
# Input:
type: custom:expander-card
title: My Section
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
```

Expected normalized config:
- `title`: 'My Section'
- `expanded`: true
- `gap`: '1em'
- `padding`: '8px'
- `expandedIcon`: 'mdi:chevron-up'
- `collapsedIcon`: 'mdi:chevron-down'
- `buttonBackground`: 'rgba(0,0,0,0.3)'
- `cards`: 2 cards

### Import Test (title-card variant):
```yaml
type: custom:expander-card
title-card:
  type: entities
  entities:
    - light.living_room
title-card-button-overlay: true
cards:
  - type: button
    entity: switch.tv
```

Expected normalized config:
- `title`: '' (empty, title-card takes precedence)
- `titleCard`: { type: 'entities', entities: [...] }
- `titleCardButtonOverlay`: true

### Export Test:
Internal config should serialize back to upstream format exactly.

---

## Key Risk: Multi-Section Migration

If any existing saved dashboard files contain `custom:accordion-card` with `sections[]`, the import service (R7) must handle migration:

```yaml
# Old HAVDM format:
type: custom:accordion-card
expand_mode: single
sections:
  - title: Section 1
    cards: [...]
  - title: Section 2
    cards: [...]

# Converted to upstream format:
type: vertical-stack
cards:
  - type: custom:expander-card
    title: Section 1
    expanded: true   # first section gets expanded=true
    cards: [...]
  - type: custom:expander-card
    title: Section 2
    cards: [...]
```

This migration logic should be placed in the import/export service (R7), not in the accordion code itself. For R3, focus on making the new `custom:expander-card` implementation work. R7 will handle backward compatibility.
