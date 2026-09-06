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

**A3 — owner ruling, 2026-09-06.** The owner authorised the recommended
dated amendment note on Issue #156's rulings 2 and 8 ("Go with your
recommendation for A3"). Applied the same day from a fresh backup: one note
inserted before the Ruling 3 heading and one before the Ruling 9 heading, each
naming the owner's P6 ruling (`drawer_havdm_decisions_18da8a2c9bbad788a21abaee`)
and reading the superseded "input" wording as the ruled "input or condition"
wording; the rulings as made are preserved above each note. Verified by
re-fetch: the live body is identical to the intended body, exactly four lines
changed against the pre-edit backup (two notes, each preceded by a blank line),
and both original sentences are still present. The story and the plan now
agree on the reachability object; the second follow-up is asked to read the
live Issue.

## Round 3 — 2026-09-07, answering `b14-severity-rulings-codex-plan-review-followup2.md` (`304aeca`, `BLOCKED-ON` two sections: P6 remainder and new P15 at SEV 1; new P16 and P17 at SEV 3)

**Verdict under the cap, and the owner's ruling.** The cap set on 2026-09-06
parked B14 on this verdict. Before ruling, the owner asked whether the process
had become too detailed; the author's assessment was that eleven of the
seventeen findings across the three rounds targeted the plan's own scaffolding
(counts, projections, inventories, evidence labels) rather than the nine rules,
and that each such surface drifts as the branch grows. The owner agreed and
ruled on 2026-09-07: **one final revision that removes scaffolding rather than
adding to it; one more scoped follow-up under a terminal cap; if that follow-up
is anything other than `CLEAR` or `CLEAR-WITH-FINDINGS`, B14 is parked and
rescoped — the edits for rulings 1–6 land directly under a single ratification
review with no further plan track — and there is no further re-authorisation.**
The owner also accepted the author's classification of the four findings: none
is a revision-3 regression; P6 and P17 were on lines revision 3 touched or had
the data for and should have been caught then; P15 and P16 pre-date revision 3
and were missed in two rounds. Codex accepted A3, A1, A2 and the ledger
re-certification, and closed P2, P3, P7, P8, P13 and P14.

| Ref | Sev | Disposition | What changed in plan revision 4                                                                                                                                                                                                              |
| --- | --- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P6  | 1   | RESOLVED    | §1.3 row 2 (`:42`): a made-up condition never blocks an ordinary component; only a safety gate may block on a future edit, and only after the reviewer argues why it is plausible — the two limits the technical rule (§3.2) already carried |
| P15 | 1   | RESOLVED    | §5 (`:503`): the scenario table and every owner-rulings count REMOVED; what remains is the measured floor (one round) and ceiling (nine rounds) with no numeric projection of rulings; §1.4 (`:53`) no longer states any ruling count        |
| P16 | 3   | RESOLVED    | §3.7 (`:440`) and §7 (`:541`): the fixed "twice" replaced by the rule — one regeneration per governed commit, the count read from the ledger's addenda — plus the stage-before-certifying instruction                                        |
| P17 | 3   | RESOLVED    | §3.6 (`:432`): the static branch-files list replaced by the command that regenerates it (`comm -13` of Enumeration 1 on `main` against the branch); AC-2's "each named" is satisfied from that output in the edits-commit record             |

Also: §8 Q5 (`:549`) no longer refers to a scenario; the header (`:9`) records
the second and last re-authorisation with the rescope route; §9 (`:554`) and
§10 (`:563`) carry pointers here rather than narrative.

**The revision shrank, measured:** 56104 → 55953 (-151 padding-free characters; 570 → 563 lines). Every sentence that stated a
scenario, an owner-rulings count or a regeneration count was swept out
(`grep -n -E 'scenario [ABC]|Scenario [ABC]|\| *Owner rulings|21 rulings|roughly eight|\btwice\b|two ledger|Two ledger'` returns nothing; the phrase "owner rulings" itself survives twice, in the SEV-CAL amendment sentence and in §5's statement that no projection of owner rulings is made); the audit-trail text added
for the ruling was cut to pointers so that this ledger is its one home.

**Blast radius (OA §3.4).** Upstream: nothing reads the plan; the author ledger
hashes it — the fingerprint was computed with the plan STAGED this time and the
ledger's fifth addendum records the move. Downstream: the four findings above
and the third, final scoped follow-up. Governance surfaces untouched and
byte-identical to `main`; AC-3 empty; AC-4 four spans identical, non-zero.

**What this round does NOT establish.** No governance document has been
edited. Whether P6, P15, P16 and P17 are closed is decided by the follow-up;
under the owner's terminal cap, anything other than a clear verdict parks and
rescopes B14.

## Round 4 — 2026-09-07, answering `b14-severity-rulings-codex-plan-review-followup3.md` (`b462579`, `CLEAR`, no finding, no P18)

**Verdict, and what it permits.** Sol's third and final follow-up returned
`CLEAR`: P6, P15, P16 and P17 RESOLVED, no regression in P1–P5 or P7–P14, no
new finding, no drawer candidate. Under the owner's terminal cap of 2026-09-07
that closes the plan track; the owner then instructed the author to execute
the CLEAR branch of the START prompt (2026-09-07), and the governance edits
below are made exactly as plan §3 quotes them. No finding is put to the owner
in this round because there is none. Sol's one disagreement with the
commission — that at `1e816c4` the `comm -13` output was the plan plus two
review files, not three, because the second follow-up contains none of the
six tokens — is verified and agreed; it is a commission timing error, not a
plan finding, and the plan's §3.6 already names no count.

| Ref | Sev | Disposition | Note                                                                  |
| --- | --- | ----------- | --------------------------------------------------------------------- |
| —   | —   | —           | No finding in this round; no owner ruling owed; no repair undertaken. |

**The edits commit — the record plan §3.6 and §6 ask for.**

- **AC-1.** `git grep -n 'SEV-CAL-' -- docs/governance docs/templates docs/strategy`
  lists landing sites in the template (§1, §1a, §4 twice, the same-seam
  paragraph), the Operating Agreement (§3.4 three bullets; §4 rows STRAT-D18,
  SEV-CAL-1, SEV-CAL-2) and the strategy pointer, plus the plan's own quotations.
- **AC-2.** Enumeration 1 on `main` returns 100 files; on the edits tree 104.
  `comm -23` (in `main`, not on the branch) is empty, so the 87 / 3 / 6 / 1 / 3 / 0
  partition is unchanged. `comm -13` names exactly this branch's own files:
  `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md`,
  `docs/reviews/b14-severity-rulings-codex-plan-review.md`,
  `docs/reviews/b14-severity-rulings-codex-plan-review-followup.md`,
  `docs/reviews/b14-severity-rulings-codex-plan-review-followup3.md`. The
  `prompts/` pass is session-local and is not re-reported here. ⚠ **Correction
  after commit `1324f24`:** on the committed tree Enumeration 1 returns 105, not
  104, and `comm -13` names a fifth file — this ledger itself — because the
  AC-3 note above names a retired token and this Round joined the set at the
  moment it was committed. The four files above plus this ledger are the
  branch-only set; `comm -23` is still empty. That is the timing error Sol
  named in the commission, repeated by the author: a count read before the
  record that carries it is written is stale by construction. The commit
  message's "104 here" is corrected by this note rather than rewritten
  (precedent: `39c53d6`, `7d3969f`).
- **AC-3.** The retired-token grep over `docs/templates`, `CLAUDE.md` and
  `ai_rules.md` returns the template's §1 retirement sentence (three lines)
  and one further line in §4: "The whole-PR token `SEV-1-BLOCKED` is
  withdrawn." Both sentences retire tokens; neither offers one as a verdict a
  reviewer may return, so the criterion holds. ⚠ The plan's AC-3 Check cell
  says the grep "returns only the §1 retirement sentence" and under-describes
  its own output, because the §3.2 AFTER text the plan itself quotes names the
  token. Author-found A4, below.
- **AC-4.** The four protected spans extract 6, 4, 8 and 5 lines and each
  `diff` against `main` prints nothing — identical.
- **AC-5.** The §5 block prints `replay population ok: 21 findings, one
disposition each, sets identical` and exits 0.
- **AC-6.** The author ledger is regenerated with the three governed files
  STAGED first: `1419f4da57f6` → `4fad7a426996`, sixth addendum. The gate
  result is in the commit message and is re-run after the commit.
- **AC-7.** Owed by the ratification review, commissioned under the new
  vocabulary; its first line must be `BLOCKED-ON:` / `CLEAR-WITH-FINDINGS` /
  `CLEAR`.
- **Prettier** rewrote only the Operating Agreement (the §4 table re-padded
  because the STRAT-D18 cell grew); the template and the strategy document
  were already formatted.
- **The cleanup-sweep board item** (plan §3.8) is created as a DRAFT on board
  `HAVDM`, Status Todo, Kind process, empty, trigger unnamed. No Issue created.

**Author-found residues, put to the owner rather than fixed (ruling 6; the
first live use of the mechanism this PR creates).**

- **A4 (SEV 3 by the implementation reading — record accuracy).** The plan's
  AC-3 Check cell (`:511`) says "returns only the §1 retirement sentence"; the
  grep also returns §4's withdrawal sentence, which the plan's own §3.2 AFTER
  text supplies. Fix now would mean editing the plan after the terminal cap
  closed the plan track. Recommendation: **accept as recorded here** — the
  criterion holds, the plan is a change artifact, and this round is its
  record.
- **A5 (SEV 3 — record accuracy).** The plan's Status line (`:3`) still reads
  "awaiting the last scoped follow-up". Same reasoning; recommendation:
  **accept as recorded here**, or one-line fix if the owner prefers the plan
  header to read as closed.
- **A6 (SEV 4 — formatting).** In OA §3.4 the disposition-table bullet
  carries one continuation line without the two-space list indent, exactly as
  the plan's §3.3 AFTER text quotes it; Markdown reads it as a lazy
  continuation of the same paragraph and Prettier left it. Recommendation:
  **accept as-is**; the owner may elect a fix in the ratification round.

**Blast radius (OA §3.4).** Upstream: nothing runtime reads these documents
(plan §7); the author ledger hashes two of the three and its fingerprint moved.
Downstream: every future review commission and the ratification review of this
commit — the first live use of the vocabulary. The strategy document is
outside the governed set. STRAT-D7's trigger is byte-identical (AC-4).
`docs/testing/SPACING_HELPER_PRESET_PLAN.md` and its `_HISTORY.md` are untouched.

**The external-member question.** Issue #156's "Where the edits land" and
acceptance items match what landed; its rulings 2 and 8 carry the A3 amendment
notes and name the template §4 as binding "once ratified", which remains true
until the merge. The live `[STATE]` drawer is bumped in the same session. No
prompt under `prompts/` is edited; the ratification commission is a new file.

**What this round does NOT establish.** The edits are unratified until the
independent review returns and the owner merges. Nothing is pushed.

## Round 5 — 2026-09-07, answering `b14-severity-rulings-codex-ratification-review.md` (`59251f1`, `CLEAR-WITH-FINDINGS`: P18–P22 at SEV 3, P20 at SEV 4, no SEV 1)

**The first review conducted under the new vocabulary.** Sol derived the
verdict, opened with the Owner Summary Table, graded every finding without a
retired token, confirmed all eleven edit units equal the plan's AFTER text, the
four protected STRAT-D7 spans identical, and no surviving old rule in either
live surface. The author verified all six findings against the cited source;
all six hold, and two (P21, P22) are the author's own Round 4 errors. Per OA
§3.4 ruling 6 the author put each finding to the owner by Ref with options,
pros and cons and a recommendation; the owner ruled "as recommended" on
2026-09-07 and authorised the two Issue #156 edits and the push.

| Ref | Sev | Disposition                            | Owner ruling and record                                                                                                                                                                                                                                                                                                             |
| --- | --- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P18 | 3   | ACCEPTED-RESIDUAL → this row           | The plan's AC-3 Check cell (`:511`) under-describes its output; the criterion holds. Accepted as recorded here and in Round 4 (A4); the plan is a change artifact and is not edited after the terminal cap.                                                                                                                         |
| P19 | 3   | ACCEPTED-RESIDUAL → this row           | The plan's Status line (`:3`) still reads "awaiting the last scoped follow-up"; the follow-up returned `CLEAR` at `b462579`. Accepted as recorded (A5); the commit history and Round 4 carry the closed track.                                                                                                                      |
| P20 | 4   | Recorded; no fix elected               | OA §3.4 (`:277`) lazy-continuation line as the plan quotes it; renders correctly. SEV 4: no brief owed; the owner elected no fix.                                                                                                                                                                                                   |
| P21 | 3   | ACCEPTED-RESIDUAL → this row           | ⚠ Correction of Round 4's AC-6 bullet (`:277-279`): the THREE EDITED files were staged before the fingerprint was read; TWO of them (`docs/templates/**`, `docs/governance/**`) are in the ledger's governed set (`tests/support/authorLedger.ts:68`); the strategy document is not and does not move the certificate.              |
| P22 | 3   | RESOLVED (hosted record; not a repair) | Issue #156's "Where the edits land" bullet placed the Owner Summary Table in template §4; it landed in §1a. Bullet corrected 2026-09-07 with a dated note. Round 4's clearance of the Issue (`:316-318`) was wrong on this bullet and is corrected here. No reviewed target or safeguard changed, so no STRAT-D7 follow-up is owed. |
| P23 | 3   | RESOLVED (hosted record; not a repair) | Issue #156 retitled 2026-09-07 to "B14 [HIGH]: Codify severity rulings 1–9 — end the review revolving door without weakening severity". Prior title and body are in the Issue's edit history and in the session scratchpad.                                                                                                         |

**Deferrals: none.** This round is the first live use of the DEFERRED state
and it is not used: every finding is either a record nobody should revisit or a
one-sentence hosted correction. The cleanup-sweep draft item stays empty; using
it here would file work that should never be done.

**Blast radius (OA §3.4).** This round changes this ledger and two hosted
fields of Issue #156. No governed file changes; the fingerprint stays
`4fad7a426996`. Nothing here is a repair under §3.4's definition (a change to
the artifact under review or a safeguard for it), so no scoped follow-up is
owed; the owner's merge is the next gate.

**What this round does NOT establish.** The amendments are ratified by the
owner's merge, not by this record. The pause on new governance mechanisms is
still an open ruling.
