Phase Name: Phase 6
CURRENT_VERSION: 0.7.5-beta.10
INITIATION_VERSION: 0.7.6-beta.0
Generated: 2026-02-15T09:12:13Z
Governance Mode: HARD MODE++
AI Model: GPT-5 (Codex)
References:
  - ai_rules.md
  - docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md

# Phase Governance Blueprint — Phase 6

PHASE_NAME: \'Phase 6\'
CURRENT_VERSION: \'0.7.5-beta.10\'
INITIATION_VERSION: \'0.7.6-beta.0\'
Governance Mode: HARD MODE++

## 0) Executive Summary
- Phase intent: deliver Template & Logic Enhancement capabilities (Universal Actions, Visual Logic, Unified Templates, State Styling, Trigger Animations).
- Why it matters: current app has partial logic foundations but lacks full phase orchestration.
- Top 5 risks:
1. PropertiesPanel complexity/regression risk.
2. YAML/Monaco sync instability.
3. DSL blast radius from selector/flow changes.
4. IPC contract drift across preload/main.
5. Performance churn from high-frequency form updates + rerenders.
- High-level blast radius: editor UI, YAML services, state/store, DSL/tests.
- Confidence score: 82/100.

## 1) Repo Evidence Index
- Architecture docs: docs/architecture/ARCHITECTURE.md, docs/architecture/ARCHITECTURE_ROADMAP.md
- Rules: ai_rules.md, docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md
- Testing standards: docs/testing/TESTING_STANDARDS.md, docs/testing/PLAYWRIGHT_TESTING.md
- Canvas: src/components/GridCanvas.tsx
- Properties panel: src/components/PropertiesPanel.tsx
- Monaco/YAML: src/components/YamlEditor.tsx, src/components/YamlEditorDialog.tsx, src/components/SplitViewEditor.tsx, src/services/yamlService.ts, src/services/yamlConversionService.ts, src/monaco-setup.ts
- State/store: src/store/dashboardStore.ts, src/store/editorModeStore.ts
- IPC: src/main.ts, src/preload.ts, src/services/haWebSocketService.ts
- Persistence: src/services/settingsService.ts, src/services/credentialsService.ts, src/services/fileService.ts
- Tests: tests/e2e/**, tests/integration/**, tests/unit/**, tests/support/dsl/**
- Versioning: package.json, docs/RELEASES.md, docs/releases/RELEASE_NOTES_v0.7.5-beta.10.md

## 2) Current Architecture Snapshot (CURRENT_VERSION)
- Main process + IPC: src/main.ts
- Preload bridge: src/preload.ts
- UI orchestration: src/App.tsx
- YAML lifecycle: src/services/yamlService.ts, src/services/yamlConversionService.ts
- Monaco lifecycle: src/monaco-setup.ts, src/components/YamlEditor.tsx
- Store/state: src/store/dashboardStore.ts, src/store/editorModeStore.ts
- Test distribution: e2e-heavy with DSL abstraction, plus integration and unit suites.
- Fragility zones: PropertiesPanel remount/timing, Monaco readiness, AntD overlays.
- Performance hotspots: PropertiesPanel form sync + YAML parse cadence.

## 3) Phase Objective Clarification
- Goals:
1. Universal Action System
2. Visual Logic Editor
3. Unified Template System
4. State-based Styling
5. Trigger-based Animations
- Layers touched: properties UI, services/types, YAML persistence, selected renderer paths.
- Work type: additive + targeted structural hardening.
- Assumptions + confidence:
1. Advanced-feature phase docs are source of truth (high).
2. Feature branch workflow uses scripts in ai_rules.md (high).
3. Visual logic editor is not fully implemented yet (medium-high).

## 4) “Do Not Touch” Registry
- E2E selectors / data-testid / role contracts in components + DSL.
- IPC channel names and preload API signatures.
- YAML public schema boundaries and round-trip behavior.
- Stable store action interfaces.
- Migration strategy if required:
1. DSL-first updates.
2. Consumer inventory.
3. Compatibility statement.
4. Targeted + blast-radius regression proof.

## 5) Subsystem Impact Map (Scored)
- Properties Panel: Risk 5, high blast radius.
- YAML/Monaco: Risk 5, high blast radius.
- DSL/tests: Risk 5, high blast radius.
- State/store: Risk 4.
- IPC/preload: Risk 4.
- Registry/schema: Risk 3.
- Persistence: Risk 3.
- Canvas/renderers: Risk 3.

## 6) State Mutation & Data Integrity Audit
- Preserve immutable updates in stores and panel update paths.
- Protect batch update semantics and undo/redo history integrity.
- Maintain debounce protections.
- Watch for race conditions between visual/code edit flows.
- Key failure modes: stale pending YAML, parse drift, panel rerender churn.

## 7) IPC & Electron Boundary Review
- IPC is explicit and broad; preload is compatibility boundary.
- Security posture:
  - contextIsolation: true
  - nodeIntegration: false
  - CSP in production path
- Backward compatibility depends on stable window.electronAPI surface.

## 8) Monaco / YAML Deep Review
- Worker/schema setup is preconfigured.
- Validation chain is syntax then structure.
- Modal and split modes share core editor/service paths.
- Concurrency risk in split sync states.
- Large YAML performance risk due to frequent parsing.

## 9) E2E Regression Surface Mapping
- High-risk specs:
  - tests/e2e/smart-actions.spec.ts
  - tests/e2e/entity-context.spec.ts
  - tests/e2e/conditional-visibility.spec.ts
  - tests/e2e/templates.spec.ts
  - tests/e2e/yaml-editor.spec.ts
  - tests/e2e/properties-panel.spec.ts
- Timing-sensitive zones: AntD popovers/selects, Monaco readiness.
- Containment: DSL-first fixes, targeted runs, expand only on shared-surface impact.

## 10) Performance & UX Budget
- No additional full PropertiesPanel remounts per keystroke.
- Keep YAML interactions responsive.
- Avoid toast floods.
- Prevent listener/timer leaks.
- Keep render churn flat or improved.

## 11) Backwards Compatibility Matrix
- YAML schema must remain additive and backward-loadable.
- Existing stored dashboards/settings must remain valid.
- Breaking migration thresholds are disallowed in this phase baseline.

## 12) Ordered Feature Slice Plan
- Slice A: scaffolding + contracts
- Slice B: universal action normalization
- Slice C: template engine uplift
- Slice D: visual logic condition builder
- Slice E: state-based styling mapping
- Slice F: trigger-based animation hooks
- Slice G: integration hardening + migration checks
- Slice H: Medium Gate packaging + release readiness

(Scopes, packaging plan, and risk scoring unchanged.)

## 13) Codex-Ready Feature Prompts (Per Slice)

### Slice A Prompt
```markdown
Context:
You are implementing Slice A for Phase 6 in HAVDM under ai_rules.md and PHASE_ORCHESTRATION_FRAMEWORK.md.

Goal:
Define/normalize Phase 6 contract types and minimal shared interfaces without changing behavior.

Allowed Scope:
- src/types/**
- Targeted service type signatures where compile-safety requires it

Forbidden Scope:
- No renderer behavior changes
- No IPC contract changes
- No YAML semantic changes beyond additive typing

Mandatory ai_rules.md compliance:
- Immutable Reuse Rule search order:
  1) passing specs (tests/**/*.spec.ts)
  2) DSL methods (tests/support/dsl/**)
  3) helpers/fixtures (tests/support/**, tests/helpers/**)
- Immutable state patterns required
- No ad-hoc git workflow outside required scripts

DSL Change Contract (if DSL touched):
- Consumer inventory
- Compatibility statement
- Execution evidence
- Artifact paths under test-results/artifacts/**

Required tests:
- Targeted unit tests for touched contracts/services
- npm run test:unit

Verification commands:
- npm run lint
- npm run test:unit

Stop Conditions:
- >2 unrelated failures
- scope-expanding dependency discovered
- selector/API drift outside slice intent

Definition of Done:
- Contracts compile
- No behavior regressions
- Required tests pass
- Scope remains bounded

Versioning rule:
- No version bump in this slice.
```

### Slice B Prompt
```markdown
Context:
Implement universal action normalization using existing smart action foundations.

Goal:
Unify action semantics (tap/hold/double) with backward compatibility.

Allowed Scope:
- src/services/smartActions.ts
- related action handling in src/components/PropertiesPanel.tsx
- supporting types in src/types/**

Forbidden Scope:
- No broad renderer rewrites
- No unrelated panel cleanup/refactors

Mandatory ai_rules.md compliance:
- Immutable Reuse Rule (specs -> DSL -> helpers)
- Immutable state updates
- Pause-after-failure workflow after one failing run

DSL Change Contract (if DSL touched):
- Consumer inventory
- Compatibility statement
- Execution evidence
- Artifacts listed

Required tests:
- tests/unit/smartActions.spec.ts
- tests/e2e/smart-actions.spec.ts

Verification commands:
- npm run lint
- npm run test:unit -- tests/unit/smartActions.spec.ts
- npm run test:e2e -- tests/e2e/smart-actions.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure

Stop Conditions:
- Legacy action fallback break
- YAML action drift
- >2 unrelated failures

Definition of Done:
- Unified behavior implemented
- Legacy behavior preserved
- Targeted tests pass

Versioning rule:
- No version bump in this slice.
```

### Slice C Prompt
```markdown
Context:
Extend template behavior on existing entity-context foundations.

Goal:
Improve template resolution/preview safely and deterministically.

Allowed Scope:
- src/services/entityContext.ts
- template preview surfaces in src/components/PropertiesPanel.tsx
- optional YAML editor assist in src/components/YamlEditor.tsx

Forbidden Scope:
- No arbitrary Jinja/code execution engine
- No breaking template schema changes

Mandatory ai_rules.md compliance:
- Immutable Reuse Rule (specs -> DSL -> helpers)
- Immutable state + React stability rules
- Preserve YAML safety boundaries

DSL Change Contract (if DSL touched):
- Full ai_rules.md DSL evidence contract

Required tests:
- tests/unit/entityContext.spec.ts (or impacted equivalent)
- tests/e2e/entity-context.spec.ts
- tests/e2e/templates.spec.ts

Verification commands:
- npm run lint
- npm run test:unit -- tests/unit/entityContext.spec.ts
- npm run test:e2e -- tests/e2e/entity-context.spec.ts tests/e2e/templates.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure

Stop Conditions:
- YAML round-trip drift
- non-deterministic context resolution
- editor responsiveness regression

Definition of Done:
- Template behavior improved safely
- Existing template cards stay compatible
- Required tests pass

Versioning rule:
- No version bump in this slice.
```

### Slice D Prompt
```markdown
Context:
Implement visual logic authoring primitives based on current conditional visibility model.

Goal:
Deliver condition/group builder behavior with stable persistence and preview.

Allowed Scope:
- src/services/conditionalVisibility.ts
- related condition controls in src/components/PropertiesPanel.tsx
- minimal type updates in src/types/dashboard.ts

Forbidden Scope:
- No selector churn without DSL migration evidence
- No unrelated panel redesign

Mandatory ai_rules.md compliance:
- Immutable Reuse Rule (specs -> DSL -> helpers)
- Immutable updates only
- React stability rules

DSL Change Contract (if DSL touched):
- Consumer inventory + compatibility + evidence + artifacts

Required tests:
- tests/unit/conditionalVisibility.spec.ts
- tests/e2e/conditional-visibility.spec.ts

Verification commands:
- npm run lint
- npm run test:unit -- tests/unit/conditionalVisibility.spec.ts
- npm run test:e2e -- tests/e2e/conditional-visibility.spec.ts --project=electron-e2e --workers=1 --trace=retain-on-failure

Stop Conditions:
- >3 unexpected subsystem touches
- condition YAML format drift
- timing-hack dependency to pass tests

Definition of Done:
- Builder flow stable
- YAML persistence correct
- Targeted tests pass

Versioning rule:
- No version bump in this slice.
```

### Slice E Prompt
```markdown
Context:
Add state-based styling mapping with compatibility and performance safeguards.

Goal:
Enable deterministic state-to-style mapping with clear fallback behavior.

Allowed Scope:
- relevant styling services in src/services/**
- targeted properties controls
- minimal renderer integration where required

Forbidden Scope:
- No broad renderer rewrite
- No CSS architecture overhaul

Mandatory ai_rules.md compliance:
- Immutable Reuse Rule (specs -> DSL -> helpers)
- Immutable state + React stability
- YAML/HACS alignment safety maintained

DSL Change Contract (if DSL touched):
- Full DSL contract evidence required

Required tests:
- impacted unit tests for style logic
- targeted e2e/visual tests for affected cards

Verification commands:
- npm run lint
- npm run test:unit
- npm run test:e2e -- <impacted-style-specs> --project=electron-e2e --workers=1 --trace=retain-on-failure

Stop Conditions:
- render churn increase
- unrelated visual regression spread
- YAML boundary break

Definition of Done:
- Mapping works and is reversible
- Regression contained
- Required tests pass

Versioning rule:
- No version bump in this slice.
```

### Slice F Prompt
```markdown
Context:
Introduce trigger-based animation configuration on top of existing animation infrastructure.

Goal:
Provide deterministic trigger-driven animation behavior within UX/perf budgets.

Allowed Scope:
- animation config/services
- targeted properties controls
- minimal renderer hook-in for trigger execution

Forbidden Scope:
- No global animation subsystem rewrite
- No unbounded timer/listener patterns

Mandatory ai_rules.md compliance:
- Immutable Reuse Rule (specs -> DSL -> helpers)
- Immutable state + React stability
- no timing-hack test workarounds

DSL Change Contract (if DSL touched):
- consumer inventory + compatibility + evidence + artifacts mandatory

Required tests:
- impacted animation/service unit tests
- targeted e2e/visual specs

Verification commands:
- npm run lint
- npm run test:unit
- npm run test:e2e -- <impacted-animation-specs> --project=electron-e2e --workers=1 --trace=retain-on-failure

Stop Conditions:
- measurable UX/perf regression
- animation-related flake spike
- rewrite pressure to proceed

Definition of Done:
- Trigger logic deterministic
- Performance unaffected within budget
- Required tests pass

Versioning rule:
- No version bump in this slice.
```

### Slice G Prompt
```markdown
Context:
Harden integration and compatibility behavior for all Phase 6 changes.

Goal:
Ensure YAML/store/integration compatibility and migration safety.

Allowed Scope:
- integration tests
- migration/compatibility utilities
- minimal direct fixes discovered by compatibility tests

Forbidden Scope:
- No feature expansion
- No unrelated refactors

Mandatory ai_rules.md compliance:
- Immutable Reuse Rule (specs -> DSL -> helpers)
- one-run failure pause/diagnose/ask policy
- DSL contract enforcement if touched

DSL Change Contract (if DSL touched):
- full ai_rules evidence requirements

Required tests:
- affected integration specs (yaml/service layer)
- targeted e2e regression specs for Phase 6 surfaces

Verification commands:
- npm run lint
- npm run test:integration -- tests/integration/yaml-operations.spec.ts --project=electron-integration --workers=1 --trace=retain-on-failure
- npm run test:e2e -- <phase6-regression-set> --project=electron-e2e --workers=1 --trace=retain-on-failure

Stop Conditions:
- backward compatibility break
- out-of-scope migration complexity
- >2 unrelated failures

Definition of Done:
- Compatibility verified
- regressions contained
- required tests pass

Versioning rule:
- No version bump in this slice.
```

### Slice H Prompt
```markdown
Context:
Perform Medium Gate packaging and release-readiness execution for Phase 6.

Goal:
Validate gate requirements and package readiness without expanding scope.

Allowed Scope:
- tests/docs/version packaging tied directly to Phase 6 completion
- no net-new product behavior

Forbidden Scope:
- No opportunistic feature/refactor additions
- No scope expansion

Mandatory ai_rules.md compliance:
- test execution/reporting workflow strictly enforced
- required git feature script policy preserved
- document storage standards preserved

DSL Change Contract (if DSL touched):
- full evidence contract required

Required tests:
- Medium Gate-required suite set per framework/testing standards

Verification commands:
- ./tools/checks
- npm run test:integration -- --project=electron-integration --workers=1 --trace=retain-on-failure
- npm run test:e2e -- --project=electron-e2e --workers=1 --trace=retain-on-failure

Stop Conditions:
- Any section 22 phase stop condition triggered
- unresolved gate failures within approved scope

Definition of Done:
- Medium Gate pass or explicit blocker report with evidence
- packaging discipline maintained
- ready for go/no-go decision

Versioning rule:
- Apply version bump only at designated packaging milestone, never mid-slice.
```

## 13a) Feature Prompt Deliverable Contract (MANDATORY)
- Section 13 prompts are executable implementation artifacts.
- Every slice must include:
  - complete standalone implementation prompt
  - sufficient execution context
  - explicit file/architecture references
  - required tests
  - verification commands
  - stop conditions
  - definition of done
  - explicit ai_rules.md compliance
  - immutable reuse rule enforcement
  - DSL contract enforcement when applicable
- These prompts are authoritative execution units, not examples.
- If any slice cannot produce a complete executable prompt, slice is under-specified and must be revised.
- Blueprint is incomplete if any slice lacks a fully executable prompt.

## 14) Test Strategy & Regression Containment
- Unit-first for logic and data transforms.
- Integration for YAML/store/contract paths.
- E2E for workflow proof.
- Flake prevention: DSL-first, state-based waits, no arbitrary sleeps.
- On failing run: list failures -> diagnose -> propose -> ask before continuing.

## 15) Documentation Plan
- Governance docs: docs/governance/
- Phase tracking: docs/governance/phases/
- Research: docs/research/
- Archive stale: docs/archive/
- No governance artifacts at root.

## 16) Versioning Strategy (BETA + STABLE SUPPORT)
- CURRENT_VERSION validated: 0.7.5-beta.10.
- INITIATION_VERSION validated: 0.7.6-beta.0.
- Bump type: Beta patch progression.
- Beta/stable/major criteria remain tied to gate pass, compatibility, and release readiness.

## 17) Phase Definition of Done
- Functional completeness for all phase goals.
- Architectural integrity preserved.
- Required tests pass.
- Performance threshold maintained.
- Compatibility confirmed.
- Documentation complete.
- Medium Gate cleared.

## 18) Phase Tracking Template (Reusable)
- Use template with:
  - overview
  - objectives
  - scope boundaries
  - slice table
  - risk register
  - decision/regression logs
  - performance notes
  - e2e stability notes
  - version history
  - Medium Gate checklist
  - final approval

## 19) Medium Gate Audit Prompt (Standalone)
- No code changes.
- Audit architecture compliance, regression, performance budgets, compatibility.
- Produce severity ratings, Go/No-Go decision, confidence score.

## 20) Preflight Architecture & Refactor Audit
- Evidence findings:
  - phase foundations exist but orchestration incomplete
  - panel/yaml paths are highest-risk surfaces
- Backlog:
  - REQUIRED: extraction of critical seams + compatibility tests
  - STRONGLY RECOMMENDED: shared serializer logic + perf instrumentation
  - DEFER: broad rewrites
- Constraints: slice-sized, test-protected, no broad rewrites.

## 21) HARD MODE++ Packaging Plan (Solo Pattern B)
- Branch strategy:
  - ./tools/feature-start "<phase_name>"
  - clean tree and baseline checks
- Commit packaging rules:
  - one functional objective per commit
  - separate scaffolding from behavior
  - no unrelated refactors
  - keep branch regression-safe
- Commit-by-commit plan: Slices A through H.
- Self-review checklist:
  - selector safety
  - DSL contract preserved
  - state integrity
  - performance unchanged
  - no timing hacks
  - tests passing
  - compatibility preserved

## 22) STOP CONDITIONS
- Per-commit immediate stop:
  - unexpected E2E failures
  - >2 unrelated test failures
  - YAML output drift
  - Monaco desync
  - IPC errors
  - render churn increase
  - selector changes required
  - subsystem rewrite consideration
- Per-slice stop:
  - >3 subsystems touched unexpectedly
  - high blast radius without strong tests
  - unprotected required refactor
  - architecture clarity decreases
- Phase-level stop:
  - E2E flakiness increases
  - runtime increases >15%
  - state bugs compound
  - architecture clarity degrades
- If triggered:
  - stop
  - rerun required gates
  - follow ai_rules pause/diagnose/ask workflow
  - revert or rescope if necessary
  - wait for instruction

## 23) Phase Initiation Checklist
- Create branch via ./tools/feature-start
- Validate version bump
- Add tracking file in docs/governance/phases/
- Update changelog
- Confirm baseline regression
- Follow commit packaging template
- Do not bypass git workflow scripts

## 24) Governance Blueprint Archival (MANDATORY)
- Create docs/governance/phases/ if missing.
- Save full blueprint as:
  - docs/governance/phases/<phase-name-slug>-blueprint.md
- Include archive metadata at top:
  - Phase Name
  - CURRENT_VERSION
  - INITIATION_VERSION
  - ISO date
  - Governance Mode: HARD MODE++
  - AI model used
  - references to ai_rules.md and PHASE_ORCHESTRATION_FRAMEWORK.md
- Do not modify archived blueprint once phase begins.
- Amendments:
  - docs/governance/phases/<phase-name-slug>-amendment-01.md
- If archive cannot be created, stop and notify user.

# OUTPUT RULES
- Structured Markdown
- No missing sections
- No vague statements
- Explicit risk flags
- Explicit confidence ratings
- Final output must include executable prompts for every slice
- If any slice prompt is incomplete, blueprint is incomplete
- Final output must include archival-ready full blueprint
- Include exact filename
- Stop only after blueprint + archival instructions
