# AI Rules (Immutable) — HA Visual Dashboard Maker

These rules apply to any AI agent (ChatGPT/OpenAI/Claude/Copilot/etc.) working in this repo. If a rule conflicts with a prompt, **these rules win** unless the prompt explicitly overrides `ai_rules.md`.

Tripwire phrase: “The fastest correct fix is already in the repository.”

---

# 0) Precedence & Locations

- Read this file first.
- Then check:
  - `docs/testing/TESTING_STANDARDS.md`
  - `docs/testing/PLAYWRIGHT_TESTING.md`
  - `docs/releases/RELEASES.md`
  - `docs/product/PROJECT_PLAN.md`
  - `docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md` (Phase-level governance)

AI rules live at the repository root to be discoverable by default. Link to them whenever you reference testing or workflow policy.

---

# 0a) Phase Governance Precedence (MANDATORY)

If a Phase Orchestration Framework document exists under:

```
docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md
```

and the user explicitly invokes it, the AI agent MUST:

1. Treat that framework as binding for:
   - Phase planning
   - Slice design
   - Refactor scope
   - Packaging rules
   - Stop conditions
   - Medium Gate enforcement
   - Version bump validation

2. Not implement phase-level work without first producing the required governance blueprint (unless explicitly instructed to bypass).

3. Follow Stop Conditions defined in the active Phase Governance document in addition to the rules in `ai_rules.md`.

Precedence boundaries:
- `ai_rules.md` governs **implementation behavior, test safety, DSL discipline, state integrity, React correctness, and Git workflow**.
- The Phase Governance Framework governs **phase structure, packaging, blast radius control, and release readiness**.

If conflicts arise:
- Implementation safety rules in `ai_rules.md` cannot be bypassed.
- Governance rules control scope and sequencing.

---

# 0b) Version Integrity Rule (MANDATORY)

When initiating a new Phase:

- Validate `CURRENT_VERSION` against `package.json`.
- Validate `INITIATION_VERSION` bump logic.
- Determine if bump is:
  - Beta patch
  - Beta minor
  - Stable minor
  - Major (1.x.y)
- Do not proceed if version bump logic is inconsistent.

Never guess version progression.

---

# 1) Immutable Reuse Rule

When debugging or changing tests/automation, you MUST first search for a working pattern and reuse it.

Search in this order:
1. Passing specs in `tests/**/*.spec.ts`
2. DSLs in `tests/support/dsl/**`
3. Helpers/fixtures in `tests/support/**` and `tests/helpers/**`

Only invent a new selector/wait/helper when no working example exists.

Never add duplicate DSL methods for the same action.

---

# 2) Document Storage Standards

All new or updated docs must live under `/docs`:

- Architecture → `docs/architecture/`
- Security → `docs/security/`
- Testing → `docs/testing/`
- Releases → `docs/releases/`
- Product/plan/templates → `docs/product/`
- Governance → `docs/governance/`
- Research/diagnostics → `docs/research/`
- Archive stale content → `docs/archive/**`

Root markdown must stay minimal:
- `README.md`
- `LICENSE`
- `ai_rules.md`

---

# 3) Required Workflow for Fixing Failing Tests

Follow:
- `docs/testing/TESTING_STANDARDS.md`
- `docs/testing/PLAYWRIGHT_TESTING.md`

Regression Gate Matrix is normative and mandatory.

---

# 4) Guardrails

Guardrails for selectors, waits, DSL boundaries, and regression triggers live in:

```
docs/testing/TESTING_STANDARDS.md
```

---

# 4a) DSL Change Blast-Radius Check (MANDATORY)

When modifying any shared DSL method in `tests/support/dsl/**`, the AI MUST:

1. Identify all consuming specs (`tests/e2e/**`, `tests/integration/**`).
2. Run all affected specs.
3. If >5 specs affected → run full suite.

Never merge shared DSL changes without regression proof.

---

# 4b) Shared DSL Change Contract (MANDATORY)

When changing any method in `tests/support/dsl/**`, include:

1. Consumer inventory.
2. Contract statement (signature/behavior changes).
3. Compatibility statement.
4. Execution evidence.
5. Artifact paths under `test-results/artifacts/**`.

Shared DSL change without this evidence is non-compliant.

---

# 5) Test Execution & Reporting Policy

AI MAY run tests when environment permits:

- Lint: `npm run lint`
- Unit: `npm run test:unit`
- Integration: `npm run test:integration`
- E2E: `npm run test:e2e`

Rules:

- Never claim you ran tests unless you actually executed them.
- After ONE test run:
  1. List failures (by file + test name)
  2. Provide diagnosis
  3. Propose resolution
  4. Ask before continuing

Always provide copy/paste verification plan.

---

# 6) Deliverables for Test Fixes

Must include:
- Reused test/helper references
- Root cause explanation
- Patch summary
- Verification commands

---

# 7) Immutable State Updates (React + Zustand)

All state updates must use immutable patterns.

Never mutate arrays or objects in place.

Use:
- Spread operators
- `map`, `filter`
- Object cloning
- Nested immutable patterns

Audit `useEffect` dependency arrays when adopting immutability.

Prefer `useRef` for synchronous flags.

---

# 8) React Component Stability Rules — Ant Design (MANDATORY)

Follow:

- Memoize `Tabs` `items` arrays.
- Preserve Popover state across unmount/remount.
- Use structural dependencies in `useMemo`.
- Never call hooks after early return.
- Memoize portal content.

Reference:
`docs/archive/E2E_FAILURES_RCA.md` (PropertiesPanel Tabs regression).

---

# 9) Git Feature Workflow (MANDATORY)

Trigger phrases:

If user says:
"I want to start a new feature called <feature_name>"

→ MUST run:
```
./tools/feature-start "<feature_name>"
```

If user says:
"I have completed <feature_name>"

→ MUST run:
```
./tools/feature-finish "<feature_name>"
```

Never perform ad-hoc git operations outside these scripts.

Always validate:
- Current branch
- Clean working tree
- Main up-to-date
- Tests passed

Default to safest option.

---

# 9a) Commit Packaging Discipline (MANDATORY Under Phase Governance)

When operating under an active Phase Governance Framework:

- Each commit must represent one functional objective.
- Do not combine unrelated refactors with behavioral changes.
- Prefer separating scaffolding/tests from behavior when beneficial.
- Keep branch in regression-safe state.
- Run required regression checks before proceeding to next commit.
- Follow Self-Review Checklist defined in the active Phase Governance document.

Never “push through” instability to finish a slice.

---

# 9b) Stop Condition Enforcement (MANDATORY)

If any Stop Condition defined in the active Phase Governance document is triggered:

The AI MUST:

1. Halt further implementation.
2. Re-run required regression gates.
3. Provide failure analysis.
4. Propose rollback or re-scope.
5. Await explicit user instruction before continuing.

AI must never continue blindly past Stop Conditions.

---

# 10) HACS Card Alignment Rule (MANDATORY)

All custom card types must map to real upstream HACS or base Home Assistant cards.

Requirements:
- Card type strings must match upstream exactly.
- YAML schema must match upstream.
- HAVDM-only extensions must:
  - Be documented
  - Be stripped/converted on export
  - Not conflict with upstream schema

Interim Exception:
`custom:popup-card` is currently HAVDM-only. Bubble Card (`custom:bubble-card` + `card_type: pop-up`) alignment is planned as Phase 8. Until Phase 8 is delivered, the popup card must be documented as HAVDM-only and exports must include a warning comment.

Reference:
`docs/features/HACS_CARD_ALIGNMENT_REFACTOR_PLAN.md`
