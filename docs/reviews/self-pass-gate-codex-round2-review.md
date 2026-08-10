Author: Claude Opus (`99a3080`, PR #141 round-2 fix author)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author the fix
Owner gate: BaggyG-AU reads PR #141 and this review together; only the owner signs off and merges

# Independent review — author self-pass gate, round 2

## Independent account and attack list — written before reading the round-2 commission or ledger

This is the required de-biased first pass. I first reread the complete round-1
review, then read the fix diff and the final mechanism files:
`tests/support/authorLedger.ts`,
`tests/unit/author-ledger-fixtures.spec.ts`, the thin blocking spec, and the
shell generator. I had **not** opened the round-2 commission or author ledger
when I wrote this section.

### What the repaired mechanism does

The Vitest gate now delegates to one detector module whose checks return
failure lists. `loadContext()` resolves a base and merge base, enumerates
committed/index/worktree/untracked changes, and treats either commits ahead or
a dirty tree as `hasBranchWork`. Branch work makes a parseable, non-empty,
uniquely identified, typed commission and a matching ledger mandatory.

Commission rows are typed `EMPIRICAL` or `NORMATIVE`; a disposition matrix
constrains the passing labels. A monotonicity check searches the branch for the
newest commit touching `docs/reviews/*-review.md`, reads the commission at that
commit, and rejects IDs missing from the current commission. The certificate
compares a governed-path fingerprint, merge-base commit, and SHA-256 of
non-merge commit-message bodies. Governed fingerprint entries separately
record index (`I`), tracked working-tree (`W`) and untracked (`U`) facts,
including type and mode.

The hostile-fixture spec exercises the same exported detector against a real
temporary Git repository. The shell generator now status-checks population-
defining Git calls and carries NUL-delimited rename records through its
internal array.

### My attack list before comparison

1. **The certificate still does not bind HEAD or the full branch tree.** Its
   only content hash covers governed paths. A message-preserving amend can
   change `src/`, tests, tools, commission, ledger prose, or any other
   non-governed content while base, message-range hash and governed fingerprint
   stay constant. The fixture that celebrates a green ledger-only amend appears
   to demonstrate this gap rather than merely hash stability.
2. **The certificate excludes its own commissioned inputs.** Commission and
   ledger content are not in the fingerprint. After certification, deleting a
   question and its ledger row is therefore green before a review anchor exists.
   That exact constructed state is closable by hashing normalized commission
   and ledger payload (excluding the self-referential certificate fields), even
   though never writing or pre-certificate deletion remains intrinsically open.
3. **The reviewer anchor authenticates a filename, not a reviewer.** Any author
   commit that adds or edits a matching `docs/reviews/*-review.md` becomes the
   newest anchor. After dropping a question, the author can create/touch such a
   file so its snapshot contains the already-narrowed commission—or no
   commission—and the older genuine reviewer snapshot is ignored.
4. **The monotonic check protects IDs, not questions.** Rewriting C02's text or
   kind to an unrelated valid question while retaining `C02` loses the reviewed
   question without a dropped ID. “May be narrowed and split, never deleted” is
   not a property this comparison can distinguish.
5. **A later branch may owe only three edited certificate lines, not a fresh
   execution.** Base/message mismatch makes inherited files red, but after
   recomputing the three declarations the old commission rows, dispositions and
   evidence can remain byte-for-byte inherited. The claimed permanent tax may
   be both broader and shallower than stated: every contributor/PR pays a file
   churn tax, while the gate cannot prove fresh execution.
6. **`--no-merges` is a trade, not a head binding.** It sensibly excludes a
   synthetic pull-request merge message, but also excludes real merge messages.
   More fundamentally, stable messages across an amend are deliberately
   accepted even when the amended tree changes. CI agreement does not establish
   certificate completeness.
7. **The certificate serialization is not record-framed.** Governed entries are
   sorted and joined with newline while Git paths may contain newline. The
   commit-message range is likewise a concatenated formatted stream. I would
   attack whether distinct record sets can serialize to the same bytes before
   calling either a population hash.
8. **The monotonic anchor can disappear by precedence.** If the newest matching
   review-path commit cannot show the commission, `reviewedCommissionSnapshot()`
   returns `null` instead of searching an older valid reviewer snapshot. A
   review-looking commit made after commission deletion may therefore erase the
   effective anchor.
9. **The permanent scope is repository-wide, not author-specific.** Once this
   unit test lands, unrelated feature, dependency, external-contributor and
   reviewer-only branches all have `hasBranchWork`; each must carry the fixed
   self-pass commission/ledger or recertify inherited artifacts. That is a
   policy mechanism introduced through an ordinary unit test, and its actual
   operational tax needs owner acceptance.
10. **Several hostile fixtures can be red for additional reasons.** The useful
    pattern is asserting the named check and the whole gate, but any fixture
    that commits a mutation also stales the message certificate. Each test must
    prove its named check fails; green controls must prove the intended
    timeline, not a different one.
11. **The shell tool's internal NUL framing is repaired, but its public
    `--changed-only` output is newline-delimited.** A legal newline-bearing path
    remains one Bash array item and then prints as multiple lines. The claim
    “NUL framing is preserved end to end” is broader than the implementation,
    even if downstream author-Markdown iteration remains safe.
12. **Regression surfaces still need direct attacks after extraction.** I
    would independently repeat no-base failure, committed rename preimage,
    malformed certificate input, all disposition combinations, unstaged
    content/delete/mode, and failed Git population calls. A fixture suite being
    green is not proof that the fixture represents the intended state.

These are hypotheses, not findings. The remainder of this document compares
them with the now-unquarantined commission/ledger and tests them against real
Git state.

## Verdict first

**CHANGES-REQUIRED.** The fix round closes the exact round-1 working-tree,
disposition, shell, no-base, rename and malformed-certificate cases, but the
new lifecycle mechanisms introduce two independently reproduced green bypasses:
the certificate does not bind the branch tree, and the “reviewer” anchor accepts
an author-created matching filename and protects IDs rather than questions. A
third merge-blocker is evidentiary: commissioned C22 is dispositioned PASS on a
claim that its own fixture inventory disproves.

## Comparison with the author's account

### Agreement

- Missing/heading-less/empty commission input and duplicate upstream IDs are
  now red. The specific assertions are not rescued by an unrelated certificate
  failure.
- The disposition matrix itself is a sound repair of the round-1 pass routes:
  `DISCLOSED`/`UNRUN` admit no kind, `NORMATIVE` admits only normative rows, and
  `PASS`/`FIXED` admit only empirical rows.
- The `I`/`W`/`U` governed fingerprint repairs the measured unstaged
  content/deletion/mode class, and the staged/untracked controls remain.
- A later branch inheriting the artifacts unchanged is red; a message-range
  hash is feasible and stable under a message-preserving amend; and
  `--no-merges` produced the same hash in my locally constructed synthetic
  pull-request merge.
- The filename glob is weak, a reviewer commit makes the gate red until author
  recertification, and a pre-review omission remains outside any self-authored
  population. The author disclosed all three boundaries.

### Disagreement and cases found in only one direction

The author's disclosure that a determined author can “regenerate a
self-consistent certificate” understates the defect. No regeneration is needed
after a same-message amend to any non-governed content: the existing certificate
stays green. Likewise, the filename weakness is not limited to a reviewer using
the wrong name; an author can create the **right** name and become the newest
snapshot.

I disagree with the `KNOWN-OPEN:` test's boundary. Never writing a question, or
deleting it before the first certificate and recomputing everything, is open.
The test does something narrower and later: it starts from a certified state,
then deletes a question and ledger row. That state is mechanically closable by
binding the certificate to its inputs, so asserting green makes the test and
the surrounding prose too broad.

The author's symlink-replacement fixture is the useful case I did not put on my
pre-author list. I also would not have prioritised `HAVDM_BASE_REF=HEAD`: the
prompt already concedes it as a test hook and an author able to set hostile CI
environment can remove the test. In the other direction, my independent list
found the full-tree amend, author-authored anchor, same-ID question rewrite,
recertification-only future branch and incomplete C22 matrix coverage; none is
in the published hostile table.

## Round-1 finding disposition

| Round-1 finding                                          | Verdict                                  | Independent evidence                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 — commission mandatory, unique and deletion-resistant | **PARTLY**                               | Existence, heading, non-empty table, kind and unique IDs are enforced. Ledger-only deletion is red. Deletion after a genuine review is caught only while that review remains the newest matching commit and the ID is removed; an author-created matching file and a same-ID rewrite both pass. |
| M2 — empirical residue self-passed through dispositions  | **PARTLY**                               | The matrix behaviour is repaired and the published targeted suite is green. C22's claim that every disposition is exercised against both kinds is false; four normative-kind cells are absent.                                                                                                  |
| M3 — certificate lacked a per-branch lifecycle           | **PARTLY**                               | Unchanged inheritance and later messages are red; amend-stable message hashing is feasible. A same-message amend can change the branch tree without invalidation, and a future branch passes after updating only two certificate lines while retaining all old commission/evidence.             |
| M4 — tracked working-tree state omitted                  | **RESOLVED**                             | The module reads index and actual working-tree type/mode/content separately; 34-fixture rerun includes unstaged edit, deletion and chmod plus staged/untracked controls. No affected storage state was found outside those legs.                                                                |
| N1 — population-defining Git failures were swallowed     | **RESOLVED**                             | A resolvable unrelated ref now returns shell exit 2. TypeScript population logs use throwing `git()`; the two remaining `tryGit()` calls are the ref probe and a legitimately absent historical commission.                                                                                     |
| N2 — dirty rename and newline framing                    | **RESOLVED for the internal population** | My staged rename emitted both source and destination. NUL framing reaches the Bash array. The human `--changed-only` display remains newline-framed, but ledger C34 states that limitation and measures the internal banner count instead.                                                      |

## Regression sweep of round-0 repairs

- **No-base fail closed — RESOLVED, no regression.** In an isolated clone I
  deleted both `main` and `origin/main`; the real blocking spec returned exit 1
  at suite collection with `No base ref resolves`, not a skip.
- **Rename preimage — RESOLVED, no regression.** The shared parser consumes
  `--name-status -M -z` for committed, cached and worktree legs. The fixture
  asserts the governed source preimage, and my shell staged-rename control
  emitted both paths.
- **Malformed fingerprint declaration — RESOLVED, no regression.** Replacing
  the declaration with `malformed-again` returned exit 1 with the exact declared
  versus computed mismatch.
- **Green current branch — clean.** Both load-bearing specs returned 43/43.
- **No governed path — clean.** Independent path-limited range and worktree
  commands emitted zero records.

## Findings

### M1 — MERGE-BLOCKING: the “base/head lifecycle” certificate does not bind HEAD or the branch tree

**Source.** `checkCertificate()` compares only governed fingerprint, merge
base and non-merge message hash (`tests/support/authorLedger.ts:630-664`). The
fingerprint covers only the four governed path classes
(`tests/support/authorLedger.ts:47-50,254-272`), while the message hash is
deliberately stable under an amend preserving the message
(`tests/support/authorLedger.ts:275-298`). The green fixture at
`tests/unit/author-ledger-fixtures.spec.ts:197-208` edits ledger evidence,
amends the commit and expressly requires the gate to remain green.

**Measured false accept.** From clean `99a3080`, I added a line to tracked,
non-governed `tools/claims-worklist.sh`, staged it and ran
`git commit --amend --no-edit`. HEAD changed from `99a3080...` to `f4ec25a...`
and the tree changed from `a576839...` to `dac2ea6...`; the declared message
hash remained
`81ae43e37abafb6921592f6bd694cf886230c59318893b7ebd7aa0c375ebebde`.
The real nine-test gate returned **exit 0, 9/9**.

This is not a determined history rewrite followed by recertification. It is an
ordinary use of the exact amend loop the mechanism prescribes, with no
certificate edit. Source, tests, tools, commission text and ledger evidence are
all outside the content binding.

**Known-open verdict.** The green test at
`tests/unit/author-ledger-fixtures.spec.ts:268-281` is wrong for the timeline it
constructs. I removed new question C40 and ledger C40 from the already-certified
current branch, before this round-2 review existed; the real gate returned
**exit 0, 9/9**. Hashing canonical commission and ledger payload would make that
post-certificate mutation red. A separate fixture should retain the genuinely
open case: the question was absent before the first certificate was computed.

**Future-tax measurement.** I simulated merged main by setting `origin/main`
to `99a3080`, added unrelated branch work, left the forty-row commission and
every evidence row unchanged, and updated only `base commit` and
`commit-message range` before the prescribed amend. The diff against simulated
main contained zero commission bytes and two ledger-line changes. The real gate
returned **exit 0, 9/9**. The statements at
`tests/support/authorLedger.ts:624-628` and commission lines 121-129 that every
future branch owes “its own commission and its own regenerated ledger” are
therefore false mechanically: it owes certificate churn, not fresh execution.

**Fix.** Bind the result to the complete committed tree, not only governed
paths. The cleanest option is an external CI attestation on the full HEAD SHA.
An in-tree alternative is a canonical whole-tree digest that blanks only the
self-referential certificate value lines while including source, tests, tools,
commission and ledger payload. Add fail-against-old cases for a same-message
tool/source amend, post-certificate commission/ledger mutation, and a future
branch that edits certificate lines but carries old evidence. Split the true
pre-certificate omission limit from the currently mislabelled fixture.

**Class swept.** I enumerated every certificate input and every excluded
changed surface, then constructed changes in tool content, commission/ledger
payload, future base and reviewer commit. Governed tree, base and messages are
covered; the full non-governed tree and certificate inputs are not.

### M2 — MERGE-BLOCKING: the monotonic “reviewer” anchor is author-controlled and protects labels rather than questions

**Source.** `reviewedCommissionSnapshot()` chooses the newest commit touching a
filename glob, with no authorship or artifact validation
(`tests/support/authorLedger.ts:460-481`). If that commit cannot show the
commission it returns `null` rather than examining an older snapshot. The
monotonic check then compares only parsed IDs
(`tests/support/authorLedger.ts:484-496`).

**Measured false accepts.** I exercised both independent bypasses:

1. Starting from the current branch, I removed C40 from commission and ledger,
   added `docs/reviews/author-self-review.md`, committed it as author `Review
Fixture`, updated the message certificate and amended. Git history showed
   that author-created commit as the newest matching anchor ahead of genuine
   reviewer commit `90cc492`; the real gate returned **exit 0, 9/9**.
2. In a fresh clone, I replaced reviewed C02's no-base question with “Does two
   plus two equal four?” while retaining the valid kind and ID. No ledger or
   certificate change was needed; the real gate returned **exit 0, 9/9**.

The prompt's required `...-round2-review.md` suffix makes my deliverable an
anchor, but a naming convention is the wrong key for reviewer authority. The
Operating Agreement deliberately does not machine-enforce author ≠ reviewer;
this code therefore cannot safely infer the counterparty from a repo-local
filename.

**Fix.** Prefer cutting `reviewedCommissionSnapshot()` and its claimed security
property. Bind post-certificate input changes through M1's certificate fix and
let the independent review plus owner-visible diff handle pre-review omissions.
If an anchor remains, it needs external/authenticated reviewer state, must not
discard older valid snapshots merely because a newer matching commit exists,
and must compare immutable question identity/content rather than reusable IDs.
Add old-code-red cases for an author-authored matching file, a newest snapshot
with no commission, and a same-ID semantic replacement.

**Class swept.** I checked path matching, commit selection, absent historical
file, author identity, ID deletion and same-ID content/kind change. The current
implementation only detects ID removal after the newest cooperative matching
commit.

### M3 — MERGE-BLOCKING: commissioned C22 claims disposition coverage the fixture suite does not contain

**Source.** C22 asks whether **every** disposition is exercised against both an
empirical and normative row
(`docs/reviews/self-pass-gate-codex-commission.md:80`). The ledger dispositions
it PASS and says nine fixtures cover the whole vocabulary, explicitly claiming
`DISCLOSED` and `UNRUN` for both kinds and `PASS` and `FIXED` on a normative row
(`docs/reviews/self-pass-gate-author-ledger.md:55`).

The nine fixtures at
`tests/unit/author-ledger-fixtures.spec.ts:284-328` mutate normative C03 only to
`PASS` and `NORMATIVE`. Across the twelve disposition/kind cells, the missing
normative cases are `FIXED`, `OWNER-ACCEPTED`, `DISCLOSED` and `UNRUN`. Baseline
rows cover empirical `PASS`/`FIXED` and normative `NORMATIVE`; the other
published mutations cover the remaining eight cells. The matrix implementation
looks correct, but the universal execution claim is false.

**Fix.** Add the four missing normative-row fixtures, with
`OWNER-ACCEPTED` tested both with and without its required citation where
appropriate, then regenerate C22 evidence from the actual matrix. Preserve the
single declarative `DISPOSITION_MATRIX`; this finding is about fail-against-old
coverage and a false PASS, not a request to redesign it.

**Class swept.** I enumerated the complete six-disposition by two-kind matrix,
including baseline states and every `setRow()` mutation. Four of twelve cells
are absent; no other disposition exists in the implementation.

## Over-reach verdict

| New mechanism                                       | Verdict                                               | What I would keep or cut                                                                                                                                                                                                        |
| --------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared detector module and hostile fixture spec     | **WARRANTED**                                         | Keep the extraction and executable hostile cases; replace the misleading KNOWN-OPEN green case and add the missing matrix cells.                                                                                                |
| Typed disposition matrix                            | **WARRANTED**                                         | Keep. It directly repairs round-1 M2 and is easier to audit than scattered assertions.                                                                                                                                          |
| `I`/`W`/`U` worktree fingerprint                    | **WARRANTED**                                         | Keep for governed-path evidence. It directly repairs round-1 M4, but it is not a substitute for a whole-tree lifecycle binding.                                                                                                 |
| Base/message certificate                            | **WARRANTED PROPERTY, INCOMPLETE IMPLEMENTATION**     | Keep lifecycle invalidation only after binding the full tree/certificate inputs. Stable messages alone are intentionally blind to amended content.                                                                              |
| `checkCommissionMonotonic()` filename anchor        | **CUT**                                               | It is new security machinery resting on unauthenticated filenames and reusable IDs. M1's certificate repair plus the human review/owner diff is simpler and matches §3's non-mechanical authorship invariant.                   |
| `hasBranchWork` as a repository-wide permanent gate | **OWNER DECISION; OVER-BROAD AS CURRENTLY DESCRIBED** | It applies to every contributor and unrelated PR, not merely this author. The claimed fresh-commission benefit is not enforced. Consider an explicit opt-in/advisory self-pass instead of a permanent fixed-file unit-test tax. |
| Shell `git_or_die` and shared NUL parser            | **WARRANTED**                                         | Keep; they directly and cleanly repair N1/N2.                                                                                                                                                                                   |

Nothing else in the fix diff needs cutting for scope. The extra symlink and
regression fixtures are small adjacent class sweeps, not gratuitous product
scope.

## What the permanent tax actually costs

For any clean future branch with work, the minimum mechanical payment is not a
new commission run. It is:

1. edit the inherited ledger's base/message declarations (and governed
   fingerprint only when governed paths changed), then perform the planned
   amend;
2. carry the same fixed commission and old forty evidence rows, which the gate
   accepts unchanged;
3. after the independent reviewer commits, accept a deliberately red gate; and
4. add an author recertification commit, recompute the message range including
   the review and that planned commit, update the ledger, amend, and rerun CI.

The fixed files also become a merge-conflict hotspot for concurrent branches,
and external/dependency/reviewer-only PRs pay the same tax because
`hasBranchWork` has no author or slice-type scope. The review-commit invalidation
itself is logically sound once the certificate binds the full tree, but it
means the finally green HEAD is necessarily later than the independently
reviewed HEAD. Owner review of that final recertification diff is therefore
load-bearing. Whether that operational cost is worth an advisory trace remains
the owner's decision; the current mechanism is not sound enough to make that
choice yet.

## Round-count diagnostic

The history now contains both failure shapes, but the dominant one has changed.
Attempt one and round 1 mostly patched the same **fail-open input class one
surface at a time**: ledger rows, commission existence, disposition labels,
index versus working tree, and unchecked Git calls. The class sweeps in this
fix round successfully close many of those adjacent instances.

This round's blocking findings are instead **new mechanisms generating the next
finding**. The amend-stable hash creates a tree blind spot; the reviewer-snapshot
repair creates filename/authorship/ID semantics; and the expanded self-audit
again records a named universal as PASS without running four cells. The remedy
is not another larger anchor or certificate stack. Reduce the mechanism, bind
one simple complete target, and keep human reviewer authority outside the
self-authored gate.

## Required §3.5 reruns and independent attacks

### 1. Two load-bearing specs

```text
$ npm run test:unit -- tests/unit/author-ledger.spec.ts tests/unit/author-ledger-fixtures.spec.ts
Test Files  2 passed (2)
Tests       43 passed (43)
  blocking spec: 9 passed
  hostile fixtures: 34 passed
REAL_EXIT=0
```

### 2. Deeper repeat on the lifecycle/anchor mechanism

All mutations below were confined to isolated `/tmp` shared clones and drove
the real blocking spec through `HAVDM_LEDGER_REPO` from the repository's
installed Vitest. Representative command:

```text
$ HAVDM_LEDGER_REPO=/tmp/<fixture> npm run test:unit -- tests/unit/author-ledger.spec.ts
```

| Constructed state beyond the published table                                                            | Real result                                 | Verdict                                                                 |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| Same-message amend changes tracked non-governed tool content; certificate untouched                     | exit 0; 9/9                                 | **False accept — M1**                                                   |
| Already-certified C40 and ledger C40 deleted before round-2 review                                      | exit 0; 9/9                                 | **False accept; KNOWN-OPEN fixture is closable for this timeline — M1** |
| Author-created matching `*-review.md` becomes newest anchor after C40 deletion; certificate regenerated | exit 0; 9/9                                 | **False accept — M2**                                                   |
| Reviewed C02 question rewritten to unrelated text under the same ID                                     | exit 0; 9/9                                 | **False accept — M2**                                                   |
| Simulated future branch; commission/evidence inherited; only base/message certificate lines updated     | exit 0; 9/9                                 | **False accept against the claimed fresh-execution tax — M1**           |
| Synthetic merge commit with base/head parents and unchanged branch tree                                 | exit 0; 9/9; hash unchanged                 | `--no-merges` claim holds in this constructed Git shape                 |
| Independent review commit added without recertification                                                 | exit 1; one stale-message failure           | Designed review-commit invalidation holds                               |
| No `main` or `origin/main`                                                                              | exit 1 at collection                        | Round-0 fail-closed repair holds                                        |
| Fingerprint declaration changed to `malformed-again`                                                    | exit 1; one exact mismatch                  | General malformed-input repair holds                                    |
| Shell base resolves but is unrelated                                                                    | exit 2                                      | N1 repaired                                                             |
| Shell staged rename out of governance                                                                   | exit 0; source and destination both emitted | N2 repaired                                                             |

This escalates rather than duplicates the author's eighteen-state table: it
changes certified branch content while preserving messages, attacks reviewer
authority and question identity, models the actual future-PR payment, and
separates a post-certificate mutation from a true pre-certificate omission.

### 3. Full repository gate

The final review document was present but uncommitted, as required, for this
run:

```text
$ ./tools/checks
lint:        0 errors / 145 warnings
format:      clean
typecheck:   clean
unit:        1378 passed across 103 files
REAL_EXIT=0; 4/4 steps reached and passed
```

The watched `tests/unit/DeployDialog.spec.tsx` file passed 11/11 in that run;
no flake discrimination or rerun was needed.

### Additional checks

- `gh pr checks 141` — current hosted `ci` is **pass**. This confirms this
  branch's Actions run, not forks or a Git/version matrix.
- A locally constructed synthetic merge preserved the exact declared message
  hash and passed, independently supporting the narrow `--no-merges` claim.
- `git diff --name-status -M origin/main...HEAD -- docs/governance docs/templates
ai_rules.md CLAUDE.md` and the equivalent worktree status emitted **zero
  records**.
- Actual `git diff --shortstat 90cc492..HEAD` is **6 files changed, 1641
  insertions, 459 deletions**. The prompt's 1613-insertion count is stale; no
  committed PR artifact repeats it, so this is not a branch finding.
- E2E, integration, UAT, packaging, live Home Assistant, forks and a Git/version
  matrix were not run. No `src/` path changed and none decides this
  unit/tool/docs repair review.

## Claim ledger

| #   | Claim                                                                                    | Tag                          | Evidence                                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Both load-bearing specs are green.                                                       | MEASURED                     | Required command above: 43/43, exit 0.                                                                                                            |
| 2   | Exact round-1 M4 and N1/N2 behaviours are repaired.                                      | MEASURED                     | Source sweep, fixture rerun and independent shell/Git controls.                                                                                   |
| 3   | The certificate accepts a changed branch tree under a same-message amend.                | MEASURED                     | `99a3080...` → `f4ec25a...`, different tree, identical message hash, 9/9 green.                                                                   |
| 4   | The reviewer anchor can be self-authored and question text can be replaced under one ID. | MEASURED                     | Two isolated real-gate fixtures, each 9/9 green.                                                                                                  |
| 5   | The KNOWN-OPEN test is closable for its constructed post-certificate timeline.           | INFERRED from measured state | Deletion is green because certificate inputs exclude commission/ledger; including canonical payload would necessarily change the compared digest. |
| 6   | C22 omits four of twelve disposition/kind cells.                                         | MEASURED                     | Complete matrix/source enumeration at the cited lines.                                                                                            |
| 7   | The repository-wide tax does not mechanically require fresh evidence.                    | MEASURED                     | Future branch passed with unchanged commission/evidence and only two certificate-line edits.                                                      |
| 8   | The owner should not merge this head.                                                    | JUDGEMENT                    | Three merge-blocking findings; owner arbitration remains controlling.                                                                             |

**Weakest claims.** I did not reproduce GitHub's exact synthetic merge
implementation; my local two-parent commit tests the relevant Git range shape,
while the hosted green check supplies one real environment observation. A
canonical full-tree digest must be designed carefully around its own certificate
lines; the external HEAD attestation is simpler. The cost assessment measures
minimum mechanical edits, not human time across future teams.

## Directions

Do not add a third round of reviewer-anchor heuristics. First make one
certificate bind the complete artifact and correct the KNOWN-OPEN timeline.
Then either remove the filename anchor or move reviewer authority to an external
surface that is not self-authored; §3's deliberate human authorship invariant
argues for removal. Complete C22's four missing fixtures and regenerate its
evidence before relying on the ledger.

No `src/`, governed text, `[STATE]` drawer or UAT artifact should change in
response to this review. Whether any correction receives another independent
round is exclusively the owner's decision; this review neither approves nor
merges.

## Verification boundary

I read the complete round-1 review, all six fix-round files, the current
commission and ledger, Operating Agreement §3 and all six reviewer-facing
template rules. I inspected the live PR body, current CI check and changed-path
scope. I changed only this review file on the branch; every attack mutation was
in an isolated temporary clone.

The authored eighteen-state old/new table was not reimplemented line for line;
I reviewed its fixture state construction, reran all 34 cases, and spent the
deeper-repeat budget on five different lifecycle/authority states. Hosted fork
behaviour, semantic truth of prose evidence, and deliberate environment/test
deletion remain outside this review.

## MemPalace drawer candidates

- `wing="havdm"`, `room="review"`, `added_by="codex"` — `[REVIEW] PR #141
SELF-PASS GATE ROUND 2 — CHANGES-REQUIRED. Reviewed 99a3080 against review
anchor 90cc492. Round-1 M4 and N1/N2 are resolved; no-base, rename and
malformed-certificate guards survived extraction. Merge blockers: (M1) the
base/message/governed certificate does not bind the full tree, so a
same-message amend changed tool content and stayed 9/9 green; its KNOWN-OPEN
test also labels a closable post-certificate commission/ledger deletion as
inherently open, and a future branch passed with old evidence after two cert
line edits. (M2) the newest *-review.md anchor can be authored by the author
and compares IDs only; an author-created anchor after C40 deletion and an
unrelated same-ID rewrite each stayed green. (M3) commissioned C22 says every
disposition is tested against both kinds, but four normative cells are
absent. Targeted 43/43. Full gate result recorded in the review. Only the
owner arbitrates and merges. Full gate: REAL_EXIT=0, 4/4 passed; lint 0
errors/145 warnings; format/typecheck clean; unit 1378/103.`
- `wing="practice"`, `room="verification"`, `added_by="codex"` — `[PATTERN]
AN AMEND-STABLE MESSAGE HASH IS NOT A TREE CERTIFICATE. If an amend may
preserve messages while changing the tree, bind the complete tree and the
certificate's semantic inputs, or use an external attestation over the full
HEAD SHA. Prove a same-message non-governed content amend fails against the
old implementation.`
- `wing="practice"`, `room="review"`, `added_by="codex"` — `[PATTERN] A
COUNTERPARTY ANCHOR MUST NOT BE SELECTED BY A SELF-AUTHORED FILENAME. Choosing
the newest matching path lets the producer create a newer apparent anchor;
comparing reusable IDs also protects labels rather than question identity.
Authenticate the counterparty externally or keep authorship enforcement at
the human owner gate.`
