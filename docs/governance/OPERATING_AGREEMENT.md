# HAVDM Operating Agreement

**Status:** Normative — binds every agent working on HAVDM, in any tool, with
or without MemPalace access.
**Author:** Claude Fable 5 · **Reviewer:** Codex (on-branch, per §3) ·
**Owner gate:** merge of the PR that lands or amends this document.
**Authority:** owner ratification of 2026-08-06
(`drawer_havdm_decisions_0475d2d73336a4a2481bdec6`, ratifying Tier 1 of
`docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md`, merged as PR #130).

This document is **pointer-style** by design, per `ai_rules.md` §11: it states
the operative rules and points at the authoritative MemPalace drawer for each
ruling's full narrative (context, alternatives, supersessions). It never
carries that narrative itself. If a line here starts growing content, the
content moves to a drawer and the line shrinks back to a pointer (§3.3).

**Precedence:** implementation-safety rules in `ai_rules.md` cannot be
overridden by anything here. The phase framework
(`docs/governance/PHASE_ORCHESTRATION_FRAMEWORK.md`, `PHASE_WORKFLOW.md`)
governs scope, sequencing and packaging. This document governs the
session-level workflow between those two layers.

---

## 1. The two hard gates

1. **Plan sign-off before implementation.** Investigate read-only, present a
   short plan, and obtain the owner's explicit sign-off **before writing
   code**. Autonomous execution (implement → test to green → commit → push →
   open PR, without per-step permission) begins **after** sign-off, never
   before. Work of the R7 class additionally requires a **written spec**
   approved by the owner before any code (§3).
2. **The agent never merges.** `gh pr merge` requires the owner's explicit
   authorization, every time — mechanically enforced as a `permissions.ask`
   rule in `.claude/settings.local.json`, which must never be removed or
   bypassed. Never commit or push to `main`. Only the owner merges.

Authority: autonomy agreement, 2026-07-25 —
`drawer_havdm_decisions_9e545b5b958d1c1ef33c701c`.

## 2. Standing disciplines

- **Branch only via the scripts** — `tools/feature-start` /
  `tools/feature-finish`; never ad-hoc git branching. Non-stacked,
  one-commit PRs off current `main`.
- **Post-merge routine** (agent-executed, autonomous): verify
  `git merge-base --is-ancestor <sha> origin/main`, ff-only sync `main`,
  prune the branch, re-run `./tools/checks`, bump the `[STATE]` drawer.
- **Red-before-green, same checkout:** a new test must be seen to fail on
  base before it counts. A test not seen to fail on base is decoration.
- **Never blind-rebaseline.** Snapshot and suite diffs are triaged against
  the documented baseline; a rebaseline requires an explained cause and its
  own PR. A rebaseline is the one operation that can permanently erase a
  defect rather than record it.
- **Gates are reported with the real exit code and the step count** —
  `./tools/checks` REAL_EXIT plus 4/4 steps — never a piped or laundered
  exit, never a claim without a run.
- **UAT role separation:** the owner runs UAT and marks every test; the
  agent never marks a test (`docs/testing/UAT_STRATEGY.md` §2).
- **The live Home Assistant instance (`ha.home.local`) is read-only** — VPP
  enrolment (Amber SmartShift) forbids writes.
- **Memory and reporting:** `ai_rules.md` §11 memory cadence and §12
  Workflow State block apply to every significant response. Agents without
  MemPalace write access surface drawer-candidate notes (PR body or
  `~/.mempalace/pending/`) for a write-enabled session to file.

## 3. Independent Artifact Review invariant

Ratified 2026-08-06 (`drawer_havdm_decisions_0475d2d73336a4a2481bdec6`),
piloting on F5/F8; permanence decided at the v1.0.0 gate / Phase 7 close-out.

> No agent approves an artifact it authored. Every artifact in the classes
> below is reviewed by a **different model** before it reaches the owner for
> sign-off; the review is a committed document on the artifact's branch, not
> a chat reply. The owner remains the final approver in all cases. Same
> model in a different session is **not** independent.

**Covered artifact classes:** (a) written specs and remediation plans of the
R7 class; (b) substantive governance changes — including changes to this
document; (c) triage documents that rank or re-scope defects.
**Explicitly not covered:** routine slice implementation — the owner's PR
review, the gate suite, and UAT check it; periodic adversarial passes (§3.2)
audit it in bulk.

**Mechanics:** the review lands on the artifact's branch as
`docs/reviews/<branch-shortname>-<reviewer>-review.md`; the owner signs off
reading artifact and review together. Current standing assignment: **Opus
authors the F5/F8 specs, Codex reviews** (cross-vendor pairing, owner-ruled).

### 3.1 Artifact headers

Every governed artifact (spec, review, governance change) opens with three
lines: `Author:`, `Reviewer:`, `Owner gate:`. This header is the invariant's
entire enforcement mechanism — it makes author ≠ reviewer auditable at a
glance. The invariant is deliberately **not** machine-enforced (§3.3).

### 3.2 Templates and cadence

- Specs use `docs/templates/FEATURE_SPEC.md`.
- Adversarial reviews use `docs/templates/ADVERSARIAL_REVIEW.md` and run
  **before every UAT round and every release gate** (owner-ruled cadence),
  landing as `docs/reviews/HAVDM_ADVERSARIAL_REVIEW_<YYYY-MM>_<MODEL>.md`.

### 3.3 Rollback triggers (named in advance)

- Three consecutive zero-finding independent reviews → the pairing has gone
  deferential: switch reviewer vendor, or narrow the invariant to
  governance changes only.
- Review round-trips add more than one working session of wall-clock per
  spec without findings the owner acts on → drop to owner-only sign-off and
  record the trial outcome in MemPalace.
- Any proposal to **machine-enforce** author ≠ reviewer (CI, hooks,
  scripts) → stop; the invariant is cheap only while it is a header
  convention.
- The rulings index (§4) accumulating content rather than pointers → cut it
  back to one line per ruling.

## 4. Rulings index

Living, append-only. One line per standing owner ruling: date, one sentence,
authority. The authority (MemPalace drawer or committed document) is the
record; this index only locates it. Full narrative never lives here.

| Date       | Ruling                                                                                                                                              | Authority                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 2026-07-21 | Product VISION — nine ratified answers (superset design tool; export translates; never-connected = permissive; …)                                   | `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`         |
| 2026-07-25 | Autonomy agreement — plan sign-off before implementation; the agent never merges; autonomous execution after sign-off                               | `drawer_havdm_decisions_9e545b5b958d1c1ef33c701c`         |
| 2026-07-26 | Multi-model verdict — no automated multi-model orchestration loop; narrow manual uses only (flake-triage subagent, manual Fable handoffs)           | `docs/governance/MULTI_MODEL_WORKFLOW_PLAN_2026-07.md` §6 |
| 2026-08-04 | Seven arbitration rulings on the Fable-vs-Codex adversarial review, incl. **R7**: F5/F8 require an owner-signed written spec before any code        | `drawer_havdm_decisions_6e8d4788d9513ccce593c378`         |
| 2026-08-04 | Rebaseline of the stale visual snapshot(s) plus a full e2e + integration re-baseline pass authorized, sequenced before F4                           | `drawer_havdm_decisions_c9a9720edc90cf10ce5b67d6`         |
| 2026-08-06 | Governance-review ratification — Tier 1 adopted (this document, the two templates, Codex as F5/F8 spec reviewer, per-UAT-round adversarial cadence) | `drawer_havdm_decisions_0475d2d73336a4a2481bdec6`         |

Rulings that predate this index are added when next cited, not back-filled
speculatively.
