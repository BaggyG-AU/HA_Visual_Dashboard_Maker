Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

SEV-1-BLOCKED

# Independent implementation review — PR #154 plan-consistency checker

## Confidence and method

High confidence in the three blocking findings. I reviewed PR #154 at
`d3fb800c2dbea342b2bce7009aec123b8f2ce0f2`, with `542e9bd` confirmed as an
ancestor, and read the PR body; both changed files; the whole live plan and history;
and `OPERATING_AGREEMENT.md` §§3.1, 3.4, 3.5, 3.6 and 3.7. I read the checker as a
gate, then exercised its actual population: the real plan, history and live spacing
DSL. The branch was clean before the review probe and again after that temporary
file was deleted.

The live-plan assertion **did run**. Its 9 ms body time is not suspicious: the two
documents are 97,130 bytes in total and the DSL is another 15,687 bytes, and the
checker performs in-memory regex scans rather than Electron work. More importantly,
in-memory mutations of the real documents made C1, C2, C3 and C4 each fire. The
unmodified pass is nevertheless not sufficient clearance: F2 shows a realistic
C3 contradiction added to that same real document which still returns no finding.

Commands and real results:

```text
$ git diff --name-status 542e9bd...HEAD
A tests/support/planConsistency.ts
A tests/unit/planConsistency.spec.ts
exit 0

$ git merge-base --is-ancestor 542e9bd HEAD
exit 0

$ npx vitest run tests/unit/planConsistency.spec.ts --reporter=verbose
24 passed / 1 file; 0 skipped; exit 0
named live assertion: reports no finding against the live plan (9 ms)

$ npx vitest run tests/unit/planConsistency.review-probe.spec.ts --reporter=verbose
16 passed / 1 temporary file; exit 0
(The assertions pinned and printed current behaviour, including false accepts;
the temporary file was deleted before the repository gate.)

$ ./tools/checks
lint: 0 errors / 145 warnings
prettier: pass
tsc --noEmit: pass
vitest: 1,437 passed / 105 files / none skipped
REVIEW_REAL_EXIT=0
```

The commission's baseline arithmetic was also re-derived in a disposable detached
worktree at `542e9bd`:

```text
$ npx vitest run --reporter=dot
1,412 passed + 1 failed = 1,413 tests / 104 files
BASE_UNIT_EXIT=1
```

The failed test was the existing `DeployDialog` “errors clearly when there is no
config to deploy” test timing out at 5,000 ms. I did not retry it: the run establishes
the base population, not a green base. At reviewed head, the repository gate's
1,437/105 pass independently establishes the post-merge population. The measured
population delta is therefore +24 tests and +1 file; a clean base-suite result is
**UNVERIFIED** by this review.

§3.5 item 2 is **N/A**. `checkPlan` is a deterministic pure string checker; neither
its implementation nor its focused spec contains a timing, retry, process, browser
or network mechanism to deepen. Inventing a repeat would not test another property.

### Adversarial probe results

These are the exact behavior classes exercised by the temporary unit probe. A
“clean” output below means `checkPlan` returned no finding of the named kind; it does
not mean the input was correct.

| Probe input                                                                                                                                          | Current output               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Real plan plus an uncalled method declaration                                                                                                        | `C1-ORPHAN`                  |
| Real plan plus an undispositioned `SP-99999` reference                                                                                               | `C2-NODISPOSITION`           |
| Real plan plus two recognised round-total sentences                                                                                                  | one `C3-COUNTDRIFT`          |
| Real plan with leg 1 moved before the helper                                                                                                         | one `C4-SEQUENCE`            |
| Real canonical totals block plus one prose `Seven review rounds complete` restatement                                                                | C3 clean                     |
| `Across two review rounds, option A was rejected` plus `Across three review rounds, option B was refined`                                            | `C3-COUNTDRIFT`              |
| Unquoted five-round total plus quoted or code-spanned six-round current status                                                                       | C3 clean in both cases       |
| Five-round total plus `the eleventh review round`, `the twenty-first review round`, `the 11th review round`, or `one hundred review rounds complete` | C3 clean in each tested case |
| `twenty four findings` plus another finding site                                                                                                     | first value reported as 4    |
| `1,413 findings` plus another finding site                                                                                                           | first value reported as 413  |
| C4 sequence with no helper step, a renamed heading, or a flattened list                                                                              | C4 clean in each tested case |
| Two mutually recursive private methods unreachable from the DSL                                                                                      | C1 clean                     |
| Raised `SP-99` plus the same disposition row without bold emphasis around its ID                                                                     | `C2-NODISPOSITION`           |

### What I did not check

- Electron, e2e, integration, live HA and the packaged app were **UNRUN**. The PR
  diff is the two unit-support files enumerated above, and the focused mechanism is
  pure string processing, so no Electron leg is owed.
- I did not re-run the author's historical revision-4, revision-5 or revision-6
  fixtures from Git history. Their current distilled fixtures ran; the historical
  run claims remain **UNVERIFIED** by this review.
- I did not download or replay GitHub Actions artifacts. I read the PR body's
  claims, then used local runs pinned to `d3fb800`.
- I did not edit `src/`, the checker, its committed spec, snapshots, expected
  failures, governance state, UAT material, the PR body or either HA instance. I did
  not run an application window, merge, push or rebaseline anything.

## Claim ledger

| #   | Claim                                                                             | Tag           | Evidence                                                                                                                                                                                                                                                     |
| --- | --------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | “The live-plan test now runs and passes.”                                         | **MEASURED**  | The focused command printed the named live assertion as passed, 24/24, none skipped, exit 0. Real-document hostile mutations made each code C1–C4 fire. The stronger claim that the clean result certifies the stated policies is refuted by F2.             |
| 2   | `checkPlan`'s no-declaration guard is live.                                       | **MEASURED**  | The focused run executed and passed `THROWS rather than passing when it can parse no declaration at all` (`planConsistency.spec.ts:71-74`).                                                                                                                  |
| 3   | Each of C1, C2, C3 and C4 has at least one hostile fixture in the committed spec. | **MEASURED**  | The named firing tests are at `planConsistency.spec.ts:34`, `:78`, `:95` and `:241`; all four ran in the 24-test focused command. F3 explains the missing opposite structural controls for C4.                                                               |
| 4   | Expected unit population moves 1,413/104 → 1,437/105.                             | **MEASURED**  | Detached-base and reviewed-head runs enumerated those populations. The base attempt was red, so this row confirms the population arithmetic, not a clean base.                                                                                               |
| 5   | PR #154 is §3 class (d), capability-class.                                        | **JUDGEMENT** | OA §3 applies class (d) to every slice implementation; §3.7 names test DSLs and CI logic as capability-class shared machinery. This PR adds a mandatory gate over governed artifacts. I agree with the commission and do not regard this review as ceremony. |
| 6   | This PR is unit-only; no Electron or e2e/integration leg is owed.                 | **MEASURED**  | `git diff --name-status 542e9bd...HEAD` lists the checker and its Vitest spec. Reading both found no Electron/Playwright runtime. The focused run used Vitest only.                                                                                          |
| 7   | §3.5's deeper-repeat item is N/A.                                                 | **JUDGEMENT** | The reviewed mechanism is deterministic string processing with no repeatable flaky path.                                                                                                                                                                     |

**Weakest claims for the follow-up reviewer:** severity depends on treating silent
disablement of the core gate as artifact-blocking; the distinction between a quoted
historical statement and a quoted current assertion is semantic, so the recommended
repair must shrink C3's claim rather than promise a complete regex; and the C1 cycle
case in F6 matters only if “orphan” means unreachable rather than literally
zero textual callers.

## Findings

### F1 — SEV 1 — deleting or renaming the governed plan deletes its own gate

**Broken decision/claim.** The advertised post-merge consequence is a merge blocker
on edits to the two plan documents. A mandatory input cannot be allowed to remove
the test that requires it.

**Violated fact.** The live assertion is declared with
`it.skipIf(!existsSync(SPEC))` (`tests/unit/planConsistency.spec.ts:269-280`). If
the plan is absent, the test body does not call `readFileSync` or `checkPlan`; Vitest
records a skip, not a failure. The same body also substitutes empty text when the
history or DSL is absent (`:277-278`).

**Concrete failure scenario.** A later change deletes, renames or loses
`SPACING_HELPER_PRESET_PLAN.md` in a merge. Input: no file at `SPEC`. Wrong output:
the load-bearing test is skipped and the unit runner remains green if nothing else
fails. This is the same mechanism the PR body records for the pre-`542e9bd` green
runs; rebasing so the test runs today does not remove the bypass tomorrow.

**Why mitigation does not cover it.** C1's no-declaration throw is inside the
skipped callback, so it never executes. The focused run proves the test is live at
the present head, not that its input is lifecycle-bound.

**Required correction.** Make the three paths mandatory for this live contract:
run an ordinary `it`, read them unconditionally, and let a missing file fail loudly
with its path. Add a fail-against-old control proving removal/rename of the plan
makes the focused spec red. Do not alter `checkPlan`'s optional `history`/`dsl` API
if other callers legitimately need it; this finding is about the live gate.

**What must not change.** No Electron test, snapshot, expected-failure entry or
production code is needed.

**Class swept.** Command `rg -n 'skipIf|existsSync'
tests/unit/planConsistency.spec.ts` enumerated the one skip condition and the two
empty-input substitutions. The `SPEC` condition is the only one that bypasses the
whole callback; the other two should still become direct reads so the gate binds
the inputs it claims to inspect.

### F2 — SEV 1 — C3 omits real assertion sites and can certify a second home as clean

**Broken decision/claim.** C3 says a running total “must have exactly ONE home” and
is keyed on site count (`tests/support/planConsistency.ts:199-217`). The plan names
its marked YAML block as that home (`SPACING_HELPER_PRESET_PLAN.md:518-531`).

**Violated fact.** C3 never parses that canonical block as a site. It first blanks
quoted and backtick-delimited spans (`planConsistency.ts:137-162`), then recognises
only five prose frames (`:225-233`), skips any token `numberFrom` cannot parse
(`:246-249`), and reports only after at least two surviving frame matches (`:254-260`).

**Concrete failure scenarios, measured against current code.** The real plan,
history and DSL plus one new sentence `Seven review rounds complete` returned no C3
finding: the new prose was counted as site one while the actual canonical home was
not counted. An unquoted five-round total plus either `The owner records "six review
rounds complete"` or ``Current status: `six review rounds complete` `` also returned
clean, because syntax alone exempts the conflicting assertion. With an existing
five-round site, the tested forms `eleventh`, `twenty-first`, `11th` and
`one hundred` were each skipped. The tested forms `twenty four` and `1,413` were
counted but reported as 4 and 413 respectively.

**Why mitigation does not cover it.** The committed quote controls prove a
correction inside balanced delimiters and the same phrase outside them
(`planConsistency.spec.ts:189-215`); they do not collide quote syntax with current-
assertion semantics. The negative corpus (`:217-234`) does not contain any of the
tested number forms. The source itself acknowledges that an unmatched quote can
over-exempt toward silence (`planConsistency.ts:157-159`). The clean live assertion
cannot detect the canonical-plus-one case because that is the code under test.

**Required correction.** Do not grow another supposedly semantic regex. Parse and
validate the marked `plan-running-totals` block structurally: require one block,
require the governed keys once, and treat any supported prose frame as an additional
site relative to that known home rather than waiting for two prose matches. Then
narrow the public claim to the finite grammar actually enforced, or make heuristic
prose matches advisory. Add permanent controls for canonical-plus-one, asserting
quotes/code spans, and each tested number-form class; prove those controls fail on
this implementation before crediting the repair.

**What must not change.** Keep one canonical totals block and preserve line numbers
in diagnostics. Do not claim that a text classifier can decide whether arbitrary
prose is a running-total assertion.

**Class swept.** I followed every C3 exclusion stage—span blanking, frame selection
and numeric parsing—and tested at least one hostile input for each stage. The number
examples above are the tested population, not a claim to enumerate every English
number form.

### F3 — SEV 1 — C4 silently disables itself when a required markdown anchor disappears

**Broken decision/claim.** C4 is the mechanical guard that leg 1 cannot be scheduled
before its helper. The live plan says its nested-list form is load-bearing and
records that flattening once made C4 silently dead
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:507-512`).

**Violated fact.** The implementation enters C4 only when its exact bold heading
matches (`tests/support/planConsistency.ts:264-266`). It then reports only when both
the first helper-labelled step and first leg-1-labelled step exist and compare in
the bad order (`:267-280`). Missing section, zero parsed rows, missing helper or
missing leg therefore means a clean return.

**Concrete failure scenarios.** Three fixtures returned no C4 finding: an exact
`Then implementation` section containing leg 1 but no helper step; an invalid
leg-before-helper sequence under the equally readable heading `Implementation
order`; and the same invalid order represented as a flat list. Those inputs mean
“cannot establish the prerequisite” or “leg is too early”; current output is clean.

**Why mitigation does not cover it.** The committed hostile fixture supplies every
expected anchor and varies only order (`planConsistency.spec.ts:237-247`). Its green
counterparts do the same (`:250-265`). C1's parser-liveness throw protects method
declarations only. The live assertion expects an empty array, so disappearance of
C4's structure is indistinguishable from a valid sequence.

**Required correction.** Fail closed when the section, parsed step population,
helper anchor or leg-1 anchor is absent or duplicated; the diagnostic should name
the missing/ambiguous anchor. Add missing-section, flat-list, missing-helper,
missing-leg and duplicate-anchor controls, alongside the current ordering control.
Prove the new controls fail on this implementation.

**What must not change.** Preserve the valid nested-list form and the `NOT leg 1`
negative case. Do not broaden the pattern without adding mixed-form controls.

**Class swept.** Source inspection enumerated the four nullable prerequisites:
section match, parsed step rows, helper marker and leg marker. The probe measured
section, row and helper loss; the leg-loss branch is the symmetric
`legAt !== undefined` condition visible at `:271-274`. Duplicate anchors are a
required repair control, not a behavior I measured in this round.

### F4 — SEV 2 — C3 blocks legitimate historical prose by collapsing distinct subjects

**Evidence and problem.** C3 assigns every match of `Across N review rounds` the
single subject `review-round` (`planConsistency.ts:225-249`) and reports when that
bucket has more than one site. Input:

```text
Across two review rounds, option A was rejected.
Across three review rounds, option B was refined.
```

Output: `C3-COUNTDRIFT`, claiming one running total at two sites. These are two
historical facts about different sub-arcs, the negative population the checker's own
comment says it should leave alone (`:219-224`). The committed negative fixture
contains historical sentences, but not this collision with the broad `Across`
frame (`planConsistency.spec.ts:217-234`).

**Class swept.** I tested one realistic false-positive collision for the broadest
review-round frame and read the other four frame definitions. False positives for
every possible prose context are not mechanically enumerable; this is a semantic
boundary, not a completed universal sweep.

#### Owner Decision Brief — the undeclared merge-blocker consequence

**What this protects in product terms.** It protects the implementation plan from
repeating stale review totals or scheduling a harness leg before its helper.

**What is going wrong, plainly.** Once merged, an ordinary wording change to either
plan document can fail `./tools/checks` even when it states two true historical
facts. Conversely, F1–F3 show changes that remove the check or introduce real drift
while staying green. The checker therefore has both nuisance-red and silent-green
paths.

**Is the product affected?** **No, measured for this diff.** The PR adds the two
test-side files enumerated by `git diff`; it changes no runtime code. **The merge
workflow is affected: Yes.** `./tools/checks` runs the live assertion, so a C3 false
positive blocks ordinary work until a developer reverse-engineers the accepted
phrasing or edits the gate.

**Options with costs.** (A) Merge as-is: no repair cost now, but known false accepts
and false blockers become branch policy. (B) Repair F1–F3 and narrow C3 to an
explicit, decidable syntax contract: modest unit-only work and one required scoped
follow-up, while retaining deterministic protection. (C) Remove C3 from blocking
status and keep it as an advisory diagnostic until its contract is redesigned:
lowest immediate false-blocker risk, but less automated protection against prose
restatements.

**Recommendation and why.** Choose B. A marked canonical block is already present,
so enforcing its existence and uniqueness is cheap and decidable. C3's semantic
prose ambition should be narrowed, not hidden behind a longer frame list. If that
repair cannot produce a clear finite contract in one working session, choose C for
C3 rather than delay unrelated work.

**What happens if nothing is done.** Contributors can receive a blocking C3 message
for valid history, while deletion, formatting changes or unrecognised number forms
can silently remove the intended protection. The likely operational response to a
noisy gate is to rewrite prose around it or disable it, neither of which protects
the plan.

### F5 — SEV 3 — C2 treats bold markdown as disposition semantics

C2 recognises only `| **SP-N** |` (`planConsistency.ts:188-196`). A fixture with
`SP-99 was raised` and the valid-looking row `| SP-99 | 1 | RESOLVED | fixed |`
returned `C2-NODISPOSITION`. No comment or test declares boldface to be part of the
disposition contract. Either accept optional emphasis around the ID, or validate a
documented table grammar and report “malformed disposition row” rather than “no
row.”

**Class swept.** The disposed-set regex has one accepted row shape; I compared its
bold fixture with the same row unbolded. Other malformed table shapes were not
tested and are not claimed clean.

### F6 — SEV 3 — C1 measures textual incoming calls, not reachability from the DSL

C1 subtracts every name appearing in `this.<name>(` anywhere in plan code or the
live DSL from the defined set (`planConsistency.ts:168-185`). Two private methods
which only call one another returned no C1 finding even though the DSL reaches
neither. That is compatible with the literal phrase “nothing calls it” but not with
the stronger `C1-ORPHAN`/“whole chain is wired” framing in the spec. Either narrow
the claim to zero textual callers or define and test the reachable-root contract;
do not imply graph reachability from this incoming-edge check.

**Class swept.** I tested the disconnected-cycle case. Dynamic calls, callbacks and
other TypeScript call shapes were not traced, so a full reachability population is
**UNVERIFIED**.

## Directions

1. Fix F1 first so the gate cannot disappear with its target.
2. Recast C3 around its canonical marked block and a finite, honestly named prose
   grammar. Add the F2 and F4 fixtures before changing implementation, and show
   fail-against-`d3fb800` / pass-against-repair evidence.
3. Make every C4 structural prerequisite fail closed and retain the current order
   and `NOT leg 1` controls.
4. Keep F5 and F6 within their stated scope; they are recorded limits and do not
   justify a general Markdown or TypeScript parser.
5. Run the focused spec and `./tools/checks` at the repair commit, recording the
   commit and real exit codes. Under OA §3.4, the repair then receives a scoped
   follow-up over the repair diff plus the declared radius.

## Disagreements

- I agree with the commission that this is class (d), capability-class. OA §3's
  class-(d) wording covers slice implementations, and a mandatory governance gate
  is shared machinery. This round is not ceremony: it measured three core
  fail-open paths.
- I agree that §3.5 item 2 is N/A; there is no flaky checker mechanism to repeat.
- I agree that the live assertion now runs, but disagree with treating its clean
  result as evidence that the checker passes “for the right reason” without the
  matched hostile controls. It is live overall; C3 and C4 still have silent paths.
- I disagree with `blankSpans`' premise that a quoted or code-spanned figure is
  necessarily corrected or illustrated (`planConsistency.ts:141-142`). Delimiter
  syntax cannot decide the speech act; the measured quoted-current-status case is
  a counterexample.
- I confirm the 1,413/104 → 1,437/105 population arithmetic, but the base attempt
  was red. This review therefore does not confirm a clean 1,413-test baseline.

## MemPalace drawer candidates

None. F1–F6 apply existing practice rules about lifecycle-bound inputs,
fail-closed checks, behavioral sweeps and honest limits of text classifiers; this
review did not identify a new project-independent rule that clears the filing bar.
