# Author self-check — F3 / HA-06 interim badge

**Author:** Claude Opus 5 — this is my own pass over the commission I wrote for
the independent reviewer, run **before** sending it.
**Reviewer:** none. This document is not an independent review and claims no
part of one. It exists so that "I already checked" is inspectable rather than
asserted.
**Owner gate:** the owner merges; nothing here decides anything.

**Why this exists.** The commission an author writes is a PREDICTION of the
findings — every "check whether X" is the author naming where the work is
weakest. Writing it down is not running it. On an earlier pull request in this
repository the author wrote each round's merge-blocking finding into the
commission he sent the reviewer, three rounds running, and ran none of them.
The commission at `docs/reviews/f3-theme-canvas-badge-codex-commission.md` was
therefore executed against this slice first, and is handed over **unweakened** —
nothing softened, narrowed or removed between drafting and delivery.

---

## What it caught

### 1. The predicate's justification was imprecise — FIXED

The commission's §3 asks for "a theme defining exactly ONE of the six". Working
that case exposed a real hole in my own reasoning, not in the code.

Every docblock I had written justified the six-field predicate by reference to
the canvas — but **the canvas reads only two of the six** (`primaryBackground`,
`primaryText`, `src/App.tsx:498-499`). A reviewer would rightly have asked why
the predicate tests six.

Re-deriving the consumers by role rather than by memory —
`grep -rn "getThemeColors" src/` — returns **two** real consumers, not one:

| Consumer                                  | Reads                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/App.tsx:496`                         | `primaryBackground`, `primaryText` → the canvas `<Content>`                                             |
| `src/components/ThemePreviewPanel.tsx:39` | **all six**, one `ColorSwatch` each (`:95-100`), each returning `null` when its colour is unset (`:44`) |

So all-six is the correct set, and for a reason I had not written down: a theme
defining only `primary-color` leaves the canvas untouched **but still renders a
Primary swatch**. Marking it would tell the user a lie about their own theme.
Only a theme defining none of the six is inert on both surfaces — canvas
unchanged AND the Theme Preview card empty. That is what makes the label "no
preview effect" literally accurate rather than approximate.

**Changed as a result:** the docblocks in
`src/features/theme-manager/themeOptions.ts` and
`src/components/ThemeNoEffectBadge.tsx` now name both consumers and state why
the boundary sits where it does; and a new leg,
`does not mark a theme that defines exactly one of the six`, pins it so that
anyone later "optimising" the predicate down to the canvas's two fields breaks a
test rather than the product.

### 2. W3's population claim was sloppier than the claim I made — CORRECTED

I had told the owner _"the only theme flowing through those matchers is
`snapshot-e2e`."_ Re-deriving the class as a BEHAVIOUR — _every assertion whose
result depends on a theme option's rendered text_ — rather than by the token I
first grepped, that is **wrong in detail**, though its conclusion survives.

Population source: the nine text-dependent Playwright routes (`hasText`,
`getByText`, `getByRole('option')`, `toHaveText`, `toContainText`,
`textContent()`, `allTextContents`, `innerText`, `.ant-select-selection-item`)
swept across `tests/`, intersected with the surfaces that actually render the
badge.

**Badge-rendering surfaces — 2, enumerated from source, not memory**
(`grep -rn "optionRender\|labelRender" src/`): `theme-select` in
`ThemeSelector.tsx`, and `theme-settings-select` in `ThemeSettingsDialog.tsx`.

**Anchored/text matchers reaching a badge-rendering surface — 2:**

| Site                                             | Target                                              | Verdict                                               |
| ------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------- |
| `tests/integration/theme-integration.spec.ts:57` | `^HAVDM Default$` on `theme-select`                 | **Safe** — a built-in, and no built-in is ever badged |
| `tests/e2e/theme-restore.spec.ts:64`             | `.ant-select-content` textContent on `theme-select` | Exercised by the full e2e run; see below              |

**Matchers NOT reaching a badge-rendering surface — 5**, so `snapshot-e2e` and
`snapshot-integration` were never at risk for the reason I gave. They target
`theme-manager-saved-select` (`themeManager.ts:22`, `:73`,
`theme-integration.spec.ts:163/167/183`) and `theme-manager-view-override`
(`themeManager.ts:64`) — and an `awk` inventory of every `<Select>` in
`ThemeSettingsDialog.tsx` confirms neither renders the badge.

So several themes flow through anchored matchers, not one; they are safe because
of the SURFACE they target, not because of the theme they name. The conclusion
held; the reasoning behind it did not, and that is exactly the failure mode rule
7 describes.

### 3. The unit spec proved computation, not rendering — GAP CLOSED

Template rule 3 — _"confirming the wiring is not confirming that a value flows
through it"_ — applied to my own work. `tests/unit/themeBadge.spec.ts` proves
`buildThemeOptions` computes the flag. It does not prove a single pixel reaches
the user, and a badge whose entire purpose is to be seen could satisfy it
completely while rendering nothing.

**Changed as a result:** `tests/integration/theme-no-effect-badge.spec.ts`, three
legs — the badge renders on a real Mushroom option; Material You is
`toHaveCount(0)` (the assertion that catches a badge rendered unconditionally,
which a positive-only test would miss); and no built-in is badged offline. It
drives the real captured themes through the app's own `__testThemeApi`, not the
synthetic fixture that would render no badge and prove nothing.

---

### 4. W1 was inferred — so I measured it, and it found a real limit

I had written W1 into the commission as an admitted inference and was ready to
hand it over unmeasured. That is precisely the failure this whole discipline
exists to prevent: naming the check and giving it to someone else. A throwaway
probe read `getComputedStyle` on `[data-testid="canvas-surface"]` after
selecting each theme:

| Selected theme | canvas `background`              | `--md-sys-color-surface-container` |
| -------------- | -------------------------------- | ---------------------------------- |
| _(none)_       | `rgb(20, 20, 20)`                | _(unset)_                          |
| `Material You` | `rgb(238, 237, 244)` = `#eeedf4` | `#eeedf4`                          |
| `Mushroom`     | `rgb(20, 20, 20)`                | _(unset)_                          |

The chain resolves to its hex fallback, so Material You genuinely paints and its
exclusion is right; and `Mushroom` leaves the canvas byte-identical to no theme
at all, which is exactly what the badge asserts. The probe was deleted and
`git status --porcelain` confirmed empty.

**And the measurement produced a defect I had not thought of.** Material You
paints only because its `var()` chain bottoms out in a literal. A theme whose
chain does NOT would give `getThemeColors` a truthy string that paints nothing —
escaping the badge while having no visible effect, the exact case the badge
exists to mark. `definesNoCanvasColors` is a pure function over the theme object
and cannot see this; closing it needs computed styles, which is the canvas
fidelity contract's mechanism, not this slice's.

**Changed as a result:** a `KNOWN-OPEN:` leg pins the current behaviour, so the
limit lives in a test that breaks when someone closes it rather than in prose;
and W1 in the commission now carries the measurement, the renderer it was made
on, and the harder question — construct such a theme — handed to the reviewer
**with more attack surface than it had before, not less**.

## What it did not settle

- **W4, W5, W6, W7** were reasoned through but produced no change: values are
  `Record` keys and the saved arm guards `if (!availableThemes[name])`; the
  mode-sensitivity leg is synthetic because no real theme distinguishes the
  modes, and the class under test there is the predicate's behaviour rather than
  the population's composition; the `ThemeVars` unsoundness is reported rather
  than fixed because relaxing it is outside the approved change set. I hold
  these positions and expect them to be attacked, which is why they are in the
  commission by name.

## Honest limits of this document

This is a same-agent self-audit. It catches a local self-contradiction and an
unexamined boundary; it is **not** a population mechanism and it cannot
substitute for the independent round. Two of the three items above were found
by working a case the commission named — which is the method working — and the
third was found by re-deriving a class I had already claimed to have swept,
which is the method catching me.
