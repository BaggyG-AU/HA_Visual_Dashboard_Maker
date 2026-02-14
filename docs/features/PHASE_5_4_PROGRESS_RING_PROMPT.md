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