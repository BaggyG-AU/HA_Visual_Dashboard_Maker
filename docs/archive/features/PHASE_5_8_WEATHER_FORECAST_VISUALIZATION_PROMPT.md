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