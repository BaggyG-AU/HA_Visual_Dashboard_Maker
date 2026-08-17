# Remediation plan — the settle helper's contract (PR #144, Codex round 4)

**Author:** BaggyG-AU with Claude Opus 5, revision 3 of 2026-08-17

**Reviewer:** OpenAI Codex — revisions 1 and 2 both reviewed BEFORE any code was
written (`docs/reviews/ci-unstable-tests-codex-round4-plan-review.md` and
`docs/reviews/ci-unstable-tests-codex-round4-plan-review-rev2.md`, both
CHANGES-REQUIRED); **revision 3 awaits re-review, still before any code**

**Owner gate:** the owner chose **full amended Option A** (settled, unchanged) and
on 2026-08-17 **REVERSED their earlier choice on `clip-path`: it is to be DECLARED,
not fixed**, after this plan's repair design was proved unsound. Authority:
`drawer_havdm_decisions_26405253844a7def946dd134`, superseding decision 2 of
`drawer_havdm_decisions_80a72d6fe0911490ef07a555`.

## Revision history

| Rev | What changed                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | First plan. CHANGES-REQUIRED: four merge-blocking plan defects.                                                                                                                                                                                                                                                                                                                              |
| 2   | Owner chose full amended Option A + repair `clip-path`. Part 1/Part 2 reconciled, helper renamed, ancestor magnitude corrected, controls 2→5, pins added, claim surface widened. CHANGES-REQUIRED: **tier 3 refuted**, precondition still advisory, one impossible red leg, stale SHA.                                                                                                       |
| 3   | **Tier 3 DELETED** — unknown properties keep failing closed, as the shipped code already does. `clip-path` becomes a declared limitation with a `KNOWN-OPEN:` pin, per the owner's reversal. Runtime precondition added. Control 11's mutation table corrected. **Every latency and magnitude now DERIVED from measurement in the real app fixture**, not chosen. Stale SHA literal removed. |

---

# PART 1 — FOR THE OWNER

⚠ **Revision 1 of this section misled you and revision 2 promised something
impossible. Both are corrected here.** Revision 1 said I would "fix the two plain
bugs" while the technical half quietly redefined one of them as acceptable.
Revision 2 then claimed a real fix for it — and the reviewer proved my design
would have returned a **10 px error as a clean pass**. You reversed the decision on
the strength of that, and this revision reflects the reversal.

## 1.1 What the thing is

One test helper in `tests/support/dsl/canvas.ts`: **wait until the cards on the
canvas have stopped moving, then measure where they are.** The canvas animates card
positions over 0.2 s, and a test that measures during that window records a card
mid-flight and fails for no real reason — the "Class D" flake this pull request
exists to fix. Two test files use it. Not product code; no user runs it.

## 1.2 The five problems and exactly what happens to each

| #   | Problem                                                                                                                                                                                              | Disposition                                                                                                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A mistake reading animation data makes **every** keyframe animation look like it is moving a card, even a pure fade                                                                                  | **FIXED**                                                                                                                                                                                                            |
| 2   | `visibility` is wrongly listed as harmless; in some layouts it does change a box's size                                                                                                              | **FIXED** — revision 1 never told you this one existed                                                                                                                                                               |
| 3   | A cosmetic property the helper does not recognise (`clip-path`) makes it wait and then fail                                                                                                          | ⚠ **NOT FIXED — DECLARED, per your reversal.** It will keep waiting and then failing loudly, deliberately, because failing safe is the only sound option available. Pinned by a test so nobody mistakes it for fixed |
| 4   | If something _containing_ the canvas is resized, the helper cannot see it and declares the cards stopped while they are still growing — **9.995 px** of unfinished movement against a 2 px tolerance | **MADE TO FAIL LOUDLY** rather than return a wrong number                                                                                                                                                            |
| 5   | Motion driven frame-by-frame by JavaScript creates nothing the helper can ask about                                                                                                                  | **CANNOT BE OBSERVED by this helper's chosen authorities.** Declared and pinned. ⚠ Revision 2 called this "cannot be fixed"; that overstated it — a different mechanism could see it, this one cannot                |

**Plus the rename**, which is what makes the narrowing real rather than advisory:
the helper is called `...Settled` today and says "stopped moving". A future reader
believes the name, not my paragraph. **And beyond the rename, the helper will now
refuse outright** when it is called on markup it was not built for — because the
reviewer showed that a rename alone still lets someone walk into the holes.

## 1.3 Why problem 3 could not be fixed — the short version

The helper keeps a list of properties known to be harmless. `clip-path` isn't on
it, so the helper conservatively waits. I proposed: for an unrecognised property,
watch a bit longer and then proceed. The reviewer built a case where the card moved
**so slowly that ten consecutive measurements were identical while 9.9985 px of
movement remained**, and then made the general argument:

> **No finite number of measurements can prove motion has stopped.** Whatever
> number I pick, a slow enough movement hides inside it.

That is a proof, not a bad result — so no version of my idea works. The two real
alternatives were: find an authoritative list of which properties move things
(none exists, and writing my own is what caused the bug), or ask the browser about
the actual card by fast-forwarding each animation and measuring — a redesign you
declined, reasonably, since it needs its own plan and review round.

⚠ **`clip-path` appears nowhere in the app**, so this cannot happen today. It is a
trap for a future test author, and it will be labelled as one.

## 1.4 The cost, and what could go wrong

Four changes in one test-support file, a rename across three files, **four** guard
tests, **three** tests pinning what stays broken, and a documentation sweep across
four surfaces. One CI acceptance cycle (three runs, ~27 min each).

- **The loud-failure change could itself cause failures.** The reviewer measured
  this for me in the real app: 15–17 animations running at each critical moment,
  **none** on a container of the canvas. One run, and it says so.
- **Seven new tests on a branch where three of my own guard tests turned out
  flaky.** Each must be proven to fail against the broken code first, in the real
  app. **This time every threshold is a measured number, not an adjective** — §2.3
  lists where each came from.
- **The new refusal could be too strict.** If the precondition rejects markup a
  legitimate test uses, that is a new failure. It is why the `visibility` control
  and the precondition have to be reconciled deliberately (§2.3(b)).

---

# PART 2 — TECHNICAL DETAIL FOR THE PLAN REVIEWER

## 2.1 What revisions 1–2 settled — not to be re-derived

- **Option A is the direction.** Option B buys an unachievable promise; C retains one.
- **Tier 3 is refuted**, empirically (registered `--x` driving `translate`, ten equal
  readings, return at 292 ms with 9.9985 px outstanding) and structurally (no finite
  streak can establish the property). **Deleted, not re-parameterised.**
- **The throwaway-element probe is non-authoritative** because property effects are
  contextual — `visibility: collapse` reduced a table row 80 px → 0 while a flex
  construction kept its box.
- **Control 9's `2000s` and its all-axis `y = 650` derivation are confirmed correct.**
- **Attack 3 cleared the ancestor guard's false-throw risk** (n=1, real app).
- **Chromium 143 returns exactly four keyframe metadata members**, so (a)'s
  exclusion is complete as observed — confirmed again by my own real-app run below.

## 2.2 ⭐ MEASUREMENTS TAKEN FOR THIS REVISION, IN THE REAL APP FIXTURE, HEADLESS

The reviewer's revision-2 M3 required derived numbers rather than "promptly". These
come from a throwaway probe spec run through `bash tools/test-headless.sh
--project=electron-e2e --workers=1 --retries=0`, on the three-card fixture
`makeDirty` builds, at head `af2065d`. **The probe was deleted after use and is not
committed.** Three runs; A and B reproduced in all three.

```text
A  normal settled return latency, n=8 per run, three runs
     run 1: 81 78 75 81 75 75 76 76      min 75  max 81  mean 77.1
     run 2: 86 86 75 76 76 76 78 77      min 75  max 86  mean 78.8
     run 3: 83 81 76 84 76 77 76 77      min 76  max 84  mean 78.8
   => 24 samples, range 75–86 ms

B  throw latency under a SHORTENED budget, geometric transition live
     budget 1000 -> threw at 1041 / 1038 / 1037 ms
     budget 1500 -> threw at 1532 / 1515 / 1528 ms
     budget 2000 -> threw at 2035 / 2033 / 2028 ms
   => overhead above budget is 28–41 ms

C  the M3 defect CONFIRMED IN THE REAL APP (previously only synthetic)
     opacity keyframe on a measured card, playState running,
     getKeyframes()[0] keys = [offset, easing, composite, opacity, computedOffset]
     helper THREW while every measured axis stayed unchanged
   ⚠ C's wall time varied across runs (1544 / 1540 / 983 ms) and my probe
     DISCARDED the error message, so I do NOT present C as a latency bound.
     It stands only as confirmation that the defect reproduces in the app.

D  the rAF residual, re-derived in the real fixture
     rAF moving one measured card 10 px over 200 s
     grid.getAnimations({subtree:true})  ->  0        (the gate is blind to it)
     helper RETURNED after 145 ms, x = 0.0089
     forced endpoint x = 10  ->  residual 9.9911 px   (tolerance is ±2 px)
```

⚠⚠ **D's FIRST RUN WAS A DEAD INSTRUMENT AND I AM RECORDING THAT RATHER THAN
BURYING IT.** Step C's opacity keyframe was still running when D began, so D's
"result" (`threw=true`) was produced by the C defect, not by rAF. The
`animationsSeen` field I had included as a liveness check is what exposed it —
`animationsSeen=1` where rAF must give `0`. After cancelling C's animation, D reads
`animationsSeen=0` and returns early as expected. **This branch has now produced
seven dead instruments; the liveness field is the only reason this was the seventh
caught rather than the first shipped.**

⭐ **A note on rule 13, offered for attack.** The reviewer's rule says a hostile
magnitude does not port between fixtures, and it was right about `scale` — that
mutation's bite is _proportional_ to the subject, which is exactly why my 288 px
assumption failed and `y = 650` was correct. **But D's 10 px over 200 s is an
ABSOLUTE mutation**: drift per sample is `10 × 32 / 200000 = 0.0016 px` whatever the
card's size, so it ports for a structural reason rather than by luck. D confirms it
empirically. **If that distinction is wrong, it is a load-bearing error and I want
it named.**

## 2.3 Proposed changes — full amended Option A, revision 3

⚠ **No code has been written.**

**(a) M3 — derive the metadata exclusion from the canonical schema.** Exclude
exactly the four `BaseComputedKeyframe` members `offset`, `computedOffset`,
`easing`, `composite`. **Unknown and custom properties keep failing closed** — which
is what the shipped code at `tests/support/dsl/canvas.ts:472-480` already does, and
what revision 2's tier 3 wrongly contradicted.

**(b) M2a — remove `'visibility'` from the non-geometric set**, making it
conservative. ⚠ **AND RECONCILE IT WITH (g), WHICH THE REVIEWER SPOTTED AND I HAD
NOT.** Control 12 needs a **table** formatting context to demonstrate Chromium's
geometric `collapse`, while the new precondition in (g) should refuse non-RGL
markup _before_ the property classifier is reached — which would make Control 12
green without exercising this repair at all. **Resolution proposed: the precondition
guards the PUBLIC entry point, and Control 12 exercises the property classifier
directly** (an internal seam), so it reaches (b) without defeating (g). If that seam
does not exist cleanly, (b)'s control must instead use a construction the
precondition admits — and if neither is possible, say so and I will carry (b) with
no control and declare it, rather than ship a control that passes for the wrong
reason.

**(c) M1 — fail closed on what the helper cannot judge.** Query
`document.getAnimations()` and **throw**, naming the element, if any
running-or-pending effect targets an **ancestor** of the grid container. Preserve
the existing running-or-pending test at `tests/support/dsl/canvas.ts:424-432`.

⭐ Feasibility and limit both measured before proposing it:

```text
ancestor `scale 200s` on a wrapper outside the grid
  grid.getAnimations({subtree: true})            ->  0   (this is M1)
  document.getAnimations()                        ->  1
  identifiable via t.contains(grid)               ->  1   (DIV#wrap)
running transition INSIDE a shadow root
  document.getAnimations() count                  ->  UNCHANGED at 1
```

**(c) is a PARTIAL closure and must never be documented as a complete one.** The
reviewer independently reproduced the shadow case through a `<slot>`.

**(d) THE RENAME.** `getCardRectsRelativeToGridSettled` →
**`getCardRectsAfterRglReflow`**, updating `tests/e2e/save-and-backup.spec.ts:212,265`
and the ten call sites in `tests/e2e/card-geometry-discriminators.spec.ts`. The bare
`getCardRectsRelativeToGrid` keeps its name.

**(e) M4 + the contract text.** Rewrite the docblock to state what is certified —
react-grid-layout's own `transform`/`width`/`height` transitions on the measured
elements, plus a fail-closed refusal on ordinary-DOM ancestor animation — and what
is not: rAF creep, shadow-tree ancestor motion, and unrecognised properties (which
cause a bounded wait then a loud failure). Delete the `LAYOUT_PROPS` prose. ⚠ **Say
rAF is unobservable to THIS helper's authorities — not that no system could observe
it.**

**(f) ⚠ M2b — `clip-path` IS DECLARED, NOT FIXED.** Per the owner's reversal. The
classifier is unchanged for unknown properties: they continue to fail closed, i.e.
the helper waits and then throws. **This is stated as a deliberate limitation in
both Part 1 and the docblock, and pinned by pin 3 in (h).** Revision 2's tier 3 is
deleted in full. ⓘ If this is ever revisited, the design to start from is the
reviewer's: a counterfactual on the **actual target in its actual context** — seek
each animation to its end, measure, restore — which is property-agnostic and would
dissolve (b), (c) and (f) together. It needs its own plan.

**(g) ⭐ NEW — MAKE THE PRECONDITION A RUNTIME INVARIANT, not a docblock claim.**
The reviewer's M2: the implementation accepts any markup carrying
`.react-grid-layout` and a direct `.react-grid-item`, so a faithful caller reading
the new name can still receive an out-of-contract value, and my own proposed shadow
pin proves it. Assert, at the public entry point, the mechanically decidable
preconditions: the grid container and its measured children are **HTML elements of
the expected kind**, in the **light DOM** (`getRootNode() === document`), and not
inside a table/flex formatting context that would change what `visibility` means.
**Throw a named error, not a boolean.** ⚠ What is _not_ mechanically decidable —
notably a closed shadow root — stays a declared residual with pin 1, and the plan
must say which specific construction enforcement cannot detect.

**(h) THE CONTROL MATRIX — four controls and three pins, with DERIVED numbers.**

| #   | Control                                           | Assertion, with its derivation                                                                                                                                                              | Must be RED against                                       |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 9   | ancestor `scale 2000s` outside the grid           | must **throw**; budget shortened to `timeoutMs: 1500`, assert throw and wall **< 2500 ms** (measured 1515–1532 ms at that budget, §2.2 B)                                                   | `f78af0d`, which returns at 74 ms with ~65 px outstanding |
| 10  | deny-listed `opacity` keyframe on a measured card | must **return within 1000 ms** (measured normal return 75–86 ms across 24 samples, §2.2 A — ~12× margin, and 5× below the 5 s default); axes unchanged; animation live **before and after** | `f78af0d`, which throws (§2.2 C)                          |
| 11  | **geometric WAAPI keyframe** on a measured card   | must **throw** under a shortened explicit budget, with liveness before/after and a forced geometric endpoint                                                                                | ⚠ **an "ignore all keyframes" mutant ONLY**               |
| 12  | `visibility: collapse` in a table context         | ordinary red/green for (b)                                                                                                                                                                  | `f78af0d`, which returns                                  |

⚠⚠ **CONTROL 11 CANNOT BE RED AGAINST THE OLD `computedOffset` IMPLEMENTATION AND
REVISION 2 WAS WRONG TO CLAIM IT.** The old bug treats `computedOffset` as unknown
and therefore **blocks every keyframe** — and blocking is control 11's desired
result, so the buggy code **passes** it. **Control 10 is the member that rejects the
old implementation; control 11 rejects only the ignore-all mutant. The pair proves
the two directions; neither alone does.**

**Pins — passing tests asserting what remains TRUE:**

1. `KNOWN-OPEN:` a slotted light-DOM grid under an animated shadow-tree wrapper.
   ⚠ **Its polarity depends on (g):** if the precondition detects the slotted case,
   this becomes a **loud-refusal control** instead of a false-settle pin. Decide in
   review, not during implementation.
2. `KNOWN-OPEN:` rAF creep — **10 px over 200 s**, derived in the real fixture
   (§2.2 D): `getAnimations` sees 0, the helper returns at 145 ms, residual
   **9.9911 px**. Assert return, liveness before/after, and the forced-endpoint
   residual exceeding ±2 px.
3. `KNOWN-OPEN:` a long `clip-path` animation leaves all four measured axes
   unchanged and still exhausts a shortened budget — asserting the **throw**, which
   is the true current and post-Option-A behaviour.

## 2.4 Must NOT change

The ±2 px tolerance at `tests/e2e/save-and-backup.spec.ts:267-271`; the exact
`_havdm_layout` assertion; the grid-relative arithmetic; Classes A–C; `src/`;
`tests/baseline/expected-failures.json`; the four accepted geometry-population
non-conversions; the measured-target exclusions for descendants and pseudo-elements;
the running-or-pending test. **No tier 3 in any form. No geometric allowlist. No
property name added to any list from memory. No sample-count, interval or timeout
increase to hide the rAF or unknown-property residual.** No pin inverted into its
wished-for result. Historical reviews and commit messages are evidence and must not
be rewritten. Nothing re-baselined; no identity allowlisted.

## 2.5 Questions for the reviewer

1. **Is (g)'s precondition set right, and is the (b)/(g) reconciliation sound?** The
   internal-seam proposal is my answer to a conflict you found; it may be worse than
   the problem. If Control 12 cannot both reach the classifier and respect the
   precondition, I would rather carry (b) uncontrolled and declare it — is that
   acceptable?
2. **Does (g) create a new false-refusal class?** It throws on markup rather than on
   motion. All 12 current call sites use the real RGL path, but is there a
   legitimate future caller it would wrongly reject?
3. **Pin 1's polarity** — should the slotted shadow case be a refusal control or a
   known-open pin? That is (g)'s consequence and I have deliberately left it open.
4. **Are the derived bounds in (h) right?** 1000 ms for control 10 and 2500 ms at a
   1500 ms budget for control 9, from §2.2. Is the margin sufficient under CI load,
   given the same machine reads exactly zero for every local Class D measurement?
5. ⭐ **Is my rule-13 refinement in §2.2 correct** — that proportional mutations do
   not port but absolute ones do? If wrong, pin 2's magnitude is wrong with it.
6. **Is four controls plus three pins now complete?** Count the guards each proposal
   names against the mutations (h) makes.

## 2.6 Evidence boundary

- §2.2's A–D are **real-app, headless, three runs**, at `af2065d`. C is confirmation
  only, not a bound — its variance is unexplained and my probe discarded the error
  message.
- The tier-3 refutation, shadow-root limit and context-dependence results are the
  **reviewer's**, in standalone headless Chromium 143 — not re-measured by me.
- The ancestor false-throw clearance is the reviewer's, **n=1**.
- **No CI cycle has been spent and no implementation code has been written.**
- Local greens are not stability evidence: every local Class D measurement on this
  box reads exactly zero.
- The probe spec that produced §2.2 was **deleted**; it is not in the repository, so
  §2.2 is not independently re-runnable from the tree as it stands. The recipe is
  stated above in full.
