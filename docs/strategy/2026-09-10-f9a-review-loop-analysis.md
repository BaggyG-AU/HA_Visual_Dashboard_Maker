# F9a review-loop analysis — why seven rounds, and what would stop the next one

> ## ⚠ Archival publication — read this first
>
> **This document is a historical record, published on 2026-09-11 for the archive.
> The owner's decision it was written to inform has since been taken, and publishing
> it here does not reopen that decision.**
>
> **What was decided.** The owner approved the review-loop trial on 2026-09-11,
> covering F9a, F6 and F10. The approved package is
> [the consolidated owner decision](../reviews/2026-09-11-review-loop-trial-owner-decision.md)
> (approved at version `b08bc41`); what was actually set up against it is
> [the adoption and setup record](../reviews/2026-09-11-review-loop-trial-adoption.md).
> Both were published in pull request #163 (merge `55e6068`). The decision drawer is
> `drawer_havdm_decisions_e2f130d23c11e6dacf94f42d`.
>
> ⚠ **§8's recommended package is not the adopted package.** This is one of two
> analyses the owner commissioned independently; the other is
> [Codex's review-loop analysis](../reviews/2026-09-10-review-loop-analysis-codex.md),
> written without sight of this one. The owner reconciled the two, and the exchanges
> that followed are alongside it in `docs/reviews/`. Read §8 as this author's proposal
> at the time, not as the outcome.
>
> ⚠⚠ **Several claims below were qualified or withdrawn after this document was
> written** — in Fable's exchange-2 and exchange-3 replies and in
> [the agreed recommendation](../reviews/2026-09-10-review-loop-agreed-recommendation.md).
> Do not quote its figures without them:
>
> 1. The **"~1% miss rate"** (mechanism M4), **"mostly followed"** and **"about three
>    new findings per follow-up round"** are **withdrawn as measurements** — lexical
>    token counts do not measure error rates or rule compliance. The "17" counted
>    live-finding _appearances_ (P3 three times, P12 reopened); new identifiers after
>    round 1 are **12**.
> 2. **Mechanism M1** is restated as "reported checks did not establish the published
>    claims", **not** "checked by nothing" — the record does not establish that no
>    checking occurred.
> 3. **"A1 now as a record" over-reached.** A standing finish-by-impact default is a
>    _mechanism_, not a record, and needs both agents' review and the owner's express
>    adoption, including any exception to the governance pause.
> 4. **Codex contributed to the rework too** — review 1 missed P8, and a parser repair
>    prescription (P16→P19) was recorded as a reviewer-caused regression. Owner
>    authorisation does not validate a remedy.
> 5. The **"round-5 self-check never swept the record" root cause is unproven.** What
>    is provable is that S2's figure matches no examined committed tree.
>
> **Unaffected by the above:** the measured record growth, the blame table, and the
> demonstrated failed checks P14 / S2 / P15.
>
> The full qualification text is prepended to the MemPalace drawer
> `drawer_havdm_investigations_baf7ce21a94ad31a194a2445`, which also carries this
> document's original staged content verbatim.
>
> **The Status block below is preserved exactly as written on 2026-09-10** and
> describes the situation at that time, not today.

**Status:** Analysis for the owner's decision. Nothing in this document is adopted,
codified or built; the governance pause of 2026-09-07
(`drawer_havdm_decisions_89b5f20cc75d3f70a7e0491b`) is in force and this document is
its retrospective input, not its conclusion.
**Author:** Claude Fable 5.1 — the high-stakes upstream seat
(`docs/governance/OPERATING_AGREEMENT.md` §3.6, STRAT-D4: "High-stakes upstream:
strategy, briefs, governance authoring"). Seat confirmed against that table before
authoring.
**Reviewer:** none commissioned for this document. The owner commissioned a separate,
independent analysis from OpenAI Codex / GPT-6 Astra; the two are written without
sight of each other and the owner reconciles them. Any change the owner adopts from
either is reviewed under §3 before it binds.
**Owner gate:** the owner (micah / BaggyG-AU) decides which options, if any, to adopt,
and when — now under the pause's record exemption, or at the pause's retrospective.
**Subject:** the seven independent review rounds on
`docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md`, 2026-09-09 to 2026-09-10,
merged as PR #162 (`4dc0423`).
**Created:** 2026-09-10 · **Base:** `main` = `4dc0423`

> ⚠ **Declared conflict.** A Claude model wrote the brief whose defects are counted
> here, and a Claude model writes this analysis. Every count below is tied to a
> command in Appendix A so that the owner, or Astra, can re-run it without trusting
> the author. Where a number is a judgement rather than a measurement, the claim
> ledger in §10 says so.

---

## 0. Owner summary — plain English first

**What happened.** A brief of 784 lines went through seven review rounds. The
reviewer found real problems in the first four rounds and recommended locking the
brief from round 3 onward, five times in a row. The brief was locked after round 7.
From the moment it was ready for review to the moment it was recorded as ready to
lock took 41 hours of wall-clock time and 19 commits.

**Where the findings actually were.** Of the 21 findings, 5 were in the part of the
brief the next document (the spec) will be written from. The other 16 were in text
that describes the brief, the repairs, or the review process itself: the brief's own
"how this was verified" section, the repair ledger, and a memory drawer. The loop did
not keep finding problems in the product document. It kept finding problems in the
paperwork the process requires each repair to produce.

**Why the loop fed itself.** Every repair must be accompanied by a written account:
what was fixed, what it relies on, what was checked, what was not. That account is
held to the same standard as the brief, and it is longer than the fix. By round 6,
the author was writing about twelve lines of account for every line of brief actually
changed. Each account contains dozens of statements that can be wrong. Some were.
The next round found them, the author wrote another account, and so on. The brief's
own defects ran out at round 5; the accounts' defects did not run out, because each
round manufactured a fresh supply.

**Why the rule that should have stopped this did not.** The rule "never write a
count or an 'all' or 'only' without checking it first" was in front of the author
every round. It was mostly followed: the two documents contain roughly 1,800 places
where that rule could fire, and 21 findings came out of them. The rule's failure rate
was low. The problem is that a low failure rate on a large and growing number of
statements still produces a finding or three every round, and the process treats
every finding as a reason for another repair and another account. No amount of
carefulness fixes that arithmetic. Writing fewer checkable statements does.

**What ended it.** Your ruling on 2026-09-10: if a finding does not create a defect
the spec would inherit, record it and move on. That works because it decides what
to fix by asking where the defect can travel, not whether it is true. Applied at
round 5 instead of round 7, it would have ended the chain one round earlier with the
one spec-facing defect from those rounds (P8) still fixed. Following the reviewer's
lock recommendation at round 3 would have ended it four rounds earlier, at the cost of
two spec-facing defects (the F5 inference and P8) reaching the spec author.

**What I recommend (§8).** Adopt three things together — now, as owner instructions
and author practice, and in writing at the pause's retrospective:

1. **Route by reach** (Option A) — your terminating test becomes the standing
   default for every SEV 2 or SEV 3 finding on an upstream document. The author
   must apply it and name the consumer in every fix-or-defer recommendation.
2. **Shrink the account** (Option C) — a repair's ledger row records facts a
   command can regenerate and nothing that ages: the ruling, the commit, the
   sections touched, the named places it relies on. No counts, no "all", no
   narrative diagnosis, no prose about what was checked. That material goes to the
   memory store, which no review round reads.
3. **Lock on the reviewer's word** (Option B) — when the reviewer recommends lock
   and no SEV 1 or SEV 2 remains, the default is lock; whatever Option A says still
   reaches the spec is fixed in the same pass, and nothing else is.

Do not: ban the reviewer from reporting SEV 3s (no finding it raised was refuted in
seven rounds), build a checker for the record (the pause forbids it and the project's own
history says checkers breed their own review loops), or rely on "be more careful"
(the author ran self-checks in rounds 5 and 6 and the defects were in the
self-check reports).

---

## 1. What this document is, and how it was built

**What it answers.** The five questions in the owner's commission
(`prompts/fable/START_F9A_LOOP_ANALYSIS.md`, gitignored): whether the shift in
finding provenance is real and what drives it (§3); whether "rule not followed" and
"state drift" are one problem or two (§4); why a loaded rule did not bind (§5); what
would have ended the chain at round 3 or 4 (§6); and the honest cost (§7). §8 gives
options in the STRAT-D15 six-field form. §9 declares what this analysis did not
establish. §10 is the claim ledger, and Appendix A carries every command.

**The evidence, enumerated.** Read in full, from disk, at `main` = `4dc0423`:

- the seven review files, `docs/reviews/f9a-brief-codex-review.md` and
  `-followup.md` through `-followup6.md` (1,922 lines);
- the repair ledger, `docs/reviews/f9a-brief-repair-dispositions.md`, Rounds 1–7
  and both addenda (662 lines; the append-only prefixes at `de0736c`, `35fcf5a` and
  `980d90a` re-verified byte-exact on `main`, Appendix A.9);
- the brief's §0 and §11 and its heading structure;
- the seven review commissions and the round-5 hand-off prompt under `prompts/`
  (gitignored, machine-local);
- the eight MemPalace drawers the commission names by ID, the lock-ruling drawer
  they point to, the `[STATE]` version-history drawer, the four earlier
  review-round drawers, six `practice`-wing rules, and the `claude-code` diary for
  2026-09-10;
- the git history of `feature/f9a-brief` (19 commits, `0bfeb6c`..`123ccfe`) —
  timestamps, per-commit line counts, and `git blame` at each reviewed head;
- the retained `[STATE]` snapshots and gate logs in the previous session's
  scratchpad.

**What was deliberately not read.** Astra's parallel analysis, which appeared as an
untracked file in this checkout while this document was being written. It was not
opened.

**Method for the central claim.** Each finding's cited lines were blamed at the
head the reviewer reviewed, so "who wrote the defective sentence" is a measurement
(Appendix A.4), not a recollection. The prior author's cause classification was not
consumed; §4 re-derives it from a different, git-decidable cut.

---

## 2. The chain, measured

### 2.1 Timeline

| Step | Commit    | Time (AEST) | Gap    | What landed                                                                |
| ---- | --------- | ----------- | ------ | -------------------------------------------------------------------------- |
| —    | `0bfeb6c` | 09-08 13:40 | —      | brief, first commit                                                        |
| —    | `5edc997` | 09-08 15:18 | 1.6 h  | owner's four rulings applied to the brief                                  |
| —    | `00b9abf` | 09-08 15:32 | 0.2 h  | reviewer-seat correction; ready for review                                 |
| R1   | `926c0a8` | 09-09 02:09 | 10.6 h | review 1: BLOCKED-ON, P1–P5                                                |
| fix  | `c0c0125` | 09-09 02:22 | 0.2 h  | all five repaired; Round 1 ledger                                          |
| R2   | `a27df25` | 09-09 08:11 | 5.8 h  | review 2: P3, P5 partly resolved; P6 new                                   |
| fix  | `489815c` | 09-09 11:06 | 2.9 h  | P3, P5, P6 repaired; Round 2                                               |
| R3   | `fda8059` | 09-09 12:01 | 0.9 h  | review 3: P3 remains; reviewer recommends lock (1st)                       |
| fix  | `0a771ab` | 09-09 13:33 | 1.5 h  | derivability claim deleted; Round 3                                        |
| R4   | `c81b34b` | 09-09 13:59 | 0.4 h  | review 4: P3 SEV 3 remains; lock recommended (2nd)                         |
| fix  | `34eaf8e` | 09-09 14:21 | 0.4 h  | dated note; owner-directed full blast-radius sweep; Round 4                |
| fix  | `b608a52` | 09-09 14:34 | 0.2 h  | owner asked "did you self-check?"; two more §11 members; addendum          |
| R5   | `de0736c` | 09-09 14:57 | 0.4 h  | review 5: P7, P8, P9 new; lock recommended (3rd)                           |
| fix  | `35fcf5a` | 09-10 00:59 | 10.0 h | P7, P8 repaired (fresh session from a hand-off); Round 5                   |
| R6   | `23c91c7` | 09-10 01:28 | 0.5 h  | review 6: P10–P14 new, all in round-5 repair prose; lock recommended (4th) |
| fix  | `980d90a` | 09-10 03:16 | 1.8 h  | P10 repaired; P11–P14 corrected; Round 6                                   |
| fix  | `b39a6cf` | 09-10 03:44 | 0.5 h  | owner-directed self-review: S1–S4; Round 6 addendum                        |
| R7   | `67099d1` | 09-10 08:19 | 4.6 h  | review 7: P12 partly; P15–P17 new; lock recommended (5th)                  |
| —    | `123ccfe` | 09-10 08:34 | 0.2 h  | owner's terminating test; four DEFERRED; Round 7                           |
| —    | `4dc0423` | 09-10 09:13 | 0.7 h  | PR #162 merged                                                             |

Commit timestamps measure when work was recorded, not effort. Two gaps (10.6 h and
10.0 h) span overnight breaks. Command: Appendix A.1.

### 2.2 Round-by-round shape

| Round | Live findings                      | Severity      | Reviewer's recommendation           | Author's recommendation      | Owner's ruling                 |
| ----- | ---------------------------------- | ------------- | ----------------------------------- | ---------------------------- | ------------------------------ |
| 1     | P1, P2, P3, P4, P5                 | 1, 2, 2, 3, 3 | fix P1–P3 now; P4, P5 later         | fix all now                  | fix all now                    |
| 2     | P3, P5 (partial); P6               | 2, 3, 3       | fix P3, P5 now; P6 later            | fix all now                  | fix all now                    |
| 3     | P3 (partial)                       | 2             | accept residual; lock               | delete the claim             | delete                         |
| 4     | P3 (partial)                       | 3             | accept residual; lock               | dated note                   | note, plus a full sweep        |
| 5     | P7, P8, P9                         | 3, 3, 3       | accept all; lock                    | accept, then reversed to fix | fix all three                  |
| 6     | P10–P14                            | 3 ×5          | fix all five, then lock             | fix                          | fix all five (P10 by deletion) |
| —     | S1–S4 (owner-directed self-review) | 3 ×4          | —                                   | —                            | fix                            |
| 7     | P12 (partial), P15, P16, P17       | 3 ×4          | lock; another round unlikely to pay | defer on the owner's test    | DEFERRED, all four             |

The reviewer's recommendation was overridden in five of the seven rounds, on eight
Ref-rulings (R1 P4, P5; R2 P6; R3
P3; R4 P3; R5 P7, P8, P9). Re-measured by parsing the ledger rows (Appendix A.6); it
agrees with the reviewer's own enumeration in review 7.

### 2.3 How the record grew

Lines the repair commits added to the ledger, against lines they touched in the
brief (added plus deleted; Appendix A.3):

| Repair    | Round | Brief lines touched | Ledger lines added | Ledger : brief |
| --------- | ----- | ------------------- | ------------------ | -------------- |
| `c0c0125` | 1     | 104                 | 60                 | 0.6            |
| `489815c` | 2     | 140                 | 60                 | 0.4            |
| `0a771ab` | 3     | 51                  | 58                 | 1.1            |
| `34eaf8e` | 4     | 37                  | 71                 | 1.9            |
| `b608a52` | 4     | 18                  | 41                 | 2.3            |
| `35fcf5a` | 5     | 60                  | 128                | 2.1            |
| `980d90a` | 6     | 8                   | 97                 | 12.1           |
| `b39a6cf` | 6     | 18                  | 77                 | 4.3            |
| `123ccfe` | 7     | 0                   | 70                 | —              |

The ledger ended at 662 lines and 102,430 bytes; the brief at 784 lines. From round
3 onward every repair wrote more ledger than brief; from round 6 the ratio was an
order of magnitude.

### 2.4 What each finding was, in one line each

The reviewer's own plain-English lines, from the Owner Summary Tables of the seven
reviews. Refs S1–S4 come from the author's owner-directed self-review.

| Ref | Plain English                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------- |
| P1  | The brief requires tests of already-correct behaviour to fail before the change.                           |
| P2  | The explanation of the minimum result makes agreed work and accurate warnings sound optional.              |
| P3  | The brief overstates what the saved add-on inventory can prove (four successive forms, then deleted).      |
| P4  | The brief says an existing check is used only in the card picker, but placed cards use it too.             |
| P5  | The decision record promises the original options for four questions, but does not preserve one that way.  |
| P6  | Four repair records say they have no upstream dependencies because those dependencies were not changed.    |
| P7  | Two passages still say every measurement happened on September 8, while the correction says otherwise.     |
| P8  | The summaries count saving an exported file as sending its contents to Home Assistant.                     |
| P9  | The current handoff labels its lessons as three, then lists four.                                          |
| P10 | The verification summary calls the same section both changed and unchanged.                                |
| P11 | A heading says the repair found a fourth passage, while its account identifies three.                      |
| P12 | The history attributes every recent finding to repairs, although one was already in the original brief.    |
| P13 | The explanation of how review can end omits the owner's existing option to defer a finding.                |
| P14 | The gate account omits a successful run visible in the retained repair-session logs.                       |
| P15 | The self-check says the section uses no ranges, although its own claims use ranges.                        |
| P16 | The addendum calls every check a failing-to-passing proof, although two measurements do not test that.     |
| P17 | The new account calls an older counting discrepancy a result of this session and overlooks a prior review. |
| S1  | "Three times ruled against the reviewer" was an undercount inherited from `[STATE]`.                       |
| S2  | Two locator hit-counts in the round-5 self-check do not match the committed brief.                         |
| S3  | A §11 note said which sections moved is "stated once" while the row stated it twice.                       |
| S4  | One of two hand-written restatements of a command's output survived the ruling to delete them.             |

---

## 3. Question 1 — is the provenance shift real, and what drives it?

### 3.1 Measured: who wrote each defective sentence

`git blame` at the head each review examined, over the lines each review cites
(Appendix A.4). "Pre-review" means the three commits before review 1.

| Ref | Surface                                | Written by                                               | Kind of text       |
| --- | -------------------------------------- | -------------------------------------------------------- | ------------------ |
| P1  | brief §8                               | pre-review (`0bfeb6c`)                                   | spec-consumed      |
| P2  | brief §9.3                             | pre-review (`0bfeb6c`)                                   | spec-consumed      |
| P3  | brief F5, §6, §9.2                     | pre-review; then repairs `c0c0125`, `489815c`, `0a771ab` | spec-consumed      |
| P4  | brief F7                               | pre-review (`0bfeb6c`)                                   | spec-consumed      |
| P5  | brief §9, §11; ledger R1               | pre-review (`5edc997`); then repair `c0c0125`            | brief-about-itself |
| P6  | ledger Round 1                         | repair `c0c0125`                                         | ledger             |
| P7  | brief §0, §4 preamble                  | pre-review (`0bfeb6c`)                                   | brief-about-itself |
| P8  | brief F4 lead-in, header, ⭐ summary   | pre-review (`0bfeb6c`)                                   | spec-consumed      |
| P9  | `[STATE]` drawer                       | author, record maintenance                               | external record    |
| P10 | brief §11                              | repair `35fcf5a`                                         | brief-about-itself |
| P11 | ledger Round 5                         | repair `35fcf5a`                                         | ledger             |
| P12 | ledger Round 5; Round 6                | repairs `35fcf5a`, `980d90a`                             | ledger             |
| P13 | ledger Round 5                         | repair `35fcf5a`                                         | ledger             |
| P14 | ledger Round 5 self-check              | repair `35fcf5a`                                         | ledger             |
| P15 | ledger Round 6 self-check              | repair `980d90a`                                         | ledger             |
| P16 | ledger Round 6 addendum                | repair `b39a6cf`                                         | ledger             |
| P17 | ledger Round 6 addendum                | repair `b39a6cf`                                         | ledger             |
| S1  | ledger Round 5 (figure from `[STATE]`) | repair `35fcf5a`                                         | ledger             |
| S2  | ledger Round 5 self-check              | repair `35fcf5a`                                         | ledger             |
| S3  | brief §11 note                         | repair `980d90a`                                         | brief-about-itself |
| S4  | brief §11 row                          | repair `35fcf5a`                                         | brief-about-itself |

Tally, by kind of text (21 Refs):

| Kind of text                                             | Refs                                          | Count |
| -------------------------------------------------------- | --------------------------------------------- | ----- |
| Brief, sections the spec is written from                 | P1, P2, P3, P4, P8                            | 5     |
| Brief, text about itself (§0 provenance, §9 record, §11) | P5, P7, P10, S3, S4                           | 5     |
| The repair ledger                                        | P6, P11, P12, P13, P14, P15, P16, P17, S1, S2 | 10    |
| An external record (`[STATE]`)                           | P9                                            | 1     |

Tally, by who wrote it: eight Refs were first reported in pre-review text (P1, P2,
P3, P4, P5, P7, P8; P9 is record maintenance), thirteen Refs were entirely
repair-written (P6, P10–P17, S1–S4), and two of the first eight (P3, P5) had later
forms written by repairs. Round 5 was the last round to report a defect in
pre-review text.

### 3.2 The shift is real, but it began at round 2, not round 5

The prior analysis says rounds 1–4 found defects in the original brief and rounds 5–7
in the author's repair and record prose. The blame table says something more exact:

- **Round 2** already reported three findings, each with at least one defective
  sentence written by the round-1 repair (P3's "installed through HACS", P5's "preserved
  unedited", and P6's "Upstream: none").
- **Round 3's** only finding was in the round-2 repair. **Round 4's** finding was
  half original text (the §9.2 recommendation) and half round-3 repair text ("A
  remains the smallest of the three options").
- **Round 5** was the exception: all three findings were in pre-review text or a
  memory drawer. This is the round the prior author's round-5 note misdescribed as
  "all in the author's own repairs" — which became finding P12.
- **Rounds 6 and 7** found nothing outside text written by the previous repair
  commits.

So two streams ran in parallel from round 2. The original brief's defect stream
dried up at round 5. The repair-prose stream did not, and by round 6 it was the only
stream. The provenance shift is the second stream outliving the first.

### 3.3 What drives it — the account is longer than the fix, and held to the same bar

Four measured facts explain why repairing a document produced more findings than the
document had.

1. **Each repair is obliged to produce an account, and the account is where the
   claims are.** Under `OPERATING_AGREEMENT.md` §3.4 every repair carries a ledger
   row with a blast-radius statement (upstream reliances, downstream consumers); the
   commissions and the hand-off additionally asked the author to publish self-check
   results and "state plainly which of these you ran and what each found". The
   ledger's seven round sections contain 1,038 tokens of the kind the claims rule
   fires on — "only", "all", "every", "none", ordinals and cardinals — against 757 in
   the whole brief (Appendix A.5; a count of tokens, not of true claims).
2. **The account grew faster than the fix shrank.** §2.3: from round 3 onward every
   repair added more ledger than it touched brief. A round-6 repair of eight brief
   lines came with 97 ledger lines.
3. **The account is reviewed at the brief's standard.** The scoped follow-up covers
   "the repair diff plus the declared radius" (§3.4), and the ledger is in the repair
   diff. The review template requires reporting full signal at every severity. The
   reviewer did exactly that, and none of its ledger findings was refuted.
4. **Some account claims are false by construction.** A count of a growing set, a
   hit-count of a command over a file that will be edited again, a "first/second/
   third time" — these go false at the next scheduled event, which the process
   guarantees will occur. The practice rule that names this
   (`drawer_practice_review_41e379f2e616eba581924b07`) was cited in the ledger while
   the ledger was committing new instances of it (S1, S2).

The mechanism, stated once: **the process asks the author to write claims faster
than any author can verify them, then reviews those claims as if they were the
product.** The reviewer is not the driver; it recommended stopping five times.

---

## 4. Question 2 — are "rule not followed" and "state drift" the same problem?

### 4.1 The prior cut, and why it was re-derived

The prior analysis sorts 18 findings into A "rule not followed" (13), B "state or
version misalignment" (4: P2, P7, P9, S2) and C "both" (1: S1). "Rule not followed"
is a judgement about the author's process, which the record cannot decide. A cut the
record can decide is: **was the sentence false against the repository at the commit
that wrote it, or was it true then and made false later?** That is answerable with
`git show` at the writing commit.

### 4.2 The re-derived cut

| Class                                                    | Refs                                                                                      | Count |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----- |
| **(i) False at the commit that wrote it**                | P1, P3, P4, P5, P6, P8, P10, P11, P12, P13, P14, P15, P16, P17, S1, S3, and S2 (see note) | 17    |
| **(ii) True when written; a fact then changed**          | P7 (facts re-measured), P9 (a list grew)                                                  | 2     |
| **(iii) True when written; a ruling then superseded it** | P2 (§9.3 proposal predates the option-A ruling), S4 (restatement predates the P10 ruling) | 2     |

Note on S2: the review of round 7 measured the two locator counts at 33/13 on all
four heads it examined, including the one that wrote "30/12", so against the committed tree the figures
were false when committed. Whether they were true against an unretained draft is
unprovable, as that review says. Note on S1: the ledger sentence "third time in five
rounds" was false when committed; the figure it inherited from `[STATE]` had been
true at round 3. Note on P3: its round-4 component "the cost is genuinely small
because F5 measured…" was true when written and was falsified by the round-3
deletion; the Ref as a whole is class (i) because its first three forms and the
round-3 qualification's ranking were each wrong when written.

### 4.3 What the cut changes

The prior B class had four members; on this cut only P7 and P9 are cleanly "true
then falsified by a fact", and P2 and S4 form a third class the prior cut folded into
A or B. The three classes need three different things:

- **Class (i)** needs a check between writing and committing. Nine of its seventeen
  members are local self-contradictions a fresh read of the finished file could
  catch (P3's ranking, P5's "preserved unedited" against its own diff, P6's row that
  names a reliance while declaring none, P8's summary against its own table, P10,
  P11, P15, S1's rows, S3); the other eight
  need a population outside the file — code, git history, the Operating Agreement,
  gate logs, another review file (P1, P4, P12, P13, P14, P16, P17, S2). That split
  is a judgement per Ref (§10, claim L9).
- **Class (ii)** needs the sentence not to be written, or to be pinned to a named
  head. It cannot be fixed by checking harder at writing time, because it was true at
  writing time.
- **Class (iii)** needs a sweep when a ruling lands: what text predates this ruling
  and now contradicts it? Neither the claims rule nor a reading pass asks that.

So: not the same problem, and the prior A/B cut mislabels the membership. But the
three classes share one property that matters more than the cut: **sixteen of the
21 are in prose that exists to describe the brief or the process, which nothing
downstream consumes except the next review round.** Reducing that prose reduces all three classes at once, which is
why §8's Option C is recommended alongside Option A.

---

## 5. Question 3 — why did a rule that was in front of the author fail to bind?

### 5.1 Availability is established

The claims rule (`drawer_practice_claims_1fcfbf72537d81a3cdb9bc69`) was quoted
verbatim in the round-1 commission, referenced in every follow-up commission via the
template's §0, listed under "Disciplines" in the round-5 hand-off, and cited by the
ledger itself in rounds 3 and 6 (round 5 cites its sibling on self-invalidating
counts). The author's round-5 and round-6 sections each
contain an explicit self-check table that names the rule's subject. This was not a
rule the author had not seen.

### 5.2 Four mechanisms the record supports

**M1 — The reporting layer is unverified prose.** A self-check produces a report;
the report is written last and checked by nothing. Of the 21 findings, ten sit in
sentences whose job is to say what was checked, measured or edited — P5's "preserved
unedited", P7's "every fact measured on…", P10's summary of a command's output, P14's
gate-run count, P15's "no range expression", P16's "every clearance is a measured
before/after change", P17's account of S2, S2's hit-counts, S3's "stated once", S4's
restatement of output. Round 5's self-check table alone contains two committed
findings (P14 in row 7, S2 in row 1) and reported a check of the very sentence P10
lives in ("matching the prose"). Round 6's self-check caught one of its own false
claims before commit and shipped another (P15) in a neighbouring row. This is the
strongest pattern in the chain: **the sentence most likely to be wrong is the one
that says the checking was done.**

**M2 — The rule's operational trigger is lexical; the defect class is not.** The
rule says "only/every/all/none/N". Round 6's self-check enumerated exactly those
tokens and then asserted "no range expression is used in this section" while the
section used four ranges (P15). P8 was an enumeration ("sites 1, 2, 3 and 5"), P10 a
range, S3 an ordinal ("once"), P11 an ordinal ("fourth"). A token sweep keyed on the
first instance's spelling does not see the class; the `practice` wing already says so
(`drawer_practice_review_ba6eb45cbbd7c581a68b6df0`) and it happened anyway.

**M3 — The population the claim quantifies over is outside the file being checked.**
P12 needed git history; P13 the Operating Agreement; P14 four log files; P17 another
review file; S2 a re-run. A grep over the
document cannot reach any of them. The rule says "publish the command that
regenerates the list"; for these claims the list is not in the document, and the
author's instrument was the document. Again a filed rule
(`drawer_practice_verification_c671da8b6779b5eb0d79fa9a`: a changed-file list is a
floor, not the population) describes this exactly.

**M4 — Volume times a low miss rate is still greater than one per round.** The two
documents hold roughly 1,800 rule-triggering tokens (Appendix A.5). Twenty-one
findings over that population is a miss rate on the order of one per cent. That is
not a rule being ignored; it is a rule being applied hundreds of times by a language
model and missing occasionally, on a population the process enlarged every round.
The rule's own text anticipates this — "if enumerating is too expensive, the claim is
too expensive: omit it" — and the process pushed the other way, asking for more
claims each round (a full sweep table, a published self-check, a per-detector
before/after proof).

### 5.3 Two explanations the record does not support

**"The round-5 self-check never swept the record."** The reviewer refused this and
the refusal stands: Round 5's check 3 claims to have compared counts "in the brief
and the dispositions", so a check was reported. The record shows something narrower
and provable: at least one figure in that self-check (S2's 30/12) does not match the
committed tree, so **the report was not produced from the committed artifact** —
either the check ran on an earlier draft, or the figure was transcribed wrongly.
Which, the record cannot say.

**"Repairs were too fast."** The two fastest repairs (13 and 22 minutes after the
review commit) produced three and zero next-round findings in their own prose
respectively; the slowest (10 hours, a fresh session) produced eight (P10–P14, S1,
S2, S4). Cadence does not explain this chain. What distinguishes the round-5 repair
is that it wrote the largest account (128 ledger lines) and started from a hand-off
prompt that had compressed a two-range finding into one anchor and marked the
enumeration "already done and verified".

### 5.4 The answer to the question

The rule did not fail to bind. It bound at the rate such a rule can bind, on a
population the process made large and kept enlarging, with its outputs recorded in a
layer nothing verified, using an instrument that could not see much of the
population.
The fix is not a stronger rule. It is fewer claims, a smaller consumed surface, and a
stopping rule that does not treat every true finding as a reason to write more.

---

## 6. Question 4 — what would have ended this at round 3 or 4?

### 6.1 The decision points, replayed under four stopping rules

Each column applies one rule from round 1 onward and reads off the round at which
the brief locks and which spec-facing defects (the five in §3.1) would still be in
the brief at lock. "Spec-facing" here means the sentence is in a section the spec is
written from and a spec author would carry it forward.

| Stopping rule                                                                                   | Locks after  | Spec-facing defects left at lock                     | Findings never raised                                                            |
| ----------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| **What happened** (fix everything the owner elected)                                            | round 7      | none                                                 | none                                                                             |
| **(a) Follow the reviewer's recommendation** (accept residual and lock when it says so)         | round 3      | P3's F5 inference (SEV 2, feeds D-2); P8 never found | P7–P17, S1–S4 (P8 stays latent)                                                  |
| **(b) The owner's test from round 1** (fix only what the spec would inherit; defer the rest)    | round 4      | P8 never found (it surfaced in round 5)              | P5, P6 deferred; P7–P17, S1–S4 never raised                                      |
| **(c) The owner's test from round 5** (what happened, with the test applied two rounds earlier) | round 6      | none (P8 fixed in round 5)                           | P15–P17 never raised; P11–P14 deferred; S1–S4 only if the self-review still runs |
| **(d) Test plus a minimal ledger** (Option A with Option C: rows carry no counts or narrative)  | round 5 or 6 | none                                                 | P6, P11–P17, S1, S2 have no sentence to live in                                  |

Reading the table honestly:

- **Rule (a)** ends it earliest and cheapest, and it is what the reviewer advised.
  Its cost is two spec-facing defects reaching the spec author: the F5 derivability
  inference that §6 D-2 depends on, and the ⭐ F4 summary the spec author carries
  forward (P8). Both would then rest on the spec's own review to catch — the same
  reviewer, reading the brief as its input. Neither is a product defect; both are
  wrong sentences a spec author would read as code facts.
- **Rule (b)** would have kept the F5 fix (the author was right that it reaches the
  spec) and ended at round 4, but P8 was only found in round 5 by a round that (b)
  would not have run. So (b) trades one round-5 discovery for three rounds.
- **Rule (c)** is the counterfactual closest to what the owner actually did, moved
  earlier. It saves one round and the owner-directed self-review, and loses nothing
  spec-facing.
- **Rule (d)** is the only one that removes the sentences the round-6 and round-7
  findings lived in, rather than deferring findings about them.

### 6.2 What the owner did, and what the process did with it

Four owner interventions shaped rounds 4–7: asking whether round 4's finding was a
regression and directing a full blast-radius sweep (which added the ten-member sweep
table round 5 was then commissioned to attack); asking whether the author had self-checked
(which found two real §11 members and produced the round-4 addendum); asking whether
"accept and lock" was recommended on the merits (which reversed the author and
produced round 6); and directing a full self-review (which found S1–S4 and produced
the addendum where P16 and P17 lived). Each was a sound question. The process
converted each answer into a repair, each repair into an account, and each account
into the next round's findings. The terminating test is the first intervention that
changed what the process does with a finding rather than adding a check.

### 6.3 Two existing rules that could have stopped it and were not invoked

- **The same-seam rule** (`OPERATING_AGREEMENT.md` §3.4, SEV-CAL-2 ruling 7): when
  a follow-up finds a defect in the same seam as the one whose repair it reviews, the
  author puts a continue / declare-residual / park brief to the owner. Round 6's
  ledger states in its own diagnosis that "each finding is an instance of a class
  this very round was repairing". The brief put to the owner was fix-or-defer per
  Ref, not continue-or-park for the seam. Judgement, not measurement: the trigger
  condition was arguably met at round 6.
- **The template's SEV 3 default**: "recorded; no round-trip is owed. The owner may
  still elect a fix." Every round from 4 onward was SEV 3 only. The default was not
  taken because the author recommended fixing, on the ground that each fix was cheap.
  The measured cost of a "cheap" SEV 3 fix in this chain was one review round plus,
  on average, about three new findings in the account that accompanied it (17 live
  findings across six follow-up rounds).

---

## 7. Question 5 — the honest cost, and what rounds 5–7 bought

### 7.1 Cost

| Measure                                                   | Value                           | Source          |
| --------------------------------------------------------- | ------------------------------- | --------------- |
| Review rounds                                             | 7                               | review files    |
| Wall-clock, ready-for-review to "ready to lock" recorded  | 41.0 h                          | A.1             |
| Wall-clock, review 1 to "ready to lock"                   | 30.4 h                          | A.1             |
| Wall-clock, rounds 5–7 (review 5 to "ready to lock")      | 17.6 h                          | A.1             |
| Commits on the branch                                     | 19 (12 author, 7 reviewer)      | A.2             |
| Review text written by the reviewer                       | 1,922 lines, seven files        | `wc -l`         |
| Ledger written by the author                              | 662 lines, 102,430 bytes        | `wc`            |
| Distinct findings                                         | 21 (P1–P17, S1–S4)              | reviews, ledger |
| Findings in spec-consumed text                            | 5                               | §3.1            |
| `[STATE]` drawer size across the chain's bumps, v222→v232 | 18,353 → 19,446 (v227) → 16,609 | A.8             |

The `[STATE]` series is re-measured from the retained snapshots of the previous
session; the "20,101 over the ceiling" draft the prior author reported is not
retained and is diary-reported only. Four of the six bumps from v222 to v228 added
net characters, against a rule that says a bump retires at least what it adds; the
drawer shrank by 2,837 characters from its v227 peak to v232, mostly in the v229
retirement pass and the post-merge v232 bump.

### 7.2 What each phase bought

- **Rounds 1–4** bought four substantive corrections to the brief — P1 (an
  instruction that would have made the spec author manufacture failing tests), P2
  (an acceptance bar that read as optional), P3 (a derivability claim that D-2 rested
  on, rewritten three times and then deleted), P4 (a wrong code fact) — plus the
  brief's record-completeness claim (P5) and the ledger's first radius correction
  (P6). Each of those rounds found something a spec
  author would otherwise have inherited.
- **Round 5** bought P8 — the starred sentence titled "the distinction the spec
  needs", which contradicted the table above it — plus two record corrections.
- **Rounds 6 and 7**, with the owner-directed self-review between them, raised
  thirteen findings: nine were corrected and four remain DEFERRED and open. No
  spec-consumed sentence changed after round 5's repair; the only brief edits after
  it were in §11. They also bought the owner's
  terminating test and the evidence base for this document and Astra's.

That is the honest exchange: rounds 5–7 cost 17.6 hours of wall-clock and three
review rounds and produced one spec-facing correction (P8).

---

## 8. Options for the owner

Each option is in the STRAT-D15 six-field form. Options A, B, C and E can be adopted
now without breaching the pause: A and B are owner rulings recorded as records; C and
E are author practice under the existing rule text. Codifying any of them into
`OPERATING_AGREEMENT.md` or the review template waits for the pause's retrospective.

### Option A — Route by reach: the terminating test as the standing default

**What this protects, in product terms.** The next document in the chain (the spec,
then the implementation) inherits only sentences that were checked, and the owner's
time goes to defects that can travel.

**What is going wrong, plainly.** Every true finding has been treated as a reason to
repair, and every repair triggers a round. Findings in the paperwork cost as much as
findings in the product document.

**Is the product affected?** No. Evidence: none of the 21 findings is in product
code or tests; five are in text the spec is written from and all five were fixed.

**Options with costs.**
_A1_: the owner rules, now, that for any SEV 2 or SEV 3 finding on an upstream
document the author's fix-or-defer recommendation must state where the sentence
lives, who consumes it, and whether the next downstream artifact would inherit the
defect; findings that fail the test default to DEFERRED on the cleanup sweep. Cost: a
decision drawer and a line in every commission and hand-off; SEV 3 record defects
persist until the sweep. _A2_: the same, codified in §3.4 at the retrospective. Cost:
one governance PR with its own review round.

**Recommendation and why.** A1 now, A2 at the retrospective. It is the one mechanism
in this chain that terminated it, it was applied by measurement (grep the
construction in the consumed artifact; name the consumer), and it costs nothing to
apply. The risk is misjudging reach; the mitigation is that the test is applied in
writing, per Ref, where the reviewer can contest it in the next round it does trigger.

**What happens if you do nothing.** The next upstream review runs under the SEV 3
"owner may elect a fix" default with the author recommending fixes because they are
cheap, and the chain's measured rate — about three new account findings per
follow-up round — applies.

### Option B — Lock on the reviewer's word

**What this protects.** The reviewer's proportionality judgement, which was right
five times here, becomes the default rather than advice the author argues against.

**What is going wrong, plainly.** The reviewer said "lock" from round 3; the author
recommended continuing on eight Ref-rulings and the owner took the author's
recommendation, or more, each time. The reviewer's stop signal had no weight in the process.

**Is the product affected?** No; same evidence as Option A.

**Options with costs.**
_B1_: when the reviewer recommends lock and no SEV 1 or SEV 2 remains, the owner
locks; SEV 3s go to the cleanup sweep, except any that Option A says reach the spec,
which are fixed in one pass with one scoped follow-up. Cost: spec-facing SEV 3s found
later than round N are caught by the spec's review instead. _B2_: lock on the
reviewer's recommendation unconditionally. Cost: in this chain, P8 reaches the spec.

**Recommendation and why.** B1, combined with A. B alone would have locked at round
3 with two spec-facing defects; A alone still allows rounds on spec-facing SEV 3s
indefinitely. Together they bound the rounds and keep the fixes that matter.

**What happens if you do nothing.** The stop decision remains an argument between the
author (who wants the loop to end and also wants to be seen to fix things) and the
owner, with the reviewer's judgement as a footnote. Round 5's reversal shows how that
goes.

### Option C — Shrink what a repair must write

**What this protects.** The repair ledger stops being a second product document that
breeds its own defects, and stays what §3.4 needs: a record of what was ruled and
what changed.

**What is going wrong, plainly.** Ten of 21 findings were in the ledger and five more
in the brief's text about itself. Those fifteen sentences exist because the process
asked for them, and no downstream artifact reads them.

**Is the product affected?** No.

**Options with costs.**
_C1_ (author practice, now, within the existing rule): a ledger row carries the Ref,
the owner's ruling, the disposition, the commit, the sections touched, and the named
upstream and downstream locations as a list — no counts, no "all/every/none", no
claim of completeness, no narrative diagnosis, no self-check prose. Self-check
evidence is a command plus captured output or a pointer to a retained log. Root-cause
narrative goes to a memory drawer or diary, which no follow-up reviews. Cost: lessons
live in MemPalace rather than the repo; a reader without MemPalace loses the
narrative (the reviewer's own evidence stays in the review files). _C2_: codify at
the retrospective as guidance in §3.4 and the template. Cost: one governance PR.

**Recommendation and why.** C1 now, C2 at the retrospective. In this chain, ten
findings would have had no sentence to live in (§6.1, rule d). It also removes class
(ii) and most of class (iii) from §4 by construction, since a list of named locations
has no count to go stale.

**What happens if you do nothing.** Each future repair writes an account at the
measured ratio — one to twelve ledger lines per brief line — and the account is
reviewed.

### Option D — Change nothing until the pause's retrospective

**What this protects.** The pause's own logic: test the rules on product work before
changing them.

**What is going wrong, plainly.** The pause's trigger is three merged product PRs; a
docs-only brief does not count. The next upstream artifacts (the F9a spec, then two
slices S02.1 and S02.2, each with a brief and a spec) would run under the current
dynamics before any retrospective.

**Is the product affected?** No.

**Options with costs.** _D1_: wait. Cost: the owner has already paused the F9a spec
on this analysis's outcome, so D1 also means reversing that ruling. _D2_: wait, but
apply the terminating test by ad hoc owner ruling each time. Cost: the same as A1
without the record that makes it consistent.

**Recommendation and why.** Not recommended. A1, B1 and C1 are all within the
pause's record and practice exemptions; declining them buys nothing the pause needs.

**What happens if you do nothing.** The next chain runs as this one did.

### Option E — Author discipline: freeze, then read, before every commit that carries claims

**What this protects.** The nine local self-contradictions in §4.3 — a heading that
disagrees with its list, a summary that contradicts its table, a claim about an edit
that contradicts the diff — are caught before a reviewer is paid to find them.

**What is going wrong, plainly.** Self-checks were run while editing continued
(§5.3), and their reports were themselves unchecked.

**Is the product affected?** No.

**Options with costs.** _E1_: the owner directs that, before any commit carrying
review dispositions, the author stops editing, takes the changed-file list, reads the
finished files fresh, and publishes each load-bearing claim with the quote that backs
it or the words NOT CHECKED — the existing `edit-freeze` and `reading-pass` practice.
Cost: minutes per commit. _E2_: nothing beyond the existing rules.

**Recommendation and why.** E1, as a companion to A and C, not instead of them. Its
ceiling is measured: it reaches about nine of the 21 findings and cannot reach the
ones whose population is outside the file. The practice's own record says it is not a
population mechanism (`drawer_practice_verification_32f4234a4c210a0ed91bafc3`).

**What happens if you do nothing.** Local contradictions keep reaching the reviewer,
and under Option A they are deferred rather than fixed, which is tolerable but
untidy.

### 8.1 The recommended package, and what not to do

**Adopt now, as records and practice:** A1 (route by reach), B1 (lock on the
reviewer's word, fixing only what A says reaches the spec), C1 (minimal ledger rows,
narrative to memory), E1 (freeze then read). **At the retrospective:** one governance
PR that writes A, B and C into §3.4 and the template's disposition guidance, reviewed
under §3.

**Do not:**

- **Ban or narrow SEV 3 reporting.** No finding the reviewer raised was refuted in
  seven rounds; the template's "report full signal" served the owner well. What must change
  is what the process does with a SEV 3, not whether it is heard.
- **Build a checker for the ledger.** The pause forbids it, and the project's own
  history is that checkers generate review loops of their own (PR #139: nine rounds;
  PR #154: eight).
- **Rely on carefulness.** The author ran published self-checks in rounds 5 and 6.
  The defects were in the reports of those checks.
- **Change the reviewer.** §3.3's deferential-streak trigger is for reviewers that
  find nothing; this one found something true every round and said stop five times.

### 8.2 Two side observations for the retrospective

- **The held-open "describe, don't prescribe" rule.** Seven rounds of evidence now
  exist and the risk did not materialise once; the round drawers record the reviewer
  separating finding, recommendation and owner decision in each round. The retrospective can close that
  question as "not needed" on this record.
- **The §3.4 / §3 collision** (the same reviewer clearing a repair that is its own
  prescribed remedy) is on record as an open structural hole
  (`drawer_havdm_decisions_6a7a86f1c8af85a3082e8a1c`). Nothing in this chain
  triggered it, because the owner chose the remedies; it stays open.

---

## 9. What this analysis did not establish

- **Effort.** Commit timestamps bound wall-clock; they do not measure the hours any
  agent or the owner spent. No session transcript was read.
- **Why any individual sentence was wrong.** §5's mechanisms are the ones the record
  supports; whether a given self-check ran on a draft or was transcribed wrongly is
  unrecoverable, as §5.3 says.
- **The token count is a count of containers.** Appendix A.5 counts words that
  trigger the claims rule, not claims; "no" in "no issue found" is counted. It bounds
  the population from above.
- **The "reading pass would catch it" column** in §4.3 is a per-Ref judgement, not a
  test; it was not run against the historical heads.
- **Astra's analysis** was not read. Nothing here anticipates it.
- **No product suite was run.** This is a docs-only analysis of a docs-only branch;
  the repository gate (`./tools/checks`) is reported in the commit that lands this
  file, and no e2e or integration suite is needed.
- **The `[STATE]` "20,101" figure** is diary-reported and not retained; the rest of
  the series is measured.

---

## 10. Claim ledger

MEASURED = observed from a command or a read this session; INFERRED = deduced from
measured facts; JUDGEMENT = the author's classification.

| #   | Claim                                                                                                             | Tag                                                               | Evidence                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| L1  | 19 commits, 12 author and 7 reviewer, on `691c8d1..123ccfe`                                                       | MEASURED                                                          | A.2                                                                                                     |
| L2  | 41.0 h from `00b9abf` to `123ccfe`; 30.4 h from `926c0a8`; 17.6 h from `de0736c`                                  | MEASURED                                                          | A.1                                                                                                     |
| L3  | 21 distinct Refs: P1–P17 in the reviews, S1–S4 in the ledger's Round 6 addendum                                   | MEASURED                                                          | review §1a tables; ledger lines 528–533                                                                 |
| L4  | The writer of each finding's cited lines is as in §3.1                                                            | MEASURED                                                          | A.4 (`git blame` at each reviewed head)                                                                 |
| L5  | Five findings are in spec-consumed sections; ten in the ledger; five in brief text about itself; one in `[STATE]` | JUDGEMENT on MEASURED locations                                   | §3.1 tally; "spec-consumed" is the author's classification                                              |
| L6  | Ledger lines added per repair and brief lines touched are as in §2.3                                              | MEASURED                                                          | A.3                                                                                                     |
| L7  | 1,038 rule-triggering tokens in the ledger's round sections; 757 in the brief                                     | MEASURED                                                          | A.5 (containers, not claims)                                                                            |
| L8  | Reviewer overridden in 5 rounds on 8 Ref-rulings                                                                  | MEASURED                                                          | A.6                                                                                                     |
| L9  | Nine of the class-(i) findings are local self-contradictions; eight need an external population                   | JUDGEMENT                                                         | §4.3, per Ref                                                                                           |
| L10 | The reviewer recommended lock in rounds 3, 4, 5, 6 and 7                                                          | MEASURED                                                          | review §5 text of `-followup2` through `-followup6`; A.7                                                |
| L11 | S2's 30/12 matches none of the four heads examined (33/13 at `35fcf5a`, `23c91c7`, `980d90a`, `b39a6cf`)          | MEASURED by the round-7 review; re-run this session for `35fcf5a` | A.10                                                                                                    |
| L12 | `[STATE]` sizes v222–v232 as in §7.1                                                                              | MEASURED                                                          | A.8                                                                                                     |
| L13 | The three append-only prefixes (46,322; 71,771; 89,704 bytes) are intact on `main`                                | MEASURED                                                          | A.9                                                                                                     |
| L14 | Rounds 6 and 7 found nothing outside text written by repair commits                                               | MEASURED                                                          | A.4 rows for P10–P17                                                                                    |
| L15 | Round 2 found three defects in round-1 repair text                                                                | MEASURED                                                          | A.4 rows P3r2a, P5r2a/b/c, P6a/b                                                                        |
| L16 | The counterfactual lock rounds in §6.1                                                                            | INFERRED                                                          | replay of §2.2 under each rule; the "never found" entries follow from which round surfaced each finding |
| L17 | About three new live findings per follow-up round                                                                 | MEASURED                                                          | 17 live findings in rounds 2–7 (§2.2) ÷ 6                                                               |

**Weakest claims.** L5 and L9 are classifications; a reader could draw the
"spec-consumed" line differently for P5 (§9 is read by the spec author for the
rulings, though its "options as put" completeness claim is not). L16's "never found"
entries assume the reviewer would not have found P8 without round 5's commission,
which pointed it at `[STATE]` item 11; the review says P8 surfaced while attacking
that item. L17 is an average over rounds of very different size.

---

## Appendix A — the commands

Run from the repository root at `main` = `4dc0423`.

**A.1 Timeline and gaps.**

```bash
git log --format='%h|%aI|%s' --reverse 691c8d1..4dc0423
python3 - <<'PY'
import subprocess, datetime as d
rows=[l.split('|',2) for l in subprocess.check_output(['git','log','--format=%h|%aI|%s','--reverse','691c8d1..4dc0423'],text=True).splitlines()]
t=lambda s:d.datetime.fromisoformat(s)
for (h,ts,s),(h2,ts2,_) in zip(rows,rows[1:]): print(h2, round((t(ts2)-t(ts)).total_seconds()/3600,2),'h')
PY
```

**A.2 Commits by kind.**

```bash
git rev-list --count 691c8d1..123ccfe
git log --format=%h 691c8d1..123ccfe -- docs/reviews/f9a-brief-codex-review*.md | wc -l
```

**A.3 Ledger lines added against brief lines touched, per repair.**

```bash
B=docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md; D=docs/reviews/f9a-brief-repair-dispositions.md
for c in c0c0125 489815c 0a771ab 34eaf8e b608a52 35fcf5a 980d90a b39a6cf 123ccfe; do
  echo "$c brief $(git show --numstat --format= $c -- $B | awk '{print $1"+"$2}') ledger $(git show --numstat --format= $c -- $D | awk '{print $1}')"; done
```

**A.4 Who wrote each finding's cited lines.** The line ranges are the ones the
reviews cite at the head each review examined.

```bash
B=docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md; D=docs/reviews/f9a-brief-repair-dispositions.md
blame(){ git blame -L "$4" --line-porcelain "$2" -- "$3" | grep -E '^[0-9a-f]{40} ' | cut -c1-7 | sort | uniq -c | sed "s/^/$1 /"; }
blame P1 00b9abf $B 447,450; blame P2 00b9abf $B 567,570; blame P3 00b9abf $B 277,285
blame P4 00b9abf $B 312,317; blame P5 00b9abf $B 465,469
blame P3r2a c0c0125 $B 284,288; blame P3r2b c0c0125 $B 563,563; blame P3r2c c0c0125 $B 570,574
blame P3r2d c0c0125 $B 407,409; blame P5r2a c0c0125 $B 500,506; blame P5r2b c0c0125 $B 603,605
blame P5r2c c0c0125 $D 37,37; blame P6a c0c0125 $D 36,36; blame P6b c0c0125 $D 38,40
blame P3r3 489815c $B 299,302; blame P3r4a 0a771ab $B 615,617; blame P3r4b 0a771ab $B 607,607
blame P7a b608a52 $B 62,65; blame P7b b608a52 $B 149,151; blame P8a b608a52 $B 235,238; blame P8b b608a52 $B 246,247
blame P10 35fcf5a $B 778,778; blame P11 35fcf5a $D 322,322; blame P12 35fcf5a $D 411,413
blame P13 35fcf5a $D 414,416; blame P14 35fcf5a $D 378,378; blame S2 35fcf5a $D 372,372
blame S1 980d90a $D 317,318; blame S3 980d90a $B 780,784; blame S4 980d90a $B 758,758
blame P12r7a b39a6cf $D 458,458; blame P12r7b b39a6cf $D 470,470; blame P12r7c b39a6cf $D 473,473
blame P12r7d b39a6cf $D 486,486; blame P15 b39a6cf $D 488,488; blame P16 b39a6cf $D 525,526
blame P17a b39a6cf $D 521,521; blame P17b b39a6cf $D 531,531; blame P17c b39a6cf $D 576,578
```

**A.5 Rule-triggering tokens (containers, not claims).**

```bash
python3 - <<'PY'
import re, subprocess
pat=re.compile(r"\b(only|all|every|each|none|no|nothing|never|always|both|one|two|three|four|five|six|seven|eight|nine|ten|once|twice|first|second|third|fourth|fifth|\d+)\b", re.I)
D=subprocess.check_output(['git','show','123ccfe:docs/reviews/f9a-brief-repair-dispositions.md'],text=True)
parts=re.split(r'^## (Round \d+[^\n]*)$', D, flags=re.M)
print('ledger', sum(len(pat.findall(parts[i+1])) for i in range(1,len(parts),2)))
B=subprocess.check_output(['git','show','123ccfe:docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md'],text=True)
print('brief', len(pat.findall(B)))
PY
```

**A.6 Reviewer overrides.** The reviewer's own enumeration from review 7, re-run.

```bash
python3 - <<'PY'
import re, subprocess
r, o = None, []
for line in subprocess.check_output(['git','show','123ccfe:docs/reviews/f9a-brief-repair-dispositions.md'],text=True).splitlines():
    m=re.match(r'## Round (\d+)', line)
    if m: r=int(m[1])
    if line.startswith('| P') and re.search(r'reviewer recommended (fix-later|accept-as-residual)', line): o.append((r, line.split('|')[1].strip()))
print(o, len({x for x,_ in o}), 'rounds', len(o), 'refs')
PY
```

**A.7 Lock recommendations and new-finding headings per review file.**

```bash
for f in docs/reviews/f9a-brief-codex-review*.md; do
  echo "$f lock-mentions=$(grep -ciE 'ready to lock|recommend.*lock|lock the brief' $f) new-findings=$(grep -c '^### P' $f)"; done
```

Read the §5 of each file to confirm the recommendation; the grep is a locator.

**A.8 `[STATE]` sizes from the retained snapshots** (machine-local; previous
session's scratchpad under `/tmp/claude-1000/`).

```bash
for f in /tmp/claude-1000/-home-micah-projects-HA-Visual-Dashboard-Maker/*/scratchpad/state_v*.txt; do
  python3 -c "import sys;print(len(open(sys.argv[1]).read()), sys.argv[1].split('/')[-1])" "$f"; done | sort -t_ -k2 | uniq
```

**A.9 Append-only prefixes on `main`.**

```bash
python3 - <<'PY'
import subprocess
D='docs/reviews/f9a-brief-repair-dispositions.md'
cur=subprocess.check_output(['git','show',f'4dc0423:{D}'])
for ref,size in (('de0736c',46322),('35fcf5a',71771),('980d90a',89704)):
    old=subprocess.check_output(['git','show',f'{ref}:{D}']); print(ref, len(old)==size and cur.startswith(old))
PY
```

**A.10 S2's counts at the committing head.**

```bash
git show 35fcf5a:docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md | grep -cE "2026-09-0[0-9]|September"
git show 35fcf5a:docs/features/F9A_EXPORT_CAPABILITY_PROFILE_BRIEF.md | grep -cE "measured|re-measur"
```

---

## Appendix B — MemPalace drawer candidates

The author's `havdm`-wing `[INVESTIGATION]` drawer for this analysis was refused by
the per-palace writer lease ("Peer MCP writer active") at filing time. Per the
standing rules it was not retried; it is staged, with this session's diary entry,
under `~/.mempalace/pending/` (machine-local) for a write-enabled session to file:
`2026-09-10-havdm-investigation-f9a-review-loop-analysis.md` and
`2026-09-10-havdm-diary-claude-code-f9a-loop-analysis.md`. One `practice`-wing
candidate is listed below and deliberately not filed: it is an observation from one
chain, and the wing's charter and the pause both say to wait for the owner's
reconciliation.

> [PATTERN candidate, `practice`] The sentence most likely to be wrong in a repair
> chain is the one that reports the checking: of 21 findings across seven review
> rounds on one HAVDM brief, ten sat in text whose function was to say what had
> been checked, measured or edited, and three sat in the rows of a published
> self-check table. A self-check's report is written last and verified by nothing;
> record checks as a command and its captured output, not as prose about the check.
