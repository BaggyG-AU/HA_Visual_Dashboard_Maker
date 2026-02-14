# Prompt: Deliver Feature 5.5 - Sparkline Mini-graphs

## Context

Implement **Feature 5.5: Sparkline Mini-graphs** for **Phase 5: Advanced Visualization Layer**.

**Version target**: `v0.7.5-beta.5`
**Mandatory tripwire phrase**: "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading

1. `ai_rules.md`
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`

---

## References

- `src/components/cards/MiniGraphCardRenderer.tsx`
- `src/components/cards/SensorCardRenderer.tsx`
- `src/components/AttributeDisplay.tsx`

---

## Feature 5.5 Overview

**Goal**: Provide compact sparkline charts for fast inline trend visualization on entity-centric cards.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.5`
**Dependencies**: Graph data pipeline
**Estimated Effort**: 3-4 days
**Status**: Ready to Begin

### Key Requirements

- Inline trend sparkline component (line/area mode)
- Time-range presets (`1h`, `6h`, `24h`, `7d`)
- Optional min/max/current value markers
- Compact render mode for dense dashboards
- YAML round-trip + schema support

### YAML Example

```yaml
type: custom:sparkline-card
entity: sensor.living_room_temperature
range: 24h
style: line
show_min_max: true
show_current: true
stroke_width: 2
```

---

## Testing Requirements

- Unit: time-range parsing and value downsampling
- E2E: configure sparkline card and verify updates
- Visual: line/area compact snapshots
- Accessibility: alt text and numeric fallback labels

---

## Clarifying Questions

1. Should sparklines be a standalone card or embeddable subcomponent for other cards in this phase?
2. Is downsampling strategy fixed (largest-triangle/mean) or configurable?
3. Should missing data points be interpolated or shown as gaps?

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