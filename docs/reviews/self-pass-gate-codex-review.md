Author: Claude Opus (`2bd1aa7`, PR #141 author self-pass gate)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author the change
Owner gate: BaggyG-AU reads PR #141 and this review together; only the owner signs off and merges

# Independent review — author self-pass gate, round 1

## Independent account and attack list — written before reading the author's commission or ledger

This section records the required de-biased first pass. I read the withdrawn
attempt's independent review, the six reviewer-facing practice rules, and the
current CI/test/script diff. I had **not** opened
`self-pass-gate-codex-commission.md` or `self-pass-gate-author-ledger.md` when I
wrote this account.

### What the mechanism does

The blocking leg is a Vitest spec. It resolves a comparison base, enumerates
committed and working-tree paths, requires a tracked commission when a governed
path changed, parses commissioned `C<number>` IDs and ledger rows, rejects
missing/duplicate/orphan ledger IDs and `UNRUN`, checks a governed-content
fingerprint, and searches branch commit messages for numeric count candidates.
CI now uses a full-history checkout so that the base comparison can run on the
committed head.

`tools/claims-worklist.sh` is a separate advisory generator. It enumerates
changed paths, greps changed author Markdown and branch commit messages for
count/universal candidates, can read the live PR body, and delegates decidable
SHA checking to `tools/check-pr-evidence.sh`. The blocking Vitest spec does not
invoke that script or require its live-PR mode; those results enter the gate
only through author-supplied commission/ledger evidence.

### My attack list before comparison

1. **Missing or malformed commission input may pass.** `commissionedIds()`
   returns an empty array when the file, exact heading, or parseable rows are
   absent, and the M3 test treats zero IDs as “nothing owed.” The current PR's
   changed paths do not independently require this review-path commission.
2. **The commission is not itself deletion-resistant.** Removing a question
   from the tracked commission and its matching ledger row leaves equal sets.
   Duplicate IDs in the commission also collapse into one ledger obligation.
   A visible diff helps a reviewer but does not make the validator go red.
3. **“Atomic” means only a unique identifier.** Neither parser can establish
   that one row contains one question or one check. A compound commission row
   remains mechanically valid.
4. **The disposition escape routes appear live.** `NORMATIVE` and `DISCLOSED`
   remain passing dispositions. The test named “DISCLOSED may not be
   self-awarded” contains no assertion governing `DISCLOSED`; it checks only
   that `OWNER-ACCEPTED` evidence contains `owner:`.
5. **The artifact has no per-PR lifecycle.** The commission and ledger use
   fixed filenames. Once this commit is on `main`, a later branch can inherit
   the already-green rows. No blocking assertion requires a new commission,
   changed commission, new ledger, or certificate pinned to that later branch.
6. **The fingerprint reads the index, not the full working tree.** Tracked
   entries come from `git ls-files -s`; an unstaged edit, deletion, or mode
   change to an already-tracked governed file can change the obligation while
   leaving the fingerprint unchanged. Untracked files are handled separately.
7. **Uncommitted rename handling regresses to destination-only output.** The
   committed range uses NUL-safe `--name-status -M`, but the dirty-tree leg uses
   `git diff --name-only`. The shell tool additionally translates NULs to
   newlines, so a pathname containing a newline is no longer atomic.
8. **Commit messages are not a fully checked population.** The blocking test
   checks only its narrower `COUNT_RE`, not the script's universal candidates,
   `call sites`, or passed/failed/skipped forms. It accepts a candidate if its
   short text occurs anywhere in the ledger, rather than in a parsed,
   dispositioned row.
9. **The live PR body is outside the blocking path.** `--require-pr` may fail
   closed when someone runs the script, but neither the unit spec nor CI invokes
   it. A PR-body-only false claim can therefore coexist with a green blocking
   gate unless a human commissioned and honestly recorded that run.
10. **The shell base check may still fail open after ref resolution.** The
    script uses `set -uo pipefail`, not `set -e`; an existing but unrelated base
    can make `merge-base`, diff, or log fail while later commands continue with
    an empty candidate population.
11. **The commit-message hash claim looks too broad.** A hash embedded in the
    same commit whose message it covers is self-referential, but external CI
    status, a later certificate commit that excludes itself, or a certificate
    over a named preceding range avoids literal infinite regress. The chosen
    post-commit population check may still be sound; “impossible” needs the
    narrower boundary.
12. **The commission itself needs hostile questions about the gate's lifecycle
    and self-disable routes.** At minimum I would expect separate checks for an
    absent/malformed/empty commission, removal of a known commission row,
    duplicate commission IDs, `DISCLOSED`/`NORMATIVE` misuse, a future branch
    inheriting the old certificate, unstaged tracked governed changes, commit
    message universals, and a PR-body-only claim.

These are attack hypotheses, not findings. The rest of this review tests them
against the tracked commission, ledger, real executions and constructed Git
state.

## Verdict first

**CHANGES-REQUIRED.** The second attempt repairs the prior no-base skip and the
committed-rename path, and its current head is green under the targeted spec,
but four mechanically demonstrated fail-open classes remain in the mechanism.
Do not merge `2bd1aa7`: the mandatory population can disappear or collapse,
`DISCLOSED` is still a self-awarded pass route, the fixed ledger can be reused
unchanged on a later branch, and the fingerprint ignores tracked working-tree
state.

## Comparison with the author's account

### Where the independent and author attack lists agree

- Both accounts identify the commission boundary, rename decomposition,
  untracked/mode fingerprinting, shallow history, post-commit invalidation and
  the live PR body as the load-bearing surfaces.
- Both identify the fixed lexical key as a candidate generator rather than a
  semantic claim detector, and both treat hosted CI and forks as unverified.
- The author's own weakest-claim section correctly names the risk that
  `DISCLOSED` is cosmetic. The constructed run below confirms that it is not
  merely a risk: it is a green path.

The exact malformed-fingerprint probe (`PLACEHOLDER00`) was not on my initial
attack list. That is the valuable author-only case: I independently repeated
its behaviour with a different malformed value and the repaired assertion went
red. The author's staged mode fixture was also useful, but my independent list
went one storage state further and found that the corresponding unstaged mode
change remains invisible.

### The requested commission-table attack

The answer is **not “nothing missing.”** I read all ten commissioned rows and
the surrounding hostile/weakest-claim sections. The table omits separate,
mechanically owed checks for:

1. an absent, malformed or empty commission failing closed;
2. unique commission IDs and removal of a commission question together with
   its ledger row;
3. the commission's own stated weakest claim: empirical rows must not pass as
   self-awarded `DISCLOSED` or `NORMATIVE`;
4. a later PR inheriting these fixed-path commission and ledger files without
   regenerating either;
5. unstaged tracked governed content, deletion and mode state;
6. non-count commit-message claims such as `all checks passed`, and the actual
   feasibility of hashing a stable commit-message range;
7. a PR-body-only false claim entering the blocking path, rather than merely a
   human-authored evidence cell; and
8. the assertion that rows are atomic: C02, C05 and C06 each combine two
   independently falsifiable questions despite “Each row is one question” at
   `docs/reviews/self-pass-gate-codex-commission.md:36`.

C07 tests deletion of a **ledger row while C07 remains in the commission**. It
does not test disappearance of the upstream question. That narrower control
does go red, but it cannot establish that the commissioned population itself
is mandatory or deletion-resistant.

## Disposition of the five prior merge-blockers

| Prior blocker                            | This review's disposition                                             | Independent evidence                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 — committed head failed its own gate  | **PARTLY REPAIRED / still open**                                      | Reflog-retained first content commit `faf55d8` independently exits 1 on exactly `145 warnings`, `1342 tests`, and `102 files`; current `2bd1aa7` dispositions all three. A later `777 tests passed` commit also turns the real spec red. But `all checks passed` remains green, the files can be inherited unchanged by a later branch, and the claimed hash impossibility is false. See M3. |
| M2 — ordinary CI skipped without a base  | **REPAIRED for the inspected paths**                                  | A fixture with neither `main` nor `origin/main` exits 1 instead of skipping; `.github/workflows/ci.yml:23-25` uses `fetch-depth: 0`. Hosted Actions and forks remain unverified as conceded. The separate shell tool still mishandles an unrelated base; see N1.                                                                                                                             |
| M3 — commission was not enforced         | **PARTLY REPAIRED / still open**                                      | Deleting ledger C07 alone is red, but missing/empty/malformed commission input is green, duplicate commission IDs collapse obligations, and passing dispositions remain. See M1 and M2.                                                                                                                                                                                                      |
| M4 — rename and fingerprint gaps         | **PARTLY REPAIRED / still open**                                      | The committed range is NUL-safe and rename-decomposed, and untracked/staged-mode state affects the fingerprint. Unstaged tracked state is still read from the index and passes. See M4.                                                                                                                                                                                                      |
| M5 — live PR body was optional/fail-open | **REPAIRED at the invoked tool boundary; not a blocking attestation** | `bash tools/claims-worklist.sh --require-pr 141` read the live body and exited 0; the failure branch at `tools/claims-worklist.sh:161-180` propagates. The Vitest/CI gate still does not invoke it, so truth of the ledger evidence remains within the explicitly conceded row-honesty boundary. I independently read the current body and found no undisclosed head-SHA claim.              |

## Findings

### M1 — MERGE-BLOCKING: the commissioned population can disappear or collapse while the gate stays green

**Evidence.** `commissionedIds()` returns `[]` when the commission is absent,
when its exact heading is missing, or when no `C<number>` row parses
(`tests/unit/author-ledger.spec.ts:178-186`). The M3 assertion then immediately
returns on zero IDs (`tests/unit/author-ledger.spec.ts:240-243`). It checks
duplicate IDs only in the ledger (`tests/unit/author-ledger.spec.ts:249-265`),
not in the commission.

Against the real spec, deleting
`docs/reviews/self-pass-gate-codex-commission.md` while leaving the ledger
returned **exit 0, 7/7 tests passed**. In a second fixture, changing C10's ID to
a duplicate C09 and deleting ledger C10 also returned **exit 0, 7/7**. The
control—deleting ledger C07 while retaining commissioned C07—returned **exit
1** with the expected orphan/missing-set failure.

**Problem.** The implementation enforces equality with whatever parseable set
the commission happens to yield; it does not enforce existence, non-emptiness,
unique upstream IDs, or a schema/version that makes this branch's population
mandatory. It therefore violates the supplied rules to require unique atomic
rows and fail closed when an input is missing. The omissions listed above are
not hypothetical completeness objections: missing input and duplicate-ID
collapse are observed false accepts.

**Required fix.** While this gate is installed, require the commission file,
the exact section and a non-empty table; reject duplicate commission IDs before
comparing the ledger; split compound questions; and make this PR's commission
identity/freshness an explicit input. Add fail-against-old tests for each parser
failure shape and for deleting/relabeling an upstream question together with
its ledger row. Preserve the tracked commission and the independently derived
required-set design.

**Class swept.** I inspected every commission-parser exit, both directions of
the commission/ledger set comparison, uniqueness on both surfaces, and all ten
commission rows. Constructed cases covered absent commission, ledger-only
deletion, duplicate-ID collapse plus matching ledger deletion, and the green
control.

### M2 — MERGE-BLOCKING: empirical residue can still self-pass as `DISCLOSED` or `NORMATIVE`

**Evidence.** Both dispositions are unconditional members of
`DISPOSITIONS` (`tests/unit/author-ledger.spec.ts:59-70`). The disposition test
checks only membership, non-`UNRUN`, and non-empty evidence
(`tests/unit/author-ledger.spec.ts:268-275`). The test whose title says
“DISCLOSED may not be self-awarded” has no `DISCLOSED` branch at all; it only
requires the substring `owner:` for `OWNER-ACCEPTED`
(`tests/unit/author-ledger.spec.ts:278-287`). The commission calls this its
fourth weakest claim at
`docs/reviews/self-pass-gate-codex-commission.md:82-85`, but assigns it no
commissioned ID.

I changed C01 from `FIXED` to `DISCLOSED` and supplied explicit evidence that
the in-scope defect was deliberately unresolved without owner acceptance. The
real spec returned **exit 0, 7/7 tests passed**.

**Problem.** This is the exact pass route the supplied working rule forbids.
Because all current C01-C10 questions are empirical, `NORMATIVE` is an equally
unconstrained false accept by source inspection. An assertion title and a
comment do not enforce the restriction.

**Required fix.** Give commissioned rows a mechanically parsed kind, disallow
`NORMATIVE` for empirical rows, and make `DISCLOSED` non-passing for in-scope
residue unless an owner-acceptance artifact is independently identified. Test
every allowed disposition against both empirical and genuinely normative rows,
including a fail-against-old version of the constructed C01 case. Preserve the
ability to disclose out-of-scope observations without claiming that they pass
an empirical commission.

**Class swept.** I inspected all six accepted dispositions and every assertion
that constrains them. `UNRUN` is rejected; `PASS`/`FIXED` are ordinary green
outcomes; `NORMATIVE` and `DISCLOSED` are unconstrained; `OWNER-ACCEPTED` has
only the weak text-token check.

### M3 — MERGE-BLOCKING: the certificate has no per-branch lifecycle and commit messages are not a checked population

**Evidence.** The mechanism uses two fixed paths
(`tests/unit/author-ledger.spec.ts:53-54`) and never requires either file to
change after the comparison base. Its blocking commit-message key covers only
the narrow count regex at `tests/unit/author-ledger.spec.ts:212-213`; the
broader advisory key is explicitly non-exhaustive
(`tools/claims-worklist.sh:133-138,198-203`). Presence of a count-shaped string
anywhere in the unparsed ledger is sufficient
(`tests/unit/author-ledger.spec.ts:304-317`).

I simulated the post-merge lifecycle by setting `origin/main` to `2bd1aa7`,
adding a later commit whose complete message was `all checks passed`, and
changing neither commission nor ledger. The real spec returned **exit 0, 7/7
tests passed**. A separate later commit `777 tests passed` returned **exit 1**,
which confirms the narrow count leg can fail and also defines its boundary.

The “literal hash ... is impossible” rationale at
`tests/unit/author-ledger.spec.ts:296-302` and ledger line 24 is too broad. In a
fixture, `git commit --amend --no-edit --allow-empty` changed HEAD from
`9c5148a...` to `1c4dfb5...` while the SHA-256 of
`git log --format='%B' origin/main..HEAD` remained exactly
`23b191d6812fb8dd1ec9ce3e41bc5a9683e3dc6520a23cb8ad0e278a9769d30f`.
The message range is stable when an amend preserves the planned message; an
external CI attestation or a certificate explicitly excluding its own commit
also avoids self-reference.

**Problem.** After this PR lands, ordinary later branches inherit a green
execution ledger for work that has not been commissioned or executed. The
gate catches only later messages shaped like its count regex. That is not the
claimed checked population, and it fails the supplied rule that a result is
pinned to one commit and branch updates move it.

**Required fix.** Bind the certificate to an explicit base/head lifecycle and
require a fresh per-PR commission/ledger identity, or use a CI-owned
attestation over the committed head. A complete commit-message byte hash is a
feasible staleness input even though semantic candidate discovery remains
advisory. Add two old-code-red tests from a simulated merged-main state: one
ordinary future branch with inherited files, and one universal-only commit.
Preserve the post-commit CI check and the existing count-candidate diagnostics.

**Class swept.** I followed every time-varying input: governed tree,
commission, ledger, commit messages and live PR body. Constructed states covered
current-head counts, an unrecognised future universal, a recognised future
count, and a message-preserving amend.

### M4 — MERGE-BLOCKING: governed fingerprinting ignores tracked working-tree state

**Evidence.** For tracked files, `governedFingerprint()` hashes index mode and
object ID from `git ls-files -s` (`tests/unit/author-ledger.spec.ts:153-164`).
Only untracked files are read from the working tree
(`tests/unit/author-ledger.spec.ts:165-173`). Yet changed-path discovery says
dirty work counts and separately includes `git diff ... HEAD`
(`tests/unit/author-ledger.spec.ts:135-140`).

In a fixture, a plain unstaged `chmod +x
docs/governance/OPERATING_AGREEMENT.md` appeared in `git status` but left the
real spec at **exit 0, 7/7 tests passed**. The index-based fingerprint cannot
observe an unstaged tracked content edit, deletion or mode change; the mode
fixture in the author ledger exercised a staged/index state, not this state.

**Problem.** The obligation sees the dirty governed path but the certificate
continues to certify the old index bytes and mode. That contradicts the
implementation's stated pre-submit/dirty-tree use and leaves the second leg of
prior M4 incomplete.

**Required fix.** Either hash the actual working-tree content, type and mode of
tracked governed paths as well as index/untracked state, or explicitly reject
dirty tracked governed paths until staged. Add separate fail-against-old cases
for unstaged content, deletion and mode. Preserve sorting, path framing and the
already-correct untracked/index coverage.

**Class swept.** I inspected committed, staged, unstaged-tracked and untracked
storage states and the add/edit/delete/mode/rename paths. The affected class is
unstaged tracked content/type/mode; committed and staged changes alter the
index fingerprint, and untracked additions have their own working-tree leg.

### N1 — NON-BLOCKING: the advisory generator fails open after a base ref resolves

**Evidence.** The script rejects an unresolvable ref, then assigns
`MERGE_BASE="$(git merge-base "$BASE" HEAD)"` under `set -uo pipefail` without
checking its exit (`tools/claims-worklist.sh:44,67-76`). In a fixture where
`unrelated` resolved but shared no ancestor with HEAD,
`HAVDM_BASE_REF=unrelated bash tools/claims-worklist.sh --changed-only`
returned **exit 0 with empty output**.

**Problem.** The comment promises that an unknown population cannot present as
empty, but the check covers only ref resolution. This does not weaken the
blocking Vitest path—its `git()` throws—but it can produce a misleading author
worklist.

**Required fix.** Check `merge-base`, diff and log statuses explicitly and
exit 2 on failure. Add related, missing and unrelated-ref controls.

**Class swept.** Existing related base succeeds, missing ref exits 2, and the
resolvable/unrelated case is the one false accept.

### N2 — NON-BLOCKING: dirty rename output in the advisory generator is destination-only and not NUL-safe

**Evidence.** The committed range has the correct NUL-aware status parser, but
the dirty legs revert to `git diff --name-only -z HEAD | tr '\0' '\n'` and the
same translation for untracked paths (`tools/claims-worklist.sh:79-104`). A
staged rename from `docs/governance/OPERATING_AGREEMENT.md` to
`docs/reviews/moved-operating-agreement.md` was `R100` under
`git diff --name-status -M HEAD`; `bash tools/claims-worklist.sh
--changed-only` emitted only the destination. Translating a legal newline in a
pathname also destroys record framing.

**Problem.** The script's statement that both sides of every rename are emitted
is false for dirty/index state. The blocking spec's fingerprint still went red
in this staged fixture, so this is diagnostic rather than a current merge-gate
false accept.

**Required fix.** Parse cached and worktree `--name-status -M -z` streams using
the same record logic as the committed range, and do not translate NUL framing
before path classification.

**Class swept.** Committed rename parsing is clean; staged dirty rename is
affected; an unstaged filesystem move exposes the tracked deletion through the
source path and the destination through the untracked leg.

## Claim ledger

| #   | Claim                                                                    | Tag                 | Evidence                                                                                                                                                 |
| --- | ------------------------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The current targeted spec is green.                                      | MEASURED            | Required rerun below: exit 0, 7/7.                                                                                                                       |
| 2   | Missing commission and duplicate upstream IDs can pass.                  | MEASURED            | Constructed real-spec fixtures in M1, each exit 0.                                                                                                       |
| 3   | `DISCLOSED` remains a self-pass route.                                   | MEASURED            | Constructed C01 fixture in M2, exit 0.                                                                                                                   |
| 4   | A later branch can inherit the old certificate unchanged.                | MEASURED            | Simulated `origin/main=2bd1aa7`; universal-only future commit, exit 0.                                                                                   |
| 5   | A literal full-message hash need not recurse.                            | MEASURED / INFERRED | Message-preserving amend kept the measured range hash stable while changing HEAD; CI/excluded-range alternatives follow from the defined input boundary. |
| 6   | Unstaged tracked governed mode is invisible to the fingerprint.          | MEASURED            | Plain chmod fixture in M4, exit 0.                                                                                                                       |
| 7   | The no-base blocking path and general malformed fingerprint repair work. | MEASURED            | No-base and `not-a-hash` fixtures each exited 1.                                                                                                         |
| 8   | No governed path is touched by PR #141.                                  | MEASURED            | `git diff --name-status -M 9e95e4c...2bd1aa7 -- docs/governance docs/templates ai_rules.md CLAUDE.md` emitted zero records.                              |
| 9   | This change should not merge at the reviewed head.                       | JUDGEMENT           | Four merge-blocking false accepts above. Owner arbitration remains controlling.                                                                          |

**Weakest claims.** I did not run on a hosted Actions runner or a fork, so the
CI conclusion is limited to source inspection and constructed ref shapes. The
future-branch policy fix has design choices; the false accept is measured, but
whether the owner wants per-PR files, an attestation, or another lifecycle is a
governance/product decision. Atomicity of natural-language question content
cannot be fully mechanised; my narrower claim is that several currently
labelled single rows visibly combine independently falsifiable clauses.

## Required §3.5 reruns and verification

### 1. Load-bearing spec

```text
$ npm run test:unit -- tests/unit/author-ledger.spec.ts
Test Files  1 passed (1)
Tests       7 passed (7)
REAL_EXIT=0
```

This establishes that the checked-in artifact is green under its own current
tests; it does not establish that those tests reject the constructed states in
M1-M4.

### 2. Deeper constructed Git attack

I used isolated shared clones and drove the **real spec** from the repository's
installed Vitest using `HAVDM_LEDGER_REPO`, rather than substituting a parser or
mock. Representative command shape:

```text
$ HAVDM_LEDGER_REPO=/tmp/<fixture> npm run test:unit -- tests/unit/author-ledger.spec.ts
```

| Constructed state                                                   | Real exit/result       | Disposition                                     |
| ------------------------------------------------------------------- | ---------------------- | ----------------------------------------------- |
| Checked-in `2bd1aa7` control                                        | 0; 7/7 pass            | Clean control                                   |
| Reflog-retained first content commit `faf55d8`                      | 1; three M1 candidates | Author's post-commit red independently verified |
| Commission file absent, ledger retained                             | 0; 7/7 pass            | **False accept — M1**                           |
| Ledger C07 absent, commission retained                              | 1; M3 assertion fails  | Repair works for its published narrow case      |
| Commission C10 relabelled to duplicate C09; ledger C10 removed      | 0; 7/7 pass            | **False accept — M1**                           |
| C01=`DISCLOSED`, evidence says unresolved/no owner acceptance       | 0; 7/7 pass            | **False accept — M2**                           |
| Unstaged chmod of tracked governed file                             | 0; 7/7 pass            | **False accept — M4**                           |
| Simulated merged main plus `all checks passed`, old files inherited | 0; 7/7 pass            | **False accept — M3**                           |
| Later `777 tests passed` count candidate                            | 1; M1 assertion fails  | Narrow post-commit control works                |
| Governed fingerprint declaration=`not-a-hash`                       | 1; exact mismatch      | General malformed-input repair works            |
| Neither `main` nor `origin/main` exists                             | 1; suite load fails    | No-base fail-closed repair works                |

This is deeper than the published fixture set in three ways: it attacks the
commission parser and ID namespace rather than only removing a ledger row; it
simulates the post-merge future-branch lifecycle; and it distinguishes staged
mode coverage from unstaged tracked state. Temporary fixture mutations were not
made to the review branch.

### 3. Full repository gate

The completed review document was present in the working tree for this run.
The result is filled from the real command, not from a piped subcommand:

```text
$ ./tools/checks
lint:        0 errors / 145 warnings
format:      clean
typecheck:   clean
unit:        1342 passed across 102 files
REAL_EXIT=0; 4/4 steps reached and passed
```

The watched `tests/unit/DeployDialog.spec.tsx` file passed 11/11 in that same
run; no flake discrimination or rerun was needed.

### Additional checks

- `bash tools/claims-worklist.sh --require-pr 141` — **exit 0**, live PR body
  read.
- `bash tools/check-pr-evidence.sh 141` — **exit 0**; it reported nine
  candidates after this review draft existed. The two historical SHAs are
  ancestors intentionally pinned to historical artifacts, not claimed as
  current head.
- Current commit-message candidate extraction returned exactly `145 warnings`,
  `1342 tests`, and `102 files`; each occurs in the ledger.
- The reflog retains the author's first content commit `faf55d8`. Running the
  real spec against that exact tree returned **exit 1** on precisely
  `145 warnings`, `1342 tests`, and `102 files`; current `2bd1aa7` passes with
  those three dispositioned. This independently verifies that the author's own
  content commit fired the M1 leg. The uncommitted pre-commit green tree itself
  was never a Git object and remains unverified, but it is not needed to
  establish the post-commit invalidation.
- E2E, integration, UAT, packaging, a hosted runner, forks, live Home Assistant
  and older/newer Git versions were not run. No `src/` path changed; these do not
  decide this unit/tool/docs review. The documented `DeployDialog` watched
  flake did not fire in the targeted run.

## Directions to the owner

Keep the tracked commission and the post-commit CI execution, but do not rely
on this head as the class-(d) self-pass gate. M1-M4 are repairs within the
chosen design rather than a required pivot: make inputs mandatory and fresh,
constrain dispositions, bind the certificate to branch/head state, and cover
tracked dirty state. N1-N2 can land in the same correction because both are
small shell population fixes, but they are not independently merge-blocking.

No source, governance text, state drawer or UAT artifact should change to
answer this review. The owner decides whether a correction warrants another
independent round; this review neither approves nor merges.

## Verification boundary

I read the prior withdrawn review, all five changed artifacts, the tracked
commission and ledger, Operating Agreement §3, the Testing Standards evidence
and definition-of-done sections, and the six reviewer-facing practice rules. I
inspected the live PR #141 body and metadata. I changed only this review file in
the branch; every hostile mutation was confined to `/tmp` fixtures.

I could not establish the discarded pre-amend history, hosted/fork checkout
behaviour, semantic false-negative rate of a lexical claim key, or truth of
author evidence beyond the cases independently rerun. Those are explicitly
separated above from checked-clean results.

## MemPalace drawer candidates

- `wing="havdm"`, `room="review"`, `added_by="codex"` — `[REVIEW] PR #141
SELF-PASS GATE ROUND 1 — CHANGES-REQUIRED; NOT MERGE-READY. Reviewed 2bd1aa7
against 9e95e4c. Targeted spec is green (7/7), no-base and malformed
fingerprint repairs work, and current commit counts are dispositioned.
Merge blockers: missing/malformed/empty commission input and duplicate
commission IDs collapse to a green population; DISCLOSED/NORMATIVE remain
self-pass routes; fixed-path commission/ledger files are inherited green by
a future branch and universal-only commit messages are not a checked
population; tracked unstaged governed state is omitted from the index-based
fingerprint. Advisory shell defects: resolvable unrelated base exits 0 empty,
and dirty rename output is destination-only/not NUL-safe. Full gate:
REAL_EXIT=0, 4/4 passed; lint 0 errors/145 warnings; format/typecheck clean;
unit 1342/102. Only the owner arbitrates and merges.`
- `wing="practice"`, `room="verification"`, `added_by="codex"` — `[PATTERN]
ENUMERABLE INPUT MUST ALSO BE MANDATORY, UNIQUE AND LIFECYCLE-BOUND. Moving a
commission into a tracked file does not fail closed if absence, malformed
structure or duplicate upstream identifiers become an empty/collapsed
obligation, and fixed filenames can let a later branch inherit an old green
certificate. Test input existence, schema, identifier uniqueness and future
branch freshness separately.`
- `wing="practice"`, `room="verification"`, `added_by="codex"` — `[PATTERN]
DISTINGUISH INDEX COVERAGE FROM WORKING-TREE COVERAGE. git ls-files -s hashes
staged mode/object state; it does not observe an unstaged tracked edit,
deletion or chmod. If a checker claims dirty-tree coverage, hash the actual
tracked worktree state or reject it, and prove both staged and unstaged
controls against the old implementation.`
