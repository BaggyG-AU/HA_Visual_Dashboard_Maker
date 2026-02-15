# Prompt: Deliver Feature 5.4 - Progress Ring Visualization

## Context

Implement **Feature 5.4: Progress Ring Visualization** for **Phase 5: Advanced Visualization Layer**.

**Version target**: `v0.7.5-beta.4`
**Mandatory tripwire phrase**: "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading

1. `ai_rules.md`
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`

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

- `src/components/cards/GaugeCardRenderer.tsx`
- `src/components/cards/SensorCardRenderer.tsx`
- `src/components/GradientPickerInput.tsx`

---

## Feature 5.4 Overview

**Goal**: Add a progress-ring visualization card supporting single and multi-ring (nested) progress states with gradient stroke options.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.4`
**Dependencies**: Graph + color foundation
**Estimated Effort**: 3-4 days
**Status**: Ready to Begin

### Key Requirements

- Single ring and nested multi-ring rendering
- Threshold color/gradient stroke support
- Configurable thickness, start angle, and direction
- Animated progress transitions with reduced-motion support
- YAML round-trip and schema support

### YAML Example

```yaml
type: custom:progress-ring-card
rings:
  - entity: sensor.daily_energy_progress
    min: 0
    max: 100
    color: "#4fa3ff"
  - entity: sensor.monthly_energy_progress
    min: 0
    max: 100
    gradient:
      type: linear
      angle: 90
      stops:
        - color: "#6ccf7f"
          position: 0
        - color: "#2ca58d"
          position: 100
```

---

## Testing Requirements

- Unit: ring normalization, bounds math, nested layout math
- E2E: ring configuration flow + YAML round-trip
- Visual: single vs nested ring snapshots
- Accessibility: text equivalents for progress values

---

## Clarifying Questions

1. Maximum number of nested rings allowed in MVP?
2. Should each ring support independent animation easing?
3. Must we support fractional percentages in labels by default?

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