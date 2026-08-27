# Plan — repair the spacing DSL's Select targeting so a preset click cannot land on the wrong control

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY, REVISION 4. No code has been written.** ⚠⚠⚠ **REVISION 4
REPLACES THE OWNERSHIP MECHANISM FOR THE SECOND TIME, AND FOR THE SECOND TIME
EXECUTION — NOT ARGUMENT — IS WHAT KILLED THE OLD ONE.** A probe run under the
owner's narrow tripwire exception measured that **option D's central inference is
false for ~50 ms on every Select-to-Select transition, with BOTH of its checks
satisfied**, so the break it promised would be loud is not a break at all (§4.2,
M5–M7). The owner re-ruled on 2026-08-27, selecting **option B — a per-Select
popup class, which identifies the popup by CONSTRUCTION instead of inferring it**.
Revision 4 also answers the third review
(`docs/reviews/spacing-helper-preset-plan-codex-followup2-review.md`, verdict
**SEV-1-BLOCKED**, commit `2819810`), whose **four findings the author re-verified
at source and accepted in full — fourteen for fourteen across three rounds**:
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
control the caller did not ask for, **and a wrong target becomes a loud, named
failure instead of a silent wrong answer**. Nothing is added to
`tests/baseline/expected-failures.json`.
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
control's.** The pattern is not new here either; `BackgroundCustomizer.tsx`
already does exactly this for five of its own drop-downs.

**What it costs.** One test-only change, a two-line product change, one harness
run before any CI cycle is spent, and one more independent review round. ⚠ Stated
plainly: this is the **fourth** review round on a test-only defect, and two
approved designs have already been thrown away. §7.5 records that cost honestly
rather than burying it.

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

⭐⭐⭐ **SO ROUTE (a) IS NOT AN EXOTIC STATE — IT IS WHAT THE ORDINARY PATH DOES
EVERY TIME ONE SELECT IS OPENED WHILE ANOTHER IS OPEN**, which is precisely what
`applies spacing presets` does. **Route (a) is restored to the table, and harness
leg 1 is restored with it.**

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
2. **A wrong target becomes a loud, named failure at the DSL**, not a silent
   wrong answer discovered five seconds later as `Expected "8px" / Received
"0px"` on an unrelated assertion.
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
6. ⭐ **Item 1's wording is load-bearing and revision 4 is the first version that
   earns it.** "Can no longer operate a control the caller did not name" is a
   **prevention** claim. Under options A and D it rested on an inference, and when
   each inference fell the plan's remaining defence was P4 — which is
   **detection**. Option B makes item 1 true by construction (§4.1, §4.2 M7).

---

## 4. The proposed change, in detail

### 4.1 The four properties the repaired helper must have

| #      | Property                                                                                                                                                                                                                                                                                                                                                                                               | Kills                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **P1** | **IDENTITY, BY CONSTRUCTION.** Resolve the popup that belongs to the requested Select **by the class that popup renders** (`<data-testid>-popup`), and fail with its own message if that popup is not visible. ⚠ **Revision 4 changed this property's KIND, not just its mechanism:** it was "prove ownership from something the app reports", and is now "ask for our own label". Nothing is derived. | D1, and routes (a), (b) and (c)                                         |
| **P2** | **SCOPE.** Search options only within that popup's subtree, and require exactly one match.                                                                                                                                                                                                                                                                                                             | D2, and any residual multi-popup state                                  |
| **P3** | **ACTIONABILITY.** Click the option the way a user does — Playwright's own `click()`, hit-target check on. No `evaluate` click, no `force: true`.                                                                                                                                                                                                                                                      | D3                                                                      |
| **P4** | **OUTCOME.** After selecting, read back the control's **own** rendered value and assert it.                                                                                                                                                                                                                                                                                                            | Everything that survives P1–P3, and it names the control in the failure |

⭐ **P4 is the cheapest property and the strongest.** P1–P3 are preventive and
each rests on a claim about the DOM. P4 is a _detector_: it asks the control
itself what it now says. If any residual route lets a wrong click through, P4
fails immediately, at the helper, naming the control — instead of the caller's
next assertion failing five seconds later about a computed style. This is the
project's own craft rule — _make the red leg NAME the bug_ — and it is what
makes P1's version-pinned mechanism (§8) an acceptable risk rather than a
single point of failure.

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
repository already ships the same pattern in `BackgroundCustomizer.tsx`.

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

**Revision 4 — rewritten for option B.** The helper now locates a popup **by the
class that popup renders**, so nothing has to be inferred. Three private helpers
are rewritten, one is added, and the private entry points take the Select's
**test id** rather than a bare `Locator`, because the test id is what both the
control and its popup class are derived from.

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
  const left = () => deadline - Date.now();
  const expired = (stage: string) => {
    throw new Error(
      `${testId}: the ${budgetMs} ms budget expired before ${stage}; ` +
        'this Select never presented its own popup',
    );
  };

  const popup = this.popupFor(testId);

  // ⚠ NOT an ownership inference — a CONSTRUCTION check. Exactly one node may
  // carry this class. Two would mean the class was rendered more than once
  // (e.g. a third `renderSection` call), which is a product-side mistake and
  // must be loud rather than silently resolved by `.first()`.
  if (left() <= 0) expired('the popup class could be counted');
  await expect(
    popup,
    `expected exactly one popup carrying .${testId}-popup — more than one means ` +
      'the class is rendered by more than one Select and is no longer an identity',
  ).toHaveCount(1, { timeout: left() });

  // ⚠ The class alone is not enough: rc-trigger KEEPS closed popups in the DOM
  // (`removeOnLeave: false`), so this node exists while the Select is shut.
  // Visibility is what distinguishes "its popup is open" from "its popup exists".
  if (left() <= 0) expired('the popup became visible');
  await expect(
    popup,
    `${testId}'s own popup never became visible within ${budgetMs} ms`,
  ).toBeVisible({ timeout: left() });

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

private async selectOptionByText(testId: string, pattern: RegExp): Promise<void> {
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
}

/** P4 — the outcome detector. Reads the control's OWN rendered value.
 *  `.ant-select-content-value` is the single-select value node
 *  (SingleContent.js:53); the parent `.ant-select-content` (:89) also holds the
 *  placeholder and the input, so it is the WRONG node to assert on. */
private async expectSelectShows(testId: string, expected: RegExp): Promise<void> {
  await expect(
    this.window.getByTestId(testId).locator('.ant-select-content-value'),
    `${testId} did not end up showing the value that was selected — the click may ` +
      'have landed on another control',
  ).toHaveText(expected, { timeout: 5000 });
}
```

⭐⭐ **WHAT REVISION 4 DELETED, AND WHY THAT MATTERS MORE THAN WHAT IT ADDED.**
Gone: the `aria-controls` filter, the `:visible` document-global locator, the
asserted singleton, and the `Math.max(50, …)` floor. **Every one of them existed
to answer "which popup is mine?" — a question option B does not ask.** The helper
is shorter than revision 3's and has one fewer moving part than revision 1's.

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
prop on each of the two `Select`s inside `renderSection`. **No behaviour, no
markup, no styling, no state, no prop the app reads.** A CSS class is added to a
portal element; nothing in the app selects on it.

**Who else renders these controls:** `renderSection` is called exactly twice
(`src/components/SpacingControls.tsx:228-229`), which is what produces the four
identically-labelled Selects this whole plan is about. Regenerate:

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
  `resolveOwnedDropdown`, `popupFor` and `expectSelectShows` are all private to
  `SpacingDSL` and nothing outside the class can reach them.
- ⚠⚠ **NEW IN REVISION 4 — `BackgroundCustomizer.tsx`'s five existing
  `popupClassName` uses and `tests/support/dsl/backgroundCustomizer.ts`.** They
  are the precedent this change follows and they are **deliberately NOT touched**.
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

| Kind                            | What it proves                                                                                                         | Legs       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| **FAIL-OLD / PASS-NEW**         | The defect is real AND the repair removes it. Runs on both variants.                                                   | 1, 2, 4, 7 |
| **GUARD-REMOVAL DISCRIMINATOR** | A NARROWER repair still fails, so the chosen guard is the one doing the work. Runs on a deliberately weakened variant. | 3, 5       |
| **KNOWN-BAD CONTROL**           | The probe can still fail — proof it is not reporting green blindly.                                                    | 6          |
| **ONE-SIDED CHARACTERISATION**  | Records behaviour of the repaired helper only; proves nothing about the old one and is NOT acceptance evidence.        | 8, 9       |

⭐ **The harness is bidirectional because rows 1, 2, 4 and 7 run both ways and row
6 must fail — not because every row does.** Any row promoted to acceptance
evidence must come from the first two kinds, and §6's record states the kind
beside every result.

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

| #     | Case                                                                                                                                                                            | Kind                | Variant(s) and expected result                                                                                                                                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | ⭐⭐⭐ **THE M6 STATE — route (a).** Open the margin preset Select, then drive the padding preset path immediately, so the call lands inside the ~350 ms two-popup window (M5). | FAIL-OLD / PASS-NEW | **CURRENT: sets the MARGIN** (or flakes between the two — record which, per attempt). **REPAIRED: passes**, and P4 confirms the padding control. ⚠ Record the popup count observed during the call — if it is never 2, the leg did not enter its own state and its green means nothing.                                   |
| **2** | **⭐ THE FOREIGN-ONLY FAILURE STATE.** The margin popup is open; the padding Select's own opening is suppressed page-side; then the padding path runs.                          | FAIL-OLD / PASS-NEW | **CURRENT: silently succeeds**, setting the MARGIN — no error at all. **REPAIRED: fails inside `resolveOwnedDropdown`**, naming the control: `.spacing-padding-preset-popup` never became visible.                                                                                                                        |
| **3** | **⭐ The scope-only straw man**, run against leg 2's state — the repair the diagnosis drawer recommended.                                                                       | GUARD-REMOVAL       | **SCOPE-ONLY: must ALSO silently succeed.** This is what proves identity-beats-scope rather than asserting it. ⓘ §4.2 M4 already measured the same thing statically; this leg proves it through the helper.                                                                                                               |
| **4** | **The happy path.** Clean panel, nothing else open.                                                                                                                             | FAIL-OLD / PASS-NEW | **CURRENT: passes. REPAIRED: passes, and adds no measurable stall** — record the wall time of `openSelectDropdown` end-to-end, as **characterisation input for the 1500 ms budget** (SP-10).                                                                                                                              |
| **5** | **The P4 detector alone**, run against **leg 2's state**.                                                                                                                       | GUARD-REMOVAL       | **P4-ONLY: fails at `expectSelectShows`, naming the control** — proving P4 detects independently of P1 and P2. ⓘ The opener is SCOPE-ONLY's document-global one; see the variant list.                                                                                                                                    |
| **6** | **The negative control — known-bad input the probe must still fail on.** Point the helper at a preset label that does not exist (`/^Nonexistent/`).                             | KNOWN-BAD           | **REPAIRED: fails on the option `toHaveCount(1)`**, naming the pattern. ⚠ Record the **exact failure message AND the runner's exit code** — a failure caught inside a passing wrapper is indistinguishable from a pass.                                                                                                   |
| **7** | **A STABLE, legitimately-open UNRELATED Select popup**, then run the padding path against a clean padding control.                                                              | FAIL-OLD / PASS-NEW | **CURRENT: the document-global pre-wait burns its full budget and fails without touching the padding Select** — the defect SP-1 named. **REPAIRED: passes promptly**, because it asks for its own popup by class. ⓘ Revision 3 expected a two-popup state here to "break loudly"; under option B it is simply irrelevant. |
| **8** | **The OWNED popup mid-leave.** Enter the padding path while the padding Select's own popup is animating shut.                                                                   | CHARACTERISATION    | **REPAIRED, one oracle: the helper RE-OPENS and selects successfully.** ⚠ Not acceptance evidence — it says nothing about the current helper. See the construction below.                                                                                                                                                 |
| **9** | **The retry path.** First gesture suppressed, second succeeds.                                                                                                                  | CHARACTERISATION    | **REPAIRED: passes on the second attempt**; record the wall time as characterisation of the budget and **not** as proof the number is right.                                                                                                                                                                              |

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
4. **Then implementation**, in this order: leg 0 first (it can falsify option A),
   then the helper, then legs 1–8, then the gate
   (`./tools/checks`, with the 4/4-steps check), then push and CI.
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
in `BackgroundCustomizer.tsx`. **The subject of the work is unchanged — it is
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

- **four independent review rounds** (three complete, one owed), on a defect in
  **one flaky test**;
- **fourteen findings, none false**;
- **three ownership mechanisms**, of which **two were approved and then thrown
  away** — option A after the first harness run, option D after the second;
- **still zero lines of shipped code**, because the spec-before-code tripwire has
  held throughout.

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
  UNCHANGED from revision 3 and still an OPEN QUESTION in §6, deliberately not
  guessed. ⚠ If it collides, legs 2, 3 and 9 all need a different construction.
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
by the author before acceptance — fourteen for fourteen across three rounds. This
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

⚠⚠ **UNDER STRAT-D7 THIS REPAIR ROUND OWES A SAME-REVIEWER SCOPED FOLLOW-UP — no
exemption for a small diff, and this diff is not small.** The fix round is
unreviewed new work; §8's final block lists what it added.

---

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
