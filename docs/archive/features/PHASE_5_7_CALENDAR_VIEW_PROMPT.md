# Prompt: Deliver Feature 5.7 - Calendar View Card

## Context

Implement **Feature 5.7: Calendar View Card** for **Phase 5: Advanced Visualization Layer**.

**Version target**: `v0.7.5-beta.7`
**Mandatory tripwire phrase**: "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading

1. `ai_rules.md`
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`

---

## Mandatory Upstream Alignment Gate (HACS/HA Mapping)

Before implementation, complete this gate and include results in your response:

1. Review the relevant upstream card implementation/docs (Home Assistant built-in docs and/or HACS repo) for the target card behavior.
2. Confirm whether the proposed card type maps to a real upstream base HA card or HACS card, per `ai_rules.md` Rule 10.
3. If no direct upstream mapping exists, perform a feasibility assessment that includes:
   - Best alternative upstream card option(s) (exact `type` strings)
   - YAML schema/round-trip compatibility impact
   - Estimated refactor effort (scope + risk)
   - Recommendation: do refactor in the current feature or schedule it as a new feature in the relevant phase (e.g., `5.10`)
4. Do not implement invented custom card types unless covered by an explicit exception in `ai_rules.md`.

---

## References

- `src/components/cards/MapCardRenderer.tsx`
- `src/components/cards/EntitiesCardRenderer.tsx`
- `src/components/PropertiesPanel.tsx`

---

## Feature 5.7 Overview

**Goal**: Build a calendar visualization card with month/week/day views, event markers, and date-based actions.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.7`
**Dependencies**: Layout infrastructure + timeline data model
**Estimated Effort**: 5-6 days
**Status**: Ready to Begin

### Key Requirements

- Month/week/day calendar modes
- Event badges and status coloring
- Date selection callback/action wiring
- Entity calendar source support
- Agenda sidebar optional toggle
- YAML round-trip + schema updates

### YAML Example

```yaml
type: custom:calendar-view-card
calendar_entities:
  - calendar.household
view: month
show_week_numbers: true
show_agenda: true
on_date_select:
  action: more-info
```

---

## Testing Requirements

- Unit: calendar normalization, date-range generation, overlap handling
- E2E: view switching, event badges, date selection action
- Visual: month/week/day snapshots
- Accessibility: keyboard date traversal and SR-friendly labels

---

## Clarifying Questions

1. Should recurring event expansion happen in-app or assume upstream-expanded events?
2. What timezone source is canonical for rendering (HA server vs local)?
3. Do date selection actions need confirmation support in MVP?

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