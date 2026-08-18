# HAVDM Adversarial Review — PR #144 round 1 2026-08-15 (OpenAI Codex GPT-5)

**Author:** BaggyG-AU with Claude Opus 5, 2026-08-15

**Reviewer:** OpenAI Codex (GPT-5), independent reviewer, 2026-08-15

**Owner gate:** owner arbitration of the findings; this document decides nothing
on its own.

**Commissioned by:** owner · **Scope:** PR #144,
`feature/stabilise-ci-unstable-tests`, `main..HEAD` (`ae4cbdf3..f52ccf13`),
everything changed under `tests/`

**Reviewer write-restrictions (acknowledged):** no `[STATE]` drawer update; no
UAT card marked or re-scored; no `src/` change; no merge; no manifest change;
Home Assistant untouched. Proposed changes go in this document, nowhere else.

## 0. Working practice this review is held to

1. **A finding is a sample, not the population.** Identify the CLASS a defect
   belongs to, sweep every member, and say which you swept. A mechanical sweep
   is only as good as the key it is keyed on: the class must be stated as a
   behaviour before choosing a search key.
2. **No unverified universals.** “Only”, “every”, “all”, “none” or any count
   needs the enumeration that backs it, attached to the claim. A count of
   containers is not a count of contents.
3. **A check is evidence only for the property it exercises.** Ask whether the
   check would have failed if the claim were false. An isolated pass says little
   about a flaky path; confirming wiring is not confirming that a value flows.
4. **Verify each finding against the source before reporting it.** Quote
   `path:line`. A finding that cannot be located is a question.
5. **Silence is not a result.** State “no issue found” for each commissioned
   heading. Zero findings is a PASS; never manufacture one.
6. **Declare the evidence boundary.** State what could not be run or reached.
7. **An ordered substring classifier needs mixed-token adversarial controls.**
8. **A regression fixture that names two guards must fail against the old
   implementation for each guard.** An assertion of emptiness is satisfied by
   every reason for emptiness.

## 1. Verdict first

**CHANGES-REQUIRED before merge, for acceptance evidence and the public claim
surface; no implementation defect was found in Classes A–D.** Classes A–C have
post-fix full-run artifacts and clean independent repeats, while Class D passed
10/10 locally and survived the requested source attacks, but every named full CI
run is at `e23244a`, before the Class D fix at `f52ccf13`; the PR body still says
Class D is unfixed. No source, test, tolerance, or manifest change is directed
unless current-head full CI contradicts the fix.

## 2. Confidence and method

Confidence is high on the source review, Class A population and anchors, and
local current-head behaviour. Confidence is deliberately incomplete on Class
D's GitHub-run acceptance because the environment that produced the old failure
has not run the new assertion in any evidence supplied to this review.

I performed the following work:

- Confirmed local `HEAD`, the remote branch head, and PR #144 head are all
  `f52ccf13bef00e8347aa871634e58dbc8e4b14c2`; `main` and the merge base are
  `ae4cbdf3d3fc36825061175349f83b4816b35a57`.
- Read the complete `main..HEAD` diff: 19 changed files, all under `tests/`,
  with 233 insertions and 29 deletions. `git diff --quiet main..HEAD -- src`
  returned 0. The same command scoped to
  `tests/baseline/expected-failures.json` returned 0.
- Read the PR body, both branch commits, the governing Operating Agreement
  §3.5, and every changed file. For behavioural classification I also read the
  relevant unchanged producers in `PropertiesPanel.tsx`, `EntityBrowser.tsx`,
  `App.tsx`, and `GridCanvas.tsx`.
- Downloaded and parsed `merged-results.json` from all seven commissioned full
  runs. The report walker counted test outcomes and read each target identity's
  final disposition, attempts, and first error; it did not infer status from the
  workflow conclusion.
- Swept the 38 behavioural consumers of editor content as 18 changed members
  and 20 surviving direct-read non-members. Definitions and the helper's two
  internal calls were excluded from the consumer count.
- Swept all hovers in the changed theme spec, all remaining `.check()` calls in
  `tests/`, and all tests that compare card geometry across moments rather than
  merely measuring a box once.

### Artifact matrix

`FAIL` means the identity remained unexpected after retries; `FLAKY` means it
failed at least once and then passed.

| Full run      | Head      | Bubble A | Gauge A | Theme B | YAML insert C | Save D  |
| ------------- | --------- | -------- | ------- | ------- | ------------- | ------- |
| `31802864528` | `a6d0729` | FAIL     | FLAKY   | FLAKY   | pass          | pass    |
| `31855223002` | `019d9d5` | pass     | pass    | pass    | pass          | FLAKY   |
| `31857246311` | `a42d487` | pass     | pass    | FAIL    | FLAKY         | pass    |
| `31858537861` | `a42d487` | pass     | pass    | pass    | pass          | pass    |
| `31870375328` | `e23244a` | pass     | pass    | pass    | pass          | pass    |
| `31871488924` | `e23244a` | pass     | pass    | pass    | pass          | FAIL ×3 |
| `31872660877` | `e23244a` | pass     | pass    | pass    | pass          | pass    |

The first four rows reproduce the N=4 characterisation: Bubble 1/4, Gauge 1/4,
Theme 2/4, YAML insert 1/4, and Save 1/4 were unstable. In the fifth through
seventh rows, the four A–C identities are 3/3 green after `e23244a`; Save is
pass/fail/pass because its fix is not in that commit.

### Independent reruns required by Operating Agreement §3.5

All commands ran at `f52ccf13` with no Playwright retries:

```text
bash tools/test-headless.sh tests/e2e/accordion.spec.ts:69
tests/e2e/advanced-slider.spec.ts:47 tests/e2e/apexcharts.spec.ts:27
tests/e2e/bubble-card.spec.ts:37 tests/e2e/bubble-card.spec.ts:72
tests/e2e/bubble-card.spec.ts:93 tests/e2e/calendar.spec.ts:65
tests/e2e/carousel.spec.ts:119 tests/e2e/gauge-card-pro.spec.ts:39
tests/e2e/gauge-card-pro.spec.ts:82 tests/e2e/graphs.spec.ts:48
tests/e2e/popup.spec.ts:111 tests/e2e/progress-ring.spec.ts:64
tests/e2e/spacing.spec.ts:119 tests/e2e/sparkline.spec.ts:46
tests/e2e/tabs.spec.ts:119 tests/e2e/timeline.spec.ts:60
tests/e2e/weather-forecast-visualization.spec.ts:58
--project=electron-e2e --workers=1 --retries=0 --reporter=line
result: 18 passed (5.9m)

bash tools/test-headless.sh tests/e2e/bubble-card.spec.ts
tests/e2e/gauge-card-pro.spec.ts tests/e2e/save-and-backup.spec.ts
--project=electron-e2e --workers=1 --retries=0 --repeat-each=4
--grep 'adds the hash field|preserves built-in gauge|Expected 3: re-reading'
--reporter=line
result: 12 passed (3.3m)

bash tools/test-headless.sh tests/integration/theme-no-effect-badge.spec.ts
tests/integration/yaml-entity-insert.spec.ts --project=electron-integration
--workers=1 --retries=0 --repeat-each=4
--grep 'the tooltip claims nothing about the screen|inserts the selected id at
the cursor in the Split view YAML pane' --reporter=line
result: 8 passed (1.4m)

bash tools/test-headless.sh tests/e2e/save-and-backup.spec.ts
--project=electron-e2e --workers=1 --retries=0 --repeat-each=10
--grep 'Expected 3: re-reading' --reporter=line
result: 10 passed (1.7m)

./tools/checks
real exit: 0; lint 0 errors / 145 warnings; formatting and typecheck passed;
1413 tests passed in 104 files
```

The ten-repeat Save run is strictly deeper than the author's nine published
local measurements. The four-repeat runs are deeper than the three published
post-A–C full runs. These are useful current-head observations; the Save pass
does not substitute for post-fix CI because the old implementation also passed
all nine author-local measurements.

**Constraints — what this review did NOT establish.** I did not run a full
Playwright suite, a packaged binary, or Home Assistant. I did not trigger a
GitHub workflow. At review time, current-head run `31875020511` had a passing
`ci` job and a pending affected-specs job; the full-suite workflow
`31875020552` skipped its behavioural jobs. I could not independently rerun the
author's scratch-only `shift`, `striplayout`, or `movecard` mutations because
they are not in the tree and this commission forbids editing other files. I
checked their claimed semantics against source and algebra, not their claimed
numeric output. MemPalace was unreachable (`Transport closed`), so no read or
write there is claimed.

### Results of the six commissioned attacks

#### 1. Anchor discrimination — no issue found

The 18 new waits are enumerated below. “Different” means the anchor is absent
from or unequal to the stale seed at the point being guarded; the anchor line
itself is cited so the enumeration is reproducible.

| #   | Call site                                             | Anchor                     | Stale discriminator                                        |
| --- | ----------------------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| 1   | `tests/e2e/accordion.spec.ts:87`                      | `title: Kitchen Controls`  | seed title differs                                         |
| 2   | `tests/e2e/advanced-slider.spec.ts:78`                | `commit_on_release: true`  | seed is false                                              |
| 3   | `tests/e2e/apexcharts.spec.ts:66`                     | `/4fa3ff/`                 | seed colour differs                                        |
| 4   | `tests/e2e/bubble-card.spec.ts:64`                    | `hash: #kitchen`           | seed has no hash                                           |
| 5   | `tests/e2e/bubble-card.spec.ts:124`                   | `hash: #living_room`       | hash is absent before the final fill                       |
| 6   | `tests/e2e/bubble-card.spec.ts:138`                   | `card_type: button`        | preceding state is `pop-up`; the same flush removes `hash` |
| 7   | `tests/e2e/calendar.spec.ts:96`                       | `show_agenda: false`       | seed is true                                               |
| 8   | `tests/e2e/carousel.spec.ts:139`                      | `type: fraction`           | seed pagination type differs                               |
| 9   | `tests/e2e/gauge-card-pro.spec.ts:67`                 | `label: Low Band`          | seed label differs                                         |
| 10  | `tests/e2e/gauge-card-pro.spec.ts:106`                | `needle: false`            | seed is true                                               |
| 11  | `tests/e2e/graphs.spec.ts:78`                         | `refresh_interval: 1m`     | seed is `30s`                                              |
| 12  | `tests/e2e/popup.spec.ts:132`                         | `close_on_backdrop: false` | seed is true                                               |
| 13  | `tests/e2e/progress-ring.spec.ts:91`                  | `label_precision: 0`       | seed differs                                               |
| 14  | `tests/e2e/spacing.spec.ts:147`                       | `left: 16`                 | seed differs                                               |
| 15  | `tests/e2e/sparkline.spec.ts:76`                      | `line_width: 3`            | seed is 2                                                  |
| 16  | `tests/e2e/tabs.spec.ts:142`                          | `defaultTabIndex: 2`       | seed is 1                                                  |
| 17  | `tests/e2e/timeline.spec.ts:89`                       | `truncate_length: 40`      | seed differs                                               |
| 18  | `tests/e2e/weather-forecast-visualization.spec.ts:84` | `locale: en-GB`            | seed locale differs                                        |

The Tabs call is the deliberate edge case. The literal final form action is
tab position, which has no serialised trace; the wait therefore anchors on the
last serialised edit, `defaultTabIndex`, and the test then asserts that the
non-serialised fields remain absent (`tests/e2e/tabs.spec.ts:134-148`). It does
not return immediately on the seed.

I also inspected the helper's post-poll reread at
`tests/support/dsl/yamlEditor.ts:411-416`. It is redundant, but these 18 callers
perform no later edit while waiting and then assert the returned document. I
found no false-green path for this population; a surprising second read would
make the caller fail rather than conceal stale YAML.

#### 2. The 38-site population — membership correct; one reason corrected

The behavioural class is: **a test makes a Properties-panel form edit, switches
to its YAML pane, and takes a single sample before the restartable 250 ms
serialisation can flush.** The 20 surviving direct-read consumers are:

| Consumers            |  Count | Why not Class A                                                                                                                               |
| -------------------- | -----: | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `yaml-entity-insert` |      5 | modal editor; no Properties form serialisation                                                                                                |
| `monaco-editor`      |      3 | each read is already inside `expect.poll`                                                                                                     |
| `entity-browser`     |      3 | direct editor/insertion flow, including its own poll                                                                                          |
| `preset-marketplace` |      1 | modal editor                                                                                                                                  |
| `bulk-operations`    |      1 | modal dashboard editor after the live store update and an explicit 2 s wait                                                                   |
| `smart-actions`      |      2 | disappearance is polled, then the follow-up read occurs after that poll                                                                       |
| `sections-canvas`    |      2 | card selection/drop selection serialises synchronously at `PropertiesPanel.tsx:1381`                                                          |
| `trigger-animations` |      2 | first is selection-driven; second reads content the test wrote and synchronously commits when leaving YAML at `PropertiesPanel.tsx:1686-1699` |
| `spacing`            |      1 | reads the Monaco value the test itself just wrote                                                                                             |
| **Total**            | **20** |                                                                                                                                               |

Thus 18 converted calls plus 20 non-members equals the commissioned population
of 38. The PR body is slightly wrong to call both `trigger-animations` reads
selection-driven; the second is editor-driven but still safely outside Class A.
That claim correction is N2 below, not a missing member.

#### 3. `hoverWhenSettled` false-pass attack — no issue found

The helper polls for a non-null rounded box and then calls Playwright's normal
actionable `locator.hover()` (`tests/integration/theme-no-effect-badge.spec.ts:102-128`).
A never-hoverable target therefore fails the hover itself. A target that can be
hovered but whose tooltip is broken fails the caller assertion. I checked all
four call sites: the collapsed badge requires a visible explanatory overlay at
`:616-647`; the selected-theme wording leg requires its tooltip at `:1046-1074`;
the unstable inactive-option leg requires the wording-neutral `This theme`
overlay at `:1137-1159`; and the staged-value leg repeats that precondition at
`:1254-1263`. Settling cannot manufacture any of those overlays.

Rounded boxes can alias sub-pixel motion, but the subsequent Playwright hover
still performs actionability checks. That residual could cause a missed hover
and a false red; it does not provide a false-green route past the tooltip
assertions.

#### 4. Class D weakening and `movecard` — no source issue found; numeric control unverified

`getCardRectsRelativeToGrid` reads the grid and all direct child boxes in one
browser evaluation, then returns `card.left - grid.left` and
`card.top - grid.top` (`tests/support/dsl/canvas.ts:200-211`). For a pure grid
translation Δ, `(card + Δ) - (grid + Δ)` is unchanged. For a real within-grid
card move δ with a stationary grid, `(card + δ) - grid` changes by δ. Width and
height are copied unchanged. The new form therefore cancels the irrelevant
common origin and retains every component of the within-grid geometry the old
assertion used.

This confirms the logic of the author's `movecard` claim, but not its published
numeric values: the mutation was scratch-only. My 10/10 normal run cannot serve
as its discriminator because the author reports the old absolute comparison was
also 9/9 locally. N1 asks for a durable control so a future reversion can be
detected without waiting for CI chance.

#### 5. Last-card `_havdm_layout` scope — no issue found

The fixture seeds two cards without `_havdm_layout`
(`tests/e2e/save-and-backup.spec.ts:44-53`). `makeDirty` adds one palette card
(`:97-100`). The flat-grid add path creates that card with a four-field
`_havdm_layout`, appends it to `currentView.cards`, and selects the appended
index (`src/App.tsx:1168-1203`). The test first requires exactly three saved
cards and then checks the last card's layout (`tests/e2e/save-and-backup.spec.ts:213-233`).
The scope is therefore the one card this scenario newly positions. Requiring
layouts on the two seed cards would assert a format contract the fixture never
establishes; corrupt geometry on any card is still covered by the indexed
before/after relative-rectangle comparison at `:242-249`.

#### 6. Latent debounce readers, including 800 ms — no issue found in the swept behaviours

The 800 ms commit is not the live data path. Form changes call `onChange`
immediately at `src/components/PropertiesPanel.tsx:1537-1538`; the later commit
handles undo-stack finalisation, toast/reselection, and the end of the batch at
`:1444-1459`. I searched tests that combine Properties setters with history,
undo/redo, commit messages, dirty state, global YAML reads, card reselection, or
fixed waits. The two bulk global-YAML reads explicitly wait 2 s
(`tests/integration/bulk-operations.spec.ts:117-123,202-206`); smart-action
absence polls before its follow-up read (`tests/e2e/smart-actions.spec.ts:250-261`);
the remaining form-result assertions observe the immediate live update or the
250 ms YAML path already classified above.

I also checked the 350 ms YAML-parse direction. The questioned
`trigger-animations` flow leaves the YAML tab, whose handler reads Monaco and
parses/commits synchronously (`src/components/PropertiesPanel.tsx:1686-1699`),
before it returns and reads again. No additional latent member was found. This
is the weakest population claim in the review because it is a behaviour-keyed
source sweep, not a timing amplifier of every test in the repository.

## 3. Claim ledger

| #   | Claim                                                                                                                      | Tag      | Evidence                                                                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | PR #144 changes 19 files under `tests/`; `src/` and the failure manifest are byte-unchanged.                               | MEASURED | `git diff --stat/name-only main..HEAD`; two scoped `git diff --quiet` commands, exit 0                                                                                                             |
| C2  | The Class A consumer population is 18 changed members and 20 direct-read non-members.                                      | MEASURED | the 18-row anchor enumeration and 20-row grouped enumeration above; added waits from `git diff main..HEAD`; surviving reads from `rg -n 'getEditorContent\(' tests` with helper internals excluded |
| C3  | Each A wait distinguishes stale content at the serialised state it needs.                                                  | MEASURED | the 18 cited call sites and their seed/action contexts; 18/18 focused run                                                                                                                          |
| C4  | `hoverWhenSettled` cannot itself make a broken tooltip pass.                                                               | MEASURED | helper at `theme-no-effect-badge.spec.ts:102-128`; four independent tooltip assertions enumerated above                                                                                            |
| C5  | Class C replaces same-tick verification of a controlled radio with a wrapper click and a polled committed-state assertion. | MEASURED | `EntityBrowser.tsx:595-601`; `tests/support/dsl/entityBrowser.ts:290-314`; old artifact error; 4/4 local repeat                                                                                    |
| C6  | Relative grid coordinates remove a common-origin translation without removing a within-grid card move.                     | INFERRED | coordinate equation plus one-evaluation implementation at `canvas.ts:200-211`; author's scratch numeric control was not rerun                                                                      |
| C7  | The last saved card is the sole palette-placed card in the Save fixture.                                                   | MEASURED | seed at `save-and-backup.spec.ts:44-53`; append path at `App.tsx:1168-1203`; assertion at `save-and-backup.spec.ts:213-233`                                                                        |
| C8  | No additional 250/350/800 ms debounce reader was found in the swept test behaviours.                                       | INFERRED | direct-read enumeration; commit/live-update source; history/global-YAML/selection search described above                                                                                           |
| C9  | The three named A–C acceptance runs do not exercise the Class D fix.                                                       | MEASURED | each report/run head is `e23244a`; fix commit is later `f52ccf13`; run matrix above                                                                                                                |
| C10 | Current-head focused tests and the repository gate are green.                                                              | MEASURED | 18, 12, 8, and 10-test commands above; `./tools/checks` real exit 0                                                                                                                                |

**Weakest claims.** C6 is source/algebra confirmation rather than an independent
run of the author's `movecard` mutation. C8 is bounded by the behavioural search
described and is not a claim that every test timing is flawless. The causal
description “the grid moved on CI” remains an inference: the reports prove the
old viewport delta, and the new math handles the class, but no current-head
GitHub run has observed the former failing environment.

## 4. Findings (ranked, most severe first)

### M1 — MERGE-BLOCKING: Class D has no post-fix full-CI acceptance, and the PR body describes the pre-fix head

**Evidence.** Class D is changed by `f52ccf13`; its load-bearing assertions are
at `tests/e2e/save-and-backup.spec.ts:197-249`. All three named acceptance runs
have head `e23244a`, and run `31871488924` fails Save on all three attempts.
Current-head full-suite run `31875020552` skipped its behavioural jobs. The PR
body says “Class D — NOT FIXED” and calls the file byte-unchanged, both false at
the PR's current head.

**Problem.** The failure was CI-only: the author reports the old assertion was
9/9 locally, while it failed in full CI. My 10/10 local result therefore cannot
distinguish old from new in the environment that matters. Calling the four-class
fix accepted would attach pre-fix evidence to a post-fix claim.

**Concrete fix.** Obtain at least three consecutive full GitHub CI runs at
`f52ccf13` or a descendant containing no further Class D change; inspect the
merged reports and record the Save identity's per-attempt result. Update the PR
body so its method, current head, Class D status, controls, and acceptance table
describe the code actually under review. If any current-head run fails Class D,
return to mechanism work rather than widening tolerance or baselining it.

**What must NOT change.** Do not touch
`tests/baseline/expected-failures.json`, the PR #143 M1–M7 work, the spacing
flake, branch protection, or product source to satisfy this evidence request.

**Class swept.** All commissioned acceptance surfaces were checked: four PR
#143 characterisation artifacts, three PR #144 named artifacts, both current
head check runs, both branch commits, and the current PR body. A–C have post-fix
full-run evidence; D alone does not.

### N1 — NON-BLOCKING: Class D's discriminating controls are not reproducible from the tree

**Evidence.** The committed load-bearing test calls the new helper at
`tests/e2e/save-and-backup.spec.ts:197,242`, but the author's own evidence says
both old and new forms pass normally in the local environment. The `shift`,
`striplayout`, and `movecard` mutations and their numeric readings exist only in
the `f52ccf13` commit message; no committed fixture or focused helper spec
contains them.

**Problem.** A future replacement of relative coordinates with viewport
coordinates can remain locally green. The code is mathematically sound, but the
most discriminating proof is not durable or independently rerunnable.

**Concrete fix.** As a follow-up, add a deterministic focused control that
applies a common grid-origin translation and fails the old absolute comparison,
plus a card-only movement control that fails if relative coordinates cancel a
real within-grid move. Keep the persisted-layout deletion control separate so
each guard has its own old/wrong-implementation failure.

**What must NOT change.** Do not weaken the ±2 px rendered comparison, replace
the exact saved-data assertion with a pixel proxy, or move this into production
code merely to make it easier to test.

**Class swept.** The behavioural class is tests that compare card geometry
across moments. Save Expected 3 is the positional member. Canvas resize compares
only width/height; `expectNoOverlappingCards` compares cards at one instant;
one-shot boxes used for hit-testing or screenshot clipping are not members.

### N2 — NON-BLOCKING: one non-member has the right disposition for the wrong stated reason

**Evidence.** The PR body classifies both direct reads in
`tests/e2e/trigger-animations.spec.ts:39,63` as selection-driven and synchronous
through `PropertiesPanel.tsx:1381`. The second follows a direct Monaco write at
`:53-56`; it is safe because leaving YAML synchronously reads, parses, and
commits at `PropertiesPanel.tsx:1686-1699`.

**Problem.** The 18/20 arithmetic and membership are correct, but the published
reason for one of the 20 is not. That weakens the audit trail for the exact
population attack this PR relies on.

**Concrete fix.** Correct the PR body classification while making the M1 update:
one Trigger read is selection-driven; the other is a direct-editor round trip
made synchronous by tab exit.

**What must NOT change.** Do not convert either Trigger call to
`waitForEditorContent`; neither follows a Properties form edit, so that would
blur rather than improve the class boundary.

**Class swept.** Both Trigger reads and both Sections reads were traced to their
producer. The two Sections reads and the first Trigger read are selection-driven;
the second Trigger read is the sole reason correction.

## 5. Directions

1. **P0, before merge, evidence-only:** run and inspect three consecutive full
   GitHub CI executions containing `f52ccf13`, then update the PR body. Expected
   cost is the repository's normal full-run cost; no code change is implied.
2. **P2, follow-up:** preserve the Class D `shift` and `movecard` discriminators
   as focused test fixtures so relative-coordinate semantics can be reviewed
   without recreating scratch mutations. Expected cost: small test-only change.
3. **P3, while updating the body:** correct the second Trigger non-member's
   reason. Expected cost: documentation only.

No implementation pivot is recommended from this review. Classes A–D should
remain as implemented unless current-head CI supplies contradictory evidence.

## 6. Disagreements

1. I disagree with treating runs `31870375328`, `31871488924`, and
   `31872660877` as acceptance of all four current-head fixes. They accept A–C;
   by SHA and outcome they characterise the still-unfixed D leg.
2. I disagree with the current PR body saying Class D is deliberately unfixed
   and `save-and-backup.spec.ts` is byte-unchanged. That was true at `e23244a`
   and is false at `f52ccf13`.
3. I disagree only with the stated reason, not the membership, for
   `trigger-animations.spec.ts:63`: it is editor-driven and synchronised on tab
   exit, not selection-driven through line 1381.

The owner arbitrates these disagreements. This review does not change the PR
body, trigger CI, merge, rebaseline, or modify the implementation.

## Cross-check (second model)

Not performed. A second model should land its per-claim verdicts and missed
findings in a separate cross-check artifact; it must start with C6, C8, and M1's
commit-addressed evidence boundary.

## MemPalace drawer candidates

1. **Practice wing:** Acceptance evidence is commit-addressed. Before crediting
   a run to a fix, compare the run's head SHA with the load-bearing fix commit;
   a green run at an earlier SHA is characterisation, not acceptance.
2. **HAVDM project wing:** PR #144's relative-grid geometry repair is locally
   supported by algebra and repeated green runs, but the deterministic `shift`
   and `movecard` discriminators were scratch-only; keep them as candidates for
   durable test evidence after owner arbitration.
