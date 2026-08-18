# HAVDM adversarial review — PR #144 round 4 (OpenAI Codex GPT-5)

**Author:** BaggyG-AU with Claude Opus 5, 2026-08-17

**Reviewer:** OpenAI Codex (GPT-5), independent reviewer, 2026-08-17; the
reviewer did not author this branch

**Owner gate:** owner arbitration of the findings; this document decides nothing
on its own.

**Scope:** PR #144, `feature/stabilise-ci-unstable-tests`, `main..HEAD`
(`ae4cbdf3..f78af0d`), everything changed under `tests/`, with round 4 focused
on `8b8dae9` and `f78af0d`.

**Reviewer write restrictions (observed):** no `src/` change, merge, manifest
change, `[STATE]` update, UAT re-score, or Home Assistant action. This review is
the only repository file changed by the reviewer.

## 1. Verdict

**CHANGES-REQUIRED**

The round-3 measured-target repair closes its two named routes, and control 8
closes the pseudo-element false timeout that `8b8dae9` introduced. The three
current-head CI reports also support the narrow claim that FILE-05 Expected 3
and all eight committed controls passed on attempt 0 at `f78af0d`.

The repaired helper still does not satisfy its shared “stopped moving”
contract:

1. an animation on an **ancestor** of the grid is absent from
   `grid.getAnimations({ subtree: true })` even when it changes every returned
   rectangle;
2. `visibility` is not universally non-geometric, while a paint-only
   `clip-path` transition is omitted and causes a false timeout;
3. `getKeyframes()`'s mandatory `computedOffset` metadata is mistaken for an
   animated CSS property, so even a deny-listed opacity keyframe blocks;
4. the declared `requestAnimationFrame` route still returns mid-flight under
   the helper's broad public contract; and
5. the helper docblock and PR body still describe the superseded five-property
   allowlist, while the body misidentifies two current-run failures as
   baselined identities.

The first, second and fourth items produced false settles in the actual bundled
current helper. The third and the omitted-property half of the second produced
false timeouts. Normal-path greens cannot detect those constructions.

## 2. Findings, most severe first

### M1 — merge-blocking: the target population excludes ancestor animations that change the returned rectangles

**Source:** `tests/support/dsl/canvas.ts:343-350,417-436`. `read()` returns the
direct items' viewport `DOMRect`s relative to the grid's viewport origin. The
gate, however, can see only animations returned by
`grid.getAnimations({ subtree: true })`, then further restricts targets to the
grid and its direct items. An effect on an ancestor of the grid is outside both
populations even when its transform is accumulated into every descendant
`DOMRect`.

I bundled the current `CanvasDSL` from this checkout with esbuild and ran it
unchanged in headless Chromium. The page had a 300 × 200 px grid and a direct
100 × 80 px item at `(20, 30)`. A wrapper **outside** the grid ran
`transition: scale 200s linear` from `1` to `1.1`; two animation frames were
allowed before the call so this was not a not-yet-started mutation.

| Observation                                                        |                                         Value |
| ------------------------------------------------------------------ | --------------------------------------------: |
| ancestor animation seen by `grid.getAnimations({ subtree: true })` |                                           `0` |
| return time                                                        |                                     **77 ms** |
| ancestor animation at return                                       |          `running`, `currentTime = 83.316 ms` |
| returned item                                                      | `x 20.0007, y 30.0010, w 100.0033, h 80.0027` |
| forced endpoint                                                    |                     `x 22, y 33, w 110, h 88` |
| residual at return                                                 |   `x 1.9993, y 2.9990, w 9.9967, h 7.9973 px` |

Three axes exceed the unchanged ±2 px assertion at
`tests/e2e/save-and-backup.spec.ts:267-271`. This is not the round-3 direct-item
`scale` construction: the property is now correctly treated as possibly
geometric, but the browser query never returns the animation because its target
is outside the grid subtree.

**Class and population swept.** The behavioural class is “effect targets whose
animation can alter any axis returned by `read()`.” I checked the grid itself,
direct items, deeper and matching-but-non-direct descendants, pseudo-elements,
nested grids, a null effect target, and ancestors. I also checked an item
added/removed around a sample and style-resolution timing: `read()` and
`stillMoving()` are synchronous in one browser task, `getBoundingClientRect()`
forces style/layout, and the measured set is rebuilt after every read. No
separate interleaving defect was found there. Pure ancestor translation cancels
in the relative arithmetic; ancestor scale does not.

**Required before merge:** either observe every source of motion that the broad
contract promises to exclude—including geometry-affecting ancestor effects—or
narrow and enforce the contract to the specific react-grid-layout transition
mechanism this helper can certify. Add a durable ancestor-scale false-settle
control that is red against `f78af0d`; a direct-item control cannot detect this
population omission.

**Must not change:** do not change the grid-relative arithmetic, the ±2 px
tolerance, the exact `_havdm_layout` assertion, Classes A–C, `src/`, the
expected-failures manifest, or the four accepted geometry-population
non-conversions.

### M2 — merge-blocking: the deny-list is wrong in both directions

**Source:** `tests/support/dsl/canvas.ts:394-415,472-480`. The code treats each
of the following 20 names as proof that an animation cannot change relevant
geometry:

| Deny-list population                                                                            | Adversarial result                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `opacity`, `color`, `background`, `background-color`, `background-image`, `background-position` | stacking/paint and writing-mode/replaced-element probes found no border-box construction                                                                                                    |
| `box-shadow`, `text-shadow`, `border-color`, `outline-color`                                    | paint-only in the tested box contexts; no border width is named                                                                                                                             |
| `outline`                                                                                       | no box/reflow construction; the CSS UI specification excludes `outline-offset` from this shorthand and says outlines do not influence box position or size                                  |
| `fill`, `stroke`                                                                                | no HTML/SVG border-box construction found; the names do not include stroke width                                                                                                            |
| `filter`, `backdrop-filter`                                                                     | no target-box construction found; filter creates a stacking context/containing block but the current react-grid-layout container already establishes the positioned items' containing block |
| `cursor`, `z-index`, `caret-color`, `accent-color`                                              | pointer/stacking/paint probes found no border-box construction                                                                                                                              |
| `visibility`                                                                                    | **broken:** `collapse` has formatting-context-specific layout effects                                                                                                                       |

The standards cross-check matters for the two tempting edge cases. The
[CSS UI outline definition](https://www.w3.org/TR/css-ui-4/#outline-props)
says an outline does not influence a box's position or size and deliberately
excludes `outline-offset` from the shorthand. The
[Filter Effects definition](https://www.w3.org/TR/filter-effects-1/#FilterProperty)
says filter does not affect the target's CSS-box geometry, while separately
creating a containing block for positioned descendants. Stacking-context
creation by opacity, filter or z-index changes paint order, not a measured
border box.

`visibility` is different. The
[CSS Display definition](https://www.w3.org/TR/css-display-3/#visibility)
states that `collapse` can take less space in table and flex formatting
contexts. In current Chromium I made a direct
`tbody.react-grid-item` child of `table.react-grid-layout` transition from
`visible` to `collapse` over 200 seconds. The actual current helper returned in
75 ms with the running `CSSTransition` ignored and a 300 × 80 px item. Forcing
the endpoint produced the same item at 300 × **0** px. This construction is not
the present app's div-based react-grid-layout DOM; it falsifies the broader
“provably non-geometric” judgement and is reachable by a future shared-helper
caller because neither tag nor formatting context is enforced.

The inverse error is live too. A measured 100 × 80 px item under
`transition: clip-path 200s linear` kept exactly the same four returned axes,
but `clip-path` is absent from the deny-list. With a 500 ms budget, the current
helper threw after **531 ms** while the `clip-path` transition was still
running. `clip-path` is one sample from the external browser/CSS property
population, not a claim that it is the only safe omission.

**Required before merge:** remove `visibility` as an unconditional
non-geometric property or enforce the exact RGL formatting context that makes
the narrower judgement true. Decide how the contract treats paint-only
properties absent from the list; if generic false timeouts are not part of the
contract, cover `clip-path` and the browser-expanded background longhands with
red controls rather than extending the list from memory.

**Must not change:** do not convert the deny-list defect into a geometric
allowlist over the whole subtree; that is the round-3 defect. Preserve the
measured-target exclusions for ordinary descendants and pseudo-elements unless
the contract itself is deliberately narrowed.

### M3 — merge-blocking: `computedOffset` makes every keyframe look geometric

**Source:** `tests/support/dsl/canvas.ts:454-480`. The loop excludes `offset`,
`easing`, and `composite`, but not `computedOffset`. The Web Animations
[`getKeyframes()` result schema](https://www.w3.org/TR/web-animations-1/#dom-keyframeeffect-getkeyframes)
requires all four metadata members, with `computedOffset` present and non-null
on every returned frame.

Chromium returned these keys for `Element.animate([{ opacity: 1 },
{ opacity: 0.2 }], ...)` on a measured direct item:

```text
offset, easing, composite, opacity, computedOffset
```

The code converts `computedOffset` to `computed-offset`, which is not on
`NON_GEOMETRIC`; the deny-listed `opacity` therefore cannot make the animation
returnable. With a 500 ms helper budget, the box remained exactly
`[20,30,100,80]`, the opacity animation remained running, and the helper threw
after **534 ms**.

The wider property-oracle sweep found:

- WAAPI `background` stays a shorthand, but is still defeated by
  `computedOffset`.
- A CSS `background` keyframe expands to `background-origin`,
  `background-position-x/y`, `background-repeat`, `background-size`,
  `background-attachment`, `background-clip`, `background-color`, and
  `background-image`; several paint-only longhands are also absent from the
  deny-list.
- CSS `inset` expands to `top/right/bottom/left`; `all` and custom properties
  remain unknown and conservatively block, which is the safe direction.
- Unsupported vendor-spelling probes yielded metadata-only frames. An empty
  effect yielded no frames and therefore takes the explicit conservative
  `props.length === 0` route at `:479`.
- I found no natural Chromium construction in which `getKeyframes()` threw. The
  source has no catch, so an actual throw would reject the helper immediately;
  I do not promote a monkey-patched method to a separate defect.

**Required before merge:** derive property keys from the canonical
`BaseComputedKeyframe` schema, not an incomplete hand-written exclusion, and
add separate measured-target controls: a long opacity keyframe must return
while still running, and a box-moving keyframe must block. The positive
keyframe harness row alone cannot detect the present `computedOffset` false
timeout because that metadata makes every keyframe look geometric.

**Must not change:** unknown/custom/geometric properties must continue to fail
closed; do not “fix” the timeout by ignoring every keyframe or every unfamiliar
key.

### M4 — merge-blocking judgement: the declared rAF residual is incompatible with the shared contract

**Source:** the public docblock says “STOPPED MOVING,” directs every
cross-moment geometry comparison to this helper, and says a permanently
animating canvas cannot return cleanly at
`tests/support/dsl/canvas.ts:215-218,245-248`. The authority at `:424` is the Web
Animations population; a `requestAnimationFrame` loop creates no `Animation`
object.

I re-derived the magnitude in the fixture actually used for this attack: one
100 px measured item moved 10 px over 200 seconds by updating `left` from rAF.
After two live frames, `grid.getAnimations({ subtree: true })` still contained
zero animations. The current helper returned in **71 ms** after six rAF frames,
at `left: 20.0039px`, with **10 px** left to the forced endpoint.

This is a declared residual, not a newly hidden one, but declaration does not
make the contract true. The helper is shared and its docblock actively directs
future callers to use it for every comparison across moments. I therefore
**require closure before merge**: either ask an RGL/scheduler authority that can
cover the promised population, or narrow the name/docblock and enforce the
react-grid-layout mechanism it actually certifies. “Three stable samples” may
remain a useful observation; it cannot continue to be documented as proof that
arbitrary motion stopped.

**Must not change:** do not hide this by increasing the sample count, interval,
or timeout. Slow enough rAF motion defeats every finite-resolution sampler.

### M5 — merge-blocking claim surface: current prose describes old code and misreads two artifacts

**Repository source:** `tests/support/dsl/canvas.ts:279-335` still says the
animation half is a five-name `LAYOUT_PROPS` allowlist, CSS keyframes are
invisible, descendants can hold the helper open, and other transition
properties pass. The implementation at `:394-480` is a measured-target
deny-list with keyframe inspection. Both descriptions cannot be true at HEAD.

**External source:** PR #144 body lines 136–189 repeats the superseded
allowlist/residual account. Line 364 also still says the round-2 repair needs
fresh commit-addressed runs even though the current acceptance section records
them.

The current acceptance table itself is accurate. However, PR-body lines
282–288 say run `31942396464`'s two new signals were
`e2e/attribute-display` and `e2e/card-background`, both from baselined
consistent-failure specs, and declares that an `f78af0d` regression would fire
on every run. The report actually contains:

- `e2e/icon-color.spec.ts:102`, “attribute-based icon colors persist to YAML,”
  unexpected on attempts 0/1/2; and
- `e2e/card-background.spec.ts:5`, “solid and gradient backgrounds update
  preview + YAML,” flaky across failed/failed/passed.

The manifest's attribute-display entry is the different visual identity at
`tests/baseline/expected-failures.json:84-94`. Its card-background visual entry
is another different file at `:97-106`; `card-background.spec.ts` appears at
`:175-183` only for a skipped sibling identity. Neither reported identity is a
baselined consistent failure. Non-recurrence in two later runs is useful
evidence against a deterministic regression, but it cannot prove a regression
“would fire at every run”; flaky regressions exist.

**Required before merge:** rewrite the helper docblock and the PR's Class D
mechanism/residual paragraphs from `f78af0d`, correct the two artifact
identities and the strength of their disposition, and mark historical
acceptance prose as superseded rather than leaving a live “needs runs” bullet.
Keep the current-head run table and its per-attempt results.

**Must not change:** do not edit implementation, tests, the manifest, or CI
artifacts merely to make stale prose true.

## 3. Control durability — no issue found

The behavioural population is controls 6–8 added after round 3. All three start
from settled app geometry through `makeDirty()` at
`tests/e2e/card-geometry-discriminators.spec.ts:148-153` and a second explicit
settle at `:586`, `:684`, and `:759`.

- **Control 6** proves the transition exists and reads back `2000s` at
  `:614-631`, requires the helper to throw at `:637-647`, then forces the
  endpoint and proves more than 5 px of width growth at `:649-667`.
- **Control 7** proves a descendant `transform` exists at `:689-712`, requires a
  prompt geometrically equal return at `:718-729`, and proves the descendant is
  still running after return at `:731-742`.
- **Control 8** proves a running `::before` effect with a non-null
  `pseudoElement` at `:772-794`, requires the equal return at `:796-808`, and
  proves the pseudo animation is still running at `:810-822`.

Rule 13's magnitude question was re-derived in the real fixture. The isolated
wrong-implementation run reported the scaled card at about **288 px** wide.
A 10% scale over 2000 seconds moves width by about **0.00046 px per 32 ms**,
well below the 0.005 px half-width of a hundredth-pixel rounding bucket. At the
fixed 1920 × 1080 Electron viewport enforced by
`tests/support/electron.ts:228-237`, the card cannot approach the roughly
3125 px width at which that per-sample drift reaches 0.005 px. The duration is
fixture-specific, but it has a measured order-of-magnitude margin inside this
fixture rather than merely happening to work at 288 px.

The red legs were rerun in a disposable detached worktree with one worker and
no retries:

```text
73c174d helper + current controls 6 and 7:
  exit 1; 2 failed
  control 6 returned a real ~288 px card while scale was live
  control 7 timed out after 5 s on the decorative descendant

8b8dae9 helper + current control 8:
  exit 1; 1 failed
  control 8 timed out after 5 s on the ::before animation
```

The unmodified current file passed 8/8. Each new guard therefore fails against
its own wrong implementation in the real app fixture; no durability finding is
reported for Attack 4.

## 4. Commit-addressed CI evidence

I read the six new round-4 run heads with `gh run view`, downloaded each artifact
by `github.run_number`, and walked every spec/test/result in
`merged-results.json`. `pass` below means attempt 0 passed; workflow conclusion
was `failure` in every row and was not used as an identity verdict.

| Run           | Full head   | A–C identities | Save D | Controls | Population                      |
| ------------- | ----------- | -------------- | ------ | -------- | ------------------------------- |
| `31938072618` | `8b8dae94…` | 4/4 pass       | pass   | 7/7 pass | 568 / 548 executed / 20 skipped |
| `31939325598` | `8b8dae94…` | 4/4 pass       | pass   | 7/7 pass | 568 / 548 executed / 20 skipped |
| `31940560957` | `8b8dae94…` | 4/4 pass       | pass   | 7/7 pass | 568 / 548 executed / 20 skipped |
| `31942396464` | `f78af0d9…` | 4/4 pass       | pass   | 8/8 pass | 569 / 549 executed / 20 skipped |
| `31943622937` | `f78af0d9…` | 4/4 pass       | pass   | 8/8 pass | 569 / 549 executed / 20 skipped |
| `31944880767` | `f78af0d9…` | 4/4 pass       | pass   | 8/8 pass | 569 / 549 executed / 20 skipped |

The four A–C identities are the Bubble, Gauge, Theme and YAML rows named by the
PR; Save is the fifth identity. The population totals are the report's complete
spec enumeration for these six fixed artifacts. The +1 at `f78af0d` is control
8, consistent with the commit's one added `test()`; it is not asserted as a
permanent suite count.

This validates the body's **narrow current-head identity table**. It does not
accept M1–M4: none of the eight committed controls constructs an ancestor
effect, a collapsing visibility transition, a paint-only keyframe on a measured
element, or rAF creep.

## 5. Required independent reruns

All commands ran at
`f78af0d9532a01672a60d3dff57901228e9ea9db`, with one worker and Playwright
retries disabled.

```text
./tools/test-headless.sh tests/e2e/card-geometry-discriminators.spec.ts
  --project=electron-e2e --workers=1 --retries=0 --reporter=line
result: 8 passed (1.4m)

./tools/test-headless.sh tests/e2e/save-and-backup.spec.ts
  --project=electron-e2e --workers=1 --retries=0 --reporter=line
result: 6 passed (58.7s)

./tools/test-headless.sh tests/e2e/save-and-backup.spec.ts
  --project=electron-e2e --workers=1 --retries=0 --repeat-each=15
  --grep "Expected 3: re-reading" --reporter=line
result: 15 passed (2.6m)

./tools/checks
real exit: 0; 4/4 steps; lint 0 errors / 145 warnings; formatting and
typecheck clean; 1,413 tests passed in 104 files
```

Fifteen is strictly deeper than the author's published fourteen-repeat run.
These runs establish current normal-path behaviour and control liveness; the
old/wrong implementations also pass normal local Save runs, so the greens are
not stability evidence for the hostile classes.

## 6. Explicit results of the seven commissioned attacks

### Attack 1 — deny-list — findings M2 and M3

**Broken in both directions.** `visibility: collapse` is a false-settle entry;
an omitted `clip-path` is a measured false timeout; and paint-only keyframes
cannot benefit from the list because `computedOffset` is treated as a CSS
property. I swept all 20 entries named at `canvas.ts:394-415`, including the
commission's stacking-context, writing-mode, replaced-element, filter,
visibility and outline questions. No border-box construction was found for the
other 19 entries; that failed attack is not a proof of universal safety.

### Attack 2 — target selection — finding M1; named sub-attacks otherwise found nothing

**Ancestor-scale false settle found.** A box-moving animation can target an
ancestor outside the subtree, so selecting only measured elements is not the
same as selecting every target capable of changing measured geometry. A null
target cannot affect a DOM box; the grid target is admitted; direct membership
is recomputed after each read; style is resolved by the preceding rect read;
nested and non-direct matching items are correctly excluded; and no script can
interleave between the synchronous read and gate. No second defect was found in
those named routes.

### Attack 3 — `getKeyframes()` oracle — finding M3

**Broken by standardized metadata.** `computedOffset` is mandatory and was not
excluded. Ordinary camelCase conversion worked; unsupported vendor spellings,
`all`, custom properties, and empty effects failed closed. CSS shorthands are
not portable between WAAPI and CSS animations: Chromium retained WAAPI
`background` but expanded a CSS background keyframe into longhands, several of
which the deny-list omits. No natural throwing `getKeyframes()` construction was
found.

### Attack 4 — controls 6–8 durability — no issue found

All take settled baselines, all have live mutations, and each failed against its
own isolated wrong implementation. Control 6's 2000-second duration was
re-derived at the real ~288 px card width and fixed viewport; it is below the
hundredth-pixel guard's resolution by about an order of magnitude.

### Attack 5 — declared rAF residual — finding M4

**Closure required before merge.** The actual helper returned 71 ms into a live
10 px rAF creep with no `Animation` object and 10 px outstanding. A narrower,
enforced RGL-specific contract is acceptable; the current broad shared contract
is not.

### Attack 6 — claim surface — finding M5; current-head run table otherwise verified

The helper docblock and PR mechanism/residual prose describe pre-`8b8dae9`
code. The current run table, heads, attempts, and 569/549/20 counts agree with
the artifacts, but the apparent-regression paragraph names the wrong identity
and wrongly calls both identities baselined consistent failures.

### Attack 7 — scope — no issue found

`73c174d..HEAD` changes the round-3 review document,
`tests/support/dsl/canvas.ts`, and
`tests/e2e/card-geometry-discriminators.spec.ts`; each repair commit itself
changes only the latter two test files. `src/` and
`tests/baseline/expected-failures.json` have empty `main..HEAD` diffs.

The caller population source was
`rg -n 'getCardRectsRelativeToGrid(Settled)?' tests`: the 12 settled call sites
are Save at `tests/e2e/save-and-backup.spec.ts:212,265` plus control plumbing at
`tests/e2e/card-geometry-discriminators.spec.ts:152,450,507,530,586,640,684,718,759,798`;
the seven bare call sites are control readings at `:235,241,290,297,448,453,536`.
No bare production/load-bearing caller needs conversion and no settled caller
needs reversal. A caller cannot live in a PR body or CI artifact; this test DSL
population is repository code.

## 7. Scope and evidence boundary

- Local `HEAD`, the remote feature head, and PR #144 head all resolved to
  `f78af0d9532a01672a60d3dff57901228e9ea9db`; `main` and the merge base were
  `ae4cbdf3d3fc36825061175349f83b4816b35a57`.
- `main..HEAD` contains 23 changed paths, 20 under `tests/` and the three prior
  review documents. The exact path list came from `git diff --name-status`;
  scoped `git diff --quiet` checks returned 0 for both `src/` and the baseline
  manifest.
- I read all three prior reviews first, the complete current helper and control
  file, both repair diffs, Operating Agreement §3.5, the current PR body, and
  all six new merged CI reports.
- The hostile measurements used the mechanically bundled current `CanvasDSL`
  in standalone headless Chromium. They prove the helper's algorithmic
  return/timeout behaviour, not the natural frequency of those routes in the
  current live HAVDM app. The visibility construction deliberately uses a
  selector-compatible table formatting context, not today's div-based RGL DOM.
- I did not reproduce the original CI failure locally as an instance, run the
  full Playwright suite, trigger CI, run an installer or packaged acceptance
  pass, or touch Home Assistant. The binding rerun scope is reported in §5.
- The author's n=1 reload-animation observation remains n=1. The six new CI
  artifacts are observations, not a failure-rate measurement.
- MemPalace was unavailable by commission. The supplied §0 rules were used;
  no MemPalace read or write is claimed.

## MemPalace drawer candidates

1. **Practice wing — HOLD; do not file yet.** A motion gate's effect-target
   population includes targets whose transforms or layout effects propagate
   into the observed boxes, not merely the elements whose rectangles are read.
   An ancestor scale changes descendant `DOMRect`s while being absent from the
   descendant's `getAnimations({ subtree: true })`. This is the correction to
   round 3's candidate, but the replacement mechanism has not yet survived an
   independent review, so the project's admission rule still withholds filing.
2. **Practice wing — candidate after a repaired control survives review.** When
   an API returns an open dictionary containing data plus metadata, derive the
   metadata exclusion from the API's canonical schema and keep a negative
   semantic control. Web Animations' mandatory `computedOffset` made every
   keyframe look like an unknown CSS property even though three neighboring
   metadata keys were excluded.
