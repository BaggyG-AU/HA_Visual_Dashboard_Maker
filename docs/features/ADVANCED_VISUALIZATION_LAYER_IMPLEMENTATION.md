# Advanced Visualization Layer - Implementation Plan

**Branch**: `feature/advanced-visualization-layer`  
**Version Baseline**: `v0.7.5-beta.0`  
**Version Range (Feature Delivery)**: `v0.7.5-beta.1` to `v0.7.5-beta.9`  
**Dependencies**: Phases 1-4 complete (colors, gradients, animations, layout infrastructure)  
**Status**: :construction: In Progress (Kickoff)  
**Planned Start**: 2026-02-14

**Versioning Convention**:
- `v0.7.<phase>-beta.<feature>`
- Example: `v0.7.5-beta.3` = Phase 5, Feature 5.3

---

## Overview

**IMPORTANT**: Before implementation, read [ai_rules.md](../../ai_rules.md), [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md), [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md), and [ARCHITECTURE.md](../architecture/ARCHITECTURE.md).

**Phase Goal**: Deliver production-ready advanced visualization capabilities for Home Assistant dashboards, including native graphs, advanced gauges/sliders, progress rings, sparklines, timeline, calendar, enhanced weather visualization, and ApexCharts advanced integration.

**Business Value**:
- Enables high-information dashboards with richer visual analysis.
- Reduces dependence on external chart cards for common graphing needs.
- Improves operational awareness with timeline/calendar/weather visualization.
- Provides consistent YAML round-trip behavior for all advanced visual cards.

**Key Principles**:
- **Reuse First**: Reuse existing renderer/service/DSL patterns before introducing new abstractions.
- **YAML Contract First**: Every feature requires schema + round-trip coverage.
- **Accessibility by Default**: Keyboard navigation + ARIA semantics + reduced-motion support.
- **Deterministic Rendering**: Stable canvas behavior in Electron constraints.
- **Incremental Releases**: One feature per beta increment (`.1` through `.9`).

## Upstream Alignment Gate (Mandatory for 5.x and Later)

Before implementation starts for any Phase 5+ feature, complete an upstream-alignment review:

1. Review the relevant upstream card implementation/docs (base Home Assistant and/or HACS).
2. Confirm whether the proposed card maps to a real upstream card type and YAML contract (`ai_rules.md` Rule 10).
3. If it does not map directly, perform and document a feasibility assessment:
   - Best upstream alternative card(s) and exact `type` strings
   - YAML schema and round-trip compatibility impact
   - Refactor effort and risk (scope estimate)
   - Recommendation: refactor now in current feature vs schedule as a new feature (e.g., `5.10`)
4. Do not ship invented custom card type strings unless explicitly allowed by an exception in `ai_rules.md`.

## Scope Update (New)

- **Date Added**: 2026-02-14
- **Scope Change**: Added **Feature 5.9 - ApexCharts Advanced Integration** as new Phase 5 scope.
- **Reason**: Expand advanced charting support for HACS ApexCharts workflows while preserving native graph scope in 5.1.

---

## Feature Status Overview

| Feature | Priority | Effort | Status | Target Version | Prompt |
|---------|----------|--------|--------|----------------|--------|
| 5.1 Native Graphs | High | 6-7 days | :hourglass_flowing_sand: Ready | `v0.7.5-beta.1` | `docs/features/PHASE_5_1_NATIVE_GRAPHS_PROMPT.md` |
| 5.2 Advanced Gauge Card | High | 5-6 days | :hourglass_flowing_sand: Ready | `v0.7.5-beta.2` | `docs/features/PHASE_5_2_ADVANCED_GAUGE_PROMPT.md` |
| 5.3 Advanced Slider Card | High | 5-6 days | :hourglass_flowing_sand: Ready | `v0.7.5-beta.3` | `docs/features/PHASE_5_3_ADVANCED_SLIDER_PROMPT.md` |
| 5.4 Progress Ring Visualization | Medium | 3-4 days | :hourglass_flowing_sand: Ready | `v0.7.5-beta.4` | `docs/features/PHASE_5_4_PROGRESS_RING_PROMPT.md` |
| 5.5 Sparkline Mini-graphs | Medium | 3-4 days | :hourglass_flowing_sand: Ready | `v0.7.5-beta.5` | `docs/features/PHASE_5_5_SPARKLINE_MINI_GRAPHS_PROMPT.md` |
| 5.6 Timeline Card | Medium | 4-5 days | :hourglass_flowing_sand: Ready | `v0.7.5-beta.6` | `docs/features/PHASE_5_6_TIMELINE_CARD_PROMPT.md` |
| 5.7 Calendar View Card | High | 5-6 days | :hourglass_flowing_sand: Ready | `v0.7.5-beta.7` | `docs/features/PHASE_5_7_CALENDAR_VIEW_PROMPT.md` |
| 5.8 Weather Forecast Visualization | Medium | 4-5 days | :hourglass_flowing_sand: Ready | `v0.7.5-beta.8` | `docs/features/PHASE_5_8_WEATHER_FORECAST_VISUALIZATION_PROMPT.md` |
| 5.9 ApexCharts Advanced Integration | High | 8-12 days | :hourglass_flowing_sand: New Scope Added | `v0.7.5-beta.9` | `docs/features/PHASE_5_9_APEXCHARTS_ADVANCED_INTEGRATION_PROMPT.md` |

**Total Estimated Effort**: 43-55 days (4-5 weeks with parallelizable tasks and overlap).

---

## Feature 5.1: Native Graphs

**Priority**: High  
**Dependencies**: Phase 4 complete  
**Estimated Effort**: 6-7 days  
**Status**: :hourglass_flowing_sand: Ready to Begin

### Implementation Checklist

#### Phase 1: Architecture & Types
- [ ] Create `src/features/graphs/types.ts` for graph config contracts
- [ ] Define chart mode union (`line`, `bar`, `area`, `pie`)
- [ ] Define series config (entity, color, label, axis)

#### Phase 2: Service & Rendering
- [ ] Create `src/features/graphs/graphService.ts`
- [ ] Implement normalization/parsing/validation helpers
- [ ] Create `src/features/graphs/NativeGraphsCard.tsx`
- [ ] Create `src/components/cards/NativeGraphsCardRenderer.tsx`
- [ ] Register renderer in `src/services/cardRegistry.ts`
- [ ] Wire BaseCard dispatch in `src/components/BaseCard.tsx`

#### Phase 3: PropertiesPanel Integration
- [ ] Add graph controls in `src/components/PropertiesPanel.tsx`
- [ ] Ensure Ant Design Tabs/Popover stability patterns per `ai_rules.md` Rule 8
- [ ] Verify live preview updates with structural memo dependencies only

#### Phase 4: Schema & YAML
- [ ] Update `src/schemas/ha-dashboard-schema.json`
- [ ] Add YAML serialization + import normalization
- [ ] Add YAML round-trip tests

#### Phase 5: Testing & Docs
- [ ] Unit tests (`tests/unit/graph-service.spec.ts`)
- [ ] Add `tests/support/dsl/graphs.ts`
- [ ] E2E tests (`tests/e2e/graphs.spec.ts`)
- [ ] Visual tests (`tests/e2e/graphs.visual.spec.ts`)
- [ ] Accessibility checks and docs updates

### Acceptance Criteria

**Must Have**
- [ ] Line/bar/area/pie render correctly
- [ ] Multi-series works with custom labels/colors
- [ ] YAML round-trip preserves graph config
- [ ] PropertiesPanel updates preview deterministically
- [ ] Unit + E2E + visual tests pass

**Should Have**
- [ ] Zoom/pan support for time-series
- [ ] Lightweight empty/error states
- [ ] Configurable smoothing/stacking options

**Won't Have**
- [ ] Server-side aggregation
- [ ] Full virtualization for very large datasets

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Recharts performance with many points | High | Medium | Downsampling + update throttling + bounded defaults |
| Schema complexity drift | Medium | Medium | Strict type contracts + schema snapshots |
| PropertiesPanel remount regressions | High | Medium | Enforce Rule 8a-8e patterns |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature 5.2: Advanced Gauge Card

**Priority**: High  
**Dependencies**: 5.1 + HACS alignment gate  
**Estimated Effort**: 5-6 days  
**Status**: :hourglass_flowing_sand: Ready to Begin

### Implementation Checklist

#### Phase 1: Upstream Mapping + Types & Service
- [ ] Confirm upstream mapping for built-in `gauge` and HACS `custom:gauge-card-pro`
- [ ] Create `src/features/gauge/types.ts`
- [ ] Create `src/features/gauge/gaugeService.ts`
- [ ] Add segment/threshold normalization logic for Gauge Card Pro

#### Phase 2: Renderer
- [ ] Create `src/features/gauge/GaugeCardProCard.tsx`
- [ ] Create `src/components/cards/GaugeCardProCardRenderer.tsx`
- [ ] Register `custom:gauge-card-pro` + BaseCard wiring

#### Phase 3: PropertiesPanel
- [ ] Enhance built-in `gauge` controls (min/max/unit/needle/severity)
- [ ] Add basic Gauge Card Pro controls (header/segments/gradient/needle/unit text)

#### Phase 4: Schema & YAML
- [ ] Add `custom:gauge-card-pro` schema support
- [ ] Verify YAML parser/serializer support
- [ ] Add round-trip test cases for built-in gauge + Gauge Card Pro

#### Phase 5: Testing & Docs
- [ ] Unit tests for value/segment normalization
- [ ] E2E tests for built-in gauge + Gauge Card Pro configuration/runtime updates
- [ ] Visual snapshots for Gauge Card Pro threshold/needle states
- [ ] Accessibility validation + docs

### Acceptance Criteria

**Must Have**
- [ ] Built-in `gauge` workflow remains stable with richer controls
- [ ] Basic `custom:gauge-card-pro` compatibility works and round-trips YAML
- [ ] Segment/threshold colors apply correctly
- [ ] Tests pass

**Should Have**
- [ ] Shared UX patterns between built-in gauge and Gauge Card Pro sections
- [ ] Clear unsupported-option messaging for deferred Gauge Card Pro fields

**Won't Have**
- [ ] Full Gauge Card Pro parity (defer to Feature 5.10)
- [ ] 3D gauge effects or historical overlays inside gauge

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Range interpretation ambiguity | Medium | Medium | Lock inclusive/exclusive behavior in service tests |
| Gauge Card Pro option surface area expands scope | High | Medium | Keep 5.2 basic compatibility and plan full parity as 5.10 |
| Conflicts with existing gauge renderer | Medium | Low | Keep built-in `gauge` path intact and separate from Gauge Card Pro renderer |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature 5.3: Advanced Slider Card

**Priority**: High  
**Dependencies**: Haptics + animation framework  
**Estimated Effort**: 5-6 days  
**Status**: :hourglass_flowing_sand: Ready to Begin

### Implementation Checklist

#### Phase 1: Types & Service
- [ ] Create `src/features/advanced-slider/types.ts`
- [ ] Create `src/features/advanced-slider/advancedSliderService.ts`
- [ ] Implement clamp/step/precision logic

#### Phase 2: Renderer
- [ ] Create `src/features/advanced-slider/AdvancedSliderCard.tsx`
- [ ] Create `src/components/cards/AdvancedSliderCardRenderer.tsx`
- [ ] Register renderer and BaseCard dispatch

#### Phase 3: Integration
- [ ] Integrate haptic feedback hooks via `hapticService`
- [ ] Add optional sound integration via `soundService`
- [ ] Add marker/label rendering

#### Phase 4: PropertiesPanel + Schema
- [ ] Add min/max/step/orientation controls
- [ ] Add marker and commit-on-release controls
- [ ] Add schema + YAML persistence

#### Phase 5: Testing & Docs
- [ ] Unit tests for step rounding and commit behavior
- [ ] E2E tests for drag + keyboard paths
- [ ] Visual tests for orientation/marker variants
- [ ] Accessibility validation and docs

### Acceptance Criteria

**Must Have**
- [ ] Horizontal/vertical modes work
- [ ] Min/max/step logic deterministic
- [ ] Haptic feedback configurable
- [ ] YAML round-trip stable
- [ ] Test suite passes

**Should Have**
- [ ] Marker zones with optional coloring
- [ ] Runtime debounce/commit strategy selection

**Won't Have**
- [ ] Logarithmic scale (deferred)
- [ ] Multi-handle range slider

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Continuous updates overload service calls | High | Medium | Debounced update + commit-on-release mode |
| Haptics behavior differences per platform | Medium | Medium | Capability checks + fallback behavior |
| Accessibility gaps in custom slider semantics | High | Medium | ARIA slider contract tests |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature 5.4: Progress Ring Visualization

**Priority**: Medium  
**Dependencies**: 5.1 graph primitives + color stack  
**Estimated Effort**: 3-4 days  
**Status**: :hourglass_flowing_sand: Ready to Begin

### Implementation Checklist

#### Phase 1: Data Model
- [ ] Create `src/features/progress-ring/types.ts`
- [ ] Create `src/features/progress-ring/progressRingService.ts`
- [ ] Define single and nested ring contracts

#### Phase 2: Renderer
- [ ] Create `src/features/progress-ring/ProgressRingCard.tsx`
- [ ] Create `src/components/cards/ProgressRingCardRenderer.tsx`
- [ ] Add registry + BaseCard support

#### Phase 3: PropertiesPanel + Schema
- [ ] Add ring config editor (thickness, start angle, direction)
- [ ] Add gradient/threshold controls
- [ ] Add schema + YAML support

#### Phase 4: Tests & Docs
- [ ] Unit tests for layout/bounds
- [ ] E2E tests for ring configuration
- [ ] Visual snapshots for single/nested
- [ ] Accessibility labels + docs

### Acceptance Criteria

**Must Have**
- [ ] Single and nested rings render correctly
- [ ] Gradient strokes supported
- [ ] Animation respects reduced-motion
- [ ] YAML round-trip preserved

**Should Have**
- [ ] Per-ring animation easing
- [ ] Fractional label precision controls

**Won't Have**
- [ ] Arbitrary path-based ring shapes

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Nested ring layout overlap | Medium | Medium | Deterministic spacing and radius calculations |
| Label crowding in compact cards | Medium | High | Density heuristics + truncation options |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature 5.5: Sparkline Mini-graphs

**Priority**: Medium  
**Dependencies**: 5.1 data pipeline  
**Estimated Effort**: 3-4 days  
**Status**: :hourglass_flowing_sand: Ready to Begin

### Implementation Checklist

#### Phase 1: Types & Service
- [ ] Create `src/features/sparkline/types.ts`
- [ ] Create `src/features/sparkline/sparklineService.ts`
- [ ] Implement time-range + downsampling normalization

#### Phase 2: Renderer
- [ ] Create `src/features/sparkline/SparklineCard.tsx`
- [ ] Create `src/components/cards/SparklineCardRenderer.tsx`
- [ ] Add registry + BaseCard support

#### Phase 3: Schema & PropertiesPanel
- [ ] Add range/style/marker controls
- [ ] Add schema + YAML round-trip behavior

#### Phase 4: Tests & Docs
- [ ] Unit tests for range/downsampling
- [ ] E2E tests for sparkline workflows
- [ ] Visual tests for line/area compact states
- [ ] Accessibility text fallback checks

### Acceptance Criteria

**Must Have**
- [ ] Line/area sparkline works
- [ ] Range presets function (`1h/6h/24h/7d`)
- [ ] Optional min/max/current markers display
- [ ] YAML round-trip and tests pass

**Should Have**
- [ ] Configurable downsampling strategy
- [ ] Missing-data gap rendering option

**Won't Have**
- [ ] Full interactive chart controls (zoom/pan)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Over-simplified trends after downsampling | Medium | Medium | Preserve extrema + expose strategy |
| Tiny-card readability issues | Medium | High | Marker toggles + compact mode defaults |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature 5.6: Timeline Card

**Priority**: Medium  
**Dependencies**: Layout infrastructure + event model  
**Estimated Effort**: 4-5 days  
**Status**: :hourglass_flowing_sand: Ready to Begin

### Implementation Checklist

#### Phase 1: Event Model
- [ ] Create `src/features/timeline/types.ts`
- [ ] Create `src/features/timeline/timelineService.ts`
- [ ] Implement grouping/sorting/truncation logic

#### Phase 2: Renderer
- [ ] Create `src/features/timeline/TimelineCard.tsx`
- [ ] Create `src/components/cards/TimelineCardRenderer.tsx`
- [ ] Register + BaseCard dispatch wiring

#### Phase 3: Controls + Schema
- [ ] Add orientation/grouping/scrub controls in PropertiesPanel
- [ ] Add schema/YAML contracts
- [ ] Add parser/serializer coverage

#### Phase 4: Tests + Docs
- [ ] Unit tests for event grouping and bounds
- [ ] E2E tests for marker/scrub workflows
- [ ] Visual tests for vertical/horizontal variants
- [ ] Accessibility semantics + docs

### Acceptance Criteria

**Must Have**
- [ ] Timeline renders chronologically
- [ ] Past/present/future marker styles supported
- [ ] Scrub interaction available (read-only MVP)
- [ ] YAML round-trip preserved

**Should Have**
- [ ] Configurable event density
- [ ] Action hooks for selected event/timestamp

**Won't Have**
- [ ] Full timeline virtualization

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Inconsistent event source formats | High | Medium | Centralized normalization service |
| Scrub UX complexity in small cards | Medium | Medium | MVP read-only scrub + defer advanced actions |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature 5.7: Calendar View Card

**Priority**: High  
**Dependencies**: 5.6 event model + layout infra  
**Estimated Effort**: 5-6 days  
**Status**: :hourglass_flowing_sand: Ready to Begin

### Implementation Checklist

#### Phase 1: Model & Service
- [ ] Create `src/features/calendar/types.ts`
- [ ] Create `src/features/calendar/calendarService.ts`
- [ ] Implement month/week/day range generation

#### Phase 2: Renderer
- [ ] Create `src/features/calendar/CalendarViewCard.tsx`
- [ ] Create `src/components/cards/CalendarViewCardRenderer.tsx`
- [ ] Register and wire to BaseCard

#### Phase 3: PropertiesPanel + Schema
- [ ] Add view mode, agenda toggle, week number controls
- [ ] Add event source selector controls
- [ ] Add schema + YAML round-trip support

#### Phase 4: Tests + Docs
- [ ] Unit tests for date-range and overlap handling
- [ ] E2E tests for view switching/date selection
- [ ] Visual tests for month/week/day
- [ ] Accessibility keyboard traversal tests

### Acceptance Criteria

**Must Have**
- [ ] Month/week/day views functional
- [ ] Event markers render correctly
- [ ] Date selection wiring available
- [ ] YAML round-trip preserved

**Should Have**
- [ ] Agenda side-panel option
- [ ] Week-number display toggle

**Won't Have**
- [ ] Full recurrence rule engine (defer)

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Timezone/locale edge cases | High | Medium | Canonical timezone strategy + tests |
| Dense event overlaps in month view | Medium | High | Limit badges + overflow indicators |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature 5.8: Weather Forecast Visualization

**Priority**: Medium  
**Dependencies**: 5.1 graphs + icon customization foundations  
**Estimated Effort**: 4-5 days  
**Status**: :hourglass_flowing_sand: Ready to Begin

### Implementation Checklist

#### Phase 1: Model & Service
- [ ] Create `src/features/weather-viz/types.ts`
- [ ] Create `src/features/weather-viz/weatherVizService.ts`
- [ ] Normalize provider forecast payloads

#### Phase 2: Renderer
- [ ] Create `src/features/weather-viz/WeatherForecastVisualizationCard.tsx`
- [ ] Create `src/components/cards/WeatherForecastVisualizationCardRenderer.tsx`
- [ ] Register renderer + BaseCard support

#### Phase 3: Controls + Schema
- [ ] Add mode/metrics/days controls in PropertiesPanel
- [ ] Add icon animation control with reduced-motion fallback
- [ ] Add schema/YAML round-trip behavior

#### Phase 4: Tests + Docs
- [ ] Unit tests for forecast mapping and formatting
- [ ] E2E tests for hourly/daily and metrics toggles
- [ ] Visual tests for chart modes and icon states
- [ ] Accessibility and docs updates

### Acceptance Criteria

**Must Have**
- [ ] Hourly/daily modes render correctly
- [ ] Temperature/precipitation/wind metrics supported
- [ ] Animated icons respect reduced-motion
- [ ] YAML round-trip preserved

**Should Have**
- [ ] Provider-specific graceful degradation
- [ ] Configurable metric ordering

**Won't Have**
- [ ] Severe weather alert management workflows

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Forecast payload variance across integrations | High | High | Robust adapter + fallback rendering |
| Visual clutter in compact weather cards | Medium | Medium | Mode-specific layout presets |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature 5.9: ApexCharts Advanced Integration (New Scope)

**Priority**: High  
**Dependencies**: 5.1 graph learnings + existing ApexCharts renderer path  
**Estimated Effort**: 8-12 days  
**Status**: :hourglass_flowing_sand: New Scope Added

### Implementation Checklist

#### Phase 1: Architecture & Contracts
- [ ] Create `src/features/apexcharts/` normalization/types contracts for editor-facing Apex configuration
- [ ] Define first-class supported Apex options in form UX vs YAML pass-through-only
- [ ] Add compatibility rules for preserving unknown advanced Apex config

#### Phase 2: Renderer Hardening
- [ ] Extend `src/components/cards/ApexChartsCardRenderer.tsx` with deterministic update paths
- [ ] Add explicit fallback/error rendering for malformed series/config
- [ ] Ensure preview behavior remains stable during frequent config edits

#### Phase 3: PropertiesPanel Integration
- [ ] Expand `src/components/PropertiesPanel.tsx` controls for common Apex workflows (graph span, update interval, chart type, series basics)
- [ ] Keep advanced options available via YAML without destructive normalization
- [ ] Add user-facing guardrails for unsupported combinations

#### Phase 4: Schema + YAML
- [ ] Update `src/schemas/ha-dashboard-schema.json` with Apex-related constraints where safe
- [ ] Preserve full YAML round-trip for `custom:apexcharts-card`
- [ ] Add import/export edge-case handling tests

#### Phase 5: Testing + Docs
- [ ] Unit tests for Apex normalization and fallback behavior
- [ ] E2E tests for editor workflow + YAML round-trip preservation
- [ ] Visual tests for core Apex preview modes
- [ ] Documentation updates and migration notes

### Acceptance Criteria

**Must Have**
- [ ] ApexCharts card remains functional with existing YAML configurations
- [ ] Expanded form controls map correctly to Apex YAML fields
- [ ] Unsupported advanced config is preserved without data loss
- [ ] Deterministic preview updates with no render-loop regressions
- [ ] Unit + E2E + visual tests pass

**Should Have**
- [ ] Warning banners for unsupported or high-risk config combinations
- [ ] Optional helper presets for common Apex configurations

**Won't Have**
- [ ] Full one-to-one UI coverage for every ApexCharts upstream option
- [ ] Automated conversion between native graphs and Apex cards in this phase

### Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Apex option surface area causes schema drift | High | High | Define MVP form subset and preserve unknown YAML keys |
| Preview instability under frequent option edits | High | Medium | Immutable update discipline + targeted renderer fallback states |
| Upstream Apex card changes alter expected config behavior | Medium | Medium | Keep pass-through design and add compatibility validation tests |

### Compliance
- ✅ [ai_rules.md](../../ai_rules.md)
- ✅ [TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)
- ✅ [PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)
- ✅ [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

---

## Feature Prompt Linkage and Execution Order

Execution order and feature prompt references:
1. 5.1 Native Graphs → `docs/features/PHASE_5_1_NATIVE_GRAPHS_PROMPT.md`
2. 5.2 Advanced Gauge Card → `docs/features/PHASE_5_2_ADVANCED_GAUGE_PROMPT.md`
3. 5.3 Advanced Slider Card → `docs/features/PHASE_5_3_ADVANCED_SLIDER_PROMPT.md`
4. 5.4 Progress Ring Visualization → `docs/features/PHASE_5_4_PROGRESS_RING_PROMPT.md`
5. 5.5 Sparkline Mini-graphs → `docs/features/PHASE_5_5_SPARKLINE_MINI_GRAPHS_PROMPT.md`
6. 5.6 Timeline Card → `docs/features/PHASE_5_6_TIMELINE_CARD_PROMPT.md`
7. 5.7 Calendar View Card → `docs/features/PHASE_5_7_CALENDAR_VIEW_PROMPT.md`
8. 5.8 Weather Forecast Visualization → `docs/features/PHASE_5_8_WEATHER_FORECAST_VISUALIZATION_PROMPT.md`
9. 5.9 ApexCharts Advanced Integration → `docs/features/PHASE_5_9_APEXCHARTS_ADVANCED_INTEGRATION_PROMPT.md`

Dependency notes:
- 5.2, 5.4, 5.5 depend on 5.1 graph primitives.
- 5.7 depends on timeline/event modeling from 5.6.
- 5.8 can run parallel to 5.6/5.7 after 5.1.
- 5.9 depends on existing ApexCharts renderer behavior and should execute after 5.1 baseline stabilization.

---

## Kanban User Stories (Ready to Import)

### Story 5.1
- **Title**: Implement Native Graphs card with multi-series Recharts support
- **User Story**: As a dashboard author, I want native line/bar/area/pie charts so that I can visualize entity trends without relying on third-party cards.
- **Scope In**: Recharts card, series config, YAML round-trip, tests
- **Scope Out**: Large-scale virtualization and server-side aggregation
- **Acceptance Criteria**: Must/Should/Won't in Feature 5.1 section
- **Dependencies**: Phase 4 complete
- **Effort**: L
- **Labels**: `phase-5`, `visualization`, `graphs`, `testing`, `schema`
- **Compliance**: `ai_rules.md`, `TESTING_STANDARDS.md`, `PLAYWRIGHT_TESTING.md`, `ARCHITECTURE.md`

### Story 5.2
- **Title**: Align gauge workflows with built-in gauge and basic Gauge Card Pro compatibility
- **User Story**: As a user, I want gauge enhancements that map to real HA/HACS cards so YAML exports deploy cleanly.
- **Scope In**: Built-in `gauge` enhancements, basic `custom:gauge-card-pro` compatibility, YAML/tests
- **Scope Out**: Full Gauge Card Pro parity (defer to `5.10`)
- **Dependencies**: 5.1 + HACS alignment gate
- **Effort**: L
- **Labels**: `phase-5`, `gauge`, `visualization`, `accessibility`
- **Compliance**: Same phase compliance bundle

### Story 5.3
- **Title**: Implement advanced slider card with haptics and marker controls
- **User Story**: As a user, I want a richer slider interaction so that I get precision control and tactile feedback.
- **Scope In**: Orientation, markers, haptics, commit modes, YAML
- **Scope Out**: Logarithmic scale and multi-handle sliders
- **Dependencies**: Haptics and animation foundations
- **Effort**: L
- **Labels**: `phase-5`, `slider`, `haptics`, `testing`
- **Compliance**: Same phase compliance bundle

### Story 5.4
- **Title**: Build progress ring visualization card
- **User Story**: As a user, I want ring-based progress visuals so that I can compare progress values compactly.
- **Scope In**: Single/nested rings, gradients, labels, YAML/tests
- **Scope Out**: Arbitrary shape paths
- **Dependencies**: 5.1
- **Effort**: M
- **Labels**: `phase-5`, `progress-ring`, `visual`
- **Compliance**: Same phase compliance bundle

### Story 5.5
- **Title**: Add sparkline mini-graph card for compact trends
- **User Story**: As a user, I want tiny trend charts so that I can monitor changes without full-size graphs.
- **Scope In**: Line/area compact mode, range presets, markers
- **Scope Out**: Interactive zoom/pan
- **Dependencies**: 5.1
- **Effort**: M
- **Labels**: `phase-5`, `sparkline`, `compact-ui`
- **Compliance**: Same phase compliance bundle

### Story 5.6
- **Title**: Deliver timeline card with chronological event rendering
- **User Story**: As a user, I want event timelines so that I can understand sequence and timing at a glance.
- **Scope In**: Event grouping, markers, scrub MVP, YAML/tests
- **Scope Out**: Full virtualized timeline engine
- **Dependencies**: Layout infrastructure complete
- **Effort**: M/L
- **Labels**: `phase-5`, `timeline`, `events`
- **Compliance**: Same phase compliance bundle

### Story 5.7
- **Title**: Deliver calendar view card for month/week/day event views
- **User Story**: As a user, I want calendar-based visualization so that I can manage date-centric automation and schedules.
- **Scope In**: Month/week/day views, markers, date selection, YAML/tests
- **Scope Out**: Full recurrence engine
- **Dependencies**: 5.6 event model
- **Effort**: L
- **Labels**: `phase-5`, `calendar`, `events`, `accessibility`
- **Compliance**: Same phase compliance bundle

### Story 5.8
- **Title**: Deliver weather forecast visualization card with charts and animated icons
- **User Story**: As a user, I want richer weather visualization so that I can quickly assess upcoming conditions.
- **Scope In**: Hourly/daily modes, metrics, icon animation, YAML/tests
- **Scope Out**: Severe weather alert workflows
- **Dependencies**: 5.1 graph primitives
- **Effort**: M/L
- **Labels**: `phase-5`, `weather`, `visualization`
- **Compliance**: Same phase compliance bundle

### Story 5.9
- **Title**: Expand ApexCharts advanced integration in editor workflows
- **User Story**: As a dashboard author, I want stronger ApexCharts editor support so that I can configure advanced graph cards with safer defaults and reliable YAML preservation.
- **Scope In**: Apex form controls expansion, renderer hardening, schema guardrails, YAML round-trip, tests
- **Scope Out**: Full UI parity for every upstream Apex option and auto-conversion from native graphs
- **Dependencies**: Existing Apex renderer path + Feature 5.1 stability baseline
- **Effort**: L
- **Labels**: `phase-5`, `apexcharts`, `hacs`, `visualization`, `testing`, `schema`
- **Compliance**: Same phase compliance bundle

---

## Phase Completion Checklist

### Implementation Complete
- [ ] All nine features implemented and integrated
- [ ] All schema additions merged without breaking existing cards
- [ ] YAML import/export round-trip stable for all 5.x cards

### Quality Assurance
- [ ] Unit test coverage added for each new service/module
- [ ] E2E flows added using DSL-first approach only
- [ ] Visual snapshots reviewed and approved
- [ ] Accessibility checks completed per feature

### Documentation
- [ ] Product docs updated for all user-facing controls
- [ ] Feature docs updated in `docs/features/`
- [ ] Release notes created for each beta increment

### Compliance Verification
- [ ] `ai_rules.md` requirements met
- [ ] `TESTING_STANDARDS.md` requirements met
- [ ] `PLAYWRIGHT_TESTING.md` runbook and stability patterns met
- [ ] `ARCHITECTURE.md` organization patterns met
- [ ] Upstream Alignment Gate completed and documented for each 5.x+ feature (mapping or feasibility assessment)

---

## Release Plan (Phase 5)

| Version | Scope | Exit Criteria |
|---------|-------|---------------|
| `v0.7.5-beta.0` | Phase kickoff planning | Prompts + implementation plan approved |
| `v0.7.5-beta.1` | Feature 5.1 Native Graphs | Graph card + tests + schema + docs |
| `v0.7.5-beta.2` | Feature 5.2 Advanced Gauge | Gauge card + tests + schema + docs |
| `v0.7.5-beta.3` | Feature 5.3 Advanced Slider | Slider card + haptics + tests + docs |
| `v0.7.5-beta.4` | Feature 5.4 Progress Ring | Ring card + tests + docs |
| `v0.7.5-beta.5` | Feature 5.5 Sparklines | Sparkline card + tests + docs |
| `v0.7.5-beta.6` | Feature 5.6 Timeline | Timeline card + tests + docs |
| `v0.7.5-beta.7` | Feature 5.7 Calendar View | Calendar card + tests + docs |
| `v0.7.5-beta.8` | Feature 5.8 Weather Viz | Weather viz card + tests + docs |
| `v0.7.5-beta.9` | Feature 5.9 ApexCharts Integration | ApexCharts advanced integration + tests + schema + docs |

Release discipline:
- One feature release must pass feature-targeted tests before next feature begins.
- Any shared DSL changes trigger blast-radius validation per standards.

---

## Clarifying Decisions (Tracked)

Pending decisions from phase prompt are tracked and defaulted as follows until changed by user:
- Performance constraints: prioritize correctness first, add bounded defaults and downsampling now.
- Card strategy: new custom card types for 5.x (no replacement of existing baseline renderers in this phase).
- Release cadence: strict one-feature-per-beta (`.1` to `.9`).
- Timeline/calendar model: shared normalized event model introduced by 5.6 and reused by 5.7.
- Weather MVP metrics: temperature, precipitation, wind speed mandatory.

---

**Document Status**: :construction: Ready for Execution  
**Last Updated**: February 14, 2026  
**Next Review**: After Feature 5.1 completion  
**Owner**: Development Team
