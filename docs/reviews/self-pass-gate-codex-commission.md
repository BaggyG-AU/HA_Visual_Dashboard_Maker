Author: Claude Opus (claude-code)
Reviewer: OpenAI Codex
Owner gate: micah/BaggyG-AU

# Commission — the author self-pass gate, second attempt, rounds 1 and 2

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
   twelve are now fixtures, with a guard test so the claim cannot drift again.
4. **The obligation is SCOPED.** It applies to branches touching governed text
   or this gate's own files, not to every branch in the repository forever.

⚠⚠ **THE HONEST SHAPE OF THIS ROUND: two of the three merge-blockers were
answered by WITHDRAWING A CLAIM, not by turning a green state red.** A
same-message amend still changes untracked-by-the-certificate content; a
question can still be deleted or replaced. Nothing now says otherwise. Rows
`C18`, `C24`, `C45` and `C46` record those residues as `OWNER-ACCEPTED` and
name the owner decision that accepted them.

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

| ID  | Kind      | Check                                                                                                                                                                          |
| --- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C01 | EMPIRICAL | Does the certified target cover branch commit messages, so a content commit cannot leave a green certificate valid? (round-0 M1)                                               |
| C02 | EMPIRICAL | With no resolvable base ref, does the detector FAIL rather than skip? (round-0 M2; the CI half of the old compound row is now C11)                                             |
| C03 | EMPIRICAL | Are the required ledger rows derived from THIS tracked commission rather than from the ledger itself? (round-0 M3)                                                             |
| C04 | EMPIRICAL | Does governed-change discovery decompose renames and see the PREIMAGE, not only the destination? (round-0 M4)                                                                  |
| C05 | EMPIRICAL | Does the governed fingerprint cover UNTRACKED governed additions? (round-0 M4; the mode half of the old compound row is now C12)                                               |
| C06 | EMPIRICAL | Is the live PR-body read MANDATORY where the ledger claims it? (round-0 M5; the propagation half of the old compound row is now C13)                                           |
| C07 | EMPIRICAL | Does the gate go RED when a commissioned question has no ledger row, proven on known-bad input rather than asserted? (round-0 M3)                                              |
| C08 | EMPIRICAL | Is the ledger REGENERATED for this branch rather than copied from PR #140?                                                                                                     |
| C09 | EMPIRICAL | Does the PR body avoid claiming the PR #140 M1 class is addressed, given the append-only observation control is deliberately not built?                                        |
| C10 | EMPIRICAL | Does anything in this PR place normative text in `docs/governance/**`, `docs/templates/**`, `ai_rules.md` or `CLAUDE.md`?                                                      |
| C11 | EMPIRICAL | Does CI resolve a base ref — is `fetch-depth: 0` present in the workflow that runs this suite? (split from C02)                                                                |
| C12 | EMPIRICAL | Does the governed fingerprint cover file MODE as well as content? (split from C05)                                                                                             |
| C13 | EMPIRICAL | Does a `gh` read failure PROPAGATE rather than passing an empty body off as a successful read? (split from C06)                                                                |
| C14 | EMPIRICAL | Does the gate go RED when the commission FILE is absent while there is work to certify? (round-1 M1)                                                                           |
| C15 | EMPIRICAL | Does the gate go RED when the commission's exact `Commissioned checks` heading is missing? (round-1 M1)                                                                        |
| C16 | EMPIRICAL | Does the gate go RED when that section is present but parses to ZERO rows? (round-1 M1)                                                                                        |
| C17 | EMPIRICAL | Does the gate go RED when two commission rows carry the SAME ID, collapsing two obligations into one? (round-1 M1)                                                             |
| C18 | EMPIRICAL | Does the gate go RED when a commissioned question is dropped, with its ledger row, AFTER the reviewer's deliverable was committed? (round-1 M1)                                |
| C19 | EMPIRICAL | Is the residual case — dropping a question and its row BEFORE any reviewer deliverable exists — measured and recorded as OPEN? (round-1 M1)                                    |
| C20 | EMPIRICAL | Does the gate go RED when an EMPIRICAL row is dispositioned `DISCLOSED`? (round-1 M2)                                                                                          |
| C21 | EMPIRICAL | Does the gate go RED when an EMPIRICAL row is dispositioned `NORMATIVE`? (round-1 M2)                                                                                          |
| C22 | EMPIRICAL | Is every disposition in the vocabulary exercised against BOTH an empirical and a genuinely normative row? (round-1 M2)                                                         |
| C23 | EMPIRICAL | Does the gate go RED on a LATER branch that inherits this commission and this ledger unchanged? (round-1 M3)                                                                   |
| C24 | EMPIRICAL | Does the gate go RED on a later commit whose whole message carries no count-shaped candidate at all? (round-1 M3)                                                              |
| C25 | EMPIRICAL | Is a hash over the commit-MESSAGE range a feasible certificate input, contrary to the withdrawn "infinite regress" rationale? (round-1 M3)                                     |
| C26 | EMPIRICAL | Has that false rationale been corrected in EVERY place it was written down, rather than only where the reviewer quoted it? (round-1 M3)                                        |
| C27 | EMPIRICAL | Does the fingerprint see an UNSTAGED content edit to a tracked governed file? (round-1 M4)                                                                                     |
| C28 | EMPIRICAL | Does the fingerprint see an UNSTAGED deletion of a tracked governed file? (round-1 M4)                                                                                         |
| C29 | EMPIRICAL | Does the fingerprint see an UNSTAGED mode change on a tracked governed file? (round-1 M4)                                                                                      |
| C30 | EMPIRICAL | Does the fingerprint still see the STAGED mode change the index-only version already caught? (round-1 M4, regression control)                                                  |
| C31 | EMPIRICAL | Does the fingerprint see a tracked governed file replaced by a SYMLINK — type, not only content? (round-1 M4)                                                                  |
| C32 | EMPIRICAL | Does the advisory generator exit non-zero when the base ref RESOLVES but shares no ancestor with HEAD? (round-1 N1)                                                            |
| C33 | EMPIRICAL | Does the advisory generator emit BOTH sides of a STAGED rename? (round-1 N2)                                                                                                   |
| C34 | EMPIRICAL | Does the advisory generator keep a pathname containing a newline as ONE record? (round-1 N2)                                                                                   |
| C35 | EMPIRICAL | Is each row of this table one independently falsifiable question, with the three compound rows round 1 named now split? (round-1, atomicity)                                   |
| C36 | EMPIRICAL | Is a false claim present ONLY in the live PR body outside the blocking path, and is that boundary measured and stated rather than implied?                                     |
| C37 | EMPIRICAL | Does every constructed state round 1 reported as a false accept now go RED, with the green control still GREEN?                                                                |
| C38 | EMPIRICAL | Are the hostile cases RE-RUN by the gate on every `./tools/checks`, rather than recorded as prose nobody executes again?                                                       |
| C39 | NORMATIVE | The agent never merges, and the owner alone decides whether this correction warrants another independent round. (`OPERATING_AGREEMENT.md` §3(d))                               |
| C40 | EMPIRICAL | Was N1's CLASS — a git command that defines a population failing silently — swept in the TypeScript detector too, not only in the shell script it was reported against?        |
| C41 | EMPIRICAL | Is the obligation SCOPED, so a branch touching neither governed text nor this gate's own files owes nothing? (round-2, the repository-wide tax)                                |
| C42 | EMPIRICAL | Does DELETING the commission and ledger escape the obligation, or is removing them itself a change to this gate? (round-2, the corollary of scoping)                           |
| C43 | EMPIRICAL | Does any surviving text — code, commission, ledger or PR body — still claim the certificate binds branch content, HEAD, or fresh execution? (round-2 M1 overclaim)             |
| C44 | EMPIRICAL | Is each cut mechanism documented AT ITS CUT SITE with the measurement that killed it, so it is not proposed again in round 3? (round-2 M1 and M2)                              |
| C45 | EMPIRICAL | Can a reviewed question be REPLACED under a retained ID, and is that residue disclosed rather than implied closed? (round-2 M2, second bypass)                                 |
| C46 | EMPIRICAL | Can a same-message amend change tracked NON-GOVERNED content without invalidating anything, and is that residue disclosed? (round-2 M1, the tree blind spot)                   |
| C47 | EMPIRICAL | Does the commit-message candidate leg accept a candidate that appears ANYWHERE in the ledger rather than in a dispositioned row, and has this ledger's own growth weakened it? |

## ⚠ What this still does NOT fix, stated rather than implied

**A committed commission cannot stop an author never writing a question down.**
If a check is absent from the table above, no mechanism here notices. Round 1
sharpened that limit rather than removing it, and two specific residues are
worth naming because they are easy to mistake for closed:

- **Deleting a question before any reviewer deliverable exists is invisible.**
  Once a reviewer has committed a review document, `checkCommissionMonotonic()`
  refuses a commission that has since lost an ID. Before that commit there is no
  anchor the author does not control, so deleting a question together with its
  ledger row leaves both artifacts internally consistent and the gate green.
  This is the same class as never writing it down. **It is measured, not
  reasoned about**, by the test named `KNOWN-OPEN:` in
  `tests/unit/author-ledger-fixtures.spec.ts`, which asserts the gate stays
  GREEN — so if a future change closes it, that test fails and must be rewritten.
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

- **A branch touching neither governed text nor this gate's own files owes
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

Construct these; do not reason about them. Every one below is now a test in
`tests/unit/author-ledger-fixtures.spec.ts` and runs on every `./tools/checks`.

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
7. **The scoping predicate is a list of paths I maintain by hand.** `GATE_OWN`
   names six files. If the mechanism grows a seventh and nobody adds it, a
   branch can change this gate without owing a ledger. There is no generated
   check on that list.
8. **The commit-message candidate leg matches a substring anywhere in the
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
