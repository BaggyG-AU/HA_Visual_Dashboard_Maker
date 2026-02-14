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
