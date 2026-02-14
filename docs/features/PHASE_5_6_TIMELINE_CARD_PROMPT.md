# Prompt: Deliver Feature 5.6 - Timeline Card

## Context

Implement **Feature 5.6: Timeline Card** for **Phase 5: Advanced Visualization Layer**.

**Version target**: `v0.7.5-beta.6`
**Mandatory tripwire phrase**: "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading

1. `ai_rules.md`
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`

---

## References

- `src/components/cards/EntitiesCardRenderer.tsx`
- `src/components/cards/HistoryGraphCardRenderer.tsx`
- `src/components/cards/VerticalStackCardRenderer.tsx`

---

## Feature 5.6 Overview

**Goal**: Create a timeline card for chronological event visualization with past/present/future markers and interactive scrubbing.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.6`
**Dependencies**: Layout infrastructure + entity data
**Estimated Effort**: 4-5 days
**Status**: Ready to Begin

### Key Requirements

- Vertical and horizontal timeline orientations
- Event grouping by day/time buckets
- Past/present/future marker styles
- Optional scrub/seek control with selected timestamp output
- Configurable item density and truncation behavior
- YAML round-trip and schema support

### YAML Example

```yaml
type: custom:timeline-card
entity: sensor.home_events
orientation: vertical
show_now_marker: true
group_by: day
max_items: 50
```

---

## Testing Requirements

- Unit: event normalization, sort/group behavior
- E2E: timeline rendering, marker behavior, scrub interaction
- Visual: vertical/horizontal + grouped/un-grouped variants
- Accessibility: keyboard navigation and readable event semantics

---

## Clarifying Questions

1. Which HA entities are first-class timeline sources in MVP?
2. Should scrub interaction be read-only or action-triggering in phase scope?
3. What is the default max event count before pagination/virtualization?
