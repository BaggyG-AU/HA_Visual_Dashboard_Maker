# HAVDM Operating Agreement

**Status:** Normative — binds every agent working on HAVDM, in any tool, with
or without MemPalace access.
**Author:** Claude Fable 5
**Reviewer:** Codex (on-branch review
`docs/reviews/governance-codification-codex-review.md`; findings applied in a
follow-up commit on the same branch)
**Owner gate:** merge of the PR that lands or amends this document — the
owner's merge ratifies its text.
**Authority:** owner ratification of 2026-08-06
(`drawer_havdm_decisions_0475d2d73336a4a2481bdec6`, ratifying Tier 1 of
`docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md`, merged as PR #130).

This document is **pointer-style** by design, per `ai_rules.md` §11: it states
the operative rules and points at the authoritative MemPalace drawer for each
ruling's full narrative (context, alternatives, supersessions). It never
carries that narrative itself, and no committed document becomes an
alternative store for it — an already-authoritative committed operative
document (e.g. the multi-model plan) may serve as a pointer target, nothing
more. If a line here starts growing content, the content moves to the memory
store and the line shrinks back to a pointer (§3.3).

**Precedence:** implementation-safety rules in `ai_rules.md` cannot be
overridden by anything here. The phase framework
(`docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md`,
`docs/governance/PHASE_WORKFLOW.md`) governs scope, sequencing and packaging.
This document governs the session-level workflow between those two layers.

---

## 1. The two hard gates

1. **Plan sign-off before implementation begins.** Investigate read-only,
   present a short plan, and obtain the owner's explicit sign-off before
   implementation. Autonomous execution (implement → test to green → commit →
   push → open PR, without per-step permission) begins **after** sign-off,
   never before. Work of the R7 class additionally requires a **written spec**
   approved by the owner before any code (§3).
2. **The agent never merges on its own authority.** The merge decision is the
   owner's, every time: the owner merges via the GitHub UI, or explicitly
   approves the `permissions.ask` prompt on `gh pr merge`. That ask rule
   (machine-local `.claude/settings.local.json` — gitignored, so a fresh clone
   must not assume it is present; the rule binds regardless) is a
   non-removable mechanical backstop, not a delegation. Never commit or push
   to `main`.

Authority for both gates: the autonomy agreement, 2026-07-25 —
`drawer_havdm_decisions_9e545b5b958d1c1ef33c701c` (which also specifies the
read-only-investigate → short-plan sequence and the post-merge routine below).

## 2. Standing disciplines

- **Branch only via the scripts** — `tools/feature-start` /
  `tools/feature-finish`; never ad-hoc git branching. PRs are non-stacked and
  based on current `main`, with **one content commit**. On a governed
  artifact's branch (§3), the invariant's review commit and any post-review
  fix commits are additional commits on the same branch by design; they are
  never squashed or amended in a way that erases reviewer authorship.
- **Post-merge routine** (agent-executed, autonomous, per the autonomy
  agreement drawer cited in §1): verify
  `git merge-base --is-ancestor <sha> origin/main`, ff-only sync `main`,
  prune the branch, bump the `[STATE]` drawer. (Re-running `./tools/checks`
  on the merged `main` is standing practice, not part of the drawer-ratified
  routine.)
- **Red-before-green, same checkout:** a new test is proven by seeing it fail
  on base where a valid red leg exists. The controlling test is whether a
  valid red leg exists, not whether the code is newly named. Where none
  exists — the documented case is a brand-new module, whose test fails at
  import rather than on behaviour
  (`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-02.md`) —
  the spec or docblock must say so explicitly and name the alternative
  evidence.
- **Never blind-rebaseline.** Snapshot and suite diffs are triaged against
  the documented baseline; a rebaseline requires an explained cause and the
  owner's authorization (precedent: the one authorized rebaseline landed in
  its own PR — #128, `drawer_havdm_decisions_c9a9720edc90cf10ce5b67d6`).
- **Gates are reported from a real run** — `ai_rules.md` §5: never claim a
  gate you did not execute. Report `./tools/checks` with its real exit code,
  never a piped or laundered result. (Also confirming the 4/4 step count is
  standing verification practice, not §5 law.)
- **UAT role separation:** the owner runs UAT and marks every test; the
  agent never marks a test (`docs/testing/UAT_STRATEGY.md` §2).
- **Live Home Assistant:** `<HA_HOST>` is read-only for agent work; the
  sole exception is the bounded owner-run UAT envelope
  (`docs/testing/UAT_STRATEGY.md` §10, preserved by
  `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-04.md`).
  `<HA_TEST_HOST>` is writable for agent work (same amendment).
- **Memory and reporting:** `ai_rules.md` §11 memory cadence and §12
  Workflow State block apply to every significant response. Agents without
  MemPalace write access surface drawer-candidate notes in their PR body for
  a write-enabled agent to file (`ai_rules.md` §11). **Independent reviewers
  are the one exception — see the writer-lease bullet immediately below.**
- **The MemPalace writer lease — reviewer surfaces, author files.** Only one
  process holds the per-palace writer lease, so under the pairing where one
  model authors and a different model reviews, the reviewer's write is
  routinely refused. This is expected, not a fault: **the reviewer records a
  `MemPalace drawer candidates` section at the end of its committed review
  file, and the write-enabled author files them with
  `added_by="<reviewer>"`.** ⚠ **This is a REVIEWER-SPECIFIC EXCEPTION that
  `ai_rules.md` §11 now carries itself**, so the two documents state one rule
  rather than two — the review file is the reviewer's own committed
  deliverable on the branch, so the notes still arrive with the PR. **Agents
  that are not acting as an independent reviewer continue to use the PR body**
  exactly as `ai_rules.md` §11 says. ⚠ **The exception must live in
  `ai_rules.md` itself, not only here:** that file is both the
  highest-precedence text and the first one an agent is told to read, so
  scoping the clash away in this document alone leaves a no-MemPalace reviewer
  on the PR-body fallback. **"Immutable" in its title means its rules win on
  conflict, not that the file cannot be amended** — it is amended through this
  invariant, as it was here. Evidence and history:
  `drawer_havdm_review_b23fc37ce14ccdeaf159e6ca` and the PR #139 record.
  ⚠⚠ **Never kill a process
  to free the lease and never set `MEMPALACE_MCP_ALLOW_PEER_WRITER`** — a
  read-only-latched server never re-evaluates and must itself be restarted
  (VS Code: Reload Window); the latch is deliberate, because a second
  long-lived client would serve a stale index. Evidence: refused in **all six
  rounds** of PR #137, predicted verbatim by that PR's round-1 record, and the
  split worked every time without incident.

## 3. Independent Artifact Review invariant

Ratified 2026-08-06 (`drawer_havdm_decisions_0475d2d73336a4a2481bdec6`),
piloting on F5/F8; permanence decided at the v1.0.0 gate / Phase 7 close-out.

⚠⚠ **SCOPE OF CLASS (d), STATED EXPLICITLY BECAUSE THE 2026-08-08 RULING DID
NOT SETTLE IT AND AN INDEPENDENT REVIEW FOUND THE AMBIGUITY BLOCKING.** Class
(d) **joins the existing pilot rather than pre-empting its verdict**: it
applies to **every** slice implementation from 2026-08-08, and its permanence
is decided at the **same v1.0.0 gate / Phase 7 close-out** as classes (a)–(c),
on the data the pilot collects. It is **not** permanent law yet. The original
ratification's "two data points" wording described the F5/F8 _spec_ pilot; the
owner has widened what the pilot observes, not shortened it. **If the owner
intends class (d) to be permanent before that gate, that is a further ruling
and this paragraph is what it must amend.**

> No agent approves an artifact it authored. Every artifact in the classes
> below is reviewed by a **different model** before it reaches the owner for
> sign-off; the review is a committed document on the artifact's branch, not
> a chat reply. The owner remains the final approver in all cases. Same
> model in a different session is **not** independent.

**Governed artifact classes:** (a) written specs and remediation plans of the
R7 class; (b) substantive governance changes — including changes to this
document; (c) triage documents that rank or re-scope defects; (d) **slice
implementations — see §3.4 for the review lifecycle: one mandatory full
round, then a scoped follow-up on every post-review repair (STRAT-D7).**
Reviews of these
artifacts are themselves governed artifacts for header purposes (§3.1).
**Explicitly not covered:** nothing in the four classes above is exempt.
Work outside them — chores, dependency bumps, docs typo passes — remains
covered by the owner's PR review, the gate suite, UAT, and the periodic
adversarial passes of §3.2.

**Mechanics:** the review lands on the artifact's branch as
`docs/reviews/<branch-shortname>-<reviewer>-review.md`; the owner signs off
reading artifact and review together. Seat assignment: the **§3.6 default
seat table** (STRAT-D4), with any per-slice owner override recorded in the
artifact header. (Supersedes the earlier standing assignment recorded here —
"Opus authors the F5/F8 specs, Codex reviews" — which the seat table now
subsumes.)

### 3.1 Artifact headers

Every governed artifact — an R7-class spec or remediation plan, a triage
document, a governance change, or a review of one of these — opens with three
separate lines: `Author:`, `Reviewer:`, `Owner gate:`. This header is the
invariant's entire enforcement mechanism — it makes author ≠ reviewer
auditable at a glance. The invariant is deliberately **not** machine-enforced
(§3.3).

⭐ **Headers name the exact model** (e.g. "Claude Fable 5", "GPT-5.6 Sol"),
never only the vendor or family — the §3.6 watch instrumentation attributes
escaped defects to seat + model, and that attribution is only as good as the
header (STRAT-D5, 2026-08-18).

⭐ **ARB-R8 (2026-08-07): the header binds the CHANGE ARTIFACT, not the
long-lived instruction file that a governance change edits.** The change
artifact is the spec, remediation plan, triage document or independent review
— the thing produced for this change. `ai_rules.md` and `CLAUDE.md` do **not**
carry the header and never have; neither does this document's body beyond its
own front matter. **No retrofit is owed anywhere.** The §3 invariant itself is
unchanged: substantive governance changes are still independently reviewed by
a different model, on-branch, before the owner merges. Authority:
`drawer_havdm_decisions_ac026150b5fe8c5e6f70c519`. ⚠ This clarification had
been owed since PRs #135/#136 and was deferred to "the next governance PR that
already needs a review"; two independent readers hit the same ambiguity in the
meantime, which is the cost of leaving a ruling unwritten.

### 3.2 Templates and cadence

- R7-class specs and remediation plans use `docs/templates/FEATURE_SPEC.md`
  (mandatory for that class; optional for other specs unless the owner rules
  otherwise).
- Adversarial reviews use `docs/templates/ADVERSARIAL_REVIEW.md` and run
  **before every UAT round and every release gate** (owner-ruled cadence),
  landing as
  `docs/reviews/HAVDM_ADVERSARIAL_REVIEW_<YYYY-MM-DD>_<round-or-gate>_<MODEL>.md`
  (the round/gate segment keeps two same-model reviews from colliding;
  pre-existing review files keep their historical names).

### 3.3 Rollback triggers (named in advance)

- Three consecutive zero-finding independent **spec** reviews → the pairing
  has gone deferential: switch reviewer vendor, or narrow the invariant to
  governance changes only. ⚠ A single clean approval is **not** this trigger:
  PR #137's round 6 returned APPROVE with no actionable finding and that was
  the first clean round in six, not three consecutive ones.
- **Class (d) only:** three consecutive implementation slices whose mandatory
  round produces no finding the owner acts on → drop class (d) back out of
  §3 and rely on the gate, the owner's PR review and §3.2's adversarial
  passes, as the invariant did before 2026-08-08.
- Review round-trips add more than one working session of wall-clock per
  spec without findings the owner acts on → drop to owner-only sign-off and
  record the trial outcome in MemPalace.
- **Seat-table triggers (STRAT-D5, 2026-08-18), watched from day one.** A
  **deferential streak** — three consecutive reviews from one seat with zero
  actionable findings → the owner revisits that seat (switch model or
  vendor). An **escaped defect** that a review of record plausibly should
  have caught → attributed to seat + model (§3.6), and the owner revisits
  that seat. The wall-clock trigger above is unchanged and applies to every
  pairing. The whole seat table is revisited at the **v1.0.0 gate** on
  accrued per-model data. ⓘ The streak threshold of three mirrors the
  three-consecutive convention already in this section; it and the §3.6
  cross-check count are the two F5 thresholds proposed at PR-3 drafting for
  the owner's confirmation.
- **Class (d) cost trigger, which fires even when every round finds
  something.** If implementation review adds more than one working session of
  wall-clock across any **three consecutive slices**, and **no round in them
  produced a product- or behaviour-bearing finding** → narrow class (d) to
  cross-cutting slices only, or drop it. ⚠ This trigger exists because the older one cannot fire while each round
  produces one small acted-on residue — which is exactly the shape PR #137
  took across rounds 2–6.
- Any proposal to **machine-enforce** author ≠ reviewer (CI, hooks,
  scripts) → stop; the invariant is cheap only while it is a header
  convention.
- The rulings index (§4) accumulating content rather than pointers → cut it
  back to one line per ruling.

### 3.4 Implementation slices — the review lifecycle

Owner-ruled 2026-08-08, narrowed by the owner 2026-08-09 after eight review
rounds, and amended by the owner 2026-08-18 (**STRAT-D7**: the
no-automatic-follow-up default is replaced by the universal scoped repair
follow-up below; authority
`drawer_havdm_decisions_bd49cedc80cb93cafabc0f86` and
`docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md` §6 D7 with
corrections C6/C7, BINDING-CLEAR per
`docs/reviews/strategy-model-roles-codex-recheck2.md`).

> **(d) slice implementations: one full independent review is mandatory
> before merge. After that round, the author answers every finding in a
> committed disposition table, and EVERY post-review repair receives a scoped
> follow-up by the same reviewer — no exemptions, no classification boundary,
> no decider. The only mechanical fact the rule consumes is that a repair
> exists.**

⚠ **The first round is a full review; it is not a formality.** Its measured
basis is PR #137 round 1, which found a harness defect that let the palette
gesture drag the wrong card while count-only assertions stayed green — the
gate suite did not catch it, the author's own testing did not, the reviewer
did. **Rounds 2–6 of that PR found no product-code defect at all.** The value
is concentrated in the first round; the cost was spread over five more.

**The repair lifecycle (STRAT-D7):**

- **The disposition table.** The author answers every finding in a committed
  RESOLVED/REGRESSED disposition table carrying, per repair, a
  **blast-radius statement**: upstream reliances and downstream consumers —
  for shared-DSL work, the `ai_rules.md` §4b consumer inventory. It lives in
  its own committed artifact on the branch,
  `docs/reviews/<branch-shortname>-repair-dispositions.md`, one dated section
  appended per round and never rewritten. (Home settled at PR-3 drafting per
  the strategy's open sub-question 6: the reviewer's own file is never
  amended by the author, so the table cannot live there.)
- **The scoped follow-up.** Same reviewer; scope is the repair diff **plus
  the declared radius**. It confirms the claimed closures, sweeps the repair
  for introduced defects, and **independently verifies the radius
  declaration** — a wrong or missing radius is itself a finding.
- **Depth is proportional, and is decided inside the follow-up, not before
  it.** For a records-only diff the follow-up is naturally minimal: the
  reviewer reads the diff, confirms it changes no behaviour and no governed
  rule text, confirms the disposition table, and is done in minutes. The
  exemption decision and the minimal review are the same act, so nothing is
  classified in advance and nothing can false-accept. Repairs touching the
  governed rule surfaces (below) receive the follow-up with the
  never-incidental weight this section already records.
- **Honest cost, recorded with the rule:** at PR #137 all five repair rounds
  would have received follow-ups, three of them trivial. Two successive
  attempts to draw a cheaper trigger each became the next independent
  review's finding (strategy corrections C2 → re-check N1 → C6); the
  boundary was **removed, not redrawn**.

⚠ **This lifecycle COMPLIES WITH — it does not supersede — the
no-mechanical-decider ruling immediately below: no command is normative
anywhere in it.**

⚠⚠ **THERE IS NO MECHANICAL EVIDENCE-ONLY TEST, AND NO COMMAND IS NORMATIVE
FOR THIS SECTION.** An earlier form of §3.4 defined a repair lifecycle around
a `git log` pipeline that decided which repairs required a further round.
**Six review rounds and one audit each found a different false-accept route in
that pipeline; no round found a defect in the population it was meant to
decide.** The owner removed it on 2026-08-09 rather than repair it an eighth
time. ⚠ That is a judgement about one implementation's reliability and cost as
a _normative decider_ — **not a claim that the property admits no decision
procedure**, which the evidence does not establish. The full record is
`docs/reviews/governance-review-invariant-implementation-codex-review.md` and
`docs/reviews/pr139-defect-pattern-audit.md`.

⚠ **The governed rule surfaces — `ai_rules.md`, `CLAUDE.md` and
`docs/governance/**` — are never treated as incidental**, because on a
governance change the rule text _is_ the product.

### 3.5 Reviewer re-run scope (binding)

Owner-ruled 2026-08-08. Previously provisional guidance in
`docs/testing/TESTING_STANDARDS.md`, which now points here.

A reviewer of a class-(d) artifact **must** re-run, and must report each with
the command that produced it:

1. **The single load-bearing spec** for the change.
2. **A deeper repeat than the author published** on the flakiest mechanism —
   escalation, not duplication.
3. **`./tools/checks`**, reported with its real exit code.

**Measured basis, both from PR #137 round 1:** (1) returned **31 passed / 1
failed** against the author's reported 32/32 — that one ~5-minute run is the
entire reason a fix round existed; (2) at `--repeat-each=5` returned **3
passed / 2 failed**, which is what proved M1 was a real defect rather than a
one-off. (3) is close to free.

⚠⚠ **THE EVIDENCE IS ONE PULL REQUEST. Six rounds on PR #137 are six
observations of the same slice, not six independent slices.** The owner's
adoption of it as binding is therefore a **JUDGEMENT, not a measured
generalisation** — accepted deliberately, and bounded by class (d) being part
of the pilot: this is reassessed at the v1.0.0 gate with whatever further
slices the pilot collects. An earlier draft presented it as though the
evidence generalised; it does not yet.

**Applicability, so the mandate can be obeyed honestly on every slice:**

- **More than one load-bearing spec** → re-run all of them.
- **No single load-bearing spec** (a slice with no focused spec) → item 1 is
  **not applicable**; say so in the review and name what was run instead.
- **No repeatable flaky mechanism** → item 2 is **not applicable**; say so and
  name why. A reviewer must never invent a repeat to satisfy the rule.
- **"Deeper" means a strictly greater repeat count than the author published.**
  Where the author already published a deep repeat, matching it once is
  sufficient and the reviewer says so.
- **Cost bound:** items 1–3 together should not exceed roughly one working
  session. If they would, re-run what fits, and record what was left
  **UNVERIFIED** — never silently drop it.

**Not binding — guidance only:** the broader MEDIUM domain sweeps are re-run
**by exception**, justified in writing. ⚠⚠ **The evidence for this carve-out
is ONE independently observed re-run, not two, and an earlier draft of this
paragraph overstated it — a defect of exactly the kind the UNVERIFIED rule
below exists to prevent.** What is actually on the record: **round 1's
reviewer did NOT re-run the author's multi-file MEDIUM sweep and said so
plainly**, so round 1's MEDIUM numbers are **author-reported**; **round 2's
reviewer did re-run both sweeps** and observed 107 passed (e2e) and 56 passed
/ 19 skipped (integration) — **the author's numbers unchanged, and no finding
came from either run**, at ~25 minutes combined. ⚠ The tempting exception proves the rule: the sweep's _membership_ was
changed, it _was_ re-run, and the re-run still could not test it — the defect
was in which specs the list contained, and only **reading** the list found it.

⚠⚠⚠ **A re-run not performed leaves the result UNVERIFIED. Never write
"accepted", "confirmed" or "held" for a check nobody ran** — the word choice
is itself a claim about evidence, and "accepting the author's counts"
converts an explicit evidence boundary into apparent independent
verification.

### 3.6 Reviewer eligibility and the default seat table

Owner-ruled 2026-08-18 (STRAT-D3/D4/D5; authority
`drawer_havdm_decisions_8464ae812b9803e14aed517a` and
`docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md` §6,
BINDING-CLEAR per the three-round independent review recorded there).

**The Stage-8 eligibility rule (STRAT-D3, binding):** the implementation
reviewer must have authored **none of the spec, the prompt, or the
implementation**. One sentence extending the §3 invariant, enforced by the
§3.1 header convention. **Fallback** when the roster cannot satisfy it: the
base §3 invariant (a different model from the artifact's author) plus an
**owner waiver recorded in the artifact header**.

**The default seat table (STRAT-D4)** — per-slice owner override recorded in
the artifact header:

| Model         | Default seats                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| **Fable**     | High-stakes upstream: strategy, briefs, governance authoring; hardest implementation reviews                  |
| **Opus**      | Routine upstream; default capability-class implementation review                                              |
| **Sonnet**    | Spec authoring from locked briefs; content-class implementation; implementation review where Stage-8-eligible |
| **Sol/Codex** | Implementation of capability-class work; plan and spec review; governance review; adversarial passes          |

GPT Terra and GPT Luna hold **no load-bearing seat** until a record exists;
entry is via non-load-bearing seats only.

**Watch instrumentation (STRAT-D5), in force from day one:** REV-RERUN (§3.5)
binds whoever holds a reviewer seat; artifact headers name the exact model
(§3.1); escaped defects are attributed to **seat + model**; the **first two
Sonnet implementation reviews receive a Sol cross-check of the review**, and
a third cross-check is required if either of the first two refutes a
load-bearing claim of the review it checks — the owner decides on the agent's
brief at the second cross-check. (The count of two and §3.3's streak
threshold are the F5 thresholds proposed at PR-3 drafting for the owner's
confirmation.) The seat-rollback triggers are in §3.3; the whole table is
revisited at the **v1.0.0 gate** on accrued per-model data.

### 3.7 Proportionality — the two lanes

Owner-ruled 2026-08-18 (STRAT-D6; same authority as §3.6). Process depth is
partitioned by lane; the lanes do not overlap by construction.

- **Fix lane:** the spec-before-code trial scope stands **unchanged** — the
  ruling lives in `CLAUDE.md` at the repository root (landed verbatim, alone,
  by PR #146); full ruling and its 8.8-hour measurement in
  `drawer_havdm_decisions_bc47e8270caa139d3ee11646`. The trial gains its
  previously missing review point: the **v1.0.0 gate**.
- **Slice lane:** **capability/content classification** is the depth dial,
  declared per-spec via the Classification line in
  `docs/templates/FEATURE_SPEC.md` and visible at spec approval.
  Capability-class — shared machinery: services, store, BaseCard,
  cardRegistry, test DSLs, CI logic → the full chain. Content-class —
  individual renderers, panels → light process.
- **The hybrid ban (the bridge):** fix-lane work discovered to be
  capability-shaped **halts and re-enters as its own slice**.
- **The parent-objective header, both lanes:** every plan opens with the
  parent objective, the cheapest acceptable outcome, and a cost stop-rule
  (template lines in `docs/templates/FEATURE_SPEC.md`).

## 4. Rulings index

One row per standing owner ruling: ID, date, status, one sentence, authority.
The authority (MemPalace drawer or committed document) is the record; this
index only locates it. Full narrative never lives here. _Maintenance
convention (not itself ratified law): rows are appended as rulings land;
rulings that predate this index are added when next cited._

| ID         | Date       | Status           | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Authority                                                                                                                                                                                                          |
| ---------- | ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| VISION     | 2026-07-21 | Standing         | Product VISION — nine ratified answers (superset design tool; export translates; never-connected = permissive; …)                                                                                                                                                                                                                                                                                                                                                                    | `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`                                                                                                                                                                  |
| AUTONOMY   | 2026-07-25 | Standing         | Plan sign-off before implementation; the agent never merges; autonomous execution after sign-off; post-merge routine                                                                                                                                                                                                                                                                                                                                                                 | `drawer_havdm_decisions_9e545b5b958d1c1ef33c701c`                                                                                                                                                                  |
| MM-VERDICT | 2026-07-26 | Standing         | No automated multi-model orchestration loop; narrow manual uses only (flake-triage subagent, manual Fable handoffs)                                                                                                                                                                                                                                                                                                                                                                  | `docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md` §6                                                                                                                                                          |
| ARB-R1     | 2026-08-04 | Standing         | HA-05: the persisted capability profile wins; correct the UAT card (the optional freshness note was delivered by PR #129)                                                                                                                                                                                                                                                                                                                                                            | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                                                                                                                                                                  |
| ARB-R2     | 2026-08-04 | Standing         | HA-06: HA themes are kept after disconnect; correct the card; the Reload-disabled test leg stands                                                                                                                                                                                                                                                                                                                                                                                    | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                                                                                                                                                                  |
| ARB-R3     | 2026-08-04 | Standing         | F9 export target is sections-first; `custom:grid-layout` only when sections cannot hold the geometry AND layout-card is installed; always warn when lossy                                                                                                                                                                                                                                                                                                                            | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                                                                                                                                                                  |
| ARB-R4     | 2026-08-04 | Standing         | PROPS-03: both the card correction and the UX fix; no severity re-mark                                                                                                                                                                                                                                                                                                                                                                                                               | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                                                                                                                                                                  |
| ARB-R5     | 2026-08-04 | Delivered (#126) | F7 staged: path-in-label now; in-app surface post-1.0 with FR-01                                                                                                                                                                                                                                                                                                                                                                                                                     | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                                                                                                                                                                  |
| ARB-R6     | 2026-08-04 | Standing         | F12: fs-IPC path scoping (with a threat model) and Windows code signing are formal 1.0 ship-gates, not UAT cards                                                                                                                                                                                                                                                                                                                                                                     | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                                                                                                                                                                  |
| ARB-R7     | 2026-08-04 | Standing         | F5 and F8 each require a written spec signed off by the owner before any code                                                                                                                                                                                                                                                                                                                                                                                                        | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                                                                                                                                                                  |
| REBASE-128 | 2026-08-04 | Completed (#128) | One-time authorization: rebaseline the stale visual snapshot(s) and run the full e2e + integration pass before F4 — not a standing permission                                                                                                                                                                                                                                                                                                                                        | `drawer_havdm_decisions_c9a9720edc90cf10ce5b67d6`                                                                                                                                                                  |
| GOV-RAT    | 2026-08-06 | Standing         | Governance-review Tier 1 adopted: the §3 invariant, both templates, Codex as F5/F8 spec reviewer, adversarial review before every UAT round **and** every release gate                                                                                                                                                                                                                                                                                                               | `drawer_havdm_decisions_0475d2d73336a4a2481bdec6`                                                                                                                                                                  |
| ARB-R8     | 2026-08-07 | Standing         | §3.1's three header lines bind the CHANGE ARTIFACT (spec, remediation plan, triage document, or a review of one), not the long-lived instruction file a governance change edits; `ai_rules.md` and `CLAUDE.md` are exempt and no retrofit is owed                                                                                                                                                                                                                                    | `drawer_havdm_decisions_ac026150b5fe8c5e6f70c519`                                                                                                                                                                  |
| REV-IMPL   | 2026-08-08 | Pilot → v1.0.0   | Slice implementations join the §3 governed classes as class (d): **one full independent review before merge** (§3.4). ⚠ Its no-automatic-follow-up default was replaced 2026-08-18 by **STRAT-D7**'s universal scoped repair follow-up; the mandatory-full-round floor is unchanged. ⚠ Part of the F5/F8 pilot — permanence decided at the v1.0.0 gate. ⚠ The mechanical evidence-only test was removed by the owner 2026-08-09 after eight rounds; no command is normative for §3.4 | this document §3.4; case study `drawer_havdm_patterns_9b2499f0b71c059ee556d65a`; the five-round measurement behind the split `docs/reviews/pr139-defect-pattern-audit.md`                                          |
| REV-RERUN  | 2026-08-08 | Pilot → v1.0.0   | A class-(d) reviewer MUST re-run the load-bearing spec, a deeper repeat than the author published, and `./tools/checks`; MEDIUM sweeps stay by-exception guidance; an unperformed re-run leaves a result UNVERIFIED (§3.5). ⚠ Binding on n=1 PR is an owner JUDGEMENT, reassessed at the v1.0.0 gate                                                                                                                                                                                 | this document §3.5; case study `drawer_havdm_patterns_9b2499f0b71c059ee556d65a`                                                                                                                                    |
| MP-LEASE   | 2026-08-08 | Standing         | Under the writer-lease collision the reviewer surfaces `MemPalace drawer candidates` in its committed review file and the write-enabled author files them with `added_by=<reviewer>`; never kill a process, never set `MEMPALACE_MCP_ALLOW_PEER_WRITER` (§2). ⚠ A REVIEWER-SPECIFIC EXCEPTION to the PR-body fallback, carried in `ai_rules.md` §11 itself so the two documents state one rule — every non-reviewing agent still uses the PR body                                    | `drawer_havdm_decisions_1069fb46eb9173d1dc58a9a2` — current record, incl. which PR ratifies (history: `drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482`; evidence: `drawer_havdm_review_65aecb8d3cb0de6511b03648`) |
| STRAT-D3   | 2026-08-18 | Standing         | Stage-8 eligibility: the implementation reviewer authored none of the spec, the prompt, or the implementation; header-enforced; fallback = base §3 invariant + owner waiver in the header (§3.6)                                                                                                                                                                                                                                                                                     | `drawer_havdm_decisions_8464ae812b9803e14aed517a`; `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md` §6                                                                                              |
| STRAT-D4   | 2026-08-18 | Standing         | Default seat table — Fable (high-stakes upstream; hardest impl reviews), Opus (routine upstream; default capability-class impl review), Sonnet (specs from locked briefs; content impl; impl review where eligible), Sol/Codex (capability impl; plan/spec/governance review; adversarial passes); per-slice owner override in headers; Terra/Luna hold no load-bearing seat until a record exists (§3.6)                                                                            | same authority as STRAT-D3                                                                                                                                                                                         |
| STRAT-D5   | 2026-08-18 | Standing         | Watch instrumentation: exact-model headers (§3.1); escaped defects attributed to seat + model; Sol cross-check of the first two Sonnet impl reviews with a defined third-check trigger (§3.6); seat-rollback triggers — deferential streak, escaped defect, wall-clock (§3.3); table revisited at the v1.0.0 gate                                                                                                                                                                    | same authority as STRAT-D3                                                                                                                                                                                         |
| STRAT-D6   | 2026-08-18 | Standing         | Proportionality partitioned by lane: fix lane = the spec-before-code trial (`CLAUDE.md`, unchanged, review point v1.0.0); slice lane = capability/content classification declared per-spec; hybrid ban; parent-objective header in both lanes (§3.7)                                                                                                                                                                                                                                 | same authority as STRAT-D3                                                                                                                                                                                         |
| STRAT-D7   | 2026-08-18 | Standing         | Universal scoped repair follow-up replaces §3.4's no-automatic-follow-up default: every post-review repair receives a same-reviewer scoped follow-up over the repair diff plus its declared blast radius, depth proportional and decided inside the follow-up; complies with — does not supersede — the no-mechanical-decider ruling (§3.4)                                                                                                                                          | `drawer_havdm_decisions_bd49cedc80cb93cafabc0f86`; strategy document corrections C6/C7; re-check verdict `docs/reviews/strategy-model-roles-codex-recheck2.md`                                                     |
| STRAT-D9   | 2026-08-18 | Standing         | The product plan lives on the GitHub Projects board (the live plan ledger); `[STATE]` stays the live dev-cycle-state ledger; the historical kanban object is non-authoritative and ignored; the board is rebaselined from a roadmap document that is a seeding input, frozen once seeded; Issue creation stays owner-gated                                                                                                                                                           | `drawer_havdm_decisions_8464ae812b9803e14aed517a`; strategy §6 D9 + correction C1                                                                                                                                  |
| STRAT-D12  | 2026-08-18 | Standing         | `ai_rules.md` §4a stays binding; its >5-specs full-suite leg is satisfied by the required remote GitHub Actions full run, consuming STRAT-D7's blast-radius declaration as the consumer inventory; the owner merges only after that run completes and triages green; local full runs are never required (§4a carries the satisfaction wording)                                                                                                                                       | `drawer_havdm_decisions_8464ae812b9803e14aed517a`; strategy §6 D12                                                                                                                                                 |
| STRAT-D13  | 2026-08-18 | Standing         | Green-by-default via owner-gated quarantine: cap 5 (owner-set), flaky identities only, cap only shrinks; consistently-failing tests are excluded and take the triage lane as ordinary board Issues; every entry carries an Owner Decision Brief; supersedes the "recorded, not allowlisted" posture. ⚠ Implementation is a board item, not yet built                                                                                                                                 | `drawer_havdm_decisions_8464ae812b9803e14aed517a`; strategy §6 D13                                                                                                                                                 |
| STRAT-D14  | 2026-08-18 | Standing         | Branch protection: require a PR for all `main` changes with `enforce_admins: true` and required context exactly `ci`; no required-approvals count (shared account would deadlock); the behavioural-check required-flip is an assigned owner duty, board-visible, on the agent's three-consecutive-green-nightlies brief. ⚠ Application is a board item, not yet applied                                                                                                              | `drawer_havdm_decisions_8464ae812b9803e14aed517a`; strategy §6 D14 + correction C3                                                                                                                                 |
| STRAT-D15  | 2026-08-18 | Standing         | The Owner Decision Brief (six fields: what this protects in product terms / what is going wrong plainly / is the product affected Yes-No-Unknown with honest evidence status / options with costs / recommendation and why / what happens if you do nothing) is the standard form for any decision routed to the owner; the owner gate is held by a non-developer and is never asked to classify a diff                                                                              | `drawer_havdm_decisions_8464ae812b9803e14aed517a`; strategy §6 D15 + correction C6                                                                                                                                 |
| STRAT-D18  | 2026-08-18 | Standing         | Severity-gated review disposition: SEV 1 blocks the affected decision only and needs the three-part proof (decision + violated fact/text at `path:line` + why no recorded mitigation covers it); SEV 2 → Owner Decision Brief, non-blocking; SEV 3/4 recorded; owner judgment calls are not reviewable above SEV 4; the model governs what blocks, never what may be reported (binding template text: `docs/templates/ADVERSARIAL_REVIEW.md`)                                        | `drawer_havdm_decisions_8464ae812b9803e14aed517a`; strategy §6 D18                                                                                                                                                 |
