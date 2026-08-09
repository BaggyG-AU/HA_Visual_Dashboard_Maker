Author: Claude Opus (claude-code)
Reviewer: OpenAI Codex
Owner gate: micah/BaggyG-AU

# Commission — the author self-pass gate, second attempt

This is a **tracked** commission. It exists because the first attempt at this
mechanism was withdrawn, and merge-blocker **M3** of that review
(`docs/reviews/self-pass-gate-adversarial-review-codex.md`, commit `c8678d2`)
was that the gate never read the commission at all — commissions lived in
`prompts/`, which `.gitignore` ignores wholesale, so the validator could only
check rows the author chose to supply.

The repair is this file. `tests/unit/author-ledger.spec.ts` parses the
**Commissioned checks** table below and requires one atomic ledger row per ID.
Deleting a row from the ledger now turns the gate red.

## ⚠ What this does NOT fix, stated before anything else

**A committed commission cannot stop an author never writing a question down.**
If a check is absent from the table below, no mechanism here notices. What the
change buys is narrower and worth stating exactly:

- the commissioned population becomes **mechanically enumerable** rather than
  remembered, so a question that IS written cannot be silently dropped later;
- deleting a commissioned question is now **a tracked diff** the reviewer sees,
  not an edit to a file nobody else reads;
- the reviewer can check the commission against the review and ask "why was
  this not asked?" — previously impossible, because the commission was local.

**That is a visibility change, not a completeness guarantee.** Do not describe
it as closing the omission class.

## Commissioned checks

Each row is one question. `tests/unit/author-ledger.spec.ts` requires exactly
one ledger row per ID in `docs/reviews/self-pass-gate-author-ledger.md`.

| ID  | Check                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01 | Does the certified target actually cover branch commit messages, so a content commit cannot leave a green certificate valid? (M1)                           |
| C02 | With no resolvable base ref, does the detector FAIL rather than skip, and does CI now resolve one? (M2)                                                     |
| C03 | Are the required ledger rows derived from THIS committed commission rather than from the ledger itself? (M3)                                                |
| C04 | Does governed-change discovery decompose renames and see the PREIMAGE, not only the destination? (M4)                                                       |
| C05 | Does the fingerprint cover untracked governed additions, and file mode as well as content? (M4)                                                             |
| C06 | Is the live PR-body read mandatory where the ledger claims it, and does a `gh` failure propagate instead of passing empty? (M5)                             |
| C07 | Does the gate go RED when a commissioned question has no ledger row — proven on known-bad input, not asserted? (M3)                                         |
| C08 | Is the ledger REGENERATED for this branch rather than copied from PR #140?                                                                                  |
| C09 | Does the PR body avoid claiming the PR #140 M1 class is addressed, given the append-only observation control is deliberately not built yet?                 |
| C10 | Does anything in this PR place normative text in `docs/governance/**`, `ai_rules.md` or `CLAUDE.md`, which would make a defect here a governance amendment? |

## Named hostile cases

Construct these; do not reason about them.

1. **Rename across the governed boundary.** `git mv` a file from
   `docs/governance/` to `docs/reviews/`, commit, and confirm the detector sees
   the preimage and demands a ledger. The first attempt failed exactly here, and
   that defect was itself a verbatim repeat of PR #139's R4-M1.
2. **Untracked governed addition.** Create an untracked file under
   `docs/governance/`, and confirm the fingerprint changes.
3. **Mode-only change.** `chmod +x` a governed file with identical content, and
   confirm the fingerprint changes.
4. **Shallow clone.** Clone `--depth 1 --single-branch` so no base ref exists,
   run the suite, and confirm it FAILS rather than exiting 0.
5. **Commission row deleted.** Remove a row from the table above and confirm the
   gate goes red — the M3 closure, and the one that must be demonstrated rather
   than argued.
6. **Post-commit red.** Commit a message containing an undispositioned claim
   candidate and confirm the certificate is invalidated rather than surviving.

## The author's weakest claims — attack these first

1. **"The commission is now the population."** It is the _written_ population.
   An unwritten question is still invisible, and no row here changes that.
2. **"Fail-closed in CI."** Verified against `fetch-depth: 0` on one workflow
   file; not verified on a hosted runner, and not on forks, where the base ref
   may still be absent.
3. **"The ledger rows are atomic."** Enforced as one row per commissioned ID.
   Nothing stops an author writing a broad, evasive assertion inside a row —
   atomicity of ROWS is mechanical, honesty of CONTENT is not.
4. **The disposition list still permits `DISCLOSED`.** The prior review warned
   this can become a pass route. It is retained but may not be self-awarded for
   an in-scope residue; whether that restriction is real or cosmetic is worth
   attacking.

## Required reading

- `docs/reviews/self-pass-gate-adversarial-review-codex.md` — the review that
  withdrew attempt one, with all five merge-blockers.
- `docs/governance/OPERATING_AGREEMENT.md` §3 — governed classes, and §3.4's
  class (d): this PR draws one full independent review before merge.
- `docs/testing/TESTING_STANDARDS.md` — the evidence-surfaces section merged in
  PR #138, and the DEFINITION OF DONE list.

## Governing rules quoted verbatim, because the reviewer has no MemPalace access

> **A validator that checks only the rows the author supplied cannot
> distinguish a completed commission from one whose hardest question was
> deleted.** Put the commissioned checks in a tracked, mechanically enumerable
> surface, require unique atomic rows, and prove the validator goes red when a
> known question is removed.

> **A gate cannot certify input that only comes into existence after the gate
> runs.** Ask separately: at what moment does each input exist, and at what
> moment is the certificate computed? Anything to the right of the certificate
> is outside it.

> **A check is evidence only for the property it exercises — and so is a
> reviewer's clearance.** Ask "if this claim were false, would what I ran have
> failed?"

> **A finding is a SAMPLE, not the population.** A mechanical sweep is only as
> good as the key it is keyed on; state the class as a behaviour before choosing
> a search key, and read the surface end to end.
