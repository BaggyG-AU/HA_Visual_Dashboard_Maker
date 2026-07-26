Phase Name: Phase 7 – Ecosystem & Future Growth
Amendment: 03
Amends: docs/governance/phases/phase-7-ecosystem-future-growth-blueprint.md
Supersedes-in-part: docs/governance/phases/phase-7-ecosystem-future-growth-amendment-01.md §2.2
(the bump's gate dependency is widened from "a Medium Gate GO" to "a Medium Gate GO **and** an accepted UAT round")
Date: 2026-07-27
CURRENT_VERSION: 0.7.5-beta.10
Governance Mode: HARD MODE++
Authority: `docs/governance/PHASE_WORKFLOW.md` Step 2 — "If blueprint must change: create amendment file"
References:

- ai_rules.md
- docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md
- docs/testing/UAT_STRATEGY.md (created by this amendment)
- docs/governance/phases/phase-7-tracking.md

# Phase 7 Amendment 03 — User Acceptance Testing Is a Precondition of v1.0.0

## 0) Summary

Amendment-01 §2.2 resolved the version progression to `0.7.5-beta.10` → `1.0.0`,
applied once, inside slice I, **conditional on a GO from the Medium Gate**. That
made a single automated gate the sole authority over the first stable release.

This amendment adds a second, human authority. It was requested by the project
owner (micah / BaggyG-AU) on 2026-07-27, before slice I began writing anything,
and it does three things:

1. **Makes an accepted UAT round a mandatory precondition of the `1.0.0` bump**,
   alongside the Medium Gate GO.
2. **Splits slice I.** Slice I becomes the Medium Gate alone — technical
   readiness, no version bump. A new **slice J** carries the UAT round and the
   release.
3. **Establishes a standing UAT framework** in test governance
   (`docs/testing/UAT_STRATEGY.md`), so UAT is a repeatable HAVDM capability
   rather than a one-off exercise performed for v1.0.0 and then forgotten.

---

## 1) Why the Medium Gate is not sufficient on its own

Blueprint §19's audit validates slice completion against §12/§13, test execution
evidence, YAML/IPC compatibility, and the flakiness profile. Every one of those
measures the automated layers: 871 unit tests, 169 integration tests, 244 e2e
tests. They are a real and substantial body of evidence.

They are also, all three, tests HAVDM wrote about itself.

What none of them establishes is whether a person sitting in front of the
packaged application can build a dashboard and deploy it to Home Assistant
without hitting something obviously wrong. The e2e suite drives the renderer
through a DSL; it does not launch the shipped artifact, it does not exercise the
real HA WebSocket path against a real instance, and it cannot judge whether the
result _looks right_. For a `0.x` beta that gap is acceptable. For the release
that removes the beta suffix it is not.

⭐ This is the natural counterpart to the rule established in
`[PATTERN] drawer_havdm_patterns_63b3839325f5c999803543a2`: **a readiness gate
answers "is what we built ready?", never "was it worth building?"** Amendment-01
applied that rule to keep scope questions out of the gate. This amendment
applies its other half — the gate answers "do the tests pass?", never "does the
product work for a human?" Those are different questions and they need different
instruments.

### 1.1 Honest statement of the cost

This delays v1.0.0. UAT is a human activity measured in evenings, not minutes,
and a full-product matrix is a larger commitment than a phase-scoped one. If the
round surfaces defects, remediation and a re-test round follow before the bump —
the reference implementation this framework is ported from took three rounds to
close its equivalent milestone.

That is the trade being made knowingly. The alternative is shipping the first
stable release of a desktop application on the strength of tests it wrote about
itself, which is a weaker claim than it looks.

---

## 2) Amendment A — slice I is split into I and J

### 2.1 What changes

| Slice | Blueprint status                                                      | Amended status                                                        |
| ----- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| I     | Medium Gate packaging & release readiness, **incl. the version bump** | **Medium Gate ONLY — technical readiness. NO version bump.**          |
| J     | (did not exist)                                                       | **NEW — UAT round, then the `1.0.0` release on an accepted outcome.** |

Slice I's §13 prompt is otherwise unchanged and remains executable as written,
with one carve-out: its **Versioning Rules** line ("Apply designated phase
version bump only at packaging milestone, never mid-slice") now resolves to
_the packaging milestone is in slice J_. Slice I applies no bump at all.

Blueprint §17's "Medium Gate yields explicit Go/No-Go decision with documented
rationale" is satisfied by slice I. The bump is simply no longer downstream of
that decision alone.

### 2.2 Slice J prompt

```markdown
Context:
Execute the v1.0.0 User Acceptance Testing round for HAVDM and, on an accepted
outcome, apply the designated release bump. Governed by `ai_rules.md`,
`docs/testing/UAT_STRATEGY.md`, and this amendment.

Objective:
Establish by human verification that the packaged application performs its
core work correctly, then release v1.0.0.

Allowed Files:

- `docs/testing/uat/**` (plan, matrix, session JSON, summary report)
- `package.json` version field, `docs/RELEASES.md` current-version line,
  `docs/releases/RELEASE_NOTES_v1.0.0.md`
- governance docs and evidence artifacts directly tied to the UAT outcome
- no net-new product features

Forbidden:

- No opportunistic refactors.
- No feature expansion.
- No writes to a production Home Assistant dashboard (see §4).

Required Tests:

- A full UAT round executed against the packaged application per
  `docs/testing/UAT_STRATEGY.md`, producing a committed session JSON and
  summary report.
- Re-gate (`./tools/checks` + affected suites) after any remediation commit.

Operator Decision Tree:

1. If UAT surfaces a High-severity defect, halt the release, remediate on its
   own branch with a regression test, and re-run the affected matrix group.
2. If a defect fails a test with no automated coverage, the fix MUST add that
   coverage (UAT_STRATEGY.md §7).

Stop Conditions:

- Any open High-severity defect.
- Any §22 phase-level stop condition.

Definition of Done:

- UAT round accepted against the §3 pass bar, with artifacts committed.
- v1.0.0 applied and tagged, or a documented decision not to release.

Versioning Rules:

- This slice IS the packaging milestone. Apply `0.7.5-beta.10` -> `1.0.0` once,
  here, per amendment-01 §2.2 as widened by §3 below.
```

---

## 3) Amendment B — the bump's gate dependency is widened

Amendment-01 §2.2 said:

> Gate dependency: the bump is **conditional on a GO** from the Medium Gate. A
> NO-GO outcome means the version stays at `0.7.5-beta.10` until the remediation
> list is cleared.

That is widened to:

> Gate dependency: the bump is conditional on **both** (a) a GO from the Medium
> Gate (slice I), and (b) an **accepted UAT round** (slice J). Failing either
> keeps the version at `0.7.5-beta.10` until the corresponding remediation list
> is cleared.

Everything else in amendment-01 §2 stands unchanged: the progression is
`0.7.5-beta.10` → `1.0.0`, classification **Major (1.x.y)** — first stable,
leaving the beta line; `INITIATION_VERSION: 0.7.7-beta.0` remains superseded and
is never applied retroactively; and the bump scope is `package.json`, the
`docs/RELEASES.md` current-version line, a new
`docs/releases/RELEASE_NOTES_v1.0.0.md`, and an annotated `v1.0.0` tag per the
`docs/RELEASES.md` "Cut a release" procedure.

### 3.1 The pass bar — what "accepted" means

A UAT round is **accepted** when all of the following hold:

1. **Zero open High-severity defects.** No exceptions, no acceptance with
   rationale. High severity is defined in `docs/testing/UAT_STRATEGY.md` §6.
2. **Every Medium-severity defect is either fixed or explicitly accepted**, with
   written rationale recorded in `docs/releases/RELEASE_NOTES_v1.0.0.md` under
   Known Issues. Silent acceptance is not acceptance.
3. **Low-severity defects are recorded and may be deferred**, listed in the
   release notes.
4. **Every defect that failed a test with no automated coverage has gained that
   coverage** in its fix (UAT_STRATEGY.md §7 regression mandate).
5. **No test is left Untested.** A test the tester chose not to run is marked
   Skip with a reason, which is a decision; leaving it blank is not.

⚠ Defining the bar in advance is deliberate. A pass bar agreed after the results
are in is not a bar, it is a negotiation.

---

## 4) Amendment C — a bounded, named exception to the live-HA read-only rule

HAVDM's standing rule is that live testing against `ha.home.local` is
**READ-ONLY**, because that instance is VPP-enrolled via Amber Electric
SmartShift.

The deploy path is also the single most valuable thing a v1.0.0 UAT can verify
and the one thing no automated layer covers — the e2e and integration suites
never touch a real Home Assistant instance.

**Resolution, authorised by the project owner 2026-07-27:** UAT deploy-flow
tests MAY write to a HAVDM **temporary dashboard** and MUST remove it before the
round closes. Specifically:

- **Permitted:** `haWsCreateTempDashboard` → `haWsUpdateTempDashboard` →
  `haWsDeployDashboard` (to a temp path) → `haWsDeleteTempDashboard`.
- **Required:** teardown is a numbered step inside the test card, not a
  reminder, and the round's summary report is not generated until the temp
  dashboard is confirmed gone.
- **Forbidden:** writing to any production dashboard; `haWsSaveDashboardConfig`
  against an existing user dashboard; any Modbus, inverter, VPP or Remote-EMS
  surface; any automation, script or helper mutation.

Everything outside that envelope remains read-only. This exception is scoped to
UAT rounds executed under `docs/testing/UAT_STRATEGY.md` and does not relax the
rule for ordinary development or agent-run testing, where live HA access stays
strictly read-only.

---

## 5) Amendment D — the standing UAT framework

Created by this amendment, and deliberately built to be reused rather than
consumed:

| Artifact                                                       | Purpose                                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `docs/testing/UAT_STRATEGY.md`                                 | The UAT loop, test types, severity rubric, matrix design principles, regression mandate  |
| `prompts/claude/uat-plan-and-matrix.md`                        | Reusable generator prompt — derives every round's content from the repo at runtime       |
| `docs/testing/uat/matrices/uat_matrix_template.html`           | Structural base for every matrix; never modified for a specific round                    |
| `tools/verify-uat-matrix.cjs`                                  | Round-agnostic self-check — asserts a matrix actually works before it reaches the tester |
| `docs/testing/uat/{plans,matrices,reports,sessions,archives}/` | Round artifacts                                                                          |

The framework is adapted from the UAT system in the `promptmi` project
(`/mnt/c/dev/PromptMi/docs/TEST_STRATEGY.md` §3/§6/§7/§8 and
`docs/prompts/claude/uat-plan-and-matrix.md` v1.1), which
`docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md` already identifies as a source of
proven governance to port. Deltas for HAVDM are recorded in
`docs/testing/UAT_STRATEGY.md` §9.

---

## 6) Consequential edits to the blueprint

- **§12 Ordered Feature Slice Plan** — a pointer note is added recording the
  I/J split. The executable order becomes A, B, C, D, E, F, I, J.
- **§16 Versioning Strategy** — a pointer note records that the designated
  packaging milestone moved from slice I to slice J.
- **§17 Phase Definition of Done** — a pointer note adds one bullet:

  > **A UAT round is executed against the packaged application and accepted per
  > `phase-7-ecosystem-future-growth-amendment-03.md` §3.1 before the phase
  > version bump is applied.**

  Every other §17 bullet stands unchanged and still binding.

- **§21 HARD MODE++ Packaging Plan**, commit sequence — item 9
  (`chore(phase-7): run medium gate, finalize packaging evidence`) is split into
  9 (`chore(phase-7): run medium gate, finalize gate evidence`) and a new item 10
  (`chore(phase-7): execute v1.0.0 UAT round and cut the release`).

- **`docs/governance/phases/phase-7-tracking.md`** — slice board gains a row for
  slice J; the §5 Medium Gate prep checklist has its version-bump item moved to a
  new §6 UAT & Release checklist.

The blueprint itself is **not edited in place** — §24 and `PHASE_WORKFLOW.md`
Step 2 make it immutable once execution begins, so it carries pointer notes and
this file wins on every conflict. Same discipline as amendments 01 and 02.

---

## 7) Remaining Phase 7 work

**I** (Medium Gate — technical readiness, no bump) → **J** (UAT round, then
`1.0.0` on an accepted outcome).

---

## 8) Traceability

- UAT framework: `docs/testing/UAT_STRATEGY.md`.
- Slice status board and per-slice evidence:
  `docs/governance/phases/phase-7-tracking.md`.
- Prior amendments: `-amendment-01.md` (slices G/H withdrawn, version resolved),
  `-amendment-02.md` (slice C split).
- MemPalace `[DECISION]` drawer recording this amendment: filed in wing `havdm`,
  room `decisions`, 2026-07-27.
