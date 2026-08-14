Author: Claude Opus 5 (`cfb82db`, `aeceb01`, `832039b`, and `6170ad6`; PR #142 round-5 fix, follow-ups, and round-6 commission author)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; authored rounds 1–5 and did not author any fix
Owner gate: BaggyG-AU decides whether PR #142 proceeds and is the only person who merges it

# Independent review — F3 “no preview colours” badge, round 6

## Round-5 disposition

| Round-5 finding                                                        | Disposition            | Round-6 result                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R5-M1** — “colours HAVDM's canvas … read” exceeded the predicate     | **RESOLVED**           | The shipped sentence now binds “sets none” to the six colour values returned by `getThemeColors`, and the concession expressly includes colours used by canvas cards and editors. The predicate, mapper, canvas consumer, Preview-panel consumer, source prose, tests, live PR title, and live PR body were re-read. I found no remaining material falsehood in this wording.                                                             |
| **R5-M2** — the qualification was available only through pointer hover | **PARTIALLY RESOLVED** | The four collapsed badges now accept programmatic focus and open their tooltip on focus, and compact icons have a computed name containing the qualification. However, actual sequential Tab navigation skips all four collapsed badges. The four option-row `Tag`s also do not expose the qualification in their computed accessible name: `aria-label` is prohibited and ignored on their implicit `generic` role. See R6-M1 and R6-M2. |
| **R5-N1** — the header badge was nested inside a second tooltip        | **RESOLVED**           | The parent `Tooltip` is removed, the Select retains the name “Select theme for preview,” and badge hover now summons no parent-tooltip text. The old-source run fails on the parent-text assertion for the intended reason. The remaining count assertion is only a control, notwithstanding contradictory prose above the test; that prose is R6-N1.                                                                                     |

## Verdict

**CHANGES-REQUIRED — high confidence.**

My answer to “Is PR #142 done?” is **(b): not yet**. The copy is now small,
bounded, and supportable, and the badge does not need to be pulled. Two specific
accessibility defects are worth one more focused round: keyboard users cannot
Tab to any collapsed badge, and assistive technology does not receive the
qualification from any option-row badge. Both are local interaction/semantics
problems; neither requires the out-of-scope canvas fidelity contract.

The rising-round diagnosis is a **scope-control and evidence-validity failure**,
not an instance-by-instance call-site sweep failure. The round-5 implementation
put the shared behavior at all intended sites, but its evidence equated
`locator.focus()` with sequential Tab navigation and equated the presence of an
`aria-label` DOM attribute with the browser's computed accessible name. Those
checks passed without exercising the claims they were said to prove.

## Findings

### R6-M1 — BLOCKING: all four collapsed badges are skipped by sequential Tab navigation

The shared component conditionally writes `tabIndex=0` and enables the
focus-triggered tooltip at
`src/components/ThemeNoEffectBadge.tsx:199-210`. The four collapsed-value call
sites pass `focusable`: the header at
`src/components/ThemeSelector.tsx:94-100`, and settings, saved-theme, and
view-override Selects at
`src/components/ThemeSettingsDialog.tsx:392-399,495-502,550-557`.

That does make each badge programmatically focusable. It does **not** put these
descendants of antd Select's rendered value into the browser's sequential focus
order. In the real Electron renderer I started at each owning combobox and sent
`Tab`. Focus moved as follows:

| Collapsed context           | Element reached after `Tab`       |
| --------------------------- | --------------------------------- |
| Header theme Select         | `theme-dark-toggle` switch        |
| Theme Settings theme Select | `theme-settings-mode` radio input |
| Saved-theme Select          | `theme-manager-load` button       |
| View-override theme Select  | `theme-manager-view-clear` button |

In every context, focus skipped `theme-no-effect-badge`; consequently its
focus-triggered explanation did not open. This is the exact user path R5-M2
required.

The committed tests cannot detect the defect. The compact leg asserts the
attribute and then calls `badge.focus()` at
`tests/integration/theme-no-effect-badge.spec.ts:171-188`; its comment claims
that `.focus()` drives the DOM “the way a Tab key would land” at `:176-178`.
The noncompact leg repeats the same pattern at `:274-290`. Programmatic focus
does land and opens the tooltip, but that is a different behavior from
sequential keyboard reachability.

**Class sweep.** I defined the class as every collapsed Select value containing
a focusable badge, then read every `labelRender` call rather than searching only
for `compact`. The class closes at the four contexts above: three compact icons
and one noncompact Tag. I measured actual Tab traversal at all four; all four
failed in the same way. No fifth `labelRender` badge exists in `src/`.

Repair the keyboard path at the Select interaction level rather than relying on
a nested `tabIndex`. Possible designs include attaching the explanation to the
combobox as an accessible description, or placing a genuine adjacent
focusable tooltip trigger outside the Select's selected-value subtree. Preserve
the Select's normal listbox keyboard model and add tests that send `Tab` from a
real preceding focus target and assert the resulting active element.

### R6-M2 — BLOCKING: option-row Tags do not expose the qualification in their accessible name

The noncompact arm is an antd `Tag` with no explicit role and with
`aria-label={ACCESSIBLE_NAME}` at
`src/components/ThemeNoEffectBadge.tsx:219-228`. In the rendered DOM that Tag is
a `span` with the implicit `generic` role. WAI-ARIA prohibits author naming on
`generic`, including `aria-label` and `aria-labelledby`; the browser therefore
does not use this attribute as the Tag's accessible name. See the normative
[`generic` role definition](https://www.w3.org/TR/wai-aria-1.2/#generic).

The Electron accessibility snapshot confirms the consequence. A noncompact Tag
exposes an `img` named “info-circle” and visible text “no preview colours”; it
does not expose the long qualification. This remained true when the collapsed
Tag was programmatically focused and its tooltip was open. By contrast, the
compact `InfoCircleOutlined` has `role="img"` and its snapshot contains the full
prefixed name, so this is role-specific rather than an `aria-label` failure in
all forms.

All four option renderers use the affected noncompact arm:
`src/components/ThemeSelector.tsx:85-92` and
`src/components/ThemeSettingsDialog.tsx:383-390,486-493,541-548`. Their badges
are intentionally not tab stops and use a hover-only tooltip, so the missing
computed name also removes the only claimed non-pointer route to the
qualification. The saved-theme option's accessibility snapshot contained its
option text, the generic info-icon name, and “no preview colours,” but not the
sentence that bounds the claim.

The committed assertions at
`tests/integration/theme-no-effect-badge.spec.ts:207-225,292-295` read the raw
`aria-label` attribute and call it the accessible name. They therefore stay
green when the browser ignores that attribute. The reported two-test red
against `aeceb01` proves only that the attribute string gained the visible-label
prefix; it does not demonstrate that `aeceb01` had a WCAG 2.5.3 Label-in-Name
defect or that `832039b` changed the computed name. The option Tag's visible
content was already exposed as text in the accessibility tree.

**Class sweep.** I defined the class as every badge whose accessibility relies
on `ACCESSIBLE_NAME`, split it by rendered role, and inspected browser
accessibility output for both arms. The compact role-img arm accepts its name.
The noncompact generic Tag arm ignores it. That arm appears in all four option
rows and in the one noncompact collapsed value, so the defect is not confined
to the sampled saved-theme option. The collapsed instance can acquire
`aria-describedby` while its focus tooltip is open, but R6-M1 prevents normal
Tab access; option rows have neither that focus route nor the qualification in
their name.

Use semantics that support the intended name/description, and test the computed
accessibility tree rather than the attribute. For noninteractive visible text,
leaving “no preview colours” as the name and attaching the qualification as a
description is less duplicative than putting both into the name. If a tooltip
remains the mechanism, its trigger/description relationship should follow the
[ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/),
including `aria-describedby`, focus reachability, and Escape dismissal.

### R6-N1 — NON-BLOCKING: the R5-N1 test contradicts its measured red/control status

The test docblock says the visible-container count is “the only assertion that
discriminates” at
`tests/integration/theme-no-effect-badge.spec.ts:311-313`. The same test's
inline record at `:330-352` says the opposite: the count passed against old
source and is a control, while the parent-tooltip text assertion is the
falsifier. The old-source run confirms the latter account, as do
`docs/reviews/f3-theme-canvas-badge-author-response-round5.md:181-190` and the
`cfb82db` commit message. The executable test is sound; its outer explanation
is not.

**Class sweep.** I searched the changed test and review prose for declarations
of red legs, controls, discrimination, and passing old source, then reconciled
each against the recorded old-source results. This contradiction is confined to
the R5-N1 block. A nearby compact-leg message at
`tests/integration/theme-no-effect-badge.spec.ts:190-194` also says the name
must be “the sentence, not the three-word label,” although `832039b` deliberately
changed it to label plus sentence. Correct both comments so future evidence
reviews do not inherit mutually exclusive claims.

## Commission hypotheses and negative cases

| Hypothesis / requested attack                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1 — distributive versus union wording**       | **No issue found.** In ordinary context, “the six colour values HAVDM maps to its canvas and Theme Preview panel” identifies one six-value set and the two consumers collectively. The predicate reads six values (`src/features/theme-manager/themeOptions.ts:93-96`; `src/services/themeService.ts:87-104`), the canvas root uses two (`src/App.tsx:491-501`), and the panel reads the set (`src/components/ThemePreviewPanel.tsx:39-68`). “Across” would be more explicit but is not required to make the current sentence true. |
| **H2 — “maps,” “six,” and user reachability**    | **No issue found.** “Maps” describes the implementation without promising direct user inspection, and “six” usefully bounds the predicate instead of reviving the broader canvas claim. Naming six internal keys would lengthen the tooltip without changing the user's decision. The explicit concession supplies the material limitation.                                                                                                                                                                                         |
| **H3 — role on the focusable compact icon**      | **Issue folded into R6-M1; no independent role defect found.** `role="img"` correctly accepts the computed name and does not falsely promise activation. `role="button"` would be wrong absent an action. The unusual part is the ineffective nested keyboard stop. A description on a reachable trigger is preferable to placing all explanatory prose in the name.                                                                                                                                                                |
| **H4 — duplicate Tag announcement**              | **Different issue: R6-M2.** The accessibility snapshot did not announce the long label twice; it ignored the Tag's `aria-label`. That avoids duplication only by losing the qualification. The compact icon's name is effective; the two arms need not use the same naming mechanism.                                                                                                                                                                                                                                               |
| **H5 — affordance removed with parent tooltip**  | **No issue found.** Removing the overlapping parent tooltip resolves R5-N1. The Select retains a visible current value/placeholder and an accessible name at `src/components/ThemeSelector.tsx:63-83`; no second sighted hover hint is required. The trade is deliberate and recorded.                                                                                                                                                                                                                                              |
| **H6 — only three of eight contexts measured**   | **Issue: R6-M1 and R6-M2.** Shared-component equivalence is valid for rendering, but not proof of host-level Tab order or computed option naming. I measured Tab traversal at all four collapsed hosts and inspected both rendered badge roles.                                                                                                                                                                                                                                                                                     |
| **H7 — six `RETRACTED_CLAIMS` substrings**       | **No issue found.** The list is a loud future false-positive risk, especially for generic English such as “stay as they are,” but it cannot silently certify the current claim and is not product behavior. Current and historical usages are distinguishable. Keep treating it as a regression alarm, not semantic evidence.                                                                                                                                                                                                       |
| **H8 — long docblocks**                          | **Issue: R6-N1.** The component's compact/focusable arithmetic and eight-context instructions are internally consistent after `aeceb01`. The test contains the red/control contradiction and one stale accessible-name message identified above.                                                                                                                                                                                                                                                                                    |
| **H9 — targeted test population**                | **No missing spec found.** Source-to-test impact tracing of the three changed components, their DSL consumers, selector structure, theme rendering, and direct text/test-id references produced the commissioned union of eight specs. The owner-directed narrowing is an evidence boundary, not proof that unrun suites are safe.                                                                                                                                                                                                  |
| **H10 — dark mode, clipping, and screen reader** | **UNVERIFIED where specified.** The gate exercises the unit dark-mode predicate case, but no dark visual interaction, tooltip clipping, long-name layout, or physical screen reader was measured. Browser accessibility snapshots—not a physical reader—establish R6-M2. Escape dismissed the focus-opened tooltip cleanly in Electron.                                                                                                                                                                                             |

Additional negative cases measured in the real renderer were actual Tab
traversal at all four collapsed contexts, accessibility snapshots for both
badge arms and an option row, and Escape after programmatically opening a
focus-triggered tooltip. I did not infer Shift-Tab, dropdown-open focus,
simultaneous tooltips, long-name clipping, or physical screen-reader behavior
from those checks.

## Previously clean areas rechecked

### Six-field boundary and mode selection

No regression found. `definesNoCanvasColors` still delegates to the shipped
six-field mapper and requires all six values to be absent
(`src/features/theme-manager/themeOptions.ts:78-96`). Light/dark merging and the
six returned fields remain at `src/services/themeService.ts:87-104`. The gate
includes the existing one-field and dark-mode unit cases.

### Fixture fidelity

No repository regression found. `tests/fixtures/realHaThemes.ts` is unchanged
from `6eb47d8`. I did not contact or mutate the read-only reference Home
Assistant instance, so remote freshness was not re-established.

### Option identity and collisions

No issue found. The reviewed commits do not change the theme option value
scheme, saved-theme lookup, override namespaces, or collision controls. Plain
theme names remain the store/export identity and override prefixes remain local
presentation identities.

### Built-in regression

No issue found. `tests/unit/builtInThemes.spec.ts` and the production predicate,
mapper, canvas, and Preview-panel consumers are unchanged in
`6eb47d8..6170ad6`; the scoped `git diff --exit-code` returned 0.

### Import-cycle repair

No issue found. The reviewed commits add no service import to the badge or
selector components and do not disturb the earlier pure option-builder
boundary. Typecheck passed in the gate.

### Render guards and context population

No missing or extra product context found. Full JSX reading found exactly four
`optionRender` and four `labelRender` badge calls. All remain guarded by
`definesNoCanvasColors`; three collapsed forms are compact and the settings
form is deliberately noncompact. R6-M1 and R6-M2 concern interaction and
semantics within that intact population.

### Affected-spec population

No ninth affected spec was found. I re-derived the population from the changed
component imports, DSL/test-id consumers, theme selector behavior, and theme
rendering effects, then read the textual candidates. The resulting union is the
commissioned badge spec plus the seven named integration/e2e specs. This is a
scope derivation, not a claim about unrun full suites.

### Gate and regression boundary

The exact owner-authorized gate and eight-spec population passed. Full
integration and e2e suites were **not run and are not measured at this head**.
The standing full-suite record remains the round-5 run at `0e8ca23`, not
evidence for `6170ad6`.

### Deliberate identifiers and fix scope

No issue found. `ThemeNoEffectBadge` and `theme-no-effect-badge` remain internal
historical identifiers while all user-facing text says “no preview colours.”
The reviewed fix stayed out of the canvas fidelity contract, HA-06 UAT, THEME-01
contrast work, `ThemeVars`, snapshots, immutable commit subjects, `[STATE]`, and
the read-only HA instance as required.

## Verification evidence and boundary

Repository state before review was branch `feature/f3-theme-canvas-badge`, HEAD
`6170ad6`, with an empty worktree. Live PR #142 was open, unmerged, non-draft,
and reported a clean merge state and successful CI; its head matched
`6170ad6`. The title is now bounded to themes that set none of HAVDM's six
mapped preview colours. The body still repeats the now-disproved claims that
collapsed badges are keyboard-reachable and option Tags carry the qualification
in their accessible name; the author should update it after the product fix.

The mandated runs were:

- `./tools/checks`: **exit 0, 4/4 steps** — lint 0 errors (145 warnings),
  formatting passed, typecheck passed, and unit passed 104 files / 1,413 tests.
  `tests/unit/themeBadge.spec.ts` ran inside this gate and was not run
  separately.
- `tests/integration/theme-no-effect-badge.spec.ts` under
  `electron-integration --workers=1`: **exit 0, 18 passed**.
- `theme-integration.spec.ts` and `theme-integration-mocked.spec.ts` together
  under `electron-integration --workers=1`: **exit 0, 7 passed**.
- `theme-manager.spec.ts`, `theme-restore.spec.ts`, `theme-chrome.spec.ts`,
  `offline-local-content.spec.ts`, and `smart-actions.spec.ts` together under
  `electron-e2e --workers=1`: **exit 0, 12 passed**.

Before every Electron run, the required process preflight found no existing
Playwright run. Focused reviewer probes were confined to the already authorized
badge spec and were removed afterward; no source or test change remains.

The current 18 badge tests run against only the `aeceb01` badge component gave
**exit 1, 2 failed / 16 passed**. Both failures were raw `aria-label` prefix
patterns, so they establish the string change but not a computed-name defect.
Against the three component files from `6eb47d8`, they gave **exit 1, 6 failed /
12 passed**: compact programmatic-focus attribute, noncompact
programmatic-focus attribute, parent tooltip, wording, inactive wording, and
pending wording. Each source file was restored byte-for-byte and the worktree
was clean. The new real-Tab and accessibility-tree probes are the falsifiers the
committed test lacks.

The owner explicitly narrowed this round to the gate and eight specs. That is
an **owner decision, not a safety claim**. Full integration would now have 252
tests because the badge spec grew from 15 to 18, but nobody measured that suite
at this head. Full e2e is likewise not measured. The standing `0e8ca23` record
is integration exit 0 (231 passed / 19 skipped across 250) and e2e exit 1 (316
passed / 7 canonical failures / 2 skipped across 325).

I did not measure dark-mode rendering, clipping, long-name truncation,
Shift-Tab, a physical screen reader, or production behavior outside Electron.
I made no `src/`, test, `[STATE]`, UAT, PR, merge, or reference-HA mutation.

## MemPalace drawer candidates

- **HAVDM decision/outcome — supersede the round-5 accessibility result:** the
  current round-5 drawer says all four collapsed badges are keyboard-reachable
  and all eight contexts expose the sentence. Real sequential Tab skips all
  four collapsed badges, and the generic option Tags omit the qualification
  from the browser accessibility tree. File with `added_by="codex"` after the
  fix disposition is known.
- **Practice — programmatic focus is not Tab-order evidence:** a test that calls
  `.focus()` proves only programmatic focusability. A sequential-keyboard claim
  needs a real preceding focus target, a `Tab`/`Shift-Tab` action, and an
  assertion on the destination.
- **Practice — a DOM `aria-label` is not computed-name evidence:** naming
  depends on the element's role and its permitted Name From sources. Inspect the
  browser accessibility tree and the role's naming rules; a present attribute
  may be prohibited and ignored.
- **HAVDM testing — reconcile red/control prose with measured old-source
  behavior:** in the R5-N1 leg the parent-text assertion is the falsifier and
  the visible-container count is a control. Update both contradictory docblocks
  in the same fix.
