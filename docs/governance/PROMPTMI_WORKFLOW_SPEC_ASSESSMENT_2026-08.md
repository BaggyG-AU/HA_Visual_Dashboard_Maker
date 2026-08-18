# Promptmi Multi-Model Workflow Spec — HAVDM Adoption Assessment (2026-08-18)

**Author:** Claude Fable 5 (HAVDM), 2026-08-18, at the owner's request.

**Reviewer:** none yet — per `docs/governance/OPERATING_AGREEMENT.md` §3 this is
a recommendation record that should receive an independent (Codex) review
before anything in it is ratified.

**Owner gate:** the owner rules per item; once ruled, the ruling — not this
document — is the authority. This document decides nothing.

**Artifact assessed:** the portable workflow specification authored by Fable in
promptmi ("Multi-Model Development Workflow — Portable Specification", supplied
by the owner 2026-08-18), assessed against HAVDM's governance record — in
particular the PR #144 arc, its independent review
(`docs/reviews/pr144-independent-performance-governance-review.md` incl. §12),
and the Codex cross-check.

---

## 1. Headline assessment

**HAVDM already runs most of this workflow, because both projects share one
lineage — the honest question is not "adopt or reject" but "what does round 2
change".** HAVDM ratified a first tranche of promptmi governance on 2026-08-06
(`docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md`, Tier 1, merged as
PRs #130/#131): the independent-review invariant, both templates, the
operating agreement, artifact headers. Several other elements were then
**deliberately declined with recorded reasons** — and one of those declines
(per-slice implementation review) was later overturned by evidence (REV-IMPL,
after PR #137). This spec is therefore an adoption dialogue already in
progress, and PR #144 is the new evidence that changes some answers.

**Seven specific mechanics are worth adopting now; five of them map one-to-one
onto failures PR #144 measured** (§4). The full five-document upstream chain
per slice stays declined for fixes — HAVDM's scoped spec-before-code rule plus
the classification dial below achieves the same protection at lower cost.

**The most consequential thing the full spec corrects is the role table
itself.** The three-row summary the owner circulated earlier ("Claude briefs /
Sonnet spec + implementation review / Codex implements") is a _compression_
that drops the spec's own reviewer rule: _"Independent reviewer: whichever
model did NOT author the artifact — cross-vendor preferred"_ (§2, G6). Under
the real rules, with Codex implementing, the cross-vendor reviewer of
high-stakes implementation is a **Claude-tier model** — which dissolves most
of the "who reviews the implementer" objection from the independent review and
its cross-check (finding N3 / arbitration point 4), and reframes the pending
role decision (§5).

---

## 2. Status map — spec element → HAVDM today

| Spec element                                            | HAVDM state                                                                                                          | Disposition                       |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| I1/I3 protected main, owner-only merge                  | Operating Agreement §1; `permissions.ask` backstop — mechanically enforced, stronger than promptmi's convention      | HAVE                              |
| I5 no self-approval, cross-model committed reviews      | §3 invariant + ARB-R8 headers; ratified                                                                              | HAVE                              |
| I4 spec before implementation                           | R7 class + the 2026-08-16 spec-before-code trial (shared machinery / timing / product behaviour)                     | HAVE (scoped, deliberately)       |
| I6 evidence over assertion                              | practice-wing claims rules; `check-pr-evidence.sh`; §12 field — **weak point, see §4.6**                             | PARTIAL                           |
| I7–I10 ask/reuse/scope/stop rules                       | `ai_rules.md` §1, §5, §9a/9b                                                                                         | HAVE                              |
| I11 Workflow State block                                | `ai_rules.md` §12 (8 fields; promptmi's has 7 — see §5, the Verification-field note)                                 | HAVE (divergent, instructively)   |
| Review report structure + round loop                    | `docs/templates/ADVERSARIAL_REVIEW.md` — richer (MEASURED/INFERRED/JUDGEMENT ledger)                                 | HAVE                              |
| Memory store, archetypes, supersede, shared wing, diary | MemPalace — the spec's §9C _describes_ it                                                                            | HAVE (same system)                |
| Hardening loop (failure → rule naming its incident)     | The practice wing — plus a meta-rule promptmi's spec lacks (§9)                                                      | HAVE                              |
| Stage-as-command                                        | Some skills exist (edit-freeze, reading-pass, session-handover)                                                      | PARTIAL — see §4.4, §4.7          |
| Spec template w/ coverage table, manifest, ACs          | `docs/templates/FEATURE_SPEC.md` (97 lines) — has §3 Finding Coverage, §6 Files table, §8 ACs                        | PARTIAL — see §4.2                |
| **Strategy-session document + challenge loop**          | Nothing equivalent — owner rulings happen in chat and are filed to drawers post-hoc                                  | **NEW — adopt, §4.1**             |
| **Deliverable-ID traceability**                         | Absent (plan rev4 invented "control numbers are stable identities" locally, after paying for it)                     | **NEW — adopt, §4.2**             |
| **Artifact classification (capability vs content)**     | Absent as a named rule; spec-before-code's scope line is a partial analogue                                          | **NEW — adopt, §4.3**             |
| **Run gate / output-fidelity gate split (Q3/Q4)**       | Run gate exists (headless e2e boots the real app); fidelity gate is the **unwritten canvas-fidelity contract**       | PARTIAL — see §4.5                |
| Evidence pack incl. "assumptions made"                  | Informal                                                                                                             | NEW — adopt, §4.6                 |
| Archive-don't-patch-forward (§8.7)                      | Absent; PR #144 rounds 2–4 are the counterexample arc                                                                | NEW — adopt, §4.6                 |
| Per-slice brief→spec→prompt chain (full)                | **Declined 2026-08-06** (cost; one owner + one implementer)                                                          | KEEP DECLINED for fixes — §3      |
| In-repo `DECISION_LOG.md`                               | **Declined 2026-08-06** (duplicates MemPalace; §11 one-fact-one-home); §4 rulings index is the compromise            | KEEP DECLINED, with a caveat — §3 |
| Draft-PR-first bootstrap                                | **Declined 2026-08-06** (ceremony without a reader)                                                                  | KEEP DECLINED (owner may differ)  |
| Automated orchestration                                 | **Declined 2026-07-26** (MM-VERDICT), reinforced 2026-08-17 (the owner pastes commissions; agent never spawns Codex) | KEEP DECLINED                     |
| Machine artifact-frontmatter validation                 | **Declined 2026-08-06** (machinery-to-support-machinery)                                                             | KEEP DECLINED                     |

## 3. The declined items, re-examined under PR #144 evidence

- **Full per-slice chain: stays declined for fixes.** The decline's reasoning
  (wall-clock; one owner, one implementer) still holds, and HAVDM's scoped
  spec-before-code rule captured the valuable part: its first live test spent
  zero CI and killed an unsound design on paper. For the remaining _feature_
  slices (order items 8–13, F8/F9 especially) the brief step is worth using —
  those are exactly promptmi-shaped work.
- **DECISION_LOG: stays declined, but the underlying resilience gap is now
  measured.** PR #144 showed drawer-only rules failing to reach agents twice
  (the headless omission reached a commissioned reviewer not at all; the
  spec-before-code ruling's agreed `CLAUDE.md` insert is _still owed_). The
  fix is not a duplicate log — it is discharging the owed insert and adopting
  a norm: **a trial ruling gets a one-paragraph in-repo stub the day it is
  made**, pointing at its drawer. Ratified rulings already get binding in-repo
  text via the Operating Agreement.
- **Draft-PR-first: stays declined on the evidence**, with low confidence
  either way; it is cheap if the owner wants in-flight visibility.
- **Orchestration and validators: stay declined**; nothing in PR #144 argues
  otherwise, and the 2026-08-17 no-spawn ruling reinforces the first.

## 4. Adopt now — ranked, each tied to a measured HAVDM failure

**4.1 The strategy-session document structure and challenge loop (Stage 1) —
and use it first on the role decision itself.** HAVDM's owner decisions happen
in chat and are reconstructed into drawers afterwards; options-considered and
concerns-and-mitigations exist only where an agent thought to file them. The
pending role-split decision currently exists as **twelve arbitration points
scattered across three review documents** — it is precisely a
strategy-session-shaped question. Recommendation: HAVDM's first
`docs/strategy/` document is _"Model roles after PR #144"_, §4 populated from
the three reviews' options, §7 from their declared conflicts. Effort: one
session. This also gives the owner's already-strong challenge style a durable
artifact instead of a chat transcript.

**4.2 Deliverable-ID traceability + spec-template extension.** The clearest
defect class PR #144 measured is the artifact-chain loss: proposal (i) dropped
between plan revisions, Control 11 deleted against explicit instruction,
controls renumbered within an hour. Plan revision 4 already invented the local
fix ("control numbers are stable identities, never recycled"); the spec's
deliverable-ID mechanic is that fix generalised, and its coverage table is the
human-checkable form of the dropped-commitment checker the cross-check said
must be rebuilt from a specified identity model — **this is that
specification**. Extend `docs/templates/FEATURE_SPEC.md` with: stable
deliverable IDs, the classification line (§4.3), and the per-verb
capability-surface check. Effort: docs-only PR, small.

**4.3 Artifact classification as HAVDM's proportionality dial.** The
independent review found governance had no rule adjudicating how much process
a change deserves (§5.6), and the addendum found no rule tying a sub-goal's
cost to its parent objective. The capability/content split is the missing
dial, mapped for HAVDM: **capability = shared machinery** (`src/services/`,
`src/store/`, `BaseCard`, `cardRegistry`, `tests/support/dsl/`, CI/workflow
logic) → full apparatus; **content = individual card renderers, panels,
feature surfaces** → light process. The ban on hybrids ("content work may not
silently grow a capability") is the rule that would have forced the Class D
settle-helper redesign to the owner as its own work item instead of growing
inside a flake fix. Effort: one paragraph in the Operating Agreement +
template line; needs the §3 review since it is a governance change.

**4.4 A commission-authoring skill (the `/cross-ai-prompt` mechanic).** The
measured failure: a hand-written commission quoted fourteen practice rules and
omitted standing rule #1, putting an Electron window on the owner's desktop. A
skill that scaffolds every pasted commission — auto-injecting the
EVERYTHING-HEADLESS text, write restrictions, MP-LEASE, and the
reviewer-facing rule subset — converts the template fix already recommended
into something that cannot be forgotten per-commission. Effort: small; kills
the §5.3 class mechanically.

**4.5 Answer Q4 by finally writing the canvas-fidelity contract.** HAVDM's
run gate exists (headless e2e boots the real Electron app) and snapshots give
an automated output check. What the spec's Q4 exposes is that HAVDM's true
reference-of-record is **the real Home Assistant render**: the product's whole
promise is that the canvas preview matches what HA will show. The
infrastructure exists (`ha-test.home.local` writable, the live-ha project) and
`[STATE]` already carries the canvas fidelity contract as a surviving
unwritten obligation from #142. The spec's strongest general lesson —
_structural green does not mean the output is right; promptmi paid for it
three times, HAVDM's antd-v6 drift (11 latent UI bugs) and the `toBeVisible()`
incident are the same species_ — says this is the gate most worth having.
Effort: its own planned, spec'd work item; not started unbidden.

**4.6 Three small mechanics.** (a) The **evidence pack** with its "assumptions
made during implementation" line — the highest-value input a reviewer gets,
and cheap. (b) **Archive-don't-patch-forward** as an explicit stop-condition
option: PR #144's rounds 2–4 each patched forward and each introduced a
defect; "close unmerged, keep the branch as the record, re-run through the
fixed process" was never on the table. (c) **Verbatim approval phrases** for
chat-only gates (`Spec approved — proceed`); where a PR exists, HAVDM's
merge-as-sign-off is already stronger — keep it.

**4.7 A `/whereami`-style status-reconciliation skill.** The handover error
the agent caught in PR #144, the `[STATE]` drawer still unbumped for the
merge, and the kanban/plan/drawer spread are all status-drift symptoms; one
command that reconciles them onto one screen and flags drift is cheap and
directly matches a measured failure class.

## 5. The roles and models question

**The spec's tiering principle — by cognitive task, not "which model is
best" — matches HAVDM's measured evidence well.** Divergent
diagnosis/instrument design is where the PR #144 record shows Claude strong;
adversarial verification is where Codex was consistently strong; the measured
weakness (self-reported bookkeeping) is exactly what the workflow removes from
every author by construction (I5/I6: no self-grading, evidence packs, no
self-certified output gates).

**What the full spec changes in the pending arbitration:** the earlier
three-row table is a compression. The spec itself assigns the independent
reviewer as _whoever did not author, cross-vendor preferred for high stakes_ —
so with Codex implementing, high-stakes implementation review lands on a
Claude-tier model, and Sonnet's actual distinct role is **spec transcription
from locked briefs plus routine review** — mid-tier structured work, the
lowest-risk seat in the chain. That materially softens cross-check finding N3
(the "who reviews the implementer" objection) — most of the objection was to
the compressed table, not to the workflow.

**Recommended trial design, staged instead of big-bang** (this supersedes the
single-trial design in the independent review §12.2 and answers arbitration
point 4 more cleanly):

1. **Trial Sonnet in its actual promptmi seat first, at low risk:** Sonnet
   writes the next R7-class spec (F8's split plan — already owed) from an
   Opus-authored brief, and **Codex reviews it** — the existing ratified spec
   pipeline, unchanged except for who transcribes. This measures Sonnet where
   the workflow actually puts it, without touching the reviewer seat.
2. **Trial Codex in the implementer seat separately:** after the settle plan
   is repaired and independently approved (cross-check N5's prerequisite),
   Codex implements it; the implementation review is **cross-vendor per the
   spec's own rule** — a Claude model. Predeclared measures, budget, and stop
   conditions, per the cross-check's requirement.
3. Decide the standing role table on those two data points.

**One instructive divergence to keep:** promptmi's Workflow State block has
**no Verification field**; HAVDM added one, and it became the surface where
the false "no CI cycle" claims were born (review finding §5.5). Keep the
field, with the cross-check's repair — exact command plus real result, or
`NOT CHECKED` — and note it is a disclosure mechanism, not verification of its
own truth.

## 6. Draft answers to the adaptation questions (Q1–Q10)

Owner/spec work to finalise; these are starting points, not rulings.

| Q   | HAVDM answer (draft)                                                                                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | **Layer invariant:** renderers present, services decide, state flows immutably through the store; UI components never own business logic (`ai_rules.md` §7/§8); plus card types map to upstream HACS/HA schemas exactly (§10)             |
| Q2  | **Correctness invariant: round-trip fidelity** — import → edit → export/deploy preserves everything not deliberately edited, and exported YAML matches upstream schemas                                                                   |
| Q3  | **Run gate:** at least one e2e journey through the real Electron entry path, headless under Xvfb — already what `tools/test-headless.sh` does                                                                                             |
| Q4  | **Output-fidelity gate:** canvas preview vs the real Home Assistant render on `ha-test` (the canvas fidelity contract, §4.5); interim: visual snapshots + owner UAT                                                                       |
| Q5  | `./tools/checks` (real exit code, 4/4 steps) + `tools/test-headless.sh`; "showing output" = pasted counts and exit codes — already law. ⚠ Fold in the **§4a arbitration** (cross-check N6): shared-DSL full-suite mandate vs nightly-only |
| Q6  | Capability = shared machinery (services, store, BaseCard, cardRegistry, test DSLs, CI logic); content = individual card renderers/features. Hybrids banned                                                                                |
| Q7  | Existing: one defect/feature slice per PR off current main; a slice that cannot be specified in one document is two slices                                                                                                                |
| Q8  | Staged trials per §5; cross-vendor for high-stakes review always                                                                                                                                                                          |
| Q9  | None significant today (possible future lane: HA fixture/config sets)                                                                                                                                                                     |
| Q10 | Bootstrap = `CLAUDE.md` (should shrink toward pointer-style — the 900-line corpus is a measured retrieval hazard, review §5.7); canonical = `ai_rules.md` + Operating Agreement; store = MemPalace                                        |

## 7. Do not adopt

The Godot/render-specific mechanics (as the spec itself says); the full
five-document chain for fix-class work (§3); a second live status ledger
(MemPalace `[STATE]` is the one ledger — the spec's "two status surfaces = one
is lying" argues _for_ consolidating HAVDM's kanban/plan/drawer spread, not
for adding `ROADMAP.md`); automated orchestration; frontmatter validators.

## 8. Sequencing, tied to the open arbitration queue

1. **The strategy-session document on model roles** (§4.1) — it absorbs the
   twelve cross-check arbitration points as its input and produces numbered
   decisions. First use of the imported structure, on the live question.
2. **One docs-only PR bundle** (after its §3 review): template extensions
   (§4.2/§4.3), the commission skill (§4.4), the owed `CLAUDE.md`
   spec-before-code insert, the plan `:254-255` corrections, the
   ADVERSARIAL_REVIEW headless insert. All small, all evidence-backed.
3. **The staged trials** (§5), gated on the plan repair.
4. **Q4 (canvas fidelity contract) and Q5 (§4a arbitration)** as their own
   scheduled items — both already exist as recognised obligations.

## 9. Feedback worth returning to promptmi

HAVDM has hardening the spec does not yet carry: (a) **the meta-rule** — do
not file a rule out of a mechanism that has not survived an independent review
(paid for three times here); (b) **the delegation-environment class** — a
commission that can launch a GUI must carry the environment constraints
verbatim, because a sub-agent inherits none (the headless incident); (c) the
**counting disciplines** (count over the complete artifact population; a
correction pass is itself a population sweep); (d) **MP-LEASE** — the
writer-lease pattern for concurrent author/reviewer memory access.

## Evidence boundary

The spec was assessed against HAVDM's committed record and MemPalace drawers;
promptmi's own outcomes were spot-checked earlier only as far as the
cross-check exercise required (workflow doc + two roadmap rows) — its
comparative defect rate and cost remain unmeasured. Effort estimates are
judgements. Nothing here was implemented; this document is the only file
written for this task, and it is uncommitted pending the owner's routing.
