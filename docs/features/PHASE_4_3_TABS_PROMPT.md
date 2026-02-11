# Prompt: Deliver Feature 4.3 - Tabs Card Module

## Context

You are an AI assistant implementing **Feature 4.3: Tabs Card Module** for the HA Visual Dashboard Maker (Electron + React + TypeScript). This is part of **Phase 4: Layout Infrastructure Layer**. Your task is to deliver the feature end-to-end following project standards and architecture.

**Phase 4 is independent** (no dependencies on prior phases), but must follow established patterns in code and testing.

**Versioning convention**: `v0.7.<phase>-beta.<feature>`
**Version target for this work**: `v0.7.4-beta.3` (Phase 4, Feature 3)

**Mandatory tripwire phrase (quote exactly in your response):** "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading (in this order)

Read these files BEFORE writing any code. They contain immutable rules, architecture patterns, and hard-won lessons from prior regressions:

1. `ai_rules.md` - **highest priority; immutable**. Pay special attention to:
   - **Rule 1**: Reuse existing patterns before inventing new ones
   - **Rule 4a**: Shared DSL blast-radius checks when shared helpers change
   - **Rule 5**: One test run -> pause -> diagnose -> ask workflow
   - **Rule 7**: Immutable state updates (React + Zustand)
   - **Rule 8 (8a-8e)**: React Component Stability Rules - Ant Design Integration (**CRITICAL**)
   - **Rule 9**: Git feature workflow
2. `docs/testing/TESTING_STANDARDS.md` - DSL-first testing, testability requirements
3. `docs/testing/PLAYWRIGHT_TESTING.md` - Troubleshooting and reliable Electron waits
4. `docs/architecture/ARCHITECTURE.md` - Project structure and integration patterns
5. `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md` - Feature 4.3 spec and checklist
6. `docs/features/PHASE_4_2_ACCORDION_PROMPT.md` - reference prompt format and standards framing

---

## Reference Implementations (must reuse patterns)

Follow the same structure, naming conventions, and integration points used by delivered layout features:

| Purpose | File |
|---------|------|
| Accordion types | `src/features/accordion/types.ts` |
| Accordion service | `src/features/accordion/accordionService.ts` |
| Accordion feature component | `src/features/accordion/AccordionPanel.tsx` |
| Accordion renderer | `src/components/cards/AccordionCardRenderer.tsx` |
| Swiper types | `src/features/carousel/types.ts` |
| Swiper service | `src/features/carousel/carouselService.ts` |
| Swiper renderer | `src/components/cards/SwiperCardRenderer.tsx` |
| Card registry pattern | `src/services/cardRegistry.ts` |
| BaseCard dispatch pattern | `src/components/BaseCard.tsx` |
| DSL registration | `tests/support/index.ts` |
| Existing layout DSL style | `tests/support/dsl/carousel.ts`, `tests/support/dsl/accordion.ts` |
| Existing layout E2E style | `tests/e2e/carousel.spec.ts`, `tests/e2e/accordion.spec.ts` |

---

## Feature 4.3 Overview

**Goal**: Add a tabbed container card type that renders existing cards inside tab panels and supports horizontal/vertical orientations.

**Branch**: `feature/layout-infrastructure-layer` (already exists; continue on this branch)
**Version Target**: `v0.7.4-beta.3`
**Dependencies**: None
**Estimated Effort**: 3-4 days
**Status**: Ready to Begin

### Key Requirements

- Tabs as a container that renders existing cards inside tab panels
- Clickable tab headers that switch visible content
- Configurable tab positions: `top`, `bottom`, `left`, `right`
- Configurable tab size: `default`, `small`, `large`
- Default active tab configuration
- Tab labels + optional MDI icons
- Optional tab animation mode (`none`, `fade`, `slide`)
- Optional badge/count labels on tabs (editor-configured text/count)
- Lazy rendering option (render active tab only)
- Each tab panel holds child cards via existing `BaseCard` rendering pattern
- Full keyboard + ARIA tabs pattern compliance

---

## Implementation Targets

### Code Organization

| Purpose | Path |
|---------|------|
| Types | `src/types/tabs.ts` |
| Service | `src/services/tabsService.ts` |
| Feature component | `src/features/tabs/TabsPanel.tsx` |
| Card renderer | `src/components/cards/TabsCardRenderer.tsx` |
| Card registry | Add entry in `src/services/cardRegistry.ts` |
| BaseCard dispatch | Add case in `src/components/BaseCard.tsx` |
| PropertiesPanel | Add tabs-specific controls in `src/components/PropertiesPanel.tsx` |

### YAML Schema

Register as `custom:tabs-card` in card registry. Example YAML:

```yaml
type: custom:tabs-card
tab_position: top
tab_size: default
default_tab: 0
animation: fade
lazy_render: true
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

Update `src/schemas/ha-dashboard-schema.json` with tabs-card schema.

### Card Registry Entry (pattern)

```typescript
{
  type: 'custom:tabs-card',
  name: 'Tabs',
  category: 'layout',
  icon: 'AppstoreOutlined',
  description: 'Tabbed container for organizing cards',
  isCustom: true,
  source: 'custom',
  defaultProps: {
    tab_position: 'top',
    tab_size: 'default',
    default_tab: 0,
    animation: 'none',
    lazy_render: true,
    tabs: [{ title: 'Tab 1', icon: 'mdi:tab', cards: [] }],
  },
  requiredProps: ['tabs'],
}
```

---

## Critical: PropertiesPanel Integration Rules

When adding tabs-specific controls to `PropertiesPanel.tsx`, you **MUST** follow `ai_rules.md` Rule 8:

1. Do NOT add full object references (like `card`) to `tabItems` useMemo dependencies.
2. If adding Popover-based controls, memoize popover content with `useMemo`.
3. All hooks must be declared before early returns.
4. Use `cardRef.current` in callbacks instead of closing over `card`.
5. Preserve Form context behavior (do not force remount tab panes unnecessarily).

---

## Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Tabs render with clickable tab headers
- [ ] Tab switching shows correct content panel
- [ ] Horizontal and vertical orientations work
- [ ] Child cards render correctly within tab panels via BaseCard
- [ ] Keyboard navigation works (arrow keys, Home/End, Enter/Space)
- [ ] YAML round-trip serialization preserves all config
- [ ] PropertiesPanel controls update live preview
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Tab icons with MDI icon picker
- [ ] Tab switch animations (`fade`, `slide`)
- [ ] Default active tab and lazy rendering configuration
- [ ] Tab position and size options
- [ ] Tab badge/count support

**Won't Have (Out of Scope)**:
- [ ] Runtime drag-reorderable tabs
- [ ] Runtime closable tabs
- [ ] Nested tabs inside tabs
- [ ] Overflow scroll/dropdown handling for very large tab counts

---

## Testing Requirements

### Unit Tests

Create `tests/unit/tabs-service.spec.ts`:
- Configuration parsing and validation
- Tab normalization (title/icon defaults)
- Default active tab logic and bounds clamping
- Tab switching reducer logic
- Lazy rendering behavior flags

### E2E Tests (DSL-first only)

Create `tests/support/dsl/tabs.ts` (`TabsDSL`):
- `addTabsCard()`
- `clickTab(index)`
- `expectTabActive(index)`
- `expectTabCount(count)`
- `setTabTitle(index, title)`
- `setTabPosition(position: 'top' | 'bottom' | 'left' | 'right')`
- `setDefaultTab(index)`
- `setAnimation(mode: 'none' | 'fade' | 'slide')`
- keyboard helpers: `navigateToTab(index)`, `activateFocusedTab()`

Register `TabsDSL` in `tests/support/index.ts` (import, interface field, instantiation).

Create `tests/e2e/tabs.spec.ts`:
- Add tabs card from palette
- Click tabs to switch panels
- Position changes (top/bottom/left/right)
- Default active tab on load
- YAML round-trip serialization
- Keyboard navigation behavior
- PropertiesPanel controls update live preview

Create `tests/e2e/tabs.visual.spec.ts`:
- Snapshots for positions, active states, and style variations

### Accessibility

- `role="tablist"` on tabs container
- `role="tab"` per tab trigger
- `role="tabpanel"` per panel
- `aria-selected` on tabs
- `aria-controls` and `aria-labelledby` linkage
- `tabindex=0` on active tab and `-1` on inactive tabs
- Keyboard: arrow keys, Home/End, Enter/Space
- Respect `prefers-reduced-motion` (disable animations)

---

## Guardrails and Standards

- E2E specs: DSL-first only (no raw selectors/sleeps/timing hacks in spec files)
- If shared DSL helpers change, run and document blast-radius verification
- Use immutable updates for all nested tab data changes
- Follow existing layout container patterns (accordion/carousel) before inventing new ones
- Keep UI behavior deterministic under Electron viewport constraints
- Ensure test stability without adding test-only product hacks

---

## Clarifying Questions (ask before coding)

1. Should tab badge/count be plain configured text/number only, or derived from entity/card state?
2. For vertical tabs on narrow widths, should we force fallback to `top`, or keep vertical and allow overflow?
3. Should lazy rendering be enabled by default for performance?
4. Should tab animations default to `none` (stability-first) or `fade` (visual-first)?

---

## Deliverables

1. **Product Code**
   - Tabs types, service, panel component, renderer
   - Card registry entry + BaseCard dispatch
   - PropertiesPanel tabs controls
2. **YAML Schema**
   - Update `src/schemas/ha-dashboard-schema.json`
3. **Tests**
   - Unit tests (`tests/unit/tabs-service.spec.ts`)
   - TabsDSL + registration
   - E2E tests (`tests/e2e/tabs.spec.ts`)
   - Visual tests (`tests/e2e/tabs.visual.spec.ts`)
4. **Documentation**
   - Update Feature 4.3 checklist in `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`
   - Record deferred decisions (if any) explicitly

---

## Output Format

Respond with:
1. A concise implementation plan for Feature 4.3
2. File-by-file change list (planned)
3. Test plan + commands
4. Open questions or risks

Remember: include the mandatory tripwire phrase verbatim.
