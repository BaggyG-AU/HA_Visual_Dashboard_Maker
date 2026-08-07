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
  a write-enabled agent to file (`ai_rules.md` §11).
- **The MemPalace writer lease — reviewer surfaces, author files.** Only one
  process holds the per-palace writer lease, so under the author-reviews-by-a
  -different-model pairing the reviewer's write is routinely refused. This is
  expected, not a fault: **the reviewer records a `MemPalace drawer
candidates` section at the end of its review file, and the write-enabled
  author files them with `added_by="<reviewer>"`.** ⚠⚠ **Never kill a process
  to free the lease and never set `MEMPALACE_MCP_ALLOW_PEER_WRITER`** — a
  read-only-latched server never re-evaluates and must itself be restarted
  (VS Code: Reload Window); the latch is deliberate, because a second
  long-lived client would serve a stale index. Evidence: refused in **all six
  rounds** of PR #137, predicted verbatim by that PR's round-1 record, and the
  split worked every time without incident.

## 3. Independent Artifact Review invariant

Ratified 2026-08-06 (`drawer_havdm_decisions_0475d2d73336a4a2481bdec6`),
piloting on F5/F8; permanence decided at the v1.0.0 gate / Phase 7 close-out.

> No agent approves an artifact it authored. Every artifact in the classes
> below is reviewed by a **different model** before it reaches the owner for
> sign-off; the review is a committed document on the artifact's branch, not
> a chat reply. The owner remains the final approver in all cases. Same
> model in a different session is **not** independent.

**Governed artifact classes:** (a) written specs and remediation plans of the
R7 class; (b) substantive governance changes — including changes to this
document; (c) triage documents that rank or re-scope defects; (d) **slice
implementations, at one mandatory round — see §3.4.** Reviews of these
artifacts are themselves governed artifacts for header purposes (§3.1).
**Explicitly not covered:** nothing in the four classes above is exempt.
Work outside them — chores, dependency bumps, docs typo passes — remains
covered by the owner's PR review, the gate suite, UAT, and the periodic
adversarial passes of §3.2.

**Mechanics:** the review lands on the artifact's branch as
`docs/reviews/<branch-shortname>-<reviewer>-review.md`; the owner signs off
reading artifact and review together. Current standing assignment: **Opus
authors the F5/F8 specs, Codex reviews** (cross-vendor pairing, owner-ruled).

### 3.1 Artifact headers

Every governed artifact — an R7-class spec or remediation plan, a triage
document, a governance change, or a review of one of these — opens with three
separate lines: `Author:`, `Reviewer:`, `Owner gate:`. This header is the
invariant's entire enforcement mechanism — it makes author ≠ reviewer
auditable at a glance. The invariant is deliberately **not** machine-enforced
(§3.3).

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
- Any proposal to **machine-enforce** author ≠ reviewer (CI, hooks,
  scripts) → stop; the invariant is cheap only while it is a header
  convention.
- The rulings index (§4) accumulating content rather than pointers → cut it
  back to one line per ruling.

### 3.4 Implementation slices — one mandatory round

Owner-ruled 2026-08-08, on the measured outcome of PR #137.

> A slice implementation gets **one mandatory independent review round**
> before the owner merges. Rounds after the first are **narrow**: they check
> only findings left unresolved by the previous round, plus a regression
> check that the repair changed nothing else. **The owner may accept
> evidence-only residues with the merge** rather than requiring another
> round.

**Why one round and not "until APPROVE".** PR #137 ran six rounds. Round 1
found seven findings including **M1 — a harness defect that let the palette
gesture drag the wrong card while count-only assertions stayed green.** The
gate suite did not catch it; the author's own testing did not; the reviewer
did, by re-running at a deeper repeat. That is precisely the class this
invariant's previous exclusion assumed the gate and the owner's PR review
would catch. **Rounds 2–6 were all evidence cleanup** on artifacts that did
not exist until the round-1 fix — `git diff <round-1 fix>..<head> -- src/`
is empty at every round. The value is concentrated in round 1; the cost was
spread over five more.

⚠ **The first round is a full review; it is not a formality.** Narrowing
applies only to rounds 2+.

⚠⚠ **A fix round is unreviewed new work** (§2's packaging rule already
assumes this): the narrow round N+1 exists because a repair can introduce
its own defect, and on #137 one did — the round-1 fix created the finding
that ran for the next five rounds.

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

**Not binding — guidance only:** the broader MEDIUM domain sweeps are re-run
**by exception**, justified in writing. On #137 they produced identical
numbers in two consecutive rounds and found nothing in either, at ~25 minutes
each. ⚠ The tempting exception proves the rule: the sweep's _membership_ was
changed, it _was_ re-run, and the re-run still could not test it — the defect
was in which specs the list contained, and only **reading** the list found it.

⚠⚠⚠ **A re-run not performed leaves the result UNVERIFIED. Never write
"accepted", "confirmed" or "held" for a check nobody ran** — the word choice
is itself a claim about evidence, and "accepting the author's counts"
converts an explicit evidence boundary into apparent independent
verification.

## 4. Rulings index

One row per standing owner ruling: ID, date, status, one sentence, authority.
The authority (MemPalace drawer or committed document) is the record; this
index only locates it. Full narrative never lives here. _Maintenance
convention (not itself ratified law): rows are appended as rulings land;
rulings that predate this index are added when next cited._

| ID         | Date       | Status           | Ruling                                                                                                                                                                                                                                             | Authority                                                                       |
| ---------- | ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| VISION     | 2026-07-21 | Standing         | Product VISION — nine ratified answers (superset design tool; export translates; never-connected = permissive; …)                                                                                                                                  | `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`                               |
| AUTONOMY   | 2026-07-25 | Standing         | Plan sign-off before implementation; the agent never merges; autonomous execution after sign-off; post-merge routine                                                                                                                               | `drawer_havdm_decisions_9e545b5b958d1c1ef33c701c`                               |
| MM-VERDICT | 2026-07-26 | Standing         | No automated multi-model orchestration loop; narrow manual uses only (flake-triage subagent, manual Fable handoffs)                                                                                                                                | `docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md` §6                       |
| ARB-R1     | 2026-08-04 | Standing         | HA-05: the persisted capability profile wins; correct the UAT card (the optional freshness note was delivered by PR #129)                                                                                                                          | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                               |
| ARB-R2     | 2026-08-04 | Standing         | HA-06: HA themes are kept after disconnect; correct the card; the Reload-disabled test leg stands                                                                                                                                                  | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                               |
| ARB-R3     | 2026-08-04 | Standing         | F9 export target is sections-first; `custom:grid-layout` only when sections cannot hold the geometry AND layout-card is installed; always warn when lossy                                                                                          | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                               |
| ARB-R4     | 2026-08-04 | Standing         | PROPS-03: both the card correction and the UX fix; no severity re-mark                                                                                                                                                                             | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                               |
| ARB-R5     | 2026-08-04 | Delivered (#126) | F7 staged: path-in-label now; in-app surface post-1.0 with FR-01                                                                                                                                                                                   | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                               |
| ARB-R6     | 2026-08-04 | Standing         | F12: fs-IPC path scoping (with a threat model) and Windows code signing are formal 1.0 ship-gates, not UAT cards                                                                                                                                   | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                               |
| ARB-R7     | 2026-08-04 | Standing         | F5 and F8 each require a written spec signed off by the owner before any code                                                                                                                                                                      | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`                               |
| REBASE-128 | 2026-08-04 | Completed (#128) | One-time authorization: rebaseline the stale visual snapshot(s) and run the full e2e + integration pass before F4 — not a standing permission                                                                                                      | `drawer_havdm_decisions_c9a9720edc90cf10ce5b67d6`                               |
| GOV-RAT    | 2026-08-06 | Standing         | Governance-review Tier 1 adopted: the §3 invariant, both templates, Codex as F5/F8 spec reviewer, adversarial review before every UAT round **and** every release gate                                                                             | `drawer_havdm_decisions_0475d2d73336a4a2481bdec6`                               |
| ARB-R8     | 2026-08-07 | Standing         | §3.1's three header lines bind the CHANGE ARTIFACT (spec, remediation plan, triage document, or a review of one), not the long-lived instruction file a governance change edits; `ai_rules.md` and `CLAUDE.md` are exempt and no retrofit is owed  | `drawer_havdm_decisions_ac026150b5fe8c5e6f70c519`                               |
| REV-IMPL   | 2026-08-08 | Standing         | Slice implementations join the §3 governed classes as class (d) at **one mandatory review round**; rounds 2+ are narrow, and the owner may accept evidence-only residues with the merge (§3.4)                                                     | this document §3.4; case study `drawer_havdm_patterns_9b2499f0b71c059ee556d65a` |
| REV-RERUN  | 2026-08-08 | Standing         | A class-(d) reviewer MUST re-run the load-bearing spec, a deeper repeat than the author published, and `./tools/checks`; MEDIUM sweeps stay by-exception guidance; an unperformed re-run leaves a result UNVERIFIED (§3.5)                         | this document §3.5; case study `drawer_havdm_patterns_9b2499f0b71c059ee556d65a` |
| MP-LEASE   | 2026-08-08 | Standing         | Under the writer-lease collision the reviewer surfaces `MemPalace drawer candidates` in its review file and the write-enabled author files them with `added_by=<reviewer>`; never kill a process, never set `MEMPALACE_MCP_ALLOW_PEER_WRITER` (§2) | this document §2; `drawer_havdm_review_65aecb8d3cb0de6511b03648`                |
