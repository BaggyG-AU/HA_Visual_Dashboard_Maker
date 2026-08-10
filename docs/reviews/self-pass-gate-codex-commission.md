Author: Claude Opus (claude-code)
Reviewer: OpenAI Codex
Owner gate: micah/BaggyG-AU

# Commission — the author self-pass gate, second attempt, rounds 1 to 4

This is a **tracked** commission. It exists because the first attempt at this
mechanism was withdrawn, and merge-blocker **M3** of that review
(`docs/reviews/self-pass-gate-adversarial-review-codex.md`, commit `c8678d2`)
was that the gate never read the commission at all — commissions lived in
`prompts/`, which `.gitignore` ignores wholesale, so the validator could only
check rows the author chose to supply.

`tests/support/authorLedger.ts` parses the **Commissioned checks** table below
and requires exactly one ledger row per ID in
`docs/reviews/self-pass-gate-author-ledger.md`.

## What round 1 changed about this document

Round 1 of the independent review (`docs/reviews/self-pass-gate-codex-review.md`,
commit `90cc492`) returned **CHANGES-REQUIRED**. The author had asked the
reviewer to attack this commission as an artifact in its own right; the answer
was **not "nothing missing"**. Three things follow from that, and all three are
done here rather than promised:

1. **The three compound rows are split.** `C02`, `C05` and `C06` each bundled
   two independently falsifiable questions despite this document's own claim
   that each row is one question. Each has been NARROWED to its first clause,
   and the second clause is a new row — `C11`, `C12` and `C13`. ⚠ **No existing
   ID has been renumbered or dropped.** Round 1 added a check that enforced
   that; round 2 cut it (see below). The discipline stands even though nothing
   now enforces it: **narrow and split, never delete or repurpose an ID.**
2. **The eight omissions the reviewer enumerated are commissioned**, as `C14`
   through `C38`, one measurable question per row rather than one row per
   omission.
3. **A genuinely NORMATIVE row exists** (`C39`), so the disposition/kind matrix
   is exercised on this branch and not only in fixtures.
4. **N1 was swept as a CLASS, not patched as an instance** (`C40`). It was
   reported against `tools/claims-worklist.sh`, and the same silent-swallow
   shape was in the TypeScript detector. A finding is a sample, not the
   population.

## What round 2 changed about this document — and about the mechanism

Round 2 (`docs/reviews/self-pass-gate-codex-round2-review.md`) returned
**CHANGES-REQUIRED** with three merge-blockers, all three reproduced
independently by the author before any change was made. **The owner chose to
REDUCE the mechanism rather than escalate it.** That decision is the reason
several rows below now read `OWNER-ACCEPTED` instead of `FIXED`.

1. **The monotonic reviewer anchor is CUT** (round-2 M2). It authenticated a
   filename, not a reviewer — the author can write `author-self-review.md` and
   become the newest snapshot — and it compared reusable IDs, so a reviewed
   question can be replaced under a retained ID. Both measured green.
2. **The `base commit` and `commit-message range` certificate is CUT**
   (round-2 M1). A same-message amend changed the tracked tree while all three
   declarations stayed valid and the gate stayed green. What it claimed to
   bind, it did not bind.
3. **C22's false PASS is repaired** (round-2 M3). It claimed every disposition
   was exercised against both kinds; four normative cells were absent. All
   twelve are now fixtures. ⚠ Round 2 added "with a guard test so the claim
   cannot drift again"; round-3 N2 measured that too broad and it is withdrawn —
   the guard catches a disposition ADDED to the matrix, not a cell test deleted.
   See `C52`.
4. **The obligation is SCOPED.** It applies to branches touching governed text
   or one of the six enumerated artifacts in `GATE_OWN`, not to every branch in
   the repository forever. ⚠ Round-4 N1: "this gate's own files" is shorthand for
   those six named files and nothing wider — runners, configuration and spec
   deletion are outside the mechanism.

⚠⚠ **THE HONEST SHAPE OF THIS ROUND: two of the three merge-blockers were
answered by WITHDRAWING A CLAIM, not by turning a green state red.** A
same-message amend still changes untracked-by-the-certificate content; a
question can still be deleted or replaced. Nothing now says otherwise. ⚠ Round 2
listed **four** rows here and there were **five** — a static list of a growing
set, going false at the moment its next member landed. The rows dispositioned
`OWNER-ACCEPTED` are whatever `grep -cE '^\| C[0-9]+ .*\| OWNER-ACCEPTED '`
returns against the ledger; at the time of writing that is `C18`, `C24`, `C45`,
`C46` and `C47`, each naming the owner decision that accepted it.

## What round 3 changed about this document — and about the mechanism

Round 3 (`docs/reviews/self-pass-gate-codex-round3-review.md`, commit `b260ff5`)
returned **CHANGES-REQUIRED** with two merge-blockers and three non-blockers.
Both blockers were reproduced independently by the author before any change was
made. The owner ruled **fix both**.

1. **The scoped obligation was not actually scoped** (round-3 M1).
   `checkCommitMessageCandidates()` had no `!ctx.owesLedger` return while
   `runGate()` called it unconditionally, so an out-of-scope branch still went
   RED on a count-shaped commit message — falsifying this document's own claim
   that an ordinary branch owes nothing. **FIXED**, with a paired fixture on each
   side of the boundary. `C48` and `C49`.
2. **`C43` was a false `FIXED`** (round-3 M2). Its four-surface sweep was keyed on
   the round-1 fix's own wording rather than on the cut mechanisms' names and
   behaviours, and six present-tense survivors described both cut mechanisms as
   live. **FIXED**, and `C43` is re-dispositioned on a labelled hand trace rather
   than a token grep. `C50`.
3. **`GATE_OWN`'s claim is narrowed** (round-3 N1) — `C51`; **the C22 guard's
   stated property now matches what it asserts** (round-3 N2) — `C52`; **the
   branch inventories are derived from Git** (round-3 N3) — `C53`.

⚠⚠ **THE HONEST SHAPE OF THIS ROUND: ROUND 3 FOUND A FALSE DISPOSITION IN THIS
LEDGER FOR THE SECOND ROUND RUNNING** — `C22 PASS` in round 2, `C43 FIXED` now.
Both were universals asserted without running the enumeration that backs them,
in the mechanism built to catch exactly that. Round 3's own diagnostic is that
the dominant shape is again fix-generated new work: the round-2 scoping forgot
one composed check, and the round-2 deletion swept vocabulary rather than
consequences. **Neither cut mechanism is restored and neither should be.**

⭐ Four of round-3 M2's six survivors had already been found by the author while
authoring the round-3 commission, and were reported to the owner but deliberately
**kept out of the reviewer's prompt**, because that prompt asked the reviewer to
judge whether the withdrawal was honest and complete. The reviewer found the
class independently and added two surfaces the author had missed.

## What round 4 changed about this document — and about the mechanism

Round 4 (`docs/reviews/self-pass-gate-codex-round4-review.md`, commit `aae3b50`)
returned **CHANGES-REQUIRED** with two merge-blockers and two non-blockers. Both
blockers were reproduced independently by the author before any change was made.
The owner ruled **fix both**.

1. **The scope leaked in two more checks** (round-4 M1). Round 3 scoped five and
   left `checkDispositions()` and `checkOwnerAcceptance()` reading an INHERITED
   ledger on a branch that owed nothing. **FIXED**, with a paired fixture either
   side. `C54` and `C55`.
2. **`C01` contradicted its own disposition** (round-4 M2) — it called branch
   messages "a hashed input" after that hash was cut, in a cell labelled `FIXED`.
   **FIXED**, and the class was swept. `C56`.
3. **The `GATE_OWN` narrowing was incomplete** (round-4 N1) — the wider wording
   survived in the public `owesLedger` contract docblock and four other current
   surfaces. **FIXED**, swept by role. `C57`. **`C53` is corrected** (round-4 N2):
   its label said `FIXED` while its own evidence said the PR-body edit was owed.

⚠⚠⚠ **THE HONEST SHAPE, AND IT IS THE THIRD CONSECUTIVE ROUND: `C22` false in
round 2, `C43` false in round 3, `C01` and `C53` false in round 4.** Three rounds
of "be more careful" did not work. **What changed this round is the process, not
the resolve:** the author now separates the edit pass from a reading pass in
which every completion claim must carry a quote read fresh from disk, or be
marked NOT CHECKED. Round 4's own finding — that a fix and its untouched twin
twenty lines away are one `git diff` apart and two memories apart — is what that
pass is built to catch.

⭐ Round 4 also CLEARED several round-3 judgement calls, recorded so a later
round does not re-open them: the C43 hand trace is "the right kind of instrument…
not a better-dressed proxy"; the deliberate `GATE_OWN` non-fix is "sound";
`tools/claims-worklist.sh` is genuinely clean of both cut mechanisms; the C22
guard correction is RESOLVED; and not re-driving the sixteen-state table is "an
adequate boundary for this diff".

## What round 5 changed about this document — and about the mechanism

Round 5 (`docs/reviews/self-pass-gate-codex-round5-review.md`, commit `6cfbe57`)
was a **deliberately narrow** commission — the remedy plus the four round-4
repairs, with the gate's design explicitly out of scope. It returned
**CHANGES-REQUIRED** with two merge-blockers and one non-blocker, and it cleared
the code class outright. The owner ruled **fix all three, and repair the remedy
as well**.

1. **`C01` was still a false `FIXED`** (round-5 M1). Round 4 deleted the false
   sentence but left the label, so the row went on answering "yes" to a
   commissioned question its own evidence answers "no". ⚠ **The generalisation
   matters more than the row:** round 4 swept for cells that contradict
   themselves, which is a test a row can pass while still answering the wrong
   question — the question lives in a different file. **FIXED**: `C01` is now
   `OWNER-ACCEPTED` with the owner citation, and `C56` is regenerated from a
   sweep keyed on the commission rather than on each cell's own wording. `C58`.
2. **The `GATE_OWN` role sweep omitted the live PR body** (round-5 M2), so
   `C57`'s universal was false. ⚠⚠⚠ **THE DEFECT WAS THE POPULATION, NOT THE
   SWEEP.** Round 4 derived its members from `git diff --name-only`, which cannot
   contain a surface that is not a repository file. **FIXED**: the population is
   re-derived by ROLE and now has eight members, two of them external — the live
   PR body, and the MemPalace `[STATE]` drawer, which the reviewer could not see
   at all. `C59`.
3. **A fixture named two guards and exercised one** (round-5 N1). Its mutation
   set a row to `PASS`, which `checkOwnerAcceptance()` can never match, so that
   assertion was already empty before the guard existed. **FIXED**, with a new
   paired fixture proven against the old implementation. `C60`.

⚠⚠ **WHAT ROUND 5 CLEARED, so a later round does not re-open it:** the
eight-check scope class is **RESOLVED** and independently re-derived — eight
exported checks, all eight composed, seven guarded, and the unguarded
`checkGovernedObligation()` judged **sound**. `C22` is confirmed a false
positive. `C53` and the hosted commit inventory hold. No serious out-of-scope
defect was found.

⚠ **The remedy verdict was PARTLY, not APPROVE.** The two skills catch a local
self-contradiction but are **not a population mechanism**, and round-5 M2 is the
live proof: an agent following both exactly would still have shipped `C57`,
because the omitted member was external to Git. That is a finding about the
author's process, not about this gate, and it was repaired outside this
repository.

## Commissioned checks

Each row is **one independently falsifiable question**, and each carries a
**Kind**:

- **EMPIRICAL** — a claim about what happens. Answerable only by running
  something. May be dispositioned `PASS`, `FIXED` or `OWNER-ACCEPTED`.
- **NORMATIVE** — a rule or a quoted prohibition. There is nothing to run. May
  be dispositioned `NORMATIVE` or `OWNER-ACCEPTED`.

`DISCLOSED` and `UNRUN` pass **no** kind. A commissioned row is in scope by
definition, so disclosing it is not answering it; out-of-scope observations go
in the ledger's prose sections, which carry no `C<n>` ID and are not parsed.

| ID  | Kind      | Check                                                                                                                                                                                   |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01 | EMPIRICAL | Does the certified target cover branch commit messages, so a content commit cannot leave a green certificate valid? (round-0 M1)                                                        |
| C02 | EMPIRICAL | With no resolvable base ref, does the detector FAIL rather than skip? (round-0 M2; the CI half of the old compound row is now C11)                                                      |
| C03 | EMPIRICAL | Are the required ledger rows derived from THIS tracked commission rather than from the ledger itself? (round-0 M3)                                                                      |
| C04 | EMPIRICAL | Does governed-change discovery decompose renames and see the PREIMAGE, not only the destination? (round-0 M4)                                                                           |
| C05 | EMPIRICAL | Does the governed fingerprint cover UNTRACKED governed additions? (round-0 M4; the mode half of the old compound row is now C12)                                                        |
| C06 | EMPIRICAL | Is the live PR-body read MANDATORY where the ledger claims it? (round-0 M5; the propagation half of the old compound row is now C13)                                                    |
| C07 | EMPIRICAL | Does the gate go RED when a commissioned question has no ledger row, proven on known-bad input rather than asserted? (round-0 M3)                                                       |
| C08 | EMPIRICAL | Is the ledger REGENERATED for this branch rather than copied from PR #140?                                                                                                              |
| C09 | EMPIRICAL | Does the PR body avoid claiming the PR #140 M1 class is addressed, given the append-only observation control is deliberately not built?                                                 |
| C10 | EMPIRICAL | Does anything in this PR place normative text in `docs/governance/**`, `docs/templates/**`, `ai_rules.md` or `CLAUDE.md`?                                                               |
| C11 | EMPIRICAL | Does CI resolve a base ref — is `fetch-depth: 0` present in the workflow that runs this suite? (split from C02)                                                                         |
| C12 | EMPIRICAL | Does the governed fingerprint cover file MODE as well as content? (split from C05)                                                                                                      |
| C13 | EMPIRICAL | Does a `gh` read failure PROPAGATE rather than passing an empty body off as a successful read? (split from C06)                                                                         |
| C14 | EMPIRICAL | Does the gate go RED when the commission FILE is absent while there is work to certify? (round-1 M1)                                                                                    |
| C15 | EMPIRICAL | Does the gate go RED when the commission's exact `Commissioned checks` heading is missing? (round-1 M1)                                                                                 |
| C16 | EMPIRICAL | Does the gate go RED when that section is present but parses to ZERO rows? (round-1 M1)                                                                                                 |
| C17 | EMPIRICAL | Does the gate go RED when two commission rows carry the SAME ID, collapsing two obligations into one? (round-1 M1)                                                                      |
| C18 | EMPIRICAL | Does the gate go RED when a commissioned question is dropped, with its ledger row, AFTER the reviewer's deliverable was committed? (round-1 M1)                                         |
| C19 | EMPIRICAL | Is the residual case — dropping a question and its row BEFORE any reviewer deliverable exists — measured and recorded as OPEN? (round-1 M1)                                             |
| C20 | EMPIRICAL | Does the gate go RED when an EMPIRICAL row is dispositioned `DISCLOSED`? (round-1 M2)                                                                                                   |
| C21 | EMPIRICAL | Does the gate go RED when an EMPIRICAL row is dispositioned `NORMATIVE`? (round-1 M2)                                                                                                   |
| C22 | EMPIRICAL | Is every disposition in the vocabulary exercised against BOTH an empirical and a genuinely normative row? (round-1 M2)                                                                  |
| C23 | EMPIRICAL | Does the gate go RED on a LATER branch that inherits this commission and this ledger unchanged? (round-1 M3)                                                                            |
| C24 | EMPIRICAL | Does the gate go RED on a later commit whose whole message carries no count-shaped candidate at all? (round-1 M3)                                                                       |
| C25 | EMPIRICAL | Is a hash over the commit-MESSAGE range a feasible certificate input, contrary to the withdrawn "infinite regress" rationale? (round-1 M3)                                              |
| C26 | EMPIRICAL | Has that false rationale been corrected in EVERY place it was written down, rather than only where the reviewer quoted it? (round-1 M3)                                                 |
| C27 | EMPIRICAL | Does the fingerprint see an UNSTAGED content edit to a tracked governed file? (round-1 M4)                                                                                              |
| C28 | EMPIRICAL | Does the fingerprint see an UNSTAGED deletion of a tracked governed file? (round-1 M4)                                                                                                  |
| C29 | EMPIRICAL | Does the fingerprint see an UNSTAGED mode change on a tracked governed file? (round-1 M4)                                                                                               |
| C30 | EMPIRICAL | Does the fingerprint still see the STAGED mode change the index-only version already caught? (round-1 M4, regression control)                                                           |
| C31 | EMPIRICAL | Does the fingerprint see a tracked governed file replaced by a SYMLINK — type, not only content? (round-1 M4)                                                                           |
| C32 | EMPIRICAL | Does the advisory generator exit non-zero when the base ref RESOLVES but shares no ancestor with HEAD? (round-1 N1)                                                                     |
| C33 | EMPIRICAL | Does the advisory generator emit BOTH sides of a STAGED rename? (round-1 N2)                                                                                                            |
| C34 | EMPIRICAL | Does the advisory generator keep a pathname containing a newline as ONE record? (round-1 N2)                                                                                            |
| C35 | EMPIRICAL | Is each row of this table one independently falsifiable question, with the three compound rows round 1 named now split? (round-1, atomicity)                                            |
| C36 | EMPIRICAL | Is a false claim present ONLY in the live PR body outside the blocking path, and is that boundary measured and stated rather than implied?                                              |
| C37 | EMPIRICAL | Does every constructed state round 1 reported as a false accept now go RED, with the green control still GREEN?                                                                         |
| C38 | EMPIRICAL | Are the hostile cases RE-RUN by the gate on every `./tools/checks`, rather than recorded as prose nobody executes again?                                                                |
| C39 | NORMATIVE | The agent never merges, and the owner alone decides whether this correction warrants another independent round. (`OPERATING_AGREEMENT.md` §3(d))                                        |
| C40 | EMPIRICAL | Was N1's CLASS — a git command that defines a population failing silently — swept in the TypeScript detector too, not only in the shell script it was reported against?                 |
| C41 | EMPIRICAL | Is the obligation SCOPED, so a branch touching neither governed text nor this gate's own files owes nothing? (round-2, the repository-wide tax)                                         |
| C42 | EMPIRICAL | Does DELETING the commission and ledger escape the obligation, or is removing them itself a change to this gate? (round-2, the corollary of scoping)                                    |
| C43 | EMPIRICAL | Does any surviving text — code, commission, ledger or PR body — still claim the certificate binds branch content, HEAD, or fresh execution? (round-2 M1 overclaim)                      |
| C44 | EMPIRICAL | Is each cut mechanism documented AT ITS CUT SITE with the measurement that killed it, so it is not proposed again in round 3? (round-2 M1 and M2)                                       |
| C45 | EMPIRICAL | Can a reviewed question be REPLACED under a retained ID, and is that residue disclosed rather than implied closed? (round-2 M2, second bypass)                                          |
| C46 | EMPIRICAL | Can a same-message amend change tracked NON-GOVERNED content without invalidating anything, and is that residue disclosed? (round-2 M1, the tree blind spot)                            |
| C47 | EMPIRICAL | Does the commit-message candidate leg accept a candidate that appears ANYWHERE in the ledger rather than in a dispositioned row, and has this ledger's own growth weakened it?          |
| C48 | EMPIRICAL | Does an OUT-OF-SCOPE branch stay green when its commit message carries a count-shaped claim — is every check composed by `runGate()` inside the scope? (round-3 M1)                     |
| C49 | EMPIRICAL | Does an OBLIGATED branch with a count-shaped commit message still go RED, so scoping the candidate leg did not disable round-0 M1 globally? (round-3 M1, paired control)                |
| C50 | EMPIRICAL | Does any surviving text describe either CUT mechanism as live, enumerated by a labelled hand trace over every governing surface rather than by a token grep? (round-3 M2)               |
| C51 | EMPIRICAL | Does `GATE_OWN`'s stated claim match what it covers, with the execution surfaces it does NOT cover named rather than implied? (round-3 N1)                                              |
| C52 | EMPIRICAL | Does the C22 guard's stated property match what it actually asserts, given it cannot detect a deleted cell test? (round-3 N2)                                                           |
| C53 | EMPIRICAL | Do the commit inventories in this document, the ledger and the PR body match `git rev-list --count`, rather than a static total that goes stale? (round-3 N3)                           |
| C54 | EMPIRICAL | Does an OUT-OF-SCOPE branch stay green when the ledger it INHERITS is already invalid — is every ledger-reading check inside the scope? (round-4 M1)                                    |
| C55 | EMPIRICAL | Does an OBLIGATED branch carrying the same invalid ledger row still go RED, so scoping those checks did not disable them? (round-4 M1, paired control)                                  |
| C56 | EMPIRICAL | Does any ledger cell contradict its own disposition — evidence that refutes the label it carries? (round-4 M2, the C01 class)                                                           |
| C57 | EMPIRICAL | Does every current description of the obligation scope match the six-artifact predicate, rather than implying a wider tamper boundary? (round-4 N1)                                     |
| C58 | EMPIRICAL | Does every completion-labelled row answer its COMMISSIONED QUESTION, rather than merely avoiding a contradiction inside its own cell? (round-5 M1, the C01 class generalised)           |
| C59 | EMPIRICAL | Does the scope-description sweep enumerate surfaces OUTSIDE the repository — the live PR body and the MemPalace `[STATE]` drawer — which no changed-file list can contain? (round-5 M2) |
| C60 | EMPIRICAL | Does each guard that a regression fixture names FAIL AGAINST THE OLD implementation, so the fixture is load-bearing for that specific guard rather than vacuously green? (round-5 N1)   |

## ⚠ What this still does NOT fix, stated rather than implied

**A committed commission cannot stop an author never writing a question down.**
If a check is absent from the table above, no mechanism here notices. Round 1
sharpened that limit rather than removing it, and two specific residues are
worth naming because they are easy to mistake for closed:

- **Deleting a question is invisible AT ANY TIME, and so is replacing one under
  a retained ID.** ⚠⚠ ROUND-3 M2 CORRECTED THIS PARAGRAPH: it previously said the
  residue was open only _before_ a reviewer had committed a review document, and
  named `checkCommissionMonotonic()` as closing it afterwards. **That function
  does not exist** — it was cut in round 2 after two measured bypasses — so the
  qualifier was false and the sentence described a protection the reader does not
  have. There is no anchor at any point: deleting a question together with its
  ledger row leaves both artifacts internally consistent and the gate green,
  which is the same class as never writing it down. **It is measured, not
  reasoned about**, by the test named `KNOWN-OPEN:` in
  `tests/unit/author-ledger-fixtures.spec.ts`, which asserts the gate stays
  GREEN — so if a future change closes it, that test fails and must be rewritten.
  ⓘ Rows `C18` and `C19` keep the narrower wording they were commissioned with in
  round 1. They are **not** rewritten, because replacing a question's text under a
  retained ID is exactly the residue `C45` discloses; their ledger rows carry the
  correction instead.
- **Row atomicity is enforced as one unique ID per row.** Whether a row's
  natural-language CONTENT is one question is not mechanically decidable. Round
  1 found three rows that bundled two; they were split by hand, and the next
  three will need the same treatment.

## ⚠⚠ The standing consequence, corrected — and what it actually costs now

**The round-1 version of this section was mechanically false and round 2
measured it so.** It said every future branch with work to certify would owe
"its own commission and its own regenerated ledger". A future branch passed
with all forty evidence rows inherited byte-for-byte after editing two
certificate lines. It owed churn, not execution.

After the reduction the cost is smaller and stated exactly:

- **A branch touching neither governed text nor one of the six enumerated
  `GATE_OWN` artifacts owes
  nothing.** The gate is silent. That is most branches, and it is the whole
  point of scoping the obligation.
- **A branch that does touch them owes a commission, a ledger with one row per
  commissioned question, and a governed fingerprint that matches its tree.**
  `checkLedgerFreshness()` additionally requires the ledger to have been edited
  on that branch — which stops silent inheritance and **nothing more**. A
  one-character edit satisfies it.
- **There is no amend loop and no recertification cycle.** Those existed only
  to serve the message-range hash, which is gone. A reviewer's commit no longer
  turns the gate red.

⚠ The one exemption that is not about scope is still decidable from Git rather
than from the artifacts: `merge-base(base, HEAD) == HEAD` with a clean tree —
`main` after a merge — is not branch work at all.

## Named hostile cases

Construct these; do not reason about them.

⚠⚠ **ROUND-3 M2 CORRECTED THIS SENTENCE.** It used to read "Every one below is
now a test in `tests/unit/author-ledger-fixtures.spec.ts` and runs on every
`./tools/checks`" — an unverified universal, and false: **case 5's fixture was
deleted in round 2 along with the reviewer anchor it depended on.** Cases 1, 2,
3, 4, 6, 7 and 8 are tests and run on every `./tools/checks`. **Case 5 is NOT a
test and cannot be one** — it is the residue recorded at `C18`, and what stands
in its place is the `KNOWN-OPEN:` fixture asserting the gate stays GREEN. It is
listed below unchanged so the history of what was once claimed stays legible.

1. **Rename across the governed boundary.** Move a file from
   `docs/governance/` to `docs/reviews/`, commit, and confirm the detector sees
   the preimage and demands a commission.
2. **Untracked governed addition**, **mode-only change**, **unstaged content
   edit**, **unstaged deletion**, and **replacement by a symlink** — each must
   move the fingerprint.
3. **Shallow clone.** No base ref: the suite must FAIL, not skip.
4. **Commission absent / heading renamed / table emptied / duplicate ID.**
5. **A question dropped after the reviewer's deliverable was committed.**
6. **Post-commit red.** A commit message containing an undispositioned claim
   candidate must invalidate the certificate.
7. **A later branch inheriting both artifacts unchanged.**
8. **A resolvable but unrelated base ref**, and **a pathname containing a
   newline**, against `tools/claims-worklist.sh`.

## The author's weakest claims — attack these first

⚠ Rewritten for round 2. Claims 3, 4, 7 and 8 described mechanisms that no
longer exist; they are replaced rather than kept as history.

1. **"The commission is the population."** It is the _written_ population and
   nothing more. Round 1 believed a reviewer anchor made it deletion-resistant;
   round 2 measured two bypasses and it was cut. **A question can be deleted,
   or replaced under a retained ID, and nothing here sees it.** The tracked file
   makes both a visible diff for the reviewer and the owner. That is the whole
   protection.
2. **"Fail-closed in CI."** `fetch-depth: 0` is verified against the workflow
   file, a constructed shallow clone, and real Actions runs on this PR. Forks
   remain unverified.
3. ⚠⚠ **THE CERTIFICATE COVERS THE GOVERNED TREE AND NOTHING ELSE.** Round 1
   called `base commit` + `commit-message range` a base/head lifecycle binding;
   round 2 measured a same-message amend changing tracked non-governed content
   with every declaration still valid and the gate green. Both fields are cut.
   **`src/`, tests, tools, this commission's text and the ledger's evidence are
   all outside the fingerprint, and no wording anywhere should suggest
   otherwise.** A whole-tree digest or an external CI attestation would close
   this; neither was built.
4. **`checkLedgerFreshness()` proves editing, not execution.** It requires the
   ledger to be in this branch's changed set. A one-character edit satisfies it.
   It cannot distinguish a re-run from an inherited evidence row, and round 2
   measured exactly that inheritance passing.
5. **The disposition matrix constrains the LABEL, not the sentence.** Nothing
   stops an author writing a broad, evasive assertion in an evidence cell and
   calling it `PASS`. Round 2's M3 was a live instance: `C22` said `PASS` while
   four of its twelve cells did not exist.
6. **`HAVDM_BASE_REF` is a test hook and therefore an escape hatch.** It exists
   so hostile fixtures can pin a base, and CI does not set it — but an author
   who set it to their own HEAD would make `hasBranchWork` false and skip the
   checks. Such an author could equally delete the spec, so it is not a new
   capability; it is named here rather than left for the reviewer to find.
7. ⚠⚠ **`GATE_OWN` IS SIX ENUMERATED AUTHOR ARTIFACTS, NOT A TAMPER BOUNDARY —
   AND THE GAP IS PRESENT, NOT FUTURE.** Round 3's N1 corrected this claim: it
   used to say the risk was the mechanism "growing a seventh file" nobody adds.
   **Surfaces that decide whether these specs RUN AT ALL are already outside the
   list** — `tools/checks`, the `test:unit` script in `package.json`,
   `vitest.config.ts` and `.github/workflows/ci.yml` — as is deleting either spec
   outright. **Lengthening the regex list would NOT fix that:** a local Vitest
   check cannot enforce anything once its own runner is disabled, so a longer
   list buys the appearance of protection and not the property. What this list
   catches is EDITS TO THE SIX AUTHOR ARTIFACTS. Runner, configuration and
   test-deletion tampering are outside this mechanism and live at the human owner
   gate. There is no generated check on the list.

8. **The twelve-cell disposition matrix is kept complete BY HAND.** Round 3's N2
   corrected an overstatement here: the guard test asserts only that
   `DISPOSITION_MATRIX` has the six expected KEYS, so it catches a disposition
   added without its two cells and **does not notice one of the twelve cell tests
   being deleted.** No count of cell tests is asserted anywhere. Keeping the
   twelve complete is a reviewer's enumeration, which is why `C22` asks for one
   every round rather than for a green suite.
9. **The commit-message candidate leg matches a substring anywhere in the
   ledger**, not a dispositioned row — round 1 said so and it is now measurably
   weaker, because this ledger's own attack table contains count-shaped strings
   that therefore auto-satisfy candidates. See `C47`.

## Required reading

- `docs/reviews/self-pass-gate-codex-review.md` — round 1, the four
  merge-blockers this document answers.
- `docs/reviews/self-pass-gate-adversarial-review-codex.md` — the review that
  withdrew attempt one, with all five of its merge-blockers.
- `docs/governance/OPERATING_AGREEMENT.md` §3 — governed classes, and class
  (d): one full independent review before merge, no automatic follow-up round,
  and the OWNER decides whether a post-review change warrants re-review.
- `docs/testing/TESTING_STANDARDS.md` — the evidence-surfaces section merged in
  PR #138, and the DEFINITION OF DONE list.

## Governing rules quoted verbatim, because the reviewer has no MemPalace access

> **A mechanised check's INPUT must be MANDATORY, UNIQUE and LIFECYCLE-BOUND —
> tracked and enumerable is not enough.** Ask four further questions of the
> input itself: is it MANDATORY — what happens when the file, its heading, or
> every parseable row is ABSENT? are its identifiers UNIQUE — can two upstream
> rows collapse into one obligation? is it LIFECYCLE-BOUND — can a LATER branch
> inherit the already-green artifact unchanged? is each row ATOMIC IN FACT, not
> merely uniquely labelled? **And the meta-rule: when you fix a fail-open defect
> by MOVING its input somewhere better, RE-ASK THE ORIGINAL QUESTION OF THE NEW
> LOCATION.**

> **Distinguish INDEX coverage from WORKING-TREE coverage.** `git ls-files -s`
> reports what the INDEX records; it cannot see an unstaged edit, deletion or
> `chmod` on an already-tracked file. If a checker claims dirty-tree coverage,
> hash the actual tracked worktree content, TYPE and MODE, or reject the dirty
> path until staged — and prove the STAGED and UNSTAGED controls separately.
> ⚠ Beware a fixture that quietly `git add`s and converts your unstaged case
> into a staged one.

> **A gate cannot certify input that only comes into existence after the gate
> runs.** Ask separately: at what moment does each input exist, and at what
> moment is the certificate computed? Anything to the right of the certificate
> is outside it. A gate result is pinned to one commit, and ordinary workflow
> actions — updating a branch, a reviewer's fix commit — move it.

> **A check is evidence only for the property it exercises — and so is a
> reviewer's clearance.** Ask "if this claim were false, would what I ran have
> failed?"

> **A finding is a SAMPLE, not the population.** A mechanical sweep is only as
> good as the key it is keyed on; state the class as a behaviour before choosing
> a search key, and read the surface end to end.

> **The fix round is unreviewed new work.** Scope it to the finding — under-reach
> and over-reach both bite — and check it against the authority it cites.

> **Repeated failure of one implementation is not proof that its finite property
> is undecidable.** Separate "the attempted mechanism was not reliable" from "no
> algorithm can decide this". A fail-closed certificate is usually available and
> is itself a decision procedure.

⭐ **Two further rules come from round 2 itself and are quoted because they are
the standard this reduction was judged against:**

> **AN AMEND-STABLE MESSAGE HASH IS NOT A TREE CERTIFICATE.** If an amend may
> preserve messages while changing the tree, bind the complete tree and the
> certificate's semantic inputs, or use an external attestation over the full
> HEAD SHA. Prove a same-message non-governed content amend fails against the
> old implementation.

> **A COUNTERPARTY ANCHOR MUST NOT BE SELECTED BY A SELF-AUTHORED FILENAME.**
> Choosing the newest matching path lets the producer create a newer apparent
> anchor; comparing reusable IDs also protects labels rather than question
> identity. Authenticate the counterparty externally or keep authorship
> enforcement at the human owner gate.
