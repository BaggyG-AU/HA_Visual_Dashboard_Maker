# Prompt: Deliver Feature 5.2 - Advanced Gauge Card

## Context

You are an AI assistant implementing **Feature 5.2: Advanced Gauge Card** for HA Visual Dashboard Maker. This belongs to **Phase 5: Advanced Visualization Layer**.

**Version target**: `v0.7.5-beta.2`
**Mandatory tripwire phrase (quote exactly):** "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading

1. `ai_rules.md`
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/architecture/ARCHITECTURE.md`
5. `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`
6. `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`

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

- `src/components/cards/GaugeCardRenderer.tsx`
- `src/components/cards/SensorCardRenderer.tsx`
- `src/components/GradientEditor.tsx`
- `src/services/cardRegistry.ts`
- `src/components/PropertiesPanel.tsx`

---

## Feature 5.2 Overview

**Goal**: Align gauge improvements to upstream cards by enhancing built-in `gauge` workflows and adding basic compatibility for HACS `custom:gauge-card-pro`.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.2`
**Dependencies**: Feature 5.1 + HACS alignment requirements
**Estimated Effort**: 5-6 days
**Status**: Ready to Begin

### Key Requirements

- Built-in `gauge` support with richer editor controls (min/max/unit/needle/severity)
- Basic HACS `custom:gauge-card-pro` compatibility (entity, header, min/max, needle, gradient, segments, unit text)
- YAML round-trip + schema support for both card types
- No invented custom card types for this feature

---

## Implementation Targets

| Purpose | Path |
|---------|------|
| Types | `src/features/gauge/types.ts` |
| Service | `src/features/gauge/gaugeService.ts` |
| Component | `src/features/gauge/GaugeCardProCard.tsx` |
| Renderer | `src/components/cards/GaugeCardProCardRenderer.tsx` |
| Registry + BaseCard | `src/services/cardRegistry.ts`, `src/components/BaseCard.tsx` |
| PropertiesPanel | `src/components/PropertiesPanel.tsx` |
| Schema | `src/schemas/ha-dashboard-schema.json` |

### YAML Example

```yaml
type: custom:gauge-card-pro
entity: sensor.water_tank_level
header: Water Tank
min: 0
max: 100
needle: true
gradient: true
segments:
  - from: 0
    color: "#ff6b6b"
    label: "Low"
  - from: 30
    color: "#ffd166"
    label: "Medium"
  - from: 70
    color: "#6ccf7f"
    label: "High"
value_texts:
  primary_unit: "%"
```

---

## Testing Requirements

- Unit: value normalization, segment validation, gradient mapping
- E2E: built-in gauge + gauge-card-pro add/configure flows, YAML round-trip
- Visual: gauge-card-pro threshold/needle states
- Accessibility: labels and keyboard navigation

---

## Clarifying Questions

1. Is the current basic Gauge Card Pro subset sufficient for 5.2, with full parity deferred to 5.10?
2. Which Gauge Card Pro options must be first in scope for 5.10 (inner gauge, setpoints, icons, shapes)?
3. Should built-in gauge and Gauge Card Pro share one editor section or remain split?

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
