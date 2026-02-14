# Prompt: Deliver Feature 5.1 - Native Graphs (Recharts Integration)

## Context

You are an AI assistant implementing **Feature 5.1: Native Graphs** for the HA Visual Dashboard Maker (Electron + React + TypeScript). This is part of **Phase 5: Advanced Visualization Layer**. Your task is to deliver the feature end-to-end following project standards and architecture.

**Versioning convention**: `v0.7.<phase>-beta.<feature>`
**Version target for this work**: `v0.7.5-beta.1` (Phase 5, Feature 1)

**Mandatory tripwire phrase (quote exactly in your response):** "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading (in this order)

1. `ai_rules.md` - immutable rules (reuse-first, immutable updates, test workflow)
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/architecture/ARCHITECTURE.md`
5. `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`
6. `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`

---

## Reference Implementations (must reuse patterns)

- `src/components/cards/ApexChartsCardRenderer.tsx`
- `src/components/cards/HistoryGraphCardRenderer.tsx`
- `src/services/cardRegistry.ts`
- `src/components/BaseCard.tsx`
- `src/components/PropertiesPanel.tsx`
- `src/schemas/ha-dashboard-schema.json`
- `tests/support/index.ts`
- `tests/support/dsl/layout.ts`

---

## Feature 5.1 Overview

**Goal**: Add native data visualization cards using Recharts with real-time update support and YAML round-trip compatibility.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.1`
**Dependencies**: Phases 1-4 complete
**Estimated Effort**: 6-7 days
**Status**: Ready to Begin

### Key Requirements

- Add line, bar, area, and pie chart modes
- Support multiple series and configurable axes
- Real-time update pipeline with performant re-render behavior
- Optional zoom/pan for time-series datasets
- Reusable chart config service + strict type definitions
- Full PropertiesPanel integration and live preview
- YAML schema + serialization parity

---

## Implementation Targets

| Purpose | Path |
|---------|------|
| Feature types | `src/features/graphs/types.ts` |
| Graph service | `src/features/graphs/graphService.ts` |
| Feature component | `src/features/graphs/NativeGraphsCard.tsx` |
| Renderer | `src/components/cards/NativeGraphsCardRenderer.tsx` |
| Card registry | `src/services/cardRegistry.ts` |
| BaseCard dispatch | `src/components/BaseCard.tsx` |
| PropertiesPanel controls | `src/components/PropertiesPanel.tsx` |
| YAML schema | `src/schemas/ha-dashboard-schema.json` |

### YAML Example

```yaml
type: custom:native-graph-card
chart_type: line
time_range: 24h
refresh_interval: 30s
x_axis:
  mode: time
y_axis:
  min: auto
  max: auto
series:
  - entity: sensor.living_room_temperature
    label: Temperature
    color: "#4fa3ff"
  - entity: sensor.living_room_humidity
    label: Humidity
    color: "#6ccf7f"
```

---

## Acceptance Criteria

**Must Have**
- Native graph card renders all supported chart types
- Multi-series rendering works with independent colors/labels
- PropertiesPanel updates preview without remount regressions
- YAML round-trip preserves graph config
- Unit + E2E + visual tests pass

**Should Have**
- Zoom/pan support for line/area charts
- Series-level smoothing/stacking options
- Lightweight empty/error states

**Won't Have**
- Server-side aggregation engine
- Extremely large dataset virtualization (>10k points)

---

## Testing Requirements

### Unit
- Graph config normalization/validation
- Series parsing and fallback behavior
- Time-range parsing and axis defaults

### E2E (DSL-first)
- Add `GraphsDSL` in `tests/support/dsl/graphs.ts`
- Validate add/edit chart, series config, and YAML round-trip

### Visual Regression
- Snapshots for line/bar/area/pie and multi-series variants

### Accessibility
- Keyboard access to all graph controls
- ARIA labeling for chart container and legends
- Respect `prefers-reduced-motion`

---

## Guardrails

- Reuse existing renderer and service patterns before adding abstractions
- Do not use raw selectors/sleeps in specs
- Follow `ai_rules.md` Rule 8 for PropertiesPanel tab stability

---

## Clarifying Questions (ask before coding)

1. Should Recharts be the only chart engine for this feature, or should ApexCharts remain selectable as fallback?
2. What is the maximum default point count per series before downsampling is required?
3. Should graph export YAML remain `custom:native-graph-card` or map to an upstream card type?

---

## Deliverables

1. Product code for native graphs + renderer/service/types
2. PropertiesPanel controls and live preview wiring
3. Schema and YAML serialization updates
4. Unit, E2E, and visual coverage
5. Feature documentation update in `docs/features/`

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