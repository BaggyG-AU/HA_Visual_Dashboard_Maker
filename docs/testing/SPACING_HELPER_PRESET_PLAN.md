# Plan — repair the spacing DSL's Select targeting so a preset click cannot land on the wrong control

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY, REVISION 1. No code has been written.** This document
exists to be reviewed before it is implemented. Its subject is a **shared test
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

**Two decisions are yours.** They are set out in Owner Decision Brief form at
§4.3 (which ownership mechanism) and §5.2 (how wide to sweep). Each has a
recommendation with its reason.

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

⚠⚠ **ROUTE (b) HAS A SPECIFIC DELIVERY MECHANISM, AND NAMING IT DECIDES §4.4's
SCOPE QUESTION.** Playwright's own `click()` performs a hit-target check, so a
click displaced by the scrollable Properties panel would normally **raise**
rather than land silently on the margin select. Two things in
`openSelectDropdown` remove that protection, and they work as a pair: the retry
loop's `catch (error) { if (attempt === 1) throw error; }` at `:43-45`
**swallows the first attempt's raise**, and the fallback at `:49` then re-clicks
with `force: true`, which **disables the hit-target check outright**.
⭐ **So route (b) is reachable essentially only through the `force: true`
fallback, and the retry loop is what delivers control to it.** That is why §4.4
removes the two together, and it is the answer to the obvious objection that
removing the retry is unrequested scope: the retry loop is not an innocent
bystander, it is the defect's delivery path. (MEASURED for what the helper's
code does; **INFERRED** for Playwright's hit-target behaviour, which is
documented but has not been measured here — §6 leg 0 records it.)

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

**Recommendation: A, with C's zero-count wait retained as SETUP isolation only.**
A is test-only, it is the only option that proves ownership without putting a
hook in product code, and its failure mode is loud. The zero-count wait is worth
keeping _before_ opening a select because it makes the starting state
deterministic and cheap to reason about — but it must never be the check that
decides the claim. ⚠ That distinction (setup isolation vs assertion authority) is
a **JUDGEMENT**, it is the same one PR #153's reviewer probed at its §6a case 4,
and §8 lists it for attack.

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
private async resolveOwnedDropdown(select: Locator): Promise<Locator> {
  const combobox = select.locator('input[role="combobox"]');
  await expect(combobox).toHaveCount(1);

  let listId = '';
  await expect
    .poll(async () => (listId = (await combobox.getAttribute('aria-controls')) ?? ''), {
      timeout: 5000,
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

private async openSelectDropdown(select: Locator): Promise<Locator> {
  await expect(select).toBeVisible({ timeout: 5000 });

  // SETUP ISOLATION ONLY — makes the starting state deterministic. It is
  // deliberately NOT the check that decides which popup we then act on; that is
  // resolveOwnedDropdown's job. See the plan's §4.3.
  await this.waitForAllSelectDropdownsToClose();

  await select.click();                       // no force: the hit-target check stays ON
  return await this.resolveOwnedDropdown(select);
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

  await this.waitForAllSelectDropdownsToClose();
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

**What is removed:** the `Escape` presses at `:46` and `:62`, the retry loop at
`:37-47`, and the `force: true` fallback at `:49`.

⭐ **The retry loop and the `force: true` fallback are ONE thing, not two, and
that is why removing the retry is inside this repair's scope rather than beside
it.** §2.3 sets out the mechanism: the retry loop's `catch` at `:43-45` swallows
the hit-target error that a displaced click would otherwise raise, and its only
exit after two failures is the `force: true` click at `:49` that disables the
hit-target check. Removing `force: true` while keeping the loop would leave a
loop whose sole remaining purpose is to swallow the raise that is now the
helper's most useful signal. **The retry loop is the defect's delivery path, not
an innocent bystander.**

⚠ It is still a **behaviour change to the helper's tolerance**, and §8 lists it
for attack: if the first click genuinely is unreliable on the runner, this
converts an intermittent wrong answer into an intermittent honest failure —
better, but not "no failure", and the owner should know that before it is
measured.

⚠ **And the isolation wait carries a cost that must be stated, because PR #153
rejected exactly this coupling for the DECIDING check.**
`waitForAllSelectDropdownsToClose()` matches `.ant-select-dropdown:visible`, and
a popup only stops being `:visible` when CSSMotion's leave finishes and the
`-hidden` class lands. ⓘ It does terminate — `-hidden` resolves to
`display: none` (`node_modules/antd/lib/select/style/dropdown.js:81-82`), so
Playwright reports it not-visible rather than counting an `opacity: 0` box as
visible — but until then the helper is **coupled to the `slide-up` leave
animation** (`node_modules/antd/lib/select/index.js:233`). That is acceptable
for **setup**, where the cost is a short wait; it is exactly what makes it
unacceptable as the **authority**, which is §4.2's rejection. ⚠ With the retry
loop gone this wait is now the only thing absorbing a lingering popup, so its
five-second budget sits on the critical path of every mode and preset change —
§8 lists that for attack.

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

Beyond those two, the wider family is the ~20 further DSL and spec files the same
grep returns, and the project has already named it: `TESTING_STANDARDS.md:1422`,
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

**If you do nothing about the wider class:** the next spacing-shaped flake
appears in `tabs` or `popup` instead, and open item 27 stays open.

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

### Legs 1–6 — the guard, bidirectionally

Each leg runs **twice**: once against the **current** helper (or the repaired
helper with the ownership check removed) and once against the **repaired**
helper. Both outcomes are recorded before any CI cycle.

| #     | Case                                                                                                                                                                                                                       | Current / guard-removed                                                                                                                                                | Repaired                                                                                                                                                                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Route (a) — both popups open.** Force the margin preset popup to be open at the moment the padding option search runs.                                                                                                   | **wrong control set** — margin becomes `Normal (8px)`, padding stays `None (0px)`; the caller then fails with the exact CI signature `Expected "8px" / Received "0px"` | **passes** — the owned popup is the padding one and only its options are searched                                                                                                                                                              |
| **2** | **⭐ ONLY A FOREIGN POPUP IS OPEN — the state routes (b) and (c) both produce.** The margin popup is open; the padding select's own click is neutralised page-side, so no padding popup exists. Then run the padding path. | **silently succeeds**, setting the **margin** — no error at all; the caller fails later and elsewhere                                                                  | **fails on the ownership check**, with its own message naming the select                                                                                                                                                                       |
| **3** | **The scope-only straw man**, run against leg 2's state: the option search scoped to `getVisibleSelectDropdown()`'s subtree but with **no** ownership check — i.e. the repair the diagnosis drawer recommended.            | n/a                                                                                                                                                                    | **must ALSO silently succeed.** This is what proves §2.3's correction rather than asserting it.                                                                                                                                                |
| **4** | **The happy path.** Clean panel, nothing else open.                                                                                                                                                                        | passes                                                                                                                                                                 | passes; **record the wall time of `openSelectDropdown` end-to-end** — it must be bounded and attributable (the isolation wait is coupled to the `slide-up` leave, so "no stall" is the wrong bar; "a short, explained stall" is the right one) |
| **5** | **The P4 detector alone.** Repaired helper with P1 and P2 removed but P4 present, run against **leg 2's state**.                                                                                                           | n/a                                                                                                                                                                    | **fails at `expectSelectShows`, naming the control** — proving P4 detects independently of P1 and P2                                                                                                                                           |
| **6** | **The negative control — a known-bad input the probe must still fail on.** Point the helper at a preset label that does not exist (`/^Nonexistent/`).                                                                      | fails (no option)                                                                                                                                                      | **fails on `toHaveCount(1)`**, naming the pattern                                                                                                                                                                                              |

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
it**. Whether the real route on CI is a displaced click through the `force: true`
fallback, a toggled-shut popup, or route (a) is **not** discriminated by this
harness and is recorded UNRESOLVED (§2.3). The repair is justified by covering
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
- **Legs 2 and 3** share one construction: open the margin popup, then attach a
  **page-side capture listener** on the padding select's root that calls
  `stopPropagation()` for exactly one click. The click is still delivered and
  still lands on the right element — Playwright's hit-target check passes — but
  the Select never sees it. That reproduces "this select's popup did not open"
  **without** disabling actionability, which is the point: a construction that
  reached the state by passing `force: true` would be assuming the conclusion.
  ⚠ The listener must remove itself after one call, or leg 4's happy path
  inherits it.
- ⚠ **Leg ordering is load-bearing.** PR #153's harness recorded a repaired leg
  passing when it should have failed, because the _previous_ leg had already
  closed the popup. Each leg here re-establishes its own starting state and
  **asserts that state immediately before running**, and the assertions are
  recorded alongside the result.

**Leg 7 — the callers.** The three currently-passing spacing tests plus the YAML
round-trip test, and `spacing.visual.spec.ts`, run headless at `--workers=1`
against the repaired helper. Snapshots must not move (§5.3).

**Leg 8 — repeat.** `--repeat-each=5` on `applies spacing presets`. An isolated
green does not clear a full-suite flake, and this leg is characterisation, not
acceptance — it is recorded as such.

**Leg 9 — CI.** Only after legs 0–8 are recorded. ⚠ Acceptance evidence is
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

### 7.4 ⚠ A governance question this plan raises, for the reviewer and the owner

`docs/governance/OPERATING_AGREEMENT.md` §3.7 partitions process depth into two
lanes and says the lanes _"do not overlap by construction"_. This work sits
awkwardly across them: it is **fix-lane** work (a defect repair, under the
spec-before-code trial) whose **subject** is a **test DSL**, which §3.7 names
explicitly under the slice lane's capability class. §3.7's **hybrid ban** says
fix-lane work discovered to be capability-shaped _"halts and re-enters as its own
slice"_.

Read literally, that could mean this repair should be a slice rather than a fix.
**Recommendation: treat it as fix-lane and proceed.** The capability/content dial
is described in §3.7 as _the slice lane's_ depth dial, and the hybrid ban reads as
being aimed at fix-lane work that turns out to be **new capability**, not at a
defect repair that happens to live in shared code — otherwise every DSL bug fix
becomes a slice and the fix lane empties. But it is genuinely ambiguous, the
distinction is not written down anywhere, and it is the owner's to settle. ⓘ This
is raised now rather than after implementation precisely because raising it later
would be raising it too late.

---

## 8. The weakest claims in this plan, for the reviewer to attack

Attack these by name. A finding against any of them is within reach and should
not have needed an independent reviewer to find.

- **⚠⚠ The strongest counter-attack: §4.4's `openSelectDropdown` opens with
  `waitForAllSelectDropdownsToClose()` — a document-global wait, which is the
  authority §4.2 rejects.** The defence is that setup isolation and assertion
  authority are different roles: the global count establishes a known starting
  state, while `resolveOwnedDropdown` decides the claim. **That distinction is a
  JUDGEMENT.** If it does not hold, the isolation step must go, and legs 1–3 must
  construct their state some other way. It is also worth attacking on a second
  ground: with the retry loop removed (§4.4), this wait becomes the only thing
  absorbing a lingering popup, so a five-second timeout here is now on the
  critical path of every mode and preset change.
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
- **The retry loop is removed (§4.4), and that is a behaviour change nobody
  asked for.** It is justified by "a click whose effect cannot be confirmed
  should not be retried into a wrong state", but it is the fix round adding
  scope, and it could convert an intermittent silent wrong answer into an
  intermittent honest failure. Better — but not "no failure".
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

- ⚠⚠ **The isolation wait is now on the critical path of every mode and preset
  change, and it is coupled to an animation.** With the retry loop removed,
  `waitForAllSelectDropdownsToClose()` is the only thing absorbing a lingering
  popup, and a popup stops being `:visible` only when CSSMotion's leave finishes.
  It terminates (`-hidden` is `display: none`), but a five-second budget now
  gates every `setPreset` / `setMarginMode` / `setPaddingMode`. **The author
  attacked this on a stronger ground — that an `opacity: 0` popup would make the
  wait unsatisfiable, which is `tabs.visual:33`'s recorded signature — and the
  attack REFUTED**: `node_modules/antd/lib/select/style/dropdown.js:81-82` sets
  `display: none`. An attack that failed is not a proof of safety, and the
  magnitude here may be the comfortable one; find the cruel one.
- **Route (b)'s delivery mechanism (§2.3) is INFERRED on its load-bearing
  half.** The claim that Playwright's non-`force` click would _raise_ on a
  displaced target — and therefore that route (b) needs the `force: true`
  fallback — rests on documented Playwright behaviour that has **not** been
  measured here. If it is wrong, route (b) is reachable without the fallback and
  §4.4's "the retry loop is the defect's delivery path" argument weakens from a
  mechanism to a plausibility.
- **Legs 2 and 3 measure a STATE, not a ROUTE, and §6 now says so.** The
  residual risk is that the real CI failure arrives by a route that produces a
  state these legs do not reproduce — for example both popups open _and_ the
  owned one mid-leave, where `aria-controls` may already be unset while the popup
  is still `:visible`. That specific interleaving is **not** covered by any leg
  as written. Is it reachable, and should there be a leg for it?
- **The `stopPropagation` construction in legs 2/3 could be the wrong
  instrument.** It stops the Select seeing the click, which is what a swallowed
  click looks like from the helper's side — but a toggled-shut popup (§2.3 route
  c) is a _different_ state: there, the Select _did_ see the click. Whether the
  two are equivalent from `resolveOwnedDropdown`'s point of view is a
  **JUDGEMENT** (both leave no owned popup open), and it should be attacked.

---

## 9. Disposition of the independent review

_To be completed when the review returns. Each finding gets a row: ID, severity,
verdict (RESOLVED / PARTIALLY RESOLVED / REGRESSED / ACCEPTED-NOT-FIXED), what
changed, and where._

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

| #         | Question | What it found                                                                                                                                                                                                                                                                                                                                    | Disposition                                                                                                                                                                                       |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SR-1**  | Q2       | §4.2 cited the `RootComponent` branch at `:166-175`. It begins at `:165` (`if (RootComponent) {`).                                                                                                                                                                                                                                               | **FIXED** — citation corrected.                                                                                                                                                                   |
| **SR-2**  | Q2       | Two citations pointed at a 22-line range (`@rc-component/trigger` `lib/Popup/index.js:130-152`) for two specific facts.                                                                                                                                                                                                                          | **FIXED** — tightened to `:150` (`removeOnLeave: false`) and `:152` (`leavedClassName`).                                                                                                          |
| **SR-3**  | Q2       | `aria-owns` at `Input.js:186` carries the identical value under the identical condition and was unmentioned — a reviewer checking `:188` would meet it and wonder.                                                                                                                                                                               | **FIXED** — added as an explicit equivalent fallback.                                                                                                                                             |
| **SR-4**  | Q1       | Route (c) was written as "the click was swallowed". A Select **toggles** on a click of its root, so an already-open popup being clicked shut is a second, distinct mechanism reaching the same state.                                                                                                                                            | **FIXED** — route (c) broadened.                                                                                                                                                                  |
| **SR-5**  | Q1       | ⭐ **The biggest catch.** The plan asserted routes (b)/(c) exist without saying _how_ they get past Playwright's hit-target check. They get past it through the retry loop's `catch` at `:43-45` and the `force: true` fallback at `:49`.                                                                                                        | **FIXED** — §2.3 now names the delivery mechanism, and it **reframes Q7**: removing the retry loop is not unrequested scope, it is removing the defect's delivery path.                           |
| **SR-6**  | Q3       | The author attacked his own isolation wait on the strongest available ground — that if `.ant-select-dropdown-hidden` were `opacity: 0`, Playwright would count it visible and the wait could never pass, which is `tabs.visual:33`'s recorded signature. **The attack REFUTED**: `antd/lib/select/style/dropdown.js:81-82` sets `display: none`. | **RECORDED, not fixed** — but it exposed a real residual: the wait is coupled to the `slide-up` leave animation, and with the retry gone it is on the critical path. Added to §4.4 and §8.        |
| **SR-7**  | Q5       | Legs 2 and 3 as first written were "route (b)" and "route (c)" — but a harness cannot construct a _route_, only a _state_, and contriving a displaced click would have meant reaching the state by the very bypass under test.                                                                                                                   | **FIXED** — merged into one honest state-based leg, with the limit stated plainly.                                                                                                                |
| **SR-8**  | Q5       | ⭐ There was **no leg that measured the plan's own central claim**. Legs 1–3 showed the old helper failing and the new one passing; none showed that the _narrower_ repair also fails. Without it, "ownership beats scope" was an argument dressed as a measurement.                                                                             | **FIXED** — new **leg 3**, the scope-only straw man, which is now named as the half of the discriminator that does the work, with an explicit "if this refutes, the plan goes back to the owner". |
| **SR-9**  | Q5       | Leg 4's bar was "adds no measurable stall". SR-6 makes that false by construction — the isolation wait _is_ a stall.                                                                                                                                                                                                                             | **FIXED** — bar changed to "bounded and attributable".                                                                                                                                            |
| **SR-10** | Q6       | §5.2 stated the class by its **search token** (`ant-select-dropdown`), which is exactly the sweep-key failure the governing practice rule names.                                                                                                                                                                                                 | **FIXED** — the class is now stated as a **behaviour** first, with the token grep demoted to corroboration and its blind spot named.                                                              |
| **SR-11** | Q9       | §5.2 was an options table with a recommendation, **not** an Owner Decision Brief — three of the six fields were missing.                                                                                                                                                                                                                         | **FIXED** — the missing fields added.                                                                                                                                                             |
| **SR-12** | Q4       | The published enumeration is lexical. Ran the aliasing searches the commission demands (`(const\|let\|var) x = <expr>.spacing`, and destructuring renames) — **none found** outside `tests/support/index.ts`.                                                                                                                                    | **CONFIRMED**, and the limit added to §8 rather than treated as clearance.                                                                                                                        |
| **SR-13** | Q4       | `tabs.ts` / `popup.ts` block ranges were both given as `:6-37`; the two files are offset by one, and neither call-site count was given.                                                                                                                                                                                                          | **FIXED** — `tabs.ts:6-38` (call sites `:149`, `:182`) and `popup.ts:6-37` (call site `:114`).                                                                                                    |

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
