# Independent review commission — F3 / HA-06 interim "no preview effect" badge

**Author:** Claude Opus 5 (this commission and the slice under review)
**Reviewer:** Codex — you. Your verdict lands as
`docs/reviews/f3-theme-canvas-badge-codex-review.md` on this branch, a
committed document and not a chat reply.
**Owner gate:** the owner merges; this document and your review decide nothing
on their own.

**Scope:** branch `feature/f3-theme-canvas-badge`, one content commit off
`main` = `6bf5f62`. Governed by `docs/governance/OPERATING_AGREEMENT.md` §3
class **(d)** — **one full independent review before merge, no automatic
follow-up round; the owner decides whether any post-review change warrants
another.**

**Reviewer write-restrictions (acknowledged):** no `[STATE]` drawer update; no
UAT card marked or re-scored; no `src/` change; no merge; the reference Home
Assistant instance is read-only. Proposed changes go in your review document,
nowhere else.

---

## 0. Working practice this review is held to

These are the cross-project `practice`-wing rules bearing on a reviewer,
**quoted verbatim rather than cited, because you have no MemPalace access and a
cited rule reaches you not at all.**

1. **A finding is a sample, not the population.** When you find a defect,
   identify the CLASS it belongs to — all rows of that table, all call sites,
   all specs of that kind — and sweep every member before reporting. Say which
   you did: "L12 is misclassified" and "I checked all 15 legs; only L12 is
   misclassified" are different reports, and only the second lets the author
   stop. Reporting instances one round at a time makes you an expensive linter.
2. **No unverified universals.** "Only", "every", "all", "none" or any count is
   a measurement and needs the enumeration that backs it, attached to the
   claim. A count of containers is not a count of contents — the command you
   ran must measure the property you are asserting.
3. **A check is evidence only for the property it exercises.** Before writing
   "verified", ask: if this claim were false, would what I ran have failed? A
   green suite proves nothing if the tests were written to agree with the code;
   an isolated pass says little about a flaky path; confirming the wiring is
   not confirming that a value flows through it.
4. **Verify each finding against the source before reporting it.** Quote
   `path:line`. A finding you cannot locate is a question, and should be
   written as one. Check whether the thing you are calling an inconsistency is
   a DELIBERATE decision recorded somewhere you were not shown — say so if you
   suspect it rather than asserting a defect.
5. **Silence is not a result.** State "no issue found" explicitly for every
   heading below, so the reader can trust the heading was checked. Zero
   findings on a mature artifact is a PASS, not a failed review — never
   manufacture a finding to justify the pass.
6. **Declare your evidence boundary:** what you could not run, could not reach,
   or could not verify. `UNVERIFIABLE` is a result; a quietly dropped claim is
   not.

And the two that bear hardest on **this** slice, because it makes a claim about
a set of themes:

7. **A changed-file list is a FLOOR for a reading pass, not the POPULATION of a
   semantic universal.** Git names what the author changed; it cannot name what
   he should have changed, nor a member of the claim's class that is not a file
   in this repository at all — a pull-request body, a memory store, a wiki,
   another repository. Before any "all"/"every"/"none"/count: NAME THE
   POPULATION SOURCE ("from memory" is not one — that is NOT CHECKED) and ASK
   THE EXTERNAL QUESTION EXPLICITLY, listing those members or recording why
   there are none. State the class as a ROLE before choosing a search key.
   ⚠ This rule was measured on a procedure that was followed PERFECTLY and
   still shipped a false universal.
8. **A search run to VALIDATE known members cannot ENUMERATE the population,
   and its output looks identical either way.**

---

## 1. What the slice claims

Both theme pickers now mark a theme that will not change the HAVDM canvas when
selected, with the tag **"no preview effect"** and a tooltip. The predicate is
`definesNoCanvasColors` in `src/features/theme-manager/themeOptions.ts`: true
when **every** field of `themeService.getThemeColors(theme, darkMode)` is
falsy. It calls the shipped function rather than re-reading the CSS variable
names, so it cannot drift from what the canvas actually consumes.

Supporting measurements, all made on `6bf5f62` and all re-runnable:

- `grep -rn 'var(--' src/` returns **2 hits, both comments** — nothing in
  `src/` consumes a published theme variable.
- On the reference instance (`frontend/get_themes`, read-only, HA 2026.7.4),
  **4 of 5 installed themes define none of the six fields**; `Mushroom` defines
  no variables at all. `Material You` defines all six.
- All 4 built-ins define all six in both modes.

---

## 2. My weakest claims — attack these by name

I would rather you spend the round here than anywhere else. **This list is a
FLOOR, not a ceiling** — it will always be shorter than the population, and a
defect I did not think to name is exactly what an independent round is for.

**W1. `Material You`'s exclusion — I MEASURED this after first writing it down
as an inference, and the measurement stands or falls on one renderer.** It
defines all six, but as `var(--md-sys-color-*)` chains whose targets are
themselves `var(--…-light, #hex)` with hex fallbacks, set on the same element
the inline `background` sits on. My first draft of this commission said I had
NOT measured that it paints. I then measured it, via a throwaway probe that
selected each theme and read `getComputedStyle` on `[data-testid="canvas-surface"]`:

| Selected theme | canvas `background`              | `--md-sys-color-surface-container` |
| -------------- | -------------------------------- | ---------------------------------- |
| _(none)_       | `rgb(20, 20, 20)`                | _(unset)_                          |
| `Material You` | `rgb(238, 237, 244)` = `#eeedf4` | `#eeedf4`                          |
| `Mushroom`     | `rgb(20, 20, 20)`                | _(unset)_                          |

So the chain resolves to its hex fallback and Material You genuinely paints —
its exclusion is correct — while `Mushroom` leaves the canvas byte-identical to
selecting no theme at all, which is exactly what the badge asserts.

**What is still open, and what I want you to attack:** that is ONE renderer
(Electron/Chromium under Xvfb), in LIGHT mode, on the themes this one instance
happens to carry. The probe was deleted rather than committed, so the result is
not pinned by any test — a future antd or Electron bump could break the
resolution silently and nothing would fail. Is that the right call, or should
the slice carry a committed assertion of the current behaviour? And can you
construct a real theme whose `var()` chain does NOT bottom out in a literal, so
that `getThemeColors` returns a truthy string that paints nothing — a theme
that would escape the badge while having no visible effect?

ⓘ **Raw output of both this measurement and the `advanced-slider` one is
committed at `docs/reviews/f3-theme-canvas-badge-measurements.md`.** They are
there because both are STRUCTURALLY DESTRUCTIVE — one restores the tree it
measured, the other deletes the probe — so neither could be re-quoted once
finished, and I had already described both to the owner as "measured, not
argued" while holding no artifact for either. Re-run them rather than reading
mine.

**W2. The population claim is about ONE instance at ONE moment.** "4 of 5" is
true of the reference instance on 2026-08-10. It is NOT a universal about
Home Assistant themes generally, and I have tried not to write it as one. Check
whether any comment, docblock, commit message or PR body on this branch
overstates it into a universal. Apply rule 7 to me.

**W3. The `optionRender` text change is guarded by a claim about TODAY's
specs.** Rendering the badge adds text to an option row, so an anchored
`^<name>$` text matcher would now miss a badged option. I claim the only theme
flowing through such matchers is `snapshot-e2e`, which defines all seven
variables and is therefore never badged. **My population source was
`grep -rn "ant-select-item-option|theme-select" tests/` plus reading
`tests/support/dsl/themeManager.ts` and `tests/e2e/theme-restore.spec.ts`.**
That is a token-keyed sweep of a class defined by BEHAVIOUR ("every matcher
that depends on an option's rendered text"), which is precisely the shape rule
7 warns about. Re-derive the class yourself and tell me what I missed.

**W4. `labelRender` looks the badge up by `value`, not by identity.**
`ThemeSelector.tsx` and `ThemeSettingsDialog.tsx` both do
`themeOptions.some(o => o.value === value && o.definesNoCanvasColors)` because
antd does not thread custom option fields through `labelRender`. I believe
values are unique because they are `Record` keys. Construct a case where they
are not, or where the lookup returns the wrong answer.

**W5. The mode-sensitivity leg is the one SYNTHETIC test in the slice.** No
real theme on the instance distinguishes light from dark, so the real
population cannot exercise it. I argue the class under test there is the
PREDICATE'S BEHAVIOUR rather than the population's composition, which makes a
constructed input correct. Disagree if you think I have re-imported the exact
vacuity the real-fixture ruling exists to prevent.

**W6. The `ThemeVars` finding is reported and NOT fixed.** Four of five real
themes falsify the type (`modes.light`/`.dark` typed as `ThemeVars`, six keys
required); production never notices because `haWebSocketService.getThemes()`
returns `Promise<any>`. The fixture is cast at the boundary to mirror what
production already does. Judge whether reporting rather than fixing is right
here, and whether the cast hides anything else.

**W7. The badge has no e2e coverage, only unit + integration — and its coverage
grew twice, both times because a self-check caught an unmeasured surface rather
than a broken one.** I added `tests/integration/theme-no-effect-badge.spec.ts`
after noticing the unit spec proved computation and not rendering. A later
author reading pass then caught that `buildThemeOptions` feeds **two**
badge-rendering Selects and my legs drove only one — so a fourth leg now drives
`theme-settings-select` in the dialog, which computes its badge from
`localDarkMode` rather than the store's `darkMode` and is therefore not even the
same expression. ⚠ **That leg PASSED first time: the surface was unverified, not
broken. I am telling you because "it passed" is exactly when a coverage gap
looks like it never mattered.** Is integration the right tier, are four legs
enough, and is there a third rendering surface I have still not enumerated?

---

## 3. Negative cases to invent — my list is a floor

Invent cases I did not. Starting points, none of them exhaustive: a theme
defining exactly ONE of the six; a theme defining a field as the empty string,
`"none"`, `"transparent"` or whitespace; a theme whose `modes` block exists but
is empty (real — three of the four badged themes are this); a saved theme whose
`.theme` is `{}` or malformed after an import; a theme named identically to a
built-in (the collision rule says HA wins); a theme name containing a `"` that
would break the `[title="…"]` selector; `buildThemeOptions` called with the new
third argument by one caller and not another.

---

## 4. Required re-runs — §3.5 REV-RERUN

**Do not accept my numbers. Re-run and report your own, with real exit codes.**

1. **`./tools/checks`** — report the REAL exit code, and confirm
   `grep -cE "^> (eslint|prettier --check|tsc --noEmit|vitest run)" <log>`
   returns **4**. A compound command ending in `echo`, or any `cmd | head`,
   launders the exit code.
2. **The load-bearing spec, at a DEEPER REPEAT than I published.** I published
   a single run of `tests/unit/themeBadge.spec.ts` (21/21). Run it at least
   five consecutive times. A single green is not a stability claim.
3. **The red leg — reproduce it, do not take my word.** `git checkout 6bf5f62 --
src/`, run `npx vitest run tests/unit/themeBadge.spec.ts`, and confirm you
   get **9 failed / 12 passed** with every failure behavioural
   (`undefined !== true`) rather than an import error. Then
   `git checkout HEAD -- src/` and confirm `git status --porcelain` is empty.
   **If the 12 controls do not pass on base, the red leg proves nothing** — that
   is the discriminator, and it is the thing worth checking hardest.
4. ⭐ **REPRODUCE THE `advanced-slider.visual:16` BASE MEASUREMENT — the one
   claim in this slice that carries the most weight and that I could least
   afford to get wrong.** The whole e2e triage rests on it being PRE-EXISTING on
   `main` rather than caused here. `git checkout 6bf5f62 -- src/`, remove
   `src/components/ThemeNoEffectBadge.tsx`, confirm `git diff --stat 6bf5f62 --
src/` is EMPTY, then run that one spec headless. Expect the identical
   dimension mismatch (expected 586x882, received 586x818). Restore with
   `git checkout HEAD -- src/` and confirm `git status --porcelain` is empty.
   Raw output of my run: `docs/reviews/f3-theme-canvas-badge-measurements.md` §1.
   ⚠ **If it PASSES on base for you, this slice caused it and the triage is
   wrong — say so loudly.**
5. **The fixture is verbatim — verify it.** Re-capture with
   `{ type: 'frontend/get_themes' }` over the WebSocket API against the
   read-only reference instance and diff against
   `tests/fixtures/realHaThemes.ts`. ⚠ **READ-ONLY. Issue no write command.**

---

## 5. Deliberately out of scope — do not report as omissions

- **The canvas fidelity contract deep fix** (real `var(--)` consumers over a
  fuller variable set). Owner-ruled out of this PR on 2026-08-10; it is a
  separate, still-unwritten item.
- **The HA-06 UAT card correction** — queued for r4 generation. The agent never
  marks, re-marks or re-scores a UAT test.
- **THEME-01's contrast audit** — its own item.
- **`tests/unit/builtInThemes.spec.ts`** — must not change, and has not.
- **The self-pass gate's silence.** `GATE_OWN` is six named files and no
  governed path is touched, so this `src/` branch owes no commission-ledger and
  no author ledger. That is the reduction working as designed.

---

## 6. Where your MemPalace notes go — ruling MP-LEASE

If MemPalace is absent, or present with the **write** refused by the per-palace
writer lease — the normal case when author and reviewer run concurrently —
record them in a `MemPalace drawer candidates` section at the **end of your
review document**, not in the PR body, and I will file them with
`added_by="codex"`. ⚠ **Never kill a process to free the lease and never set
`MEMPALACE_MCP_ALLOW_PEER_WRITER`.**

---

## 7. Record: I ran this commission against my own work first

Per the rule that the commission an author writes is the checklist he owes
himself — **writing it down is not running it** — the results of my own pass
over §§2–4 are recorded in
`docs/reviews/f3-theme-canvas-badge-author-self-check.md`, including what it
caught and what I changed as a result. The commission above is handed over
**unweakened**: nothing was softened, narrowed or removed between drafting and
delivery.
