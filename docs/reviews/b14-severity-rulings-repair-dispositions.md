Author: Claude Fable 5.1
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

# Repair dispositions — B14 severity-rulings codification (plan track)

One dated section per round, appended and never rewritten (OA §3.4). On this
branch a "repair" is a plan revision: no governance document is edited until
the plan clears its review.

## Round 1 — 2026-09-06, answering `b14-severity-rulings-codex-plan-review.md` (`d6190d4`, `BLOCKED-ON` six sections, P1–P12)

**Owner rulings, 2026-09-06, by Ref.** Every finding was put to the owner with
the author's agreement or disagreement, options and a recommendation, and the
owner accepted every recommendation: P1–P5 and P7–P9 fixed now; **P6 ruled by
the owner** — reachability broadened from "an input" to "an input, an
execution path, a state, an output, or a property of the artifact itself";
P10–P12 folded into the same revision because they touch the same document and
add no round. Two further rulings: the eighth-round STRAT-D7 miss on PR #154
that P4 surfaced is **RECORDED, NOT RE-OPENED**; the story on Issue #156 and
the investigation drawer that carried the wrong counts are **CORRECTED**.

ⓘ This is the first use on the project of the discipline the plan itself
proposes — a pros/cons brief per finding, the owner ruling by Ref — applied to
the plan's own review.

| Ref | Sev | Disposition             | What changed in plan revision 2                                                                                                                                                                                                                                               |
| --- | --- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | 1   | RESOLVED                | §3.1: every prior finding not in a terminal state (RESOLVED, DEFERRED, ACCEPTED-RESIDUAL) is re-graded and counts toward the verdict; §3.3: PARTIALLY RESOLVED added as the sixth disposition state                                                                           |
| P2  | 1   | RESOLVED                | §3.3: "no repair undertaken SOLELY for an unruled finding is committed"; a repair required for a SEV 1 may overlap it and the lesser Ref stays OPEN for the owner's disposition of the incidental closure                                                                     |
| P3  | 1   | RESOLVED                | §3.3: the decision, its row and its board pointer create no follow-up; a label never changes the substance of a diff — any artifact or safeguard change, including a KNOWN-OPEN pin or a reworded residual, is a repair with its follow-up                                    |
| P4  | 1   | RESOLVED                | §1.2, §1.4, §3.3, §5, §10: 21 findings (7 SEV 2, 14 SEV 3), 18 fixed, 3 residual, eight repair rounds, the eighth (`141fe0d`, `0cd2a05`) with no follow-up; scenario A becomes 9 rounds / 21 rulings. Author's error: revision 1 copied 13 and 20 from a prior session's note |
| P5  | 1   | RESOLVED                | §1.4, §3.2, §3.3, §7: SEV 4 removed from the mandatory brief and the OPEN gate; recorded, owner may elect a fix                                                                                                                                                               |
| P6  | 1   | RESOLVED — owner ruling | §3.2: SEV 1 implementation reading and proof element (4) now name a condition (input, execution path, state, output, or property of the artifact); the SEV 2 cap reads "constructible condition"                                                                              |
| P7  | 2   | RESOLVED                | §5: population regenerated from unique finding headings (prints 21) beside the disposition rows (prints 21); the 34-line cause named                                                                                                                                          |
| P8  | 2   | RESOLVED                | §3.6: Enumeration 1 re-labelled a token inventory; the behavioural claim narrowed to the surfaces actually read; prompts count corrected to 139 files / 92 matches and labelled session-local; AC-2 reworded; AC-3 gains `APPROVE`                                            |
| P9  | 2   | RESOLVED                | §3.4: both SEV-CAL rows cut to locator plus authority                                                                                                                                                                                                                         |
| P10 | 3   | RESOLVED                | §5: P30 moved to seam C; scenario C unchanged                                                                                                                                                                                                                                 |
| P11 | 3   | RESOLVED                | §1.5: "counts appear once" replaced by "every count has one measured source"                                                                                                                                                                                                  |
| P12 | 3   | RESOLVED                | §7: "without reading it" replaced — the author ledger reads bytes only to compute the fingerprint                                                                                                                                                                             |

**Blast radius (OA §3.4).** Upstream: nothing reads the plan; the author
ledger hashes it, so its certificate is regenerated
(`08c029eaec8f` → `8a1c77bae104`). Downstream: the twelve findings above and the
STRAT-D7 scoped follow-up that reviews this revision. Non-regression:
docs-only branch; gate result recorded in the revision-2 commit message.

**What this round does NOT establish.** No governance document has been
edited. Whether P1–P12 are closed is decided by the follow-up review, not by
this table, which is the author's claim.

## Round 2 — 2026-09-06, answering `b14-severity-rulings-codex-plan-review-followup.md` (`cd1d412`, `BLOCKED-ON` three sections: P2, P3 and P6 remainders at SEV 1; P7 and P8 remainders at SEV 2; new P13 and P14 at SEV 3)

**Owner rulings, 2026-09-06, by Ref.** All three SEV 1 remainders sit in the
seams of P2, P3 and P6, so under the plan's own same-seam rule (§3.3) the
author put a **continue / declare-residual / park** choice to the owner per
seam — options, pros and cons, and a recommendation each — and a fix-now /
defer / accept-residual brief for each of P7, P8, P13 and P14. The owner ruled:
**continue** on P2, P3 and P6; **fix now** on P7, P8, P13 and P14; the two
corrections to Issue #156's acceptance items authorised; and the plan's cost
stop-rule **re-authorised to four rounds** under a hard cap, recorded in the
plan header (`:9`): if the follow-up on revision 3 returns anything other than
`CLEAR` or `CLEAR-WITH-FINDINGS`, work parks and returns to the owner; if the
ratification review blocks, the author returns to the owner rather than
repairing. Nine rulings, each taken on a pros-and-cons brief.

**Correction to Round 1.** Round 1 said the story on Issue #156 was
CORRECTED. That overstated it: the narrative paragraph was corrected on
2026-09-06, but acceptance item 5 still said "twenty" (follow-up P13). Round 1
is not rewritten; this line records the overstatement.

| Ref | Sev | Disposition | What changed in plan revision 3                                                                                                                                                                                                                                                                                                                   |
| --- | --- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2  | 1   | RESOLVED    | §3.3 (`:339-345`): overlap is permitted **only to the extent the overlapping change is inseparable from resolving the SEV 1**; a lower-severity correction that could be left out of the SEV 1 repair is separable and waits for the owner's ruling, whatever the repair is called                                                                |
| P3  | 1   | RESOLVED    | §3.3 (`:350-357`): a REPAIR is a change to the artifact under review, or to a safeguard for it, made to resolve or mitigate a finding; review reports and decision or evidence records that change no reviewed target and no safeguard are not repairs. §8 Q4 (`:556`) now asks whether the definition exempts anything STRAT-D7 follows up today |
| P6  | 1   | RESOLVED    | §1.3 row 2 (`:42`) and §8 Q6 (`:558`) reworded to the owner-ruled condition vocabulary; the technical text in §3.2 was already correct and is unchanged                                                                                                                                                                                           |
| P7  | 2   | RESOLVED    | §5 (`:460-472`): the two bare counts replaced by a set-equality block whose exit status is the check; AC-5 (`:521`) reworded; bidirectional proof below                                                                                                                                                                                           |
| P8  | 2   | RESOLVED    | AC-2 (`:518`) cut to the decidable result and explicitly NOT claiming "every tracked restatement"; the §2.1 row (`:94`) and the §3.6 heading (`:412`) likewise; Issue #156 acceptance item 2 reworded to match (owner-authorised)                                                                                                                 |
| P13 | 3   | RESOLVED    | Issue #156 acceptance item 5: "twenty" → "twenty-one" (owner-authorised; re-fetched body identical to the intended body apart from GitHub's trailing newline; prior body backed up in the session scratchpad and in the Issue's edit history); Round 1's overstatement recorded above                                                             |
| P14 | 3   | RESOLVED    | §1.2 (`:31-32`, `:35`): row 7 split into a JUDGEMENT row (seam membership, hand trace) and a MEASURED row (every one of the eight review files carries "Class swept"; `grep -c` is non-zero for each — 1, 1, 1, 1, 1, 1, 3, 3)                                                                                                                    |

**Author-found, not reviewer-found — recorded so nothing rides through
unnoticed.** A1: one over-long line inside the §3.3 AFTER fence re-wrapped
(the fence is the exact text to be pasted into the Operating Agreement).
A2: the AC-4 row carried a fourth, orphan cell holding revision 1's awk
command — the one that passed on zero-line spans — and it is removed
(`:520`). Neither changes a rule sentence; the follow-up is asked to confirm.

**A3 — found in the author's reading pass, outside the two authorised
edits.** Issue #156's own statements of ruling 2 (the REACHABILITY quote and
the synthetic-input cap) and ruling 8 (the implementation reading) still carry
the pre-P6 wording — "the input that reaches this defect", "a synthetic input
nobody has written", "on an input that exists today, or on an argued-plausible
future input". The owner broadened that object on 2026-09-06 (plan review P6;
`drawer_havdm_decisions_18da8a2c9bbad788a21abaee`), and the follow-up's P6
class sweep covered the plan only. The story is a live surface of the same
class, so it is put to the owner for a dated amendment note on rulings 2 and 8
(the rulings as made are not rewritten; the note records the amendment). Until
ruled, the story and the plan disagree on this wording, and the next follow-up
is asked to read the live Issue rather than this ledger's account of it.

**P7 — bidirectional proof of the new §5 check.** The block was extracted
from the plan file as it stands (not retyped), its two paths substituted to
temporary copies of the eight review files and the C3 plan, and run on the
real data and on seven constructed defects:

| Case                                                                                                 | Old revision-2 pair | Revision-3 block                                                                   |
| ---------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| Real files                                                                                           | 21 / 21             | exit 0 — `replay population ok: 21 findings, one disposition each, sets identical` |
| Duplicate source heading (`P12` appended to a review file)                                           | —                   | exit 1 — `FAIL: duplicate source heading(s): P12`                                  |
| Missing source heading (`P13` removed)                                                               | —                   | exit 1 — `FAIL: Ref sets differ` + `20 unique findings, expected 21`               |
| Duplicate disposition row (`P12` row appended)                                                       | —                   | exit 1 — `FAIL: duplicate disposition row(s): P12`                                 |
| Missing disposition row (`P13` row removed)                                                          | —                   | exit 1 — `FAIL: Ref sets differ`                                                   |
| Source-side offset (`P13` heading removed, `P12` heading duplicated)                                 | 20 / 21             | exit 1 — duplicate + sets differ                                                   |
| Both sides missing `P13` (sets equal, count wrong)                                                   | —                   | exit 1 — `FAIL: 20 unique findings, expected 21`                                   |
| **Disposition-side offset — the follow-up's construction** (`P13` row removed, `P12` row duplicated) | **21 / 21 — blind** | **exit 1 — `FAIL: duplicate disposition row(s): P12` + `Ref sets differ`**         |

A harness defect was found and fixed during this proof: the first mutation
anchored the heading at end of line and never matched (the real heading is
`### P13 — SEV-3 — A partially valid but invalid payload…`), so the
missing-source case first "passed"; the mutation was corrected and re-run.
The harness itself lives in the session scratchpad and is not committed.

**P2 and P3 — the wording tested by construction (hand trace, labelled).**
Under the revision-3 text: separate files → separable, waits for the owner;
separable same-file lines → waits; inseparable same-line wording → may
overlap, lesser Ref stays OPEN; one correction that necessarily closes both →
inseparable, may overlap; a chosen broad superset carrying a separable
lower-severity part → that part waits "whatever the repair is called". The
inseparable case is still permitted, so the rule does not block where it should
not. For P3: owner decision, disposition row, board item, owner brief and the
reviewer's committed review → not repairs (the chain terminates); a new or
changed `KNOWN-OPEN:` pin, a reworded governed residual, a changed test, a
changed target → repairs with follow-up; a change to the target by someone
other than the author → still a repair, because the definition is bounded by
target, not actor — no actor exemption is introduced.

**Blast radius (OA §3.4).** Upstream: nothing reads the plan; the author
ledger hashes it, so its certificate is regenerated
(`8a1c77bae104` → `2cca75f5bde4`). Issue #156's body was edited at acceptance
items 2 and 5 under owner authorisation, backup kept. Downstream: the seven
findings above and the second STRAT-D7 scoped follow-up that reviews this
revision; then, if it clears, the governance edits of plan §3 and their
ratification review. The governance surfaces are untouched:
`docs/governance/OPERATING_AGREEMENT.md`, `docs/templates/ADVERSARIAL_REVIEW.md`,
`docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md`, `CLAUDE.md`
and `ai_rules.md` are byte-identical to `main`; the AC-4 spans extract 6 / 4 /
8 / 5 lines and diff empty; AC-3 returns nothing. Non-regression: docs-only
branch; gate result recorded in the revision-3 commit message.

**What this round does NOT establish.** No governance document has been
edited. Whether P2, P3, P6, P7, P8, P13 and P14 are closed is decided by the
follow-up review, not by this table, which is the author's claim. The owner's
cap applies to that follow-up.

**Round 2 addendum — 2026-09-06, certificate correction.** The blast-radius
paragraph above records `8a1c77bae104` → `2cca75f5bde4`. That value was computed
with the revision-3 plan modified but unstaged; the author-ledger certificate
hashes the index entry as well as the working-tree bytes
(`tests/support/authorLedger.ts:290-340`), so it certified a mixed state that
ended at commit `79eb20e`. On the committed tree the fingerprint is
`618ea4beca30`; the ledger's fourth addendum re-certifies it. The paragraph
above is left as written (append, never rewrite).
