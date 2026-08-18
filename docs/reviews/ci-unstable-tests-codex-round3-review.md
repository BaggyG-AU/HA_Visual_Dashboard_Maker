# HAVDM adversarial review — PR #144 round 3 (OpenAI Codex GPT-5)

**Author:** BaggyG-AU with Claude Opus 5, 2026-08-16

**Reviewer:** OpenAI Codex (GPT-5), independent reviewer, 2026-08-16

**Owner gate:** owner arbitration of the findings; this document decides nothing
on its own.

**Scope:** PR #144, `feature/stabilise-ci-unstable-tests`, `main..HEAD`
(`ae4cbdf3..73c174d`), everything changed under `tests/`

**Reviewer write restrictions (acknowledged):** no `src/` change, merge,
manifest change, `[STATE]` update, UAT re-score, or Home Assistant action.
Findings are recorded only here.

## 1. Verdict

**CHANGES-REQUIRED**

The exact round-2 `transform` creep is fixed, the five committed controls are
green, Class D's identity/control results are clean in three current-head CI
runs, and the required local reruns are green. The replacement animation gate
is nevertheless keyed to the wrong population: it classifies five property
names over the whole grid subtree, rather than classifying animations on the
boxes whose geometry the helper returns.

That mismatch fails in both directions in the actual current helper. A direct
grid item's 200-second standalone `scale` transition returned after 72 ms with
9.997 px of width still to travel, while a 200-second decorative descendant
`transform` transition held perfectly stable card geometry open until the
default 5 s timeout. This is not closed by declaring the allowlist residual.
The helper is shared, its contract tells future tests to use it for comparisons
across time, and nothing enforces the one current Electron state used to argue
that the hole is unreachable.

## 2. Prior-finding disposition

The commission supplies rounds 1 and 2 as settled ground. I did not re-derive
the Class A–C populations or the already accepted controls. I checked the
round-2 repair as new work and obtained this disposition:

| Prior finding                                | Round-3 disposition      | Basis                                                                                                                                  |
| -------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Round 1 M1 — commit-addressed acceptance     | **RESOLVED**             | all cited heads and per-attempt results agree with the current body; three additional runs are at `73c174d` itself                     |
| Round 1 N1 — durable Class D controls        | **RESOLVED**             | five controls are now committed and passed locally and on all three current-head runs                                                  |
| Round 1 N2 — Trigger reason                  | **RESOLVED AS SUPPLIED** | no round-3 change touches that disposition                                                                                             |
| Round 2 M1 — rounded equality false settle   | **PARTLY RESOLVED**      | the exact `transform` construction is held to completion, but finding M1 below measures the replacement gate's wider population defect |
| Round 2 M2 — contradictory PR body           | **RESOLVED**             | the current body has one current-head acceptance state and its run table matches the artifacts                                         |
| Round 2 N1 — geometry-across-time population | **ACCEPTED**             | the four deliberately unfixed members have sound dispositions; Attack 4 below records why                                              |

## 3. Finding, most severe first

### M1 — merge-blocking: the animation gate classifies properties over the wrong DOM population

**Source.** The helper returns rectangles only for direct grid items at
`tests/support/dsl/canvas.ts:343-350`. Its gate instead calls
`grid.getAnimations({ subtree: true })` over every descendant and accepts only
five `transitionProperty` strings at `tests/support/dsl/canvas.ts:372-386`.
The loop treats that result as proof of settlement at
`tests/support/dsl/canvas.ts:395-404`.

The public contract is broader than that algorithm. It says to use the helper
whenever a relative rectangle is one half of a comparison across moments at
`tests/support/dsl/canvas.ts:215-218`, and still says that a permanently
animating canvas cannot return cleanly at
`tests/support/dsl/canvas.ts:245-248`. The latter is directly contradicted by
the declared residual at `tests/support/dsl/canvas.ts:285-335` and by the
measurement below. The comment that filtering to layout properties prevents a
decorative animation from holding the helper open at
`tests/support/dsl/canvas.ts:367-371` is also false for a decorative descendant
transition on `transform`.

**Measured false settle — Attack 1's third construction.** I imported the
current `CanvasDSL` source and ran it against a real headless Chromium page
with one direct `.react-grid-item`. The live negative/positive pair was:

| Construction                                                  |    Return | Animation at return                                     |                       Residual |
| ------------------------------------------------------------- | --------: | ------------------------------------------------------- | -----------------------------: |
| direct item, `transition: transform 4s linear`, 10 px         |  4,505 ms | none                                                    |                           0 px |
| direct item, `transition: scale 200s linear`, 100 px → 110 px | **72 ms** | `CSSTransition`, `running`, `transitionProperty: scale` | **9.997 px width; 4.998 px x** |

The `transform` row is the liveness control: the same helper and harness hold a
property admitted by `LAYOUT_PROPS` to completion. The `scale` row is not a dead
mutation: Chromium reported the transition running at return, and forcing that
same animation to its endpoint produced the 110 px truth rectangle. Its
residual is almost five times the unchanged ±2 px assertion at
`tests/e2e/save-and-backup.spec.ts:267-271`.

This construction is distinct from the two spent constructions: it is neither
the author's delayed 640 px `transform` nor round 2's 10 px `transform` creep.
It attacks the current property allowlist itself. It also confirms the author's
broader declaration that a transition on another box-moving property can pass;
declaration is credit for an honest boundary, not closure of it.

**Measured false timeout — Attack 3's converse.** On a second real Chromium
page I left the direct grid item's 100 × 100 px rectangle completely unchanged
and put a decorative child under it through
`transition: transform 200s linear`. The current helper threw after **5,042
ms**:

```text
card geometry never held still for 3 consecutive samples within 5000ms
last reading [[0,0,10000,10000]]
```

The direct item's before and after rectangles were exactly equal. At the throw,
Chromium reported one running `CSSTransition`, targeted at the `.decorative`
descendant, with `transitionProperty: transform`. Thus the gate can ignore real
motion of a measured box because its property is absent and block on motion
that cannot change any measured box because its property is present.

**Class and population swept.** The behavioural class is “animation state used
as authority for whether the exact rectangles returned by the helper are still
moving.” I checked:

- the grid and direct `.react-grid-item` nodes whose boxes are read;
- deeper descendants admitted only by `{ subtree: true }`;
- admitted and omitted CSS transition properties (`transform` and `scale`);
- the already declared keyframe and `requestAnimationFrame` routes;
- the hundredth-pixel key and the ordering of `read()` before `stillMoving()`;
- every current call site: the two load-bearing Save samples and the control
  file's ground-truth/mutation calls.

The read and gate execute synchronously within one browser task, so I found no
separate script-interleaving defect between them. Nested grid items are not in
the load-bearing population: both the bare and settled helpers deliberately
return only `:scope > .react-grid-item`. The defect is the animation
population, not the rectangle population.

**Why the declared residual must close before merge.** The current Save fixture
uses the react-grid-layout transition that the allowlist admits, and the
current-head runs show that one state behaving correctly. That does not enforce
the reachability claim. A future caller of this shared DSL helper needs only a
card wrapper with standalone `scale`, a keyframe, or a long decorative
descendant transition to obtain one of the measured wrong answers above. The
helper's own broad usage instruction actively invites that caller. I therefore
do require closure before merge; another residual paragraph is not sufficient.

**Required fix and closing checks.** Align the animation population with the
geometry population. The gate must reason about animations targeting the grid
and the direct item wrappers it measures, instead of accepting a five-name
allowlist anywhere in the subtree. It must separately dispose of keyframes and
the declared `requestAnimationFrame` route, either through an authoritative
readiness signal or by narrowing the helper's API and contract to the specific
react-grid-layout mechanism it can actually certify.

Add two separate durable controls, each proven red against this head:

1. a direct measured item's slow standalone `scale` must not return before the
   final rectangle;
2. a descendant's long decorative `transform` transition must not prevent a
   stable direct item from settling.

One control cannot prove both directions: an assertion of early return cannot
detect a false timeout, and a timeout control cannot detect a false settle.
Restart Class D acceptance at the commit carrying the load-bearing repair and
read the identities per attempt.

**What must NOT change.** Do not change the grid-relative arithmetic at
`tests/support/dsl/canvas.ts:343-350`, the ±2 px tolerance, the exact saved
`_havdm_layout` assertion, Classes A–C, `src/`, the expected-failures manifest,
or the four deliberately unfixed geometry-population members merely to close
this finding.

## 4. Explicit results of the seven commissioned attacks

### Attack 1 — break the settle guard a third time — finding M1

**Broken.** A direct item's 200-second standalone `scale` transition returned
after 72 ms with 9.997 px of width still to travel. The 4-second `transform`
control held for 4,505 ms and returned at zero residual, proving the harness and
animation route were live. I also considered the hundredth-pixel bucket,
read/gate ordering, non-string `transitionProperty`, and non-direct items; no
additional current-route defect was found beyond the target/property mismatch
reported in M1.

### Attack 2 — judge the declared residual — finding M1

**Closure required before merge.** “react-grid-layout uses transitions” is true
of the measured current dependency state and is not an enforced property of
the shared helper. The code itself declares CSS keyframes, rAF creep, and other
box-moving transitions invisible at `tests/support/dsl/canvas.ts:285-335`.
The measured `scale` false settle shows what a future caller must do to enter
the hole; the answer is one CSS declaration. M1 states the closing checks.

### Attack 3 — hang or mask introduced by the animation gate — finding M1

**False timeout found; no independent mask found.** A long decorative
descendant `transform` transition exhausted the real 5 s default while every
returned card axis stayed bit-identical. I found no current source route by
which `pending === true` remains permanently stuck; the measured failure is
the broader `{ subtree: true }` population. The author's measured 0.2/0.3 s
descendant transitions fit the budget, but duration is not enforced and shared
future callers are outside the one probe.

### Attack 4 — judge the four N1 dispositions — no issue found

The three Sections Canvas members are correctly excluded. They poll logical
`data-grid-columns`/`data-grid-rows` values, not rendered pixels, at
`tests/e2e/sections-canvas.spec.ts:281-310,341-396,434-461`; a CSS transition
cannot alter the asserted state values.

The flat-canvas member at
`tests/e2e/canvas-resize-and-nesting.spec.ts:94-111` does read rendered width,
and the 700 ms wait is a coincidental current-duration guard rather than an
enforced relationship. Its assertion is nevertheless only the strict
inequality `after.w > before.w` after a deliberate 260 px resize, not
cross-moment equality within a narrow tolerance. Sampling during a monotonic
resize does not create the Save test's false-equality route. The disposition
is sound; the PR body's 700 ms/no-observed-flake reason is weaker than the
assertion-shape reason but not false.

### Attack 5 — current-head claim surface — no issue found in the PR body

I read all 16 cited run heads with `gh run view`, downloaded each artifact by
its workflow run number, and read the five named identities per attempt from
`merged-results.json`. The body table agrees with the artifacts. The three
current-head rows are all full SHA
`73c174dc3f1a28c19ca12d79d49cd74e85bba1bf`; `Expected 3` and all five
controls passed on attempt 0 in each; each population is 566 identities / 546
executed / 20 skipped.

The parser was live rather than silently empty: on the same current reports it
returned the reported `spacing` failed/passed rows and the non-compact theme
badge's failed/failed/passed, failed/failed/failed, and failed/passed outcomes.
Every workflow conclusion was `failure`, which was deliberately not used as an
identity result.

I also compared comment-only `fae0904..HEAD` mechanically and transpiled
`canvas.ts` from both endpoints with the same `esbuild` invocation; those two
outputs were byte-identical. The exact published 8,553-byte/MD5 recipe is not
included in the body, so I did not independently reproduce that particular
byte count. The current-head CI rows mean no runtime-neutrality inference is
needed for acceptance.

### Attack 6 — control 5's own stability — no correctness issue found

Control 5 takes no unsettled geometry read after starting the creep. Its
liveness assertion at
`tests/e2e/card-geometry-discriminators.spec.ts:525-528` compares final truth
with the pre-mutation rectangle and fails if the mutation does not move 10 px.
Its guard at `tests/e2e/card-geometry-discriminators.spec.ts:532-535` compares
the helper's returned rectangle with final truth, which is the right property.

`const unsettled = settled;` at
`tests/e2e/card-geometry-discriminators.spec.ts:521` is a variable named for
the opposite of its value. It is a naming wart, not evidence that the assertion
measures the wrong thing: both the code and failure message use the settled
return. Renaming it to `settledAtReturn` would improve the control's auditability
but is not a separate merge requirement.

### Attack 7 — fix-round scope — finding M1; otherwise no issue found

`fae0904` itself modifies exactly
`tests/support/dsl/canvas.ts` and
`tests/e2e/card-geometry-discriminators.spec.ts`. It preserves the bare
grid-relative arithmetic, adds the round-2 repair and one separate control, and
does not reach Classes A–C. The only load-bearing settled-helper callers are the
two Save samples at `tests/e2e/save-and-backup.spec.ts:212,265`; all bare-helper
calls are deliberate control/ground-truth readings. No bare caller was found
where the settled form is now required, or vice versa. M1 is the fix-introduced
contract/population defect; no unrelated scope expansion was found.

## 5. Commit-addressed CI evidence

`FAIL` means all attempts failed; `FLAKY` means an earlier attempt failed before
a retry passed. Results below are identity-level artifact results, not workflow
conclusions.

| Run           | Head       | Bubble A | Gauge A | Theme B | YAML C | Save D          | Class D controls                    |
| ------------- | ---------- | -------- | ------- | ------- | ------ | --------------- | ----------------------------------- |
| `31870375328` | `e23244a4` | pass     | pass    | pass    | pass   | pass            | absent                              |
| `31871488924` | `e23244a4` | pass     | pass    | pass    | pass   | **FAIL 0/1/2**  | absent                              |
| `31872660877` | `e23244a4` | pass     | pass    | pass    | pass   | pass            | absent                              |
| `31875022180` | `f52ccf13` | pass     | pass    | pass    | pass   | pass            | absent                              |
| `31876211967` | `f52ccf13` | pass     | pass    | pass    | pass   | **FLAKY 0 → 1** | absent                              |
| `31877420011` | `a1e628ef` | pass     | pass    | pass    | pass   | **FLAKY 0 → 1** | absent                              |
| `31878624582` | `9932eef0` | pass     | pass    | pass    | pass   | pass            | 4/4 attempt 0                       |
| `31880748615` | `9932eef0` | pass     | pass    | pass    | pass   | pass            | 4/4 attempt 0                       |
| `31881906972` | `9932eef0` | pass     | pass    | pass    | pass   | pass            | controls 1–2 FAIL 0/1/2; 3–4 pass 0 |
| `31883429764` | `632587e2` | pass     | pass    | pass    | pass   | pass            | 4/4 attempt 0                       |
| `31886428011` | `fae09046` | pass     | pass    | pass    | pass   | pass            | 5/5 attempt 0                       |
| `31887702971` | `fae09046` | pass     | pass    | pass    | pass   | pass            | 5/5 attempt 0                       |
| `31888958250` | `fae09046` | pass     | pass    | pass    | pass   | pass            | 5/5 attempt 0                       |
| `31928526052` | `73c174dc` | pass     | pass    | pass    | pass   | pass            | 5/5 attempt 0                       |
| `31929619479` | `73c174dc` | pass     | pass    | pass    | pass   | pass            | 5/5 attempt 0                       |
| `31930771361` | `73c174dc` | pass     | pass    | pass    | pass   | pass            | 5/5 attempt 0                       |

The populations also agree with the body: 561/541/20 through the three
relative-coordinate runs, 565/545/20 with four controls, and 566/546/20 after
control 5. Those counts are tied here to this fixed run inventory, not asserted
as a permanent suite inventory.

## 6. Required independent reruns

All commands ran at
`73c174dc3f1a28c19ca12d79d49cd74e85bba1bf`, with one worker and Playwright
retries disabled.

```text
./tools/test-headless.sh tests/e2e/card-geometry-discriminators.spec.ts
  --project=electron-e2e --workers=1 --retries=0 --reporter=line
result: 5 passed (1.1m)

./tools/test-headless.sh tests/e2e/save-and-backup.spec.ts
  --project=electron-e2e --workers=1 --retries=0
  --grep "Expected 3: re-reading" --repeat-each=13 --reporter=line
result: 13 passed (2.5m)

./tools/checks
real exit: 0; lint 0 errors / 145 warnings; formatting and typecheck clean;
1,413 tests passed in 104 files
```

Thirteen is strictly deeper than the author's published twelve-repeat run.
These greens establish current normal-path behaviour; they cannot detect M1's
omitted-property or overbroad-descendant constructions, which is why the
hostile controls are separate.

## 7. Scope and evidence boundary

- Local `HEAD`, the remote branch head, and PR #144 head all resolved to
  `73c174dc3f1a28c19ca12d79d49cd74e85bba1bf`; `main` is
  `ae4cbdf3d3fc36825061175349f83b4816b35a57`.
- `git diff --quiet main..HEAD -- src/` and the same command for
  `tests/baseline/expected-failures.json` both returned 0. Neither surface
  changed.
- I read both prior reviews first, the binding Operating Agreement §3.5, the
  complete current helper and controls, the geometry-population members, the
  repair commits, and the current PR body.
- I did not run the full Playwright suite, an installer, a packaged binary, or
  Home Assistant, and I did not trigger a GitHub workflow. The governing rerun
  scope asks for the load-bearing specs, a deeper repeat, and `./tools/checks`.
- I did not reproduce the original CI failure as a local instance. The two new
  measurements are hostile class constructions against the actual helper in
  headless Chromium; they prove its return/timeout behaviour, not the natural
  frequency of those routes in today's Save fixture.
- I did not independently repeat the author's one-state live-Electron computed
  style probe. The three current-head artifacts and local reruns cover the
  current load-bearing fixture; M1 concerns the broader shared contract that
  the probe does not enforce.
- MemPalace was readable for the required practice context in this session; no
  MemPalace write was made. No `[STATE]`, UAT, manifest, source, merge, or Home
  Assistant action was taken.

## 8. Claim ledger

| Claim                                                                      | Tag                 | Evidence                                                                                                                 |
| -------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| The current helper false-settles on a direct slow `scale` transition.      | MEASURED            | actual current `CanvasDSL` in Chromium; 72 ms return, running `scale`, 9.997 px width residual; live `transform` control |
| The current helper false-times-out on an unmeasured descendant transition. | MEASURED            | actual current `CanvasDSL` in Chromium; stable direct box, 5,042 ms throw, running descendant `transform`                |
| The current Save fixture is green at the reviewed head.                    | MEASURED            | three downloaded current-head artifacts; local 13/13 repeat                                                              |
| The residual is unacceptable for a shared helper before merge.             | JUDGEMENT           | measured entry routes plus the broad contract at `canvas.ts:215-218`; owner arbitrates                                   |
| The four N1 non-conversions are sound.                                     | MEASURED / INFERRED | three state-attribute implementations read; flat member's assertion shape and current action sequence read               |

**Weakest claim.** The merge-blocking severity is a judgement about the contract
owed by shared test infrastructure, not a claim that the current Save fixture
naturally emits `scale` or a long descendant transition. The defect is that the
helper promises and invites broader use while neither enforcing nor accurately
bounding it.

## MemPalace drawer candidates

1. **Practice wing — match a motion gate's animation population to its geometry
   population.** A property allowlist over a whole subtree can fail in both
   directions at once: ignore a measured box animated through an omitted
   property, and block on an unmeasured descendant animated through an admitted
   property. Select the effect targets first, then decide which animation facts
   are authoritative; keep separate red controls for false-settle and
   false-timeout routes.
