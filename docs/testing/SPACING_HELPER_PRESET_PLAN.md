# Plan — repair the spacing DSL's Select targeting so a preset click cannot land on the wrong control

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY, REVISION 7. No code has been written.** ⚠⚠⚠ **REVISION 6
WAS THE FIRST ONE WRITTEN AGAINST A MECHANICAL CHECK. REVISION 7 IS THE FIRST IN
WHICH THAT CHECK ACTUALLY WORKED — AND IT WORKED BY FAILING.** It answers the
sixth review (`docs/reviews/spacing-helper-preset-plan-codex-followup5-review.md`,
verdict **SEV-1-BLOCKED**, commit `30d606c`), whose **two findings were
re-verified at source and accepted in full.**

**SP-25 CHANGES WHAT THIS PLAN PROMISES, AND THE OWNER HAS RULED ON IT.** When
the requested control **and** the foreign control both already show the wanted
value, a wrong-control click changes no value anywhere — so P4's own-value
read-back **and** its new other-half snapshot both pass over a wrong operation.
**That is now MEASURED in the real Electron renderer (§4.2, M9), not argued:**
nothing moved, the popup closed normally, and both assertions passed. **The owner
ruled option (a) on 2026-08-31 — P4's guarantee is narrowed to wrong-control
MUTATION, and PREVENTION stays with P1**, which under option B is identity by
construction and never depended on P4. §3 and §4.1 are corrected: this plan no
longer claims a wrong target _cannot happen_; it claims it is **prevented by
construction**, and that **anything which moves a value is detected**.

**SP-26 is a straight repair.** The other-half assertion was loud but anonymous —
a bare array of nullable strings with no message, naming neither the requested
control nor the one that moved. It now polls a **keyed record** with a custom
message naming the requested test id and both guarded ids, and **leg 5 records
the exact failure message and exit code** the way leg 6 already does.

⚠⚠⚠ **AND THE SENTENCE THAT MATTERS MOST IN THIS HEADER: SP-22 REGRESSED, AND
THE CHECKER BUILT LAST ROUND TO PREVENT EXACTLY THAT REPORTED A CLEAN PASS OVER
IT.** Run against revision 6, `checkPlan` returned **zero findings** while this
plan called it "the fourth review round" and the history both stated the running
totals and claimed it stated none. Three defects caused that green and all three
are now fixed on the checker's own branch (PR #154) — it read only this file and
never the history; it was anchored on two exact phrasings; and it could not parse
a hyphenated number, so "twenty-four" was held as **4**. **Revision 7's count
repair is verified by that repaired check: it now reports the drift, and must
report nothing once this revision lands.** ⓘ The revision-6 header follows.

**Revision 6.** It answered the fifth review
(`docs/reviews/spacing-helper-preset-plan-codex-followup4-review.md`, verdict
**SEV-1-BLOCKED**, commit `f1e7240`), whose **five findings were re-verified at
source and accepted in full.**
**SP-21 is a real design defect and the reason this round earned its keep:** P4
read only the requested control, so a wrong-control click was invisible whenever
the requested value was already correct — **measured (M8a) to occur on the first
action of a currently-passing test.** P4 now also asserts the other half is
untouched, and **that repair was measured safe (M8b) before it was written down.**
SP-20 (leg 1 scheduled before the helper it needs), SP-22, SP-23 and SP-24 were
repaired with it. ⚠⚠ **SP-20, SP-22, SP-23 and SP-24 were all defects revision 5
introduced — see §7.5, which is the single home for this arc's running cost and
records what the owner ruled about it.** The per-round record has moved to
[`SPACING_HELPER_PRESET_PLAN_HISTORY.md`](SPACING_HELPER_PRESET_PLAN_HISTORY.md).
ⓘ The revision-5 header follows.

**Revision 5.** ⚠⚠ **REVISION 5 IS A
REPAIR ROUND, NOT A REDESIGN — option B stands and no owner decision was
reopened.** It answers the fourth review
(`docs/reviews/spacing-helper-preset-plan-codex-followup3-review.md`, verdict
**SEV-1-BLOCKED**, commit `fac11f8`), whose **five findings the author re-verified
at source and accepted in full**.
⚠⚠⚠ **ITS BLOCKER WAS SELF-INFLICTED AND IS THE MOST IMPORTANT THING IN THIS
HEADER: revision 4 defined P4 and then deleted the only code that called it**
(SP-15). §4.4 now carries the complete caller rewrite. SP-16, SP-17, SP-18 and
SP-19 are repaired with it; disposition is **§9**. ⓘ The revision-4 header
follows.

**Revision 4.** ⚠⚠⚠ **REVISION 4
REPLACES THE OWNERSHIP MECHANISM FOR THE SECOND TIME, AND FOR THE SECOND TIME
EXECUTION — NOT ARGUMENT — IS WHAT KILLED THE OLD ONE.** A probe run under the
owner's narrow tripwire exception measured that **option D's central inference is
false for ~50 ms, with BOTH of its checks satisfied**, so the break it promised
would be loud is not a break at all (§4.2, M5–M7). ⚠ **Measured population, stated
exactly (SP-19): the ordinary margin-then-padding sequence produced that window in
each of THREE recorded runs.** Three runs plus the scheduling source make it
repeatable; they do not establish "every transition on every machine", and the
plan does not need that — option B is immune to the window however often it
occurs. The owner re-ruled on 2026-08-27, selecting **option B — a per-Select
popup class, which identifies the popup by CONSTRUCTION instead of inferring it**.
Revision 4 also answers the third review
(`docs/reviews/spacing-helper-preset-plan-codex-followup2-review.md`, verdict
**SEV-1-BLOCKED**, commit `2819810`), whose **four findings the author re-verified
at source and accepted in full**:
SP-11 and SP-14 by repair, SP-12 by specifying what was missing and narrowing a
false universal, and **SP-13 by MEASURING the construction the reviewer inferred,
which turned out to be not merely possible but the ordinary path**. Disposition is
**§9**. ⓘ Revision 3 replaced the mechanism revisions 1–2 rested on, after the
first harness run falsified it, and answered the second review
(`docs/reviews/spacing-helper-preset-plan-codex-followup-review.md`, verdict
**SEV-1-BLOCKED**, commit `a8cba46`) — SP-7 by **deletion**, SP-8, SP-9 and SP-10
by repair. ⓘ Revision 2 answered
the independent review at
`docs/reviews/spacing-helper-preset-plan-codex-review.md` (verdict
**SEV-1-BLOCKED**, commit `6694a61`), whose **six findings the author
re-verified at source and accepted in full — six for six, none false** — and the
owner's adjudication of SP-1, SP-2 and SP-4 on 2026-08-27. The per-finding
disposition is **§9**. This document exists to be reviewed before it is
implemented. Its subject is a **shared test
DSL** — named explicitly as capability-class shared machinery in
`docs/governance/OPERATING_AGREEMENT.md` §3.7 — so it falls inside the
SPEC-BEFORE-CODE ruling in `CLAUDE.md` (owner's ruling 2026-08-16, in force;
full ruling and the 8.8-hour measurement behind it in MemPalace drawer
`drawer_havdm_decisions_bc47e8270caa139d3ee11646`).

ⓘ **§10 records the author's own execution of the review commission against the
draft of this revision, before handover** — fourteen items, of which one (SR-8)
added a whole harness leg that measures this plan's central claim and that the
draft did not have, and one (SR-14) is a repair §10 reported as done before it
had actually been applied, caught by a separate reading pass over the finished
file. The commission at
`docs/reviews/spacing-helper-preset-plan-codex-commission.md` was handed over
**unweakened**, and four of those items were added to §8 as new attack surface
rather than closed.

**Branch:** `feature/spacing-helper-preset-plan`
**Classification:** **capability** — the subject is a shared test DSL, which
`docs/governance/OPERATING_AGREEMENT.md` §3.7 lists by name under capability-class
shared machinery. See §7.4 for a governance question this raises about which lane
the work belongs in.
**Parent objective:** a regression suite whose green means something — an
unallowlisted test that reddens roughly one run in four, for a reason that is a
defect in the measuring instrument, makes every other result harder to read.
**Cheapest acceptable outcome:** `e2e/spacing.spec.ts` › `Card Spacing Controls`
› `applies spacing presets` stops firing because the helper can no longer drive a
control the caller did not ask for — **prevention is by construction (P1), and
any wrong-control operation that MOVES A VALUE becomes a loud, named failure
instead of a silent wrong answer**. Nothing is added to
`tests/baseline/expected-failures.json`.
⚠⚠ **SP-25, AND THE WORDING ABOVE IS NARROWER THAN REVISION 6's ON PURPOSE.**
A wrong-control click that changes **no** value — which is what happens when the
requested and foreign controls both already show the wanted value — is **not**
detectable by reading values back, **measured** in the real renderer (§4.2, M9).
The owner ruled option (a) on 2026-08-31: **P4 is a detector of wrong-control
MUTATION, and the prevention claim rests on P1 alone.** ⓘ This plan therefore no
longer promises that a wrong target _cannot_ happen by virtue of P4; it promises
that P1 makes it impossible by construction and that P4 catches anything which
moves a value. The stronger claim — an oracle observing _which_ Select received
the click — was offered to the owner and **not** taken; its cost is unknown and
it is deliberately **not** designed here, because two mechanisms invented in
prose on this branch have already been falsified by measurement.
**Cost stop-rule:** if the §6 harness cannot reproduce a wrong-target click
against the real app in either direction after one working session, work halts
and re-asks the owner — because at that point the remedy would be unproven and
the honest options change (see §7.3).

---

## 0. For the owner — in plain English

Per the SPEC-BEFORE-CODE ruling's document shape: this section is the part you
judge. Everything after it is the technical detail the reviewer needs in order
to attack the plan.

**What this protects, in product terms.** Nothing about the shipped app is
broken. This is about the _tests_ — the alarm system. One of the alarms is
wired wrongly and goes off about one run in four for no real reason. Every time
it does, someone has to stop and work out whether the product broke. That cost
is real and it is recurring, and worse, a test that can quietly operate the
wrong control is a test that could one day report "all fine" when it is not.

**What is going wrong, plainly.** The Card Spacing panel has two nearly
identical halves — a **Margin** half and a **Padding** half. Each has a
drop-down offering the same words: "Normal (8px)", "Relaxed (16px)", and so on.
The test helper opens a drop-down and then searches the **whole screen** for an
option whose text starts with "Normal", taking the first one it finds. When both
halves' drop-downs are open at the same moment, "the first one" can be the
Margin one. So the test asks for padding and sets the margin instead. The
product then does exactly what it was told, the padding stays at zero, and the
test fails complaining that the padding is zero.

Two further things make it silent rather than loud. The helper clicks by
reaching into the page and calling the browser's own click, which skips the
safety check that would normally shout "you are clicking something that is not
where you think it is". And the helper never checks that the drop-down it is
looking at actually _belongs to_ the control it asked for — only that _a_
drop-down is open somewhere.

**Is the product affected? — NO, with the evidence stated honestly.** The
failure screenshot from CI run 228 shows the panel reading `Margin: Normal
(8px)` / `Padding: None (0px)` at the moment of failure, when the test had asked
for margin 16px and padding 8px. The product applied precisely what it received.
That is MEASURED, from the artifact. What is **not** measured is exactly which
of three routes lets the wrong control get clicked — see §2.3. All three routes
are repaired by the same change, but they are not all repaired by the _narrower_
change that was previously recorded as sufficient, and that correction is the
main thing this plan adds.

**What changes.** Test code in one file, **plus a two-line change to one product
file** — `src/components/SpacingControls.tsx`, which gains a name tag on each of
its drop-downs. The helper gains four properties: it asks for the drop-down
belonging to the control it wants **by that name**; it searches only inside that
drop-down; it clicks the way a user would, with the safety check on; and
afterwards it reads back the control's own displayed value and fails by name if
it is wrong.

**What could go wrong.** Very little now, and that is the point of the change.
The previous two attempts each asked the app a question and worked out which
drop-down must be the right one from the answer. Both times the reasoning was
sound and the app turned out to behave differently, and both times only running
the app found it. This version does not reason at all: each drop-down carries a
label we put there ourselves, and the helper asks for that label. **Measured: the
label lands on the drop-down, and each label matches exactly one — never the other
control's.** The pattern is not new here either — `BackgroundCustomizer.tsx`
already labels five of its own drop-downs this way. ⚠ **Stated accurately
(SP-18): those five labels are also used by the app's own stylesheet, so they are
not, as revision 4 said, five examples of a label that exists purely for tests.
They show the technique works here; they do not show this repository already
looks after test-only labels.**

**What it costs.** One test-only change, a two-line product change, one harness
run before any CI cycle is spent, and one more independent review round. ⚠ Stated
plainly: this defect has now cost several review rounds and **two approved designs
that were thrown away**. **§7.5 is the single home for the running figures and
records that cost honestly rather than burying it** — this sentence deliberately
carries no number of its own, because the number here going stale against §7.5 is
what SP-22 was, twice.

**What happens if you do nothing.** The test keeps reddening roughly one run in
four on its own, issue #145 stays hard to close, and the helper's ability to
silently drive the wrong control stays in the toolbox for every future spacing
test. The alternative you already rejected on 2026-08-26 — putting it on the
tolerated-flake list — would mean tolerating an instrument that can report
success while doing the wrong thing.

**Three decisions are yours** — revision 1 said two and hid the third in
technical prose, which the independent review flagged (SP-4). They are set out in
Owner Decision Brief form at **§4.3** (which ownership mechanism), **§5.2** (how
wide to sweep) and **§7.4** (which governance lane governs this work). Each has a
recommendation with its reason. ⭐ **All three were ruled on 2026-08-27 and the
rulings are recorded in place**; they are kept as briefs so the reasoning stays
auditable. ⚠ **§4.3 has now been ruled TWICE MORE after its first ruling** — once
when measurement killed option A and once when measurement killed option D — and
every ruling is kept, so the trail of what was traded and why stays readable.

---

## 1. Context and background

### The failing identity

`tests/e2e/spacing.spec.ts:94` — `Card Spacing Controls` › `applies spacing
presets`. The test does four things (`:109-113`):

```ts
await spacing.setCardMargin('relaxed');
await spacing.expectCardMarginApplied(16, 0); // PASSES

await spacing.setCardPadding('normal');
await spacing.expectCardPaddingApplied(8, 0); // FAILS
```

### Its standing

**SEVEN sightings, all with byte-identical signatures**, and it is deliberately
**not** on any allowlist in `tests/baseline/expected-failures.json`, so it
reddens a gate run entirely on its own. The complete enumeration — taken over
the complete artifact population, every downloadable `merged-report-*` artifact
of the `Regression Suites` workflow, not over the runs in front of anyone — is
runs 178, 188, 190, 200, 201, 209 and 228: `31870375328`, `31880748615`,
`31883429764`, `31928526052`, `31929619479`, `31943622937`, `32403080633`.
Every one of the seven has attempts `failed, passed`: it has never failed twice
in a row and has never failed a whole run. Source of record:
`drawer_havdm_investigations_93a44232f7b76ea15a1b4f2c` and the sightings
register (ii) in `drawer_havdm_testing_127a89e2ddcdeb101452523a`.

The signature, identical in all seven:

```
Error: expect(received).toBe(expected)
Expected: "8px"
Received: "0px"
Call Log: - Timeout 5000ms exceeded while waiting on the predicate
```

thrown at `tests/support/dsl/spacing.ts:223` — the `expect.poll` inside
`expectCardPaddingApplied`, reading `getComputedStyle(el).padding` on the card's
`[data-testid="conditional-visibility-wrapper"]`. ⚠ It is not a momentary race
at the assertion: the value is polled for a full five seconds (no explicit
timeout is passed at `:223-225`, so Playwright's 5000 ms `expect.poll` default
applies) and stays `0px` throughout. **The padding was never applied at all.**

### The ruling this plan implements

The owner ruled on 2026-08-26: **fix the shared helper, do not allowlist it.**
Recorded in `drawer_havdm_investigations_a4f963e630fdab4dcb19094f`. The
diagnosis it rests on is `drawer_havdm_investigations_93a44232f7b76ea15a1b4f2c`
(2026-08-23), which concluded the same: allowlisting would tolerate a helper
that can silently drive the wrong control and report success — the failure mode
that makes a green suite meaningless.

### What this plan is NOT

It is not a product change (option A), it does not touch
`tests/baseline/expected-failures.json` in any direction, and it does not
re-baseline any snapshot. Retiring or adding a manifest row needs a diagnosed
cause **and** the owner's explicit authorisation, and this identity is on no row
to begin with.

---

## 2. What is actually going wrong

### 2.1 The deciding evidence

`test-failed-2.png` from `behavioural-artifacts-2` of run 228 shows the
Properties panel at the moment of failure:

- **Card Spacing → Margin → Mode `All Sides`, Preset `Normal (8px)`, All Sides (px) `8`**
- **Card Spacing → Padding → Mode `All Sides`, Preset `None (0px)`**

The margin had been correctly set to `relaxed` (16 px) and verified moments
earlier at `:110`. The `setCardPadding('normal')` call at `:112` **overwrote the
margin** to `Normal (8px)` and never touched the padding. A card whose padding
preset is `None (0px)` has `padding: 0px`, which is exactly what the assertion
read. **The product is behaving correctly for the input it actually received.**

### 2.2 The three defects, read at source

⚠ These were re-read from `tests/support/dsl/spacing.ts` at `main` = `08a9544`
for this plan rather than taken from the prior session's record — a finding is a
hypothesis until checked at source. All three are MEASURED.

**D1 — OWNERSHIP IS NEVER ESTABLISHED. This is the root defect and it is the one
the previous record understates.**

`openSelectDropdown(select)` (`:35-51`) proves only that **some**
`.ant-select-dropdown` is `:visible`:

```ts
await select.click();
const dropdown = this.getVisibleSelectDropdown(); // .last() of ALL visible
const visible = await dropdown.isVisible().catch(() => false);
if (visible) return; // ← "success"
```

`getVisibleSelectDropdown()` (`:25-27`) is
`this.window.locator('.ant-select-dropdown:visible').last()` — **any** visible
popup on the page. Nothing anywhere in the helper checks that the popup belongs
to `select`. Consequently a click that was **swallowed** (landing while the
scrollable Properties panel was still moving), or that landed on a **different**
select, is indistinguishable from success whenever any popup happens to be open.

**D2 — THE OPTION SEARCH IS DOCUMENT-GLOBAL, AND IT DISAGREES WITH THE
VISIBILITY CHECK ABOUT WHICH POPUP IT MEANS.**

`selectOptionByText` (`:53-64`) checks `.last()` and then searches `.first()`:

```ts
await expect(this.getVisibleSelectDropdown()).toBeVisible({ timeout: 5000 }); // .last()
const option = this.window
  .locator('.ant-select-dropdown:visible .ant-select-item-option', { hasText: pattern })
  .first(); // .first(), page-wide
```

`.last()` for the check and `.first()` for the click is a target mismatch by
construction.

⚠ **The ambiguity is guaranteed, not incidental.** `src/components/SpacingControls.tsx`
renders the Margin and Padding halves from **one shared `renderSection`
function** (`:122-220`, called twice at `:228-229`), so both halves offer
**identically-labelled options**: the Mode select at `:147-155` offers
`All Sides` / `Per Side` in both halves, and the Preset select at `:166-178`
offers `None (0px)` / `Tight (4px)` / `Normal (8px)` / `Relaxed (16px)` /
`Spacious (24px)` / `Custom` in both. The `/^Normal/i` pattern `setPreset` builds
at `:109-110` therefore matches an option in **either** popup, and `.first()`
resolves it in DOM order rather than by intent.

**D3 — TWO ACTIONABILITY BYPASSES TURN A WRONG TARGET INTO A SILENT SUCCESS.**

```ts
await option.evaluate((el) => {
  (el as HTMLElement).click();
}); // :59-61
```

and, in the fallback path of `openSelectDropdown`:

```ts
await select.click({ force: true }); // :49
```

Playwright's own click performs a hit-target check and would have raised on an
obscured, detached or unstable target. `el.click()` inside `evaluate` never
complains, and `force: true` explicitly disables the check. **D3 is what turns
D1 and D2 from a loud failure into a silent wrong answer.**

### 2.3 ⚠⚠ THE ROUTES — CORRECTED TWICE, AND NOW SETTLED BY MEASUREMENT

`drawer_havdm_investigations_93a44232f7b76ea15a1b4f2c` names two candidate routes
to the wrong-control click and states that **both are repaired by the same
change** — scoping the option search to `getVisibleSelectDropdown()`'s subtree.
**The scoping half of that is false, and the measurement in §4.2 now proves it
rather than arguing it.**

**THE STATE THAT MATTERS, MEASURED (§4.2, M4).** With the padding Select
**closed** and the margin Select owning the **only** visible popup, a
document-global `:visible` search for `/^Normal/i` returns **exactly one match —
the MARGIN's**. In that state `.last()` _is_ the foreign popup, so **scoping the
option search to it selects the wrong option exactly as before, and reports
success.** Only an authority that asks _the requested Select_ what it owns turns
that state loud. **That is why the repair is OWNERSHIP, not SCOPE.**

### ⚠⚠⚠ Route (a) is RESTORED — revision 3 deleted it on a FALSE measurement

⚠⚠ **REVISION 4 REVERSES REVISION 3 HERE, AND THE REVERSAL IS ITSELF MEASURED.**
Revision 3 deleted route (a) — "both popups open" — on the strength of M3, which
said two popups **cannot** be open at once. **M3 was false, and it was false for a
reason worth naming: the run behind it sampled the SETTLED state after each
gesture, and a settled-state observation cannot decide a claim about every
instant.** The reviewer spotted the gap from source (SP-13); a probe then measured
it directly.

**MEASURED, three runs of three (§4.2, M5):** clicking the padding Select while
the margin Select is open leaves **two `.ant-select-dropdown` elements
simultaneously Playwright-visible for 350.6 / 353.0 / 359.9 ms**, both at real
on-screen coordinates, and leaves **both comboboxes reading
`aria-expanded="true"` together for 50.3 / 48.9 / 61.1 ms**. The cause is in
rc-select's own docblock: _"Setting `open` takes effect immediately, but setting
it to `false` is delayed via MessageChannel"_
(`node_modules/@rc-component/select/lib/hooks/useOpen.js:33-35`, applied at
`:70-80`), with the outside-`mousedown` close routed through
`lib/hooks/useSelectTriggerControl.js:28-33`.

⭐⭐⭐ **SO ROUTE (a) IS NOT AN EXOTIC STATE — THE ORDINARY PATH PRODUCED IT IN
EVERY RUN THAT WAS MEASURED**, opening one Select while another is open, which is
precisely what `applies spacing presets` does. **Route (a) is restored to the
table, and harness leg 1 is restored with it.**

⚠ **SCOPE OF THAT CLAIM, CORRECTED IN REVISION 5 (SP-19).** The measured
population is **three recorded runs of the margin-then-padding sequence**, all
three of which entered the overlap. The installed scheduling asymmetry explains
why it is repeatable rather than lucky. **It is NOT established that both popup
boxes become Playwright-visible on every machine and every timing** — and §6 leg 1
already assumes they may not, since it must treat `max < 2` as a no-result.
⭐ **The plan does not depend on the universal.** Route (a) needs only to be
REACHABLE to justify a helper that cannot be fooled by it, and three for three
settles reachability. ⚠⚠ **Saying "every time" here would have been the same error
as M3 in the opposite direction — a finite sample promoted to a universal — in the
very revision that struck M3 for exactly that.**

ⓘ **A SECOND SURFACE CONSISTENT WITH THE SAME MECHANISM (SP-18), STATED AT THE
STRENGTH IT ACTUALLY SUPPORTS.** `src/index.css:26-40` hides the leave-transition
remnants of the five `BackgroundCustomizer` Select popups, with the comment _"hide
leave-transition remnants to prevent visible merged menus."_ ⚠⚠ **Revision 5
called this "independent corroboration of M5" and said someone "hit this exact
behaviour". That overclaimed and is corrected here (SP-24).** What the CSS
establishes is that **product code deliberately guards against leave-remnant
merged menus in this app** — it records an intent, not an observation. It does
**not** name an incident, measure two Playwright-visible popups, or exercise the
margin-to-padding sequence and durations that define M5. **It makes the mechanism
less speculative; it is not a second measurement of it. M5's runtime support
remains its three recorded spacing runs and nothing more.** ⓘ Still worth noting
that the CSS treats the symptom and leaves both popups present to a DOM query.

### ⚠⚠⚠ Route (b)'s MECHANISM is DELETED — twice wrong is enough

The plan asserted **two different mechanisms** for how a click could reach the
wrong Select, and **both were false**:

1. **Revision 1** claimed the retry loop's `catch` at `:43-45` delivers a
   displaced click to the `force: true` fallback at `:49`. **False:**
   `if (attempt === 1) throw error` exits the function; line 49 is unreachable via
   a throwing click (finding SP-2).
2. **Revision 2** claimed an ordinary Playwright click can resolve after being
   delivered to a moved target — a time-of-check/time-of-use race. **False:**
   Playwright 1.57.0 installs a hit-target interceptor for non-force clicks
   (`node_modules/playwright-core/lib/server/dom.js:360-380`) whose injected
   listener computes the hit target **at event time** and, on mismatch, calls
   `preventDefault()`, `stopPropagation()` and `stopImmediatePropagation()`; the
   mismatch is returned (`:388-401`) and the action is **retried**. A displaced
   ordinary click is **blocked, not delivered** (finding SP-7).

⭐⭐⭐ **SO ROUTE (b)'s MECHANISM IS NOW LEFT EXPLICITLY UNEXPLAINED, AND A THIRD
GUESS IS FORBIDDEN.** This is the reviewer's own remedy, and the plan does not
need it: **ownership is justified by the measured foreign-only state (M4) and by
route (c), without any account of how CI reached that state.**

**The routes that remain, and what each needs:**

| Route                                                                                                                   | What the helper SEES                                         | Repaired by scope alone?                  |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| **(a)** both popups visible at once — **RESTORED; measured at ~350 ms on the ordinary path**                            | two popups; a document-global option search can match either | **NO** — `.last()` may be either          |
| **(b)** the wrong Select was opened — **mechanism unexplained, deliberately**                                           | one foreign popup; the requested Select closed               | **NO** — `.last()` _is_ the foreign popup |
| **(c)** the requested Select's click did not leave _its_ popup open — swallowed, or toggling an already-open popup shut | one foreign popup; the requested Select closed               | **NO** — same state                       |

⚠ **Which route actually fires on the runner is UNRESOLVED and this plan does not
claim to know.** Routes (b) and (c) present the helper with the **same state**,
and that state is what the repair addresses. §6 measures the state, not the route.
⭐ **Route (a) is now the one route whose reachability IS measured** — and note
what that costs the previous design and gives the new one: a mechanism that
identifies the popup by INFERENCE has to survive route (a), whereas one that
identifies it by its OWN CLASS is untouched by it, because a foreign popup can
never carry the requested Select's class no matter how many popups are visible.

## 3. The desired outcome

1. `e2e/spacing.spec.ts` › `Card Spacing Controls` › `applies spacing presets`
   stops firing, because the helper can no longer operate a control the caller
   did not name.
2. **A wrong-control operation that MOVES A VALUE becomes a loud, named failure
   at the DSL**, not a silent wrong answer discovered five seconds later as
   `Expected "8px" / Received "0px"` on an unrelated assertion. ⚠⚠ **SP-25 —
   NARROWED BY OWNER RULING, 2026-08-31.** Revision 6 said "a wrong target"
   without qualification. **MEASURED (§4.2, M9): when the requested control and
   the foreign control both already show the wanted value, a wrong-control click
   changes nothing at all and both of P4's assertions pass.** Detection is
   therefore scoped to operations that move a value; **prevention is item 1's
   job, and item 1 is true by construction under option B.**
3. The whole **class** is removed from `SpacingDSL`, not just the one call
   path: `setPreset`, `setMarginMode` and `setPaddingMode` all route through the
   same two private helpers (`grep -n "selectOptionByText\|openSelectDropdown"
tests/support/dsl/spacing.ts` → definitions at `:35` and `:53`, calls at
   `:108`/`:110`, `:116`/`:117`, `:123`/`:124`).
4. Nothing is added to or removed from `tests/baseline/expected-failures.json`.
5. ⚠⚠ **REVISION 4: there IS a `src/` change** — the owner selected **option B**
   at §4.3 on 2026-08-27. It is two added lines in
   `src/components/SpacingControls.tsx` and nothing else; §5.1a is its blast
   radius and §7.4 re-examines the lane ruling that assumed a test-only change.
6. ⭐⭐ **Item 1's wording is load-bearing, revision 4 is the first version that
   earns it, and revision 7 is the first that needs it to stand ALONE.** "Can no
   longer operate a control the caller did not name" is a **prevention** claim.
   Under options A and D it rested on an inference, and when each inference fell
   the plan's remaining defence was P4 — which is **detection**. Option B makes
   item 1 true by construction (§4.1, §4.2 M7). ⚠⚠⚠ **SP-25 IS WHY THAT NOW
   MATTERS MORE THAN IT DID.** Measured (M9), P4 cannot detect a wrong-control
   operation that moves no value, so **the two claims no longer overlap the way
   revision 6 assumed: there is a state in which detection is blind and only
   prevention is standing.** The plan is therefore load-bearing on P1 in a way it
   has not been before, and §8 lists that as its first weak claim rather than
   burying it.

---

## 4. The proposed change, in detail

### 4.1 The four properties the repaired helper must have

| #      | Property                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Kills                                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **P1** | **IDENTITY, BY CONSTRUCTION.** Resolve the popup that belongs to the requested Select **by the class that popup renders** (`<data-testid>-popup`), and fail with its own message if that popup is not visible. ⚠ **Revision 4 changed this property's KIND, not just its mechanism:** it was "prove ownership from something the app reports", and is now "ask for our own label". Nothing is derived.                                                                                                                                                        | D1, and routes (a), (b) and (c)                                                                                                           |
| **P2** | **SCOPE.** Search options only within that popup's subtree, and require exactly one match.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | D2, and any residual multi-popup state                                                                                                    |
| **P3** | **ACTIONABILITY.** Click the option the way a user does — Playwright's own `click()`, hit-target check on. No `evaluate` click, no `force: true`.                                                                                                                                                                                                                                                                                                                                                                                                             | D3                                                                                                                                        |
| **P4** | **OUTCOME, IN TWO PARTS.** After selecting, (i) read back the requested control's **own** rendered value and assert it, **and** (ii) assert the **other half** still holds exactly the values snapshotted before the gesture. ⚠ **Both assertions name their controls** — (i) names `testId`; (ii) names `testId` and both guarded ids (SP-26). ⚠⚠ **What P4 does NOT decide (SP-25, owner ruling 2026-08-31):** an operation that moves **no** value is invisible to it, so P4 detects wrong-control **mutation** and is not evidence of operation identity. | Every wrong-control operation that MOVES A VALUE and survives P1–P3, naming the control in the failure. **Prevention is P1's, not P4's.** |

⭐ **P4 is the cheapest property, and revision 7 stops calling it the strongest.**
P1–P3 are preventive and each rests on a claim about the DOM. P4 is a _detector_:
it asks the controls what they now say. If a residual route lets a wrong click
through **and that click moves a value**, P4 fails immediately, at the helper,
naming the control — instead of the caller's next assertion failing five seconds
later about a computed style. This is the project's own craft rule — _make the
red leg NAME the bug_ — and it is what makes P1's version-pinned mechanism (§8)
an acceptable risk rather than a single point of failure.

⚠⚠⚠ **BUT NOT AN UNCONDITIONAL ONE, AND SP-25 IS WHERE REVISION 6 OVERSTATED IT.**
The sentence above used to read "if ANY residual route lets a wrong click
through". **MEASURED FALSE (§4.2, M9):** in the double-pre-satisfied state a
wrong-control click moves nothing, both P4 assertions pass, and the popup closes
as if the operation had succeeded. **A value-delta guard cannot decide which
control an operation reached when that operation changes no value** — detection
and diagnostics are distinct properties, and so are detection and identity. The
owner ruled option (a) on 2026-08-31: **P4's guarantee is wrong-control MUTATION;
the residual-route backstop for the no-op case is P1 alone.** ⓘ That is a real
reduction in what this plan claims, and §8 carries it as a live weak claim.

⚠⚠⚠ **AND REVISION 4 ADDS THE LESSON THAT COST THE MOST TO LEARN: P4 IS NOT A
SUBSTITUTE FOR P1, AND TWICE THIS PLAN CAME CLOSE TO TREATING IT AS ONE.** Under
options A and D, P1 was an inference; when each inference was falsified, the
honest description of what remained was _"P4 still catches it"_ — which is
**detection, not prevention**, and the plan's stated goal (§3) is that the helper
**cannot drive a control the caller did not ask for**, not that it notices
afterwards. **Option B is the first version in which P1 actually delivers
prevention**, and P4 goes back to being what it was always meant to be: the
cheap detector behind a guard that works, rather than the guard of last resort.

### 4.2 The ownership authority — MEASURED IN THE RUNNING APP

⚠⚠⚠ **REVISION 3. THE MECHANISM PROPOSED IN REVISIONS 1 AND 2 IS DEAD, AND IT
WAS KILLED BY EXECUTION, NOT BY ARGUMENT.** Revisions 1–2 proposed identifying
the owning popup through the requested Select's `aria-controls="<id>_list"`,
resting on `@rc-component/select@1.5.0 lib/Select.js:123` — `useId(id)`
guarantees an id. **That row was true about EXISTENCE and silent about
UNIQUENESS, and uniqueness was the property the design needed.**

**MEASURED in the running Electron app, 2026-08-27:** the padding Select and the
margin Select **both** report `aria-controls="test-id_list"` — the **same** id.
Root cause, read from source afterwards:
`node_modules/@rc-component/util/lib/hooks/useId.js` returns the **constant
`'test-id'`** when `process.env.NODE_ENV === 'test'`. ⚠ And because rc-trigger
keeps closed popups in the DOM (`removeOnLeave: false`,
`@rc-component/trigger@3.8.1 lib/Popup/index.js:150`), **both popups retain that
node**: with one popup open, `document.querySelectorAll('[id="test-id_list"]')`
returned **2**, and every `.ant-select-dropdown` reported `hasIdList: true`. **So
the revision-2 `filter({ has: … })` + `toHaveCount(1)` would have failed on the
ORDINARY path.**

⭐⭐⭐ **THE LESSON, AND IT IS THE MOST EXPENSIVE ONE THIS PLAN HAS PRODUCED: THE
AUTHOR CLEARED THAT ROW AND SO DID THE INDEPENDENT REVIEWER, TWICE** — its round-1
Q2 answered "no issue found in the seven source claims" and round 2 did not
reopen it. **Both checked that the identifier EXISTS. Neither checked that it is
UNIQUE. Two rounds of source review passed a defect the first minute of execution
caught.**

### The four facts the same run established, all MEASURED

| #          | Fact                                                                                                                                                                                                                                                                                                                                                                                                         | How it was measured                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1**     | **`aria-expanded` is a reliable PER-SELECT open-state authority — AT REST AND AT STEADY STATE.** All comboboxes read `"false"` at rest; only the requested Select flips to `"true"` when opened; and it flips back to `"false"` when another Select takes the popup. ⚠⚠ **NARROWED IN REVISION 4: "flips back" is EVENTUAL, NOT PROMPT — M5 measured both comboboxes reading `"true"` together for ~50 ms.** | Read from every `input[role="combobox"]` in the Properties panel across three states (rest, padding open, margin open). **Sixteen** comboboxes were present. ⚠ Three STEADY states — the run never sampled the transition, which is why the narrowing was needed. |
| **M2**     | **The visible-popup set is a singleton AT STEADY STATE ONLY.** Two popup nodes existed in the DOM; exactly one was displayed. ⚠⚠ **NARROWED IN REVISION 4: this is a steady-state fact and NOT an invariant — M5 measured TWO visible for ~350 ms across a transition.** It cannot carry a design that needs the singleton to hold at every instant.                                                         | `getComputedStyle(d).display !== 'none'` → 1; Playwright `.ant-select-dropdown:visible` → 1; `:not(.ant-select-dropdown-hidden)` → 1. ⚠ All three sampled at rest.                                                                                                |
| ~~**M3**~~ | ⚠⚠⚠ **FALSIFIED IN REVISION 4 — DO NOT RELY ON IT.** It claimed route (a) is NOT CONSTRUCTIBLE. **It is: M5 measures it on the ordinary path.** The error is instructive and is this plan's second instance of the same class — **the run observed the SETTLED state after each gesture and the claim quantified over EVERY instant.** A check is evidence only for the property it exercises.               | Two gestures, each sampled after it settled. **Nothing in that method could have seen a transient, so its silence was never evidence.**                                                                                                                           |
| **M4**     | ⭐ **THE DEFECT REPRODUCED IN MINIATURE.** With the padding Select CLOSED and the margin Select owning the only visible popup, a document-global `:visible` search for `/^Normal/i` returned **exactly ONE match — the MARGIN's**.                                                                                                                                                                           | The wrong-control state, measured. **A scope-only repair would confidently select from the foreign popup and report success.**                                                                                                                                    |

### ⭐⭐⭐ M5–M7 — the SECOND harness run, which killed option D (revision 4)

Run 2026-08-27 under the same narrow tripwire exception, headless
(`bash tools/test-headless.sh <spec> --project=electron-e2e --workers=1 --repeat-each=3`),
temporary and untracked, deleted afterwards with `git status --porcelain` empty
and `src/` + `tests/` verified byte-identical to `HEAD`. It **mirrored the real
failing sequence** — margin preset first, then padding, so padding's popup portal
had never existed. **It asserts nothing; it measures and prints.**

⭐ **TWO METHOD CHOICES THAT MAKE THESE NUMBERS WORTH TRUSTING, because the
previous two mechanisms died of exactly the errors they guard against.**
**(1) A CONTROL LEG.** The probe force-unhid a closed popup and had to report
**2**; it did, in every run. Without it, a "no overlap found" result would have
been indistinguishable from a blind sampler. **(2) ATTRIBUTION BY RECT, ANCHORED
BEFORE THE OTHER POPUP EXISTED.** Popups were identified by a rectangle sampled
while **only** the margin Select was open and padding's portal did not exist —
never by DOM index, and never by the `test-id` the first run proved is shared.

| #      | Fact                                                                                                                                                                                                                                                                                                           | How it was measured                                                                                                                                                                                                                                                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M5** | ⭐ **TWO POPUPS ARE VISIBLE AT ONCE ON THE ORDINARY PATH — M3 IS FALSE.** Two `.ant-select-dropdown` elements simultaneously Playwright-visible for **350.6 / 353.0 / 359.9 ms**, both on-screen; **both comboboxes `aria-expanded="true"` together for 50.3 / 48.9 / 61.1 ms.**                               | Three runs of three. In-page sampler on `MutationObserver` + `requestAnimationFrame` + a `MessageChannel` loop; ~16–18k samples per run. Visibility computed as Playwright computes it (non-empty box, not `visibility:hidden`).                                                                      |
| **M6** | ⚠⚠⚠ **THE DECIDER: P1 AND P2 BOTH PASS ON THE FOREIGN POPUP.** Frames in which the **requested** Select reads `aria-expanded="true"` **AND** exactly **one** popup is visible **AND that popup is the FOREIGN one**: **6 frames in every run, spanning 45.4 / 60.9 / 66.8 ms.**                                | Same run. The single visible popup in those frames carried the exact rect anchored while padding's portal could not yet exist.                                                                                                                                                                        |
| **M7** | ⭐ **OPTION B's CLASS LANDS, AND IT IS UNIQUE.** `classNames={{ popup: { root: … } }}` on antd **6.1.4** puts the class on the `.ant-select-dropdown` **root**; with both popups in the DOM, each class matched **exactly one** popup and neither carried the other's (`marginAlsoCarriesPaddingClass=false`). | Separate probe, jsdom + React Testing Library, two Selects mounted and both opened. **CONTROL: before any popup existed the selector matched 0**, so a later match means something. ⚠ **LIMIT: jsdom decides CLASS PLACEMENT and UNIQUENESS — render-time facts — NOT layout, timing or visibility.** |

### ⭐⭐ M8 — the THIRD harness run, which made P4's repair measured (revision 6)

Run 2026-08-31 under the same narrow tripwire exception, headless, temporary and
untracked, deleted afterwards with `git status --porcelain` empty and `src/` +
`tests/` byte-identical to `HEAD`. It asks the two questions SP-21's repair rests
on. **BIDIRECTIONAL: leg B drives the OTHER half and must mirror leg A** — if both
legs reported "only the driven half moved" for the same half, the probe would be
measuring nothing.

| #       | Fact                                                                                                                                                                                                                                                                                                                                                                                        | How it was measured                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **M8a** | ⚠⚠ **SP-21's blind spot is REAL, not hypothetical.** A fresh button card renders `spacing-margin-mode` as **"All Sides"** — so `setCardMargin(12)` → `setMarginMode('all')` **asks for the value already shown**, on the FIRST action of a currently-passing test (`tests/e2e/spacing.spec.ts:27`). A wrong-control click there is invisible to a P4 that reads only the requested control. | Read `.ant-select-content-value` on all four spacing Selects immediately after reaching the Form tab. All four read `All Sides` / `None (0px)`. |
| **M8b** | ⭐ **THE REPAIR IS SAFE: a legitimate operation never touches the OTHER half.** Setting the Margin preset changed **only** `spacing-margin-preset`; setting the Padding preset changed **only** `spacing-padding-preset`. Neither touched the other half.                                                                                                                                   | Snapshot of all four Selects before and after each operation, with the second operation as the mirroring control leg.                           |

⚠ **WHY THE GUARD IS "THE OTHER HALF" AND NOT "EVERY OTHER SELECT".** Within one
half the two controls are **coupled** — `handlePresetChange` writes a preset token
and the mode then re-renders as `all` (`SpacingControls.tsx:96-105`, `:128`) — so
a same-half change is legitimate and a wider guard would fail on correct
behaviour. **That distinction was read from source and then confirmed by M8b
rather than assumed.** ⚠ **Revision 7 corrects the line numbers in the citation
above and in §4.4's `otherHalf` comment: revisions 5 and 6 both cited `:104-112`
and `:131`, which point at `handlePresetChange`'s closing lines and at a
destructuring line, not at the handler and the mode derivation.** The claim was
right and the reference was wrong — recorded rather than silently fixed, because
"cite, don't type" is a rule this plan asks its reviewer to hold it to.

### ⭐⭐⭐ M9 — the FOURTH harness run, which measured SP-25 rather than arguing it (revision 7)

Run 2026-08-31 under the same narrow tripwire exception, headless, temporary and
untracked, deleted afterwards with `git status --porcelain` empty and `src/` +
`tests/` + `tests/baseline/expected-failures.json` verified byte-identical to
`HEAD`. **It exists because SP-25 is a claim about what the app DOES, and this
plan's own record is that every such claim cleared by reading alone has later
been killed by execution — option A on the shared `test-id`, option D on M6.**
⚠⚠ **BIDIRECTIONAL, AND THE CONTROL LEG IS THE WHOLE POINT: leg M9c must FAIL.**
A probe that only asks "does the guard stay silent" cannot distinguish a real
blind spot from a sampler that reads nothing.

| #       | Fact                                                                                                                                                                                                                                                                                                                                                                                                                                                   | How it was measured                                                                                                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M9a** | ⚠⚠ **THE PRE-SATISFIED STATE IS WIDER THAN M8a RECORDED — IT IS ALL FOUR CONTROLS, NOT ONE.** A fresh button card renders `spacing-margin-mode` and `spacing-padding-mode` both **"All Sides"**, and `spacing-margin-preset` and `spacing-padding-preset` both **"None (0px)"**. So the DOUBLE-pre-satisfied state SP-25 needs is the ordinary starting state, for modes **and** presets.                                                              | Read `.ant-select-content-value` on all four spacing Selects on reaching the Form tab. ⭐ Corroborated by construction: `DEFAULT_CARD_SPACING = 0` (`src/services/cardSpacing.ts:15`) and `SPACING_PRESET_VALUES.none = 0` (`:17-23`), via `resolveSpacingPreset` (`:181`) and `isPerSideSpacing` (`:267`), for both halves. |
| **M9b** | ⚠⚠⚠ **SP-25 CONFIRMED IN THE ELECTRON RENDERER: A WRONG-CONTROL OPERATION IS INVISIBLE HERE.** With the foreign (padding-mode) popup the only visible one and `spacing-margin-mode` the requested control, the option matched **exactly one** element under `.ant-select-dropdown:visible` — so P2's singleton also passes — the click was delivered, **NO VALUE CHANGED ANYWHERE**, the popup **closed normally**, and **BOTH P4 ASSERTIONS PASSED.** | Snapshot of all four Selects before and after, plus visible/in-DOM popup counts at click time and after. Values identical before and after; popup count 1 → 0.                                                                                                                                                               |
| **M9c** | ⭐⭐ **THE MIRRORING CONTROL, AND IT FAILED AS IT MUST.** With the foreign half NOT pre-satisfied — padding preset first set to "Relaxed (16px)", then a wrong-control click selecting "Normal (8px)" — **P4 FAILED** on the other-half assertion. **So the guard demonstrably fires when a value moves, and M9b's silence is a property of the STATE, not of a blind instrument.**                                                                    | Same snapshot mechanism, same run. Other-half snapshot `["All Sides","Relaxed (16px)"]` → `["All Sides","Normal (8px)"]`; own-value assertion passed, other-half assertion failed.                                                                                                                                           |

⚠ **WHAT M9 DOES NOT ESTABLISH, STATED PLAINLY.** It measures the **value space**
only. It does **not** show that no observable signal anywhere could distinguish a
wrong-control operation — it shows that **reading values back cannot**. Whether a
different oracle exists, and what it would cost, is **deliberately not answered
here**: the owner was offered that option on 2026-08-31 and did not take it, and
this plan does not invent a mechanism in prose for the third time on this branch.
⭐ M9 also does not re-measure M8b, and the option-B class placement in the
Electron renderer remains unrun — the class smoke step still owes that.

⭐⭐⭐ **WHY M6 IS FATAL TO OPTION D, IN ONE SENTENCE:** the requested Select's
`aria-expanded` flips true at the React commit, **before its popup has mounted**,
while the foreign popup is still legitimately open — so **both of option D's
checks are satisfied while the only popup on screen belongs to the other
control**, and the "break" the design promised would be loud does not happen at
all, because nothing breaks. ⚠ **A leave-animation filter cannot rescue it:** in
the first M6 frames the foreign Select still reads `aria-expanded="true"` — it has
not begun to close; it is simply still open. ⓘ P4 (read-back) would still catch
the wrong value afterwards, so the failure is **loud rather than silent** — but
that means option D's contribution collapses from **prevention** to **detection**,
and prevention was its entire advantage over option B.

⭐⭐ **M4 IS STILL THE PLAN'S CENTRAL CLAIM, AND IS UNDISTURBED.** Ownership beats scope
because in the real failure state there is exactly one visible popup and it
belongs to the wrong control.

### The authority, as ruled

**OWNER RULED OPTION B, 2026-08-27** (see §4.3), superseding the option-D ruling
of the same day after M5–M6 falsified it. Ownership is established by
**construction, not inference**:

- **P1 — the popup is located BY ITS OWN CLASS**, derived from the Select's
  `testIdPrefix`: `.ant-select-dropdown.<testIdPrefix>-preset-popup`. **A foreign
  Select's popup can never carry it** (M7) — not because of any timing argument,
  but because the class is ours and is rendered only on that Select's popup.
- **P2 — options are searched only inside that popup's subtree**, so a
  document-global match is impossible by construction.

⭐⭐⭐ **THERE IS NO INFERENCE LEFT TO ATTACK, AND THAT IS THE WHOLE POINT OF
REVISION 4.** Options A and D each asked the app a question and derived which
popup must be the requested one; both derivations were sound-looking and both were
falsified by a minute of execution — A on the shared `test-id`, D on the ~50 ms
window of M6. **Option B derives nothing.** ⚠ It is not immune to everything, and
§8 says what it is exposed to instead: the class must actually be rendered
(**MEASURED, M7**) and the two names must not collide (**MEASURED, M7**).

⭐ **AND IT IS NOT A NEW PATTERN IN THIS REPOSITORY.**
`src/components/BackgroundCustomizer.tsx:141`, `:212`, `:228`, `:274`, `:323`
already tag five of its own Select popups this way, and
`tests/support/dsl/backgroundCustomizer.ts:43-60` already resolves them with
`.ant-select-dropdown.${popupClass}`. ⚠ Those five use `popupClassName`, which
antd 6.1.4 marks **deprecated** in favour of `classNames.popup.root`
(`node_modules/antd/lib/select/index.d.ts:57-58`); the new code uses the current
form. **Migrating the existing five is NOT in this change's scope** — see §5.2.

⚠⚠ **WHAT THAT PRECEDENT DOES AND DOES NOT SHOW — CORRECTED IN REVISION 5
(SP-18), BECAUSE REVISION 4 OVERSTATED IT.** It shows **the API shape works in
this app**: antd renders the class onto the popup root and a DSL can resolve it.
**It does NOT show that this repository already carries five equivalent
_test-only_ hooks**, and revision 4 leaned on it for durability and lane
reasoning as though it did. Two facts falsify that reading:

- **All five classes have a PRODUCT purpose.** `src/index.css:26-40` selects on
  every one of them to hide leave-transition remnants. They are product CSS
  selectors that a DSL also happens to use — so the app itself protects them,
  which is precisely the protection the spacing classes will NOT have.
- **That DSL does not fail closed.** `tests/support/dsl/backgroundCustomizer.ts`
  falls back to a document-global popup when the scoped lookup returns null —
  `(await this.resolveScopedDropdown(testId)) ?? (await this.resolveVisibleDropdown())`
  — and its click path uses `force: true`, which this plan bans outright. **If its
  class went missing, it would silently degrade to exactly the document-global
  behaviour this whole plan exists to remove.**

⭐ **So the precedent argues FOR the API and AGAINST complacency**, and §8's weak
claim about the unprotected product hook stands undiminished rather than being
softened by it.

**REJECTED, and why:** the `aria-controls` id link (falsified — shared `test-id`);
**option D's `aria-expanded` + asserted singleton (falsified — M6)**; any
`:visible` / `:not(-hidden)` `.first()` / `.last()` selection, which answers "is a
popup open" and never "is _this_ Select's popup open"; and `.ant-select-dropdown-hidden`
as a timing authority, since it is CSSMotion's `leavedClassName`
(`lib/Popup/index.js:152`) and lands only after the visual leave.

ⓘ **Still MEASURED-from-source and NOT disturbed by any of this** (the reviewer
cleared them in round 1 and re-cleared the surrounding area in round 2): the
single-select value node is `.ant-select-content-value`
(`SelectInput/Content/SingleContent.js:53`), whose parent `.ant-select-content`
(`:89`) also holds the placeholder and the input; and `data-testid` lands on
exactly one node, the `.ant-select` root — confirmed in the census, which read
`paddingCount: 1`, `marginCount: 1`, tag `DIV`, class `ant-select …`.

### 4.3 ⚖ OWNER DECISION 1 — which ownership mechanism

⚠⚠ **RE-PUT IN REVISION 3, BECAUSE THE MEASUREMENT REFUTED THE PREMISE THE
FIRST RULING RESTED ON.** The owner ruled **option A** on 2026-08-27 on the
strength of §4.2's source-measured chain; the harness then falsified that chain
on the point the design depended on. Rather than swap the mechanism silently, the
decision was re-put — _when the measurement refutes the premise an authorisation
was granted on, RE-ASK rather than execute its letter._

**What this protects in product terms.** Nothing in the shipped app either way.
This decides how the test proves it is holding the right control, and therefore
how durable the fix is.

**What is going wrong plainly.** The helper has no way to tell one drop-down from
another. Something must give it one — and the first answer we tried turned out
not to work, because in test mode every drop-down is labelled with the _same_
internal name.

**Is the product affected?** **No**, under every option. **Evidence status:** the
falsification and the four replacement facts are **MEASURED in the running
Electron app** (§4.2), not inferred.

**The options.**

**~~Option A — the `aria-controls` id link.~~ FALSIFIED BY MEASUREMENT.** Not
available. §4.2 records why.

**~~Option D — per-Select `aria-expanded` + an asserted singleton (test-only).~~
FALSIFIED BY MEASUREMENT (M6).** Not available. It identified the popup by
**inference** (open + singleton ⇒ ours), and the mitigation offered for that —
"asserting the singleton so a break is loud, never silent" — **is the part that
measured false**: for ~45–67 ms on the ordinary path both premises hold while the
only visible popup is the foreign one, so there is no break to be loud about.
⚠ Kept struck rather than deleted, because the reason it was chosen (no `src/`
change) is still a real cost that option B pays.

**Option B — a popup class per Select (`src/` change).** Add
`classNames={{ popup: { root: … } }}` to each Select in `SpacingControls.tsx`
(antd v6's current form; `popupClassName` is the deprecated alias —
`node_modules/antd/lib/select/index.d.ts:57-58`) and locate
`.ant-select-dropdown.<class>`. _Precedent:_ `tests/support/dsl/backgroundCustomizer.ts:44-60`.
_Cost:_ a one-line `src/` change per Select and a test hook in product code.
_Risk:_ lowest — **the only option that identifies the popup by CONSTRUCTION
rather than by inference**; the class is ours and cannot collide. The four Selects
render from one shared function, so the class must derive from `testIdPrefix`.

**~~Recommendation: D.~~ WITHDRAWN — the recommendation was wrong and the
measurement says so.** It rested on "its one inference fails loudly". **M6
measures that the inference fails SILENTLY**: both checks pass while the only
visible popup is the foreign one.

**Recommendation, revision 4: B.** It is the only option that never has to work
out which popup it has. Both rejected mechanisms were inferences that survived
source review and died on first execution; **B removes the class of error rather
than this instance of it.** Its two load-bearing facts are measured (M7), and the
repository already ships the same API in `BackgroundCustomizer.tsx` — though not,
as revision 4 implied, the same test-only contract (§4.2, SP-18).

**If you do nothing:** the identity keeps reddening roughly one run in four.

⭐⭐⭐ **OWNER RULED: B. 2026-08-27 — SUPERSEDING THE OPTION-D RULING OF THE SAME
DAY.** ⓘ **Both prior rulings are kept above, deliberately.** The owner ruled A on
the strength of a source chain, then D on the strength of M1–M4, then B on the
strength of M5–M7. **Twice the ruling was re-put rather than quietly swapped,
because a measurement had refuted the premise the authorisation rested on** — the
standing rule (`drawer_havdm_decisions_9e545b5b958d1c1ef33c701c`, the PR #128
precedent). ⚠ **The pattern across the three is the finding worth carrying: every
mechanism that identified the popup by INFERENCE was cleared by source review and
killed by execution; the one that identifies it by CONSTRUCTION was never in
doubt once measured.** ⓘ The independent reviewer reached option B on its own
judgement in round 3, at SEV 4, **before M6 existed** — recorded because a
JUDGEMENT that later measures true is worth more than the severity it was filed
under.

### 4.4 The proposed helper, in full

**Revision 4 — rewritten for option B; revision 5 restores its callers.** The
helper locates a popup **by the class that popup renders**, so nothing has to be
inferred. Three private helpers are rewritten, one is added, and the entry points
take the Select's **test id** rather than a bare `Locator`, because the test id is
what both the control and its popup class are derived from. ⚠⚠ **Revision 4 showed
the private helpers and omitted the callers — which silently orphaned P4 (SP-15).
The callers are below and they are part of the proposal, not an illustration.**

⭐⭐ **THE WHOLE MECHANISM IS ONE RULE: a Select's popup class is its
`data-testid` plus `-popup`.** That is mechanical, so there is no lookup table to
drift and no name to type twice.

**The `src/` half — two lines, in `src/components/SpacingControls.tsx`.** Both
Selects are rendered inside `renderSection`, which is called twice
(`:228-229`), so one line each yields **four** distinct classes:

```tsx
<Select
  /* …unchanged… */
  data-testid={`${testIdPrefix}-mode`}
  classNames={{ popup: { root: `${testIdPrefix}-mode-popup` } }}
/>

<Select
  /* …unchanged… */
  data-testid={`${testIdPrefix}-preset`}
  classNames={{ popup: { root: `${testIdPrefix}-preset-popup` } }}
/>
```

⚠ `classNames.popup.root` is antd 6.1.4's **current** form; `popupClassName` and
`dropdownClassName` are both marked deprecated in favour of it
(`node_modules/antd/lib/select/index.d.ts:57-58`). ⓘ The five existing uses in
`BackgroundCustomizer.tsx` use the deprecated alias; migrating them is **not** in
scope (§5.2).

**The test half.**

```ts
/** The popup a Select renders, located by ITS OWN CLASS.
 *  ⭐ MEASURED (§4.2 M7) on antd 6.1.4: `classNames.popup.root` lands on the
 *  `.ant-select-dropdown` ROOT, and with both popups mounted each class matched
 *  EXACTLY ONE — neither carried the other's. This is the property the
 *  `aria-controls` id failed (it was shared) and the property option D's
 *  singleton could not supply (M6). */
private popupFor(testId: string): Locator {
  return this.window.locator(`.ant-select-dropdown.${testId}-popup`);
}

/** ⚠⚠ DEMOTED IN REVISION 4, AND THIS IS THE POINT. `isOpen` is NO LONGER AN
 *  OWNERSHIP AUTHORITY — option B does not ask the app which popup it has. It
 *  survives for exactly two jobs that need no ownership claim: gating the retry
 *  so a second click cannot TOGGLE a slow-but-correct open shut (RT-1), and the
 *  scoped post-condition. Rounds 2 and 3 both asked whether a false `true` here
 *  could select the wrong control silently; under option B it cannot, because it
 *  no longer decides which popup is searched. */
private async isOpen(select: Locator): Promise<boolean> {
  const v = await select
    .locator('input[role="combobox"]')
    .getAttribute('aria-expanded')
    .catch(() => null);
  return v === 'true';
}

/**
 * Resolve THIS Select's own popup. Owner ruled option B on 2026-08-27.
 *
 * ⚠⚠ SP-14: an ABSOLUTE DEADLINE, with NO floor. Revision 3 used
 * `Math.max(50, …)`, which granted another 50 ms after the budget had expired,
 * so the "one shared budget" the comments advertised was not what the code
 * bounded. Here an expired budget FAILS instead of buying more time, and each
 * wait receives the positive remainder — which is what makes the stated number
 * true rather than approximately true.
 */
private async resolveOwnedDropdown(testId: string, budgetMs: number): Promise<Locator> {
  const deadline = Date.now() + budgetMs;

  /** ⚠⚠ SP-16: read the remainder ONCE per stage and pass THAT value on.
   *  Revision 4 called `left()` in the guard and again in the matcher options,
   *  so a guard that saw 1 ms could hand the matcher 0 — and Playwright installs
   *  a progress timer only `if (timeout)`
   *  (`playwright-core/lib/server/progress.js:67-75`), so ZERO means NO DEADLINE,
   *  not immediate expiry. That is a worse failure than the 50 ms floor SP-14
   *  removed: the floor overran by 50 ms, this could hang to the ambient test
   *  timeout. One read, rejected if non-positive, then reused. */
  const budgetFor = (stage: string): number => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new Error(
        `${testId}: the ${budgetMs} ms budget expired before ${stage}; ` +
          'this Select never presented its own popup',
      );
    }
    return remaining;
  };

  const popup = this.popupFor(testId);

  // ⚠ NOT an ownership inference — a CONSTRUCTION check. Exactly one node may
  // carry this class. Two would mean the class was rendered more than once
  // (e.g. a third `renderSection` call), which is a product-side mistake and
  // must be loud rather than silently resolved by `.first()`.
  await expect(
    popup,
    `expected exactly one popup carrying .${testId}-popup — more than one means ` +
      'the class is rendered by more than one Select and is no longer an identity',
  ).toHaveCount(1, { timeout: budgetFor('the popup class could be counted') });

  // ⚠ The class alone is not enough: rc-trigger KEEPS closed popups in the DOM
  // (`removeOnLeave: false`), so this node exists while the Select is shut.
  // Visibility is what distinguishes "its popup is open" from "its popup exists".
  await expect(
    popup,
    `${testId}'s own popup never became visible within ${budgetMs} ms`,
  ).toBeVisible({ timeout: budgetFor('the popup became visible') });

  return popup;
}

/**
 * ⚠⚠ NO document-global pre-wait (SP-1). ⚠⚠ The retry is RETAINED and gated on
 * this Select already being open (SP-2, owner's ruling): a Select TOGGLES on
 * mousedown (`SelectInput/index.js:117` → `toggleOpen()` at `:138`, bound at
 * `:185`), so an unconditional second click would CLOSE a slow-but-correct open
 * (RT-1). No `force`, ever, and no `evaluate(...click())`.
 */
private async openSelectDropdown(testId: string): Promise<Locator> {
  const select = this.window.getByTestId(testId);
  await expect(select).toBeVisible({ timeout: 5000 });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const last = attempt === 1;
    try {
      if (!(await this.isOpen(select))) {
        await select.click();               // hit-target check stays ON
      }
      return await this.resolveOwnedDropdown(testId, last ? 5000 : 1500);
    } catch (error) {
      if (last) throw error;                // second failure is REAL — report it
    }
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}

private async selectOptionByText(
  testId: string,
  pattern: RegExp,
): Promise<Record<string, string | null>> {
  // ⚠ SP-21: snapshot the OTHER half BEFORE the gesture, so P4 can prove it did
  // not move. Captured here rather than in the caller so no caller can forget it.
  // ⚠ SP-26: KEYED BY TEST ID, not positional — see `snapshotOtherHalf`.
  const siblingsBefore = await this.snapshotOtherHalf(testId);

  const dropdown = await this.openSelectDropdown(testId);

  // ⭐ Scoped to THIS Select's own popup by construction. Even with two popups
  // visible — which §2.3 route (a) now MEASURES at ~350 ms on the ordinary path
  // (M5) — a foreign option is not reachable from here.
  const option = dropdown.locator('.ant-select-item-option').filter({ hasText: pattern });
  // ⚠ rc-select VIRTUALISES the option list, so a row scrolled out of the
  // rendered window is absent from the DOM. Requiring exactly one match turns
  // ambiguity AND absence into a loud failure naming the pattern.
  await expect(
    option,
    `expected exactly one option matching ${pattern} in ${testId}'s own popup`,
  ).toHaveCount(1);
  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click();                     // real click; actionability enforced

  // ⚠ SP-1: SCOPED to this Select, not a document-global count — waiting for
  // "no popup anywhere" would fail against a legitimately-open unrelated Select.
  // ⭐ And it settles at the React commit, not at the end of the leave animation:
  // aria-expanded is rendered from `open` (Input.js:184), the same authority and
  // the same reasoning PR #153 used.
  await expect
    .poll(() => this.isOpen(this.window.getByTestId(testId)), { timeout: 5000 })
    .toBe(false);

  return siblingsBefore;
}

/** The two Selects of the spacing half this control does NOT belong to.
 *  ⭐ MEASURED (§4.2 M8): a legitimate operation on one half never changes the
 *  other half's controls — driving Margin moved only `spacing-margin-preset`,
 *  driving Padding moved only `spacing-padding-preset`. ⚠ It is deliberately the
 *  OTHER HALF and not "every other Select": within a half the two controls are
 *  COUPLED, because `handlePresetChange` writes a preset token that re-renders
 *  the mode as `all` (`SpacingControls.tsx:96-105`, `:128`), so a same-half
 *  change is legitimate and a guard covering it would fail on correct behaviour. */
private otherHalf(testId: string): string[] {
  const other = testId.includes('-margin-') ? 'padding' : 'margin';
  return [`spacing-${other}-mode`, `spacing-${other}-preset`];
}

/** The other half's current values, KEYED BY TEST ID.
 *  ⚠⚠ SP-26 — THIS IS WHY IT IS A RECORD AND NOT AN ARRAY. Revision 6 compared
 *  a bare `(string | null)[]`, so when the guard fired its diff showed two
 *  strings and named NEITHER control — contradicting this plan's own "loud AND
 *  BY NAME" requirement and leg 5's oracle. A keyed record puts the test id of
 *  the control that moved into the failure output itself.
 *  ⭐ Defined once and used by BOTH the pre-gesture snapshot and the post-gesture
 *  poll, so the two shapes cannot drift apart. */
private async snapshotOtherHalf(testId: string): Promise<Record<string, string | null>> {
  const snapshot: Record<string, string | null> = {};
  for (const id of this.otherHalf(testId)) {
    snapshot[id] = await this.readSelectValue(id);
  }
  return snapshot;
}

private async readSelectValue(testId: string): Promise<string | null> {
  return this.window
    .getByTestId(testId)
    .locator('.ant-select-content-value')
    .textContent()
    .catch(() => null);
}

/** P4 — the outcome detector. Reads the requested control's OWN rendered value,
 *  and asserts the OTHER half did not move.
 *  `.ant-select-content-value` is the single-select value node
 *  (SingleContent.js:53); the parent `.ant-select-content` (:89) also holds the
 *  placeholder and the input, so it is the WRONG node to assert on.
 *
 *  ⚠⚠ SP-21 — READING ONLY THE REQUESTED CONTROL IS NOT ENOUGH, AND THIS IS NOT
 *  HYPOTHETICAL. If the requested control ALREADY shows the wanted value, a click
 *  that landed on the sibling leaves it still correct and the own-value read-back
 *  passes over a wrong-control operation. **MEASURED (§4.2 M8a/M9a): a fresh card
 *  renders ALL FOUR spacing Selects at their defaults — both modes "All Sides",
 *  both presets "None (0px)" — so `setCardMargin(12)` → `setMarginMode('all')`
 *  asks for the value already shown, on the FIRST action of a currently-passing
 *  test (`tests/e2e/spacing.spec.ts:27`).** So P4 asserts TWO things.
 *
 *  ⚠⚠⚠ SP-25 — AND HERE IS WHAT P4 STILL CANNOT DO, MEASURED AND OWNER-RULED.
 *  When the requested control AND the foreign control are BOTH pre-satisfied, a
 *  wrong-control click changes NO value anywhere, so both assertions below pass
 *  and the popup closes as though the operation succeeded. **MEASURED in the real
 *  Electron renderer (§4.2 M9b), with a mirroring control leg (M9c) proving the
 *  guard does fire when a value moves.** rc-select emits no `onChange` when the
 *  selected value is unchanged (`Select.js:314-318`, "Trigger event only when
 *  value changed"), while the option stays clickable and closes the popup
 *  (`OptionList.js:371-374`, `:161-170`). **A VALUE-DELTA GUARD CANNOT PROVE
 *  OPERATION IDENTITY.** Owner ruling 2026-08-31, option (a): P4 detects
 *  wrong-control MUTATION; PREVENTION is P1's, by construction. Do not restore
 *  the claim that P4 catches every wrong-control operation.
 *
 *  `siblingsBefore` is captured before the gesture by `selectOptionByText`. */
private async expectSelectShows(
  testId: string,
  expected: RegExp,
  siblingsBefore: Record<string, string | null>,
): Promise<void> {
  await expect(
    this.window.getByTestId(testId).locator('.ant-select-content-value'),
    `${testId} did not end up showing the value that was selected — the click may ` +
      'have landed on another control',
  ).toHaveText(expected, { timeout: 5000 });

  // ⚠ SP-21: the half we did NOT ask for must be exactly as it was. This is what
  // makes a wrong-control click loud when the requested value was pre-satisfied.
  // ⚠⚠ SP-26: the message NAMES the requested control and both guarded controls,
  // and the compared value is KEYED, so the diff itself says which one moved.
  // `expect.poll` takes `{ message, timeout }` — Playwright 1.57.0,
  // `node_modules/playwright/types/test.d.ts:8455`.
  const guarded = Object.keys(siblingsBefore).join(', ');
  await expect
    .poll(() => this.snapshotOtherHalf(testId), {
      message:
        `${testId} was the control this call asked for, but the OTHER spacing ` +
        `half moved while it was being operated. Guarded controls: ${guarded}. ` +
        'Each key below is a test id — compare expected (before the gesture) ' +
        'with received (after) to see which control changed, and to what.',
      timeout: 5000,
    })
    .toEqual(siblingsBefore);
}
```

### ⚠⚠⚠ And the CALLERS — restored in revision 5, because revision 4 dropped them (SP-15)

**This is the most serious defect any round has found in a repair rather than in
the design, and it was self-inflicted.** Revision 3 showed a caller that ended
`await this.expectSelectShows(select, pattern); // P4`. **Revision 4 replaced
§4.4 wholesale and the caller block went with it** — so P4 was defined, listed in
the private-surface inventory and exercised by harness leg 5, while **nothing in
the proposed path ever called it**. The plan's central promise (§3 item 1, §4.1)
is _prevention plus a detector_; a detector with no call site is neither.

**The complete internal caller population is three methods** —
`tests/support/dsl/spacing.ts:102-124` — and all three are rewritten. Nothing
else in the class reaches the repaired path; the public `setCardMargin` /
`setCardPadding` string branches route through `setPreset`.

```ts
/** ⚠ Callers no longer open the Select themselves — `selectOptionByText` owns
 *  the whole open→locate→click→settle sequence. Calling `openSelectDropdown`
 *  first as well is redundant under the new signature and must not be retained. */
private async setPreset(
  testIdPrefix: 'spacing-margin' | 'spacing-padding',
  preset: SpacingPreset,
): Promise<void> {
  const testId = `${testIdPrefix}-preset`;
  const label = preset.charAt(0).toUpperCase() + preset.slice(1);
  const pattern = new RegExp(`^${label}`, 'i');
  const siblings = await this.selectOptionByText(testId, pattern);
  await this.expectSelectShows(testId, pattern, siblings);          // P4
}

async setMarginMode(mode: SpacingMode): Promise<void> {
  const pattern = mode === 'all' ? /^All Sides$/i : /^Per Side$/i;
  const siblings = await this.selectOptionByText('spacing-margin-mode', pattern);
  await this.expectSelectShows('spacing-margin-mode', pattern, siblings);   // P4
}

async setPaddingMode(mode: SpacingMode): Promise<void> {
  const pattern = mode === 'all' ? /^All Sides$/i : /^Per Side$/i;
  const siblings = await this.selectOptionByText('spacing-padding-mode', pattern);
  await this.expectSelectShows('spacing-padding-mode', pattern, siblings);  // P4
}
```

⭐ **The SAME pattern object is used to select and to read back**, so P4 cannot
drift from what was asked for. ⚠ **P4 is what closes the one silent path option B
still has** — a unique class attached to the _wrong_ Select would satisfy the count
and visibility checks; the read-back would not. §6 leg 5 must therefore be run
against **this wired path**, not against `expectSelectShows` in isolation: leg 5
can show the method fails when called, and only the wired path shows it _is_
called.

**What is removed from the current helper** — restored here, also lost in
revision 4's rewrite:

1. **The `force: true` fallback at `:49`** — it disables the hit-target check
   outright. Never restored.
2. **The `evaluate((el) => el.click())` at `:59-61`** — a DOM click that cannot
   complain about an obscured, detached or unstable target. Never restored.
3. **The `Escape` presses at `:46` and `:62`.** ⚠ Note RT-1: those presses were
   papering over the toggle hazard, which is why removing them required the
   `isOpen` guard in the loop. The guard is the replacement, not an addition.
4. **`waitForAllSelectDropdownsToClose()` as an authority**, in either position.
   ⓘ It may remain in the class for a caller wanting a page-wide quiesce; nothing
   in the repaired path calls it.

**What is RETAINED — the bounded retry** (SP-2, owner's ruling 2026-08-27), now
gated on `isOpen` so a second click cannot toggle a slow-but-correct open shut.
⚠ The asymmetric budget (1500 ms then 5000 ms) is still a **JUDGEMENT from no
measurement**; legs 4 and 9 characterise it before it is frozen.

⭐⭐ **WHAT REVISION 4 DELETED, AND WHY THAT MATTERS MORE THAN WHAT IT ADDED.**
Gone: the `aria-controls` filter, the `:visible` document-global locator, the
asserted singleton, and the `Math.max(50, …)` floor. **Every one of them existed
to answer "which popup is mine?" — a question option B does not ask.** The helper
is shorter than revision 3's and has one fewer moving part than revision 1's.
⚠⚠ **It also deleted two things it should not have — the caller block above and
the removal record — which is exactly the over-reach the fix-round rule warns
about: a wholesale replacement carries away whatever else lived in the block.**

### 4.5 Deliberately NOT proposed

- **No change to `expectCardMarginApplied` / `expectCardPaddingApplied`.** They
  are correct; they were the messenger.
- **No change to `getInputNumberInput` / `setInputNumberValue`.** They drive
  `InputNumber`, not `Select`, and target by testid without any popup involved.
  `setMarginSide` / `setPaddingSide` therefore need no repair — contrary to the
  diagnosis drawer's sentence that the same hazard "sits under `setMarginSide`
  and `setPaddingSide` too". **That is a second correction:** those two never
  call `openSelectDropdown` or `selectOptionByText` (see §3 item 3's grep). The
  hazard reaches them only through `setCardMargin`/`setCardPadding`'s _mode_
  switch, which is `setMarginMode`/`setPaddingMode` and **is** repaired here.
- **No `tests/baseline/expected-failures.json` change**, in either direction.
- **No snapshot re-baseline.** `spacing.visual.spec.ts` has committed snapshots;
  §5.3 covers what must not move.
- **No extraction of a shared Select utility** — that is `TESTING_STANDARDS.md`
  open item 27 and it is §5.2's option S3, not this change.

---

## 5. Blast radius

### 5.1 Direct consumers — MEASURED

`SpacingDSL` is constructed for **every** `launchWithDSL` context
(`tests/support/index.ts:41`, `:101`, `:153`), so every spec has a `spacing`
property. But the enumeration of actual **call sites** is narrow. Command, and
it is re-runnable:

```
grep -rloE '\bspacing\.(setCardMargin|setCardPadding|setMarginMode|setPaddingMode|setMarginSide|setPaddingSide|expectCardMarginApplied|expectCardPaddingApplied|expectSpacingScreenshot)\b' tests/ src/ tools/ | sort -u
```

**It returns exactly two files:** `tests/e2e/spacing.spec.ts` and
`tests/e2e/spacing.visual.spec.ts`.

⚠⚠ **A CORRECTION TO THE RECORD.** Both the session handover and the framing in
`[STATE]` ("shared machinery three specs depend on") name
`tests/e2e/canvas-resize-and-nesting.spec.ts` as a third consumer. **It is not
one.** Its only occurrence of the string `spacing` is at `:23`, inside the file's
opening docblock, in the sentence _"PROPS-06 was marked `auto_covered: Y` on
`tests/e2e/spacing.spec.ts`…"_. Command:
`grep -n "spacing" tests/e2e/canvas-resize-and-nesting.spec.ts` → one hit, line
23, inside a comment. ⓘ A naive pattern such as `\bspacing\.[a-zA-Z]` **does**
match that line, because it matches the `spacing.spec` in the file path — which
is how the wrong count most likely entered the record in the first place.

The per-method call-site table, from the same enumeration:

| Method                                                             | Routes through the repaired code? | Call sites                                                                       |
| ------------------------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------- |
| `setCardMargin(string)` / `setCardPadding(string)` → `setPreset`   | **Yes**                           | `spacing.spec.ts:27, 51, 109, 112, 134`; `spacing.visual.spec.ts:29, 30, 33, 34` |
| `setMarginMode` / `setPaddingMode`                                 | **Yes**                           | `spacing.spec.ts:76, 83, 135`                                                    |
| `setCardMargin(number\|object)` / `setCardPadding(number\|object)` | Yes, via the mode switch          | as above                                                                         |
| `setMarginSide` / `setPaddingSide`                                 | **No** — `InputNumber`, no popup  | `spacing.spec.ts:77-80, 84-87, 136-139`                                          |
| `expectCardMarginApplied` / `expectCardPaddingApplied`             | **No** — unchanged                | `spacing.spec.ts:28, 52, 81, 88, 110, 113`                                       |
| `expectSpacingScreenshot`                                          | **No** — unchanged                | `spacing.visual.spec.ts:27, 31, 35`                                              |

### ⚠⚠ 5.1a The `src/` side — NEW IN REVISION 4, because option B touches product code

Revisions 1–3 were **test-only**. Option B is not, and that is the single most
important scope change in this revision, so it is stated here rather than left in
§4.4.

**The whole product-side change is two added lines in one file**,
`src/components/SpacingControls.tsx`: a `classNames={{ popup: { root: … } }}`
prop on each of the two `Select`s inside `renderSection`. ⚠ **Stated precisely
(SP-18) — revision 4 said "no markup", which is wrong, because a class attribute
IS markup:** the popup root's `class` attribute gains one token. **No behaviour,
no layout, no styling, no state, and no prop the app reads**; no product CSS rule
and no product code selects on the new tokens (verified by the collision search
below, which returns no hit anywhere under `src/`).

**Who else renders these controls:** `renderSection` is called exactly twice
(`src/components/SpacingControls.tsx:228-229`), which is what produces the four
identically-labelled Selects this whole plan is about. **`SpacingControls` itself
has exactly one product consumer, `src/components/PropertiesPanel.tsx:6632`**
(regenerate: `grep -rn "<SpacingControls" src/`). Regenerate the rest:

```
grep -n "renderSection(" src/components/SpacingControls.tsx
```

**Class-name collision check, and it must be run rather than assumed** — the
`test-id` falsification is exactly what an unchecked uniqueness assumption costs:

```
grep -rn "spacing-margin-mode-popup\|spacing-margin-preset-popup\|spacing-padding-mode-popup\|spacing-padding-preset-popup" src/ tests/ tools/
```

⚠ **This is a lexical check on a lexical class**, and it is published so it can be
attacked. It cannot see a class assembled at runtime from fragments. ⓘ M7 measured
the stronger property directly — that with both popups mounted, each class matched
exactly one popup root and neither carried the other's.

⭐ **A CONSEQUENCE THE OWNER SHOULD SEE, NOT BURIED:** because this now touches
`src/`, the change is no longer "test-only", and the §7.4 lane brief was ruled on
2026-08-27 for a **test-only** change. §7.4 records whether that ruling still
holds on the new facts rather than assuming it does.

### 5.2 ⚖ OWNER DECISION 2 — the class this defect belongs to, and how wide to sweep

**What this protects in product terms.** Nothing in the shipped app. This
decides how much of the _alarm system_ gets rewired in one go, and therefore how
much is proved at once versus left standing.

**What is going wrong plainly.** The wrong-control defect is not unique to the
spacing helper. At least two other test helpers were written the same way.

**Is the product affected?** No. **Evidence status:** that the other helpers
carry the same _code_ is MEASURED; that it is causing their known problems is a
**HYPOTHESIS** and is deliberately not asserted.

⚠ **The class stated as a BEHAVIOUR, before any search key was chosen** — a
mechanical sweep is only as good as the key it is keyed on, and grepping the
token the first instance used is not a sweep of a class defined by what its
members _do_:

> **The class:** a test helper that selects an option from an antd `Select` by
> locating a popup it has **not proved it owns** — identifying the popup by
> existence (`:visible` / `:not(-hidden)`, `.first()` / `.last()`) rather than by
> a link back to the requested control.

Corroborating search key (a token grep, published so it can be attacked —
it would miss a member that identified popups some other way):
`grep -rn "ant-select-dropdown" tests/ --include=*.ts`.

**Two other DSL files carry the same defect pair near-verbatim** — the same
`.last()` visibility check, the same document-global `.first()` option search,
the same `evaluate`-click:

| File                         | The block | Call sites of its `selectOptionByText` |
| ---------------------------- | --------- | -------------------------------------- |
| `tests/support/dsl/tabs.ts`  | `:6-38`   | `:149`, `:182`                         |
| `tests/support/dsl/popup.ts` | `:6-37`   | `:114`                                 |

⚠ **Both own known suite problems.** `tabs.visual:33` is a long-standing
baselined failure whose recorded signature is
`expect(locator('.ant-select-dropdown:visible')).toHaveCount(0)` failing at
`tests/support/dsl/tabs.ts:11` — _that is `waitForAllSelectDropdownsToClose`,
the very construct in question_. And `e2e/popup.spec.ts` › `properties panel size
and close-on-backdrop update behavior` is entry (i) of the unallowlisted
sightings register at one sighting. ⚠⚠ **Neither of those is diagnosed, and this
plan does not claim they share this root cause** — the shared _construct_ is
MEASURED, the shared _cause_ is a HYPOTHESIS.

Beyond those two, the wider family is larger. ⚠⚠ **REVISION 1 SAID THE GREP
RETURNS "~20 further DSL and spec files". THAT WAS WRONG — finding SP-5.**
Regenerated, the token population is **33 files**, i.e. **30 beyond
spacing/tabs/popup**. **No figure is quoted here any more; the command IS the
inventory**, because a static count of a growing set goes false at the moment the
next member lands:

```bash
grep -rl "ant-select-dropdown" tests --include='*.ts' | sort
```

⚠ That remains a **token** inventory and therefore corroboration, not a
behavioural sweep — it neither proves all 33 are class members nor bounds the
class, since a member identifying popups some other way would not appear. The
project has already named the underlying problem: `TESTING_STANDARDS.md:1422`,
open item **27 — "Consolidate Ant Design Select Interaction Logic"**, which states
the consequence exactly: _"This leads to inconsistent patterns and regression when
one is fixed but others aren't."_ ⚠ Note that the helper that item nominates as
canonical — `ConditionalVisibilityDSL.selectAntOption()`,
`tests/support/dsl/conditionalVisibility.ts:22-46` — **is itself scoped only by
`.last()`** (`:24`). It is better than `SpacingDSL` on actionability (it uses a
real `option.click()`), and it has the same ownership gap.

**The options.**

|        | Scope                                                                      | Cost                                                                                                                            | Risk                                                                                                                                  |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **S1** | `SpacingDSL` only                                                          | One file; one harness run                                                                                                       | Leaves two byte-similar siblings carrying the same construct                                                                          |
| **S2** | `SpacingDSL` + `tabs.ts` + `popup.ts`                                      | Three files; the harness must cover three surfaces, and `tabs.visual:33` is a **baselined** identity whose behaviour would move | Touching a baselined identity inside an undiagnosed change is how a manifest row becomes wrong; it would need its own diagnosis first |
| **S3** | Extract the shared utility, migrate all Select-driving DSLs (open item 27) | Large; touches most of the e2e suite                                                                                            | Highest — it is a slice, not a fix                                                                                                    |

**Recommendation: S1 now, S2 and S3 recorded as follow-ups.** Three reasons,
each independent: the owner's 2026-08-26 ruling authorised the **spacing**
helper; `tabs.visual:33` is a _baselined_ identity and moving its behaviour
inside a change whose own remedy is unproven would confuse two questions at once
— it needs its own diagnosis, which it does not have; and S3 is capability-shaped
work that under `docs/governance/OPERATING_AGREEMENT.md` §3.7's hybrid ban should
enter as its own slice rather than ride along on a fix.

⚠ **Naming a class is not fixing it, and this plan does not pretend otherwise.**
If S1 is chosen, the two siblings stay defective and that is a deliberate,
recorded choice — not an oversight.

**If you do nothing about the wider class:** the same unowned-popup risk remains
in `tabs.ts` and `popup.ts`, a similar failure **could** occur there, and open
item 27 stays open. ⚠ **Their known sightings stay explicitly UNDIAGNOSED** —
revision 1 wrote this as a prediction that the next flake _would_ appear there,
which is a runtime certainty this plan has no diagnosis to support (finding
SP-6).

### 5.3 What must not move

- **`spacing.visual.spec.ts`'s committed snapshots.** The repaired helper drives
  the same controls to the same values, so the rendered card should be
  byte-identical. If a snapshot moves, that is a **signal, not a nuisance**: it
  would mean the old helper had been setting something different from what the
  test asked for, in a leg nobody had noticed. §6 leg 4 covers it, and a moved
  snapshot goes to the owner rather than being re-baselined.
- **The three passing spacing tests** (`:10`, `:34`, `:58`) and the YAML
  round-trip test (`:119`), which is the only other caller of `setPaddingMode`.
- **`tests/baseline/expected-failures.json`** — untouched.
- **Upstream reliances:** none. `openSelectDropdown`, `selectOptionByText`,
  `resolveOwnedDropdown`, `popupFor`, `expectSelectShows`, `otherHalf`,
  `snapshotOtherHalf` and `readSelectValue` are all private to `SpacingDSL` and
  nothing outside the class can reach them. ⚠ `snapshotOtherHalf` is **new in
  revision 7** (SP-26) and is listed here rather than left to be noticed: an
  inventory that silently omits a member is how SP-15 happened.
- ⚠⚠ **NEW IN REVISION 4 — `BackgroundCustomizer.tsx`'s five existing
  `popupClassName` uses, `src/index.css:26-40` which selects on all five, and
  `tests/support/dsl/backgroundCustomizer.ts`.** They are the API precedent this
  change follows and they are **deliberately NOT touched**. ⚠ The CSS consumer was
  missed in revision 4 and is named here because it is what makes those five
  classes product surface rather than test-only hooks (SP-18).
  Migrating them from the deprecated `popupClassName` to `classNames.popup.root`
  is a real and separate piece of work; doing it here would be the over-reach the
  fix-round rule warns about, and it would put a second DSL's specs in this
  change's blast radius for no benefit to the defect being repaired.

---

## 6. How it will be verified, before a CI cycle is spent

Per the MANDATORY COMPANION clause in `CLAUDE.md`: a plan review catches wrong
_thinking_ but not wrong _doing_, so a runnable harness attacks the real code
first. A probe that only asks "does it click the right control now" cannot see
"would it still fail if it clicked the wrong one". PR #153's harness caught a trap
in _itself_ precisely because its legs were bidirectional
(`drawer_havdm_investigations_e782dca064b2b8c5e7c22549`), and that is the model
here.

⚠⚠ **REVISION 4 WITHDRAWS A FALSE UNIVERSAL — finding SP-12.** Revisions 2–3 said
**"every leg is bidirectional"** and that each leg "runs twice", while four rows
carried `n/a` on one side. That is not a wording slip: it let a leg that could
not be built read as though it had been. **The bidirectionality requirement is on
the HARNESS, not on every row of it** — what the companion clause forbids is a
probe that can only confirm, and the guard against that is that **each leg
declares which KIND of evidence it produces**:

| Kind                            | What it proves                                                                                                                                                                                   | Legs       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| **FAIL-OLD / PASS-NEW**         | The defect is real AND the repair removes it. Runs on both variants.                                                                                                                             | 1, 2, 4, 7 |
| **GUARD-REMOVAL DISCRIMINATOR** | A NARROWER repair still fails, so the chosen guard is the one doing the work. Runs on a deliberately weakened variant.                                                                           | 3, 5       |
| **KNOWN-BAD CONTROL**           | The probe can still fail — proof it is not reporting green blindly.                                                                                                                              | 6          |
| **ONE-SIDED CHARACTERISATION**  | Records behaviour of the repaired helper only; proves nothing about the old one and is NOT acceptance evidence.                                                                                  | 8, 9       |
| **KNOWN-OPEN BOUNDARY**         | ⚠ Asserts the CURRENT, passing behaviour at a limit the plan does not close, so the limit cannot be silently lost. **A pass here is NOT evidence of correctness** and never acceptance evidence. | 5b         |

⭐ **The harness is bidirectional because rows 1, 2, 4 and 7 run both ways and row
6 must fail — not because every row does.** §6's record states the kind beside
every result.

⚠⚠ **KNOWN-OPEN BOUNDARY IS NEW IN REVISION 7 AND IT IS THE ONLY KIND THAT
RECORDS A PASS AS A LIMIT RATHER THAN AS A RESULT.** Leg 5b asserts that the
double-pre-satisfied wrong-control operation **passes** — which is exactly what
SP-25 says and what M9b measured. It is here because a boundary written only in
prose is a boundary nobody re-reads: **anyone who later closes this hole breaks
leg 5b and must correct §3 item 2, §4.1's P4 row and §8 in the same commit.**

⚠⚠ **THE TABLE ABOVE COVERS THE MECHANISM LEGS 1–9 ONLY, AND REVISION 4 DID NOT
SAY SO — finding SP-17.** It wrote the rule as though it governed every numbered
leg while legs 0 and 10–12 sat outside it, and simultaneously called leg 12
acceptance evidence, which its own "acceptance comes from the first two kinds"
sentence forbade. **The population is 0–12 and it is covered here in full:**

| Leg    | Category                      | What it is, and what it may be used for                                                                                                                                                                                                                                                                             |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0**  | **CENSUS**                    | Measures DOM state; runs no helper and has no old/new sides to compare. It is where §4.2's M1–M7 come from. ⚠ Never acceptance evidence for the repair — and note it produced M3, which was **wrong**, so a census result is evidence only for what it sampled.                                                     |
| 1–9    | see the kinds above           | The mechanism legs, **including 5b**. **This is the only group that table governs.** ⚠ Revision 7 added a FIFTH kind (KNOWN-OPEN BOUNDARY) and one leg, 5b, so this row says "the kinds above" rather than "the four kinds" — SP-17 was caused by exactly this sentence going stale against the table it points at. |
| **10** | **REGRESSION**                | The existing callers and the visual spec must not change behaviour, and snapshots must not move (§5.3). A pass is a **necessary, not sufficient** condition.                                                                                                                                                        |
| **11** | **REPEAT / CHARACTERISATION** | `--repeat-each=5`. Already labelled not-acceptance in its own row, and that stands.                                                                                                                                                                                                                                 |
| **12** | **GATE**                      | CI. ⚠ **Deliberately an AGGREGATE signal, and that is why the first-two-kinds rule is scoped to the mechanism legs rather than applied to it.** CI cannot be a fail-old/pass-new control — nothing runs the old helper in CI.                                                                                       |

⭐ **The narrowed rule, stated once:** _acceptance evidence **that the defect
mechanism is repaired** comes only from legs of the FAIL-OLD/PASS-NEW or
GUARD-REMOVAL kinds._ Legs 10–12 are release gates: they can **veto** a repair and
cannot **establish** one. ⚠⚠ **KNOWN-BAD CONTROL, ONE-SIDED CHARACTERISATION and
KNOWN-OPEN BOUNDARY are all outside that rule, and 5b most sharply of all: it
passes BY DESIGN, so reading its green as acceptance would be the exact
substitution this plan has already paid for.** ⚠ And leg 12 keeps its own standing caveat — acceptance
evidence is commit-addressed, and the per-attempt list is the measurement, never
the aggregate verdict.

The harness is a temporary probe under `tests/`, run headless
(`bash tools/test-headless.sh <spec> --project=electron-e2e --workers=1`), deleted
afterwards, with `git status --porcelain` verified empty and `src/` verified
byte-identical to `HEAD`.

### Leg 0 — the DOM census — ⭐ RUN TWICE, AND IT FALSIFIED A DESIGN BOTH TIMES

**STATUS: RUN 2026-08-27 (twice), headless, under the owner's narrow tripwire
exception (`drawer_havdm_decisions_12ca9d9672d4c827f60a4fcd`). Every probe was
deleted afterwards, with `git status --porcelain` empty and `src/` + `tests/`
verified byte-identical to `HEAD`.**

- **RUN 1 → §4.2's M1–M4, and the `aria-controls` id-collision falsification.** It
  killed **option A**.
- **RUN 2 → §4.2's M5–M7.** It falsified **M3**, and with it **option D** (M6),
  and separately measured that **option B's class lands and is unique** (M7).

⭐⭐⭐ **THE SAME INSTRUMENT DECIDED, IN ABOUT A MINUTE EACH TIME, TWO QUESTIONS
THAT THREE ROUNDS OF SOURCE REVIEW HAD CLEARED WRONGLY.** ⚠⚠ **And run 2 is the
sharper datum, because it falsified a claim that RUN 1 ITSELF had produced.** M3
came out of a probe and was still wrong, because that probe sampled the settled
state and M3 quantified over every instant. **Being measured is not the same as
being measured for the property you are about to rely on.** Anything in §4.2 that
a later change touches must be re-measured, not re-argued — **including things
§4.2 already calls MEASURED.**

### Legs 1–9 — the guard

Each leg names its **kind** (above), the **variant** it runs against, and **one**
expected result per invocation.

⭐⭐ **LEG 1 IS RESTORED — revision 3 deleted it on M3, and M3 was false.** Route
(a) is not merely constructible; M5 measures it at ~350 ms on the ordinary path.
⚠⚠ **Leg 1 is now the most valuable row in this table, because it is the leg that
would have caught option D before the review did**: it enters the exact state M6
measured and asks whether the helper can be handed the foreign popup.

**Variants, named once so no row has to describe them again:**

- **REPAIRED** — the §4.4 helper as proposed.
- **CURRENT** — `tests/support/dsl/spacing.ts` as it stands on `main`.
- **SCOPE-ONLY** — the REPAIRED helper with `popupFor` replaced by
  `this.window.locator('.ant-select-dropdown:visible')` and the class check
  dropped, i.e. the narrower repair the diagnosis drawer recommended. **This is a
  concrete, runnable code shape, not a description** — it is the REPAIRED helper
  with two lines changed, and it retains P3 and P4.
- **P4-ONLY** — the SCOPE-ONLY variant with the `toHaveCount(1)` popup-identity
  assertion also removed, so only the real click and the P4 read-back survive.
  ⚠ **This is SP-12's repair: revision 3 said "P1 and P2 removed" without naming
  an opener, and under §4.4 that left no way to obtain a popup at all. Deriving it
  from SCOPE-ONLY gives it a document-global opener that demonstrably works.**

| #      | Case                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Kind                | Variant(s) and expected result                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | ⭐⭐⭐ **THE M6 STATE — route (a).** Open the margin preset Select, then drive the padding preset path immediately, so the call lands inside the ~350 ms two-popup window (M5).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | FAIL-OLD / PASS-NEW | **CURRENT: sets the MARGIN** (or flakes between the two — record which, per attempt). **REPAIRED: passes**, and P4 confirms the padding control. ⚠ Record the popup count observed during the call — if it is never 2, the leg did not enter its own state and its green means nothing.                                                                                                                                                                                      |
| **2**  | **⭐ THE FOREIGN-ONLY FAILURE STATE.** The margin popup is open; the padding Select's own opening is suppressed page-side; then the padding path runs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | FAIL-OLD / PASS-NEW | **CURRENT: silently succeeds**, setting the MARGIN — no error at all. **REPAIRED: fails inside `resolveOwnedDropdown`**, naming the control: `.spacing-padding-preset-popup` never became visible.                                                                                                                                                                                                                                                                           |
| **3**  | **⭐ The scope-only straw man**, run against leg 2's state — the repair the diagnosis drawer recommended.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | GUARD-REMOVAL       | **SCOPE-ONLY: must ALSO silently succeed.** This is what proves identity-beats-scope rather than asserting it. ⓘ §4.2 M4 already measured the same thing statically; this leg proves it through the helper.                                                                                                                                                                                                                                                                  |
| **4**  | **The happy path.** Clean panel, nothing else open.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | FAIL-OLD / PASS-NEW | **CURRENT: passes. REPAIRED: passes, and adds no measurable stall** — record the wall time of `openSelectDropdown` end-to-end, as **characterisation input for the 1500 ms budget** (SP-10).                                                                                                                                                                                                                                                                                 |
| **5**  | **The P4 detector alone**, run against **leg 2's state**. ⚠⚠ **Run it through the WIRED CALLER (`setPreset`), not by calling `expectSelectShows` directly** — SP-15 was precisely a P4 that existed and was never called, and a leg that invokes the method itself would have passed against revision 4. ⚠⚠⚠ **SP-26: THE LEG IS NOT SATISFIED BY A RED.** It must **record the exact failure message and the runner's exit code**, the way leg 6 already does, and the recorded message must contain the requested test id **and** the test id of the control that moved. A leg that only asserts "it failed" cannot tell a named failure from an anonymous one — which is precisely the defect SP-26 raised. | GUARD-REMOVAL       | **P4-ONLY: fails at `expectSelectShows`, and the RECORDED MESSAGE names the requested control and the moved control** — proving P4 detects independently of P1 and P2, that the repaired path reaches it, and that the diagnostic is what §3 item 2 promises. ⓘ The opener is SCOPE-ONLY's document-global one; see the variant list. ⚠ **This leg exercises the MUTATION case only.** Leg 5b below is the pre-satisfied case, and it is a KNOWN-OPEN pass, not a detection. |
| **5b** | ⚠⚠⚠ **NEW IN REVISION 7 — THE SP-25 KNOWN-OPEN CONTROL.** Leg 2's state, but with the foreign control ALSO pre-satisfied: a fresh card, where all four spacing Selects sit at their defaults (M9a), driving `setMarginMode('all')` while the misattached class puts the click in the Padding mode popup.                                                                                                                                                                                                                                                                                                                                                                                                       | KNOWN-OPEN          | **REPAIRED: PASSES, and that is the CORRECT recorded result.** ⚠ It is recorded as the measured boundary of P4, **not** as evidence of correctness: prevention here is P1's alone. Assert what IS true — anyone who later closes this hole breaks this leg and must correct §3, §4.1 and §8 in the same commit. ⓘ MEASURED already as M9b, with M9c as its mirroring control; the leg pins it so it cannot be quietly lost.                                                  |
| **6**  | **The negative control — known-bad input the probe must still fail on.** Point the helper at a preset label that does not exist (`/^Nonexistent/`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | KNOWN-BAD           | **REPAIRED: fails on the option `toHaveCount(1)`**, naming the pattern. ⚠ Record the **exact failure message AND the runner's exit code** — a failure caught inside a passing wrapper is indistinguishable from a pass.                                                                                                                                                                                                                                                      |
| **7**  | **A STABLE, legitimately-open UNRELATED Select popup**, then run the padding path against a clean padding control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | FAIL-OLD / PASS-NEW | **CURRENT: the document-global pre-wait burns its full budget and fails without touching the padding Select** — the defect SP-1 named. **REPAIRED: passes promptly**, because it asks for its own popup by class. ⓘ Revision 3 expected a two-popup state here to "break loudly"; under option B it is simply irrelevant.                                                                                                                                                    |
| **8**  | **The OWNED popup mid-leave.** Enter the padding path while the padding Select's own popup is animating shut.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | CHARACTERISATION    | **REPAIRED, one oracle: the helper RE-OPENS and selects successfully.** ⚠ Not acceptance evidence — it says nothing about the current helper. See the construction below.                                                                                                                                                                                                                                                                                                    |
| **9**  | **The retry path.** First gesture suppressed, second succeeds.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | CHARACTERISATION    | **REPAIRED: passes on the second attempt**; record the wall time as characterisation of the budget and **not** as proof the number is right.                                                                                                                                                                                                                                                                                                                                 |

⭐⭐ **LEGS 2 AND 3 TOGETHER ARE THE DISCRIMINATOR**, and leg 3 does the work: it
runs the _narrower_ repair against the same state and must **also** silently
succeed. ⚠ **If leg 3 shows the scope-only variant failing loudly, identity-beats-scope
is wrong, the plan is heavier than it needed to be, and it goes back to the
owner** (§7.3).

**Constructions, specified — SP-8, SP-9 and SP-13.**

- ⭐⭐⭐ **Leg 1's construction — new in revision 4, and it is MEASURED rather than
  proposed.** The state is entered by opening the margin preset Select, waiting for
  its popup to be visible, then driving the padding preset path **immediately**,
  with no settling wait. §4.2's run 2 established the window this lands in: two
  popups visible for **~350 ms** and, inside that, **~45–67 ms** in which the
  padding Select reports itself open while the only visible popup is the margin's.
  ⚠ **The leg must RECORD the maximum simultaneous visible-popup count observed
  during the call, and treat `max < 2` as "the leg did not enter its own state" —
  a green in that case proves nothing and must not be recorded as a pass.** ⓘ This
  is the guard revision 3's leg 7 lacked: it asked the probe to notice a two-popup
  state without giving it a way to tell "never happened" from "not looked for".
- ⚠⚠ **Legs 2 and 3's suppression must last the WHOLE HELPER CALL, not one
  event — finding SP-8.** Revision 2 specified a one-shot listener removed after
  the first `mousedown`; the repaired helper makes **two** attempts, so attempt 1
  found no listener, clicked normally, and **opened the requested popup** — the
  leg could not produce its stated failure. Neither repair was wrong alone: the
  `mousedown` fix was correct and the retry was the owner's ruling. **The defect
  was the interaction.**
  **Corrected:** attach a `mousedown` listener in the **capture phase** on the
  padding Select's root for the **duration of the call**; **count every suppressed
  event**; remove it in `finally`. Assert afterwards: the suppression count is
  **2** (both attempts), the padding combobox still reads `aria-expanded="false"`,
  the foreign popup is **still visible**, and **both pointer actions completed**
  rather than throwing. ⓘ The current/scope-only variant may return after the
  first suppressed gesture, because it accepts the foreign popup — record its
  count as whatever it is.
  ⚠ **OPEN QUESTION, DELIBERATELY NOT ANSWERED HERE:** Playwright's own injected
  hit-target interceptor is a single-slot listener that also calls
  `stopImmediatePropagation()`. **Whether a test-side capture listener interacts
  with it is a question for the probe, recorded as a question.** Guessing is the
  error SP-2 and SP-7 both punished.
- ⚠⚠ **Leg 8 needs a construction and ONE oracle — finding SP-9.** Revision 2
  supplied neither, and accepted _"re-open cleanly **or** fail with its own
  message"_, which is two opposite results.
  **Corrected:** widen the actual CSS leave duration test-side (a style override
  on the popup's motion, **not** a `src/` patch and **not** a stubbed timer),
  initiate the close, and assert **immediately before invoking the helper** that
  the padding combobox reads `aria-expanded="false"` while its owned popup is
  **still visible**. **The single expected contract: the helper RE-OPENS and
  selects successfully.** Remove the style override in `finally`.
  ⭐ **Under option B this leg is easier to state and weaker in consequence than it
  was under option D.** `resolveOwnedDropdown` waits for
  `.<testid>-popup` to be **visible**, and a popup mid-leave is still visible — so
  the helper may return a popup that is closing. **P3's real click on an option
  inside a leaving popup is the thing to watch, and P4 is what would catch it.**
  ⚠ Record whether the click lands; if it does not, the contract above is wrong and
  the leg has found something.
- ⚠ **Leg 9 needs its own construction — finding SP-9.** Start clean; attach a
  **one-shot** capture `mousedown` suppression to the padding root; record that it
  fired **once** and removed itself; then assert the helper succeeds **only after
  the second gesture** and that the control shows the selected value. ⚠ It must
  **not** reuse leg 2's whole-call listener, or it becomes a duplicate of leg 2
  instead of a test of the retry.
- ⚠ **Leg ordering is load-bearing.** PR #153's harness recorded a repaired leg
  passing when it should have failed, because a previous leg had already closed
  the popup. Each leg re-establishes its own state and **asserts that state
  immediately before running**; assertions are recorded beside the result. **And
  prove every listener and style override is gone before the next leg.**

**Leg 10 — the callers.** The three currently-passing spacing tests plus the YAML
round-trip test, and `spacing.visual.spec.ts`, run headless at `--workers=1`
against the repaired helper. Snapshots must not move (§5.3).

**Leg 11 — repeat.** `--repeat-each=5` on `applies spacing presets`. An isolated
green does not clear a full-suite flake, and this leg is characterisation, not
acceptance — it is recorded as such.

**Leg 12 — CI.** Only after legs 0–11 are recorded. ⚠ Acceptance evidence is
commit-addressed: any run credited to this fix must have the fix's commit as its
head, and the per-attempt list is the measurement, not the aggregate verdict.
⚠ Tier 1 selects by walking the import graph of **test** files, so a test-only
change here **will** select the spacing specs — but that is a property of this
change, not coverage in general.

**Opportunistic:** if legs 1–3 make one route reproducible and the others not,
record which — it would close §2.3's open question. It is **not** a success
criterion.

---

## 7. Sequencing, and what needs the owner

1. **Now — independent review of this plan.** Commission at
   `docs/reviews/spacing-helper-preset-plan-codex-commission.md`; the
   second-person paste prompt at `prompts/codex/spacing-helper-preset-plan.md`
   (`prompts/` is gitignored — deliberately). The **owner** pastes it; the agent
   never spawns a reviewer (`drawer_havdm_decisions_7f4bc8b0658b617f17aa8b45`).
2. **Owner adjudication** of every finding, with options and a recommendation in
   Owner Decision Brief form, plus the two decisions already standing at §4.3 and
   §5.2.
3. **⚠⚠ NO CODE until a review returns ACCEPTS-REVISION.** That is the tripwire.
4. **Then implementation**, in this order — ⚠⚠ **corrected in revision 5
   (SP-17); revision 4 still said "leg 0 first (it can falsify option A), then
   legs 1–8", naming a mechanism that has been dead for two revisions and omitting
   legs 9–12 entirely:**
   1. **The `src/` change first** — the two `classNames` lines — since every
      option-B leg depends on the class existing.
   2. **A CLASS SMOKE STEP — census kind, NOT leg 1** (⚠⚠ new in revision 6,
      finding SP-20). Open each spacing Select in the running Electron app and
      record that its popup carries `.<testid>-popup` and that no popup carries
      another's. **This is the step that closes §8's first weak claim** — M7 is
      jsdom and nothing has yet observed the class in the real renderer — and it
      needs **no helper**, which is exactly why it can run here.
      ⚠⚠ **Revision 5 put LEG 1 in this slot, which was incoherent: leg 1 is a
      FAIL-OLD/PASS-NEW leg whose REPAIRED side is "the §4.4 helper as proposed",
      and that helper does not exist yet at this point in the order.** A one-sided
      class observation must not be relabelled as leg 1.
   3. **Then the helper and its three callers**, and only then the mechanism legs
      — **leg 1 first among them**, then **2–9**.
   4. **Then leg 10** (callers + visual, snapshots must not move), **leg 11**
      (`--repeat-each=5`), and the gate (`./tools/checks`, with the 4/4-steps
      check).
   5. **Then push and leg 12** (CI), whose result is commit-addressed.
5. **Under STRAT-D7** (`drawer_havdm_decisions_bd49cedc80cb93cafabc0f86`), every
   post-review repair gets a same-reviewer scoped follow-up. No exemption for a
   small diff. PR #153 took four rounds under this rule; plan for more than one.
6. **The PR never merges without the owner.**

### 7.3 What halts the work

The cost stop-rule in the header. Concretely, **two named refutations halt the
work and send it back to the owner rather than being pushed through**:

1. ~~**§6 leg 0 falsifies §4.2.**~~ ⭐⭐ **THIS HAS NOW HAPPENED TWICE, AND THE
   RULE WORKED AS WRITTEN BOTH TIMES.** Run 1 (2026-08-27) falsified the
   `aria-controls` mechanism and the owner re-ruled option D; **run 2 the same day
   falsified M3 and option D itself (M6), and the owner re-ruled option B.**
   Neither time did the plan silently substitute a mechanism — each went back to
   the owner (§4.3). ⚠⚠ **The standing halt condition now reads: if any measured
   fact in §4.2 (M1–M7) is later contradicted, STOP and re-put the mechanism
   decision rather than patching around it — and note that run 2 contradicted a
   fact run 1 had produced, so "it is already MEASURED" is not an exemption.**
2. **§6 leg 3 shows the scope-only variant failing loudly.** Then §2.3's
   correction is wrong, identity-over-scope is unjustified, and the honest
   options are the narrower repair or more diagnosis.

### 7.4 ⚖ OWNER DECISION 3 — which governance lane governs this work

⚠ **Revision 1 raised this as prose rather than as a brief, and §0 said only
"two decisions", so a third owner call was effectively hidden. Finding SP-4.
Rewritten here in the six required fields.**

**What this protects in product terms.** Nothing in the shipped app. It decides
which process and evidence burden governs this repair — how much review it owes
before code may be written.

**What is going wrong plainly.** The rulebook sorts work into two lanes and says
they never overlap. This job falls in the crack: it is a **bug fix** (fix lane),
but the thing being fixed is a **shared test helper**, and the rulebook names
test helpers as belonging to the other lane. Nobody wrote down which wins.

**Is the product affected?** **No.** This is process classification.
**Evidence status: MEASURED** from the two documents —
`docs/governance/OPERATING_AGREEMENT.md` §3.7 names test DSLs under the slice
lane's capability class and its hybrid ban says fix-lane work discovered to be
capability-shaped _"halts and re-enters as its own slice"_; `CLAUDE.md`'s
spec-before-code ruling is the fix lane's own trial scope. ⚠ **The independent
reviewer read the literal text as favouring SLICE lane**, and judged this plan's
counter-reading _"plausible policy reasoning, but not text in §3.7"_. That
disagreement is recorded rather than resolved by either agent.

**Options and costs.**
**A — fix lane, continue as-is.** §3.7's capability/content dial is described as
_the slice lane's_ depth dial, and reading the hybrid ban to cover any repair
touching shared code makes **every DSL bug fix a slice**, which empties the fix
lane. _Cost:_ proceeds on a reading the binding text does not state explicitly.
**B — slice lane, halt and re-enter.** Most defensible against the words as
written. _Cost:_ materially more process for a test-only repair, and it delays a
fix for a test that reddens roughly one run in four.
**C — fix lane now, clarify §3.7 separately** by the governed amendment path.
_Cost:_ an extra governance item.

**Recommendation: A.** For the reason above — a reading that empties one of the
two lanes cannot be the intended one.

**If you do nothing:** implementation would begin under a lane the binding text
appears to reject, leaving a non-developer owner to supply the missing legal
interpretation after the fact.

⭐⭐ **OWNER RULED: A — FIX LANE, CONTINUE AS-IS. 2026-08-27.** ⓘ Recorded here
rather than silently applied, because the reviewer's reading of §3.7 differs and
that disagreement should stay visible to anyone who reads this plan later. **This
ruling decides this work only; it does not amend §3.7**, and option C remains
available if the ambiguity recurs.

⚠⚠ **REVISION 4 RE-EXAMINES THIS RULING RATHER THAN INHERITING IT, BECAUSE A FACT
IT RESTED ON HAS CHANGED.** The brief above was argued and ruled for a
**test-only** repair, and its costs are stated in those terms ("materially more
process for a test-only repair"). **Option B is not test-only** — it adds two
lines to `src/components/SpacingControls.tsx` (§5.1a).

**The ruling still holds, and here is the reasoning rather than an assertion.**
§3.7's concern is capability-class work entering through the wrong door. What the
change does to `src/` is add a CSS class to a portal element: **no behaviour, no
markup structure, no state, no prop the app reads, and nothing any product code
selects on.** It is a test hook, and the repository already carries five of them
in `BackgroundCustomizer.tsx` — ⚠ which is an API precedent, not five test-only
hooks (SP-18), so it carries less lane weight than revision 4 gave it. **The
subject of the work is unchanged — it is
still the shared test DSL — and that is what the lane question is about.**

⚠ **The honest counter-argument, stated rather than argued away:** "test-only" was
load-bearing in the option-B _cost_ line of §4.3's original brief, and a reader
could reasonably say the lane brief should be re-put now that it is false. **The
author's judgement is that the lane turns on the SUBJECT of the work, not the file
extensions it touches** — but that is a JUDGEMENT, it is the author's, and **the
owner may overturn it at no cost to the plan**: option C (fix lane now, clarify
§3.7 separately) remains available and nothing below depends on which is chosen.

### 7.5 ⚠⚠ The running cost, stated plainly rather than buried

The owner has recorded more than once that this project's testing-to-product
ratio is already wrong. This plan is now at:

⚠⚠⚠ **SP-22 HAS NOW GONE WRONG TWICE, AND THE SECOND TIME IS THE INSTRUCTIVE
ONE.** In revision 5 this section led with "four rounds, fourteen findings" while
the header said nineteen across four. Revision 6 answered that by moving the
per-round record into
[`SPACING_HELPER_PRESET_PLAN_HISTORY.md`](SPACING_HELPER_PRESET_PLAN_HISTORY.md)
and declaring that the figures were stated once here and that the history stated
none — **and the history's own second paragraph stated them anyway, three lines
from its top.** ⚠⚠ **A FILE BOUNDARY IS NOT A CONSISTENCY MECHANISM.** Putting
the record in another file did not stop it contradicting the specification; it
only spread one fact across two files.
⭐⭐ **What is different in revision 7 is not a promise — it is a CHECK.** The
consistency checker's C3 now reads **both** files, is keyed on **site count**
rather than value disagreement, and reports every site by `file:line`. Run against
revision 6 it named eight round sites and two finding sites; it must report
**none** against this revision, and that is a mechanical fact rather than an
assurance. ⚠ Its own three defects — it read only this file, it was anchored on
two exact phrasings, and it parsed "twenty-four" as **4** — are recorded in the
history and were fixed on PR #154 before this repair was trusted.

- **six independent review rounds complete and a seventh owed**, on a defect in
  **one flaky test**;
- **twenty-six findings, none false**;
- **three ownership mechanisms**, of which **two were approved and then thrown
  away** — option A after the first harness run, option D after the second;
- ⚠⚠⚠ **nineteen of the twenty findings raised after round 1 were defects
  introduced by the PREVIOUS round's own repairs.** That is the number that
  matters. **This is not a review process converging on a hard problem; for five
  rounds it was the author generating the next round's work.**
- ⚠⚠ **and the count above INCLUDES round 6, whose two findings were both defects
  in revision 6's own repair of SP-21** — the fourth consecutive round in which
  the majority of findings were self-inflicted;
- **still zero lines of shipped code**, because the spec-before-code tripwire has
  held throughout.

⚠⚠ **AND THE COSTS REVISION 4's VERSION OF THIS LIST LEFT OUT, added in revision 5
because the reviewer was right that the inventory flattered the process:** five
plan revisions of author repair time; **three owner adjudications of the same
decision** (§4.3, ruled A then D then B); **two probe-exception cycles**; a gate
cycle lost to round 2's unformatted review commit; **three reviewer commits found
sitting local-only** (rounds 2 and 3, plus round 2's needing a separate formatting
commit); and **two self-inflicted SEV-1 blockers — SP-15 and SP-20 — each of which
added an entire round on its own.** **The honest total is larger than the headline
counts make it sound, and the "measure earlier" conclusion below is supported by
the arc but does not excuse the avoidable majority of this list.**

⭐⭐ **WHAT THE OWNER RULED ON 2026-08-31, AFTER BEING SHOWN THE SELF-INFLICTED
RATIO AS IT STOOD AT THAT MOMENT** (the live figure is in §7.5 and this sentence
deliberately does not restate it). Not "be more careful" — a structural change,
because the measured cause was structural: **the plan was an ungated surface.**
`tools/checks` runs eslint, prettier, tsc and vitest; against this document
prettier checked its FORMATTING and nothing checked its CONTENT, so every round
handed the reviewer an artifact no check had read. Two moves: **(1)** the per-round
record moved out (§9); **(2)** a **plan consistency checker** gates this document
the way the gate covers code — keyed on the classes that actually bit, and proved
to fire on known-bad input: against revision 4 it reports `expectSelectShows is
defined in a code block but never called` (SP-15), and against revision 5 `leg 1 is
scheduled at step 2 but the repaired helper it needs is only built at step 3`
(SP-20). ⓘ It lands as its own change off `main` — it is code, and putting it on
this branch would break the docs-only property the reviewer verifies each round.

⚠⚠⚠ **AND REVISION 6 STATED MOVE (1) AS "AN EDIT TO THE HISTORY CAN NO LONGER
CONTRADICT THE SPECIFICATION". THAT WAS FALSE WHEN IT WAS WRITTEN, AND ROUND 6
MEASURED IT SO.** A file boundary is not a consistency mechanism: the history's own
preamble restated the totals while its SP-22 row claimed the file stated none.
**Separation made the contradiction easier to SEE; only the checker makes it
impossible to SHIP.** ⚠⚠ **And move (2) has to be stated at its true strength too:
the checker was proved to fire on the two classes above and was then trusted on
everything else — and it returned a CLEAN PASS on revision 6 while three
contradictions were live.** Its three defects (it read only this file; it was
anchored on two exact phrasings; it parsed "twenty-four" as 4) are recorded in the
history's round-6 section and fixed on PR #154. **"Proved to fire on known-bad
input" is evidence for the inputs it was fired on, and for nothing else** — which
is the rule this plan already cites and the tool built to enforce it broke first.

⭐ **The two sides of that number, both true.** The process is expensive, and it is
also the only reason a mechanism that silently drives the wrong control was caught
three times before it shipped rather than after. **The harness is what changed the
economics**: both falsifications took about a minute of execution each, against
review rounds measured in hours. ⚠ **The lesson the author draws — and offers for
disagreement — is not "review more" but "measure earlier": every one of the three
mechanisms was cleared by reading and decided by running.**

ⓘ The owner was offered the option of re-putting the 2026-08-26
fix-don't-allowlist ruling with this cost visible and **declined it on 2026-08-27**;
it was re-offered when option D fell and **declined again**. The repair proceeds.

---

## 8. The weakest claims in this plan, for the reviewer to attack

Attack these by name. A finding against any of them is within reach and should
not have needed an independent reviewer to find.

- ⚠⚠⚠ **NEW IN REVISION 7 AND THE PLAN'S LOAD-BEARING WEAK POINT: P1 NOW STANDS
  ALONE IN THE DOUBLE-PRE-SATISFIED STATE.** SP-25 is measured (M9b) and the
  owner has narrowed P4 to wrong-control **mutation** (option (a), 2026-08-31).
  The consequence is that in the one state where the requested and foreign
  controls both already show the wanted value — **which M9a measures to be the
  ordinary starting state of a fresh card** — there is **no detector at all**,
  and the whole promise rests on P1's class-by-construction identity. ⭐ **The
  sharpest attack on this plan is therefore against P1, not against P4:** if a
  foreign popup can ever carry the requested control's class, nothing downstream
  will notice. M7 measured class placement and uniqueness in **jsdom only**, and
  the class has **never been observed in the Electron renderer** — the class
  smoke step exists to close exactly that, and it has not been run. ⚠ Leg 5b
  pins the known-open boundary so it cannot be quietly lost.
- ⚠⚠ **AND THE HONEST FORM OF THE SAME POINT: THIS PLAN NO LONGER PROVES WHICH
  CONTROL AN OPERATION REACHED.** It proves which control ends up with which
  value. **Detection, diagnostics and operation identity are three different
  properties**, and revision 6 conflated the first with the third. Whether an
  oracle for identity is constructible at acceptable cost is **open and
  deliberately unanswered** — the owner declined it on 2026-08-31 and no
  mechanism is invented here, because the two invented in prose on this branch
  were both falsified by execution.

- ~~**The strongest counter-attack: `openSelectDropdown` opens with a
  document-global wait, the authority §4.2 rejects.**~~ **RESOLVED IN REVISION 2
  BY REMOVAL, and the review found it worse than the author had.** SP-1 measured
  two defects: the wait consumed the harness's own hostile state, and against a
  stable open foreign Select the count never reaches zero at all. The owner
  removed the pre-wait entirely on 2026-08-27. ⓘ Kept here rather than deleted,
  because the _general_ setup-isolation-versus-authority distinction survives and
  the next author will be tempted by it again.

- **§2.3's three-route analysis is a re-reading, not a reproduction.** Route (b)
  and route (c) are constructed from the helper's source plus the run-228
  screenshot. Neither has been observed on the runner. If the real route is (a)
  alone, then the _narrower_ scope-only repair would in fact have sufficed and
  this plan is heavier than it needed to be. Leg 2 is what decides that, and it
  has not been run.
- **The whole of §4.2 is read from library source, not from the running app.**
  ⚠ **PARTLY SUPERSEDED IN REVISION 3: §4.2's M1–M4 ARE now measured in the
  running app.** What remains source-only is the residue —
  `data-testid` node, `.ant-select-content-value` — each is cited to a file and
  line in the installed dependency, and **none has been observed in the Electron
  app**. Leg 0 exists because of this. If any one is wrong, option A is
  falsified.
- **`.ant-select-dropdown-hidden` vs `:visible`.** The plan asserts that closed
  popups persist in the DOM (`removeOnLeave: false`) and therefore that `.last()`
  reflects first-open order. `removeOnLeave` is MEASURED; the DOM-ordering
  consequence is **INFERRED**, and Playwright's `:visible` treatment of a
  `-hidden` popup has not been measured either.
- ~~**The id-interpolation safety of the ownership selector.**~~ **MOOT IN
  REVISION 3 — the id mechanism is gone.** ⭐ And the underlying worry was aimed
  at the wrong hazard: the question asked whether the id might contain characters
  needing escaping. **The real defect was that the id is not unique at all**
  (§4.2). A weak claim pointed at the wrong property is not a weak claim, it is a
  blind spot.

- ~~**The retry loop is removed, and that is a behaviour change nobody asked
  for.**~~ **SUPERSEDED IN REVISION 2: the retry is RETAINED**, re-gated on
  ownership (SP-2, owner's ruling). What replaces it as a weak claim is the
  **asymmetric budget** — 1500 ms on the first attempt, 5000 ms on the second.
  Both numbers are **JUDGEMENT**, derived from no measurement. Too short a first
  budget converts a slow-but-correct open into a needless second click, and it is
  the second click whose failure gets reported. **Attack the numbers.**

- **P4 asserts on `.ant-select-content-value`, whose text is the option
  _label_.** For presets that is `Normal (8px)` and `/^Normal/i` matches. For the
  mode selects the labels are `All Sides` / `Per Side` and the existing patterns
  are anchored `^…$` — but `All Sides` is also a **substring of nothing else**
  only by luck of the current option set. If a future option were added, P4's
  pattern could match two things. Unverified against future option sets by
  construction; the `toHaveCount(1)` in `selectOptionByText` is the mitigation.
- **The virtualised-list claim cuts both ways.** §4.4 requires
  `toHaveCount(1)` on the option match. With six preset options that is safe
  today (INFERRED — the list height has not been measured), but a Select whose
  options overflow the rendered window would now fail loudly where it previously
  found its target. That is the correct behaviour and it is still a change in
  what the helper tolerates.
- **§5.2's sibling claim is about a shared CONSTRUCT, not a shared CAUSE.**
  `tabs.ts` and `popup.ts` carry byte-similar code — MEASURED. That
  `tabs.visual:33` and the `popup.spec.ts` sighting are caused by it is a
  **HYPOTHESIS** and is explicitly not asserted.
- **§5.1's "exactly two files" is a mechanical enumeration of a _lexical_
  pattern.** It would miss a caller that aliased the DSL (e.g.
  `const s = ctx.spacing`). ⓘ The author searched for exactly that — for a
  variable bound to `<something>.spacing`, and for a destructuring that renames
  `spacing` — and found none outside `tests/support/index.ts` itself. That is
  still a lexical search of a lexical class. The command is published so it can
  be attacked; a reviewer who finds a third caller has found a real defect here.

**ADDED IN THE AUTHOR'S OWN PRE-HANDOVER RUN — attack these too (see §10).**

- ~~**The isolation wait is now on the critical path of every mode and preset
  change.**~~ **MOOT IN REVISION 2 — the wait is gone (SP-1).** ⭐ The author's
  own attack on it went at the wrong target (`opacity: 0` making the wait
  unsatisfiable) and **refuted**; he stopped there. The reviewer then supplied
  the crueller case the commission had asked for — a _stable_ open foreign
  Select — which the author's framing could not reach. **An attack that failed is
  not a proof of safety, and the magnitude the author chose was the comfortable
  one.**

- ~~**Route (b)'s delivery mechanism is INFERRED on its load-bearing half.**~~
  **RETRACTED TWICE, AND NOTHING SURVIVES IT — corrected in revision 4 (SP-11).**
  Revision 2 retracted the first mechanism (the retry→force story) as false.
  ⚠⚠ **Revision 3 then left this bullet asserting that a Playwright
  time-of-check/time-of-use dispatch race "survives as a genuine weak claim" —
  which was itself the second false mechanism, already deleted from §2.3 in the
  same revision, and pointing at a §2.3 that no longer contained it.** A live
  sentence contradicting the section it cites is not a weak claim; it is a false
  one, and calling it INFERRED made it read as current rather than retracted.
  **DELETED. Playwright 1.57.0 installs a hit-target interceptor for non-force
  clicks and RETRIES a displaced click rather than delivering it
  (`node_modules/playwright-core/lib/server/dom.js:360-401`, retried at `:441`),
  so there is no race to survive.** ⭐ **Route (b)'s mechanism is UNEXPLAINED, on
  purpose, and this plan does not need it** — §2.3 says why. **A third guess is
  forbidden.**

- **Legs 2 and 3 measure a STATE, not a ROUTE, and §6 now says so.** The
  residual risk is that the real CI failure arrives by a route that produces a
  state these legs do not reproduce — for example both popups open _and_ the
  owned one mid-leave, where the requested Select's `aria-expanded` may already
  read `"false"` while its popup is still `:visible`. ⓘ **Leg 8 now covers the
  mid-leave case with one oracle**; what stays open is whether its construction
  can reliably enter the state. That specific interleaving is **not** covered by any leg
  as written. Is it reachable, and should there be a leg for it?
- ~~**The `stopPropagation` construction in legs 2/3 could be the wrong
  instrument.**~~ **CONFIRMED WRONG AND REPAIRED (SP-3).** It was not merely a
  risk: rc-select toggles on `mousedown`, so a `click` listener fires after the
  popup has already opened and the leg would have measured the opposite of its
  claim. ⚠⚠ **The author had read the very line that binds `onMouseDown`
  (`SelectInput/index.js:185`) earlier in the same session, while establishing
  where `data-testid` lands, and did not connect it.** Revision 2 specifies
  `mousedown` in the capture phase, one-shot and self-removing, with three
  post-gesture assertions.

**~~NEW IN REVISION 3~~ — SUPERSEDED. Three of these five were about option D or
M3 and are now MOOT because both were falsified; they are kept only so the trail
reads.** ⓘ **P2's inference** was correctly named here as "the plan's softest
joint" and asked to be attacked by finding a state with two visible popups —
**that is exactly what happened**, and §4.2 M5/M6 record it. ⓘ **M3 resting on one
observed sequence** was named here too, and it was the right worry: M3 was false.
⚠⚠ **BOTH WERE PUBLISHED AS WEAK CLAIMS AND BOTH TURNED OUT TO BE THE DEFECT.
That is not a vindication of the practice of publishing them; it is a warning
about what publishing them does NOT buy** — the disclosures were accurate,
prominent, and did not stop revision 3 from being built on top of them. ⓘ
**`isOpen` cannot fail loudly** is answered in revision 4 by demotion: it no longer
decides which popup is searched (§4.4). ⓘ **The 1500/5000 ms split is still a
JUDGEMENT from no measurement** — that one is UNCHANGED and still live; legs 4 and
9 characterise before freezing.

**NEW IN REVISION 4 — attack these first.**

- ⚠⚠⚠ **§4.4 IS UNREVIEWED, AND THIS IS THE THIRD MECHANISM.** Options A and D
  were each cleared by review and killed by execution. **A fourth clearance is
  worth little unless it exercises option B directly** — and the honest question to
  put to it is not "is this sound?" (both predecessors were sound-looking) but
  **"what would falsify it, and has anyone run that?"**
- ⚠⚠ **M7 WAS MEASURED IN jsdom, NOT IN THE ELECTRON RENDERER.** It decides that
  `classNames.popup.root` lands on the `.ant-select-dropdown` root and that the two
  classes do not collide — render-time facts. **It does NOT decide anything about
  layout, visibility or timing in the real app**, and the plan does not claim it
  does. ⚠ **The specific untested step is the one that killed the last two
  mechanisms: nobody has yet watched this class on a popup in the running Electron
  app.** Leg 1 is where it would show up first.
- ⚠ **The popup class is a PRODUCT-CODE HOOK with no product purpose.** Nothing in
  the app reads it, so nothing in the app protects it: a future refactor of
  `SpacingControls.tsx` can delete it without any test failing at the moment of
  deletion — the tests would simply start failing later, in the helper, for a
  reason that looks like a timing flake. ⚠ **Attack whether this plan should
  therefore pin it with something.** It currently does not, and that is a JUDGEMENT.
- ⚠ **The `<data-testid>-popup` naming rule is a CONVENTION enforced by nothing.**
  It is mechanical and it is stated, but no check fails if `src/` and the DSL drift
  apart — the DSL would look for a class nobody renders. ⓘ The §5.1a grep finds
  collisions, not omissions.
- **Leg 1's own state entry is not yet proven from inside the harness.** §4.2's run
  2 entered the two-popup window with a bare Playwright click and no settling wait,
  three times out of three — but that was a probe that only measured. **Whether a
  leg that also RUNS the helper still lands inside the window is not established**,
  which is why leg 1 must record the maximum popup count and treat `max < 2` as a
  no-result rather than a pass.
- **Legs 2/3's suppression may collide with Playwright's own interceptor.**
  UNCHANGED from revisions 3 and 4 and still an OPEN QUESTION in §6, deliberately
  not guessed. ⚠ If it collides, legs 2, 3 and 9 all need a different construction.

**NEW IN REVISION 5 — attack these, and note that three of revision 4's five
weak claims survived the round unchanged.**

- ⚠⚠⚠ **THE STRONGEST ATTACK ON THIS REVISION IS THAT ITS PREDECESSOR NEEDED
  SP-15 AT ALL.** Revision 4 rewrote §4.4 wholesale and silently carried away the
  caller block and the removal record. **The same rewrite technique produced this
  revision's repairs.** ⚠ **Ask what ELSE the revision-4 replacement deleted that
  nobody has missed yet.** ⭐ **The author ran the check rather than only writing
  it down:** revision 4 replaced two blocks wholesale — §4.4 and §6's leg section —
  and both were diffed against revision 3 (`git show a39aad3`). **§4.4: all
  eighteen identifiers and all four structural items present. §6: all
  twenty-three content probes present, nothing missing.** ⚠ **That is still a
  keyed check, and the key is the author's** — it enumerates identifiers and named
  items, so it would not see a deleted sentence that introduced no identifier and
  no heading. **A reviewer keying differently is the remaining defence.**
- ⚠ **P4 is now wired, and that makes it load-bearing in a way it has never been
  tested as.** It is the ONLY thing standing between option B and a
  correctly-formed-but-misattached class. **Leg 5 must run against the WIRED path**
  (§4.4), and until it does, "P4 catches the drift case" is INFERRED.
- ⚠ **The three callers are proposed but their public signatures are unchanged**,
  and `setCardMargin` / `setCardPadding` reach `setPreset` by a string branch. **No
  leg exercises the public entry points** — leg 10 runs the existing specs, which
  do, but only on the happy path. Is that enough?
- **`budgetFor` throws where revision 4 returned a floor, and what that costs
  DEPENDS ON A BRANCH — corrected in revision 6 (SP-23), because revision 5 stated
  it unconditionally.** A throw inside `resolveOwnedDropdown` is caught by
  `openSelectDropdown`'s retry on the first attempt. **But the retry clicks only
  when `isOpen` is false.** So: if the first click never opened the Select, attempt
  1 clicks again and the expiry costs **a second gesture**; if the click DID open
  it and only the popup count/visibility exhausted the budget, attempt 1 sees
  `isOpen === true`, does **not** click, and simply re-resolves on the longer
  budget. ⚠ **Leg 9 characterises the first branch. The second is UNMEASURED**, and
  is named here rather than assumed benign.
- **SP-18's correction relies on the author having read the RIGHT consumers.**
  `src/index.css:26-40` and the DSL fallback were found; **no claim is made that
  they are the only consumers of those five classes.**
- **Route (b) now has NO mechanism at all, deliberately.** The plan asserts a state
  and declines to explain how CI reaches it. ⚠ Attack whether the repair is still
  justified with the "how" absent — the argument is that routes (b) and (c) present
  the helper with the **same measured state**, so the state is what needs
  repairing.
- **Legs 2/3's suppression may collide with Playwright's own interceptor.** Named
  as an OPEN QUESTION in §6 rather than answered. ⚠ If it collides, legs 2, 3 and 9
  all need a different construction.
- **Leg 8's construction has never been run.** Widening the CSS leave test-side is
  specified but unproven, and a leg that cannot reliably enter its own state
  reports whatever it happened to catch.

---

## 9. Review history — MOVED

⭐ The per-round disposition tables (SP-1…SP-24) and the author's own self-check
records now live in
[`SPACING_HELPER_PRESET_PLAN_HISTORY.md`](SPACING_HELPER_PRESET_PLAN_HISTORY.md).

⚠ **They were moved, not summarised, and nothing was rewritten in the move.**
The reviewer needs them to check a disposition claim; the specification does not,
and keeping them here is what let an edit to the record contradict the
specification (SP-22 is the measured instance).

**§8 above stays in this file** — the weakest claims are live attack surface, not
history.
