# Remediation plan — the settle helper's contract (PR #144, Codex round 4)

**Author:** BaggyG-AU with Claude Opus 5, 2026-08-17

**Reviewer:** OpenAI Codex — plan review commissioned BEFORE any code is written,
per the owner's spec-before-code ruling of 2026-08-16

**Owner gate:** the owner chooses between Options A, B and C in §1.5; this
document decides nothing on its own and no code has been written for it.

---

# PART 1 — FOR THE OWNER

This part is written to be judged without reading any code. It is one page.
Part 2 exists so the reviewer can attack the detail.

## 1.1 What the thing is

One test helper, `getCardRectsRelativeToGridSettled`, in
`tests/support/dsl/canvas.ts`. Its job is small: **wait until the cards on the
canvas have stopped moving, then measure where they are.** It exists because the
canvas animates card positions over 0.2 seconds, and a test that measures during
that window records a card mid-flight and fails for no real reason. That was the
"Class D" flake this whole pull request set out to fix.

It is used by exactly two test files. It is not product code and no user ever
runs it.

## 1.2 What round 4 found

Five problems. They are not equally serious, and the difference matters:

**Two are plain bugs that make good tests fail.** I reproduced both on my own
instrument, built separately from the reviewer's.

1. A mistake in how the helper reads animation data means **every** keyframe
   animation looks like it is moving a card — even one that is only fading
   something in. Effect: the helper waits, gives up, and fails a test that should
   have passed.
2. A purely cosmetic effect (`clip-path`, which crops what you see without moving
   anything) has the same effect for a different reason.

**Two are promises the helper cannot keep.**

3. If something _containing_ the canvas is being resized, the helper cannot see
   it at all — the browser simply does not report it — and it will declare the
   cards "stopped" while they are still growing. I measured **10 pixels** of
   unfinished movement, against a test tolerance of 2 pixels.
4. Motion driven frame-by-frame by JavaScript (rather than by the browser's own
   animation system) creates nothing the helper can ask about. **This one cannot
   be fixed by looking harder.** No amount of code makes it observable.

**One is out-of-date writing.** The helper's own documentation, and the pull
request description, still describe how the code worked two commits ago. I
verified this decisively: the documentation names a list called `LAYOUT_PROPS`
that **no longer exists anywhere in the codebase**.

## 1.3 The pattern worth your attention

Rounds 1, 2, 3 and 4 all came back "changes required". Rounds 3 and 4 each found
a defect _introduced by the previous round's fix_. And findings 3 and 4 above are
the same underlying thing as several earlier ones:

> **The helper's documentation promises to detect _any_ motion. The code can only
> detect _some_ motion. Every round finds another example of the gap.**

Patching examples one at a time has not converged in four rounds. I do not think
a fifth would be different, because the list of ways a browser can move a box is
open-ended and one of them (finding 4) is provably unobservable.

## 1.4 What I recommend, and what it costs

**Narrow the promise to what the helper can actually deliver, and fix the two
plain bugs.** Concretely: say plainly in the documentation that it certifies the
canvas's _own_ card-reflow animation and nothing else; make it **fail loudly**
rather than silently when it detects a situation it cannot judge (that closes
finding 3 honestly); fix the two bugs; and correct the stale writing.

- **Cost:** one code change to one test file, two new guard tests, and rewritten
  documentation. One CI acceptance cycle (~27 minutes × 3 runs).
- **What could go wrong:** the narrowed helper will occasionally refuse to
  certify and fail loudly where today it would quietly return a wrong number. I
  think a loud failure is strictly better than a silent wrong measurement, but it
  is a real change in behaviour and it could surface as a new flake. The two new
  guard tests are themselves new code on a branch where three of the author's own
  earlier guard tests turned out to be flaky — so they must each be proven to
  fail against the broken code first, in the real app, not a synthetic page.
- **What it does NOT do:** finding 4 stays open forever. Under this option that
  is a _declared boundary_ instead of a hidden hole.

## 1.5 Your three options

|       | Option                                                     | What you get                                                                        | What it costs                                                                                                                                                                                  |
| ----- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** | **Narrow the promise + fix the two bugs** ⭐ recommended   | Every hole is either closed or explicitly declared. The round count stops climbing. | One code change, two guards, one CI cycle. Finding 4 permanently out of scope.                                                                                                                 |
| **B** | Chase full generality — try to detect every kind of motion | Broader coverage of hostile cases                                                   | High, and **it cannot fully succeed** — finding 4 is unobservable. Likely more review rounds on a test helper, against your standing direction that testing work is crowding out product work. |
| **C** | Fix only the two plain bugs, leave the promise as written  | Cheapest                                                                            | The documentation stays untrue, and findings 3 and 4 stay as silent holes a future test author walks into.                                                                                     |

⚠ **One thing I want to be honest about.** Every hostile case the reviewer built
is, as far as I can measure, **not reachable in today's app** — nothing scales the
canvas's container, nothing uses `clip-path`, and the canvas animates through the
browser's animation system rather than frame-by-frame JavaScript. So this is
about the helper being _trustworthy for the next person who uses it_, not about a
bug users can hit today. If you would rather spend the time on product work and
accept Option C, that is a defensible call and I will say so plainly in the pull
request rather than dressing it up.

---

# PART 2 — TECHNICAL DETAIL FOR THE PLAN REVIEWER

## 2.1 Verification status of each round-4 finding

Every finding was checked against the source before anything was proposed. **A
finding is a hypothesis**; the column that matters is how it was checked.

| Finding                                      | Verified how                                                                                                                                                                                                                                                                                   | Status                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **M1** ancestor animation invisible          | Code reading + my own harness: ancestor `scale 200s` outside the grid, `grid.getAnimations({subtree:true})` returned **0** animations, helper returned at **66.2 ms**, residual after forcing the endpoint **x 1.999 / y 2.9985 / w 9.995 / h 7.996 px** — three axes over the ±2 px assertion | **CONFIRMED**                                                                      |
| **M2a** `visibility` wrongly deny-listed     | Code reading: `'visibility'` is at `tests/support/dsl/canvas.ts:406`. CSS Display 3 gives `collapse` layout effects in table/flex formatting contexts                                                                                                                                          | **CONFIRMED as a contract defect; NOT reachable in the current div-based RGL DOM** |
| **M2b** `clip-path` omission → false timeout | My harness: `transition: clip-path 200s` on the measured item, box bit-identical, helper **threw at 524.1 ms** on a 500 ms budget                                                                                                                                                              | **CONFIRMED**                                                                      |
| **M3** `computedOffset`                      | Code reading: the exclusion at `:466` is exactly `offset`/`easing`/`composite`; `computedOffset` is a **mandatory** member of `BaseComputedKeyframe` in Web Animations 1. My harness: deny-listed `opacity` keyframe on the measured item **threw at 527.9 ms** with the box bit-identical     | **CONFIRMED — the most clearly wrong of the five**                                 |
| **M4** rAF residual                          | Code reading is decisive: `getAnimations()` is the gate's sole motion authority and a rAF loop creates no `Animation`. ⚠ **I did not independently re-measure this**; the 71 ms / 10 px figure is the reviewer's                                                                               | **CONFIRMED by construction; reviewer-measured only**                              |
| **M5** claim surface                         | `grep -rn LAYOUT_PROPS tests/ src/` returns **only two hits, both in the docblock** (`:288`, `:321`) — the identifier exists nowhere in code                                                                                                                                                   | **CONFIRMED decisively**                                                           |

⭐ Two findings were reached independently before the review was read: M5's
artifact half (the `icon-color` / `card-background` misattribution) and the
per-attempt run data behind it. Two separate measurements agree.

## 2.2 The harness

`extract.cjs` pulls the page-side algorithm out of `canvas.ts` **by brace
matching, never retyped**, gated on six required substrings (`NON_GEOMETRIC`,
`stillMoving`, `getAnimations`, `pseudoElement`, `getKeyframes`, `Math.round`) so
a refactor kills the extraction instead of silently testing nothing. `esbuild`
bundles it (4,365 bytes) and it runs in real headless Chromium.

**It is bidirectional and carries a liveness control in each direction**, because
a uniformly-blocking or uniformly-returning instrument reads as a clean result:

```text
L-RETURN  no animation at all         want RETURN  got RETURN  65.8 ms   ✅
L-BLOCK   item transform 4s           want BLOCK   got BLOCK  523.8 ms   ✅  (round-2 case)
M3        opacity keyframe on item    want RETURN  got BLOCK  527.9 ms   ⚠ defect
M2b       clip-path on item           want RETURN  got BLOCK  524.1 ms   ⚠ defect
M1        ancestor scale              want BLOCK   got RETURN  66.2 ms   ⚠ defect
```

## 2.3 Proposed changes — Option A

⚠ **No code has been written. This is the proposal for review.**

**(a) M3 — derive the metadata exclusion from the canonical schema.** Exclude
exactly the four `BaseComputedKeyframe` members — `offset`, `computedOffset`,
`easing`, `composite` — rather than a hand-written three. Unknown and custom
properties must continue to fail closed (keep waiting).

**(b) M2a — remove `'visibility'` from `NON_GEOMETRIC`.** It becomes
possibly-geometric, i.e. conservative. Nothing in the app transitions
`visibility`, so this cannot cause a live wait today.

**(c) M1 — fail closed on what the helper cannot judge.** Query
`document.getAnimations()` (whole document, not the grid subtree), and if any
running effect targets an **ancestor** of the grid container, **throw** with a
message naming the element — rather than returning a number it cannot stand
behind. This is the honest closure: the helper does not need to model how an
ancestor transform propagates into a `DOMRect`; it only needs to refuse.

**(d) M4 + M2b — narrow and state the contract.** Rewrite the docblock to say
what is certified (react-grid-layout's own `transform`/`width`/`height`
transitions on the measured elements, plus a fail-closed refusal on ancestor
animation) and what is explicitly **not** (rAF creep; any property the browser
does not report). Delete the `LAYOUT_PROPS` prose entirely. Keep the deny-list's
conservative direction and document that an unlisted paint-only property causes a
bounded wait **by design**.

**(e) M5 — correct the claim surface.** Docblock rewritten from `f78af0d`; PR body
Class D mechanism/residual paragraphs rewritten; the "needs fresh
commit-addressed runs" bullet marked superseded; and the two misattributed
identities corrected to `e2e/icon-color.spec.ts` and `e2e/card-background.spec.ts`
with "not baselined" rather than "baselined consistent failure". The disposition
language weakens from "would fire at every run" to "did not recur in five further
runs, and `f78af0d` has no call path to either spec".

**(f) Two new controls, each red-legged in the REAL app fixture first.**

- **Control 9 — ancestor false settle.** Animate an ancestor of `.react-grid-layout`
  with a long `scale`; the helper must throw. ⚠ Rule 13: the magnitude must be
  re-derived at the real ~288 px card, not carried over from the 100 px synthetic
  page. Must be proven red against `f78af0d` (where it returns early).
- **Control 10 — deny-listed keyframe false timeout.** A long `opacity` keyframe
  via `Element.animate()` on a measured card; the helper must return promptly and
  the animation must still be running at return. Must be proven red against
  `f78af0d` (where it throws).

⚠ **No control is proposed for M2a or M4.** M2a needs a table/flex formatting
context the app does not have, and M4 is unobservable by construction — a control
for either would assert the _current_ behaviour, so if the owner wants them
pinned, the honest form is a `KNOWN-OPEN:` test that asserts what is true today.

## 2.4 Must NOT change

The ±2 px tolerance at `tests/e2e/save-and-backup.spec.ts:267-271`; the exact
`_havdm_layout` assertion; the grid-relative arithmetic; Classes A–C; `src/`;
`tests/baseline/expected-failures.json`; the four accepted geometry-population
non-conversions; the measured-target exclusions for ordinary descendants and
pseudo-elements. **The deny-list must not become a geometric allow-list — that is
the round-3 defect.** Nothing is to be re-baselined and no identity allowlisted.

## 2.5 Questions I want the plan reviewer to attack

1. **Is (c) actually fail-closed?** `document.getAnimations()` covers the whole
   document — but is an effect on an ancestor of the grid always _reachable_ from
   it, and can an ancestor animation be running while `document.getAnimations()`
   omits it (e.g. inside a shadow root, or an ancestor in a different document
   such as an iframe)? If so (c) is a partial closure being sold as a complete one.
2. **Does (c) introduce a false-timeout class of its own?** Any benign ancestor
   animation — an antd drawer or modal transition, a route change — would now
   throw. Is that reachable in the app during either sample point in
   `save-and-backup.spec.ts`? If yes, (c) trades a rare silent error for a common
   loud one, which is worse.
3. **Is the four-member `BaseComputedKeyframe` exclusion in (a) complete** against
   what Chromium actually returns, or does it too need to come from a runtime
   probe rather than a specification reading?
4. **Is narrowing the contract legitimate here at all**, or is it the
   "shrink the claim until it is true" move dressed up — given the helper's two
   callers and that `save-and-backup.spec.ts` genuinely needs a cross-moment
   comparison?
5. **Control 9's magnitude.** What ancestor `scale` duration discriminates at a
   ~288 px card _and_ stays under the hundredth-pixel rounding guard's
   resolution? Rule 13 says my synthetic figure will not port.

## 2.6 Evidence boundary

- Every measurement above is against the mechanically extracted helper in
  standalone headless Chromium, **not** the live Electron app. It proves the
  algorithm's return/timeout behaviour, not the natural frequency of these routes.
- M4 was not independently re-measured by me.
- No CI cycle has been spent on this plan, and no code has been written.
- Local greens on this machine are not stability evidence: every local Class D
  measurement on this box reads exactly zero.
