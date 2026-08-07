Author: Claude Opus
Reviewer: OpenAI Codex (GPT-5), independent reviewer; did not author the implementation
Owner gate: BaggyG-AU reads PR #137 and this review together; only the owner signs off and merges PR #137

# Independent Implementation Review — F5 Sections Palette-Drop Insertion

## Verdict

**CHANGES-REQUIRED — High confidence.**

The production implementation follows the approved F5 semantic pipeline and I
found no source-level contradiction in the six target rows, the insertion/store
path, or MUST NOT guard rails 1–7. The evidence package is not merge-ready:

1. the exact F5 e2e spec failed in this review because the supposedly settled
   source point dragged the wrong palette card, and a repeated L11 run reproduced
   the same wrong-card signature;
2. L15 drops on the section, not the container card, and does not assert the
   required sibling index;
3. L13 keeps the fixed 1920×1080 Electron viewport and operates only the heading,
   so it does not prove the narrow-window or all-controls clauses of AC 18;
4. the published load-path sweep is not a population enumeration and its
   “zero under-inclusion” claim is false; and
5. U3 cannot have been green on base as claimed because its F5 imports do not
   exist on `main`.

These are proof defects rather than a demonstrated product-code defect. They are
still blocking under the approved contract: each leaves a mandatory acceptance
criterion or regression claim able to pass without the specified behavior.

## Scope and starting state

I reviewed PR #137's body and content commit `2bb3f26abdf720b863f9296ec41344b2dfb8bbd8`
against `main` at `82eb819`. Before review work:

- branch: `feature/f5-sections-palette-drop`;
- HEAD and `origin/feature/f5-sections-palette-drop`: `2bb3f26`;
- worktree: clean;
- content history: one commit over `main`; and
- diff: the expected 11 files, 1,562 insertions and 5 deletions.

I did not modify implementation, tests, the signed F5 spec, UAT plans/verdicts,
or `[STATE]`. I did not create a branch or PR, mark PR #137 ready, or merge it.

## Major findings

### M1 — The wrong-source-card harness defect remains reproducible, invalidating the current 32/32 claim

**Evidence.** `palettePointerDrag` obtains one centre point from
`settledPointOn`, presses there, then moves 12 pixels before travelling to the
target (`tests/e2e/sections-canvas.spec.ts:729-748`). `settledPointOn` returns as
soon as one poll observes that the centre currently belongs to the requested
tile (`:764-783`). It does not require the tile/point to remain stable across
multiple samples or prove which tile supplied the actual `dragstart` payload.

I ran the exact required headless spec on the unchanged content commit:

```text
bash tools/test-headless.sh tests/e2e/sections-canvas.spec.ts \
  --project=electron-e2e --workers=1

31 passed, 1 failed
```

L11 requested `entities` at `tests/e2e/sections-canvas.spec.ts:1182`, but the
selected card's Properties YAML was:

```yaml
type: custom:fold-entity-row
head: {}
items: []
```

The assertion for `New Entities` failed at `:1189`. The captured UI likewise
showed a selected Fold Entity Row in the target section. I then repeated only
L11 five times:

```text
bash tools/test-headless.sh tests/e2e/sections-canvas.spec.ts \
  --project=electron-e2e --workers=1 --grep 'F5 L11' --repeat-each=5

3 passed, 2 failed
```

Both failures had the same `custom:fold-entity-row` payload. This is the exact
wrong-card defect the helper's docblock says was closed (`:754-762`), not an
unrelated timeout. The single successful hit-test is only a momentary geometric
observation; it does not establish that the subsequent drag initiation occurred
on that tile.

**Impact.** The PR body's 32/32 F5 result is not current, AC 15's only real
gesture is flaky, and every leg using `palettePointerDrag` shares the same source
helper. A green run can exercise a different card type while leaving assertions
that only count cards green.

**Required correction.** Make the source discriminator cover drag initiation,
not just one pre-press sample. The test must prove that the payload initiated by
the gesture names the requested card (or otherwise make the source stable across
the press and threshold move), then demonstrate repeat stability and rerun the
full F5 spec. Do not weaken the product MIME contract to accommodate the harness.

### M2 — L15 does not perform or distinguish the container-card gesture required by AC 21

**Evidence.** L15 is named “drop on a CONTAINER card,” but its gesture is:

```ts
await palettePointerDragToTestId(ctx, 'markdown', 'sections-canvas-section-0');
```

at `tests/e2e/sections-canvas.spec.ts:948`. That resolves the centre of the
entire section. `settledPointOn` accepts any descendant whose `closest()` is the
section (`:772-778`), so this does not establish that the pointer is on the
vertical-stack card or its card wrapper.

The postconditions at `:955-959` assert only that the section now has two
top-level cards and that two old child strings remain somewhere on the canvas.
They do not assert:

- the new card occupies the container's former logical index;
- the previous container shifted down;
- the container's child count is exactly unchanged; or
- the gesture actually hit the container/card-wrapper branch.

An implementation that appends from the section-body branch satisfies every
current L15 assertion while violating “sibling **at that card's index**.”

**Impact.** AC 21 and the owner's deferred-nesting ruling have no discriminating
leg. This is the `auto_covered` wrong-control class: the test name and comments
describe a control the gesture never identifies.

**Required correction.** Target the vertical-stack card wrapper with a verified
point, assert the inserted card's top-level array/DOM index and the shifted
container index, and assert the container's exact child list/count is unchanged.

### M3 — L13 does not exercise AC 18's narrow-window and all-controls contract

**Evidence.** L13 changes `max_columns` from 2 to 1
(`tests/e2e/sections-canvas.spec.ts:1245-1248`) but never changes the window or
viewport. The shared launcher explicitly sets both to 1920×1080
(`tests/support/electron.ts:226-237`). One column at that viewport makes the
section wider; it is not the suite's narrowest window.

L13 asserts the reorder handle, Delete button, and heading are visible, but only
fills/commits the heading (`sections-canvas.spec.ts:1253-1269`). It does not
operate the reorder handle or Delete button. The marker-below-toolbar geometry
assertion is useful, but it cannot prove that all controls remain reachable and
operable under the narrow condition required by MUST NOT 8 / AC 18.

**Impact.** A responsive clipping or hit-target regression at a narrow viewport,
or a marker overlay that disables reorder/Delete without hiding them, can pass.
The PR body's stronger statement that L13 tests visible and operable controls at
the suite's narrowest layout is unsupported.

**Required correction.** Run this leg at an explicitly bounded narrow viewport,
operate all three controls while the marker is rendered, and retain the
non-overlap assertion. If deletion makes a single test destructive to later
assertions, operate it last or split the green control assertions without
changing their per-assertion classification.

### M4 — The “zero under-inclusion” load-path sweep omits direct production consumers

**Evidence.** The PR's published sweep command reproduces its 20-file list:

```bash
grep -rlE "loadDashboard|loadYaml|openFile|dashboard-generator|handleCardDropIntoContainer|onCardDropIntoContainer" \
  tests/e2e tests/integration --include=*.spec.ts | sort
```

The regex searches test-file spelling, not production `loadDashboard` call
sites. A source call-site enumeration shows, among others:

- template selection → `loadDashboard` at `src/App.tsx:2377`;
- entity-type dashboard creation → `loadDashboard` at `src/App.tsx:2412`; and
- YAML-editor Apply → `loadDashboard(..., { mode: 'edit' })` at
  `src/App.tsx:2445`.

Direct UI consumers are omitted from the published list because their specs do
not repeat those implementation tokens:

- `tests/e2e/templates.spec.ts:107,130` selects a template;
- `tests/e2e/entity-type-dashboard.spec.ts:215-264` and later cases create
  generated dashboards; and
- `tests/integration/monaco-editor.spec.ts:182-200` drives Apply to its
  confirmation boundary (it does not confirm the final load).

The first two definitely reach production load call sites. Thus the exact
command may reproduce 20 paths, but it cannot support a universal “every load
path” or “zero under-inclusion” claim. The signed spec specifically warns that
the one-line store reset touches every load path (§9.7).

**Impact.** The Medium regression evidence is incomplete and the published
cross-check is not reproducible from a source-to-consumer mapping. This review
does not claim those omitted flows are broken; it finds that the stated sweep
did not test the claimed population.

**Required correction.** Enumerate each production `loadDashboard` call site,
map it to the UI/test consumer, and run or explicitly justify every affected
path. At minimum add the omitted template and entity-type dashboard specs to the
regression evidence and provide an Apply leg that crosses the confirmation into
the `mode: 'edit'` call if that path is claimed covered.

### M5 — U3 is not an executable green-on-base control as documented

**Evidence.** U3 says that with `src/` stashed “the import resolves” and all
assertions pass on base (`tests/unit/SectionsCanvas.paletteDrop.spec.tsx:21-25`).
The file imports both `PALETTE_CARD_MIME` and the branch-only
`onPaletteCardDrop` prop (`:34-35`, `:140-161`). Neither symbol exists in the
base versions:

```bash
git show main:src/components/CardPalette.tsx | rg 'PALETTE_CARD_MIME'
git show main:src/components/SectionsCanvas.tsx | rg 'onPaletteCardDrop'
```

Both commands return no match. The unit file itself is also new. Retaining the
test while restoring base `src/` therefore produces import/type failures before
any behavioral assertion can be green.

The branch-side discriminator is worthwhile: without the callback, dragover is
not prevented (`:92-120`), while the same event is accepted when the callback is
provided (`:140-149`). That proves the current branch's callback gate. It does
not make the exact test an observed green-on-base control.

**Impact.** The PR records impossible base evidence for the mandatory AC 19
leg. Under the project's per-assertion evidence rule, behavioral reasoning about
what old code would have done cannot be reported as an executed control result.

**Required correction.** Correct the docblock/PR evidence to say what was
actually executable and observed. If U3 must remain a literal base-green
control, introduce a harness that can run the same behavioral contract against
both component versions without importing branch-only API. Otherwise classify
the branch-side discriminator honestly as alternative evidence, subject to the
owner-approved spec.

## Minor findings

### m1 — L5 proves card-count stability, not AC 5's “changes no config” clause

L5 records only the total card count before and after the background gesture
(`tests/e2e/sections-canvas.spec.ts:989-1013`). A background handler could write
an equivalent or unrelated config, push history, or change selection while the
count remains two. Source inspection found no root drop handler, so I found no
current product violation; the acceptance leg is nevertheless non-discriminating
for the full criterion. Add config/selection/history observables appropriate to
the “no config” clause.

### m2 — The invalid-payload inventory omits the explicit empty-payload case

AC 17 names malformed, empty, and unknown-card-type payloads. L12 and the unit
case cover non-JSON, `{}`, and an unregistered type
(`tests/e2e/sections-canvas.spec.ts:1213-1230`;
`tests/unit/SectionsCanvas.paletteDrop.spec.tsx:164-174`). Neither passes an
empty payload, although production has a distinct `!raw` branch at
`src/components/SectionsCanvas.tsx:254-260`. Add that case. Also prefer a direct
store/config observable for “writes no config”; card count plus undo is useful
but does not distinguish every possible write.

## Semantic pipeline verification

I traced a concrete `entities` drop end to end:

1. `CardPalette.handleDragStart` serializes `{ cardType }` once, retains the
   existing `text/plain` entry, adds `PALETTE_CARD_MIME`, and keeps
   `effectAllowed = 'copy'` (`src/components/CardPalette.tsx:152-168`).
2. `SectionsCanvas.acceptsPaletteDrag` decides at `dragover` from
   `dataTransfer.types` and callback presence only; `paletteDragOver` prevents
   default and sets `dropEffect = 'copy'` (`src/components/SectionsCanvas.tsx:242-243,285-292`).
3. `paletteDrop` gates again, stops propagation, then
   `paletteCardTypeFrom` reads the marker with a drop-time `text/plain` fallback,
   parses it, validates a non-empty registered type, and calls
   `onPaletteCardDrop` (`:254-309`).
4. The body passes `{ sectionIndex: si, cardIndex: cards.length }`
   (`:539-546`); a card wrapper passes its exact `{ si, ci }` (`:674-684`).
5. `App.handleSectionPaletteDrop` checks config, selected view, registry, and
   non-empty sections; constructs default props/title without layout keys; and
   calls `insertCardIntoSectionAt` (`src/App.tsx:1223-1271`).
6. `insertCardIntoSectionAt` validates the section, clamps the card index, and
   returns a copied view with the card inserted (`src/utils/sectionsLayout.ts:143-156`).
7. `App` reference-checks before exactly one `updateConfig`, reads the landed
   index by identity, and calls `setSelectedSectionCard`
   (`src/App.tsx:1272-1289`). `dashboardStore.updateConfig` adds one prior config
   and clears future (`src/store/dashboardStore.ts:225-236`).
8. The changed view flows back through `GridCanvas` to `SectionsCanvas`, whose
   section-card map renders the new top-level card and applies selection to that
   address.

For the refusal path, I traced a marker-bearing malformed payload. Dragover is
accepted because its type and callback are valid. At drop,
`paletteCardTypeFrom` fails the JSON/shape/registry check, logs a warning, and
returns `null`; `paletteDrop` returns before invoking the App callback
(`SectionsCanvas.tsx:254-309`). The path therefore stops before card creation,
`insertCardIntoSectionAt`, the store write, selection, and user message. The
no-callback path stops even earlier in `acceptsPaletteDrag`, so neither
dragover nor drop is accepted.

## Contract and guard-rail audit

| Contract item | Result                               | Evidence                                                                                                                                                                                                                              |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MUST NOT 1    | Clean                                | `GridCanvas` changes only declare, receive, and forward the optional sections callback. Its flat `handleDragOver`, `handleDrop`, and PROPS-06 container branch are unchanged.                                                         |
| MUST NOT 2    | Clean                                | `text/plain` keeps the same JSON; the marker is additive and uses the same `payload` variable.                                                                                                                                        |
| MUST NOT 3    | Clean                                | No diff touches `dragActive`, `sectionDragActive`, `dragInProgress`, either source ref, or `dropOn`'s section-reorder-first/internal-move behavior. Palette branches return before, and otherwise fall through to, the old machinery. |
| MUST NOT 4    | Clean                                | The only store behavioral diff is the owner-approved `selectedSectionIndex: null` line in successful `loadDashboard`; selection reducers are unchanged.                                                                               |
| MUST NOT 5    | Clean                                | No `.png` is added or changed; no visual spec contains `type: sections`; no snapshot rebaseline is present.                                                                                                                           |
| MUST NOT 6    | Clean                                | Strategy placeholder and convert-to-sections banner are untouched.                                                                                                                                                                    |
| MUST NOT 7    | Clean                                | `handleCardAdd`'s flat branch is unchanged; the sections decision is only extracted to the shared resolver.                                                                                                                           |
| MUST NOT 8    | Source shape clean; proof incomplete | The marker is a separate full-width grid row below the toolbar, not a flex child. M3 explains why the required narrow/operability proof is incomplete.                                                                                |
| §7.1          | Clean                                | The marker is the only dragover palette discriminator; `text/plain` is read only after drop acceptance.                                                                                                                               |
| §7.2          | Clean                                | Callback presence gates both dragover and drop.                                                                                                                                                                                       |
| §7.3 six rows | Clean in source                      | Section body appends; card wrapper inserts at `ci`; empty-section and toolbar bubble; zero-sections owns the warning route; canvas root has no drop handlers.                                                                         |
| §7.6          | Clean in source                      | Guard/message parity, positionless defaults, reference-equal early return, one store write, landed selection, and no success toast are present.                                                                                       |

## Acceptance-criterion evidence audit

| AC  | Evidence judgment                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | L1 targets a verified bare body point and asserts last-card/other-section behavior; it inherits M1's unstable source helper.                                 |
| 2   | L2 targets `section-empty-1`, checks insertion and placeholder replacement; it inherits M1.                                                                  |
| 3   | L3 targets the original card and checks the shifted order; target measurement is not polled but the assertion distinguishes append from index 0.             |
| 4   | L4 targets the toolbar and checks only that section changes; adequate for append into an initially empty section, subject to M1.                             |
| 5   | Partial: L5 checks no card added but not no config write; see m1.                                                                                            |
| 6   | L1/L3 total counts distinguish duplicate insertion; subject to M1.                                                                                           |
| 7   | L6 starts from a different address and checks both selected indices; subject to M1.                                                                          |
| 8   | L7 checks insertion, one undo to exact pre-drop state, and one redo; subject to M1.                                                                          |
| 9   | L8 and L14 check marker/add agreement for fresh and second loads.                                                                                            |
| 10  | L9 checks last-section state, marker, and double-click destination.                                                                                          |
| 11  | Existing C1 selects a section card and checks double-click destination.                                                                                      |
| 12  | L10 checks the exact warning and zero cards; subject to M1.                                                                                                  |
| 13  | Existing C2/C3 plus C5 cover card move, section reorder, resize, and empty-section internal move.                                                            |
| 14  | Existing PROPS-06 control plus unchanged flat source cover nesting; the full targeted F5 spec does not exercise this separate file.                          |
| 15  | L11 has the right assertions but failed/reproduced wrong-card behavior; see M1.                                                                              |
| 16  | U1/U2 cover insertion positions, clamping, identity/no mutation, and all resolver outcomes.                                                                  |
| 17  | Partial: malformed/shape/unknown cases and no-card/selection/message/undo are checked, but empty and a direct no-config-write observable are absent; see m2. |
| 18  | Inadequate: see M3.                                                                                                                                          |
| 19  | Branch behavior is discriminated by U3, but its base-control claim is false; see M5.                                                                         |
| 20  | L14 uses two multi-section fixtures and directly checks reset, marker, and add destination.                                                                  |
| 21  | Inadequate: see M2.                                                                                                                                          |

## Base-leg classification audit

I traced every new e2e leg through the base source path, per assertion. I agree
with the signed spec/PR classifications for L1–L15:

| Leg | Base-path classification                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------- |
| L1  | SPLIT: landing/order red; unchanged other-section count green.                                                                    |
| L2  | Red: the palette drag is refused.                                                                                                 |
| L3  | Red: the palette drag is refused.                                                                                                 |
| L4  | Red: the palette drag is refused.                                                                                                 |
| L5  | Green for the wrong reason and not a control: base refuses every palette drop.                                                    |
| L6  | Red: the deliberately different prior selection remains.                                                                          |
| L7  | SPLIT: insertion/redo red; exact pre-drop list after no-op undo green.                                                            |
| L8  | SPLIT: marker red; existing double-click fallback destination green.                                                              |
| L9  | SPLIT: marker red; selected-last-section state and double-click destination green.                                                |
| L10 | SPLIT: warning red; no-card green because base refuses the drop.                                                                  |
| L11 | Red: there is no dropped card to inspect.                                                                                         |
| L12 | Green in every assertion and useful only as a branch-side over-broadening control.                                                |
| L13 | SPLIT: marker red; existing controls/rename green. Its assertions do not fully implement AC 18 (M3).                              |
| L14 | Red: retained section selection, wrong double-click destination, and absent marker all fail.                                      |
| L15 | SPLIT in its current assertions: top-level count red; unchanged child text green. Those assertions do not distinguish AC 21 (M2). |

L5's description is honest: it is green on base for the wrong reason and is not
a control. U3 is not honest as an _executed_ base-green control; M5 records the
import boundary that prevents that claim.

## Claim verification and observed commands

### Observed clean

- `./tools/checks` exited 0 on unmodified `2bb3f26`: Prettier clean,
  TypeScript clean, ESLint **0 errors / 145 warnings**, and Vitest **1,334 passed
  across 101 files**.
- The published sweep-list command emits the stated 20 files. M4 explains why
  that exact result does not prove zero under-inclusion.
- `grep -l "type: sections" tests/e2e/*.visual.spec.ts` and
  `grep -ln "sections" tests/e2e/*.visual.spec.ts` returned no match.
- `git diff --name-only main -- '*.png'` returned no path. There is no committed
  snapshot change or rebaseline.
- `docs/testing/uat/CARD_CORRECTIONS.md` appends only the prospective VIEWS-04
  citation correction. No UAT plan, verdict, strategy, or score is changed.
- The implementation diff contains no drive-by product behavior outside the F5
  forwarding, insertion, marker, and owner-approved load reset.

### Observed failure

- The exact F5 e2e command produced **31 passed / 1 failed**, not 32/32.
- Repeating L11 produced **3 passed / 2 failed**, both failures selecting the
  same wrong `custom:fold-entity-row` type. See M1.

### Not independently executed

- I did not recreate the claimed base run of **19 passed / 13 failed**. Doing so
  with the branch's new tests against base production would require altering or
  stashing source/tests, which this commission forbids. I instead traced each
  L1–L15 assertion through the base source; the classifications are recorded
  above. U3's claimed base run is statically impossible as written (M5).
- I did not rerun the author's entire multi-file Medium e2e sweep. I reproduced
  its selection command, mapped production load call sites to consumers, and
  ran the load-bearing F5 spec. M4 identifies the resulting population gap.
- I did not test a live Home Assistant instance; F5 does not require one.

## Required disposition

Do not merge PR #137 in its current state. Repair M1–M5 and m1–m2, rerun the
relevant unit/F5/regression evidence without changing the signed contract, and
update the PR evidence so every reported observation is executable and current.
Only BaggyG-AU decides whether the corrected implementation is acceptable and
merges it.

## Round 2

| Finding                                         | Disposition            | Round-2 judgment                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 — wrong palette source                       | **RESOLVED**           | `settledPointOnSelector` now requires three stable, hit-tested samples; `palettePointerDrag` settles the source both before target resolution and immediately before the press; and `expectDragStartedFromTile` requires exactly one `dragstart` record whose tile and `text/plain` payload name the requested card. I ran the whole 10-leg gesture class at `--repeat-each=5`: **50/50 passed**. The exact L11 command also passed **5/5**.                         |
| M2 — L15 did not exercise the container row     | **RESOLVED**           | L15 now targets `[data-testid="canvas-card"][data-section-index="0"][data-card-index="0"]`, asserts the new markdown card at top-level index 0, the vertical stack shifted to index 1, and `vertical-stack-container > div` remains exactly the two ordered children. The locator matches the renderer's direct child wrappers and would grow or change if a nesting implementation inserted the card.                                                               |
| M3 — L13 was neither narrow nor all-controls    | **RESOLVED**           | L13 resizes the BrowserWindow and renderer to **900×800**, proves the section is narrower than its 1920×1080 launch box and narrower than 900 px, retains the marker-below-toolbar geometry check, renames, hit-tests the reorder handle with Playwright `hover()`, reorders, and clicks Delete last. Repository-wide viewport search found 900 px is the suite's narrowest configured width; the only other custom viewport is 1200 px. The full F5 run passed L13. |
| M4 — load-path sweep was not a population proof | **PARTIALLY RESOLVED** | The script correctly finds all **nine** production `loadDashboard(...)` call sites, the template/entity-type specs were added, and L16 now crosses Apply into `mode: 'edit'`. But the advertised source-to-consumer mapping is still not valid: the script greps for control testid _mentions_, the document promotes those mentions to consumers that “drive” a handler, and `handleOpenRecentFile` still has no executed consumer. Details below.                  |
| M5 — impossible U3 green-on-base claim          | **RESOLVED**           | The U3 docblock and PR body now say the file cannot execute against base because its imports/API are branch-only, and classify the same-input refusal/acceptance pair as branch-side alternative evidence. The trace that the new dragstart assertion itself is green on base also holds: `main:CardPalette.handleDragStart` sets the same `text/plain` JSON before setting `effectAllowed`. No base execution is claimed.                                           |
| m1 — L5 observed only card count                | **RESOLVED**           | L5 now snapshots the dirty indicator, both history lengths, and the whole selection debug tuple before the background gesture and proves all remain unchanged afterward, in addition to card count and a verified background hit point.                                                                                                                                                                                                                              |
| m2 — no explicit empty payload                  | **RESOLVED**           | L12 and U3 now dispatch `''` with the marker MIME present, distinguish acceptance at the gate from rejection in `paletteCardTypeFrom`'s `!raw` branch, and prove no callback/config/history/selection/message effect. U3's eight cases and the complete F5 spec passed.                                                                                                                                                                                              |

### Verdict

**CHANGES-REQUIRED — High confidence.** Six round-1 findings are resolved, and
M1's repair is stable under a materially deeper repeat than the author's
published run. M4 remains blocking because the new evidence package still says
every call site has a named, executed consumer while one production call site
does not. A green 107-test sweep cannot support a path it never invokes.

### Regression and contradiction sweep

#### M1 probe and gesture class

The document-level bubble listener is reliable for the palette path inspected:
`CardPalette.handleDragStart` does not stop propagation, no palette ancestor has
a `dragstart` stop, React's delegated root handler runs before the event reaches
`document`, and `dragstart` is the readable phase for the payload the handler has
just written. The probe array is reset before each gesture and the listener is
armed only once. `toHaveLength(1)` could turn an unexpected duplicate event into
a loud failure, but it cannot make a wrong source pass; no duplicate or missing
record occurred in **50** consecutive class repetitions. The base trace is also
sound: `main:src/components/CardPalette.tsx` writes
`JSON.stringify({ cardType })` to `text/plain` in the same handler.

#### M4 remains partially resolved

`bash tools/f5-load-path-sweep.sh` exited 0 and printed the complete nine-site
production population. Comparing its output with the source and consumers found
the following contradiction:

- script sections 2–3 do not enumerate entry controls for File > Open or File >
  Open Recent at all; for the controls they do enumerate, section 3 reports any
  spec that contains the testid, not necessarily one that clicks it;
- the sweep table names `tests/e2e/recent-files.spec.ts` as the consumer of
  `App.handleOpenRecentFile`, but that file tests Save As registration,
  retargeting, cancellation, and export exclusion. The observed 107-test run
  showed those four tests and no Open Recent action. No test in the repository
  drives `menu:open-recent-file` through the renderer subscription;
  `tests/unit/menu.spec.ts` proves only that the main menu emits the path, not
  that App receives it and calls `loadDashboard`;
- the same mention/consumer confusion creates false extra mappings elsewhere:
  `templates.spec.ts` merely checks that the Sections and Entity Type sibling
  tiles are visible, and `entity-type-dashboard.spec.ts` merely checks that the
  Template tile is visible. The real consumers are `view-authoring.spec.ts` for
  Sections, `templates.spec.ts` for Template, and
  `entity-type-dashboard.spec.ts` for Entity Type; and
- therefore `docs/testing/F5_LOAD_PATH_SWEEP.md`'s claim that every one of the
  nine sites has a named consumer and each was executed is false for
  `App.handleOpenRecentFile`. The document neither runs that path nor explicitly
  justifies it by equivalence, which was the correction M4 required.

The blank-path command does return **80** files, and every matched call is a
`dashboard.createNew` variant whose default or explicit kind is blank. The scope
limit is legitimate: a Medium sweep need not become the full suite merely
because the blank creation path is common. Its accounting text is not clean,
however; see R2-m1.

#### Previously clean behavior and scope

- `git diff 0fcca14..4827082 --stat -- src/` is empty. The fix round changed no
  product code, and the signed spec is untouched.
- MUST NOT 1–8 and §7.1, §7.2, §7.3's six target rows, and §7.6 remain clean in
  source because no source moved. L13 now closes the former MUST NOT 8 proof
  gap. The 18-file e2e sweep also kept the flat PROPS-06 nesting control,
  internal section/card drag controls, resizing, selection, undo, and existing
  authoring paths green.
- The changed shared gesture helper strengthens L1–L7, L10, L11 and L15 rather
  than removing a postcondition. L8, L9, L14 and C5 do not call that helper;
  their bodies remain effective. L3's extra settled `(si, ci)` target is a
  justified same-class hardening and does not weaken its insert-at-index
  discriminator.
- L16 is in scope and needs no §11 amendment. The signed §9.2 expressly
  contemplates later added/changed legs and requires per-assertion base tracing;
  L16 supplies that trace while testing the already-governed load reset. Adding
  coverage does not amend the product contract or the immutable §9.2 table.
- The two evidence-infrastructure files are justified by M4, although their
  consumer mapping needs correction. Declining to repair the shared YAML DSL in
  this proof-only fix was proper scope control; the latent assertions were not
  needed to make L16 pass.
- `git diff --name-only main -- '*.png'` returned no path. The visual-spec
  sections greps also still return no match, so no snapshot or rebaseline moved.

The first self-reported L16 defect is real and fixed in the leg: the production
YAML `<Modal forceRender>` retains `yaml-editor-modal`, so an absence assertion
cannot become true on close; the current assertion targets the inner
`yaml-editor-content` visibility and L16 passed **3/3**. The second self-report
is only partly cleaned up: the mechanical count is 80, but the new evidence
document still contains the old number.

### New minor findings

#### R2-m1 — The corrected sweep document still says “all 83,” and the PR understates the blank-path sample

`docs/testing/F5_LOAD_PATH_SWEEP.md` first publishes and explains the corrected
**80** at lines 108–122, then says at line 131, “What is not claimed: that all
83 were run.” That is the exact stale hand-built number the round says it fixed.
The PR body additionally says six of the 80 blank-path specs were in the sweep,
but the published 18+8 list contains at least eight: the six the document names
plus `entity-remapping.spec.ts` and `monaco-editor.spec.ts`, both of which call
blank `dashboard.createNew()`. Correct the contradictory evidence text from the
mechanical result; do not add another manually maintained summary.

#### R2-m2 — One sibling impossible modal-absence helper remains undisclosed

The fix correctly reports the impossible `toHaveCount(0)` assertions in
`YamlEditorDSL.close()` and `.apply()`, and neither has a spec caller. The class
sweep finds the same latent assertion in
`tests/support/assertions/yaml.ts:expectYamlEditorModalHidden`, which locates
`yaml-editor-modal` and also expects count 0. It likewise has no caller, so it
does not invalidate any result above and need not have been repaired in this F5
commit. It is nevertheless a sibling of the disclosed defect and should be
included in the disclosure rather than leaving the inventory at two.

### Claim verification and observed commands

- `bash tools/f5-load-path-sweep.sh` — exit 0; nine production call sites; the
  consumer contradictions above were checked against the named specs and source.
- Gesture class, 10 enumerated legs, `--repeat-each=5` — **50 passed** in 7.6m.
- Exact L11 `--repeat-each=5` — **5 passed** in 1.1m.
- Exact L16 `--repeat-each=3` — **3 passed** in 43.6s.
- Complete `sections-canvas.spec.ts` — **33 passed** in 4.6m.
- Medium e2e sweep, 18 specs — **107 passed** in 15.8m.
- Medium integration sweep, 8 specs — **56 passed / 0 failed / 19 skipped** in
  9.6m; the skips were exactly the known `dashboard-generator.spec.ts`
  `describe.skip` group.
- `./tools/checks` — exit 0 across all four phases: Prettier clean, TypeScript
  clean, ESLint **0 errors / 145 warnings**, Vitest **1,335 passed across 101
  files**.
- Static scope checks — fix-round `src/` diff empty; main and origin/main both
  `82eb819`; no changed PNG; branch and origin began this round at `4827082`.

### Checked clean and not checked

Checked clean: M1, M2, M3, M5, m1 and m2; the source contract and MUST NOT
guardrails; all previously unflagged F5 legs and C5; the changed L3 target; L16's
scope and per-assertion classification; snapshot scope; all published test/gate
counts other than elapsed-time variation.

Not checked: no live Home Assistant instance was used; the full 307-test e2e and
235-test integration suites were not run; and I did not execute branch tests
against base production or attempt to reconstruct the author's uncommitted first
draft. Base classifications and the force-render failure were instead traced
through their source paths. PR #137 was confirmed open and unmerged at fix commit
`4827082`; I did not mark it ready, merge it, change UAT state, edit the signed
spec, or update `[STATE]`.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"`: file this Round-2 record—M1, M2, M3, M5,
  m1 and m2 resolved; M4 partially resolved because the nine-site source
  enumeration falsely maps `recent-files.spec.ts` to `App.handleOpenRecentFile`,
  leaving that call site unexecuted and unjustified. Include R2-m1's stale
  83/80 and six/eight accounting contradictions, R2-m2's undisclosed
  `expectYamlEditorModalHidden` sibling, and the observed 50/5/3/33/107 and
  56-pass verification results above.
