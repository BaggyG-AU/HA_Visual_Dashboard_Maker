Author: OpenAI Codex, 2026-08-09
Reviewer: REQUIRED — a different model; not yet run
Owner gate: BaggyG-AU adjudicates this review and remains the sole merger of PR #140

# Adversarial review — self-pass gate

## Independent account formed before assessing the fix

### (a) Why this author kept shipping defects

**MEASURED:** the seven reviewed rounds contain 19 author-attributable defects:
the 16 rows in the PR #139 process ledger plus PR #140 round 1's M1, M2 and N1.
Of the 16 ledgered defects, 14 had a specific author-published check that would
have exposed them; R6-M1 was actually found by its check, leaving 13 named and
not run. The missed checks were not uniformly hard: some required constructed
Git state, while others required a source-to-claim comparison, a full
instruction-route trace, or a worked lifecycle.

**INFERRED:** the immediate cause was not lack of adversarial imagination. It
was a handoff cadence in which writing the question completed the author's
visible task, while executing it was optional, unrecorded work. The 3.4–15.7
minute fix cadence made constructed-state checks especially likely to lose,
but cost is only part of the cause: the same non-execution affected cheap
document reads and reconciliation checks. The loop rewarded a fast answer and
had no artifact that distinguished a performed self-pass from a predicted one.

**INFERRED:** a second, independent cause was scope creation. PR #139 answered
a definition gap with an executable governance mechanism, and successive
repairs kept creating or retaining new surfaces faster than the author's checks
covered their behavioural population. The repository gate pointed away from
those surfaces: it formatted governance prose but did not exercise the embedded
commands or the live PR body. The author did find eight defects in prose or
scratch work that was cheap to reread, yet no mechanism defect before review
except R6-M1's later audit case.

**JUDGEMENT:** the defect stream therefore has three coupled causes: an
execution-accountability gap, a cadence that makes the strongest checks costly,
and repeated expansion of untested mechanism. The author's cost-asymmetry
account explains an important selection pressure, but it is too narrow if it
implies that visibility alone resolves omissions or scope creation.

### (b) Five most likely ways the proposed fix fails

1. **The ledger cannot expose a thought that never becomes a row.** PR #140 M1
   is the demonstrated control: the author examined the winning surface, judged
   it, and omitted it. A generated claims list cannot enumerate hostile cases,
   instruction routes, lifecycle walks, or discarded observations.
2. **The generated key becomes a budget-tuned proxy for the claim population.**
   Numeric/plural and quantifier/word syntax can miss semantically equivalent
   claims, while a row-presence assertion can still pass without deciding truth.
3. **The self-administered dispositions become the cheap path.** `NORMATIVE`,
   `DISCLOSED`, fabricated `actual` text, or an over-broad row can turn skipped
   execution into syntactically valid `OPEN=0`; reviewer visibility is not a
   blocking decision check.
4. **The staleness and trigger population diverge from the surfaces that ship.**
   A governed-content fingerprint can stay stable while the commission, commit
   message, review evidence, or live PR body changes, and a branch whose only
   false claim is in the PR body may never trigger the governed-artifact test.
5. **The new mechanism becomes another defect lineage while the complementary
   controls remain absent.** The gate and generator add 432 lines, but the
   append-only observation discipline, PR #138's decidable evidence check, the
   independent hostile-case runner, and per-PR outcome measurement are unbuilt.
   A complex detector that is itself weakly reviewed can consume the attention
   that those controls need.

## Question 1 — are the five changes described accurately?

**MEASURED:** the headline history is accurate. The process review enumerates
16 rows; PR #140 round 1 adds M1, M2 and N1 while identifying N2 as
pre-existing, yielding 19 author-attributable defects. Fourteen of the 16 had a
specific published check; R6-M1's check was run and found it, leaving 13 named
and not run.

| #   | Correctly described? | Built status independently checked                                                                                 | Result                                                                                                                                                                                                                                                                        |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **No**               | **BUILT:** 215-line spec and 76-line ledger                                                                        | The files and simple `UNRUN`/blank/`OPEN` checks exist, but the test neither imports the commission's questions nor enforces atomic rows. The committed head is red, its ordinary CI checkout skips the suite, and its target misses parts of the population discussed below. |
| 2   | **No**               | **BUILT:** 141-line executable script                                                                              | The test consumes the script's local-output mode, so the regex has one implementation. It does not consume `--with-pr`, does not emit the claim population, and currently emits 51 local candidates rather than the ledger's reported 35.                                     |
| 3   | **Yes**              | **NOT BUILT:** `tools/check-pr-evidence.sh` is absent at `HEAD`; PR #138 remains open at `a4f6060` and contains it | The proposed advisory/blocking split has not landed on this branch.                                                                                                                                                                                                           |
| 4   | **Yes on status**    | **NOT BUILT:** no changed artifact implements an adversarial subagent                                              | The repository confirms absence. Whether the owner has separately authorised the future runner is not mechanically decidable from the branch.                                                                                                                                 |
| 5   | **Yes**              | **NOT BUILT:** no per-PR named-and-not-run measurement exists                                                      | The adoption drawer records the baseline but no outcome recorder or trend gate is present.                                                                                                                                                                                    |

**MEASURED:** the claim that `vitest` is the programmable blocking leg in the
four-command local gate is fair, and `tools/checks` runs lint, format,
typecheck and unit in the same order as CI. CI additionally installs and
packages. The cited obligation is misstated: `ai_rules.md` §5 says the agent
**MAY** run tests and forbids claiming an unperformed run; the imperative to
report `./tools/checks` is in `OPERATING_AGREEMENT.md:78-81`, not an obligation
in §5 to execute it. More importantly, the CI execution path does not enforce
this particular test because of finding M2 below.

**JUDGEMENT:** rejecting a same-commit SHA is correct. A ledger inside the
commit it names creates a self-reference: changing the ledger to insert the
SHA changes the SHA. The content fingerprint is a reasonable substitute for
tracked governed contents, but it is narrower than the commissioned head and
therefore a weakening, not an equivalent replacement. It excludes commit
messages, the PR body, untracked governed additions, the ledger, the detector
and the generator.

## Question 2 — causal verdict

### PARTLY

**JUDGEMENT:** the five-change set would reduce the measured
named-but-not-executed class, but it will not resolve the full cause. A faithful
zero-`UNRUN` ledger makes a skipped published check visible; a parallel hostile
runner reduces the cost of constructed state; the PR-evidence check reaches a
decidable stale-SHA class; and measurement would reveal whether the rate moves.
Those are useful, complementary controls.

**INFERRED:** the set still leaves two causal routes open. It does not prevent
scope creation—the mechanism added to answer a finding becoming the next
multi-round artifact—and it does not capture a considered concern deleted
before it becomes a commission row. The unbuilt append-only observation
discipline is the only proposed control that reaches PR #140 M1. The subagent
can only execute the cases it receives, while measurement detects failure
afterward rather than preventing it.

**MEASURED:** the implementation weakens the strongest part of the proposal.
The process review requires every commissioned question, named hostile case and
weakest claim to become a separate row. The test reads no commission and
accepts grouped rows, `NORMATIVE`, `DISCLOSED`, and any non-empty `actual` text.
Thus the actual gate still relies on the author to preserve the very questions
history shows were omitted or delegated.

### Historical replay — the 16 named defects

This replay states the counterfactual explicitly. **Intended ledger** assumes
the published commission is transcribed as the process review requires and the
historical absence of execution is honestly recorded as `UNRUN`. **Actual
mechanical guarantee** asks whether the shipped test itself forces that row and
its truth. It does not for any row; it only validates rows the author supplied
plus regex candidates.

| Finding | Specific check existed by handoff?                      | Intended ledger outcome                    | Actual mechanical guarantee                   |
| ------- | ------------------------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| M1      | Yes — pilot/class-(d) coherence                         | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| M2      | Yes — walk the narrow-round lifecycle                   | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| M3      | Yes — n=1 and source-to-rerun replay                    | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| M4      | Yes — end-to-end MP-LEASE route                         | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| R2-M1   | Yes — game blocklist; find a third surface              | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| R2-M2   | Yes — read `ai_rules.md` as the no-palace reviewer      | **BLOCK: `UNRUN`**                         | `DISCLOSED` can pass without owner acceptance |
| R3-M1   | Yes — construct a behaviour-bearing false accept        | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| R3-M2   | Yes — read §11 and five destination surfaces end to end | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| R3-N1   | Yes — pointer-only narrative question                   | **BLOCK: `UNRUN`**                         | `DISCLOSED` can pass                          |
| R4-M1   | Yes — real rename/deletion records                      | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| R5-M1   | Yes — transient add/remove history                      | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| R5-N1   | **No** — `core.quotePath` variation came later          | **MISS**                                   | Miss                                          |
| R6-M1   | Yes, and the audit ran it                               | **CAUGHT before handoff; no `UNRUN` fire** | The run, not row validation, caught it        |
| R6-M2   | Yes — `diff.*` and `git replace`                        | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| R6-M3   | Yes — reconcile command birth with rationale            | **BLOCK: `UNRUN`**                         | No commission-to-ledger check                 |
| R6-N1   | **No** — terminal ordinal was not named                 | **MISS**                                   | Miss                                          |

**MEASURED:** intended coverage is 13 blocking `UNRUN` rows, one defect caught
by an executed check, and two misses: 14 of 16 exposed before handoff. The
shipped test guarantees none of that 14-row transcription. This distinction is
why the verdict is `PARTLY`, not `WILL`.

## Question 3 — implementation findings

### M1 — MERGE-BLOCKING: the committed head fails its own gate

**MEASURED:** the exact spec on `fd626be` fails. The generator emits 51 local
candidates; 13 have no ledger row. The author reported a pre-commit green run,
but the generator also scans every branch commit message. Commit `fd626be` then
introduced 22 matching phrases, including the 13 now missing, while the target
fingerprint remained `05780a57bb4d` because it excludes commit messages.

```text
$ npm run test:unit -- --reporter=verbose tests/unit/author-ledger.spec.ts
... these claim candidates have no ledger row:
  102 files ... two rows
Test Files  1 failed (1)
Tests       1 failed | 5 passed (6)
```

**INFERRED:** this is not merely a stale ledger. It is a lifecycle defect: a
pre-commit pass cannot see the content commit's message, and the fingerprint
cannot invalidate itself when that message appears. The branch's published
`REAL_EXIT=0` is true only of the pre-commit tree, not the committed head the
owner is asked to merge.

### M2 — MERGE-BLOCKING: ordinary CI silently skips the detector

**MEASURED:** `.github/workflows/ci.yml:15` uses `actions/checkout@v4` without a
history or base-ref fetch. The detector resolves only `origin/main` or `main`
and deliberately registers a skipped test if neither exists
(`author-ledger.spec.ts:72-89`). An isolated one-commit, single-branch clone
reproduced that state:

```text
$ git clone --depth 1 --single-branch --branch feature/governance-arb-r8-mp-lease ...
$ git rev-parse --verify --quiet main; echo $?
1
$ git rev-parse --verify --quiet origin/main; echo $?
1
$ ./node_modules/.bin/vitest run tests/unit/author-ledger.spec.ts --reporter=verbose
↓ skipped — no resolvable base ref (main / origin/main)
Test Files  1 skipped (1)
VITEST_EXIT=0
```

**JUDGEMENT:** a blocking detector must fetch the comparison base or fail
closed. Reporting the skip in Vitest output is not blocking CI.

### M3 — MERGE-BLOCKING: the test does not enforce the commission ledger it was built to enforce

**MEASURED:** the adopted process requires each commissioned question, named
hostile case and weakest claim in its own atomic row
(`pr139-author-process-review-codex.md:50-60`). The implementation never reads
`prompts/codex/`; those commissions are gitignored. Its “atomic” test checks
only that four cells are non-empty and that the disposition is in a list
(`author-ledger.spec.ts:157-173`). It adds `NORMATIVE` and `DISCLOSED` to the
reviewer's four dispositions, both compatible with `OPEN=0` without owner
acceptance.

The shipped ledger itself proves the check is not atomic:

```text
C07: "101 files" / "0 errors" / "145 warnings"
C15: "never kill" / "never set" / "never merges" / "never writes" / "never uses"
C17: six separate "every ..." claims

$ vitest run tests/unit/author-ledger.spec.ts -t 'every row is atomic'
Tests  1 passed | 5 skipped (6)
ATOMIC_TEST_EXIT=0
```

**INFERRED:** an author can omit a commissioned hostile case, combine many
candidates in one broad row, or write a non-empty assertion and `DISCLOSED`;
the mechanism cannot distinguish that from execution. That recreates the
named-and-not-run failure at the ledger boundary.

### M4 — MERGE-BLOCKING: the obligation and fingerprint miss governed changes

**MEASURED:** committed-change discovery uses default
`git diff --name-only`. Git's rename detection supplies only the destination.
In an isolated real-commit control, moving an unchanged file out of governed
scope produced:

```text
$ git diff --name-status 485043f...960b69e
R100  docs/governance/gate.md  docs/reviews/gate.md
$ git diff --name-only 485043f...960b69e | awk '/^docs\/governance\//'
<no output>
```

The detector would take its “no governed artifact changed” branch. This is the
same rename-preimage class that cost PR #139 another round.

**MEASURED:** the fingerprint enumerates only `git ls-files`. I added an
untracked file under `docs/governance/`; `git status` reported it while
`claims-worklist.sh --fingerprint` remained the ledger's certified
`05780a57bb4d`. The file was then removed. A newly created governed artifact can
therefore appear after the self-pass without staling the target, even though
the test comment claims the obligation bites while the author is editing.

**JUDGEMENT:** use a rename-decomposed committed population, a NUL-safe status
population, and a fingerprint that includes cached and untracked governed
paths with type/mode as well as content.

### M5 — MERGE-BLOCKING: the live PR-body row does not test the live PR body

**MEASURED:** the test requires only a row whose ID is `PR-BODY`
(`author-ledger.spec.ts:182-187`). Its generator call at lines 193-197 omits
`--with-pr`. On the current branch the live body adds four candidates that the
test never requests:

```text
LOCAL_EXIT=0 LOCAL_COUNT=51
PR140_EXIT=0 PR140_COUNT=55
additional: "1 findings", "1 is", "every defect", "ten minutes"
```

The optional path is also fail-open: `gh pr view ... || true` suppresses a read
failure. `--with-pr 999999999` exited 0 and returned exactly the local 51-row
output. A false claim introduced only in the live PR body neither triggers the
governed-artifact obligation nor enters candidate validation.

### N1 — NON-BLOCKING: the grep is a candidate key, not the claim population

**MEASURED:** the current script says this accurately in its own comments, but
the adoption account and change description call its output the population.
The exact key missed each constructed claim below except the friendly control:

```text
There are 24 unique commits.                 => MISSED
No reviewer can bypass the lease.            => MISSED
Each governed artifact has a ledger.         => MISSED
The complete set of paths is covered.        => MISSED
Five newly added files were checked.         => MISSED
All four files were checked.                 => All four
```

**JUDGEMENT:** no lexical key can establish a semantic false-negative rate
over “claims” without a labelled hand trace. Keep the tool advisory as a worklist
generator and remove any suggestion that it generates the complete population.

### N2 — NON-BLOCKING: the authority chain is cited too strongly

**MEASURED:** `ai_rules.md:161` says tests **MAY** run; lines 168-177 govern
truthful reporting after a run. The Operating Agreement, not §5, carries the
imperative `Report ./tools/checks` wording. Historical conduct supports the
claim that this author routinely runs the gate, but “an obligation that is
never skipped” is not established by the cited source and is refuted for CI by
M2.

## Disease-shaped objection and opportunity cost

**JUDGEMENT:** putting the detector in a unit test is a sound authority
boundary. A defect in it is ordinary PR evidence/code, not a governance-law
amendment. That defence does not establish reliability: the first committed
version is already red, fail-open in CI, blind to its commission population,
and repeats the rename-preimage defect from PR #139. The same disease has
recurred, but its repair need not become another governance amendment.

**MEASURED:** PR #138 remains open with a 231-line evidence script and a
40-line testing-standard addition. PR #140 instead adds 432 lines for the
ledger/generator pair while three of five proposed controls remain unbuilt.
This is not proof that #138 should have landed first: its grep is advisory and
only the SHA leg is decidable. It is evidence that the current mechanism should
not be treated as a complete replacement for that existing work.

## Recommendation to the owner

**Keep with changes; do not merge `fd626be` as-is.** Preserve the idea of a
tracked execution trace, but require these corrections before relying on it:

1. Fetch the PR base in CI and fail closed when the base or generator is
   unavailable.
2. Make the post-commit head pass the gate; include commit-message state in the
   target or move commit-message checking to a post-commit/PR check with an
   explicit lifecycle.
3. Put the commissioned checks in a tracked, mechanically enumerable surface
   and enforce unique atomic rows. Separate empirical-check dispositions from
   `NORMATIVE`; do not let `DISCLOSED` substitute for owner acceptance of an
   in-scope residue.
4. Fix the governed-change population: decompose renames, parse status NUL-safe,
   include untracked additions in the fingerprint, and test fail-against-old
   cases for each.
5. Make the live PR-body read mandatory where claimed, propagate `gh` failure,
   and use PR #138's decidable SHA check rather than another grep proxy.
6. Build the append-only observation control before claiming the PR #140 M1
   class is addressed, then record named-and-not-run on subsequent PRs as
   proposed so the intervention remains falsifiable.

## Verification boundary

**MEASURED:** I read the defect audit, all six rounds of the PR #139 review, the
six source commissions at the cited checks, PR #140 round 1, the process review,
the four required MemPalace drawers, `ai_rules.md`, the CI/local gates, the
implementation and its ledger. I inspected the live GitHub state of PRs #138,
#139 and #140. I did not edit the artifacts under review.

**UNVERIFIED:** no older/newer Git binary or real GitHub Actions runner was
available. The shallow-clone test reproduced the workflow's relevant ref
shape, not the hosted runner itself. The semantic false-negative rate of the
grep is undecidable without a labelled claim corpus. Changes 4 and 5 cannot be
tested because they are unbuilt. E2E, integration, UAT, packaging and live Home
Assistant were not run; none decides this docs-and-unit-test review.

## Verification

**MEASURED:** `./tools/checks` returned **REAL_EXIT=1**. It reached **4/4
steps**, but did not pass 4/4: lint completed with **0 errors / 145 warnings**;
format was clean; `tsc --noEmit` was clean; unit returned **1 failed / 1,340
passed across 102 files**. The sole failure was
`tests/unit/author-ledger.spec.ts` rejecting the 13 undispositioned candidates
listed in M1. This is the real gate result; it is not piped or laundered.

**MEASURED:** the normal `mempalace_add_drawer` attempt returned peer-writer
error `-32001` and identified this reviewer's server as read-only. I did not
retry, use `mempalace_checkpoint`, kill the holder, or set
`MEMPALACE_MCP_ALLOW_PEER_WRITER`. The candidates below are the MP-LEASE
handoff.

## MemPalace drawer candidates

- `wing="havdm"`, `room="review"`, `added_by="codex"` — `[REVIEW] CODEX
ADVERSARIAL REVIEW OF PR #140 SELF-PASS GATE — PARTLY; KEEP WITH CHANGES; NOT
MERGE-READY. Reviewed fd626be against main a6ce103. The five-change proposal
targets the named-but-not-run class but does not resolve scope creation or
omitted observations, and three controls remain unbuilt. Intended historical
replay: 13 of 16 rows would block as UNRUN, R6-M1 was caught by an executed
check, and R5-N1/R6-N1 had no contemporaneous check. The shipped
implementation does not mechanically guarantee transcription of those
checks. Merge blockers: (M1) fd626be fails its own ledger test because its
post-gate commit message adds 13 undispositioned candidates while the
fingerprint stays unchanged; (M2) default shallow CI checkout leaves neither
main nor origin/main and the suite it.skips with exit 0; (M3) the test does
not read the gitignored commission or enforce atomic rows and adds
NORMATIVE/DISCLOSED pass routes; (M4) default --name-only hides the governed
preimage of a rename and the fingerprint ignores untracked governed
additions; (M5) the PR-BODY test checks only a row ID, calls the generator
without --with-pr, and the optional gh read fails open. Non-blocking: the grep
misses ordinary claim syntax and ai_rules.md §5 is a truthful-reporting rule,
not the cited execution obligation. Full gate: REAL_EXIT=1, all 4 steps
reached; lint 0 errors/145 warnings; format clean; typecheck clean; unit 1
failed/1340 passed across 102 files. Review document:
docs/reviews/self-pass-gate-adversarial-review-codex.md. Only the owner
adjudicates and merges.`
- `wing="practice"`, `room="review"`, `added_by="codex"` — `[PATTERN]
MECHANISING A ZERO-UNRUN LEDGER WITHOUT MECHANISING THE COMMISSION-TO-LEDGER
POPULATION PRESERVES THE OMISSION FAILURE. A validator that checks only rows
the author supplied cannot distinguish a completed commission from a
commission whose hardest question was deleted. Put the commissioned checks
in a tracked enumerable surface, require unique atomic rows, and prove the
validator fails when a known question is removed.`
- `wing="practice"`, `room="verification"`, `added_by="codex"` — `[PATTERN] A
PRE-COMMIT GATE CANNOT CERTIFY INPUT THAT ONLY EXISTS AFTER THE COMMIT. If a
checker scans commit messages but its target covers only working-tree files,
the content commit can make a pre-commit green result red without invalidating
the certificate. Either move the check to the post-commit/PR stage or include
that later population in a target whose lifecycle can be satisfied.`
