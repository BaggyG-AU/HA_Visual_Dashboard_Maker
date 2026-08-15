# HAVDM adversarial review — PR #144 round 2 (OpenAI Codex GPT-5)

**Reviewer:** OpenAI Codex (GPT-5), independent reviewer, 2026-08-15

**Scope:** PR #144, `feature/stabilise-ci-unstable-tests`, `main..HEAD`
(`ae4cbdf3..632587e`), everything changed under `tests/`

**Reviewer write restrictions (acknowledged):** no `src/` change, merge,
manifest change, `[STATE]` update, UAT re-score, or Home Assistant action.
Findings are recorded only here.

## 1. Verdict

**CHANGES-REQUIRED**

The load-bearing settle helper can return while a card is still moving. The
actual current `CanvasDSL` returned 92 ms into a four-second transition with
9.87 px still to travel, so the current control does not close the whole timing
class. The PR body also contradicts itself about whether Class D is accepted.
Those are merge-blocking. Classes A–C were not changed by the round-two repair,
and no new defect was found in them.

## 2. Findings, most severe first

### M1 — merge-blocking: rounded equality can report a false settle

**Source:** `tests/support/dsl/canvas.ts:285-303`. The helper rounds every axis,
counts three equal keys 32 ms apart, and returns the third raw reading. Its
contract says this means the grid has “STOPPED MOVING” at
`tests/support/dsl/canvas.ts:215` and says a permanently animating canvas cannot
return cleanly at `:245-248`. Neither statement follows from the algorithm.

I bundled the current `CanvasDSL` directly from this checkout and invoked
`getCardRectsRelativeToGridSettled()` against a real Chromium page. One grid
item travelled 10 px under `transition: transform 4s linear`. The result was:

```text
elapsed at return:        92 ms
returned relative x:     0.12511062622070312
animation count:         1
animation play state:    running
true final relative x:   10
residual after return:   9.874889373779297 px
```

The three rounded samples all occupied the same integer bucket even though the
box was moving. The remaining 9.87 px is well beyond the unchanged ±2 px
comparison at `tests/e2e/save-and-backup.spec.ts:267-272`. This is the required
second hostile construction; it is distinct from the author's delayed
transition, and it fails the current implementation rather than merely arguing
that a failure is possible.

I repeated the call with a 10 px, four-second `linear infinite alternate` CSS
animation. It returned after 86 ms at x=0.16674041748046875 while Chromium still
reported the infinite animation as `running`. That directly falsifies the
“permanently animating canvas cannot read as a clean pass” claim at
`tests/support/dsl/canvas.ts:247-248` as well as demonstrating the finite
load-bearing residual above.

**Class and population swept:** the behaviour is “rounded geometric stability
is treated as proof that a layout animation has ended.” The population source
was every call to `getCardRectsRelativeToGridSettled` plus every current-head
claim that it means “stopped”:

- the one implementation at `tests/support/dsl/canvas.ts:270-317`;
- both load-bearing samples at
  `tests/e2e/save-and-backup.spec.ts:212,265`;
- the controls' setup and explicit settle at
  `tests/e2e/card-geometry-discriminators.spec.ts:128,426`;
- the durable control's stated guard at
  `tests/e2e/card-geometry-discriminators.spec.ts:14,389,460-465`;
- the repo-external PR-body claims at lines 132–135. A claim member can live in
  the PR body even though it is not a repository file.

The existing three-second control moves hundreds of pixels and therefore
crosses rounded buckets between samples until it reaches its endpoint. It
proves that the helper beats one fast-enough animation; it cannot fail against
slow travel within a bucket and therefore is not a guard for the whole class.

**Required before merge:** make return contingent on an observation that the
slow-travel construction cannot satisfy—for example, no relevant grid/item
geometry animation is pending or running in addition to geometric stability—and
add a durable slow-travel control that is red against the current helper. Size
the construction to finish inside the helper's budget and prove the amplifier
and animation state are live. Because this changes the load-bearing helper,
Class D acceptance must restart at that new commit and be read per attempt.

**Must not change:** the grid-relative arithmetic at
`tests/support/dsl/canvas.ts:276-283`, the ±2 px tolerance, the exact saved
`_havdm_layout` assertion, Classes A–C, `src/`, or the expected-failures
manifest. Do not widen a tolerance or baseline this timing hole.

### M2 — merge-blocking claim surface: the current PR body contains mutually exclusive facts

**External source:** PR #144 body lines 202–209 records three first-attempt
passes at `9932eef` and declares Class D accepted; lines 224–226 repeats that
the acceptance is deliberately split; lines 237–239 then says acceptance
“stands at 0 of 3.” Both cannot describe the current head. The downloaded
reports resolve the conflict: runs `31878624582`, `31880748615`, and
`31881906972` all ran at full SHA
`9932eef027e86684c86454e344308f44c3f16356`, and `Expected 3` passed on attempt
0 in all three. The truthful pre-M1 count is 3 of 3.

Two more current-head claims in the same surface need correction:

- PR-body lines 132–135 say the helper cannot return cleanly for a permanently
  moving canvas. M1 demonstrates the false-settle route in the actual helper.
- Lines 224–226 say `632587e` changes only
  `card-geometry-discriminators.spec.ts`. `git diff --name-status
  9932eef..632587e` enumerates three paths: that file,
  `tests/e2e/save-and-backup.spec.ts`, and
  `tests/support/dsl/canvas.ts`. The latter two changes are comment-only, so the
  acceptance inference remains valid, but the universal “only” is literally
  false.

**Class and population swept:** the class is “a current-head factual statement
on the public PR claim surface.” The population source was the complete
268-line body returned by `gh pr view 144`, all ten cited run rows, the named
commit diffs, and the corresponding `merged-results.json` files. This sweep
explicitly included repo-external CI artifacts and the PR body. Apart from the
contradictions above, the run/head/attempt claims in the acceptance table agree
with the artifacts.

**Required before merge:** rewrite the body to have one current-head acceptance
state, remove the false animation guarantee, and describe `632587e` as a
runtime-test-code-neutral change rather than a one-file change. After M1 is
fixed, update the body again from the new commit-addressed runs.

**Must not change:** do not edit source or tests merely to make a stale body
true, and do not treat a retry-assisted disposition or an overall red workflow
conclusion as the identity result.

### N1 — non-blocking: `Expected 3` is not the only test in the commissioned geometry-across-time population

**Source:** `tests/e2e/canvas-resize-and-nesting.spec.ts:94-111` samples a
`.react-grid-item` width before and after a drag and compares the two without
using either canvas rectangle helper. That is a direct answer to Attack 4's
question: a member exists outside the helper.

Using the commission's broad behavioural definition—“a test compares card
geometry across two moments”—the full non-control population I found is:

1. `tests/e2e/save-and-backup.spec.ts:212,265-272`: compares four rendered
   rectangle axes for preservation across save/reload.
2. `tests/e2e/canvas-resize-and-nesting.spec.ts:94-111`: compares rendered card
   width before/after a resize.
3. `tests/e2e/sections-canvas.spec.ts:281-310`: compares a card's logical column
   span before/after a resize.
4. `tests/e2e/sections-canvas.spec.ts:341-396`: repeats that outcome for a card
   whose handle was revealed without selection.
5. `tests/e2e/sections-canvas.spec.ts:434-461`: compares logical column and row
   spans before/after precise controls.

The population source was a repository-wide search for the canvas rectangle
helpers, `getBoundingClientRect`, Playwright `boundingBox`, and the section
cards' `data-grid-columns`/`data-grid-rows`, followed by behavioural
classification. The three visual specs with two `boundingBox()` calls are
non-members: each box defines an independent screenshot clip and the boxes are
never compared. One-instant hit tests and
`CanvasDSL.expectNoOverlappingCards()` are also non-members. The discriminator
file is test instrumentation and was enumerated separately, not silently mixed
into the behavioural population.

There is **no implementation change required** for the four additional
members. The flat-canvas resize compares width only after a 700 ms post-drag
wait (`canvas-resize-and-nesting.spec.ts:108-111`), so viewport-origin movement
cannot affect the property and the shipped 200 ms transition has elapsed. The
three Sections Canvas tests compare logical grid attributes and poll their
post-action values. `Expected 3` remains the only member of the narrower defect
class “the same rendered flat-grid rectangles must survive save/reload.” The
population claim, not those tests, needs narrowing.

**Must not change:** do not mechanically convert property-specific resize or
Sections Canvas assertions to the new helper.

## 3. Explicit results of the six commissioned attacks

### Attack 1 — can the settle guard return a false settle? — finding M1

Yes. The actual current helper returned 92 ms into a four-second, 10 px linear
transition while Chromium reported one `running` animation and 9.87 px remained.

### Attack 2 — does settling mask a real regression? — no issue found

The helper settles on whatever geometry exists; it does not poll for the
caller's desired answer (`tests/support/dsl/canvas.ts:292-309`). A stably wrong
save first fails the exact `_havdm_layout` predicate at
`tests/e2e/save-and-backup.spec.ts:231-248`. A stably wrong render that retains
plausible saved data reaches the independently settled `after` sample and fails
the indexed x/y/w/h comparison at `:264-272`. Settling can add timing error via
M1, but it cannot make a stable geometry difference satisfy those assertions.

### Attack 3 — do all four controls fail against their wrong implementation? — no guard gap found

The unmodified current-head file passed 4/4 with one worker and retries
disabled. The two requested source mutations were run in a detached worktree:

| Wrong implementation | Control 1 | Control 2 | Control 3 | Control 4 |
| --- | --- | --- | --- | --- |
| bare relative helper returns viewport x/y | **FAIL**, 64 px | pass | pass | **FAIL**, 344 px |
| bare helper subtracts each card's own origin | pass | **FAIL**, 0 vs 57 px | pass | **FAIL**, red leg became 0 px |

Control 4's additional failures are collateral and truthful: it deliberately
compares bare samples with the independently implemented settled sample, so
mutating only the bare helper makes those coordinate spaces disagree or kills
the red instrument. The commissioned primary discriminators still behave as
claimed: control 1 rejects viewport coordinates while control 2 and 3 pass;
control 2 rejects per-card-origin cancellation while controls 1 and 3 pass.

For control 3, the relevant wrong implementation is a serializer that omits the
placed card's `_havdm_layout`. Its positive leg requires the real save to carry
the key and numeric x/y/w/h at
`tests/e2e/card-geometry-discriminators.spec.ts:349-368`; its mutation deletes
that whole key and requires the same predicate to throw at `:370-382`. Thus the
one named persistence guard has one live mutation covering all four asserted
fields.

For control 4, the relevant wrong implementation is the former bare sample.
Replacing its settled call at
`tests/e2e/card-geometry-discriminators.spec.ts:426` with the bare helper made
the control fail by 437.34442138671875 px at `:463-465`. Its `worst` calculation
reads x, y, w, and h at `:439-448`, matching the four axes asserted by the
load-bearing comparison.

One malformed mutation setup that also changed the absolute helper was detected
from its diff and discarded before drawing a result; the table contains only
the correctly isolated runs.

### Attack 4 — the population — finding N1; no additional implementation defect found

The commissioned broad class has five behavioural members, not one, and the
flat-canvas resize member directly reads `getBoundingClientRect()` outside the
DSL helper. After classifying those members by the property they assert, only
the save/reload equality test needs grid-relative settled rectangles. N1 records
the population correction without prescribing irrelevant conversions.

### Attack 5 — the current-head claim surface — finding M2

All ten run IDs in the acceptance table were checked against their API
`head_sha`, then each of the five identities was read per attempt from the
downloaded merged report. The run table is accurate; the prose beneath it is
not. It simultaneously says 3/3 and 0/3, makes a false one-file claim for
`632587e`, and overstates the settle helper's guarantee.

### Attack 6 — duplicated persisted-layout predicate — no correctness issue found

The copies at `tests/e2e/save-and-backup.spec.ts:231-248` and
`tests/e2e/card-geometry-discriminators.spec.ts:349-365` currently assert the
same three-card precondition and numeric x/y/w/h object. Control 3 applies its
negative mutation to the same local predicate it applies to the real output, so
the duplication does not create a false green today.

The original sequencing reason held: extracting during the three acceptance
runs would have changed the load-bearing test and restarted evidence. M1 now
forces a new load-bearing commit and acceptance cycle anyway, so extraction in
that same patch would be a sensible way to retire the consistency surface. I do
not make it a separate merge requirement: the current duplication is explicit,
exact, and protected by a live negative leg. If it is extracted, its semantics
and control-3 mutation must remain unchanged.

## 4. Commit-addressed CI evidence

`FAIL` means every attempt failed; `FLAKY` means attempt 0 failed before a retry
passed. These are identity results from `merged-results.json`, not aggregate
workflow conclusions.

| Run | Full-run head | Bubble A | Gauge A | Theme B | YAML C | Save D |
| --- | --- | --- | --- | --- | --- | --- |
| `31870375328` | `e23244a4` | pass `0` | pass `0` | pass `0` | pass `0` | pass `0` |
| `31871488924` | `e23244a4` | pass `0` | pass `0` | pass `0` | pass `0` | **FAIL `0,1,2`** |
| `31872660877` | `e23244a4` | pass `0` | pass `0` | pass `0` | pass `0` | pass `0` |
| `31875022180` | `f52ccf13` | pass `0` | pass `0` | pass `0` | pass `0` | pass `0` |
| `31876211967` | `f52ccf13` | pass `0` | pass `0` | pass `0` | pass `0` | **FLAKY `0`, pass `1`** |
| `31877420011` | `a1e628ef` | pass `0` | pass `0` | pass `0` | pass `0` | **FLAKY `0`, pass `1`** |
| `31878624582` | `9932eef0` | pass `0` | pass `0` | pass `0` | pass `0` | pass `0` |
| `31880748615` | `9932eef0` | pass `0` | pass `0` | pass `0` | pass `0` | pass `0` |
| `31881906972` | `9932eef0` | pass `0` | pass `0` | pass `0` | pass `0` | pass `0` |
| `31883429764` | `632587e2` | pass `0` | pass `0` | pass `0` | pass `0` | pass `0` |

The settle implementation is carried by `9932eef`; all three acceptance rows
therefore address the right commit. `a1e628e` changes only the round-one review
document relative to `f52ccf1`, so its Save failure characterises the same
pre-settle test code. At `31881906972`, controls 1 and 2 failed attempts 0, 1,
and 2 while controls 3 and 4 passed attempt 0. At current-head run
`31883429764`, all four controls passed attempt 0.

These facts validate the author's commit-addressed acceptance reasoning for the
implementation that exists now. They do not accept a future M1 repair: any such
repair needs evidence at its own head SHA.

## 5. Independent reruns required by `OPERATING_AGREEMENT.md` §3.5

All Playwright commands ran at `632587e2928915a70be658acaf75ee55fd3cbe36`
with one worker and retries disabled.

```text
./tools/test-headless.sh tests/e2e/card-geometry-discriminators.spec.ts
  --project=electron-e2e --workers=1 --retries=0
result: 4 passed (45.0s)

./tools/test-headless.sh tests/e2e/save-and-backup.spec.ts
  --project=electron-e2e --workers=1 --retries=0
  --grep "Expected 3: re-reading" --repeat-each=11
result: 11 passed (2.2m)

./tools/checks
real exit: 0; lint completed with warnings and no errors; formatting and
typecheck passed; 1,413 tests passed in 104 files
```

The 11-repeat run is strictly deeper than the author's nine published local
measurements on the flakiest mechanism and the prior review's ten-repeat run.
It is useful current-head evidence, but it cannot detect M1 because the normal
200 ms transition moves too quickly for the hostile rounded-bucket alias.

Mutation reruns used the same test wrapper, one worker, and no retries. Their
expected non-zero exits are evidence that the controls are red, not check
failures to be laundered.

## 6. Scope and evidence boundary

- `HEAD`, `origin/feature/stabilise-ci-unstable-tests`, and the PR head all
  resolved to `632587e2928915a70be658acaf75ee55fd3cbe36`; `main` and the merge
  base resolved to `ae4cbdf3d3fc36825061175349f83b4816b35a57`.
- `main..HEAD` contains 21 files, 1,273 insertions, and 29 deletions. The
  expected-failures manifest and `src/` both have empty diffs.
- I read the round-one review first, the complete `main..HEAD` test diff, the
  current PR body, the changed commits, and all ten cited merged reports.
- I did not run the full Playwright suite; the operating agreement expressly
  asks for the load-bearing spec, one deeper repeat, and `./tools/checks`
  instead. I did not trigger a GitHub workflow.
- I did not reproduce the original CI failure as a local instance. The
  false-settle measurement is a second hostile class amplifier. It uses the
  actual bundled `CanvasDSL` in standalone headless Chromium, not a live HAVDM
  grid, so it proves the helper's algorithmic false return and not the natural
  frequency of that timing under the shipped 200 ms transition.
- I did not run an installer, connect to Home Assistant, alter a UAT score,
  inspect or edit `[STATE]`, merge, or change the manifest.
- MemPalace remained unreachable (`Transport closed`). No MemPalace read or
  write is claimed. The applicable rules were supplied verbatim by the
  commission.

## 7. MemPalace drawer candidates

These are candidates only; none was filed because MemPalace was unreachable.
If accepted, file with `added_by="codex"` under MP-LEASE and index it in the
same pass.

1. **Rounded sample equality is not proof that motion ended.** Attack a settle
   guard with slow travel that remains inside one rounded bucket for all required
   samples, then record animation state at return and the eventual residual.
2. **State broad review populations literally.** If the class is “any geometry
   comparison across moments,” enumerate direct DOM measurements and logical
   geometry attributes outside the new helper; narrow the class only after that
   enumeration.
3. **Derive acceptance prose from one commit-addressed result table.** A body
   that separately hand-maintains a headline and a trailing count can truthfully
   show 3/3 in one place and falsely show 0/3 in another.
