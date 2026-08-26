# Plan — repair the spacing DSL's Select targeting so a preset click cannot land on the wrong control

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY, REVISION 2. No code has been written.** Revision 2 answers
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

**What changes.** Only test code, in one file, unless you pick option B below.
The helper gains four properties: it proves the drop-down belongs to the control
it asked for; it searches only inside that drop-down; it clicks the way a user
would, with the safety check on; and afterwards it reads back the control's own
displayed value and fails by name if it is wrong.

**What could go wrong.** The mechanism that proves ownership reads an attribute
that the drop-down library renders. That attribute is real and I have read it in
the installed library's source, but it is a rendered detail rather than a
promised API, so a future library upgrade could move it. It would fail loudly if
it did, which is the cheap kind of failure. The alternative (option B) is
sturdier but puts a small test hook into product code.

**What it costs.** One test-only change, one harness run before any CI cycle is
spent, and one independent review round — the same shape as PR #153, which took
four rounds. If you pick option B it is additionally a one-line change to
`src/components/SpacingControls.tsx` per drop-down.

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
auditable.

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

### 2.3 ⚠⚠ A CORRECTION TO THE RECORDED DIAGNOSIS

`drawer_havdm_investigations_93a44232f7b76ea15a1b4f2c` names two candidate
routes and states: _"BOTH ROUTES PRODUCE EXACTLY THE OBSERVED END STATE, AND
BOTH ARE REPAIRED BY THE SAME CHANGE."_ **The second half of that sentence is
false for the narrower change the same drawer recommends** ("scope the option
search to `getVisibleSelectDropdown()`'s own subtree"), and this plan is
different because of it.

There are **three** routes, not two, and scoping alone repairs only the first.

| Route                                                                                                                                                                                                                                     | What happens                                    | Repaired by scoping the option search alone?                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **(a)** The margin popup is still `:visible` when the padding option search runs; both popups are open.                                                                                                                                   | Two popups; `.first()` picks the margin option. | **Yes** — if `.last()` happens to be the padding popup. That is a DOM-order coincidence, not a proof (see below).            |
| **(b)** `openSelectDropdown` clicked the **margin** select rather than the padding one (auto-scroll moved the scrollable panel between locate and click).                                                                                 | **Only the margin popup is open.**              | **NO.** `.last()` _is_ the margin popup, so scoping the search to it clicks the margin option — the identical wrong outcome. |
| **(c)** The click on the padding select did not leave _its_ popup open — swallowed, **or it toggled an already-open popup shut** (a Select toggles on a click of its root) — and a leftover margin popup satisfied D1's visibility check. | **Only the margin popup is open.**              | **NO** — same as (b).                                                                                                        |

⚠⚠⚠ **REVISION 2 — THIS PARAGRAPH PREVIOUSLY CARRIED A FALSE CONTROL-FLOW
CLAIM, AND IT WAS THE PLAN'S REASON FOR TREATING RETRY REMOVAL AS IN-SCOPE.
FINDING SP-2. IT IS RETRACTED AND CORRECTED HERE.**

**WHAT REVISION 1 CLAIMED (WITHDRAWN):** that the retry loop's `catch` at
`:43-45` swallows a displaced click's hit-target error and _delivers control to_
the `force: true` fallback at `:49`, making the loop and the fallback "one
thing".

**WHAT THE SOURCE ACTUALLY DOES (MEASURED, `tests/support/dsl/spacing.ts:37-49`):**
attempt 0's throw is swallowed; attempt 1 performs **another ordinary,
actionability-checked `select.click()`**; and if that throws, `if (attempt === 1)
throw error` **exits the function**. **Line 49 is UNREACHABLE via a throwing
click.** The `force: true` fallback is reached only when both normal clicks
_resolve_ and the loop still sees no visible popup.

⭐⭐ **AND THE CORRECTION STRENGTHENS THE CASE FOR OWNERSHIP RATHER THAN
WEAKENING IT.** Route (b) does not need `force: true` at all. Playwright's
hit-target check is evaluated **before** the event is dispatched, so it is
inherently a time-of-check/time-of-use race: on a scrollable panel a click that
_resolves without error_ can still be delivered to whatever occupies those
coordinates by the time the browser dispatches it. **Route (b) is therefore MORE
reachable than revision 1 argued, through the ordinary click path.** (MEASURED
for the helper's control flow; **INFERRED** for the Playwright dispatch race,
which is documented behaviour and is **not** measured here — and §6 leg 0 does
**not** decide it either, correcting a second revision-1 overstatement.)

⚠ **What this costs the plan:** removing the retry is **no longer justified by
the mechanism** and became an owner choice. The owner ruled on 2026-08-27 to
**retain a bounded retry, re-gated on ownership**, with `force: true` and the
`evaluate` click still removed — see §4.4 and disposition SP-2 in §9.

⚠ **And `.last()` is not "the popup I just opened".** rc-trigger renders each
popup into its own portal and does **not** remove it on close — the motion
config at `@rc-component/trigger@3.8.1 lib/Popup/index.js:150` passes
`removeOnLeave: false`, with `leavedClassName` set to the popup's `-hidden`
class at `:152` — i.e. a closed popup is _hidden_, not deleted. So DOM order among popups is the order in
which each Select was **first** opened, not the order of most recent opening.
`.last()` therefore coincides with "the one I just opened" only when the popups
happen to have been first opened in that order. In `applies spacing presets` they
were — margin before padding — which is exactly why route (a) has been survivable
and why the identity has always passed on retry. **A coincidence that holds today
is not a mechanism.** (MEASURED for `removeOnLeave`/`leavedClassName`; the
consequence for DOM ordering is INFERRED from it.)

**The conclusion that follows: the repair must establish OWNERSHIP, not merely
SCOPE.** A helper that proves the popup it is about to search belongs to the
select the caller named fails loudly on routes (b) and (c) instead of quietly
doing the wrong thing. That is the same shape as PR #153's repair, which replaced
a projection of `document.activeElement` with `toBeFocused()` on the caller's own
already-scoped locator: **exact identity, not a resemblance test**
(`drawer_havdm_investigations_e782dca064b2b8c5e7c22549`).

⚠ Discriminating _which_ of (a)/(b)/(c) actually fires on the runner is **not**
required for the repair, and this plan does not claim to have done it. It is
recorded as UNRESOLVED. §6 leg 5 offers a cheap opportunistic discriminator, but
the repair is justified by covering all three, not by identifying one.

---

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
5. No `src/` change — **unless** the owner selects option B at §4.3.

---

## 4. The proposed change, in detail

### 4.1 The four properties the repaired helper must have

| #      | Property                                                                                                                                          | Kills                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **P1** | **OWNERSHIP.** Resolve the popup that belongs to the requested `select`, and fail with its own message if no such popup is open.                  | D1, and routes (b) and (c)                                              |
| **P2** | **SCOPE.** Search options only within that popup's subtree, and require exactly one match.                                                        | D2, and route (a)                                                       |
| **P3** | **ACTIONABILITY.** Click the option the way a user does — Playwright's own `click()`, hit-target check on. No `evaluate` click, no `force: true`. | D3                                                                      |
| **P4** | **OUTCOME.** After selecting, read back the control's **own** rendered value and assert it.                                                       | Everything that survives P1–P3, and it names the control in the failure |

⭐ **P4 is the cheapest property and the strongest.** P1–P3 are preventive and
each rests on a claim about the DOM. P4 is a _detector_: it asks the control
itself what it now says. If any residual route lets a wrong click through, P4
fails immediately, at the helper, naming the control — instead of the caller's
next assertion failing five seconds later about a computed style. This is the
project's own craft rule — _make the red leg NAME the bug_ — and it is what
makes P1's version-pinned mechanism (§8) an acceptable risk rather than a
single point of failure.

### 4.2 The ownership authority — what it is, and what it is not

**REJECTED as the authority: `:visible` / `:not(.ant-select-dropdown-hidden)`
counts, in any `.first()` / `.last()` form.** They answer "is a popup open",
never "is _this select's_ popup open". `.ant-select-dropdown-hidden` is
CSSMotion's `leavedClassName` (`@rc-component/trigger@3.8.1
lib/Popup/index.js:152`), so it also lands only after the visual leave,
coupling any wait to animation duration — the same reason PR #153 rejected it.
This is the _identical_ rejection PR #153 made for the same reason, and it is
recorded there as measured, not argued.

**PROPOSED as the authority: the select's own `aria-controls` link.** Read from
the installed dependency's source, all MEASURED:

| Fact                                                                                                                                                 | Source                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The combobox input carries `aria-controls="${id}_list"` **only while open** — `undefined` when closed.                                               | `@rc-component/select@1.5.0 lib/SelectInput/Input.js:188`. ⓘ `aria-owns` at `:186` carries the identical value under the identical condition, so it is an equivalent fallback if `aria-controls` ever moves.                                                                                                                                                                                    |
| Every Select has an `id`, auto-generated when not supplied.                                                                                          | `lib/Select.js:123` — `const mergedId = useId(id)`                                                                                                                                                                                                                                                                                                                                              |
| An element with `id="${id}_list"` is rendered **inside the popup**.                                                                                  | `lib/OptionList.js:288-296`                                                                                                                                                                                                                                                                                                                                                                     |
| That element is a **hidden 0×0** `role="listbox"` when the list is virtual.                                                                          | `lib/OptionList.js:290-296` — `style: { height: 0, width: 0, overflow: 'hidden' }`                                                                                                                                                                                                                                                                                                              |
| The list **is** virtual for these Selects.                                                                                                           | `lib/Select.js:456` — `realVirtual = virtual !== false && popupMatchSelectWidth !== false`; `SpacingControls.tsx` sets neither prop, and `antd/lib/select/index.js:222` passes `virtual` straight through                                                                                                                                                                                       |
| `data-testid` lands on **exactly one** node — the `.ant-select` root, which contains both the combobox input and the value node.                     | `@rc-component/select@1.5.0 lib/BaseSelect/index.js:448` spreads `restProps` into `SelectInput`; `lib/SelectInput/index.js:154` keeps unknown props in `domProps`; `:178` renders the single root `<div>` with them. The `RootComponent` branch at `:165-175` is not taken — `grep -n components node_modules/antd/lib/select/index.js` returns nothing, so antd supplies no `components.root`. |
| The single-select value text lives at `.ant-select-content-value`, inside `.ant-select-content`, which **also** holds the placeholder and the input. | `lib/SelectInput/Content/SingleContent.js:53` and `:89`; `Content/Placeholder.js:31`                                                                                                                                                                                                                                                                                                            |

⚠⚠ **THE TRAP THIS CREATES, AND IT MUST NOT BE MISSED.** The id-bearing node is
**hidden**. Any locator that asserts _visibility_ on `#${id}_list` can never
pass, and any locator that searches for option rows _inside_ it finds the
three-row hidden accessibility tree rather than the real option list
(`lib/OptionList.js:296` renders only `activeIndex - 1`, `activeIndex`,
`activeIndex + 1` there; `:307` passes `innerProps: virtual ? null : a11yProps`,
so the visible list carries no id at all). It is usable **only** as a `:has()` /
`filter({ has })` predicate that identifies the owning `.ant-select-dropdown`,
never as a search root and never as a visibility target. This is the same hazard
the project already recorded for `getByRole('option')` matching antd's hidden
0×0 listbox, and the practice rule
`drawer_practice_verification_691f585b61f0be0870367722` is the general form.

⭐ **A bonus that collapses two checks into one.** Because `aria-controls` is
`undefined` when closed and set when open, reading it non-empty is
simultaneously the open-state proof **and** the ownership proof. There is no
second, separate "is it open yet" wait to get wrong — the same economy PR #153
found in `aria-expanded`.

### 4.3 ⚖ OWNER DECISION 1 — which ownership mechanism

**What this protects in product terms.** Nothing in the shipped app either way.
This decides how the test proves it is holding the right control, and therefore
how durable the fix is against future library upgrades.

**What is going wrong plainly.** The helper currently has no way at all to tell
one drop-down from another. Something must give it one.

**Is the product affected?** No, under every option. **Evidence status:** the
DOM facts in §4.2 are MEASURED from the installed library source; whether they
hold in the running Electron app is INFERRED and is §6's leg 0.

**The options.**

**Option A — read the select's `aria-controls` (test-only).** No `src/` change.
Uses §4.2's chain. _Cost:_ nothing beyond the test edit. _Risk:_ `aria-controls`
is a rendered accessibility attribute, not a promised API; an
`@rc-component/select` upgrade could move it. It would fail **loudly** if it did
— the helper would report "no popup owned by `spacing-padding-preset` is open" —
and P4 is a second, independent detector behind it.

**Option B — give each Select a popup class (`src/` change).** Add
`classNames={{ popup: { root: 'spacing-margin-preset-dropdown' } }}` (antd v6's
current form; `popupClassName` is the deprecated alias — `node_modules/antd/lib/select/index.d.ts:57-58`)
to each of the four Selects in `SpacingControls.tsx`, and locate
`.ant-select-dropdown.<class>`. _Precedent:_ the repo already does exactly this
— `tests/support/dsl/backgroundCustomizer.ts:44-60` maps testid → popup class and
resolves `.ant-select-dropdown.${popupClass}`. _Cost:_ a one-line `src/` change
per Select and a test hook living in product code. _Risk:_ lowest of the three;
the class is ours and cannot move under us. But it makes a test-only fix into a
`src/` change, and the four Selects are rendered from one shared function, so the
class must be derived from `testIdPrefix` rather than hand-written four times.

**Option C — serialise: never allow two popups open at once.** Before opening
any select, wait for the visible-dropdown count to reach zero, so `.last()` is
unambiguous. _Cost:_ smallest diff. _Risk:_ **it repairs route (a) only.** Routes
(b) and (c) survive untouched, and it re-installs a document-global authority of
exactly the kind PR #153 rejected as the deciding check. It is also the option
most likely to _look_ like it worked, because route (a) is the one the existing
evidence best fits.

**Recommendation: A, alone. ⭐ OWNER RULED A, 2026-08-27, and separately ruled
that option C's zero-count wait is REMOVED ENTIRELY (finding SP-1).** A is
test-only, it is the only option that proves ownership without putting a hook in
product code, and its failure mode is loud.

⚠⚠ **REVISION 1 RECOMMENDED KEEPING C's WAIT AS "SETUP ISOLATION". THAT WAS
WRONG, AND THE INDEPENDENT REVIEW MEASURED TWO SEPARATE DEFECTS IN IT.** (i) It
**consumed the harness's own hostile state**: `openSelectDropdown`'s first act
was to wait for zero popups, while §6's legs 1, 2 and 5 each require a foreign
popup to be OPEN — so the leg's state was erased, or the helper timed out before
the guard ran, and either way the leg measured nothing. (ii) Against a
**stable, legitimately-open unrelated Select** the count never reaches zero at
all, so every mode and preset call would burn the full five seconds and fail
without ever touching the requested Select — a worse case than the author's own
attack found, and the direct answer to the crueller-attack question the
revision-1 commission asked for. ⭐ **The setup-isolation-versus-authority
distinction is still valid in general; this particular implementation of it was
not.** A guard's authority must be exercised WITH foreign state present, not
after it has been tidied away.

**If you do nothing:** the identity keeps reddening about one run in four.

### 4.4 The proposed helper, in full

Three private helpers are added or rewritten; the four public entry points that
route through them (`setPreset`, `setMarginMode`, `setPaddingMode`, and through
`setPreset` the string branches of `setCardMargin`/`setCardPadding`) change only
in that they pass through an expected-label pattern for P4.

```ts
/**
 * Resolve the popup that BELONGS to `select`, proving ownership rather than
 * mere existence.
 *
 * AUTHORITY (read from @rc-component/select@1.5.0):
 *   - lib/SelectInput/Input.js:188 renders aria-controls="<id>_list" on the
 *     combobox input ONLY while the popup is open (undefined when closed), so a
 *     non-empty read is simultaneously the OPEN proof and the OWNERSHIP proof.
 *   - lib/Select.js:123 guarantees an id via useId(), so the link always exists.
 *   - lib/OptionList.js:288-296 renders an element with id="<id>_list" INSIDE
 *     the popup.
 *
 * ⚠ THAT ELEMENT IS A HIDDEN 0x0 role="listbox" (OptionList.js:290-296) and it
 * contains only the three rows around the active index. It is used here SOLELY
 * as a :has() predicate to identify the owning popup. NEVER search options
 * inside it and NEVER assert it visible.
 */
private async resolveOwnedDropdown(
  select: Locator,
  opts: { timeout?: number } = {},
): Promise<Locator> {
  const combobox = select.locator('input[role="combobox"]');
  await expect(combobox).toHaveCount(1);

  let listId = '';
  await expect
    .poll(async () => (listId = (await combobox.getAttribute('aria-controls')) ?? ''), {
      // ⚠ SP-2: the FIRST attempt gets a short budget so a genuinely missed
      // click is retried quickly; the SECOND gets the full budget so its
      // failure is a real, reportable failure and not a premature give-up.
      timeout: opts.timeout ?? 5000,
      message: 'the Select never reported an open popup it owns (aria-controls stayed unset)',
    })
    .not.toBe('');

  const owned = this.window
    .locator('.ant-select-dropdown')
    .filter({ has: this.window.locator(`[id="${listId}"]`) });

  await expect(owned, `expected exactly one popup owned by this Select (${listId})`)
    .toHaveCount(1);
  return owned;
}

/**
 * REVISION 2 — SP-1 and SP-2.
 *
 * ⚠⚠ NO document-global pre-wait. Revision 1 opened with
 * waitForAllSelectDropdownsToClose() as "setup isolation"; the owner removed it
 * on 2026-08-27 after SP-1 measured two defects in it: it CONSUMED the very
 * foreign-popup state §6's legs exist to create, and against a stable,
 * legitimately-open unrelated Select the count never reaches zero, so every
 * call burned the full 5000 ms and failed without touching the requested
 * Select. P1 IS the authority, and it must be exercised WITH foreign state
 * present — that is the whole point of it.
 *
 * ⚠⚠ The retry is RETAINED and re-gated (SP-2, owner's ruling). Revision 1
 * removed it on a false premise. Each attempt now succeeds only on OWNERSHIP,
 * never on "some popup is visible", and `force: true` is gone.
 */
private async openSelectDropdown(select: Locator): Promise<Locator> {
  await expect(select).toBeVisible({ timeout: 5000 });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const last = attempt === 1;
    try {
      // ⚠⚠ CLICK ONLY IF THIS SELECT DOES NOT ALREADY OWN AN OPEN POPUP.
      // A Select TOGGLES on mousedown (SelectInput/index.js:117 ->
      // toggleOpen() at :138, bound at :185), so an unconditional second
      // click on an already-open Select would CLOSE it — turning a
      // slow-but-correct first open into a hard failure, and making the
      // retry actively worse than no retry. Found by re-tracing this loop
      // (see the round-2 note in the plan's §10).
      if (!(await this.ownsOpenPopup(select))) {
        await select.click();                 // no force, ever: hit-target check stays ON
      }
      return await this.resolveOwnedDropdown(select, { timeout: last ? 5000 : 1500 });
    } catch (error) {
      if (last) throw error;                  // second failure is REAL — report it
    }
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}

/** True when this Select currently owns an open popup. Cheap, one attribute read. */
private async ownsOpenPopup(select: Locator): Promise<boolean> {
  const v = await select
    .locator('input[role="combobox"]')
    .getAttribute('aria-controls')
    .catch(() => null);
  return v !== null && v !== '';
}

private async selectOptionByText(select: Locator, pattern: RegExp): Promise<void> {
  const dropdown = await this.openSelectDropdown(select);

  const option = dropdown.locator('.ant-select-item-option').filter({ hasText: pattern });
  // ⚠ rc-select VIRTUALISES the option list, so a row scrolled out of the
  // rendered window is absent from the DOM. Requiring exactly one match turns
  // both ambiguity AND absence into a loud failure naming the pattern, instead
  // of a silent .first().
  await expect(option, `expected exactly one option matching ${pattern} in this Select's popup`)
    .toHaveCount(1);
  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click();                       // real click; actionability enforced

  // ⚠ SP-1: scoped to the OWNED popup, not a document-global count. Waiting for
  // "no popup anywhere" would fail against a legitimately-open unrelated Select
  // for exactly the reason the pre-wait was removed.
  //
  // ⭐ And it settles FASTER than the wait it replaces: aria-controls is
  // rendered straight from `open` (Input.js:188), so it clears at the React
  // commit, NOT at the end of CSSMotion's leave. Same authority PR #153 used
  // for aria-expanded, and the same reason it beat the popup's -hidden class.
  await expect(select.locator('input[role="combobox"]'))
    .not.toHaveAttribute('aria-controls', /./, { timeout: 5000 });
}

/**
 * P4 — the outcome detector. Reads the control's OWN rendered value.
 * `.ant-select-content-value` is the single-select value node
 * (SingleContent.js:53); the parent `.ant-select-content` (:89) also holds the
 * placeholder and the input, so it is the WRONG node to assert on.
 */
private async expectSelectShows(select: Locator, expected: RegExp): Promise<void> {
  await expect(
    select.locator('.ant-select-content-value'),
    'the Select did not end up showing the value that was selected — the click may have landed on another control',
  ).toHaveText(expected, { timeout: 5000 });
}
```

and the callers, e.g.:

```ts
private async setPreset(
  testIdPrefix: 'spacing-margin' | 'spacing-padding',
  preset: SpacingPreset,
): Promise<void> {
  const select = this.window.getByTestId(`${testIdPrefix}-preset`);
  const label = preset.charAt(0).toUpperCase() + preset.slice(1);
  const pattern = new RegExp(`^${label}`, 'i');
  await this.selectOptionByText(select, pattern);
  await this.expectSelectShows(select, pattern);          // P4
}
```

**What is removed — REVISION 2, and it is a shorter list than revision 1's:**

1. **The `force: true` fallback at `:49`.** It disables the hit-target check
   outright. Never restored.
2. **The `evaluate((el) => el.click())` at `:59-61`.** A direct DOM click that
   cannot complain about an obscured, detached or unstable target. Never
   restored.
3. **The `Escape` presses at `:46` and `:62`**, which existed to paper over an
   unconfirmable open/close state that P1 now confirms directly.
4. **`waitForAllSelectDropdownsToClose()` as a document-global authority**, in
   either position — as the pre-wait revision 1 proposed, or as the trailing
   wait the current helper has at `:63`. Both are replaced by the **scoped**
   post-condition in `selectOptionByText`: the owning combobox's `aria-controls`
   goes unset. ⓘ The method may remain in the class for a caller that genuinely
   wants a page-wide quiesce; nothing in the repaired path calls it.

**What is RETAINED, against revision 1 — the bounded retry (SP-2, owner's ruling
2026-08-27).** Revision 1 removed it, justified by a control-flow claim that
§2.3 now retracts as false. The loop is **not** the delivery path for
`force: true`. So its removal was never a mechanism repair, only a tolerance
reduction, and the owner chose to keep the tolerance. ⭐ **What changes is what
an attempt is allowed to count as success: no longer "some popup is visible",
but OWNERSHIP.** A first click that is genuinely missed is retried once, cheaply;
a second failure is a real failure and is reported with the helper's own message.
**That is strictly better than revision 1 in both directions** — it keeps the
existing tolerance and it removes both silencers.

⚠ The asymmetric budget (1500 ms then 5000 ms) is a **JUDGEMENT** and §8 lists
it for attack: too short a first budget turns a slow-but-correct open into a
needless second click, and the second click is the one whose failure is
reported.

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
  `resolveOwnedDropdown` and `expectSelectShows` are all private to `SpacingDSL`
  and nothing outside the class can reach them.

---

## 6. How it will be verified, before a CI cycle is spent

Per the MANDATORY COMPANION clause in `CLAUDE.md`: a plan review catches wrong
_thinking_ but not wrong _doing_, so a runnable harness attacks the real code
first — and **every leg is bidirectional**. A probe that only asks "does it click
the right control now" cannot see "would it still fail if it clicked the wrong
one". PR #153's harness caught a trap in _itself_ precisely because its legs were
bidirectional (`drawer_havdm_investigations_e782dca064b2b8c5e7c22549`), and that
is the model here.

The harness is a temporary probe under `tests/`, run headless
(`bash tools/test-headless.sh <spec> --project=electron-e2e --workers=1`), deleted
afterwards, with `git status --porcelain` verified empty and `src/` verified
byte-identical to `HEAD`.

### Leg 0 — the DOM census (must run first; it can falsify §4.2)

Not a pass/fail leg — a **measurement**, and the rest of the harness is
conditional on it. Open the Properties panel with a button card selected, open
the padding preset Select, and print:

1. `outerHTML` of `getByTestId('spacing-padding-preset')` (truncated), and its
   `count()` — **P1 requires this to be 1**;
2. the `count()` of `select.locator('input[role="combobox"]')` and its
   `aria-controls` value **while open** and **while closed**;
3. every `.ant-select-dropdown` on the page with its `id`-bearing descendants,
   its `class`, and whether it is `:visible`;
4. the `count()` and `textContent` of `select.locator('.ant-select-content-value')`.

⚠ **If `aria-controls` is absent or the id-bearing node is not inside the popup,
option A is falsified and the plan must fall back to option B before anything is
implemented.** Recording that outcome honestly is part of this leg.

### Legs 1–9 — the guard, bidirectionally

Each leg runs **twice**: once against the **current** helper (or the repaired
helper with the ownership check removed) and once against the **repaired**
helper. Both outcomes are recorded before any CI cycle.

| #     | Case                                                                                                                                                                                                                       | Current / guard-removed                                                                                                                                                | Repaired                                                                                                                                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1** | **Route (a) — both popups open.** Force the margin preset popup to be open at the moment the padding option search runs.                                                                                                   | **wrong control set** — margin becomes `Normal (8px)`, padding stays `None (0px)`; the caller then fails with the exact CI signature `Expected "8px" / Received "0px"` | **passes** — the owned popup is the padding one and only its options are searched                                                                                                                                                                |
| **2** | **⭐ ONLY A FOREIGN POPUP IS OPEN — the state routes (b) and (c) both produce.** The margin popup is open; the padding select's own click is neutralised page-side, so no padding popup exists. Then run the padding path. | **silently succeeds**, setting the **margin** — no error at all; the caller fails later and elsewhere                                                                  | **fails on the ownership check**, with its own message naming the select                                                                                                                                                                         |
| **3** | **The scope-only straw man**, run against leg 2's state: the option search scoped to `getVisibleSelectDropdown()`'s subtree but with **no** ownership check — i.e. the repair the diagnosis drawer recommended.            | n/a                                                                                                                                                                    | **must ALSO silently succeed.** This is what proves §2.3's correction rather than asserting it.                                                                                                                                                  |
| **4** | **The happy path.** Clean panel, nothing else open.                                                                                                                                                                        | passes                                                                                                                                                                 | passes, **and adds no measurable stall** — record the wall time of `openSelectDropdown` end-to-end. ⓘ With the pre-wait removed (SP-1) there is no animation coupling left on this path, so "no measurable stall" is once again the right bar    |
| **5** | **The P4 detector alone.** Repaired helper with P1 and P2 removed but P4 present, run against **leg 2's state**.                                                                                                           | n/a                                                                                                                                                                    | **fails at `expectSelectShows`, naming the control** — proving P4 detects independently of P1 and P2                                                                                                                                             |
| **6** | **The negative control — a known-bad input the probe must still fail on.** Point the helper at a preset label that does not exist (`/^Nonexistent/`).                                                                      | fails (no option)                                                                                                                                                      | **fails on `toHaveCount(1)`**, naming the pattern. ⚠ Record the **exact failure message AND the runner's exit code** — a failure caught inside a passing wrapper is indistinguishable from a pass, which is the whole hazard this leg exists for |
| **7** | **⭐ NEW (SP-1) — a STABLE, legitimately-open UNRELATED Select popup.** Open an unrelated Select that stays open, then run the padding path against a clean padding control.                                               | **revision 1's pre-wait would have burned the full 5000 ms and failed** without ever touching the padding Select — the defect SP-1 named                               | **passes promptly**, because P1 asks the padding Select what it owns and is indifferent to foreign popups. Record the wall time                                                                                                                  |
| **8** | **⭐ NEW (SP-1) — the OWNED popup mid-leave.** Enter the padding path while the padding Select's own popup is still animating shut.                                                                                        | n/a                                                                                                                                                                    | **must resolve deterministically**: `aria-controls` is unset at the React commit, before the leave animation ends, so P1 must either re-open cleanly or fail with its own message — never read a stale popup                                     |
| **9** | **⭐ NEW (SP-2) — the retry path the false rationale had erased.** Make the FIRST normal click throw (or land without opening), the SECOND succeed.                                                                        | n/a                                                                                                                                                                    | **passes on the second attempt**, and the first attempt's short budget is visible in the wall time. This is the tolerance the owner chose to keep, so it must be shown to work                                                                   |

⭐⭐ **LEGS 2 AND 3 TOGETHER ARE THE DISCRIMINATOR THIS PLAN TURNS ON**, and leg
3 is the half that does the work. Leg 2 shows the _current_ helper silently
setting the wrong control. Leg 3 shows that the _narrower_ repair — scope without
ownership, which is what
`drawer_havdm_investigations_93a44232f7b76ea15a1b4f2c` recommends — **does
exactly the same thing**. Without leg 3, "ownership beats scope" is an argument;
with it, it is a measurement. ⚠ **If leg 3 shows the scope-only variant failing
loudly, §2.3's correction is WRONG, this plan is heavier than it needed to be,
and it goes back to the owner** (§7.3).

⚠⚠ **A HONESTY LIMIT ON LEGS 2 AND 3, STATED RATHER THAN GLOSSED.** They
reproduce the **state** that routes (b) and (c) produce — one foreign popup open,
none owned by the requested select — **not the runner conditions that produce
it**. Whether the real route on CI is a displaced click delivered through
Playwright's ordinary (time-of-check/time-of-use) click path, a toggled-shut
popup, or route (a) is **not** discriminated by this harness and is recorded
UNRESOLVED (§2.3). ⓘ Revision 1 named the `force: true` fallback here; SP-2
retracted that — it is not reachable by a throwing click. The repair is justified by covering
the state, which is what the helper actually sees, and no more.

⭐ **Leg 5 is the independence check.** Without it, a green run cannot tell
whether P4 is doing anything at all — it would be a check that cannot fail,
which the project has already paid for twice.

⭐ **Leg 6 exists because a probe that cannot fail on known-bad input proves
nothing about a pass.** An empty extraction and an erroring command both print
nothing.

**Mechanisms, specified rather than deferred.** Legs 1, 2 and 3 need contrived
page state, and the construction must not change what is being measured:

- **Leg 1** opens the margin preset Select first and suppresses its close, then
  enters the padding path. The suppression is **page-side** — `preventDefault` on
  the margin popup's own close path, or simply entering the padding path before
  the margin popup's leave completes. ⚠ It must **not** stub a timer or patch
  `src/`.
- **Legs 2 and 3** share one construction. ⚠⚠ **REVISION 1 SPECIFIED THE WRONG
  EVENT AND THE LEG WOULD NOT HAVE WORKED — finding SP-3.** It said a capture
  listener stopping one **`click`**. **rc-select toggles on `mousedown`, not
  `click`**: `node_modules/@rc-component/select/lib/SelectInput/index.js:117`
  defines `onInternalMouseDown`, which calls `toggleOpen()` at `:138`, and the
  root binds it as `onMouseDown` at `:185`. A `click` listener runs _after_
  `mousedown` — the popup has already toggled, and the leg would have measured
  the opposite of what it claimed.

  **Corrected construction:** open the margin popup, then attach a page-side
  **`mousedown` listener in the CAPTURE phase** on the padding Select's root,
  which calls `stopPropagation()` and **removes itself in the same call**
  (`{ capture: true, once: true }`, plus an explicit `removeEventListener` so
  removal does not depend on `once` semantics under a stopped propagation). The
  Playwright gesture still completes and still lands on the right element —
  actionability is untouched, which is the point: reaching this state by passing
  `force: true` would be assuming the conclusion.

  ⚠⚠ **AND THE LEG MUST ASSERT ITS OWN PRECONDITION AFTER THE GESTURE, NOT ONLY
  BEFORE IT.** Immediately after the click, and before judging the helper,
  record all three: (i) the padding combobox still has **no** `aria-controls`;
  (ii) the margin popup is **still visible**; (iii) the pointer action itself
  **completed** rather than throwing. A pre-gesture assertion cannot prove the
  suppression worked — that is the same mistake as revision 1's pre-wait,
  asserting a state before the thing under test consumes it.
  ⚠ **Prove the listener is gone before the next leg runs**, or leg 4's happy
  path inherits it and passes for the wrong reason.

- ⚠ **Leg ordering is load-bearing.** PR #153's harness recorded a repaired leg
  passing when it should have failed, because the _previous_ leg had already
  closed the popup. Each leg here re-establishes its own starting state and
  **asserts that state immediately before running**, and the assertions are
  recorded alongside the result.

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

1. **§6 leg 0 falsifies §4.2** — `aria-controls` absent, or the id-bearing node
   not inside the popup, or `data-testid` resolving to more than one element. The
   fallback is option B (§4.3), and that is the owner's call, not a silent
   substitution.
2. **§6 leg 3 shows the scope-only variant failing loudly.** Then §2.3's
   correction is wrong, ownership-over-scope is unjustified, and the honest
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
  `aria-controls`, the hidden 0×0 listbox, `virtual` resolving true, the single
  `data-testid` node, `.ant-select-content-value` — each is cited to a file and
  line in the installed dependency, and **none has been observed in the Electron
  app**. Leg 0 exists because of this. If any one is wrong, option A is
  falsified.
- **`.ant-select-dropdown-hidden` vs `:visible`.** The plan asserts that closed
  popups persist in the DOM (`removeOnLeave: false`) and therefore that `.last()`
  reflects first-open order. `removeOnLeave` is MEASURED; the DOM-ordering
  consequence is **INFERRED**, and Playwright's `:visible` treatment of a
  `-hidden` popup has not been measured either.
- **`filter({ has: locator(\`[id="${listId}"]\`) })`assumes the id is safe to
interpolate into an attribute selector.**`useId` may yield React's own format,
which contains characters (`:`or`«»`) that are legal inside a quoted attribute
value but which nobody here has actually seen. Leg 0 prints the real value; if
it contains a `"`, the selector must be built differently.
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
  **RETRACTED IN REVISION 2 AS FALSE, not merely weak (SP-2).** The control-flow
  half was not inferred at all — it was stated as fact and was decidable by
  reading seventeen lines. What survives as a genuine weak claim: **the
  Playwright time-of-check/time-of-use dispatch race in §2.3 is INFERRED**, is
  documented behaviour rather than measured here, and **no leg decides it**.
  Revision 1 additionally claimed leg 0 would record it; leg 0 is a DOM census
  and does not. If the race is not real, route (b) needs another explanation.

- **Legs 2 and 3 measure a STATE, not a ROUTE, and §6 now says so.** The
  residual risk is that the real CI failure arrives by a route that produces a
  state these legs do not reproduce — for example both popups open _and_ the
  owned one mid-leave, where `aria-controls` may already be unset while the popup
  is still `:visible`. That specific interleaving is **not** covered by any leg
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

**NEW IN REVISION 2 — attack these; the fix round is unreviewed new work.**

- **The scoped post-condition is new and unproven — but its timing premise is now
  settled.** `selectOptionByText` ends by asserting the owning combobox's
  `aria-controls` goes unset. ⭐ The "does it clear late?" worry is **answered from
  source**: `Input.js:188` renders the attribute straight from `open`, so it
  clears at the React commit rather than at the end of the leave animation (§10,
  RT-2). What remains weak is that **the assertion form itself has never been
  run** — `not.toHaveAttribute(name, /./)` passing on an absent attribute is
  documented Playwright behaviour, not measured here.
- ⚠ **`ownsOpenPopup` is new machinery introduced by the fix round.** It exists to
  stop the retry toggling an already-open popup shut (§10, RT-1). It reads one
  attribute and returns a boolean, so it **cannot fail loudly** — a false `true`
  would silently skip the click and leave the helper waiting on a popup that was
  never opened. Attack that: is there a state where `aria-controls` is set but the
  popup is not usable?
- **Leg 8 (owned popup mid-leave) may not be constructible as a stable state.**
  It asks for the padding Select's own popup to be mid-leave when the padding
  path is entered. `aria-controls` unsets at the React commit while the popup is
  still visible, so the window exists — but it is short, and a leg that cannot
  reliably enter its own state is a leg that reports whatever it happened to
  catch.
- **Leg 9's first-click failure has no specified mechanism yet.** "Make the first
  normal click throw or land without opening" is an outcome, not a construction.
  It needs the same treatment legs 2/3 just received, and it should not reuse the
  `mousedown` suppression if that would make it a duplicate of leg 2 rather than
  a test of the retry.
- **Three findings were repaired by the author and none has been re-reviewed.**
  Under STRAT-D7 the scoped follow-up is mandatory. Treat every claim in this
  revision's repairs as unreviewed new work, including the ones that look like
  simple deletions — SP-1's removal changed the method's contract, not just its
  body.

## 9. Disposition of the independent review

Review: `docs/reviews/spacing-helper-preset-plan-codex-review.md`, commit
`6694a61ff32f79d260f0085bf1973233bd84c005`, reviewed head `c9015598`, verdict
**SEV-1-BLOCKED**, reviewer OpenAI Codex / GPT-5.6 Sol.

⭐⭐⭐ **ALL SIX FINDINGS WERE INDEPENDENTLY RE-VERIFIED BY THE AUTHOR AT SOURCE
BEFORE BEING ACCEPTED — SIX FOR SIX, NONE FALSE.** A reviewer's finding is a
hypothesis too, and the same discipline the commission demanded of the reviewer
is owed back to it. Each row below states what was checked.

| ID       | SEV | Verdict      | What changed, and where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------- | --- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-1** | 1   | **RESOLVED** | **Owner ruled: remove the pre-wait entirely.** §4.4's `openSelectDropdown` no longer calls `waitForAllSelectDropdownsToClose()`; the trailing global wait in `selectOptionByText` is replaced by a **scoped** post-condition on the owning combobox's `aria-controls`. §4.3's recommendation rewritten. §6 legs 1/2/5 are runnable again; leg 4's animation caveat withdrawn; **new legs 7 (stable foreign popup) and 8 (owned popup mid-leave)** added, both named by the review. _Verified:_ read plan `:507-516` against `:793-797` — the collision is real and the author built it in.                        |
| **SP-2** | 1   | **RESOLVED** | **The causal claim is RETRACTED as false, in all four places the review swept** (§2.3, §4.4, §10's SR-5, and the §8 bullet). **Owner ruled: retain a bounded retry, re-gated on OWNERSHIP**, with `force: true` and the `evaluate` click still removed. **New leg 9** covers the retry-success path the false rationale had erased. ⭐ The correction _strengthens_ the ownership case: route (b) needs no `force`, because Playwright's hit-target check is TOCTOU. _Verified:_ traced `tests/support/dsl/spacing.ts:37-49` — attempt 1's throw exits the function; line 49 is unreachable via a throwing click. |
| **SP-3** | 1   | **RESOLVED** | Legs 2/3 now specify **`mousedown`, capture phase, one-shot and self-removing**, plus three **post-gesture** assertions (padding combobox has no `aria-controls`; foreign popup still visible; the pointer action completed) and a proof the listener is gone before the next leg. _Verified:_ `@rc-component/select/lib/SelectInput/index.js:117` → `toggleOpen()` at `:138`, bound as `onMouseDown` at `:185`. ⚠ The author had read `:185` earlier in the same session for another purpose.                                                                                                                    |
| **SP-4** | 2   | **RESOLVED** | §0 now says **three** decisions. §7.4 rewritten as a full six-field Owner Decision Brief with A/B/C options and costs. **Owner ruled A — fix lane.** ⓘ The reviewer's contrary reading of `OPERATING_AGREEMENT.md` §3.7 is recorded in the brief rather than resolved away, and the ruling explicitly does **not** amend §3.7.                                                                                                                                                                                                                                                                                    |
| **SP-5** | 3   | **RESOLVED** | The "~20 further files" approximation is **deleted**; the regenerating command is now the sole token inventory, with its blind spot stated. _Verified:_ regenerated — **33 files, 30 beyond spacing/tabs/popup**. The author's figure was wrong.                                                                                                                                                                                                                                                                                                                                                                  |
| **SP-6** | 3   | **RESOLVED** | The do-nothing sentence in §5.2 no longer predicts that the next flake **will** appear in `tabs`/`popup`; it states the risk and keeps their sightings explicitly undiagnosed. _Verified:_ plan `:732` said what the review quoted.                                                                                                                                                                                                                                                                                                                                                                               |

**Guard rails carried forward from the review, unchanged:** keep **P1**
ownership, **P2** subtree scope, **P3** real clicks, **P4** read-back; the
no-manifest / no-snapshot rule; §7.3's leg-3 halt if a valid scope-only
discriminator refutes the plan; and **never** restore `force: true` or the
`evaluate((el) => el.click())`.

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

**RT-2 — an open §8 worry was answerable from source and is now closed.**
Revision 2's scoped post-condition asks whether `aria-controls` clears promptly or
at the end of the leave animation. `Input.js:188` renders it straight from `open`,
so it clears **at the React commit** — the post-condition is therefore _faster_
than the document-global wait it replaces, not slower. Same authority PR #153 used
for `aria-expanded`, and the same reason it beat the popup's `-hidden` class.
