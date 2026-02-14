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
