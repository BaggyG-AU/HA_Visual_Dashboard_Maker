# Prompt: Create Phase 5 - Advanced Visualization Layer Artifacts

Use this prompt to create the implementation plan and user stories for Phase 5 of the HAVDM Advanced Features.

---

## Context

You are an AI assistant helping to implement Phase 5 (Advanced Visualization Layer) of the HA Visual Dashboard Maker (HAVDM) project. This is an Electron + React + TypeScript desktop application for creating Home Assistant dashboards.

**Phase 4 (Layout Infrastructure Layer) has been completed**. You are now creating the artifacts and execution plan for Phase 5.

---

## Mandatory Pre-Reading

Before creating any artifacts, you MUST read and understand the following documents in order:

1. **[ai_rules.md](../../ai_rules.md)** - Immutable AI development rules (HIGHEST PRIORITY)
2. **[TESTING_STANDARDS.md](../testing/TESTING_STANDARDS.md)** - DSL-first testing approach, coverage requirements
3. **[PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)** - E2E testing guidelines for Electron
4. **[ARCHITECTURE.md](../architecture/ARCHITECTURE.md)** - Application architecture patterns and code organization
5. **[HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md](./HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md)** - Phase status and timeline
6. **[HAVDM_ADVANCED_FEATURES_USER_STORIES.md](./HAVDM_ADVANCED_FEATURES_USER_STORIES.md)** - User story format and Phase 5 overview
7. **[HAVDM_ADVANCED_FEATURES_IMPLEMENTATION_SUMMARY.md](./HAVDM_ADVANCED_FEATURES_IMPLEMENTATION_SUMMARY.md)** - Program-level implementation context
8. **[LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md](./LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md)** - Completed previous phase template reference

---

## Phase 5: Advanced Visualization Layer - Overview

**Branch Name**: `feature/advanced-visualization-layer`  
**Version Baseline**: `v0.7.5-beta.0` (phase kickoff, no feature delivery yet)  
**Dependencies**: Phases 1-4 foundations available  
**Estimated Duration**: 4-5 weeks  
**Total Features**: 9

**Versioning Convention**:
- `v0.7.<phase>-beta.<feature>`
- Example: `v0.7.5-beta.3` = Phase 5, Feature 3

### Features to Implement

| Feature | Priority | Estimated Effort | Prompt |
|---------|----------|------------------|--------|
| 5.1: Native Graphs | High | 6-7 days | `PHASE_5_1_NATIVE_GRAPHS_PROMPT.md` |
| 5.2: Advanced Gauge Card | High | 5-6 days | `PHASE_5_2_ADVANCED_GAUGE_PROMPT.md` |
| 5.3: Advanced Slider Card | High | 5-6 days | `PHASE_5_3_ADVANCED_SLIDER_PROMPT.md` |
| 5.4: Progress Ring Visualization | Medium | 3-4 days | `PHASE_5_4_PROGRESS_RING_PROMPT.md` |
| 5.5: Sparkline Mini-graphs | Medium | 3-4 days | `PHASE_5_5_SPARKLINE_MINI_GRAPHS_PROMPT.md` |
| 5.6: Timeline Card | Medium | 4-5 days | `PHASE_5_6_TIMELINE_CARD_PROMPT.md` |
| 5.7: Calendar View Card | High | 5-6 days | `PHASE_5_7_CALENDAR_VIEW_PROMPT.md` |
| 5.8: Weather Forecast Visualization | Medium | 4-5 days | `PHASE_5_8_WEATHER_FORECAST_VISUALIZATION_PROMPT.md` |
| 5.9: ApexCharts Advanced Integration | High | 8-12 days | `PHASE_5_9_APEXCHARTS_ADVANCED_INTEGRATION_PROMPT.md` |

### Technology Decisions

- **Charts/Graphs**: Recharts for native visualization workflows
- **Code Organization**: Hybrid approach (`src/features/` for complex features, `src/components/` for renderers)
- **Testing**: Unit + DSL-first E2E + visual regression for every visualization feature
- **Accessibility**: WCAG 2.1 AA required for chart controls and card interactions
- **Compatibility**: YAML round-trip and schema support mandatory for every 5.x feature

---

## Deliverables Required

### 1. Implementation Plan Document

Create `docs/features/ADVANCED_VISUALIZATION_LAYER_IMPLEMENTATION.md`.

Minimum required sections:
- Header (branch, version baseline, dependencies, status)
- Overview (phase goals, business value, key principles)
- Feature status table (5.1-5.9)
- For each feature:
  - Priority, dependencies, estimated effort, status
  - Implementation checklist by phase (component/service/schema/tests/docs)
  - Acceptance criteria (Must Have / Should Have / Won't Have)
  - Risk register
  - Compliance section (ai rules, testing, architecture)
- Phase completion checklist
- Release plan (`v0.7.5-beta.1` to `v0.7.5-beta.9`)

### 2. Kanban User Stories

Prepare user stories (one per feature minimum) with:
- Title
- User story statement
- Scope in/out
- Acceptance criteria
- Technical notes
- Dependencies
- Effort estimate
- Labels (`phase-5`, `visualization`, `charts`, `testing`, etc.)
- Compliance statement

### 3. Feature Prompt Linkage

For each feature work item, reference its dedicated prompt file and ensure execution order/dependencies are explicit.

### 4. Upstream Alignment Gate (Mandatory for 5.x and Later)

For every 5.x+ feature prompt and implementation checklist, include a mandatory pre-implementation gate that requires:
- Review of the relevant upstream base HA/HACS card implementation/docs
- Mapping confirmation to a real upstream card type and YAML contract (`ai_rules.md` Rule 10)
- If unmapped: feasibility assessment of alternative upstream cards, refactor effort/risk, and recommendation to do now vs create a new feature in the relevant phase (for example `5.10`)
- Explicit prohibition on invented custom card type strings unless covered by an exception in `ai_rules.md`

---

## Standards Compliance Requirements

All artifacts MUST include explicit compliance statements for:

1. **ai_rules.md** (immutable rules, reuse-first, state immutability, test workflow)
2. **TESTING_STANDARDS.md** (DSL-first policy and regression gate expectations)
3. **PLAYWRIGHT_TESTING.md** (Electron testing and trace-driven debugging)
4. **ARCHITECTURE.md** (project structure and integration conventions)
5. **HACS/HA upstream mapping gate** for 5.x+ feature prompts and implementation plans

---

## Testing Requirements

Define and enforce for each feature:

1. **Unit Tests**
- Config normalization and validation
- Service logic and edge cases

2. **E2E Tests (DSL-first)**
- Add or extend visualization DSL modules under `tests/support/dsl/`
- Validate user workflows, runtime rendering behavior, and YAML round-trip

3. **Visual Regression**
- Baselines for each chart/card mode and key states

4. **Accessibility Validation**
- Keyboard operation
- ARIA labeling and semantic output
- Reduced-motion behavior where animations exist

---

## Clarifying Questions

Before proceeding with artifact creation, ask these clarifying questions:

1. Should chart-heavy cards prioritize performance constraints for large datasets now, or defer heavy optimization to a follow-up?
2. Do we want all Phase 5 features as new custom card types, or should some extend existing HA/native renderers?
3. What release cadence is preferred: strict one-feature-per-beta (`.1` to `.9`) or grouped releases?
4. Should timeline/calendar use shared event models in Phase 5, or independent MVP models first?
5. For weather visualization, which metrics are mandatory in MVP across all providers?

---

## Output Format

After clarifying questions are resolved, deliver:

1. `docs/features/ADVANCED_VISUALIZATION_LAYER_IMPLEMENTATION.md`
2. Ready-to-import Phase 5 user stories for project tracking
3. A concise execution summary and next-step sequencing by feature

---

## Reference: Prior Phase Baseline

Phase 4 completion artifacts and implementation references:
- `docs/features/LAYOUT_INFRASTRUCTURE_LAYER_IMPLEMENTATION.md`
- `docs/releases/RELEASE_NOTES_v0.7.4-beta.5.md`

Use the same quality bar and structure for Phase 5 planning and execution artifacts.

---

**Document Created**: 2026-02-14  
**Purpose**: Prompt for AI to create Phase 5 implementation artifacts  
**Owner**: Development Team

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
