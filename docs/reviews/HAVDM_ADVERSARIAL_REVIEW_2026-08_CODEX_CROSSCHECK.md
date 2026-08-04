# HAVDM Adversarial Review — Codex Cross-check

**Cross-checker:** Codex (GPT-5.6)
**Date:** 2026-08-04
**Review under check:** `HAVDM_ADVERSARIAL_REVIEW_2026-08_FABLE.md`
**Code/build comparison used by that review:** `199c8f6..a3b60b5`

## 1. Result

I independently checked the 25 ledger claims against the repository, the three
UAT session exports, the tester's persisted files, the exported dashboard, and
read-only Home Assistant data. My dispositions are:

- **17 CONFIRMED**
- **6 PARTIALLY CONFIRMED**
- **0 wholly REFUTED**
- **2 UNVERIFIABLE**

That aggregate must not be read as blanket agreement. Several compound claims
contain factual errors that I explicitly refute below. In particular:

- The exported dashboard contains **one**, not two,
  `custom:grid-layout` views.
- The real export entry point does **not** pass `cardModAvailable`; its default
  is `true`. Card-mod is therefore unhedged in the production export path, just
  as layout-card is.
- EXPORT-04 also requires a warning on a placed unavailable canvas card. The
  review tested the palette but missed this acceptance step; no placed-card
  warning exists.
- The theme defect is not fully described as a six-variable mapping problem.
  The renderer consumes only two sampled values directly, and there are no
  `var(--...)` consumers for the larger variable set published on the canvas.

## 2. Method and constraints

Evidence used:

- `git diff --stat 199c8f6 a3b60b5 -- src/` and targeted per-file diffs.
- Direct parsing of all three UAT session JSON files with Node.
- Direct read of the tester's
  `/mnt/c/Users/micah/AppData/Roaming/HA Visual Dashboard Maker/ha-capability-profile.json`.
- The real capability resolver bundled with esbuild and run over the 73-card
  registry using that persisted profile.
- Read-only Home Assistant calls for `frontend/get_themes`,
  `lovelace/resources`, and the two entity-state checks relevant to HA-09.
- Direct inspection of
  `/mnt/c/dev/homeassistant2/dashboards/dashboard-ha_exported.yaml`.
- Temporary Playwright probes against the development build for palette
  availability, viewport position, CANVAS-03 dragging, and HA-03 hit testing.
  The temporary probe specs were removed after use.
- Repository searches with `rg`, plus ESLint JSON output for both `src/` and
  the whole configured repository.

Constraints:

- I made no Home Assistant writes and did not deploy the exported dashboard.
- I did not run the full e2e/integration suite; the targeted probes are review
  evidence, not release gates.
- App probes used the dev build, not the packaged round-3 Windows binary.
- The named MemPalace drawers were not available through the tools in this
  session. I used the checked-in documents that quote or summarize them and do
  not claim to have independently reread the drawers.

## 3. Claim-by-claim ledger

### 1 — CONFIRMED

`git diff --stat 199c8f6 a3b60b5 -- src/` reproduced 32 files,
+4560/-195. Targeted diffs reproduced the nine-PR interval, an empty
`GridCanvas.tsx` diff, zero changed theme files, and byte-identical
EXPORT-04/theme-implicated files. `App.tsx` changed, but its diff contained no
theme-selection or capability-profile lines.

Evidence: Git commands above; Fable §3.1; `src/components/GridCanvas.tsx`;
`src/components/CardPalette.tsx`; `src/services/capabilityProfileService.ts`;
`src/main.ts`.

### 2 — CONFIRMED

Direct session parsing gives round-1 `current["HA-06"] = "fail"` and
`currentNotes["HA-06"] = "Theme change does not change how things appear on
the canvas"`. Therefore the triage statement that HA-06 was green in rounds 1
and 2 is false. Reconstructing the six histories yields five oscillators, not
four.

Evidence: `docs/testing/uat/sessions/uat_session_v1.0.0_2026-07-27.json` and
`docs/testing/uat/reports/uat_triage_v1.0.0-r3_2026-08-03.md:103`.

### 3 — CONFIRMED

The dedicated profile file exists and contains HA `2026.7.4`, capture time
`2026-08-03T09:43:07.314Z` (19:43 local), 24 installed elements, and
`cardModPresent: true`. The service deliberately uses a separate
`electron-store`, and `capability:capture` saves the resolved profile.

This refutes the triage's claim that EXPORT-04 failed because the profile was
never persisted.

Evidence: tester profile file;
`src/services/capabilityProfileService.ts:26-46`;
`src/main.ts:584-606`.

### 4 — CONFIRMED

Running the real resolver and real 73-card registry against the persisted
profile produced **50 available / 16 not-available / 7 HAVDM-only**.
`custom:power-flow-card`, `custom:battery-state-card`, and
`custom:gauge-card-pro` all resolved to not-available.

Evidence: esbuild/Node resolver probe using
`src/services/capability/capabilityResolver.ts`,
`src/services/capability/cardAvailability.ts`, the real card registry, and the
tester profile.

### 5 — CONFIRMED

The seeded-profile app probe rendered `Not Available` badges for the relevant
cards. The never-connected probe measured
`palette-availability-notice` at top **1095.90625 px** in a 1080 px viewport,
so it was below the visible area.

Evidence: temporary Playwright palette probes;
`src/components/CardPalette.tsx:282-313` and `:326-359`.

### 6 — CONFIRMED

`CardPalette` initializes a local profile and calls `capabilityGetProfile()` in
a mount-only effect. The successful capture path logs the returned profile but
does not update palette state, publish an event, or update a shared store. No
subscriber exists.

Evidence: `src/components/CardPalette.tsx:68-89`;
`src/App.tsx:1985-1997`; `src/preload.ts:80-84`; repository `rg` for the
capability IPC surface.

### 7 — UNVERIFIABLE

The artifacts establish when the profile was captured and what the code would
do for a palette mounted before or after that capture. They do not record the
palette mount time or a per-card observation timestamp. Both stale-mount and
loaded-profile states remain consistent with the tester's note.

Evidence exhausted: profile `capturedAt`, r3 session timestamps/notes, and the
mount-only code path. No per-card timing artifact was found.

### 8 — CONFIRMED

`getSelectedTheme` exists in preload/main/settings but has no renderer caller.
Startup restores only dark mode and sync. `setTheme` returns unchanged state
when a name cannot resolve. A persisted built-in is therefore also not
restored; the problem is wider than a dangling HA-theme name.

Evidence: `rg -n "getSelectedTheme" src`; `src/App.tsx:510-529`;
`src/store/themeStore.ts:150-173`; `src/main.ts:221-223`.

### 9 — PARTIALLY CONFIRMED

The measurements are confirmed: the four Mushroom variants contained
0/2/8/10 top-level variables and none of the six names sampled by
`getThemeColors`; Material You contained 555 and all six.

I disagree with describing HA-06 as only a **mapping** defect. It is separate
from restart restoration, but the rendering path also has a consumption gap:
`App.tsx` directly uses only `primaryBackground` and `primaryText`, while
`applyThemeToElement` publishes CSS properties for which `rg "var\\(--" src`
finds no consumers. Expanding the map without adding consumers cannot reproduce
HA's cascade.

Evidence: read-only `frontend/get_themes` result;
`src/services/themeService.ts:81-99`; `src/App.tsx:469-508` and the zero-consumer
search.

### 10 — CONFIRMED

I decoded and viewed `currentScreenshots["PROPS-03"]`. It shows `light` in the
Button entity picker, the full diagnostic/config disclosure, and the checkbox
named by that disclosure. Thus “the message never reached the user” is false.

Evidence: `docs/testing/uat/sessions/uat_session_v1.0.0-r3_2026-08-03.json`;
`src/components/EntitySelect.tsx:476-495` and `:509-533`.

### 11 — CONFIRMED

The screenshot is stored under the PROPS-03 key, and its `light` query exactly
matches `currentNotes["PROPS-03"] = "light did not show any results"`. There is
no artifact evidence for a different picker. I therefore accept that the note
and screenshot concern the same PROPS-03 interaction, while not inferring any
unrecorded post-screenshot action.

Evidence: the keyed note and screenshot in the r3 session JSON.

### 12 — CONFIRMED

The FILE-06, CLIP-01, and VIEWS-04 mechanisms reproduce in source:

- Save As does not call `addRecentFile`; Open and Open Recent do.
- Empty canvas has no context-menu handler; the menu is card-scoped.
- `SectionsCanvas` accepts only its internal drag flags and has no palette-drop
  callback, unlike `GridCanvas`.

Evidence: `src/App.tsx:576-682`; `src/components/CardContextMenu.tsx`;
`src/components/GridCanvas.tsx`; `src/components/SectionsCanvas.tsx:142-180`
and its drop targets; searches across both compared builds.

### 13 — CONFIRMED

Fifteen real mouse-drag rounds—10 single and 5 multi-select—produced movement
of approximately 99-198 px and zero snap-backs. Positions were unchanged
between the +350 ms and +750 ms settle checks. This is only a bounded negative,
not proof that the tester's failure cannot occur.

Evidence: temporary Playwright real-mouse stress probe against the dev build.

### 14 — CONFIRMED

The validator requires every view to have a title and top-level cards, then
prints connection advice for any failure. The canvas itself correctly delegates
sections views because their cards live under `sections[].cards`. This confirms
the reported validator defect, the extra mandatory-title defect, and the
contradictory internal models.

Evidence: `src/components/DeployDialog.tsx:105-121` and `:359-380`;
`src/components/GridCanvas.tsx:291-316`; decoded HA-07 screenshot.

### 15 — CONFIRMED

Neither `divider` nor `custom:template-entity-row` occurs among the 73 registered
card types. Both are row concepts, not palette-level cards.

Evidence: evaluation/search of the real card registry and the relevant
entities-card renderer path.

### 16 — PARTIALLY CONFIRMED

The literal-template behavior reproduced in app. All four cards in the fixture
were selectable, and `elementFromPoint` at each center landed inside its own
card. That confirms the bounded probe.

The word **only** in “interception survives only as neighbour-under-overflow”
is not established globally. Neighbour interception remains a plausible
hypothesis, not an observed cause, because the four-card fixture did not create
the necessary overlap.

Evidence: temporary literal-template/hit-test Playwright probe using the
captured `control-panel` fixture.

### 17 — PARTIALLY CONFIRMED

Confirmed from the file: compiled `card_mod`, the B7 markdown placeholder, a
typeless masonry scaffold view with dead `view_layout`, a sections view, and an
unavailable layout-card dependency. A fresh read-only `lovelace/resources`
call returned 11 resources and no layout-card.

**Refuted:** the file does not contain two `custom:grid-layout` views. It
contains exactly **one**. The three views are:

1. typeless/masonry, with dead `view_layout`;
2. `type: sections`, containing two dead `view_layout` blocks and one valid
   `grid_options` block;
3. `type: custom:grid-layout`.

Evidence:
`/mnt/c/dev/homeassistant2/dashboards/dashboard-ha_exported.yaml:10-143`;
read-only `lovelace/resources` result.

### 18 — CONFIRMED

This is stronger than grep absence. Dataflow tracing shows
`handleExportForHA` calls `serializeForHA(config)` with only the dashboard;
`sanitizeForHAWithReport` calls `exportDashboard(..., { warnings })`; no
capability profile or layout-card availability enters the call chain.

Evidence: `src/App.tsx:684-703`; `src/services/yamlService.ts:289-296` and
`:313-319`; `src/services/yamlConversionService.ts:1119-1133`.

### 19 — PARTIALLY CONFIRMED

The exported file predicts real defects: its one layout-card view lacks its
required resource; masonry ignores its card `view_layout`; the absent custom
card will not load; and `sensor.example_temperature` is absent. A read-only
state check found `sensor.example_temperature` absent and the comparison
`sensor.ev5_set_temperature` present.

I do not confirm an observed overall HA-09 render failure because deployment
was forbidden and not performed. The claim also inherits claim 17's incorrect
plural grid-layout count. The correct statement is a high-confidence predicted
partial/multi-view failure, not an observed render result.

Evidence: exported YAML; read-only resource and entity-state results; HA and
layout-card semantics cited in Fable §5.1.

### 20 — CONFIRMED

The cited primary documentation supports the four semantics: `view_layout` is
layout-card-specific; core sections use `grid_options`; markdown Jinja is
backend-rendered; and HA themes are layered CSS-variable maps.

Evidence: the Home Assistant sections, custom-card grid-options, markdown, and
frontend-theme documentation, plus the layout-card repository cited in Fable
§5.1.

### 21 — CONFIRMED

Repository searches reproduced 80 e2e spec files, only 4 files containing the
listed real-pointer gestures, and 26 placeholders in
`live-preview-deploy.spec.ts`. ESLint JSON gave:

- `src/`: 139 findings = 105 `any`, 20 exhaustive-deps, 10 unused, 4 misc.
- whole configured repository: 145 findings = 105 `any`, 20 exhaustive-deps,
  16 unused, 4 misc.

Thus the ledger's three named src-only category counts and its 139-versus-145
qualification are correct.

Evidence: `rg --files tests/e2e`; the ledger's gesture `rg`; placeholder `rg`;
ESLint JSON output grouped by rule ID.

### 22 — CONFIRMED

I agree with the judgement: `auto_covered` currently overstates user-path
coverage because the DSL bypasses real gesture behavior. An additive,
deliberately small gesture tier plus a generation-time coverage audit is the
sound remedy. This does not support replacing the DSL regression suite.

Evidence: claim 21's distribution and the fact that targeted real gestures
exercised paths absent from the DSL.

### 23 — PARTIALLY CONFIRMED

I agree that no product-vision pivot follows from this record and that the
boundary is one level too shallow. I also agree layout-card is unhedged.

I disagree that layout-card is **the** unhedged dependency. Card-mod is also
unhedged in the real export path: `cardModAvailable` exists in lower-level
options, but the production caller supplies only `{ warnings }`, and both
defaults resolve absence to `true`. The reference profile having card-mod
installed hides this architecture defect.

Evidence: `src/services/yamlService.ts:289-291`;
`src/services/yamlConversionService.ts:979-985` and `:1030-1036`;
`src/services/cardModTranslator.ts:104-108` and `:180-195`.

### 24 — UNVERIFIABLE

“Would a user prefer this to YAML” and the proposed market niche are product
judgements. The UAT record identifies fidelity problems but contains no user
research or comparative adoption evidence that can verify either statement.
The opinion may be sensible; it is not established by the named evidence.

Evidence needed to change this disposition: interviews, task comparisons,
retention/adoption data, or equivalent evidence from the target user segment.

### 25 — PARTIALLY CONFIRMED

The four stated corrections follow from the evidence: void the persist-profile
fix, split restoration from in-session theme rendering, add a view-export
contract, and add an HAVDM-export leg to FR-04.

I disagree with treating that list as a sufficient corrected P1. It also needs
to cover the placed-card availability warning, thread the full capability
profile through export for **both** layout-card and card-mod, and correct the
HA-05/HA-06 disconnect contracts before their tests are used as gates.

Evidence: claims 3-9, 17-19, 23, and new findings N1-N4 below.

## 4. Material findings the Fable review missed entirely

These are new findings, not severity re-grades.

### N1 — EXPORT-04's placed-card requirement is unimplemented

The r3 plan's step 4 adds a not-installed card and step 5 asks for a banner or
marking on the placed card. Expected says the card visibly carries “won't
render on your instance.” Availability resolution and badges exist only in
`CardPalette`; the placed-card renderer receives no capability status. My
palette probe therefore does not close EXPORT-04 as a whole.

Evidence:
`docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md:1721-1764`;
`src/components/CardPalette.tsx`; searches across the canvas/card renderers.

### N2 — Card-mod's fallback is dead from the production entry point

The lower-level translator can strip-and-warn when `cardModAvailable` is false,
but no production export caller supplies that value. Defaulting the omitted
option to true means an instance without card-mod receives `card_mod` output
without a warning. Fable's statement that `cardModPresent` is checked in the
export path is false.

Evidence: the dataflow and files cited under claim 23.

### N3 — HA-05's disconnect expectation contradicts the persisted-profile design

HA-05 requires availability to become permissive immediately after disconnect.
The product design and implementation explicitly use the last captured profile
as an offline source of truth. `CardPalette` does not subscribe to connection
state and has no path that resets its profile on disconnect. Either the test
card or the persisted-offline contract must change; both cannot be true.

Evidence:
`docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md:2328-2362`;
`src/components/CardPalette.tsx:68-89`;
`src/services/capabilityProfileService.ts:38-45`.

### N4 — HA-06 requires remote themes to disappear on disconnect, but they persist

The r3 Expected section says HA-provided themes must go after disconnect. The
disconnect branch merely stops subscribing/fetching; `setAvailableThemes`
merges HA themes into the store and no code prunes them. The built-ins surviving
is correct, but the remote catalogue also survives.

Evidence:
`docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md:2364-2396`;
`src/App.tsx:554-574` and `:1999-2019`;
`src/store/themeStore.ts:116-148`.

### N5 — Deploy validation also rejects strategy views

A valid strategy view can have no cards because Home Assistant generates them.
`GridCanvas` explicitly models this, while `DeployDialog` rejects the view for
missing top-level `cards` and potentially for missing `title`. F1's proposed
tests cover sections and untitled views but omit strategy views.

Evidence: `src/components/GridCanvas.tsx:319-347`;
`src/components/DeployDialog.tsx:105-121`.

### N6 — Dead `view_layout` also leaks into the sections view

The review identified dead layout metadata on masonry but misclassified the
second view as layout-card. It is a core sections view containing two cards
with ignored `view_layout`; only one card uses valid `grid_options`. View-level
sanitation alone will not remove every dead layout key.

Evidence:
`/mnt/c/dev/homeassistant2/dashboards/dashboard-ha_exported.yaml:100-126`.

### N7 — F7's native-menu tooltip is not a Windows-capable remedy

`menu.ts` currently uses Electron's `sublabel`, with a comment claiming it is a
tooltip. Native menu sublabels/tooltips are platform-limited and do not provide
the proposed Windows Recent Files hover behavior. Save As should still register
the file, but full-path disclosure needs a Windows-capable presentation (for
example a path-bearing label or an in-app recent-files surface).

Evidence: `src/menu.ts:5-20`; Electron `MenuItem` platform behavior.

## 5. My verdict on each §6 direction

### P1 — NEEDS-CHANGE

The four corrections are necessary, but not sufficient. Add N1-N4, correct the
exported-view inventory, and make capability-profile threading a single export
contract covering both layout-card and card-mod.

### P2 — NEEDS-CHANGE

The restart and real-gesture tiers are sound. The direction should also require
the generation-time `auto_covered` audit named in claim 22 and capability-matrix
export fixtures. Otherwise the same metadata can drift back to claiming user
coverage from DSL-only tests.

### F1 — NEEDS-CHANGE

Per-view validation, optional titles, and accurate error text are right. Add
strategy-view coverage and implement the rule through a shared view-type/schema
validator rather than another expanding dialog-local conditional.

### F2 — SOUND

It addresses the actual missing boot read, preserves requested-but-unavailable
state, defines a visible fallback, and includes both built-in restart and later
HA-theme resolution tests.

### F3 — NEEDS-CHANGE

Separating it from F2 is correct. Publishing a fuller variable map is not enough
without renderer consumers. Define the canvas fidelity contract, add actual CSS
variable consumers or explicit component mappings, and cover remote-theme
pruning on disconnect. The no-op badge is a useful interim disclosure, not a
full application fix.

### F4 — NEEDS-CHANGE

Refresh-on-capture and an in-viewport notice are correct, but the direction
omits EXPORT-04's placed-card warning and does not resolve the contradictory
HA-05 disconnect expectation. Tests must cover all three states: never
connected, captured offline, and newly captured in-session.

### F5 — NEEDS-CHANGE

The missing sections palette-drop path is correctly identified. Specify a
shared insertion contract that carries the palette payload and exact target
section, and settle/select the target-section behavior before encoding the
double-click test. `onPaletteDrop(sectionIndex)` alone underspecifies the card
payload and insertion semantics.

### F6 — SOUND

An empty-canvas context menu on both canvas models, reusing the existing
selection discipline and proving it with a real right-click gesture, directly
addresses CLIP-01 without disturbing the card menu.

### F7 — NEEDS-CHANGE

The Save As recent-file call is right. Replace the proposed native-menu tooltip
with a path-disclosure mechanism that works on Windows, then test that actual
surface.

### F8 — NEEDS-CHANGE

Row rendering and honest template marking are sound directions. Keep the
unreproduced selectability hypothesis out of the fix, and split the un-remeasured
state-propagation issue into its own red-leg test before changing code. Row
support belongs in the entities-card child model, not the 73-card palette
registry.

### F9 — NEEDS-CHANGE

A view-level export contract is necessary. Prefer native sections when geometry
can be translated faithfully; use layout-card only when required or explicitly
chosen, not merely because it happens to be installed. Thread one capability
object through export so layout-card and card-mod share the same honest
emit/translate/strip-and-warn policy. Also sanitize dead `view_layout` within
core sections cards (N6).

### F10 — SOUND

Owner arbitration is appropriate because the screenshot refutes “never shown”
but does not decide whether the test instructions, interaction, or both should
change. Making the visible disclosure actionable is small and testable.

### F11 — SOUND

Promoting the bounded stress probe and refusing a speculative code fix is the
right response to a non-reproduced intermittent gesture failure.

### F12 — NEEDS-CHANGE

Both concerns deserve explicit ship decisions, but they should be separate
gates. Define a threat model and a scoped user-grant model for filesystem IPC;
“recent-file-listed” alone can become an indefinite ambient permission. Treat
Windows signing as a release/distribution gate with owner-approved credentials
and policy, not as the same engineering item as IPC authorization.

## 6. The three claims I would tell the owner to trust least

1. **Claim 24** — it is a market/user-preference judgement with no user research
   in the evidence set.
2. **Claim 7** — no artifact records the palette's mount/profile state at the
   moment of EXPORT-04.
3. **Claim 19** — the exported file predicts specific failures strongly, but no
   permitted observation shows the deployed render, and the claim inherits the
   incorrect two-grid-view inventory.

## 7. Owner arbitration points created by this cross-check

- Whether HA-05 should retain last-known availability offline or deliberately
  become permissive on disconnect.
- Whether scaffold export should prefer native sections even when layout-card
  is installed, or prefer layout-card for maximum geometry fidelity.
- Whether PROPS-03 is a card correction, an interaction improvement, or both.
- What user-visible representation should replace F7's non-portable native-menu
  tooltip on Windows.
- Whether filesystem IPC authorization and Windows signing are formal 1.0 ship
  gates, considered separately.
