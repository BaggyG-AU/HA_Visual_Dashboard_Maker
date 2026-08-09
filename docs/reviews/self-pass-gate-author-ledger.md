Author: Claude Opus (claude-code)
Reviewer: OpenAI Codex
Owner gate: micah/BaggyG-AU

# Author execution ledger — the self-pass gate, second attempt, round-1 fix

**REGENERATED for this fix round.** Every row below records a check run on
`feature/self-pass-gate` after round 1 of the independent review
(`docs/reviews/self-pass-gate-codex-review.md`, commit `90cc492`) returned
CHANGES-REQUIRED. Nothing is carried over from PR #140, whose ledger was
withdrawn with the rest of the mechanism in `03c817c`.

One row per commissioned check in
`docs/reviews/self-pass-gate-codex-commission.md`.
`tests/support/authorLedger.ts` derives the required row set from that
commission and goes red on a missing row, a duplicate row, an orphan row, a
disposition that is illegal for the row's Kind, a dropped commissioned question,
or a stale certificate.

## The certificate

Three declarations pin this ledger to the state it was computed against. A
later branch has a different merge base and a different message range, so an
inherited ledger is stale and the gate is red until it is regenerated.

governed fingerprint: `763a4a5efd7d`
base commit: `9e95e4cc627014f60d846591f89c0b6874c20bff`
commit-message range: `81ae43e37abafb6921592f6bd694cf886230c59318893b7ebd7aa0c375ebebde`

## Rows

| ID  | Check                                                     | Disposition | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | --------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01 | Commit messages inside the certified scope                | FIXED       | Branch commit messages are BOTH a checked population and a hashed input. `checkCommitMessageCandidates()` extracts count candidates from `git log --format=%H%n%B base..HEAD` and fails on any not mentioned here; `commit-message range` above hashes the whole non-merge range. The round-0 leg fired on this PR's own content commit.                                                                                                                                                                                      |
| C02 | Fail closed with no resolvable base ref                   | FIXED       | Fixture `the base ref must resolve` deletes `main` on a detached HEAD with no `origin/main` and asserts `loadContext()` throws. Attack-table row `no-base-ref` drives the real spec in a clone with neither ref: NO TESTS RAN, exit 1. Attempt one `it.skip`ped with exit 0.                                                                                                                                                                                                                                                  |
| C03 | Required rows derived from the commission                 | FIXED       | `checkLedgerCoverage()` builds the required set from `parseCommission()`, never from this file. Control leg: complete ledger GREEN. Known-bad: fixture `a LEDGER row deleted while its commission row remains is red`.                                                                                                                                                                                                                                                                                                        |
| C04 | Renames decomposed and the preimage seen                  | FIXED       | Fixture `a governed file renamed OUT of docs/governance is seen through its preimage` asserts the PREIMAGE is in `ctx.changed` after a committed `git mv`, and that the obligation fires with the commission removed. `--name-only` emits only the destination; `--name-status -M` emits both.                                                                                                                                                                                                                                |
| C05 | Fingerprint sees untracked governed additions             | FIXED       | Fixture `an UNTRACKED governed addition is red` adds `docs/governance/SMUGGLED.md` and asserts the certificate goes red.                                                                                                                                                                                                                                                                                                                                                                                                      |
| C06 | Live PR-body read mandatory where claimed                 | FIXED       | `bash tools/claims-worklist.sh --require-pr 999999999` exits 2 with an explicit refusal. Measured again this round; the old fail-open path, which swallowed a failed read and returned the local output as though the body had been scanned, is gone.                                                                                                                                                                                                                                                                         |
| C07 | Gate goes RED on a removed commissioned row               | FIXED       | Fixture `a LEDGER row deleted while its commission row remains is red`, and its converse `an ORPHAN ledger row with no commissioned question is red`. Both drive the real detector against constructed Git state.                                                                                                                                                                                                                                                                                                             |
| C08 | Ledger regenerated, not copied                            | PASS        | `git log --all --oneline -- docs/reviews/governance-arb-r8-mp-lease-author-ledger.md` finds no such file. Every row here cites a run performed on `feature/self-pass-gate` during this fix round; the round-0 rows were re-measured rather than carried forward.                                                                                                                                                                                                                                                              |
| C09 | PR body does not claim the M1 class is closed             | PASS        | The append-only observation control (correction 6) is deliberately NOT built, at the owner's direction. The PR body says so explicitly and claims only the repairs actually made.                                                                                                                                                                                                                                                                                                                                             |
| C10 | No normative text added to governed paths                 | PASS        | `git diff --name-status -M origin/main...HEAD` plus `git status --porcelain`, both filtered to `docs/governance/`, `docs/templates/`, `ai_rules.md`, `CLAUDE.md`: 0 records from each. A defect here is ordinary PR evidence, not a governance amendment.                                                                                                                                                                                                                                                                     |
| C11 | CI resolves a base ref                                    | PASS        | `grep -rn 'fetch-depth' .github/workflows/` returns exactly `.github/workflows/ci.yml:25`. `grep -rln 'vitest' .github/workflows/` and `grep -rln 'test:unit' .github/workflows/` each return exactly `ci.yml`, so the ONLY workflow that runs this suite is the one checking out full history. Confirmed by a real Actions run on this PR.                                                                                                                                                                                   |
| C12 | Fingerprint covers file MODE, not only content            | FIXED       | Fixtures `an UNSTAGED chmod of a tracked governed file is red` and `a STAGED chmod is red too`. The `W` leg records mode from `lstat`, the `I` leg from the index, so both storage states move the hash.                                                                                                                                                                                                                                                                                                                      |
| C13 | A `gh` read failure propagates                            | FIXED       | Best-effort `--with-pr 999999999` exits 0 and says the body was not read; `--require-pr 999999999` exits 2. Decidable SHA checking is delegated to `tools/check-pr-evidence.sh` from PR #138 rather than re-implemented as a grep.                                                                                                                                                                                                                                                                                            |
| C14 | RED when the commission FILE is absent                    | FIXED       | Fixture `an ABSENT commission is red, not "nothing owed"`. Old-code measurement in the same checkout: attack-table row `commission-absent` returned exit 0, 7 of 7 passing.                                                                                                                                                                                                                                                                                                                                                   |
| C15 | RED when the `Commissioned checks` heading is missing     | FIXED       | Fixture `a commission whose "Commissioned checks" HEADING is missing is red`. Old code: attack-table row `commission-heading-missing`, exit 0, 7 of 7 passing.                                                                                                                                                                                                                                                                                                                                                                |
| C16 | RED when that section parses to zero rows                 | FIXED       | Fixture `a commission whose table parses to ZERO rows is red`. Old code: attack-table row `commission-table-empty`, exit 0, 7 of 7 passing.                                                                                                                                                                                                                                                                                                                                                                                   |
| C17 | RED on duplicate commission IDs                           | FIXED       | Fixture `DUPLICATE commission ids are red`, which first asserts `checkLedgerCoverage()` is SATISFIED — the two sets still compare equal — and then that the uniqueness check fails anyway. Old code: attack-table row `commission-duplicate-id`, exit 0, 7 of 7 passing.                                                                                                                                                                                                                                                      |
| C18 | RED when a question is dropped after the reviewer read it | FIXED       | `checkCommissionMonotonic()` reads the commission at the newest commit touching `docs/reviews/*-review.md` and refuses any ID that has since vanished. Fixture `dropping a question AFTER the reviewer committed their deliverable is red` asserts the input and coverage checks BOTH pass and the monotonic check still fails.                                                                                                                                                                                               |
| C19 | The pre-review deletion residue is measured and OPEN      | PASS        | Fixture `KNOWN-OPEN: with no reviewer deliverable yet, dropping a question and its row stays GREEN` asserts `runGate()` returns no failures. The limit is therefore executable rather than a paragraph: closing it later breaks that test. Old code: attack-table row `commission-row-and-ledger-row-deleted`, exit 0 — unchanged, and stated as unchanged.                                                                                                                                                                   |
| C20 | RED when an EMPIRICAL row is DISCLOSED                    | FIXED       | Fixture `an EMPIRICAL row dispositioned DISCLOSED is red`. `DISPOSITION_MATRIX` maps `DISCLOSED` to the empty list, so it passes no kind. Old code: attack-table row `disposition-disclosed`, exit 0, 7 of 7 passing — the test titled "DISCLOSED may not be self-awarded" contained no assertion about DISCLOSED.                                                                                                                                                                                                            |
| C21 | RED when an EMPIRICAL row is NORMATIVE                    | FIXED       | Fixture `an EMPIRICAL row dispositioned NORMATIVE is red`. Old code: attack-table row `disposition-normative`, exit 0, 7 of 7 passing. Round 1 inferred this one by source inspection; it is now MEASURED.                                                                                                                                                                                                                                                                                                                    |
| C22 | Every disposition exercised against both kinds            | PASS        | Nine fixtures in the `round-1 M2` block cover the whole vocabulary: DISCLOSED and UNRUN red for both kinds, PASS and FIXED red on a NORMATIVE row, NORMATIVE red on an EMPIRICAL row and green on a NORMATIVE one, unrecognised labels red, empty evidence red, and OWNER-ACCEPTED red without an `owner:` citation and green with one.                                                                                                                                                                                       |
| C23 | RED on a later branch inheriting both artifacts           | FIXED       | Fixture `a LATER branch inheriting the artifacts unchanged is red` reproduces round 1's exact construction and additionally asserts that the count-candidate leg sees NOTHING, so the lifecycle binding is what catches it. Old code: attack-table row `inherited-by-later-branch`, exit 0, 7 of 7 passing.                                                                                                                                                                                                                   |
| C24 | RED on a later commit with no count candidate             | FIXED       | Same fixture: the added commit's whole message is `all checks passed`. Also `a later commit on the SAME branch invalidates the certificate until it is regenerated`. Old code: exit 0.                                                                                                                                                                                                                                                                                                                                        |
| C25 | A commit-message range hash is feasible                   | FIXED       | Fixture `the certificate survives git commit --amend --no-edit` edits the ledger, stages it, amends, and asserts HEAD MOVED while `messageRangeHash()` did not — then that the certificate still validates. This ledger was itself certified by that loop. Round 1 measured the same property independently.                                                                                                                                                                                                                  |
| C26 | The false rationale corrected everywhere it appears       | FIXED       | A three-term sweep over `*.ts`, `*.md`, `*.sh` and `*.yml` outside `node_modules`, keyed separately on `infinite regress`, on `is impossible` and on `cannot work`: every surviving hit is either a CORRECTION of the claim, the reviewer's own immutable document, or unrelated text elsewhere in the repository. The only two places that ASSERTED it were the spec docblock and row C01 of this ledger, and both are rewritten.                                                                                            |
| C27 | Fingerprint sees an UNSTAGED content edit                 | FIXED       | Fixture `an UNSTAGED content edit to a tracked governed file is red`. Old code: attack-table row `unstaged-content-edit`, exit 0, 7 of 7 passing.                                                                                                                                                                                                                                                                                                                                                                             |
| C28 | Fingerprint sees an UNSTAGED deletion                     | FIXED       | Fixture `an UNSTAGED deletion of a tracked governed file is red`; the `W` leg records `absent`. Old code: attack-table row `unstaged-deletion`, exit 0, 7 of 7 passing.                                                                                                                                                                                                                                                                                                                                                       |
| C29 | Fingerprint sees an UNSTAGED mode change                  | FIXED       | Fixture `an UNSTAGED chmod of a tracked governed file is red`. No setup in that block calls `git add`. Old code: attack-table row `unstaged-chmod`, exit 0, 7 of 7 passing — round 1's measured false accept.                                                                                                                                                                                                                                                                                                                 |
| C30 | The STAGED mode control still holds                       | PASS        | Fixture `a STAGED chmod is red too`. Old code already caught this one: attack-table row `staged-chmod`, exit 1. It is kept as a regression control because it is the narrower property the author had mistaken for the wider one.                                                                                                                                                                                                                                                                                             |
| C31 | Fingerprint sees a file replaced by a SYMLINK             | FIXED       | Fixture `replacing a tracked governed file with a SYMLINK is red`. `worktreeFacts()` records type from `lstat` and hashes the link target, so a symlink and a file with identical bytes are distinguishable.                                                                                                                                                                                                                                                                                                                  |
| C32 | Generator exits non-zero on an unrelated base             | FIXED       | Constructed a parentless root with `commit-tree` so `unrelated` RESOLVES but shares no ancestor with HEAD. `HAVDM_BASE_REF=unrelated bash tools/claims-worklist.sh --changed-only`: OLD exit 0 with zero lines of output, NEW exit 2. Controls unchanged: missing ref exits 2, ordinary related base exits 0 with 6 paths.                                                                                                                                                                                                    |
| C33 | Generator emits both sides of a STAGED rename             | FIXED       | Staged `git mv docs/governance/OPERATING_AGREEMENT.md docs/reviews/moved-operating-agreement.md`, then `--changed-only`: OLD preimage 0 destination 1, NEW preimage 1 destination 1. The unstaged filesystem-move control was already 1 and 1 in both.                                                                                                                                                                                                                                                                        |
| C34 | A pathname containing a newline stays ONE record          | FIXED       | An untracked `docs/governance/we<newline>ird.md` against the banner's own record count: baseline 6 paths, OLD 8 paths, NEW 7 paths. ⚠ The `--changed-only` DISPLAY is newline-framed, so this had to be measured from the record count rather than from that output.                                                                                                                                                                                                                                                          |
| C35 | Each row is one falsifiable question                      | FIXED       | Round 1 named C02, C05 and C06 as compounds. Each is NARROWED to its first clause and its second clause is now C11, C12 and C13 respectively; no ID was renumbered or dropped, which `checkCommissionMonotonic()` now enforces against the reviewer's snapshot. Atomicity of CONTENT remains a hand check, restated as a weakest claim.                                                                                                                                                                                       |
| C36 | The live PR body is outside the blocking path             | PASS        | `grep -rn 'claims-worklist' tests/` returns one COMMENT in `tests/support/authorLedger.ts` and no invocation, so a false claim present only in the live PR body does NOT turn the gate red. The boundary is stated in the commission and in the detector's header docblock. Whether to bring it into the blocking path is an owner decision; round 1 classified it non-blocking.                                                                                                                                              |
| C37 | Every round-1 false accept now goes RED                   | FIXED       | The full attack table is reproduced below, old result beside new, driving the REAL spec against isolated shared clones via `HAVDM_LEDGER_REPO`. Round 1 tabulated FIVE false accepts and all five are now exit 1; SIX states that were already red stay red; the green control stays green; and SIX further false accepts round 1 did not tabulate were found and closed in the same pass. Eleven of the eighteen rows changed from green to red and none changed the other way.                                              |
| C38 | The hostile cases are re-run, not recorded                | FIXED       | They are `tests/unit/author-ledger-fixtures.spec.ts`, inside `npm run test:unit` and therefore inside `./tools/checks` and CI. They build real Git state in a temporary repository and drive the same functions the blocking gate drives, so neither file re-implements the other's parser.                                                                                                                                                                                                                                   |
| C40 | N1's class swept in the TypeScript detector too           | FIXED       | A finding is a sample, not the population: N1 was reported against the shell script, and the same swallow was in the detector. `grep -n 'tryGit(' tests/support/authorLedger.ts` now returns four lines — the definition, the base-ref probe where a failed resolve IS the question, the `git show` of the commission at the reviewer's commit where absence is a real answer, and a comment. The two calls that DEFINED a population, the commit-message log and the reviewer-deliverable log, now use the throwing `git()`. |
| C39 | The agent never merges                                    | NORMATIVE   | Quoted from `docs/governance/OPERATING_AGREEMENT.md` §3 class (d) as ratified by PR #139: one full independent review before merge, NO automatic follow-up round, and the OWNER decides whether a post-review change warrants re-review. This row exists so the kind and disposition matrix is exercised on this branch and not only in fixtures.                                                                                                                                                                             |

## The round-1 attack table, reproduced

Round 1 tabulated its constructed states under "Deeper constructed Git attack".
Every one is re-run below in THIS checkout against the OLD code and then the
NEW code, driving the real spec from the repository's installed Vitest with
`HAVDM_LEDGER_REPO` pointed at an isolated shared clone. Five states that round
1 did not publish are added; they are marked NEW.

Every mutation is confined to an isolated shared clone; nothing touched the
branch. "Old code, here" is the spec as committed at `90cc492`, run before any
repair was written — the red-before-green leg, re-measured rather than quoted
from the review. "New code" is the spec as it stands in this fix commit; no head
SHA is pinned for it, because the certifying amend moves that SHA and a pinned
one would be stale before the reviewer read it.

| Constructed state                                                   | Round 1                | Old code, here   | New code         | Verdict                     |
| ------------------------------------------------------------------- | ---------------------- | ---------------- | ---------------- | --------------------------- |
| Checked-in branch head, unmutated                                   | 0; 7 of 7 pass         | 0; 7 of 7 pass   | 0; 9 of 9 pass   | Green control holds         |
| Reflog-retained first content commit `faf55d8`                      | 1; three M1 candidates | 1; 1 of 7 failed | 1; 5 of 9 failed | Still red                   |
| Commission file absent, ledger retained                             | 0 — false accept       | 0; 7 of 7 pass   | 1; 3 of 9 failed | **REPAIRED**                |
| Commission `Commissioned checks` heading renamed (NEW)              | not published          | 0; 7 of 7 pass   | 1; 3 of 9 failed | **REPAIRED**                |
| Commission table emptied, heading retained (NEW)                    | not published          | 0; 7 of 7 pass   | 1; 3 of 9 failed | **REPAIRED**                |
| Commission `C10` relabelled duplicate `C09`; ledger `C10` removed   | 0 — false accept       | 0; 7 of 7 pass   | 1; 1 of 9 failed | **REPAIRED**                |
| Commission row AND its ledger row both deleted (NEW)                | named, not tabulated   | 0; 7 of 7 pass   | 1; 1 of 9 failed | **REPAIRED** via the anchor |
| Ledger `C07` absent, commission `C07` retained                      | 1                      | 1; 1 of 7 failed | 1; 1 of 9 failed | Control holds               |
| `C01` = `DISCLOSED`, evidence says unresolved and unaccepted        | 0 — false accept       | 0; 7 of 7 pass   | 1; 1 of 9 failed | **REPAIRED**                |
| `C01` = `NORMATIVE` on an empirical row (NEW)                       | inferred, not measured | 0; 7 of 7 pass   | 1; 1 of 9 failed | **REPAIRED**, now measured  |
| Unstaged `chmod +x` of a tracked governed file                      | 0 — false accept       | 0; 7 of 7 pass   | 1; 1 of 9 failed | **REPAIRED**                |
| Unstaged content edit of a tracked governed file (NEW)              | not published          | 0; 7 of 7 pass   | 1; 1 of 9 failed | **REPAIRED**                |
| Unstaged deletion of a tracked governed file (NEW)                  | not published          | 0; 7 of 7 pass   | 1; 1 of 9 failed | **REPAIRED**                |
| STAGED `chmod +x` — the narrower property the author had tested     | implied by the fixture | 1; 1 of 7 failed | 1; 1 of 9 failed | Control holds               |
| Simulated merged main plus `all checks passed`, artifacts inherited | 0 — false accept       | 0; 7 of 7 pass   | 1; 1 of 9 failed | **REPAIRED**                |
| Later `777 tests passed` count candidate                            | 1                      | 1; 1 of 7 failed | 1; 2 of 9 failed | Control holds               |
| Governed fingerprint declaration = `not-a-hash`                     | 1                      | 1; 1 of 7 failed | 1; 1 of 9 failed | Control holds               |
| Neither `main` nor `origin/main` exists                             | 1; suite load fails    | 1; NO TESTS RAN  | 1; NO TESTS RAN  | Control holds               |

Round 1 tabulated **five** false accepts. All five are now exit 1. **Six**
states that were already red stay red, the green control stays green, and
**six further** false accepts that round 1 did not tabulate — two commission
parser shapes, the deletion of a question with its row, `NORMATIVE` on an
empirical row, and unstaged content and deletion state — were found and closed
in the same pass. That is 18 rows, of which 11 changed from green to red and
none changed the other way.

## Commit-message claim candidates (the M1 leg)

The count key over `git log --format=%H%n%B origin/main..HEAD` returns six
candidates across this branch's three commits. Three come from the content
commit `2bd1aa7` and three from this fix commit; all six are dispositioned
below, which is what the M1 leg requires before the gate will go green.

| Candidate      | Disposition | Evidence                                                                                                                                                                             |
| -------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `1342 tests`   | PASS        | `./tools/checks` at `2bd1aa7`: 1342 passed. That was the branch total before this fix round, up from 1335 on `9e95e4c`.                                                              |
| `102 files`    | PASS        | Same run: 102 test files, up from 101. The one added file was `tests/unit/author-ledger.spec.ts`.                                                                                    |
| `1378 tests`   | PASS        | `./tools/checks` on this fix commit: 1378 passed. The 36 added since `2bd1aa7` are one further gate assertion, 34 hostile fixtures, and the fixtures file's own certificate control. |
| `103 files`    | PASS        | Same run: 103 test files. The one added file is `tests/unit/author-ledger-fixtures.spec.ts`.                                                                                         |
| `0 errors`     | PASS        | Same run: `✖ 145 problems (0 errors, 145 warnings)`. This branch adds no lint error.                                                                                                 |
| `145 warnings` | PASS        | Same run, unchanged from the `9e95e4c` baseline, so this branch adds no lint debt either.                                                                                            |

## `tools/check-pr-evidence.sh` against the LIVE PR body (the PR #138 DoD item)

`docs/testing/TESTING_STANDARDS.md` makes running this a definition-of-done
item: every candidate must be justified or removed. Run against the live body
of PR #141 — not a local copy — it exits 0 and reports candidates in four
sections. Only section 3 decides anything.

**It already found a real defect this round, which is why it is run rather than
cited.** An earlier draft of the body quoted the pre-amend commit SHA while
describing the certifying amend. Section 3 flagged it as NOT an ancestor of
HEAD, correctly: that object is unreachable for anyone else, which is the same
staleness trap as a pinned head SHA one level over. The sentence was rewritten
to pin no SHA at all, and the re-run is clean of it.

### Section 3 — commit SHAs in the body, the decidable check

Four SHAs, all ancestors of HEAD, all deliberate immutable pins to historical
artifacts: `03c817c` the withdrawal of attempt one, `2bd1aa7` this branch's
content commit, `90cc492` the reviewer's deliverable, `9e95e4c` the merge base.
No sentence around any of them implies "current". **No head SHA is pinned
anywhere in the body**, which is this script's own advice.

### Sections 1 and 2 — counts and universals in the live body

| Candidate                               | Justification                                                                                                                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `34 tests`                              | MEASURED: `npx vitest run tests/unit/author-ledger-fixtures.spec.ts` reports `Tests 34 passed (34)`.                                                                                           |
| `10 rows`                               | MEASURED: `git show 90cc492:docs/reviews/self-pass-gate-codex-commission.md` piped to a count of lines beginning with a pipe and a C-id returns 10.                                            |
| `0 errors`, `145 warnings`              | MEASURED in the `./tools/checks` run reported in the body, and dispositioned row by row in the commit-message table above.                                                                     |
| `1378 passed`, `103 files`              | Same run, same table.                                                                                                                                                                          |
| "Every one was demonstrated / repaired" | Enumerated by the attack table above: 18 constructed states, each with its old and new exit code, driven against the real spec rather than described.                                          |
| "only ever tested the staged state"     | Round 1's own measurement, re-measured here as the `staged-chmod` and three `unstaged-*` rows of that table.                                                                                   |
| "shared no ancestor with HEAD"          | MEASURED in the C32 fixture: `git merge-base unrelated HEAD` exits 1 while `git rev-parse unrelated` succeeds.                                                                                 |
| "destination-only"                      | MEASURED in the C33 fixture: preimage 0, destination 1 under the old script.                                                                                                                   |
| "no id was renumbered or dropped"       | MEASURED: `checkCommissionMonotonic()` compares against the commission at `90cc492` and the gate is green, plus the fixture that makes the dropped case red.                                   |
| "every future branch … owes its own"    | Not an empirical claim about the past but a statement of what the certificate now REQUIRES; the enforcing case is measured by the `a LATER branch inheriting the artifacts unchanged` fixture. |
| "deliberately not built"                | A stated ABSENCE, weakening the claim rather than strengthening it. Direction that needs no enumeration.                                                                                       |
| "only in the live PR body"              | MEASURED: row C36's grep returns one comment and no invocation.                                                                                                                                |

### The whole-file noise, named rather than left to the reviewer

The script scans WHOLE changed files, not diff hunks. Three of the four files
it flagged are this mechanism's own artifacts, where the numerals ARE the
measurements and each sits beside the command that produced it. The fourth,
`docs/reviews/self-pass-gate-codex-review.md`, is the REVIEWER'S deliverable:
its counts are the reviewer's own measurements and it is not the author's to
edit.

## What this ledger does not establish

- **It cannot see a question that was never written**, and — before a reviewer
  deliverable exists on the branch — it cannot see one that was deleted either.
  That residue is row C19, and it is pinned by a test that asserts the gate
  stays GREEN rather than by a sentence.
- **Row atomicity is enforced as one unique ID per row.** Whether a row's
  sentence is one question is a hand check; three rows failed it in round 1.
- **The disposition matrix constrains the LABEL, not the sentence.** Nothing
  stops a broad or evasive assertion in an evidence cell.
- **The lifecycle binding stops INHERITANCE and STALENESS, not a determined
  history rewrite.** An author who rewrites the branch can regenerate a
  self-consistent certificate.
- **The monotonic anchor is keyed on the glob `docs/reviews/*-review.md`.** A
  reviewer deliverable named anything else is not an anchor, and the deletion
  check then has nothing to compare against. Broadening it to all of
  `docs/reviews/` would make the author's own commission commit an anchor and
  forbid the narrowing-and-splitting this round performed on C02, C05 and C06,
  so the glob stands with no better key behind it.
- **A reviewer's own commit turns the gate RED until the author re-certifies**,
  because it changes the commit-message range. Intended, and operationally
  sharp. Run `./tools/checks` with a review document in the WORKING TREE, as
  round 1 did, and expect red once it is committed.
- **`HAVDM_BASE_REF` is a test hook and therefore an escape hatch.** Setting it
  to HEAD makes `hasBranchWork` false and skips the commission checks. CI does
  not set it, and an author who did could equally delete the spec — but it is
  named here rather than left for the reviewer, because it bends this
  mechanism's own "an unknown population must never present as an empty one".
- **`fetch-depth: 0` and `--no-merges` are verified on this repository's own CI
  run**, not on forks and not across a matrix of Git versions.
- **The append-only observation control is not built**, so the PR #140 M1 class
  is not addressed and is not claimed to be.
- **E2E, integration, UAT, packaging and live Home Assistant were not run.** No
  `src/` path changed, so none is owed; they remain UNVERIFIED since PR #128,
  which is a statement about the suites, not about this branch.
