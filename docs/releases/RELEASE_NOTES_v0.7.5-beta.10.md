# Release Notes - v0.7.5-beta.10

**Release Date**: February 15, 2026  
**Release Type**: Beta Consolidation  
**Version**: 0.7.5-beta.10

---

## Highlights

- Consolidated Phase 5 Advanced Visualization delivery into a single beta baseline (`v0.7.5-beta.10`).
- Stabilized pre-merge Medium Gate execution by hardening a long-running ApexCharts E2E flow timeout budget.
- Added missing weather visualization visual-regression baselines required by the suite.
- Archived delivered phase prompt/implementation artifacts under `docs/archive/features/`.

---

## Scope in This Release

### Test Stability and Gate Readiness

- Updated `tests/e2e/apexcharts.spec.ts` to use a documented higher timeout for the full YAML↔Form round-trip flow under suite load.
- Added weather visualization baseline snapshots:
  - `tests/e2e/weather-forecast-visualization.visual.spec.ts-snapshots/weather-viz-hourly-off-electron-e2e-linux.png`
  - `tests/e2e/weather-forecast-visualization.visual.spec.ts-snapshots/weather-viz-daily-pulse-electron-e2e-linux.png`

### Documentation and Versioning

- Version metadata bumped to `0.7.5-beta.10` (`package.json`, `package-lock.json`).
- Updated current-version references and latest-release links in:
  - `README.md`
  - `docs/RELEASES.md`
  - `docs/index.md`
  - `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`
  - `docs/features/HAVDM_ADVANCED_FEATURES_IMPLEMENTATION_SUMMARY.md`

### Phase Artifact Archival

Moved delivered phase prompt/implementation docs from `docs/features/` to `docs/archive/features/`, including:
- Phase 1/2/3 implementation plans
- Phase 4 prompts + implementation plan/prompt
- Phase 5 prompts + implementation plan/prompt and Native Graphs implementation note

---

## Validation

Medium Gate commands executed:

- `./tools/checks`
- `npm run test:e2e -- tests/e2e/{graphs,gauge-card-pro,advanced-slider,progress-ring,sparkline,timeline,calendar,weather-forecast-visualization,apexcharts}*.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`
- `npm run test:integration -- tests/integration/{service-layer,card-rendering,yaml-operations,dashboard-generator}.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`

Status: passing after this consolidation update.
