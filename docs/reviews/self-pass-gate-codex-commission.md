Author: Claude Opus (claude-code)
Reviewer: OpenAI Codex
Owner gate: micah/BaggyG-AU

# Commission — the author self-pass gate, second attempt, round-1 fix

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
   ID has been renumbered or dropped**, because
   `checkCommissionMonotonic()` now refuses a commission that has lost an ID the
   reviewer had already read.
2. **The eight omissions the reviewer enumerated are commissioned**, as `C14`
   through `C38`, one measurable question per row rather than one row per
   omission.
3. **A genuinely NORMATIVE row exists** (`C39`), so the disposition/kind matrix
   is exercised on this branch and not only in fixtures.
4. **N1 was swept as a CLASS, not patched as an instance** (`C40`). It was
   reported against `tools/claims-worklist.sh`, and the same silent-swallow
   shape was in the TypeScript detector. A finding is a sample, not the
   population.

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

| ID  | Kind      | Check                                                                                                                                                                   |
| --- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01 | EMPIRICAL | Does the certified target cover branch commit messages, so a content commit cannot leave a green certificate valid? (round-0 M1)                                        |
| C02 | EMPIRICAL | With no resolvable base ref, does the detector FAIL rather than skip? (round-0 M2; the CI half of the old compound row is now C11)                                      |
| C03 | EMPIRICAL | Are the required ledger rows derived from THIS tracked commission rather than from the ledger itself? (round-0 M3)                                                      |
| C04 | EMPIRICAL | Does governed-change discovery decompose renames and see the PREIMAGE, not only the destination? (round-0 M4)                                                           |
| C05 | EMPIRICAL | Does the governed fingerprint cover UNTRACKED governed additions? (round-0 M4; the mode half of the old compound row is now C12)                                        |
| C06 | EMPIRICAL | Is the live PR-body read MANDATORY where the ledger claims it? (round-0 M5; the propagation half of the old compound row is now C13)                                    |
| C07 | EMPIRICAL | Does the gate go RED when a commissioned question has no ledger row, proven on known-bad input rather than asserted? (round-0 M3)                                       |
| C08 | EMPIRICAL | Is the ledger REGENERATED for this branch rather than copied from PR #140?                                                                                              |
| C09 | EMPIRICAL | Does the PR body avoid claiming the PR #140 M1 class is addressed, given the append-only observation control is deliberately not built?                                 |
| C10 | EMPIRICAL | Does anything in this PR place normative text in `docs/governance/**`, `docs/templates/**`, `ai_rules.md` or `CLAUDE.md`?                                               |
| C11 | EMPIRICAL | Does CI resolve a base ref — is `fetch-depth: 0` present in the workflow that runs this suite? (split from C02)                                                         |
| C12 | EMPIRICAL | Does the governed fingerprint cover file MODE as well as content? (split from C05)                                                                                      |
| C13 | EMPIRICAL | Does a `gh` read failure PROPAGATE rather than passing an empty body off as a successful read? (split from C06)                                                         |
| C14 | EMPIRICAL | Does the gate go RED when the commission FILE is absent while there is work to certify? (round-1 M1)                                                                    |
| C15 | EMPIRICAL | Does the gate go RED when the commission's exact `Commissioned checks` heading is missing? (round-1 M1)                                                                 |
| C16 | EMPIRICAL | Does the gate go RED when that section is present but parses to ZERO rows? (round-1 M1)                                                                                 |
| C17 | EMPIRICAL | Does the gate go RED when two commission rows carry the SAME ID, collapsing two obligations into one? (round-1 M1)                                                      |
| C18 | EMPIRICAL | Does the gate go RED when a commissioned question is dropped, with its ledger row, AFTER the reviewer's deliverable was committed? (round-1 M1)                         |
| C19 | EMPIRICAL | Is the residual case — dropping a question and its row BEFORE any reviewer deliverable exists — measured and recorded as OPEN? (round-1 M1)                             |
| C20 | EMPIRICAL | Does the gate go RED when an EMPIRICAL row is dispositioned `DISCLOSED`? (round-1 M2)                                                                                   |
| C21 | EMPIRICAL | Does the gate go RED when an EMPIRICAL row is dispositioned `NORMATIVE`? (round-1 M2)                                                                                   |
| C22 | EMPIRICAL | Is every disposition in the vocabulary exercised against BOTH an empirical and a genuinely normative row? (round-1 M2)                                                  |
| C23 | EMPIRICAL | Does the gate go RED on a LATER branch that inherits this commission and this ledger unchanged? (round-1 M3)                                                            |
| C24 | EMPIRICAL | Does the gate go RED on a later commit whose whole message carries no count-shaped candidate at all? (round-1 M3)                                                       |
| C25 | EMPIRICAL | Is a hash over the commit-MESSAGE range a feasible certificate input, contrary to the withdrawn "infinite regress" rationale? (round-1 M3)                              |
| C26 | EMPIRICAL | Has that false rationale been corrected in EVERY place it was written down, rather than only where the reviewer quoted it? (round-1 M3)                                 |
| C27 | EMPIRICAL | Does the fingerprint see an UNSTAGED content edit to a tracked governed file? (round-1 M4)                                                                              |
| C28 | EMPIRICAL | Does the fingerprint see an UNSTAGED deletion of a tracked governed file? (round-1 M4)                                                                                  |
| C29 | EMPIRICAL | Does the fingerprint see an UNSTAGED mode change on a tracked governed file? (round-1 M4)                                                                               |
| C30 | EMPIRICAL | Does the fingerprint still see the STAGED mode change the index-only version already caught? (round-1 M4, regression control)                                           |
| C31 | EMPIRICAL | Does the fingerprint see a tracked governed file replaced by a SYMLINK — type, not only content? (round-1 M4)                                                           |
| C32 | EMPIRICAL | Does the advisory generator exit non-zero when the base ref RESOLVES but shares no ancestor with HEAD? (round-1 N1)                                                     |
| C33 | EMPIRICAL | Does the advisory generator emit BOTH sides of a STAGED rename? (round-1 N2)                                                                                            |
| C34 | EMPIRICAL | Does the advisory generator keep a pathname containing a newline as ONE record? (round-1 N2)                                                                            |
| C35 | EMPIRICAL | Is each row of this table one independently falsifiable question, with the three compound rows round 1 named now split? (round-1, atomicity)                            |
| C36 | EMPIRICAL | Is a false claim present ONLY in the live PR body outside the blocking path, and is that boundary measured and stated rather than implied?                              |
| C37 | EMPIRICAL | Does every constructed state round 1 reported as a false accept now go RED, with the green control still GREEN?                                                         |
| C38 | EMPIRICAL | Are the hostile cases RE-RUN by the gate on every `./tools/checks`, rather than recorded as prose nobody executes again?                                                |
| C39 | NORMATIVE | The agent never merges, and the owner alone decides whether this correction warrants another independent round. (`OPERATING_AGREEMENT.md` §3(d))                        |
| C40 | EMPIRICAL | Was N1's CLASS — a git command that defines a population failing silently — swept in the TypeScript detector too, not only in the shell script it was reported against? |

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

## ⚠⚠ The standing consequence of the round-1 M3 repair — an owner decision

Binding the certificate to a base/head lifecycle is what stops a later branch
inheriting a green ledger. It also means that **once this lands, any branch with
work to certify owes its own commission and its own regenerated ledger**: a
different merge base and a different commit-message range make an inherited
certificate stale, and the gate stays red until it is rebuilt. That is the
repair working as specified. It is also a real, permanent tax on every future
PR, and whether to accept it is the owner's call, not the author's.

The one exemption is decidable from Git rather than from the artifacts: when
`merge-base(base, HEAD) == HEAD` and the tree is clean — `main` after a merge,
which is what keeps the post-merge CI push build green — there is no branch work
to certify and the commission is not required.

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

1. **"The commission is now the population."** It is the _written_ population,
   and only deletion-resistant _after_ a reviewer deliverable exists on the
   branch. See the KNOWN-OPEN residue above.
2. **"Fail-closed in CI."** `fetch-depth: 0` is verified against the workflow
   file, a constructed shallow clone, and a real Actions run on this PR. Forks
   remain unverified.
3. **The lifecycle binding is only as good as its inputs.** `base commit` and
   `commit-message range` are recomputed from Git, but an author who rewrites
   branch history can still regenerate a self-consistent certificate. The
   binding stops INHERITANCE and STALENESS, not a determined rewrite.
4. **`--no-merges` in the message-range hash is load-bearing and thinly
   tested.** It exists so a `pull_request` build's synthetic merge commit does
   not enter the range. It is verified by one real CI run, not by a matrix.
5. **The disposition matrix constrains the LABEL, not the sentence.** Nothing
   stops an author writing a broad, evasive assertion in an evidence cell and
   calling it `PASS`.
6. **`HAVDM_BASE_REF` is a test hook and therefore an escape hatch.** It exists
   so hostile fixtures can pin a base, and CI does not set it — but an author
   who set it to their own HEAD would make `hasBranchWork` false and skip the
   commission checks entirely. Such an author could equally delete the spec, so
   this is not a new capability; it is named here rather than left for the
   reviewer to find, because "an unknown population must never present as an
   empty one" is this mechanism's own rule and the hook bends it.
7. ⚠ **THE MONOTONIC ANCHOR IS KEYED ON A FILENAME GLOB, and a naming
   convention is a weak thing for a security property to rest on.**
   `reviewedCommissionSnapshot()` looks for commits touching
   `docs/reviews/*-review.md`. A reviewer deliverable named anything else is
   not an anchor and the deletion check silently has nothing to compare
   against — the "a mechanical sweep is only as good as the key it is keyed on"
   hazard, applied to my own repair. The obvious broadening, "any commit
   touching `docs/reviews/`", is WRONG: it would make the author's own
   commission commit an anchor and forbid the narrowing-and-splitting this very
   round performed on C02, C05 and C06. I have no better key and am shipping
   the glob; whether that is acceptable is a design question for the reviewer
   and ultimately the owner.
8. **A reviewer's own commit now turns the gate RED until the author
   re-certifies.** Committing a review document changes the commit-message
   range, so the certificate is stale by design. That is the intended reading
   of "a gate result is pinned to one commit, and ordinary workflow actions —
   a reviewer's fix commit — move it", but it is operationally sharp and it is
   new in this round.

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
