# UAT Round 3 (`v1.0.0-r3`) — Triage

**Round:** `v1.0.0-r3` — First stable release, round 3 (full re-run)
**Tested:** 2026-08-03, exported `2026-08-03T11:26:19.100Z`
**Build under test:** Windows x64 packaged app, rebuilt 2026-08-03 from `main` = `a3b60b5`
**Produced by:** agent, per `docs/testing/UAT_STRATEGY.md` §3.5
**Evidence:** `../sessions/uat_session_v1.0.0-r3_2026-08-03.json` · `uat_summary_v1.0.0-r3_2026-08-03.md`

---

## ⚠ What this document is, and what it is not

This is **triage**, not marking. `UAT_STRATEGY.md` §2 reserves marking to the
tester and re-scoring to the project owner. **Every severity below is the
tester's own, recorded and not re-judged.** Where measurement suggests a severity
or a verdict may be wrong, that is raised as an open question for the owner and
recorded in `../VERDICT_REMARKS.md` only after they rule — never applied here.

No GitHub Issues were created (§3.5). No card was marked, re-marked or re-scored.

---

## 1. The result

| Total  | Pass   | Fail   | Skip  | Untested |
| ------ | ------ | ------ | ----- | -------- |
| **66** | **50** | **13** | **2** | **1**    |

| High   | Medium | Low   | Unrated |
| ------ | ------ | ----- | ------- |
| **11** | **2**  | **0** | **0**   |

Verified against the export: 66 ids; every Fail carries exactly one severity and
no severity is attached to a non-Fail (checked in both directions); the summary
report's own tables agree independently.

⭐ **`teardownConfirmed: true`.** The matrix's teardown gate worked this round.
Round 2's was `false`, and that is what hid HA-08's High until it was found by
later measurement.

### Against the pass bar (amendment-03 §3.1)

| Criterion                                 | Result                                                        |
| ----------------------------------------- | ------------------------------------------------------------- |
| 1. Zero open High-severity defects        | ❌ **11 open**                                                 |
| 2. Mediums fixed or accepted in writing   | ⚠ 2 outstanding (FILE-06, PROPS-03)                           |
| 3. Lows recorded                          | ✅ none raised                                                 |
| 4. Uncovered failures gain coverage (§7)  | ⚠ **1 — FILE-06**, the only `auto_covered: false` failure     |
| 5. No test left Untested                  | ❌ **breached twice** — THEME-04 untested; THEME-03 Skip, no reason |

**The round is not accepted.**

⚠ **Criterion 5 is breached in both available ways.** THEME-04 has no verdict at
all, and THEME-03 was skipped with a blank reason. §3.1 is explicit that "a test
the tester chose not to run is marked Skip **with a reason**, which is a decision;
blank is not." VCS-03's skip is properly reasoned ("No history or diff to check")
and is not a breach.

### What passed, and it is worth saying

**CLIP-02 passed** — vindicating the owner's round-2 re-mark from Fail/High to
Pass (`../VERDICT_REMARKS.md`). Round 3 is the first independent confirmation
that the ruling was right.

**VIEWS-05, VCS-02, PROPS-07, YAML-05, CLIP-04, FILE-04, HA-02 and HA-08 all
passed** — eight round-2 defects confirmed fixed by the tester rather than by us.
PROPS-07 and YAML-05 were the two Untested cards from round 2, so criterion 5's
round-2 gap is closed even as round 3 opens a new one.

⭐ **HA-04's corrected card did its job.** Its round-2 failure was self-inflicted
by a worked example the instance could not satisfy. The corrected card produced a
real, actionable observation instead. The correction mechanism in
`../CARD_CORRECTIONS.md` is working.

---

## 2. ⭐⭐ The headline: these six are not code regressions

Six cards are labelled regressions by §8 — green last round, red this round:
**FILE-06, CANVAS-03, CLIP-01, VIEWS-04, EXPORT-04, HA-06.** Six at once looks
like a signal about recent merges. **Measured, it is not**, and acting on that
reading would have sent remediation at the wrong code.

**Two independent measurements refute it.**

**(a) The build delta is nine PRs, not three.** Round 2's binary was built from
`199c8f6`, round 3's from `a3b60b5`. `git diff --stat 199c8f6 a3b60b5 -- src/`
is **32 files, +4560/−195, spanning PRs #110–#118**. The three most recent PRs
are a minority of that change.

**(b) For every one of the six, the implicated code is byte-identical across the
two builds.**

| Regression         | Measurement                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| CANVAS-03, CLIP-01 | `git diff 199c8f6 a3b60b5 -- src/components/GridCanvas.tsx` → **empty**            |
| VIEWS-04           | the `dragInProgress` gate sits at the same lines 181 / 411 / 501 in both builds    |
| FILE-06            | `addRecentFile` has the same two call sites in both builds                         |
| THEME-01/02, HA-06 | **zero** theme source files changed; `App.tsx`'s diff contains zero theme lines    |

**And the corroboration: four of the six also failed in round 1.** CLIP-01,
EXPORT-04, FILE-06 and VIEWS-04 all ran **fail → pass → fail**. They are
oscillators, not capability loss. Only CANVAS-03 and HA-06 were green in both
prior rounds.

⚠ **The §8 label is mechanically correct and causally misleading.** It is computed
from the previous-round dot, which is exactly what it is specified to do, and the
dots are right. Recording that here rather than against the cards is the owner's
ruling of 2026-08-03; no `VERDICT_REMARKS.md` entry was made.

### ⭐⭐⭐ What actually varies between rounds: HAVDM's own persisted state

This generalises VCS-02's round-2 root cause — *"the repo root persists, so round
1 and round 2 entered different dialog branches of the same build"* — from one
dialog to the whole product.

It was **measured, not inferred**, by reading the tester's own
`%APPDATA%\HA Visual Dashboard Maker\config.json` (793,824 bytes, modified
2026-08-03 21:28, two minutes after the 21:26 export). That single file settled
two Highs outright and supplied the cause of a third cluster:

- `capabilityProfile` — **entirely absent** → EXPORT-04
- `selectedTheme: "Mushroom Shadow"` — an HA-instance theme, not a HAVDM built-in
  → THEME-01, THEME-02, HA-06
- `recentFiles` — six entries, all opened files, the Save As file missing → FILE-06

⭐ **Reading the app's persisted config is now a first-class triage instrument,
alongside reading the session JSON.** Round 2's lesson was that the evidence was
in the tester's *export* rather than the card. This extends it to the tester's
*profile*.

---

## 3. ⚠⚠ Four of the eleven Highs ran against an uncontrolled fixture

**HA-03, HA-04, HA-07 and HA-09 all ran against the tester's own dashboard
files** — `C:\dev\homeassistant2\dashboards\uat_dashboard3.yaml` and
`dashboard-ha_exported.yaml` — whose contents we had never seen.

Measured against the reference instance, those files reference:

- `custom:gauge-card-pro` — **not installed** on `ha.home.local` (the instance's
  11 Lovelace resources do not include it)
- `sensor.example_temperature` — **does not exist**
- `input_boolean.toggle` (HA-04's detected missing entity) — **does not exist**,
  and is not a plausible rename of any of the six real `input_boolean` entities

This does not make the failures invalid — HA-07's is a genuine product defect
regardless. It means **four Highs carry an uncontrolled variable**, and results
that disagree between rounds cannot be attributed cleanly.

⭐ **This is exactly why HA-09's feature request is load-bearing rather than a
convenience.** See `../FEATURE_REQUESTS.md` FR-04.

---

## 4. The thirteen failures

Severity is the tester's. "Regression" is §8's computed label. Root causes are
measured unless explicitly marked as hypothesis or unmeasured.

---

### FILE-06 — Save As… writes a new file and it appears in Recent Files

| Field           | Value                                            |
| --------------- | ------------------------------------------------ |
| Severity        | **Medium** (tester)                              |
| Regression      | Yes (§8) — but also failed round 1               |
| `auto_covered`  | **`false`** — ⚠ §7 makes coverage non-negotiable |

**Observed:** "New file did not appear in Recent Files. Also, hovering over a
recent file does not show the full path in the tool-tip"

**Root cause — MEASURED.** `addRecentFile` has exactly two call sites in
`src/App.tsx`: line 603 (after **File → Open** succeeds) and line 644 (after
**Open Recent**). Both are open paths. **Save As never registers the file it
just wrote.** Identical in both builds.

**Confirmed against the tester's persisted state.** `recentFiles` holds six
entries, every one a file that was *opened*. `uat_dashboard4.yaml` — which the
tester created via Save As at 18:45 and which exists on disk — is **absent**.

Second half: the Recent Files submenu shows no full-path tooltip.

**§7 mandatory regression test.** Workflow defect → an **e2e spec** driving Save
As through the DSL and asserting the new path appears in Recent Files, plus a
**unit/integration** assertion on the persistence seam so the coverage does not
depend on a native dialog. ⚠ This is the one card on this round for which §3.1
criterion 4 is engaged; a fix without coverage does not close it.

---

### CANVAS-03 — Drag a card to a new position and the position sticks

| Field      | Value                              |
| ---------- | ---------------------------------- |
| Severity   | **High** (tester)                  |
| Regression | Yes (§8) — green in rounds 1 and 2 |

**Observed:** a card snapped back to its original position; the YAML editor for
that card was not showing; **"I have tried to replicate the error but I haven't
been able to."**

**Root cause — ⚠ NOT REPRODUCED. NO MEASURED CAUSE.**

What is known: `src/components/GridCanvas.tsx` is **byte-identical** between the
round-2 and round-3 builds, so nothing merged in #110–#118 changed the masonry
drag path. `handleDragStop` returns early when the geometry is unchanged and
otherwise calls `onLayoutChange`. The tester could not reproduce it either.

⚠ **No hypothesis is offered.** A root cause invented for a one-shot,
unreproduced observation would be worse than an honest gap — and the drag path
has not changed, so the obvious suspects are already excluded.

**Recommended response — and it is what the tester asked for.** Build the
automated stress coverage they requested: multi-select, drag, and repeated moves
under load, asserting the persisted layout after each. That is the instrument
that will either reproduce this or bound it. **Do not attempt a fix first.**

**§7 regression test.** `auto_covered: true`, so §7 does not compel coverage —
but the cited spec (`tests/e2e/layout.spec.ts`) asserts store geometry after a
*programmatic* change and has never driven a real drag gesture. The stress suite
is the right answer regardless of what §7 compels.

---

### CLIP-01 — Copy and paste a card

| Field      | Value                              |
| ---------- | ---------------------------------- |
| Severity   | **High** (tester)                  |
| Regression | Yes (§8) — but also failed round 1 |

**Observed:** "Right-click on blank canvas does not display context menu"

**Root cause — MEASURED, and it is a missing feature rather than a breakage.**
The card's step 3 is *"Right-click empty canvas and choose Paste."* **There has
never been a blank-canvas context menu.** `CardContextMenu` — the only
`trigger={['contextMenu']}` in `src/` — wraps only `<BaseCard>` at
`GridCanvas.tsx:527`. The outer canvas container at `GridCanvas.tsx:443` carries
`onMouseDown`, `onDragOver` and `onDrop`, and **no `onContextMenu`**. Identical
in both builds.

⭐ **CANVAS-06 passing is the discriminator that proves this.** Right-clicking a
*card* and choosing Delete works; the canvas menu does not exist. The two facts
are consistent, and together they localise the gap precisely.

**Recommended fix.** A canvas-level context menu offering Paste (and only what
makes sense with no card under the cursor), on **both** `GridCanvas` and
`SectionsCanvas`, reusing the existing `onOpen`-selection discipline.

**§7 regression test.** Workflow defect → an **e2e spec** that right-clicks empty
canvas, asserts the menu appears, and asserts Paste lands a card. ⚠ The existing
`auto_covered` citation (`tests/e2e/bulk-operations.spec.ts`) drives copy/paste
through the DSL and never opens a context menu — another instance of a card
marked covered by a spec that cannot see the failure.

---

### VIEWS-04 — Author a sections view: add, rename, reorder, delete

| Field      | Value                              |
| ---------- | ---------------------------------- |
| Severity   | **High** (tester)                  |
| Regression | Yes (§8) — but also failed round 1 |

**Observed:** "Cannot drag cards into any section if the section is empty.
Double-clicking lands a card to the last section if there are multiple
sections… Once the last section has a card (through double-clicking) then can
drag cards across sections."

**Root cause — MEASURED. Two distinct defects.**

**(1) Palette drag-and-drop onto a Sections view is not implemented at all.**
`SectionsCanvas` has **no palette-drop prop and no outer drop handler** —
`GridCanvas` has `onDragOver`/`onDrop` on its container at lines 461–462;
`SectionsCanvas` has nothing equivalent. Its only two drop targets (section body
at :411, card at :502) gate `event.preventDefault()` on
`dragInProgress = dragActive || sectionDragActive` (:182), and **both flags are
set only by `onCardDragStart` (an existing card) or `onSectionDragStart` (a
section handle)**. HTML5 drag-and-drop refuses any drop whose `dragover` did not
call `preventDefault()`, so **a palette drag is rejected everywhere on a sections
view — empty section or not.**

⭐ This explains the tester's wording exactly. They could drag cards *across*
sections (an internal move, which sets the flag) but never *into* one from the
palette. The "empty section" framing is a symptom of where they noticed it, not
the boundary of the defect.

**(2) Double-click add targets the wrong section.** `App.tsx:1078-1079` resolves
the target as `selectedSectionIndex !== null && sections[selectedSectionIndex] ?
selectedSectionIndex : 0`. The card's Expected is that a card added while a
section is selected lands **in that section**.

**§7 regression test.** Workflow defect → an **e2e spec** dragging a palette card
onto (a) an empty section and (b) a populated one, asserting it lands in the
targeted section; plus a case asserting double-click targets the selected
section. ⚠ The cited spec (`tests/e2e/sections-canvas.spec.ts`) adds palette
cards *programmatically through the DSL*, which is precisely why it never saw
this — the seventeenth form of the `auto_covered` problem, again.

---

### EXPORT-04 — The palette marks unavailable cards honestly

| Field      | Value                              |
| ---------- | ---------------------------------- |
| Severity   | **High** (tester)                  |
| Regression | Yes (§8) — but also failed round 1 |

**Observed:** "There is no 'pallet footer' that I can see. There is no clear
explanation that I can see"

**Root cause — MEASURED, and it is the strongest finding of the round.**

**`capabilityProfile` is entirely absent from the tester's persisted
`config.json`** — while `haUrl`, `haToken` and `cachedEntities` (725 entities)
are all present, so the tester certainly did connect.

`resolveCardState` (`src/services/capability/cardAvailability.ts:40`) returns
`'available'` for **everything** when `profile.haVersion === null`. With no
persisted profile, a connected user permanently receives the never-connected
permissive behaviour.

**Proven by running the real resolver, not by reading it.** Bundling
`capabilityResolver.ts` and `cardAvailability.ts` and feeding them the instance's
**real 11 Lovelace resources** yields 24 installed elements, under which exactly
**two** cards in the tester's "Sensors & Display" category resolve
`not-available`:

- `custom:power-flow-card` — the instance has `power-flow-card-**plus**`
- `custom:battery-state-card` — not installed

So a correctly captured profile *would* have marked two cards. None were marked,
because the profile never persists.

⚠ **One half is not measured.** The footer notice at `CardPalette.tsx:353`
renders on `profile.haVersion === null`, so it *should* have been visible. The
tester reports it was not. Whether it renders and is missed, or does not render,
needs the running app.

**§7 regression test.** Logic/state defect → a **unit or integration spec**
asserting that a capability capture **persists and survives a restart**, and that
`resolveCardState` marks an uninstalled custom card `not-available` against a
restored profile. ⭐ The persistence assertion is the one that matters: the
resolver logic is already covered and already correct.

---

### THEME-01, THEME-02 and HA-06 — one cause

| Card         | Severity          | Regression                    |
| ------------ | ----------------- | ----------------------------- |
| **THEME-01** | **High** (tester) | No — failed round 2 (as Low)  |
| **THEME-02** | **High** (tester) | No — failed round 2 (Medium)  |
| **HA-06**    | **High** (tester) | **Yes** (§8) — green rounds 1 & 2 |

**Observed:**

- THEME-01: "The switch on the main screen changes but the theme is not applied
  after first switch." Plus a separate demand: "back text on dark background and
  light text on light backgrounds still exist… ensure dark on dark or light on
  light text and background on all default teams is fixed"
- THEME-02: `Error message: "No active theme to save"`
- HA-06: "Only some change the canvas colour. Others make no difference."

**Root cause — MEASURED, and it is one defect behind all three.**

The persisted `selectedTheme` is **`"Mushroom Shadow"`**, which is a **Home
Assistant instance theme, not a HAVDM built-in.** Measured at both ends:

- `frontend/get_themes` on `ha.home.local` returns 5 themes: `Material You`,
  `Mushroom`, **`Mushroom Shadow`**, `Mushroom Square`, `Mushroom Square Shadow`
- `BUILT_IN_THEMES` (`src/features/theme-manager/builtInThemes.ts:142`) holds
  exactly four: `HAVDM Default`, `HAVDM Midnight`, `HAVDM Solar`,
  `HAVDM High Contrast`

With `themeSyncWithHA: false` and no HA themes loaded at startup, the persisted
name **resolves to nothing**, `currentTheme` stays `null`, and
`src/store/themeStore.ts:228` returns the string **"No active theme to save"** —
**which is THEME-02's reported error verbatim.** The same `null` explains
THEME-01's "not applied after first switch" and HA-06's "only *some* change the
canvas colour": the four built-in names resolve, the five HA-sourced names do not.

⚠⚠ **`builtInThemes.ts:10` documents this exact refusal as the round-1 symptom
that shipping built-in themes was meant to cure.** The cure covered the **empty**
case — no themes at all — and not the **dangling-name** case, where a persisted
selection names a theme that is not currently available.

⚠ **A control's behaviour must not depend on state it cannot validate on
restore.** A persisted name is a reference; nothing re-resolved or fell back when
the referent was gone.

**Recommended fix.** Re-resolve `selectedTheme` on load: fall back to a built-in
when the name is not available, say so, and re-resolve when an HA connection
later supplies the missing theme.

⚠ **THEME-01 carries a second, separate and unmeasured demand** — a full
contrast audit across all default themes. `tests/unit/builtInThemes.spec.ts`
already enforces a Rec.709 luma check on the four built-ins, so the reported
dark-on-dark is either outside those four (i.e. the HA-sourced themes, which that
guard never covers) or outside the luma check's reach. **This needs its own
investigation and should not be folded into the dangling-name fix.**

**§7 regression test.** Logic/state defect → **unit specs** on `themeStore`:
a persisted name that is not in `availableThemes` must not leave `currentTheme`
null; `saveCurrentTheme` must not refuse after a normal restore; and a later
`setAvailableThemes` must re-resolve. Contrast is a **visual** defect under §7 —
coverage is not compelled, but the existing luma guard should be extended to
whatever set the audit finds.

---

### HA-03 — Download an existing dashboard from Home Assistant

| Field      | Value                          |
| ---------- | ------------------------------ |
| Severity   | **High** (tester)              |
| Regression | No — failed rounds 1 and 2 too |

**Observed:** "Some cards failed to render. Some cards cannot be selected. These
should have been detected during e2e and integration testing."

**Root cause — THREE findings, two measured.**

**(1) Two card types on the instance cannot render — MEASURED.** Enumerating all
11 storage-mode dashboards read-only gives **29 distinct card types in use**.
27 have both a `cardRegistry.ts` entry and a `BaseCard.tsx` case. Two do not:

| Type                        | Uses on the instance |
| --------------------------- | -------------------- |
| `divider`                   | 18                   |
| `custom:template-entity-row` | 6                    |

Both are `entities`-card **row** types. This matches the standing gap already on
record: *entities cards cannot host the row types as children*.

**(2) Entity state does not reach the rendered card — MEASURED.** The tester's
screenshot shows every value as `unknown` / `--`. Those entities exist and carry
real states on the instance:

| Entity                                | Actual state on `ha.home.local`             |
| ------------------------------------- | ------------------------------------------- |
| `sensor.mckenzie_hill_extended_text_0` | `"Partly cloudy. Medium chance of showers…"` |
| `sensor.mckenzie_hill_temp_max_0`      | `"12"`                                      |
| `sensor.mckenzie_hill_rain_amount_range_0` | `"1–2"`                                 |
| `sensor.mckenzie_hill_rain_chance_0`   | `"70"`                                      |
| `weather.mckenzie_hill`                | `"clear-night"`                             |

(Two of the screenshot's values genuinely *are* `unknown` upstream —
`temp_min_0` and `uv_category_0` — which is a useful control: the renderer is not
uniformly blank, it is not resolving state for entities that have it.)

**(3) Template and icon expressions render as literal text — MEASURED FROM THE
SCREENSHOT, mechanism not yet traced.** Card faces show raw
`mdi:thermometer-low`, `mdi:weather-sunny-alert`, `mckenzie_hill_mdi_icon_0')`
and raw `<div class="wx-header">` HTML as oversized grey text overlapping the
cards.

⚠ **Hypothesis, not measurement: this is also why "some cards cannot be
selected."** An oversized text layer drawn over the cards would intercept
pointer events — the same defect family as HA-08's round-2 address sitting under
the card overlay at a lower `z-index`. **This needs confirming in the running app
before any fix.**

**§7 regression test.** Marked `auto_covered: true`, but the round-1 correction
already recorded that its original citation was 26 placeholder tests. Fidelity /
translation defect → **fixture-level assertions through the real load path**,
using a captured copy of a real instance dashboard: assert row types render,
assert state reaches the card, assert no template source escapes as display text.
⭐ This is the clearest case for the live-HA test tier — see
`../../LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md`.

---

### HA-04 — Detect and remap missing entities

| Field      | Value                          |
| ---------- | ------------------------------ |
| Severity   | **High** (tester)              |
| Regression | No — failed rounds 1 and 2 too |

**Observed:** "1 Missing entity detected (`input_boolean.toggle`) but there is no
information provided to allow me to map the correct entity. Auto map states 'No
replacement scored high enough to map…'. It doesn't appear that any filters are
applied either."

**Root cause — MEASURED, and it splits in two.**

**The auto-map refusal is correct behaviour.** `input_boolean.toggle` **does not
exist** on the instance, and it is not a plausible rename of any of the six real
`input_boolean` entities (`ev_charge_now_override`,
`vpp_high_activity_predicted`, `vpp_modbus_throttle_active`,
`ev_charge_retry_lock`, `garage_door_manual_state`, `garage_lamp_manual_state`).
A similarity matcher cannot map an id that resembles nothing.

⭐ **The R3 card correction did not bind, and this is the reusable lesson.** The
correction told the **tester** to use a plausible rename of a real entity — but
the missing entity came from **their own dashboard file**, not from a step they
performed. A correction addressed to the tester cannot fix an input the tester
does not supply. **This is precisely what HA-09's request solves** (FR-04).

**The genuine defect is the second sentence: "there is no information provided
to allow me to map the correct entity."** When auto-map declines, the dialog
reports the refusal but does not help the user proceed. ⚠ The tester's "it
doesn't appear that any filters are applied" is **not measured** and needs the
running app.

**§7 regression test.** `auto_covered: true`. Logic defect → an **integration
spec** asserting that when no suggestion scores high enough, the dialog still
offers a searchable route to every entity and says why nothing was auto-mapped.

---

### HA-07 — The Deploy dialog states what was adjusted for Home Assistant

| Field      | Value                                     |
| ---------- | ----------------------------------------- |
| Severity   | **High** (tester)                         |
| Regression | No — failed round 2 (High), passed round 1 |

**Observed:** "Error during deployment. Tried to deploy
`C:\dev\homeassistant2\dashboards\dashboard-ha_exported.yaml`"

**Root cause — MEASURED. The error text was recovered from the tester's attached
screenshot**, which had not been read:

> **Deployment Failed**
> `View "UAT Stuff or other stuff" must have a "cards" array (can be empty).`
> *Please check your connection and try again.*

`src/components/DeployDialog.tsx:118-120`:

```js
if (!view.cards || !Array.isArray(view.cards)) {
  throw new Error(`View "${view.title}" must have a "cards" array (can be empty).`);
}
```

**The validator demands a `cards` array on every view. A `type: sections` view
legitimately has none** — its cards live under `sections[].cards`. The named view
is exactly that:

```yaml
- title: UAT Stuff or other stuff
  type: sections
  sections:
    - type: grid
      cards: [...]
```

⚠⚠ **HAVDM cannot deploy a dashboard HAVDM can itself author.** It ships a
Sections canvas, a whole UAT group for sections views, and the reference instance
runs two of them. This blocks a core workflow outright, which is squarely §6
High — the tester's severity is right.

**Second defect in the same dialog.** The sub-line reads *"Please check your
connection and try again"* for a pure **validation** failure that has nothing to
do with the connection. Under §6 that is Medium on its own ("the error message
for a real failure is missing or misleading"); here it is part of HA-07.

ⓘ Recorded for accuracy, not as a criticism: HA-07's card says *"This card does
not deploy. You open the dialog, read it, and cancel."* The tester deployed. The
defect they found is real and valuable either way.

**§7 regression test.** Logic defect → a **unit spec** on the deploy validator:
a `sections` view with no top-level `cards` array must validate; a genuinely
malformed view must still fail; and a validation failure must not claim a
connection problem.

---

### HA-09 — Deploy to a throwaway dashboard, verify it renders, then delete it

| Field      | Value                             |
| ---------- | --------------------------------- |
| Severity   | **High** (tester)                 |
| Regression | No — skipped in round 2           |

**Observed:** "Does not render properly. However, it could be because I have not
created a proper dashboard. I want you to create a dashboard yaml with properly
configured cards that should render in HA. I will then use it in HAVDM next round
(a known good dashboard to test deployment and live preview functions)."

**Root cause — NOT MEASURED, and deliberately so.** The tester names the
confounder themselves. The input was an uncontrolled dashboard containing a HACS
card the instance does not have (`custom:gauge-card-pro`) and a non-existent
entity (`sensor.example_temperature`). Attributing a render failure to HAVDM
against that input would not be sound.

⭐ **The actionable half of this card is the request, not the failure.** See
`../FEATURE_REQUESTS.md` **FR-04**, which is a prerequisite for cleanly
re-testing HA-03, HA-04, HA-07 and HA-09 in round 4.

**§7 regression test.** Deferred until the fixture exists; the fixture is what
makes a regression test meaningful here.

---

### PROPS-03 — The entity picker searches and completes real entity ids

| Field      | Value                          |
| ---------- | ------------------------------ |
| Severity   | **Medium** (tester)            |
| Regression | No — failed rounds 1 and 2 too |

**Observed:** "light did not show any results"

**Root cause — MEASURED. This is a genuine product failure, and the card is
correct.**

⚠ **An earlier reading of this card as a defective worked example was wrong and
is recorded here because the correction matters.** The reference instance has no
`light` domain, which made "type `light`" look like the round-2 HA-04 card defect
repeating. It is not. **Three entities match "light"**, all
`platform: unifiprotect`:

- `binary_sensor.garage_360_status_light`
- `binary_sensor.front_yard_status_light`
- `binary_sensor.front_door_status_light`

**All three carry `entity_category: "diagnostic"`**, and the properties-panel
picker applies a diagnostic/config cut.

⭐⭐⭐ **`src/utils/entityDisclosure.ts:80-88` — shipped in PR #112 *for
PROPS-03* — documents this exact case verbatim:**

> "4. The search matched nothing visible — but WOULD have matched entities the
> cut removed. **On the reference instance, typing "light" matches exactly 3
> entities and all 3 are `entity_category: diagnostic`**, so the picker returned
> nothing while holding the answer."

So the tester should have seen:

> `No visible entity matches "light". 3 entities that match are marked diagnostic
> or config by Home Assistant. Tick "Show diagnostic & config" to see them.`

**Every input that message needs was present and correct on their machine.** The
persisted cache holds **725 entities and 1,397 registry rows**, with
`entity_category: "diagnostic"` recorded on all three. `EntitySelect.tsx:480`
wires `describePickerEmpty` into `notFoundContent`. **The message still did not
reach the user.**

⚠ **Why it did not surface is not yet measured** and needs the running app —
whether `notFoundContent` renders at all, whether `hiddenMatchingSearch` computes
against the restored registry, or whether the field the tester used takes a
different branch. That is the fix-time investigation.

⭐ **The card's `light` example should be kept exactly as it is.** It is the
sharpest available probe of the disclosure feature, and it is the case the
feature's own author documented.

ⓘ **HA-02 passed with the same observation** ("Partial pass. Typing 'light'
provides no results") and is the same mechanism.

**§7 regression test.** `auto_covered: true`, and the cited specs did not catch
it — the disclosure *strings* are unit-tested while the *surfacing* is not. Logic
defect → an **integration spec** asserting that a query matching only
diagnostic-filtered entities renders the disclosure sentence in the picker, driven
through the real component rather than the pure helper.

---

### THEME-02

Covered above with THEME-01 and HA-06 — one root cause across all three.

---

## 5. The card sweep — a clean negative result

The owner authorised a sweep of all 66 cards for the defect class
`CARD_CORRECTIONS.md` exists for: a worked example the reference instance cannot
satisfy.

**Five cards reference the absent `light` domain:**

| Card      | Round-3 verdict | Assessment                                                       |
| --------- | --------------- | ---------------------------------------------------------------- |
| CANVAS-02 | Pass            | illustrative mention only; card passed                            |
| PROPS-05  | Pass            | illustrative mention only; card passed                            |
| HA-02     | Pass (partial)  | ⭐ correct probe — same disclosure mechanism as PROPS-03           |
| PROPS-03  | Fail            | ⭐ correct probe — **keep exactly as written**                     |
| HA-04     | Fail            | the mention *is* the round-3 warning not to use such an id        |

**No card correction is warranted, and none was made.** The sweep's value is the
bounded negative: the round-3 failures are product failures, not card failures.

⭐ **Worth keeping: a correction register only works if you sweep for the defect
*class*, not just the card that caught you — and a sweep that returns nothing is
still a result.** Running it is what established that PROPS-03's example is
correct rather than merely unexamined.

---

## 6. Recommended order of work

Sequenced by what unblocks the most, not by severity alone.

| # | Item                                   | Why first                                                    | Cost      |
| - | -------------------------------------- | ------------------------------------------------------------ | --------- |
| 1 | **FR-04 known-good dashboard**         | unconfounds HA-03, HA-04, HA-07, HA-09 — four Highs           | S         |
| 2 | **HA-07 sections validator**           | one-line class of fix; unblocks deploying HAVDM's own output  | XS + test |
| 3 | **FILE-06**                            | §3.1 criterion 4 is engaged; smallest fix with a hard gate    | XS + S    |
| 4 | **Themes ×3** (dangling name)          | one cause, three Highs                                        | M         |
| 5 | **EXPORT-04** (persist the profile)    | one High; needs the "why doesn't it persist" step first       | M         |
| 6 | **CLIP-01** (canvas context menu)      | self-contained, both canvases                                 | S         |
| 7 | **VIEWS-04** (palette drop + targeting)| self-contained but two defects                                | M         |
| 8 | **HA-03** (rows, state, templates)     | three findings; largest surface                               | M–L       |
| 9 | **PROPS-03** (surface the disclosure)  | needs the running-app step first                              | S–M       |
| 10| **CANVAS-03** (stress suite)           | ⚠ instrument before fix — nothing to fix yet                   | S–M       |
| 11| **THEME-01 contrast audit**            | separate from the theme fix; owner called for a deep analysis | L         |

⚠ **Items 5, 9 and the "cannot be selected" half of 8 each need one step in the
running application before they can be specced as fixes.** They are the strongest
argument for the capability described in
`../../LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md`.

---

## 7. Open questions for the owner

These are recorded, not decided. §2 reserves all of them.

1. **PROPS-03's severity.** The tester marked Medium. The measured defect is that
   a disclosure feature built for this exact case did not reach the user, on a
   card whose own Expected calls an untypable picker a fail. **No re-mark is
   proposed** — raised only because the severity may understate it.
2. **THEME-03's blank skip reason and THEME-04's untested state** breach §3.1
   criterion 5. Both need either a reason or a verdict before round 4 closes.
3. **Whether the live-HA test tier may write to `ha.home.local`.** Amendment-03
   §4 scopes the write exception to **UAT rounds, not development**. The proposed
   tier needs that widened, and it is the owner's to grant. See the requirements
   document.

---

## 8. Constraints honoured

- **No UAT card marked, re-marked or re-scored** (§2). Every severity here is the
  tester's.
- **No GitHub Issues** (§3.5).
- **Round 1, 2 and 3 plans and session JSONs unedited.** The round-3 export was
  filed byte-identical (`cmp`) and committed non-executable.
- **Live `ha.home.local` read-only throughout** — `GET /api/states`,
  `lovelace/resources`, `lovelace/dashboards/list`, `lovelace/config`,
  `config/entity_registry/list`, `frontend/get_themes`. Nothing written.
- The tester's `config.json` and dashboard YAML files were **read, never
  modified**.
