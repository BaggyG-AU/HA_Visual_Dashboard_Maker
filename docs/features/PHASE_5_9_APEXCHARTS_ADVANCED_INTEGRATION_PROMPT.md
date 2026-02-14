# Prompt: Deliver Feature 5.9 - ApexCharts Advanced Integration

## Context

You are an AI assistant implementing **Feature 5.9: ApexCharts Advanced Integration** for HA Visual Dashboard Maker. This extends **Phase 5: Advanced Visualization Layer** with expanded editor-side support for the HACS ApexCharts card.

**Version target**: `v0.7.5-beta.9`
**Mandatory tripwire phrase (quote exactly):** "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading

1. `ai_rules.md`
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/architecture/ARCHITECTURE.md`
5. `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`
6. `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`
7. `docs/features/ADVANCED_VISUALIZATION_LAYER_IMPLEMENTATION.md`

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

## Reference Implementations

- `src/components/cards/ApexChartsCardRenderer.tsx`
- `src/components/cards/NativeGraphsCardRenderer.tsx`
- `src/services/cardRegistry.ts`
- `src/components/PropertiesPanel.tsx`
- `src/schemas/ha-dashboard-schema.json`
- `tests/e2e/graphs.spec.ts`
- `tests/support/dsl/graphs.ts`

---

## Feature 5.9 Overview

**Goal**: Expand ApexCharts support with a stronger configuration UX, safer schema validation, and deterministic YAML round-trip behavior while preserving existing card compatibility.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.9`
**Dependencies**: 5.1 native graph learnings + existing ApexCharts renderer path
**Estimated Effort**: 8-12 days
**Status**: New Scope Added

### Key Requirements

- Improve form support for common ApexCharts configuration paths (header, graph span, chart type, update interval, key series controls)
- Preserve advanced ApexCharts capabilities via YAML passthrough for unsupported options
- Add normalization/validation safeguards for high-risk config areas
- Keep preview behavior deterministic in editor context
- Maintain full YAML round-trip compatibility for `custom:apexcharts-card`
- Add explicit fallback/error UI for unsupported or malformed config

---

## Implementation Targets

| Purpose | Path |
|---------|------|
| Apex config types/normalization | `src/features/apexcharts/` (new) |
| Apex renderer hardening | `src/components/cards/ApexChartsCardRenderer.tsx` |
| Registry defaults/metadata | `src/services/cardRegistry.ts` |
| Properties controls | `src/components/PropertiesPanel.tsx` |
| YAML schema updates | `src/schemas/ha-dashboard-schema.json` |
| E2E DSL extensions | `tests/support/dsl/` |

### YAML Example

```yaml
type: custom:apexcharts-card
graph_span: 24h
update_interval: 30s
header:
  title: Living Room Trends
  show: true
series:
  - entity: sensor.living_room_temperature
    name: Temperature
    type: line
  - entity: sensor.living_room_humidity
    name: Humidity
    type: area
apex_config:
  chart:
    type: line
    height: 280
  stroke:
    width: 2
    curve: smooth
```

---

## Testing Requirements

- Unit: Apex config normalization, defaults, and guardrails for invalid shape/value combinations
- E2E: configure Apex card from form, verify preview stability, verify YAML round-trip preservation
- Visual: baseline snapshots for core Apex chart modes supported in editor preview
- Accessibility: control labels, keyboard flow, and readable error/fallback output

---

## Clarifying Questions

1. Which ApexCharts feature subsets must be first-class in form UI (vs YAML-only) for MVP?
2. Should `custom:apexcharts-card` remain independent from `custom:native-graph-card` with no conversion workflow in this phase?
3. Should unsupported advanced config show warning banners or remain silent/pass-through-only?

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
