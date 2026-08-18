# Remediation plan — the settle helper's contract (PR #144, Codex round 4)

**Author:** BaggyG-AU with Claude Opus 5, revision 4 of 2026-08-18

**Reviewer:** OpenAI Codex — revisions 1, 2 and 3 each reviewed BEFORE any code
was written, all CHANGES-REQUIRED
(`docs/reviews/ci-unstable-tests-codex-round4-plan-review.md`,
`…-rev2.md`, `…-rev3.md`)

**Owner gate:** on 2026-08-18, after being shown that this branch has produced a
defect per change set — including a regression in revision 3 of this very plan —
the owner **NARROWED THE IMPLEMENTATION SCOPE TO THE TWO PROVEN BUGS** plus the
honest documentation corrections. Everything else becomes a declared limitation
or a follow-up. That decision is the subject of this revision.

## Revision history

| Rev | What changed                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | First plan. CHANGES-REQUIRED ×4.                                                                                                                                                                        |
| 2   | Full amended Option A + repair `clip-path`. CHANGES-REQUIRED: tier 3 refuted.                                                                                                                           |
| 3   | Tier 3 deleted; `clip-path` declared per the owner's reversal; numbers measured. CHANGES-REQUIRED: unsound precondition, partial sweeps, **and a REGRESSION — proposal (i) was silently lost**.         |
| 4   | **Scope narrowed by the owner to the two proven bugs.** Proposal (i) RESTORED. My revision-3 evidence errors corrected. Everything not implemented is explicitly DECLARED rather than silently dropped. |

---

# PART 1 — FOR THE OWNER

## 1.1 What you decided and why

You narrowed this to **the two bugs that are mechanically certain and measured in
the real app**, after I showed you a record of defects I had introduced.
⚠ **CORRECTED 2026-08-18 (QA audit finding F6): I wrote that EVERY change set I
implemented introduced a defect. That universal is false and the audit refused it.**
What is supportable is **four defect-producing change sets** — `9932eef` (controls
that raced reflow), `fae0904` (wrong animation population), `8b8dae9` (pseudo-element
animations admitted), and `b3dc2e5` (this plan's lost proposal (i)). Other commits on
the branch have no identified introduced defect. **The scope decision never needed
the stronger premise, and I should not have used it.**

**In scope:** the two real bugs, one guard test for each, and the documentation
corrections — including telling the truth about everything left open.

**Out of scope, and therefore DECLARED rather than fixed:** the ancestor
false-settle, `requestAnimationFrame` creep, unrecognised properties such as
`clip-path`, the shadow-tree route, the helper rename, and the runtime
precondition.

## 1.2 What actually gets fixed

| Bug                                                                                                                  | Evidence it is real                                                                                                                                                           | What changes                                                              |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| The helper misreads animation data, so **every** keyframe animation looks like it is moving a card, even a pure fade | Decisive by reading, and measured in the real app: the data came back carrying the extra field exactly as predicted, and the helper failed while the card sat perfectly still | Read the four standard bookkeeping fields as bookkeeping, not as movement |
| `visibility` is listed as harmless when in some layouts it changes a box's size                                      | Reviewer measured a table row collapsing from 80 px to 0 while a flex item kept its box                                                                                       | Remove it from the harmless list, so it is treated cautiously             |

Each gets **one guard test proven to fail against the current broken code first.**

## 1.3 What stays broken, stated plainly

None of these is reachable in the app today, and none can be hit by a user — this
is a test helper. They are traps for a future test author, and they will be
labelled as traps in the code, not left silent.

1. **A container of the canvas being resized** — the helper cannot see it and will
   report the cards as stopped. Measured: **9.995 px** of unfinished movement
   against a 2 px tolerance.
2. **Frame-by-frame JavaScript motion** — creates nothing the helper can ask about.
   Measured: returns in 145 ms with **9.9911 px** still to travel.
3. **A cosmetic property the helper does not recognise**, e.g. `clip-path` — it
   waits and then fails loudly. Deliberate, and the only sound option available.
4. **Shadow-DOM containers** — invisible to the check the helper would use.

## 1.4 What I am doing differently, mechanically

You said I create regressions when I implement changes. That was correct, and the
cause was specific: I rewrote this document wholesale, gave a new item a letter
that was already taken, and the last item fell off the end — nine proposals in,
eight out. I already follow a strict "never rewrite from memory, always diff the
result" rule for the project's memory store; I had simply never applied it to a
document in the repository.

Three changes, all mechanical rather than intentions:

- **A dropped-commitment check.** ⚠⚠ **CORRECTED 2026-08-18 after the QA audit
  (finding F5): an earlier version of this line said the check "runs on every
  revision from now on". THAT WAS FALSE.** A repository sweep found no script,
  workflow, hook or manifest implementing it. What actually happened is ONE manual
  episode: a shell script in a session scratchpad, **not committed**, proven to
  catch the regression it was built for and quiet against an unchanged file, which
  did catch a control renumbering in this very revision. **Intent in a plan cannot
  execute itself.** Promoting it to `tools/` is a post-merge candidate for the
  owner; until then this is a habit, not a guarantee.
- **Every guard test carries the same required fields**, so a missing number is
  visible rather than hidden behind an adjective.
- **Any new mechanism is attacked against the counterexample already in the
  document before it is proposed.** My revision-3 precondition failed precisely
  because I did not do this — I proposed a shadow-DOM check while the defeating
  shadow-DOM case sat a few paragraphs above it, unread.

---

# PART 2 — TECHNICAL DETAIL

## 2.1 In scope

**(a) M3 — the metadata exclusion.** Exclude exactly the four
`BaseComputedKeyframe` members `offset`, `computedOffset`, `easing`, `composite`
when deriving animated property names from `effect.getKeyframes()`. Unknown and
custom properties **continue to fail closed**, exactly as
`tests/support/dsl/canvas.ts:472-480` already does.

**(b) M2a — remove `'visibility'` from `NON_GEOMETRIC`** (`canvas.ts:406`), making
it conservative.

**(c) TWO CONTROLS, each red-legged in the real app fixture before it is believed.**
Both use the **production entry point** — no test-only seam, which revision 3
proposed and the reviewer replaced with a better construction.

| #   | Control                                                                   | Required fields (all mandatory; a blank is a defect)                                                                                                                                                           |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10  | deny-listed `opacity` keyframe via `Element.animate()` on a measured card | **must RETURN**; explicit budget `timeoutMs: 5000` (default); assert return **within 1000 ms**; all four axes unchanged; animation asserted **live before AND after**; **red against `f78af0d`**, which throws |
| 12  | live `visibility` transition on a measured card in the real RGL fixture   | **must BLOCK**; explicit shortened budget `timeoutMs: 1500`; assert **throw** and wall **< 2500 ms**; assert the transition is **live before**; **red against `f78af0d`**, which returns                       |

⚠⚠ **CONTROL 11 IS RESTORED, 2026-08-18 — DROPPING IT WAS MY ERROR (QA audit
finding F2 / claim 18).** I reasoned that a geometric-keyframe control cannot be red
against the old `computedOffset` code — which is TRUE, because that bug blocks
_every_ keyframe — and wrongly concluded it therefore had no purpose. **Its purpose
is rejecting a DIFFERENT wrong implementation: one that ignores every keyframe,
which would pass Control 10 and still falsely settle during real geometric keyframe
motion.** The revision-2 review said exactly this — _"The pair … proves the two
directions"_ and _"Do not delete the geometric-keyframe direction"_ — and I deleted
it anyway.

| #   | Control                                                            | Required fields                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | **geometric WAAPI keyframe** on a measured card (e.g. `translate`) | **must BLOCK**; explicit shortened budget; assert **throw** with the expected error identity; animation live **before AND after**; forced geometric endpoint asserted; **red against an "ignore all keyframes" mutant** — NOT against `f78af0d`, which passes it for the wrong reason |

⚠ **Control 12 is still under-specified** and the audit was right to say so: it needs
the exact animation duration (long enough that it cannot end inside the 1500 ms
budget and turn the required throw into a return), the expected timeout error
identity, live-**after**, unchanged-axes/endpoint evidence, and cleanup. **Those
fields are owed before implementation.**

⚠ **Control 10 remains the member that rejects the old `computedOffset` code.**

**(d) ⭐ RESTORED — THE FOUR-SURFACE CLAIM REPAIR (revision 2's proposal (i),
silently lost in revision 3).** Classified by role — _text that teaches a reader
what this helper certifies_:

1. the helper docblock, `tests/support/dsl/canvas.ts:214-335` — delete the
   `LAYOUT_PROPS` prose (the identifier exists nowhere in code) and state what is
   certified and what is not, including every item in §1.3;
2. `tests/e2e/card-geometry-discriminators.spec.ts:1-14` and `:125-153` — says
   "STOPPED MOVING" and "WAIT FOR THE GRID TO STOP MOVING";
3. the live PR #144 body — the superseded allowlist account, and the two
   misattributed identities corrected to `e2e/icon-color.spec.ts` and
   `e2e/card-background.spec.ts` as **not baselined**, with the disposition
   weakened from "would fire at every run";
4. this plan.

⚠ `tests/e2e/save-and-backup.spec.ts:186-212,253-265` is **NOT semantically
stale** — it already attributes the wait to RGL reflow. It appears in the trace as
a **cleared** member, not as an absentee.

**Instruments:** a **labelled hand trace** for the semantic half (not mechanically
decidable), plus `bash tools/check-pr-evidence.sh 144` against the **updated** live
body, using its SHA section only for the SHA property it can decide. **Resolve the
head at execution time; do not hard-code a SHA** — revision 3 hard-coded one and it
was stale before the reviewer read it.

## 2.2 Out of scope — DECLARED, with the residual named

Each is written into the docblock as a limitation. **No `KNOWN-OPEN:` pins are
proposed at this scope**, because a pin is new test code and new test code is the
thing the owner just narrowed the scope to avoid. ⚠ **This is a deliberate
reduction of revision 3's commitment and it is stated here rather than dropped
silently** — if the reviewer or owner judges any residual too dangerous to carry in
prose alone, its pin comes back.

| Residual                       | Measured behaviour                       | Why not fixed now                                                        |
| ------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------ |
| Ancestor animation             | returns at 66 ms, 9.995 px outstanding   | The fix needs the runtime precondition to be sound; revision 3's was not |
| rAF creep                      | returns at 145 ms, 9.9911 px outstanding | No `Animation` object exists; unobservable to this helper's authorities  |
| Unknown property (`clip-path`) | waits, then throws                       | Owner's reversal; no sound repair exists short of a redesign             |
| Shadow-tree container          | invisible to `document.getAnimations()`  | Depends on the precondition, now out of scope                            |
| Rename + runtime precondition  | —                                        | Owner's scope decision, 2026-08-18                                       |

⭐ **If this helper is revisited, the design to start from is the reviewer's:** a
counterfactual on the _actual target in its actual context_ — seek each animation
to its end, measure, restore — which is property-agnostic and would dissolve the
ancestor, `visibility` and unknown-property problems together. It needs its own plan.

## 2.3 ⚠ CORRECTIONS TO MY OWN REVISION-3 EVIDENCE

All four were found by the reviewer and all are mine.

1. **Measurement B's overhead is 15–41 ms, not 28–41 ms.** One run threw at 1515 ms
   against a 1500 ms budget, which is 15. Arithmetic error in my own summary of my
   own data. The control-9 bound of 2500 ms is unaffected.
2. **Measurement C is NOT "confirmed".** My probe discarded the error message, so I
   cannot show the expected timeout caused the rejection rather than some other
   throw. It stands as **corroborating**, not confirming — the key list
   `[offset, easing, composite, opacity, computedOffset]` is the solid part.
3. **Measurement D rests on ONE corrected run**, not three. The earlier run was the
   contaminated one. Presenting it as three-run evidence was wrong.
4. ⚠ **"`clip-path` appears nowhere in the app" is retracted as an unverified
   universal.** It came from a repository token search, which cannot see antd's
   runtime-injected CSS-in-JS — the exact defect commit `73c174d` retracted on this
   branch. The honest statement: _no `clip-path` transition was observed on a
   measured card in the probes run so far._

⭐ **And a correction to my own rule-13 refinement.** I argued an absolute mutation
ports because drift per sample is size-independent. The size half is right; the
reviewer's correction is that the **rounding outcome still depends on real scheduler
gaps**, and a nominal 32 ms delay is not a real 32 ms interval under CI load. One
local 145 ms observation is not portability. **The refinement is narrowed, not
withdrawn: absolute mutations remove dependence on subject SIZE, and nothing more.**

## 2.4 Must NOT change

The ±2 px tolerance at `tests/e2e/save-and-backup.spec.ts:267-271`; the exact
`_havdm_layout` assertion; the grid-relative arithmetic; Classes A–C; `src/`;
`tests/baseline/expected-failures.json`; the measured-target exclusions for
descendants and pseudo-elements; the running-or-pending test; the fail-closed
treatment of unknown properties. **No tier 3 in any form. No geometric allowlist.
No property name added to any list from memory.** Historical reviews and commit
messages are evidence and must not be rewritten. Nothing re-baselined.

## 2.5 Dropped-commitment check, revision 3 → revision 4

⚠⚠ **CONTROL NUMBERS ARE STABLE IDENTITIES AND ARE NOT RECYCLED.** The two
surviving controls KEEP the numbers revision 3 and its review gave them —
**10** (opacity keyframe) and **12** (`visibility`) — so gaps at 9, 11 and 13 are
deliberate. My first draft of this revision renumbered them 9 and 10, which is the
same identifier-recycling that produced revision 3's regression; the check below
is what surfaced it.

Run mechanically, because this is the control for the regression that produced this
revision. **Every drop below is intentional and justified here**; the check
produces a worklist, not a verdict.

- Controls 9, 11, 13 and the three `KNOWN-OPEN:` pins — dropped by the **owner's
  scope decision** (§1.1), and each corresponding residual is declared in §2.2.
- Proposals (d) rename, (g) runtime precondition — same decision, declared in §2.2.
- Proposal (c) ancestor fail-closed — same decision; the residual is declared with
  its measured magnitude.
- ⭐ Revision 2's proposal (i) is **restored** as §2.1(d), reversing revision 3's
  regression.

## 2.6 Evidence boundary

- The two in-scope bugs are the most independently corroborated findings on this
  branch: each verified by code reading, by my own harness, and by the reviewer.
- §2.3 addresses the evidence errors the reviewer found in revision 3. ⚠ The
  earlier claim that it corrects **every** such error was audited false (QA
  audit claim 20): Control 12's required fields remain owed — see §2.2 above.
- No implementation code has been written. ⚠ The earlier claim that no CI
  cycle had been spent was audited false (QA audit finding F1): every
  documentation push after `f78af0d` triggered a CI + Regression Suites pair.
- Local greens are not stability evidence: every local Class D measurement on this
  box reads exactly zero.
- The probe spec behind the real-app measurements was deleted; those numbers are
  not re-runnable from the tree as it stands.
