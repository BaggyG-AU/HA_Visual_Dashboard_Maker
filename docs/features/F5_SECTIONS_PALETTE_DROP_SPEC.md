# F5 — Sections-canvas insertion contract (Feature Spec)

**Status:** Draft
**Author:** Claude Opus
**Reviewer:** Codex — on-branch review, to land as
`docs/reviews/f5-spec-insertion-contract-codex-review.md`
**Owner gate:** spec approval before any code (ruling ARB-R7 /
`docs/governance/OPERATING_AGREEMENT.md` §1, §3)
**Branch:** `feature/f5-spec-insertion-contract` · **Created:** 2026-08-06

## 1. Objective

Give the sections canvas a complete, explicit **insertion contract**: a card
dragged from the palette lands in the section it was dropped on — empty or
populated — at a defined index, with the new card selected and the whole
insertion undoable in one step; and a card added by double-clicking the palette
lands in a section the user can **see** is the target before they act. Today
neither is true: `SectionsCanvas` has no palette-drop path at all, and the
double-click target falls back to section 0 with nothing on screen naming it.

## 2. Background

**The UAT finding.** VIEWS-04 ("Author a sections view — add, rename, reorder,
delete") failed round 3 at **High** severity. The tester's verbatim note
(`docs/testing/uat/sessions/uat_session_v1.0.0-r3_2026-08-03.json`,
`currentNotes/VIEWS-04`):

> Cannot drag cards into any section if the section is empty. Double-clicking
> lands a card to the last section if there are multiple sections.. Once the
> last section has a crard (through double-clicking) then can drag cards across
> sections. Needs to be stress tested (automated)

The card itself is at
`docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md:1267`, step 3 ("Add a
card into that section from the palette") with the Expected "A card added while
a section is selected lands **in that section**, not elsewhere".

**The two defects, as recorded in the live `[STATE]` drawer**
(`drawer_havdm_state_a15b0af78e0814cfd19cf627`, v142), verbatim:

> **VIEWS-04 (High) — TWO DEFECTS.** (1) `SectionsCanvas` has NO palette-drop
> handler; its drop targets gate `preventDefault()` on internal-drag flags
> (`:182`, `:411`, `:502`), and **HTML5 DnD refuses any drop whose `dragover`
> did not `preventDefault()`.** (2) Double-click add targets
> `selectedSectionIndex ?? 0`. ⭐⭐ **`handleSectionAdd` SELECTS the new
> section, and AN EMPTY SECTION IS ADDRESSABLE AT NO OTHER MOMENT. Feed into
> F5's R7 spec.**

**The adversarial review.** `docs/reviews/HAVDM_ADVERSARIAL_REVIEW_2026-08_FABLE.md`
§3.7 confirmed the mechanism in source and left one loose end — the tester says
double-click lands in the **last** section while the code defaults to section
**0** — asking that "the fix's test should pin down what `selectedSectionIndex`
is after 'Add section'". Its remediation entry (same file, §F5, line 758) asks
for the `GridCanvas` palette path in `SectionsCanvas`, an
`onPaletteDrop(sectionIndex)` prop, a double-click that lands in the _selected_
section, a **visibly** selected section, and — as a MUST NOT — no change to the
internal card/section drag flags, on which CANVAS-06 and VIEWS-05 depend.

§7.4 of this spec **closes that loose end**: the tester's observation and the
code agree, and the real defect is narrower and different from what the loose
end implied.

**Why a spec at all.** Ruling **ARB-R7**
(`drawer_havdm_decisions_6e8d4788d9513ccce593c378`) — item 6 of the owner's
13-item remediation order is "F5 sections palette drop — AFTER its R7 spec":

> **R7 — F5/F8: FULL RESPEC FIRST (CODEX'S POSITION PREVAILED …).** Before
> implementation: Opus writes (a) an F5 INSERTION-CONTRACT SPEC — palette
> payload shape, target-section resolution incl. what "Add section" sets
> `selectedSectionIndex` to, insertion semantics — and (b) an F8 THREE-WAY SPLIT
> PLAN … EACH SIGNED OFF BY THE OWNER before code.

The review pipeline is the one ratified on 2026-08-06
(`drawer_havdm_decisions_0475d2d73336a4a2481bdec6`, codified as
`docs/governance/OPERATING_AGREEMENT.md` §3 in PR #131): Opus authors, Codex
reviews on this branch, and **the owner's merge of this spec's PR is the R7
sign-off**. No implementation begins before that merge.

## 3. Finding Coverage

| Finding / Ruling / Deliverable                                                                                   | Addressed in section | Status  |
| ---------------------------------------------------------------------------------------------------------------- | -------------------- | ------- |
| **UAT VIEWS-04 defect (1)** — `SectionsCanvas` has no palette-drop handler; drops are refused                    | §7.1, §7.2, §7.3     | Covered |
| **UAT VIEWS-04 defect (2)** — double-click add targets `selectedSectionIndex ?? 0`                               | §7.4, §7.5           | Covered |
| **UAT VIEWS-04, tester** — "Cannot drag cards into any section if the section is **empty**"                      | §7.3 (empty section) | Covered |
| **UAT VIEWS-04, tester** — "Needs to be stress tested (automated)"                                               | §5 (deferred to F11) | Covered |
| **Ruling ARB-R7** — written, owner-signed spec before any code                                                   | Header, §2, §12      | Covered |
| **ARB-R7 required content** — palette payload shape                                                              | §7.1                 | Covered |
| **ARB-R7 required content** — target-section resolution, incl. what "Add section" sets                           | §7.4                 | Covered |
| **ARB-R7 required content** — insertion semantics                                                                | §7.3, §7.6           | Covered |
| **Fable review §3.7 loose end** — reconcile "lands in the last section" with the code's default-0                | §7.4                 | Covered |
| **Fable review §F5** — `onPaletteDrop(sectionIndex)` prop, `GridCanvas`'s path in `SectionsCanvas`               | §7.2, §7.7           | Covered |
| **Fable review §F5** — make the selected section **visibly** selected                                            | §7.5                 | Covered |
| **Fable review §F5 MUST NOT** — internal card/section drag flags and their gating unchanged                      | §5                   | Covered |
| **`[STATE]` v142** — "an empty section is addressable at no other moment"                                        | §7.4, §7.5           | Covered |
| **Coverage debt** — the card's cited `auto_covered` spec never reaches the fallback (a 21st `auto_covered` form) | §9.1, §9.4           | Covered |

## 4. In Scope

- A palette **drag-and-drop** path into a sections view: section bodies,
  section toolbars, existing cards, and the empty-section placeholder.
- The drop payload contract between `CardPalette` and every canvas.
- Target-section resolution for the palette **double-click** add path, and a
  **visible marker** naming that target before the user acts.
- Insertion index, post-insertion selection, and undo granularity for both
  entry points.
- One new pure insert-at-index helper and one new pure target-resolution helper
  in `src/utils/sectionsLayout.ts`, both unit-tested.
- Tests: the real-gesture e2e legs the card needs, plus repair of the card's
  `auto_covered` citation (§9.4).

## 5. Out of Scope

- **The DnD stress suite** the tester asked for ("Needs to be stress tested
  (automated)") — that is **F11 / CANVAS-03**, item 12 of the remediation order
  (`drawer_havdm_decisions_6e8d4788d9513ccce593c378`). F5 adds deterministic
  legs, not a stress harness.
- Dragging a card **out of** a sections view, between views, or from a flat view
  into a sections view.
- Section reorder, rename, delete, `max_columns` — shipped in slice 4.4 and
  covered by `tests/e2e/sections-canvas.spec.ts:466-580`.
- Any export / YAML / deploy behaviour.
- Re-marking VIEWS-04. The agent never marks a UAT test
  (`docs/testing/UAT_STRATEGY.md` §2; `ai_rules.md` §2).

### MUST NOT — the guard rails the reviewer verifies

1. **`GridCanvas`'s flat palette-drop behaviour must not change.**
   `handleDrop` (`src/components/GridCanvas.tsx:244-284`) and `handleDragOver`
   (`:286-289`) keep their current semantics, **including PROPS-06 container
   nesting** (`:264-275` → `onCardDropIntoContainer`).
2. **The palette's existing `text/plain` payload must not change.** It is
   `JSON.stringify({ cardType })` at `src/components/CardPalette.tsx:145`, and
   the comment at `:144` records that react-grid-layout looks for `text/plain`
   by default. Any new MIME is **additive** (§7.1).
3. **The internal drag machinery must not change** — `dragActive`,
   `sectionDragActive`, `dragInProgress` (`src/components/SectionsCanvas.tsx:144`,
   `:152`, `:182`), `dragSourceRef`, `sectionDragSourceRef`, and `dropOn`'s
   section-reorder-wins priority (`:184-204`). CANVAS-06 and VIEWS-05 depend on
   it (Fable review §F5).
4. **No change to the selection store's reducers or their reset semantics** —
   `src/store/dashboardStore.ts:258-352`. The `selectedSectionIndex: null` resets
   on `setSelectedView`, `setSelectedCard`, `setSelectedCards` and
   `selectCardWithMode` stay exactly as they are; §7.5 resolves the target for
   _display and add_ without changing what is stored.
5. **No new committed visual snapshots and no rebaseline.** §9.5 states why this
   slice cannot reach one.
6. **The strategy-view placeholder** (`GridCanvas.tsx:327-352`) and the
   convert-to-sections banner (`:361+`) are untouched.
7. **`handleCardAdd`'s flat-canvas branch** (`src/App.tsx:1156-1200`) is
   untouched; only its sections branch (`:1131-1154`) changes, and only in how
   the target section is resolved.

## 6. Files to Create / Modify

| Path                                 | Change                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/CardPalette.tsx`     | `handleDragStart` (`:143-147`) additionally sets the marker MIME. `text/plain` unchanged.                                                                      |
| `src/components/SectionsCanvas.tsx`  | New optional `onPaletteCardDrop` prop; palette branches in the section-body and card-wrapper `onDragOver`/`onDrop`; the target-section marker.                 |
| `src/components/GridCanvas.tsx`      | Forward one new optional prop to `SectionsCanvas` (`:297-316`). No change to its own drop handlers.                                                            |
| `src/components/SplitViewEditor.tsx` | Forward the same prop through to `GridCanvas` (`:491-510`).                                                                                                    |
| `src/App.tsx`                        | New `handleSectionPaletteDrop`; `handleCardAdd`'s sections branch uses the shared resolver; wire the prop at both `GridCanvas` mount sites (`:3296`, `:3348`). |
| `src/utils/sectionsLayout.ts`        | New `insertCardIntoSectionAt` and `resolveTargetSectionIndex` (both pure).                                                                                     |
| `tests/unit/sectionsLayout.spec.ts`  | Cases for both new helpers.                                                                                                                                    |
| `tests/e2e/sections-canvas.spec.ts`  | An empty-section fixture and the legs in §9.2; the citation repair in §9.4.                                                                                    |

## 7. Design / Contract

### 7.1 The palette drag payload

Today, `src/components/CardPalette.tsx:143-147`:

```ts
const handleDragStart = (e: React.DragEvent, cardType: string) => {
  // RGL looks for "text/plain" by default
  e.dataTransfer.setData('text/plain', JSON.stringify({ cardType }));
  e.dataTransfer.effectAllowed = 'copy';
};
```

attached to each palette tile at `:256-257` (`data-testid="palette-card-${type}"`,
`draggable`).

**The contract, after F5.** The palette sets **two** entries carrying the
identical JSON body:

| MIME                               | Value                          | Purpose                                                                             |
| ---------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `text/plain`                       | `JSON.stringify({ cardType })` | **Unchanged.** What `GridCanvas.handleDrop` reads (`:248`), and what RGL looks for. |
| `application/x-havdm-palette-card` | `JSON.stringify({ cardType })` | **New.** A type marker readable during `dragover`.                                  |

`effectAllowed` stays `'copy'`.

**Why the marker is necessary and not decoration.** During `dragover` the drag
data store is in _protected mode_: `dataTransfer.getData()` returns `''`, and
only `dataTransfer.types` is readable. A drop target must therefore decide
whether to `preventDefault()` from the **type list alone**. Discriminating on
`text/plain` would accept any stray text drag (for example a selection dragged
out of the Monaco YAML editor), which would then fail to parse at drop time and
no-op — the "gesture that silently does nothing" failure VIEWS-04 is about. The
marker MIME makes the dragover decision exact.

The three MIMEs in play are then mutually exclusive by construction:

| Gesture           | MIME set at `dragstart`                             | Source                                 |
| ----------------- | --------------------------------------------------- | -------------------------------------- |
| Palette drag      | `text/plain` + `application/x-havdm-palette-card`   | `CardPalette.tsx:143-147`              |
| Section card move | `application/x-havdm-section-card` (`DRAG_MIME`)    | `SectionsCanvas.tsx:54`, set at `:159` |
| Section reorder   | `application/x-havdm-section` (`SECTION_DRAG_MIME`) | `SectionsCanvas.tsx:55`, set at `:171` |

**Payload validation happens at `drop`, never at `dragover`.** On `drop`, read
`application/x-havdm-palette-card` (falling back to `text/plain`), `JSON.parse`
inside a `try`, and require a non-empty string `cardType` that
`cardRegistry.get()` resolves. A payload that fails any of those checks is
discarded with a `logger.warn` and no config write — the same defensive shape
`GridCanvas.handleDrop` already uses (`:281-283`).

### 7.2 The new component seam

```ts
// src/components/SectionsCanvas.tsx — added to SectionsCanvasProps
/**
 * F5: a card dragged from the palette and dropped inside this sections view.
 * `to.cardIndex` is the index the new card takes (existing cards from that
 * index shift down); `to.cardIndex === cards.length` appends.
 */
onPaletteCardDrop?: (cardType: string, to: SectionCardAddress) => void;
```

`SectionCardAddress` already exists (`SectionsCanvas.tsx:17-20`). The prop is
**optional**, matching every other authoring callback on this component
(`:41-48`), so read-only callers and existing test harnesses render exactly as
before.

`GridCanvas` forwards it in the sections delegation at `:297-316` (the branch
guarded by `view.type === 'sections'` at `:295`); `SplitViewEditor` forwards it
alongside `onCardDrop` at `:491-510`; `App.tsx` supplies
`handleSectionPaletteDrop` at both `GridCanvas` mount sites — the tabbed canvas
(`:3341-3363`) and the split editor (`:3279-3304`).

### 7.3 The drop-target contract, per target

Every row states what happens on `dragover` and on `drop`. **Internal-drag
behaviour in the last column is today's behaviour and must not change (MUST NOT
3).**

| Target                                                             | `dragover` — palette payload                                   | `drop` — palette payload                                                                    | Internal drag (unchanged)                                                                            |
| ------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Section body** — `sections-canvas-section-${si}` (`:390-415`)    | `preventDefault()`; `dropEffect = 'copy'`                      | Insert **at the end**: `onPaletteCardDrop(type, { si, cards.length })`; `stopPropagation()` | `preventDefault()` iff `dragInProgress` (`:411-413`); `dropOn` appends                               |
| **Card wrapper** — `canvas-card` at `(si, ci)` (`:486-509`)        | `preventDefault()`; `stopPropagation()`; `dropEffect = 'copy'` | Insert **at `ci`**: `onPaletteCardDrop(type, { si, ci })`; `stopPropagation()`              | `preventDefault()` + `stopPropagation()` iff `dragInProgress` (`:502-507`); `dropOn` inserts at `ci` |
| **Empty-section placeholder** — `section-empty-${si}` (`:675-687`) | _(no own handler — bubbles to the section body)_               | _(bubbles → append into section `si`)_                                                      | _(bubbles → `dropOn` appends)_                                                                       |
| **Section toolbar** — `section-toolbar-${si}` (`:419-477`)         | _(no own handler — bubbles to the section body)_               | _(bubbles → append into section `si`)_                                                      | _(bubbles → `dropOn` appends)_                                                                       |
| **No-sections placeholder** — `sections-canvas-empty` (`:691-698`) | `preventDefault()`; `dropEffect = 'copy'`                      | Adds nothing; warns (see below); `stopPropagation()`                                        | Not a target today either                                                                            |
| **Canvas root** — `sections-canvas` (`:314-332`)                   | **No `preventDefault()`** — deliberately not a drop target     | n/a — the browser refuses the drop                                                          | Not a target today either                                                                            |

Four consequences worth stating explicitly, because each is a place this can go
wrong:

1. **The empty-section case needs no new element handler.** The placeholder at
   `:677` is a child of the section body div, and React dispatches synthetic
   events along the React tree, so the section body's `onDragOver`/`onDrop`
   already fire for events targeting it. The _only_ reason an empty section
   refuses a palette drop today is the `dragInProgress` gate at `:412` — which
   is false for a palette drag, because nothing in `SectionsCanvas` sets it
   (`:144`, `:152` are set only by `onCardDragStart` `:154-160` and
   `onSectionDragStart` `:167-174`). Adding the palette branch to the section
   body therefore fixes the empty-section case and the populated case together.
2. **`stopPropagation()` on the card-level palette drop is mandatory.** Without
   it the event bubbles from the card wrapper to the section body and **both**
   handlers insert — two cards from one gesture. The internal path already
   stops propagation inside `dropOn` (`:186`); the palette path must do the same
   at its own handler.
3. **`dropEffect` must be `'copy'`.** The palette sets `effectAllowed = 'copy'`
   (`CardPalette.tsx:146`); a target that answers `dropEffect = 'move'` produces
   an incompatible pair and Chromium refuses the drop. `GridCanvas` already sets
   `'copy'` for exactly this reason (`GridCanvas.tsx:288`). Internal drags keep
   their current behaviour (`effectAllowed = 'move'` at `:157`/`:170`, no
   explicit `dropEffect`).
4. **The canvas background stays a non-target on purpose.** Dropping on empty
   canvas space produces a browser-level "no drop" cursor — a visible refusal.
   Silently teleporting the card into some section the user did not aim at is
   the class of surprise VIEWS-04 exists to remove.

**A sections view with zero sections.** `sections-canvas-empty` renders at
`:691-698`, inside `sections-canvas-grid` inside the canvas root. Because the
root is deliberately not a drop target, an event bubbling out of the placeholder
would be refused — so **the placeholder carries its own handler** (its row
above). A palette drop there is **accepted** (`preventDefault()`) and emits the
same warning the double-click path already emits —
`message.warning('This sections view has no sections to add a card to')`
(`App.tsx:1134`) — and writes nothing. Both entry points then behave alike, and
the gesture is answered rather than ignored. This is the one place where an
explicit new drop handler is required for an "empty" surface; the
**empty-section** placeholder (`section-empty-${si}`) needs none, because it sits
inside a section body that is itself a target.

### 7.4 Target-section resolution — and what "Add section" actually sets

**The measured answer to ARB-R7's question, and to Fable review §3.7's loose
end.** `SectionsCanvas`'s "+ Add section" button calls `onSectionAdd?.()` with
**no argument** (`SectionsCanvas.tsx:346-360`). In `App.tsx`,
`handleSectionAdd` (`:1741-1758`) therefore takes the `atIndex === undefined`
branch:

```ts
const newIndex = atIndex === undefined ? sections.length - 1 : /* … */;
setSelectedSectionCard(selectedViewIndex, newIndex, null);
```

— i.e. **"Add section" selects the newly added, LAST section, with no card
selected.** `setSelectedSectionCard` writes `selectedSectionIndex = newIndex`
and `selectedCardIndex = null` (`src/store/dashboardStore.ts:282-294`).

**The loose end is therefore closed: the tester and the code do not
disagree.** The tester's "double-clicking lands a card to the last section if
there are multiple sections" is the _correct_ consequence of having just added
a section — the last section was the selected one. The reading in Fable review
§3.7 ("the likely resolution is that adding a section selects it") is confirmed
in source, and the mechanism assertion is now measured rather than likely.

**The real defect is narrower.** The sections branch of `handleCardAdd`
(`App.tsx:1131-1154`) resolves its target at `:1137-1138`:

```ts
const targetSection =
  selectedSectionIndex !== null && sections[selectedSectionIndex] ? selectedSectionIndex : 0;
```

That falls back to section **0** whenever `selectedSectionIndex` is `null`, or
when it points past the end of `sections`. `selectedSectionIndex` is `null`:

| When                                                          | Where                                                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Initial state / a freshly loaded dashboard                    | `dashboardStore.ts:112`                                                                                                         |
| Switching views                                               | `setSelectedView` — `dashboardStore.ts:264`                                                                                     |
| Any flat-canvas selection                                     | `setSelectedCard` `:274`, `setSelectedCards` `:312`, `selectCardWithMode` `:328`, `:350`                                        |
| Clicking empty sections-canvas space while a card is selected | `SectionsCanvas.tsx:330` → `handleCardSelect(null, {sectionIndex: null})` → `App.tsx:973-975` → `setSelectedCards(…, [], null)` |
| Deleting a section                                            | `handleSectionRemove` — `App.tsx:1771`                                                                                          |
| Reordering sections                                           | `handleSectionMove` — `App.tsx:1785`                                                                                            |

So a user who opens a sections dashboard and double-clicks a palette card — the
most ordinary possible first action — lands it in section 0 **with nothing on
screen having said section 0 was the target**. There is no CSS for a selected
_section_: `src/components/SectionsCanvas.css` styles only
`.havdm-section-card--selected` (`:38`) and the resize handles.

**The contract.** One shared, pure resolver becomes the single source of truth
for the target, and the marker in §7.5 renders **the same value**:

```ts
// src/utils/sectionsLayout.ts
/**
 * F5: which section a section-less add (palette double-click) targets. Returns
 * null when the view has no sections. The rendered target marker and the add
 * path MUST both call this — a marker computed separately can disagree with
 * the behaviour it claims to describe.
 */
export const resolveTargetSectionIndex = (
  view: View | undefined | null,
  selectedSectionIndex: number | null,
): number | null => {
  /* sections.length ? clamp-or-0 : null */
};
```

Rules: no sections → `null`; a `selectedSectionIndex` that indexes an existing
section → that index; otherwise → `0`. This is behaviour-preserving for the add
path — it is the same decision `:1137-1138` makes today — and the fix is that
the fallback is now **displayed** rather than silent.

**A drop resolves its own target and never consults this resolver.** A drop
carries an explicit `(sectionIndex, cardIndex)` address from the element it
landed on (§7.3). The selection is an input to the _double-click_ path only.

### 7.5 Making the target visible

`SectionsCanvas` renders a marker on the section returned by
`resolveTargetSectionIndex(view, selectedSectionIndex)`:

- A `data-target-section="true"` attribute plus a distinct border/outline on
  that section's container div (`:390-415`), using `token.colorPrimary` so it
  tracks the active antd theme in both algorithms.
- A short label in that section's toolbar (`:419-477`) reading **"Cards add
  here"**, carrying `data-testid="section-add-target-${si}"`.

The marker is **derived state**, not stored state: nothing writes
`selectedSectionIndex` on render, and MUST NOT 4 stands. Clicking a card, adding
a section, or dropping a palette card all move the marker because they move the
selection — which is the point: after F5 the add target is never invisible.

⚠ **Design constraint carried from `[STATE]` v142:** "A CONTROL'S VISIBILITY
MUST NEVER DEPEND ON THE STATE IT SETS." The marker is read-only — it displays
the target and offers no click action, so it cannot enter that loop.

### 7.6 Insertion semantics

For a resolved `(sectionIndex, cardIndex)` and a validated `cardType`,
`App.handleSectionPaletteDrop` performs exactly the following, in order:

1. Guard: `config` present, `selectedViewIndex !== null`,
   `cardRegistry.get(cardType)` resolves — otherwise `message.error(…)` and
   return, matching `handleCardAdd:1113-1117`.
2. Build the card as `{ type, ...cardMetadata.defaultProps }`, and — matching
   the double-click path exactly (`App.tsx:1141-1143`) — set
   `title: 'New <name>'` for `entities` and `glance`. **No `_havdm_layout` and
   no `view_layout`:** a sections card is a positionless list entry
   (`sectionsLayout.ts:114-124`, and the comment at `App.tsx:1127-1130`).
3. `insertCardIntoSectionAt(view, sectionIndex, cardIndex, card)` — a new pure
   helper beside `addCardToSection` (`sectionsLayout.ts:120-124`), which today
   can only append. Index clamped to `[0, cards.length]`; an out-of-range
   section returns the input view reference-equal, the established convention in
   that module (`:118`, `:122`, `:129`, `:148`).
4. **One** `updateConfig({ ...config, views: nextViews })`. `updateConfig` pushes
   exactly one history entry and clears `future`
   (`src/store/dashboardStore.ts:208-215`), so **one drop = one Ctrl+Z**.
5. `setSelectedSectionCard(selectedViewIndex, sectionIndex, landedIndex)`, where
   `landedIndex` is the clamped insertion index — the new card is selected, as
   it is on the double-click path (`App.tsx:1149-1150`) and after an internal
   move (`:1712`).
6. **No success toast.** The card appears under the cursor; the landing site is
   self-evident. The double-click path keeps its toast (`:1152`), where the
   landing site may be scrolled out of sight.

**Why drop-on-a-card inserts at that card's index rather than appending.**
Sections are an ordered list rendered in array order — `gridAutoFlow: 'row
dense'` is CSS-only and "DOM order stays array order" (`SectionsCanvas.tsx:400-405`)
— so the index _is_ the visible position. The internal card-move contract
already reads a drop onto card `ci` as "take slot `ci`" (`dropOn` `:184-204` →
`moveSectionCard`). A palette drop that appended instead would make the same
gesture mean two different things depending on where the card came from.

### 7.7 What `GridCanvas` does today, for contrast

The path being extended, unchanged by this slice: `handleDragOver`
(`GridCanvas.tsx:286-289`) `preventDefault()`s **unconditionally** and sets
`dropEffect = 'copy'`; `handleDrop` (`:244-284`) reads `text/plain`, parses,
looks for a container under the drop point via `closest('[data-card-index]')`
and nests (PROPS-06), else calls `onCardDrop(cardType)` → `handleCardDrop`
(`App.tsx:1203-1205`) → `handleCardAdd`. Both are attached at `:405-406` and
`:461-462`.

The difference this spec turns into a contract: `GridCanvas` accepts _any_ drag
unconditionally and decides at drop time, because a flat canvas has no competing
internal HTML5 drag (react-grid-layout drives its own pointer gesture).
`SectionsCanvas` has two internal HTML5 drags of its own, so it must
discriminate at `dragover` — hence the marker MIME in §7.1.

## 8. Acceptance Criteria

1. Dragging a palette card onto a **populated** section inserts one card into
   that section; no other section's card count changes.
2. Dragging a palette card onto an **empty** section (dropping on the "Empty
   section" placeholder) inserts one card into that section, and the placeholder
   is replaced.
3. Dragging a palette card onto an existing card at `(si, ci)` inserts the new
   card **at index `ci`** of section `si`; the previously-there card and those
   after it shift down by one.
4. Dragging a palette card onto a section's **toolbar** appends into that
   section.
5. A palette drop on the sections-canvas **background** (outside every section)
   changes no config and adds no card.
6. Exactly one card is added per drop — never two — including drops on a card
   inside a section.
7. After any successful palette drop, the new card is selected:
   `selection-debug-state` shows `data-selected-section` = the target section and
   `data-selected-card` = the landed index.
8. A single Ctrl+Z after a palette drop restores the section to its exact
   pre-drop card list; a single Ctrl+Y re-applies it.
9. On a sections view with **no section selected**, the section that will
   receive a double-click add is visibly marked before the gesture, and a
   double-click add lands in that marked section.
10. Adding a section marks the new (last) section as the target, and a
    subsequent double-click add lands there — the tester's VIEWS-04 sequence.
11. Selecting a card in section _N_ moves the marker to section _N_, and a
    double-click add lands in section _N_ (existing behaviour, preserved).
12. A palette drop into a sections view with **zero sections** adds nothing and
    warns "This sections view has no sections to add a card to".
13. Internal card drag-move between sections, internal section reorder, and
    drag-resize all behave exactly as before.
14. The flat `GridCanvas` palette drop — including PROPS-06 container nesting —
    behaves exactly as before.
15. A sections card added by drop carries no `_havdm_layout` and no
    `view_layout` key, and `entities`/`glance` cards get the same default title
    as the double-click path.
16. `resolveTargetSectionIndex` returns `null` for a view with no sections, the
    selected index when it addresses an existing section, and `0` otherwise.

## 9. Test Plan

### 9.1 Why new tests are needed at all — the `auto_covered` audit

VIEWS-04's card is marked `Auto covered: Y (tests/e2e/sections-canvas.spec.ts)`
(`uat_plan_v1.0.0-r3_2026-08-03.md:1272`) and its "Automated coverage confirms"
paragraph claims the spec "proves … adding palette cards into the selected
section". Audited per the `[STATE]` recipe (open the cited spec, follow the DSL,
check which control it drives and which step that is):

- `tests/e2e/sections-canvas.spec.ts:96` "adds a palette card into the selected
  section" drives the real double-click (`palette.addCard` →
  `tests/support/dsl/cardPalette.ts:108` `card.dblclick()`), **but selects a card
  first** (`canvas.selectCard(2)` at `:108`, asserting
  `data-selected-section = '1'` at `:109-112`). It therefore only ever exercises
  the branch where `selectedSectionIndex` is non-null — the one that already
  works. **The `?? 0` fallback is never reached, so the assertion could not have
  failed on it.**
- **No spec anywhere drives a palette drag onto any canvas in a sections view.**
- The fixture (`SECTIONS_YAML`, `:7-25`) has **no empty section**, so no existing
  leg touches the tester's empty-section case at all.

This is a 21st form of the `auto_covered` problem catalogued in `[STATE]` v142:
_a spec that covers the working half of the step the card describes, and is
counted as covering the step._

### 9.2 New e2e legs — `tests/e2e/sections-canvas.spec.ts`

Extended in place rather than stacked in a new file, per the #129 lesson ("fix
the citation in place rather than stacking a second spec beside it" — `[STATE]`
v142). A second fixture with an empty section is added beside `SECTIONS_YAML`.

**Gesture policy.** Palette-drop legs use the **real gesture**
`locator.dragTo(target)`. Precedent that this drives the production HTML5 path
in Electron: `tests/e2e/canvas-resize-and-nesting.spec.ts:131` uses it to prove
PROPS-06 through `GridCanvas.handleDrop`'s `getData('text/plain')`. ⚠ The
dispatch helper `dispatchCardDrag` (`sections-canvas.spec.ts:196-211`) builds a
bare `new DataTransfer()` and sets **no data**, so it would exercise nothing in
§7.1's type-discriminated path; if any leg uses dispatch instead of `dragTo`, it
must call `setData` for **both** MIMEs first, or it measures nothing.

| Leg | What it drives                                                     | Proves AC | Red on base                                                             |
| --- | ------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------- |
| L1  | `dragTo` palette → populated section body                          | 1, 6      | ✅ drop refused (`dragover` never `preventDefault`ed) → count unchanged |
| L2  | `dragTo` palette → `section-empty-${si}`                           | 2         | ✅ same refusal — the tester's exact complaint                          |
| L3  | `dragTo` palette → `canvas-card` at `(0,0)`, assert text order     | 3, 6      | ✅ nothing lands                                                        |
| L4  | `dragTo` palette → `section-toolbar-${si}`                         | 4         | ✅ nothing lands                                                        |
| L5  | `dragTo` palette → sections-canvas background                      | 5         | ⚠ green on base (§9.3)                                                  |
| L6  | Selection after a drop, via `selection-debug-state`                | 7         | ✅ no drop happens, so no selection change                              |
| L7  | Ctrl+Z / Ctrl+Y around one drop                                    | 8         | ✅ no drop to undo                                                      |
| L8  | Fresh load, no selection: marker visible, then `palette.addCard`   | 9         | ✅ the marker does not exist on base                                    |
| L9  | "Add section" → marker on the new last section → `palette.addCard` | 10        | ✅ marker assertion; the landing half passes on base (§7.4)             |
| L10 | Zero-section sections view + `dragTo`                              | 12        | ✅ nothing happens **and no warning** on base                           |
| L11 | Dropped card's YAML has no `_havdm_layout` / `view_layout`         | 15        | ✅ no card to inspect                                                   |

### 9.3 Control legs — must pass on base **and** on the branch

Per the control-leg pattern used in #125/#126/#127/#129 (`[STATE]` v142).

| Leg | What it pins                                                    | Proves AC | Note                                                                                                                                                                                                                                                            |
| --- | --------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Double-click add **with a card selected** lands in that section | 11        | The existing `:96` leg, kept as the control                                                                                                                                                                                                                     |
| C2  | Internal card drag-move between populated sections              | 13        | The existing `:239` leg                                                                                                                                                                                                                                         |
| C3  | Internal section reorder + drag-resize                          | 13        | Existing `:270`, `:532`                                                                                                                                                                                                                                         |
| C4  | PROPS-06 container nesting on the flat canvas                   | 14        | Existing `canvas-resize-and-nesting.spec.ts:117`                                                                                                                                                                                                                |
| C5  | **Internal** card drag into an **EMPTY** section                | 13        | ⚠ **Outcome not assumed — measure it (§9.6).**                                                                                                                                                                                                                  |
| L5  | Palette drop on the canvas background is a no-op                | 5         | ⚠ **Passes on base for the wrong reason** — on base _every_ palette drop is refused. It has value only on the branch, where it pins that the fix did not over-broaden. Recorded per `[STATE]`'s "a green assertion on base is NOT automatically a control leg". |

### 9.4 Repairing the card's coverage citation

VIEWS-04's `Automated coverage confirms` paragraph
(`uat_plan_v1.0.0-r3_2026-08-03.md:1275-1279`) overstates what the cited spec
proves (§9.1). ⚠ **The agent never edits a UAT verdict or mark**
(`docs/testing/UAT_STRATEGY.md` §2). The correction is therefore filed the way
the project already handles card text: a **`CARD_CORRECTIONS.md` entry for
VIEWS-04**, applied at r4 plan generation, joining the three already queued
(HA-05, HA-06, PROPS-03 — `drawer_havdm_decisions_6e8d4788d9513ccce593c378`).
Its content: the cited spec's palette leg pre-selects a card and so does not
cover the no-selection target, and — after F5 — name the new legs.

### 9.5 Unit tests — `tests/unit/sectionsLayout.spec.ts`

- `insertCardIntoSectionAt`: insert at 0 / middle / `length` (append); index
  clamped below 0 and above `length`; out-of-range section returns the input
  **reference-equal**; the source view is not mutated.
- `resolveTargetSectionIndex`: no sections → `null`; valid selection → that
  index; `null` selection → `0`; out-of-range selection → `0`.

⚠ **No valid red leg exists for either.** Both are **brand-new exports**;
reverting `src/` makes the test fail at import with `X is not a function`, which
measures the revert and not the behaviour. This is the documented exception in
`docs/governance/OPERATING_AGREEMENT.md` §2 and
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-02.md`, and
the fifth consecutive slice to hit it (#125, #126, #127, #129 — `[STATE]` v142).
**Alternative evidence:** the red-legged e2e legs L1–L4 and L6–L11 above, which
exercise both helpers through the production path; and C1, which pins that the
resolver did not change the behaviour of the path that already worked. The
docblock of each new unit test states this in place.

### 9.6 Two things to measure before writing the fix

1. **C5 — does an internal card drag into an EMPTY section work on base?** The
   mechanism in §7.3 says yes (the section body's `onDragOver` is gated on
   `dragInProgress`, which _is_ true during an internal drag, and the empty
   placeholder has no handler of its own to interfere). Nothing measures it: the
   fixture has no empty section. ⚠ **Run C5 on base first. If it fails on base,
   there is a THIRD VIEWS-04 defect no artifact has identified — stop and report
   to the owner before implementing, because §7.3's bubbling assumption would be
   wrong.** Per `[STATE]` discriminator lesson (n): a triage hypothesis built
   from reading is a coin flip.
2. **Does `dragTo` deliver a `dragover` whose `dataTransfer.types` contains the
   marker MIME under Electron?** L1 is the probe; if `types` is empty under
   Playwright's synthesized drag, §7.1's discrimination must fall back to
   `text/plain` and §7.3's canvas-background refusal (AC 5) becomes the only
   protection against stray text drags. ⚠ Measure with one leg before building
   the rest on the assumption.

### 9.7 Expected baseline impact

- **Unit:** currently **1316/1316 across 100 files** (`[STATE]` v142). This slice
  adds cases to an existing file — the file count holds, the test count rises.
  Record the new number; comparing against 1316 afterwards reads as a false
  regression (the baseline has already moved five times).
- **e2e:** currently **307 tests = 298 passed / 7 failed / 2 skipped**, with
  **six** expected failures post-#128. L1–L11 and any new control legs raise the
  total. The six known failures must stay six.
- **Snapshots: zero impact, by construction.** `SectionsCanvas` renders only
  under `view.type === 'sections'` (`GridCanvas.tsx:295`), and **no visual spec
  loads a sections view** — `grep -l "type: sections" tests/e2e/*.visual.spec.ts`
  returns nothing, and no committed `.png` belongs to a sections spec. The §7.5
  marker therefore cannot reach a committed baseline. ⚠ Re-run that grep at
  implementation time rather than trusting this line (`[STATE]` lesson (z)).
- **Gate class:** `SectionsCanvas`, `GridCanvas`, `App.tsx` and a shared util are
  cross-cutting product code → **Medium minimum** on the regression gate matrix
  (`TESTING_STANDARDS.md` ~789). Escalating needs no ruling.

## 10. Open Questions

**Q1 — Should a palette card dropped onto a CONTAINER card inside a section nest
into it, as it does on the flat canvas?** PROPS-06 established for `GridCanvas`
that a palette card dropped on a container nests into it rather than becoming a
sibling (`GridCanvas.tsx:256-275`, `App.handleCardDropIntoContainer:1217+`). A
user who learned that on the flat canvas will expect it inside a section.
§7.3's contract as written does **not** nest: a drop on any card, container or
not, inserts at that card's index. Nesting would need a section-addressed
variant of `appendCardToContainer` and its own legs.

- Recommendation: **defer nesting to a follow-up**, and keep F5 to insert-at-index.
- ⚠ This question blocks **only** the container sub-clause of §7.3, row "Card
  wrapper". Every other row, and all of §7.1, §7.2, §7.4–§7.7, is unaffected by
  the answer.

## 11. Revision History & Amendments

| Date       | Rev | Change | By          |
| ---------- | --- | ------ | ----------- |
| 2026-08-06 | 0   | Draft  | Claude Opus |

## 12. Sign-off chain (ARB-R7)

1. **Author** — Claude Opus, this document, on `feature/f5-spec-insertion-contract`.
2. **Reviewer** — Codex, independently, on this branch, landing as
   `docs/reviews/f5-spec-insertion-contract-codex-review.md` in its own commit.
   The reviewer never merges and never edits this spec
   (`docs/governance/OPERATING_AGREEMENT.md` §3).
3. **Owner** — reads spec and review together. **The owner's merge of this PR is
   the ARB-R7 sign-off.** Implementation begins only after that merge, on its own
   branch and its own PR.
