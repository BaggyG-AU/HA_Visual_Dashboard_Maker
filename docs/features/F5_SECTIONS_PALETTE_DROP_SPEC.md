# F5 — Sections-canvas insertion contract (Feature Spec)

**Status:** Draft — rev 5: Codex rounds 1–4 applied, **both open questions answered by the owner** (§10, §11). No open questions remain; awaiting owner sign-off (merge of PR #132)
**Author:** Claude Opus
**Reviewer:** Codex — on-branch review
`docs/reviews/f5-spec-insertion-contract-codex-review.md`; round 1 `76cf6d4`,
round 2 `45bcbad`, round 3 `d853a74`, round 4 `1a1e4e8` — all four CHANGES-REQUIRED, all four
confidence High; findings applied in follow-up commits on this branch
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

| Finding / Ruling / Deliverable                                                                                                                       | Addressed in section                           | Status  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------- |
| **UAT VIEWS-04 defect (1)** — `SectionsCanvas` has no palette-drop handler; drops are refused                                                        | §7.1, §7.2, §7.3                               | Covered |
| **UAT VIEWS-04 defect (2)** — double-click add targets `selectedSectionIndex ?? 0`                                                                   | §7.4, §7.5                                     | Covered |
| **UAT VIEWS-04, tester** — "Cannot drag cards into any section if the section is **empty**"                                                          | §7.3 (empty section)                           | Covered |
| **UAT VIEWS-04, tester** — "Needs to be stress tested (automated)"                                                                                   | §5 (deferred to F11)                           | Covered |
| **Ruling ARB-R7** — written, owner-signed spec before any code                                                                                       | Header, §2, §12                                | Covered |
| **ARB-R7 required content** — palette payload shape                                                                                                  | §7.1                                           | Covered |
| **ARB-R7 required content** — target-section resolution, incl. what "Add section" sets                                                               | §7.4                                           | Covered |
| **ARB-R7 required content** — insertion semantics                                                                                                    | §7.3, §7.6                                     | Covered |
| **Fable review §3.7 loose end** — reconcile "lands in the last section" with the code's default-0                                                    | §7.4                                           | Covered |
| **Fable review §F5** — `onPaletteDrop(sectionIndex)` prop, `GridCanvas`'s path in `SectionsCanvas`                                                   | §7.2, §7.7                                     | Covered |
| **Fable review §F5** — make the selected section **visibly** selected                                                                                | §7.5                                           | Covered |
| **Fable review §F5 MUST NOT** — internal card/section drag flags and their gating unchanged                                                          | §5                                             | Covered |
| **`[STATE]` v142** — "an empty section is addressable at no other moment"                                                                            | §7.4, §7.5                                     | Covered |
| **Coverage debt** — the card's cited `auto_covered` spec never reaches the fallback (a 21st `auto_covered` form)                                     | §9.1, §9.4                                     | Covered |
| **Codex review M1** — `loadDashboard` omits the `selectedSectionIndex` reset, so a load can inherit a target                                         | §7.4, §10 Q2, §5 MUST NOT 4, AC 20, leg L14    | Covered |
| **Owner ruling Q2, 2026-08-06** — `loadDashboard` resets `selectedSectionIndex`                                                                      | §5 MUST NOT 4, §6, §7.4, AC 20, leg L14        | Covered |
| **Owner ruling Q1, 2026-08-06** — sections-container nesting deferred                                                                                | §5, §7.2, §7.3, AC 21, leg L15                 | Covered |
| **Codex round 2, M4 REGRESSION** — the Q1 audit table omitted rev 2's own ruling pins (AC 21, L15)                                                   | §10 Q1 table                                   | Covered |
| **Codex round 2, M5 residue** — L12 misclassified, C6 was not a control leg, AC 19 had no mandatory leg                                              | §9.2, §9.3, §9.5 U3, §6, §9.7                  | Covered |
| **Codex round 2, N1** — "every document opens ... at section 0" overstated the Q2 effect                                                             | §7.4                                           | Covered |
| **Codex round 3, P1** — "L9 is the only SPLIT leg" was false; L8 and L15 also mix base outcomes                                                      | §9.2 (L8, L15, per-assertion rule)             | Covered |
| **Codex round 3, P2** — the Testing Library precedent count was overstated (eleven vs nine)                                                          | §9.5                                           | Covered |
| **Codex round 4, R4-1** — the SPLIT inventory omitted L7, L10, L13; complete sweep performed and the summary count abolished                         | §9.2 (per-row classifications + no-count rule) | Covered |
| **Codex review M2** — a harness limitation must not weaken the `dragover` discriminator                                                              | §7.1, §9.6 item 2                              | Covered |
| **Codex review M3** — `insertCardIntoSectionAt` has a valid historical-behaviour red leg                                                             | §9.5 U1, U2                                    | Covered |
| **Codex review M4** — the container question blocks more contract than stated                                                                        | §10 Q1                                         | Covered |
| **Codex review M5** — ACs and legs did not prove several normative behaviours                                                                        | §8 AC 1, 15–19; §9.2                           | Covered |
| **Codex review m1–m5** — corrections register in §6; guard parity and no-op undo; optional-callback gating; dense-packing caveat; toolbar protection | §6, §7.6, §7.2, §7.6, §5 MUST NOT 8            | Covered |

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
- **Container nesting inside a section** — owner-ruled DEFERRED, 2026-08-06 (§10
  Q1). A palette card dropped on a container card inside a section becomes a
  **sibling at that index**, not a child, unlike the flat canvas's PROPS-06
  behaviour (`GridCanvas.tsx:256-275`). ⚠ Recorded as a deferred follow-up
  awaiting the owner's scheduling — it should settle nested-child **addressing**
  (the sections selection model is top-level `(sectionIndex, cardIndex)` only),
  not merely the drop. Not silently dropped, and not added to the 13-item
  remediation order unilaterally.
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
   _display and add_ without changing what is stored. ⚠ **ONE CARVE-OUT, owner-ruled
   2026-08-06 (§10 Q2): `loadDashboard` gains `selectedSectionIndex: null`
   alongside the four selection fields it already resets
   (`src/store/dashboardStore.ts:139-143`).** That single addition is in scope;
   every other reducer in that file stays untouched.
5. **No new committed visual snapshots and no rebaseline.** §9.7 states why this
   slice cannot reach one.
6. **The strategy-view placeholder** (`GridCanvas.tsx:327-352`) and the
   convert-to-sections banner (`:361+`) are untouched.
7. **`handleCardAdd`'s flat-canvas branch** (`src/App.tsx:1156-1200`) is
   untouched; only its sections branch (`:1131-1154`) changes, and only in how
   the target section is resolved.
8. **The section toolbar's existing controls must keep working.** The reorder
   handle, heading `Input` and Delete button live in one non-wrapping flex row
   (`src/components/SectionsCanvas.tsx:419-477`). The §7.5 marker must not
   obscure them, push any of them out of reach, or disable them — including in a
   one-column section on a narrow window. F5 must not regress the very
   section-authoring controls whose defect sequence it is repairing (AC 18).

## 6. Files to Create / Modify

| Path                                             | Change                                                                                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/CardPalette.tsx`                 | `handleDragStart` (`:143-147`) additionally sets the marker MIME. `text/plain` unchanged.                                                                                                     |
| `src/components/SectionsCanvas.tsx`              | New optional `onPaletteCardDrop` prop; palette branches in the section-body and card-wrapper `onDragOver`/`onDrop`; the target-section marker.                                                |
| `src/components/GridCanvas.tsx`                  | Forward one new optional prop to `SectionsCanvas` (`:297-316`). No change to its own drop handlers.                                                                                           |
| `src/components/SplitViewEditor.tsx`             | Forward the same prop through to `GridCanvas` (`:491-510`).                                                                                                                                   |
| `src/App.tsx`                                    | New `handleSectionPaletteDrop`; `handleCardAdd`'s sections branch uses the shared resolver; wire the prop at both `GridCanvas` mount sites (`:3296`, `:3348`).                                |
| `src/utils/sectionsLayout.ts`                    | New `insertCardIntoSectionAt` and `resolveTargetSectionIndex` (both pure).                                                                                                                    |
| `src/store/dashboardStore.ts`                    | **One line**: add `selectedSectionIndex: null` to `loadDashboard`'s success `set` (`:139-143`), per the owner's Q2 ruling and MUST NOT 4's carve-out. Nothing else in this file changes.      |
| `tests/unit/sectionsLayout.spec.ts`              | Legs U1/U2 for the two new helpers (§9.5).                                                                                                                                                    |
| `tests/unit/SectionsCanvas.paletteDrop.spec.tsx` | **NEW FILE** — leg U3, the mandatory component-level proof of AC 19 (§9.5). ⚠ Moves the unit **file** baseline 100 → 101 (§9.7).                                                              |
| `tests/e2e/sections-canvas.spec.ts`              | An empty-section fixture, a no-sections fixture, and the legs in §9.2/§9.3.                                                                                                                   |
| `docs/testing/uat/CARD_CORRECTIONS.md`           | Append the VIEWS-04 coverage-citation correction (§9.4). ⚠ The r3 plan and every UAT verdict stay untouched — this register is the committed, append-only mechanism for future-round wording. |

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

⚠ **The marker's membership in `dataTransfer.types` is the ONLY palette branch at
`dragover`.** `text/plain` is never a `dragover` acceptance criterion on a
sections target — that is the behaviour this paragraph rejects. A harness that
cannot deliver the marker does not license weakening this rule; see §9.6 item 2.

**Payload validation happens at `drop`, never at `dragover`.** On `drop`, read
`application/x-havdm-palette-card`; if it is empty, fall back to reading
`text/plain` (both entries carry the same JSON, and `getData` is readable at
`drop`). Then `JSON.parse` inside a `try`, and require a non-empty string
`cardType` that `cardRegistry.get()` resolves. A payload that fails any of those
checks is **discarded with a `logger.warn`, no config write, no message and no
selection change** — the same defensive shape `GridCanvas.handleDrop` already
uses (`:281-283`). This is AC 17, proved by leg L12.

⚠ The `drop`-time `text/plain` fallback is a **payload reader**, not an acceptance
rule: it only ever runs on an event a target already accepted because the marker
was present in `types`. It cannot widen what is accepted.

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

⚠ **Optional means the acceptance is conditional too.** Every palette branch in
§7.3 — `dragover` **and** `drop` — is gated on `onPaletteCardDrop` being present.
Without it, `SectionsCanvas` keeps today's behaviour exactly: no
`preventDefault()`, so the browser refuses the drop and shows a "no drop" cursor.
Accepting a drag and then silently discarding it because no writer is mounted
would recreate the exact silent-gesture failure F5 exists to remove. `GridCanvas`
sets the precedent in the other direction and is the reason to be explicit: it
accepts every `dragover` unconditionally and only then checks `if (!onCardDrop)
return;` at drop (`GridCanvas.tsx:244-246`) — a shape this component must not
copy.

⚠ **`to.cardIndex` always means the index the new card takes — including when the
addressed card is a container.** The owner ruled on 2026-08-06 that
sections-container nesting is deferred (§10 Q1, §5), so this callback has exactly
one meaning and needs no container discriminator.

`GridCanvas` forwards it in the sections delegation at `:297-316` (the branch
guarded by `view.type === 'sections'` at `:295`); `SplitViewEditor` forwards it
alongside `onCardDrop` at `:491-510`; `App.tsx` supplies
`handleSectionPaletteDrop` at both `GridCanvas` mount sites — the tabbed canvas
(`:3341-3363`) and the split editor (`:3279-3304`).

### 7.3 The drop-target contract, per target

Every row states what happens on `dragover` and on `drop`. **Internal-drag
behaviour in the last column is today's behaviour and must not change (MUST NOT
3).** Every palette cell below is additionally conditional on
`onPaletteCardDrop` being supplied (§7.2) and on the marker MIME being present in
`dataTransfer.types` (§7.1) — where either is absent, the row's behaviour is
today's behaviour.

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
| Initial state, before any document is loaded                  | `dashboardStore.ts:112` (`initialState`)                                                                                        |
| Switching views                                               | `setSelectedView` — `dashboardStore.ts:264`                                                                                     |
| Any flat-canvas selection                                     | `setSelectedCard` `:274`, `setSelectedCards` `:312`, `selectCardWithMode` `:328`, `:350`                                        |
| Clicking empty sections-canvas space while a card is selected | `SectionsCanvas.tsx:330` → `handleCardSelect(null, {sectionIndex: null})` → `App.tsx:973-975` → `setSelectedCards(…, [], null)` |
| Deleting a section                                            | `handleSectionRemove` — `App.tsx:1771`                                                                                          |
| Reordering sections                                           | `handleSectionMove` — `App.tsx:1785`                                                                                            |

⚠⚠ **BUT LOADING A DASHBOARD IS NOT ON THAT LIST, AND THAT IS MEASURED, NOT
ASSUMED.** `loadDashboard`'s success branch writes `selectedViewIndex`,
`selectedCardIndex`, `selectedCardIndices` and `selectionAnchorCardIndex` — and
**omits `selectedSectionIndex`** (`src/store/dashboardStore.ts:135-141`; the
field appears nowhere else in that reducer). Because zustand's `set` merges
partially, **a section index selected in the PREVIOUS document survives a
successful load of a new one.** If the inherited index happens to address an
existing section in the new view, both today's add path (`App.tsx:1137-1138`)
and this spec's resolver treat it as valid and target it.

That made two distinct no-visible-target states, not one:

1. **Genuine null** (the table above) — the add lands in section 0.
2. **Inherited non-null** — a second document opened in the same session could
   target whatever section number was selected in the first.

In both, a user double-clicks a palette card and the card lands somewhere
**nothing on screen has named**. There is no CSS for a selected _section_:
`src/components/SectionsCanvas.css` styles only `.havdm-section-card--selected`
(`:38`) and the resize handles.

**✅ State 2 is closed by the owner's Q2 ruling of 2026-08-06 (§10): F5 adds
`selectedSectionIndex: null` to `loadDashboard`'s success `set`**, so a load joins
the table above: **every successfully loaded sections view with at least one
section opens with the add target resolved to section 0.** Red leg L14 proves it.
⚠ The reset makes the field `null`; it does not make a section exist. A
**zero-section** view still resolves to `null` — the resolver's own no-sections
rule (AC 16) and the warning path (AC 12) — and a non-sections view has no
section target at all. The claim is about loaded **sections views with sections**,
never "every document". State 1 remains legitimate — it is the ordinary
no-selection case — and is closed not by changing state but by the §7.5 marker,
which renders whatever the resolver returns so the target is never invisible.

⚠ The retention is recorded here rather than deleted because it is the **reason**
the one-line store change is in this slice at all, and because it is the second
instance of previous-document state surviving a load in this same reducer — the
first was FILE-04's undo history (`src/store/dashboardStore.ts:145-165`). ⭐ **The
generalisable lesson: a partial `set` in a zustand reducer is a silent-retention
surface — enumerate the fields it does NOT name, not only the ones it does.**

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
- A short label reading **"Cards add here"**, carrying
  `data-testid="section-add-target-${si}"`.

⚠ **The label must be layout-neutral (MUST NOT 8).** The existing section
toolbar (`:419-477`) is a single non-wrapping flex row already holding the drag
handle, the heading `Input` (`maxWidth: 220`) and a Delete button pinned with
`marginLeft: 'auto'`. Adding a competing flex child to that row can squeeze or
push those controls out of reach in a one-column section on a narrow window —
regressing the very authoring controls VIEWS-04 covers. The label therefore
lands on **its own full-width grid line** (`gridColumn: '1 / -1'`, the same
device the toolbar itself uses at `:422`), immediately under the toolbar row and
outside its flex context, so it competes for no horizontal space. AC 18 and leg
L13 pin it.

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

1. Guard, with **per-precondition parity** with `handleCardAdd` — which does
   _not_ use one notification level for all three (`App.tsx:1101-1117`):
   no `config` → `message.warning('Please load a dashboard first')` (`:1102-1105`);
   `selectedViewIndex === null` → `message.warning('Please select a view first')`
   (`:1107-1110`); `cardRegistry.get(cardType)` unresolved →
   `message.error('Unknown card type: …')` (`:1113-1117`). Return in each case.
   ⚠ An unresolved card type is unreachable from a well-formed palette payload —
   §7.1's `drop` validation already rejects it silently — so this arm exists for
   parity, not as the primary path.
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
4. **Reference-equal early return, then one write.** `if (nextView === currentView)
return;` before touching the store — the invariant every existing App section
   handler already keeps (`App.tsx:1693-1703`, `:1741-1749`, `:1760-1772`,
   `:1775-1786`, `:1788-1797`). Without it, step 3's defensive no-op would push a
   junk undo entry that swallows the user's real previous edit. Then **one**
   `updateConfig({ ...config, views: nextViews })`: it pushes exactly one history
   entry and clears `future` (`src/store/dashboardStore.ts:208-215`), so **one
   drop = one Ctrl+Z**.
5. `setSelectedSectionCard(selectedViewIndex, sectionIndex, landedIndex)`, where
   `landedIndex` is the clamped insertion index — the new card is selected, as
   it is on the double-click path (`App.tsx:1149-1150`) and after an internal
   move (`:1712`).
6. **No success toast.** Step 5's selection is the feedback: the new card is
   selected, so it carries the selected-card styling
   (`.havdm-section-card--selected`) and drives the Properties panel. The
   double-click path keeps its toast (`:1152`), where the landing site may be
   scrolled out of sight.

**Why drop-on-a-card inserts at that card's index rather than appending.**
Sections are an ordered list, and `ci` is its **logical array index** — which is
also DOM order, since `gridAutoFlow: 'row dense'` is CSS-only and "DOM order
stays array order" (`SectionsCanvas.tsx:400-405`). It is the index that YAML,
export, selection and every existing section operation address. The internal
card-move contract already reads a drop onto card `ci` as "take slot `ci`"
(`dropOn` `:184-204` → `moveSectionCard`); a palette drop that appended instead
would make the same gesture mean two different things depending on where the card
came from.

⚠ **`ci` is a logical position, not a promised pixel.** Dense packing may
backfill an earlier hole with a later, smaller item, so with mixed
`grid_options.columns` spans a card at array index `ci` can render before or
after its neighbours — the CSS Grid specification says dense placement can make
items appear out of order. The contract is therefore stated in array/DOM terms
only, and the landing proof offered to the user is the **selection** (step 6),
never a claim about where the card visually appears.

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

1. Dragging a palette card onto a **populated** section's own body — a point
   belonging to neither a card nor the toolbar — appends the new card as that
   section's **last** card; no other section's card count changes.
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
    `view_layout` key, and an `entities` or `glance` card added by drop gets the
    same `New <name>` default title the double-click path gives it
    (`App.tsx:1141-1143`).
16. `resolveTargetSectionIndex` returns `null` for a view with no sections, the
    selected index when it addresses an existing section, and `0` otherwise;
    `insertCardIntoSectionAt` inserts at index 0, in the middle, and at
    `cards.length`, clamps out-of-range indices, and returns the input view
    reference-equal for an out-of-range section.
17. A drop carrying a **malformed, empty, or unknown-card-type** payload adds no
    card, writes no config, pushes no undo entry, changes no selection, and shows
    no message.
18. With the target marker rendered, a section's reorder handle, heading input
    and Delete button all remain visible and operable — including in a
    one-column section at the suite's narrowest window — and the marker occupies
    no part of the toolbar's flex row (MUST NOT 8).
19. A `SectionsCanvas` mounted **without** `onPaletteCardDrop` refuses palette
    drops exactly as it does today: no `preventDefault()`, no card, no message.
20. Loading a second dashboard over a first **clears the section selection**:
    `selection-debug-state` shows `data-selected-section="null"` immediately
    after the load, whatever was selected in the previous document, and the
    target marker sits on section 0. (Owner ruling Q2 — §10.)
21. A palette card dropped on a **container** card inside a section becomes a
    **sibling at that card's index**, not a child — the deferred-nesting ruling
    (§10 Q1) made explicit, so a later change to it is a visible contract change
    rather than a silent one.

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
v142). Two fixtures are added beside `SECTIONS_YAML`: one with an **empty**
section, one with **no** sections.

**Gesture policy — and its limit.** Palette-drop legs prefer the **real gesture**
`locator.dragTo(target)`. Precedent that this drives the production HTML5 path in
Electron: `tests/e2e/canvas-resize-and-nesting.spec.ts:131` uses it to prove
PROPS-06 through `GridCanvas.handleDrop`'s `getData('text/plain')`. ⚠ The
dispatch helper `dispatchCardDrag` (`sections-canvas.spec.ts:196-211`) builds a
bare `new DataTransfer()` and sets **no data**, so it exercises nothing in §7.1's
type-discriminated path; a dispatch-based leg **must** `setData` for **both**
MIMEs first, or it measures nothing. Where a leg needs a deterministic,
fully-controlled payload — L12 above all — it uses an explicitly populated
`DataTransfer` by design, not as a fallback. ⚠⚠ **Neither choice may change the
product contract: see §9.6 item 2.**

**Targeting precision.** `dragTo` drops at the target locator's centre by
default, so a bare `sections-canvas-section-${si}` locator can land on a child
card or the toolbar — a different row of §7.3's table, and a silently different
assertion. Legs that mean "the section's own body" must pass an explicit
`targetPosition` inside a region belonging to neither, and assert the resulting
**index** (last), not merely a count.

| Leg | What it drives                                                                                                                                                                                                                                                                                                   | Proves AC | Real outcome on base                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | `dragTo` palette → populated section **body** at an explicit bare-region `targetPosition`; assert the new card is **last**, and that no other section's count changed                                                                                                                                            | 1, 6      | 🟠 SPLIT — **card-lands and is-last assertions RED** (drop refused; `dragover` never `preventDefault`ed); **"no other section changed" assertion GREEN** (nothing changes anywhere on base). The green half is AC 1's second clause and is still REQUIRED — it is what catches an implementation that writes into the wrong section                                                                                                                      |
| L2  | `dragTo` palette → `section-empty-${si}`                                                                                                                                                                                                                                                                         | 2         | 🔴 RED — same refusal; the tester's exact complaint                                                                                                                                                                                                                                                                                                                                                                                                      |
| L3  | `dragTo` palette → `canvas-card` at `(0,0)`; assert text order, new card first                                                                                                                                                                                                                                   | 3, 6      | 🔴 RED — nothing lands                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| L4  | `dragTo` palette → `section-toolbar-${si}`                                                                                                                                                                                                                                                                       | 4         | 🔴 RED — nothing lands                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| L5  | `dragTo` palette → sections-canvas background                                                                                                                                                                                                                                                                    | 5         | 🟢 GREEN on base — and **not** a control leg; see §9.3                                                                                                                                                                                                                                                                                                                                                                                                   |
| L6  | Selection after a drop, via `selection-debug-state`                                                                                                                                                                                                                                                              | 7         | 🔴 RED — no drop happens, so the selection never moves to the new card. ⚠ **Fixture-dependent, like L14:** the pre-drop selection must differ from the expected post-drop `(section, card)`, or both assertions pass on base for the wrong reason. Set the fixture to select a card in a **different** section before the drop, and state it in the spec docblock                                                                                        |
| L7  | Ctrl+Z / Ctrl+Y around one drop                                                                                                                                                                                                                                                                                  | 8         | 🟠 SPLIT — **the insertion and the Ctrl+Y re-apply assertions RED** (no drop happens, so there is nothing to undo or redo); **the "Ctrl+Z leaves the exact pre-drop list" assertion GREEN** — a replace load starts with empty history (`dashboardStore.ts:135-178`), the refused drop pushes none, so Ctrl+Z is a no-op over an already-pre-drop list                                                                                                   |
| L8  | Load a sections dashboard into a **fresh process** (no prior document): marker visible, then `palette.addCard` lands in the marked section                                                                                                                                                                       | 9         | 🟠 SPLIT — **marker assertion RED** (no marker exists on base); **landing assertion GREEN** (with initial state `null`, `handleCardAdd` already falls back to section 0, `dashboardStore.ts:112` + `App.tsx:1131-1138`, so the card lands where the marker would have pointed). ⚠ The landing assertion is still REQUIRED — without it L8 proves only half of AC 9                                                                                       |
| L9  | "Add section" → marker on the new last section → assert `selection-debug-state[data-selected-section]` **directly** → `palette.addCard`                                                                                                                                                                          | 10        | 🟠 SPLIT — the debug-state and landing assertions pass on base (they pin §7.4's measured claim, and answer Fable §3.7's "pin down what Add section stores"); the marker assertion is RED                                                                                                                                                                                                                                                                 |
| L10 | **No-sections** view + `dragTo`; assert no card is added **and** the warning text appears                                                                                                                                                                                                                        | 12        | 🟠 SPLIT — **no-card assertion GREEN** (base refuses the gesture, so nothing is added); **warning assertion RED** (base emits no warning on the refused path). Both halves are AC 12                                                                                                                                                                                                                                                                     |
| L11 | Drop an **`entities`** card; assert `title === 'New Entities'` **and** no `_havdm_layout` / `view_layout`                                                                                                                                                                                                        | 15        | 🔴 RED — no card to inspect                                                                                                                                                                                                                                                                                                                                                                                                                              |
| L12 | Dispatched drop with an explicitly populated `DataTransfer` carrying (a) non-JSON, (b) `{}`, (c) an unregistered `cardType`; assert no card, no message, no undo entry, unchanged selection                                                                                                                      | 17        | 🟢 GREEN on base, **wholly** — see the note below. A branch-side over-broadening control, **not** a red leg                                                                                                                                                                                                                                                                                                                                              |
| L13 | Marker rendered, one-column section: reorder handle, heading input and Delete are visible and operable; rename through the input still commits                                                                                                                                                                   | 18        | 🟠 SPLIT — **marker-rendered assertion RED** (no marker on base); **the control-preservation assertions GREEN** (handle, heading, Delete and rename all already work on base — `SectionsCanvas.tsx:416-477`, `tests/e2e/sections-canvas.spec.ts:489-555`). The green half is the point of the leg: it is what proves the marker did not displace them                                                                                                    |
| L14 | **Two phases, one leg.** Load dashboard A (≥2 sections), select a card in its **section 1**, load dashboard B (also ≥2 sections) over it. Phase 1: assert `selection-debug-state[data-selected-section] === 'null'`. Phase 2: `palette.addCard`, assert it lands in **section 0** and the marker names section 0 | 9, 20     | 🔴 RED, all three assertions — on base the index is retained, so phase 1 reads `'1'`, phase 2's add lands in section 1, and no marker exists. ⚠ **The fixture's section counts are load-bearing and must be as stated**: if B had one section the phase-2 assertion would be vacuous, and if A had no selection phase 1 would pass on base. ⭐ Phases 1–2 use only base-existing testids, so those survive the `git stash push -u src/` technique intact |
| L15 | Drop a palette card on a **vertical-stack** card inside a section; assert it lands as a **sibling** at that index and the stack's own child count is unchanged                                                                                                                                                   | 21        | 🟠 SPLIT — **sibling-insertion assertion RED** (nothing lands on base); **stack-child-count assertion GREEN** (nothing lands, so the stack is trivially unchanged). The green half is what pins the deferred-nesting ruling on the branch, so a future nesting change cannot land silently                                                                                                                                                               |

⚠⚠ **CLASSIFICATION IS PER ASSERTION, NOT PER LEG — and a leg's colour must be
TRACED THROUGH THE BASE CODE PATH, never inferred from what the leg is for.**
Per `[STATE]` discriminator lesson (m), a red leg where one assertion passes on
base is stronger, not weaker: it proves which behaviour is being measured. So a
🟠 SPLIT leg is not a weak leg, and its green half is never optional — in L1,
L10 and L13 the green half is the assertion that catches the wrong-target,
wrong-message and displaced-control failures respectively.

⚠⚠⚠ **THE TABLE ABOVE IS THE INVENTORY. THERE IS NO SUMMARY COUNT, AND NONE MAY
BE ADDED.** Every leg carries its own classification in its own row; a sentence
elsewhere claiming "N legs are SPLIT" or "L*n* is the only …" would be a second
source of truth that drifts the moment a leg is added or reclassified. **This
spec has already produced that exact defect three times** — "L9 is the only SPLIT
leg" (round-3 P1), then "three legs mix" (round-4 R4-1), each written as a
summary of a sweep that had not been performed. **The rule: state per-row
classifications only, and when a leg changes, re-derive from the table rather
than editing a count.**

⚠ **The implementation PR must report SPLIT legs per assertion.** Describing a
base-green assertion as part of an undifferentiated red result is the same
accounting error in the other direction from calling a wholly-green leg SPLIT,
and `OPERATING_AGREEMENT.md` §2 makes observed red behaviour — not a test's
eventual usefulness — the controlling evidence. **Any leg added or changed later
must be re-traced through the base path, per assertion, before it is given a
colour** — including legs that look obviously red.

⚠⚠ **L12 IS GREEN ON BASE IN EVERY ASSERTION, AND SAYING OTHERWISE WOULD RECORD
A GREEN AS A RED LEG.** Traced on base: a real palette gesture never reaches a
handler at all (the palette sets only `text/plain`, `CardPalette.tsx:143-146`,
and section targets `preventDefault()` only for an internal drag,
`SectionsCanvas.tsx:181-182`, `:411-414`, `:502-508`). And even a **directly
dispatched** `drop` — which bypasses the browser's refusal — reaches `dropOn`,
which clears the internal drag state and returns at
`if (!from || !onCardMove) return;` (`:184-204`): no config write, no selection
write, no undo push, no message. So **all four** of L12's assertions pass on base.
**AC 17 therefore has no valid red leg**, because base and branch agree for an
invalid payload — nothing happens either way. L12's value is entirely on the
branch, where it discriminates the implementation from an over-broad one that
writes, warns, or pushes undo on garbage input. It is a **control**, and the
implementation PR must not report it as a red leg.

⚠ **AC 19 (no callback ⇒ today's refusal) is not e2e-reachable** — every
production mount supplies the callback (§7.2). It is proved by **named leg U3**
(§9.5), a component-level render, not by an optional choice deferred to
implementation time. The repository already renders components in the unit suite
with Testing Library (`tests/unit/card-context-menu.spec.tsx:22-37`), so the
"code inspection instead" fallback is not available.

### 9.3 Control legs — must pass on base **and** on the branch

Per the control-leg pattern used in #125/#126/#127/#129 (`[STATE]` v142).

| Leg | What it pins                                                                                                                                                      | Proves AC | Note                                                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1  | Double-click add **with a card selected** lands in that section                                                                                                   | 11        | The existing `:96` leg, kept as the control                                                                                                                                                                                                                                                                        |
| C2  | Internal card drag-move between populated sections                                                                                                                | 13        | The existing `:239` leg                                                                                                                                                                                                                                                                                            |
| C3  | Internal section reorder + drag-resize                                                                                                                            | 13        | Existing `:270`, `:532`                                                                                                                                                                                                                                                                                            |
| C4  | PROPS-06 container nesting on the flat canvas                                                                                                                     | 14        | Existing `canvas-resize-and-nesting.spec.ts:117`                                                                                                                                                                                                                                                                   |
| C5  | **Internal** card drag into an **EMPTY** section                                                                                                                  | 13        | ⚠ **Outcome not assumed — measure it (§9.6).**                                                                                                                                                                                                                                                                     |
| U3  | `SectionsCanvas` rendered **without** `onPaletteCardDrop`: a dispatched palette `dragover` is **not** `preventDefault()`ed and a dispatched `drop` writes nothing | 19        | Component-level (Testing Library), green on base **and** branch — the mandatory named proof for AC 19. New file `tests/unit/SectionsCanvas.paletteDrop.spec.tsx` (§6, §9.7)                                                                                                                                        |
| L5  | Palette drop on the canvas background is a no-op                                                                                                                  | 5         | ⚠ **Passes on base for the wrong reason** — on base _every_ palette drop is refused, so this is **not** a control leg: it discriminates nothing until the branch exists, where it pins that the fix did not over-broaden. Recorded per `[STATE]`'s "a green assertion on base is NOT automatically a control leg". |
| L12 | Invalid/unknown palette payload writes nothing                                                                                                                    | 17        | Listed here as well as in §9.2 because it is **green on base in every assertion** — see §9.2's note. Branch-side over-broadening control only.                                                                                                                                                                     |

⚠ **There is no C6.** An earlier revision listed a control leg pinning
cross-document section retention. The owner's Q2 **reset** ruling made its
behavioural half red on base, so a "must pass on base" classification became
false; its assertions are folded into **L14** (§9.2) as that leg's phase 2. The
removal is recorded rather than silent because C6 appears in the round-1 and
round-2 review record on this branch.

### 9.4 Repairing the card's coverage citation

VIEWS-04's `Automated coverage confirms` paragraph
(`uat_plan_v1.0.0-r3_2026-08-03.md:1275-1279`) overstates what the cited spec
proves (§9.1). ⚠ **The agent never edits a UAT verdict or mark**
(`docs/testing/UAT_STRATEGY.md` §2). The correction is therefore filed the way
the project already handles card text: an appended **VIEWS-04 entry in
`docs/testing/uat/CARD_CORRECTIONS.md`** — the committed, append-only register
(`:1-6`) read by the agent generating each round's plan — applied at r4 plan
generation, joining the three already queued (HA-05, HA-06, PROPS-03 —
`drawer_havdm_decisions_6e8d4788d9513ccce593c378`). Its content: the cited spec's
palette leg pre-selects a card and so does not cover the no-selection target,
and — after F5 — name the new legs. ⚠ **The r3 plan file itself and every UAT
verdict stay untouched** (§5, `ai_rules.md` §2); the register is what carries
wording forward into the next round.

### 9.5 Unit tests — `tests/unit/sectionsLayout.spec.ts`

The two helpers are **not** in the same red-leg situation, and lumping them
together would waive a proof that genuinely exists. The controlling test is
whether a valid **behavioural** red leg exists — not whether the symbol is newly
named (`docs/governance/OPERATING_AGREEMENT.md:66-73`).

**U1 — `insertCardIntoSectionAt`: a valid red leg EXISTS and is required.**
Cases: insert at 0 / middle / `length` (append); index clamped below 0 and above
`length`; out-of-range section returns the input **reference-equal**; the source
view is not mutated.

⚠ **Red-before-green, by historical behaviour, same checkout.** The production
module today can only **append** (`sectionsLayout.ts:114-124`), and that append
is exactly the pre-F5 palette-add semantics (`App.tsx:1140-1150`). So the red leg
is: **first expose `insertCardIntoSectionAt` with the historical append
behaviour** (delegating to `addCardToSection`), run U1, and observe the insert-at-0
and insert-at-middle cases **fail on behaviour** — the module imports cleanly and
the assertion is about where the card went. Then implement insert-at-index and
re-run to green. This is a real discriminating red leg, not an import error.

**U2 — `resolveTargetSectionIndex`: no valid red leg, and the reason is not
novelty.** Cases: no sections → `null`; valid selection → that index; `null`
selection → `0`; out-of-range selection → `0`.

⚠ This helper is a **behaviour-preserving extraction** of the decision the add
path already makes inline (`App.tsx:1131-1138`, including the no-sections early
return at `:1133-1136`). There is no behaviour change for a red leg to refute:
any historical-behaviour stand-in would be the same function, so the test would
pass before and after. That — not "it is a new export" — is why U2 has no valid
red leg, and it is the shape `OPERATING_AGREEMENT.md` §2 contemplates.
**Alternative evidence for U2:** control leg C1 (the double-click path that
already worked still lands in the same section, on base and on the branch), plus
red legs L8 and L9, which exercise the resolver through the production path where
its result becomes visible. The docblock of U2 states this in place; U1's docblock
states its red leg instead, with the observed failure recorded in the
implementation PR.

**U3 — `SectionsCanvas` without `onPaletteCardDrop`, in a NEW file
`tests/unit/SectionsCanvas.paletteDrop.spec.tsx`.** Renders the component with
the callback omitted, dispatches a palette `dragover` carrying the marker MIME
and asserts the event was **not** `preventDefault()`ed, then dispatches a `drop`
and asserts nothing is written. This is the **mandatory named proof of AC 19**:
the optional-callback refusal is unreachable from e2e because every production
mount supplies the callback (§7.2), and leaving its proof to "a component
assertion, or else code inspection" would have let the guard ship with no
committed test at all.

⚠ Classified **green on base and on the branch** — a control leg, listed in §9.3.
On base nothing accepts a palette drag; on the branch it is the callback's
absence that withholds acceptance. It discriminates a correct implementation from
one that accepts unconditionally and then discards silently, which is the failure
mode m3 identified.

⚠ A component render of `SectionsCanvas` is practical here: **nine of the eleven
`tests/unit/*.spec.tsx` files** import Testing Library and call `render` — the two
exceptions (`BackgroundCustomizer.spec.tsx`, `GradientEditor.spec.tsx`) render no
component — and the closest model is `tests/unit/card-context-menu.spec.tsx:20-37`.
Check whether the render needs the jsdom `ResizeObserver` polyfill now living in
`tests/unit/setup.ts`, which that spec documents at `:28-33`.

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
   marker MIME under Electron?** L1 is the probe; measure it with one leg before
   building the rest on the assumption. ⚠⚠ **A negative result changes the TEST
   STRATEGY, never the PRODUCT CONTRACT.** The marker's membership in
   `dataTransfer.types` remains the only palette branch at `dragover` (§7.1).
   Falling back to accepting `text/plain` would make every section body, toolbar
   and card wrapper accept any stray text drag — precisely the broadening §7.1
   rejects, and one the canvas-background refusal (AC 5) does **not** protect
   against, since it guards only the background. If `dragTo` cannot carry the
   marker in this environment: keep a bounded real-gesture probe for the parts it
   can prove, and drive the deterministic contract legs with an explicitly
   populated `DataTransfer`, which §9.2 already sanctions. ⚠ **If the REAL
   APPLICATION — not merely the harness — cannot expose the marker at `dragover`,
   STOP and amend this spec under §11 for the owner. Do not weaken product
   behaviour to make a test pass.**

### 9.7 Expected baseline impact

- **Unit:** currently **1316/1316 across 100 files** (`[STATE]` v142). ⚠ **Both
  numbers move.** U1/U2 add cases to an existing file; **U3 adds a new file**
  (`tests/unit/SectionsCanvas.paletteDrop.spec.tsx`), so the file count goes
  **100 → 101**. Record both new numbers; comparing against 1316/100 afterwards
  reads as a false regression (the test baseline has already moved five times).
- **e2e:** currently **307 tests = 298 passed / 7 failed / 2 skipped**, with
  **six** expected failures post-#128. Legs L1–L15 and control leg C5 raise the
  e2e total (C1–C4 already exist; U1–U3 are unit legs, and there is no C6 — see
  §9.3). The six known failures must stay six.
- ⚠ **Q2's one-line store change touches every load path**, so its regression
  sweep is not confined to sections: re-run the file-open, YAML-editor Apply
  (`mode: 'edit'`) and dashboard-generator specs, not just
  `sections-canvas.spec.ts`. Nothing in the suite is known to assert cross-document
  section retention, but that is an expectation to verify, not to assume
  (`[STATE]` lesson (z)).
- **Snapshots: zero impact, by construction.** `SectionsCanvas` renders only
  under `view.type === 'sections'` (`GridCanvas.tsx:295`), and **no visual spec
  loads a sections view** — `grep -l "type: sections" tests/e2e/*.visual.spec.ts`
  returns nothing, and no committed `.png` belongs to a sections spec. The §7.5
  marker therefore cannot reach a committed baseline. ⚠ Re-run that grep at
  implementation time rather than trusting this line (`[STATE]` lesson (z)).
- **Gate class:** `SectionsCanvas`, `GridCanvas`, `App.tsx` and a shared util are
  cross-cutting product code → **Medium minimum** on the regression gate matrix
  (`TESTING_STANDARDS.md` ~789). Escalating needs no ruling.

## 10. Open Questions — none remaining (both answered 2026-08-06)

**None open. Both questions were answered by the owner on 2026-08-06 and the
answers are folded into the normative text above; they are recorded here for
audit.**

### Q1 — container nesting inside a section — ✅ ANSWERED: DEFER

**Question.** Should a palette card dropped onto a CONTAINER card inside a
section nest into it, as it does on the flat canvas? PROPS-06 established for
`GridCanvas` that a palette card dropped on a container nests into it rather than
becoming a sibling (`GridCanvas.tsx:256-275`,
`App.handleCardDropIntoContainer:1217+`). A user who learned that on the flat
canvas will expect it inside a section.

**Owner's answer, 2026-08-06: "lets defer for now."** F5 stays at
insert-at-index: a drop on any card in a section — container or not — inserts the
new card at that card's index as a sibling. Sections-container nesting is
explicitly out of scope (§5) and is recorded as a deferred follow-up needing the
owner's scheduling; it is **not** silently dropped.

**Two consequences of the deferral, stated so neither is a surprise later.**

1. **An identical gesture will change behaviour if nesting is added after
   release.** Dropping a palette card on a stack inside a section produces a
   sibling now and would produce a child then. The exposure is bounded — it needs
   the intersection of a sections view, a container card, and a drop aimed
   precisely at it — and closing the parity before 1.0 keeps the change inside
   the pre-release window.
2. **The deferral is not merely a scope cut; it avoids shipping half a feature.**
   The sections selection model is top-level `(sectionIndex, cardIndex)` only
   (`SectionsCanvas.tsx:17-20`, `:478-550`), so a nested child has no address —
   nesting today would create a card the user cannot then select or edit. The
   flat canvas carries that same limitation, and its Properties panel documented
   the one route that did not work (PROPS-06's own history). The follow-up should
   therefore settle nested-child addressing, not just the drop.

**Because the answer is "defer", every item in the table below stands exactly as
written in this spec.** The table is retained as the audit record of what a
"nest" ruling would have invalidated:

| Blocked by Q1                                | Why                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7.2, the `onPaletteCardDrop` docblock       | It promises `to.cardIndex` **is** the index the new card takes. Under nesting, an addressed container makes that false.                                                                                                                                                                                                                |
| §7.3, the **Card wrapper** row               | Needs a container branch and a second callback or discriminated payload, as the flat path has (`GridCanvas.tsx:256-275`).                                                                                                                                                                                                              |
| §7.6, steps 3–5                              | The write path could no longer always be `insertCardIntoSectionAt`; a container write needs `appendCardToContainer`'s equivalent.                                                                                                                                                                                                      |
| §7.6, step 5 (selection)                     | Must say whether the top-level container or the nested child is selected. The sections selection model is top-level `(sectionIndex, cardIndex)` only (`SectionsCanvas.tsx:17-20`, `:478-550`) — a nested child is not addressable by it today.                                                                                         |
| AC 3, AC 7, AC 15                            | AC 3 needs a container exception; AC 7's landed index and AC 15's card shape both change for a nested card.                                                                                                                                                                                                                            |
| **AC 21** — added by rev 2 to pin the ruling | ⭐ **The FIRST thing a nesting decision invalidates.** It states outright that a drop on a container is a SIBLING, not a child — the deferral made normative. Reversing the ruling reverses this AC.                                                                                                                                   |
| §9.2, leg L3, **and leg L15**                | L3 asserts sibling insertion at `ci`. **L15 is rev 2's dedicated regression pin for this very ruling** — it drops onto a vertical stack and asserts the card is a sibling and the stack's child count is unchanged. A nesting ruling inverts L15's expectation outright; it is not merely "a new container leg" to be added alongside. |

Everything **not** in that table — §7.1, §7.4, §7.5, §7.7, the other four rows of
§7.3, and the ACs and legs not named above — was unaffected by the answer either
way. ⚠ **This table is maintained, not frozen:** it was written while Q1 was open
and listed only the then-existing text, so rev 2's AC 21 and L15 had to be added
to it after the deferral ruling created them. **Anything added later that encodes
the sibling-not-child decision must be added here too** — the table's whole
purpose is that a future owner or implementer revisiting nesting can find every
pin that assumes the deferral, and a pin missing from it is a pin that gets
silently contradicted.

### Q2 — the `loadDashboard` reset — ✅ ANSWERED: RESET IT

**Question.** Should `loadDashboard` reset `selectedSectionIndex`? Measured
(§7.4): its success branch resets `selectedViewIndex`, `selectedCardIndex`,
`selectedCardIndices` and `selectionAnchorCardIndex` but **omits**
`selectedSectionIndex` (`src/store/dashboardStore.ts:135-143`), so a section
index selected in one document survives into the next one loaded in the same
session.

**Owner's answer, 2026-08-06: reset it** — option (b), accepting the
recommendation. `loadDashboard` gains `selectedSectionIndex: null` alongside its
four siblings, carved out of MUST NOT 4 explicitly (§5), and proved by red leg
L14 (§9.2). §7.4's "inherited non-null" state ceases to exist for loads.

**The three reasons of record.**

1. **The project has already ruled on this principle in this very function.**
   FILE-04's second defect was previous-document state surviving a load — the
   undo history — and the fix's own comment records that it broke the VISION's
   structural "never silently destroy user data"
   (`src/store/dashboardStore.ts:145-165`). A retained section index is the same
   class with a smaller blast radius; leaving it means the reducer hardened
   against cross-document leakage still leaks one field.
2. **The retained value is meaningless by construction.** Section 2 of document A
   bears no relation to section 2 of document B, so there is no reading under
   which retention is desirable — which is why it reads as an omitted line rather
   than a decision.
3. **`'edit'` mode does not depend on the retention.** ⚠ Verified: all four
   selection fields sit in the **unconditional** part of the `set`
   (`:139-143`) — only `past`/`future`/`isDirty` are mode-conditional
   (`:166-178`) — so the YAML editor's Apply path (`mode: 'edit'`,
   `App.tsx:2360`) already clears the card selection today. Retention there
   leaves a section selected with no card: an inconsistency, not a feature.
   Resetting the fifth field alongside its siblings is coherent in **both**
   modes.

**Risk accepted as low:** `null` is already a legal and frequently-produced value
for this field (the six paths in §7.4's table), and `resolveTargetSectionIndex`
clamps whatever it receives.

## 11. Revision History & Amendments

| Date       | Rev | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | By          |
| ---------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 2026-08-06 | 0   | Draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Claude Opus |
| 2026-08-06 | 1   | Applied the Codex independent review (`docs/reviews/f5-spec-insertion-contract-codex-review.md`, commit `76cf6d4`, CHANGES-REQUIRED): M1–M5 and m1–m5. Draft text amended in place — the spec is not yet approved, so §11's immutability rule does not yet bind.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Claude Opus |
| 2026-08-06 | 2   | **Owner answered both open questions.** Q1 → defer sections-container nesting; Q2 → reset `selectedSectionIndex` on load. Folded into the normative text; §10 now records the rulings and holds nothing open.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Claude Opus |
| 2026-08-06 | 3   | Applied the Codex **round-2** verification (same review file, round-2 section, commit `45bcbad`, CHANGES-REQUIRED): M4 regression, M5 residue, N1. See the note below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Claude Opus |
| 2026-08-06 | 4   | Applied the Codex **round-3** review (round-3 section, commit `d853a74`, CHANGES-REQUIRED; M4, M5.2, M5.3 and N1 verified RESOLVED). **P1:** rev 3 replaced one accounting error with another — "L9 is the only SPLIT leg" was false, since **L8** (marker red / landing green) and **L15** (sibling-insertion red / stack-unchanged green) also mix base outcomes. Both are now SPLIT with the halves named; L8's landing assertion is stated as REQUIRED, because without it L8 proves only half of AC 9; and the "only" claim is replaced by a standing rule that classification is **per assertion**, traced through the base code path, with the implementation PR required to report SPLIT legs per assertion. **P2:** the Testing Library precedent count is corrected from eleven to **nine of eleven**, naming the two `.spec.tsx` files that render nothing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Claude Opus |
| 2026-08-06 | 5   | Applied the Codex **round-4** review (round-4 section, commit `1a1e4e8`, CHANGES-REQUIRED; P2 RESOLVED, review-file reformat confirmed content-preserving, traceability confirmed orphan-free). **R4-1 (BOOKKEEPING):** rev 4's replacement claim "three legs mix red and green" was itself false — L7, L10 and L13 mix too. ⚠ **This was the THIRD unverified universal in a row about the same table** (P1's "L9 is the only SPLIT leg", then rev 4's "three legs"), each a summary of a sweep never performed. **The fix is structural, not another count:** a COMPLETE per-leg sweep was performed (L1–L15, every assertion traced through the base path), the summary sentence is DELETED, and §9.2 now states that the table is the sole inventory and no summary count may be added. Reclassified as SPLIT: **L1** (lands/is-last red, no-other-section green), **L7** (insert + redo red, undo-no-op green), **L10** (no-card green, warning red), **L13** (marker red, control-preservation green), joining L8, L9 and L15. The sweep independently surfaced one more defect Codex had not flagged: **L6's redness is fixture-dependent** — the pre-drop selection must differ from the expected post-drop address or both assertions pass on base for the wrong reason — now stated as a fixture requirement, as L14 already carries. | Claude Opus |

**What rev 3 changed.** **M4 (REGRESSED — a defect rev 2 introduced):** rev 2
added AC 21 and leg L15 to pin the deferral, but did not add them to §10 Q1's
blast-radius table, whose "everything not listed is unaffected" sentence was
thereby false about the two items a nesting ruling would invalidate _first_. Both
are now listed, the generic "a new sections-container leg" is replaced by L15,
and the table carries a maintenance rule so the next addition does not repeat the
omission. **M5 (residue):** L12 is reclassified **green on base in every
assertion** — traced through `dropOn`'s `if (!from || !onCardMove) return;`,
which writes nothing even for a directly dispatched drop — so AC 17 is stated to
have **no valid red leg**, and L12 is a branch-side over-broadening control;
**C6 is deleted** (the Q2 reset made "must pass on base" false for it) with its
assertions folded into L14 as phase 2, and L14's fixture section counts are now
stated because the assertions are vacuous without them; **AC 19 gains a
mandatory named leg U3**, a component render in a new file, replacing the
"component assertion or else code inspection" choice. **N1:** §7.4's "every
document opens with the target resolved to section 0" is narrowed to loaded
sections views with at least one section, with the zero-section (`null`) and
non-sections cases stated.

**What rev 1 changed, by finding.** **M1** — §7.4 corrected: `loadDashboard`
omits the `selectedSectionIndex` reset, so a loaded document can inherit a target;
new Q2, new control leg C6, MUST NOT 4 annotated, leg L8 narrowed to a fresh
process. **M2** — §9.6 item 2 rewritten: a harness limitation changes the test
strategy, never the product contract; §7.1 states the marker is the sole
`dragover` criterion and the `text/plain` read is a drop-time payload reader
only. **M3** — §9.5 split into U1 (a real historical-behaviour red leg exists and
is required) and U2 (no valid red leg, because it is a behaviour-preserving
extraction, not because the export is new). **M4** — §10 Q1 now carries the full
blast radius. **M5** — AC 1 rewritten to name the append index; new AC 17–19; new
legs L12/L13 and C6; L1 given an explicit `targetPosition`; L9 pins
`data-selected-section` directly; L11 uses `entities` and asserts the title; U1/U2
named and mapped to AC 16; each leg's real base outcome classified RED / GREEN /
SPLIT. **m1** — `docs/testing/uat/CARD_CORRECTIONS.md` added to §6. **m2** —
§7.6 step 1 given per-precondition warning/error parity; step 4 given the
reference-equal early return. **m3** — §7.2/§7.3: palette acceptance gated on the
callback's presence (AC 19). **m4** — §7.6: `ci` restated as logical array/DOM
order, with dense packing's visual caveat; selection, not position, is the
feedback. **m5** — MUST NOT 8, AC 18 and leg L13; the marker moved out of the
toolbar's flex row onto its own full-width grid line.

## 12. Sign-off chain (ARB-R7)

1. **Author** — Claude Opus, this document, on `feature/f5-spec-insertion-contract`.
2. **Reviewer** — Codex, independently, on this branch, landing as
   `docs/reviews/f5-spec-insertion-contract-codex-review.md` in its own commit.
   The reviewer never merges and never edits this spec
   (`docs/governance/OPERATING_AGREEMENT.md` §3).
3. **Owner** — reads spec and review together. **The owner's merge of this PR is
   the ARB-R7 sign-off.** Implementation begins only after that merge, on its own
   branch and its own PR.
