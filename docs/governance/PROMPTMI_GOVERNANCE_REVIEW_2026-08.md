# Promptmi Governance Review — What HAVDM Should Adopt (2026-08)

**Status:** Recommendation — awaiting owner ratification. Nothing in this
document changes HAVDM's process until the owner rules on §6.
**Author:** Claude Fable 5 (advisory review, requested by the owner 2026-08-06).
**Reviewed inputs:** the full governance surface of `promptmi`
(`/mnt/c/dev/promptmi` — `docs/workflow/AI_AGENT_WORKFLOW.md` v3.6,
`docs/governance/*`, `docs/templates/*`, real briefs/specs/reviews) and of HAVDM
(`ai_rules.md`, `docs/governance/*`, `docs/reviews/*`, MemPalace decision
drawers, `.claude/` configuration).
**Resolves:** open decision **D5** of
`docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md` §8 — "Adopt promptmi's full
hard-rule + DECISION_LOG + independent-review method, or a lighter subset given
HAVDM already has a phase framework?" — which was never marked resolved.

---

## 1. Verdict first

**Adopt a deliberately lighter subset.** Promptmi's single most valuable idea —
**no agent approves an artifact it authored** — should be adopted for
_document-class_ artifacts (specs, governance changes, triage/remediation
plans), where HAVDM has already been burned by self-certified error. Its
heavyweight per-slice pipeline (brief → spec → implementation prompt, each a
separate reviewed artifact) should **not** be adopted: it solves a
coordination problem HAVDM does not have, and its cost lands on wall-clock
time, which the ratified multi-model verdict
(`docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md`) identified as HAVDM's
only real constraint.

Nothing here reopens that verdict. The 2026-07-26 decision rejected an
**automated orchestration loop**; every recommendation below is a **manual,
artifact-level** discipline of exactly the kind HAVDM already ran successfully
by hand in the 2026-08 Fable → Codex adversarial review chain. This review
formalises what worked, and declines the rest.

The timing is unusually good, and that is not a coincidence of this review:
owner ruling **R7** already requires written, owner-signed specs for F5 and F8
before any code, authored by Opus. That creates a live, zero-marginal-cost
pilot for the independent spec review recommended below — the artifact class,
the author, and the gate already exist; only the independent reviewer is
missing.

---

## 2. What Promptmi's process actually is

Condensed from `docs/workflow/AI_AGENT_WORKFLOW.md` (v3.6, canonical) and
`docs/governance/PHASE_WORKFLOW.md` (v1.5):

**Roles are assigned per slice, not fixed.** Each slice records a
`Primary author agent` and a `Reviewer agent`, assigned by the human owner
(Creative Director) in the artifact header. Fallback: Opus writes blueprints,
slice briefs and governance amendments; Sonnet writes feature specs and
reviews; Codex (GPT-5.x) implements, tests, and frequently serves as
cross-vendor adversarial reviewer.

**The Independent Review Invariant** (quoted from `AI_AGENT_WORKFLOW.md`):

> "No agent approves or validates an artifact it authored. Every major
> artifact must be reviewed by a different agent before it advances. The
> Creative Director remains the final approver in all cases."

With conservative edge rules: _"Same model, same session is never independent
review"_; same model in a different session still does not qualify unless
policy explicitly names those sessions as distinct agents; substantial
co-authorship transfers authorship for gate purposes.

**The pipeline per slice:** branch + draft PR first → slice brief → feature
spec (with a Brief-Deliverables-Coverage traceability table and a mandatory
tech-debt-register pass) → owner spec approval (literal phrase
`Spec approved - proceed`) → implementation prompt → implementation + tests →
**independent review committed to the source branch** as
`docs/reviews/<branch-shortname>-<reviewer>-review.md` → close-out commit
(roadmap + decision log + status stamps) → owner merges. Approved artifacts
become immutable; changes are append-only amendments.

**Supporting registers:** an append-only `DECISION_LOG.md` (242 KB — "Prevent
conflicting instructions to AI agents"), a `TECH_DEBT_REGISTER.md` that is
mandatory reading before any spec, and templates for every artifact class
(`FEATURE_SPEC.md`, `DESIGN_BRIEF.md`, `IOR_TEMPLATE.md` — Independent Output
Review — `STRATEGY_SESSION.md`, and others; 14 total).

**Enforcement reality:** the invariant itself is enforced by convention and
prompt, not by machine — no CI check verifies author ≠ reviewer. CI runs lint
and tests only. The process holds because every artifact names its author and
reviewer in its header, making violations visible in review.

---

## 3. What HAVDM already has — the gap map

HAVDM's governance is not behind Promptmi's; large parts are the same lineage,
ported during the 2026-07 refresh. The honest gap list is short.

| Promptmi element                           | HAVDM today                                                                                                                                                                           | Gap?                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Phase framework, blueprints, medium gates  | `PHASE_ORCHESTRATION_FRAMEWORK.md`, `PHASE_WORKFLOW.md` — same lineage                                                                                                                | None                                                                           |
| Immutable rules + Workflow State block     | `ai_rules.md` §12 — same shape                                                                                                                                                        | None                                                                           |
| MemPalace protocol                         | `MEMPALACE_PROTOCOL.md` — ported 2026-07-20                                                                                                                                           | None                                                                           |
| Owner-only merge, branch scripts           | Autonomy agreement + `permissions.ask` merge gate + `tools/feature-start`/`feature-finish`                                                                                            | None (HAVDM's merge gate is _mechanically_ enforced; Promptmi's is convention) |
| Human-only acceptance                      | UAT strategy §2: agent "never marks a test"                                                                                                                                           | None                                                                           |
| Blocking CI                                | `tools/checks` + `ci.yml` (lint/format/typecheck/unit/package)                                                                                                                        | None (stronger than Promptmi's)                                                |
| **Independent Review Invariant**           | Ad hoc only: the 2026-08 Fable review + Codex cross-check was a one-off commission, not a standing rule                                                                               | **Yes — the core gap**                                                         |
| **Spec template with traceability**        | R7 mandates specs for F5/F8 but no template exists; no `docs/templates/`                                                                                                              | **Yes**                                                                        |
| **Author/Reviewer header on artifacts**    | Not used                                                                                                                                                                              | **Yes** (trivial)                                                              |
| **In-repo statement of the operating law** | The autonomy agreement and owner rulings (R1–R7 etc.) exist **only** in MemPalace drawers and gitignored `prompts/START_*.md`; no committed document states plan-sign-off/never-merge | **Yes — a resilience gap**                                                     |
| Append-only `DECISION_LOG.md`              | MemPalace `decisions` room is authoritative; `ai_rules.md` §11 forbids duplication                                                                                                    | Partial — see R3; full duplication would violate §11                           |
| `TECH_DEBT_REGISTER.md` + pre-spec pass    | Known debt lives in review documents (`PropertiesPanel.tsx` 7,128 lines, `App.tsx` 3,528, 145 lint warnings, no coverage gate, 4/80 real-gesture e2e specs) but no register           | Yes (moderate value)                                                           |
| Per-slice brief → spec → prompt chain      | Slice prompts inside blueprints; handover prompts                                                                                                                                     | Deliberate non-gap — do not adopt (§5)                                         |

---

## 4. The evidence that author ≠ checker pays for itself

This is not imported theory; both repositories have documented incidents.

**In HAVDM:**

- **2026-08-04, the false "silent data loss" finding** (Phase 7
  amendment-04 §0): an agent derived a High-severity finding from an
  _assumption_ about Home Assistant's behaviour and wrote it into a commit
  message, a PR body, a spec comment, a tester-facing document and a memory
  drawer — and was wrong. Every artifact in that chain was authored and
  believed by the same agent.
- **The remediation triage aimed at refuted causes** (Fable review §6 P1): the
  agent-authored triage put two items on root causes the adversarial review
  refuted. Only a different model reading the same evidence caught it.
- **The cross-check found what the first reviewer missed**: Codex returned 7
  findings absent from the 973-line Fable review, ruled 10 of 14 directions
  NEEDS-CHANGE, and refuted 0 — precisely the profile of a reviewer adding
  signal rather than deference.
- **EXPORT-04's mislocated defect** (2026-08-06): the handover, the `[STATE]`
  drawer and the review chain all placed the surfacing defect in
  `CardPalette.tsx`; it was in `App.tsx`. A green test named for the defect
  (`toBeVisible()` on a clipped element) had passed through its entire life.
  Single-author chains propagate confident error.

**In Promptmi:**

- The invariant catches real defects routinely: a Codex review of an
  Opus/Sonnet governance change found wording that "silently creates a
  stricter approval rule than its cited authority" (CHANGES-REQUIRED →
  fixed → verified RESOLVED).
- The near-miss that motivated a rule: an implementation prompt authored from
  a subagent _summary_ of a spec dropped five files and an entire test suite —
  caught "only because the Creative Director asked for the prompt to be
  checked for completeness."
- The recurring failure class (#328 → #397 → #408 → #412): "structural checks
  pass, actual render is wrong" — including a build self-certified as PASS on
  runtime assertions while the committed hero shot showed editor chrome and a
  black viewport. Promptmi's answer was independent _verification by an agent
  that did not build the artifact_, plus a fail-closed rule. HAVDM's
  `toBeVisible()` incident is the same species: a DOM predicate certifying
  what a user cannot see.

The common mechanism: an author's errors are correlated with the author's
checks. A different agent — ideally a different vendor — brings decorrelated
blind spots. Promptmi's pairing guidance: "Cross-vendor review gives the
strongest independence signal for high-stakes governance, architecture, and
security-sensitive changes."

---

## 5. Recommendations

### Tier 1 — adopt now (pilot on F5/F8)

**R1. Codify the Independent Artifact Review invariant, scaled to HAVDM.**
Proposed rule text:

> No agent approves an artifact it authored. Every artifact in the classes
> below is reviewed by a **different model** before it reaches the owner for
> sign-off; the review is a committed document, not a chat reply. The owner
> remains the final approver in all cases. Same model in a different session
> is not independent.
>
> Artifact classes covered: (a) written specs and remediation plans of the R7
> class; (b) substantive governance changes; (c) triage documents that rank or
> re-scope defects. **Routine slice implementation is explicitly not covered**
> — the owner's PR review, the gate suite, and UAT already check it, and
> per-slice cross-review is where Promptmi's cost concentrates.

⚠⚠ **SUPERSEDED 2026-08-08 by ruling REV-IMPL.** Slice implementations are now
class (d) of the §3 invariant, at **one mandatory review round**
(`docs/governance/OPERATING_AGREEMENT.md` §3.4). The quoted paragraph is
retained as the record of what was ratified on 2026-08-06; it is no longer the
rule. See the "Do not adopt" table below for why the original reasoning was
overturned.

Concretely for the next work: Opus authors the F5 insertion-contract spec and
the F8 three-way split plan (per R7); a different model reviews each against
the ruling, the vision drawer, and the codebase; the review lands on the spec's
branch as `docs/reviews/<branch>-<reviewer>-review.md`; the owner signs off
reading both. Recommended reviewer: **Codex/GPT** — cross-vendor is Promptmi's
strongest-independence pairing, and the owner sided with Codex on the F5/F8
respec question, so it already holds the position that the specs must satisfy.

**R2. Create `docs/templates/FEATURE_SPEC.md` (HAVDM-adapted, trimmed).**
Sections: status header (`Draft | Reviewed | Approved — <date> | Implemented |
Closed — via PR #N`); assignment block (Author / Reviewer / Owner gate);
Objective; Background; **Finding Coverage table** (each UAT finding, ruling, or
deliverable the spec claims to address → the spec section that addresses it —
Promptmi's Brief-Deliverables-Coverage, renamed for HAVDM's remediation-driven
work); In Scope / Out of Scope with an explicit MUST-NOT list; Files to Create
/ Modify; Acceptance Criteria; Test plan (including the red-before-green
legs); Open Questions (flagged, never guessed); Revision History. Approved
specs are immutable; changes are appended as revisions.

**R3. Commit the operating law to the repository.** A short
`docs/governance/OPERATING_AGREEMENT.md` stating normatively: the two hard
gates (plan sign-off before implementation; the agent never merges), the
one-commit non-stacked PR discipline, never-blind-rebaseline, and UAT role
separation — plus a **rulings index**: one line per standing owner ruling
(ID, date, one-sentence statement, authoritative MemPalace drawer ID).

This is the counterpart of Promptmi's Rules 25/26, which exist in-repo and
whose anti-pattern note records a real 2026-03-24 merge bypass. HAVDM's
equivalents currently bind every agent yet are written nowhere an agent
without MemPalace access (Codex; any fresh clone) can read them —
`ai_rules.md` §11 itself anticipates such agents. This does **not** violate
§11's no-duplication rule when kept pointer-style: the drawer remains the
authoritative narrative record (context, supersessions, rationale); the
committed document states only the operative rule and points at the drawer.
Promptmi runs exactly this division — frozen rules in-repo, living rationale
in MemPalace — and its one documented gap of the opposite kind (#408 archived
in MemPalace but never logged in-repo) is the failure mode R3 prevents.

**R4. Institutionalise the adversarial review as a standing, named gate.**
The 2026-08 Fable → Codex chain invented, ad hoc, most of what Promptmi's IOR
template codifies. Capture it as `docs/templates/ADVERSARIAL_REVIEW.md`:
claim ledger tagged **MEASURED / INFERRED / JUDGEMENT**; the author hands the
cross-checker its weakest claims explicitly; per-claim verdicts
`CONFIRMED / PARTIALLY CONFIRMED / REFUTED / UNVERIFIABLE`; disagreements go
to the owner as arbitration points, never merged into compromise; the
anti-sycophancy instruction verbatim ("Two models that agree because the
second deferred to the first have cross-checked nothing"); reviewer
write-restrictions (no `[STATE]` update, no UAT marks, no `src/` change, no
merge). Cadence: **before each UAT round and each release gate** — not per
slice.

**R5. Author/Reviewer header on governed artifacts.** Three lines at the top
of every spec, review, and governance change: `Author:`, `Reviewer:`,
`Owner gate:`. This is Promptmi's cheapest and most load-bearing mechanism —
it is what makes the invariant auditable without any tooling.

### Tier 2 — adopt at the next natural boundary (owner's discretion)

**R6. `docs/governance/TECH_DEBT_REGISTER.md`.** Seed from the adversarial
review's §4 (the two monoliths, 145 lint warnings, missing coverage tooling,
the 4/80 real-gesture e2e ratio, the open `zones`-injection family). Spec
template gains one mandatory line: "Tech-debt register read; items resolved /
deferred / out of scope." Prevents known debt being rediscovered by every
future review at full price.

### Do not adopt — and why

| Promptmi element                                     | Why not                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-slice brief → spec → implementation-prompt chain | Three reviewed artifacts before code exists per slice. Promptmi needs this to coordinate two humans + four AI agents across a content pipeline; HAVDM is one owner + one implementing agent. Cost is wall-clock — the one resource the multi-model verdict protects. R7-class specs for high-risk work only.                                                                                                                                                                                                                                                                                                                                                                                   |
| Per-slice independent implementation review          | ⚠⚠ **OVERTURNED 2026-08-08 — ruling REV-IMPL. The empirical premise below is now FALSE.** It read: "HAVDM's documented single-author failures were all document-class (triage, findings, specs), which R1 covers." **PR #137 produced an implementation-class failure that this exact review caught and the gate did not: M1, a harness defect that let the palette gesture drag the wrong card while count-only assertions stayed green.** The compromise adopted keeps the cost concern that motivated this row — **one mandatory round, not review-until-approve** (`OPERATING_AGREEMENT.md` §3.4), because on #137 round 1 held nearly all the value and rounds 2–6 were evidence cleanup. |
| Automated author/reviewer orchestration              | Rejected 2026-07-26; unchanged. All of R1–R5 is manual handoff via `/model` or a separate session, exactly the Tier-2b pattern already ratified.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Full in-repo `DECISION_LOG.md`                       | Would duplicate the MemPalace `decisions` room, violating `ai_rules.md` §11. The R3 rulings index (pointer-style) captures the resilience benefit without the duplication.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Draft-PR-first bootstrap                             | Helps multi-human teams watch work in flight. HAVDM's non-stacked one-commit-PR discipline is working (77+ merged PRs); a long-lived draft PR adds ceremony without a reader.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Machine validation of artifact frontmatter           | Promptmi's 33 KB validator guards a scenario-content schema with no HAVDM equivalent. Building one now would be machinery-to-support-machinery — a named rollback trigger in the multi-model plan.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

---

## 6. When to make the changes

**The single best adoption point is now — before the F5/F8 specs are
written.** R7 already mandates exactly the artifact R1 and R2 govern; adopting
the template and the independent spec review costs near-zero there because the
spec-writing step, its author, and its owner gate already exist. Piloting on
F5/F8 also means the invariant is trialled on two real, high-stakes artifacts
before being made permanent.

Sequenced:

1. **This document** lands via its own docs-only PR (this branch). The owner
   rules on §6 of this document — adopt / trim / decline per item.
2. **If ratified:** one further docs-only PR adds `OPERATING_AGREEMENT.md`
   (R3), `docs/templates/FEATURE_SPEC.md` (R2),
   `docs/templates/ADVERSARIAL_REVIEW.md` (R4), and the invariant text (R1)
   to the governance set. Half a session of work; no code touched.
3. **F5, then F8** run the pilot: Opus authors the spec from the template; the
   assigned reviewer reviews on-branch; owner signs off reading both. The
   Workflow State block's `Performed by` field already names the acting agent
   per step, so the pilot needs no new reporting.
4. **At the v1.0.0 gate / Phase 7 close-out:** the owner judges the pilot
   (two data points) and either ratifies the invariant permanently into the
   phase framework for Phase 8 onward, or drops it. R4's first scheduled
   outing is the pre-release adversarial pass already implied by the current
   remediation arc; R6 can seed whenever convenient before Phase 8.

**What to avoid:** retrofitting reviews onto in-flight or merged F-slices
(F1–F4, F7 are done or closing; re-reviewing them re-litigates settled work),
and adopting mid-slice — every process change lands at an artifact boundary.

## 7. Rollback triggers

In the spirit of the multi-model plan §5 — named in advance:

- An independent spec review returns **zero findings three consecutive
  times** → the pairing has gone deferential; switch reviewer vendor, or
  narrow R1 to governance changes only.
- Spec review round-trips **add more than one working session of wall-clock
  per spec** without producing findings the owner acts on → drop to
  owner-only sign-off and record the trial in MemPalace.
- Anyone proposes **tooling to enforce** author ≠ reviewer (CI checks, hooks,
  scripts) → stop; the invariant is cheap only while it is a header
  convention. Promptmi runs it unenforced by machine, deliberately.
- The rulings index (R3) starts accumulating **content** rather than pointers
  → it is becoming a duplicate decision log; cut it back to one line per
  ruling.

## 8. Open questions for the owner

1. **Reviewer assignment for the F5/F8 spec pilot** — this review recommends
   Codex/GPT (cross-vendor). Accept, or assign Fable?
2. **R3's in-repo codification** — comfortable with the pointer-style reading
   of `ai_rules.md` §11, or should the operating agreement stay
   MemPalace-only?
3. **R4 cadence** — per UAT round (recommended), or per release only?

---

_This document follows the convention of_
`docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md`: _it is a recommendation
record. Once the owner rules, the ruling — not this document — is the
authority, filed as a `[DECISION]` drawer and (if R3 is adopted) indexed in the
operating agreement._
