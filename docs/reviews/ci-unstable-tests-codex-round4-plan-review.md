# HAVDM plan review — PR #144 settle-helper contract (OpenAI Codex GPT-5)

**Reviewer:** OpenAI Codex (GPT-5), independent plan reviewer, 2026-08-17

**Artifact reviewed:** `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md` at
`6971f08`; no implementation exists for the plan.

**Scope:** `main..HEAD` (`ae4cbdf3..6971f08`). The three commits after the
round-4 implementation head are the round-4 review and two plan commits.
`git diff f78af0d..HEAD --name-only` enumerated only
`docs/reviews/ci-unstable-tests-codex-round4-review.md` and
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md`; scoped diff checks found no
post-round-4 test change and no `main..HEAD` source change.

## 1. Verdict

**CHANGES-REQUIRED**

I accept **Option A as the engineering direction, after the plan is corrected**.
The load-bearing caller needs react-grid-layout's measured reflow to finish: the
first sample follows the insertion which starts that reflow at
`tests/e2e/save-and-backup.spec.ts:175-212`, and the second sample protects the
same rendered comparison after reload at `:250-271`. It does not need an
impossible proof that every way JavaScript and CSS can ever move a box has
stopped. Option B therefore buys an unachievable promise, while Option C retains
one.

The present Option A is not yet a faithful binding plan. Its owner part says it
will fix both false-timeout bugs, but its technical part deliberately retains the
`clip-path` class as a bounded refusal; its generic `...Settled` API name still
communicates the promise the prose narrows; and the control set can pass an
implementation that ignores every measured-target keyframe. The plan also leaves
declared limitations in prose when the commission requires honest
`KNOWN-OPEN:` tests.

## 2. Findings, most severe first

### M1 — merge-blocking: the owner is offered “fix the two bugs,” but the technical plan defines one of them out of contract

**Source.** Part 1 identifies the missing paint-only property as one of two plain
bugs at `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:34-42`, recommends “fix the
two plain bugs” at `:72-78`, and labels Option A “narrow the promise + fix the two
bugs” at `:92-98`. Part 2 actually repairs M3's metadata extraction at `:154-157`
but disposes of M2b by documenting that an unlisted paint-only property causes a
bounded wait “by design” at `:193-199`. That is a defensible narrowed contract;
it is not a fix for the measured `clip-path` false timeout.

Part 1 also says it is presenting five problems at `:30-57` but never tells the
owner about M2a's `visibility` judgement, even though Part 2 confirms it and
proposes a code change at `:118-125,159-161`. The owner therefore cannot derive
the actual deliverable from the part written for the owner's decision.

The narrowing descends only into a docblock rewrite at `:193-199`. The current
public name and instruction still say “Settled,” “STOPPED MOVING,” and “whenever”
at `tests/support/dsl/canvas.ts:214-248`. A future implementer can faithfully
rewrite that prose yet leave the shared API advertising a broader fact than it
returns.

**Class and population swept.** The behavioural class is “a binding surface that
tells the owner, implementer, or caller what Option A delivers.” I read both plan
parts; the current helper name, docblock, and implementation; the Save consumers
at `tests/e2e/save-and-backup.spec.ts:212,265`; the discriminator consumers at
`tests/e2e/card-geometry-discriminators.spec.ts:152,450,507,530,586,640,684,718,759,798`;
and the live PR body. Those are the consumer sites returned by
`rg -n 'getCardRectsRelativeToGridSettled' tests` after excluding the method
definition. A caller cannot live in a PR body or CI artifact; a contract claim
can, so those external surfaces were classified separately. Historical review
documents and commit messages are evidence records, not current API instructions.

**Required plan correction.** Keep Option A, but make the narrowing binding:

1. Tell the owner precisely that M3 is repaired, M2a becomes conservative, and
   M2b remains a deliberate bounded false timeout outside the certified RGL
   mechanism. If the owner really chooses “fix both false timeouts,” the technical
   plan must instead contain an M2b repair and discriminator.
2. Rename the helper to a mechanism-specific API such as
   `getRglCardRectsAfterReflow` (exact spelling is not prescribed), update its two
   test-file consumers, and state its light-DOM/RGL preconditions at that binding
   API. A generic `Settled` name plus narrower advisory prose is the intent-decay
   route this review was commissioned to prevent.
3. State that the three technical mechanisms are different classes even though
   they share one strategic diagnosis: M1 is an effect-population omission, M2a
   is a wrong property classification, and M4 is absence of an observable
   authority. One prose narrowing cannot serve as the regression evidence for all
   three.

**Must not change.** Do not pivot to Option B; widen the ±2 px comparison; alter
the relative arithmetic or exact `_havdm_layout` assertion; touch `src/`, the
manifest, Classes A–C, UAT state, or Home Assistant; or relabel M2b “fixed” merely
because it was moved outside the contract.

### M2 — merge-blocking: the proposed controls do not reject the wrong implementations the plan permits

**Source.** Proposal (a) changes keyframe metadata handling at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:154-157`, but Control 10 supplies
only a deny-listed opacity keyframe that must return at `:215-218`. The round-4
finding required both directions at
`docs/reviews/ci-unstable-tests-codex-round4-review.md:199-208`: an opacity
keyframe must return while live **and a box-moving keyframe must block**. An
implementation that ignores every keyframe passes proposed Control 10.

The committed control population does not supply the missing mutation. Control 5
uses a CSS `transform` transition at
`tests/e2e/card-geometry-discriminators.spec.ts:496-548`; Control 6 uses a CSS
`scale` transition at `:576-647`; and Control 8's CSS keyframe is excluded as a
pseudo-element before its properties are classified at `:749-822`. None is a
geometric keyframe on a measured target.

Control 9's magnitude is also not derived from the most sensitive axis. The plan
mentions the approximately 288 px card at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:209-214`, but ancestor scale changes
relative positions as well as width. In the real three-card fixture sourced at
`tests/e2e/card-geometry-discriminators.spec.ts:60-70,125-153`, my current-helper
probe measured the settled rectangles as `x=10`, `y=10/650/330`, `w=288`,
`h=310`. A `1 -> 1.1` ancestor scale therefore has a **65 px** largest endpoint
delta on `y`, not a 28.8 px largest delta inferred from width.

For an interval of 32 ms and duration `D` seconds, that axis drifts
`65 * 0.032 / D` px per sample. At 200 s that is 0.0104 px, above the
hundredth-pixel guard's half-bucket; the mechanically bundled current helper did
not return within a 700 ms attack budget. At 500 s it returned in 172 ms, at
1,000 s in 140 ms, and at **2,000 s in 74 ms**, with about 65 px still
outstanding. At 2,000 s the drift is 0.00104 px per sample and 0.00208 px across
the two intervals needed to reach a three-reading streak. The empirical red leg
remains necessary because a rounding phase can sit near a bucket boundary.

Finally, “return promptly” at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:215-218` has no numeric assertion. A
4.9-second return would meet “returned while still running” while failing the
guard's intended bounded-latency property.

**Class and population swept.** The behavioural class is “each guard named by a
new fixture must have a mutation and an assertion that fails the relevant wrong
implementation.” I swept proposals (a)–(c), proposed Controls 9–10, committed
Controls 1–8, all CSS-transition versus CSS/WAAPI-keyframe routes in those
controls, and all four returned axes used by the rounding key. I also runtime
probed WAAPI opacity frames, CSS opacity frames, and metadata-only WAAPI frames in
the checkout's Chromium.

**Required plan correction.** Add and red-leg, in the real app fixture:

1. a geometric WAAPI keyframe on a measured direct item which must keep the
   helper blocked or make it throw while still live; run it against an isolated
   “ignore all keyframes” mutant as well as the old M3 implementation;
2. Control 10 with a live-before assertion, an explicit upper bound materially
   below the 5 s helper budget, unchanged rectangle axes, and live-after
   assertion;
3. Control 9 with the all-axis derivation above (2,000 s is the measured robust
   candidate in this fixture), live-before state, prompt throw under proposal
   (c), and a red return with endpoint residual against `f78af0d`; and
4. an ordinary M2a regression control using a selector-compatible table or flex
   formatting context. M2a is proposed as repaired, so this is a normal red/green
   control, not a `KNOWN-OPEN:` test.

**Must not change.** Do not make unknown/custom/geometric keyframe properties
returnable; replace the deny-list with the round-3 allowlist; reuse the synthetic
100 px attack magnitude; or count a timeout-only assertion as evidence for the
prompt-return direction.

### M3 — merge-blocking: three declared residuals are left as prose instead of passing `KNOWN-OPEN:` tests

**Source.** The plan correctly admits that proposal (c) cannot see a
shadow-tree ancestor at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:170-191`, keeps rAF creep outside the
new contract at `:193-199`, and makes omitted paint-only properties a bounded wait
by design at `:197-199`. It then makes a test for M4 optional and proposes none
for M2a at `:220-223`. The owner summary itself says M4 “stays open forever” at
`:89-90`.

These are limitations, not exemptions. The current helper's sole motion
authority remains the Web Animations population at
`tests/support/dsl/canvas.ts:417-481`; its sampling loop can still return an rAF
creep at `:484-505`. The helper also has no light-DOM assertion that would keep a
future caller out of the admitted shadow-slot construction.

**Class and population swept.** The behavioural class is “a limitation Option A
knowingly leaves observable to a future caller.” The declared population in the
plan is: (1) shadow-tree ancestor motion omitted by `document.getAnimations()`,
(2) rAF motion which creates no `Animation`, and (3) an unlisted paint-only
animation such as `clip-path` which still produces a bounded false timeout. M2a
is not a member after proposal (b), because the plan changes its behaviour; it
needs the ordinary regression control required by M2. The unverified iframe,
null-target, pending, HTML/body, and `content-visibility` questions were attacked
separately rather than silently added as residuals.

**Required plan correction.** Pin each surviving limitation with a passing test
whose title begins `KNOWN-OPEN:` and asserts what remains true after Option A:

- a slotted light-DOM grid under an animated shadow-tree wrapper is returned
  while the shadow animation is live and a forced endpoint exceeds the caller's
  tolerance;
- an rAF creep returns while the loop is live with a material endpoint residual;
  and
- a long `clip-path` animation leaves all measured axes unchanged but exhausts a
  shortened helper budget while still running.

Those tests document the boundary in executable form. They must not pretend the
helper closes it, and their current passing behaviour must not be inverted into
the wished-for assertion.

**Must not change.** Do not increase sample count, interval, or timeout to hide
rAF; describe shadow-tree coverage as complete; or turn a `KNOWN-OPEN:` pin into
an expected failure or manifest entry.

### M4 — merge-blocking claim surface: proposal (e) omits a live repository claim surface and no verification step targets the external one

**Source.** Proposal (e) names the helper docblock and PR body at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:201-207`. The current control file is
another live instructional surface: it says guard 4 samples only after the grid
has “STOPPED MOVING” at
`tests/e2e/card-geometry-discriminators.spec.ts:1-14` and tells shared setup to
“WAIT FOR THE GRID TO STOP MOVING” at `:125-153`. Those generic claims need to be
made RGL-mechanism-specific with the API. The Save comments at
`tests/e2e/save-and-backup.spec.ts:186-212,253-265` already attribute their need
to RGL reflow and are not independently stale.

The live PR body remains the canonical ungated surface. It still describes the
superseded allowlist at PR-body lines 136–189 and calls `f78af0d` the current head
at lines 273–280 even though the hosted head is `6971f08`. The plan promises a
careful rewrite but does not require the repository's existing external-surface
instrument. `tools/check-pr-evidence.sh:1-40,71-89` reads the live body, and its
decidable SHA check is at `:168-196`; `docs/testing/TESTING_STANDARDS.md:499-528`
states its limits and `:537-547` already makes running it part of Definition of
Done.

**Class and population swept.** The behaviour is “current text teaches a reader
what the settled helper certifies.” The repository population source was a full
`rg` sweep over the helper name, “STOPPED MOVING,” “settled,” `LAYOUT_PROPS`, and
animation-state claims, followed by hand classification. Current members are the
helper docblock, the Save explanation, the discriminator-file instructions, and
the plan. Historical round reviews and commit messages correctly record old
states and must remain historical. Outside the repository I read the complete
423-line PR body. MemPalace was unavailable, so any equivalent memory claim is
**UNVERIFIED**; CI reports can contain test titles/results but are not an API
instruction surface.

**Required plan correction.** Add a labelled hand trace of those semantic claim
surfaces, because semantic truth is not mechanically decidable. Update the
discriminator-file instructions as well as the helper docblock and PR body. Then
run `bash tools/check-pr-evidence.sh 144` against the **updated live body** and
resolve or justify every candidate; use its SHA result only for the SHA property
it can decide. This existing generated check is sufficient for the decidable
external-surface facts. It is not evidence that the new mechanism prose is true,
which is why the hand trace is also required.

**Must not change.** Do not rewrite historical reviews or commit messages to
erase the evidence chain; edit tests or implementation merely to make stale prose
true; or claim the grep-based advisory check decides semantic correctness.

## 3. Results of the eight commissioned attacks

### Attack 1 — narrowing — findings M1 and M3

**Option A is acceptable after amendment.** It covers the actual RGL reflow the
Save comparison needs. The defect is not the decision to narrow; it is telling
the owner M2b is fixed while retaining it as a deliberate refusal, leaving the
narrowing in generic prose/API naming, and failing to pin the known-open side.
I require amended Option A, not Option B or C.

### Attack 2 — proposal (c) completeness — no new issue found beyond the plan's admitted shadow residual

The admitted shadow route is real. In Chromium 143.0.7499.4 I animated a wrapper
inside an open shadow root around a `<slot>` containing a light-DOM grid. The
animation changed the slotted box by `w=10`, `h=8` and larger position deltas;
`shadowRoot.getAnimations()` returned it, `document.getAnimations()` did not,
and DOM `contains()` did not identify the shadow wrapper as the light-DOM grid's
ancestor. The amended plan states that partial closure at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:183-191`, so I do not report it again
as a newly hidden defect. M3 requires the executable pin.

The other named attacks failed:

- animations on `documentElement`, `body`, and an ordinary wrapper were present
  in `document.getAnimations()` immediately, with targets whose `contains(grid)`
  was true;
- after `play()`, a not-yet-ticking animation was already listed as running with
  `pending=true`; an idle animation was omitted before `play()`, when it could not
  yet move geometry;
- a null-target animation was omitted but has no box to propagate into the
  returned rectangles;
- `content-visibility: hidden` did not suppress the ancestor animation from the
  document query; and
- scaling an iframe element did not change the child document's grid-relative
  rectangles. A main-document helper also cannot find a grid wholly inside the
  child document.

These failed constructions are evidence about Chromium 143, not proof that no
future browser route exists. Proposal (c) must preserve the current
running-or-pending test at `tests/support/dsl/canvas.ts:424-432`.

### Attack 3 — common loud failure — no issue found at the two current Save sample points

I launched the current app fixture once without running a Playwright suite and
sampled `document.getAnimations()` 30 times over 544 ms immediately after the
third card appeared, then 30 times over 489 ms immediately after save/reload.
The first window contained as many as 15 concurrent effects and the second as
many as 17: input/collapse/badge/message, wave/card/tooltip/message, and the RGL
effects. **Zero sampled effect targets were ancestors of the grid.** The antd
message and tooltip effects were on portal descendants or sibling branches, so
`target.contains(grid)` was false.

That n=1 construction found no common false throw at
`tests/e2e/save-and-backup.spec.ts:212,265`. It is not proof that a future route,
modal, or body animation cannot introduce one; proposal (c)'s loud behaviour and
the ordinary-ancestor control make that future change visible.

### Attack 4 — `BaseComputedKeyframe` metadata — no issue found after runtime cross-check

Chromium 143 returned exactly
`offset,easing,composite,opacity,computedOffset` for both WAAPI and CSS opacity
keyframes. Metadata-only WAAPI frames returned exactly
`offset,easing,composite,computedOffset`. No extra runtime metadata member was
found beyond the four proposed at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:154-157`.

A specification reading alone would repeat the shape of the original omission.
The plan's real-Chromium Control 10 supplies the needed runtime cross-check for
its route: any new metadata key would conservatively block and make that control
red rather than silently false-settle. Attack 4 therefore creates no separate
finding; M2 is about the missing opposite semantic keyframe control, not the
four-member list observed today.

### Attack 5 — Controls 9 and 10 — finding M2

The synthetic 200-second duration does not port. The real fixture's cruelest
scale axis is the card at relative `y=650`; 200 seconds crossed hundredth-pixel
buckets and did not make the current helper return in 700 ms. Two thousand
seconds returned in 74 ms with about 65 px outstanding and is the candidate the
plan should carry, subject to its required red leg. Control 10 can fail the
current M3 implementation, but “promptly” needs a threshold and the paired
geometric keyframe mutation is absent.

### Attack 6 — omitted controls — findings M2 and M3

The plan's current-DOM observation is correct but unenforced. `GridCanvas` renders
the populated RGL path and direct item wrappers at
`src/components/GridCanvas.tsx:453-490`; the item nodes are emitted at `:490-568`,
and current styling is not a table/flex collapse context. The helper itself
checks only class/direct-child shape at `tests/support/dsl/canvas.ts:343-350,417-436`;
it asserts neither tags nor formatting context. A future selector-compatible
caller can therefore enter M2a.

Because proposal (b) repairs M2a, it needs an ordinary red/green control. M4 is
the known-open member and needs the honest test described in M3. Calling the
latter optional at `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:220-223` is not
acceptable under this commission.

### Attack 7 — claim surface — finding M4

The plan misses the discriminator-file instructions and does not name the
existing live-PR-body check. A careful rewrite is not sufficient by itself. The
semantic property needs a labelled hand trace; the mechanically decidable PR
body facts need the existing generated external-surface check.

### Attack 8 — reading round 4 — findings M1 and M2; strategic grouping otherwise accepted

The plan reads M1, M2a, and M4 correctly as examples of one strategic problem:
the old public promise exceeds the available authority. They are not one
regression-test class. M1 omits an effect population, M2a misclassifies a
property, and M4 has no observable animation object. The plan's separate (b),
(c), and (d) proposals acknowledge that difference, but its two-control budget
does not.

The material misread is M2b: round 4 required the contract to decide how omitted
paint-only properties behave at
`docs/reviews/ci-unstable-tests-codex-round4-review.md:141-158`. The technical
plan makes a valid decision—bounded refusal—while Part 1 calls it a repaired
plain bug. M1 requires those two artifacts to agree. The second understatement is
the absent geometric-keyframe half of round-4 M3's explicit closing controls;
M2 restores it.

**Attacks which found no new issue:** **2, 3, and 4**, with the failed
constructions and evidence boundaries stated above.

## 4. Evidence boundary

- I read the full plan, rounds 1–4, the complete current helper, the two
  load-bearing Save samples, committed Controls 1–8, the relevant app/RGL path,
  the live PR #144 body, and the existing PR-evidence instrument.
- I did **not** run any Playwright suite, `./tools/checks`, CI, an installer, a
  packaged acceptance pass, or Home Assistant. No unchanged round-4 result is
  presented as newly rerun.
- Targeted probes used the mechanically bundled current `CanvasDSL` in the real
  app fixture for the duration attack, standalone headless Chromium for Web
  Animations/shadow/document questions, and one live Electron fixture pass for
  ancestor-animation reachability at the two Save sample points. They establish
  those constructions, not their population frequency.
- The Electron probe used the checkout's existing `.vite/build/main.js`.
  `main..HEAD` has no `src/` diff, but I did not rebuild the artifact during this
  review. This is a stated boundary, not a fresh-build claim.
- `bash tools/check-pr-evidence.sh 144` read the live body and flagged the current
  `f78af0d` head claim as stale-capable. Its semantic candidates were treated as
  worklist entries, not mechanically decided defects.
- MemPalace was not exposed in this session. The verbatim commission rules were
  used; no memory read or write is claimed, and any current claim in a memory
  store is **UNVERIFIED**.
- No `src/`, test, helper, PR body, manifest, state, or UAT file was changed. This
  review document is the only repository write.

## MemPalace drawer candidates

**HOLD — do not file either candidate yet.** Both arise from a replacement plan
that has not survived independent review, so rule 14 withholds filing until the
repaired mechanism and controls are independently accepted.

1. A contract narrowing is not a fix for a former in-contract defect unless the
   owner-facing promise, binding API name/preconditions, implementation plan, and
   known-open controls all describe the same boundary.
2. A metadata exclusion over open keyframe dictionaries needs opposite semantic
   controls: a paint-only keyframe returns while live, and a geometric keyframe
   blocks. The first alone passes an implementation that ignores the dictionary.
