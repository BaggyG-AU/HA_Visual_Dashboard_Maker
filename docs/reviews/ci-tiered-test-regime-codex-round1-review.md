Author: Claude Opus 5 (PR #143 implementation author)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author this branch
Owner gate: micah/BaggyG-AU reads PR #143 and this review together; only the owner decides sign-off and merge

# Independent review — PR #143 tiered test regime, round 1

## Verdict

**CHANGES-REQUIRED.**

The sharded workflow runs, the visual partition is complete, the current gate
rejects zero suites, missing reports, subtly wrong manifest identities, and
doubled reports, and the corrected Chromium dependency is supported by the
failed run that exposed it. The accepting side is not yet safe enough to be the
definition of green, however. It can approve a report in which 560 of 561
behavioural tests are skipped, a newly flaky regression, or a timeout whose
message names an expected matcher. The advertised pre-merge safety net also
does not rerun on later PR pushes and is not a required current-head check.

I found seven merge-blocking mechanism/claim defects and one non-blocking count
correction. The owner arbitrates all of them; this review does not approve,
merge, rebaseline, or change the implementation.

## Scope and independent starting account

I reviewed branch `feature/ci-tiered-test-regime` at current head
`8fe1434b8697ef10a432700f1eec1c748ae5ae2c`, against `main` at `143f8c9`.
The first content commit is `bb747cc`. The tree was clean before review.

I read both workflows end to end, the signature checker, manifest, Playwright
configuration, the whole testing standard, the PR body, both named Actions
runs, the governing Operating Agreement, and the relevant current MemPalace
decision/state drawers. I downloaded the JSON artifacts from run `31802864528`
and replayed them through the checker at current head. In-memory mutations were
streamed to `/dev/stdin`; I did not add fixture files.

I did not change `src/`, test code, UAT material, `[STATE]`, the PR body, GitHub
labels/issues, or either Home Assistant instance. I did not merge.

## Findings

### M1 — MERGE-BLOCKING: the gate counts skipped tests as completed coverage

`collectOutcomes` puts every test in the same outcome population regardless of
status (`tools/check-suite-signatures.cjs:110-168`). The gate then considers
only `unexpected` and `flaky` outcomes (`:204-210`), while the size guard counts
all outcomes (`:281-293`). A skipped test therefore satisfies `--min-tests`
exactly like an executed pass.

I mutated the real behavioural report in memory so every outcome except the
canonical calendar failure was `skipped`. The report still contained 561
identities: 1 unexpected and **560 skipped**. The current gate exited 0. I did
the tier counterpart against the real visual report: the six canonical
failures remained and the other **13 of 19** outcomes were skipped; it also
exited 0.

The configured floors add a second accepting gap. The live populations are 561
behavioural and 19 visual, but the workflow floors are 550 and 18
(`.github/workflows/test.yml:41-48`). After isolating the canonical failure set
in the real reports:

| Mutation                                                 | Current gate |
| -------------------------------------------------------- | ------------ |
| behavioural report loses 11 passing outcomes: 550 remain | exit 0       |
| behavioural report loses 12 passing outcomes: 549 remain | exit 1       |
| visual report loses 1 passing outcome: 18 remain         | exit 0       |
| visual report loses 2 passing outcomes: 17 remain        | exit 1       |

This disproves the PR body's universal that “a truncated run is a failure,
never a pass.” More importantly, a process-level skip can preserve the count
while executing almost nothing. The floor is useful for a wholly lost shard,
but it is not evidence that the enumerated tests ran.

**Required correction.** Compare expected test identity and disposition, not
only a loose count. Known skips need an explicit identity baseline just as
known failures do; a new skip or missing identity must fail. Legitimate test
addition/removal can then be an intentional baseline change. At minimum, count
only actually executed outcomes and close the 561→550 / 19→18 slack with an
independently maintained population check.

**Class swept.** I exercised both tiers and both failure shapes: same-size mass
skip and physically missing outcomes. The one-below-floor controls failed. I
also checked the four Playwright statuses consumed by the walker (`expected`,
`unexpected`, `flaky`, `skipped`); only the middle two receive semantic
handling.

### M2 — MERGE-BLOCKING: any newly flaky regression is green without an allowlist

CI retries twice (`playwright.config.ts:16-20`). The gate deliberately logs
every `flaky` outcome but never changes status (`tools/check-suite-signatures.cjs:204-210,235-241`).
Its comment refers to an eight-item watched-flake ledger, but neither that
ledger nor a machine-readable equivalent is an input to the gate.

I used the real behavioural report, retained the canonical calendar failure,
neutralised the other two unrelated new failures, and changed the new
bubble-card failure to `flaky`, preserving its three attempts. Together with
the report's two existing flakes, the checker printed three flaky identities
and exited 0. Thus a genuine new regression that fails twice and passes on its
last retry receives the same green check as an already adjudicated flake.

**Required correction.** Baseline known flaky identities (and, where stable,
their reason class/attempt envelope) and fail a newly flaky identity. A policy
decision to tolerate named existing debt does not justify tolerating every
future pass-on-retry result.

**Class swept.** I checked all flaky handling in the checker and the only retry
definition in Playwright configuration. There is no repository file, workflow
input, or external lookup joining the gate to the watched ledger.

### M3 — MERGE-BLOCKING: matcher substrings mask a changed timeout reason

Reason classification tests generic matcher words before timeout words
(`tools/check-suite-signatures.cjs:89-98`). A timeout raised while Playwright is
inside `toHaveScreenshot`, `toMatchSnapshot`, `toBeVisible`, or `toHaveCount`
therefore retains the old matcher class instead of changing to `timeout`.

Against the real visual report I replaced the advanced-slider failure message
with:

```text
Error: Test timeout of 60000ms exceeded while waiting in expect(page).toHaveScreenshot(expected)
```

The checker classified it as `snapshot-mismatch` and exited 0. The discriminator
control removed `toHaveScreenshot` while keeping the timeout; it classified as
`timeout` and exited 1. This is a fail-against-current control, not a hypothetical
regex concern.

**Required correction.** Derive cause from structured Playwright fields where
possible and make mixed-cause precedence explicit. Add collision controls for
timeout plus each earlier matcher/launch token, not just one positive example.

**Class swept.** I checked every ordered classifier arm. Five manifest entries
are snapshot mismatches, one is a count mismatch, and one is locator visibility
(`tests/baseline/expected-failures.json:25-104`); all seven canonical signatures
use a class whose matcher token precedes timeout.

### M4 — MERGE-BLOCKING: T1 still uses the raw exit code for its one known behavioural failure

T1 excludes visual tests but invokes affected behavioural e2e directly, with
no signature check (`.github/workflows/ci.yml:153-160`). Six canonical failures
are visual and therefore excluded; the seventh is
`e2e/calendar.spec.ts` (`tests/baseline/expected-failures.json:25-37`). If a
change selects that spec, an unchanged known failure makes T1 red—the raw-exit
semantics this PR says it replaces.

I reran that complete spec at current head:

```text
bash tools/test-headless.sh tests/e2e/calendar.spec.ts \
  --project=electron-e2e --workers=1 --reporter=line
REAL_EXIT=1; 1 failed / 1 passed
failure: tests/e2e/calendar.spec.ts:45:72 (the canonical locator-not-visible signature)
```

The two T1 projects are also sequential steps (`.github/workflows/ci.yml:153-167`).
Any e2e failure suppresses the integration step. Run `31802420811` proves the
control-flow fact: affected e2e failed and affected integration was skipped.

**Required correction.** Give partial T1 reports signature-aware treatment
against the intersection of selected and baselined tests, without treating an
unselected canonical as “vanished.” Preserve both project results when one is
red, either with independent jobs, one combined invocation, or deliberate
`always()` handling.

**Class swept.** I checked all seven manifest members against both T1 filters;
only calendar can enter T1. I checked both affected-project steps and the one
available failure run; integration is the only suppressed sibling.

### M5 — MERGE-BLOCKING: T2 is neither mandatory nor current-head evidence

The regression workflow subscribes to PR actions `labeled` and
`ready_for_review`, but not `synchronize` (`.github/workflows/test.yml:29-35`).
Its job condition accepts the first two events (`:52-60`). Once a labelled or
ready PR receives another commit, the new head does not start T2. Visibility of
T1's zero-test result is therefore not a safety net: the workflow itself says
T1 is heuristic and T2 is behind it (`.github/workflows/ci.yml:63-67,118-150`),
while a common `src/`-only change selects no Playwright tests.

The live PR makes this concrete rather than prospective:

- current local, remote, and PR head are all `8fe1434b...`;
- the PR has no `full-suite` label;
- the current head has only `ci` and `affected specs (tier 1)`, both green;
- GitHub reports merge state `CLEAN` with no T2 status in the rollup;
- the sole completed full run, `31802864528`, is a manual dispatch at stale
  head `a6d0729`, and its merge/signature job is red with three new failures.

The three failures are not attributable to a branch product or assertion edit:
`git diff 143f8c9...HEAD -- src` is empty, and the two failing spec files are
byte-unchanged. The badge helper really starts at each named combobox and sends
`Shift+Tab` (`tests/integration/theme-no-effect-badge.spec.ts:128-153`). The CI
failure received `testid: null`, so open R7-N1's same-`data-testid` impostor
false-positive did not manufacture these failures. My independent repeats were
green: the two badge cases passed 4/4 and the three bubble hash cases passed
6/6, one worker. That points to environment/order sensitivity, not proof that
the product is correct on the GitHub runner. The actual full-run authority is
still red and stale.

**Required correction.** Once `full-suite` is selected, run T2 on every later
`synchronize` event while that label is present (and on the final ready event),
and make its stable check name required for the current PR head. Obtain a
current-head run and resolve or owner-adjudicate its unexpected failures before
calling the safety net green. Only then can a visible T1 vacuity be treated as
fast feedback rather than certified nothing.

**Class swept.** I checked every trigger, every PR job condition, the current
label set, all current-head check runs, every `test.yml` run on the branch, and
the head SHAs/results of the two commissioned runs.

### M6 — MERGE-BLOCKING: the first nightly notification cannot apply its deduplication label

The notification searches and creates by label `nightly-failure`
(`.github/workflows/test.yml:275-291`). That label does not exist in the live
repository: `gh label list --search nightly-failure --json name` returned `[]`.
The job neither creates nor verifies it. GitHub's own Actions guidance states
that labels assigned by an issue workflow must already exist:
[Adding labels to issues](https://docs.github.com/en/actions/tutorials/manage-your-work/add-labels-to-issues).
The first red nightly therefore cannot establish the labelled issue on which
all later deduplication depends.

Even after provisioning the label, the lookup requests only the first 20
matching issues and does not paginate (`.github/workflows/test.yml:275-282`).
If the canonical issue falls outside that page, the “never one per night”
invariant creates a duplicate.

**Required correction.** Provision or idempotently create the label before it
is used, fail with a specific diagnostic if that cannot happen, and paginate
the lookup (or persist a stronger canonical identifier). Add a workflow-level
test/probe for new, open, closed, and beyond-first-page cases.

**Class swept.** I traced schedule gating, permission, new issue, open issue,
closed/reopen, comment, title matching, label filtering, and pagination. The
schedule-only event guard and reopen/comment branches otherwise match their
stated policy. I did not create an issue to test them because this review has
read-only external authority.

### M7 — MERGE-BLOCKING: current CI-behaviour claim surfaces still contradict the implementation and evidence

The repo's authoritative testing text says “T2/T3 are the gate”
(`docs/testing/TESTING_STANDARDS.md:859-872`), which M5 disproves at the current
PR head. The public PR body is a further current claim surface and contains at
least these stale/false statements (line numbers from `gh pr view 143 ... |
nl -ba`):

- line 42: every truncated run fails (disproved by M1);
- line 50: `bb747cc` is “this branch's HEAD” (the head is `8fe1434b`);
- lines 60-63: visual CI and the full behavioural run are unmeasured (run
  `31802864528` measured both);
- line 69: `test.yml` deliberately does not open an issue (the notify job was
  added in `09d7a38`);
- lines 29-30 and 61: the old 15/40-minute projections remain after the measured
  25m51s run.

The external population is non-empty. MemPalace decision drawer
`drawer_havdm_decisions_651e0c3f7ca2be300e98b95c` and current `[STATE]`
drawer `drawer_havdm_state_a15b0af78e0814cfd19cf627` still describe the
owner-agreed “three-tier” pre-implementation plan, including worker parallelism
and “NOT STARTED.” Those are historically useful but need an explicit
superseding/current link once the owner settles this PR; silently rewriting the
historical decision would be worse.

**Required correction.** Fix the mechanisms first, then update the PR body and
the current testing statements from the resulting behavior. The write-enabled
author should supersede/link the MemPalace plan and update `[STATE]` only at the
appropriate owner-approved lifecycle point.

**Class swept.** Population source was role, not the changed-file list: (1)
executable truth—the two workflows, checker, manifest, and Playwright config;
(2) current normative repo truth—the CI section of the testing standard, read
end to end; (3) publication truth—the live PR body; and (4) external project
truth—the named current decision and state drawers. A broad repo search also
found archives, feature plans, and historical reviews; I read their matched
context and excluded them because they narrate past work rather than define
current CI behavior. External members are therefore **not none**.

### N1 — NON-BLOCKING: “11 DSL screenshot methods” collapses distinct implementations by name

The partition result is correct, but its supporting method count uses the
wrong key. Searching assertion behavior found **13 assertion-bearing DSL method
implementations in 12 modules**, not 11. `expectLayoutScreenshot` exists in
both layout and attribute-display DSLs (`tests/support/dsl/layout.ts:373-413`,
`tests/support/dsl/attributeDisplay.ts:361-378`), and `expectCardScreenshot`
exists independently in accordion and tabs (`tests/support/dsl/accordion.ts:74-113`,
`tests/support/dsl/tabs.ts:203-239`). Counting unique method-name tokens
collapses those two pairs to 11.

This does not change the outcome: the 12 DSL-consuming spec files plus five
direct assertion files are exactly the same 17 tagged files and 19 tests.
Correct the count wherever the self-check is retained; no partition change is
required.

**Class swept.** I enumerated every `toHaveScreenshot` / `toMatchSnapshot`
assertion, traced each DSL method to every spec caller, and separately searched
all `.screenshot()` calls. Diagnostic-only captures—including
`calendar.visual.spec.ts`—do not compare pixels and correctly remain
behavioural for pass/fail purposes.

## Required §3 result matrix

### 1. Can `check-suite-signatures.cjs` pass a run it should fail?

**Findings M1, M2, and M3.** It accepts mass skips, small truncations, a newly
flaky regression, and a mixed-message timeout misclassified as the expected
matcher failure. Controls immediately outside each boundary failed.

The named rejection probes did hold: zero suites exited 1; a subtly wrong
manifest `titlePath` exited 1 with one new plus one vanished identity; a
missing report exited 1; and the author's duplicated-report guard remained
red on a doubled population.

### 2. Is shard-level `continue-on-error` safe?

**No additional placement issue found, conditional on fixing M1-M3.** It is
limited to the Playwright shard step (`.github/workflows/test.yml:89-106`), and
the merged signature step has no `continue-on-error` (`:137-149`). I ran
`npx playwright merge-reports --reporter json <empty-directory>`; it exited 1
with “No report files found,” so four empty/missing blobs do not become an
empty green report. A lost whole shard also crosses the current floor.

The argument is not sufficient while the downstream accepting holes remain:
`continue-on-error` deliberately makes the checker the sole authority, so M1-M3
are defects in the authority on which this placement relies.

### 3. Is the `@visual` partition complete?

**No partition issue found; N1 corrects only the method count.** Independent
behavior enumeration produced 13 DSL assertion methods in 12 modules plus five
direct-assertion spec files = 17 files. The independent Playwright enumeration:

```text
CI=1 npx playwright test --project=electron-e2e --grep @visual --list
Total: 19 tests in 17 files
```

The counterpart is 306 nonvisual e2e tests, so 19 + 306 = 325. All six visual
manifest identities are in the tagged 19. The one listed color-picker test is
intentionally skipped but remains part of the visual identity population.

### 4. What caused the three new failures from run `31802864528`?

**Finding M5 governs their gate status; no evidence of a PR product/assertion
regression was found.** There is no `src/` diff and neither failing spec changed.
The two badge failures used real backward navigation and received a null
test-id, so they are not R7-N1's same-id false positive. Focused local repeats
were green (badge 4/4, bubble hash 6/6). The bounded conclusion is
GitHub/environment/order sensitivity; the cause is not diagnosed. The red,
stale full run cannot be promoted to current-head green evidence.

### 5. Are all current CI-behaviour statements true?

**Finding M7.** No. The testing standard's “gate” statement and multiple live
PR-body statements are false/stale. The external question also found two
MemPalace members that need explicit lifecycle handling.

### 6. Is visibility enough for T1's vacuous pass?

**Findings M4 and M5.** No. A warning is useful telemetry, but current PR state
allows a green zero-spec T1 without a mandatory current-head T2. T1 can also
false-red when it selects the known calendar failure.

### 7. Are the 550/18 floors defensible truncation guards?

**Finding M1.** They detect a missing shard and the one-below-floor controls,
but accept 11/1 physically missing outcomes and any number of status changes to
`skipped`. They are not sufficient as the execution-integrity instrument.

### 8. Can the notify job spam, fail silently, or fire on the wrong event?

**Finding M6.** The event guard is correct, but the required label is absent,
so the first issue path cannot establish its deduplication key. The unpaginated
20-item lookup can later create a duplicate. The job has never executed; no
write probe was authorised.

## Independent reruns and commands

The binding reviewer rerun requirements in
`docs/governance/OPERATING_AGREEMENT.md:252-291` were applied as follows.

1. **Load-bearing mechanisms and controls.** The checker was rerun at current
   head against both real reports, then against accepting-side mutations. The
   raw reports returned behavioural exit 1 (561 tests, four unexpected versus
   one expected) and visual exit 0 (19 tests, exact six):

   ```bash
   node tools/check-suite-signatures.cjs \
     --report /tmp/havdm-ci-review-FvuNNw/merged-results.json \
     --tier behavioural --min-tests 550
   node tools/check-suite-signatures.cjs \
     --report /tmp/havdm-ci-review-FvuNNw/visual/visual-results.json \
     --tier visual --min-tests 18
   ```

   Representative exact fail-against-current mutation command:

   ```bash
   node -e 'const r=require(process.argv[1]);function w(s){for(const x of s||[]){for(const p of x.specs||[]){for(const t of p.tests||[]){if(p.file!=="e2e/calendar.spec.ts")t.status="skipped"}}w(x.suites)}}w(r.suites);process.stdout.write(JSON.stringify(r))' /tmp/havdm-ci-review-FvuNNw/merged-results.json | node tools/check-suite-signatures.cjs --report /dev/stdin --tier behavioural --min-tests 550
   ```

   Result: exit 0 with 561 identities, one expected failure, and 560 skipped.
   The visual counterpart also exited 0 with six failures and 13 skipped.

2. **Deeper repeat on the flakiest observed mechanism.** The author published
   one full-suite execution, so `--repeat-each=2` is a strictly deeper repeat:

   ```bash
   bash tools/test-headless.sh tests/integration/theme-no-effect-badge.spec.ts \
     --project=electron-integration \
     --grep "the non-compact collapsed badge is keyboard-reachable too|the saved-theme and per-view override badges are keyboard-reachable too" \
     --workers=1 --repeat-each=2 --reporter=line
   # exit 0: 4 passed

   bash tools/test-headless.sh tests/e2e/bubble-card.spec.ts \
     --project=electron-e2e --grep "hash" \
     --workers=1 --repeat-each=2 --reporter=line
   # exit 0: 6 passed
   ```

3. **Repository gate.** Exact command `./tools/checks`; **REAL_EXIT=0**. All
   four stages ran: lint 0 errors / 145 warnings, formatting clean, typecheck
   clean, unit 1413 passed in 104 files.

I additionally ran the complete two-test calendar spec shown in M4; it returned
the canonical 1 failed / 1 passed, exit 1.

## Evidence boundary

- I did **not** rerun all 561 Playwright tests locally. No full GitHub run exists
  at current head. The full-run result is therefore **UNVERIFIED AT CURRENT
  HEAD**; run `31802864528` is real but red and pinned to stale `a6d0729`.
- I replayed that run's downloaded JSON through the checker at current head,
  which directly verifies checker behavior but not a fresh runner execution.
- I did not exercise the notification's mutating branches. I verified source,
  event/job structure, live label/issue state, and GitHub's documented label
  precondition only.
- I did not inspect repository settings beyond the live PR label/check/merge
  status exposed by GitHub; an unseen future rule cannot supply current-head T2
  evidence that the current rollup does not contain.
- `ha.home.local` was not accessed; this CI-only review needed no Home Assistant
  state. No UAT or product behavior was changed or scored.

## MemPalace drawer candidates

No MemPalace write was made. Per MP-LEASE, the write-enabled author may file or
apply these with `added_by="codex"` after owner adjudication:

1. **HAVDM/testing:** A Playwright report-size floor counts identities, not
   executions. If skipped outcomes count toward the floor, a full-signature gate
   can pass while almost the entire suite is skipped; compare expected identity
   and disposition, and prove both same-size skip and below-floor controls.
2. **HAVDM/testing:** A retry policy needs a machine-readable known-flake
   allowlist if new pass-on-retry regressions are meant to block. A prose watched
   ledger plus a warning-only branch makes every future flake green.
3. **Practice/verification candidate:** Ordered substring classifiers need
   mixed-token adversarial controls. A message containing both an expected
   matcher and a timeout can preserve the old class unless precedence reflects
   root cause rather than the first familiar token.
4. **HAVDM/decisions + state:** Supersede/link
   `drawer_havdm_decisions_651e0c3f7ca2be300e98b95c` and update
   `drawer_havdm_state_a15b0af78e0814cfd19cf627` only after the owner settles
   PR #143, preserving the old three-tier plan as history rather than silently
   overwriting it.
