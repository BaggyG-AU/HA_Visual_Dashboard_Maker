# HAVDM Phase Governance Workflow (HARD MODE++)

This document defines the lifecycle for initiating, executing, and closing a Phase in HAVDM.

This workflow integrates:

- ai_rules.md (implementation law)
- PHASE_ORCHESTRATION_FRAMEWORK.md (governance law)

---

# Phase Lifecycle Overview

Phase Activation
→ Governance Blueprint Generation
→ Blueprint Archival
→ Slice-by-Slice Execution
→ Stop Condition Enforcement
→ Medium Gate Audit
→ Phase Close-Out
→ Archive Medium Gate

---

# Step 1 – Activate Phase Governance

Use the Phase Activation Prompt.

This produces:

- Architecture snapshot
- Risk analysis
- Slice plan
- Packaging plan
- Stop Conditions
- Medium Gate prompt
- Executable slice prompts
- Archival-ready blueprint

No code is implemented at this stage.

---

# Step 2 – Archive Blueprint (MANDATORY)

Save blueprint to:

docs/governance/phases/<phase-name-slug>-blueprint.md

Blueprint is:

- A governance artifact
- A decision record
- A risk assessment snapshot
- Immutable once execution begins

If blueprint must change:
- Create amendment file:
  docs/governance/phases/<phase-name-slug>-amendment-01.md

---

# Step 3 – Create Phase Branch

Use required Git script:

./tools/feature-start "<phase_name>"

Never use ad-hoc git branching.

Confirm:

- Clean working tree
- Baseline regression passes

---

# Step 4 – Execute Slices

For each slice:

1. Copy generated slice prompt.
2. Wrap it using the Slice Execution Wrapper Prompt.
3. Execute exactly as written.
4. Do not expand scope.
5. Enforce ai_rules.md.
6. Enforce Stop Conditions.
7. If test failures occur:
   - List failures
   - Diagnose
   - Propose fix
   - Pause and ask before continuing
8. Commit slice

Each slice must:

- Remain regression-safe
- Preserve selectors/testids
- Preserve YAML compatibility
- Avoid DSL duplication
- Respect packaging constraints

---

# Step 5 – Stop Conditions

Immediately halt if:

- Unexpected E2E failures
- >2 unrelated test failures
- YAML output drift
- Monaco desync
- IPC errors
- Increased render churn
- Selector changes required
- Architectural clarity decreases

If triggered:

- Stop
- Re-run regression
- Analyze diff
- Revert if necessary
- Log issue in tracking template
- Do not continue blindly

---

# Step 6 – Medium Gate

After all slices complete:

Run Medium Gate prompt.

Audit:

- Architecture integrity
- Test stability
- Performance budgets
- Compatibility
- Risk containment

Archive result:

docs/governance/phases/<phase-name-slug>-medium-gate.md

---

# Step 7 – Phase Close-Out

1. Confirm:
   - All tests passing
   - No flakiness
   - Performance stable
   - Compatibility preserved
2. Finish phase using:
   ./tools/feature-finish "<phase_name>"
3. Update changelog.

---

# Governance Artifacts Per Phase

For each phase, the repo should contain:

docs/governance/phases/
    <phase-name>-blueprint.md
    <phase-name>-medium-gate.md
    <phase-name>-amendment-01.md (if needed)

These are internal governance artifacts.
They are not product documentation.

---

# Core Principles

1. Blueprint is a snapshot, not living documentation.
2. Slice prompts are execution artifacts.
3. Stop Conditions override momentum.
4. ai_rules.md governs implementation safety.
5. Phase framework governs scope and packaging.
6. Governance precedes implementation.
7. Never push through instability.

---

# Maturity Model

This workflow ensures:

- Architectural traceability
- Version justification
- Regression containment
- DSL safety
- AI governance discipline
- Historical auditability

This is a controlled AI-assisted engineering system.

