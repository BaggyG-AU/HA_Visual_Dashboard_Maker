# Plan — repair the spacing DSL's Select targeting so a preset click cannot land on the wrong control

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY, REVISION 3. No code has been written.** ⚠⚠ **Revision 3
replaces the ownership mechanism**, because the harness ran under the owner's
narrow tripwire exception and **falsified the one revisions 1–2 were built on**
(§4.2); the owner re-ruled on 2026-08-27, selecting **option D**. It also answers
the second review (`docs/reviews/spacing-helper-preset-plan-codex-followup-review.md`,
verdict **SEV-1-BLOCKED**, commit `a8cba46`) — SP-7 by **deletion**, SP-8, SP-9
and SP-10 by repair — and **deletes route (a) and route (b)'s mechanism
entirely**. Disposition is **§9**. ⓘ Revision 2 answered
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

### ⚠⚠⚠ Route (a) is DELETED — it is not constructible

Revisions 1–2 carried a route (a), "both popups open". **MEASURED: two popups
cannot be open at once.** Opening the margin Select **closed** the padding one —
by pointer **and** by keyboard (`ArrowDown` on a focused combobox, chosen
deliberately to avoid outside-click dismissal); padding read
`aria-expanded="false"`, margin `"true"`, with two popup nodes in the DOM and
exactly one displayed. **Route (a) is removed from this plan, and harness leg 1
with it.**

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

| Route                                                                                                                   | What the helper SEES                           | Repaired by scope alone?                  |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| ~~(a) both popups open~~                                                                                                | **DELETED — not constructible (measured).**    | n/a                                       |
| **(b)** the wrong Select was opened — **mechanism unexplained, deliberately**                                           | one foreign popup; the requested Select closed | **NO** — `.last()` _is_ the foreign popup |
| **(c)** the requested Select's click did not leave _its_ popup open — swallowed, or toggling an already-open popup shut | one foreign popup; the requested Select closed | **NO** — same state                       |

⚠ **Which route actually fires on the runner is UNRESOLVED and this plan does not
claim to know.** Routes (b) and (c) present the helper with the **same state**,
and that state is what the repair addresses. §6 measures the state, not the route.

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

| #      | Fact                                                                                                                                                                                                                                       | How it was measured                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1** | **`aria-expanded` is a reliable PER-SELECT open-state authority.** All comboboxes read `"false"` at rest; only the requested Select flips to `"true"` when opened; **and it flips back to `"false"` when another Select takes the popup.** | Read from every `input[role="combobox"]` in the Properties panel across three states (rest, padding open, margin open). **Sixteen** comboboxes were present.      |
| **M2** | **The visible-popup set is a SINGLETON.** Two popup nodes existed in the DOM; exactly one was displayed.                                                                                                                                   | `getComputedStyle(d).display !== 'none'` → 1; Playwright `.ant-select-dropdown:visible` → 1; `:not(.ant-select-dropdown-hidden)` → 1.                             |
| **M3** | **Route (a) — two popups open at once — is NOT CONSTRUCTIBLE.** Opening the margin Select **closed** the padding one, by pointer **and** by keyboard.                                                                                      | Keyboard was used deliberately (`ArrowDown` on a focused combobox) to avoid outside-click dismissal; padding still went `aria-expanded="false"`, margin `"true"`. |
| **M4** | ⭐ **THE DEFECT REPRODUCED IN MINIATURE.** With the padding Select CLOSED and the margin Select owning the only visible popup, a document-global `:visible` search for `/^Normal/i` returned **exactly ONE match — the MARGIN's**.         | The wrong-control state, measured. **A scope-only repair would confidently select from the foreign popup and report success.**                                    |

⭐⭐ **M4 IS THE PLAN'S CENTRAL CLAIM, NO LONGER ARGUED.** Ownership beats scope
because in the real failure state there is exactly one visible popup and it
belongs to the wrong control.

### The authority, as ruled

**OWNER RULED OPTION D, 2026-08-27** (see §4.3). Ownership is established by
**two assertions on the requested Select, in this order**:

- **P1 — the requested Select's OWN combobox reads `aria-expanded="true"`.**
  Per-Select by construction (M1). **A foreign Select cannot satisfy it**: in the
  failure state (M4) the requested Select reads `"false"` and the helper fails
  loudly, naming the control.
- **P2 — exactly ONE `.ant-select-dropdown` is visible**, and options are searched
  only inside it. The singleton is **asserted, never assumed** (M2).

⚠ **The inference this rests on, stated plainly so it can be attacked:** _if the
requested Select is open, it has a visible popup; if exactly one popup is visible,
that popup is the requested Select's._ It is sound **only because P2 is an
assertion** — if the singleton ever breaks, the helper fails loudly rather than
selecting silently. **That is a JUDGEMENT and §8 lists it first.**

**REJECTED, and why:** the `aria-controls` id link (falsified above); any
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

**Option D — per-Select `aria-expanded` + an asserted singleton (test-only).** No
`src/` change. P1 reads the requested Select's own `aria-expanded`; P2 asserts
exactly one visible popup. _Cost:_ nothing beyond the test edit. _Risk:_ it
identifies the popup by **inference** (open + singleton ⇒ ours) rather than by
construction — mitigated by asserting the singleton so a break is loud, never
silent. ⓘ It reuses the authority PR #153 already proved on this codebase.

**Option B — a popup class per Select (`src/` change).** Add
`classNames={{ popup: { root: … } }}` to each Select in `SpacingControls.tsx`
(antd v6's current form; `popupClassName` is the deprecated alias —
`node_modules/antd/lib/select/index.d.ts:57-58`) and locate
`.ant-select-dropdown.<class>`. _Precedent:_ `tests/support/dsl/backgroundCustomizer.ts:44-60`.
_Cost:_ a one-line `src/` change per Select and a test hook in product code.
_Risk:_ lowest — **the only option that identifies the popup by CONSTRUCTION
rather than by inference**; the class is ours and cannot collide. The four Selects
render from one shared function, so the class must derive from `testIdPrefix`.

**Recommendation: D.** It needs no product change, every premise behind it is
measured rather than reasoned, and its one inference fails loudly.

**If you do nothing:** the identity keeps reddening roughly one run in four.

⭐⭐ **OWNER RULED: D. 2026-08-27.** ⓘ Recorded with option B's advantage stated
plainly rather than argued away — B identifies by construction, D by an asserted
inference — so a later reader can see what was traded and why.

### 4.4 The proposed helper, in full

Revision 3. Three private helpers are rewritten and one is added; the four public
entry points that route through them (`setPreset`, `setMarginMode`,
`setPaddingMode`, and through `setPreset` the string branches of
`setCardMargin`/`setCardPadding`) change only in passing an expected-label
pattern for P4.

```ts
/** P1's primitive. True when THIS Select has its own popup open. MEASURED
 *  reliable per-Select (§4.2 M1): sixteen comboboxes read "false" at rest, only
 *  the requested one flips "true", and it flips BACK when another Select takes
 *  the popup — so a foreign Select cannot satisfy it. */
private async isOpen(select: Locator): Promise<boolean> {
  const v = await select
    .locator('input[role="combobox"]')
    .getAttribute('aria-expanded')
    .catch(() => null);
  return v === 'true';
}

/**
 * Resolve the popup belonging to `select`, proving OWNERSHIP rather than mere
 * existence. Owner ruled option D on 2026-08-27.
 *
 * ⚠⚠ SP-10: ONE SHARED DEADLINE governs every wait in here. Revision 2 passed a
 * per-attempt timeout to the first poll only and let the rest fall back to the
 * ambient expect timeout, so the advertised "short first attempt" was not what
 * the code bounded. `remaining()` is what makes the stated budget true.
 */
private async resolveOwnedDropdown(select: Locator, budgetMs: number): Promise<Locator> {
  const started = Date.now();
  const remaining = () => Math.max(50, budgetMs - (Date.now() - started));

  // P1 — OWNERSHIP. Per-Select, and false in the measured failure state.
  await expect
    .poll(() => this.isOpen(select), {
      timeout: remaining(),
      message:
        'this Select never reported its own popup open (aria-expanded stayed "false") — ' +
        'if another Select owns the only visible popup, that is the wrong-control state',
    })
    .toBe(true);

  // P2 — SCOPE, via an ASSERTED singleton. §4.2 M2 measured exactly one visible
  // popup; asserting it means a break is loud, never a silent wrong selection.
  const visible = this.window.locator('.ant-select-dropdown:visible');
  await expect(
    visible,
    'expected exactly one visible Select popup while this Select is open; ' +
      'more than one means the singleton premise behind P2 has broken and the ' +
      'popup can no longer be attributed by inference',
  ).toHaveCount(1, { timeout: remaining() });

  return visible;
}

/**
 * ⚠⚠ NO document-global pre-wait (SP-1). P1 IS the authority and must be
 * exercised WITH foreign state present.
 * ⚠⚠ The retry is RETAINED and ownership-gated (SP-2, owner's ruling), and it
 * clicks only when this Select is not already open — a Select TOGGLES on
 * mousedown (SelectInput/index.js:117 -> toggleOpen() at :138, bound at :185),
 * so an unconditional second click would CLOSE a slow-but-correct open (RT-1).
 */
private async openSelectDropdown(select: Locator): Promise<Locator> {
  await expect(select).toBeVisible({ timeout: 5000 });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const last = attempt === 1;
    try {
      if (!(await this.isOpen(select))) {
        await select.click();               // no force, ever: hit-target check stays ON
      }
      return await this.resolveOwnedDropdown(select, last ? 5000 : 1500);
    } catch (error) {
      if (last) throw error;                // second failure is REAL — report it
    }
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}

private async selectOptionByText(select: Locator, pattern: RegExp): Promise<void> {
  const dropdown = await this.openSelectDropdown(select);

  const option = dropdown.locator('.ant-select-item-option').filter({ hasText: pattern });
  // ⚠ rc-select VIRTUALISES the option list, so a row scrolled out of the
  // rendered window is absent from the DOM. Requiring exactly one match turns
  // ambiguity AND absence into a loud failure naming the pattern.
  await expect(option, `expected exactly one option matching ${pattern} in this Select's popup`)
    .toHaveCount(1);
  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click();                     // real click; actionability enforced

  // ⚠ SP-1: SCOPED to this Select, not a document-global count — waiting for
  // "no popup anywhere" would fail against a legitimately-open unrelated Select.
  // ⭐ And it settles at the React commit, not at the end of the leave animation:
  // aria-expanded is rendered from `open` (Input.js:184), the same authority and
  // the same reasoning PR #153 used.
  await expect
    .poll(() => this.isOpen(select), { timeout: 5000 })
    .toBe(false);
}

/** P4 — the outcome detector. Reads the control's OWN rendered value.
 *  `.ant-select-content-value` is the single-select value node
 *  (SingleContent.js:53); the parent `.ant-select-content` (:89) also holds the
 *  placeholder and the input, so it is the WRONG node to assert on. */
private async expectSelectShows(select: Locator, expected: RegExp): Promise<void> {
  await expect(
    select.locator('.ant-select-content-value'),
    'the Select did not end up showing the value that was selected — the click may ' +
      'have landed on another control',
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

**What is removed:**

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

**What is RETAINED — the bounded retry** (SP-2, owner's ruling 2026-08-27).
Revision 1 removed it on a false premise that §2.3 retracts. What changes is what
an attempt may count as success: **no longer "some popup is visible", but
OWNERSHIP.**

⚠ The asymmetric budget (1500 ms then 5000 ms) is a **JUDGEMENT from no
measurement**, and §8 lists it. Per SP-10 the numbers are now genuinely what the
code bounds — but **whether 1500 ms is the right number is for legs 4 and 9 to
characterise before it is frozen.**

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

### Leg 0 — the DOM census — ⭐ ALREADY RUN, AND IT FALSIFIED THE FIRST DESIGN

**STATUS: RUN 2026-08-27, headless, under the owner's narrow tripwire exception
(`drawer_havdm_decisions_12ca9d9672d4c827f60a4fcd`). Results are §4.2's M1–M4 and
the id-collision falsification. Both probes were deleted afterwards, with
`git status --porcelain` empty and `src/` + `tests/` verified byte-identical to
`HEAD`.**

⭐⭐ **It did exactly what it was placed there to do: it decided, in about a
minute, a question two rounds of source review had cleared wrongly.** Anything in
§4.2 that a later change touches must be re-measured, not re-argued.

### Legs 1–9 — the guard, bidirectionally

Each leg runs **twice** — once against the **current** helper (or the repaired
helper with the ownership check removed) and once against the **repaired** helper.
Both outcomes are recorded before any CI cycle is spent.

⚠ **Leg 1 is DELETED.** It tested route (a), "both popups open", which §2.3
records as **not constructible** (measured). Numbering is kept so the review trail
stays readable.

| #     | Case                                                                                                                                                                                                 | Current / guard-removed                                                                                                    | Repaired                                                                                                                                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~1~~ | ~~Route (a) — both popups open~~                                                                                                                                                                     | **DELETED — not constructible (measured).**                                                                                | n/a                                                                                                                                                                                                                                                           |
| **2** | **⭐ THE FAILURE STATE — only a FOREIGN popup is open.** The margin popup is open; the padding Select's own opening is suppressed page-side; then the padding path runs.                             | **silently succeeds**, setting the **MARGIN** — no error at all; the caller fails later and elsewhere                      | **fails on P1**, naming the control: the padding Select's own `aria-expanded` is `"false"`                                                                                                                                                                    |
| **3** | **⭐ The scope-only straw man**, run against leg 2's state: the option search scoped to the one visible popup but with **no** P1 ownership check — i.e. the repair the diagnosis drawer recommended. | n/a                                                                                                                        | **must ALSO silently succeed.** This is what proves ownership-beats-scope rather than asserting it. ⓘ §4.2 M4 already measured the same thing statically; this leg proves it through the helper.                                                              |
| **4** | **The happy path.** Clean panel, nothing else open.                                                                                                                                                  | passes                                                                                                                     | passes, **and adds no measurable stall** — record the wall time of `openSelectDropdown` end-to-end, and treat it as **characterisation input for the 1500 ms budget** (SP-10)                                                                                 |
| **5** | **The P4 detector alone.** Repaired helper with P1 and P2 removed but P4 present, run against **leg 2's state**. ⚠ State which opening helper the guard-removed variant uses.                        | n/a                                                                                                                        | **fails at `expectSelectShows`, naming the control** — proving P4 detects independently of P1 and P2                                                                                                                                                          |
| **6** | **The negative control — known-bad input the probe must still fail on.** Point the helper at a preset label that does not exist (`/^Nonexistent/`).                                                  | fails (no option)                                                                                                          | **fails on `toHaveCount(1)`**, naming the pattern. ⚠ Record the **exact failure message AND the runner's exit code** — a failure caught inside a passing wrapper is indistinguishable from a pass                                                             |
| **7** | **A STABLE, legitimately-open UNRELATED Select popup**, then run the padding path against a clean padding control.                                                                                   | a document-global pre-wait would burn its full budget and fail without touching the padding Select — the defect SP-1 named | **passes promptly**, because P1 asks the padding Select what it owns. ⚠ P2 asserts ONE visible popup, so record whether the unrelated popup closes when the padding one opens — **if both can be visible, P2's premise breaks and that is a finding, loudly** |
| **8** | **The OWNED popup mid-leave.** Enter the padding path while the padding Select's own popup is animating shut.                                                                                        | n/a                                                                                                                        | **ONE oracle: the helper RE-OPENS and selects successfully.** See the construction below                                                                                                                                                                      |
| **9** | **The retry path.** First gesture suppressed, second succeeds.                                                                                                                                       | n/a                                                                                                                        | **passes on the second attempt**; record the wall time, as characterisation of the budget and **not** as proof the number is right                                                                                                                            |

⭐⭐ **LEGS 2 AND 3 TOGETHER ARE THE DISCRIMINATOR**, and leg 3 does the work: it
runs the _narrower_ repair against the same state and must **also** silently
succeed. ⚠ **If leg 3 shows the scope-only variant failing loudly, ownership-beats-scope
is wrong, the plan is heavier than it needed to be, and it goes back to the
owner** (§7.3).

**Constructions, specified — SP-8 and SP-9.**

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

1. ~~**§6 leg 0 falsifies §4.2.**~~ ⭐ **THIS ALREADY HAPPENED, AND THE RULE
   WORKED AS WRITTEN.** Leg 0 ran on 2026-08-27 and falsified the `aria-controls`
   mechanism; the plan did **not** silently substitute another, the decision went
   back to the owner (§4.3), and the owner re-ruled — option D. **The standing
   halt condition now reads: if any measured fact in §4.2 (M1–M4) is later
   contradicted, STOP and re-put the mechanism decision rather than patching
   around it.** Option B remains the named fallback.
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

**NEW IN REVISION 3 — attack these first; most of this section is new work no
review has seen.**

- ⚠⚠⚠ **THE WHOLE OF §4.2/§4.3/§4.4 IS UNREVIEWED.** The ownership mechanism was
  replaced after round 2, because execution falsified the old one. **Two review
  rounds cleared the mechanism that turned out to be wrong** — so a third
  clearance is worth less than it looks unless it exercises the new one directly.
- ⚠⚠ **P2's inference is the plan's softest joint, and it is a JUDGEMENT.** _If
  the requested Select is open, and exactly one popup is visible, that popup is
  the requested Select's._ The singleton is **measured** (§4.2 M2) and
  **asserted**, so a break is loud — but it is still an inference where option B
  would have had a construction. **Find a state with two visible popups.** Leg 7
  is where it would show up.
- **M3 (route (a) not constructible) rests on ONE observed sequence.** Opening
  the margin Select closed the padding one by pointer and by keyboard. That is two
  gestures in one flow, not a proof that no route ever leaves two popups open —
  and P2 depends on it. ⚠ It is also the premise for deleting leg 1.
- **`isOpen` cannot fail loudly.** It reads one attribute and returns a boolean, so
  a false `true` skips the click and leaves the helper waiting on a popup that was
  never opened. ⓘ Round 2 examined the equivalent `ownsOpenPopup` and found **no
  path by which it silently selects the wrong control** — the downstream P2, option
  count, real click and P4 remain loud — but that clearance was given for the
  previous helper's shape and should be re-asked of this one.
- **The 1500/5000 ms split is still a JUDGEMENT from no measurement.** SP-10 made
  the numbers honest about what they bound; it did not make them right. Legs 4 and
  9 characterise before freezing.
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

| ID       | SEV | Verdict      | What changed, and where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------- | --- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-1** | 1   | **RESOLVED** | **Owner ruled: remove the pre-wait entirely.** §4.4's `openSelectDropdown` no longer calls `waitForAllSelectDropdownsToClose()`; the trailing global wait in `selectOptionByText` is replaced by a **scoped** post-condition on the owning combobox's `aria-controls`. §4.3's recommendation rewritten. §6 legs 1/2/5 are runnable again; leg 4's animation caveat withdrawn; **new legs 7 (stable foreign popup) and 8 (owned popup mid-leave)** added, both named by the review. _Verified:_ read plan `:507-516` against `:793-797` — the collision is real and the author built it in.                        |
| **SP-2** | 1   | **RESOLVED** | **The causal claim is RETRACTED as false, in all four places the review swept** (§2.3, §4.4, §10's SR-5, and the §8 bullet). **Owner ruled: retain a bounded retry, re-gated on OWNERSHIP**, with `force: true` and the `evaluate` click still removed. **New leg 9** covers the retry-success path the false rationale had erased. ⭐ The correction _strengthens_ the ownership case: route (b) needs no `force`, because Playwright's hit-target check is TOCTOU. _Verified:_ traced `tests/support/dsl/spacing.ts:37-49` — attempt 1's throw exits the function; line 49 is unreachable via a throwing click. |
| **SP-3** | 1   | **RESOLVED** | Legs 2/3 now specify **`mousedown`, capture phase, one-shot and self-removing**, plus three **post-gesture** assertions (padding combobox has no `aria-controls`; foreign popup still visible; the pointer action completed) and a proof the listener is gone before the next leg. _Verified:_ `@rc-component/select/lib/SelectInput/index.js:117` → `toggleOpen()` at `:138`, bound as `onMouseDown` at `:185`. ⚠ The author had read `:185` earlier in the same session for another purpose.                                                                                                                    |
| **SP-4** | 2   | **RESOLVED** | §0 now says **three** decisions. §7.4 rewritten as a full six-field Owner Decision Brief with A/B/C options and costs. **Owner ruled A — fix lane.** ⓘ The reviewer's contrary reading of `OPERATING_AGREEMENT.md` §3.7 is recorded in the brief rather than resolved away, and the ruling explicitly does **not** amend §3.7.                                                                                                                                                                                                                                                                                    |
| **SP-5** | 3   | **RESOLVED** | The "~20 further files" approximation is **deleted**; the regenerating command is now the sole token inventory, with its blind spot stated. _Verified:_ regenerated — **33 files, 30 beyond spacing/tabs/popup**. The author's figure was wrong.                                                                                                                                                                                                                                                                                                                                                                  |
| **SP-6** | 3   | **RESOLVED** | The do-nothing sentence in §5.2 no longer predicts that the next flake **will** appear in `tabs`/`popup`; it states the risk and keeps their sightings explicitly undiagnosed. _Verified:_ plan `:732` said what the review quoted.                                                                                                                                                                                                                                                                                                                                                                               |

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
THE OWNERSHIP MECHANISM ITSELF WAS REPLACED.** Between round 2 and this revision
the harness ran and **falsified option A** — the `aria-controls` id is the
constant `test-id` in test mode, shared by every Select (§4.2). The owner re-ruled
on 2026-08-27, selecting **option D**. **§4.2, §4.3 and §4.4 are therefore new
work that no review has seen**, and §8's first block says so.

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
