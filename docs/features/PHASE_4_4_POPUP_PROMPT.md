# Prompt: Deliver Feature 4.4 - Popup/Modal Card System

## Context

You are an AI assistant implementing **Feature 4.4: Popup/Modal Card System** for the HA Visual Dashboard Maker (Electron + React + TypeScript). This is part of **Phase 4: Layout Infrastructure Layer**. Your task is to deliver the feature end-to-end following project standards and architecture.

**Phase 4 is independent** (no dependencies on prior phases), but must follow established patterns in code and testing.

**Versioning convention**: `v0.7.<phase>-beta.<feature>`
**Version target for this work**: `v0.7.4-beta.4` (Phase 4, Feature 4)

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
5. `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md` - Feature 4.4 spec and checklist
6. `docs/features/PHASE_4_3_TABS_PROMPT.md` - reference prompt format and standards framing

---

## Reference Implementations (must reuse patterns)

Follow the same structure, naming conventions, and integration points used by delivered features:

| Purpose | File |
|---------|------|
| Accordion types | `src/features/accordion/types.ts` |
| Accordion service | `src/features/accordion/accordionService.ts` |
| Accordion renderer | `src/components/cards/AccordionCardRenderer.tsx` |
| Swiper service/types | `src/features/carousel/carouselService.ts`, `src/features/carousel/types.ts` |
| Tabs service/types/panel | `src/services/tabsService.ts`, `src/types/tabs.ts`, `src/features/tabs/TabsPanel.tsx` |
| Tabs renderer | `src/components/cards/TabsCardRenderer.tsx` |
| Card registry pattern | `src/services/cardRegistry.ts` |
| BaseCard dispatch pattern | `src/components/BaseCard.tsx` |
| Action typing baseline | `src/types/dashboard.ts` |
| Smart action baseline | `src/services/smartActions.ts` |
| Existing Ant Design Modal patterns | `src/components/ThemeSettingsDialog.tsx`, `src/components/YamlEditorDialog.tsx`, `src/components/EntityBrowser.tsx` |
| DSL registration | `tests/support/index.ts` |
| Existing DSL style | `tests/support/dsl/accordion.ts`, `tests/support/dsl/carousel.ts`, `tests/support/dsl/tabs.ts` |
| Existing layout E2E style | `tests/e2e/accordion.spec.ts`, `tests/e2e/carousel.spec.ts`, `tests/e2e/tabs.spec.ts` |

---

## Feature 4.4 Overview

**Goal**: Add a popup/modal system that can be triggered from cards (including actions) and render existing cards inside modal content.

**Branch**: `feature/layout-infrastructure-layer` (already exists; continue on this branch)
**Version Target**: `v0.7.4-beta.4`
**Dependencies**: None
**Estimated Effort**: 5-6 days
**Status**: Ready to Begin

### Key Requirements

- Modal container renders existing cards via `BaseCard`
- Trigger popup from `tap_action` on supported cards
- Add standalone `custom:popup-card` trigger card type
- Configurable popup size: `auto`, `small`, `medium`, `large`, `fullscreen`, custom dimensions
- Configurable title/header visibility and styling
- Close via top-right button, ESC, optional backdrop click
- Backdrop opacity configuration
- Optional footer/action row configuration
- Nested popup support with max depth guard (limit 3)
- Deterministic z-index stack behavior for multiple open popups
- Full keyboard + ARIA dialog compliance
- Respect `prefers-reduced-motion`

---

## Implementation Targets

### Code Organization

| Purpose | Path |
|---------|------|
| Popup types | `src/features/popup/types.ts` |
| Popup service/state | `src/features/popup/popupService.ts` |
| Modal component | `src/features/popup/PopupCardModal.tsx` |
| Trigger card renderer | `src/components/cards/PopupTriggerCardRenderer.tsx` |
| Card registry | Add entry in `src/services/cardRegistry.ts` |
| BaseCard dispatch | Add case in `src/components/BaseCard.tsx` |
| Action typing update | Extend `Action` in `src/types/dashboard.ts` for `popup` action payload |
| PropertiesPanel | Add popup controls in `src/components/PropertiesPanel.tsx` |
| YAML schema | Update `src/schemas/ha-dashboard-schema.json` for popup card + popup action |

### YAML Schema

Register as `custom:popup-card` in card registry. Example YAML:

```yaml
type: custom:popup-card
title: "Room Details"
trigger_label: "View Details"
trigger_icon: mdi:information
popup:
  title: "Living Room Details"
  size: medium
  close_on_backdrop: true
  backdrop_opacity: 0.45
  cards:
    - type: entities
      entities:
        - sensor.temperature
        - sensor.humidity
        - light.living_room
```

Example popup action on an existing card:

```yaml
type: button
entity: light.living_room
tap_action:
  action: popup
  popup_title: "Light Controls"
  popup_size: small
  popup_close_on_backdrop: true
  popup_cards:
    - type: light
      entity: light.living_room
```

Update `src/schemas/ha-dashboard-schema.json` for both structures.

### Card Registry Entry (pattern)

```typescript
{
  type: 'custom:popup-card',
  name: 'Popup Card',
  category: 'layout',
  icon: 'ExpandOutlined',
  description: 'Trigger a modal popup containing cards',
  isCustom: true,
  source: 'custom',
  defaultProps: {
    title: 'Popup Trigger',
    trigger_label: 'Open Popup',
    trigger_icon: 'mdi:open-in-new',
    popup: {
      title: 'Details',
      size: 'medium',
      close_on_backdrop: true,
      backdrop_opacity: 0.45,
      cards: [{ type: 'markdown', content: 'Popup content' }],
    },
  },
  requiredProps: ['popup'],
}
```

---

## Critical: PropertiesPanel Integration Rules

When adding popup-specific controls to `PropertiesPanel.tsx`, you **MUST** follow `ai_rules.md` Rule 8:

1. Do NOT add full object references (like `card`) to `tabItems` useMemo dependencies.
2. If adding Popover/Modal-based controls, memoize content with `useMemo`.
3. All hooks must be declared before early returns.
4. Use `cardRef.current` in callbacks instead of closing over `card`.
5. Preserve Form context behavior (do not force remount tab panes unnecessarily).

---

## Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Popup opens with child card content
- [ ] Close via button, ESC, and backdrop click (when enabled)
- [ ] Popup trigger works from `tap_action` and `custom:popup-card`
- [ ] Size modes work (`auto`, `small`, `medium`, `large`, `fullscreen`, custom)
- [ ] Focus trap works and focus restores to trigger on close
- [ ] YAML round-trip serialization preserves popup config
- [ ] PropertiesPanel controls update live preview
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Nested popup support (depth <= 3)
- [ ] Header/footer customization
- [ ] Multiple popup stack support with deterministic z-index
- [ ] Reduced-motion animation fallback handling
- [ ] Popup content layout options (single/stack/grid)

**Won't Have (Out of Scope)**:
- [ ] Runtime drag/resize of popup
- [ ] Anchor-positioned popovers/tooltips
- [ ] Persistent popups across dashboard navigation
- [ ] Notification/toast behavior

---

## Testing Requirements

### Unit Tests

Create `tests/unit/popup-service.spec.ts`:
- Popup config parsing/normalization
- Size normalization + custom size validation
- Popup stack lifecycle (open/close/top-most behavior)
- Nested popup depth guard logic
- Action payload normalization for `tap_action.action: popup`

### E2E Tests (DSL-first only)

Create `tests/support/dsl/popup.ts` (`PopupDSL`):
- `addPopupCard()`
- `openPopupFromTriggerCard()`
- `openPopupFromTapAction(cardIndex?)`
- `expectPopupOpen(level?)`
- `expectPopupTitle(title, level?)`
- `expectPopupCardCount(count, level?)`
- `closePopupWithButton(level?)`
- `closePopupWithBackdrop(level?)`
- `closePopupWithEsc()`
- `setPopupSize(size)`
- `setCloseOnBackdrop(enabled)`
- keyboard helpers: `focusFirstElementInPopup()`, `expectFocusTrapped()`, `expectFocusReturnedToTrigger()`

Register `PopupDSL` in `tests/support/index.ts` (import, interface field, instantiation).

Create `tests/e2e/popup.spec.ts`:
- Add popup card and open/close via trigger
- Trigger popup via `tap_action` on existing card
- Size mode changes render correctly
- Backdrop close toggle behavior
- ESC close behavior
- Nested popup behavior and depth guard
- YAML round-trip serialization
- PropertiesPanel controls update live preview
- Focus trapping + restoration behavior

Create `tests/e2e/popup.visual.spec.ts`:
- Snapshots for modal open states, size variants, and nested stack

### Accessibility

- `role="dialog"` on modal container
- `aria-modal="true"`
- `aria-labelledby` linked to popup title
- Optional `aria-describedby` for popup content
- Focus moves into modal on open
- Tab/Shift+Tab trapped within active modal
- ESC closes top-most modal only
- Focus returns to originating trigger after close
- Respect `prefers-reduced-motion` (disable/reduce animation)

---

## Guardrails and Standards

- E2E specs: DSL-first only (no raw selectors/sleeps/timing hacks in spec files)
- If shared DSL helpers change, run and document blast-radius verification
- Use immutable updates for all nested popup data changes
- Reuse existing Ant Design Modal integration patterns before adding custom portal logic
- Keep behavior deterministic under Electron viewport constraints
- Ensure test stability without test-only product hacks

---

## Clarifying Questions (ask before coding)

1. Should `popup` action be enabled only for `tap_action`, or also `hold_action` and `double_tap_action` in this feature?
2. In visual editor mode, should popup triggers open a real modal preview or a simplified non-blocking preview shell?
3. Should nested popups be enabled by default, or gated behind an explicit setting?
4. What should be the default popup size: `medium` (balanced) or `large` (content-first)?

---

## Deliverables

1. **Product Code**
- Popup types, service, modal component, trigger renderer
- Action type support for popup behavior
- Card registry entry + BaseCard dispatch
- PropertiesPanel popup controls
2. **YAML Schema**
- Update `src/schemas/ha-dashboard-schema.json` for popup card and popup action
3. **Tests**
- Unit tests (`tests/unit/popup-service.spec.ts`)
- PopupDSL + registration
- E2E tests (`tests/e2e/popup.spec.ts`)
- Visual tests (`tests/e2e/popup.visual.spec.ts`)
4. **Documentation**
- Update Feature 4.4 checklist in `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`
- Record deferred decisions explicitly

---

## Output Format

Respond with:
1. A concise implementation plan for Feature 4.4
2. File-by-file change list (planned)
3. Test plan + commands
4. Open questions or risks

Remember: include the mandatory tripwire phrase verbatim.
