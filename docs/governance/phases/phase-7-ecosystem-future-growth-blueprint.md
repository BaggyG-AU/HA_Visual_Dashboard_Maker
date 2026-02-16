Phase Name: Phase 7 – Ecosystem & Future Growth
CURRENT_VERSION: 0.7.5-beta.10
INITIATION_VERSION: 0.7.7-beta.0
Generated: 2026-02-16T08:58:59Z
Governance Mode: HARD MODE++
AI Model: GPT-5 (Codex)
References:
  - ai_rules.md
  - docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md

# Phase Governance Blueprint — Phase 7 – Ecosystem & Future Growth

PHASE_NAME: 'Phase 7 – Ecosystem & Future Growth'
CURRENT_VERSION: '0.7.5-beta.10'
INITIATION_VERSION: '0.7.7-beta.0'
Governance Mode: HARD MODE++

## 0) Executive Summary
- Phase intent: deliver Phase 7 ecosystem capabilities (preset marketplace, theme manager expansion, duplication/cloning, bulk operations, version-control integration boundaries, import/export enhancements, dashboard analytics, plugin architecture scaffold) with strict regression containment.
- Why it matters: this phase turns current feature breadth into reusable ecosystem workflows and sustainable extension points.
- CURRENT_VERSION validation: `package.json` version is `0.7.5-beta.10`; matches invocation input.
- INITIATION_VERSION validation: `0.7.7-beta.0` is a monotonic SemVer pre-release progression from `0.7.5-beta.10` (patch-line advance + prerelease reset). Bump logic is valid and non-ambiguous.
- Top risk flags:
1. `HIGH` selector/DSL blast radius from bulk operations and multi-select UX.
2. `HIGH` YAML compatibility drift from import/export enhancement work.
3. `HIGH` IPC surface expansion risk for version-control and plugin scaffolding.
4. `MEDIUM-HIGH` state mutation regressions in duplication/cloning and bulk updates.
5. `MEDIUM` performance regression risk from analytics instrumentation and marketplace indexing.
- High-level blast radius: `src/components/**`, `src/services/**`, `src/store/**`, `src/main.ts`, `src/preload.ts`, `tests/support/dsl/**`, `tests/e2e/**`, `tests/integration/**`.
- Confidence score: `84/100`.

## 1) Repo Evidence Index
- `src/store/dashboardStore.ts`; `useDashboardStore` actions `updateConfig`, `beginBatchUpdate`, `applyBatchedConfig`, `undo/redo`; central immutable state/history seam for clone and bulk change containment.
- `src/services/entityRemapping.ts`; class `EntityRemappingService` methods `extractEntityIds`, `buildSuggestions`, `autoMapSuggestions`, `applyMappings`; existing remap engine for preset import workflows.
- `src/services/themeService.ts`; class `ThemeService` methods `applyThemeToElement`, `generateThemeCSS`, `getThemeColors`; current theme transformation path for theme manager expansion.
- `src/store/themeStore.ts`; `setAvailableThemes`, `setTheme`; store-level theme synchronization behavior and persistence coupling.
- `src/components/ThemeSettingsDialog.tsx`; `ThemeSettingsDialog`; existing UI/testing seam for expanded theme management.
- `src/services/yamlService.ts`; class `YAMLService` parse/serialize lifecycle and `importDashboard`/`exportDashboard` orchestration; compatibility-critical import/export boundary.
- `src/services/yamlConversionService.ts`; `importCard`, `exportCard`, `importDashboard`, `exportDashboard`; card-type conversion boundary and migration chokepoint.
- `src/services/fileService.ts`; file open/read/write/save abstraction used by import/export and preset/theme packaging.
- `src/components/GridCanvas.tsx`; canvas rendering and layout updates; bulk operations and multi-select integration risk surface.
- `src/components/BaseCard.tsx`; card rendering switchboard and trigger animation hooks; duplication and plugin-like card registration compatibility surface.
- `src/services/cardRegistry.ts`; `CardRegistry` + metadata source handling (`builtin/hacs/custom/discovered`); ecosystem registry backbone for marketplace/plugin-oriented slices.
- `src/main.ts`; IPC handlers (`fs:*`, `settings:*`, `ha:*`, `shell:*`); Electron boundary where new capabilities must remain additive and stable.
- `src/preload.ts`; `ElectronAPI` exposure contract; compatibility-critical renderer boundary.
- `tests/support/dsl/dashboard.ts`; `DashboardDSL` workflow abstraction baseline for new dashboard-level operations.
- `tests/support/dsl/propertiesPanel.ts`, `tests/support/dsl/canvas.ts`, `tests/support/dsl/cardPalette.ts`; reusable DSL entry points to extend before any raw-spec selector changes.
- `tests/integration/yaml-operations.spec.ts`; YAML parse/export regression baseline.
- `tests/integration/service-layer.spec.ts`; service and registry assertions including HACS-source expectations.
- `tests/integration/theme-integration.spec.ts`; current theme selector/settings coverage.
- `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md`; authoritative Phase 7 feature scope and dependency intent.
- `ai_rules.md`; immutable implementation safety, DSL contracts, workflow constraints.

## 2) Current Architecture Snapshot (CURRENT_VERSION)
- Electron boundary is explicit and centralized: IPC handlers in `src/main.ts`, bridge contract in `src/preload.ts`, renderer consumption through `window.electronAPI`.
- Dashboard state and undo/redo are centralized in `src/store/dashboardStore.ts` with immutable transitions and batch-update primitives.
- YAML lifecycle is mediated by `src/services/yamlService.ts` and `src/services/yamlConversionService.ts`, making conversion logic the highest compatibility lever.
- Theme synchronization already exists via `src/store/themeStore.ts` and `src/components/ThemeSettingsDialog.tsx`, but lacks full ecosystem-level theme packaging/versioning workflows.
- Card ecosystem metadata is already structured in `src/services/cardRegistry.ts` with source attribution (`hacs` etc.), enabling marketplace/plugin slice foundations without rewriting render architecture.
- Test architecture is DSL-first for e2e (`tests/support/dsl/**`) with integration service coverage (`tests/integration/**`).
- Fragility zones for this phase: selection and batch operations in canvas + panel flows, IPC expansion risk, YAML round-trip integrity, DSL blast radius when workflow steps change.

## 3) Phase Objective Clarification
- Goals:
1. Preset marketplace workflows.
2. Theme manager ecosystem maturity.
3. Card duplication and cross-view cloning.
4. Bulk operations on multiple cards.
5. Version-control integration boundaries (safe, additive).
6. Import/export enhancement and conversion hardening.
7. Dashboard analytics instrumentation.
8. Plugin system architecture scaffold.
- Work type: additive feature delivery plus targeted hardening on existing seams.
- Architectural non-goals:
1. No broad renderer rewrite.
2. No breaking IPC API replacement.
3. No incompatible YAML schema migration in this phase.

### Assumption Register
| Assumption | Rationale | Confidence | Validation Path |
|---|---|---:|---|
| Phase 7 scope source is `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md` | Explicit Phase 7 section lists eight features and dependencies | High | `docs/features/HAVDM_ADVANCED_FEATURES_PHASES_SUMMARY.md` |
| Existing `theme` and `entity remapping` services are intended extension points, not throwaway code | Dedicated services + integration tests already exist | High | `src/services/themeService.ts`, `src/services/entityRemapping.ts`, `tests/integration/theme-integration.spec.ts` |
| Plugin system work in this phase should be architecture-first (API scaffold + guardrails), not full third-party execution runtime | Current repo has no plugin runtime subsystem and strong IPC safety requirements | Medium-High | `src/main.ts`, `src/preload.ts`, `ai_rules.md` |
| Version-control integration should begin as bounded workflow integration, not full git UI parity | No existing first-class VCS UI modules in renderer; high blast radius if over-scoped | Medium | `src/components/**`, `src/services/**`, `tools/` scripts |

## 4) “Do Not Touch” Registry
- Do not change existing IPC channel names in `src/main.ts` and `src/preload.ts` unless slice explicitly includes compatibility proof and additive fallback.
- Do not mutate dashboard state objects in place; immutable rule from `ai_rules.md` is mandatory.
- Do not bypass DSL by inserting raw selectors into e2e specs; extend `tests/support/dsl/**` first.
- Do not introduce breaking YAML output shape changes in `src/services/yamlConversionService.ts` without explicit compatibility mapping and integration evidence.
- Do not alter card type strings away from HA/HACS aligned values (see existing `cardRegistry` and HACS alignment docs).

## 5) Subsystem Impact Map (Scored)
| Subsystem | Risk (1-5) | Blast Radius | Why |
|---|---:|---|---|
| Dashboard state/store (`src/store/dashboardStore.ts`) | 5 | High | Bulk operations and clone workflows depend on history-safe immutable updates |
| YAML conversion/serialization (`src/services/yamlService.ts`, `src/services/yamlConversionService.ts`) | 5 | High | Import/export enhancements can break round-trip compatibility |
| DSL + E2E contracts (`tests/support/dsl/**`) | 5 | High | New workflow steps can cascade failures if DSL not updated first |
| IPC boundary (`src/main.ts`, `src/preload.ts`) | 4 | Medium-High | Version-control/plugin/marketplace operations may require new channels |
| Theme subsystem (`src/store/themeStore.ts`, `src/components/ThemeSettingsDialog.tsx`) | 4 | Medium | Expanded theme manager can affect global rendering and settings persistence |
| Card registry/render mapping (`src/services/cardRegistry.ts`, `src/components/BaseCard.tsx`) | 4 | Medium | Ecosystem expansion pressures registry contract and unsupported-card behavior |
| Canvas interaction (`src/components/GridCanvas.tsx`) | 4 | Medium | Multi-select and bulk edits stress layout and selection semantics |
| Analytics instrumentation (`src/services/logger.ts` and new analytics service) | 3 | Medium | Performance and privacy constraints if over-instrumented |

## 6) State Mutation & Data Integrity Audit
- Existing immutable update discipline in `dashboardStore` is adequate but high-risk for bulk edits; all Phase 7 state mutations must preserve undo/redo semantics.
- `beginBatchUpdate` / `applyBatchedConfig` / `endBatchUpdate` in `src/store/dashboardStore.ts` is the preferred containment mechanism for bulk operations; avoid introducing parallel history stacks.
- Clone/duplicate operations must preserve card identity rules where needed but avoid accidental reference sharing of nested objects.
- Preset/theme import flows must validate structure before merge/apply and avoid partial mutation when validation fails.
- Data integrity stop triggers:
1. Undo/redo no longer deterministic after bulk action.
2. Imported dashboard differs structurally after immediate export without intentional normalization.
3. Theme apply introduces persistent global CSS variable leaks across mode switches.

## 7) IPC & Electron Boundary Review
- IPC contract is already broad; Phase 7 additions must be additive and typed in both `src/preload.ts` interface and invocation map.
- Security baseline in current app (`contextIsolation: true`, `nodeIntegration: false`) must remain unchanged.
- Version-control integration must never expose unrestricted shell execution directly to renderer; main-process mediated and scope-restricted commands only.
- Plugin architecture slice must start with manifest/contract validation and capability boundaries; execution sandboxing design is mandatory before runtime loading.
- Any new `shell:openExternal` style behaviors must include allowlist/validation constraints to reduce abuse risk.

## 8) Monaco / YAML Deep Review
- Import/export enhancements should primarily evolve conversion and YAML services, not Monaco editor runtime.
- `src/services/yamlConversionService.ts` already provides card-specific import/export hooks and is the correct insertion point for ecosystem mapping enhancements.
- Round-trip guarantees must be proven by integration tests (`tests/integration/yaml-operations.spec.ts`, `tests/integration/service-layer.spec.ts`) and new Phase 7 fixtures.
- High-risk path: introducing presets/plugins metadata fields that leak into YAML output without backward-compatible gating.
- Performance constraint: YAML parse/serialize operations remain responsive for typical dashboards and avoid repeated full conversion passes on minor UI events.

## 9) E2E Regression Surface Mapping
- Highest-risk existing specs to keep green while executing Phase 7:
1. `tests/e2e/properties-panel.spec.ts`
2. `tests/e2e/yaml-editor.spec.ts`
3. `tests/e2e/entity-context.spec.ts`
4. `tests/e2e/conditional-visibility.spec.ts`
5. `tests/e2e/templates.spec.ts`
- Highest-risk integration specs:
1. `tests/integration/yaml-operations.spec.ts`
2. `tests/integration/service-layer.spec.ts`
3. `tests/integration/theme-integration.spec.ts`
4. `tests/integration/theme-integration-mocked.spec.ts`
- DSL extension candidates before touching specs:
1. `tests/support/dsl/dashboard.ts` for clone/duplicate/bulk dashboard-level flows.
2. `tests/support/dsl/canvas.ts` for multi-select interactions.
3. `tests/support/dsl/propertiesPanel.ts` for batch property edits.
4. New `tests/support/dsl/presets.ts` and `tests/support/dsl/plugins.ts` only if no existing DSL pattern can be reused.

## 10) Performance & UX Budget
- Preserve editor interactivity under common dashboard sizes:
1. No additional full-canvas rerender per single-card property edit.
2. Bulk operations should complete in bounded time without UI freeze.
3. Preset/theme browsing interactions should remain responsive.
- YAML operations:
1. No repeated parse/serialize loops during idle states.
2. Import/export enhancements must avoid O(n^2) transformation patterns on card arrays.
- Analytics:
1. Instrumentation must be opt-in/controlled.
2. No high-frequency synchronous logging on render path.
- Stability:
1. No new timer/listener leaks.
2. No increase in flaky waits caused by UI remount churn.

## 11) Backwards Compatibility Matrix
| Surface | Compatibility Requirement |
|---|---|
| Existing dashboard YAML files | Must load and render without migration failures |
| Existing theme selection behavior | Must continue working with current `ThemeSettingsDialog` and `themeStore` APIs |
| Existing card registry metadata | Existing types/source fields remain valid and queryable |
| Existing IPC consumers | Existing `window.electronAPI` methods remain unchanged |
| Existing DSL methods/spec selectors | Existing flows remain functional; new behaviors are additive in DSL |
| Existing saved settings | No destructive reset of theme/logging/sound/haptics/recent-files preferences |

## 12) Ordered Feature Slice Plan
- Slice A: Preset Marketplace foundations (model, service contract, browsing/import seams).
- Slice B: Theme Manager expansion (save/load/theme package import-export and per-view overrides).
- Slice C: Card Duplication and Cloning workflows.
- Slice D: Bulk Operations and multi-select mutation safety.
- Slice E: Version Control Integration boundaries (safe additive git workflow integration).
- Slice F: Import/Export Enhancements and conversion hardening.
- Slice G: Dashboard Analytics instrumentation.
- Slice H: Plugin System Architecture scaffold and security envelope.
- Slice I: Medium Gate packaging and release-readiness evidence.

## 13) Codex-Ready Feature Prompts (Per Slice)

### Slice A Prompt — Preset Marketplace Foundations
```markdown
Context:
You are implementing Slice A for Phase 7 in HAVDM. This slice is governed by `ai_rules.md` and `docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md`.

Objective:
Add preset marketplace foundational architecture that supports listing, preview metadata, and import wiring with entity remapping integration.

Evidence Scope:
- `src/services/entityRemapping.ts` (`EntityRemappingService`) already provides entity remap primitives.
- `src/services/fileService.ts` provides file IO abstraction.
- `src/components/DashboardBrowser.tsx` is an existing browse/import UI pattern.

Allowed Files:
- `src/features/preset-marketplace/**` (new feature folder)
- `src/services/presetService.ts` (new service)
- minimal integration points in `src/components/**` and `src/store/**`
- tests under `tests/unit/**`, `tests/integration/**`, `tests/e2e/**`, `tests/support/dsl/**`

Forbidden:
- No broad `GridCanvas` rewrite.
- No breaking changes to existing `window.electronAPI` methods.
- No raw selector logic directly in e2e specs.

Mandatory `ai_rules.md` Compliance:
- Enforce Immutable Reuse Rule in order: passing specs -> DSL methods -> helpers/fixtures.
- Do not add duplicate DSL methods for existing actions.
- Use immutable state updates only.
- Follow test execution/reporting pause rules.

DSL Contract (if DSL touched):
- Provide consumer inventory (`rg` list of spec consumers).
- Provide compatibility statement.
- Provide execution evidence and artifact paths.

Stability Rules:
- Preserve current dashboard load/open flows.
- Avoid modal focus trap regressions.

State Safety Rules:
- No in-place mutation of dashboard config objects during preset import.

IPC Safety Rules:
- Any new IPC must be additive and typed in `src/preload.ts`.

Performance Constraints:
- Preset list retrieval and render should not block main UI thread.

Required Tests:
- Add unit tests for preset metadata validation/parsing.
- Add integration tests for preset import + remapping path.
- Add e2e test for browse -> preview -> import workflow through DSL.

Verification Commands:
- `npm run lint`
- `npm run test:unit -- tests/unit/preset-service.spec.ts`
- `npm run test:integration -- tests/integration/preset-marketplace.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- tests/e2e/preset-marketplace.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If preset model conflicts with existing dashboard schema, stop and design additive mapping.
2. If DSL gaps exist, extend shared DSL once; do not patch multiple specs.
3. If import causes YAML drift, stop and move mapping logic into conversion/service seam.

Stop Conditions:
- Any dashboard load regression outside preset flows.
- Any selector churn requiring direct spec edits.
- >2 unrelated test failures.

Definition of Done:
- Preset foundation supports browse/preview/import path.
- Entity remapping hook is integrated and tested.
- All required tests pass.

Versioning Rules:
- No version bump in this slice.
```

### Slice B Prompt — Theme Manager Expansion
```markdown
Context:
Implement advanced theme manager capabilities on top of existing theme services and store.

Objective:
Deliver complete theme save/load/import/export workflows and per-view override support while preserving current theme sync behavior.

Evidence Scope:
- `src/services/themeService.ts` (`ThemeService`) transforms/apply theme variables.
- `src/store/themeStore.ts` handles available/current theme state.
- `src/components/ThemeSettingsDialog.tsx` provides current settings UI and test IDs.

Allowed Files:
- `src/features/theme-manager/**` (new)
- `src/services/themeService.ts` (targeted extension)
- `src/store/themeStore.ts` (targeted extension)
- `src/components/ThemeSettingsDialog.tsx` (bounded updates)

Forbidden:
- No global CSS architecture rewrite.
- No breaking changes to existing theme-related IPC methods.

Mandatory `ai_rules.md` Compliance:
- Immutable Reuse Rule search order is mandatory.
- React stability rules for tabs/popovers and memoization are mandatory.
- No duplicate DSL coverage for existing theme actions.

DSL Contract (if DSL touched):
- Consumer inventory + compatibility statement + evidence artifacts.

Stability Rules:
- Existing theme selector visibility behavior must remain unchanged.

State Safety Rules:
- Theme updates must be immutable and preserve sync-with-HA preference semantics.

IPC Safety Rules:
- Theme persistence expansion must be additive and backward compatible.

Performance Constraints:
- Theme apply should not trigger avoidable full-app rerender loops.

Required Tests:
- Update/add unit tests for theme serialization and overrides.
- Extend integration tests around theme settings and sync behavior.
- Add e2e flow for theme import/export.

Verification Commands:
- `npm run lint`
- `npm run test:unit -- tests/unit/theme-service.spec.ts`
- `npm run test:integration -- tests/integration/theme-integration.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- tests/e2e/theme-manager.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If per-view overrides conflict with existing global theme model, introduce additive schema keys only.
2. If tab/popover instability appears, first audit memoization in dialog items.

Stop Conditions:
- Theme selector disappears/regresses in connected HA flows.
- New popover remount instability appears.
- >2 unrelated failures.

Definition of Done:
- Theme manager supports save/load/import/export plus per-view override behavior.
- Existing theme integration tests remain green.

Versioning Rules:
- No version bump in this slice.
```

### Slice C Prompt — Card Duplication & Cloning
```markdown
Context:
Implement card duplication and cross-view cloning with strict history and data integrity controls.

Objective:
Add duplicate/clone actions that preserve config correctness, avoid shared references, and integrate with selection history.

Evidence Scope:
- `src/store/dashboardStore.ts` provides history and batching primitives.
- `src/components/GridCanvas.tsx` and card action surfaces are current interaction seams.

Allowed Files:
- targeted `src/components/GridCanvas.tsx`, related menu/action components
- targeted `src/store/dashboardStore.ts`
- helper utilities under `src/utils/**` or `src/services/**` as needed

Forbidden:
- No full canvas interaction rewrite.
- No non-immutable config mutation shortcuts.

Mandatory `ai_rules.md` Compliance:
- Immutable Reuse Rule is mandatory.
- Immutable updates only.
- DSL-first approach for workflow changes.

DSL Contract (if DSL touched):
- Consumer inventory and compatibility statement required.

Stability Rules:
- Existing card selection and drag behavior must remain stable.

State Safety Rules:
- Duplicate/clone must deep-copy mutable nested configuration branches.
- Undo/redo must remain deterministic.

IPC Safety Rules:
- No IPC changes expected. If introduced, justify and keep additive.

Performance Constraints:
- Duplicate action should not re-render unaffected views excessively.

Required Tests:
- Unit tests for clone utility and copy isolation behavior.
- Integration tests for store history behavior after duplicate/clone.
- E2E coverage for duplicate and clone flows.

Verification Commands:
- `npm run lint`
- `npm run test:unit -- tests/unit/card-clone.spec.ts`
- `npm run test:integration -- tests/integration/card-clone.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- tests/e2e/card-clone.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If clone introduces reference-sharing bugs, isolate with unit tests before UI changes.
2. If history churn occurs, route through batching APIs.

Stop Conditions:
- Undo/redo regression.
- Clone causes cross-card unintended edits.
- >2 unrelated failures.

Definition of Done:
- Duplicate and clone workflows behave correctly and are regression-covered.

Versioning Rules:
- No version bump in this slice.
```

### Slice D Prompt — Bulk Operations
```markdown
Context:
Implement multi-select and bulk property operations with bounded UI and state complexity.

Objective:
Add bulk select, bulk update, bulk move/delete/copy operations with deterministic behavior and regression-safe DSL updates.

Evidence Scope:
- `src/components/GridCanvas.tsx` governs layout/selection rendering.
- `src/store/dashboardStore.ts` supports batched updates and history.
- Existing DSL in `tests/support/dsl/canvas.ts` and `tests/support/dsl/propertiesPanel.ts` should be extended.

Allowed Files:
- `src/components/GridCanvas.tsx` and closely related selection components
- `src/store/dashboardStore.ts`
- optional helper utilities under `src/services/**` or `src/utils/**`
- DSL and tests for bulk workflows

Forbidden:
- No selector rewrites across many specs.
- No uncontrolled stateful hacks for selection persistence.

Mandatory `ai_rules.md` Compliance:
- Immutable Reuse Rule.
- DSL-first test updates.
- Immutable state updates.

DSL Contract (if DSL touched):
- Consumer inventory and compatibility statement required.

Stability Rules:
- Single-card operations must continue to work unchanged.

State Safety Rules:
- Bulk edits must use batched immutable updates and preserve undo granularity.

IPC Safety Rules:
- No IPC changes unless explicitly required and additive.

Performance Constraints:
- Multi-select interaction remains responsive with medium dashboard sizes.

Required Tests:
- Unit tests for selection reducer/helpers.
- Integration tests for bulk operations and history.
- E2E tests for multi-select + bulk property edit flows.

Verification Commands:
- `npm run lint`
- `npm run test:unit -- tests/unit/bulk-operations.spec.ts`
- `npm run test:integration -- tests/integration/bulk-operations.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- tests/e2e/bulk-operations.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If selection model destabilizes drag/drop, split state transitions and add focused tests.
2. If DSL methods become overloaded, extract focused DSL helper but avoid duplicates.

Stop Conditions:
- Selection desync between UI and store.
- Noticeable render churn spike.
- >2 unrelated failures.

Definition of Done:
- Bulk operations are usable, deterministic, and tested.

Versioning Rules:
- No version bump in this slice.
```

### Slice E Prompt — Version Control Integration Boundaries
```markdown
Context:
Add bounded version-control integration to improve dashboard history workflows without exposing unsafe shell behavior.

Objective:
Implement safe, scoped VCS integration surfaces (status/diff/commit intent flows) with strict Electron boundary controls.

Evidence Scope:
- Current git workflow scripts are in `tools/feature-start` and `tools/feature-finish` (policy in `ai_rules.md`).
- Electron boundary is `src/main.ts` + `src/preload.ts`.

Allowed Files:
- `src/services/versionControlService.ts` (new)
- targeted updates in `src/main.ts` and `src/preload.ts`
- minimal UI surfaces under `src/components/**`

Forbidden:
- No unrestricted renderer-to-shell execution.
- No bypass of existing feature workflow policies.

Mandatory `ai_rules.md` Compliance:
- Enforce safe git workflow policy.
- Immutable Reuse Rule.
- DSL extension before direct spec manipulation.

DSL Contract (if DSL touched):
- Consumer inventory + compatibility + evidence required.

Stability Rules:
- Existing dashboard editing workflow must remain unaffected when VCS features are unused.

State Safety Rules:
- VCS UI state must not interfere with dashboard store state transitions.

IPC Safety Rules:
- IPC methods must be additive, argument-validated, and least privilege.

Performance Constraints:
- VCS status polling must be bounded and non-blocking.

Required Tests:
- Unit tests for VCS command validation/parsing.
- Integration tests for IPC boundary and error handling.
- E2E smoke for invoking VCS workflow from UI.

Verification Commands:
- `npm run lint`
- `npm run test:unit -- tests/unit/version-control-service.spec.ts`
- `npm run test:integration -- tests/integration/version-control.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- tests/e2e/version-control.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If any IPC command scope is unclear, stop and narrow command contract first.
2. If feature workflow conflicts with `ai_rules.md`, follow `ai_rules.md`.

Stop Conditions:
- Any unsafe shell exposure path discovered.
- IPC compatibility break in existing APIs.
- >2 unrelated failures.

Definition of Done:
- Safe VCS integration baseline exists with additive IPC and test proof.

Versioning Rules:
- No version bump in this slice.
```

### Slice F Prompt — Import/Export Enhancements
```markdown
Context:
Enhance import/export capabilities and format conversion while preserving YAML compatibility and conversion determinism.

Objective:
Deliver robust import/export improvements (YAML/JSON/UI mode conversions, validation on export, richer import sources) using existing conversion seams.

Evidence Scope:
- `src/services/yamlService.ts` orchestrates parse/serialize.
- `src/services/yamlConversionService.ts` handles import/export card mappings.
- `tests/integration/yaml-operations.spec.ts` and `tests/integration/service-layer.spec.ts` are current compatibility baselines.

Allowed Files:
- targeted changes in `src/services/yamlService.ts`, `src/services/yamlConversionService.ts`, `src/services/fileService.ts`
- minimal UI integration changes in import/export dialogs/components
- tests and fixtures updates

Forbidden:
- No breaking YAML schema changes.
- No replacing conversion architecture wholesale.

Mandatory `ai_rules.md` Compliance:
- Immutable Reuse Rule.
- DSL and helper reuse before adding new abstractions.
- pause/diagnose/ask policy on failures.

DSL Contract (if DSL touched):
- Provide consumer inventory and compatibility statement.

Stability Rules:
- Existing import/export commands remain functional.

State Safety Rules:
- Import apply path must avoid partial state mutation on failure.

IPC Safety Rules:
- File and HA integration IPC calls remain backward compatible.

Performance Constraints:
- Conversion for common dashboards must remain responsive.

Required Tests:
- Unit tests for conversion edge-cases and normalization.
- Integration tests for round-trip safety and import failures.
- E2E coverage for enhanced import/export user flows.

Verification Commands:
- `npm run lint`
- `npm run test:unit -- tests/unit/yaml-conversion-service.spec.ts`
- `npm run test:integration -- tests/integration/yaml-operations.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- tests/e2e/import-export-enhancements.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If conversion diff appears, compare normalized structures before changing UI.
2. If bug is card-specific, isolate in card conversion function.

Stop Conditions:
- Round-trip drift for existing fixture dashboards.
- Exported config invalid for previously valid dashboards.
- >2 unrelated failures.

Definition of Done:
- Enhanced import/export paths are robust and compatibility-preserving.

Versioning Rules:
- No version bump in this slice.
```

### Slice G Prompt — Dashboard Analytics
```markdown
Context:
Add dashboard analytics with clear boundaries, opt-in behavior, and low overhead.

Objective:
Implement usage/performance analytics primitives (render timing, feature usage counters, dashboard health scoring inputs) without destabilizing runtime performance.

Evidence Scope:
- Existing logging baseline in `src/services/logger.ts`.
- Candidate instrumentation points in `src/components/GridCanvas.tsx`, `src/components/BaseCard.tsx`, and dashboard load/save paths.

Allowed Files:
- `src/services/analyticsService.ts` (new)
- minimal instrumentation in components/services
- settings integration for analytics opt-in controls

Forbidden:
- No high-frequency synchronous log spam.
- No telemetry exfiltration beyond declared local/storage behavior unless explicitly scoped.

Mandatory `ai_rules.md` Compliance:
- Immutable Reuse Rule.
- Maintain implementation safety and state integrity.
- DSL reuse for test flows.

DSL Contract (if DSL touched):
- Consumer inventory and compatibility statement.

Stability Rules:
- Analytics disabled mode must preserve existing behavior exactly.

State Safety Rules:
- Analytics state must be isolated from primary dashboard mutation paths.

IPC Safety Rules:
- Any new persistence IPC remains additive and typed.

Performance Constraints:
- Instrumentation overhead must remain low and non-blocking.

Required Tests:
- Unit tests for analytics aggregation and scoring logic.
- Integration tests for enable/disable behavior and persistence.
- E2E smoke for analytics settings and dashboard metrics visibility.

Verification Commands:
- `npm run lint`
- `npm run test:unit -- tests/unit/analytics-service.spec.ts`
- `npm run test:integration -- tests/integration/dashboard-analytics.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- tests/e2e/dashboard-analytics.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If instrumentation causes jank, reduce event frequency and batch writes.
2. If analytics model requires schema changes, keep fields additive and optional.

Stop Conditions:
- Measurable UI responsiveness regression.
- Analytics behavior coupling with core editing paths.
- >2 unrelated failures.

Definition of Done:
- Analytics feature is available, bounded, and performance-safe.

Versioning Rules:
- No version bump in this slice.
```

### Slice H Prompt — Plugin System Architecture Scaffold
```markdown
Context:
Design and implement plugin architecture foundations (not full untrusted runtime execution) for future ecosystem growth.

Objective:
Introduce plugin manifest schema, registration lifecycle, and capability boundaries with security-first constraints.

Evidence Scope:
- Card ecosystem and source metadata lives in `src/services/cardRegistry.ts`.
- Electron boundary contracts are in `src/main.ts` and `src/preload.ts`.

Allowed Files:
- `src/features/plugin-system/**` (new)
- `src/services/pluginService.ts` (new)
- targeted additive updates to registry and IPC boundary if required
- docs/tests for security and contract coverage

Forbidden:
- No unrestricted plugin code execution in renderer.
- No bypass of CSP/context isolation assumptions.

Mandatory `ai_rules.md` Compliance:
- Immutable Reuse Rule.
- IPC safety and implementation integrity are mandatory.
- DSL duplication prohibited.

DSL Contract (if DSL touched):
- Consumer inventory + compatibility statement + evidence required.

Stability Rules:
- Existing card render paths continue working when no plugins are enabled.

State Safety Rules:
- Plugin registry updates must be immutable and rollback-safe.

IPC Safety Rules:
- Plugin operations require strict input validation and additive channels only.

Performance Constraints:
- Plugin discovery/registration must not block startup path excessively.

Required Tests:
- Unit tests for manifest validation and capability enforcement.
- Integration tests for registration lifecycle and IPC contracts.
- E2E smoke for plugin listing/enable-disable (if UI included).

Verification Commands:
- `npm run lint`
- `npm run test:unit -- tests/unit/plugin-service.spec.ts`
- `npm run test:integration -- tests/integration/plugin-system.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- tests/e2e/plugin-system.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If any runtime execution model appears, stop and produce security design first.
2. If registry compatibility risk appears, keep plugin metadata additive and optional.

Stop Conditions:
- Security boundary cannot be demonstrated.
- Existing card registry contracts regress.
- >2 unrelated failures.

Definition of Done:
- Plugin architecture scaffold is defined, implemented, and test-backed for future extension.

Versioning Rules:
- No version bump in this slice.
```

### Slice I Prompt — Medium Gate Packaging & Release Readiness
```markdown
Context:
Execute Medium Gate for Phase 7 and package governance evidence without expanding feature scope.

Objective:
Validate architecture integrity, compatibility, test stability, and packaging readiness for Phase 7 completion.

Allowed Files:
- governance docs, release notes, and evidence artifacts directly tied to gate outcome
- no net-new product features

Forbidden:
- No opportunistic refactors.
- No feature expansion after gate begins.

Mandatory `ai_rules.md` Compliance:
- test execution and reporting policy is mandatory.
- git workflow policy is mandatory.
- document storage standards are mandatory.

DSL Contract (if DSL touched):
- Must include full consumer inventory + compatibility statement + evidence.

Stability Rules:
- Gate runs must target pass/fail evidence, not behavior changes.

State Safety Rules:
- Any fixes during gate must be minimal and scoped.

IPC Safety Rules:
- No new IPC unless gate-blocking and explicitly approved in scope.

Performance Constraints:
- Confirm no measurable regressions against established budgets.

Required Tests:
- Full required Medium Gate set for unit/integration/e2e and targeted regressions.

Verification Commands:
- `./tools/checks`
- `npm run lint`
- `npm run test:unit`
- `npm run test:integration -- --project=electron-integration --workers=1 --trace=retain-on-failure`
- `npm run test:e2e -- --project=electron-e2e --workers=1 --trace=retain-on-failure`

Operator Decision Tree:
1. If gate fails due to one subsystem, isolate and re-run affected matrix before broad reruns.
2. If stop condition triggers, halt and report blocker evidence.

Stop Conditions:
- Any Section 22 phase-level stop condition.
- unresolved critical regression.

Definition of Done:
- Medium Gate result is explicit (Go/No-Go) with evidence.
- Packaging is complete and scope-pure.

Versioning Rules:
- Apply designated phase version bump only at packaging milestone, never mid-slice.
```

## 13a) Feature Prompt Deliverable Contract (MANDATORY)
- Section 13 prompts are authoritative execution artifacts for this phase.
- Every slice prompt includes:
1. implementation-ready objective
2. architecture/file evidence context
3. mandatory `ai_rules.md` compliance
4. required tests and verification commands
5. stop conditions
6. definition of done
7. versioning rules
- If any slice prompt loses executable completeness, the phase blueprint is incomplete and must be revised before execution.

## 14) Test Strategy & Regression Containment
- Layered strategy:
1. Unit tests for service-level logic (preset parsing, theme packing, clone/bulk reducers, analytics aggregation, plugin manifest validation).
2. Integration tests for YAML conversion, IPC boundaries, theme integration, and service coupling.
3. E2E tests for user workflows (marketplace import, theme manager flows, clone/bulk operations, VCS surface, plugin listing).
- DSL-first discipline is mandatory for E2E workflows.
- Regression containment workflow:
1. Run targeted tests per slice.
2. Expand to affected matrix if shared seam changes.
3. For shared DSL changes, run consumer inventory set; if >5 specs, run full suite per `ai_rules.md`.
- Failure handling must follow `ai_rules.md` pause/diagnose/ask policy.

## 15) Documentation Plan
- Governance artifacts:
1. `docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md` (this file)
2. `docs/governance/phases/phase-7-ecosystem-future-growth-medium-gate.md` (post-gate)
3. `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-01.md` if changes are required after initiation
- Feature docs for implemented slices should live under `docs/features/` or relevant architecture/testing locations.
- Test/runbook updates must remain under `docs/testing/`.
- No phase governance docs should be written outside `docs/governance/`.

## 16) Versioning Strategy (BETA + STABLE SUPPORT)
- `CURRENT_VERSION` check: `package.json` reports `0.7.5-beta.10`; validated.
- `INITIATION_VERSION` check: `0.7.7-beta.0` is greater than current and follows valid pre-release bump behavior.
- Bump classification: Beta patch-line progression with prerelease reset (`0.7.5-beta.10 -> 0.7.7-beta.0`).
- Governance rule: no mid-slice version changes; apply initiation/release bump at designated packaging milestones only.
- Stable/major progression remains contingent on gate outcomes and compatibility posture.

## 17) Phase Definition of Done
- All eight Phase 7 feature slices delivered within scoped boundaries.
- No unresolved P0/P1 regressions introduced by phase work.
- Required unit/integration/e2e gates pass with evidence.
- YAML and IPC compatibility preserved.
- Performance and UX budgets remain within tolerance.
- Medium Gate yields explicit Go/No-Go decision with documented rationale.
- Governance artifacts complete and archived.

## 18) Phase Tracking Template (Reusable)
Use a Phase 7 tracking doc with these sections:
1. Slice status board (A-I).
2. Scope notes and decisions.
3. Risk register updates.
4. Test execution log with artifact paths.
5. DSL change contract logs (if applicable).
6. Compatibility verification notes.
7. Performance observations.
8. Medium Gate prep checklist.

## 19) Medium Gate Audit Prompt (Standalone)
```markdown
You are running the Phase 7 Medium Gate audit for HAVDM.

Inputs:
- Blueprint: `docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md`
- Rules: `ai_rules.md`, `docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md`

Audit Requirements:
1. No implementation changes unless strictly required to document blocker evidence.
2. Validate slice completion against Section 12 and Section 13 prompts.
3. Validate required tests were executed with evidence.
4. Validate compatibility:
   - YAML round-trip and import/export behavior
   - IPC/preload API compatibility
   - Theme and registry behavior continuity
5. Validate performance/UX budgets and flakiness profile.
6. Produce explicit severity findings with file references and evidence.
7. Provide Go/No-Go decision and confidence score.
8. Provide mandatory remediation list for any No-Go outcome.

Output File:
- `docs/governance/phases/phase-7-ecosystem-future-growth-medium-gate.md`

Stop Conditions During Audit:
- Missing test evidence for high-risk slices.
- Unresolved critical compatibility regressions.
- Security boundary uncertainty for plugin/version-control slices.
```

## 20) Preflight Architecture & Refactor Audit
- Required targeted refactors (allowed):
1. Extract feature-scoped services for presets/theme/plugin/version-control rather than inflating monolithic components.
2. Add typed adapters around IPC additions to keep preload/main contract explicit.
3. Isolate conversion logic changes in `yamlConversionService` for card-type-specific behavior.
- Strongly recommended hardening:
1. Add shared utility for deep cloning card config used by duplication and bulk operations.
2. Add analytics buffering utility to prevent render-path overhead.
- Explicitly deferred:
1. Renderer-wide state management rewrite.
2. Broad layout/canvas architecture replacement.
3. Full plugin runtime execution sandbox beyond architecture scaffold.

## 21) HARD MODE++ Packaging Plan (Solo Pattern B)
- Branch posture:
1. Active branch should remain `feature/ecosystem-future-growth` during slice execution.
2. Keep branch regression-safe after each slice.
- Commit packaging discipline:
1. One functional objective per commit.
2. Separate DSL/test scaffolding from behavioral feature work when it improves rollback safety.
3. No unrelated cleanup/refactor mixed into slice commits.
- Commit sequence plan:
1. `feat(phase-7): add preset marketplace foundations with remapping integration`
2. `feat(phase-7): expand theme manager save-load-import-export workflows`
3. `feat(phase-7): implement card duplication and cross-view cloning`
4. `feat(phase-7): add multi-select bulk operations with history-safe updates`
5. `feat(phase-7): introduce bounded version-control integration surfaces`
6. `feat(phase-7): harden import-export conversion and validation flows`
7. `feat(phase-7): add dashboard analytics instrumentation and controls`
8. `feat(phase-7): scaffold plugin architecture with capability boundaries`
9. `chore(phase-7): run medium gate, finalize packaging evidence`
- Per-commit self-review checklist:
1. `ai_rules.md` compliance satisfied.
2. Immutable updates verified.
3. DSL duplication avoided.
4. IPC changes additive and typed.
5. Required tests executed and logged.
6. Stop conditions checked before next slice.

## 22) STOP CONDITIONS
- Per-commit immediate stop:
1. Unexpected E2E failures outside touched surface.
2. More than 2 unrelated test failures.
3. YAML round-trip drift on baseline fixtures.
4. IPC/preload contract break detected.
5. Security uncertainty introduced by version-control or plugin slice.
6. Significant render churn or UI lock introduced.
- Per-slice stop:
1. More than 3 subsystems touched unexpectedly.
2. Required shared refactor cannot be test-protected within slice.
3. DSL consumer blast radius grows without evidence plan.
- Phase-level stop:
1. Flakiness trend worsens materially.
2. Performance degrades beyond agreed budget.
3. Compatibility regressions compound across slices.
4. Architecture clarity decreases (rising coupling, unclear boundaries).
- Stop protocol:
1. Halt work immediately.
2. Capture failure evidence (tests, logs, traces).
3. Apply `ai_rules.md` pause/diagnose/ask workflow.
4. Rescope or rollback before proceeding.

## 23) Phase Initiation Checklist
- Confirm `CURRENT_VERSION` in invocation equals `package.json`.
- Confirm `INITIATION_VERSION` bump logic validity.
- Confirm blueprint archived under `docs/governance/phases/`.
- Confirm active branch alignment (`feature/ecosystem-future-growth`).
- Confirm no implementation performed during blueprint generation.
- Confirm Medium Gate prompt is present and executable.
- Confirm slice prompts are complete execution artifacts for every slice.

## 24) Governance Blueprint Archival (MANDATORY)
- Archive file path:
`docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md`
- Metadata header included with required fields (phase, versions, timestamp, governance mode, model, references).
- No overwrite occurred (new file path).
- No unrelated files modified as part of blueprint generation.
- Staging command for archival workflow:
`git add docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md`
- Proposed commit message:
`docs(governance): add Phase 7 ecosystem & future growth blueprint`
- Do not commit automatically without explicit user approval.

# OUTPUT RULES COMPLIANCE
- Governance-only mode used.
- No code implementation included.
- Explicit `ai_rules.md` compliance enforced in all slice prompts.
- Packaging plan included.
- Stop Conditions included.
- Medium Gate prompt included.
- Executable feature prompts provided for every planned slice.
