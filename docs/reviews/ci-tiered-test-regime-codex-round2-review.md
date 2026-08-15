Author: Claude Opus 5 (PR #143 implementation author)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author this branch
Owner gate: micah/BaggyG-AU reads PR #143 and this review together; only the owner decides sign-off and merge

# Independent review — PR #143 tiered test regime, round 2 (narrow)

## Verdict

**CHANGES-REQUIRED.**

The current real behavioural and visual reports both pass the revised checker,
and several important rejecting-side controls hold: the mandatory floor rejects
the 4-executed report when supplied once, a skip moved to the wrong tier is loud
in both tiers, and a baselined failure presented as a skip remains loud in
subset mode. The accepting side is still not safe enough to define green,
however. The checker accepts complete replacement of all three `other`
failures, changed causes and ten-attempt envelopes for both observed flakes, a
4-executed full report labelled `--subset`, the same report with a repeated
lower floor, replacement of all 535 passing identities, an unvalidated empty
manifest, invalid/duplicate manifest rows, and cross-project duplicated work.

I found seven merge-blocking mechanism defects and one non-blocking correction
inside the commissioned two-file scope. The owner arbitrates all of them; this
review does not approve, merge, rebaseline, or change the implementation.

## Scope and independent starting account

I reviewed branch `feature/ci-tiered-test-regime` at current local, remote, and
PR #143 head `019d9d5bd0067671711e494a7bce4d51f129b97b`, against `main` at
`143f8c9`. `gh pr view 143` independently reported the same head. The tree was
clean before review.

Per the narrow commission, the reviewed implementation surface was exactly:

- `tools/check-suite-signatures.cjs`
- `tests/baseline/expected-failures.json`

I first reread the committed round-1 review, then read both in-scope files end
to end and the changes from `2efaa62` to current head. I replayed the JSON
artifacts previously downloaded from Actions run `31802864528` through the
current checker. Mutations were streamed to `/dev/stdin` or process
substitution and asserted their target count before emitting JSON; no fixture
or source file was created.

I did not re-review workflows, triggers, sharding, notification, tier design,
testing-standard prose, or the PR body. I did not change `src/`, tests, UAT,
`[STATE]`, GitHub state, either Home Assistant instance, or the manifest/checker.
I did not merge.

## Findings

### M1 — MERGE-BLOCKING: `other` is a wildcard for all three newly baselined failures

`classifyError` returns `other` whenever none of its known substrings match
(`tools/check-suite-signatures.cjs:142-168`). The equality check then treats
that fallback as a positive reason signature (`:304-307`). The three new
behavioural entries all baseline that fallback
(`tests/baseline/expected-failures.json:138-173`). “No classifier matched” is
not a stable failure cause.

I replaced every attempt message for all three identities with unrelated
strings of the form `Error: alien replacement cause N attempt M`. The mutator
asserted `MUTATED_OTHER_IDENTITIES=3`; the current checker still exited 0 with
the exact 4-of-4 behavioural failure set. The original bubble `toMatch`
assertion and both badge focus assertions had disappeared completely. Thus the
`reasonChanged` guard cannot distinguish any new unrecognised cause from the
owner-authorised observation.

**Required correction.** Do not permit bare fallback classes as an expected
failure signature. Give each of these three rows a stable, row-specific
discriminator—such as a validated matcher/custom diagnostic signature—and
require it in addition to identity. A deliberately named classifier class is
also acceptable if it is narrow enough to distinguish the observed assertion
from an unrelated error. Add one mutation per row that replaces the observed
message with a different unclassified error and proves the fixed checker fails
where the current checker passes.

**Class swept.** A parsed-manifest enumeration found exactly three `other`
rows, all behavioural and all added in the rebaseline. I mutated all three in
one run, not one example. The other seven expected failures use five
`snapshot-mismatch`, one `locator-not-visible`, and one `count-mismatch`; their
separate substring-class weakness is M6.

### M2 — MERGE-BLOCKING: allowlisted flakes discard both the failed cause and the attempt envelope

The report walker reads only the final attempt and only calls `classifyError`
for `unexpected`, so every `flaky` outcome receives `reasonClass: null`
(`tools/check-suite-signatures.cjs:185-203`). Flake adjudication then compares
identity only (`:324-329,411-418`). The ten manifest rows carry no reason or
attempt constraints (`tests/baseline/expected-failures.json:366-458`).

I found both actual flaky outcomes in the real behavioural report, replaced
each first failed attempt with `browserType.launch: Process failed to launch`,
and appended passing attempts until each outcome reported ten attempts. The
mutator asserted `MUTATED_FLAKES=2 ATTEMPTS_EACH=10`. The checker printed both
as allowlisted and exited 0. The current report's real failed causes were a
gauge `toMatch` mismatch and a badge `toBeVisible` failure, so this was a cause
change for both observed flakes rather than a theoretical alternative.

**Required correction.** For a flaky outcome, inspect every non-passing
attempt, classify that attempt's own error, and compare a validated set or
sequence of allowed reason classes plus a bounded attempt envelope. The final
passing attempt must not be used as the source of the failed reason. For legacy
ledger rows whose cause is not evidenced, record that limitation explicitly
without allowing an impossible attempt count; the two observed rows have real
failed-attempt messages available for baselining. Add separate cause-change and
attempt-envelope mutations, each demonstrated to pass current and fail fixed.

**Class swept.** I read all flaky handling in the walker and status checks and
enumerated all ten manifest rows. The defect is uniform: none has a reason or
attempt field and no `flaky` result is classified. The live accepting probe
covered both flakes actually present in run `31802864528`; the other eight did
not occur in that artifact and their current runtime reasons are unverified.

### M3 — MERGE-BLOCKING: floor/mode arguments are neither unique nor lifecycle-bound

`parseArgs` overwrites `--report`, `--tier`, `--manifest`, and `--min-tests`
when an option repeats, and repeated `--subset` remains a bare boolean
(`tools/check-suite-signatures.cjs:47-65`). A full run is exempted from the
floor solely because its caller supplies `--subset` (`:98-121`); the checker
has no selected-population input or provenance that distinguishes a genuine
partial run from a truncated full one.

I reduced the real behavioural report to its four expected failures and twenty
expected skips. The mutator asserted `TRUNCATED_OUTCOMES=24 EXECUTED=4`.

| Invocation                      | Current checker         |
| ------------------------------- | ----------------------- |
| `--min-tests 541`               | exit 1, “too few tests” |
| `--subset`                      | **exit 0**              |
| `--min-tests 541 --min-tests 1` | **exit 0**              |

The first row proves the floor is live and the mutation reached it. The latter
two delete that protection through ordinary accepted arguments. This is the
same fail-open class the author fixed for absent/bad floor values, moved to
argument multiplicity and an unauthenticated exemption.

**Required correction.** Reject every repeated singleton option, including
`--subset`. A subset invocation must carry a mandatory, unique, non-empty
selection artifact and the checker must compare the report's exact identity
multiset to that selected population; a naked mode bit cannot be sufficient to
remove the full-run floor. Apply the same validation path to the default and
`--manifest` paths. The caller wiring needed to supply a real selection may be
separate work, but the accepting hole is in this checker API.

**Class swept.** I read the complete parser. All four value-taking options use
the same last-write-wins pattern and the boolean option has no duplicate check.
The material floor bypass was reproduced through both available routes:
repeated `--min-tests` and `--subset`. Missing, empty, non-numeric, zero,
negative, and fractional floor values are now rejected as the author claimed;
no regression was found in those fixed cases.

### M4 — MERGE-BLOCKING: the floor counts executions but does not bind which tests executed

The only full-run population invariant is a lower bound over non-skipped
outcomes (`tools/check-suite-signatures.cjs:274-280,420-441`). Passing
identities are never compared with an expected population. Duplicate identity
adds `projectName`, while all debt maps deliberately omit it (`:241-246`), so a
different project label makes the same work a distinct duplicate key. This is
still a count guard, not the identity/disposition correction round-1 M1 asked
for.

I changed the `file` identity of every all-passing spec in the real behavioural
report to a fabricated path. The mutator asserted
`REPLACED_PASSING_IDENTITIES=535 SPECS=535`; all four failures, twenty skips,
and two flakes remained untouched. The report still had 541 executed outcomes
and the current checker exited 0. Therefore every passing test can be replaced
while the gate continues to certify the expected suite.

I also cloned one passing outcome under a different `projectName`. The report
grew to 542 executed and exited 0. The discriminator control kept the same
project name; it exited 1 under the duplicate guard. Thus the guard is live but
its project-qualified identity permits the cross-project duplication named in
the commission.

**Required correction.** Maintain and validate the exact expected test
identity multiset per tier, including project and allowed disposition, then
compare the report to it rather than to a minimum. A canonical sorted digest is
sufficient only if its underlying identities remain reviewable and enumerable.
The same population model must drive subset intersection. Add tests for
passing-identity replacement, one-for-one substitution, cross-project cloning,
and legitimate addition/removal.

**Class swept.** The identity replacement covered all 535 `expected` outcomes
in the real behavioural report. I separately covered a cross-project clone and
its same-project control. A legitimate same-project `--repeat-each` report
would trip the current duplicate guard; for the canonical single-execution
gate that rejection is appropriate, not a new finding. If repeat reports ever
become a supported gate input, repetition must be represented explicitly in
the expected multiset instead of silently accepted.

### M5 — MERGE-BLOCKING: the authoritative manifest is optional by field, permits duplicate obligations, and filters before validation

After JSON parsing, the checker immediately treats every absent list as empty,
filters entries by an unchecked `tier`, and builds collapsing maps
(`tools/check-suite-signatures.cjs:250-289,313-329`). There is no validation of
required arrays, row shape, tier enum, trimmed identity components, reason
enum, or uniqueness. Under `--tier all`, the predicate includes every row
without examining its tier (`:282`), including malformed ones.

Three accepting probes demonstrate distinct schema/lifecycle failures:

1. A fabricated report containing 541 unique `expected` outcomes plus a
   manifest of `{}` exited 0. All three required arrays were absent and were
   silently interpreted as empty.
2. Duplicating one `expectedSkips` row and one `expectedFlaky` row left the real
   behavioural report green. The checker even printed nine behavioural flake
   allowlist rows because the duplicate was counted in prose while its map key
   collapsed. A duplicate `expectedFailures` row happens to fail through the
   independent failure-count comparison; the other two lists do not.
3. Removing `tier` from one behavioural expected-skip row while relabelling
   that actual skipped test as a pass exited 0: 542 executed / 19 skipped. With
   the valid row retained, the recovered skip is loud. A malformed tier makes
   the obligation inert before `unSkipped` is calculated. Conversely, the
   same malformed row was accepted as active by a combined real report under
   `--tier all` (559 executed / 21 skipped), which also exited 0.

**Required correction.** Validate the manifest completely before tier
filtering: require all three arrays; require object rows; restrict `tier` to
`behavioural|visual`; require non-empty, already-trimmed `file` and non-empty
arrays of already-trimmed title components; validate allowed reason/signature
fields; and reject duplicate identity rows in every list (and incompatible
cross-list dispositions). Validation must run identically for the default path
and `--manifest`. Add absence, zero-row, malformed-tier, whitespace, wrong-type,
duplicate, and cross-list controls with one mutation per guard.

**Class swept.** I read every manifest row and every field consumer. There are
10/21/10 failure/skip/flake rows. Active file/title whitespace or a US-spelled
`behavioral` tier is loud while the corresponding failure, skip, or flake is
still present: it becomes new, and failures/skips also become vanished or
unskipped. A missing/misspelled tier is silently inert in a specific-tier run;
for `expectedFailures` and `expectedFlaky` a later recurrence becomes loud, but
for `expectedSkips` the skip can begin passing while the malformed row is
filtered out, as the live accepting probe proves. Under `all`, every malformed
tier is included. Non-array `titlePath` fails closed by throwing, but that is an
uncaught type error rather than schema validation.

### M6 — MERGE-BLOCKING: the reordered classifier still accepts stale or unrelated matcher tokens

Launch and the specific Playwright test-timeout phrase now precede matcher
tokens, which closes round-1 M3 for those two roots. The remaining matcher
classification is still ordered substring selection, however, and generic
`/snapshot/i` is sufficient for `snapshot-mismatch`
(`tools/check-suite-signatures.cjs:142-168`). It does not reject a message that
matches multiple semantic classes or distinguish an actual cause from a stale
diagnostic token.

Live mutations against expected failures produced:

| Mixed/replacement message                               | Expected row        | Result                           |
| ------------------------------------------------------- | ------------------- | -------------------------------- |
| launch failure + snapshot token                         | snapshot mismatch   | exit 1 as `launch-failure`       |
| `Test timeout of 5000ms exceeded` + snapshot            | snapshot mismatch   | exit 1 as `timeout`              |
| bare matcher `Timeout: 5000ms` + `toHaveScreenshot`     | snapshot mismatch   | exit 0, correct negative control |
| actual `toBeVisible` text + stale word `snapshot`       | snapshot mismatch   | **exit 0**                       |
| actual `toHaveCount` text + stale `toBeVisible`         | locator not visible | **exit 0**                       |
| unrelated persistence error containing `snapshot cache` | snapshot mismatch   | **exit 0**                       |

The first two show that launch-first and the narrowed test-timeout precedence
are correct for current snapshot baselines. The last three show that the
general collision problem remains on the accepting side.

The six named non-fallback categories produce fifteen unordered collision
pairs. The four implied by the author's timeout-focused controls are timeout
with snapshot-missing, snapshot-mismatch, locator-visible, and count. The
eleven not covered by those four are: launch×timeout; launch×snapshot-missing;
launch×snapshot-mismatch; launch×visible; launch×count;
snapshot-missing×snapshot-mismatch; snapshot-missing×visible;
snapshot-missing×count; snapshot-mismatch×visible;
snapshot-mismatch×count; and visible×count. Because the 33-leg scratch battery
is unavailable, its exact four pair names are author testimony; the source and
my live probes establish the listed current behaviour.

**Required correction.** Narrow generic matcher signatures and classify all
matching candidates before deciding. Root-cause wrappers such as launch and
the exact test-timeout phrase may have explicit precedence, but multiple
matcher-family matches should be rejected as ambiguous unless a dedicated
negative control proves the combination is an ordinary form of the expected
cause. Add one restrictive mutation per collision direction that could retain
the expected earlier token, not merely one permissive example per regex.

**Class swept.** The manifest has seven non-`other` failures: five snapshot,
one visible, and one count. All are selected by substring arms. I exercised
the two root-cause overrides, the bare-timeout negative, snapshot-to-visible,
visible-to-count, and the broad snapshot token. M1 separately covers all three
fallback rows. There are currently no expected launch, timeout, or
snapshot-missing rows, so the reverse-direction acceptance for those classes
is future exposure rather than a current baseline bypass.

### M7 — MERGE-BLOCKING: no tracked regression suite exercises the sole green/red authority

The checker now contains parser, classifier, population, skip, flake,
duplicate, floor, and subset guards (`tools/check-suite-signatures.cjs:47-478`),
but no tracked `*.spec.*` or `*.test.*` file references either the checker or
its manifest. The exact search was:

```bash
git grep -n -E 'check-suite-signatures|expected-failures\.json' \
  -- 'tests/**/*.spec.*' 'tests/**/*.test.*'
# no output
```

`./tools/checks` therefore exited 0 while M1-M6 were all reproducibly present.
The author's 33/33 battery is untracked and unavailable, and the commission
records that its earlier forms lied twice through a subshell counter and a
no-op mutation. Those are exactly the failure modes a committed, reviewed
fixture suite must prevent.

**Required correction.** Commit a deterministic checker regression suite and
run it from the repository gate. It must invoke the real CLI, assert every
mutation changed the intended population, cover accepting and rejecting
controls for M1-M6, and give each named guard its own mutation. Each corrective
test must be demonstrated to fail against the pre-fix checker and pass against
the fixed checker; an aggregate “N/N” counter is not sufficient evidence.

**Class swept.** I searched every tracked test/spec file by the checker's name
and manifest path and found no invocation. Workflow uses and prose references
exist, but neither is a regression test. The independent probes in this review
exercised every commissioned §3 mechanism; they are evidence for this review,
not a durable replacement for a tracked suite.

### N1 — NON-BLOCKING: in-scope comments still describe the pre-rebaseline counts and diagnosis state

The checker header says there are exactly seven understood failures
(`tools/check-suite-signatures.cjs:5-8`) and its flake comment says eight rows
(`:324-327`). The manifest header likewise says “THE SEVEN”
(`tests/baseline/expected-failures.json:3-5`), the calendar note calls itself
the only behavioural failure (`:69`), and the advanced-slider note calls the
count seven (`:127`). Parsed current state is 10 failures, 21 skips, 10 flaky;
four failures are behavioural, and the five new observations are explicitly
undiagnosed.

**Required correction.** Update these in-scope comments to distinguish the
original seven/eight historical ledgers from the current 10/21/10 state and
remove the claim that all tolerated failures are understood.

**Class swept.** I searched both in-scope files for current-size words and read
each match in context. Historical measurements such as “flagged seven times”
and “the first eight” remain accurate when explicitly qualified; the lines
listed above read as current assertions and do not.

## Required §3 result matrix

### 1. The rebaseline itself — is the gate weaker than it looks?

**Finding M1.** Yes. Every one of the three new `reasonClass: "other"` rows
accepted a completely unrelated replacement error. The exact three-row sweep
exited 0 after asserting all three identities were mutated. The cost of an
unclassified failure does not justify treating “unclassified” as a positive
reason signature; a row-specific second discriminator preserves the owner's
authorised identity without wildcarding its cause.

### 2. The flake allowlist ignores reason entirely

**Finding M2.** This is merge-blocking, not merely a documented limitation.
Both flakes present in the real report accepted changed launch-failure causes
and ten attempts. A sound classifier reads the earlier failed attempts, not the
last passing result, and compares their cause/envelope to the row.

### 3. The executed floor, round 2

**Findings M3-M5.** The single valid `--min-tests 541` control rejects four
executions, but repeated floors and a naked `--subset` both make that same
report green. `--manifest` can select an unvalidated `{}` input, and a 541-test
all-expected fabricated report then exits 0. `--tier all` does not itself
remove a supplied floor, but it admits invalid-tier rows because filtering
short-circuits before tier validation. Even with the default current manifest,
all 535 passing identities can be replaced and the floor stays green.

### 4. Skip identities

**Finding M5 for malformed-tier lifecycle; otherwise no issue found.** Moving
one live behavioural skip baseline to visual made the behavioural report fail
as an unbaselined skip and the visual report fail as an expected skip that did
not occur. Active file/title/tier spelling mistakes likewise fail closed while
the skip remains. A missing or misspelled tier becomes inert in a specific-tier
run, however; if that skip also starts passing, the checker silently loses the
retirement obligation. I reproduced that exact accepting pair. Under `all`,
the malformed tier is incorrectly active.

### 5. `--subset` semantics

**Finding M3 for the unauthenticated exemption; no additional present-key
issue found.** `presentKeys` including skipped outcomes is correct for the
question “was this selected?” A baselined calendar failure changed to
`skipped` in subset mode exited 1 through all three applicable controls: the
failure count fell from four to three, the skip was new, and the expected
failure was reported vanished. It cannot hide merely by being present as a
skip. The separate defect is that any full/truncated report can claim subset
status without an enumerated selection.

### 6. Duplicate detection

**Finding M4.** A same-project clone is rejected; a clone of the same passing
work under a changed `projectName` exits 0 and increases the executed count.
The current gate would reject a legitimate same-project `--repeat-each`
artifact as duplicate. That is correct for the present single-execution gate
contract; supporting repeated gate inputs would require an explicit expected
multiset, not disabling duplication checks.

### 7. The reordered `classifyError`

**Finding M6.** Launch-first is correct for the tested launch+snapshot case:
the current snapshot baseline changed to `launch-failure` and exited 1. The
specific test-timeout phrase also dominates snapshot while a bare matcher
budget does not. Eleven of the fifteen category pairs remain outside the four
timeout×matcher combinations, and stale/broad matcher tokens still produce
current false accepts. The exact unavailable scratch-battery membership is
unverifiable.

### 8. Manifest schema

**Finding M5.** Missing arrays, duplicate skip/flake rows, missing tiers, and
invalid tiers can all reach exit 0. Active file/title whitespace and US
`behavioral` spelling are loud while the affected outcome occurs; malformed
`titlePath` types throw and exit 1. The important skip asymmetry is measured:
an invalid-tier expected-skip row plus the test beginning to pass is silent,
because filtering erases the obligation before `unSkipped` is calculated.

## Independent reruns and commands

The binding reviewer rerun requirements in
`docs/governance/OPERATING_AGREEMENT.md:252-291` were applied as follows.

1. **Load-bearing spec.** Not applicable: this narrow checker/JSON slice has no
   focused committed spec; that absence is M7. I instead ran the actual CLI
   against both real reports and against asserted in-memory mutations:

   ```bash
   node tools/check-suite-signatures.cjs \
     --report /tmp/havdm-ci-review-FvuNNw/merged-results.json \
     --tier behavioural --min-tests 541
   # exit 0: 561 outcomes; 541 executed / 20 skipped; 4 expected failures; 2 flakes

   node tools/check-suite-signatures.cjs \
     --report /tmp/havdm-ci-review-FvuNNw/visual/visual-results.json \
     --tier visual --min-tests 18
   # exit 0: 19 outcomes; 18 executed / 1 skipped; 6 expected failures
   ```

   Adversarial commands used the following exact execution shape, with each
   inline Node mutator aborting unless its stated target count was reached:

   ```bash
   set -o pipefail
   node - <real-report.json> <tests/baseline/expected-failures.json> \
     <<'NODE' | node tools/check-suite-signatures.cjs \
       --report /dev/stdin --tier <tier> <floor-or-subset-arguments>
   // parse, mutate, assert exact mutation count, emit JSON
   NODE
   ```

   The measured accepting/rejecting matrix was:

   | Asserted mutation                                      |      Exit |
   | ------------------------------------------------------ | --------: |
   | all 3 `other` identities receive unrelated causes      |     **0** |
   | both live flakes receive launch causes and 10 attempts |     **0** |
   | 4-executed report, one `--min-tests 541`               |         1 |
   | same report, `--subset`                                |     **0** |
   | same report, `--min-tests 541 --min-tests 1`           |     **0** |
   | replace all 535 passing identities                     |     **0** |
   | clone one pass under another project / same project    | **0 / 1** |
   | 541 fabricated passes with `{}` manifest               |     **0** |
   | duplicate one skip and one flake manifest row          |     **0** |
   | remove one skip tier and make that test pass           |     **0** |
   | move live skip to other tier, check both tiers         |     1 / 1 |
   | present expected failure as subset skip                |         1 |
   | stale snapshot+visible / stale visible+count           | **0 / 0** |
   | launch+snapshot / test-timeout+snapshot                |     1 / 1 |
   | bare matcher timeout+snapshot                          |         0 |

2. **Deeper repeat on the flakiest mechanism.** Not applicable. The in-scope
   checker is deterministic over a JSON input, and the two observed runtime
   flakes belong to application/spec behaviour outside this narrow source
   review. Repeating the same deterministic mutation would duplicate rather
   than escalate evidence; a fresh deeper application repeat would answer a
   different, explicitly out-of-scope question.

3. **Repository gate.** Exact command `./tools/checks`; **REAL_EXIT=0**. All
   four stages ran: lint 0 errors / 145 warnings, formatting clean, typecheck
   clean, unit 1,413 passed in 104 files.

## Evidence boundary

- I did not rerun the 561 behavioural or 19 visual Playwright outcomes. I
  replayed the downloaded reports from run `31802864528` through the checker at
  current head; this verifies checker decisions over those artifacts, not a
  fresh runner execution at `019d9d5`.
- The author's 33/33 scratch battery was not committed or otherwise available,
  so I could not inspect, rerun, or identify its exact four collision-pair
  cases. I treated that number as testimony, not evidence.
- The accepting probes are generated report/manifest mutations. They prove
  which malformed inputs the checker accepts; they do not claim those reports
  arose naturally from Playwright.
- I did not review the out-of-scope workflow callers, tier design,
  documentation, notification, branch protection, labels, or merge state
  beyond resolving PR #143's current head. No out-of-scope merge blocker was
  developed in this round.
- `ha.home.local` and all UAT surfaces were untouched. No production, test,
  checker, manifest, state, or external-system write was made.
- The MemPalace drawer transport remained closed when fetched by the mandated
  index ID. No MemPalace write was attempted; the prompt supplied the governing
  practice rules verbatim.

## MemPalace drawer candidates

No MemPalace write was made. Per MP-LEASE, the write-enabled author may file
these with `added_by="codex"` after owner adjudication:

1. **Practice/verification:** A classifier fallback such as `other` describes
   the absence of a match, not a stable cause. Never baseline it without a
   second row-specific discriminator; replace every fallback message in the
   regression control, not only one sample.
2. **Practice/verification:** A retry result's final pass cannot identify the
   earlier failed cause. A flake allowlist must inspect non-passing attempts and
   bind both their reason set/sequence and a plausible attempt envelope.
3. **Practice/verification:** Privileged CLI options that weaken a check must
   be singleton and lifecycle-bound. A repeated lower threshold or naked
   `--subset` bit is another absent-input fail-open in disguise.
4. **Practice/verification:** A minimum execution count does not bind the test
   population. Exact identity/project/disposition multisets are needed to
   detect wholesale passing-test substitution and cross-project duplication.
5. **Practice/verification:** Validate an authoritative manifest before
   filtering or mapping it. Required arrays, enum discriminators, trimmed
   atomic identities, and uniqueness need independent mutation controls;
   filtering an invalid discriminator can erase an obligation.
6. **Practice/verification:** Root-cause precedence closes only one direction
   of an ordered-substring collision. Enumerate all category pairs and reject
   ambiguous matcher-family messages unless a restrictive negative control
   proves the coexistence is expected.
7. **Practice/testing:** A critical gate's scratch battery is not regression
   protection. Commit the real CLI fixture suite, assert every mutation is
   live, and prove one fail-against-old case per named guard.
