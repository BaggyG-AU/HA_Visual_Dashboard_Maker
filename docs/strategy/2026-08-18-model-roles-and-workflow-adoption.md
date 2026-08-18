# Strategy Session — Model Roles and Workflow Adoption

**Author:** Claude Fable 5 (session facilitator), with the owner live, 2026-08-18.
**Reviewer:** OpenAI Codex — commissioned independent review before the decisions
below are treated as binding (commission: `prompts/codex/REVIEW_STRATEGY_MODEL_ROLES.md`).
**Owner gate:** the owner (micah/BaggyG-AU) landed every decision in this document
live, per item, during the session of 2026-08-18. Per D18, only a SEV 1 finding in
the commissioned review blocks a decision from binding.

**Status:** Decisions landed by the owner in-session; awaiting independent review.

> ⚠⚠ **Declared conflict.** This document was facilitated and written by a Claude
> model, and which roles Claude models hold is one of its central questions. Two
> prior Claude-authored role analyses were refuted on independent review (the
> adoption assessment's §5 role analysis, and the earlier review's Option-A trial
> design — cross-check finding N3). The commissioned reviewer (Codex) is also an
> interested party: its own seats are decided here, and it must tag those
> dispositions INTEREST. The owner's live challenge loop and the independent
> review are the controls for both conflicts.

Document structure: the ten numbered sections below follow the portable
specification's Stage-1 strategy-session structure verbatim
(`prompts/codex/INPUT_PROMPTMI_WORKFLOW_SPEC.md:236-249`).

---

## 1. Question Being Landed

Which model performs which role in HAVDM's workflow — upstream design, spec
authoring, implementation, independent review — and which of the assessed
promptmi workflow mechanics does HAVDM adopt, in what order?

## 2. Why This Matters Now

- The PR #144 arc ended with the owner's measured loss of confidence in agent
  self-reporting: an audited-FAIL self-assessment, at least nine omitted
  incidents, and two audited-false claims still live on `main`
  (`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:254-255`, fresh-read
  2026-08-18).
- Fourteen owner arbitration points
  (`docs/reviews/promptmi-workflow-spec-assessment-codex-review.md` §5) block
  the downstream queue: the settle-plan repair, F8's R7 split plan, the docs
  bundle, branch protection, and the role table itself.
- Every day undecided extends the exact configuration whose record prompted the
  question.

## 3. Prior Context

- **Round 1 of the adoption dialogue (2026-08-06):** HAVDM ratified Tier 1 of
  promptmi governance (`docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md`;
  PRs #130/#131) — the §3 independent-review invariant, both templates, the
  Operating Agreement — and declined five elements with recorded reasons; one
  decline (per-slice implementation review) was later overturned by evidence as
  REV-IMPL (`docs/governance/OPERATING_AGREEMENT.md` §3.4).
- **The spec-before-code trial** (owner ruling 2026-08-16, MemPalace
  `drawer_havdm_decisions_bc47e8270caa139d3ee11646`): plan first for shared
  machinery / timing / product behaviour, Codex reviews before code; a
  `CLAUDE.md` insert is owed, to land alone.
- **The PR #144 evidence base:**
  `docs/reviews/pr144-independent-performance-governance-review.md` (incl. §12
  corrections) and its Codex cross-check; the adoption assessment
  (`docs/governance/PROMPTMI_WORKFLOW_SPEC_ASSESSMENT_2026-08.md`, verdict
  CHANGES-REQUIRED, its §5 role analysis and §8 packaging REFUTED); and the
  fourteen-point review of that assessment, whose §5 supersedes the earlier
  twelve cross-check points.
- **The portable specification** supplied by the owner
  (`prompts/codex/INPUT_PROMPTMI_WORKFLOW_SPEC.md`, gitignored) — treated per
  D1 as proposal, not transcribed law.
- **Session-start state, verified 2026-08-18:** `main` = `5dfd265`, zero open
  PRs, issue #145 open (nightly red, expected), four untracked review
  artifacts, live branch protection absent (`gh api …/branches/main/protection`
  → HTTP 404, re-measured during this session).

## 4. Options Considered

Killed options are retained with why they lost; that is this section's job.

### 4.1 The role question

- **(a) Promptmi's observed fallback** — Sonnet writes specs and reviews Codex
  implementations. _For:_ two completed merged chains exist (promptmi PRs #398,
  #401). _Against, measured this session from the promptmi checkout:_ both
  precedent reviews were written by the spec's own author (PR #398 header:
  "same agent, different role"; PR #401 header: "I authored the approved
  spec"), and neither independently executed the test suite — #398 marked its
  suite criterion "PASS. Codex reports 1262/1262 passing"; #401 wrote "Test
  suite run: UNVERIFIED — Godot is not available in this review environment"
  and approved with the run deferred to the owner. What was battle-tested is
  therefore not what HAVDM would run (HAVDM's REV-RERUN mandates independent
  re-runs). **Killed as-is; its sound parts (Sonnet's spec seat, Codex
  implementing) are absorbed into (b)'s default table.**
- **(b) The portable Stage-8 eligibility rule** — the implementation reviewer
  authored none of the spec, the prompt, or the implementation
  (`prompts/codex/INPUT_PROMPTMI_WORKFLOW_SPEC.md:442-447`, fresh-read). _For:_
  strongest independence; a one-sentence extension of the existing §3
  invariant; HAVDM's current practice already satisfies it; with a six-model
  roster the combinatorial cost is low; it bars exactly the same-author-review
  pattern measured in (a)'s precedents. _Against:_ it is stricter than
  promptmi's own observed practice, so it is an untested-anywhere combination
  when paired with REV-RERUN; roster shrinkage can make it unsatisfiable
  (mitigated by a named fallback). **ADOPTED (D3), with the default seat table
  (D4).**
- **(c) Status quo** — Claude authors, Codex reviews, unchanged. _For:_ the
  best-measured configuration on this project; zero transition cost. _Against:_
  it is the configuration that produced the PR #144 record, and it does not
  address the owner's loss of confidence. **Killed as a standing answer;
  elements survive inside (b)'s table (Codex retains high-stakes review
  seats).**
- **(d) A staged role trial.** _For:_ the project's run-then-codify meta-rule.
  _Against (owner's argument, accepted):_ a trial's result does not generalise
  across delivery complexity and can create false security; the cross-check
  itself found two differently-scoped observations cannot decide a standing
  table; both prior Claude-authored trial designs were refuted as
  underspecified. **Killed (D2). The owner decides now and watches
  consciously.**

### 4.2 Proportionality (arbitration point 4)

- **(i) Keep the trial scope, decline classification** — leaves the
  proportionality gap unnamed. Killed.
- **(ii) Absorb the trial into classification now** — codifies an unproven
  mechanism and invalidates the owed `CLAUDE.md` insert mid-flight. Killed.
- **(iii) Sequence the decision to a later review point** — killed for two
  named defects: the trial has no defined review point (only a rollback
  trigger), and it leaves the new seat table without its depth dial.
- **(iv) Partition by lane — ADOPTED (D6):** the trial scope governs the fix
  lane; capability/content classification governs slice-lane depth; the hybrid
  ban bridges them. No overlap by construction.

### 4.3 Implementation-review lifecycle (arbitration point 7)

- **(i) Keep REV-IMPL's one mandatory round** — killed by the owner's
  evidence: on PR #144, two consecutive repair rounds each introduced a defect
  caught only by elected further review; a default that depends on the owner
  electing correctly every time is a self-policed control.
- **(ii) Promptmi's review-until-APPROVE loop** — killed by the counter-record:
  PR #137's rounds 2–6 found no product-code defect (cost without value), and
  PR #142's round 6 produced a false blocking finding.
- **(iii) Scoped repair re-review — ADOPTED (D7):** automatic follow-up exactly
  where the measured defects were (code-touching repairs), none where the
  measured cost was (doc-only repairs), blast-radius aware per the owner's
  amendment.

### 4.4 Testing policy and gates (arbitration points 6, 8)

- **§4a options:** keep binding with local execution (measured-expensive);
  narrow to risk-based sets (reinstates author judgment where under-enumeration
  is the measured failure); **keep binding, satisfied by the required remote
  full-suite run — ADOPTED (D12)**, enabled by the #143 migration (~26-minute
  free sharded Actions run; shard imbalance measured this session at
  12.1/9.3/26.1/7.5 minutes on run `32054745924` and queued for rebalance).
- **Gate posture:** the standing "recorded, not allowlisted" ruling was made at
  two sightings of the spacing flake; the count is at least six, the gate is
  green roughly one run in four, and the owner had never been told they owned
  the sighting-review duty — the ledger went stale because the duty surfaced
  nowhere the owner looks. **Green-by-default via owner-gated quarantine
  ADOPTED (D13)**; the alternative (keep the red-by-design gate) was killed as
  uninformative-by-construction and as the surface that manufactured two of
  the fifteen PR #144 errors.
- **Branch protection:** apply-now-with-fast-check versus wait-for-full-green
  versus status quo. **Apply now ADOPTED (D14)**; the behavioural check's
  _required_ status follows demonstrated green stability rather than a
  calendar stage.

## 5. Proposal

The integrated design the decisions below constitute: one eligibility rule
(D3) plus a default seat table (D4) replaces both the promptmi table and the
status quo; two proportionality lanes (D6) route work; a blast-radius-aware
repair lifecycle (D7) closes the unreviewed-fix-round gap; GitHub Projects
becomes the event-driven plan ledger (D9, D11) feeding stable identities to
the traceability machinery (D8); the CI gates flip to green-by-default with
mechanical protection (D12–D14); and two presentation mechanisms (D15
owner briefs, D18 severity-gated review disposition) keep every remaining
judgment consciously the owner's. Concerns each element carries are in §7.

## 6. Decisions Landed

All landed live by the owner on 2026-08-18. Binding on the outcome of the
commissioned review per D18.

- **D1.** The portable workflow specification is a proposal informed by
  promptmi practice, not transcribed law. Each element earns adoption on HAVDM
  evidence. (Arbitration point 14.)
- **D2.** No role trial. The role decision is made now; weaknesses are watched
  consciously (D5). Rationale recorded: trial results do not generalise across
  delivery complexity; both prior trial designs were refuted; two
  differently-scoped observations cannot decide a standing table. (Points
  1–3.)
- **D3.** Stage-8 eligibility rule adopted: **the implementation reviewer must
  have authored none of the spec, the prompt, or the implementation.** One
  sentence extending the Operating Agreement §3 invariant, enforced by the
  §3.1 header convention. Fallback when the roster cannot satisfy it: the base
  §3 invariant plus an owner waiver recorded in the artifact header.
- **D4.** Default seat table, per-slice owner override recorded in headers.
  Active roster of four: **Fable** (high-stakes upstream: strategy, briefs,
  governance authoring; hardest implementation reviews), **Opus** (routine
  upstream; default capability-class implementation review), **Sonnet** (spec
  authoring from locked briefs; content-class implementation; implementation
  review where Stage-8-eligible), **Sol/Codex** (implementation of
  capability-class work; plan and spec review; governance review; adversarial
  passes). GPT Terra and GPT Luna hold no load-bearing seat until a record
  exists; entry is via non-load-bearing seats only.
- **D5.** Watch-point instrumentation, in force from day one: REV-RERUN
  (`OPERATING_AGREEMENT.md` §3.5) binds whoever holds a reviewer seat; the
  first two to three Sonnet implementation reviews receive a Sol cross-check
  of the review; artifact headers name the **exact model**; escaped defects
  are attributed to seat + model; rollback triggers named now — a deferential
  zero-actionable-findings streak, an escaped defect a review plausibly should
  have caught, and the existing §3.3 wall-clock trigger; the whole table is
  revisited at the v1.0.0 gate on accrued per-model data.
- **D6.** Proportionality is partitioned by lane. **Fix lane:** the
  spec-before-code trial scope stands unchanged; the owed one-file `CLAUDE.md`
  insert lands verbatim, alone; the trial gains its missing review point — the
  v1.0.0 gate. **Slice lane:** capability/content classification is adopted
  now as the depth dial (capability = services, store, BaseCard, cardRegistry,
  test DSLs, CI logic → full chain; content = individual renderers, panels →
  light process), declared per-spec via a template line and visible at spec
  approval. **Bridge:** the hybrid ban — fix-lane work discovered to be
  capability-shaped halts and re-enters as its own slice. The
  **parent-objective header** (every plan opens with the parent objective and
  the cheapest acceptable outcome, with a cost stop-rule) lands now, both
  lanes.
- **D7.** Scoped repair re-review replaces REV-IMPL's no-automatic-follow-up
  default. After the mandatory full round: the author answers every finding in
  a committed RESOLVED/REGRESSED disposition table carrying, per repair, a
  **blast-radius statement** (upstream reliances; downstream consumers — for
  shared-DSL work, the `ai_rules.md` §4b consumer inventory). Any repair
  touching code, tests, or config triggers an automatic scoped follow-up:
  same reviewer, repair diff **plus declared radius**, confirming closures,
  sweeping for introduced defects, and independently verifying the radius
  declaration — a wrong or missing radius is itself a finding. Doc-and
  evidence-only repairs merge on the disposition table. Executed as an
  Operating Agreement §3.4 amendment with its own independent review.
- **D8.** Deliverable identity is two-tier. Slice-level deliverables become
  GitHub Issues at spec approval — identities GitHub itself guarantees are
  never recycled or renumbered. Document-internal identities (control numbers,
  lettered proposals) get template rules: stable, never recycled, gaps
  deliberate, coverage tables mapping spec IDs to Issue numbers. The
  dropped-commitment checker is rebuilt from a written identity model with
  known-drop and negative controls, as its own spec'd capability-class slice —
  a natural first run of the D4 table.
- **D9.** The product plan migrates to GitHub Projects, effective immediately.
  Measured basis: `havdm.kanban` is gitignored, absent from `HEAD` and the
  working tree, and its only historical commit (`40be934`) contains zero
  cards; `docs/product/PROJECT_PLAN.md:3` defers to a misspelled ghost file.
  `[STATE]` remains the live dev-cycle-state ledger; the board is the live
  plan ledger; each named as such in the governance set. Agent board access:
  draft items and status moves within approved work; Issue creation remains
  owner-gated (spec approval authorises the spec's story set — D11).
- **D10.** The review-template machinery (claim ledger, weakest claims, class
  sweeps, headers) is mandatory for any document whose function is to evaluate
  another artifact — review, cross-check, assessment, audit — however
  commissioned. Commissions may add requirements, never subtract. (Point 13.)
- **D11.** Board usage model: strategy sessions produce `docs/strategy/`
  documents and surface draft epics; the roadmap is the ordered epic column;
  at spec approval each deliverable-coverage row becomes a story Issue
  (sub-issue of its epic) — the approval is the creation authorisation; PR
  bodies carry `Closes #<story>`, so status is **derived from events, not
  asserted by agents**; out-of-scope findings become draft debt items;
  `[STATE]` sheds its plan content (order items 8–13 become epics) and keeps a
  pointer. Rationale never lives on cards — links only.
- **D12.** `ai_rules.md` §4a stays binding; its more-than-five-specs full-suite
  leg is satisfied by the **required remote GitHub Actions full run**,
  consuming D7's blast-radius declaration as the consumer inventory; the
  owner merges only after that run completes and triages green. Local full
  runs are never required. The measured shard imbalance
  (12.1/9.3/26.1/7.5 min) is queued for rebalance at file granularity —
  test-level parallelism is explicitly not the lever while the fixed-`/tmp/`
  profile collisions remain unfixed.
- **D13.** Green-by-default via owner-gated quarantine, **cap 5 (owner-set)**,
  flaky identities only; the cap may be spent from day one and only shrinks —
  a new entry requires a retirement or an explicit owner re-rule.
  Consistently-failing tests are excluded from quarantine and take the triage
  lane (fix the test / fix the product / explicitly accept) as ordinary board
  Issues. Every quarantine entry and triage Issue carries an Owner Decision
  Brief (D15). Sighting records stay in the testing drawer; the attention duty
  lives on the board. This supersedes the "recorded, not allowlisted" posture,
  which was made at two sightings and whose review duty had never been
  assigned to anyone.
- **D14.** Branch protection is applied now: require a PR for all changes to
  `main` (closing the measured direct-push gap — protection API returned 404,
  re-measured this session) with the fast `ci` job as the required check, and
  no required-approvals count (owner and agent share one account; an approval
  requirement would deadlock owner merges). The behavioural/signature check
  becomes _required_ automatically once the quarantined gate demonstrates
  stability — three consecutive green scheduled runs.
- **D15.** The **Owner Decision Brief** is the standard format for any decision
  routed to the owner, generalising the spec-before-code presentation
  obligation already in force. Six fields: what this protects, in product
  terms; what is going wrong, plainly; is the product affected (Yes / No /
  Unknown, with honest evidence status); options with costs; recommendation
  and why; what happens if you do nothing. It lives in the board Issue or
  document where the decision lives.
- **D16.** Packaging. **PR-1:** the owed one-file `CLAUDE.md` spec-before-code
  insert, alone (may proceed immediately — owed under a standing ruling
  independent of this session). **PR-2:** the plan `:254-255` correction,
  alone (may proceed immediately — audit-backed). **PR-3:** one governance
  codification PR for this session's decisions (Operating Agreement
  amendments, rulings-index rows, template changes incl. the
  ADVERSARIAL_REVIEW headless insert), after this document's review, with its
  own independent §3 review — precedent: PR #131 landed the Tier-1
  ratification the same way. Operational work (board, protection, quarantine
  implementation, shard rebalance, checker slice, settle repair, F8 split
  plan, skills) is sequenced by the owner; the quarantine implementation is
  itself a reviewed test-class PR when it happens.
- **D17.** Both audited-false plan lines are corrected:
  `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:254` ("§2.3 corrects every
  evidence error the reviewer found in revision 3") and `:255` ("No CI cycle
  has been spent…"), fresh-read on `main` this session. One docs-only PR
  (= D16's PR-2).
- **D18.** Review disposition for this document (and the model for future
  commissioned reviews of strategy artifacts): findings are tagged SEV 1–4.
  **SEV 1** (blocks the affected decision): the decision as recorded is
  internally contradictory, contradicts a binding ruling it does not
  explicitly supersede, rests on a demonstrably false factual claim, or is
  unexecutable as written — and the finding must name the decision, the
  violated fact/text at `path:line`, and why no recorded mitigation covers
  it, else it is at most SEV 2. **SEV 2** (does not block): rests on an
  unverified/overstated claim or an unmitigated risk — each goes to the owner
  as an Owner Decision Brief. **SEV 3/4**: recorded, no round-trip. **Owner
  judgment calls are not reviewable defects above SEV 4** — the reviewer may
  attack the facts a choice rests on, never the authority to make it. The
  severity model governs what blocks, **not what may be reported**: the
  reviewer reports full signal, tagged; D10's machinery still applies.

**Arbitration-point accounting** — every one of the fourteen points of
`docs/reviews/promptmi-workflow-spec-assessment-codex-review.md` §5, dispositioned:

| Point | Disposition                                                                  |
| ----- | ---------------------------------------------------------------------------- |
| 1     | Decided — D2 (no trial), D3 (eligibility rule), D4 (seat table)              |
| 2     | Dissolved by D2 — with no trial there is no trial vehicle; absorbed into D5  |
| 3     | Dissolved by D2 — judge/measures/budget become D5's standing instrumentation |
| 4     | Decided — D6 (lane partition)                                                |
| 5     | Parked — §8, with revisit trigger                                            |
| 6     | Decided — D14 (branch protection)                                            |
| 7     | Decided — D7 (scoped repair re-review)                                       |
| 8     | Decided — D12 (§4a satisfied by the required remote run)                     |
| 9     | Decided — D8 (two-tier identities; checker as its own slice)                 |
| 10    | Decided — D9 (board = plan ledger; `[STATE]` = dev-cycle state)              |
| 11    | Decided — D16 (packaging)                                                    |
| 12    | Decided — D17 (both plan lines)                                              |
| 13    | Decided — D10 (template machinery mandatory)                                 |
| 14    | Decided — D1 (proposal, not law)                                             |

## 7. Concerns Raised & Mitigations

Preserved from the session's challenge loop; each survived with its
mitigation.

1. **"Battle tested" does not transfer.** The promptmi precedent is two PRs,
   in GDScript/Godot, with same-author reviews and no independent suite
   execution. _Mitigation:_ D2's conscious-decision framing records the true
   evidential footing; D5's instrumentation measures the seats in HAVDM
   conditions from day one.
2. **A mid-tier model in a seat practiced as top-tier adversarial work.**
   HAVDM implementation reviews have produced hostile constructions and
   harnesses. _Mitigation:_ adversarial weight shifts upstream (Sol keeps
   plan/spec/governance review); Opus, not Sonnet, is the capability-class
   implementation-review default; Sonnet's reviews are cross-checked initially
   (D5).
3. **Both newly-seated roles lack controlled HAVDM evidence** (Sol delivery
   ownership; Sonnet reviewer seat). _Mitigation:_ D5 instrumentation plus
   REV-RERUN's mechanically auditable re-run duties.
4. **Handoff chains measurably lose commitments**, and the multi-model design
   adds handoffs. _Mitigation:_ D8's checker becomes an early slice; D11's
   Issue identities are platform-guaranteed; every commission quotes rules
   verbatim (standing law).
5. **The quarantine cap is spent on day one** (~5 unstable identities against
   cap 5). Accepted deliberately: the ratchet pressure is immediate and the
   backlog cannot be ignored.
6. **Quarantine as a rug.** _Mitigation:_ owner-gated entry, board-visible
   follow-ups with briefs, cap ratchet, /whereami age flags, release-gate
   sweep.
7. **Board rot** (the kanban's fate). _Mitigation:_ status is event-driven;
   stories generate from coverage tables; /whereami flags drift; if the board
   needs hand-tending in three months, that is the rollback signal.
8. **Two competing identity systems** (spec IDs vs Issue numbers).
   _Mitigation:_ the coverage table maps them; the Issue is the tracking
   identity, the spec ID the document identity; the checker verifies the
   mapping.
9. **Roster shrinkage can strand the Stage-8 rule.** _Mitigation:_ the D3
   fallback (base invariant + owner waiver in the header).
10. **Severity misclassification in review** (an opinion dressed as SEV 1).
    _Mitigation:_ D18's three-part proof burden and the authority boundary;
    contested classifications go to the owner as briefs.
11. **The capability/content boundary mapping is untested on HAVDM.**
    _Mitigation:_ the classification is declared per-spec and owner-visible at
    approval; a wrong boundary surfaces as an argument at the gate, cheaply.
12. **A control that depends on an unassigned human step fails silently** —
    the sighting ledger went stale because no rule named the owner as its
    reviewer or surfaced the duty where the owner looks. _Mitigation:_ D13/D15
    put duties on the board with briefs; recorded as a practice-wing candidate
    (below) for the owner's approval.
13. **The facilitator and the reviewer are both interested parties in the
    role decisions.** _Mitigation:_ the header declaration, INTEREST tags in
    the review, the owner's live challenge loop, and D18's authority
    boundary cutting both ways.

## 8. Parked / Deferred

- **The canvas fidelity oracle (arbitration point 5).** Parked: it is a
  product/design question (exact real-HA visual parity vs bounded preview
  fidelity vs structural/YAML parity vs layered tolerances) that this session
  could not answer without front-running a design decision — the refuted
  assessment did exactly that. **Revisit trigger:** when the canvas-fidelity
  contract work item (the surviving #142 obligation in `[STATE]`) is
  scheduled, its spec session opens with this decision.
- **Terra/Luna seat assignment** — deferred until a record exists (D4's entry
  route).
- **Classification absorbing the fix-lane trial scope** — deferred to the
  v1.0.0 gate (D6).
- **The behavioural check's required-flip** — evidence-gated, not deferred by
  calendar (D14).

## 9. Follow-Up Actions

**Owner actions (explicit, per the owner's instruction):**

| #   | Action                                                                      | When           |
| --- | --------------------------------------------------------------------------- | -------------- |
| 1   | `gh auth refresh -s project` (browser approval) — unblocks board creation   | Whenever suits |
| 2   | Read this document; confirm the decisions are landed as written             | Now            |
| 3   | Paste `prompts/codex/REVIEW_STRATEGY_MODEL_ROLES.md` into Codex             | After 2        |
| 4   | Arbitrate any SEV 1/2 findings the review returns (briefs will be prepared) | After review   |
| 5   | Merge PR-1 and PR-2 when opened; sequence the operational backlog           | Owner's pace   |

**Agent follow-ups (started only on the owner's say-so):** PR-1 (`CLAUDE.md`
insert, exact text in `drawer_havdm_decisions_bc47e8270caa139d3ee11646`); PR-2
(plan `:254-255`); PR-3 (governance codification, post-review); board creation
and seeding (post auth refresh); branch protection application (D14); the
quarantine implementation PR; shard rebalance (measure per-file durations
first); the D8 checker slice; the settle-plan repair; F8's R7 split plan under
the D4 table (Opus/Fable brief → Sonnet spec → Sol review); `/whereami` and
commission-authoring skills; MemPalace `[DECISION]` drawer + diary filing for
this session (after owner confirmation, action 2).

## 10. Open Sub-Questions

1. Which GPT tiers do Terra and Luna correspond to, and what evidence gates
   their first non-load-bearing seat? (No capability claims exist in this
   record.)
2. The exact quarantine starting population — measured at implementation
   (the record says three consistent failures plus approximately five
   unstable; the split decides the triage-lane load).
3. Per-file shard durations, to choose between more shards, splitting the
   heavy spec, and a duration-informed distribution.
4. The installation home for skills (user-level vs repo-native) — a separate
   owner ruling per the review's N6.
5. `[STATE]` slimming mechanics: which content moves to epics, and when the
   bump happens (not in this session — barred by the session's disciplines).
6. Whether the D7 lifecycle's disposition table lives in the review file or a
   dedicated artifact — settled in PR-3's drafting.

---

## Claim ledger

Per `docs/templates/ADVERSARIAL_REVIEW.md` machinery (D10 applies to this
document's evaluative claims). Load-bearing claims only.

| #   | Claim                                                                                                                                           | Tag       | Evidence                                                                                                                                                                                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | Both promptmi precedent reviews were authored by the spec's author, and neither independently executed the test suite                           | MEASURED  | `/mnt/c/dev/promptmi/docs/reviews/keeper-console-ui-shell-impl-sonnet-review.md:3` ("same agent, different role") and its AC-6 ("PASS. Codex reports 1262/1262 passing"); `/mnt/c/dev/promptmi/docs/reviews/scenario-registered-custom-actions-impl-sonnet-review.md:8,18` — read from disk this session |
| L2  | Two audited-false claims are live on `main` at plan `:254-255`                                                                                  | MEASURED  | fresh read this session of `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:250-258`                                                                                                                                                                                                                         |
| L3  | `main` has no live branch protection                                                                                                            | MEASURED  | `gh api …/branches/main/protection` → HTTP 404, re-run this session                                                                                                                                                                                                                                      |
| L4  | The kanban is gitignored, cardless in its only commit, absent from HEAD                                                                         | MEASURED  | `git ls-files` (no match), `git log --all -- "*.kanban"` (one commit, `40be934`), `git show 40be934:havdm.kanban` (0 cards), `.gitignore` entry — all this session                                                                                                                                       |
| L5  | Regression shards ran 12.1/9.3/26.1/7.5 minutes on the last real nightly                                                                        | MEASURED  | `gh run view 32054745924` job timings, this session                                                                                                                                                                                                                                                      |
| L6  | `ADVERSARIAL_REVIEW.md` is 146 lines with zero headless/xvfb mentions                                                                           | MEASURED  | `wc -l` = 146; `grep -ci` = 0, this session                                                                                                                                                                                                                                                              |
| L7  | PR #144's repair rounds introduced defects twice (round-2 repair → round-3 M1; round-3 repair → the round-4-caught defect)                      | INFERRED  | `docs/reviews/pr144-independent-performance-governance-review.md` §3.1 rows A5/A6, sustained by the cross-check's A-row audit; underlying review files not re-read this session                                                                                                                          |
| L8  | PR #137 rounds 2–6 found no product-code defect; PR #142 round 6 produced a false blocking finding                                              | INFERRED  | `docs/governance/OPERATING_AGREEMENT.md:229-234`; `[STATE]` drawer (round-7 adjudication record)                                                                                                                                                                                                         |
| L9  | The spacing-flake sighting count is at least six; the gate is green roughly one run in four                                                     | INFERRED  | `[STATE]` drawer and `docs/reviews/pr144-independent-performance-governance-review.md:552-554`; not independently recounted this session                                                                                                                                                                 |
| L10 | The full suite runs in ~26 minutes on 4 free shards                                                                                             | INFERRED  | `[STATE]` drawer (#143 record), corroborated by L5's measured 26.1-minute long shard                                                                                                                                                                                                                     |
| L11 | Sonnet has no controlled recent HAVDM evidence in the reviewer seat; Sol's HAVDM delivery ownership is unmeasured                               | INFERRED  | review §12.1 C4 and cross-check N3/N4 (both parties' concessions), carried, not re-derived                                                                                                                                                                                                               |
| L12 | The seat table's tier assignments fit the models' strengths                                                                                     | JUDGEMENT | measured records exist for four models (§4.1, D4); Terra/Luna have none; the fit is the owner's accepted judgment, instrumented by D5                                                                                                                                                                    |
| L13 | The scoped repair re-review rule would have fired exactly at PR #144's two defect-introducing repairs and not at PR #137's five evidence rounds | INFERRED  | checked against L7/L8's round records as documented; not replayed                                                                                                                                                                                                                                        |

**Weakest claims, handed to the reviewer:** L9's counts rest on drawers this
session did not re-enumerate (and the drawers themselves were noted
inconsistent on a related fire-count — review §12.1 C9); L12 is a judgment
with two evidence-free seats; L13 is a paper check against documented rounds,
not a replay; L10's total is a carried figure with only its long pole
re-measured.

## MemPalace drawer candidates

Filed only after the owner's confirmation (Follow-Up action 2); the session
holds MemPalace write access, so no MP-LEASE routing is needed unless a write
is refused.

1. **[DECISION] (havdm/decisions):** this session's D1–D18, self-contained,
   citing this document as the narrative record and superseding the
   "recorded, not allowlisted" posture (D13) and REV-IMPL's
   no-automatic-follow-up default (D7, pending its PR-3 ratification).
2. **[STATE] implications (not a bump by this session — barred):** the next
   authorised bump notes the board migration (D9), the kanban's measured
   ghost status, and the pending [STATE] slimming (D11).
3. **[PATTERN] candidate for the `practice` wing (owner approval required
   before filing; charter bar applies):** _a control that depends on a human
   review step must name the human, the trigger, and the surface where the
   duty appears — a duty filed where its owner never looks is not assigned._
   Evidence: the sighting ledger went stale because the owner did not know
   they owned its review (this session, owner's own statement; D13's
   mitigation).
4. **[PATTERN] candidate (havdm/governance):** severity-gated review
   disposition (D18) — testable SEV definitions, full-signal reporting,
   authority boundary. File after its first live use on this document's
   review.

---

## Post-review corrections (2026-08-18)

The commissioned review (`docs/reviews/strategy-model-roles-codex-review.md`)
returned **SEV-1-BLOCKED — D7, D9, D14**, plus one SEV 2 (D8/F4) and two SEV 3s
(F5, F6). Per the project's discipline the text above is left exactly as the
reviewer reviewed it; this section supersedes the specific claims named below.
**Every finding was re-verified against its cited sources by the author before
acceptance, and none failed verification.** The owner arbitrated all four
SEV 1/2 findings on 2026-08-18; the rulings below are the owner's. The three
repaired decisions go to a scoped re-check
(`prompts/codex/RECHECK_STRATEGY_SEV1_REPAIRS.md`) before binding; the fifteen
decisions the review did not block are unaffected.

### C1 — D9 repaired; L4 partially RETRACTED (F2, verified)

L4's "cardless / 0 cards" was **false and is retracted**: the author's parser
read a top-level `cards` array while the file stores cards inside each list;
a correct recursive parse of `40be934:havdm.kanban` returns **3 lists and 13
cards** (first card: "Phase 14: Deploy to Production Feature"). The
gitignored / absent-from-HEAD / ghost-pointer facts stand. **Owner ruling:**
the historical kanban object is **non-authoritative and is ignored** — the
board is rebaselined from a roadmap document, properly structured. ⚠ That
roadmap document is a **seeding input, frozen once seeded** — the board
remains the sole live plan ledger per D11; a live roadmap document beside the
board would recreate the two-surfaces defect D9 exists to end.

### C2 — D7 repaired; L13 RETRACTED (F1, verified)

L13 substituted an outcome class ("no product defect found") for D7's
file-touch trigger and is **retracted**: the first three of PR #137's five
repair rounds touched test files, so D7 as drafted would have fired at three
of the five rounds cited as its savings. **Owner ruling — the trigger is
refined:** the automatic scoped follow-up fires on **behaviour-bearing
repairs** — any repair whose diff contains changes beyond comments,
documentation, or evidence artifacts. Comment-only, doc-only, and
evidence-artifact-only repairs merge on the disposition table. The boundary is
mechanically decidable from the diff. The corrected cost claim: scoped
follow-ups proportional to the repair diff plus its declared radius — not
"zero rounds at PR #137"; under the refined trigger, #137's two
test-body-changing repairs would correctly have received scoped follow-ups
(they were unreviewed new test code), and its comment-only repair would not.

### C3 — D14 repaired (F3, verified)

As recorded, D14 could not do its job: without `enforce_admins` the protection
does not bind the shared owner/agent admin account, and the behavioural
workflow's PR triggers (`labeled, synchronize, ready_for_review`, gated on the
`full-suite` label — `.github/workflows/test.yml:29-41,67-76`) mean an
ordinary `tools/feature-finish` PR never emits that check, so making it
required without a workflow change would deadlock merges; and "automatically"
named no actor. **Owner ruling — D14 as repaired:** protection is applied with
**`enforce_admins: true`** and the exact required context **`ci`**; the
behavioural-check flip is an **assigned owner duty, board-visible** — the
agent brings the owner an Owner Decision Brief with the
three-consecutive-green-nightlies evidence, and the owner flips the setting;
the emit-on-every-merge-candidate workflow change is part of the quarantine
implementation PR.

### C4 — D8 reworded (F4, SEV 2, verified)

"Never recycled or renumbered — enforced by GitHub" was an uncited absolute:
GitHub documents permanent Issue deletion and cross-repository transfer.
**Owner ruling — replaced by a project-owned rule:** story Issues are never
deleted and never transferred (a governance prohibition, not a platform
guarantee); the checker treats a missing or relocated Issue number as a drop
finding.

### C5 — SEV 3s (F5, F6): resolved at PR-3 drafting

D5's exact cross-check count and streak threshold, and the D8/D11
approve-IDs → create-Issues → append-mapping order against the immutable-spec
convention, are specified during PR-3 drafting — recorded here so neither is
lost.

### C6 — D7's trigger, second supersession (re-check N1, verified; owner ruling 2026-08-18)

The scoped re-check (`docs/reviews/strategy-model-roles-codex-recheck.md`,
finding N1) found that C2's "behaviour-bearing / mechanically decidable"
boundary **recreated the mechanical evidence-only decider that
`docs/governance/OPERATING_AGREEMENT.md:236-250` records as removed** — after
six review rounds and an audit each found a distinct false-accept route in the
previous attempt — and that C2's documentation exclusion failed to preserve
the governed rule surfaces, whose text §3.4 says is never incidental. Both
legs were re-verified by the author against the binding text and none failed.
**C2's trigger paragraph is superseded. C2's retraction of L13 and its
corrected two-of-five cost narrative stand — relabelled as a hand trace, which
is what they always were.**

**Owner ruling — universal scoped follow-up, depth proportional (Option 1):**
every repair receives the scoped follow-up. No exemptions, no classification
boundary, no decider — the only mechanical fact the rule consumes is that a
repair exists. For a records-only diff the follow-up is naturally minimal:
the reviewer reads the diff, confirms it changes no behaviour and no governed
rule text, confirms the disposition table, and is done in minutes — the
exemption decision and the minimal review are the same act, so nothing is
left to classify and nothing can false-accept. Repairs touching the governed
rule surfaces (`ai_rules.md`, `CLAUDE.md`, `docs/governance/**`) receive the
follow-up with §3.4's never-incidental weight. **This ruling complies with —
and does not supersede — §3.4's no-mechanical-decider ruling; no command is
normative for any part of D7's lifecycle.** The honest cost restatement: at
PR #137 all five repair rounds would have received follow-ups, three of them
trivial. The design rationale is recorded for the next reader: two successive
attempts to draw a cheaper boundary each became the following review's
finding; the boundary is removed rather than redrawn.

**Owner instruction recorded with the ruling:** the owner gate is held by a
non-developer. The process design must never require the owner to classify a
diff or apply developer instinct; anything routed to the owner arrives in the
D15 Owner Decision Brief form; and **every commission states the owner's
profile so the reviewer writes for the reader who actually rules.** This
lands as a standing line in the commission scaffold via PR-3.

### C7 — accounting correction (re-check N2)

The preamble above says "the three repaired decisions" and "the fifteen
decisions the review did not block are unaffected." Corrected: **three
decisions were SEV-1-blocked (D7, D9, D14); four decisions were corrected
(those three plus D8's SEV 2 rewording); fourteen decisions are textually
unaffected.** D7 has now been corrected twice — C2, then C6.

### Final verdict — BINDING-CLEAR (2026-08-18)

The final scoped re-check
(`docs/reviews/strategy-model-roles-codex-recheck2.md`) returned
**BINDING-CLEAR**: N1 and N2 RESOLVED, no new finding at any severity. Under
D18, **all eighteen decisions are binding as of 2026-08-18**, with D7, D8, D9,
and D14 binding in their corrected forms (C1–C4, C6–C7). The review arc, for
the record: round 1 — four findings (three SEV 1, one SEV 2); round 2 — three
resolved, one regressed; round 3 — clear. Codex's drawer candidates from the
re-checks are dispositioned: its D7-final-trigger candidate is already
covered by the filed decision drawer
(`drawer_havdm_decisions_bd49cedc80cb93cafabc0f86` — one fact, one home); the
BINDING-CLEAR transition is recorded in the session diary.
