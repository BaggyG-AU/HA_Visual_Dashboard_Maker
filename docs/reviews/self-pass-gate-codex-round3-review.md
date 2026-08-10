Author: Claude Opus (`bdb8bac`, PR #141 reduction author)
Reviewer: OpenAI Codex, independent reviewer; did not author the reduction
Owner gate: BaggyG-AU reads PR #141 and this review together; only the owner signs off and merges

# Independent review — author self-pass gate, round 3

## Independent account and attack list — written before reading the round-3 commission or ledger

This is the required de-biased first pass. I first reread the complete round-2
review and then read the reduction diff plus the reduced detector and its two
specs. I had **not** opened the current commission or author ledger when I
wrote this section.

### What the reduced mechanism does

The reduction removes the commit-message/base lifecycle certificate and the
`docs/reviews/*-review.md` monotonic snapshot entirely. The remaining
certificate compares only a governed-path fingerprint over index, working-tree
and untracked facts. A new `owesLedger` boolean narrows the blocking obligation
to branches with work whose net changed-path set intersects governed paths or
six enumerated gate-owned paths. Every check is composed by `runGate()`.

For an obligated branch, `checkLedgerFreshness()` requires the ledger path to
appear in the branch/dirty changed set. This is deliberately visibility only:
it proves a net ledger edit exists, not that evidence was re-run or that any
other branch content is bound. Commission parsing, bidirectional row coverage,
the disposition matrix, owner citations, count-shaped commit-message candidates
and the governed fingerprint remain. The hostile fixtures add scoped ordinary,
gate-own and deletion branches and expand the disposition/kind exercise to all
twelve cells plus a six-key matrix guard.

### My attack list before comparison

1. **Does the scoped obligation actually scope every composed check?**
   `checkCommitMessageCandidates()` has no `!ctx.owesLedger` return. An ordinary
   later branch can touch only an unrelated path, owe no ledger, and still go
   red solely because its commit message contains a count-shaped claim. That
   would contradict the new claim that the gate says nothing about such a
   branch. The published unrelated-branch fixture uses a message with no count
   candidate, so it does not exercise this boundary.
2. **Did the certificate deletion sweep consequences rather than names?** The
   surviving detector comment above `checkCommitMessageCandidates()` says a
   message-range hash "below catches STALENESS" and that a count-free later
   commit "is now caught by the message-range hash". The blocking spec still
   titles `checkCertificate()` as bound to "this base, this message range and
   this working tree". All three statements describe deleted behaviour. I will
   sweep detector docblocks, assertion titles/errors, commission, ledger and
   live PR prose for equivalent claims that do not reuse those exact tokens.
3. **Is `GATE_OWN` the actual behavioural population?** The list includes the
   detector, two specs, commission, ledger and advisory worklist, but not the
   runners/configuration that determine whether those specs execute (at least
   `tools/checks`, the package test script and Vitest configuration). I will
   distinguish a deliberately enumerated narrow scope from the broader phrase
   "this gate's own files", and attack whether an omitted execution surface can
   change the mechanism while `owesLedger` stays false.
4. **Does `checkLedgerFreshness()` do exactly its small advertised job?** I
   will test inherited ledger, dirty/staged/committed edit, deletion, rename,
   edit-then-revert and a later branch whose only relevant change is gate-own.
   The check should prove only a net visible ledger change. Any claim of re-run,
   evidence freshness, branch binding or historical touch would be overreach.
5. **Can deletion of either artifact escape scoping?** Because both paths are
   in `GATE_OWN` and changed-path parsing includes rename preimages, commission
   deletion, ledger deletion and rename-out should all keep `owesLedger` true
   and fail through the owning input/coverage checks. I will drive those states
   through the real detector, not infer them from the regex list.
6. **Was something load-bearing over-cut?** The monotonic anchor was not
   trustworthy authority and the message hash was not a tree binding, so their
   security claims deserved removal. Their useful residual effects were
   visibility of post-review question deletion and invalidation after any later
   commit. I will check that every lost effect is disclosed at full size and
   that no surviving row, error or workflow still assumes either effect.
7. **Does C22 really enumerate all twelve cells?** I will enumerate the six
   dispositions against both kinds from the test cases and confirm the guard's
   six keys match the source matrix. A single baseline test can exercise two
   green cells, but each cell must be independently identifiable and a false
   cell must fail the named disposition check rather than some unrelated leg.
8. **Are the first five `OWNER-ACCEPTED` uses evidence or laundering?** The
   parser only requires the substring `owner:`; the human citation and the
   truth/size of each residue therefore carry the real load. I will trace C18,
   C24, C45, C46 and C47 to the owner's actual ruling and judge their aggregate
   effect as well as each row.
9. **Did the earlier repairs survive the scope returns?** Every early return is
   a new bypass opportunity. I will re-run no-base failure, rename preimage,
   malformed fingerprint, governed working-tree/index/untracked states, shell
   Git failure and internal rename framing, and verify M4/N1/N2 by the exact
   property rather than by a general green suite.

These are hypotheses, not findings. The remainder of this document compares
them with the now-unquarantined commission/ledger and tests them against real
Git state.

## Verdict first

**CHANGES-REQUIRED.** The reduction correctly removes two unsound mechanisms,
keeps the round-1 repairs, and completes C22's present twelve-cell population,
but the new scoped obligation is not actually scoped: an unrelated branch that
owes no ledger still goes red on a count-shaped commit message. The claimed
withdrawal is also incomplete across the committed artifact—C43 is a false
`FIXED`, because the detector, blocking assertion, commission and ledger still
describe behaviour of the deleted lifecycle/anchor mechanisms.

## Round-2 finding disposition

| Round-2 finding                                    | Verdict                                 | Independent evidence                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M1 — certificate did not bind HEAD/tree            | **PARTIALLY RESOLVED**                  | The base/message fields and executable hash are gone, and the surviving fingerprint claim is narrow at `tests/support/authorLedger.ts:649-669`. The withdrawal is not complete: the same file still says a deleted hash catches staleness (`:617-626`), the blocking assertion still names base/message binding (`tests/unit/author-ledger.spec.ts:93`), and the ledger still claims a lifecycle binding (`docs/reviews/self-pass-gate-author-ledger.md:212-214`). |
| M2 — reviewer anchor was author-controlled/ID-only | **PARTIALLY RESOLVED**                  | The anchor functions and imports are gone, and the cut site records both bypasses (`tests/support/authorLedger.ts:476-506`). The commission still says `checkCommissionMonotonic()` protects post-review deletion and limits the residue to pre-review time (`docs/reviews/self-pass-gate-codex-commission.md:136-151`); the ledger repeats that narrower limit (`docs/reviews/self-pass-gate-author-ledger.md:202-207`).                                          |
| M3 — C22 falsely claimed the full matrix           | **RESOLVED for the present population** | Independent enumeration found all twelve disposition/kind cells at `tests/unit/author-ledger-fixtures.spec.ts:316-381`; the source matrix has exactly the six named keys (`tests/support/authorLedger.ts:123-130`); the two load-bearing specs passed 49/49. The separate claim that the six-key guard prevents fixture drift is too broad; see N2.                                                                                                                |

## Comparison with the author's account

### Agreement

- Cutting the unauthenticated reviewer anchor was correct. Its only useful
  effect was a contingent red state, not reviewer authority or question
  identity. No replacement heuristic should be added.
- Cutting the message/base certificate was correct. Feasibility of a stable
  message hash did not make it a tree binding. The governed fingerprint remains
  an honest, useful certificate when described only as such.
- `checkLedgerFreshness()` is narrow in executable behaviour: it requires a net
  changed-path fact for the ledger and does not prove execution, evidence
  freshness, branch content or HEAD.
- The known-open question deletion/replacement state is real and now correctly
  green in the hostile fixture. The five `OWNER-ACCEPTED` rows describe real
  residues rather than pretending they were repaired.
- C22's current twelve cells are present. Round-1 M4, N1 and N2 and the no-base,
  rename-preimage and malformed-fingerprint controls survived the reduction.

### Disagreement and cases found in only one direction

The author says the new `owesLedger` condition makes the gate silent on an
ordinary branch. That is false for count-shaped commit messages: the candidate
check is outside the scope return. This case was absent from the author's
scoping fixture because its commit message contains no candidate.

The author reports C43 `FIXED` after a four-surface sweep. Reading those
surfaces end to end, rather than repeating its search tokens, found old
consequences in all four committed surfaces. The live PR body's explicit claim
that the old wording is gone from code, commission, ledger and body is therefore
false too.

The author's valuable cases that were not on my initial list are C47—the
growing ledger auto-satisfies count candidates by substring—and the retired
external inheritance fixture whose base no longer models inheritance. I agree
with both disclosures. My independent list additionally found the current
execution-chain omissions from `GATE_OWN` and the six-key C22 guard's inability
to notice a deleted cell test.

## Regression sweep

- **Round-1 M4 — RESOLVED, no regression.** The 49-test run exercised unstaged
  content, deletion and mode; staged mode; untracked addition; and symlink type
  against `checkCertificate()` (`tests/unit/author-ledger-fixtures.spec.ts:439-476`).
- **Round-1 N1 — RESOLVED, no regression.** In an isolated clone, a resolvable
  parentless `unrelated` ref made `tools/claims-worklist.sh --changed-only`
  return exit 2 with “shares no merge base”, not exit 0 with an empty population.
- **Round-1 N2 — RESOLVED for the stated internal population.** A staged rename
  emitted both the governed preimage and review-path destination. A newline-
  bearing renamed path remained one Bash-array entry: the banner reported two
  paths for the rename's two records. Public `--changed-only` display remains
  newline-delimited, exactly as round 2 recorded.
- **No-base fail closed — no regression.** The hostile fixture deletes the
  resolvable base and observes `loadContext()` throwing
  (`tests/unit/author-ledger-fixtures.spec.ts:490-495`); it passed in the 49-test
  run.
- **Rename preimage — no regression.** The committed rename control asserts the
  governed source path is in `ctx.changed` and makes the obligation fail when
  the commission is removed (`tests/unit/author-ledger-fixtures.spec.ts:479-487`).
- **Malformed fingerprint — no regression.** Both malformed and missing
  declarations drive `checkCertificate()` red
  (`tests/unit/author-ledger-fixtures.spec.ts:421-431`).

## Findings

### M1 — MERGE-BLOCKING: the scoped obligation still rejects an out-of-scope branch

**Evidence.** `loadContext()` defines the new scope as branch work whose changed
paths intersect governed or `GATE_OWN` paths
(`tests/support/authorLedger.ts:379-403`). Four checks return immediately when
`ctx.owesLedger` is false (`:436-438`, `:525-527`, `:538-540`, `:671-673`), but
`checkCommitMessageCandidates()` does not (`:617-647`). `runGate()` calls it
unconditionally (`:696-707`). The authored ordinary-branch fixture uses
`chore: an ordinary unrelated change`, which does not exercise the count leg
(`tests/unit/author-ledger-fixtures.spec.ts:200-212`).

In an isolated shared clone, I set `origin/main` to `bdb8bac`, made a later
branch change only the mode of unrelated `package.json`, and committed it as
`chore: 991 tests passed`. `package.json` matches neither scope predicate. The
real blocking spec returned **exit 1, 8 passed / 1 failed**, solely because
`checkCommitMessageCandidates()` reported `991 tests` undispositioned. That is
a false rejection against the live PR body's claim that an ordinary branch
owes nothing and the gate is silent.

**Fix.** Return `[]` from `checkCommitMessageCandidates()` when
`!ctx.owesLedger`, and add a hostile fixture combining an unrelated changed path
with a unique count-shaped commit message. Assert `hasBranchWork=true`,
`owesLedger=false`, the candidate check empty, and the whole gate green. Keep a
paired obligated-branch count case red so the fix cannot disable M1 globally.

**Class swept.** I inspected all eight functions composed by `runGate()`. Four
have explicit scope returns; `checkGovernedObligation()` is naturally limited
by governed paths; disposition/owner checks inspect inherited valid artifacts
but remained empty; the commit-message check is the one observed scope leak.

### M2 — MERGE-BLOCKING: C43's completed-withdrawal claim is a false `FIXED`

**Evidence.** The committed ledger says every surviving detector, commission,
ledger and live-PR surface was rewritten or deleted
(`docs/reviews/self-pass-gate-author-ledger.md:85`). The surviving record says
otherwise:

- detector: a deleted message-range hash “below catches STALENESS” and “now
  catches” count-free later commits (`tests/support/authorLedger.ts:617-626`);
- blocking spec: the governed-only certificate is still titled as bound to
  “this base, this message range and this working tree”
  (`tests/unit/author-ledger.spec.ts:93`);
- commission: post-review deletion is still said to be caught by the deleted
  `checkCommissionMonotonic()`, with only pre-review deletion open
  (`docs/reviews/self-pass-gate-codex-commission.md:136-151`), and the hostile
  inventory says every listed case is a current test before listing the removed
  post-review case (`:183-199`);
- ledger: its limitation section repeats the pre-review qualifier and says a
  lifecycle binding still stops inheritance and staleness
  (`docs/reviews/self-pass-gate-author-ledger.md:202-214`);
- live PR body: line 37 says that wording is gone from code, commission, ledger
  and body, while the four records above remain.

This is not historical text clearly labelled as history: these statements
describe present behaviour in current assertion titles, limitations and
claimed sweep evidence. They directly contradict the honest narrower sections
beside them and make C18's “nothing claims otherwise” evidence false.

**Fix.** Correct each present-tense survivor without restoring either deleted
mechanism. Replace the commission/ledger deletion boundary with “at any time”;
remove the old lifecycle statement; retitle the blocking assertion as governed-
tree-only; and rewrite the candidate docblock to say the count-free case is
accepted. Regenerate C43 as a labelled hand trace over every surviving
governing surface rather than another token-only grep.

**Class swept.** I stated the class as every surviving obligation, exception,
assertion and limitation whose truth depended on the deleted anchor or message
certificate. I searched by old names, by effects such as post-review deletion,
later-commit invalidation/inheritance and fresh execution, and by executable
consumer symbols; then read the five changed files and live PR body end to end.
The affected present-tense members are enumerated above. The two cut-site
history blocks themselves are correct and should remain.

### N1 — NON-BLOCKING: `GATE_OWN` understates its current execution boundary

`GATE_OWN` is described as “This gate's own files” and its docblock says changing
the mechanism obliges a ledger (`tests/support/authorLedger.ts:72-87`). It
includes the advisory `tools/claims-worklist.sh`, but omits current surfaces that
decide whether the blocking specs execute: `tools/checks:22`,
`package.json:27`, `vitest.config.ts:3-9`, and `.github/workflows/ci.yml:46-49`.
The commission itself relies on those links in C11 and C38. The weakest-claim
section frames this as a future seventh-file growth risk, but omitted execution
surfaces already exist.

Because a local Vitest check cannot protect itself after its runner is disabled,
expanding the list is not automatically a sound fix. Either define and test an
exact current population that includes direct execution surfaces, or shrink the
claim to “six enumerated author artifacts” and name runner/config/test-deletion
as outside the mechanism. Do not imply tamper resistance a self-executing test
cannot supply.

**Class swept.** I traced the local and hosted execution chains from the two
specs through Vitest configuration, package script, local gate and CI workflow.

### N2 — NON-BLOCKING: C22 is complete now, but its advertised guard does not guard cell coverage

All twelve current cells are present. However, the final “guard” asserts only
that `DISPOSITION_MATRIX` has six named keys
(`tests/unit/author-ledger-fixtures.spec.ts:394-403`). Deleting, for example,
the `NORMATIVE + FIXED` test leaves that guard green. The fixture comment says
the cell count is asserted and cannot drift (`:302-314`), while the commission
and ledger repeat that stronger prevention claim.

Generate the cell tests from an explicit six-by-two case table and assert that
table equals the matrix-key/kind cross-product, or narrow the prose to the true
claim: the guard catches a new disposition key, while reviewers must still
enumerate cell tests. Preserve the current twelve cases.

**Class swept.** I mapped each of the six source dispositions to EMPIRICAL and
NORMATIVE fixture cases; no present cell is absent. The defect is the guard's
claimed future detection property, not the current matrix implementation.

### N3 — NON-BLOCKING: the live and committed branch inventories are one commit short

`git rev-list --count 9e95e4c..HEAD` returns **5**, and the ordered enumeration
is `2bd1aa7`, `90cc492`, `99a3080`, `3343530`, `bdb8bac`. The live PR body opens
with “Four commits” while its own table has those four named commits plus
`head`. The ledger likewise says its candidate population spans “this branch's
four commits” (`docs/reviews/self-pass-gate-author-ledger.md:134-139`) and omits
the round-2 review from that prose inventory.

Correct or remove the static totals and enumerate directly from Git. This is a
record defect rather than a detector defect; the lexical candidate key does not
match the word “Four”, which is consistent with its disclosed non-exhaustive
scope.

## `OWNER-ACCEPTED` class verdict

| Row | Verdict           | Reason                                                                                                                                                                                                                    |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C18 | **PARTLY HONEST** | The anchor is gone and question deletion is open at any time; that residue and the owner's reduction choice are real. The row's “nothing claims otherwise” sentence is refuted by M2's surviving commission/ledger prose. |
| C24 | **HONEST**        | A later count-free commit no longer has a message-range invalidator. The row does not claim the count candidate is exhaustive.                                                                                            |
| C45 | **HONEST**        | Same-ID semantic replacement remains green and is disclosed at full size; the human-visible diff is accurately identified as the remaining protection.                                                                    |
| C46 | **HONEST**        | The governed-only fingerprint excludes non-governed tree content and no remaining certificate claims otherwise in its primary implementation block.                                                                       |
| C47 | **HONEST**        | Substring satisfaction is measured and the ledger's growth really weakens this leg; it is explicitly accepted rather than called repaired.                                                                                |

All five cite the same owner reduction decision; they are not five independent
authorities. Taken together, owner acceptance is load-bearing for question
deletion/replacement, non-governed tree blindness and substring claim matching.
That is acceptable only because the owner gate is explicitly human and the
residues are visible; it is not mechanical clearance. M2 must be corrected so
the human record does not contradict the very residues being accepted.

## Under-reach and round-count verdicts

**Nothing security-bearing was over-cut.** The reviewer anchor never
authenticated a reviewer or question content, and the message hash never bound
the tree. Their red effects—post-review ID deletion and generic later-commit
invalidation—were contingent and weaker than their claims. Removing them is
the right design choice; the defect is incomplete disclosure of the loss, not
the deletion itself.

The new replacement under-reaches in two places: the scoped obligation leaks
one active check outside its boundary (M1), and its “gate-own” label is wider
than the six enumerated author artifacts (N1). `checkLedgerFreshness()` itself
does not overreach in code; its narrow visibility claim is supportable.

**Round-count diagnostic.** The dominant round-3 shape is again fix-generated
new work: the newly introduced scope forgot one composed check. The other
merge-blocker is a deletion sweep keyed on vocabulary rather than consequences,
so old present-tense claims survived beside corrected ones. This is not a reason
to rebuild either cut mechanism; it calls for one scope fix and one end-to-end
record sweep. The repeated false evidence—C22 in round 2, C43 and the commit
inventory here—is also the same author-claim discipline recurring across
different subjects.

## Required §3.5 reruns and independent attacks

### 1. Two load-bearing specs

```text
$ npm run test:unit -- tests/unit/author-ledger.spec.ts tests/unit/author-ledger-fixtures.spec.ts
Test Files  2 passed (2)
Tests       49 passed (49)
  blocking spec: 9 passed
  hostile fixtures: 40 passed
REAL_EXIT=0
```

This verifies the checked-in instrument and the current twelve-cell population;
it does not clear the different scoped-commit state used for M1.

### 2. Deeper/different scope and shell attacks

Every mutation below was confined to an isolated `/tmp` shared clone and drove
the real detector or advisory script rather than a reimplemented parser.

| Constructed state beyond the author's table                                                                 | Real result                           | Verdict                   |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------- |
| Later branch, base=`bdb8bac`, only unrelated `package.json` mode changed, message=`chore: 991 tests passed` | blocking spec exit 1; 8 pass / 1 fail | **False rejection — M1**  |
| Resolvable parentless base ref                                                                              | advisory script exit 2                | N1 shell repair holds     |
| Staged governed rename to `docs/reviews/`                                                                   | source and destination both emitted   | N2 rename repair holds    |
| Rename destination contains a newline                                                                       | banner reports two path records       | N2 internal framing holds |

There is no stochastic mechanism here for which repeated identical greens
would add evidence. I therefore used the prompt's “further or differently”
route: the author exercised an unrelated branch with a count-free message; I
combined that scope with the still-active count leg and exposed the interaction.

### 3. Full repository gate

The completed review document was present but uncommitted for this run, as the
commission requires.

```text
$ ./tools/checks
lint:        0 errors / 145 warnings
format:      clean
typecheck:   clean
unit:        1384 passed across 103 files
REAL_EXIT=0; 4/4 steps reached and passed
```

The watched `tests/unit/DeployDialog.spec.tsx` file passed 11/11 in that run;
the flake did not fire, so no discrimination or rerun was needed.

### Additional checks

- `gh pr checks 141` — hosted `ci` is **pass** at `bdb8bac`.
- `bash tools/claims-worklist.sh --require-pr 141` — exit 0; the live PR body
  was read. Its numeric grep does not match the word “Four”.
- `bash tools/check-pr-evidence.sh 141` — exit 0; the SHA section reports the
  five historical pins as ancestors, consistent with their deliberately
  historical table roles rather than current-head claims.
- `git diff --stat 3343530..bdb8bac` independently matches **5 files changed,
  684 insertions, 495 deletions**.
- E2E, integration, UAT, packaging and live Home Assistant were not run. Full
  e2e (307) and integration (235) remain **UNVERIFIED since PR #128**. No
  `src/` path changed, so neither suite decides this unit/tool/docs reduction.

## Claim ledger

| #   | Claim                                                                   | Tag                  | Evidence                                                                                                  |
| --- | ----------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Both load-bearing specs are green at 49/49.                             | MEASURED             | Required command above, exit 0.                                                                           |
| 2   | An out-of-scope count-shaped branch is rejected.                        | MEASURED             | Isolated real-spec attack: exit 1, exactly the candidate assertion failed.                                |
| 3   | C43's completed sweep is false.                                         | MEASURED             | End-to-end source trace and cited present-tense survivors in four committed surfaces plus live PR body.   |
| 4   | C22 currently has all twelve cells.                                     | MEASURED             | Complete title/source enumeration at the cited lines and 40-fixture run.                                  |
| 5   | C22's guard cannot detect deletion of a cell test.                      | INFERRED from source | Its only assertion compares six matrix keys; no test-title/case population is an input.                   |
| 6   | M4, N1, N2, no-base, rename and malformed-certificate repairs survived. | MEASURED             | 49-test run plus isolated shell controls.                                                                 |
| 7   | Five `OWNER-ACCEPTED` rows rely on one owner reduction decision.        | INFERRED / JUDGEMENT | Row citations and live PR body consistently state that decision; their adequacy remains owner-controlled. |
| 8   | This head should not merge unchanged.                                   | JUDGEMENT            | Two merge-blocking findings; owner arbitration remains controlling.                                       |

**Weakest claims.** N1's definition of “gate-own” has a design boundary: a
local test cannot enforce anything after its runner is disabled, so the sound
repair may be narrower disclosure rather than a larger regex list. I verified
current C22 cell presence by source enumeration and execution, not by mutating
the suite to delete a cell. The owner citations are internally and live-PR
consistent, but I did not authenticate them against a signed external ruling.

## Directions

Do not restore either deleted mechanism. First scope the count-candidate check
with `owesLedger` and add the paired hostile fixture. Then correct the complete
class of stale lifecycle/anchor consequences in the detector, assertion title,
commission, ledger and live PR body; regenerate C43 as a hand trace. Narrow or
define `GATE_OWN`, and either make C22's guard actually enumerate the cross-
product or shrink its prose.

Land any correction as a new author commit. Do not amend or squash the five
commits under review or this reviewer-authored document. The owner alone decides
whether that post-review change warrants another round.

## Verification boundary

I read both prior reviews, the complete reduction diff and all five changed
files, `tools/claims-worklist.sh`, Operating Agreement §3, and all reviewer-
facing template rules. I read the live PR body and hosted check state, ran the
two load-bearing specs, executed a different real-gate scope attack, repeated
the shell regression controls, and ran the repository gate with this document
uncommitted.

I did not run e2e, integration, UAT, packaging, Home Assistant, forks or a
Git/version matrix. I did not independently reproduce every author attack-table
row; the 40 hostile fixtures cover those checked-in states, while my deeper
budget went to the new scope interaction. Every mutation outside this review
file was confined to isolated temporary clones.

## MemPalace drawer candidates

- `wing="havdm"`, `room="review"`, `added_by="codex"` — `[REVIEW] PR #141
SELF-PASS GATE ROUND 3 — CHANGES-REQUIRED. Reviewed reduction bdb8bac against
round-2 review 3343530. The two unsound anchor/certificate mechanisms are
correctly cut; C22 currently enumerates all twelve cells; round-1 M4/N1/N2
and no-base/rename/malformed repairs survive. Merge blockers: (M1) an
unrelated branch with owesLedger=false still fails on a count-shaped commit
because checkCommitMessageCandidates ignores scope; real spec 8 pass/1 fail.
(M2) C43 is a false FIXED: detector, blocking title, commission and ledger
retain present-tense consequences of deleted mechanisms, and the live PR body
falsely says all were removed. Targeted 49/49; full gate recorded above.
Only the owner arbitrates and merges.`
