Author: Claude Opus 5 (round-6 triage and fix)
Reviewer: OpenAI Codex (GPT-5), independent, authored rounds 1–6 and no fix
Owner gate: BaggyG-AU decides whether PR #142 proceeds and is the only person who merges it

# Author response — round 6

Reviewed against `baa5313`. Round 6's verdict was **CHANGES-REQUIRED** with two
blocking findings and one non-blocking.

| Finding                                                                                         | Severity     | Disposition                                                                                                         |
| ----------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **R6-M1** — all four collapsed badges are skipped by sequential Tab                             | BLOCKING     | **FALSE** — measured in both directions; no `src/` change. The _evidence_ half of the finding is fair and is fixed. |
| **R6-M2** — option-row `Tag`s do not expose the qualification in their computed accessible name | BLOCKING     | **CONFIRMED, mechanism corrected** — fixed at the option-data layer.                                                |
| **R6-N1** — two test comments contradict the measured record                                    | non-blocking | **CONFIRMED** — both corrected, class swept.                                                                        |

⚠ **The round's own headline is that its two blocking findings were themselves
evidence failures — and so was one of my probes and one of my new legs.** Round 6
said my round-5 checks "passed without exercising the claims they were said to
prove". That is right. It is also what happened to R6-M1's own probe, to the
first draft of my replacement leg, and to my first forward-traversal instrument.
The rule cuts every way it can be pointed.

---

## R6-M1 — FALSE. The probe measured in the direction that cannot reach the badge.

**The claim.** _"`tabIndex=0` on a descendant of antd Select's rendered value
does not put it in the browser's sequential focus order."_ Round 6 started at
each owning combobox, pressed `Tab`, and reported that focus went to
`theme-dark-toggle` / `theme-settings-mode` / `theme-manager-load` /
`theme-manager-view-clear` in the four contexts.

**Every one of those four measurements reproduces exactly.** I ran them and got
the same four elements. They are correct, and they do not decide the claim.

**The badge is rendered BEFORE its combobox.** `labelRender` renders into
`.ant-select-content-value`, which precedes the Select's `<input>` in the DOM.
Measured with the browser's own comparison rather than by reading the markup:

```
PROBE/DIR documentPosition (badge vs input): input FOLLOWS badge (badge is EARLIER)
```

and the rendered header Select confirms the ordering directly —
`<div class="ant-select-content"><div class="ant-select-content-value" …><span
… data-testid="theme-no-effect-badge" tabindex="0" …>…</div><input …>`.

So `Tab` **forward from the combobox** walks _away_ from the badge. It could not
have reached it whatever the tab order was, and the four measurements are a fact
about the probe's starting point.

**Measured the other way, at all four contexts.** `Shift+Tab` from the combobox,
then — to satisfy the finding's own prescription, "send `Tab` from a real
preceding focus target and assert the resulting active element" — walking back
one further stop to the badge's true predecessor and pressing `Tab` forward:

| Collapsed context     | Badge's true predecessor                      | Forward `Tab` lands on                                                     |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| Header theme Select   | `Entities` button (app shell)                 | **`theme-no-effect-badge`** (`role=img`, `tabindex=0`, `ant-tooltip-open`) |
| Theme Settings Select | the active tabpanel (`theme-settings-inline`) | **`theme-no-effect-badge`** (`ant-tag`, `ant-tooltip-open`)                |
| Saved-theme Select    | `theme-manager-save` button                   | **`theme-no-effect-badge`**                                                |
| View-override Select  | `theme-manager-delete` button                 | **`theme-no-effect-badge`**                                                |

All four are in the browser's sequential focus order, and the explanation opens
on arrival. A keyboard user tabbing through the app reaches the badge
immediately before the theme picker it belongs to. **The round-5 fix did what it
claimed.**

**Class sweep.** The class is _every collapsed Select value carrying a focusable
badge_ — stated as a behaviour, then enumerated by reading every `labelRender`
call in `src/` rather than grepping `focusable`. Four members: three compact
icons and one non-compact `Tag`. All four measured, all four reachable. No fifth
`labelRender` badge exists.

### But the evidence half of R6-M1 is correct, and it is fixed

_"The committed tests cannot detect the defect."_ True. The legs asserted
`tabIndex="0"` and then called `locator.focus()`, and a comment claimed `.focus()`
drives the DOM "the way a Tab key would land". It does not — programmatic focus
lands on elements outside the tab order entirely, so the check could not have
failed if the claim were false.

Both legs now call a new `expectReachableByTab`, which presses real
`Shift+Tab`/`Tab` and asserts on `document.activeElement`. `tabIndex="0"` is
still asserted, now explicitly as a necessary-not-sufficient precondition.

⭐ **And the new instrument was proved live on known-bad input before being
trusted**, because it PASSES on `baa5313` and a check that cannot fail is worse
than no check. Run against `6eb47d8` — round 5's base, where the badge had no
`tabIndex` and the tooltip was hover-only — all three legs using it **failed, on
the helper's own assertion**:

```
Error: theme-manager-saved-select: Shift+Tab out of the combobox must land on the badge …
-   "testid": "theme-no-effect-badge"
+   "testid": "theme-manager-save"
```

Focus skipped straight past the badge to the control before it. The helper
detects exactly the R5-M2 defect, so its pass on `baa5313` is a measurement and
not a vacuum.

⚠ **Two of my own instruments failed first, and both were mine, not the
product's.** My first forward-traversal probe blurred the badge and focused
`document.body` before tabbing — Chromium keeps a _sequential focus navigation
starting point_ that a blur does not reset, so the traversal resumed from the
badge's own position and appeared to skip it. And an early probe used
`.ant-select-selector`, which is an antd v5 class; v6.1.4 renders
`.ant-select-content`. Both were caught by reading the failure reason rather than
the exit code.

---

## R6-M2 — CONFIRMED. The conclusion is right; the stated mechanism is not, and the real one is worse.

**What the finding says.** The option `Tag` is a `span` with the implicit
`generic` role; WAI-ARIA prohibits author naming on `generic`; _"the browser
therefore does not use this attribute as the Tag's accessible name."_

**The prohibition is real. The consequence is not.** Measured on Chromium's own
accessibility tree over CDP, and independently with Playwright's accessible-name
implementation, both agreeing:

```
PROBE/OPTION Tag CHROMIUM AX:    role=generic name="no preview colours. This theme sets none of the six colour values…"
PROBE/SETTINGS Tag CHROMIUM AX:  role=generic name="no preview colours. This theme sets none of the six colour values…"
PROBE/HEADER collapsed AX:       role=image   name="no preview colours. This theme sets none of the six colour values…"
```

Chromium **does** compute the name from `aria-label` on a `generic` node. Authors
are forbidden to rely on it; the browser does not discard it.

**The real mechanism is antd's hidden accessibility listbox.** `@rc-component/select`
renders a **separate 0×0 `role="listbox"`** holding only three `role="option"`
divs — the active index and its two neighbours — and the visible dropdown rows
that `optionRender` decorates are `role="generic"` and are **not options at all**:

```
<div role="listbox" id="test-id_list" style="height:0;width:0;overflow:hidden">
  <div aria-label="Mushroom Square" role="option" aria-selected="true">Mushroom Square</div>
  …
```

Every `[role="option"]` in the document measured `hasBadge: false` and a 0px-wide
box. The dropdown's accessibility snapshot shows what a reader receives:

```
- listbox:
  - option "Mushroom Square Shadow"
  - option "Mushroom Square" [selected]
  - option "Mushroom"
- text: … img "info-circle" … text: no preview colours …
```

The theme names, then a meaningless `img "info-circle"` and loose text outside
the listbox. **The qualification is absent, and no `aria-label` or
`aria-describedby` placed on anything `optionRender` draws could ever have
supplied it** — including the `aria-describedby`-on-the-Tag remedy the finding
suggests, which would land on a node assistive technology never visits.

**The fix therefore lives at the option-data layer, not on the badge.**
`OptionList` spreads `pickAttrs(itemData, true)` onto that hidden option
_after_ its default `aria-label`, and `pickAttrs(props, true)` picks `role` plus
every `aria-*` key — so attributes on the option object win. `buildThemeOptions`
now attaches, to badged options only:

- `aria-label` → `"<theme name>, no preview colours"`
- `aria-description` → the full qualification sentence

**Owner-ruled 2026-08-14: name short, description long.** Four of the five themes
on the reference instance are badged, so putting ~45 words into the _name_ would
put the whole sentence in front of almost every option while arrowing the list.
This is the split the finding itself recommended as "less duplicative".

⚠ **One structural change came with it.** `buildThemeOptions` needs the two
user-facing strings, and it must not import a React component —
`tests/unit/themeBadge.spec.ts` imports it directly and `src/features/` must not
depend on `src/components/`. Both strings moved to
`src/features/theme-manager/themeBadgeCopy.ts` **byte-identically — sha256 of the
constant block matches `baa5313` exactly — so no user-facing wording changed and
the owner's wording gate was not reopened.** `ThemeNoEffectBadge.tsx` re-exports
them, so every existing import still works and there is still exactly one
definition of each.

⚠ **CORRECTION, FOUND BY RUNNING THIS ROUND'S OWN COMMISSION AGAINST MYSELF
BEFORE SENDING IT.** An earlier draft of this section, of the component's pointer
comment, and of two MemPalace drawers said the binding docblock moved _"verbatim,
unchanged"_. **That was false.** One sentence was adapted: it read _"This one
component renders in EIGHT contexts"_, and outside the component that referent
does not exist, so it now reads _"One component renders this string in EIGHT
contexts"_. The edit is correct and necessary; **the claim of verbatimness was
not**, and it had already reached four surfaces including two memory drawers. The
string constants — the thing the wording gate actually governs — are
byte-identical, and that is the claim worth making.

**Class sweep.** The class is _every route by which a badged theme's
qualification could reach assistive technology_, stated as a role before a key
was chosen. Two routes exist: the collapsed value (reachable by keyboard, name
computed on a `role=img` or focusable node — working, and now pinned by real Tab
legs) and the option row (the hidden listbox — broken, now fixed). All four
option Selects consume `buildThemeOptions`, so the single change closes all four;
verified by reading each Select's `options=` prop rather than by grepping.

**Red/green, same checkout.** The new leg fails against `baa5313`'s `src/` on the
computed name, behind a wording-neutral precondition:

```
Error: THE FALSIFIER: a reader arrowing the list must hear the visible label, not the bare theme name
expect(locator).toHaveAccessibleName(expected) failed
Expected: "Mushroom Square, no preview colours"
Received: "Mushroom Square"
locator resolved to <div role="option" id="test-id_list_7" aria-selected="true" aria-label="Mushroom Square">Mushroom Square</div>
```

⚠ **The first draft of that leg failed for the wrong reason and was rewritten.**
It located the option by its _name_ (`/^Mushroom Square,/`) and so failed on
`Received: 0` — i.e. because the new name was absent, which proves the leg can
tell new text from old and proves nothing about the defect. It now locates by the
option's _text_ (antd's `value`, unchanged by this fix) and leaves the name
assertion to discriminate. **This is round 4's lesson recurring, in a leg written
by the person who wrote that lesson down.**

A negative control pins the accepting side: an unbadged theme (`Material You`)
must gain **neither** field — `toHaveAccessibleName('Material You')` and
`toHaveAccessibleDescription('')` — so the leg cannot pass by decorating
everything.

---

## R6-N1 — CONFIRMED, documentation only

Both comments corrected:

1. The R5-N1 docblock said the visible-container count is _"the only assertion
   that discriminates"_, contradicting its own inline record, the round-5
   response and the `cfb82db` message — all three say the count **passed** on
   defective source and is a **control**, and that the parent-tooltip-text
   assertion is the falsifier. The measurement wins.
2. The compact leg's message said the name must be _"the sentence, not the
   three-word label"_, which `832039b` had already made false by deliberately
   making it label **plus** sentence for WCAG 2.5.3.

⚠ **A third member, created by this round's own fix and not in the finding.** The
non-compact leg was labelled "half control, half red" on a round-5 measurement of
an instrument this round replaced. Re-measured against `baa5313` with the new
Tab helper: **every assertion in it now passes on old source**, so it is a **pure
control** and is relabelled. _A leg's red/control status is not only a
measurement rather than a label — it also decays, and must be re-measured
whenever its instrument changes._

**Class sweep.** The class is _every declaration of a test leg's red/control
status on the surface this PR changed_. Population source:
`git diff --name-only 6bf5f62..HEAD` (32 files) plus the new untracked file, plus
the live PR body and title, which no `git diff` can reach. Swept wrap-proof —
whitespace, markdown quote markers and JSDoc leading stars normalised before
searching, because prose wraps and a line grep found one member where a
wrap-proof pass found four in round 5. **104 status declarations across the 33
branch files; all in `tests/integration/theme-no-effect-badge.spec.ts` (31) and
`tests/unit/themeBadge.spec.ts` (12) — the other five test files carry none.**
Three needed correcting, all above. The round-1–5 review documents carry status
declarations too; those are historical records of what was measured at the time
and are correct as records, so they are left alone.

---

## The PR body

Round 6 flagged that the body _"still repeats the now-disproved claims"_. Split,
because only one of the two is disproved:

- _"The four `labelRender` badges are now real tab stops"_ — **true, and now
  measured by real Tab traversal.** Kept, with the evidence.
- _"All eight now expose the sentence rather than the label"_ — **false for the
  four option rows**, for the hidden-listbox reason above. Corrected.

---

## Evidence

All runs headless, `--workers=1`, sequential, with a `ps -ef | grep playwright`
preflight showing no live run before each.

| Run                                                         | Result                                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **RED**, badge spec on `baa5313` `src/`                     | **REAL_EXIT=1 — 1 failed / 19 passed.** The AX leg is the only failure, on `toHaveAccessibleName` |
| **LIVE-CHECK**, the three keyboard legs on `6eb47d8` `src/` | **REAL_EXIT=1 — 3 failed**, on the Tab helper's own assertion                                     |
| **GREEN**, badge spec at the committed head                 | **REAL_EXIT=0 — 20 passed**                                                                       |
| `./tools/checks`, re-run AFTER committing                   | see the Workflow State block                                                                      |

Sources restored `sha256sum -c` **OK** for all four files after every revert
cycle, `git status --porcelain` showing only the intended edits and
`git diff --cached` **empty** — the round-5 trap where `git checkout <sha> --`
stages a revert was checked for explicitly each time, not assumed.

**The badge spec is now 20 legs (was 18).** A full integration run would
therefore read **254**; nobody has measured that.

## NOT MEASURED

**Full integration and full e2e were NOT RUN**, under the owner's standing
narrowing, which he set for round 6 and described as still in force. ⚠ He has
not stated a scope for round 7; that is his to set, and this document should not
be read as having assumed it. The standing record remains round 5 at `0e8ca23`:
integration exit 0, **231 passed / 19 skipped of 250**; e2e exit 1, **316 passed
/ 7 failed / 2 skipped of 325**, all seven canonical, no new family. That record
is **not** evidence for this head.

Still unmeasured by anyone across six rounds: dark-mode rendering, tooltip
clipping, long-name truncation, and **any physical screen reader**. The evidence
here is Chromium's accessibility tree and Playwright's accessible-name
computation — two independent implementations that agree, which is stronger than
one, and still not a reader. `Shift+Tab` is now measured, having been on that
list for six rounds.

ⓘ `apexcharts.visual:26` has measured 3,126 / 3,341 / 3,261 / 3,285 / 3,384
differing pixels across five rounds, rising in the last three. Flagged six times,
never diagnosed. Not touched here.

## MemPalace drawer candidates

Round 6's four candidates are carried forward; the two `practice`-wing ones are
**raised, not filed**, per the owner's standing hold. Both need amending against
what was measured this round:

- **HAVDM decision** — supersede the round-5 accessibility outcome. ⚠ Amend: the
  round-5 drawer's claim that all four collapsed badges are keyboard-reachable is
  **correct**; only its claim that all eight contexts expose the sentence is
  false.
- **`practice`** — _programmatic focus is not Tab-order evidence._ Stands, and
  gains a clause: **the converse is also a trap — a Tab probe measures a
  DIRECTION, so state which element you started from and which way you went, or
  a correct measurement will support a false conclusion.**
- **`practice`** — _a DOM `aria-label` is not computed-name evidence._ Stands,
  but ⚠ **its stated reason must not be "the browser ignores prohibited
  attributes", because Chromium does not.** The durable form is: _a name that is
  computed is not thereby a name that is REACHED — ask which node the assistive
  API actually visits, because a widget may render a separate accessibility tree
  from the one you are decorating._
- **HAVDM testing** — reconcile red/control prose with measured old-source
  behaviour, plus this round's addition that the status **decays** when the
  instrument changes.
