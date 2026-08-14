Author: Claude Opus 5 (`c1acb52`, PR #142 implementation author)
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author the implementation
Owner gate: BaggyG-AU reads PR #142 and this review together; only the owner signs off and merges PR #142

# Independent review — F3 canvas-theme “no preview effect” badge, round 1

## Verdict

**CHANGES-REQUIRED — high confidence.**

The six-field predicate is internally consistent with the two consumers the
author counted, the captured reference-instance population is current, and the
required gates and focused rendering tests reproduce. The consumer population
is incomplete, however. HAVDM publishes every theme key onto the canvas, and a
bundled Swiper stylesheet consumes inherited custom properties there. I
measured a theme defining only `swiper-theme-color`: the current predicate
badged it “no preview effect” while the real carousel controls changed colour.
That is a direct false-positive product claim. Two additional controls can also
apply themes without rendering the badge. Both findings are blocking.

## Scope and independent starting account

I reviewed content commit `c1acb52b7597949ddcb2bb3533f1f55ee5bcd0fd`
against `main` at `6bf5f62`, on branch `feature/f3-theme-canvas-badge`. The
worktree was clean; the branch had one content commit and the expected 11-file
diff.

Before reading the author’s commission, self-check, measurements, or explanatory
docblocks, I stripped comments from and traced:

1. `buildThemeOptions` and its `Object.values(colors).every(value => !value)`
   predicate;
2. `getThemeColors` and its six returned fields;
3. both direct callers of `getThemeColors` — the canvas’s background/text pair
   and all six `ThemePreviewPanel` swatches; and
4. every source caller of `buildThemeOptions` and every Select in the two theme
   components.

That first pass supported six rather than two fields if the visible-effect
population really ended at those two direct function callers: a one-field theme
can leave the canvas unchanged while adding a preview-panel swatch. The later
runtime-consumer sweep disproved the population premise, not that local union.

I did not change `src/`, tests, UAT material, `[STATE]`, the PR body, or the
reference Home Assistant instance. Temporary reviewer probes were deleted and
the worktree was returned clean before this document was created.

## Findings

### M1 — BLOCKING: bundled canvas descendants consume theme variables outside the six-field predicate

**Evidence.** `applyThemeToElement` publishes every string-valued theme entry as
an inline CSS custom property on the canvas element
(`src/services/themeService.ts:23-39`). The supported type explicitly allows
additional custom variables (`src/types/homeassistant.ts:66-84`). The canvas can
render `SwiperCarousel` (`src/components/BaseCard.tsx:759-763`), whose source
imports Swiper’s styles (`src/features/carousel/SwiperCarousel.tsx:2-19`) and
whose Swiper element is a canvas descendant (`:267-322`). The built renderer CSS
contains 28 distinct `var(--swiper-…)` consumers, including
`--swiper-theme-color`, `--swiper-navigation-color`, and
`--swiper-pagination-color`.

I exercised the full route in Electron with a constructed, type-valid theme:

```ts
{
  'swiper-theme-color': 'rgb(255, 0, 0)'
}
```

It defines none of the six `getThemeColors` fields. The current picker therefore
rendered `theme-no-effect-badge` for the option. In the same run, the real
Swiper next-arrow’s computed colour changed from `rgb(0, 122, 255)` to
`rgb(255, 0, 0)`, and its inherited `--swiper-theme-color` changed from
`#007aff` to `rgb(255, 0, 0)`. The probe passed its assertions, exited 0, and was
deleted.

**Impact.** The user-facing statement “no preview effect” is false for a
supported theme shape and a shipped canvas card. This is the dangerous direction
the implementation says it avoids: a false badge, not a conservative missing
badge. The `grep -rn 'var(--' src/` premise cannot enumerate styles imported
from dependencies; at current head it also returns four comments, not the
published two.

The real-instance finding remains valid but bounded: the recaptured five-theme
fixture has no key matching a built-runtime custom-property consumer, and four
of those five define none of the six mapped colours. That one instance does not
establish the general badge claim.

**Required correction.** Either narrow the badge to the fact the predicate can
actually establish (for example, “no mapped preview colours”), or expand the
mechanism so “no preview effect” covers runtime canvas consumers. Add a
fail-against-current regression using a Swiper-only theme and a rendered
carousel. This does not require pretending a source-only grep is a complete
canvas fidelity contract.

**Class swept.** I checked direct TypeScript consumers, source CSS imports, the
built renderer’s custom-property consumers, component ancestry, the supported
theme shape, all five captured themes, and a real rendered counterexample. The
bundle contains 270 distinct CSS-variable references; 28 Swiper references are
definitely reachable below the themed canvas. Monaco variables are bundled but
its settings editors are not canvas descendants, so I did not count those as a
second demonstrated product path.

### M2 — BLOCKING: two theme-application controls omit the badge by accommodating existing text matchers

**Evidence.** The semantic population is every UI control whose completed action
selects the effective preview theme. There are four:

| Application path                         | Effect                                                                                           | Badge |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ | ----- |
| Header `theme-select`                    | Calls `setTheme` directly                                                                        | Yes   |
| Settings `theme-settings-select` + Apply | Calls `setTheme`                                                                                 | Yes   |
| `theme-manager-saved-select` + Load      | `loadSavedTheme` sets the base/current theme (`src/store/themeStore.ts:366-400`)                 | No    |
| `theme-manager-view-override`            | `setViewOverride` immediately re-derives the effective theme (`src/store/themeStore.ts:505-528`) | No    |

`ThemeSettingsDialog` builds flag-bearing `themeOptions`, then gives them to the
view-override Select without `optionRender` or `labelRender`
(`src/components/ThemeSettingsDialog.tsx:203-225,425-442`). Its saved-theme
Select builds a second option shape that discards the flag and then applies the
chosen record through Load (`:137-152,213-218,396-413`).

The rendering test does not merely miss these surfaces; its docblock says they
“deliberately do NOT render the badge” so anchored matchers keep working
(`tests/integration/theme-no-effect-badge.spec.ts:111-121`). That derives the
product population from what the current tests can match. The commission’s
claim that there are “both theme pickers” and its search for a third rendering
surface therefore narrow the role after observing the implementation.

**Impact.** A user can load or apply a per-view inert theme through the Theme
Manager without receiving the feature’s warning. The same saved theme is marked
in the header and Active Theme Select, so the UX also disagrees with itself.

**Required correction.** Render the same truthful signal on every theme-
application control, or obtain an explicit owner ruling that narrows the
feature’s UX population. Preserve plain string labels, but update the DSL to
select by stable option identity/title rather than requiring the entire
rendered row to match `^name$`. Add integration legs for the saved-load and
per-view-override paths, including selected/collapsed state where applicable.

**Class swept.** I enumerated all Selects in `ThemeSelector` and
`ThemeSettingsDialog`, then traced their handlers through `setTheme`,
`loadSavedTheme`, `setViewOverride`, and `deriveEffectiveThemeState`. Import,
save, delete, and automatic HA sync do not independently select a theme through
an option control and are outside this finding.

### N1 — NON-BLOCKING: the checked-in and external evidence has drifted from the shipped test population

The current source grep returns four comment hits
(`src/App.tsx:483,3113`, `src/features/theme-manager/themeOptions.ts:13`, and
`src/components/ThemeNoEffectBadge.tsx:10`), while the current unit docblock and
commit message say it returns two. Two is the correct count on base, as the
commission’s base-qualified measurement states, but not at `c1acb52`.

The current red-leg reproduction is also **11 failed / 12 passed**, not the
commissioned and PR-body **9 failed / 12 passed**. All 11 failures are
behavioural and all 12 controls pass, so the test still discriminates. The
difference is consistent with two discriminating legs being added after the
published 21-test red run; the current 23-test state simply cannot reproduce the
still-prescribed historical count. The author self-check similarly records
three rendering legs while the shipped integration file has four.

These do not create another production defect, and this review supplies current
head evidence. Correct the current-head docblock and mutable PR evidence so the
next reader is not instructed to reproduce impossible counts. Amending the
historical commit message is not necessary if the PR body clearly distinguishes
the earlier test population from current-head reproduction.

### N2 — NON-BLOCKING: the `KNOWN-OPEN` test does not demonstrate the limit its prose claims

The test’s unresolvable value is truthy, so `ThemePreviewPanel.ColorSwatch`
renders the labelled row and literal `var(--does-not-exist)` text
(`src/components/ThemePreviewPanel.tsx:41-68`). Under the author’s own union of
canvas plus preview panel, that theme does have a visible effect. The assertion
that the option remains unbadged is conservative and correct; describing it as
an escape with “no visible effect” is not.

Empty strings are correctly badged: the canvas normalizes both selected colours
with `|| undefined` before its token fallback (`src/App.tsx:491-500`), and the
preview swatches return `null` for falsy values. `none`, `transparent`, and
whitespace remain unbadged and produce a truthy preview row, even where a CSS
paint value is invalid. Correct the test/doc prose. M1 is the demonstrated
counterexample that actually falsifies the shipped badge.

## Requested attack areas with no additional issue found

### Six-field boundary and mode selection

No additional issue found beyond M1 and N2. Within the direct-function-consumer
model, all six fields are the correct union: the canvas reads background/text
and `ThemePreviewPanel` renders all six. The one-field negative control is
load-bearing. Both production callers pass their relevant mode
(`darkMode` in the header and `localDarkMode` in settings), and the synthetic
mode-sensitive leg is the right instrument because the captured population has
no light/dark discriminator.

### Theme population and fixture fidelity

No issue found. The read-only `frontend/get_themes` recapture on HA 2026.7.4
matched all five fixture names and exact serialized content. Fixture and live
SHA-256 were both
`f90e81a1259ec4a5d25697507587ce1c2d4afd9bdc0abd8843aa5b999c7056be`;
the difference count was zero. Claims in source, PR body, and commit message
describe four of five themes on the reference instance rather than all HA
themes. M1 shows why that boundary matters.

### Option identity, collisions, and label rendering

No issue found for the two currently badged Selects. Option values come from
`Record` keys, and the saved arm excludes a name already present in available
themes. HA wins the store merge collision. `label` remains a plain string, so
antd’s title and existing restore selector survive, while `labelRender` looks up
the flag by unique value. A real theme named `__none__` would collide with the
pre-existing override sentinel, but this branch neither introduced nor
exercised that path and it does not change the M2 conclusion.

### Real themes, built-ins, saved themes, and malformed imports

No additional issue found. The four Mushroom definitions and Material You
fixture were inspected; Material You supplies all six in both modes, and the
four built-ins do likewise. Available-theme names take precedence over saved
collisions, while saved-only records get their own predicate evaluation.
Theme-manager import validation accepts object-shaped themes rather than
validating each value, but falsy values remain safe and truthy malformed values
are conservatively unbadged. The already-reported `ThemeVars` required-key
unsoundness is real, but reporting rather than fixing it is appropriate for this
slice.

### Rendering, accessibility, and text-dependent compatibility

No additional issue found beyond M2. The badge is visible in the dropdown and
selected value of the header picker and in the settings Active Theme picker;
the compact icon has an accessible label, and both forms carry the tooltip. The
focused integration spec passed all four current legs. Existing anchored
matchers reaching the two currently badged surfaces remain safe because labels
stay strings and the integration assertions use title. Matchers on the two M2
surfaces will need deliberate correction when those surfaces are fixed; test
stability is not a reason to omit product behavior.

### Import-cycle repair and built-in regression

No issue found. Moving `themeService` imports from the theme-manager barrel to
the leaf `types` and `storage` modules breaks the new cycle without changing
runtime behavior. `tests/unit/builtInThemes.spec.ts` is byte-unchanged from
base, and its independent run passed 14/14.

### Gate, watched flakes, and unrelated visual failure

No issue found. My full `./tools/checks` run passed with real exit 0 and all four
expected steps present. It reported 145 lint warnings and zero errors, clean
format/type checks, 104 test files passed, and 1,412 tests passed. The watched
`DeployDialog.spec.tsx` timeout did not fire. The branch does not change that
component or its test, and the documented watched-flake classification is
reasonable for this review.

The `advanced-slider.visual:16` baseline mismatch reproduced on exact base
source: expected `586x882`, received `586x818`; the focused test exited 1. That
failure is pre-existing and unrelated. Source identity against `6bf5f62` was
empty before the run, and restoration returned the tree clean.

## Required reruns and independent results

| Required rerun                                 | Real result                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `./tools/checks`                               | Exit 0; 4/4 steps; 104 files and 1,412 tests passed                                                      |
| `tests/unit/themeBadge.spec.ts`, deeper repeat | Five separate consecutive runs; each exit 0 and 23/23 passed                                             |
| Red leg with `src/` from `6bf5f62`             | Test exit 1; 11 behavioural failures and 12 passing controls; restore exit 0 and clean tree              |
| Base `advanced-slider.visual:16`               | Test exit 1 with the commissioned 882-vs-818 mismatch; exact base source and clean restoration confirmed |
| Read-only live fixture recapture               | Exit 0; five names identical, SHA-256 identical, zero differences                                        |

Additional focused evidence:

- the Material You/Mushroom computed-style probe exited 0 and reproduced
  Material You `rgb(238, 237, 244)` / `#eeedf4` while Mushroom remained
  `rgb(20, 20, 20)`, identical to no theme;
- `tests/integration/theme-no-effect-badge.spec.ts` exited 0, 4/4 passed;
- unchanged `tests/unit/builtInThemes.spec.ts` exited 0, 14/14 passed;
- the temporary Swiper counterexample probe exited 0, 1/1 passed, while proving
  the current badge and the changed computed colour appeared together;
- `gh pr checks 142` reported the hosted `ci` check passing for the reviewed
  content head; and
- every temporary measurement artifact was deleted and `git status --short`
  was empty before this review file was added.

## Evidence boundary

- I did not rerun the author-reported full 316-test e2e suite or full 219-test
  integration suite. I reran the commissioned full unit/tool gate, the focused
  badge integration spec, the focused base visual failure, and the independent
  Swiper renderer probe.
- The fixture comparison proves one read-only HA 2026.7.4 instance at the time
  of capture. It is not a universal HA-theme population.
- I inspected the current hosted check result but did not re-audit its complete
  log beyond the locally reproduced gate.
- I did not test layout or tooltip interaction across every platform or input
  modality.
- MemPalace calls failed with `Transport closed`; no drawer was read or written.
  Per MP-LEASE, the project-specific candidate is recorded below instead.
- I did not modify implementation, tests, UAT state, `[STATE]`, the PR body, or
  merge state. The owner decides whether and when another review round is owed.

## MemPalace drawer candidates

- **HAVDM wing:** F3 review found that themes publish arbitrary supported custom
  variables onto the canvas, where bundled Swiper CSS has 28 reachable
  `var(--swiper-…)` consumers. A theme defining only `swiper-theme-color` is
  currently badged “no preview effect” while recoloring real carousel controls.
  Evidence: this review’s M1 and the measured `rgb(0, 122, 255)` →
  `rgb(255, 0, 0)` probe. File with `added_by="codex"`.
- **Practice wing:** none. The general lesson is already covered by the quoted
  rule requiring semantic-population enumeration and an explicit external
  population source; this is project-specific evidence of that existing rule.
