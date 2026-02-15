# Prompt: Deliver Feature 4.5 - Horizontal/Vertical Layout Enhancements

## Context

You are an AI assistant implementing **Feature 4.5: Horizontal/Vertical Layout Enhancements** for the HA Visual Dashboard Maker (Electron + React + TypeScript). This is part of **Phase 4: Layout Infrastructure Layer**. Your task is to deliver the feature end-to-end following project standards and architecture.

**Phase 4 is independent** (no dependencies on prior phases), but must follow established patterns in code and testing.

**Versioning convention**: `v0.7.<phase>-beta.<feature>`
**Version target for this work**: `v0.7.4-beta.5` (Phase 4, Feature 5)

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
5. `docs/archive/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md` - Feature 4.5 spec and checklist
6. `docs/archive/features/PHASE_4_4_POPUP_PROMPT.md` - reference prompt format and standards framing

---

## Reference Implementations (must reuse patterns)

Follow the same structure, naming conventions, and integration points used by delivered layout features:

| Purpose | File |
|---------|------|
| Vertical stack renderer baseline | `src/components/cards/VerticalStackCardRenderer.tsx` |
| Horizontal stack renderer baseline | `src/components/cards/HorizontalStackCardRenderer.tsx` |
| Grid renderer baseline | `src/components/cards/GridCardRenderer.tsx` |
| Tabs renderer (container controls patterns) | `src/components/cards/TabsCardRenderer.tsx` |
| Popup renderer (PropertiesPanel integration patterns) | `src/components/cards/PopupTriggerCardRenderer.tsx` |
| Card registry pattern | `src/services/cardRegistry.ts` |
| BaseCard dispatch pattern | `src/components/BaseCard.tsx` |
| Dashboard/shared types | `src/types/dashboard.ts` |
| PropertiesPanel integration reference | `src/components/PropertiesPanel.tsx` |
| DSL registration | `tests/support/index.ts` |
| Existing layout DSL style | `tests/support/dsl/carousel.ts`, `tests/support/dsl/accordion.ts`, `tests/support/dsl/tabs.ts` |
| Existing layout E2E style | `tests/e2e/carousel.spec.ts`, `tests/e2e/accordion.spec.ts`, `tests/e2e/tabs.spec.ts`, `tests/e2e/popup.spec.ts` |

---

## Feature 4.5 Overview

**Goal**: Enhance native Home Assistant layout cards (`vertical-stack`, `horizontal-stack`, `grid`) with configurable gap/spacing, alignment, and wrapping controls while preserving full backward compatibility.

**Branch**: `feature/layout-infrastructure-layer` (already exists; continue on this branch)
**Version Target**: `v0.7.4-beta.6`
**Dependencies**: None
**Estimated Effort**: 2-3 days
**Status**: Ready to Begin

### Key Requirements

- Add configurable `gap` for vertical-stack and horizontal-stack
- Add configurable `row_gap` and `column_gap` for grid cards
- Provide gap presets: `none`, `tight`, `normal`, `relaxed`, `custom`
- Add alignment controls:
  - vertical-stack: `align_items`
  - horizontal-stack: `align_items`, `justify_content`
  - grid: `align_items`, `justify_items`
- Add horizontal wrap behavior: `wrap` (`nowrap`, `wrap`, `wrap-reverse`)
- Preserve existing behavior when new properties are absent
- Live preview updates from PropertiesPanel controls
- YAML round-trip serialization for all new layout properties
- Deterministic rendering in Electron viewport constraints

---

## Implementation Targets

### Code Organization

| Purpose | Path |
|---------|------|
| Layout types/extensions | `src/types/dashboard.ts` |
| Vertical stack enhancements | `src/components/cards/VerticalStackCardRenderer.tsx` |
| Horizontal stack enhancements | `src/components/cards/HorizontalStackCardRenderer.tsx` |
| Grid enhancements | `src/components/cards/GridCardRenderer.tsx` |
| PropertiesPanel controls | `src/components/PropertiesPanel.tsx` |
| YAML schema updates | `src/schemas/ha-dashboard-schema.json` |
| Layout DSL helper | `tests/support/dsl/layout.ts` |
| DSL registration | `tests/support/index.ts` |
| Unit tests | `tests/unit/layout-config.spec.ts` |
| E2E tests | `tests/e2e/layout.spec.ts` |
| Visual tests | `tests/e2e/layout.visual.spec.ts` |

### YAML Schema

Enhance existing layout card schemas (do not create new card type).

Example YAML (vertical stack):

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

Example YAML (horizontal stack):

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

Example YAML (grid):

```yaml
type: grid
columns: 3
row_gap: 12
column_gap: 8
align_items: stretch
justify_items: center
cards:
  - type: sensor
    entity: sensor.temperature
  - type: sensor
    entity: sensor.humidity
  - type: sensor
    entity: sensor.pressure
```

Update `src/schemas/ha-dashboard-schema.json` with new optional properties and enums.

---

## Critical: PropertiesPanel Integration Rules

When adding layout-specific controls to `PropertiesPanel.tsx`, you **MUST** follow `ai_rules.md` Rule 8:

1. Do NOT add full object references (like `card`) to `tabItems` useMemo dependencies.
2. If adding Popover-based controls, memoize popover content with `useMemo`.
3. All hooks must be declared before early returns.
4. Use `cardRef.current` in callbacks instead of closing over `card`.
5. Preserve Form context behavior (do not force remount tab panes unnecessarily).

---

## Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Gap/spacing controls work for `vertical-stack`, `horizontal-stack`, and `grid`
- [ ] Gap presets work (`none`, `tight`, `normal`, `relaxed`, `custom`)
- [ ] Alignment options render correctly for all enhanced layout cards
- [ ] Horizontal `wrap` behavior works and remains deterministic
- [ ] Existing dashboards are unaffected when properties are omitted
- [ ] YAML round-trip serialization preserves all layout config
- [ ] PropertiesPanel controls update live preview
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Visual alignment selector controls in PropertiesPanel
- [ ] Independent row/column gap for grid with intuitive UI
- [ ] Numeric guardrails/clamping for extreme gap values
- [ ] Clear helper text in PropertiesPanel for wrap behavior

**Won't Have (Out of Scope)**:
- [ ] Responsive breakpoint-based layout switching
- [ ] Advanced CSS Grid template-areas editor
- [ ] Per-breakpoint alignment/gap overrides
- [ ] Runtime drag-resize or auto-layout intelligence

---

## Testing Requirements

### Unit Tests

Create `tests/unit/layout-config.spec.ts`:
- Gap preset normalization (`none`, `tight`, `normal`, `relaxed`, `custom`)
- Numeric gap parsing + bounds/clamping behavior
- Alignment value validation/default fallback
- Horizontal wrap value normalization
- Backward compatibility defaults when properties missing

### E2E Tests (DSL-first only)

Create `tests/support/dsl/layout.ts` (`LayoutDSL`):
- `addVerticalStackCard()`
- `addHorizontalStackCard()`
- `addGridCard()`
- `setGap(valueOrPreset)`
- `setGridRowGap(valueOrPreset)`
- `setGridColumnGap(valueOrPreset)`
- `setAlignItems(value)`
- `setJustifyContent(value)`
- `setJustifyItems(value)`
- `setWrap(mode)`
- `expectGapApplied(cardType, expectedPx)`
- `expectAlignmentApplied(cardType, expected)`
- `expectWrapApplied(expectedMode)`

Register `LayoutDSL` in `tests/support/index.ts` (import, interface field, instantiation).

Create `tests/e2e/layout.spec.ts`:
- Vertical stack gap + alignment changes
- Horizontal stack gap + alignment + justify + wrap changes
- Grid row/column gap + alignment changes
- Backward compatibility (existing layout card without new props)
- YAML round-trip serialization
- PropertiesPanel controls update live preview

Create `tests/e2e/layout.visual.spec.ts`:
- Snapshots for gap presets, alignment variants, and horizontal wrap states

### Accessibility

- Ensure layout controls in PropertiesPanel maintain keyboard accessibility
- Ensure all new controls have labels and deterministic focus behavior
- No regression in card selection/focus behavior in editor canvas

---

## Guardrails and Standards

- E2E specs: DSL-first only (no raw selectors/sleeps/timing hacks in spec files)
- If shared DSL helpers change, run and document blast-radius verification
- Use immutable updates for all nested layout config changes
- Reuse existing stack/grid renderer patterns before introducing helper abstractions
- Keep behavior deterministic under Electron viewport constraints
- Ensure test stability without adding test-only product hacks

---

## Clarifying Questions (ask before coding)

1. Should `gap`/`row_gap`/`column_gap` accept only numbers (px), or support CSS strings as well?
2. What exact numeric range should be enforced for gap inputs (e.g., `0-64`)?
3. For `wrap: wrap` in horizontal stack, should cross-row alignment be controlled only by `align_items` (MVP), or include additional row alignment controls now?
4. Should `justify_content` default remain existing browser/HA behavior (`start`) when omitted, or be explicitly serialized once user touches layout controls?

---

## Deliverables

1. **Product Code**
   - Enhanced vertical/horizontal/grid renderers
   - Extended layout card types
   - PropertiesPanel layout controls
2. **YAML Schema**
   - Update `src/schemas/ha-dashboard-schema.json` for enhanced layout props
3. **Tests**
   - Unit tests (`tests/unit/layout-config.spec.ts`)
   - LayoutDSL + registration
   - E2E tests (`tests/e2e/layout.spec.ts`)
   - Visual tests (`tests/e2e/layout.visual.spec.ts`)
4. **Documentation**
   - Update Feature 4.5 checklist in `docs/archive/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`
   - Record deferred decisions (if any) explicitly

---

## Output Format

Respond with:
1. A concise implementation plan for Feature 4.5
2. File-by-file change list (planned)
3. Test plan + commands
4. Open questions or risks

Remember: include the mandatory tripwire phrase verbatim.

---

## Validation

After implementation, run exactly one **Fast Gate** pass and then stop:

1. `npm run lint`
2. `npm run test:unit`
3. `npm run test:e2e -- <targeted-specs-or-folder> --project=electron-e2e --workers=1 --trace=retain-on-failure`
4. `npm run test:integration -- <targeted-specs-or-folder> --project=electron-integration --workers=1 --trace=retain-on-failure` (only if integration scope is impacted)

After this single Fast Gate run, provide a summary report that includes:
- Exact commands executed
- Pass/fail status for each command
- Any failing tests with artifact paths under `test-results/artifacts/**`
- Root-cause diagnosis and proposed next step

Do not run additional tests or fixes until the user explicitly approves proceeding.