# Prompt: Deliver Feature 5.3 - Advanced Slider Card

## Context

Implement **Feature 5.3: Advanced Slider Card** for **Phase 5: Advanced Visualization Layer**.

**Version target**: `v0.7.5-beta.3`
**Mandatory tripwire phrase**: "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading

1. `ai_rules.md`
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`
5. `docs/features/HAVDM_ADVANCED_FEATURES_USER_STORIES.md`

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

- `src/components/cards/LightCardRenderer.tsx`
- `src/services/hapticService.ts`
- `src/services/soundService.ts`
- `src/components/PropertiesPanel.tsx`

---

## Feature 5.3 Overview

**Goal**: Build an enhanced slider card with markers, labels, haptic feedback, animated fill track, and configurable min/max/step logic.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.3`
**Dependencies**: Haptics + animation stack
**Estimated Effort**: 5-6 days
**Status**: Ready to Begin

### Key Requirements

- Horizontal and vertical slider modes
- Configurable min/max/step + precision
- Tick/marker labels and optional zone coloring
- Haptic feedback on value changes
- Optional commit-on-release behavior
- YAML round-trip and schema updates

### YAML Example

```yaml
type: custom:advanced-slider-card
entity: input_number.office_brightness
min: 0
max: 100
step: 5
orientation: horizontal
show_markers: true
show_value: true
haptics:
  enabled: true
  pattern: light
```

---

## Testing Requirements

- Unit: clamp/step rounding, marker generation, commit behavior
- E2E: drag/keyboard input, haptics toggles, YAML round-trip
- Visual: orientation + marker/no-marker variants
- Accessibility: keyboard slider semantics and ARIA value attributes

---

## Clarifying Questions

1. Should slider updates call service on drag (continuous) or only on release by default?
2. Do we support logarithmic scale now or defer?
3. Should haptic intensity vary by step size?

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