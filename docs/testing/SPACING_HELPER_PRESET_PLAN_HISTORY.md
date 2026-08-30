# Spacing-helper preset plan — REVIEW HISTORY

Companion to [`SPACING_HELPER_PRESET_PLAN.md`](SPACING_HELPER_PRESET_PLAN.md).
**This file is the RECORD. It specifies nothing.**

⚠⚠ **WHY THIS FILE EXISTS, MEASURED.** The great majority of the findings raised
after round 1 were defects introduced by the previous round's own repairs, against
a specification of roughly 120 lines. **The running figures are stated ONCE, in
§7.5 of [`SPACING_HELPER_PRESET_PLAN.md`](SPACING_HELPER_PRESET_PLAN.md), and this
paragraph deliberately carries none of them.** The per-round disposition tables and
self-check records below are where the count-drift and stale-reference defects
lived (SP-5, SP-22 twice), because they restate facts the specification also
states.

⚠⚠⚠ **AND THE CLAIM THIS PARAGRAPH USED TO MAKE WAS FALSE WHEN IT WAS WRITTEN.**
Revision 6 said here that separating the record means an edit to it "can no longer
contradict the specification" — and then stated the live totals in this very
paragraph while the SP-22 row below claimed this file stated none. **A FILE
BOUNDARY IS NOT A CONSISTENCY MECHANISM.** The split was worth doing, but what
actually prevents the defect is the mechanical check (C3), not the file boundary;
C3 reads **both** files as of PR #154 and is keyed on how many sites state a
total, not on whether they currently agree.

⭐ **Nothing here was rewritten in the move.** The two sections were relocated
verbatim and the move is verified by line accounting. ⚠ **Stated at the strength
the reviewer allowed and no higher (round 6, G2):** every non-blank line of the
pre-split plan is **accounted for** — the two moved blocks byte-identical, the
live-plan deletions each a recorded revision-6 replacement. "Appears exactly once"
is not literally decidable for repeated blank and separator lines, and revision 6
claimed it anyway.

**The specification, the blast radius, the harness and the live weakest claims
stay in the plan.** Only the round-by-round record moved.

---

## 9. Disposition of the independent review

Review: `docs/reviews/spacing-helper-preset-plan-codex-review.md`, commit
`6694a61ff32f79d260f0085bf1973233bd84c005`, reviewed head `c9015598`, verdict
**SEV-1-BLOCKED**, reviewer OpenAI Codex / GPT-5.6 Sol.

⭐⭐⭐ **ALL SIX FINDINGS WERE INDEPENDENTLY RE-VERIFIED BY THE AUTHOR AT SOURCE
BEFORE BEING ACCEPTED — SIX FOR SIX, NONE FALSE.** A reviewer's finding is a
hypothesis too, and the same discipline the commission demanded of the reviewer
is owed back to it. Each row below states what was checked.

| ID       | SEV | Verdict      | What changed, and where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------- | --- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-1** | 1   | **RESOLVED** | **Owner ruled: remove the pre-wait entirely.** §4.4's `openSelectDropdown` no longer calls `waitForAllSelectDropdownsToClose()`; the trailing global wait in `selectOptionByText` is replaced by a **scoped** post-condition on the owning combobox's `aria-controls`. §4.3's recommendation rewritten. §6 legs 1/2/5 are runnable again; leg 4's animation caveat withdrawn; **new legs 7 (stable foreign popup) and 8 (owned popup mid-leave)** added, both named by the review. _Verified:_ read plan `:507-516` against `:793-797` — the collision is real and the author built it in.                                                                                                                                                                                                                                                                                                                                                                                   |
| **SP-2** | 1   | **RESOLVED** | **The causal claim is RETRACTED as false, in all four places the review swept** (§2.3, §4.4, §10's SR-5, and the §8 bullet). **Owner ruled: retain a bounded retry, re-gated on OWNERSHIP**, with `force: true` and the `evaluate` click still removed. **New leg 9** covers the retry-success path the false rationale had erased. ⚠⚠ **THIS ROW CARRIED A SECOND FALSE MECHANISM UNTIL REVISION 4 (SP-11).** It said the correction "strengthens the ownership case: route (b) needs no `force`, because Playwright's hit-target check is TOCTOU" — **that replacement explanation was itself refuted by SP-7** (`playwright-core/lib/server/dom.js:360-401` blocks and RETRIES a displaced click). **The sentence is struck; route (b)'s mechanism is unexplained by design — see §2.3 and the SP-7 row.** _Verified:_ traced `tests/support/dsl/spacing.ts:37-49` — attempt 1's throw exits the function; line 49 is unreachable via a throwing click. That half stands. |
| **SP-3** | 1   | **RESOLVED** | Legs 2/3 now specify **`mousedown`, capture phase, one-shot and self-removing**, plus three **post-gesture** assertions (padding combobox has no `aria-controls`; foreign popup still visible; the pointer action completed) and a proof the listener is gone before the next leg. _Verified:_ `@rc-component/select/lib/SelectInput/index.js:117` → `toggleOpen()` at `:138`, bound as `onMouseDown` at `:185`. ⚠ The author had read `:185` earlier in the same session for another purpose.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **SP-4** | 2   | **RESOLVED** | §0 now says **three** decisions. §7.4 rewritten as a full six-field Owner Decision Brief with A/B/C options and costs. **Owner ruled A — fix lane.** ⓘ The reviewer's contrary reading of `OPERATING_AGREEMENT.md` §3.7 is recorded in the brief rather than resolved away, and the ruling explicitly does **not** amend §3.7.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **SP-5** | 3   | **RESOLVED** | The "~20 further files" approximation is **deleted**; the regenerating command is now the sole token inventory, with its blind spot stated. _Verified:_ regenerated — **33 files, 30 beyond spacing/tabs/popup**. The author's figure was wrong.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **SP-6** | 3   | **RESOLVED** | The do-nothing sentence in §5.2 no longer predicts that the next flake **will** appear in `tabs`/`popup`; it states the risk and keeps their sightings explicitly undiagnosed. _Verified:_ plan `:732` said what the review quoted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### Round 2 — the STRAT-D7 scoped follow-up

Review: `docs/reviews/spacing-helper-preset-plan-codex-followup-review.md`, commit
`a8cba46`, reviewed head `f2b0ed5a`, verdict **SEV-1-BLOCKED**. It disposed SP-1
and SP-3 **PARTIALLY RESOLVED**, **SP-2 REGRESSED**, SP-4/SP-5/SP-6 **RESOLVED**,
and raised four new findings. ⭐ **All four were re-verified at source by the
author before acceptance — as were round 1's six. Ten for ten; this reviewer has
produced no false finding.**

| ID        | SEV | Verdict                  | What changed, and where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | --- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-7**  | 1   | **RESOLVED BY DELETION** | The revision-2 TOCTOU mechanism is **retracted**, and **no third mechanism is offered** — §2.3 now leaves route (b)'s mechanism explicitly unexplained, which is the reviewer's own remedy. _Verified:_ Playwright 1.57.0 installs the hit-target interceptor for non-force clicks (`playwright-core/lib/server/dom.js:360-380`); the injected listener computes the hit target at **event time** and on mismatch calls `preventDefault`/`stopPropagation`/`stopImmediatePropagation`; the mismatch is returned at `:388-401` and the action retried. A displaced ordinary click is **blocked, not delivered**. |
| **SP-8**  | 1   | **RESOLVED**             | Legs 2/3's suppression now lasts the **whole helper call**, counts every suppressed `mousedown`, and is removed in `finally`, with four post-call assertions including a suppression count of **2**. ⓘ The reviewer named this the round's unpredicted case: **neither repair was wrong alone** — SP-3's event fix was right and SP-2's retry was the owner's ruling; the defect was the **interaction**, invisible in prose.                                                                                                                                                                                   |
| **SP-9**  | 1   | **RESOLVED**             | Leg 8 gains a construction (widen the CSS leave test-side, assert the mid-leave state immediately before invoking) and **ONE oracle** — the helper re-opens and selects successfully; the "either/or" is gone. Leg 9 gains its own one-shot construction, explicitly not reusing leg 2's whole-call listener.                                                                                                                                                                                                                                                                                                   |
| **SP-10** | 2   | **RESOLVED**             | `resolveOwnedDropdown` now takes a **single shared budget** and threads `remaining()` through **every** wait, so the advertised 1500 ms first attempt is what the code actually bounds. ⭐ Per the reviewer's brief, the **number itself is not frozen**: legs 4 and 9 characterise it first.                                                                                                                                                                                                                                                                                                                   |

⚠⚠ **AND A CHANGE NO FINDING ASKED FOR, DISCLOSED RATHER THAN SLIPPED IN:
THE OWNERSHIP MECHANISM ITSELF WAS REPLACED.** Between round 2 and revision 3
the harness ran and **falsified option A** — the `aria-controls` id is the
constant `test-id` in test mode, shared by every Select (§4.2). The owner re-ruled
on 2026-08-27, selecting **option D**. ⓘ **Read this row with revision 4's outcome
in view: option D was itself falsified the same day (M6) and replaced by option B**
— so this paragraph records what revision 3 disclosed, not what the plan now
proposes. §4.3 carries the current ruling.

**Guard rails carried forward from the review, unchanged:** keep **P1**
identity, **P2** subtree scope, **P3** real clicks, **P4** read-back; the
no-manifest / no-snapshot rule; §7.3's leg-3 halt if a valid scope-only
discriminator refutes the plan; and **never** restore `force: true` or the
`evaluate((el) => el.click())`.

### Round 3 — the STRAT-D7 scoped follow-up 2

Review: `docs/reviews/spacing-helper-preset-plan-codex-followup2-review.md`, commit
`2819810`, reviewed head `40b255645db6e3a4e5050e8b9508441ef1a215dd`, verdict
**SEV-1-BLOCKED**. It disposed **SP-7, SP-8 and SP-10 PARTIALLY RESOLVED**, **SP-9
RESOLVED**, and raised four new findings. ⭐⭐ **All four were re-verified at source
by the author before acceptance; the running tally is in §7.5 of the plan. This
reviewer has still produced no false finding.**

| ID        | SEV | Verdict                                                              | What changed, and where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------- | --- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-11** | 1   | **RESOLVED**                                                         | The two live survivors of the deleted TOCTOU mechanism are gone: §8's "what survives as a genuine weak claim" bullet is **deleted and replaced by the retraction**, and §9's SP-2 row's "because Playwright's hit-target check is TOCTOU" sentence is **struck**, with the control-flow half it got right retained. **SP-7's five-site sweep was re-run** across §2.3, §6's honesty limit, §8, §9 and §10/SR-5 — and widened beyond the word "TOCTOU" to `hit.target`, `displaced` and `moved target`, because a token sweep is only as good as its key. _Verified:_ `playwright-core/lib/server/dom.js:360-401`, retried at `:441`; installed version `1.57.0`.                                                                                                                                            |
| **SP-12** | 1   | **RESOLVED**                                                         | Both halves, per the reviewer's own options **A and B**. **(A)** Leg 5's variant is now named and constructible — a **P4-ONLY** variant derived from **SCOPE-ONLY**, so it inherits a document-global opener that demonstrably works; revision 3's "P1 and P2 removed" left no way to obtain a popup at all. **(B)** The false universal "every leg is bidirectional" is **withdrawn** and replaced by a per-leg **KIND** (fail-old/pass-new, guard-removal, known-bad, characterisation), with the bidirectionality requirement restated where it actually belongs — on the harness, not on every row. Legs 8 and 9 are now labelled CHARACTERISATION and explicitly **not** acceptance evidence.                                                                                                          |
| **SP-13** | 2   | **RESOLVED BY MEASUREMENT — and it was worse than the finding said** | The reviewer inferred a transient two-popup state from rc-select's immediate-open/deferred-close asymmetry and asked that the harness keep the case rather than call it impossible. **A probe measured it instead: two popups visible for ~350 ms, three runs of three (M5) — so M3 is FALSE, route (a) is RESTORED and leg 1 with it.** ⚠⚠ **And the same run found what the finding had not: for ~45–67 ms, P1 and P2 BOTH pass on the FOREIGN popup (M6), so option D's inference fails silently rather than loudly.** The owner re-ruled **option B** (§4.3). ⓘ The reviewer's own Owner Decision Brief recommended option A (soften M3, make leg 7 sample the temporal state); **measurement made that choice unnecessary rather than wrong** — the claim did not need softening, it needed replacing. |
| **SP-14** | 3   | **RESOLVED**                                                         | `resolveOwnedDropdown` now uses an **absolute deadline with no floor**: `Math.max(50, …)` is gone, an expired budget **throws** naming the stage it expired at, and each wait receives the positive remainder. _Verified:_ the reviewer's reading was right — with the floor, P1 consuming the whole budget still granted P2 50 ms, so the "one hard shared budget" the comments advertised was not what the code bounded.                                                                                                                                                                                                                                                                                                                                                                                  |

⭐ **What the reviewer cleared, which matters as much as what it blocked:** §5.1's
blast radius (PASS — the published command still returns the same two files, and
independent alias/destructuring searches found no third caller), §5.2's class
statement (PASS), P1–P4's presence (PRESENT), `.ant-select-content-value` as the
single-value node (PASS from installed source), and the `Escape` removal plus the
no-force / no-`evaluate` guard rails (PASS, none restored). ⚠ **§5.1's clearance
is re-asked in revision 4**, because the change is no longer test-only — §5.1a is
new blast radius the reviewer has not seen.

⭐⭐ **AND ONE CLEARANCE THE AUTHOR IS REOPENING AGAINST HIMSELF.** The review
found "no source-backed path by which [option D's] ordinary steady-state flow can
silently report the requested value after selecting a foreign option", naming as
its own weakest inference that it had found no internal actor able to replace the
singleton between the P1 read and the option query. **That clearance was correct
for the property it exercised — a static source boundary the review declared
plainly — and false for the claim it appeared to clear.** The actor exists, it is
rc-select's immediate-open/deferred-close asymmetry, **and the reviewer itself
surfaced it one finding earlier as SP-13**. ⓘ Recorded not as a reviewer error but
as this plan's third instance of one class: **a check is evidence only for the
property it exercises**, and a static boundary cannot decide a temporal claim.

### Round 4 — the STRAT-D7 scoped follow-up 3

Review: `docs/reviews/spacing-helper-preset-plan-codex-followup3-review.md`, commit
`fac11f8`, reviewed head `6f839ec64a5e39a4930a179aa2b60e02b6f130d6`, verdict
**SEV-1-BLOCKED**. It disposed **SP-11 and SP-13 RESOLVED**, **SP-12 and SP-14
PARTIALLY RESOLVED**, and raised five new findings. ⭐⭐ **All five were re-verified
at source by the author before acceptance — nineteen for nineteen across four
rounds. This reviewer has still produced no false finding.**

⭐ **It also did the thing the commission asked hardest for: it attacked option B
as its own recommendation, and the attack landed** — SP-18 corrects a precedent the
author had leaned on and the reviewer had every incentive to let stand.

| ID        | SEV | Verdict      | What changed, and where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | --- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SP-15** | 1   | **RESOLVED** | ⚠⚠⚠ **THE AUTHOR'S OWN DEFECT, AND THE WORST KIND: a repair that deleted something load-bearing.** Revision 4 replaced §4.4 wholesale; the block it replaced contained the caller example ending `await this.expectSelectShows(select, pattern); // P4`, so P4 survived as a definition, an inventory entry and a harness leg with **no call site anywhere in the proposal**. _Verified:_ `grep -n "expectSelectShows"` over revision 4 returned the definition, the §5.3 inventory and leg 5 — no caller; and `git show a39aad3` confirms revision 3 line 637 had the call. **Fixed:** §4.4 now carries the complete rewrite of all three internal callers (`tests/support/dsl/spacing.ts:102-124`), each calling `selectOptionByText` once and then `expectSelectShows` with the SAME pattern object. The removal record the same deletion took is restored too.                                                                                                                                                                                                                   |
| **SP-16** | 3   | **RESOLVED** | `left()` was read in the expiry guard and again in the matcher options, so a guard seeing 1 ms could hand the matcher 0. _Verified at source, and it is worse than the reviewer's SEV 3 implies:_ `playwright-core/lib/server/progress.js:67-75` installs a timer only `if (timeout)`, so **zero means NO deadline** — the replacement could hang to the ambient test timeout where the `Math.max(50, …)` floor it replaced merely overran by 50 ms. **Fixed:** `budgetFor(stage)` reads the remainder **once**, throws if non-positive, and returns that same positive value to the matcher.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **SP-17** | 3   | **RESOLVED** | The KIND rule was written as though it governed every numbered leg while legs 0 and 10–12 sat outside it, and leg 12 was called acceptance evidence against the plan's own first-two-kinds sentence. **Fixed:** the four-kind table is explicitly scoped to mechanism legs **1–9**, a second table categorises **0 (CENSUS), 10 (REGRESSION), 11 (REPEAT), 12 (GATE)**, and the acceptance rule is narrowed to _acceptance that the defect mechanism is repaired_ — legs 10–12 can veto a repair, not establish one. The stale §7 sequence (which still said "leg 0 first (it can falsify option A) … then legs 1–8") is rewritten and now puts the `src/` change first and **leg 1 immediately after**, because leg 1 is the only leg that observes the class in the Electron renderer.                                                                                                                                                                                                                                                                                             |
| **SP-18** | 3   | **RESOLVED** | The `BackgroundCustomizer` precedent was overstated as "five equivalent test-only hooks" and used for durability and lane weight. _Verified:_ `src/index.css:26-40` selects on **all five** to hide leave-transition remnants, so they are **product CSS surface**; and `tests/support/dsl/backgroundCustomizer.ts` does **not** fail closed — `(await this.resolveScopedDropdown(testId)) ?? (await this.resolveVisibleDropdown())` degrades to a document-global popup, and its click path uses `force: true`, which this plan bans. **Fixed** in §0, §4.2, §4.3, §5.1a, §5.3 and §7.4: it is an **API** precedent, it carries less lane weight, and §8's unprotected-hook weak claim stands undiminished. "No markup" is corrected — a class attribute is markup — and `src/components/PropertiesPanel.tsx:6632` is named as `SpacingControls`'s one product consumer. ⭐ **And the correction paid a dividend: that CSS comment — _"hide leave-transition remnants to prevent visible merged menus"_ — is independent corroboration of M5 from another component in this repo.** |
| **SP-19** | 3   | **RESOLVED** | Two live universals ("false … on **every** Select-to-Select transition"; "what the ordinary path does **EVERY TIME**") rested on three recorded runs. **Fixed:** both now state the measured population — the margin-then-padding sequence entered the overlap in each of three runs — and say plainly that reachability is all the plan needs, since option B is immune to the window however often it occurs. ⚠⚠ **Recorded without excuse: this is the same unverified-universal error as M3, in the opposite direction, committed in the very revision that struck M3 for it.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

⚠⚠ **UNDER STRAT-D7 THIS REPAIR ROUND OWES A SAME-REVIEWER SCOPED FOLLOW-UP — no
exemption for a small diff, and this diff is not small.** The fix round is
unreviewed new work; §8's final block lists what it added.

---

### Round 5 — the STRAT-D7 scoped follow-up 4

Review: `docs/reviews/spacing-helper-preset-plan-codex-followup4-review.md`, commit
`f1e7240`, reviewed head `c707cd8b87f182d12bf11c512497ee712e640511`, verdict
**SEV-1-BLOCKED**. It disposed **SP-15, SP-16, SP-18 and SP-19 RESOLVED**, **SP-17
PARTIALLY RESOLVED**, and raised five new findings. ⭐ It also confirmed the
author's own deletion sweep: **all 52 revision-4 lines removed by revision 5 were
accounted for; no silent deletion found.** All five findings were re-verified at
source before acceptance, as every round's have been; **the running tally is
stated once, in §7.5 of the plan.**

⚠⚠⚠ **THE ROUND'S REAL RESULT IS NOT THE FINDINGS — IT IS THAT FOUR OF THE FIVE
WERE DEFECTS REVISION 5 ITSELF INTRODUCED.** The resulting self-inflicted ratio —
stated once, in §7.5 of the plan — not any individual finding, is what produced
the owner's 2026-08-31 structural ruling: move the per-round record out of the
specification, and gate the plan with a consistency checker. **This file is half
of that ruling, and round 6 then showed that this half alone was not enough.**

| ID        | SEV | Verdict                                                      | What changed, and where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | --- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-20** | 1   | **RESOLVED**                                                 | ⚠⚠ **REVISION 5'S OWN DEFECT, CREATED BY ITS SP-17 REPAIR.** The implementation order put leg 1 at step 2 and "then the helper" at step 3 — but leg 1 is FAIL-OLD/PASS-NEW and its REPAIRED side is defined as "the §4.4 helper as proposed", which does not exist yet at step 2. **A contradiction three lines apart.** _Verified:_ plan sequence vs the variant definition. **Fixed:** step 2 is now a **CLASS SMOKE STEP (census kind, explicitly NOT leg 1)** that observes the popup class in the Electron renderer and needs no helper — closing §8's first weak claim where it actually belongs — and leg 1 runs first among the mechanism legs, after the helper and its callers.                                                                                                                                                                                              |
| **SP-21** | 1   | **RESOLVED — and this is the finding that earned the round** | P4 read **only** the requested control, so if that control already showed the wanted value a wrong-control click was invisible. _Verified at source and then MEASURED (§4.2 M8a): a fresh card renders `spacing-margin-mode` as "All Sides", so `setCardMargin(12)` → `setMarginMode('all')` asks for the value already shown — **on the first action of a currently-passing test** (`tests/e2e/spacing.spec.ts:27`)._ **Fixed:** `selectOptionByText` snapshots the OTHER half before the gesture and P4 asserts both that the requested control shows the value AND that the other half is unchanged. ⭐ **The repair was MEASURED SAFE before being written (M8b)** — driving one half moved only that half's control, with a mirroring control leg — and the guard is deliberately "the other half", not "every other Select", because within a half the two controls are coupled. |
| **SP-22** | 3   | **CLAIMED RESOLVED — LATER REGRESSED (round 6)**             | §7.5 still led with "four rounds, fourteen findings" while the header and the record disagreed — one fact in two places. **What revision 6 did:** moved the per-round record into this file and declared the figures stated once in §7.5. ⚠⚠⚠ **AND THAT REPAIR WAS ITSELF DEFECTIVE.** This file's own preamble restated the totals while its version of this row asserted that the file stated none, and the plan's owner-facing section still called it "the fourth review round". **Round 6 disposed SP-22 REGRESSED.** See the round-6 record below for the actual repair, which is mechanical rather than declarative. ⓘ This row is left as the record of what was CLAIMED; the claim is corrected here rather than deleted.                                                                                                                                                    |
| **SP-23** | 3   | **RESOLVED**                                                 | The §8 claim that a budget expiry "now costs a second gesture" was unconditional; the retry clicks only when `isOpen` is false, so an expiry after a successful open costs no gesture. **Fixed:** stated as two branches, with the second named **UNMEASURED** rather than assumed benign.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **SP-24** | 3   | **RESOLVED**                                                 | Revision 5 called `src/index.css:26-40` "independent corroboration of M5" and said someone "hit this exact behaviour". **It records an INTENT, not an observation** — no incident, no two-visible-popup measurement, no margin-to-padding sequence. **Fixed:** restated as a second surface _consistent with_ the mechanism, with M5's runtime support explicitly limited to its three recorded runs. ⚠⚠ **The author WROTE THIS EXACT CHECK into the round-5 commission — "check whether the author has drawn more from that than it supports" — and handed it over instead of running it.** Third documented instance on this project of naming a check and not executing it.                                                                                                                                                                                                        |

### Round 6 — the STRAT-D7 scoped follow-up 5

Review: `docs/reviews/spacing-helper-preset-plan-codex-followup5-review.md`, commit
`30d606c`, reviewed head `e65bb461d181ed364afa0c099a01e6891c45cb85`, verdict
**SEV-1-BLOCKED**. It disposed **SP-20, SP-23 and SP-24 RESOLVED**, **SP-21
PARTIALLY RESOLVED**, **SP-22 REGRESSED**, and raised two new findings. Both were
re-verified at source before acceptance, and **SP-25 was then MEASURED in the
running app rather than accepted on the reviewer's reading** (§4.2 M9 in the plan).

⚠⚠⚠ **BOTH NEW FINDINGS ARE DEFECTS IN REVISION 6's OWN REPAIR OF SP-21, AND
SP-22 REGRESSED — SO THIS IS THE FOURTH CONSECUTIVE ROUND IN WHICH THE MAJORITY OF
FINDINGS WERE SELF-INFLICTED.** The owner's response was to hand the repair to a
fresh session and to rule on two questions rather than accept another promise of
care. Both rulings are recorded in the plan: **SP-25 option (a)** — P4's guarantee
narrowed to wrong-control mutation — and **the reviewer may now supply design text
as a non-binding appendix** (option B of the commissioning question), which round
7's commission is the first to use.

| ID        | SEV | Verdict                                                                                 | What changed, and where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | --- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-20** | 1   | **RESOLVED** (round 5 finding, confirmed by round 6)                                    | Confirmed by the reviewer against the variant definition. No revision-7 change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **SP-21** | 1   | **PARTIALLY RESOLVED → superseded by SP-25/SP-26**                                      | The other-half snapshot closes the case where the foreign value MOVES. It does not close the double-pre-satisfied case (SP-25), and its failure was anonymous (SP-26). Both are dispositioned below; SP-21 itself is not reopened.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **SP-22** | 3   | ⚠⚠ **REGRESSED, and repaired MECHANICALLY this time**                                   | _Verified at source:_ the plan called it "the fourth review round" (`:167-170` at revision 6) while §7.5 said five complete; this file stated the totals at `:6-8` and `:148-152` while claiming at `:161` that it stated none. **Fixed:** the totals live ONCE, in §7.5 of the plan; every other site is a pointer carrying no figure. ⭐⭐ **And the repair is verified by a repaired CHECK, not by care** — see the C3 record below.                                                                                                                                                                                                                                                                                                                                                                              |
| **SP-23** | 3   | **RESOLVED** (round 5 finding, confirmed by round 6)                                    | Confirmed. No revision-7 change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **SP-24** | 3   | **RESOLVED** (round 5 finding, confirmed by round 6)                                    | Confirmed. No revision-7 change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **SP-25** | 1   | ⚠⚠⚠ **RESOLVED BY OWNER RULING — the plan's promise is NARROWED, not the code changed** | When the requested AND foreign controls both already show the wanted value, a wrong-control click changes no value, so both P4 assertions pass. _Verified at source:_ rc-select leaves an already-selected option clickable (`OptionList.js:371-374`), closes the single-mode popup regardless (`:161-170`), and emits `onChange` only when the value changes (`Select.js:314-318`, "Trigger event only when value changed"). ⭐⭐⭐ _Then MEASURED (M9b) in the Electron renderer with a mirroring control leg (M9c) that failed as it must._ **Fixed:** owner ruled option (a) on 2026-08-31 — P4 detects wrong-control MUTATION, prevention is P1's by construction. §3, §4.1, the header promise and §8 are corrected; **leg 5b pins the known-open boundary so it cannot be silently closed or silently lost.** |
| **SP-26** | 1   | **RESOLVED**                                                                            | The other-half assertion polled a bare `(string \| null)[]` with no custom message, so its failure named neither the requested control nor the one that moved. _Verified at source_ against the plan's own "loud AND BY NAME" requirement and leg 5's oracle. **Fixed:** a shared `snapshotOtherHalf` returns a **keyed record**; the poll supplies a custom message naming the requested test id and both guarded ids (`expect.poll` takes `{ message, timeout }` — Playwright 1.57.0, `node_modules/playwright/types/test.d.ts:8455`, read rather than recalled); §4.1's P4 row now states both parts; and **leg 5 must record the exact message and exit code**, as leg 6 already did.                                                                                                                            |

### ⚠⚠⚠ Round 6's real lesson: the check built to prevent SP-22 certified it as clean

**The consistency checker (PR #154) reported a clean pass on revision 6 while three
contradictions were live in the two files.** That was reproduced by execution, not
inferred: `checkPlan` run against revision 6 returned **zero findings**. Three
defects produced that green, and each is a distinct instance of a rule this project
already had on file.

- **C3 read only the specification.** `tally(spec, …)` at both call sites, with
  `history` never passed — so drift **across the split** was invisible, which is
  exactly the drift the split created. ⚠ **Proved by control rather than by
  reading: identical hostile totals FIRE when placed in the plan and are SILENT
  when placed in the history.**
- **C3 was anchored on two exact phrasings** — "review rounds complete" and
  "findings, none false" — so "produced 24 findings" and "the fourth review round"
  did not register at all. **This is "a check is evidence only for the property it
  exercises", committed by the tool built to enforce it.**
- ⚠⚠ **C3 could not parse a hyphenated number, and that is a FALSE ACCEPT rather
  than a miss.** Its `\w+` capture cannot span a hyphen, so "twenty-four" parsed as
  **4**, "twenty-six" as **6**, "twenty-one" as **1**. The plan's own "twenty-four
  findings" was therefore held as 4 — **so a stray "four findings, none false"
  anywhere would have AGREED with it and C3 would have certified a 24-vs-4
  contradiction as clean.** Nobody had named this one; it was found by running the
  pattern in isolation.

**All three are fixed on the checker's own branch (PR #154), not here** — it is
code, and putting it on this docs-only branch would break the property the reviewer
verifies every round. C3 now reads both files, is keyed on **site count** rather
than value disagreement (per the owner's "stated once" ruling — two sites that
agree today are the same defect one edit early), and reports every site by
`file:line`. ⭐⭐ **Two further bugs were found only because the frames were tested
against the REAL corpus instead of invented strings:** markdown bold kept
`the **fourth** review round` out of its own frame, and the patterns were
case-sensitive, so this file's sentence-initial "Across five review rounds" went
unread. **The frames are proved bidirectionally — they fire on all ten real drift
sites and stay silent on eight historical statements lifted verbatim from these two
documents** ("Option A survived two review rounds", "raised five new findings"),
because a frame list cannot decide what a number is _about_ and the module says so
in its own comment.

### ⚠⚠ Two author-found defects in adjacent artifacts — numbered A1 and A2, NOT SP-\*

Numbered separately on purpose: they are not reviewer findings, and folding them
into the `SP-*` sequence would corrupt the running tally §7.5 states.

- **A1 — the round-6 commission overstated the checker to the reviewer.**
  `docs/reviews/spacing-helper-preset-plan-codex-followup5-commission.md:95-96` told
  the reviewer the checker has **five** checks, naming "C5 falsified-claim-
  resurrection". ⚠⚠ **C5 does not exist and never did** — `grep -c C5` returns 0
  against both `tests/support/planConsistency.ts` and `tests/unit/planConsistency.spec.ts`
  on `feature/plan-consistency-checker`, and the owner's structural ruling says four
  checks. **The reviewer then reasoned about "C1–C5" four times, including its
  central G3 answer** ("a defect class none of C1–C5 catches"). ⓘ Same one-fact-two-
  places class as SP-5 and SP-22 — in the commission, which like the pull-request
  body is an **ungated surface**. Round 7's commission states the check set by
  quoting the module, not from memory.
- **A2 — the C3 hyphen defect above.** Recorded here as well as in the round-6
  narrative because it was found by the author, after the review, and the reviewer
  explicitly could not inspect the checker at all.

## 10. The author's own run of the review commission, before handing it over

The commission is a prediction of the findings; **writing it down is not running
it.** Commission Q1–Q9 were executed against this plan before the commission was
handed over. The commission was **not** weakened afterwards — every question
survives verbatim, and four of the items below were added to §8 as new attack
surface rather than quietly closed.

⚠ Treat this as a **claim, not clearance**. On PR #139 an author wrote each
round's winning test case into his own commission three rounds running and ran
none of them; on PR #153 the self-check found real defects on three consecutive
rounds and still missed the one that blocked.

### What the run caught, and what changed

| #         | Question | What it found                                                                                                                                                                                                                                                                                                                                    | Disposition                                                                                                                                                                                                                                             |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SR-1**  | Q2       | §4.2 cited the `RootComponent` branch at `:166-175`. It begins at `:165` (`if (RootComponent) {`).                                                                                                                                                                                                                                               | **FIXED** — citation corrected.                                                                                                                                                                                                                         |
| **SR-2**  | Q2       | Two citations pointed at a 22-line range (`@rc-component/trigger` `lib/Popup/index.js:130-152`) for two specific facts.                                                                                                                                                                                                                          | **FIXED** — tightened to `:150` (`removeOnLeave: false`) and `:152` (`leavedClassName`).                                                                                                                                                                |
| **SR-3**  | Q2       | `aria-owns` at `Input.js:186` carries the identical value under the identical condition and was unmentioned — a reviewer checking `:188` would meet it and wonder.                                                                                                                                                                               | **FIXED** — added as an explicit equivalent fallback.                                                                                                                                                                                                   |
| **SR-4**  | Q1       | Route (c) was written as "the click was swallowed". A Select **toggles** on a click of its root, so an already-open popup being clicked shut is a second, distinct mechanism reaching the same state.                                                                                                                                            | **FIXED** — route (c) broadened.                                                                                                                                                                                                                        |
| **SR-5**  | Q1       | ⚠⚠ **THIS ROW WAS ITSELF WRONG — see the round-1 note below.** It recorded as "the biggest catch" a claim that routes (b)/(c) reach the wrong control through the retry loop's `catch` at `:43-45` and the `force: true` fallback at `:49`.                                                                                                      | ~~FIXED~~ **RETRACTED — the independent review found it FALSE** (`if (attempt === 1) throw error` exits before line 49 is ever reached; finding SP-2). §2.3 now carries the correction. **The self-check invented a mechanism instead of tracing one.** |
| **SR-6**  | Q3       | The author attacked his own isolation wait on the strongest available ground — that if `.ant-select-dropdown-hidden` were `opacity: 0`, Playwright would count it visible and the wait could never pass, which is `tabs.visual:33`'s recorded signature. **The attack REFUTED**: `antd/lib/select/style/dropdown.js:81-82` sets `display: none`. | **RECORDED, not fixed** — but it exposed a real residual: the wait is coupled to the `slide-up` leave animation, and with the retry gone it is on the critical path. Added to §4.4 and §8.                                                              |
| **SR-7**  | Q5       | Legs 2 and 3 as first written were "route (b)" and "route (c)" — but a harness cannot construct a _route_, only a _state_, and contriving a displaced click would have meant reaching the state by the very bypass under test.                                                                                                                   | **FIXED** — merged into one honest state-based leg, with the limit stated plainly.                                                                                                                                                                      |
| **SR-8**  | Q5       | ⭐ There was **no leg that measured the plan's own central claim**. Legs 1–3 showed the old helper failing and the new one passing; none showed that the _narrower_ repair also fails. Without it, "ownership beats scope" was an argument dressed as a measurement.                                                                             | **FIXED** — new **leg 3**, the scope-only straw man, which is now named as the half of the discriminator that does the work, with an explicit "if this refutes, the plan goes back to the owner".                                                       |
| **SR-9**  | Q5       | Leg 4's bar was "adds no measurable stall". SR-6 makes that false by construction — the isolation wait _is_ a stall.                                                                                                                                                                                                                             | **FIXED** — bar changed to "bounded and attributable".                                                                                                                                                                                                  |
| **SR-10** | Q6       | §5.2 stated the class by its **search token** (`ant-select-dropdown`), which is exactly the sweep-key failure the governing practice rule names.                                                                                                                                                                                                 | **FIXED** — the class is now stated as a **behaviour** first, with the token grep demoted to corroboration and its blind spot named.                                                                                                                    |
| **SR-11** | Q9       | §5.2 was an options table with a recommendation, **not** an Owner Decision Brief — three of the six fields were missing.                                                                                                                                                                                                                         | **FIXED** — the missing fields added.                                                                                                                                                                                                                   |
| **SR-12** | Q4       | The published enumeration is lexical. Ran the aliasing searches the commission demands (`(const\|let\|var) x = <expr>.spacing`, and destructuring renames) — **none found** outside `tests/support/index.ts`.                                                                                                                                    | **CONFIRMED**, and the limit added to §8 rather than treated as clearance.                                                                                                                                                                              |
| **SR-13** | Q4       | `tabs.ts` / `popup.ts` block ranges were both given as `:6-37`; the two files are offset by one, and neither call-site count was given.                                                                                                                                                                                                          | **FIXED** — `tabs.ts:6-38` (call sites `:149`, `:182`) and `popup.ts:6-37` (call site `:114`).                                                                                                                                                          |

### ⚠⚠ And a fourteenth item, caught by the reading pass and not by the run

**SR-14 — the SR-1 repair was reported FIXED in this table before it had
actually been applied.** The edit script that carried SR-1 aborted on a later
assertion, and because the script writes the file only at the end, SR-1's change
was discarded with it; the follow-up script re-applied SR-2 and SR-3 but not
SR-1. The row above said "FIXED" while `§4.2` still read `:166-175`.

It was caught by a **separate reading pass over the finished file** — grepping
the finished document for each claimed repair and for each string that should
have disappeared — rather than by the edit pass, which had every reason to
believe it had succeeded. **This is the general rule and it is why the pass
exists: an agent checks that it DID the work, not that the work is now TRUE.**
The repair is applied now, and the verification is that `:166-175` survives in
this document at exactly one place — the SR-1 row above, describing the error.

⭐ It is left in the record rather than tidied away because the same failure
mode is live in the implementation ahead: §6's harness will be built by scripts,
and a leg that silently does not run reads exactly like a leg that passed.

### What the run did NOT establish

- **Q2 was answered from library source only.** Every citation was re-read in
  `node_modules/` and corrected where wrong. **Nothing was observed in the
  running Electron app**, which is why §6 leg 0 exists and why §8 lists the whole
  of §4.2 as a weakest claim. A citation being accurate is not the DOM behaving
  as the citation implies.
- **No suite was run and no probe was built.** The tripwire holds: no code until
  a review returns ACCEPTS-REVISION.
- **Q10 is unanswerable by the author by definition.** The list above is a floor.

### ⚠⚠⚠ What round 1 proved about this section

**The run above found fourteen items and missed all three blockers.** That is the
honest measure of it, and it belongs here rather than in a footnote.

**Two of the three were mechanically decidable from files the author had already
opened.** SP-2 required tracing seventeen lines of the very helper the plan
exists to repair — and the plan's central scope argument rested on that trace.
SP-3 required noticing that `SelectInput/index.js:185` binds `onMouseDown`, a
line read **in the same session**, for a different purpose, while establishing
where `data-testid` lands.

⭐ **THE PATTERN, AND IT IS NOT "TRY HARDER": THE SELF-CHECK EXERCISED THE
ARTIFACT'S ARGUMENTS AND NOT ITS MECHANICS.** Every one of SR-1..SR-14 is an
argument-shaped check — is this claim consistent, is this brief complete, does
this leg measure its claim. SR-8 added a whole harness leg by _reasoning_ about
coverage. Not one item re-traced a control flow or re-read a bound event handler.
**An artifact whose arguments are all sound can still rest on a misread `if`.**

⚠ **And SR-5 is the sharpest datum, because the self-check did not merely miss
the defect — it manufactured one.** Asked how the wrong click gets past
Playwright's hit-target check, the author produced a mechanism that reads
plausibly, wrote it into §2.3 as fact, built a scope argument on it, and marked
the row FIXED. **A self-check that answers its own question from reasoning rather
than from the file is worse than one that leaves the question open**, because it
converts a known gap into an unknown error.

⭐ Round 1 is the **third consecutive datum on this project** that self-review is
not a substitute for independent review — after PR #139 (the author wrote each
round's winning case into his own commission and ran none) and PR #153 (three
rounds of self-check, each finding real defects, each missing the blocker). ⓘ The
remedy is not a longer self-check list. **It is that the self-check must include
at least one re-trace of every control flow and every library binding the plan's
load-bearing claims depend on** — and that requirement goes into the round-2
commission rather than staying a resolution.

### ⭐⭐⭐ Round 2, and what EXECUTION proved that neither review could

Round 2 returned SEV-1-BLOCKED with four findings, **all four defects in round
1's repairs and none in a previously-clean area** — the reviewer explicitly
re-cleared the DOM chain, the blast radius and P1–P4. By the project's own fix-round
rule that is **"each fix generating the next finding"**, which needs a different
remedy from patching again. The owner granted a **narrow exception to the
spec-before-code tripwire for harness code only**, and the probe ran.

**It falsified the design on its first leg, in about a minute.** The
`aria-controls` id is the constant `test-id` under `NODE_ENV=test`, shared by
every Select, and retained by closed popups — so the revision-2 resolver would
have failed on the ordinary path.

⚠⚠⚠ **THE PART WORTH KEEPING: THE AUTHOR CLEARED THAT ROW, AND SO DID THE
INDEPENDENT REVIEWER, TWICE.** Round 1's Q2 answered "no issue found in the seven
source claims"; round 2 did not reopen it. **Both checked that the identifier
EXISTS. Neither asked whether it is UNIQUE — and uniqueness was the property the
design needed.** Two rounds of careful source review, by two different agents,
passed a defect the first minute of execution caught.

⭐ **The generalisable form, offered as a `practice` candidate and NOT filed
(candidates need the owner's approval on this project):** _a check that
establishes an identifier EXISTS has not established that it is UNIQUE, and
uniqueness is usually the property the design actually needs._ It is a specific
instance of the wing's existing rule that a check is evidence only for the
property it exercises — but the specific form is what would have caught this.

⭐⭐ **And the process lesson, which the owner has now acted on:** for the
_helper_, design-then-review-then-build is coherent. For the _harness_, it forced
this plan to specify constructions in prose that only execution could decide, and
**that is where both review rounds went** — SP-8 ("this construction will not
work") and SP-9 ("these are not specified") are both questions a probe answers in
minutes. Legs 2/3's remaining open question about Playwright's own interceptor is
now recorded **as a question**, to be measured rather than guessed.

### ⭐⭐ The new discipline earned its keep before it was written down

Applied to revision 2's own repairs, the re-trace requirement immediately found a
defect an argument-shaped check would have passed:

**RT-1 — the re-gated retry would have made things WORSE, not better.** As first
drafted, the loop clicked unconditionally on each attempt. But a Select
**toggles** on mousedown — the very fact SP-3 had just established — so if
attempt 0's click _did_ open the popup and `resolveOwnedDropdown` merely timed out
on its short 1500 ms budget, **attempt 1's click would CLOSE it**, and the 5000 ms
second attempt would then fail against a Select it had just shut. A
slow-but-correct open would become a hard failure, and the retained retry would be
actively worse than no retry. **Fixed:** the loop now clicks only when the Select
does not already own an open popup (`ownsOpenPopup`). ⓘ The original helper
papered over this with an `Escape` between attempts; revision 2 removed those
`Escape` presses, which is precisely how the hazard got in.

**RT-2 — an open §8 worry was answerable from source and is now closed.** ⓘ
Recorded as history: it concerned revision 2's `aria-controls` post-condition,
which revision 3 replaced with `aria-expanded`. **The reasoning carried over
intact** — `aria-expanded` is likewise rendered straight from `open`
(`Input.js:184`), so it too settles at the React commit rather than at the end of
the leave animation.
Revision 2's scoped post-condition asks whether `aria-controls` clears promptly or
at the end of the leave animation. `Input.js:188` renders it straight from `open`,
so it clears **at the React commit** — the post-condition is therefore _faster_
than the document-global wait it replaces, not slower. Same authority PR #153 used
for `aria-expanded`, and the same reason it beat the popup's `-hidden` class.

### ⭐⭐⭐ Round 3, and the run that made the review's own recommendation moot

**The re-trace rule held for a third round and caught nothing in revision 3's
prose — and the review then produced four true findings anyway.** That is the
honest score, and it is the point of §10 existing: the self-check is not a
substitute for the review, and this round is the clearest demonstration yet.

⭐⭐ **WHAT REVISION 4 DID DIFFERENTLY, AND WHY IT IS THE ONLY CHANGE OF METHOD
THAT HAS ACTUALLY PAID.** SP-13 arrived as a _construction argued from source_ —
the reviewer named rc-select's immediate-open/deferred-close asymmetry, labelled
the two-visible consequence **INFERRED, not measured**, filed it SEV 2, and wrote
an Owner Decision Brief offering three ways to word the claim more carefully.
**The author ran it instead.** That single decision:

1. **falsified M3**, a fact revision 3 had labelled MEASURED and built §2.3 on;
2. **falsified option D**, the mechanism the owner had ruled that morning, by
   finding the ~45–67 ms window (M6) in which both of its checks pass on the
   foreign popup — **a state the reviewer had explicitly looked for and not
   found**, because its declared evidence boundary was static source;
3. **made the reviewer's own three-option brief unnecessary** — the claim did not
   need softening, it needed replacing;
4. and **de-risked the replacement before proposing it** (M7), so option B is the
   first mechanism in this plan that was measured _before_ it was written down
   rather than after it was falsified.

⚠⚠ **THE RULE THIS ARC HAS NOW PAID FOR THREE TIMES, STATED AS PLAINLY AS IT CAN
BE: EVERY MECHANISM IN THIS PLAN THAT WAS CLEARED BY READING WAS LATER KILLED BY
RUNNING.** Option A survived two review rounds and died in a minute. Option D
survived a third and died in a minute. **The reviewer was not wrong in any of
those rounds** — it was reading, and reading cannot decide a temporal or
uniqueness property. **Where a claim is about what the app DOES rather than what
its source SAYS, the harness must run before the reviewer does, not after.**

⚠ **AND THE COUNTER-LESSON, WHICH IS LESS COMFORTABLE.** §8 had already published
"P2's inference is the plan's softest joint — find a state with two visible
popups" and "M3 rests on ONE observed sequence" as named weak claims. **Both were
exactly right, both were prominent, and neither stopped revision 3 being built on
top of them.** Publishing a weak claim buys a clean supersession instead of a
retraction; **it does not buy a correct plan, and it is not a substitute for
deciding the claim.** The disclosure was not the defect — treating the disclosure
as sufficient was.

### What revision 4's own run checked, and what it did NOT establish

- **Ran:** SP-11's five-site sweep, widened past its own vocabulary to
  `hit.target`, `displaced` and `moved target` — a token sweep is only as good as
  its key. Four hits survive; each was read in place and is a retraction, a
  historical record, or a true statement about P3.
- **Ran:** the §5.1a collision grep, and the `renderSection(` enumeration.
- **Ran:** the probe's own control legs — the two-popup sampler was proved able to
  see 2 before any negative was trusted, and the option-B class selector was proved
  to match 0 before any positive was trusted.
- ⚠ **NOT established:** that leg 1 still enters the two-popup window when the leg
  also _runs the helper_ rather than only sampling. §6 handles this by requiring
  the leg to record the maximum popup count and treat `max < 2` as a no-result.
- ⚠ **NOT established:** anything about option B's class in the **Electron
  renderer**. M7 is jsdom. §8 lists this first among revision 4's weak claims.
- ⚠ **NOT established:** whether legs 2/3's capture listener collides with
  Playwright's interceptor. Unchanged, still an open question, still not guessed.

### ⚠⚠⚠ Round 4 — the round the author lost on his own repair

**Revision 4's blocker was not a reviewer finding the author disagreed with. It
was the author deleting a line of his own plan and not noticing.** SP-15 is worth
recording more carefully than the other eighteen findings combined, because it is
the only one where the defect was introduced _by the act of fixing something
else_.

**The mechanics, exactly.** Revision 4 replaced §4.4 by line range — from the
`### 4.4` heading to the `### 4.5` heading — and wrote fresh content in its place.
That block had contained four things: the private helpers, a caller example, a
numbered "what is removed" record, and a "what is retained" note. **The rewrite
reproduced the first and silently dropped the other three.** P4 then existed as a
definition, an entry in the §5.3 private-surface inventory, and a harness leg —
three mentions, none of them a call.

⭐⭐ **WHY THE AUTHOR'S OWN CHECKS DID NOT CATCH IT, WHICH IS THE USEFUL PART.**
The revision-4 reading pass swept for _stale_ content — option D references,
"leg 1 is deleted", ownership language — and found and fixed several. **Every one
of those searches asks "is anything here that should not be?" Not one asks "is
anything missing that should be?"** A deletion leaves no token to grep for. ⚠⚠
**The rule this yields, and it is new: after replacing a block wholesale, diff the
OLD block against the NEW one and account for every line that disappeared.** It is
mechanical, it takes one `git show`, and it would have caught this in seconds.
ⓘ The author ran exactly that `git show` **after** the reviewer named the defect —
which is the same "wrote the check down and handed it over" failure this project
has recorded before, in a new costume.

⚠ **And a second, quieter lesson: three mentions are not a call.** `grep -c
expectSelectShows` over revision 4 returned **three** hits, which reads like a
wired detector. **A definition, an inventory row and a test leg are all mentions
of a method that nothing invokes.** Counting references is not checking
integration — the same substitution this project's own rule warns about, applied
to a plan instead of to a test.

### What revision 5's own run checked, and what it did NOT establish

- **Ran:** `git show a39aad3` and diffed **both** blocks revision 4 replaced
  wholesale against revision 3 — §4.4 (eighteen identifiers, four structural
  items: all present) and §6's leg section (twenty-three content probes: all
  present, none missing). ⚠ **Keyed on identifiers and named items, so a deleted
  sentence carrying neither would not show up** — §8 keeps that as a live weak
  claim rather than calling the sweep complete.
- **Ran:** `playwright-core/lib/server/progress.js:67-75` re-read, confirming
  `timeout: 0` installs no timer at all.
- **Ran:** the five `bg-*-dropdown` tokens across `src/`, `tests/`, `tools/`, then
  read `src/index.css:26-40` and the DSL's `??` fallback and `force: true` click.
- **Ran:** `grep -rn "<SpacingControls" src/` → one consumer,
  `PropertiesPanel.tsx:6632`.
- ⚠ **NOT established:** that P4 actually catches the misattached-class drift
  case. It is wired and it is INFERRED; leg 5 against the wired path decides it.
- ⚠ **NOT established:** anything new about M7 in the Electron renderer. Unchanged
  from revision 4, and §7's sequence now puts leg 1 first because of it.
- ⚠ **NOT established:** the legs-2/3 interceptor question. Still open, still not
  guessed, three revisions running.
