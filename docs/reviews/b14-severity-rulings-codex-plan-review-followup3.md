# B14 Severity Rulings Codification — Third and Final Plan Review Follow-up

Author: Claude Fable 5.1
Reviewer: OpenAI Codex / GPT-5.6 Sol
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

CLEAR

Revision 4 resolves P6, P15, P16 and P17 without regressing the previously
cleared plan sections. The owner may authorise the governance edits in plan §3.

## Owner Summary Table

| Ref | What is wrong, in plain English | Severity | Blocks | Fix complexity 1–5 | Recommendation           |
| --- | ------------------------------- | -------- | ------ | ------------------ | ------------------------ |
| —   | No finding remains.             | —        | None   | —                  | No owner decision needed |

## Owner Decision Brief

Nothing is routed to the owner for a finding. Under the terminal cap, this
`CLEAR` verdict permits the owner to authorise the governance edits in plan §3.

## Prior-finding dispositions

- **P6 — RESOLVED** —
  `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:42`
  now gives the future-condition exception exactly the two limits in the
  technical rule at `:219-243`: the artifact must be a safety gate whose whole
  purpose is catching future mistakes, and the reviewer must argue why the edit
  is plausible. “Catching future mistakes” is a faithful non-technical rendering
  of “catching the not-yet-written”; it does not widen the exemption.
- **P15 — RESOLVED** —
  `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:53` makes
  no owner-ruling estimate, and `:503` retains only the conditional one-round
  floor and nine-round ceiling. The floor follows when all four round-one
  findings are closed without repair; the ceiling follows from the replay's
  eight real repair rounds plus the follow-up owed after the eighth. Section
  1.5 at `:57-62`, reviewer question 5 at `:549`, and live Issue #156 acceptance
  item 5 still point coherently to the replay and its projected round count.
- **P16 — RESOLVED** —
  `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:440` and
  `:541` state the dynamic rule—one regeneration per governed commit—with no
  fixed regeneration total. The fifth ledger addendum at
  `docs/reviews/self-pass-gate-author-ledger.md:450-460` records the staged-first
  transition `618ea4beca30` → `1419f4da57f6`; the committed tree passed the
  focused specification 9/9 without another re-certification.
- **P17 — RESOLVED** —
  `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:432` names
  no branch path statically. Its `comm -13` instruction derives the exact
  branch-only six-token population, so AC-2's “each named” requirement at
  `:510` is satisfiable from the command output in the future edits-commit
  record.

**P1–P5 and P7–P14 — no regression found.** The revision-4 diff does not alter
their repaired rule text or evidence classes; the only adjacent changes remove
the P15/P16/P17 scaffolding, qualify P6, and replace history with pointers.

## Scoped attack results

### Reachability and cost accounting

No issue found in §1.3 or the technical severity contract. The ordinary-
component prohibition, safety-gate purpose and argued-plausibility condition
agree across `:42` and `:219-243`; the owner-facing row neither loses nor adds a
limit.

No numeric projection of owner rulings remains. The exact Round-3 sweep grep
returned exit 1 with no output, its expected no-match result. The phrase “owner
rulings” survives exactly twice: the SEV-CAL amendment sentence at `:405` and
§5's explicit statement at `:503` that no numeric projection is made. The
one/nine round bounds are conditional calculations over the fixed 21-finding
replay, not a promise about findings a hypothetical ninth review might discover.

### Fingerprint and dynamic inventory

No issue found in the fingerprint mechanism or record. The ledger declares
`1419f4da57f6` at `docs/reviews/self-pass-gate-author-ledger.md:48`, contains
five B14 addenda at `:380`, `:395`, `:412`, `:430` and `:450`, and the focused
test passed 9/9 at reviewed HEAD `1e816c4`. The committed-tree match verifies
the outcome of staging first; the historical order of the author's staging
commands is not independently observable and is not claimed as measured here.

The exact six-token `comm -13` command on reviewed HEAD `1e816c4` returned the
plan plus two review files: the original plan review and first follow-up. The
second follow-up is correctly absent because it contains none of Enumeration
1's six exact tokens. On the completed review tree the same command returns the
plan plus three review files, adding this file because it discusses
`STRAT-D18`; no static path or count in the plan needs updating. The baseline
and reviewed-HEAD union counts were 100 and 103.

### Shrink, pointers and previously clean sections

The prescribed measurement reproduced exactly:

| Revision  | Padding-free characters | Lines |
| --------- | ----------------------: | ----: |
| `79eb20e` |                  56,104 |   570 |
| `1e816c4` |                  55,953 |   563 |

That is −151 padding-free characters and −7 lines.

No issue found in the header, §9 or §10 pointers. The terminal route identifies
the authorised subset (rulings 1–6), the execution mode (direct edits followed
by one ratification review), and the prohibition on another plan revision.
Section 2.1 at `:80-96` maps each of those six rulings to its edit target, while
§3.1–§3.4 provides the source text and proposed landing text; a new owner choice
is not required to execute the rescope.

No regression was found in §1.5, §2.1, §3.1–§3.5, §4 or §6: revision 4 changes
none of their substantive text. Section 7's only change at `:541` replaces the
stale fixed regeneration count with the governed-commit rule and remains
consistent with §3.7. No governance target has yet been edited.

## Confidence and method

**Confidence: high** on all four dispositions and the absence of a new plan
finding. P6, P16 and the shrink result are direct text or executable checks;
P15's bounds and the rescope-route sufficiency require bounded interpretation,
made explicit under Weakest claims.

| Check                                                                        | Real exit/result                                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Starting-state stop gate: branch, HEAD/base, ten-commit sequence, clean tree | exit 0; exact required state                                                                           |
| `git diff --name-only 304aeca..1e816c4`                                      | exit 0; exactly the plan, disposition ledger and author ledger                                         |
| Live Issue #156 read                                                         | exit 0; acceptance item 5 says “twenty-one” and requires a projected round count                       |
| Revision-4 replay block                                                      | exit 0; `replay population ok: 21 findings, one disposition each, sets identical`                      |
| Six-token inventory on `main` and `1e816c4`                                  | exit 0; 100 and 103; HEAD-only output is the plan plus two matching reviews                            |
| Round-3 exact stale-scaffolding grep                                         | exit 1, zero output; expected no-match result                                                          |
| Exact “owner rulings” phrase search                                          | exit 0; exactly two occurrences, at plan `:405` and `:503`                                             |
| Prescribed padding-free measurement                                          | exit 0; 56,104/570 → 55,953/563                                                                        |
| `npx vitest run tests/unit/author-ledger.spec.ts`                            | exit 0; 9 tests passed in 1 file                                                                       |
| `./tools/checks` on the completed review tree                                | exit 0; 4/4 steps; 1559 tests passed in 105 files                                                      |
| Final inventory and repository state                                         | exit 0; plan plus three matching review files; before commit only this review file, after commit clean |

**UNVERIFIED:** the future governance edits, draft cleanup board item,
ratification review, PR body, CI, packaging, e2e, integration, Electron and live
Home Assistant do not exist yet or are outside this Markdown-only round. The
historical assertion that the author staged the plan before reading the
fingerprint is not reconstructible from Git; the committed fingerprint and
9/9 test outcome are verified. MemPalace's three supplied project drawers were
unavailable because their transport closed; Round 3 of the committed
disposition ledger was used as the branch authority, as commissioned.

## Claim ledger

| Claim                                                                                      | Status               | Evidence                                                                       |
| ------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------ |
| Starting state and three-file repair scope match the commission                            | MEASURED             | Git branch/revision/log/status and diff-name commands                          |
| P6 carries exactly the safety-gate-purpose and argued-plausibility limits                  | JUDGEMENT            | Direct semantic comparison of plan `:42` with `:219-243`                       |
| No numeric owner-ruling projection or fixed regeneration count remains                     | MEASURED             | Exact Round-3 grep, two-phrase check and regeneration-text sweep               |
| The replay gives a one-round floor and nine-round ceiling for its fixed finding population | INFERRED             | 21-row replay, eight historical rounds, no-repair rule and owed-follow-up rule |
| P17's dynamic inventory is exact without a maintained static list                          | MEASURED             | `comm -13` output at reviewed HEAD and completed review tree                   |
| The shrink claim is exact                                                                  | MEASURED             | Prescribed `len(re.sub(r" {2,}", "", text))` calculation and line counts       |
| The committed fingerprint is current                                                       | MEASURED             | Ledger declaration plus focused 9/9 pass at `1e816c4`                          |
| The terminal rescope route needs no further owner ruling                                   | JUDGEMENT            | Header `:9`, ruling-to-target map `:80-96`, quoted edits §3.1–§3.4             |
| Revision 4 introduces no regression in the commissioned clean sections                     | MEASURED / JUDGEMENT | Exact revision diff plus manual read of changed context and §7                 |
| The required final gates pass with only the committed review added                         | MEASURED             | Focused test, full checks, diff/status and final inventory checks              |

### Weakest claims

1. **The nine-round ceiling.** It is a ceiling for replaying the fixed set of 21
   historical findings: eight observed rounds plus the one contractually owed
   follow-up. It is not a universal ceiling on new findings a never-run ninth
   review could discover; §5's replay heading supplies that boundary.
2. **The P6 plain-English equivalence.** “Future mistakes” is broader colloquial
   language than “the not-yet-written”, but the same sentence restricts it to an
   artifact whose whole job is catching them and retains the reviewer's
   plausibility argument. No ordinary component enters the exception.
3. **The rescope route.** The header is not a standalone patch recipe. It is
   executable without another owner ruling because the same plan's §2.1 and §3
   already separate rulings 1–6 from 7–9 and name their targets; the next author
   must still compose the deliberately smaller diff for ratification.

## New findings — P18 onward

None.

## Disagreements with this commission

The commission says the `comm -13` output is the plan and three committed
review files. At reviewed HEAD `1e816c4`, it is the plan and **two** matching
review files; `b14-severity-rulings-codex-plan-review-followup2.md` contains none
of the six tokens. The statement becomes true only on the completed review
commit, when this third matching review file joins the output. This timing error
is not a plan finding: plan `:432` deliberately states neither a count nor a
path list and directs the edits-commit record to name whatever the command then
returns.

I otherwise agree with the commission's repair scope, terminal cap and required
attacks.

## MemPalace drawer candidates

None. This round yielded project-specific closure evidence and no new
agent-general rule. The three supplied project drawers could not be read because
the MemPalace transport closed; no lease override or process action was
attempted.
