# Prompt: Deliver Feature 4.2 — Accordion Card Module

## Context

You are an AI assistant implementing **Feature 4.2: Accordion Card Module** for the HA Visual Dashboard Maker (Electron + React + TypeScript). This is part of **Phase 4: Layout Infrastructure Layer**. Your task is to deliver the feature end-to-end following project standards and architecture.

**Phase 4 is independent** (no dependencies on prior phases), but must follow established patterns in code and testing.

**Mandatory tripwire phrase (quote exactly in your response):** "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading (in this order)

Read these files BEFORE writing any code. They contain immutable rules, architecture patterns, and hard-won lessons from prior regressions:

1. `ai_rules.md` — **highest priority; immutable**. Pay special attention to:
   - **Rule 1**: Reuse existing patterns before inventing new ones
   - **Rule 7**: Immutable state updates (React + Zustand)
   - **Rule 8 (8a-8e)**: React Component Stability Rules — Ant Design Integration. **CRITICAL**: These rules prevent the exact class of regression that broke 17 E2E tests. You MUST follow Rules 8a-8e when writing any component that renders inside PropertiesPanel Tabs or uses Ant Design Popover/Modal.
   - **Rule 9**: Git feature workflow
2. `docs/testing/TESTING_STANDARDS.md` — DSL-first testing, Standard #29 (Product Code Testability)
3. `docs/testing/PLAYWRIGHT_TESTING.md` — Troubleshooting, especially "PropertiesPanel Child Components Losing State"
4. `docs/architecture/ARCHITECTURE.md` — Project structure and patterns
5. `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md` — Feature 4.2 spec (lines 226-376)

---

## Reference Implementation: Feature 4.1 (Swiper Carousel)

Feature 4.1 was delivered successfully and establishes the pattern you MUST follow. Study these files:

| Purpose | File |
|---------|------|
| **Types** | `src/features/carousel/types.ts` |
| **Service** | `src/features/carousel/carouselService.ts` |
| **Feature component** | `src/features/carousel/SwiperCarousel.tsx` |
| **Card renderer** | `src/components/cards/SwiperCardRenderer.tsx` |
| **Card registry entry** | `src/services/cardRegistry.ts` (search `custom:swiper-card`) |
| **BaseCard dispatch** | `src/components/BaseCard.tsx` (search `swiper-card`) |
| **DSL** | `tests/support/dsl/carousel.ts` |
| **DSL registration** | `tests/support/index.ts` |
| **E2E tests** | `tests/e2e/carousel.spec.ts`, `tests/e2e/carousel.visual.spec.ts` |
| **Unit tests** | `tests/unit/carousel-service.spec.ts` |

Follow the same structure, naming conventions, and integration points exactly.

---

## Feature 4.2 Overview

**Goal**: Add an accordion/collapsible sections card type that acts as a container for existing card types, organizing content into expandable/collapsible sections.

**Branch**: `feature/layout-infrastructure-layer` (already exists — work on this branch)
**Version Target**: v0.7.4-beta.2
**Dependencies**: None
**Estimated Effort**: 3-4 days
**Status**: Ready to Begin

### Key Requirements

- **Accordion as a container** that renders existing cards inside collapsible sections
- Collapsible section headers with click-to-expand/collapse
- Smooth CSS transitions for expand/collapse (max-height + opacity)
- **Expand modes**:
  - Single-expand (only one section open at a time — like a true accordion)
  - Multi-expand (multiple sections can be open simultaneously)
- Default expanded sections (configurable per section)
- Custom header content (title text, MDI icon, optional entity state badge)
- Expand/collapse chevron indicator with rotation animation
- **Styling modes**: bordered, borderless, ghost (transparent headers)
- Custom header background color and content padding
- Nested accordion support (up to 3 levels deep)
- Collapse/expand all toggle
- Each section holds child cards via existing `BaseCard` rendering pattern

---

## Implementation Targets

### Code Organization (mirror Feature 4.1 pattern)

| Purpose | Path |
|---------|------|
| Types | `src/features/accordion/types.ts` |
| Service | `src/features/accordion/accordionService.ts` |
| Feature component | `src/features/accordion/AccordionPanel.tsx` |
| Card renderer | `src/components/cards/AccordionCardRenderer.tsx` |
| Card registry | Add entry in `src/services/cardRegistry.ts` |
| BaseCard dispatch | Add case in `src/components/BaseCard.tsx` |
| PropertiesPanel | Add accordion-specific controls in `src/components/PropertiesPanel.tsx` |

### YAML Schema

Register as `custom:accordion-card` in the card registry. Example YAML:

```yaml
type: custom:accordion-card
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

Update `ha-dashboard-schema.json` with the accordion card schema.

### Card Registry Entry

Follow the existing pattern in `src/services/cardRegistry.ts`:

```typescript
{
  type: 'custom:accordion-card',
  name: 'Accordion',
  category: 'layout',
  icon: 'MenuFoldOutlined',  // or appropriate Ant Design icon
  description: 'Collapsible sections container for organizing cards',
  isCustom: true,
  source: 'custom',
  defaultProps: {
    expand_mode: 'single',
    style: 'bordered',
    sections: [
      { title: 'Section 1', default_expanded: true, cards: [] },
    ],
  },
  requiredProps: ['sections'],
}
```

---

## Critical: PropertiesPanel Integration Rules

When adding accordion-specific controls to `PropertiesPanel.tsx`, you **MUST** follow `ai_rules.md` Rule 8:

1. **Do NOT add full object references (like `card`) to the `tabItems` useMemo dependency array.** Only use structural deps like `card?.type`. Form.Item values flow through Ant Design Form's internal context. (Rule 8a, 8c)

2. **If adding any Popover-based controls** (color pickers, etc.) inside the accordion properties, ensure popover content is memoized with `useMemo`. (Rule 8e)

3. **All hooks must be declared before any early returns.** (Rule 8d)

4. **Use `cardRef.current`** (the existing ref pattern in PropertiesPanel) when reading card data inside callbacks. Do NOT use the `card` prop directly in `useCallback` or `useMemo` handlers. (Rule 8c)

---

## Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Accordion renders with collapsible sections
- [ ] Click header to expand/collapse works
- [ ] Single-expand and multi-expand modes work
- [ ] Child cards render correctly within sections via BaseCard
- [ ] Smooth expand/collapse CSS transitions
- [ ] Keyboard navigation works (Enter/Space toggle, Arrow keys between headers, Home/End)
- [ ] YAML round-trip serialization preserves all config
- [ ] PropertiesPanel controls update live preview
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Nested accordion support (up to 3 levels)
- [ ] Custom header icons (MDI)
- [ ] Multiple style modes (bordered, borderless, ghost)
- [ ] Collapse/expand all toggle
- [ ] Default expanded sections configuration

**Won't Have (Out of Scope)**:
- [ ] Drag-and-drop to reorder sections at runtime
- [ ] Animated section reordering
- [ ] Accordion within carousel slides (complex cross-container nesting)

---

## Testing Requirements

### Unit Tests

Create `tests/unit/accordion-service.spec.ts`:
- Configuration parsing and validation
- Expand mode logic (single vs multi)
- Section normalization
- Nesting depth validation (max 3 levels)
- Default expanded sections logic

### E2E Tests (DSL-first only)

Create `tests/support/dsl/accordion.ts` (`AccordionDSL`):
- `addAccordionCard()` — add from card palette
- `clickSectionHeader(index)` — toggle expand/collapse
- `expectSectionExpanded(index)` / `expectSectionCollapsed(index)`
- `expectSectionCount(count)`
- `setSectionTitle(index, title)`
- `setExpandMode(mode: 'single' | 'multi')`
- `collapseAll()` / `expandAll()`
- Keyboard helpers: `navigateToHeader(index)`, `toggleViaKeyboard()`

Register `AccordionDSL` in `tests/support/index.ts` (add import, interface field, and instantiation — follow `CarouselDSL` pattern exactly).

Create `tests/e2e/accordion.spec.ts`:
- Add accordion card from palette
- Click section header to expand/collapse
- Single-expand mode only allows one open section
- Multi-expand mode allows multiple open sections
- Default expanded sections open on load
- YAML round-trip serialization
- Keyboard navigation (Enter/Space, Arrow keys, Home/End)
- PropertiesPanel controls update accordion live

Create `tests/e2e/accordion.visual.spec.ts`:
- Visual snapshots: expanded, collapsed, bordered, borderless, ghost styles

### Accessibility

- `role="heading"` with appropriate `aria-level` for section headers
- `aria-expanded` on section headers (true/false)
- `aria-controls` linking header to content panel
- `role="region"` for content panels
- `aria-labelledby` on content panels referencing header
- Keyboard: Enter/Space toggles, Arrow keys navigate headers, Home/End jump to first/last
- Respect `prefers-reduced-motion` (disable expand/collapse animations)

---

## Guardrails and Standards

- **E2E specs: DSL-first only** — no raw selectors, no sleeps, no timing hacks in spec files.
- **Use existing DSL patterns** (`tests/support/dsl/carousel.ts` is the reference).
- **`ai_rules.md` Rule 5**: One test run → pause → diagnose → ask workflow.
- **`ai_rules.md` Rule 4a**: If modifying shared DSL methods, run blast-radius check.
- **Architecture**: Feature code in `src/features/accordion/`, renderer in `src/components/cards/`.
- **Immutable state**: All state updates use spread/map/filter patterns (Rule 7).
- **Ant Design integration**: Follow Rule 8 for all component code touching Tabs, Popover, or Form.
- **Best practice UI/UX**: Smooth 200-300ms transitions, clear visual affordances for expand/collapse state, consistent with Ant Design dark theme styling used throughout the app.

---

## Clarifying Questions (ask before coding)

1. Should sections support entity state badges in headers (e.g., showing a light count or temperature)?
2. Should the "collapse all / expand all" be a button in PropertiesPanel only, or also rendered on the card itself?
3. Should accordion inherit card background styling, or use its own independent background?
4. Are there any specific MDI icons preferred for the default accordion section headers?

---

## Deliverables

1. **Product Code**
   - Accordion types, service, component, renderer
   - Card registry entry + BaseCard dispatch
   - PropertiesPanel integration
2. **YAML Schema**
   - Update `ha-dashboard-schema.json`
3. **Tests**
   - Unit tests (accordion service)
   - AccordionDSL + DSL registration
   - E2E tests (accordion.spec.ts)
   - Visual regression tests (accordion.visual.spec.ts)
4. **Documentation**
   - Update Feature 4.2 checklist in `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`

---

## Output Format

Respond with:
1. A concise implementation plan for Feature 4.2
2. File-by-file change list (planned)
3. Test plan + commands
4. Open questions or risks

Remember: include the mandatory tripwire phrase verbatim.
