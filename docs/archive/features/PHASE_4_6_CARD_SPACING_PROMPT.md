# Prompt: Deliver Feature 4.6 - Card Spacing Controls

## Context

You are an AI assistant implementing **Feature 4.6: Card Spacing Controls** for the HA Visual Dashboard Maker (Electron + React + TypeScript). This is part of **Phase 4: Layout Infrastructure Layer**. Your task is to deliver the feature end-to-end following project standards and architecture.

**Phase 4 is independent** (no dependencies on prior phases), but must follow established patterns in code and testing.

**Versioning convention**: `v0.7.<phase>-beta.<feature>`
**Version target for this work**: `v0.7.4-beta.R` (Phase 4, Feature 6)

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
5. `docs/archive/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md` - Feature 4.6 spec and checklist
6. `docs/archive/features/PHASE_4_5_LAYOUT_ENHANCEMENTS_PROMPT.md` - reference prompt format and standards framing

---

## Reference Implementations (must reuse patterns)

Follow the same structure, naming conventions, and integration points used by delivered features:

| Purpose | File |
|---------|------|
| Base wrapper integration point | `src/components/BaseCard.tsx` |
| Layout config normalization style | `src/services/layoutConfig.ts` |
| Dashboard/shared types baseline | `src/types/dashboard.ts` |
| PropertiesPanel integration reference | `src/components/PropertiesPanel.tsx` |
| Existing feature controls pattern | `src/components/AttributeDisplayControls.tsx` |
| Existing DSL registration pattern | `tests/support/index.ts` |
| Existing DSL style | `tests/support/dsl/layout.ts`, `tests/support/dsl/popup.ts` |
| Existing unit testing style | `tests/unit/layout-config.spec.ts`, `tests/unit/popup-service.spec.ts` |
| Existing E2E style | `tests/e2e/layout.spec.ts`, `tests/e2e/popup.spec.ts` |

---

## Feature 4.6 Overview

**Goal**: Add reusable per-card margin and padding controls (all-sides + per-side) with presets, YAML round-trip support, and live preview behavior across all card types while preserving backward compatibility.

**Branch**: `feature/layout-infrastructure-layer` (already exists; continue on this branch)
**Version Target**: `v0.7.4-beta.R`
**Dependencies**: None
**Estimated Effort**: 2-3 days
**Status**: Ready to Begin

### Key Requirements

- Add `card_margin` and `card_padding` support to all cards via `BaseCard` wrapper integration
- Support spacing input formats:
  - Numeric shorthand (all sides), e.g. `8`
  - Per-side object, e.g. `{ top: 8, right: 16, bottom: 8, left: 16 }`
  - CSS shorthand string, e.g. `"8px 16px"`
  - Preset tokens: `none`, `tight`, `normal`, `relaxed`, `spacious`, `custom`
- Add spacing controls to PropertiesPanel for all card types
- Live preview updates immediately in editor canvas
- Backward compatibility when spacing properties are omitted
- YAML round-trip serialization preserves spacing configuration
- Deterministic behavior in Electron viewport constraints

---

## Implementation Targets

### Code Organization

| Purpose | Path |
|---------|------|
| Spacing service | `src/services/cardSpacing.ts` |
| Spacing types | `src/types/spacing.ts` |
| Base card integration | `src/components/BaseCard.tsx` |
| PropertiesPanel controls | `src/components/SpacingControls.tsx` |
| PropertiesPanel wiring | `src/components/PropertiesPanel.tsx` |
| Dashboard type extensions | `src/types/dashboard.ts` |
| YAML schema updates | `src/schemas/ha-dashboard-schema.json` |
| Spacing DSL helper | `tests/support/dsl/spacing.ts` |
| DSL registration | `tests/support/index.ts` |
| Unit tests | `tests/unit/card-spacing.spec.ts` |
| E2E tests | `tests/e2e/spacing.spec.ts` |
| Visual tests | `tests/e2e/spacing.visual.spec.ts` |

### YAML Schema

Add spacing properties to card schema definitions (backward compatible, optional).

Example YAML (all-sides):

```yaml
type: button
entity: light.living_room
card_margin: 8
card_padding: 16
```

Example YAML (per-side):

```yaml
type: entities
card_margin:
  top: 0
  right: 8
  bottom: 16
  left: 8
card_padding:
  top: 12
  right: 16
  bottom: 12
  left: 16
```

Example YAML (preset):

```yaml
type: button
entity: light.living_room
card_margin: relaxed
card_padding: normal
```

Update `src/schemas/ha-dashboard-schema.json` with spacing field types and constraints.

---

## Critical: PropertiesPanel Integration Rules

When adding spacing controls to `PropertiesPanel.tsx`, you **MUST** follow `ai_rules.md` Rule 8:

1. Do NOT add full object references (like `card`) to `tabItems` useMemo dependencies.
2. If adding Popover-based controls, memoize popover content with `useMemo`.
3. All hooks must be declared before early returns.
4. Use `cardRef.current` in callbacks instead of closing over `card`.
5. Preserve Form context behavior (do not force remount tab panes unnecessarily).

---

## Acceptance Criteria

**Must Have (Blocking Release)**:
- [ ] Margin controls work (all-sides and per-side)
- [ ] Padding controls work (all-sides and per-side)
- [ ] Spacing presets work (`none`, `tight`, `normal`, `relaxed`, `spacious`, `custom`)
- [ ] Spacing applies to all card types through `BaseCard`
- [ ] Existing dashboards are unaffected when spacing properties are omitted
- [ ] YAML round-trip serialization preserves spacing config
- [ ] PropertiesPanel controls update live preview
- [ ] All unit and E2E tests pass

**Should Have (Nice to Have)**:
- [ ] Visual box-model diagram in spacing controls UI
- [ ] Toggle between all-sides and per-side modes
- [ ] CSS shorthand YAML format support with normalization
- [ ] Visual regression snapshots for key spacing combinations

**Won't Have (Out of Scope)**:
- [ ] Responsive spacing by breakpoint
- [ ] Global spacing defaults applied to every card
- [ ] Animation transitions for spacing changes
- [ ] Negative margins as a supported user-facing option

---

## Testing Requirements

### Unit Tests

Create `tests/unit/card-spacing.spec.ts`:
- Parse/normalize margin/padding for all supported formats
- Preset mapping (`none`, `tight`, `normal`, `relaxed`, `spacious`, `custom`)
- Numeric clamping/validation behavior
- CSS shorthand parsing behavior
- Backward-compatible defaults when properties missing

### E2E Tests (DSL-first only)

Create `tests/support/dsl/spacing.ts` (`SpacingDSL`):
- `setCardMargin(valueOrPreset)`
- `setCardPadding(valueOrPreset)`
- `setMarginMode(mode: 'all' | 'per-side')`
- `setPaddingMode(mode: 'all' | 'per-side')`
- `setMarginSide(side, value)`
- `setPaddingSide(side, value)`
- `expectCardMarginApplied(expected)`
- `expectCardPaddingApplied(expected)`

Register `SpacingDSL` in `tests/support/index.ts` (import, interface field, instantiation).

Create `tests/e2e/spacing.spec.ts`:
- Set margin via PropertiesPanel
- Set padding via PropertiesPanel
- Toggle all-sides vs per-side mode
- Preset application behavior
- YAML round-trip serialization
- Backward compatibility with cards lacking spacing fields

Create `tests/e2e/spacing.visual.spec.ts`:
- Snapshots for spacing presets and representative per-side configurations

### Accessibility

- Ensure spacing controls are keyboard accessible
- Ensure all spacing inputs have visible labels and deterministic focus order
- Ensure spacing updates do not regress card selection/focus behavior in editor canvas

---

## Guardrails and Standards

- E2E specs: DSL-first only (no raw selectors/sleeps/timing hacks in spec files)
- If shared DSL helpers change, run and document blast-radius verification
- Use immutable updates for all spacing config changes
- Reuse existing PropertiesPanel and service patterns before introducing abstractions
- Keep behavior deterministic under Electron viewport constraints
- Ensure test stability without adding test-only product hacks

---

## Clarifying Questions (ask before coding)

1. Should negative margins be clamped to `0`, or rejected with a validation error plus warning?
2. What exact numeric range should be enforced for spacing inputs (e.g., `0-64`)?
3. Should preset tokens be stored verbatim in YAML or normalized to numeric values on save?
4. Should spacing controls be visible for every card type immediately, or gated for specific categories first?

---

## Deliverables

1. **Product Code**
   - New spacing service + types
   - BaseCard spacing integration
   - Spacing controls integrated into PropertiesPanel
2. **YAML Schema**
   - Update `src/schemas/ha-dashboard-schema.json` for spacing fields
3. **Tests**
   - Unit tests (`tests/unit/card-spacing.spec.ts`)
   - SpacingDSL + registration
   - E2E tests (`tests/e2e/spacing.spec.ts`)
   - Visual tests (`tests/e2e/spacing.visual.spec.ts`)
4. **Documentation**
   - Update Feature 4.6 checklist in `docs/archive/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`
   - Record deferred decisions explicitly

---

## Output Format

Respond with:
1. A concise implementation plan for Feature 4.6
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