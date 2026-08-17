# Remediation plan — the settle helper's contract (PR #144, Codex round 4)

**Author:** BaggyG-AU with Claude Opus 5, revision 2 of 2026-08-17

**Reviewer:** OpenAI Codex — revision 1 reviewed BEFORE any code was written
(`docs/reviews/ci-unstable-tests-codex-round4-plan-review.md`, CHANGES-REQUIRED
with Option A accepted as the direction); **revision 2 awaits re-review, still
before any code**

**Owner gate:** the owner chose **full amended Option A** and chose to **actually
fix the `clip-path` false timeout** on 2026-08-17, after reading the plan review
rather than before it. Those two choices are settled and are recorded in
`drawer_havdm_decisions_80a72d6fe0911490ef07a555`. What is NOT settled is the
`clip-path` repair design in §2.3(f), which is this revision's principal subject.

## Revision history

| Rev | What changed                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | First plan. CHANGES-REQUIRED: four merge-blocking plan defects (M1–M4).                                                                                                                                                                                                                                                                      |
| 2   | Owner chose full amended Option A + repair `clip-path`. Part 1 rewritten so it no longer promises anything Part 2 does not do; `visibility` disclosed to the owner; the helper is renamed; the ancestor-control magnitude corrected from the wrong axis; controls raised from 2 to 5; `KNOWN-OPEN:` pins added; claim-surface sweep widened. |

---

# PART 1 — FOR THE OWNER

⚠ **Revision 1 of this section was not honest and the plan reviewer caught it.**
It told you I would "fix the two plain bugs" while the technical half quietly
redefined one of them as acceptable-by-design, and it never mentioned the
`visibility` problem to you at all. Both are corrected below. You decided to fix
that bug for real, so the technical plan now contains a repair rather than a
re-description.

## 1.1 What the thing is

One test helper in `tests/support/dsl/canvas.ts`. Its job: **wait until the cards
on the canvas have stopped moving, then measure where they are.** The canvas
animates card positions over 0.2 seconds, and a test that measures during that
window records a card mid-flight and fails for no real reason — the "Class D"
flake this pull request exists to fix. Two test files use it. It is not product
code and no user ever runs it.

## 1.2 The five problems, and exactly what happens to each

| #   | Problem                                                                                                                                                                                                            | What you get                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 1   | A mistake reading animation data makes **every** keyframe animation look like it is moving a card, even a pure fade                                                                                                | **FIXED**                                                                                                     |
| 2   | `visibility` is wrongly listed as harmless; in some layouts it does change a box's size                                                                                                                            | **FIXED** — I did not tell you about this one in revision 1                                                   |
| 3   | A cosmetic effect the helper does not recognise (`clip-path` crops what you see without moving anything) makes it wait, then fail                                                                                  | **FIXED — your decision.** Revision 1 was going to declare this acceptable instead                            |
| 4   | If something _containing_ the canvas is being resized, the helper cannot see it and declares the cards stopped while they are still growing — I measured **10 px** of unfinished movement against a 2 px tolerance | **MADE TO FAIL LOUDLY** rather than return a wrong number. Not silently correct — loudly refused              |
| 5   | Motion driven frame-by-frame by JavaScript creates nothing the helper can ask about                                                                                                                                | **CANNOT BE FIXED.** Declared as a boundary, and pinned by a test that records the current behaviour honestly |

**Plus, at the reviewer's insistence: the helper gets renamed.** Today it is called
`...Settled` and its instructions say "stopped moving" and "use this whenever". If
I narrow what it actually promises but leave that name, the next person reads the
name and not my paragraph. The reviewer called this "the intent-decay route this
review was commissioned to prevent". So the name will say what it really does —
wait for _this canvas's own_ card reflow.

## 1.3 The honest cost, corrected

**I under-quoted you in revision 1.** I said "one code change, two guard tests, one
CI cycle". That was the cost of my first draft, not of the amended plan. The real
shape:

- **Four separate changes** inside one test-support file
- **A rename** touching that file and both test files that call it
- **Five guard tests**, not two — the reviewer showed my two could be passed by an
  implementation that ignores keyframes entirely
- **Two more tests** that pin what stays broken, so nobody mistakes it for fixed
- **A documentation sweep** across four surfaces including the pull request body
- **One CI acceptance cycle** — three full runs, ~27 minutes each

You chose this with that cost stated, over three cheaper options and over stopping
and moving to product work.

## 1.4 What could still go wrong

- **The `clip-path` repair is the risky part.** The obvious fix — adding names to a
  list — is _forbidden_, because writing that list from memory is exactly how the
  bug was born, and the opposite approach fails silently on whatever nobody thought
  of. My proposed approach (§2.3(f)) is genuinely new and **has not been reviewed
  yet.** That is the one thing I want attacked before I write it.
- **The loud-failure change could itself cause failures.** The reviewer tested this
  for me: it launched the app and sampled animations 30 times at each critical
  moment — 15 to 17 antd animations running, and **none** on a container of the
  canvas. So the risk looks small. That was one run, and it says so.
- **Seven new tests is new code on a branch where three of my own earlier guard
  tests turned out to be flaky.** Each must be proven to fail against the broken
  code first, in the real app, before I believe any of them.

## 1.5 What I will not do

Widen the 2 px tolerance, re-baseline anything, touch the expected-failures
manifest, touch product code, or change what the actual Class D test asserts.

---

# PART 2 — TECHNICAL DETAIL FOR THE PLAN REVIEWER

## 2.1 Verification status of each round-4 finding

**A finding is a hypothesis**; the column that matters is how it was checked.

| Finding                                  | Verified how                                                                                                                                                                                                                                                                                                                                                                                                           | Status                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **M1** ancestor animation invisible      | Code reading + own harness: ancestor `scale 200s`, `grid.getAnimations({subtree:true})` returned **0**, helper returned at **66.2 ms**, residual `x 1.999 / y 2.9985 / w 9.995 / h 7.996 px`                                                                                                                                                                                                                           | **CONFIRMED**                                                                                                                   |
| **M2a** `visibility` wrongly deny-listed | Code reading: `'visibility'` at `tests/support/dsl/canvas.ts:406`. CSS Display 3 gives `collapse` layout effects in table/flex contexts                                                                                                                                                                                                                                                                                | **CONFIRMED as a contract defect; not reachable in today's div DOM, and the helper asserts neither tag nor formatting context** |
| **M2b** `clip-path` false timeout        | Own harness: `transition: clip-path 200s`, box bit-identical, helper **threw at 524.1 ms** on a 500 ms budget                                                                                                                                                                                                                                                                                                          | **CONFIRMED**                                                                                                                   |
| **M3** `computedOffset`                  | Code reading decisive: exclusion at `:466` is exactly `offset`/`easing`/`composite`; `computedOffset` is mandatory in `BaseComputedKeyframe`. Own harness: deny-listed `opacity` keyframe **threw at 527.9 ms**, box bit-identical. ⭐ Reviewer runtime-confirmed Chromium 143 returns exactly `offset,easing,composite,computedOffset` + the property, so the four-member exclusion is complete **as observed today** | **CONFIRMED**                                                                                                                   |
| **M4** rAF residual                      | Code reading decisive: `getAnimations()` is the sole motion authority; a rAF loop creates no `Animation`. ⚠ **I did not re-measure it**; 71 ms / 10 px is the reviewer's                                                                                                                                                                                                                                               | **CONFIRMED by construction**                                                                                                   |
| **M5** claim surface                     | `grep -rn LAYOUT_PROPS tests/ src/` → two hits, **both in the docblock**; the identifier exists nowhere in code                                                                                                                                                                                                                                                                                                        | **CONFIRMED decisively**                                                                                                        |

## 2.2 What the plan review established, not to be re-derived

- **Option A accepted as the direction.** Option B buys an unachievable promise;
  Option C retains one.
- **Attack 3 discharged the measurement I had recorded as owed.** 30 samples over
  544 ms after the third card appeared and 30 over 489 ms after save/reload; up to
  15 then 17 concurrent antd effects; **zero effect targets were ancestors of the
  grid** (message/tooltip effects sit on portal descendants or sibling branches, so
  `target.contains(grid)` was false). n=1, declared.
- **Attack 2 confirmed the shadow-tree partial closure** I had self-reported, and
  cleared `documentElement`, `body`, ordinary wrappers, pending-after-`play()`,
  null targets, `content-visibility: hidden`, and iframe scaling. Chromium 143 only.
- ⭐ **My ancestor-control magnitude was wrong and the reviewer measured the right
  one.** I sized it off the ~288 px card **width** (28.8 px). The cruellest axis is
  the third card's relative **`y = 650`**, giving a **65 px** endpoint delta.
  Measured against the bundled current helper: **200 s did not return inside a
  700 ms budget; 500 s → 172 ms; 1,000 s → 140 ms; 2,000 s → 74 ms with ~65 px
  outstanding.** `2000s` is the candidate. Per-sample drift at 2,000 s is
  0.00104 px, and 0.00208 px across the two intervals needed for a three-reading
  streak — under the hundredth-pixel half-bucket.

## 2.3 Proposed changes — full amended Option A

⚠ **No code has been written.**

**(a) M3 — derive the metadata exclusion from the canonical schema.** Exclude
exactly the four `BaseComputedKeyframe` members `offset`, `computedOffset`,
`easing`, `composite`. Unknown and custom properties keep failing closed.

**(b) M2a — remove `'visibility'` from the non-geometric set.** It becomes
possibly-geometric, i.e. conservative.

**(c) M1 — fail closed on what the helper cannot judge.** Query
`document.getAnimations()` and **throw**, naming the element, if any
running-or-pending effect targets an **ancestor** of the grid container. Preserve
the existing running-or-pending test at `tests/support/dsl/canvas.ts:424-432`.

⭐ **Feasibility measured before proposing it, and the measurement also found its
limit:**

```text
ancestor `scale 200s` on a wrapper outside the grid
  grid.getAnimations({subtree: true})               ->  0   (this is M1)
  document.getAnimations()                           ->  1
  identifiable as ancestor via t.contains(grid)      ->  1   (DIV#wrap)
running transition INSIDE a shadow root
  document.getAnimations() count                     ->  UNCHANGED at 1
```

**So (c) closes the ordinary-DOM ancestor route and does NOT close a shadow-tree
ancestor route.** ⚠ **(c) IS A PARTIAL CLOSURE AND MUST NOT BE DOCUMENTED AS A
COMPLETE ONE.** The reviewer independently reproduced the shadow case with a
`<slot>` and confirmed `contains()` does not identify the shadow wrapper as the
light-DOM grid's ancestor. Pinned by a `KNOWN-OPEN:` test in (h).

**(d) THE RENAME — making the narrowing binding rather than advisory.** Rename
`getCardRectsRelativeToGridSettled` to a mechanism-specific name —
**`getCardRectsAfterRglReflow`** — and update its two consumer test files
(`tests/e2e/save-and-backup.spec.ts:212,265` and the ten call sites in
`tests/e2e/card-geometry-discriminators.spec.ts`). State the light-DOM and RGL
preconditions **at that API**, not only in prose. The bare
`getCardRectsRelativeToGrid` keeps its name; only the settling variant is renamed.

**(e) M4 + the contract text.** Rewrite the docblock to say what is certified —
react-grid-layout's own `transform`/`width`/`height` transitions on the measured
elements, plus a fail-closed refusal on ordinary-DOM ancestor animation — and what
is explicitly not: rAF creep, and shadow-tree ancestor motion. Delete the
`LAYOUT_PROPS` prose entirely.

**(f) ⭐⭐⭐ M2b — THE `clip-path` REPAIR. THIS IS THE ONE GENUINELY NEW DESIGN AND
THE CRUX OF THIS REVISION.**

The owner chose repair over declaration. Two routes are closed to me by round 4's
own must-not-change clauses: **I may not extend a hand-written property list from
memory** (that is how the defect was born), and **I may not invert to a geometric
allowlist** (that is the round-3 defect, failing open on the unconsidered
property). So the repair must be principled rather than enumerative.

**Proposal — three tiers over the already-correct measured-target population:**

| Tier | Condition                                       | Behaviour                                                                                                                                                   |
| ---- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | any animated property is **known-geometric**    | **BLOCK** immediately (as today)                                                                                                                            |
| 2    | every animated property is **known paint-only** | **RETURN** immediately (as today)                                                                                                                           |
| 3    | any property is **UNKNOWN to both sets**        | require a **materially longer stability streak** — proposal: 10 consecutive equal hundredth-pixel readings instead of 3 — then **RETURN** rather than throw |

Tier 3 is the repair: `clip-path` is unknown, its geometry is genuinely stable, so
the extended streak is satisfied and the helper returns instead of exhausting its
budget. It is not an allowlist, because an unknown property still costs a longer
wait and still blocks while geometry is actually changing.

⚠ **Its residual, stated: an unknown property creeping below sampling resolution
for longer than the extended window still slips through.** That is the same class
as the rAF residual and is bounded by the same argument — sampling has a
resolution and facts do not. **I am not confident this is the right design and it
is question 1 in §2.5.** A named alternative I rejected, and want challenged: probe
each unknown property on a throwaway element and measure whether its border box
changes — that asks the layout engine, which is the authority, but it mutates the
DOM from inside a read-only helper and the transition's endpoint values are not
reliably recoverable.

**(g) THE FIVE CONTROLS, each red-legged in the REAL app fixture before I believe
it.** Round-4 rule 11 and rule 13 apply: count guards named against mutations
made, and re-derive every magnitude in the fixture actually run.

| #   | Control                                                                                                                                                                                      | Must be RED against                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 9   | ancestor `scale 2000s` outside the grid → helper must **throw** promptly; live-before, and a red **return with ~65 px endpoint residual** against `f78af0d`                                  | `f78af0d` (returns at 74 ms)                                                |
| 10  | deny-listed `opacity` keyframe on a measured item → must **return**, with a **numeric upper bound materially below the 5 s budget**, unchanged axes, and animation live **before and after** | `f78af0d` (throws)                                                          |
| 11  | ⭐ **geometric WAAPI keyframe on a measured item → must BLOCK while live.** The half revision 1 omitted                                                                                      | an isolated "ignore all keyframes" mutant **and** the old M3 implementation |
| 12  | `visibility: collapse` in a selector-compatible table/flex context → ordinary red/green regression control, since (b) repairs it                                                             | `f78af0d` (returns)                                                         |
| 13  | `clip-path` unknown-property route → must **return** inside the tier-3 window with all four axes unchanged                                                                                   | the tier-3 repair removed                                                   |

⚠ **Control 10's "promptly" needs a number, not an adverb** — the reviewer noted a
4.9 s return would satisfy "returned while still running" while failing the
bounded-latency property the guard exists to assert.

**(h) TWO `KNOWN-OPEN:` PINS** — executable, asserting what remains **true** after
Option A, never the wished-for behaviour. `clip-path` is no longer a residual once
(f) lands, so revision 1's third pin is dropped.

1. `KNOWN-OPEN:` a slotted light-DOM grid under an animated shadow-tree wrapper is
   returned while the shadow animation is live, and a forced endpoint exceeds the
   caller's tolerance.
2. `KNOWN-OPEN:` an rAF creep returns while the loop is live, with a material
   endpoint residual.

**(i) M5 + M4 — the claim surface, widened.** Four current surfaces, classified by
role (_text that teaches a reader what this helper certifies_), not by token:

1. the helper docblock — `tests/support/dsl/canvas.ts:214-335`;
2. ⭐ **`tests/e2e/card-geometry-discriminators.spec.ts:1-14` and `:125-153`** —
   says "STOPPED MOVING" and "WAIT FOR THE GRID TO STOP MOVING". **Revision 1
   missed this entirely**;
3. the live PR #144 body — still describes the superseded allowlist at lines
   136–189 and still calls `f78af0d` the head at lines 273–280 (the head is now
   `24f27bb`), plus the two misattributed identities corrected to
   `e2e/icon-color.spec.ts` and `e2e/card-background.spec.ts` with **not
   baselined**, and the disposition weakened from "would fire at every run" to "did
   not recur in five further runs, and `f78af0d` has no call path to either spec";
4. this plan.

`tests/e2e/save-and-backup.spec.ts:186-212,253-265` already attributes its need to
RGL reflow and is **not** stale. Historical reviews and commit messages are
evidence records and **must not be rewritten**.

⚠ **Semantic truth here is not mechanically decidable, so the deliverable is a
LABELLED HAND TRACE of those four surfaces** — not a script that approximates one.
Then run **`bash tools/check-pr-evidence.sh 144` against the UPDATED live body**
and resolve or justify every candidate, using its SHA section only for the SHA
property it can decide.

## 2.4 Must NOT change

The ±2 px tolerance at `tests/e2e/save-and-backup.spec.ts:267-271`; the exact
`_havdm_layout` assertion; the grid-relative arithmetic; Classes A–C; `src/`;
`tests/baseline/expected-failures.json`; the four accepted geometry-population
non-conversions; the measured-target exclusions for ordinary descendants and
pseudo-elements; the running-or-pending test. **No pivot to Option B. No geometric
allowlist over the subtree. No relabelling M2b "fixed" by moving it out of
contract — the owner chose a repair.** Nothing re-baselined, no identity
allowlisted, no `KNOWN-OPEN:` pin converted into an expected failure or a manifest
row. Do not raise sample count, interval or timeout to hide rAF.

## 2.5 Questions I want the plan reviewer to attack

1. ⭐⭐⭐ **Is the three-tier design in (f) sound, or is it a third way of being
   wrong?** Specifically: is "unknown property + longer stability streak → return"
   defensible, or does it just move the round-2 rounding-hole defect behind a bigger
   number? Is 10 samples derived or arbitrary — and what SHOULD derive it? Is my
   rejection of the layout-probe alternative correct?
2. **Does tier 3 reintroduce a false settle for a property that IS geometric but
   unknown** — e.g. a future CSS property, or a custom property driving `translate`
   through `@property`? That would be M1's class returning through a new door.
3. **Is the rename in (d) sufficient to make the narrowing binding**, or does the
   precondition also need a runtime assertion (light DOM, div-based RGL) so a
   future caller cannot silently enter M2a's or the shadow route?
4. **Control 11's mutant.** Is "an isolated ignore-all-keyframes mutant" the right
   wrong-implementation to red-leg against, and does control 11 need to assert
   _throw_ or merely _did not return early_?
5. **Are five controls plus two pins the right budget**, or does any proposal in
   §2.3 still have no discriminator? Count guards named against mutations made.

## 2.6 Evidence boundary

- Every measurement of mine is against the mechanically extracted helper in
  standalone headless Chromium, **not** the live Electron app. The reviewer's
  attack-3 and duration measurements used the real app fixture; its Electron probe
  reused the existing `.vite/build/main.js` without a rebuild, which it declares.
- **M4 was not independently re-measured by me.**
- Proposal (c)'s feasibility and its shadow-tree limit were both measured. The
  remaining routes in revision 1's question 1 were attacked by the reviewer and
  found clear **in Chromium 143 only**.
- **No CI cycle has been spent, and no code has been written.**
- Local greens on this machine are not stability evidence: every local Class D
  measurement on this box reads exactly zero.
