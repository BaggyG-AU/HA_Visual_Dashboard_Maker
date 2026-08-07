# HAVDM — UAT Strategy

**Version:** 1.0
**Created:** 2026-07-27
**Status:** Active. Established by
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md`.
**Applies to:** every HAVDM User Acceptance Testing round, permanently — not
just the v1.0.0 round that prompted it.

---

## Purpose

This document defines how User Acceptance Testing works in HAVDM: who runs it,
what artifacts it produces, how defects are classified, and what it takes for a
round to be **accepted**.

It sits alongside, not inside, `docs/testing/TESTING_STANDARDS.md`. That document
governs the automated layers — unit, integration, e2e, the DSL, the Regression
Gate Matrix. This one governs the human layer.

---

## 1. Why UAT exists as a separate layer

HAVDM has 871 unit tests, 169 integration tests and 244 e2e tests. That is a
substantial body of evidence, and it is all evidence HAVDM produced about
itself.

Three things none of it establishes:

1. **The packaged artifact works.** The e2e suite drives the renderer through a
   DSL against a dev build. It does not launch what a user installs.
2. **The Home Assistant path works end to end.** No automated layer connects to
   a real HA instance. Every HA interaction in the suites is mocked or absent.
3. **The output is correct, not merely well-formed.** HAVDM's product vision is
   to be a superset design tool that _translates_ HACS custom cards and honestly
   _marks_ what it cannot translate. Whether a translation is faithful is a
   judgement about how the card renders in Home Assistant. A test can assert the
   YAML shape; only a person can say the dashboard looks right.

⭐ **The governing principle: automated tests prove the code does what it was
told; UAT proves it was told the right thing.**

---

## 2. Roles

HAVDM is a solo project, so the roles are thin but still distinct — and keeping
them distinct is what stops the round becoming self-certification.

| Role       | Responsibility                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tester** | Runs every test in the matrix by hand against the packaged app. Marks Pass/Fail/Skip, writes failure notes, attaches screenshots, generates the summary report. |
| **Agent**  | Generates the test plan and the HTML matrix before the round. Triages the returned results, writes fix specs, implements remediation. **Never marks a test.**   |

⚠ **The agent does not run UAT and does not decide whether a UAT test passed.**
An agent marking its own work as accepted is not acceptance testing; it is the
automated suite with extra steps.

---

## 3. The UAT loop

### 3.1 Prerequisites before a round begins

- [ ] `./tools/checks` passes (lint → format:check → typecheck → unit)
- [ ] Full `electron-e2e` and `electron-integration` runs captured, with the
      failure set triaged against the documented baseline
- [ ] `npm run package` succeeds and the packaged app launches
- [ ] All fix PRs for the milestone merged to `main`
- [ ] `docs/testing/SKIPPED_TESTS_REGISTER.md` current

⭐ **UAT runs on green.** Its job is to find what the suites cannot see, not to
re-find what they already report. Starting a round on a red suite wastes the
scarcest resource in the process, which is the tester's evening.

### 3.2 Step 1 — Generate the plan and matrix (agent)

The agent produces two files, following `prompts/claude/uat-plan-and-matrix.md`:

| File                                                              | Role                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------- |
| `docs/testing/uat/plans/uat_plan_<round-id>_YYYY-MM-DD.md`        | **Source of truth.** Human-readable.                  |
| `docs/testing/uat/matrices/uat_matrix_<round-id>_YYYY-MM-DD.html` | The tester's working tool. Generated _from_ the plan. |

⭐ **The plan defines the tests; the matrix only executes them.** If the two ever
disagree, the plan is right and the matrix is a bug.

**Carried-forward cards — consult the corrections register first.**

⚠ Before writing any card carried over from a previous round, read
`docs/testing/uat/CARD_CORRECTIONS.md` and apply every entry marked `OPEN` that
names a card in this round's scope. Mark each one `APPLIED IN <round-id>` in the
same PR.

A previous round's plan is **the record of what was tested** and is never edited
after the round has run — doing so would falsify the evidence. So when a card is
found to be defective (a step whose expected outcome cannot occur, a worked
example that cannot succeed, an expected result describing behaviour the product
does not have), the correction is recorded in the register against the **card
ID** and applied when that card is next carried forward.

⭐ **A card that asks an impossible question produces a Fail that says nothing
about the product — and will keep producing one every round until the card, not
the product, is fixed.** The register is what stops a known-bad card being
re-issued verbatim.

⚠ The register records **wording only**. It never marks, re-marks or re-scores
anything — §2 reserves that to the tester, and a re-score to the project owner.

**Building `PREV` — the session JSON, then the owner's re-marks on top.**

The previous-round dots come from the prior round's session JSON `current` map.
That file is the tester's verbatim export and is **never edited**. But the owner
may re-mark a card after the round closed, so `PREV` is built in two steps:

1. Load the most recent session JSON's `current` map.
2. Apply every entry in `docs/testing/uat/VERDICT_REMARKS.md` for that round,
   overriding the exported verdict.
3. Omit any id whose result is not `pass` / `fail` / `skip` — **`untested` is not
   a prior result** and must render grey rather than be invented into one.
4. Name the overridden ids, and why, in the matrix's header comment.

⚠ **This is not cosmetic.** §8 defines a regression as "green last round, fails
this round". A stale red dot on a card the owner ruled Pass **downgrades a real
regression to a repeat**, silently reclassifying the highest-priority defect
class.

**Matrix template rule.** Every matrix is generated by copying
`docs/testing/uat/matrices/uat_matrix_template.html` as its structural base —
CSS variables, screenshot handling, persistence, report generation and button
layout are taken verbatim. Round-specific extension fields must be documented in
the template before first use. **No matrix is written from scratch, and the
template is never modified for a specific round.**

These are docs-only artifacts. No `src/` changes, ever, in a plan-and-matrix PR.

**Every matrix must pass the mechanical self-check before it reaches the tester:**

```bash
npm run verify:uat-matrix -- docs/testing/uat/matrices/uat_matrix_<round-id>_YYYY-MM-DD.html
```

`tools/verify-uat-matrix.cjs` loads the file headlessly and asserts that it
actually works — rendering, verdict wiring, severity gating, persistence, the
export → clear → import round-trip, the teardown gate, and both downloads. It
derives its expectations from the matrix's own data, so it is round-agnostic.

⚠ It checks that the matrix **works**, never that it asks the **right
questions**. Whether a step is human-executable, whether a named control exists,
and whether an `auto_note` cites a real spec remain human review (§5).

### 3.3 Step 2 — Execute (tester)

The tester opens the HTML matrix in a browser and works through it against the
**packaged application**, not a dev build:

- Marks each test Pass / Fail / Skip
- Writes what was actually observed on every Fail — observed vs expected
- Attaches a screenshot to every Fail
- State auto-saves to `localStorage`; export the session JSON at the end of each
  sitting so a browser reset cannot lose the round

### 3.4 Step 3 — Generate the summary report (tester, one click)

The **Generate Test Summary Report** button downloads
`uat_summary_<round-id>_YYYY-MM-DD.md`. The tester commits it to
`docs/testing/uat/reports/`, and the exported session JSON to
`docs/testing/uat/sessions/`.

The report contains:

- Summary table — total / pass / fail / skip / untested
- Passed tests, with any notes
- Failed tests, with type, observed behaviour and screenshot reference
- Skipped tests, with reason
- ⭐ **Tests without automated regression coverage** — every failed test where
  `auto_covered: false`. This table drives §7.

### 3.5 Step 4 — Triage (agent)

The agent reads the report and, for each failure: **records** the tester's
severity per §6, determines whether it is a **regression** (the matrix's
previous-round dot was green), and writes the fix spec — including the mandatory
regression test per §7. The output is a triage document filed alongside the
round's report (§12).

⚠ **Severity is recorded, never re-judged.** §2 reserves marking to the tester
and re-scoring to the owner. Where triage measures that a severity or verdict
looks wrong, it says so as an open question and changes nothing; a re-mark
reaches `VERDICT_REMARKS.md` only after the owner rules.

⚠ **A round also produces findings that failed no card.** Testers raise feature
requests in the notes of cards that **passed**, so they appear in no failure
table, no severity tally and no issue payload — and are the easiest thing in a
round to lose. Triage must capture them in
`docs/testing/uat/FEATURE_REQUESTS.md`, which carries **no severity** and does
**not** count against the §11 pass bar. ⭐ Keeping them out of the defect ledger
is the point: a request filed as a defect distorts the release gate, and a defect
filed as a request escapes it.

Defects are tracked as **GitHub Issues**, labelled `defect`, `severity:high` /
`severity:medium` / `severity:low`, and `regression` where applicable.

⚠ **The agent never creates GitHub Issues without explicit authorisation from
the project owner.** Issue creation is outward-facing. The agent prepares the
payloads; the owner says go.

### 3.6 Step 5 — Remediate and re-run

Fixes land as ordinary feature-branch PRs with their regression tests. The next
round runs the **full matrix**, not only the failed tests — the previous-round
dots make regressions visible, and that only works if everything is re-run.

⭐ Expect more than one round. A round that finds nothing on its first pass is
more likely to be a matrix problem than a quality result.

---

## 4. Test types

| Type            | `type` value    | `auto_covered` | What it means                                                                                                                                                                                           |
| --------------- | --------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gate test**   | `"gate"`        | `true`         | An automated spec already proves the logic. The tester verifies the observable behaviour the spec cannot see.                                                                                           |
| **Edge case**   | `"edge"`        | `false`        | No automated coverage exists. The tester's steps are the only evidence.                                                                                                                                 |
| **Interaction** | `"interaction"` | `false`        | A live application workflow — packaging, window behaviour, menus, file dialogs, HA connection.                                                                                                          |
| **Fidelity**    | `"fidelity"`    | varies         | ⭐ HAVDM-specific. Does the YAML HAVDM produced render correctly in Home Assistant, and does HAVDM honestly mark what it could not translate? Judgement about _output correctness_, not code behaviour. |

**`auto_covered: true` requires an `auto_note`** — one sentence naming the
actual spec and stating what the human is left to verify. For example:

> `tests/unit/card-clone.spec.ts` proves the clipboard transforms deep-clone
> nested branches. You are checking that a pasted card is genuinely independent
> in the running app — edit the copy, confirm the original does not change.

⭐ The `auto_note` is not decoration. It tells the tester which layer they are
inspecting, so they stop re-testing the engine and start testing the product.

---

## 5. Writing test cards — the rule that matters most

**Every step must be something the tester does in the running application.**

WRONG — these are not UAT and must never appear on a card:

> "Run `npm run test:unit`"
> "Confirm `src/utils/cardClipboard.ts` exists"
> "Check that `cleanView` passes the key through"
> "Assert the store recorded one history entry"

RIGHT — actions a person can actually perform:

> "Launch the packaged app from `out/`"
> "File → New Dashboard, name it `uat-scratch`"
> "Drag a Button card from the palette onto the canvas"
> "In Properties, set Entity to `light.kitchen`"
> "Confirm the YAML pane shows `entity: light.kitchen`"
> "Press Ctrl+Z and confirm the card returns to its previous position in one step"

⭐ **Group cards by FEATURE, not by code component.** "Card Authoring",
"Views & Sections", "Import/Export" — never "yamlService", "dashboardStore",
"PropertiesPanel". The tester is using a product, not reading an architecture.

Verification commands, suite baselines and file-existence checks belong in §3.1
prerequisites, not on a card.

⚠ **The step must also be one that can actually succeed.** A step is not
human-executable merely because a person can perform the keystrokes — its
expected outcome has to be reachable. A worked example chosen so that the feature
under test cannot possibly handle it, or an expected result describing behaviour
the product does not have, is the same defect as an unrunnable step: the card
measures itself rather than the product. Both round-2 examples are recorded in
`docs/testing/uat/CARD_CORRECTIONS.md`.

---

## 6. Severity rubric

**High** — any of:

- Data loss or silent corruption of a user's dashboard, config or file
- The failure blocks another test from running
- A core workflow cannot be completed at all (cannot create, save, open or export)
- The application crashes, hangs, or renders blank
- Invalid YAML is produced and presented as valid
- A write reaches Home Assistant that the user did not ask for

**Medium** — any of:

- A feature works but produces the wrong output (wrong value, wrong card, wrong view)
- A translation is silently lossy where HAVDM should have marked it
- Undo/redo restores the wrong state, or requires an unexpected number of steps
- A dialog shows stale values after re-opening
- The error message for a real failure is missing or misleading

**Low** — any of:

- Cosmetic issues — spacing, capitalisation, icon, colour
- Awkward wording that does not impede understanding
- A convenience that is missing but has a working alternative path

⭐ **Data loss is always High**, regardless of how unlikely the path. The product
vision states that HAVDM must never silently destroy user data; a rubric that
lets a data-loss defect be classified Medium contradicts it.

---

## 7. Regression mandate

⚠ **A UAT defect that failed a test with `auto_covered: false` MUST gain
automated coverage as part of its fix.** The summary report's "Tests without
automated regression coverage" table exists to make this non-negotiable.

- **Logic / state defect** → a new unit or integration spec, asserting the
  behaviour that was wrong.
- **Workflow defect** → an e2e spec, using the DSL per
  `docs/testing/TESTING_STANDARDS.md`.
- **Fidelity / translation defect** → a fixture-level assertion in the export or
  round-trip specs. ⭐ Per the slice F lesson, **a round-trip claim needs a
  round-trip test** — assert through the real parse/export path, never by
  hand-building the intermediate object.
- **Visual / cosmetic defect** → automated coverage is not required; record it
  as a note on the test card so the next round re-checks it deliberately.

The rationale is simple: UAT is expensive and human. Any defect it finds twice is
a defect the automated suite should have caught the first time.

---

## 8. Regressions and previous-round indicators

The matrix shows a faded **previous-round dot** on every card, populated from the
prior round's session JSON:

- Green = passed last round
- Red = failed last round
- Grey = no prior result

A card that shows green from last round and fails this round is a **regression**
— the highest-priority defect class, because it represents capability loss. The
tester notes "regression from previous pass"; the Issue gets the `regression`
label on top of `defect`.

This only works if session JSONs are committed every round. They are round
artifacts, not scratch files.

⚠ **A dot may differ from the committed session JSON, and legitimately so.** The
owner can re-mark a card after a round closes. Those re-marks live in
`docs/testing/uat/VERDICT_REMARKS.md` and are applied on top of the export when
`PREV` is built (§3.2) — the export itself is never edited. Where the two
disagree, the ledger records who ruled what, when, and why.

---

## 9. Provenance and HAVDM deltas

This framework is adapted from the UAT system in the `promptmi` project
(`docs/TEST_STRATEGY.md` §3/§6/§7/§8, `docs/prompts/claude/uat-plan-and-matrix.md`
v1.1, and `docs/test/uat/uat_matrix_template.html`), which
`docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md` identifies as proven governance
worth porting.

What changed for HAVDM, and why:

| promptmi                                       | HAVDM                                                    | Why                                                                                               |
| ---------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `gut_covered` (one automated layer, GUT)       | **`auto_covered`** + `auto_note` naming the spec         | HAVDM has three layers — unit, integration, e2e. "Covered" is meaningless without saying by what. |
| Test type `narration` (judge the NPC's speech) | Test type **`fidelity`** (judge the generated HA config) | HAVDM's equivalent judgement call is about translation faithfulness, not prose quality.           |
| `docs/test/uat/`                               | **`docs/testing/uat/`**                                  | `ai_rules.md` §2 — testing docs live under `docs/testing/`.                                       |
| `docs/prompts/claude/`                         | **`prompts/claude/`**                                    | HAVDM's existing prompt-library convention (`prompts/README.md`).                                 |
| Creative Director distinct from all agents     | Solo owner is the tester                                 | Role separation is thinner, but §2's rule that the agent never marks a test still holds.          |
| Live-service testing not applicable            | ⚠ **Bounded temp-dashboard write** to `<HA_HOST>`        | See §10 — the standing rule is read-only, and UAT holds a narrow, named exception.                |

---

## 10. ⚠ Live Home Assistant policy during UAT

HAVDM's standing rule is that live testing against `<HA_HOST>` is
**READ-ONLY**, because that instance is VPP-enrolled via Amber Electric
SmartShift.

UAT holds one bounded exception, authorised 2026-07-27 and recorded in
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md` §4:

**PERMITTED** — deploy-flow test cards may write to a HAVDM **temporary
dashboard** and must remove it before the round closes:
`haWsCreateTempDashboard` → `haWsUpdateTempDashboard` → `haWsDeployDashboard`
(temp path) → `haWsDeleteTempDashboard`.

**REQUIRED** — teardown is a numbered step on the card, not a reminder. The
summary report is not generated until the temp dashboard is confirmed gone.

**FORBIDDEN** — writing to any production dashboard; `haWsSaveDashboardConfig`
against an existing user dashboard; any Modbus, inverter, VPP or Remote-EMS
surface; any automation, script or helper mutation.

Outside UAT rounds run under this document, live HA access remains strictly
read-only for all development and agent-run testing.

---

## 11. Acceptance

A round is **accepted** when the pass bar in
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md` §3.1 is
met:

1. Zero open High-severity defects — no exceptions.
2. Every Medium either fixed or explicitly accepted with written rationale in the
   release notes.
3. Lows recorded, deferral permitted.
4. Every defect that failed an uncovered test has gained coverage (§7).
5. No test left Untested — Skip with a reason is a decision, blank is not.

⭐ The bar is defined before the round runs. A bar agreed after the results are in
is not a bar.

---

## 12. Artifacts produced

| Artifact             | Location                                                                                             | Produced by       |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ----------------- |
| UAT test plan        | `docs/testing/uat/plans/uat_plan_<round-id>_YYYY-MM-DD.md`                                           | Agent             |
| HTML test matrix     | `docs/testing/uat/matrices/uat_matrix_<round-id>_YYYY-MM-DD.html`                                    | Agent             |
| Session JSON         | `docs/testing/uat/sessions/uat_session_<round-id>_YYYY-MM-DD.json`                                   | Tester (export)   |
| Summary report       | `docs/testing/uat/reports/uat_summary_<round-id>_YYYY-MM-DD.md`                                      | Matrix (download) |
| Screenshots          | embedded in the session JSON; extracted to `docs/testing/uat/screenshots/` when attached to an Issue | Tester            |
| Issue payloads       | `docs/testing/uat/archives/uat_issues_<round-id>_YYYY-MM-DD.sh`                                      | Matrix (download) |
| Triage document      | `docs/testing/uat/reports/uat_triage_<round-id>_YYYY-MM-DD.md` (§3.5)                                | Agent             |
| Corrections register | `docs/testing/uat/CARD_CORRECTIONS.md` — standing, append-only across rounds (§3.2)                  | Agent             |
| Re-mark ledger       | `docs/testing/uat/VERDICT_REMARKS.md` — owner re-marks, applied over the export (§3.2, §8)           | Owner rules       |
| Feature requests     | `docs/testing/uat/FEATURE_REQUESTS.md` — standing, append-only; requests that failed no card (§3.5)  | Agent records     |
| Superseded rounds    | `docs/testing/uat/archives/`                                                                         | Agent             |

⚠ The **issue payload** is the `gh issue create` script the matrix downloads
alongside the summary. It is filed as a **record of what the round would have
raised**, not as repo tooling — it is committed non-executable and is never run
from the working tree. §3.5 still governs: the agent never creates Issues without
the owner's explicit authorisation.

---

## 13. Related documents

- `docs/testing/TESTING_STANDARDS.md` — the automated layers and Regression Gate Matrix
- `docs/testing/SKIPPED_TESTS_REGISTER.md` — intentional automated-suite skips
- `prompts/claude/uat-plan-and-matrix.md` — the round generator
- `docs/testing/uat/CARD_CORRECTIONS.md` — measured corrections to apply when a card is carried into a later round (§3.2)
- `docs/testing/uat/VERDICT_REMARKS.md` — owner re-marks, applied over the session JSON when building `PREV` (§3.2, §8)
- `docs/testing/uat/FEATURE_REQUESTS.md` — requests the tester raised that failed no card, so they appear in no failure table (§3.5)
- `docs/testing/LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md` — requirements for closing the gaps that make UAT rediscover the same defects (§7)
- `docs/testing/uat/matrices/uat_matrix_template.html` — the structural base for every matrix
- `tools/verify-uat-matrix.cjs` — the matrix self-check (`npm run verify:uat-matrix`)
- `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md` — the amendment establishing this framework
- `ai_rules.md` §2 (document storage), §5 (test execution and reporting)
