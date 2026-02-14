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

## Reference Implementations

- `src/components/cards/GaugeCardRenderer.tsx`
- `src/components/cards/SensorCardRenderer.tsx`
- `src/components/GradientEditor.tsx`
- `src/services/cardRegistry.ts`
- `src/components/PropertiesPanel.tsx`

---

## Feature 5.2 Overview

**Goal**: Implement an advanced gauge card supporting circular and linear modes, threshold ranges, gradients, and animated value transitions.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.2`
**Dependencies**: Feature 5.1 + gradients/animations from prior phases
**Estimated Effort**: 5-6 days
**Status**: Ready to Begin

### Key Requirements

- Circular and linear gauge layouts
- Threshold/range segments with color and labels
- Gradient fill support
- Needle/progress animation with reduced-motion fallback
- Min/max/unit/value formatting controls
- YAML round-trip + schema support

---

## Implementation Targets

| Purpose | Path |
|---------|------|
| Types | `src/features/gauge/types.ts` |
| Service | `src/features/gauge/gaugeService.ts` |
| Component | `src/features/gauge/AdvancedGaugeCard.tsx` |
| Renderer | `src/components/cards/AdvancedGaugeCardRenderer.tsx` |
| Registry + BaseCard | `src/services/cardRegistry.ts`, `src/components/BaseCard.tsx` |
| PropertiesPanel | `src/components/PropertiesPanel.tsx` |
| Schema | `src/schemas/ha-dashboard-schema.json` |

### YAML Example

```yaml
type: custom:advanced-gauge-card
entity: sensor.water_tank_level
mode: circular
min: 0
max: 100
unit: "%"
animation: smooth
ranges:
  - from: 0
    to: 30
    color: "#ff6b6b"
  - from: 30
    to: 70
    color: "#ffd166"
  - from: 70
    to: 100
    color: "#6ccf7f"
```

---

## Testing Requirements

- Unit: value normalization, range validation, gradient mapping
- E2E: add card, configure ranges, verify runtime updates, YAML round-trip
- Visual: circular/linear variants and threshold color states
- Accessibility: labels, keyboard navigation, reduced motion

---

## Clarifying Questions

1. Should the advanced gauge replace existing gauge behavior or be a new custom card?
2. Are range boundaries inclusive on both ends or lower-inclusive/upper-exclusive?
3. Should unavailable state render last-known value or explicit unavailable UI?

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