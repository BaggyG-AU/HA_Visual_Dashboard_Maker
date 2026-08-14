Author: Claude Opus 5 (round-6 fix and this commission)
Reviewer: OpenAI Codex (GPT-5), independent, authored rounds 1–6 and no fix
Owner gate: BaggyG-AU decides whether PR #142 proceeds and is the only person who merges it

# Round-7 review commission — F3 "no preview colours" badge (PR #142)

Review `380f05a` on `feature/f3-theme-canvas-badge`. `main` = `6bf5f62`.

## §0 — What is different about this round, and it is not a small thing

⚠⚠⚠ **THE AUTHOR IS REJECTING ONE OF YOUR TWO BLOCKING FINDINGS.** R6-M1 is
answered **FALSE**, with measurements, and no `src/` change was made for it.
**Adjudicating that rejection is this round's first job.** If the rejection is
wrong, #142 must not merge; if it is right, the round-6 review's own probe
carried an unstated property and that is worth recording as carefully as any
product defect.

The precedent is on the record and cuts the author's way only if the evidence
holds: on PR #137 round 6 an author reopened a finding the reviewer had marked
RESOLVED, and the reviewer ruled the reopening **proper and not scope
overreach**. That ruling turned on evidence, not on standing. **Apply the same
bar here, in the opposite direction.**

⚠ **Do not soften findings because the author pushed back.** If R6-M1 survives
your re-measurement, say so plainly and the author will fix it.

## §1 — Round-6 dispositions to check

| #                                                      | Author's verdict                          | What to check                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R6-M1** — collapsed badges skipped by sequential Tab | **REJECTED as FALSE**                     | The badge renders into `.ant-select-content-value`, which **precedes** the combobox `<input>` (`compareDocumentPosition` → "input FOLLOWS badge"). Tabbing forward _from the combobox_ walks away from it. `Shift+Tab` from each combobox lands **on** the badge; forward `Tab` from each badge's true predecessor does too, at all four hosts. **Re-measure this yourself, in both directions.** |
| **R6-M2** — option Tags omit the qualification         | **CONFIRMED, mechanism corrected, fixed** | Your stated reason (WAI-ARIA prohibits naming on `generic`, so the browser ignores `aria-label`) is answered **false as measured** — Chromium computes it. The real reason is antd's separate hidden 0×0 `role="listbox"`. Fix is in `buildThemeOptions`, not the badge.                                                                                                                          |
| **R6-N1** — contradictory red/control prose            | **CONFIRMED, fixed, swept**               | Two comments corrected, plus a third the fix round itself created.                                                                                                                                                                                                                                                                                                                                |

## §2 — The evidence you are asked to attack

- `docs/reviews/f3-theme-canvas-badge-author-response-round6.md` — the triage.
- `src/features/theme-manager/themeBadgeCopy.ts` — **new**; the two user-facing
  strings and their binding docblock.
- `src/features/theme-manager/themeOptions.ts` — `themeOption()` and the two
  `aria-*` fields on `ThemeOption`.
- `src/components/ThemeNoEffectBadge.tsx` — now re-exports the strings.
- `tests/integration/theme-no-effect-badge.spec.ts` — **20 legs**;
  `expectReachableByTab`, and the leg "a badged option exposes the qualification
  to assistive technology".

**Grep the symbols; do not trust line numbers.** That rule has bitten this PR
four times.

## §3 — Hypotheses. These are the author's weakest claims, published deliberately.

⭐ **The author ran every one of these against his own work before sending this,
and two of them found real defects, both already fixed and disclosed in §5.**
The list is a floor, not a ceiling.

| #             | Hypothesis to attack                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1** ⭐⭐⭐ | **The R6-M1 rejection is wrong.** Attack the standard, not just the numbers: is "reachable by forward `Tab` from its true predecessor" the right test for "keyboard-reachable"? Measure with the **dropdown OPEN** — the author measured only with it closed, and that is a named gap. Try Shift-Tab from elsewhere, an RTL layout, and the settings modal's focus trap. **If any real user path cannot reach the badge, R6-M1 stands and the author is wrong.** |
| **H2** ⭐⭐⭐ | **`aria-description` is the wrong mechanism.** It is comparatively new; Chromium computes it, but reader support varies and the author measured **no physical screen reader**. If NVDA/JAWS/Orca ignore it, the qualification is lost again and the fix is cosmetic. Is `aria-describedby` to a visually-hidden node, or folding the sentence into the name, more defensible?                                                                                    |
| **H3**        | **The hidden listbox renders only three options** (active ±1). The author measured the mechanism at two different active indices (one badged, one not) and read `renderItem` as applying `pickAttrs` uniformly. **Verify by arrowing through a long list** that every badged option carries both fields wherever it lands.                                                                                                                                       |
| **H4**        | **The option's accessible name now diverges from its visible row.** Visible: "Mushroom Square" plus a Tag reading "no preview colours". Accessible: "Mushroom Square, no preview colours". Is that a WCAG 2.5.3 problem in the other direction, or a duplication a reader will voice twice?                                                                                                                                                                      |
| **H5**        | **The change alters option accessible names, and DSLs elsewhere use `getByRole('option', { name })`.** The author checked that no theme selector does (all use `[title=…]`, from the untouched `label`) and documented the trap. **Verify that enumeration** — a missed consumer is a silent breakage outside the seven targeted specs.                                                                                                                          |
| **H6**        | **`src/features/` must not depend on `src/components/`** is the stated reason the strings moved. Is that boundary real and stated anywhere binding, or was it invented to justify a refactor inside a fix round? **Over-reach is a live risk here** — a new file appeared in a round whose findings were about accessibility.                                                                                                                                    |
| **H7**        | **The `__none__` sentinel and unbadged themes must gain neither `aria-*` field.** The author asserts this structurally (literal sentinel; early return in `themeOption`) and pins it with a control leg. Try to construct an option that acquires the fields when it should not — a saved theme named `__none__`, an override-prefixed value, a theme badged in one mode and not the other.                                                                      |
| **H8**        | **`expectReachableByTab` was proved live against `6eb47d8`.** Is that the right known-bad input, or does it prove only that a `tabIndex`-less element is skipped — something never in doubt? What input would distinguish "the badge is in the tab order" from "the helper finds _something_ named `theme-no-effect-badge`"?                                                                                                                                     |
| **H9**        | **Reach.** `themeOptions.ts` feeds four Selects, and its option objects changed shape. Full suites were not run. **Name any spec outside the commissioned eight you would add**, and say why — do not run full suites to prove it.                                                                                                                                                                                                                               |
| **H10**       | **Still unmeasured by anyone in six rounds:** dark-mode rendering, tooltip clipping, long-name truncation, any physical screen reader. `Shift+Tab` came off that list this round. Is any of these now blocking rather than deferrable?                                                                                                                                                                                                                           |

## §4 — Previously clean areas to recheck

The six-field boundary and mode selection; fixture fidelity
(`tests/fixtures/realHaThemes.ts`); option identity and collisions (the
`theme:` namespacing and the `__none__` sentinel); built-in themes; the
import-cycle boundary — **now materially changed by the new module, so recheck
it properly rather than by diff**; render guards and the eight-context
population; the affected-spec population.

## §5 — What the author's own run of this commission found, disclosed unweakened

Two defects, both fixed before sending:

1. ⭐⭐ **A false claim that had already reached four surfaces.** The author wrote
   that the strings moved _"verbatim, unchanged"_ with their binding docblock.
   **The string constants did move byte-identically (sha256 against `baa5313`),
   but one docblock sentence was adapted** — "This one component renders in
   EIGHT contexts" → "One component renders this string in EIGHT contexts",
   because outside the component the referent does not exist. The edit is
   correct; the claim was not, and it had reached the response document, the
   component's own comment and **two MemPalace drawers** before H6's check
   caught it. All four corrected.
2. **The `getByRole('option', { name })` trap** (H5) was undocumented. Now named
   in `ThemeOption`'s docblock.

⚠ **Neither was found by reading the diff.** Both came from running a check.

## §6 — Test scope

⚠ **THE OWNER SETS THIS ROUND'S SCOPE AND HAS NOT YET DONE SO.** He narrowed
round 6 to the gate plus eight specs and described that narrowing as still in
force; **he has not stated a scope for round 7, and this commission does not
assume one.** Unless he says otherwise, run:

1. `./tools/checks` — the gate.
2. `tests/integration/theme-no-effect-badge.spec.ts` — **20 legs now**.
3. `--project=electron-integration`: `theme-integration.spec.ts`,
   `theme-integration-mocked.spec.ts`.
4. `--project=electron-e2e`: `theme-manager.spec.ts`, `theme-restore.spec.ts`,
   `theme-chrome.spec.ts`, `offline-local-content.spec.ts`,
   `smart-actions.spec.ts`.

**Say "NOT MEASURED" for the full suites** and cite the standing record: round 5
at `0e8ca23` — integration exit 0, 231 passed / 19 skipped of 250; e2e exit 1,
316 passed / 7 failed / 2 skipped of 325, all seven canonical. **Never write
"held".** ⓘ The badge spec grew 18 → 20, so a full integration run would now read
**254**; nobody has measured that.

⭐ **This may be the last round before merge, and full suites have been unmeasured
since `0e8ca23`.** If you think that is now the binding risk rather than anything
in §3, say so in §7 — it is the owner's call, not yours or the author's.

## §7 — The question for the owner

**Is PR #142 done?** Answer (a) ship it, (b) a specific defect remains — name it,
or (c) something about the slice's scope is wrong. Round 6 answered (b) and named
two defects, one of which the author has now rejected. **If you answer (b) again,
say whether the remaining defect is worth a seventh fix round on an interim badge
that has already had six.**

## §8 — Disciplines

- **You are the independent reviewer. Do not edit `src/` or tests**; land your
  review as its own document.
- **Verify each finding against the source AND the rendered DOM**, quote
  `path:line`, and **state the class you swept and the key you swept it with**.
- ⚠ **A check is evidence only for the property it exercises — and that applies
  to your own probes.** Round 6 is the case study: four correct measurements, one
  unstated property (direction), one false blocking finding.
- ⚠ **Scope an option locator to the OPEN dropdown**
  (`.ant-select-dropdown:not(.ant-select-dropdown-hidden)`); a second antd popup
  stays mounted behind the settings modal.
- **Everything headless:** `bash tools/test-headless.sh <spec…>
--project=electron-e2e|electron-integration --workers=1`. Check
  `ps -ef | grep playwright` before any run. **Never a full suite.**
- **Report the REAL exit code**, and check the failure _reason_, not just the
  code.
- **MemPalace drawer candidates** go in a section at the end of your review file;
  the write-enabled author files them with `added_by="codex"` under ruling
  MP-LEASE.
