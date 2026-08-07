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

## Round 3

| Finding                                        | Disposition            | Round-3 judgment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M4 — load-path consumer mapping                | **PARTIALLY RESOLVED** | L17 closes the previously uncovered Open Recent call site and passed **10/10** at twice the author's repeat depth. The nine source call sites are still enumerated correctly. The new `-A3` mapper is not a valid source-to-consumer proof, however: it silently drops real drivers and credits intermediate actions that do not reach the listed `loadDashboard` call.                                                                                                                            |
| R2-m1 — duplicated blank-path counts           | **PARTIALLY RESOLVED** | The live counts are removed from `F5_LOAD_PATH_SWEEP.md`, and its 83→80 text is clearly historical. The live PR body still says both that “all 80” were not run and that six swept specs exercise the path, while its Round-3 table says both counts were deleted. The document's replacement `comm` recipe also contains a literal `<the 26 swept spec paths>` placeholder, so it does not regenerate the asserted intersection as published.                                                     |
| R2-m2 — impossible YAML-modal helper inventory | **PARTIALLY RESOLVED** | The defect class is now complete: three impossible absence assertions and the opposite-direction visibility assertion all target the wrong outer modal node. No spec calls those broken helpers, so no result is invalidated and leaving the shared helper repair out of F5 remains correct scope control. The further universal “no spec imports `tests/support/assertions/yaml.ts` at all” is false: `tests/support/index.ts:66` re-exports it and 103 e2e/integration specs import that barrel. |

### Regression sweep over the six closed findings

M1, M2, M3, M5, m1 and m2 remain clean. Commit `0ceeac8` changes none of their
test bodies: the only behavioral addition to `sections-canvas.spec.ts` is L17,
plus three Node imports and an expanded L16 comment. The complete file passed
**34/34**, including the strengthened source discriminator, L15's container
postconditions, L13 at 900×800 with all controls operated, L5's state invariants,
L12's explicit empty payload and C5. `./tools/checks` also kept U3's branch-side
discriminator green.

L16 remains effective and passed in the full file. The `fs`, `os` and `path`
imports do not alter another leg. L17's temporary directory is created after a
successful launch, all writes and assertions are inside `try`, and its `finally`
closes Electron then removes the directory. The shared `close()` catches its own
app-close failure before returning, so the subsequent removal is still attempted;
no `havdm-f5-recent-*` directory remained after the 10-repeat and full-file runs.

`git diff 4827082..0ceeac8 --stat -- src/` is empty, and
`git diff --name-only main -- '*.png'` returns no path. The signed spec, UAT
state, `[STATE]` and product behavior are untouched. The
`TESTING_STANDARDS.md` edit is one additive 44-line subsection; it changes no
existing gate row or trigger, although the new subsection itself is a finding
below.

### Why M4 is still the same unswept class

`bash tools/f5-load-path-sweep.sh` exits 0 and still finds the complete nine-site
source population. L17 is good evidence for row 2: `src/menu.ts:31` sends
`menu:open-recent-file` with the path, L17 sends that exact channel and payload,
`src/preload.ts:173-175` forwards it, and `App.tsx:2838-2847` invokes
`handleOpenRecentFile`. The menu unit test independently clicks the real recent
item and proves the same full path is sent. Bypassing the OS menu is therefore a
faithful split at a separately tested boundary, not a product backdoor.

The traced no-prompt claim also holds. The initial replace-mode `loadDashboard`
sets `isDirty: false`; selecting a section card changes selection only; and
`confirmReplacingCurrentDashboard` returns immediately when `!isDirty`. L17 then
proves the loaded document, cleared section selection and target marker. Its
**10/10** repeat and the full-file pass support the new call-site consumer.

The regenerated mapping still fails elsewhere:

- `tools/f5-load-path-sweep.sh:93-96` keeps any action within three lines after a
  testid spelling. It misses the real Open driver in
  `dashboard-load-honesty.spec.ts:81-85`, where `.click()` is four lines after
  `toolbar-open-file`. It also misses `DashboardDSL.selectDashboardKind`: the
  three option strings are at lines 59–61 and the generic `option.click()` is at
  line 66. These omissions are silent rather than printed as unresolved hops.
- Row 7 names `tests/support/dsl/templates.ts:29`, but that click only calls
  `handleCreateFromTemplate` and opens the template chooser. It does not reach
  `handleTemplateSelected` at `App.tsx:2371-2377`. The genuine driver is the
  later template-tile action, such as `templates.spec.ts:107` calling
  `chooseTemplate()`.
- Row 8 names `entity-type-dashboard.spec.ts:196`. That test clicks the entry
  tile, verifies the wizard, and ends at line 210 without generating anything.
  The click merely sets `showEntityTypeWizard`; it cannot reach
  `handleCreateFromEntityType`. A genuine path continues through category
  selection and the Create Dashboard click, as the test at lines 246–264 does.
- The same window is over-inclusive in the other direction: actions on a
  category tile or Create button happen to appear under the entry-tile match.
  Proximity does not prove data or control flow. “Contains an action near the
  testid” is the same proxy error as “contains the testid,” one level later.

The underlying repository does have genuine consumers for all nine call sites;
the defect remains the evidence package's claim that this script and these named
lines demonstrate that fact. I traced the complete source population as follows:

1. `App.tsx:620` — the stubbed file chooser followed by `button.click()` in
   `file-open-unsaved-guard.spec.ts` reaches `handleOpenFile`.
2. `App.tsx:665` — L17 reaches `handleOpenRecentFile` through the production
   renderer subscription.
3. `App.tsx:1943` — `view-authoring.spec.ts:75` directly invokes the Sections
   option wired to `createNewSectionsDashboard`.
4. `App.tsx:2203` — the `loadYaml` helper used throughout `sections-canvas.spec.ts`
   directly invokes the test API.
5. `App.tsx:2299` — `presetMarketplace.importSelected()` reaches
   `onPresetImport` → `onDashboardDownload` → `handleDashboardDownload`.
6. `App.tsx:2346` — the blank option at `entity-type-dashboard.spec.ts:60` and
   `DashboardDSL.createNew()` reach `createNewDashboard`.
7. `App.tsx:2377` — `templates.spec.ts:107` selects a template tile and reaches
   `handleTemplateSelected`.
8. `App.tsx:2412` — the entity-type path at
   `entity-type-dashboard.spec.ts:246-264` selects a category and creates the
   dashboard, reaching `handleCreateFromEntityType`.
9. `App.tsx:2445` — L16 crosses both Apply and its confirmation to reach
   `handleApplyYamlChanges`.

The correct remedy is to make that terminal trace the generated evidence, with
unresolved multi-step hops named explicitly. Expanding `-A3` to a larger window
would only move the proxy again.

The two explicitly unexercised routes are characterised correctly. File-menu
Open reaches the same `handleOpenFile` already driven through the toolbar, so it
is a route gap rather than a call-site gap. The live-HA download route shares
`handleDashboardDownload` with the exercised preset-import route and needs a live
instance that F5 does not require. Neither omission contradicts the store-reset
coverage claim when stated at that granularity.

### R2-m1 and R2-m2 details

Deleting duplicate blank-path counts is the right application of the
remove-the-mechanism rule, not an evasion. It was not completed across the live
evidence surfaces. The PR body still contains the Round-2 sentence:
“What is deliberately NOT claimed: that all 80 specs ... were run. They were
not; six of them are in the sweep,” and later says the command “says 80.” Those
are the exact live `80` and six/eight contradictions R2-m1 identified, while the
new PR table says both counts were deleted. The historical 83→80 narrative in
the document is not a live count and is clean.

The replacement intersection recipe at `F5_LOAD_PATH_SWEEP.md:151-155` is also
not executable: `<the 26 swept spec paths>` is prose, not a command that derives
the set. Either publish a command that mechanically produces both inputs or make
the weaker claim that only the individually traced consumers were checked.

For R2-m2, the relevant caller sweep returns no use of `yamlEditor.close()`,
`yamlEditor.apply()`, `yamlAssertions`, `expectYamlEditorModalHidden()` or
`expectYamlEditorModalVisible()` in any spec. That is sufficient to establish
that the broken assertions ran in no published result. The import statement is
nevertheless false: `tests/support/index.ts:66` has
`export * as yamlAssertions from './assertions/yaml'`, and this command returns
103 spec files:

```bash
rg -l "from ['\"]\.\./support['\"]" tests/e2e tests/integration \
  --glob '*.spec.ts' | wc -l
```

The module is unused through that namespace, not unimported or dead. Correct the
claim; repairing the four latent assertions remains properly outside this F5
review-fix commit.

### New finding R3-M1 — the mandatory reviewer policy exceeds both its evidence and its stated scope

`TESTING_STANDARDS.md:813-855` labels the subsection “MANDATORY for independent
reviews,” says reviewers “MUST” run three things, orders Medium re-runs “BY
EXCEPTION ONLY,” and says to default to “accepting the author's counts.” It then
says the subsection does not amend reviewer governance and that binding
reviewers belongs in a separate governance PR. Both cannot be true: this text is
already written as a mandatory rule for reviewers.

The evidence is also only two rounds on one PR. It supports a useful provisional
heuristic—always rerun the load-bearing spec, deepen the flake probe, and spend
review time tracing coverage claims—but it does not establish the universal that
an author's entire gate is “mostly waste.” More importantly, an independent
reviewer may leave a Medium result **author-reported and not independently
rerun**; “accepting” the number converts an explicit evidence boundary into
apparent independent verification and gives an author language to hide behind.

The decision for this commit is still sound: I did **not** rerun the 18-spec e2e
or 8-spec integration sweeps because there is no `src/` change, their membership
did not change, and the only changed spec ran in full. The PR correctly marks the
old 107 result as measured at `4827082` and says the same set would now contain
108 tests because of L17. The problem is codifying that local judgment as a
mandatory cross-review rule from n=2, not this round's application of it.

Keep the subsection as explicitly provisional guidance, remove “MANDATORY,”
“MUST,” and “accepting,” and describe omitted re-runs as unverified. If the owner
wants a binding reviewer rule, take it through the governance PR the subsection
itself says is required. Because this policy was not needed to close M4,
R2-m1 or R2-m2, adding it here is fix-round scope overreach.

### Rising-round diagnosis and §3.3 judgment

For M4, this is **the same class patched one instance at a time: an author sweep
failure**. Round 1 replaced token spelling with testid spelling; round 2 replaced
mention with a three-line action window; round 3 still mistakes an intermediate
action for a terminal call-path consumer. The remedy is not another wider grep.
Trace all nine rows end to end once and make the evidence represent unresolved
hops honestly.

R3-M1 is separately the other failure mode: new work introduced while repairing
findings created a scope-control defect. That distinction matters; it does not
change the diagnosis of the M4 lineage.

`OPERATING_AGREEMENT.md` §3.3's rollback trigger has not fired: rounds 1 and 2
both produced findings the owner acted on, and this round found material
contradictions again. The cost is plainly approaching the point where another
broad rerun would be wasteful, but a narrow Round 4 is worth its cost because the
evidence artifact is not converged. It should verify one complete nine-row trace,
the removal of the live PR counts/import overstatement, and the policy rollback
or governance move—not reopen the six closed product-proof findings.

### Verdict

**CHANGES-REQUIRED — High confidence.** L17 and the product-facing regression
evidence are clean. Approval is blocked by M4's third invalid consumer map,
R2-m1's still-live PR contradiction, R2-m2's false import universal, and the new
mandatory reviewer rule's scope/evidence contradiction.

### Observed verification and limits

- `bash tools/f5-load-path-sweep.sh` — exit 0; nine production call sites; its
  section-3 omissions and false terminal mappings are described above.
- L17 at `--repeat-each=10` — **10 passed** in 1.7m, twice the author's depth.
- Complete `sections-canvas.spec.ts` — **34 passed** in 4.9m.
- `./tools/checks` — exit 0: Prettier clean, TypeScript clean, ESLint **0 errors /
  145 warnings**, Vitest **1,335 passed across 101 files**.
- Static scope — no `src/` diff since `4827082`; no changed PNG; no leftover L17
  temp directory; `main` and `origin/main` remained `82eb819` at review start.

Checked clean: all six previously closed findings, L16, L17's production-boundary
fidelity and cleanup, the two deliberately uncovered routes at call-site
granularity, source/snapshot scope, the 107→108 historical caveat, and the
additive-only shape of the testing-standards edit.

Not checked: no live Home Assistant instance or native OS menu click; no full
307-test e2e or 235-test integration suite; no re-run of the 18+8 Medium sweeps;
no branch execution against base production. I did not mark PR #137 ready,
merge it, edit its body, change UAT, edit the signed spec, or update `[STATE]`.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"`: file this Round-3 record—M4, R2-m1 and
  R2-m2 partially resolved; L17 clean at 10/10 and the full F5 file 34/34; the
  `-A3` map drops real drivers and maps template/entity entry clicks that do not
  reach their call sites; the PR still contains 80/six; the YAML module is
  barrel-imported but its broken helpers are uncalled; and R3-M1 finds the n=2
  mandatory reviewer policy both self-contradictory and out of repair scope.

## Round 4

| Finding                                        | Disposition            | Round-4 judgment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M4 — load-path consumer mapping                | **PARTIALLY RESOLVED** | The labelled hand trace is now the right instrument, and I independently followed all nine rows to their stated `loadDashboard` calls. The script no longer emits a mapping. Its advertised candidate population is still incomplete, however: `tools/f5-load-path-sweep.sh:113-114` ends each whole-file action search with `head -4`, silently dropping terminal drivers after the fourth action. It omits L16, L17 and row 8's category/Create actions while claiming to print “every line that ACTS.” |
| R2-m1 — duplicated blank-path counts           | **PARTIALLY RESOLVED** | The sweep document and script no longer publish the blank-path population count, and the literal `<the 26 swept spec paths>` recipe is gone. The live PR body still ends with the exact active statement Round 3 identified: “The command says **80**; the number is corrected.” Its latest repair section simultaneously says the live `80` is gone. Historical discussion may name the former error; this final note still republishes the count as current evidence.                                   |
| R2-m2 — impossible YAML-modal helper inventory | **RESOLVED**           | `tests/support/index.ts:66` is correctly disclosed as the `yamlAssertions` barrel re-export, and the published caller command is executable. With the comment filter it prints nothing (exit 1 because there are no matches); without the filter it prints the disclosure comment itself. The mechanical barrel-import command returns 103 spec paths. The supported claim is now “barrel-reachable but uncalled,” not “unimported.”                                                                      |
| R3-M1 — mandatory reviewer policy              | **RESOLVED**           | `TESTING_STANDARDS.md:813-856` says **PROVISIONAL**, “not a rule,” and “binds nobody”; presents four items as suggested emphasis; and says an omitted re-run remains **UNVERIFIED**, never accepted. `MUST`, `MANDATORY` and “accepting” now appear only while repudiating the earlier wording. The self-contradiction is gone. Round 3 expressly allowed this provisional rollback, so deletion is not required; a binding version still requires the separate §3(b) governance PR.                      |

### Regression check

`git diff 0ceeac8..d8ae22b --stat -- src/` is empty. The repair commit changes
only `F5_LOAD_PATH_SWEEP.md`, `TESTING_STANDARDS.md`,
`sections-canvas.spec.ts` and `f5-load-path-sweep.sh`; no PNG, signed-spec, UAT,
`[STATE]` or product file moved. `main` and `origin/main` remain `82eb819`.

The `sections-canvas.spec.ts` diff is comment-only: it replaces the false
“unimported” disclosure with the barrel-reachable/uncalled claim and its command.
No import, test body, assertion or executable expression changed. I therefore
did **not** rerun the load-bearing Electron spec: a comment-only diff cannot
affect its execution, so the prompt's condition for that run was not met.

`./tools/checks` passed all four phases: Prettier clean, TypeScript clean, ESLint
**0 errors / 145 warnings**, and Vitest **1,335 passed across 101 files**. The
18-spec e2e and 8-spec integration MEDIUM sweeps were not rerun. Describing their
results as **UNVERIFIED at `d8ae22b`**, rather than accepted, is now correct.

### The nine-row trace and the remaining M4 defect

The hand trace is falsifiable and its terminal claims hold:

1. `dashboard-load-honesty.spec.ts:79-85` chooses the visible welcome/toolbar
   button after stubbing the chooser, and both buttons are wired directly to
   `handleOpenFile` → `App.tsx:620`.
2. L17 sends `menu:open-recent-file`; `preload.ts:173-175` forwards the payload,
   `App.tsx:2838-2847` invokes `handleOpenRecentFile`, and `App.tsx:665` loads it.
3. `view-authoring.spec.ts:68-75` clicks the Sections option, whose dialog prop is
   `createNewSectionsDashboard` → `App.tsx:1943`.
4. `sections-canvas.spec.ts:699-704` calls `__dashboardTestApi.loadYaml` directly
   → `App.tsx:2203`.
5. `presetMarketplace.importSelected()` clicks the import control;
   `PresetMarketplacePanel` calls `onPresetImport`, `DashboardBrowser` forwards
   it to `onDashboardDownload`, and `handleDashboardDownload` reaches
   `App.tsx:2299`.
6. `entity-type-dashboard.spec.ts:60` clicks the Blank option, whose dialog prop
   is `createNewDashboard` → `App.tsx:2346`; the default `DashboardDSL.createNew`
   path selects the same option.
7. `templates.spec.ts:107` calls `chooseTemplate()`, whose tile click at
   `templates.ts:155` reaches `TemplateSelectionDialog.handleSelect` and
   `handleTemplateSelected` → `App.tsx:2377`. `templates.ts:29` only opens the
   chooser and is correctly excluded.
8. `entity-type-dashboard.spec.ts:246-264` opens the wizard, clicks a category,
   then clicks Create Dashboard; `EntityTypeDashboardWizard.handleGenerate`
   calls through `onGenerate` to `handleCreateFromEntityType` → `App.tsx:2412`.
   The `:196` case stops after rendering the wizard and is correctly excluded.
9. L16 clicks Apply and then Apply & Reload; `YamlEditorDialog.handleConfirmApply`
   calls `onApply`, wired to `handleApplyYamlChanges` → `App.tsx:2445`.

This is the correct structural split: mechanically enumerate the decidable
source population, then label and expose the control-flow judgment as a hand
trace. Moving the judgment into prose has not made it harder to falsify—the
per-row terminal action, callbacks and source call are named, and reading them
settled every row.

The candidate listing does not meet its separate promise. The exact action grep
finds 24 action-shaped lines in `sections-canvas.spec.ts`, but the script prints
only its first four. L16's actions at `:1683-1684` and L17's send at `:1771` are
absent. The same cap prints only lines `:22`, `:52`, `:60` and `:80` from
`entity-type-dashboard.spec.ts`, omitting row 8's terminal sequence at
`:246`, `:254` and `:261`. This is not another reachability-proxy failure—the
script correctly refuses to decide reachability—but it is still a false
completeness claim about the candidate input supplied to the hand trace. Remove
`head -4`, or explicitly publish the output as a truncated sample and remove
the “every line” / “every hop” claims from both artifacts.

### Step 4 — the stop question

The product remains clean, but the evidence artifact is **not yet converged**.
A narrow Round 5 is worth its cost for exactly two mechanical checks and nothing
else:

1. confirm the candidate output is genuinely whole-file, or that every claim of
   candidate completeness has been withdrawn; and
2. confirm the live PR body no longer republishes the blank-path count.

No product-proof finding, test body, L16/L17 behavior, YAML-helper inventory or
reviewer-policy wording needs reopening. If those two checks are clean and the
repair remains evidence-only, another broad review or Electron rerun would not
be worth its cost.

### Step 5 — the practice rule

`drawer_practice_claims_1fcfbf72537d81a3cdb9bc69` is a sound generalisation of
this episode. Its decidability precondition does **not** license skipping
evidence: a decidable population still requires a published command, while a
runtime-reachability claim that no adequate command can decide requires a
labelled, per-hop hand trace with unresolved hops exposed. The mechanical trigger—source-text search plus a
runtime-behaviour claim means stop—rejects the invalid instrument, not the duty
to investigate. The present nine-row trace demonstrates the distinction: the
trace is independently checkable even though grep cannot derive it.

The companion evidence-language clause is also correct. An unperformed check is
**UNVERIFIED**; “accepted” or “held” would falsely imply independent execution.
I found no defect in the new cross-project rule and no need to amend it from
this round.

### Verdict

**CHANGES-REQUIRED — High confidence.** R2-m2 and R3-M1 are resolved, and the
nine-row hand trace is correct. Approval remains blocked by M4's silently
truncated candidate population and R2-m1's still-live PR-body count.

### Observed verification and limits

- `bash tools/f5-load-path-sweep.sh` — exit 0; nine production call sites; the
  output itself demonstrates the `head -4` omissions described above.
- Published YAML-helper caller command — filtered output empty (exit 1); the
  unfiltered form returns only the disclosure comment; barrel-import enumeration
  returns 103 spec paths.
- `./tools/checks` — exit 0: Prettier clean, TypeScript clean, ESLint **0 errors /
  145 warnings**, Vitest **1,335 passed across 101 files**.
- Static scope — branch began clean at `d8ae22b`; no `src/` or PNG diff in the
  repair; `sections-canvas.spec.ts` comment-only; signed spec, UAT and `[STATE]`
  untouched; PR #137 open, unmerged and non-draft.

Checked clean: all nine terminal traces, the hand-trace/mechanical boundary,
R2-m2's published filter and barrel disclosure, R3-M1's provisional rollback,
the new practice rule, and the evidence-only regression surface.

Not checked: I did not re-audit M1, M2, M3, M5, m1, m2, L16 or L17; did not run
the load-bearing Electron spec, the 18+8 MEDIUM sweeps, either full suite, a live
Home Assistant instance, or a native OS-menu click; and did not execute the
branch against base production. I did not edit the PR body, mark the PR ready,
merge it, edit UAT or the signed spec, or update `[STATE]`.

### MemPalace drawer candidates

- `havdm/review`, `added_by="codex"` — **Round 3, still unfiled:** M4, R2-m1 and
  R2-m2 partially resolved; L17 clean at 10/10 and the full F5 file 34/34; the
  `-A3` map dropped real drivers and credited template/entity entry clicks that
  did not reach their call sites; the PR still contained 80/six; the YAML module
  was barrel-imported but its broken helpers were uncalled; and R3-M1 found the
  n=2 mandatory reviewer policy self-contradictory and outside repair scope.
- `havdm/review`, `added_by="codex"` — **Round 4:** the complete nine-row hand
  trace is correct and falsifiable; R2-m2 and R3-M1 are resolved; the practice
  decidability/UNVERIFIED rule is sound; `./tools/checks` passed at 1,335/101;
  M4 remains partial because `head -4` contradicts the candidate-completeness
  claim and drops L16/L17/row-8 actions; R2-m1 remains partial because the live
  PR body still says the command returns 80. Verdict CHANGES-REQUIRED, high
  confidence; any Round 5 should check only those two residues.
