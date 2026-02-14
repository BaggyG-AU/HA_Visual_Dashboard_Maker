# Prompt: Deliver Feature 5.8 - Weather Forecast Visualization

## Context

Implement **Feature 5.8: Weather Forecast Visualization** for **Phase 5: Advanced Visualization Layer**.

**Version target**: `v0.7.5-beta.8`
**Mandatory tripwire phrase**: "The fastest correct fix is already in the repository."

---

## Mandatory Pre-Reading

1. `ai_rules.md`
2. `docs/testing/TESTING_STANDARDS.md`
3. `docs/testing/PLAYWRIGHT_TESTING.md`
4. `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`

---

## References

- `src/components/cards/WeatherForecastCardRenderer.tsx`
- `src/components/cards/HistoryGraphCardRenderer.tsx`
- `src/services/attributeFormatter.ts`

---

## Feature 5.8 Overview

**Goal**: Deliver an enhanced weather visualization card with hourly/daily forecast charts, icon animation options, and summary metrics.

**Branch**: `feature/advanced-visualization-layer`
**Version Target**: `v0.7.5-beta.8`
**Dependencies**: Graph foundation + icon customization
**Estimated Effort**: 4-5 days
**Status**: Ready to Begin

### Key Requirements

- Hourly and daily forecast chart modes
- Temperature, precipitation, wind overlays
- Animated weather icons with reduced-motion fallback
- Configurable unit display and locale formatting
- YAML schema + round-trip persistence

### YAML Example

```yaml
type: custom:weather-forecast-visualization-card
entity: weather.home
mode: hourly
metrics:
  - temperature
  - precipitation
  - wind_speed
icon_animation: subtle
days: 3
```

---

## Testing Requirements

- Unit: forecast mapping, metric toggles, unit/locale formatters
- E2E: configure metrics/mode and verify rendering and YAML round-trip
- Visual: hourly/daily and icon animation off/on snapshots
- Accessibility: text alternatives for forecast points

---

## Clarifying Questions

1. Should this replace `weather-forecast` renderer or remain a separate custom card?
2. Which forecast metrics are required in MVP for all providers?
3. What fallback should display when provider returns partial forecast data?
