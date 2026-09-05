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
