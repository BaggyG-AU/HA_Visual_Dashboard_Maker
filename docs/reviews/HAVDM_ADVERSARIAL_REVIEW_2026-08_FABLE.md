# HAVDM Adversarial Review — 2026-08 (Fable)

**Reviewer:** Fable (Claude), adversarial brief from the owner
**Reviewed at:** `feature/uat-r3-triage-and-artifacts` @ `95c62f4` (PR #121, unmerged); `main` = `792c6ed`
**Subject under attack:** `docs/testing/uat/reports/uat_triage_v1.0.0-r3_2026-08-03.md`, `docs/testing/LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md`, the three-round UAT record, the codebase, and the ratified product vision (MemPalace `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`)
**Constraints honoured:** no UAT card marked or re-scored (§2); no GitHub Issues (§3.5); no merge; no `src/` change; `ha.home.local` read-only throughout; plans and session JSONs untouched; the tester's machine state read, never modified.

---

## 1. Verdict

**HAVDM is closer to a shippable 1.0.0 than "13 failures and the High count went
up" suggests, and round 3 is not evidence of structural rot — but the triage
that PR #121 files contains two wrong root causes and one wrong consolidation,
and its recommended remediation order would spend effort on a defect that does
not exist while missing the largest real fidelity gap.** The rise from 7 to 11
Highs decomposes almost entirely into one never-restored theme selection
(3 Highs), four Highs confounded by an uncontrolled fixture, and two canvas
affordances that were never built; that is normal convergence with honest
counting, not divergence. The one genuinely structural finding of three rounds
is not in the product but in the test regime: **only 4 of 80 e2e spec files
drive a real pointer gesture**, so the automated layers exercise an API the
user never touches, and UAT keeps being the first real user the product meets.
No pivot of the product vision is needed; the superset premise survives round 3,
but "honestly mark" is measurably not holding at the **view/layout** level of
export, which is where the remediation effort should now aim.

---

## 2. Confidence and method

**What I read:** the full round-3 triage document; the LIVE_HA test-capability
requirements; `UAT_STRATEGY.md` (roles, triage, severity, §7 mandate, §8
regressions); the r1/r2/r3 plans' relevant cards; all three session JSONs
(parsed, not skimmed); the eight MemPalace drawers named in the brief, fetched
by ID; the implicated source files at first hand.

**What I ran (all evidence commands are reproducible):**

- Re-ran every diff behind the six-regression refutation
  (`git diff --stat 199c8f6 a3b60b5 -- src/`, per-file diffs, theme grep).
- Parsed all three session exports and recomputed the tallies and the six
  cards' three-round histories.
- Read the tester's real machine state read-only: `config.json` **and the file
  the triage did not look at, `ha-capability-profile.json`**.
- Bundled and executed the real capability resolver (`esbuild` → node) against
  the tester's **actual persisted profile**, over the full 73-card registry.
- Fetched the instance's five themes read-only (`frontend/get_themes`) and
  checked which define the CSS variables `themeService.getThemeColors` maps.
- Extracted and viewed the session JSON's screenshots for PROPS-03, HA-07,
  HA-03 and THEME-01.
- **Launched the app** (dev build, headless Xvfb, isolated profiles) and ran
  four purpose-built probes: palette rendering with the tester's real profile;
  palette rendering never-connected; a 15-round real-mouse drag stress
  (single + multi-select) for CANVAS-03; and a literal-template selectability
  fixture cut from the instance's own `control-panel` dashboard. All four
  passed first run; the probe spec was deleted after use and is not committed.
- Read the tester's dashboard files and HAVDM's own exported file
  (`dashboard-ha_exported.yaml`) read-only, and traced each export artifact to
  the code that emits it.

**What I did not do, stated plainly:** no full e2e/integration suite run (the
branch is docs-only; the #118 baseline — e2e 295 = 285/8/2, integration
235 = 215/1/19 — remains valid, and my probes were review evidence, not gates);
no independent re-enumeration of the 11 dashboards' 29 card types (I re-verified
the two unregistered types against the real registry instead); no independent
asar-marker verification of the round-3 binary; no independent re-run of the
HA-03 entity-state checks against live `/api/states`.

---

## 3. Scope A — the thirteen failures, attacked one by one

Summary of verdicts on the triage document:

| Triage claim / defect                        | Verdict                                       |
| -------------------------------------------- | --------------------------------------------- |
| Six regressions are not code regressions     | **Confirmed** (one factual error inside it)   |
| Persisted state is the hidden variable       | **Partially confirmed**                       |
| EXPORT-04 root cause                         | ⚠⚠ **Refuted**                                |
| THEME-01 / THEME-02 root cause               | Confirmed, mechanism **incomplete**           |
| HA-06 folded into the same cause             | ⚠ **Refuted** — separate defect, measured     |
| FILE-06                                      | Confirmed                                     |
| CLIP-01                                      | Confirmed                                     |
| VIEWS-04                                     | Confirmed (one loose end)                     |
| CANVAS-03 (no cause offered)                 | Confirmed, plus a new bounded negative        |
| HA-07                                        | Confirmed, plus one extra defect found        |
| HA-03                                        | Confirmed; "cannot select" narrowed           |
| HA-04                                        | Confirmed (not independently re-measured)     |
| HA-09 ("not measured, deliberately")         | ⚠ **Incomplete** — it was measurable          |
| PROPS-03 ("message never reached the user")  | ⚠⚠ **Refuted by the tester's own screenshot** |
| Twelve of thirteen have measured root causes | Overstated — see the two refutations          |
| Live-HA tier fourth, not first               | **Confirmed** (with corrections to Tier 1)    |

### 3.1 The six-regression refutation — CONFIRMED, with one error in it

I re-ran every measurement rather than trusting it: the build delta is 32
files, +4560/−195 (nine PRs, #110–#118); `git diff 199c8f6 a3b60b5 --
src/components/GridCanvas.tsx` is empty; the `SectionsCanvas` drag gate sits at
lines 181/411/501 vs 182/412/503 (identical code, shifted lines);
`addRecentFile` has the same two call sites in both builds; zero theme files
changed; and I additionally checked the EXPORT-04-implicated files the triage's
table omits — `CardPalette.tsx`, `cardAvailability.ts`,
`capabilityProfileService.ts`, `main.ts` — **all byte-identical across the two
builds**. Both session JSONs record the build SHAs with asar-marker
verification. The refutation stands.

**The error:** the triage says "four of the six also failed in round 1 …
only CANVAS-03 and HA-06 were green in both prior rounds" (triage §2, repeated
in the THEME table as "HA-06 … green rounds 1 & 2"). **The r1 export records
HA-06 as `fail` (severity medium), note: "Theme change does not change how
things appear on the canvas."** Five of the six oscillate, not four; only
CANVAS-03 was green in both prior rounds. The error _strengthens_ the
oscillator argument while being exactly the kind of dot-history mistake the
triage's own method exists to prevent — and HA-06's r1 note is an early
sighting of the same symptom the triage then misattributed (see 3.4).

### 3.2 EXPORT-04 — root cause REFUTED

The triage's chain is: `capabilityProfile` is absent from the tester's
`config.json` → the profile never persists → `resolveCardState` sees
`haVersion === null` → "a connected user permanently gets never-connected
behaviour" → remediation item 5, "persist the profile."

**The profile does not live in `config.json` and never did.**
`capabilityProfileService.ts:30-35` persists it to a **dedicated
electron-store file**, `ha-capability-profile.json` (the file's own header
comment says so, citing the `ha-credentials` precedent). On the tester's
machine that file **exists**: 1,853 bytes, mtime **2026-08-03 19:43** (during
round 3), `haVersion: "2026.7.4"`, `capturedAt` matching the mtime,
**24 installedElements — exactly the set the triage's own resolver run
predicted** — and `cardModPresent: true`. The capture-and-persist path
(`main.ts:588-610`) works. The triage measured the absence of a key from the
wrong file and built its strongest-labelled finding on it.

**What actually failed, measured:**

1. **The palette loads the profile once at mount and never again.**
   `CardPalette.tsx:68-80` is a one-shot `capabilityGetProfile()` effect with
   no subscription. `captureCapabilityProfile()` (App.tsx, fire-and-forget on
   connect) updates the store in the main process but nothing pushes the new
   profile to an already-mounted palette. The tester connected at 19:43 —
   mid-session, per `capturedAt` — so a palette mounted earlier kept the
   permissive default for the rest of that app session.
2. **The footer notice renders below the fold.** My app probe with a
   never-connected default measured `palette-availability-notice` at
   **y ≈ 1096 on a 1080-high screen — outside the viewport**
   (`inViewport=false`). The tester's "There is no 'pallet footer' that I can
   see" is literally accurate in _both_ possible states: never-connected → the
   notice exists but is off-screen; profile loaded → the notice is correctly
   absent.
3. **The marking itself works.** With the tester's real
   `ha-capability-profile.json` seeded into a fresh profile, my app probe shows
   `custom:power-flow-card` and `custom:battery-state-card` both rendering
   grey **"Not Available"** badges, and the notice correctly absent. Running
   the real resolver over the full 73-card registry with that profile:
   **50 available / 16 not-available / 7 havdm-only** — including
   `custom:gauge-card-pro` in the same sensor category, so the triage's
   "exactly two cards in Sensors & Display" is an undercount of its own
   prediction.

**Consequences:** the triage's §7 regression test for this card ("assert a
capability capture persists and survives a restart") **passes on today's
code** — it would certify the defect fixed while changing nothing the tester
experiences. The right fix is propagation and surfacing, not persistence
(§6, F4). The Tier-1 requirement in
`LIVE_HA_TEST_CAPABILITY_REQUIREMENTS.md` §3 item 1 inherits the same error,
as does its Blind-spot-C table.

### 3.3 THEME-01 / THEME-02 — cause confirmed, mechanism incomplete

The observable chain is right: `currentTheme` null → `themeStore.ts:228`
returns "No active theme to save" (THEME-02's error verbatim), and the tester's
`selectedTheme: "Mushroom Shadow"` / `themeSyncWithHA: false` are exactly as
the triage reports.

But the mechanism is not a _dangling_ name — **it is a name nobody ever tries
to resolve.** The boot effect (`App.tsx` `loadThemePreferences`) restores only
`darkMode` and `syncWithHA`. **No renderer code calls `getSelectedTheme` at
all** — the persisted key is write-only (`themeStore.ts:172,294` write it;
nothing reads it back). And `setTheme` (`themeStore.ts:155-158`) silently
returns unchanged state for an unresolvable name, so even the in-session path
swallows failures without a word.

Why the distinction matters: under the triage's story, a user whose persisted
selection is a HAVDM built-in would restore fine and only HA-sourced names
break. **In reality nothing restores — a user who picks `HAVDM Midnight` and
restarts also comes back to no active theme.** The defect class is "persisted
selection is never re-applied", strictly wider than "a persisted reference can
dangle", and the triage's recommended fix ("re-resolve `selectedTheme` on
load") presupposes a load that does not exist. The correct §7 test asserts a
restart restores a built-in selection _and_ that an unavailable name degrades
visibly.

### 3.4 HA-06 — the "one cause, three Highs" consolidation is REFUTED

After connect, `fetchThemes` → `setAvailableThemes` **merges the instance's
five themes into the picker regardless of `syncWithHA`**
(`themeStore.ts:117-131`), so in-session the tester could select any of the
nine by name and `setTheme` would resolve it. The dangling/never-restored
mechanism cannot explain "Only **some** change the canvas colour."

**The real mechanism, measured at both ends:** HAVDM's canvas consumes exactly
six theme variables via `themeService.getThemeColors` (`themeService.ts:81-99`)
— `primary-color`, `accent-color`, `primary-text-color`,
`secondary-text-color`, `primary-background-color`, `card-background-color`.
I fetched the instance's five themes read-only: **Material You defines 555
top-level variables including all of those; the four Mushroom variants define
0–10 variables and none of those six** (`Mushroom` itself defines zero
top-level variables — it is a card-styling theme). So: the four built-ins and
Material You recolour the canvas; every Mushroom theme changes nothing. That
is the tester's sentence, reproduced from theme _content_, independent of any
persistence defect — and it matches HA-06's round-1 failure note ("Theme
change does not change how things appear on the canvas"), which predates the
round-3 persisted state entirely.

The tester's instruction on this card — _"You need to fully research how the
themes in HA are applied and replicate that in the app"_ — is the correct
remediation frame: HA applies a theme as **hundreds of CSS custom properties
layered in three steps (default theme → mode-independent top-level keys →
mode-specific keys)** over components that consume them everywhere
([frontend integration docs](https://www.home-assistant.io/integrations/frontend/)).
HAVDM samples six of those properties and paints two. A theme that styles
cards, not page background — which describes most HACS themes, Mushroom
included — is invisible to HAVDM's canvas by construction. F3 in §6 addresses
this; it is **not** part of the restore fix and should not be closed by it.

### 3.5 FILE-06 — CONFIRMED

Independently re-verified all three legs: `addRecentFile` has exactly two call
sites in both builds (`:585/:622` at `199c8f6`, `:603/:644` at `a3b60b5` —
File → Open and Open Recent; no Save As site); the tester's `recentFiles`
holds six entries, all opened files; `uat_dashboard4.yaml` exists on disk
(mtime 18:45 round-day) and is absent from the list. §3.1 criterion 4 is
engaged (`auto_covered: false`); the proposed e2e-plus-seam coverage is right.

### 3.6 CLIP-01 — CONFIRMED

`grep -n onContextMenu src/components/GridCanvas.tsx` returns nothing; the
only `trigger={['contextMenu']}` in `src/` is `CardContextMenu.tsx:75`,
mounted per-card at `GridCanvas.tsx:527`. CANVAS-06 passing as the
discriminator is sound. Missing feature, not breakage; both canvases need the
menu (F6).

### 3.7 VIEWS-04 — CONFIRMED, one loose end

Mechanism verified in source: `SectionsCanvas` has no palette-drop handler and
its two drop targets gate `preventDefault()` on flags only internal drags set,
so HTML5 DnD refuses every palette drop on a sections view; `GridCanvas` has
the palette handler at `:461-462` that Sections lacks. The triage's reading of
the tester's wording (could drag _across_, never _into from the palette_) is
consistent.

**Loose end the triage never reconciles:** the tester says double-click lands
cards in the **last** section; `App.tsx:1078-1079` defaults to section **0**.
The likely resolution is that adding a section selects it (so the "selected
section" was the last-added one), but the triage asserts the mechanism without
closing that gap. Minor, but the fix's test should pin down what
`selectedSectionIndex` is after "Add section".

### 3.8 CANVAS-03 — CONFIRMED, and I ran the instrument the tester asked for

The triage's refusal to invent a cause is correct discipline. I added the
missing measurement: a Playwright probe performing **15 real-mouse drag rounds
against the dev build** (10 single-card drags of varying vectors, 5
multi-select drags with Ctrl-toggled selection, real `mouse.down/move/up`,
settle-checks at +350 ms and +750 ms). **Zero snap-backs.** That is a bounded
negative — it does not prove absence, but it is the first real-gesture
evidence on this card, it supports non-reproduction, and it is the seed of the
stress suite the tester requested (F11). `handleDragStop`
(`GridCanvas.tsx`) contains only an unchanged-geometry early return; the
obvious suspects remain excluded.

### 3.9 HA-07 — CONFIRMED, plus one more defect in the same validator

Independently extracted the screenshot; the error text is verbatim;
`DeployDialog.tsx:118-120` is as quoted; a `sections` view legitimately has no
top-level `cards` (cards live under `sections[].cards`, each section a grid on
a 12-column model — [sections docs](https://www.home-assistant.io/dashboards/sections/),
[custom-card grid options](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)).
Two additions:

1. **`DeployDialog.tsx:115-117` also throws when a view has no `title`** —
   Lovelace does not require view titles (icon-only and untitled views are
   routine). A second class of valid dashboards HAVDM refuses to deploy.
2. The codebase already knows the fact the validator violates:
   `GridCanvas.tsx:291-295`'s own comment explains that a sections view keeps
   its cards under `section.cards` and `view.cards` is empty. **The canvas
   and the deploy gate hold contradictory models of the same structure** —
   the strongest single piece of evidence in round 3 for validating against
   one shared schema rather than per-dialog ad-hoc checks (vision answer 7's
   two-schema split, still unimplemented at this boundary).

The "check your connection" sub-line on a validation failure is Medium-class
mislabelling, as the triage says.

### 3.10 HA-03 — CONFIRMED on all three findings; "cannot select" narrowed

(1) Rows: re-verified against the **real registry object** — 73 types
registered; `divider` and `custom:template-entity-row` absent.
`template-entity-row` is an entities-card _row_ powered by backend Jinja
([thomasloven/lovelace-template-entity-row](https://github.com/thomasloven/lovelace-template-entity-row));
`divider` is a native entities-row type. Neither is a card, which is why the
card-level parity guard (`KNOWN_UNRENDERED_PALETTE_CARDS = []`) can be green
while 24 live uses fail to render — the honest-marking metric has a blind
spot one level below cards.

(2) State-not-reaching and (3) literal templates: I reproduced (3) in the app
with a fixture cut from the instance's own `control-panel` dashboard (the
`wx-header` markdown card and two `mushroom-template-card`s): raw HTML renders
as text, `{{ … }}` renders literally, template icons render as oversized
clipped `mdi:*` text over the card face — the tester's screenshot, recreated.
In HA, a markdown card's Jinja is rendered by the backend
([markdown card docs](https://www.home-assistant.io/dashboards/markdown/));
HAVDM displays the source. **This is a fourth honesty failure mode**: not
hiding a right answer (PROPS-03) but displaying wrong content where the vision
demands a marked "resolves in HA" placeholder.

**"Some cards cannot be selected", probed:** in my four-card fixture every
card remained selectable — `document.elementFromPoint` at each card's centre
resolved inside that card, because the overflowing literal text belongs to the
card itself. The interception hypothesis survives only in the narrower form
_"a neighbour underneath another card's overflow is blocked"_, which my
spaced fixture could not produce. Still unproven; the fix for (3) will
dissolve it either way, and the fix-time test should include an
overlapping-neighbour arrangement.

### 3.11 HA-04 — CONFIRMED (not independently re-measured)

I did not re-run the matcher; the r2 investigation
(`drawer_havdm_investigations_20af152af9b52acaa4b99c2c`) measured the scoring
against 725 live entities and the r3 evidence (`input_boolean.toggle`
nonexistent) is consistent with the tester's own note. The
correction-did-not-bind lesson is sound. The un-measured half ("no filters
appear to be applied") remains un-measured; fold it into F8's dialog work.

### 3.12 HA-09 — INCOMPLETE: it was measurable from artifacts already in hand

The triage declines to measure ("uncontrolled fixture, deliberately"). But the
deployed file plus the instance's resource list _predict_ the render outcome
without any screenshot:

- Views 2/3 of `dashboard-ha_exported.yaml` are `type: custom:grid-layout` —
  a **HACS layout-card view type**
  ([thomasloven/lovelace-layout-card](https://github.com/thomasloven/lovelace-layout-card)),
  and **layout-card is not among the instance's 11 resources**. Those views
  cannot render on that instance at all.
- View 1 has no `type` (masonry) while its cards carry
  `view_layout: grid_column/grid_row` — keys **only a layout-card view
  consumes**. HA's masonry ignores them; the designed geometry silently
  collapses to masonry stacking.
- Plus the two tester-supplied confounds the triage did name
  (`custom:gauge-card-pro` not installed; `sensor.example_temperature`
  nonexistent).

Two of those four causes are **HAVDM export defects, not fixture confounds**
(§5.2). The triage's framing routes all of HA-09 to FR-04 — but a
hand-authored known-good dashboard will deploy cleanly _and leave the export
path broken_, because FR-04 never exercises Export-for-HA. FR-04 remains
first; its definition must include a HAVDM-authored, HAVDM-exported round-trip
leg (§6, direction P1).

### 3.13 PROPS-03 — the central claim is REFUTED by the tester's own screenshot

The triage: _"Every input that message needs was present and correct on their
machine … **The message still did not reach the user.**"_ and the [STATE]
drawer generalises it into "a disclosure the product computes correctly but
never shows."

**The session JSON contains a PROPS-03 screenshot. It shows a Button card's
Entity picker with `light` typed and the full disclosure rendered, verbatim:**
_"No visible entity matches "light". 3 entities that match are marked
diagnostic or config by Home Assistant. Tick "Show diagnostic & config" to see
them."_ The checkbox it names exists in that same picker
(`EntitySelect.tsx:521-526`). The feature the triage says never surfaced is
photographed surfacing, by the tester, in the evidence file the triage itself
verified — and the triage's own new standing instrument ("extract and look at
the screenshots", minted for HA-07 in the same document) was never applied to
this card.

What remains true: the tester typed `light`, got no selectable results, wrote
"light did not show any results", and failed the card — reasonably, because
the card's steps 3–4 ("Read the suggestions offered. Pick one from the list.")
**cannot be completed on this instance without ticking a box the card never
mentions.** So the evidence supports one of three readings, and §2 makes the
choice the owner's:

1. **Card gap** — the card should instruct the tick (or set the Expected to
   "the disclosure names the three hidden matches"), in which case the round-3
   sweep's "no correction warranted" conclusion missed a correction of a
   _different_ class than the one it swept for;
2. **UX gap (Medium at most)** — a correct, visible explanation that testers
   read past argues for making the escape hatch actionable in place (a
   clickable link in the message, or auto-reveal-with-badge);
3. Both.

What the evidence no longer supports is "genuine product failure: the
disclosure did not reach the user", the running-app investigation the triage
schedules for it, or the open question's framing that severity "may
understate" a defect that is, on the screenshot, a working feature. ⚠ One
honest caveat: the note is one line and the screenshot one moment; if the
tester's complaint was about a _different_ picker or a post-tick failure, the
export does not record it. The screenshot is nonetheless the only direct
evidence anyone has, and it contradicts the filed conclusion.

### 3.14 The LIVE_HA test-capability document, attacked specifically

Its central claim — **three of four tiers need no live instance, and the
live-write tier is fourth** — is **confirmed**, and this review is itself
evidence: every probe above ran offline against seeded profiles and captured
configs, and settled questions the triage marked "needs the running app."
Corrections, though:

- **Tier 1 item 1 tests the wrong thing** (capture persistence works; the test
  as specced passes on current code — §3.2). Replace with: _"after an
  in-session connect and capture, the palette reflects the new profile without
  a restart, and the never-connected notice is inside the viewport."_
- **Blind-spot C's table repeats both refuted causes** (EXPORT-04 "never
  written"; the theme trio as one cause). The _class_ it names — persisted
  state is unexercised — survives and is the right class; the exhibits need
  correcting so Tier 1's test list is derived from true causes.
- **Tier 1 item 4's general guard is half-right.** "A restore whose referent
  is gone must degrade visibly" misses round 3's actual lesson: `selectedTheme`
  has **no restore at all**. The guard should be: _every persisted key has a
  consumer on the restore path (assert by test), and a restore whose referent
  is gone degrades visibly._
- **Tier 2 is the strongest tier; add an export leg.** Its five must-covers
  are all load-direction. §5.2's export defects (dead `view_layout` on
  masonry, capability-unchecked `custom:grid-layout`) are exactly
  fixture-fidelity material: assert what `Export for Home Assistant` emits for
  each view type against a profile with and without layout-card.
- The "ten of thirteen would have been caught" arithmetic should be restated
  after the Tier-1 respec; the conclusion (live tier fourth) does not move.

---

## 4. Scope B — the broad review

### 4.1 `PropertiesPanel.tsx` (7,128 lines) and `App.tsx` (3,528 lines)

Argued from the defect record, not a style guide: the round-3 failures that
live in these files are **locality failures**, not complexity failures.
FILE-06 exists because the Save As handler in `App.tsx` doesn't do what the
File → Open handler does ~40 lines away; the capability capture is a
fire-and-forget in `App.tsx` whose result nothing consumes (§3.2); the theme
boot restore in `App.tsx` restores two of the three persisted theme keys
(§3.3); the sections add-target default sits in `App.tsx` a thousand lines
from the canvas that renders its consequence. **The pattern is that `App.tsx`
is the home of every cross-cutting seam (persistence, connection, menus), and
seams that live in a 3,500-line component get partially wired.** That
justifies targeted extraction — a file-menu/persistence module, a
connection-lifecycle module with an explicit "on connect: fetch entities,
capture profile, fetch themes, **publish all three to their consumers**"
contract — not a big-bang refactor. `PropertiesPanel.tsx` (42 `<EntitySelect>`,
85 `<Select>`) produced comparatively few round-3 defects; its cost is
feature-velocity (the standing "no type-specific property forms for eleven new
cards" item), and the natural seam is a per-card-type form registry mirroring
`cardRegistry`. Maintainability problem: **real but second-order; schedule
extraction opportunistically with fixes touching those seams (F2, F4, F7), not
as its own campaign.**

### 4.2 The `auto_covered` problem — discipline or architecture?

**Architecture — of the test harness, not the product.** The measured facts:
**4 of 80 e2e spec files use any real pointer gesture; 2 use `mouse.down`**;
26 of the tests in `live-preview-deploy.spec.ts` are still
`expect(true).toBe(true)` placeholders; and the eighteen recorded forms
cluster into one family — _the spec drives the DSL layer that sits below the
input layer where users live_. The DSL was built to defeat antd/Playwright
flakiness and it succeeded (the suite's stability record proves it); the
side-effect is that `palette.addCard()` **is** the user's missing gesture
performed programmatically, everywhere, always. A product this
pointer-interaction-heavy (drag, drop, right-click, hover-reveal) cannot be
honestly covered by an API-driven suite alone.

The remedy is therefore **additive, not corrective**: keep the DSL suite as
the regression mass; add a small real-gesture tier (LIVE_HA doc §6 /
Tier 3 — F5, F6, F11 seed it; my CANVAS-03 probe shows it runs fine headless);
and make the §3.2 plan-generation audit recipe ("follow the DSL method, check
which control it drives, ask whether the assertion could ever have failed at
that input") a **required column in every card's `auto_note`** rather than a
post-hoc triage tool. Discipline exhortation alone would fail: eighteen forms
accumulated under a regime that already valued honesty.

### 4.3 145 lint warnings — debt or noise?

Measured composition (src/): **105 × `@typescript-eslint/no-explicit-any`,
20 × `react-hooks/exhaustive-deps`, 10 × `no-unused-vars`, 4 misc.** Verdict:
two different substances under one number. The `any`s are slow-burn typing
debt — hold the baseline, ratchet down opportunistically. **The 20
`exhaustive-deps` warnings are live risk**: stale-closure/one-shot-effect
bugs are exactly the EXPORT-04 palette-staleness family (§3.2), and 20
suppressed instances mean up to 20 more places where an effect reads state
that has moved on. Burn those to zero as their own small slice, each one
either fixed or annotated with a reasoned disable comment. A single "145
held" number treats these identically and hides the risky twenty.

### 4.4 The three-suite split and the Regression Gate Matrix

The split (unit/integration/e2e) and the escalation rules are sound and the
discipline around them (red legs, reach analysis, never blind-rebaseline) is
genuinely strong — better than most professional codebases. The gap round 3
exposes is that the matrix keys on **code reach** ("which files changed")
while the round-3 regressions were **state-reached** — same code, different
persisted profile. No gate, at any tier, launches twice against one profile.
Add Tier-1 restart specs to the Slow gate and the matrix covers the axis it
currently cannot see. Secondary: the watched-flake ledger and stable-known
set are well curated; the six 64px-stale visual snapshots should be
rebaselined deliberately in their own PR rather than left as permanent noise.

### 4.5 Other findings

- **`fs:readFile`/`fs:writeFile` accept any absolute path** (standing item,
  flagged TOP SECURITY in [STATE]). For an app that runs
  attacker-authorable YAML through import pipelines, path-unscoped IPC file
  access is the classic Electron escalation primitive. **Should gate 1.0.**
- **Code signing** (spun out of CLIP-02's Acronis alert): an unsigned binary
  that trips ransomware heuristics on a tester's machine will do the same on
  every user's machine. Ship-gating for any public 1.0.
- The prettier-ignore boundary (`docs/testing/uat/{sessions,reports,archives}`
  ignored; `docs/testing/*.md` not) has now bitten twice; one line in
  `CLAUDE.md`'s gate section would stop a third.
- `Node v20.19.6` vs `engines >=22.0.0` remains an unresolved inconsistency
  in the dev environment; either enforce or relax.

---

## 5. Scope C — vision fidelity, with the HA research it demands

### 5.1 What I verified about Home Assistant (sources inline)

1. **Config model.** Storage-mode dashboards are edited over the
   `lovelace/*` WebSocket API; dashboard `id` and `url_path` are distinct
   (HA-08's root cause, already fixed). Views hold `cards`, `badges`,
   `sections`, `type`, `max_columns`.
2. **View types.** Masonry (default) holds `cards` and lays them out in
   columns; **a `sections` view holds `sections[].cards` and has no top-level
   cards array** ([sections docs](https://www.home-assistant.io/dashboards/sections/),
   introduced with the 2024 "Dashboard chapter 1" release —
   [HA blog](https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1/)).
   `custom:grid-layout` et al. are **HACS layout-card** view types, not core
   ([layout-card repo](https://github.com/thomasloven/lovelace-layout-card)).
3. **The sections grid.** Each section is a 12-column grid; cards size via
   `grid_options` (`columns`, `rows`, min/max), with `full` for full-width
   ([custom card dev docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)).
   **`view_layout` is a layout-card concept and means nothing to core views.**
4. **Entity rows vs cards.** `divider` and `custom:template-entity-row` are
   children of an `entities` card, not cards; `template-entity-row` renders
   backend Jinja ([repo](https://github.com/thomasloven/lovelace-template-entity-row)).
   HA-03's two unrenderable types are both this shape.
5. **Themes.** A theme is a map of CSS custom properties, applied in three
   layers (default theme → mode-independent keys → `modes.light`/`modes.dark`
   keys) across the entire frontend
   ([frontend docs](https://www.home-assistant.io/integrations/frontend/),
   [set_theme](https://www.home-assistant.io/actions/frontend.set_theme/)).
   Which variables a theme sets is entirely up to the theme — Mushroom sets
   card-level variables and zero page-level ones (measured, §3.4).
6. **HACS and custom cards.** Installed cards register as Lovelace
   _resources_; a frontend discovers capability by the resource list — which
   is precisely what HAVDM's capability capture reads. Correct design.
7. **Templating.** Jinja in markdown cards (and template rows/cards) is
   rendered by the **backend** ([markdown card](https://www.home-assistant.io/dashboards/markdown/));
   a design tool cannot faithfully evaluate it offline and should mark, not
   render, template content (§3.10).
8. **Prior art.** HA's own editor has been drag-and-drop with a real grid
   since 2024; in-HA visual builders exist
   ([Drag-And-Drop-Card / HADS](https://github.com/Prosono/Drag-And-Drop-Card)).
   Everything in this space that users adopt lives **inside** HA, with zero
   render-fidelity gap by construction. HAVDM's fidelity gap is the price of
   its differentiators (offline, desktop, VCS-file-first, superset design);
   the record of three rounds says that price is currently being paid by the
   user at deploy time.

**Where HAVDM's model of HA is simply wrong — the answer to §4's question:**

- **The deploy validator's view model** (every view has `cards`, every view
  has `title`) — wrong for sections and untitled views (§3.9), while the
  canvas holds the correct model. One product, two models.
- **The export's layout model** — it treats `view_layout` grid coordinates as
  meaningful on core views (they are layout-card-only) and treats
  `custom:grid-layout` as free (it is a HACS dependency the capability
  profile already knows how to check, and doesn't) (§3.12, §5.2).
- **The theme model** — six sampled variables standing in for a
  whole-frontend cascade (§3.4).
- **The entities-card model** — rows are not cards, and the card-level parity
  guard cannot see them (§3.10).
- **Templates** — design-time rendering of backend-resolved source (§3.10).

Five wrongnesses, one family: **each is a place where HAVDM models HA one
level shallower than HA actually is** (view instead of view-type; card
instead of row; variable-sample instead of cascade; source instead of
resolved-content). Round 3's "unrelated" failures are this family surfacing.

### 5.2 Is the three-way TRANSLATE / STRIP / CANVAS-ONLY boundary real?

**Yes at the card/key level — measurably.** `haExportContract.ts` encodes the
classification; `cardModTranslator.ts` (B6) compiles the ten layout keys to
`card_mod` CSS with the same normalizers the canvas uses;
`canvasPlaceholderTranslator.ts` (B7) implements answer 9's markdown
placeholder; `exportWarningSummary.ts` (B8) does the honest-marking prose. The
tester's own `dashboard-ha_exported.yaml` shows all of it live: a compiled
`card_mod` block on a vertical-stack, and a markdown "Card Not Available"
placeholder holding the popup card's slot. This is the vision, working.

**No at the view level — measurably.** The same file shows HAVDM's scaffold
view exported as typeless masonry with dead `view_layout` keys on every card
(geometry silently lost — neither translated nor marked), and
`custom:grid-layout` views emitted with no check against a capability profile
that knows layout-card is absent (`installedElements`: no grid-layout;
`cardModPresent` is checked for card-mod — the analogous check for layout-card
was never built). **The boundary's classification is per-card and per-key;
round 3's worst fidelity failures are per-view.** The contract needs a view
axis: sections/masonry/panel = native targets; geometry-preserving export
targets sections `grid_options` by default and layout-card only when present;
anything else is strip-and-warn.

### 5.3 Is "honestly mark" holding? — the measured set

- Palette card level: **holding.** Parity guard empty and enforced; canvas-only
  badges render; not-available badges render against a real profile (probed).
- Surfacing level: **not holding** — the marks exist but a mounted palette
  never refreshes and the never-connected notice sits off-viewport (§3.2).
  A mark the user cannot see is not a mark.
- Row level: **not holding** — 24 live uses of two row types render nothing
  and no register tracks them (§3.10).
- Template level: **not holding** — template source renders as content (§3.10).
- View level: **not holding** — geometry dies silently on export (§5.2).

The vision's own standard — _the set of things you cannot render must keep
shrinking_ — is met at the level the guard measures and unmet at four levels
the guard doesn't. The metric needs to follow the defects down a level.

### 5.4 Is the vision itself right? Card-mod? Two schemas? Would a user prefer this to YAML?

**The superset premise survives round 3.** Nothing in the record says
translate-and-honestly-mark is the wrong idea; the record says it is
implemented one level too shallow (§5.1). No vision pivot is warranted, and I
am explicitly not manufacturing one.

**Card-mod as load-bearing: an acceptable, hedged bet.** It is installed on
the reference instance, `cardModPresent` is checked, and the strip-and-warn
fallback exists — the dependency degrades honestly. The _unhedged_ dependency
the vision never names is **layout-card** (§5.2): geometry-faithful export of
freeform canvas layouts has no native HA target on masonry, and the code
quietly leans on a HACS view type without checking for it. The vision should
name it and answer 4's pattern should govern it (emit when present, translate
to sections `grid_options` or strip-and-warn when absent).

**The two-schema split (answer 7) is aspirational, and HA-07 is the cost of
its absence.** The deploy gate runs hand-rolled per-dialog checks that
contradict the canvas's own model. Building the strict fidelity schema —
derived, as the vision says, from the capability inventory plus per-card
known keys — would have made HA-07 impossible to write.

**Would a real HA user prefer this to YAML? Honestly: not yet — and for
HA-first users, possibly never for the in-HA editing loop.** HA's own editor
closed the drag-and-drop gap in 2024 with zero fidelity risk, inside the
product, free. HAVDM's winnable users are the ones the in-HA editor cannot
serve: dashboards as **files** under version control (the VCS features are
already unusual and good), offline/bulk design, multi-dashboard workflows,
and design capability HA lacks. For those users the deciding factor is
exactly one thing: **what comes out of Export must render in HA the way the
canvas promised, or say why not.** Every direction in §6 that touches export
fidelity is therefore vision-critical; polish elsewhere is not.

---

## 6. ⭐ Directions for Opus

**Read §3 before executing anything from PR #121's triage §6 order-of-work —
two of its items aim at refuted causes.** Where this review disagrees with the
filed triage, both positions are stated; the owner arbitrates. Costs: XS <1h,
S ≈ half-day, M ≈ 1–2 days, L > 2 days (judgements, not measurements).

### Pivots (process/architecture — none touch the product vision)

**P1 — Correct the remediation plan before executing it.** _(Priority 0,
cost XS, this is a decision not a code change.)_
The filed order (triage §6) stands except: **item 5 "EXPORT-04 — persist the
profile" is void** (persistence works; §3.2) — replace with F4 below;
**item 4 "Themes ×3 one cause" splits** into F2 (restore) and F3 (HA-06
mapping), which do not share a fix; **add F9 (view-level export contract)**,
absent from the filed list entirely despite being HA-09's HAVDM-owned half;
and **FR-04's definition must include an export-round-trip leg** — author the
known-good dashboard _in HAVDM_, export it, deploy the export — otherwise
FR-04 masks the export defects §3.12 measured. Guard rail: do not reorder
FR-04 off the top; four Highs stay confounded until it exists.

**P2 — Add the two missing test axes; do not rebuild the DSL suite.**
_(Priority 1, cost M across slices.)_ Tier-1 restart specs (respecced per
§3.14) and a small real-gesture tier (seeded by F5/F6/F11). Guard rails: the
DSL suite is the regression mass — do not convert existing specs to gestures
wholesale; gesture specs assert computed style and `elementFromPoint`, never
bare `toBeVisible()`; Tier-1 specs must relaunch against the same profile dir
(`LaunchOptions.reuseUserDataDir` exists for exactly this). Proof: each tier
catches its named round-3 defect on the pre-fix commit (red leg) per
`UAT_STRATEGY.md` §7.

### Fixes, ranked

**F1 — HA-07: the deploy validator.** _(P0, XS–S.)_
`DeployDialog.tsx:113-121`: validate per view type — a `sections` view
requires `sections[]` (validate `sections[].cards`), not `view.cards`; drop
the mandatory-`title` check (:115-117) or demote to warning; stop printing
"check your connection" for validation failures. **Must not change:** no
silent mutation of the config to make it pass; the validator reports, the
user decides. **Proof:** unit specs — a sections view with no top-level
`cards` validates; an untitled view validates; a genuinely malformed view
still fails; a validation failure never mentions the connection. Red leg on
current code with the tester's own exported file.

**F2 — Theme restore (THEME-01/02).** _(P0, S–M.)_
Boot: consume `getSelectedTheme` (nothing does today — §3.3) and apply via a
new resolve-with-fallback path; `setTheme`'s silent
`if (!nextBaseTheme) return state` (`themeStore.ts:155-158`) must instead
record the requested name and surface a visible "theme X isn't available —
using Y" note; `setAvailableThemes` re-resolves a pending name when the merge
supplies it. **Must not change:** the HA-wins collision spread
(`themeStore.ts` comment says never invert it); no auto-apply of HA's default
theme when `syncWithHA` is false; visual baselines are captured with no theme
selected — restore must not change the _default_ state of a fresh profile.
**Proof:** unit specs (persisted built-in restores; unavailable name falls
back visibly and re-resolves after `setAvailableThemes`; `saveCurrentTheme`
works after a normal restore) plus one Tier-1 restart e2e. Red leg: restart
with `selectedTheme: "HAVDM Midnight"` currently comes back with
`currentTheme: null`.

**F3 — HA-06: canvas theme application.** _(P1, M — separate from F2.)_
`themeService.getThemeColors` samples six variables; most HACS themes define
none of them (§3.4). Either (a) replicate HA's three-layer application over a
fuller variable set with HA's default light/dark values as the base layer —
the tester's explicit instruction — or (b) short-term: when a selected theme
defines none of the canvas-relevant variables, badge it in the picker
("styles cards only — canvas colours unchanged"). Do (b) first, it is honest
marking; scope (a) properly. **Must not change:** `builtInThemes` contrast
contract; the four built-ins' luma guard. **Proof:** unit spec feeding real
Mushroom/Material-You fixtures (captured this review, read-only) through
`getThemeColors`; assertion that a no-op theme is marked. THEME-01's
contrast-audit demand stays its own item (the filed triage is right there).

**F4 — EXPORT-04: propagate and surface, do not "persist".** _(P1, S–M.)_
(a) On successful `capability:capture`, push the new profile to the renderer
(IPC event → palette state, or move profile into a store the palette
subscribes to); (b) move the never-connected notice inside the viewport
(sticky palette footer or a banner above the category list — it currently
renders at y≈1096 on a 1080 screen, §3.2); (c) keep the badge rendering
exactly as is — it is correct (probed). **Must not change:** the
palette must keep resolving from the _persisted_ profile, never a live query
at render time (standalone principle,
`drawer_havdm_decisions_0a5220b0b581800521a959f6`) — the push is a cache
refresh of the same persisted object; the permissive never-connected default
(vision answer 5) stays. **Proof:** integration spec — connect, capture,
assert the palette shows "Not Available" on a known-absent card _without a
relaunch_ (fails today); e2e assert the notice's bounding box is inside the
viewport (fails today). The triage's proposed persist-and-restart test must
NOT be written as the closure test — it passes on the broken build.

**F5 — VIEWS-04: sections palette drop + add-target.** _(P1, M.)_
Give `SectionsCanvas` the palette-drop path `GridCanvas` has (`:461-462`):
unconditional `preventDefault()` for palette payloads on section drop targets
and an `onPaletteDrop(sectionIndex)` prop; make double-click add land in the
_selected_ section and make the selected section visibly selected; pin down
what "Add section" sets `selectedSectionIndex` to (the tester's "lands in the
last section" vs the code's default-0 is unreconciled — §3.7). **Must not
change:** the internal card/section drag flags and their gating — internal
DnD works and CANVAS-06/VIEWS-05 depend on it. **Proof:** real-gesture e2e —
drag a palette card into an empty section and a populated one (both fail
today), plus a double-click targeting assertion.

**F6 — CLIP-01: canvas context menu.** _(P2, S.)_ Both canvases, Paste plus
empty-canvas-sensible actions only, reusing `CardContextMenu`'s
`onOpen`-selection discipline and the `.ant-dropdown` mousedown guard
(`GridCanvas.tsx:445-458` documents why). **Proof:** real-gesture e2e:
right-click empty canvas → menu → Paste lands a card (fails today).

**F7 — FILE-06: Save As registers + tooltip.** _(P0 — cheapest engaged
criterion, XS–S.)_ Add the third `addRecentFile` call site on the Save As
success path; add the full-path tooltip to the Recent Files submenu items.
**Must not change:** cancelling the native dialog must still abandon cleanly
(the `App.tsx:769` comment documents that trap). **Proof:** §3.1 criterion 4
is engaged — e2e through the DSL asserting the new path appears, plus a seam
unit test; red leg exists by definition (fails today).

**F8 — HA-03: rows, state, templates.** _(P1, M–L, after FR-04.)_
(a) Render `divider` and `custom:template-entity-row` as entities-card
children (divider natively; template-row as an honestly-marked row — see (c));
(b) trace why cached state does not reach imported-dashboard cards (the
"unknown" finding — un-refuted, un-re-measured here); (c) **detect Jinja
(`{{ }}`/`{% %}`) in displayable strings and render a marked "template —
resolves in Home Assistant" chip instead of the source** — never evaluate
Jinja client-side; wrong evaluation is worse than honest marking. **Must not
change:** `KNOWN_UNRENDERED_PALETTE_CARDS` stays `[]`; rows must not be
added to the palette as cards (they are not cards — §3.10). **Proof:** Tier-2
fixture specs from the captured `control-panel` config: rows render, no
template source escapes as display text, state reaches cards with cached
values; plus an overlapping-neighbour selectability case (§3.10's narrowed
hypothesis).

**F9 — The view-level export contract.** _(P1, M–L — new; absent from the
filed plan.)_ In `yamlService`'s export path: a HAVDM scaffold view must not
export as masonry-plus-dead-`view_layout` (§5.2). Target order: if the
capability profile has layout-card → `custom:grid-layout` with real
`view_layout`; else translate geometry to a `sections` view with
`grid_options` where the mapping is faithful; else strip the geometry **and
say so** in the B8 warning summary ("this view deploys as masonry; card
positions will reflow"). Emitting `custom:grid-layout` must check
`installedElements` the same way card-mod is checked. **Must not change:**
`isHavdmScaffoldView` vs user-authored layout-card views (slice 4.7a — do not
re-key on the type string; it destroyed user config once already); the B7
placeholder slot-holding. **Proof:** Tier-2 export fixtures — export the same
canvas against a profile with and without layout-card and assert the three
outcomes; red leg: today's export emits dead `view_layout` on masonry with no
warning. This, plus F1, is the HAVDM-owned half of HA-09.

**F10 — PROPS-03: owner arbitration, then a small fix.** _(P2, XS–S.)_
Present the owner §3.13's three readings with the screenshot. Whichever they
choose: make the disclosure actionable (the message's "Tick …" becomes a
link/button that reveals-with-badge), and/or correct the card's steps to
include the tick. **Must not change:** the card's `light` probe (owner ruling:
keep exactly as written); the disclosure strings (unit-locked, byte-matched
to the Entity Browser). **Proof:** integration spec — the empty-state message
is present _and its action reveals the three diagnostic entities_.

**F11 — CANVAS-03: adopt the stress suite, fix nothing.** _(P2, S.)_
Promote this review's probe shape (real-mouse drags, single + multi-select,
settle-time assertions, N configurable) into `tests/e2e/`; run it in the Slow
gate. If it ever reproduces the snap-back, that run is the instrument the fix
starts from. **Must not change:** no speculative fix in `GridCanvas` — the
drag path is exonerated by diff and by 15 probe rounds.

**F12 — Ship-gates that are not UAT cards.** _(P1 decision, M work.)_ Scope
the `fs:readFile`/`fs:writeFile` IPC to user-intent paths (dialog-derived or
recent-file-listed), and code-sign the Windows binary (CLIP-02's Acronis
finding will recur on every user machine). Neither has a UAT card; both are
1.0-blocking in any reasonable release sense. The owner should rule
explicitly rather than let them ride.

**Explicitly not directed:** no `PropertiesPanel`/`App.tsx` refactor campaign
(§4.1 — extract opportunistically inside F2/F4/F7); no DSL rewrite (§4.2); no
vision amendment beyond naming layout-card in answer 4's pattern (§5.4); no
new UAT round until FR-04 and the P0/P1 fixes land (§3.6 requires a full
66-card re-run — spend it once).

---

## 7. Handover to GPT 5.6

You are cross-checking this review against the same brief. **Disagree where
you disagree; do not soften a refutation into a partial confirmation.** Two
models agreeing because the second deferred have cross-checked nothing.
Record disagreements as disagreements — the owner arbitrates, not us.

### 7.1 Claim ledger

Tags: **MEASURED** (I ran it; command/result named), **INFERRED** (reasoned
from named evidence), **JUDGEMENT** (opinion; what would change my mind).
Confidence: H/M/L.

| #   | Claim                                                                                                                                                                                           | Tag                                                                                                     | Conf                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | Build delta = 32 files +4560/−195, nine PRs; `GridCanvas.tsx` diff empty; zero theme files; EXPORT-04/theme-implicated files byte-identical (except App.tsx, whose diff has no theme lines)     | MEASURED (`git diff` runs, §3.1)                                                                        | H                                       |
| 2   | HA-06 was `fail`/medium in r1 with a theme-cluster note; triage's "green rounds 1 & 2" is false; 5 of 6 oscillate                                                                               | MEASURED (parsed r1 export)                                                                             | H                                       |
| 3   | Tester's `ha-capability-profile.json` exists: haVersion 2026.7.4, capturedAt 19:43 round-day, 24 elements, cardModPresent true → **EXPORT-04 "never persists" is false**                        | MEASURED (read the file)                                                                                | H                                       |
| 4   | Real resolver × real persisted profile over 73-card registry → 50/16/7; both triage-named cards not-available; gauge-card-pro also not-available in the same category                           | MEASURED (esbuild bundle run)                                                                           | H                                       |
| 5   | Palette renders "Not Available" badges with that profile; never-connected notice renders at y≈1096 on a 1080 viewport (off-screen)                                                              | MEASURED (app probes, logs + screenshots in session scratchpad)                                         | H                                       |
| 6   | `CardPalette` loads the profile once at mount with no refresh-on-capture path                                                                                                                   | MEASURED (code: `CardPalette.tsx:68-80`; no subscriber found by grep)                                   | H                                       |
| 7   | The tester's specific palette state at EXPORT-04 test time (stale-mount vs loaded-profile)                                                                                                      | INFERRED (capturedAt 19:43 vs session start ~18:40; export records no per-card timing)                  | **M — cannot be proven from artifacts** |
| 8   | No renderer code calls `getSelectedTheme`; boot restores only darkMode+sync; `setTheme` silently drops unresolvable names → **nothing restores, built-ins included**                            | MEASURED (grep + `App.tsx` boot effect + `themeStore.ts:155-158`)                                       | H                                       |
| 9   | Mushroom×4 themes define none of the six variables `getThemeColors` maps (Mushroom: zero top-level vars); Material You defines all → HA-06 is a mapping defect, not the restore defect          | MEASURED (`frontend/get_themes` read-only + code)                                                       | H                                       |
| 10  | PROPS-03's session screenshot shows the full disclosure message rendered, checkbox present in-picker → "message never reached the user" is false                                                | MEASURED (extracted screenshot; `EntitySelect.tsx:521-526`)                                             | H                                       |
| 11  | The tester's PROPS-03 complaint concerns that same picker/moment                                                                                                                                | INFERRED (one-line note + one screenshot; no other record)                                              | M                                       |
| 12  | FILE-06, CLIP-01, VIEWS-04 mechanisms as triaged                                                                                                                                                | MEASURED (call sites, greps, both-build checks)                                                         | H                                       |
| 13  | CANVAS-03: 15 real-mouse drag rounds (10 single, 5 multi-select), zero snap-backs                                                                                                               | MEASURED (app probe)                                                                                    | H (as a bounded negative)               |
| 14  | HA-07 validator + error text + sections model; plus the extra mandatory-`title` defect; plus canvas/validator model contradiction                                                               | MEASURED (screenshot; `DeployDialog.tsx:113-121`; `GridCanvas.tsx:291-295`)                             | H                                       |
| 15  | `divider`/`custom:template-entity-row` absent from the 73-type registry                                                                                                                         | MEASURED (real registry object)                                                                         | H                                       |
| 16  | Literal-template rendering reproduces in-app; all four fixture cards selectable; interception survives only as neighbour-under-overflow                                                         | MEASURED (app probe + `elementFromPoint`)                                                               | H                                       |
| 17  | `dashboard-ha_exported.yaml`: card_mod compiled, B7 placeholder present, scaffold view → masonry + dead `view_layout`, two `custom:grid-layout` views, layout-card absent from the 11 resources | MEASURED (file read + resource list from [STATE], not independently re-listed)                          | H / M on the resource list              |
| 18  | The export path never checks the capability profile for layout-card                                                                                                                             | INFERRED (grep found no such check; absence-of-grep is weaker than presence)                            | M                                       |
| 19  | HA-09's render failure is predicted by the exported file (grid-layout views unrenderable; masonry ignores view_layout; missing card; missing entity)                                            | INFERRED (file + HA semantics; no render observed)                                                      | M–H                                     |
| 20  | `view_layout` is layout-card-only; sections use `grid_options`; markdown Jinja renders backend-side; theme = 3-layer CSS-variable cascade                                                       | MEASURED (cited docs/repos, §5.1)                                                                       | H                                       |
| 21  | 4/80 e2e spec files use real pointer gestures; 26 placeholders in `live-preview-deploy.spec.ts`; lint = 105 any / 20 exhaustive-deps / 10 unused                                                | MEASURED (greps + eslint JSON; note: my src-only eslint run counted 139 vs the 145 whole-repo baseline) | H                                       |
| 22  | `auto_covered` is a harness-architecture problem; remedy is an additive gesture tier + generation-time audit                                                                                    | JUDGEMENT (changes my mind: gesture specs proving as flaky as the DSL was built to avoid)               | M                                       |
| 23  | No vision pivot warranted; the boundary is right but one level shallow; layout-card is the unhedged dependency                                                                                  | JUDGEMENT (changes my mind: evidence users want in-HA editing more than file-based design)              | M                                       |
| 24  | "Would a user prefer this to YAML — not yet"; winnable niche = VCS/offline/superset                                                                                                             | JUDGEMENT                                                                                               | M                                       |
| 25  | Remediation-order corrections (P1): void item 5, split item 4, add F9, extend FR-04                                                                                                             | INFERRED from #3–#9, #17–#19                                                                            | H given those                           |

### 7.2 Where I am least sure — aim your check here

1. **Claim 7** — I cannot prove which profile state the tester's palette held
   when they ran EXPORT-04. Both candidate states are consistent with "no
   footer, nothing marked" (off-screen notice vs correctly-absent notice +
   missed badges). If you can extract per-card timing from any artifact I
   missed, do.
2. **Claim 11** — the PROPS-03 refutation rests on one screenshot matching a
   one-line note. If the tester's fail was about a _different_ picker, my
   "refuted" weakens to "unsupported". The screenshot is still the only
   direct evidence in the record.
3. **Claims 18/19** — grep-absence and predicted-not-observed render. A
   ten-minute deploy of the exported file to a throwaway dashboard would
   settle 19, but that write is §4-forbidden for me and for you.
4. **Claim 17's resource list** — I took "11 resources, no layout-card" from
   the verified [STATE] drawer rather than re-listing. One
   `lovelace/resources` read-only call re-derives it.
5. **The r2→r3 oscillator framing** relies on `VERDICT_REMARKS.md`-adjusted
   r2 verdicts for CLIP-02 only; I did not re-audit every remark application.

### 7.3 What to verify first (ranked, exact commands)

1. **The EXPORT-04 refutation** (claims 3–5):
   `ls -la "/mnt/c/Users/micah/AppData/Roaming/HA Visual Dashboard Maker/"`,
   then read `ha-capability-profile.json`; then
   `src/services/capabilityProfileService.ts:30-35` and `main.ts:588-610`.
2. **The PROPS-03 screenshot** (claim 10): parse
   `docs/testing/uat/sessions/uat_session_v1.0.0-r3_2026-08-03.json` →
   `currentScreenshots["PROPS-03"]` → base64-decode → view. Then
   `EntitySelect.tsx:480,521-526`.
3. **HA-06's r1 verdict** (claim 2): parse
   `uat_session_v1.0.0_2026-07-27.json` → `current["HA-06"]`,
   `currentNotes["HA-06"]`.
4. **The theme measurements** (claims 8–9): grep `getSelectedTheme` across
   `src/` (renderer consumers: expect none); `frontend/get_themes` over the
   repo's `node_modules/ws` with the token regex from the brief; compare with
   `themeService.ts:81-99`.
5. **The export file** (claim 17): read
   `/mnt/c/dev/homeassistant2/dashboards/dashboard-ha_exported.yaml`
   (read-only) and `yamlService.ts:195-235`.
6. **The gesture count** (claim 21):
   `grep -rln "mouse\.down\|dragTo\|button: *'right'\|\.hover(" tests/e2e/ | wc -l`.

Relevant drawers: state `drawer_havdm_state_a15b0af78e0814cfd19cf627` (v133);
triage evidence `drawer_havdm_investigations_7de2bbc7f783b282bcf38348`; PR #121
decision `drawer_havdm_decisions_99c3300a25a14406cd7c40d4`; vision
`drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`; pass bar
`drawer_havdm_decisions_07ddf9fd06bf351081eea19a`.

### 7.4 Known limits of this review

- No full e2e/integration run (docs-only branch; baseline reused). My probes
  were review evidence, not gates.
- The four app probes ran against the **dev build**, not the round-3 Windows
  binary (`src/` is byte-identical between them per claim 1, but packaging
  differences are unexamined).
- HA-03's entity-state finding and HA-04's matcher scoring were **not**
  independently re-measured.
- The asar-marker build verification was trusted, not re-run.
- I read every implicated file but not all 251 `src/` files; Scope B's
  architecture judgements sample rather than exhaust.
- `layout_type` on exported layout-card views: I could not determine whether
  it is deliberate legacy-key pass-through or a leak; I dropped it to a note
  rather than a finding.

### 7.5 Open questions reserved for the owner (not answered here)

1. PROPS-03: card gap, UX gap, or both (§3.13) — and its severity, which §2
   reserves.
2. Whether PR #121 merges as-is with this review as the correction layer
   beside it, or the triage document is corrected pre-merge
   (supersede-don't-edit argues for the former).
3. Amendment-03 §4 widening for the live test tier (Tier 3 as re-ranked).
4. Whether F12's two ship-gates (fs scoping, code signing) formally join the
   1.0 criteria.
5. THEME-03's blank skip reason and THEME-04's untested state (criterion 5).

### 7.6 Required hand-back format

Return, **per ledger claim (by number)**: `CONFIRMED` / `PARTIALLY CONFIRMED`
/ `REFUTED` / `UNVERIFIABLE`, with the evidence you used (command, file:line,
artifact). Then, separately: (a) anything material this review **missed
entirely** — new findings, not re-gradings; (b) your own verdict on each §6
direction (P1–P2, F1–F12): sound / unsound / needs-change, with reasons;
(c) your list of the three claims you'd tell the owner to trust least, which
may differ from §7.2. Do not average our positions anywhere; where we
disagree, state both and stop.
